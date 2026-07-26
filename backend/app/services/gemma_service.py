import asyncio
import json
import logging
import re
from typing import Optional

import httpx
from app.core.config import settings
from app.services.local_model import generate_local

logger = logging.getLogger(__name__)

NVIDIA_CHAT_URL = "https://integrate.api.nvidia.com/v1/chat/completions"

_http_client: Optional[httpx.AsyncClient] = None


async def _get_client() -> httpx.AsyncClient:
    global _http_client
    if _http_client is None or _http_client.is_closed:
        _http_client = httpx.AsyncClient(
            timeout=httpx.Timeout(180.0, connect=10.0),
            limits=httpx.Limits(max_connections=10, max_keepalive_connections=5),
        )
    return _http_client


SYSTEM_PROMPT = """You are an AI Medical Consultation Assistant specialized in primary healthcare.
Your role is to conduct an intelligent, empathetic, and structured voice consultation with the patient.
You do NOT replace a doctor. You assist in collecting symptoms, identifying possible conditions, assessing urgency, and recommending the appropriate next step. Always prioritize patient safety.

LANGUAGES:
- Moroccan Darija
- French
- Arabic
- English
Always answer in the SAME language used by the patient. If the patient mixes languages (e.g. Darija + French), respond naturally using the same style.

CONVERSATION STYLE & VOICE OPTIMIZATION:
- Speak naturally like an experienced healthcare professional. Never sound robotic.
- Keep answers concise during voice conversations: STRICTLY UNDER 80 WORDS per response.
- Ask ONLY ONE relevant question at a time.
- Use simple vocabulary. Show empathy and reassure the patient. Never overwhelm or scare the patient.

SAFETY RULES:
- NEVER prescribe antibiotics or controlled drugs.
- NEVER recommend dangerous treatments or invent medical facts.
- If unsure, say: "I don't have enough information."
- If symptoms are dangerous (chest pain, stroke, severe shortness of breath, loss of consciousness, heavy bleeding), IMMEDIATELY recommend emergency services.

MEMORY & CONTEXT:
- Maintain conversation context.
- Do NOT ask twice for the same information already provided.

RESPONSE FORMAT:
Reply ONLY with a JSON object with these EXACT keys:
{
  "voice_response": "Concise empathetic natural response (< 80 words) in patient's language ending with ONLY ONE question.",
  "urgency_level": "green/orange/red",
  "urgency_label": "LOW/MEDIUM/HIGH/CRITICAL",
  "chief_complaint": "Extracted main complaint",
  "symptoms_collected": {
    "onset": "", "location": "", "pain_level": "",
    "fever": null, "cough": null, "breathing_difficulty": null,
    "vomiting": null, "diarrhea": null, "bleeding": null,
    "medications": "", "pregnancy": "", "chronic_diseases": "", "allergies": ""
  },
  "possible_causes": ["Plausible cause 1"],
  "red_flags_detected": [],
  "clarifying_questions": ["Single next question to ask"],
  "summary": "1-sentence clinical summary for record",
  "recommendation": "Actionable next step recommendation",
  "draft_prescription": []
}"""

EMPTY_RESPONSE = {
    "voice_response": "Bonjour / Salam, je suis votre assistant medical IA. Comment puis-je vous aider aujourd'hui ?",
    "urgency_level": "green",
    "urgency_label": "LOW",
    "chief_complaint": "",
    "symptoms_collected": {},
    "possible_causes": [],
    "red_flags_detected": [],
    "clarifying_questions": ["Pouvez-vous me decrire ce qui vous derange aujourd'hui ?"],
    "summary": "",
    "recommendation": "Consultation a titre preventif.",
    "draft_prescription": [],
}


def _normalize_field_names(result: dict) -> dict:
    field_map = {
        "questions_for_clarification": "clarifying_questions",
        "questions": "clarifying_questions",
        "warning_signs": "red_flags_detected",
        "emergency_indicators": "red_flags_detected",
        "message": "summary",
        "status": "urgency_level",
    }
    for wrong, correct in field_map.items():
        if wrong in result and correct not in result:
            val = result.pop(wrong)
            if isinstance(val, dict):
                if "emergency_indicators" in val:
                    val = val["emergency_indicators"]
                elif "indicators" in val:
                    val = val["indicators"]
                else:
                    val = list(val.values())
            if not isinstance(val, list):
                val = [str(val)] if val else []
            result[correct] = val
    return result


def _parse_json_response(text: str) -> dict:
    text = text.strip()
    if text.startswith("```"):
        lines = text.split("\n")
        lines = [l for l in lines if not l.strip().startswith("```")]
        text = "\n".join(lines).strip()
    try:
        result = json.loads(text)
        result = _normalize_field_names(result)
        _normalize_urgency(result)
        return result
    except json.JSONDecodeError as e:
        logger.warning(f"JSON parse error: {e}")
        logger.debug(f"Failed text (first 500): {text[:500]}")
        return _fallback_from_text(text)


def _fallback_from_text(text: str) -> dict:
    result = dict(EMPTY_RESPONSE)
    result["voice_response"] = text[:300]
    result["recommendation"] = text
    lower = text.lower()
    flags = []
    for keyword, flag_name in [
        ("saignement", "saignement"), ("ddm", "saignement"),
        ("convulsion", "convulsions"), ("ta9adoum", "convulsions"),
        ("tension", "tension_elevee"), ("dghet", "tension_elevee"),
        ("fievre", "fievre_elevee"), ("smoum", "fievre_elevee"),
        ("contraction", "contractions_avant_terme"), ("qibd", "contractions_avant_terme"),
        ("3inina", "cephalees_troubles_visuels"), ("sda3", "cephalees_troubles_visuels"),
        ("chest pain", "douleur_thoracique"), ("sdar", "douleur_thoracique"),
        ("breath", "difficulte_respiratoire"), ("tnfs", "difficulte_respiratoire"),
    ]:
        if keyword in lower:
            flags.append(flag_name)
    result["red_flags_detected"] = flags
    if flags:
        if any(f in ["saignement", "convulsions", "tension_elevee", "douleur_thoracique", "difficulte_respiratoire"] for f in flags):
            result["urgency_level"] = "red"
            result["urgency_label"] = "CRITICAL"
        else:
            result["urgency_level"] = "orange"
            result["urgency_label"] = "HIGH"
    return result


def _normalize_urgency(result: dict):
    valid = {"green", "orange", "red"}
    level = result.get("urgency_level", "green")
    urgency_label = str(result.get("urgency_label", "")).upper()

    if urgency_label == "CRITICAL":
        result["urgency_level"] = "red"
    elif urgency_label in ("HIGH", "MEDIUM"):
        result["urgency_level"] = "orange"
    elif urgency_label == "LOW":
        result["urgency_level"] = "green"
    elif level not in valid:
        mapping = {"high": "red", "critical": "red", "low": "green", "medium": "orange", "moderate": "orange"}
        result["urgency_level"] = mapping.get(level.lower(), "green")

    if not result.get("voice_response"):
        resp_parts = []
        if result.get("summary"):
            resp_parts.append(result["summary"])
        questions = result.get("clarifying_questions", [])
        if questions:
            resp_parts.append(questions[0])
        elif result.get("recommendation"):
            resp_parts.append(result["recommendation"])
        result["voice_response"] = " ".join(resp_parts) if resp_parts else "Je suis a votre ecoute, racontez-moi ce que vous ressentez."

    if not result.get("recommendation"):
        result["recommendation"] = result.get("summary", "Consultation medicale recommandee.")


async def ask_gemma(conversation_history: list, patient_context: dict | None = None) -> dict:
    system_content = SYSTEM_PROMPT
    if patient_context:
        system_content += f"\n\nContexte patiente :\n{json.dumps(patient_context, ensure_ascii=False)}"

    messages = [{"role": "system", "content": system_content}]

    recent = conversation_history[-6:] if len(conversation_history) > 6 else conversation_history
    for msg in recent:
        role = "user" if msg["role"] == "infirmier" else "assistant"
        content = msg["content"] if msg["content"] else "(audio sans transcription)"
        if messages and messages[-1]["role"] == role:
            messages[-1]["content"] += "\n\n" + content
        else:
            messages.append({"role": role, "content": content})

    if messages[-1]["role"] != "user":
        messages.append({"role": "user", "content": "Continue l'anamnese."})

    local_text = generate_local(messages, max_new_tokens=1024)
    if local_text:
        logger.info(f"Local model response: {local_text[:200]}")
        return _parse_json_response(local_text)

    headers = {
        "Authorization": f"Bearer {settings.NVIDIA_API_KEY}",
        "Accept": "application/json",
        "Content-Type": "application/json",
    }

    payload = {
        "model": settings.GEMMA_MODEL,
        "messages": messages,
        "temperature": 0.2,
        "max_tokens": 1024,
        "top_p": 0.7,
        "frequency_penalty": 0,
        "presence_penalty": 0,
        "stream": False,
        "chat_template_kwargs": {"enable_thinking": False},
    }

    last_error = None
    for attempt in range(3):
        try:
            client = await _get_client()
            response = await client.post(NVIDIA_CHAT_URL, headers=headers, json=payload)
            if response.status_code == 429:
                wait = 5 * (attempt + 1)
                logger.warning(f"Rate limited, waiting {wait}s (attempt {attempt+1}/3)")
                await asyncio.sleep(wait)
                continue
            if response.status_code != 200:
                logger.error(f"Gemma error {response.status_code}: {response.text[:500]}")
            response.raise_for_status()
            data = response.json()
            text = data["choices"][0]["message"]["content"]
            if text is None:
                logger.warning("Content is None, using empty text")
                text = ""
            logger.info(f"Gemma response: {text[:200]}")
            return _parse_json_response(text)
        except httpx.ReadTimeout:
            wait = 10 * (attempt + 1)
            logger.warning(f"Timeout on attempt {attempt+1}/3, retrying in {wait}s...")
            last_error = "timeout"
            await asyncio.sleep(wait)
        except Exception as e:
            logger.error(f"ERROR attempt {attempt+1}/3: {type(e).__name__}: {e}")
            last_error = e
            await asyncio.sleep(5)

    logger.error(f"All 3 attempts failed, last error: {last_error}")
    return EMPTY_RESPONSE


async def finalize_consultation(conversation_history: list, patient_context: dict | None = None) -> dict:
    finalize_prompt = (
        "3la asas l-kolchi li t9el f had l-conversation, dir l-compte-rendu dyal l-conversation "
        "kaml f darija. W dir l-ordonnance dialk f darija. Kolchi b darija maghribiya."
    )
    history = conversation_history + [{"role": "infirmier", "content": finalize_prompt}]
    return await ask_gemma(history, patient_context)


def _extract_gestation_month(conversation_history: list) -> int | None:
    transcript = "\n".join((m.get("content") or "") for m in conversation_history if isinstance(m, dict))
    patterns = [
        r"(?:chhar|mois)\s*(\d{1,2})",
        r"(\d{1,2})\s*(?:chhar|mois)",
    ]
    for pattern in patterns:
        match = re.search(pattern, transcript, flags=re.IGNORECASE)
        if not match:
            continue
        month = int(match.group(1))
        if 1 <= month <= 9:
            return month
    return None


def _risk_profile(urgency_level: str, red_flags: list[str]) -> str:
    if urgency_level == "red" or any(flag in {"saignement", "convulsions", "tension_elevee"} for flag in red_flags):
        return "high"
    if urgency_level == "orange" or red_flags:
        return "medium"
    return "low"


def build_follow_up_program(
    conversation_history: list,
    urgency_level: str,
    red_flags: list[str],
    patient_context: dict | None = None,
) -> dict:
    start_month = _extract_gestation_month(conversation_history) or 1
    profile = _risk_profile(urgency_level, red_flags)

    monthly_plan = []
    for month in range(start_month, 10):
        checklist = [
            "Mesure tension arterielle",
            "Evaluation mouvements foetaux",
            "Suivi poids et oedemes",
            "Education signes d'alerte",
        ]
        alerts = [
            "Saignement", "Convulsions", "Maux de tete avec troubles visuels",
            "Contractions avant terme", "Fievre elevee",
        ]

        if "tension_elevee" in red_flags:
            checklist.append("Controle tension 2x par semaine")
        if "fievre_elevee" in red_flags:
            checklist.append("Controle temperature quotidien")
        if "absence_mouvements_foetaux" in red_flags:
            checklist.append("Comptage quotidien des mouvements foetaux")

        if profile == "high":
            cadence = "Suivi hebdomadaire + referral specialiste"
        elif profile == "medium":
            cadence = "2 visites par mois"
        else:
            cadence = "1 visite par mois"

        if month >= 8:
            checklist.append("Preparation plan accouchement")
            checklist.append("Verification acces transport urgent")

        monthly_plan.append({
            "month": month,
            "cadence": cadence,
            "goals": [
                "Stabiliser et surveiller l'evolution de la grossesse",
                "Detecter precocement toute complication",
            ],
            "checklist": checklist,
            "alerts": alerts,
        })

    patient_label = patient_context.get("nom") if patient_context else None
    return {
        "risk_profile": profile,
        "start_month": start_month,
        "target": f"Suivi grossesse jusqu'a l'accouchement{f' pour {patient_label}' if patient_label else ''}",
        "monthly_plan": monthly_plan,
    }
