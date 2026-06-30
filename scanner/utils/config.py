
import os
from dotenv import load_dotenv

load_dotenv()


GROQ_API_KEY = os.getenv("GROQ_API_KEY", "").strip()
GROQ_MODEL = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")


GROQ_ENABLED = os.getenv("GROQ_ENABLED", "True").lower() in ("true", "1", "yes")

GROQ_MAX_TOKENS = int(os.getenv("GROQ_MAX_TOKENS", "2048"))
GROQ_TEMPERATURE = float(os.getenv("GROQ_TEMPERATURE", "0.2"))

DEFAULT_CAPITAL = float(os.getenv("DEFAULT_CAPITAL", "100000"))
DEFAULT_RISK_PCT = float(os.getenv("DEFAULT_RISK_PCT", "1.0"))


def get_key() -> str:
    """Returns the Groq API key — checks session state first, then env variables."""
    try:
        import streamlit as st
        session_key = st.session_state.get("groq_api_key", "")
        if session_key and session_key.strip():
            return session_key.strip()
    except Exception:
        pass
    return GROQ_API_KEY


def is_gemini_ready() -> bool:
    try:
        return bool(get_key())
    except Exception:
        return bool(GROQ_API_KEY and GROQ_ENABLED)
