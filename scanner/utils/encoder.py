import numpy as np
import pandas as pd
import math
from json import JSONEncoder
from datetime import datetime, date


class NumpyEncoder(JSONEncoder):

    # ── This is called for unknown types ──
    def default(self, obj):
        if isinstance(obj, np.integer):
            return int(obj)
        if isinstance(obj, np.floating):                  # numpy nan caught here
            return None if np.isnan(obj) or np.isinf(obj) else float(obj)
        if isinstance(obj, np.bool_):
            return bool(obj)
        if isinstance(obj, np.ndarray):
            return obj.tolist()
        if isinstance(obj, pd.DataFrame):
            return obj.to_dict(orient="records")
        if isinstance(obj, pd.Series):
            return obj.tolist()
        if isinstance(obj, pd.Timestamp):
            return None if pd.isna(obj) else obj.strftime("%Y-%m-%d %H:%M:%S")
        if isinstance(obj, (datetime, date)):
            return obj.isoformat()
        try:
            return super().default(obj)
        except TypeError:
            return str(obj)

    # ── THIS catches plain Python float('nan') — default() never sees it ──
    def iterencode(self, obj, _one_shot=False):
        # Pre-clean the entire object before encoding
        return super().iterencode(self._clean(obj), _one_shot)

    def _clean(self, obj):
        """Recursively sanitize before json sees it."""
        if isinstance(obj, dict):
            return {k: self._clean(v) for k, v in obj.items()}
        if isinstance(obj, list):
            return [self._clean(i) for i in obj]
        if isinstance(obj, float):
            return None if (math.isnan(obj) or math.isinf(obj)) else obj  # ← THE FIX
        if isinstance(obj, np.floating):
            return None if (np.isnan(obj) or np.isinf(obj)) else float(obj)
        if isinstance(obj, np.integer):
            return int(obj)
        if isinstance(obj, np.bool_):
            return bool(obj)
        if isinstance(obj, pd.Timestamp):
            return None if pd.isna(obj) else obj.strftime("%Y-%m-%d %H:%M:%S")
        return obj