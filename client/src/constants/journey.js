// Single shared source of truth for FinScope user journeys, how-it-works steps, and compliance disclaimers.

export const ENTRY_PATHS = [
  {
    id: "filter",
    code: "A",
    title: "No idea what to buy",
    description: "User sets filters (sector, grade, RSI/EMA, pattern); the app applies them to the scan data and returns a short list of stocks.",
    cta: "TRY FILTER SCAN",
    demoUrl: "/demo/scan",
    liveUrl: "/fullscan",
    icon: "Filter"
  },
  {
    id: "recommendations",
    code: "B",
    title: "Pick from recommendations",
    description: "Opens the Recommendations page with active and past algorithmic trade setups.",
    cta: "VIEW RECOMMENDATIONS",
    demoUrl: "/demo/recommendations",
    liveUrl: "/recommendations",
    icon: "TrendingUp"
  },
  {
    id: "search",
    code: "C",
    title: "Search a specific stock",
    description: "Opens that stock's detail page: AI summary, fundamentals, entry setups, patterns, and risk planning.",
    cta: "EXPLORE DEMO STOCK",
    demoUrl: "/demo/stock",
    liveUrl: "/analyse/SUNPHARMA",
    icon: "Search"
  }
];

export const JOURNEY_STEPS = [
  {
    step: 1,
    number: "01",
    title: "Discover",
    description: "Filter the market by sector, grade, RSI/EMA and patterns, pick from recommendations, or search any stock.",
    cta: "Try it",
    demoUrl: "/demo/scan",
    liveUrl: "/fullscan",
    targetTab: null,
    icon: "Compass"
  },
  {
    step: 2,
    number: "02",
    title: "Understand",
    description: "See an AI summary, fundamentals, news and entry setups based on patterns and indicators.",
    cta: "Try it",
    demoUrl: "/demo/stock",
    liveUrl: "/analyse/SUNPHARMA",
    targetTab: "Overview",
    icon: "Brain"
  },
  {
    step: 3,
    number: "03",
    title: "Validate",
    description: "Check how this grade and pattern performed historically: win rate, average return, and how price moved after entry.",
    cta: "Try it",
    demoUrl: "/demo/backtest",
    liveUrl: "/backtest",
    targetTab: "Backtest",
    icon: "History"
  },
  {
    step: 4,
    number: "04",
    title: "Manage risk",
    description: "Plan stop-loss, targets and position size before you buy.",
    cta: "Try it",
    demoUrl: "/demo/stock?tab=Trade+Setup",
    liveUrl: "/analyse/SUNPHARMA?tab=Trade+Setup",
    targetTab: "Trade Setup",
    icon: "ShieldAlert"
  }
];

export const UNDER_THE_HOOD =
  "Scans ~1,000 NSE stocks, rule-based grading, backtested on 90,000+ historical trades, AI summaries from live indicators, patterns, fundamentals and news.";

export const DISCLAIMER = "Sample data only, not investment advice.";

