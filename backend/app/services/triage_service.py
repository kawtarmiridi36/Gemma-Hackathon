import joblib
import json
import os
from pathlib import Path

ML_DIR = Path(__file__).parent.parent / "ml"

_model = None
_model_info = None


def _load_model():
    global _model, _model_info
    if _model is not None:
        return
    model_path = ML_DIR / "fetal_health_model.pkl"
    info_path = ML_DIR / "model_info.json"
    if not model_path.exists():
        return
    _model = joblib.load(model_path)
    with open(info_path) as f:
        _model_info = json.load(f)


CLASS_LABELS = {1: "Normal", 2: "Suspect", 3: "Pathological"}

CTG_FEATURES = [
    "baseline value",
    "accelerations",
    "fetal_movement",
    "uterine_contractions",
    "light_decelerations",
    "severe_decelerations",
    "prolongued_decelerations",
    "abnormal_short_term_variability",
    "mean_value_of_short_term_variability",
    "percentage_of_time_with_abnormal_long_term_variability",
    "mean_value_of_long_term_variability",
    "histogram_width",
    "histogram_min",
    "histogram_max",
    "histogram_number_of_peaks",
    "histogram_number_of_zeroes",
    "histogram_mode",
    "histogram_mean",
    "histogram_median",
    "histogram_variance",
    "histogram_tendency",
]


def predict_ctg(ctg_values: dict) -> dict | None:
    _load_model()
    if _model is None:
        return None

    features = []
    for col in CTG_FEATURES:
        val = ctg_values.get(col)
        if val is None:
            return None
        features.append(float(val))

    prediction = _model.predict([features])[0]
    proba = _model.predict_proba([features])[0]
    classes = _model.classes_

    return {
        "classification": CLASS_LABELS.get(int(prediction), "Unknown"),
        "confidence": float(max(proba)),
        "probabilities": {
            CLASS_LABELS.get(int(c), str(c)): round(float(p), 4)
            for c, p in zip(classes, proba)
        },
        "model_info": {
            "accuracy": _model_info["accuracy"] if _model_info else None,
            "top_risk_factors": _get_risk_factors(features),
        },
    }


def _get_risk_factors(features: list[float]) -> list[str]:
    if _model_info is None:
        return []
    risk_factors = []
    ranges = _model_info.get("feature_ranges", {})
    high_risk_features = [
        "abnormal_short_term_variability",
        "prolongued_decelerations",
        "severe_decelerations",
        "percentage_of_time_with_abnormal_long_term_variability",
    ]
    for feat in high_risk_features:
        feat_info = ranges.get(feat)
        if feat_info is None:
            continue
        idx = CTG_FEATURES.index(feat) if feat in CTG_FEATURES else -1
        if idx < 0 or idx >= len(features):
            continue
        val = features[idx]
        if val > feat_info["mean"] + feat_info.get("std", feat_info["max"] - feat_info["min"]) * 0.5:
            risk_factors.append(feat)
    return risk_factors


def is_ml_available() -> bool:
    _load_model()
    return _model is not None


RED_FLAGS_PREGNANCY = {
    "saignement": ["saignement", "saigne", "dam", "saignement abondant", "bleeding"],
    "absence_mouvements_foetaux": ["ma kay9douch", "ma t9arranch", "sans mouvement"],
    "cephalees_troubles_visuels": ["sda3", "3inina", "vision", "mra f 3inih"],
    "contractions_avant_terme": ["contraction", "qibd", "teg9i3a", "avant terme"],
    "fievre_elevee": ["fievre", "temperature", "smoum", "chorr", "fever"],
    "convulsions": ["convulsion", "ta9adoum", "seizure"],
    "tension_elevee": ["tension", "dghet", "pression", "hypertension"],
    "douleur_thoracique": ["sdar", "douleur thoracique", "chest pain", "wja3 f sdar"],
    "difficulte_respiratoire": ["ma kay9darch ytnfs", "difficulte a respirer", "shortness of breath", "dikka", "essoufflement"],
    "perte_connaissance": ["ghaybo", "syncope", "perte de connaissance", "unconscious"],
    "accident_vasculaire": ["flaj", "paralysie", "stroke", "paralisis"],
}


def detect_red_flags(text: str) -> list[str]:
    text_lower = text.lower()
    detected = []
    for flag, keywords in RED_FLAGS_PREGNANCY.items():
        for kw in keywords:
            if kw in text_lower:
                detected.append(flag)
                break
    return detected


def classify_urgency(red_flags: list[str], current_level: str | None = None) -> str:
    level_order = {"green": 0, "orange": 1, "red": 2}
    severity = {
        "saignement": "red",
        "absence_mouvements_foetaux": "red",
        "convulsions": "red",
        "tension_elevee": "red",
        "douleur_thoracique": "red",
        "difficulte_respiratoire": "red",
        "perte_connaissance": "red",
        "accident_vasculaire": "red",
        "cephalees_troubles_visuels": "orange",
        "contractions_avant_terme": "orange",
        "fievre_elevee": "orange",
    }

    highest = current_level or "green"
    for flag in red_flags:
        flag_level = severity.get(flag, "orange")
        if level_order.get(flag_level, 0) > level_order.get(highest, 0):
            highest = flag_level

    return highest
