import json
import re
import httpx
from app.core.config import settings
from app.services.local_model import generate_local

NVIDIA_CHAT_URL = "https://integrate.api.nvidia.com/v1/chat/completions"

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

CONSULTATION FLOW TO FOLLOW REASONING:
Step 1: Introduce yourself ("Hello/Salam, I'm your AI medical assistant. I'll ask you a few questions to better understand your situation.") if starting the conversation.
Step 2: Identify chief complaint ("What brings you here today?", "What is bothering you?", "Can you describe your symptoms?").
Step 3: Collect symptom details progressively (onset, location, pain level 0-10, continuous/intermittent, fever, cough, breathing difficulty, vomiting, diarrhea, bleeding, medication taken, pregnancy if relevant, chronic diseases, allergies). Ask ONLY 1 relevant question per turn!
Step 4: Reason clinically. Estimate possible causes. Never state a diagnosis as certain. Use non-definitive wording ("This could be consistent with...", "It may suggest...", "It is possible that...").
Step 5: Assess urgency:
  - LOW (green): Symptoms appear mild. Recommend home care.
  - MEDIUM (orange): Medical appointment recommended within 24-48 hours.
  - HIGH (orange/red): Same-day medical consultation recommended.
  - CRITICAL (red): Advise immediate emergency services (chest pain, stroke symptoms, difficulty breathing, loss of consciousness, heavy bleeding).
Step 6: Give recommendations (hydration, rest, temperature monitoring, common safe medication, medical consultation, emergency care).

SAFETY RULES:
- NEVER prescribe antibiotics or controlled drugs.
- NEVER recommend dangerous treatments or invent medical facts.
- If unsure, say: "I don't have enough information." / "Ma 3ndich ma3loumat kafya."
- If symptoms are dangerous (chest pain, stroke, severe shortness of breath, loss of consciousness, heavy bleeding), IMMEDIATELY recommend emergency services.

MEMORY & CONTEXT:
- Maintain conversation context (Age, Gender, Symptoms, Medical history, Current medications, Allergies, Pregnancy, Duration, Pain level 0-10).
- Do NOT ask twice for the same information already provided.

RESPONSE FORMAT:
Reply ONLY with a JSON object with these EXACT keys:
{
  "voice_response": "Concise empathetic natural response (< 80 words) in patient's language ending with ONLY ONE question.",
  "urgency_level": "green/orange/red",
  "urgency_label": "LOW/MEDIUM/HIGH/CRITICAL",
  "chief_complaint": "Extracted main complaint",
  "symptoms_collected": {
    "onset": "",
    "location": "",
    "pain_level": "",
    "fever": null,
    "cough": null,
    "breathing_difficulty": null,
    "vomiting": null,
    "diarrhea": null,
    "bleeding": null,
    "medications": "",
    "pregnancy": "",
    "chronic_diseases": "",
    "allergies": ""
  },
  "possible_causes": ["Plausible cause 1"],
  "red_flags_detected": [],
  "clarifying_questions": ["Single next question to ask"],
  "summary": "1-sentence clinical summary for record",
  "recommendation": "Actionable next step recommendation",
  "draft_prescription": []
}"""

EMPTY_RESPONSE = {
    "voice_response": "Bonjour / Salam, je suis votre assistant médical IA. Comment puis-je vous aider aujourd'hui ? Que ressentez-vous ?",
    "urgency_level": "green",
    "urgency_label": "LOW",
    "chief_complaint": "",
    "symptoms_collected": {},
    "possible_causes": [],
    "red_flags_detected": [],
    "clarifying_questions": ["Pouvez-vous me décrire ce qui vous dérange aujourd'hui ?"],
    "summary": "",
    "recommendation": "Consultation à titre préventif.",
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
        empty_fields = [k for k, v in result.items() if not v and k != "urgency_level"]
        if empty_fields:
            print(f"[GEMMA] Warning: empty fields in response: {empty_fields}")
        return result
    except json.JSONDecodeError as e:
        print(f"[GEMMA] JSON parse error: {e}")
        print(f"[GEMMA] Failed text (first 500): {text[:500]}")
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

    # Ensure voice_response is present
    if not result.get("voice_response"):
        resp_parts = []
        if result.get("summary"):
            resp_parts.append(result["summary"])
        questions = result.get("clarifying_questions", [])
        if questions:
            resp_parts.append(questions[0])
        elif result.get("recommendation"):
            resp_parts.append(result["recommendation"])
        
        result["voice_response"] = " ".join(resp_parts) if resp_parts else "Je suis à votre écoute, racontez-moi ce que vous ressentez."

    if not result.get("recommendation"):
        result["recommendation"] = result.get("summary", "Consultation médicale recommandée.")


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
        messages.append({"role": "user", "content": "Continue l'anamnèse."})

    local_text = generate_local(messages, max_new_tokens=1024)
    if local_text:
        print(f"[LOCAL] Raw response: {local_text[:300]}")
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
        "chat_template_kwargs": {
            "enable_thinking": False
        },
    }

    last_error = None
    for attempt in range(3):
        try:
            async with httpx.AsyncClient(timeout=180.0) as client:
                response = await client.post(NVIDIA_CHAT_URL, headers=headers, json=payload)
                if response.status_code == 429:
                    wait = 5 * (attempt + 1)
                    print(f"[GEMMA] Rate limited, waiting {wait}s (attempt {attempt+1}/3)")
                    import asyncio
                    await asyncio.sleep(wait)
                    continue
                if response.status_code != 200:
                    print(f"[GEMMA] Error {response.status_code}: {response.text[:500]}")
                response.raise_for_status()
                data = response.json()
                text = data["choices"][0]["message"]["content"]
                if text is None:
                    print("[GEMMA] Warning: content is None, using empty text")
                    text = ""
                print(f"[GEMMA] Raw response: {text[:300]}")
                return _parse_json_response(text)
        except httpx.ReadTimeout:
            wait = 10 * (attempt + 1)
            print(f"[GEMMA] Timeout on attempt {attempt+1}/3, retrying in {wait}s...")
            last_error = "timeout"
            import asyncio
            await asyncio.sleep(wait)
        except Exception as e:
            print(f"[GEMMA] ERROR attempt {attempt+1}/3: {type(e).__name__}: {e}")
            last_error = e
            import asyncio
            await asyncio.sleep(5)

    print(f"[GEMMA] All 3 attempts failed, last error: {last_error}")
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
            "Saignement",
            "Convulsions",
            "Maux de tete avec troubles visuels",
            "Contractions avant terme",
            "Fievre elevee",
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

        monthly_plan.append(
            {
                "month": month,
                "cadence": cadence,
                "goals": [
                    "Stabiliser et surveiller l'evolution de la grossesse",
                    "Detecter precocement toute complication",
                ],
                "checklist": checklist,
                "alerts": alerts,
            }
        )

    patient_label = patient_context.get("nom") if patient_context else None
    return {
        "risk_profile": profile,
        "start_month": start_month,
        "target": f"Suivi grossesse jusqu'a l'accouchement{f' pour {patient_label}' if patient_label else ''}",
        "monthly_plan": monthly_plan,
    }
