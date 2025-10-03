from dataclasses import asdict
from .signals import extract_signals
from .rules import score_actions, normalize

def decide(text: str, contact_names: list[str], allow_nudge: bool) -> dict:
    sig = extract_signals(text, contact_names)
    raw = score_actions(sig)
    probs = normalize(raw)
    action = max(probs, key=probs.get)
    reason = {
        "expand":    "Short/incomplete entry → expand for detail.",
        "nudge":     f"Detected person ({sig.who_display or 'contact'}) + gratitude/social → nudge.",
        "resurface": "Reflective/longer entry without a person → resurface later."
    }[action]
    guardrails = []
    if action == "nudge" and (not allow_nudge or not sig.has_contact):
        guardrails.append("Nudge blocked (no contact or disabled).")
    confidence = min(0.97, max(0.55, probs[action]))
    params = {}
    if action == "nudge":
        params = {"person": sig.who_display or "", "proposed_text": f"Hey {sig.who_display or ''}, just wanted to say I’m grateful for that moment."}
    if action == "resurface":
        params = {"when_days": 14}
    return {
        "action": action,
        "confidence": confidence,
        "reason": reason,
        "params": params,
        "candidates": probs,
        "signals": asdict(sig),
        "guardrails": guardrails,
    }
