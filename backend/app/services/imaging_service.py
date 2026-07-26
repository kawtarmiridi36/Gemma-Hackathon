import io
import json
import logging
import os
import shutil
import tempfile
import zipfile
from pathlib import Path

import httpx
from app.core.config import settings

logger = logging.getLogger(__name__)

VISTA3D_URL = "https://health.api.nvidia.com/v1/medicalimaging/nvidia/vista-3d"
ANALYSIS_URL = "https://integrate.api.nvidia.com/v1/chat/completions"

_http_client: httpx.AsyncClient | None = None


async def _get_client() -> httpx.AsyncClient:
    global _http_client
    if _http_client is None or _http_client.is_closed:
        _http_client = httpx.AsyncClient(
            timeout=httpx.Timeout(120.0, connect=10.0),
            limits=httpx.Limits(max_connections=5),
        )
    return _http_client


SEGMENTATION_PROMPT = """Tu es un assistant medical specialise en imagerie obstetricale.
Analyse les resultats de segmentation et fournis:
1. Description de ce que la segmentation revele
2. Observations cliniques pertinentes
3. Si applicable, estimation de l'age gestationnel
4. Anomalies potentielles detectees

Reponds en JSON:
{
  "description": "string",
  "observations": ["string"],
  "estimated_ga_weeks": null,
  "anomalies": ["string"],
  "recommendation": "string"
}"""

EMPTY_VISION = {
    "description": "Analyse non disponible",
    "observations": [],
    "estimated_ga_weeks": None,
    "anomalies": [],
    "recommendation": "Consultation medecin recommandee",
    "segmentation_mask": None,
}


async def segment_image(image_path: str) -> dict:
    img_path = Path(image_path.lstrip("/"))
    if not img_path.exists():
        return EMPTY_VISION

    headers = {"Authorization": f"Bearer {settings.NVIDIA_API_KEY}"}
    payload = {
        "image": str(img_path.resolve()),
        "prompts": {"classes": ["fetus", "placenta", "uterus", "amniotic_fluid"]},
    }

    try:
        client = await _get_client()
        response = await client.post(VISTA3D_URL, headers=headers, json=payload)
        response.raise_for_status()

        with tempfile.TemporaryDirectory() as temp_dir:
            z = zipfile.ZipFile(io.BytesIO(response.content))
            z.extractall(temp_dir)

            mask_files = [f for f in os.listdir(temp_dir) if f.endswith(".nrrd")]
            if mask_files:
                mask_path = str(img_path.parent / f"{img_path.stem}_seg.nrrd")
                shutil.move(os.path.join(temp_dir, mask_files[0]), mask_path)
                return {"segmentation_mask": mask_path, "status": "success"}

        return {"segmentation_mask": None, "status": "no_mask_generated"}
    except Exception as e:
        logger.error(f"Segmentation error: {e}")
        return {"segmentation_mask": None, "status": "error", "detail": str(e)}


async def analyze_ultrasound(image_path: str) -> dict:
    seg_result = await segment_image(image_path)

    if seg_result.get("status") != "success" or not seg_result.get("segmentation_mask"):
        return EMPTY_VISION

    headers = {
        "Authorization": f"Bearer {settings.NVIDIA_API_KEY}",
        "Accept": "application/json",
        "Content-Type": "application/json",
    }
    payload = {
        "model": settings.GEMMA_MODEL,
        "messages": [
            {"role": "system", "content": SEGMENTATION_PROMPT},
            {"role": "user", "content": f"Segmentation VISTA-3D: {seg_result['segmentation_mask']}. Analyse obstetricale."},
        ],
        "temperature": 0.2,
        "max_tokens": 512,
        "top_p": 0.7,
        "stream": False,
    }

    try:
        client = await _get_client()
        response = await client.post(ANALYSIS_URL, headers=headers, json=payload)
        response.raise_for_status()
        data = response.json()
        text = data["choices"][0]["message"]["content"].strip()
        if text.startswith("```"):
            lines = text.split("\n")
            lines = [l for l in lines if not l.strip().startswith("```")]
            text = "\n".join(lines).strip()
        result = json.loads(text)
        result["segmentation_mask"] = seg_result["segmentation_mask"]
        return result
    except Exception as e:
        logger.error(f"Ultrasound analysis error: {e}")
        return {
            **EMPTY_VISION,
            "segmentation_mask": seg_result.get("segmentation_mask"),
            "recommendation": "Segmentation reussie mais analyse textuelle echouee. Consulter medecin.",
        }
