from faster_whisper import WhisperModel
import threading
import re

_model = None
_lock = threading.Lock()

# Prompt d'orientation en دارجة مغربية بالخط العربي
DARIJA_PROMPT = (
    "تأكد من كتابة النص بالدارجة المغربية وبالأحرف العربية: "
    "السلام عليكم، سميتي هشام، المريضة ديالي حاملة في الشهر الرابع، عندي الحريق، السخانة، الطنسيون، وجع الرأس، السعلة، الحريق في الكرش."
)

HALLUCINATIONS = [
    "مرحبا بكم في شاملتي",
    "مرحبا بكم في",
    "اشترك في القناة",
    "لا تنسوا الاشتراك",
    "لاتنسى الاشتراك",
    "شكرا على المشاهدة",
    "تفعيل الجرس",
    "القناة",
    "شاملتي",
]


def _normalize_text(text: str) -> str:
    return re.sub(r"\s+", " ", text).strip().lower()


def _clean_transcription(text: str) -> str:
    cleaned = text.strip()
    for h in HALLUCINATIONS:
        cleaned = cleaned.replace(h, "")
    cleaned = re.sub(r"\s+", " ", cleaned).strip()
    
    normalized = _normalize_text(cleaned)
    prompt_normalized = _normalize_text(DARIJA_PROMPT)
    if normalized == prompt_normalized:
        return ""
    if normalized.startswith(prompt_normalized):
        cleaned = cleaned[len(DARIJA_PROMPT):].lstrip(" ,.-\n\t")
    return cleaned.strip()


def _get_model():
    global _model
    if _model is None:
        with _lock:
            if _model is None:
                # "small" ou "medium" reduisent drastiquement les hallucinations vs "tiny"
                _model = WhisperModel("medium", device="cpu", compute_type="int8")
    return _model


import os

def transcribe_darija(audio_path: str) -> str:
    try:
        if not os.path.exists(audio_path) or os.path.getsize(audio_path) < 800:
            return "لم يتم التقاط الصوت بوضوح، يرجى إعادة التسجيل والتحدث قرب الميكروفون."

        model = _get_model()
        segments, info = model.transcribe(
            audio_path,
            language="ar",
            beam_size=5,
            vad_filter=True,
            vad_parameters=dict(
                min_silence_duration_ms=600,
                speech_pad_ms=300,
                onset=0.45,
                offset=0.30,
            ),
            initial_prompt=DARIJA_PROMPT,
            condition_on_previous_text=False,
            temperature=0.0,
            no_speech_threshold=0.55,
            compression_ratio_threshold=2.2,
            repetition_penalty=1.2,
            no_repeat_ngram_size=3,
        )
        text = " ".join(seg.text.strip() for seg in segments)
        text = _clean_transcription(text)
        if text.strip() and len(text.strip()) >= 2:
            return text.strip()
        return "لم نتمكن من سماع الصوت بوضوح، يرجى التحدث بصوت أعلى وواضح."
    except Exception as e:
        print(f"[STT] ERROR: {type(e).__name__}: {e}")
        return "حدث خطأ في التقاط الصوت، يرجى إعادة التحدث أو كتابة الرسالة."