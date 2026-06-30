

import json
import re
from datetime import datetime

try:
    from groq import Groq
    GROQ_AVAILABLE = True
except ImportError:
    GROQ_AVAILABLE = False

# ─────────────────────────────────────────────────────────────────────────────
# INTERNAL HELPERS
# ─────────────────────────────────────────────────────────────────────────────

# Module-level client cache — one client per API key
_cached_key: str    = None
_client: "Groq"     = None


def _get_client(api_key: str) -> "Groq":
    """Return a cached Groq client. Re-creates only if the key changes."""
    global _cached_key, _client

    if not GROQ_AVAILABLE:
        raise ImportError(
            "groq package not installed.\n"
            "Run: pip install groq"
        )

    if api_key != _cached_key:
        _client     = Groq(api_key=api_key)
        _cached_key = api_key

    return _client


def _call_groq(
    api_key: str,
    system_prompt: str,
    user_prompt: str,
    model_name: str    = "llama3-70b-8192",
    temperature: float = 0.2,
    max_tokens: int    = 2048,
) -> str:
    """
    Call Groq and return the assistant's text response.
    Returns a string starting with '__ERROR__:' on failure.
    """
    try:
        client = _get_client(api_key)
        chat   = client.chat.completions.create(
            model      = model_name,
            temperature= temperature,
            max_tokens = max_tokens,
            messages   = [
                {"role": "system", "content": system_prompt},
                {"role": "user",   "content": user_prompt},
            ],
        )
        return chat.choices[0].message.content

    except Exception as e:
        return f"__ERROR__: {e}"


def _extract_json(text: str) -> dict:
    """
    Extract a JSON object from LLM response text.
    Handles markdown code fences (```json ... ```) and stray whitespace.
    """
    text = re.sub(r"```json\s*", "", text)
    text = re.sub(r"```\s*",     "", text)
    text = text.strip()

    match = re.search(r"\{[\s\S]*\}", text)
    if match:
        try:
            return json.loads(match.group())
        except json.JSONDecodeError:
            try:
                cleaned = re.sub(r",\s*([}\]])", r"\1", match.group())
                return json.loads(cleaned)
            except json.JSONDecodeError:
                pass
    return {}


# ─────────────────────────────────────────────────────────────────────────────
# 1. LIVE NEWS ANALYSIS
#    Signature kept identical to the Gemini version — app.py unchanged.
# ─────────────────────────────────────────────────────────────────────────────

def analyse_news_with_gemini(
    symbol: str,
    company_name: str,
    api_key: str,
    model_name: str        = "llama3-70b-8192",   # was gemini-2.0-flash
    existing_headlines: list = None,
) -> dict:
    """
    Ask Groq LLM to recall + analyse the latest news about a stock.

    existing_headlines : list of headline dicts already fetched by VADER
                         (passed as context so the LLM can supplement them)

    Returns a structured dict with news_items, sentiment scores, summary.
    NOTE: Function name kept as 'analyse_news_with_gemini' for app.py compatibility.
    """
    today = datetime.now().strftime("%d %B %Y")

    existing_str = ""
    if existing_headlines:
        existing_str = "\n\nHEADLINES ALREADY FETCHED (from RSS feeds):\n"
        for i, h in enumerate(existing_headlines[:15], 1):
            existing_str += f"{i}. {h.get('title', '')}\n"

    system_prompt = (
        "You are a senior equity research analyst specialising in Indian stock markets (NSE/BSE). "
        "You always respond with valid JSON only — no markdown, no explanation, no preamble."
    )

    user_prompt = f"""Today's date: {today}
Stock: {company_name} ({symbol} NSE India)
{existing_str}

Your task:
1. Based on your knowledge, recall the MOST RECENT and IMPORTANT news about {company_name} ({symbol})
2. Include: earnings results, order wins, contracts, regulatory actions, management changes,
   analyst upgrades/downgrades, sector news that impacts this stock
3. Focus on news from the last 3-6 months that would affect the stock price

Return ONLY a valid JSON object (no markdown, no explanation):
{{
  "news_items": [
    {{
      "title": "Brief headline",
      "detail": "2-3 sentence explanation of what happened and why it matters",
      "category": "Earnings" | "Orders/Contracts" | "Management" | "Regulatory" | "Analyst" | "Sector" | "Macro",
      "sentiment": "POSITIVE" | "NEGATIVE" | "NEUTRAL",
      "impact": <1-10>,
      "date_approx": "e.g. Q3 FY25 or Jan 2025",
      "source_hint": "e.g. BSE filing, ET, Bloomberg"
    }}
  ],
  "overall_news_sentiment": "POSITIVE" | "NEGATIVE" | "NEUTRAL" | "MIXED",
  "overall_news_score": <-10 to +10>,
  "key_upcoming_events": ["e.g. Q4 results expected March 2025"],
  "analyst_consensus": "BUY" | "HOLD" | "SELL" | "MIXED",
  "recent_price_drivers": ["What drove recent price movement"],
  "news_summary": "3-4 sentence summary of the current news environment for this stock"
}}

Only include real events you know about. Sort news_items by impact (highest first).
"""

    response = _call_groq(api_key, system_prompt, user_prompt, model_name)

    if response.startswith("__ERROR__"):
        return {
            "error":                  response,
            "news_items":             [],
            "positive":               [],
            "negative":               [],
            "neutral":                [],
            "overall_news_sentiment": "UNKNOWN",
            "overall_news_score":     0,
            "news_summary":           f"Groq error: {response}",
            "source":                 "groq",
        }

    data = _extract_json(response)

    if not data:
        return {
            "error":                  "Could not parse Groq response",
            "raw":                    response[:500],
            "news_items":             [],
            "positive":               [],
            "negative":               [],
            "neutral":                [],
            "overall_news_sentiment": "UNKNOWN",
            "overall_news_score":     0,
            "news_summary":           "Could not parse response.",
            "source":                 "groq",
        }

    # Defaults
    data.setdefault("news_items",             [])
    data.setdefault("overall_news_sentiment", "NEUTRAL")
    data.setdefault("overall_news_score",     0)
    data.setdefault("key_upcoming_events",    [])
    data.setdefault("analyst_consensus",      "MIXED")
    data.setdefault("recent_price_drivers",   [])
    data.setdefault("news_summary",           "")

    for item in data["news_items"]:
        item.setdefault("sentiment",   "NEUTRAL")
        item.setdefault("impact",      5)
        item.setdefault("category",    "Other")
        item.setdefault("detail",      "")
        item.setdefault("date_approx", "")
        item.setdefault("source_hint", "")

    data["positive"] = [n for n in data["news_items"] if n["sentiment"] == "POSITIVE"]
    data["negative"] = [n for n in data["news_items"] if n["sentiment"] == "NEGATIVE"]
    data["neutral"]  = [n for n in data["news_items"] if n["sentiment"] == "NEUTRAL"]
    data["source"]   = "groq"

    return data


# ─────────────────────────────────────────────────────────────────────────────
# 2. UNIFIED AI DECISION
#    Signature kept identical to the Gemini version — app.py unchanged.
# ─────────────────────────────────────────────────────────────────────────────

def get_ai_decision(
    symbol: str,
    company_name: str,
    api_key: str,
    model_name: str = "llama3-70b-8192",   # was gemini-2.0-flash
    # Technical data
    score: int        = None,
    grade: str        = None,
    cmp: float        = None,
    entry: float      = None,
    sl: float         = None,
    t1: float         = None,
    t2: float         = None,
    rsi: float        = None,
    macd_signal: str  = None,
    dow_signal: str   = None,
    dow_primary: str  = None,
    strength: str     = None,
    # Fundamental data
    pe_ratio           = None,
    pb_ratio           = None,
    roe                = None,
    debt_equity        = None,
    profit_margin      = None,
    revenue_growth_yoy = None,
    profit_growth_yoy  = None,
    market_cap: str    = None,
    eps                = None,
    last_quarter_profit: str = None,
    last_quarter_trend: str  = None,
    dividend_yield     = None,
    # News data
    vader_score: float       = None,
    vader_sentiment: str     = None,
    gemini_news_score: float = None,
    gemini_news_sentiment: str = None,
    top_positive_news: list  = None,
    top_negative_news: list  = None,
    news_summary: str        = None,
    # Risk data
    risk_level: str    = None,
    high_risks: int    = 0,
    risk_factors: list = None,
    # Timeframe
    mtf_alignment: str = None,
) -> dict:
    """
    Master AI decision engine — powered by Groq LLM.
    All parameters identical to the original Gemini version.
    NOTE: Function name kept as 'get_ai_decision' — app.py unchanged.
    """
    today   = datetime.now().strftime("%d %B %Y")
    cmp_str = f"₹{cmp:.2f}"    if cmp    else "N/A"
    entry_s = f"₹{entry:.2f}"  if entry  else "N/A"
    sl_s    = f"₹{sl:.2f}"     if sl     else "N/A"
    t1_s    = f"₹{t1:.2f}"     if t1     else "N/A"
    t2_s    = f"₹{t2:.2f}"     if t2     else "N/A"

    pos_news  = "\n".join([f"  + {n}" for n in (top_positive_news or [])[:5]])
    neg_news  = "\n".join([f"  - {n}" for n in (top_negative_news or [])[:5]])
    risk_str  = "\n".join([f"  ! {r}" for r in (risk_factors or [])[:5]])

    entry_num = entry or 0
    sl_num    = sl    or 0
    t1_num    = t1    or 0
    t2_num    = t2    or 0

    system_prompt = (
        "You are a senior portfolio manager and technical analyst with 20 years of experience "
        "in Indian equity markets (NSE/BSE). You combine fundamental analysis, technical analysis, "
        "and news sentiment to make investment decisions. "
        "You always respond with valid JSON only — no markdown, no explanation, no preamble."
    )

    user_prompt = f"""Today: {today}
Stock: {company_name} ({symbol} NSE)
CMP: {cmp_str}

═══════════════════════════════════════════
TECHNICAL ANALYSIS
═══════════════════════════════════════════
Composite Score:    {score}/30 (Grade: {grade})
Strength:           {strength}
Dow Theory:         Primary {dow_primary} | Signal: {dow_signal}
RSI:                {rsi}
MACD:               {macd_signal}
Multi-TF Alignment: {mtf_alignment}
Entry Price:        {entry_s}
Stop Loss:          {sl_s}
Target 1:           {t1_s}
Target 2:           {t2_s}

═══════════════════════════════════════════
FUNDAMENTAL ANALYSIS
═══════════════════════════════════════════
Market Cap:         {market_cap or 'N/A'}
PE Ratio:           {pe_ratio or 'N/A'}
PB Ratio:           {pb_ratio or 'N/A'}
ROE:                {roe or 'N/A'}%
Debt/Equity:        {debt_equity or 'N/A'}
Profit Margin:      {profit_margin or 'N/A'}%
EPS:                ₹{eps or 'N/A'}
Dividend Yield:     {dividend_yield or 'N/A'}%
Revenue Growth YoY: {revenue_growth_yoy or 'N/A'}%
Profit Growth YoY:  {profit_growth_yoy or 'N/A'}%
Last Quarter:       {last_quarter_profit or 'N/A'} ({last_quarter_trend or 'N/A'})

═══════════════════════════════════════════
NEWS & SENTIMENT
═══════════════════════════════════════════
VADER Score:        {vader_score or 'N/A'}/10 ({vader_sentiment or 'N/A'})
AI News Score:      {gemini_news_score or 'N/A'}/10 ({gemini_news_sentiment or 'N/A'})
News Summary:       {news_summary or 'N/A'}
Positive News:
{pos_news or '  None'}
Negative News:
{neg_news or '  None'}

═══════════════════════════════════════════
RISK FACTORS
═══════════════════════════════════════════
Overall Risk Level:  {risk_level or 'N/A'}
High Severity Risks: {high_risks}
{risk_str or '  None identified'}

═══════════════════════════════════════════
YOUR TASK
═══════════════════════════════════════════
Based on ALL the above data, provide a comprehensive investment decision.
Return ONLY valid JSON (no markdown, no extra text):
{{
  "verdict": "STRONG_BUY" | "BUY" | "BUY_ON_DIP" | "HOLD" | "AVOID" | "STRONG_AVOID",
  "confidence": <0-100>,
  "timeframe": "1-2 weeks" | "2-4 weeks" | "1-3 months" | "3-6 months",
  "one_liner": "Single sentence verdict",
  "reasoning": "3-4 paragraph detailed analysis",
  "action_plan": {{
    "entry_strategy":  "How and when to enter",
    "entry_price":     {entry_num},
    "sl_price":        {sl_num},
    "sl_reasoning":    "Why this SL level makes sense",
    "t1_price":        {t1_num},
    "t2_price":        {t2_num},
    "position_sizing": "Full / Half position recommendation",
    "exit_strategy":   "When and how to exit"
  }},
  "bull_case": ["Reason 1", "Reason 2", "Reason 3"],
  "bear_case": ["Risk 1", "Risk 2", "Risk 3"],
  "fundamental_view":    "STRONG" | "MODERATE" | "WEAK" | "MIXED",
  "fundamental_comment": "2-3 sentences on fundamentals",
  "technical_view":      "BULLISH" | "NEUTRAL" | "BEARISH",
  "technical_comment":   "2-3 sentences on technicals",
  "news_view":           "POSITIVE" | "NEUTRAL" | "NEGATIVE" | "MIXED",
  "news_comment":        "2-3 sentences on news flow",
  "key_triggers":        ["Catalyst 1", "Catalyst 2"],
  "comparable_stocks":   ["Stock 1", "Stock 2"],
  "sector_view":         "Brief sector view",
  "red_flags":           ["Serious concern 1"],
  "overall_score":       <0-100>
}}
"""

    response = _call_groq(api_key, system_prompt, user_prompt, model_name)

    if response.startswith("__ERROR__"):
        return {
            "error":       response,
            "verdict":     "UNKNOWN",
            "confidence":  0,
            "one_liner":   f"Groq error: {response}",
            "reasoning":   "",
            "action_plan": {},
            "bull_case":   [],
            "bear_case":   [],
            "source":      "groq",
            "timestamp":   today,
        }

    data = _extract_json(response)

    if not data:
        return {
            "error":       "Could not parse Groq response",
            "raw":         response[:800],
            "verdict":     "UNKNOWN",
            "confidence":  0,
            "one_liner":   "Parse error — see raw response",
            "reasoning":   response[:400],
            "action_plan": {},
            "bull_case":   [],
            "bear_case":   [],
            "source":      "groq",
            "timestamp":   today,
        }

    # Defaults
    data.setdefault("verdict",             "HOLD")
    data.setdefault("confidence",          50)
    data.setdefault("timeframe",           "2-4 weeks")
    data.setdefault("one_liner",           "")
    data.setdefault("reasoning",           "")
    data.setdefault("bull_case",           [])
    data.setdefault("bear_case",           [])
    data.setdefault("action_plan",         {})
    data.setdefault("red_flags",           [])
    data.setdefault("key_triggers",        [])
    data.setdefault("comparable_stocks",   [])
    data.setdefault("sector_view",         "")
    data.setdefault("fundamental_view",    "MIXED")
    data.setdefault("fundamental_comment", "")
    data.setdefault("technical_view",      "NEUTRAL")
    data.setdefault("technical_comment",   "")
    data.setdefault("news_view",           "NEUTRAL")
    data.setdefault("news_comment",        "")
    data.setdefault("overall_score",       50)
    data["source"]    = "groq"
    data["timestamp"] = today

    return data





