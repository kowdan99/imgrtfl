from dataclasses import dataclass, asdict
import re
from datetime import datetime

END_PUNCT = (".","!","?")
RE_CAP      = re.compile(r"\b[A-Z][a-z]+\b")
RE_THANKS   = re.compile(r"\b(ty|thx|tysm|thank(?:s| you| u)|appreciat(?:e|ion|ive))\b", re.I)
RE_HANDLE   = re.compile(r"@([A-Za-z0-9_]{2,32})")

SOCIAL = {"with","met","called","texted","coffee","lunch","dinner","walk"}
REFLECT= {"learned","realized","next time","i will","goal","habit","improve"}
def _contains_any(lower: str, words: set[str]) -> bool:
    return any(f" {w} " in lower for w in words)

@dataclass
class Signals:
    len_chars: int
    len_words: int
    ends_with_punct: bool
    has_contact: bool
    who_display: str | None
    has_gratitude: bool
    has_social: bool
    has_reflection: bool
    n_capitalized: int
    hour: int
    def asdict(self): return asdict(self)

def extract_signals(text: str, contact_names: list[str]) -> Signals:
    body  = text.strip()
    lower = f" {body.lower()} "
    who = None
    for n in contact_names or []:
        if f" {n.lower()} " in lower:
            who = n; break
    if not who:
        h = RE_HANDLE.search(body)
        if h: who = "@"+h.group(1)
    if not who:
        caps = RE_CAP.findall(body)
        if caps: who = caps[0]

    has_grat = bool(RE_THANKS.search(body) or "🙏" in body or "❤️" in body)
    return Signals(
        len_chars=len(body),
        len_words=len(body.split()),
        ends_with_punct=body.endswith(END_PUNCT),
        has_contact=bool(who),
        who_display=who,
        has_gratitude=has_grat,
        has_social=_contains_any(lower, SOCIAL),
        has_reflection=_contains_any(lower, REFLECT),
        n_capitalized=len(RE_CAP.findall(body)),
        hour=datetime.now().hour,
    )
