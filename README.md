Stock analyser App

 # FinScope 

FinScope is an automated quantitative trading platform designed to scan, analyze, and backtest over 1,000+ active NSE equities. The application features a dark-themed terminal UI and leverages a high-performance dual-backend architecture to process intensive calculation loads smoothly.

---

##  Key Core Workflows
To deliver sub-second response times, the platform freezes features around three explicit processing tracks:
1. **Full Market Scanner:** Filters the entire NSE universe using technical variables, volume multipliers, and financial health scores.
2. **AI Analysis Engine:** Streams consolidated stock variables to LLMs via Groq to generate executive decision checklists.
3. **Historical Backtester:** Evaluates execution parameters across 15 to 20 years of daily candlestick charts to calculate win ratios, MFE, and MAE parameters.

---

##  System Architecture & Data Flow

┌───────────────┐│  React Client │ (Tailwind CSS & Material-UI Layouts)└───────┬───────┘│ REST JSON API┌───────▼───────┐│  Node.js API  │ ── [ MongoDB ] (User Profiles & Watchlists)└───────┬───────┘│ Inter-Process Communication┌───────▼───────┐│  FastAPI Core │ ── [ Redis Cache ] (Full Market Data & Ticker Sync)└───────┬───────┘▼[ yfinance / NSE Engine ]


### ⚙️ Technology Stack Specifications
* **Frontend:** React, Tailwind CSS, Material-UI layout controls.
* **Middleware Orchestrator:** Node.js, Express, Mongoose ODM.
* **Analytical Processing Core:** Python 3.10, FastAPI, Pandas, NumPy.
* **Persistent Data Layer:** MongoDB Atlas (User data, Auth tokens, Watchlists, Trade logs).
* **Caching & Performance Layer:** Redis (In-memory cache for full NSE scanning arrays and stock details).

---

## 💻 Application Map & Features

### 1. Gateway & Authentication
* **Landing Page:** Features a clear value proposition, an interactive static scan simulation component, and a single main Call-To-Action button.
* **Authentication Portal:** Clean login and sign-up pages to protect personal workspace preferences.

### 2. Main Terminal Dashboard (Home Page)
* **Smart App Header:** Houses a master search bar to look up symbols, dynamic navigation tabs, a dropdown tools menu, and a global watchlist tracker.
* **Market Today Block:** Displays active pricing indexes for major indices (like Nifty 50) and the India VIX volatility matrix.
* **Technical Indicators Block:** Groups active equity metrics filtered by RSI, MACD, and SMA (loads a Bullish RSI crossover check by default).
* **Trading Signals Block:** Monitors the live market to instantly isolate equities forming active candlestick patterns.
* **System Recommendations Block:** Previews the top 5 high-grade alpha trade targets picked by the system's algorithm.
* **Sector Rotation Block:** Compares sectoral percentage moves against Nifty index data across a 20-day and 6-month historical track.

### 3. Granular Stock Details View
* **Stock Overview:** Houses Dow Theory status readings, market regime filters, indicator readings, and a quick-buy button.
* **AI Analysis Tab:** Leverages Groq to compile narrative summaries across fundamentals, news sentiment logs, and technical trends.
* **Fundamentals Tab:** Houses valuation ratio tables alongside corporate annual balance sheets and dividend distributions.
* **Trade Setup Tab:** Displays structured price calculations for target entries, stop losses, and target boundaries.
* **Patterns Tab:** Isolates and highlights candlestick pattern records found on the selected stock chart.

---

## 🔬 Computational Tool Pipelines

### Full Scan Pipeline
* Pulls cached real-time market data instantly from the local **Redis** instance to evaluate roughly 1,000 active NSE equities simultaneously.
* Filters the market based on chosen sector metrics, volume rules, technical levels, and custom financial grades.

### Backtest Engine Pipeline
* Runs strategy criteria (Symbol tracking, Hard Stop Losses, Profit Objectives, Financial Grade minimum limits) on historical price datasets.
* Renders clear analytics models, including Model Accuracy, Hit Ratios, Maximum Favorable Excursion (MFE), Maximum Adverse Excursion (MAE), and Grade-Wise accuracy profiles.

---

##  Engineering Highlights
* **Redis Latency Optimization:** Reduces API fetch bottlenecks from 1.2+ seconds down to **124ms** by intercepting repeating data requests before they hit third-party servers like `yfinance`.
* **Isolated Microservices Architecture:** Separates heavy data processing routines (Python) from client state rules (Node.js). This ensures computing tasks do not freeze user data access or session handlers.

---

## 🛠️ Local Environment Initialization Setup

cd finScope
./start.sh

### 1. Initialize Python Analytics Service
```bash
cd scanner


pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### 2. Launch Node.js Middleware Proxy
```bash
cd server
npm install
npm run dev
```

### 3. Fire Up React Terminal Instance
```bash
cd client
npm install
npm start
```

