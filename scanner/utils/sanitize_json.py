import math
import numpy as np
import pandas as pd
from datetime import datetime, date

def sanitize_for_json(obj):
    # ── Dict: recurse into keys and values ──
    if isinstance(obj, dict):
        return {
            sanitize_key(k): sanitize_for_json(v)
            for k, v in obj.items()
        }
    # ── List/tuple ──
    if isinstance(obj, (list, tuple)):
        return [sanitize_for_json(i) for i in obj]

    # ── DataFrame → list of records with clean index ──
    if isinstance(obj, pd.DataFrame):
        obj = obj.reset_index()  # moves Date index → column
        return sanitize_for_json(obj.to_dict(orient="records"))

    # ── Series ──
    if isinstance(obj, pd.Series):
        return sanitize_for_json(obj.reset_index().to_dict(orient="records"))

    # ── Timestamp / NaT ──
    if isinstance(obj, pd.Timestamp):
        return None if pd.isna(obj) else obj.strftime("%Y-%m-%d")
    if obj is pd.NaT:
        return None

    # ── numpy floats ──
    if isinstance(obj, np.floating):
        if np.isnan(obj) or np.isinf(obj):
            return None
        return float(obj)

    # ── numpy ints ──
    if isinstance(obj, np.integer):
        return int(obj)

    # ── numpy bool (np.True_ / np.False_) ──
    if isinstance(obj, np.bool_):
        return bool(obj)

    # ── numpy array ──
    if isinstance(obj, np.ndarray):
        return sanitize_for_json(obj.tolist())

    # ── plain Python float (catches float('nan')) ──
    if isinstance(obj, float):
        if math.isnan(obj) or math.isinf(obj):
            return None
        return obj

    # ── Python datetime ──
    if isinstance(obj, (datetime, date)):
        return obj.isoformat()

    return obj


def sanitize_key(k):
    """Convert any non-string key to string."""
    if isinstance(k, pd.Timestamp):
        return k.strftime("%Y-%m-%d")
    if isinstance(k, (np.integer,)):
        return int(k)
    if isinstance(k, (str, int, float, bool, type(None))):
        return k
    return str(k)