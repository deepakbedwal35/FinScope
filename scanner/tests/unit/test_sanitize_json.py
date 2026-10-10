# scanner/tests/unit/test_sanitize_json.py
import math
import numpy as np
import pandas as pd
from datetime import datetime
from scanner.utils.sanitize_json import sanitize_for_json, sanitize_key


def test_nan_and_inf_floats_become_none():
    # Checks that NaN and Infinity float values are replaced with None,
    # catching bugs where FastAPI/JSONResponse crashes with unhandled 500 when serializing invalid floats.

    # Arrange: Nested payload containing standard float NaN, NumPy NaN, and positive/negative infinity
    payload = {
        "regular_val": 120.5,
        "nan_float": float("nan"),
        "numpy_nan": np.nan,
        "pos_inf": float("inf"),
        "neg_inf": float("-inf"),
    }

    # Act
    sanitized = sanitize_for_json(payload)

    # Assert
    assert sanitized["regular_val"] == 120.5
    assert sanitized["nan_float"] is None
    assert sanitized["numpy_nan"] is None
    assert sanitized["pos_inf"] is None
    assert sanitized["neg_inf"] is None


def test_numpy_scalars_convert_to_native_python_types():
    # Checks that NumPy integers, floats, and booleans are converted to Python native types,
    # catching bugs where json.dumps throws TypeError: Object of type int64 is not JSON serializable.

    # Arrange: Dictionary of various NumPy scalar types
    payload = {
        "np_int": np.int64(42),
        "np_float": np.float64(3.14159),
        "np_bool_true": np.bool_(True),
        "np_bool_false": np.bool_(False),
        "np_array": np.array([1, 2, 3]),
    }

    # Act
    sanitized = sanitize_for_json(payload)

    # Assert
    assert sanitized["np_int"] == 42
    assert type(sanitized["np_int"]) is int
    assert math.isclose(sanitized["np_float"], 3.14159)
    assert type(sanitized["np_float"]) is float
    assert sanitized["np_bool_true"] is True
    assert type(sanitized["np_bool_true"]) is bool
    assert sanitized["np_bool_false"] is False
    assert sanitized["np_array"] == [1, 2, 3]


def test_pandas_dataframe_and_series_convert_to_records_list():
    # Checks that a pandas DataFrame with a Date index converts into a list of JSON-serializable records,
    # catching bugs where technical indicator DataFrames fail to serialize for the UI.

    # Arrange: 2-row DataFrame indexed by timestamps
    dates = pd.date_range("2026-01-01", periods=2)
    df = pd.DataFrame(
        {"Close": [150.0, 155.5], "Volume": [1000, 2000]},
        index=dates
    )

    # Act
    sanitized = sanitize_for_json(df)

    # Assert
    assert isinstance(sanitized, list)
    assert len(sanitized) == 2
    assert sanitized[0]["Close"] == 150.0
    assert sanitized[0]["Volume"] == 1000
    assert sanitized[0]["index"] == "2026-01-01"


def test_timestamp_and_nat_handling():
    # Checks that pd.Timestamp formats to YYYY-MM-DD and pd.NaT converts to None,
    # catching bugs where missing timestamps or dates crash frontend date parsers.

    # Arrange: Mix of valid Timestamp, NaT (Not-a-Time), and standard datetime
    payload = {
        "valid_ts": pd.Timestamp("2026-03-15 10:30:00"),
        "nat_value": pd.NaT,
        "standard_dt": datetime(2026, 4, 1, 12, 0, 0),
    }

    # Act
    sanitized = sanitize_for_json(payload)

    # Assert
    assert sanitized["valid_ts"] == "2026-03-15"
    assert sanitized["nat_value"] is None
    assert "2026-04-01" in sanitized["standard_dt"]

