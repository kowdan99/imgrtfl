from .signals import Signals

def score_actions(sig: Signals) -> dict[str, float]:
    s = {"expand": 0.0, "nudge": 0.0, "resurface": 0.0}
    # expand
    if sig.len_chars < 60 or not sig.ends_with_punct: s["expand"] += 0.60
    if sig.len_words < 12:                             s["expand"] += 0.20
    if sig.n_capitalized == 0:                         s["expand"] += 0.10
    if sig.has_reflection:                             s["expand"] -= 0.05
    # nudge
    if sig.has_contact and (sig.has_gratitude or sig.has_social): s["nudge"] += 0.70
    elif sig.has_contact:                                         s["nudge"] += 0.40
    if sig.has_gratitude:                                         s["nudge"] += 0.15
    if not sig.has_contact:                                       s["nudge"] -= 0.25
    # resurface
    if sig.has_reflection:                                        s["resurface"] += 0.55
    if sig.len_chars >= 100 and not sig.has_contact:              s["resurface"] += 0.25
    return s

def normalize(d: dict[str,float]) -> dict[str,float]:
    d = {k: max(0.0, v) for k, v in d.items()}
    tot = sum(d.values()) or 1.0
    return {k: v/tot for k, v in d.items()}
