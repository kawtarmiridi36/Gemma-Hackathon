import logging
import os
import re
import threading

from faster_whisper import WhisperModel

logger = logging.getLogger(__name__)

_model = None
_lock = threading.Lock()

DARIJA_PROMPT = (
    "aakid mn ktaba n-nass b darija w l7roof l3arbiya: "
    "assalamu 3likum, smiti hicham, mrida dyali hamla f chhar rabi3, 3ndi l7riq, sskhana, "
    "ltanzioun, wja3 rras, ss3la, l7riq f lkarch."
)

HALLUCINATIONS = [
    "marhaba bikum f chamliti",
    "marhaba bikum f",
    "oshtark f l9ana",
    "la tansaw loshtirak",
    "latensa loshtirak",
    "chokran 3la lmchahada",
    "taf3il jras",
    "l9ana",
    "chamliti",
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
                logger.info("Loading Whisper model (medium, cpu, int8)...")
                _model = WhisperModel("medium", device="cpu", compute_type="int8")
                logger.info("Whisper model loaded.")
    return _model


def transcribe_darija(audio_path: str) -> str:
    try:
        if not os.path.exists(audio_path) or os.path.getsize(audio_path) < 800:
            return "lam ytm ltqas swt b wdo9, yraj3 3yad ttswir w t7dath qrb lmikrwfn."

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
        return "lam nestati3 sm3 swt b wdo9, yraj3 t7dath b swt a3la w b wdo9."
    except Exception as e:
        logger.error(f"STT ERROR: {type(e).__name__}: {e}")
        return "xat2 f ltqas swt, yraj3 tt7dath aw yktb rrsala."
