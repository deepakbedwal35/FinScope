import xgboost as xgb
import pandas as pd
import json
import os
_MODEL = None
_FEATURE_COLS = None

MODEL_PATH = os.path.join(os.path.dirname(__file__), "./models/finscope_xgb_model.json")
FEATURES_PATH = os.path.join(os.path.dirname(__file__), "./models/finscope_xgb_features.json")


def load_ml_model():
    """Load once, cache in memory — avoid reloading on every scan call."""
    global _MODEL, _FEATURE_COLS
    if _MODEL is None:
        _MODEL = xgb.XGBClassifier()
        _MODEL.load_model(MODEL_PATH)
        with open(FEATURES_PATH) as f:
            _FEATURE_COLS = json.load(f)
    return _MODEL, _FEATURE_COLS


def get_ml_win_probability(indicator_row: dict) -> float:
    model, feature_cols = load_ml_model()
    X_new = pd.DataFrame([indicator_row]).reindex(columns=feature_cols, fill_value=0)
    prob = model.predict_proba(X_new)[:, 1][0]
    return round(float(prob) * 100, 1)


