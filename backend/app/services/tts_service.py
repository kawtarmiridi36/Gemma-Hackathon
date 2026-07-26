import logging
import os
import tempfile

import httpx
import edge_tts
from app.core.config import settings

logger = logging.getLogger(__name__)

DEFAULT_VOICE = "ar-MA-MounaNeural"

_http_client: httpx.AsyncClient | None = None


async def _get_client() -> httpx.AsyncClient:
    global _http_client
    if _http_client is None or _http_client.is_closed:
        _http_client = httpx.AsyncClient(timeout=httpx.Timeout(30.0, connect=5.0))
    return _http_client


def normalize_darija_text(text: str) -> str:
    if not text:
        return ""

    clean = text.replace("**", "").replace("/", " ").replace("-", " ").replace("#", " ")

    if not any("\u0600" <= char <= "\u06FF" for char in clean):
        clean = (
            clean
            .replace("3", "\u0639")
            .replace("7", "\u062d")
            .replace("9", "\u0642")
            .replace("5", "\u062e")
            .replace("kh", "\u062e")
            .replace("KH", "\u062e")
            .replace("gh", "\u063a")
            .replace("GH", "\u063a")
            .replace("ch", "\u0634")
            .replace("CH", "\u0634")
        )
    return clean.strip()


async def generate_darija_audio(text: str, voice: str = DEFAULT_VOICE) -> str:
    cleaned_text = normalize_darija_text(text)
    if not cleaned_text:
        cleaned_text = "\u0645\u0631\u062d\u0628\u0627 \u0628\u064a\u0643 \u0641\u064a \u062f\u0627\u0631 \u0627\u0644\u0623\u0645\u0648\u0645\u0629"

    if settings.ELEVENLABS_API_KEY and settings.ELEVENLABS_VOICE_ID:
        try:
            url = f"https://api.elevenlabs.io/v1/text-to-speech/{settings.ELEVENLABS_VOICE_ID}"
            headers = {
                "xi-api-key": settings.ELEVENLABS_API_KEY,
                "Content-Type": "application/json",
            }
            payload = {
                "text": cleaned_text,
                "model_id": "eleven_multilingual_v2",
                "voice_settings": {"stability": 0.5, "similarity_boost": 0.75},
            }
            client = await _get_client()
            resp = await client.post(url, headers=headers, json=payload)
            if resp.status_code == 200:
                tmp = tempfile.NamedTemporaryFile(delete=False, suffix=".mp3")
                tmp.write(resp.content)
                tmp.close()
                return tmp.name
            else:
                logger.warning(f"ElevenLabs returned {resp.status_code}: {resp.text[:200]}")
        except Exception as e:
            logger.warning(f"ElevenLabs error, falling back to Edge-TTS: {e}")

    output_path = tempfile.mktemp(suffix=".mp3")
    communicate = edge_tts.Communicate(cleaned_text, voice)
    await communicate.save(output_path)
    return output_path
