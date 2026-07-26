"""Court IDs for seed-state scoping (CourtListener abbreviations).

Used when --state is not US. Source: Free Law Project jurisdictions list.
"""
from __future__ import annotations

# Circuit + primary district courts for launch states.
COURTS_POR_STATE: dict[str, tuple[str, ...]] = {
    "CA": ("ca9", "cacd", "caed", "cand", "casd", "cacb"),
    "NY": ("ca2", "nysd", "nyed", "nynd", "nywd"),
    "TX": ("ca5", "txnd", "txsd", "txed", "txwd"),
    "FL": ("ca11", "flnd", "flmd", "flsd"),
    "IL": ("ca7", "ilnd", "ilcd", "ilsd"),
}
