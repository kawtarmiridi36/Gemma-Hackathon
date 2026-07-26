import logging
import threading
from pathlib import Path

from app.core.config import settings

logger = logging.getLogger(__name__)

_local_model = None
_local_tokenizer = None
_loading_lock = threading.Lock()
_model_loading = False

LOCAL_MODEL_PATH = Path(__file__).parent.parent.parent / "models" / "darija-medical"


def _load_local_model():
    global _local_model, _local_tokenizer, _model_loading

    if _local_model is not None:
        return True

    with _loading_lock:
        if _local_model is not None:
            return True
        if _model_loading:
            return False
        if not settings.USE_LOCAL_MODEL:
            return False

        if not LOCAL_MODEL_PATH.exists():
            logger.warning(f"Model not found at {LOCAL_MODEL_PATH}")
            return False

        _model_loading = True

    try:
        logger.info("Loading darija medical model...")
        import torch
        from transformers import AutoModelForCausalLM, AutoTokenizer

        device = "cuda" if torch.cuda.is_available() else "cpu"
        dtype = torch.float16 if device == "cuda" else torch.float32

        _local_tokenizer = AutoTokenizer.from_pretrained(
            str(LOCAL_MODEL_PATH), trust_remote_code=True
        )
        if _local_tokenizer.pad_token is None:
            _local_tokenizer.pad_token = _local_tokenizer.eos_token

        _local_model = AutoModelForCausalLM.from_pretrained(
            str(LOCAL_MODEL_PATH),
            torch_dtype=dtype,
            device_map="auto" if device == "cuda" else None,
            trust_remote_code=True,
        )
        _local_model.eval()

        with _loading_lock:
            _model_loading = False

        logger.info(f"Model loaded on {device}")
        return True

    except Exception as e:
        logger.error(f"Failed to load model: {e}")
        with _loading_lock:
            _local_model = None
            _local_tokenizer = None
            _model_loading = False
        return False


def generate_local(messages: list, max_new_tokens: int = 1024) -> str | None:
    if not _load_local_model():
        return None

    try:
        import torch

        text = _local_tokenizer.apply_chat_template(
            messages, tokenize=False, add_generation_prompt=True
        )
        inputs = _local_tokenizer(text, return_tensors="pt").to(_local_model.device)

        with torch.no_grad():
            outputs = _local_model.generate(
                **inputs,
                max_new_tokens=max_new_tokens,
                temperature=0.3,
                top_p=0.8,
                do_sample=True,
            )

        response = _local_tokenizer.decode(
            outputs[0][inputs["input_ids"].shape[1]:], skip_special_tokens=True
        )
        return response

    except Exception as e:
        logger.error(f"Generation error: {e}")
        return None
