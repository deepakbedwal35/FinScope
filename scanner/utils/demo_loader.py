"""
Demo scan fallback loader.
Loads pre-recorded full scan data when no live full scan exists in Redis.
Never writes to Redis or any database.
"""

from __future__ import annotations

import copy
import json
import logging
from pathlib import Path
from typing import Any

logger = logging.getLogger(__name__)

_CACHED_DEMO_DATA: dict[str, Any] | None = None
DEMO_DATE = "2026-10-09"


def _find_fixture_path() -> Path:
    base = Path(__file__).resolve().parent.parent  # scanner/
    candidates = [
        base / "data" / "demo_full_scan.json",
        base.parent / "server" / "src" / "data" / "demoFullScan.json",
    ]
    for p in candidates:
        if p.is_file():
            return p
    raise FileNotFoundError(f"Demo fixture not found in {candidates}")


def load_demo_full_scan() -> dict[str, Any]:
    """
    Loads demo fixture from disk (cached in memory) and tags it with demo metadata.
    Does not touch Redis or databases.
    """
    global _CACHED_DEMO_DATA
    if _CACHED_DEMO_DATA is None:
        fixture_path = _find_fixture_path()
        with open(fixture_path, "r", encoding="utf-8") as f:
            raw = json.load(f)
        _CACHED_DEMO_DATA = raw
        logger.info(f"Loaded demo full scan fixture from {fixture_path}")

    data = copy.deepcopy(_CACHED_DEMO_DATA)
    data["isDemo"] = True
    data["demoAsOf"] = DEMO_DATE
    return data

