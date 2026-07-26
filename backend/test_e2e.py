import httpx
import json
import sys

BASE = "http://localhost:8000"
client = httpx.Client(base_url=BASE, timeout=180.0)

passed = 0
failed = 0

def test(name, func):
    global passed, failed
    try:
        result = func()
        print(f"  PASS  {name}")
        passed += 1
        return result
    except Exception as e:
        print(f"  FAIL  {name}: {e}")
        failed += 1
        return None

print("\n=== E2E TESTS: Dar Al Oumouma ===\n")

# 1. Health
print("[1] Health Check")
test("GET /api/health", lambda: (
    r := client.get("/api/health"),
    None if r.status_code == 200 else (_ for _ in ()).throw(Exception(f"status={r.status_code} {r.text}")),
    r.json()
)[-1])

# 2. Register
print("\n[2] Auth - Register")
reg = test("POST /api/auth/register", lambda: (
    r := client.post("/api/auth/register", json={
        "nom": "Test Nurse",
        "email": "test_e2e@example.com",
        "password": "testpass123",
        "role": "infirmier",
        "centre": "Centre Test"
    }),
    None if r.status_code == 200 else (_ for _ in ()).throw(Exception(f"status={r.status_code} {r.text}")),
    r.json()
)[-1])
token = reg["access_token"] if reg else None

# 3. Login
print("\n[3] Auth - Login")
test("POST /api/auth/login", lambda: (
    r := client.post("/api/auth/login", json={
        "email": "test_e2e@example.com",
        "password": "testpass123"
    }),
    None if r.status_code == 200 else (_ for _ in ()).throw(Exception(f"status={r.status_code} {r.text}")),
    r.json()
)[-1])

# 4. Create Patient
print("\n[4] Patients")
patient = test("POST /api/patients", lambda: (
    r := client.post("/api/patients", json={
        "nom": "Fatima Zahra E2E",
        "age": 28,
        "sexe": "F",
        "zone": "rurale",
        "village": "Ait Benhaddou",
        "antecedents": "G2P1, pas de complications"
    }),
    None if r.status_code == 200 else (_ for _ in ()).throw(Exception(f"status={r.status_code} {r.text}")),
    r.json()
)[-1])
patient_id = patient["id"] if patient else None

# 5. List Patients
test("GET /api/patients", lambda: (
    r := client.get("/api/patients"),
    None if r.status_code == 200 else (_ for _ in ()).throw(Exception(f"status={r.status_code} {r.text}")),
    r.json()
)[-1])

# 6. Get Patient Detail
dossier_id = None
if patient_id:
    pdata = test(f"GET /api/patients/{patient_id}", lambda: (
        r := client.get(f"/api/patients/{patient_id}"),
        None if r.status_code == 200 else (_ for _ in ()).throw(Exception(f"status={r.status_code} {r.text}")),
        r.json()
    )[-1])
    if pdata and pdata.get("dossier"):
        dossier_id = pdata["dossier"]["id"]

# 7. Create Consultation
consultation_id = None
if dossier_id:
    print(f"\n[5] Consultations (dossier_id={dossier_id})")
    consultation = test("POST /api/consultations", lambda: (
        r := client.post("/api/consultations", json={"dossier_id": dossier_id}),
        None if r.status_code == 200 else (_ for _ in ()).throw(Exception(f"status={r.status_code} {r.text}")),
        r.json()
    )[-1])
    consultation_id = consultation["id"] if consultation else None

# 8. AI Chat - French
if consultation_id:
    print(f"\n[6] AI Chat - French (consultation {consultation_id})")
    ai_resp = test("POST message (francais)", lambda: (
        r := client.post(f"/api/consultations/{consultation_id}/message", json={
            "content": "J'ai mal à la tête et je vois des éclairs"
        }),
        None if r.status_code == 200 else (_ for _ in ()).throw(Exception(f"status={r.status_code} {r.text}")),
        r.json()
    )[-1])
    if ai_resp:
        ai_result = ai_resp.get("ai_response", {})
        print(f"    -> Urgency: {ai_resp.get('urgency_level')}")
        print(f"    -> Summary: {ai_result.get('summary', '')[:120]}")
        print(f"    -> Questions: {ai_result.get('clarifying_questions', [])[:2]}")
        print(f"    -> Red flags: {ai_result.get('red_flags_detected', [])}")
        print(f"    -> Hypotheses: {ai_result.get('differential_hypotheses', [])[:2]}")

    # 9. AI Chat - Darija
    print(f"\n[7] AI Chat - Darija")
    test("POST message (darija)", lambda: (
        r := client.post(f"/api/consultations/{consultation_id}/message", json={
            "content": "Kayn ddm chi yom walou, w sda3 f rass"
        }),
        None if r.status_code == 200 else (_ for _ in ()).throw(Exception(f"status={r.status_code} {r.text}")),
        r.json()
    )[-1])

    # 10. Finalize
    print(f"\n[8] Finalize Consultation")
    final = test("POST finalize", lambda: (
        r := client.post(f"/api/consultations/{consultation_id}/finalize"),
        None if r.status_code == 200 else (_ for _ in ()).throw(Exception(f"status={r.status_code} {r.text}")),
        r.json()
    )[-1])
    if final:
        print(f"    -> Compte rendu: {final.get('compte_rendu', '')[:120]}")
        print(f"    -> Ordonnance: {final.get('ordonnance', [])[:2]}")
        print(f"    -> Follow-up months: {len(final.get('follow_up_program', {}).get('monthly_plan', []))}")

# 11. Validation queue
print(f"\n[9] Validation Queue")
queue = test("GET /api/validation/queue", lambda: (
    r := client.get("/api/validation/queue"),
    None if r.status_code == 200 else (_ for _ in ()).throw(Exception(f"status={r.status_code} {r.text}")),
    r.json()
)[-1])
if queue:
    print(f"    -> Queue size: {len(queue)}")

# 12. Validate
if consultation_id:
    print(f"\n[10] Validation Approve")
    test("POST validate", lambda: (
        r := client.post(f"/api/validation/{consultation_id}", json={"action": "approved"}),
        None if r.status_code == 200 else (_ for _ in ()).throw(Exception(f"status={r.status_code} {r.text}")),
        r.json()
    )[-1])

print(f"\n{'='*40}")
print(f"  RESULTS: {passed} passed, {failed} failed")
print(f"{'='*40}\n")

sys.exit(0 if failed == 0 else 1)
