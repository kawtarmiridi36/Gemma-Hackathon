import tempfile
import httpx
import edge_tts
from app.core.config import settings

DEFAULT_VOICE = "ar-MA-MounaNeural"


def normalize_darija_text(text: str) -> str:
    if not text:
        return ""
    
    clean = text.replace("**", "").replace("/", " ").replace("-", " ").replace("#", " ")
    
    if not any('\u0600' <= char <= '\u06FF' for char in clean):
        clean = (
            clean
            .replace("3", "ع")
            .replace("7", "ح")
            .replace("9", "ق")
            .replace("5", "خ")
            .replace("kh", "خ")
            .replace("KH", "خ")
            .replace("gh", "غ")
            .replace("GH", "غ")
            .replace("ch", "ش")
            .replace("CH", "ش")
        )
    return clean.strip()


async def generate_darija_audio(text: str, voice: str = DEFAULT_VOICE) -> str:
    cleaned_text = normalize_darija_text(text)
    if not cleaned_text:
        cleaned_text = "مرحبا بيك في دار الأمومة"

    # If ElevenLabs API Key & Voice ID are configured in .env, use custom ElevenLabs Moroccan Voice!
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
                "voice_settings": {
                    "stability": 0.5,
                    "similarity_boost": 0.75,
                }
            }
            async with httpx.AsyncClient(timeout=30.0) as client:
                resp = await client.post(url, headers=headers, json=payload)
                if resp.status_code == 200:
                    tmp = tempfile.NamedTemporaryFile(delete=False, suffix=".mp3")
                    tmp.write(resp.content)
                    tmp.close()
                    return tmp.name
                else:
                    print(f"[ELEVENLABS] API returned status {resp.status_code}: {resp.text[:200]}")
        except Exception as e:
            print(f"[ELEVENLABS] Error generating voice, falling back to Edge-TTS: {e}")

    # Fallback to Edge-TTS ar-MA-MounaNeural
    tmp = tempfile.NamedTemporaryFile(delete=False, suffix=".mp3")
    output_path = tmp.name
    tmp.close()

    communicate = edge_tts.Communicate(cleaned_text, voice)
    await communicate.save(output_path)
    return output_path
