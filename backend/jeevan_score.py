from datetime import datetime, timedelta

def calculate_jeevan_score(sessions: list) -> tuple[int, dict]:
    """
    Calculate Jeevan Score (0-100) from a patient's session history.
    Higher = healthier trajectory. Lower = more concern.
    Returns (score, breakdown_dict)
    """
    base = 70
    breakdown = {
        "base": 70,
        "red_flags_penalty": 0,
        "emergency_penalty": 0,
        "referral_penalty": 0,
        "wellness_penalty": 0,
        "improving_bonus": 0,
        "recent_visit_bonus": 0,
    }

    if not sessions:
        return base, breakdown

    # Only look at last 30 days of sessions
    cutoff = datetime.utcnow() - timedelta(days=30)
    recent = []
    for s in sessions:
        try:
            ts = datetime.fromisoformat(s["created_at"])
            if ts > cutoff:
                recent.append(s)
        except Exception:
            recent.append(s)

    triage_sessions = [s for s in recent if s["session_type"] == "triage"]
    pratibimb_sessions = [s for s in recent if s["session_type"] == "pratibimb"]

    # ── Triage analysis ───────────────────────────────────────────────────────

    for s in triage_sessions:
        data = s.get("data", {})
        risk = data.get("risk_level", "low")
        flags = data.get("red_flags", [])

        if risk == "emergency":
            breakdown["emergency_penalty"] -= 20
        elif risk == "high":
            breakdown["red_flags_penalty"] -= 12
        elif risk == "medium":
            breakdown["red_flags_penalty"] -= 6

        # Extra penalty per red flag
        breakdown["red_flags_penalty"] -= min(len(flags) * 2, 10)

        if data.get("referral_needed"):
            breakdown["referral_penalty"] -= 5

    # Cap penalties
    breakdown["red_flags_penalty"] = max(breakdown["red_flags_penalty"], -25)
    breakdown["emergency_penalty"] = max(breakdown["emergency_penalty"], -20)
    breakdown["referral_penalty"] = max(breakdown["referral_penalty"], -10)

    # ── Pratibimb analysis ────────────────────────────────────────────────────

    for s in pratibimb_sessions:
        data = s.get("data", {})
        flags = data.get("flags", [])
        refer_flags = [f for f in flags if f.get("severity") == "refer"]
        if refer_flags:
            breakdown["red_flags_penalty"] -= min(len(refer_flags) * 5, 15)

    # ── Improving trend bonus ─────────────────────────────────────────────────

    if len(triage_sessions) >= 2:
        latest = triage_sessions[0].get("data", {}).get("risk_level", "medium")
        previous = triage_sessions[1].get("data", {}).get("risk_level", "medium")
        risk_order = {"emergency": 4, "high": 3, "medium": 2, "low": 1}
        if risk_order.get(latest, 2) < risk_order.get(previous, 2):
            breakdown["improving_bonus"] = 8

    # ── Recent visit bonus ────────────────────────────────────────────────────

    if recent:
        breakdown["recent_visit_bonus"] = 5

    # ── Final score ───────────────────────────────────────────────────────────

    score = (
        breakdown["base"]
        + breakdown["red_flags_penalty"]
        + breakdown["emergency_penalty"]
        + breakdown["referral_penalty"]
        + breakdown["wellness_penalty"]
        + breakdown["improving_bonus"]
        + breakdown["recent_visit_bonus"]
    )

    score = max(0, min(100, score))
    return score, breakdown
