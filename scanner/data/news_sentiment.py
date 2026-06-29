"""
news_sentiment.py — Stock News Fetcher + VADER Sentiment Analyser
==================================================================
Fetches real NSE stock news from free RSS feeds:
  - Yahoo Finance RSS
  - Google News RSS
  - Economic Times RSS

Analyses sentiment using VADER (Valence Aware Dictionary and Sentiment Reasoner):
  pip install vaderSentiment

VADER is perfect for financial headlines:
  - Works offline, no API key
  - Tuned for short texts (headlines)
  - Compound score: -1.0 (most negative) to +1.0 (most positive)
  - Fast: processes thousands of headlines per second

Extra financial keyword booster added on top of VADER to handle
Indian market terms like "NSE", "results beat", "dividend", "buyback", etc.
"""

import re
import requests
import urllib.parse
from xml.etree import ElementTree as ET
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer


# ─────────────────────────────────────────────────────────────────────────────
# FINANCIAL KEYWORD BOOSTERS
# Applied on top of VADER to catch domain-specific terms VADER may miss
# ─────────────────────────────────────────────────────────────────────────────

POSITIVE_KEYWORDS = {
    # Earnings / Results
    "beat estimates": +0.4, "beats estimates": +0.4, "record profit": +0.5,
    "profit jumps": +0.4, "profit rises": +0.3, "revenue growth": +0.3,
    "strong results": +0.4, "quarterly beat": +0.4, "earnings beat": +0.4,
    "net profit up": +0.4, "net profit rises": +0.3, "ebitda up": +0.3,
    "margin expansion": +0.3, "margins improve": +0.3, "order win": +0.3,
    "order book": +0.2, "order inflow": +0.3, "large order": +0.3,

    # Corporate Actions
    "dividend declared": +0.4, "dividend announced": +0.3, "bonus shares": +0.3,
    "buyback": +0.3, "share buyback": +0.3, "stock split": +0.2,
    "rights issue": +0.1, "promoter buying": +0.4, "promoter increases stake": +0.4,

    # Business Growth
    "expansion": +0.2, "new plant": +0.2, "capex": +0.1, "capacity addition": +0.2,
    "new product": +0.2, "launches": +0.1, "partnership": +0.2, "joint venture": +0.2,
    "contract win": +0.4, "wins contract": +0.4, "export order": +0.3,
    "market share gains": +0.3, "outperforms": +0.3,

    # Analyst / Rating
    "buy rating": +0.4, "upgrade": +0.4, "target raised": +0.4,
    "overweight": +0.3, "outperform": +0.3, "strong buy": +0.5,
    "price target increase": +0.4, "bullish": +0.3,

    # Market / Index
    "rally": +0.2, "gains": +0.1, "surges": +0.3, "jumps": +0.2,
    "52-week high": +0.4, "all-time high": +0.5, "breakout": +0.3,
    "fii buying": +0.3, "dii buying": +0.3, "institutional buying": +0.3,

    # Indian Market Specific
    "sebi approves": +0.2, "rbi rate cut": +0.3, "gst reduction": +0.2,
    "pli scheme": +0.2, "government order": +0.3, "defence order": +0.4,
    "railway contract": +0.3, "nifty 50 addition": +0.4,
}

NEGATIVE_KEYWORDS = {
    # Earnings / Results
    "misses estimates": -0.4, "miss estimates": -0.4, "profit falls": -0.4,
    "profit drops": -0.4, "revenue decline": -0.3, "weak results": -0.4,
    "quarterly miss": -0.4, "earnings miss": -0.4, "net loss": -0.5,
    "net profit down": -0.4, "margin pressure": -0.3, "margins shrink": -0.3,
    "write-off": -0.4, "impairment": -0.3, "provisions rise": -0.3,

    # Corporate Issues
    "promoter selling": -0.4, "promoter pledging": -0.3, "pledge increase": -0.3,
    "insider selling": -0.3, "block deal": -0.1, "stake sale": -0.2,

    # Regulatory / Legal
    "sebi action": -0.5, "sebi notice": -0.4, "fir filed": -0.5,
    "fraud": -0.6, "scam": -0.6, "cheating": -0.5, "ED raid": -0.5,
    "income tax raid": -0.4, "gst notice": -0.3, "penalty": -0.3,
    "fine imposed": -0.3, "ban": -0.3, "suspended": -0.3,
    "court order against": -0.4, "nclat": -0.3, "insolvency": -0.5,
    "default": -0.5, "npa": -0.3, "downgrade": -0.4,

    # Business Problems
    "plant shutdown": -0.4, "factory fire": -0.4, "recall": -0.3,
    "supply disruption": -0.3, "demand slowdown": -0.3, "slowdown": -0.2,
    "inventory buildup": -0.2, "debt rises": -0.3, "leverage increases": -0.3,
    "cash crunch": -0.4, "liquidity concerns": -0.4,

    # Analyst / Rating
    "sell rating": -0.4, "downgrade": -0.4, "target cut": -0.4,
    "underperform": -0.3, "underweight": -0.3, "bearish": -0.3,
    "price target decrease": -0.4, "avoid": -0.3,

    # Market / Macro
    "crash": -0.5, "falls": -0.2, "drops": -0.2, "tanks": -0.4,
    "plunges": -0.4, "52-week low": -0.4, "circuit breaker": -0.3,
    "fii selling": -0.3, "inflation concern": -0.2, "rate hike": -0.2,
    "recession": -0.4, "slowdown": -0.3,

    # Indian Market Specific
    "sebi ban": -0.5, "rbi action": -0.3, "customs duty hike": -0.3,
    "demonetization": -0.4, "nifty 50 exclusion": -0.4,
}

# Category classifier keywords
CATEGORY_KEYWORDS = {
    "Earnings":    ["profit", "revenue", "results", "quarterly", "ebitda", "earnings",
                    "margin", "net income", "sales", "turnover", "q1", "q2", "q3", "q4"],
    "Management":  ["ceo", "cfo", "md", "chairman", "director", "resign", "appoints",
                    "management", "leadership", "board"],
    "Regulatory":  ["sebi", "rbi", "nclat", "court", "penalty", "fine", "notice",
                    "compliance", "regulation", "government", "ministry", "policy"],
    "Macro":       ["inflation", "gdp", "interest rate", "rbi rate", "fed", "economy",
                    "budget", "fiscal", "monetary", "recession", "growth"],
    "Analyst":     ["target", "rating", "upgrade", "downgrade", "buy", "sell", "hold",
                    "overweight", "underweight", "initiates", "coverage"],
    "Product":     ["launch", "product", "new model", "patent", "technology", "r&d",
                    "innovation", "new plant", "capacity"],
    "Legal":       ["fraud", "scam", "fir", "arrest", "investigation", "probe",
                    "lawsuit", "litigation", "ed", "cbi", "it raid"],
    "Sector":      ["sector", "industry", "competition", "market share", "peers",
                    "import", "export", "commodity", "crude"],
}


# ─────────────────────────────────────────────────────────────────────────────
# VADER ANALYSER SETUP
# ─────────────────────────────────────────────────────────────────────────────

try:
    _analyser = SentimentIntensityAnalyzer()
    VADER_AVAILABLE = True
except Exception:
    _analyser = None
    VADER_AVAILABLE = False


def _boost_score(text: str) -> float:
    """
    Apply financial keyword boosters to the VADER compound score.
    Returns an adjustment value (-1 to +1).
    """
    text_lower = text.lower()
    boost = 0.0
    for kw, val in POSITIVE_KEYWORDS.items():
        if kw in text_lower:
            boost += val
    for kw, val in NEGATIVE_KEYWORDS.items():
        if kw in text_lower:
            boost += val  # already negative
    return max(-1.0, min(1.0, boost))  # clamp to [-1, 1]


def _classify_category(text: str) -> str:
    """Classify news into a category based on keyword matching."""
    text_lower = text.lower()
    scores = {}
    for cat, keywords in CATEGORY_KEYWORDS.items():
        scores[cat] = sum(1 for kw in keywords if kw in text_lower)
    best = max(scores, key=scores.get)
    return best if scores[best] > 0 else "Other"


def _sentiment_label(compound: float) -> str:
    """Convert VADER compound score to label."""
    if compound >= 0.05:
        return "POSITIVE"
    elif compound <= -0.05:
        return "NEGATIVE"
    else:
        return "NEUTRAL"


def _impact_score(compound: float, boost: float) -> int:
    """
    Convert compound + boost to 1-10 impact score.
    Measures how much the news is likely to MOVE the stock.
    """
    combined = abs(compound) + abs(boost) * 0.5
    score = int(combined * 10)
    return max(1, min(10, score))


def analyse_article(title: str, summary: str = "") -> dict:
    """
    Analyse a single article using VADER + financial keyword booster.
    Returns sentiment label, compound score, impact, category.
    """
    text = (title + " " + summary).strip()

    if VADER_AVAILABLE and _analyser:
        scores  = _analyser.polarity_scores(text)
        compound = scores["compound"]
    else:
        compound = 0.0

    boost    = _boost_score(text)
    # Final score = 60% VADER + 40% financial booster
    final    = compound * 0.6 + boost * 0.4
    final    = max(-1.0, min(1.0, final))

    sentiment = _sentiment_label(final)
    impact    = _impact_score(final, boost)
    category  = _classify_category(text)

    # Build human reason
    triggered_pos = [kw for kw in POSITIVE_KEYWORDS if kw in text.lower()]
    triggered_neg = [kw for kw in NEGATIVE_KEYWORDS if kw in text.lower()]

    if triggered_pos:
        reason = f"Positive signals: {', '.join(triggered_pos[:3])}."
    elif triggered_neg:
        reason = f"Negative signals: {', '.join(triggered_neg[:3])}."
    elif final > 0.1:
        reason = "Positive tone detected in headline language."
    elif final < -0.1:
        reason = "Negative tone detected in headline language."
    else:
        reason = "Neutral / informational news, limited price impact expected."

    return {
        "sentiment":       sentiment,
        "compound":        round(final, 3),
        "vader_compound":  round(compound, 3),
        "boost":           round(boost, 3),
        "impact":          impact,
        "category":        category,
        "reason":          reason,
    }


# ─────────────────────────────────────────────────────────────────────────────
# NEWS FETCHERS
# ─────────────────────────────────────────────────────────────────────────────

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/120.0.0.0 Safari/537.36"
    )
}


def _parse_rss(url: str, source_name: str, max_items: int = 12) -> list:
    """Generic RSS parser — used by all fetchers."""
    articles = []
    try:
        resp = requests.get(url, headers=HEADERS, timeout=8)
        if resp.status_code != 200:
            return []
        root = ET.fromstring(resp.content)
        for item in root.findall(".//item")[:max_items]:
            title   = (item.findtext("title") or "").strip()
            link    = (item.findtext("link")  or "").strip()
            pubdate = (item.findtext("pubDate") or "")[:16]
            desc    = re.sub(r'<[^>]+>', '', item.findtext("description") or "")[:200]
            src_el  = item.find("source")
            source  = src_el.text if src_el is not None else source_name
            if title:
                articles.append({
                    "title":   title,
                    "summary": desc.strip(),
                    "link":    link,
                    "date":    pubdate,
                    "source":  source,
                })
    except Exception:
        pass
    return articles


def fetch_yahoo_news(symbol: str, max_items: int = 12) -> list:
    articles = []
    for sym in [symbol + ".NS", symbol + ".BO"]:
        url = (f"https://feeds.finance.yahoo.com/rss/2.0/headline"
               f"?s={sym}&region=IN&lang=en-IN")
        result = _parse_rss(url, "Yahoo Finance", max_items)
        if result:
            articles.extend(result)
            break
    return articles


def fetch_google_news(symbol: str, company_name: str = "",
                      max_items: int = 10) -> list:
    articles = []
    queries = []
    if company_name:
        queries.append(f"{company_name} NSE stock India")
    queries.append(f"{symbol} NSE share India")

    for q in queries[:2]:
        enc = urllib.parse.quote(q)
        url = (f"https://news.google.com/rss/search"
               f"?q={enc}&hl=en-IN&gl=IN&ceid=IN:en")
        result = _parse_rss(url, "Google News", max_items)
        for a in result:
            if a["title"] not in [x["title"] for x in articles]:
                articles.append(a)
        if len(articles) >= max_items:
            break
    return articles


def fetch_economic_times_news(symbol: str, max_items: int = 8) -> list:
    url = f"https://economictimes.indiatimes.com/markets/stocks/rssfeeds/{symbol}.cms"
    return _parse_rss(url, "Economic Times", max_items)


def fetch_moneycontrol_news(symbol: str, max_items: int = 8) -> list:
    """Moneycontrol RSS for Indian market news."""
    # Moneycontrol search RSS
    enc = urllib.parse.quote(symbol + " stock NSE")
    url = f"https://www.moneycontrol.com/rss/latestnews.xml"
    return _parse_rss(url, "Moneycontrol", max_items)


def fetch_all_news(symbol: str, company_name: str = "",
                   max_total: int = 25) -> list:
    """Fetch from all sources, deduplicate by title."""
    all_articles = []
    seen = set()

    for fetcher, args in [
        (fetch_yahoo_news,         (symbol,)),
        (fetch_google_news,        (symbol, company_name)),
        (fetch_economic_times_news,(symbol,)),
        (fetch_moneycontrol_news,  (symbol,)),
    ]:
        try:
            for a in fetcher(*args):
                norm = re.sub(r'[^a-z0-9]', '', a["title"].lower())[:50]
                if norm not in seen:
                    seen.add(norm)
                    all_articles.append(a)
        except Exception:
            pass

    return all_articles[:max_total]


# ─────────────────────────────────────────────────────────────────────────────
# OVERALL SUMMARY
# ─────────────────────────────────────────────────────────────────────────────

def _overall_summary(articles_with_sentiment: list,
                     symbol: str, company_name: str) -> dict:
    """
    Compute overall sentiment stats from all analysed articles.
    Returns overall_sentiment, score, summary text, recommendation.
    """
    if not articles_with_sentiment:
        return {
            "overall_sentiment": "UNKNOWN",
            "overall_score":     0.0,
            "overall_summary":   "No news found.",
            "key_themes":        [],
            "risk_factors":      [],
            "catalysts":         [],
            "recommendation":    "WATCH",
        }

    pos = [a for a in articles_with_sentiment if a["sentiment"] == "POSITIVE"]
    neg = [a for a in articles_with_sentiment if a["sentiment"] == "NEGATIVE"]
    neu = [a for a in articles_with_sentiment if a["sentiment"] == "NEUTRAL"]

    # Weighted average compound score (weight by impact)
    total_impact = sum(a["impact"] for a in articles_with_sentiment)
    if total_impact > 0:
        avg_compound = sum(
            a["compound"] * a["impact"]
            for a in articles_with_sentiment
        ) / total_impact
    else:
        avg_compound = 0.0

    # Scale to -10 to +10
    overall_score = round(avg_compound * 10, 1)

    # Overall sentiment label
    n_pos, n_neg, n_neu = len(pos), len(neg), len(neu)
    total = len(articles_with_sentiment)

    if n_pos > n_neg * 1.5:
        overall_sentiment = "POSITIVE"
    elif n_neg > n_pos * 1.5:
        overall_sentiment = "NEGATIVE"
    elif abs(n_pos - n_neg) <= 1:
        overall_sentiment = "MIXED" if (n_pos + n_neg) > 2 else "NEUTRAL"
    else:
        overall_sentiment = "POSITIVE" if n_pos > n_neg else "NEGATIVE"

    # Key themes from top impact articles
    top_articles = sorted(articles_with_sentiment,
                          key=lambda x: x["impact"], reverse=True)[:5]
    key_themes = list({a["category"] for a in top_articles})[:4]

    # Catalysts = top positive articles titles (shortened)
    catalysts = [a["title"][:60] + "..." if len(a["title"]) > 60
                 else a["title"] for a in sorted(pos, key=lambda x: x["impact"],
                 reverse=True)[:3]]

    # Risk factors = top negative articles
    risk_factors = [a["title"][:60] + "..." if len(a["title"]) > 60
                    else a["title"] for a in sorted(neg, key=lambda x: x["impact"],
                    reverse=True)[:3]]

    # Summary text
    summary = (
        f"Analysed {total} articles for {company_name} ({symbol}). "
        f"{n_pos} positive, {n_neg} negative, {n_neu} neutral. "
    )
    if overall_sentiment == "POSITIVE":
        summary += f"News flow is predominantly bullish with AI score {overall_score:+.1f}/10."
    elif overall_sentiment == "NEGATIVE":
        summary += f"News flow is predominantly bearish with AI score {overall_score:+.1f}/10. Exercise caution."
    elif overall_sentiment == "MIXED":
        summary += f"Mixed news — weigh positive catalysts against risk factors before trading."
    else:
        summary += f"Neutral news flow. No strong directional signal from news."

    # Recommendation
    if overall_score >= 4.0:
        recommendation = "STRONG_BUY"
    elif overall_score >= 2.0:
        recommendation = "BUY_ON_DIP"
    elif overall_score >= -1.0:
        recommendation = "HOLD"
    elif overall_score >= -3.0:
        recommendation = "WATCH"
    else:
        recommendation = "AVOID"

    return {
        "overall_sentiment": overall_sentiment,
        "overall_score":     overall_score,
        "overall_summary":   summary,
        "key_themes":        key_themes,
        "risk_factors":      risk_factors,
        "catalysts":         catalysts,
        "recommendation":    recommendation,
    }


# ─────────────────────────────────────────────────────────────────────────────
# MASTER FUNCTION
# ─────────────────────────────────────────────────────────────────────────────

def get_news_sentiment(symbol: str, company_name: str = "") -> dict:
    """
    Full pipeline:
    1. Fetch news from Yahoo Finance, Google News, ET, Moneycontrol
    2. Analyse each with VADER + financial keyword booster
    3. Classify into POSITIVE / NEGATIVE / NEUTRAL
    4. Return structured result for Streamlit UI

    Returns:
        {
          "positive":          [...],
          "negative":          [...],
          "neutral":           [...],
          "overall_sentiment": "POSITIVE"|"NEGATIVE"|"NEUTRAL"|"MIXED",
          "overall_score":     -10.0 to +10.0,
          "overall_summary":   "...",
          "key_themes":        [...],
          "risk_factors":      [...],
          "catalysts":         [...],
          "recommendation":    "STRONG_BUY"|"BUY_ON_DIP"|"HOLD"|"WATCH"|"AVOID",
          "total_articles":    n,
          "articles":          [...all articles with sentiment],
          "vader_available":   True/False,
          "error":             "",
        }
    """
    if not company_name:
        company_name = symbol

    # Step 1: Fetch
    raw = fetch_all_news(symbol, company_name, max_total=25)

    if not raw:
        return {
            "positive": [], "negative": [], "neutral": [],
            "overall_sentiment": "UNKNOWN",
            "overall_score":     0.0,
            "overall_summary":   f"No news found for {symbol}. Try again later.",
            "key_themes":        [],
            "risk_factors":      [],
            "catalysts":         [],
            "recommendation":    "WATCH",
            "total_articles":    0,
            "articles":          [],
            "vader_available":   VADER_AVAILABLE,
            "error":             f"No news articles found for {symbol}",
        }

    # Step 2: Analyse each article
    analysed = []
    for art in raw:
        result = analyse_article(art["title"], art.get("summary", ""))
        merged = {**art, **result}
        analysed.append(merged)

    # Step 3: Sort by impact
    analysed.sort(key=lambda x: x["impact"], reverse=True)

    # Step 4: Split
    positive = [a for a in analysed if a["sentiment"] == "POSITIVE"]
    negative = [a for a in analysed if a["sentiment"] == "NEGATIVE"]
    neutral  = [a for a in analysed if a["sentiment"] == "NEUTRAL"]

    # Step 5: Overall stats
    summary = _overall_summary(analysed, symbol, company_name)

    return {
        **summary,
        "positive":        positive,
        "negative":        negative,
        "neutral":         neutral,
        "total_articles":  len(analysed),
        "articles":        analysed,
        "vader_available": VADER_AVAILABLE,
        "error":           "" if VADER_AVAILABLE else "vaderSentiment not installed — run: pip install vaderSentiment",
    }



# ─────────────────────────────────────────────────────────────────────────────
# COMPANY NAMES MAP
# ─────────────────────────────────────────────────────────────────────────────

COMPANY_NAMES = {
    "RELIANCE":"Reliance Industries","TCS":"Tata Consultancy Services",
    "HDFCBANK":"HDFC Bank","INFY":"Infosys","ICICIBANK":"ICICI Bank",
    "SBIN":"State Bank of India","BAJFINANCE":"Bajaj Finance",
    "BHARTIARTL":"Bharti Airtel","ITC":"ITC Limited","KOTAKBANK":"Kotak Mahindra Bank",
    "LT":"Larsen Toubro","AXISBANK":"Axis Bank","ASIANPAINT":"Asian Paints",
    "MARUTI":"Maruti Suzuki","TITAN":"Titan Company","SUNPHARMA":"Sun Pharmaceutical",
    "WIPRO":"Wipro","ONGC":"ONGC","NTPC":"NTPC","HCLTECH":"HCL Technologies",
    "BEL":"Bharat Electronics","RVNL":"Rail Vikas Nigam","HAL":"Hindustan Aeronautics",
    "IRFC":"Indian Railway Finance","IRCTC":"IRCTC","TATAMOTORS":"Tata Motors",
    "ZOMATO":"Zomato","ADANIENT":"Adani Enterprises","ADANIPORTS":"Adani Ports",
    "BAJAJ-AUTO":"Bajaj Auto","HEROMOTOCO":"Hero MotoCorp","DRREDDY":"Dr Reddys Labs",
    "CIPLA":"Cipla","DIVISLAB":"Divis Laboratories","COALINDIA":"Coal India",
    "POWERGRID":"Power Grid Corporation","TECHM":"Tech Mahindra",
    "NESTLEIND":"Nestle India","BRITANNIA":"Britannia Industries",
    "DABUR":"Dabur India","MARICO":"Marico","COLPAL":"Colgate Palmolive",
    "HINDUNILVR":"Hindustan Unilever","EICHERMOT":"Eicher Motors",
    "HINDALCO":"Hindalco Industries","TATASTEEL":"Tata Steel","JSWSTEEL":"JSW Steel",
    "ULTRACEMCO":"UltraTech Cement","PFC":"Power Finance Corporation",
    "RECLTD":"REC Limited","NHPC":"NHPC","SJVN":"SJVN","SUZLON":"Suzlon Energy",
    "YESBANK":"Yes Bank","PNB":"Punjab National Bank","CANBK":"Canara Bank",
    "BANKBARODA":"Bank of Baroda","UNIONBANK":"Union Bank of India",
}

def get_company_name(symbol: str) -> str:
    return COMPANY_NAMES.get(symbol.upper(), symbol)
