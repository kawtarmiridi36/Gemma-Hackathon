import json
import random

templates = [
    {
        "scenario": "ddm f l-3ir9",
        "flag": "saignement",
        "levels": ["green", "orange", "red"],
        "questions": [
            "Ch7al men ddm kayn?",
            "Kayn dokha f l-kar9?",
            "Chno w9lek dial dokha?",
            "Wach kan 3andek chi l-madya?",
            "Kayn ddm khfif wla ktr?",
        ],
        "hypotheses": ["Placenta praevia", "3iwad dyal placenta", "Khetta dyal l-mchnas", "Dokha dyal l-hamla"],
        "rx": [{"medication": "Paracétamol", "dosage": "1g", "duration": "3 l-yam"}],
        "rec": "Khas l-mra tmchi l-ispital bach ndirou analyse dyal ddm w ndirou taswira."
    },
    {
        "scenario": "sda3 f rass w dghya",
        "flag": "cephalees_troubles_visuels",
        "levels": ["green", "orange", "red"],
        "questions": [
            "Kayn tension 3liya?",
            "Kayn ri2a wla 9iyan?",
            "Katchouf f l-makla?",
            "Kayn ri2a m3aha?",
            "Chno w9lek f rass?",
        ],
        "hypotheses": ["Tension 3liya", "Pré-éclampsie", "Migraine dyal l-hamla", "Éclampsie"],
        "rx": [{"medication": "Paracétamol", "dosage": "500mg", "duration": "3 l-yam"}],
        "rec": "Khas l-mra tmchi l-ispital bach ndirou mesure dyal tension."
    },
    {
        "scenario": "convulsions",
        "flag": "convulsions",
        "levels": ["red"],
        "questions": [
            "Chno w9lek dial l-convulsions?",
            "Kayn tension 3liya?",
            "Wach kan 3andek chi l-madya?",
            "Ch7al men mra dert l-convulsions?",
            "Kayn sda3 f rass m3aha?",
        ],
        "hypotheses": ["Éclampsie", "Pré-éclampsie", "Méningite"],
        "rx": [{"medication": "Sulfate de Magnésium", "dosage": "4g IV", "duration": "7 l-yam"}],
        "rec": "Khas l-mra tmchi l-ispital DWA. Hadi urgent bzzaf."
    },
    {
        "scenario": "smoum 3liya",
        "flag": "fievre_elevee",
        "levels": ["orange"],
        "questions": [
            "Ch7al men dghra 3andek?",
            "Kayn ri2a wla 9iyan?",
            "Chno l-harrara dyalek?",
            "Kayn sda3 f rass m3aha?",
            "Chno l-mdda dyal smoum?",
        ],
        "hypotheses": ["L-3ada dyal l-mchnas", "Infection", "Virus"],
        "rx": [{"medication": "Paracétamol", "dosage": "1g", "duration": "3 l-yam"}],
        "rec": "Khas l-mra tmchi l-ispital bach ndirou analyse dyal ddm."
    },
    {
        "scenario": "contractions qbel l-w9t",
        "flag": "contractions_avant_terme",
        "levels": ["orange", "red"],
        "questions": [
            "Ch7al men chhar f l-hamla?",
            "Chno l-mdda dyal l-contractions?",
            "Kayn ddm m3aha?",
            "Kayn dokha f l-kar9?",
            "Chno w9lek?",
        ],
        "hypotheses": ["Tawled qbel l-w9t", "Khetta dyal l-mchnas", "Dokha dyal l-hamla"],
        "rx": [{"medication": "Sulfate de Magnésium", "dosage": "4g IV", "duration": "7 l-yam"}],
        "rec": "Khas l-mra tmchi l-ispital DWA bach nqlo l-tawled."
    },
    {
        "scenario": "tension 3liya",
        "flag": "tension_elevee",
        "levels": ["orange", "red"],
        "questions": [
            "Chno l-hajm dyal tension?",
            "Kayn sda3 f rass m3aha?",
            "Kayn dghya?",
            "Kayn s77a?",
            "Kayn ddm?",
        ],
        "hypotheses": ["Tension 3liya", "Pré-éclampsie", "Éclampsie"],
        "rx": [{"medication": "Méthyldopa", "dosage": "250mg", "duration": "7 l-yam"}],
        "rec": "Khas l-mra tmchi l-ispital bach ndirou mesure dyal tension w ndirou analyse."
    },
    {
        "scenario": "ri2a w 9iyan 3adi",
        "flag": None,
        "levels": ["green"],
        "questions": [
            "Kayn dokha f l-kar7a?",
            "Katchouf f l-makla?",
            "3andek chi l-madya dyal hamla?",
            "Chno w9lek?",
            "Ch7al men mra kat9iyan?",
        ],
        "hypotheses": ["Ri2a dyal l-hamla", "Médikaman dyal l-hamla"],
        "rx": [{"medication": "Vitamin B6", "dosage": "50mg", "duration": "7 l-yam"}],
        "rec": "Goulha takul chwiya f kol wa9t w matklch ktr. Hadi 3adiya f l-hamla."
    },
    {
        "scenario": "dokha khfif 3adi",
        "flag": None,
        "levels": ["green"],
        "questions": [
            "Kayn ri2a wla 9iyan?",
            "Chno w9lek f dokha?",
            "Kayn ddm?",
            "Kayn sa3ab f l-nass?",
            "Chno l-makla dyalek?",
        ],
        "hypotheses": ["Dokha dyal l-hamla", "Brûlures d'estomac"],
        "rx": [{"medication": "Maalox", "dosage": "15ml", "duration": "7 l-yam"}],
        "rec": "Goulha takul chwiya f kol wa9t w matklch ktr. Takul l-makla sghira."
    },
    {
        "scenario": "s77a w dokha",
        "flag": None,
        "levels": ["green", "orange"],
        "questions": [
            "Kayn ddm?",
            "Kayn tension 3liya?",
            "Kayn ri2a wla 9iyan?",
            "Chno w9lek?",
            "Kayn sa3ab f l-nass?",
        ],
        "hypotheses": ["Tension 3liya", "Dokha dyal l-hamla", "Pré-éclampsie"],
        "rx": [{"medication": "Paracétamol", "dosage": "500mg", "duration": "3 l-yam"}],
        "rec": "Khas l-mra tmchi l-ispital bach ndirou mesure dyal tension."
    },
]

months = [3, 4, 5, 6, 7, 8, 9]
month_words = {3: "tlat", 4: "rba3", 5: "khmsa", 6: "sitta", 7: "sba3", 8: "tmnya", 9: "ts9a"}
severity = ["khfif", "wstani", "bzzaf", "ktr bzzaf"]
durations = ["3 l-yam", "5 l-yam", "7 l-yam", "10 l-yam", "2 sba3"]

dataset = []

for t in templates:
    for month in months:
        for sev in severity:
            for dur in random.sample(durations, 2):
                level = random.choice(t["levels"])
                q = random.sample(t["questions"], min(3, len(t["questions"])))
                h = random.sample(t["hypotheses"], min(2, len(t["hypotheses"])))

                mw = month_words[month]
                inst = f"Patient diali 3andha hamla f chhar {mw} w {t['scenario']} {sev}."

                resp = {
                    "clarifying_questions": q,
                    "urgency_level": level,
                    "red_flags_detected": [t["flag"]] if t["flag"] and level == "red" else ([t["flag"]] if t["flag"] and level == "orange" and random.random() > 0.5 else []),
                    "summary": f"L-mra 3andha hamla f chhar {mw} w {t['scenario']} {sev}.",
                    "differential_hypotheses": h,
                    "draft_prescription": [{"medication": t["rx"][0]["medication"], "dosage": t["rx"][0]["dosage"], "duration": dur}],
                    "recommendation": t["rec"],
                }
                dataset.append({"instruction": inst, "response": json.dumps(resp, ensure_ascii=False)})

random.shuffle(dataset)
dataset = dataset[:500]

with open("app/ml/medical_darija_dataset.json", "w", encoding="utf-8") as f:
    json.dump(dataset, f, ensure_ascii=False, indent=2)

print(f"Dataset created: {len(dataset)} examples")
