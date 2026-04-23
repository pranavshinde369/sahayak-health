import sqlite3
import uuid
import json
from datetime import datetime

DB_PATH = "sahayak.db"

def get_conn():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_conn()
    c = conn.cursor()

    c.execute("""
        CREATE TABLE IF NOT EXISTS patients (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            age INTEGER,
            village TEXT,
            phone TEXT,
            conditions TEXT,
            created_at TEXT
        )
    """)

    c.execute("""
        CREATE TABLE IF NOT EXISTS sessions (
            id TEXT PRIMARY KEY,
            patient_id TEXT,
            session_type TEXT,
            data TEXT,
            created_at TEXT,
            FOREIGN KEY(patient_id) REFERENCES patients(id)
        )
    """)

    c.execute("""
        CREATE TABLE IF NOT EXISTS nadi_calls (
            id TEXT PRIMARY KEY,
            call_sid TEXT,
            from_number TEXT,
            answers TEXT,
            processed TEXT,
            risk_level TEXT,
            assigned_patient_id TEXT,
            created_at TEXT
        )
    """)

    conn.commit()
    conn.close()
    print("Database initialized.")

# ─── Patients ─────────────────────────────────────────────────────────────────

def save_patient(data: dict) -> dict:
    conn = get_conn()
    patient_id = str(uuid.uuid4())[:8]
    now = datetime.utcnow().isoformat()
    conn.execute(
        "INSERT INTO patients VALUES (?,?,?,?,?,?,?)",
        (
            patient_id,
            data["name"],
            data.get("age"),
            data.get("village"),
            data.get("phone"),
            json.dumps(data.get("conditions", [])),
            now,
        )
    )
    conn.commit()
    conn.close()
    return {**data, "id": patient_id, "created_at": now}

def get_all_patients() -> list:
    conn = get_conn()
    rows = conn.execute("SELECT * FROM patients ORDER BY created_at DESC").fetchall()
    conn.close()
    result = []
    for r in rows:
        p = dict(r)
        p["conditions"] = json.loads(p.get("conditions") or "[]")
        result.append(p)
    return result

def get_patient(patient_id: str) -> dict | None:
    conn = get_conn()
    row = conn.execute("SELECT * FROM patients WHERE id=?", (patient_id,)).fetchone()
    conn.close()
    if not row:
        return None
    p = dict(row)
    p["conditions"] = json.loads(p.get("conditions") or "[]")
    return p

# ─── Sessions ─────────────────────────────────────────────────────────────────

def save_session(patient_id: str, session_type: str, data: dict) -> dict:
    conn = get_conn()
    sid = str(uuid.uuid4())[:8]
    now = datetime.utcnow().isoformat()
    conn.execute(
        "INSERT INTO sessions VALUES (?,?,?,?,?)",
        (sid, patient_id, session_type, json.dumps(data), now)
    )
    conn.commit()
    conn.close()
    return {"id": sid, "patient_id": patient_id, "session_type": session_type, "created_at": now}

def get_patient_sessions(patient_id: str) -> list:
    conn = get_conn()
    rows = conn.execute(
        "SELECT * FROM sessions WHERE patient_id=? ORDER BY created_at DESC",
        (patient_id,)
    ).fetchall()
    conn.close()
    result = []
    for r in rows:
        s = dict(r)
        s["data"] = json.loads(s.get("data") or "{}")
        result.append(s)
    return result

# ─── Nadi Calls ───────────────────────────────────────────────────────────────

def save_nadi_call(processed: dict, call_sid: str = "", from_number: str = "") -> dict:
    conn = get_conn()
    call_id = str(uuid.uuid4())[:8]
    now = datetime.utcnow().isoformat()
    conn.execute(
        "INSERT INTO nadi_calls VALUES (?,?,?,?,?,?,?,?)",
        (
            call_id,
            call_sid,
            from_number,
            "{}",
            json.dumps(processed),
            processed.get("risk_level", "unknown"),
            None,
            now,
        )
    )
    conn.commit()
    conn.close()
    return {"id": call_id, "processed": processed, "created_at": now}

def get_nadi_calls() -> list:
    conn = get_conn()
    rows = conn.execute("SELECT * FROM nadi_calls ORDER BY created_at DESC").fetchall()
    conn.close()
    result = []
    for r in rows:
        c = dict(r)
        c["processed"] = json.loads(c.get("processed") or "{}")
        result.append(c)
    return result
