

const patterns = {

  
  DOJI: () => (
    <svg viewBox="0 0 20 40" width="20" height="40">
      <line x1="10" y1="2"  x2="10" y2="38" stroke="#aaa" strokeWidth="1.5"/>
      <rect x="4" y="18" width="12" height="1.5" fill="#aaa" rx="0.5"/>
    </svg>
  ),

  HAMMER: () => (
    <svg viewBox="0 0 20 40" width="20" height="40">
      <line x1="10" y1="2"  x2="10" y2="10" stroke="#3dd68c" strokeWidth="1.5"/>
      <rect x="4" y="10" width="12" height="8"  fill="#3dd68c" rx="1"/>
      <line x1="10" y1="18" x2="10" y2="38" stroke="#3dd68c" strokeWidth="1.5"/>
    </svg>
  ),

  HANGING_MAN: () => (
    <svg viewBox="0 0 20 40" width="20" height="40">
      <line x1="10" y1="2"  x2="10" y2="10" stroke="#f75f5f" strokeWidth="1.5"/>
      <rect x="4" y="10" width="12" height="8"  fill="#f75f5f" rx="1"/>
      <line x1="10" y1="18" x2="10" y2="38" stroke="#f75f5f" strokeWidth="1.5"/>
    </svg>
  ),

  SHOOTING_STAR: () => (
    <svg viewBox="0 0 20 40" width="20" height="40">
      <line x1="10" y1="2"  x2="10" y2="22" stroke="#f75f5f" strokeWidth="1.5"/>
      <rect x="4" y="22" width="12" height="8"  fill="#f75f5f" rx="1"/>
      <line x1="10" y1="30" x2="10" y2="34" stroke="#f75f5f" strokeWidth="1.5"/>
    </svg>
  ),

  INVERTED_HAMMER: () => (
    <svg viewBox="0 0 20 40" width="20" height="40">
      <line x1="10" y1="2"  x2="10" y2="22" stroke="#3dd68c" strokeWidth="1.5"/>
      <rect x="4" y="22" width="12" height="8"  fill="#3dd68c" rx="1"/>
      <line x1="10" y1="30" x2="10" y2="34" stroke="#3dd68c" strokeWidth="1.5"/>
    </svg>
  ),

  MARUBOZU: () => (
    <svg viewBox="0 0 20 40" width="20" height="40">
      <rect x="4" y="6" width="12" height="28" fill="#3dd68c" rx="1"/>
    </svg>
  ),

  // ── Two Bar ───────────────────────────────────────────────────────────────

  BULLISH_ENGULFING: () => (
    <svg viewBox="0 0 28 40" width="28" height="40">
      {/* First candle — small red */}
      <line x1="7"  y1="10" x2="7"  y2="14" stroke="#f75f5f" strokeWidth="1.5"/>
      <rect x="3"  y="14" width="8" height="12" fill="#f75f5f" rx="1"/>
      <line x1="7"  y1="26" x2="7"  y2="30" stroke="#f75f5f" strokeWidth="1.5"/>
      {/* Second candle — large green engulfing */}
      <line x1="21" y1="6"  x2="21" y2="10" stroke="#3dd68c" strokeWidth="1.5"/>
      <rect x="17" y="10" width="8" height="24" fill="#3dd68c" rx="1"/>
      <line x1="21" y1="34" x2="21" y2="38" stroke="#3dd68c" strokeWidth="1.5"/>
    </svg>
  ),

  BEARISH_ENGULFING: () => (
    <svg viewBox="0 0 28 40" width="28" height="40">
      {/* First candle — small green */}
      <line x1="7"  y1="10" x2="7"  y2="14" stroke="#3dd68c" strokeWidth="1.5"/>
      <rect x="3"  y="14" width="8" height="12" fill="#3dd68c" rx="1"/>
      <line x1="7"  y1="26" x2="7"  y2="30" stroke="#3dd68c" strokeWidth="1.5"/>
      {/* Second candle — large red engulfing */}
      <line x1="21" y1="6"  x2="21" y2="10" stroke="#f75f5f" strokeWidth="1.5"/>
      <rect x="17" y="10" width="8" height="24" fill="#f75f5f" rx="1"/>
      <line x1="21" y1="34" x2="21" y2="38" stroke="#f75f5f" strokeWidth="1.5"/>
    </svg>
  ),

  BULLISH_HARAMI: () => (
    <svg viewBox="0 0 28 40" width="28" height="40">
      {/* First candle — large red */}
      <line x1="7"  y1="4"  x2="7"  y2="8"  stroke="#f75f5f" strokeWidth="1.5"/>
      <rect x="3"  y="8"  width="8" height="26" fill="#f75f5f" rx="1"/>
      <line x1="7"  y1="34" x2="7"  y2="38" stroke="#f75f5f" strokeWidth="1.5"/>
      {/* Second candle — small green inside */}
      <line x1="21" y1="14" x2="21" y2="18" stroke="#3dd68c" strokeWidth="1.5"/>
      <rect x="17" y="18" width="8" height="10" fill="#3dd68c" rx="1"/>
      <line x1="21" y1="28" x2="21" y2="32" stroke="#3dd68c" strokeWidth="1.5"/>
    </svg>
  ),

  BEARISH_HARAMI: () => (
    <svg viewBox="0 0 28 40" width="28" height="40">
      {/* First candle — large green */}
      <line x1="7"  y1="4"  x2="7"  y2="8"  stroke="#3dd68c" strokeWidth="1.5"/>
      <rect x="3"  y="8"  width="8" height="26" fill="#3dd68c" rx="1"/>
      <line x1="7"  y1="34" x2="7"  y2="38" stroke="#3dd68c" strokeWidth="1.5"/>
      {/* Second candle — small red inside */}
      <line x1="21" y1="14" x2="21" y2="18" stroke="#f75f5f" strokeWidth="1.5"/>
      <rect x="17" y="18" width="8" height="10" fill="#f75f5f" rx="1"/>
      <line x1="21" y1="28" x2="21" y2="32" stroke="#f75f5f" strokeWidth="1.5"/>
    </svg>
  ),

  PIERCING_LINE: () => (
    <svg viewBox="0 0 28 40" width="28" height="40">
      {/* First candle — red */}
      <line x1="7"  y1="4"  x2="7"  y2="8"  stroke="#f75f5f" strokeWidth="1.5"/>
      <rect x="3"  y="8"  width="8" height="22" fill="#f75f5f" rx="1"/>
      <line x1="7"  y1="30" x2="7"  y2="36" stroke="#f75f5f" strokeWidth="1.5"/>
      {/* Second candle — green piercing midpoint */}
      <line x1="21" y1="16" x2="21" y2="20" stroke="#3dd68c" strokeWidth="1.5"/>
      <rect x="17" y="20" width="8" height="18" fill="#3dd68c" rx="1"/>
      <line x1="21" y1="38" x2="21" y2="38" stroke="#3dd68c" strokeWidth="1.5"/>
    </svg>
  ),

  DARK_CLOUD_COVER: () => (
    <svg viewBox="0 0 28 40" width="28" height="40">
      {/* First candle — green */}
      <line x1="7"  y1="4"  x2="7"  y2="8"  stroke="#3dd68c" strokeWidth="1.5"/>
      <rect x="3"  y="8"  width="8" height="22" fill="#3dd68c" rx="1"/>
      <line x1="7"  y1="30" x2="7"  y2="36" stroke="#3dd68c" strokeWidth="1.5"/>
      {/* Second candle — red covering midpoint */}
      <line x1="21" y1="4"  x2="21" y2="8"  stroke="#f75f5f" strokeWidth="1.5"/>
      <rect x="17" y="8"  width="8" height="18" fill="#f75f5f" rx="1"/>
      <line x1="21" y1="26" x2="21" y2="32" stroke="#f75f5f" strokeWidth="1.5"/>
    </svg>
  ),

  TWEEZER_TOP: () => (
    <svg viewBox="0 0 28 40" width="28" height="40">
      {/* Both candles same high */}
      <line x1="7"  y1="6"  x2="7"  y2="10" stroke="#3dd68c" strokeWidth="1.5"/>
      <rect x="3"  y="10" width="8" height="16" fill="#3dd68c" rx="1"/>
      <line x1="7"  y1="26" x2="7"  y2="30" stroke="#3dd68c" strokeWidth="1.5"/>
      <line x1="21" y1="6"  x2="21" y2="10" stroke="#f75f5f" strokeWidth="1.5"/>
      <rect x="17" y="10" width="8" height="16" fill="#f75f5f" rx="1"/>
      <line x1="21" y1="26" x2="21" y2="30" stroke="#f75f5f" strokeWidth="1.5"/>
      {/* Equal top line */}
      <line x1="3" y1="6" x2="25" y2="6" stroke="#f5a623" strokeWidth="1" strokeDasharray="2 2"/>
    </svg>
  ),

  TWEEZER_BOTTOM: () => (
    <svg viewBox="0 0 28 40" width="28" height="40">
      <line x1="7"  y1="10" x2="7"  y2="14" stroke="#f75f5f" strokeWidth="1.5"/>
      <rect x="3"  y="14" width="8" height="16" fill="#f75f5f" rx="1"/>
      <line x1="7"  y1="30" x2="7"  y2="34" stroke="#f75f5f" strokeWidth="1.5"/>
      <line x1="21" y1="10" x2="21" y2="14" stroke="#3dd68c" strokeWidth="1.5"/>
      <rect x="17" y="14" width="8" height="16" fill="#3dd68c" rx="1"/>
      <line x1="21" y1="30" x2="21" y2="34" stroke="#3dd68c" strokeWidth="1.5"/>
      {/* Equal bottom line */}
      <line x1="3" y1="34" x2="25" y2="34" stroke="#f5a623" strokeWidth="1" strokeDasharray="2 2"/>
    </svg>
  ),

  // ── Three Bar ─────────────────────────────────────────────────────────────

  MORNING_STAR: () => (
    <svg viewBox="0 0 40 40" width="40" height="40">
      {/* Bar 1 — large red */}
      <line x1="7"  y1="4"  x2="7"  y2="8"  stroke="#f75f5f" strokeWidth="1.5"/>
      <rect x="3"  y="8"  width="8" height="20" fill="#f75f5f" rx="1"/>
      <line x1="7"  y1="28" x2="7"  y2="32" stroke="#f75f5f" strokeWidth="1.5"/>
      {/* Bar 2 — small doji */}
      <line x1="20" y1="26" x2="20" y2="30" stroke="#aaa"    strokeWidth="1.5"/>
      <rect x="16" y="30" width="8" height="4"  fill="#aaa"    rx="1"/>
      <line x1="20" y1="34" x2="20" y2="38" stroke="#aaa"    strokeWidth="1.5"/>
      {/* Bar 3 — large green */}
      <line x1="33" y1="4"  x2="33" y2="8"  stroke="#3dd68c" strokeWidth="1.5"/>
      <rect x="29" y="8"  width="8" height="20" fill="#3dd68c" rx="1"/>
      <line x1="33" y1="28" x2="33" y2="32" stroke="#3dd68c" strokeWidth="1.5"/>
    </svg>
  ),

  EVENING_STAR: () => (
    <svg viewBox="0 0 40 40" width="40" height="40">
      {/* Bar 1 — large green */}
      <line x1="7"  y1="4"  x2="7"  y2="8"  stroke="#3dd68c" strokeWidth="1.5"/>
      <rect x="3"  y="8"  width="8" height="20" fill="#3dd68c" rx="1"/>
      <line x1="7"  y1="28" x2="7"  y2="32" stroke="#3dd68c" strokeWidth="1.5"/>
      {/* Bar 2 — small doji at top */}
      <line x1="20" y1="4"  x2="20" y2="8"  stroke="#aaa"    strokeWidth="1.5"/>
      <rect x="16" y="8"  width="8" height="4"  fill="#aaa"    rx="1"/>
      <line x1="20" y1="12" x2="20" y2="16" stroke="#aaa"    strokeWidth="1.5"/>
      {/* Bar 3 — large red */}
      <line x1="33" y1="4"  x2="33" y2="8"  stroke="#f75f5f" strokeWidth="1.5"/>
      <rect x="29" y="8"  width="8" height="20" fill="#f75f5f" rx="1"/>
      <line x1="33" y1="28" x2="33" y2="32" stroke="#f75f5f" strokeWidth="1.5"/>
    </svg>
  ),

  THREE_WHITE_SOLDIERS: () => (
    <svg viewBox="0 0 40 40" width="40" height="40">
      <line x1="7"  y1="22" x2="7"  y2="26" stroke="#3dd68c" strokeWidth="1.5"/>
      <rect x="3"  y="26" width="8" height="10" fill="#3dd68c" rx="1"/>
      <line x1="20" y1="14" x2="20" y2="18" stroke="#3dd68c" strokeWidth="1.5"/>
      <rect x="16" y="18" width="8" height="16" fill="#3dd68c" rx="1"/>
      <line x1="33" y1="4"  x2="33" y2="8"  stroke="#3dd68c" strokeWidth="1.5"/>
      <rect x="29" y="8"  width="8" height="24" fill="#3dd68c" rx="1"/>
    </svg>
  ),

  THREE_BLACK_CROWS: () => (
    <svg viewBox="0 0 40 40" width="40" height="40">
      <line x1="7"  y1="4"  x2="7"  y2="8"  stroke="#f75f5f" strokeWidth="1.5"/>
      <rect x="3"  y="8"  width="8" height="10" fill="#f75f5f" rx="1"/>
      <line x1="20" y1="10" x2="20" y2="14" stroke="#f75f5f" strokeWidth="1.5"/>
      <rect x="16" y="14" width="8" height="16" fill="#f75f5f" rx="1"/>
      <line x1="33" y1="18" x2="33" y2="22" stroke="#f75f5f" strokeWidth="1.5"/>
      <rect x="29" y="22" width="8" height="14" fill="#f75f5f" rx="1"/>
    </svg>
  ),

  // reversal patterns

  HEAD_AND_SHOULDERS: () => (
    <svg viewBox="0 0 60 40" width="60" height="40">
      {/* Left shoulder */}
      <polyline points="2,32 8,22 14,32" fill="none" stroke="#f75f5f" strokeWidth="1.5" strokeLinejoin="round"/>
      {/* Head */}
      <polyline points="14,32 20,10 26,32" fill="none" stroke="#f75f5f" strokeWidth="1.5" strokeLinejoin="round"/>
      {/* Right shoulder */}
      <polyline points="26,32 32,22 38,32" fill="none" stroke="#f75f5f" strokeWidth="1.5" strokeLinejoin="round"/>
      {/* Neckline */}
      <line x1="2" y1="32" x2="38" y2="32" stroke="#f5a623" strokeWidth="1" strokeDasharray="2 2"/>
      {/* Breakdown arrow */}
      <polyline points="38,32 44,32 44,38" fill="none" stroke="#f75f5f" strokeWidth="1.5" strokeLinejoin="round"/>
      <polygon points="44,38 41,34 47,34" fill="#f75f5f"/>
    </svg>
  ),

  // 2. Inverse Head & Shoulders — Bullish
  INVERSE_HEAD_AND_SHOULDERS: () => (
    <svg viewBox="0 0 60 40" width="60" height="40">
      {/* Left shoulder */}
      <polyline points="2,8 8,18 14,8"  fill="none" stroke="#3dd68c" strokeWidth="1.5" strokeLinejoin="round"/>
      {/* Head */}
      <polyline points="14,8 20,30 26,8" fill="none" stroke="#3dd68c" strokeWidth="1.5" strokeLinejoin="round"/>
      {/* Right shoulder */}
      <polyline points="26,8 32,18 38,8" fill="none" stroke="#3dd68c" strokeWidth="1.5" strokeLinejoin="round"/>
      {/* Neckline */}
      <line x1="2" y1="8" x2="38" y2="8" stroke="#f5a623" strokeWidth="1" strokeDasharray="2 2"/>
      {/* Breakout arrow */}
      <polyline points="38,8 44,8 44,2" fill="none" stroke="#3dd68c" strokeWidth="1.5" strokeLinejoin="round"/>
      <polygon points="44,2 41,6 47,6" fill="#3dd68c"/>
    </svg>
  ),

  // 3. Double Top (M pattern) — Bearish
  DOUBLE_TOP: () => (
    <svg viewBox="0 0 60 40" width="60" height="40">
      {/* M shape */}
      <polyline
        points="2,32 10,8 18,20 26,8 34,32"
        fill="none" stroke="#f75f5f" strokeWidth="1.5" strokeLinejoin="round"
      />
      {/* Neckline */}
      <line x1="2" y1="32" x2="34" y2="32" stroke="#f5a623" strokeWidth="1" strokeDasharray="2 2"/>
      {/* Breakdown arrow */}
      <polyline points="34,32 42,32 42,38" fill="none" stroke="#f75f5f" strokeWidth="1.5" strokeLinejoin="round"/>
      <polygon points="42,38 39,34 45,34" fill="#f75f5f"/>
      {/* Equal tops marker */}
      <line x1="10" y1="6" x2="26" y2="6" stroke="#f75f5f" strokeWidth="1" strokeDasharray="2 2" opacity="0.5"/>
    </svg>
  ),

  // 4. Double Bottom (W pattern) — Bullish
  DOUBLE_BOTTOM: () => (
    <svg viewBox="0 0 60 40" width="60" height="40">
      {/* W shape */}
      <polyline
        points="2,8 10,32 18,18 26,32 34,8"
        fill="none" stroke="#3dd68c" strokeWidth="1.5" strokeLinejoin="round"
      />
      {/* Neckline */}
      <line x1="2" y1="8" x2="34" y2="8" stroke="#f5a623" strokeWidth="1" strokeDasharray="2 2"/>
      {/* Breakout arrow */}
      <polyline points="34,8 42,8 42,2" fill="none" stroke="#3dd68c" strokeWidth="1.5" strokeLinejoin="round"/>
      <polygon points="42,2 39,6 45,6" fill="#3dd68c"/>
      {/* Equal bottoms marker */}
      <line x1="10" y1="34" x2="26" y2="34" stroke="#3dd68c" strokeWidth="1" strokeDasharray="2 2" opacity="0.5"/>
    </svg>
  ),

  // 5. Triple Top — Bearish
  TRIPLE_TOP: () => (
    <svg viewBox="0 0 60 40" width="60" height="40">
      {/* Three equal peaks */}
      <polyline
        points="2,32 8,10 14,32 20,10 26,32 32,10 38,32"
        fill="none" stroke="#f75f5f" strokeWidth="1.5" strokeLinejoin="round"
      />
      {/* Neckline */}
      <line x1="2" y1="32" x2="38" y2="32" stroke="#f5a623" strokeWidth="1" strokeDasharray="2 2"/>
      {/* Breakdown arrow */}
      <polyline points="38,32 46,32 46,38" fill="none" stroke="#f75f5f" strokeWidth="1.5" strokeLinejoin="round"/>
      <polygon points="46,38 43,34 49,34" fill="#f75f5f"/>
      {/* Equal tops marker */}
      <line x1="8" y1="8" x2="32" y2="8" stroke="#f75f5f" strokeWidth="1" strokeDasharray="2 2" opacity="0.5"/>
    </svg>
  ),

  // 6. Triple Bottom — Bullish
  TRIPLE_BOTTOM: () => (
    <svg viewBox="0 0 60 40" width="60" height="40">
      {/* Three equal troughs */}
      <polyline
        points="2,8 8,30 14,8 20,30 26,8 32,30 38,8"
        fill="none" stroke="#3dd68c" strokeWidth="1.5" strokeLinejoin="round"
      />
      {/* Neckline */}
      <line x1="2" y1="8" x2="38" y2="8" stroke="#f5a623" strokeWidth="1" strokeDasharray="2 2"/>
      {/* Breakout arrow */}
      <polyline points="38,8 46,8 46,2" fill="none" stroke="#3dd68c" strokeWidth="1.5" strokeLinejoin="round"/>
      <polygon points="46,2 43,6 49,6" fill="#3dd68c"/>
      {/* Equal bottoms marker */}
      <line x1="8" y1="32" x2="32" y2="32" stroke="#3dd68c" strokeWidth="1" strokeDasharray="2 2" opacity="0.5"/>
    </svg>
  ),

  BULL_FLAG: () => (
    <svg viewBox="0 0 60 40" width="60" height="40">
      {/* Flagpole — sharp move up */}
      <line x1="8" y1="36" x2="8" y2="8" stroke="#3dd68c" strokeWidth="2"/>
      {/* Flag — rectangular consolidation slightly down */}
      <polyline
        points="8,8 18,12 28,10 38,14 28,16 18,14 8,18"
        fill="none" stroke="#3dd68c" strokeWidth="1.5" strokeLinejoin="round"
      />
      {/* Flag top/bottom borders */}
      <line x1="8"  y1="8"  x2="38" y2="12" stroke="#3dd68c" strokeWidth="1" strokeDasharray="2 2" opacity="0.5"/>
      <line x1="8"  y1="18" x2="38" y2="22" stroke="#3dd68c" strokeWidth="1" strokeDasharray="2 2" opacity="0.5"/>
      {/* Breakout arrow */}
      <polyline points="38,12 46,12 46,4" fill="none" stroke="#3dd68c" strokeWidth="1.5" strokeLinejoin="round"/>
      <polygon points="46,4 43,8 49,8" fill="#3dd68c"/>
    </svg>
  ),

  // 2. Bear Flag
  BEAR_FLAG: () => (
    <svg viewBox="0 0 60 40" width="60" height="40">
      {/* Flagpole — sharp move down */}
      <line x1="8" y1="4" x2="8" y2="32" stroke="#f75f5f" strokeWidth="2"/>
      {/* Flag — rectangular consolidation slightly up */}
      <polyline
        points="8,32 18,28 28,30 38,26 28,24 18,26 8,22"
        fill="none" stroke="#f75f5f" strokeWidth="1.5" strokeLinejoin="round"
      />
      {/* Flag borders */}
      <line x1="8"  y1="22" x2="38" y2="18" stroke="#f75f5f" strokeWidth="1" strokeDasharray="2 2" opacity="0.5"/>
      <line x1="8"  y1="32" x2="38" y2="28" stroke="#f75f5f" strokeWidth="1" strokeDasharray="2 2" opacity="0.5"/>
      {/* Breakdown arrow */}
      <polyline points="38,28 46,28 46,36" fill="none" stroke="#f75f5f" strokeWidth="1.5" strokeLinejoin="round"/>
      <polygon points="46,36 43,32 49,32" fill="#f75f5f"/>
    </svg>
  ),

  // 3. Bull Pennant
  BULL_PENNANT: () => (
    <svg viewBox="0 0 60 40" width="60" height="40">
      {/* Flagpole */}
      <line x1="8" y1="36" x2="8" y2="6" stroke="#3dd68c" strokeWidth="2"/>
      {/* Pennant — converging triangle */}
      <line x1="8" y1="6"  x2="34" y2="14" stroke="#3dd68c" strokeWidth="1.5"/>
      <line x1="8" y1="20" x2="34" y2="14" stroke="#3dd68c" strokeWidth="1.5"/>
      {/* Consolidation lines converging */}
      <line x1="14" y1="8"  x2="34" y2="14" stroke="#3dd68c" strokeWidth="1" strokeDasharray="2 2" opacity="0.4"/>
      <line x1="14" y1="18" x2="34" y2="14" stroke="#3dd68c" strokeWidth="1" strokeDasharray="2 2" opacity="0.4"/>
      {/* Breakout arrow */}
      <polyline points="34,14 46,14 46,4" fill="none" stroke="#3dd68c" strokeWidth="1.5" strokeLinejoin="round"/>
      <polygon points="46,4 43,8 49,8" fill="#3dd68c"/>
    </svg>
  ),

  // 4. Bear Pennant
  BEAR_PENNANT: () => (
    <svg viewBox="0 0 60 40" width="60" height="40">
      {/* Flagpole */}
      <line x1="8" y1="4" x2="8" y2="34" stroke="#f75f5f" strokeWidth="2"/>
      {/* Pennant — converging triangle */}
      <line x1="8" y1="20" x2="34" y2="26" stroke="#f75f5f" strokeWidth="1.5"/>
      <line x1="8" y1="34" x2="34" y2="26" stroke="#f75f5f" strokeWidth="1.5"/>
      {/* Consolidation lines */}
      <line x1="14" y1="22" x2="34" y2="26" stroke="#f75f5f" strokeWidth="1" strokeDasharray="2 2" opacity="0.4"/>
      <line x1="14" y1="32" x2="34" y2="26" stroke="#f75f5f" strokeWidth="1" strokeDasharray="2 2" opacity="0.4"/>
      {/* Breakdown arrow */}
      <polyline points="34,26 46,26 46,36" fill="none" stroke="#f75f5f" strokeWidth="1.5" strokeLinejoin="round"/>
      <polygon points="46,36 43,32 49,32" fill="#f75f5f"/>
    </svg>
  ),

  // 5. Cup & Handle
  CUP_AND_HANDLE: () => (
    <svg viewBox="0 0 60 40" width="60" height="40">
      {/* Cup — rounded bottom */}
      <path
        d="M 2,6 Q 4,8 6,14 Q 10,32 20,34 Q 30,32 34,14 Q 36,8 38,6"
        fill="none" stroke="#3dd68c" strokeWidth="1.5"
      />
      {/* Handle — small consolidation */}
      <polyline
        points="38,6 42,10 46,8 50,12"
        fill="none" stroke="#3dd68c" strokeWidth="1.5" strokeLinejoin="round"
      />
      {/* Resistance line */}
      <line x1="2" y1="6" x2="50" y2="6" stroke="#f5a623" strokeWidth="1" strokeDasharray="2 2" opacity="0.6"/>
      {/* Breakout arrow */}
      <polyline points="50,8 56,8 56,2" fill="none" stroke="#3dd68c" strokeWidth="1.5" strokeLinejoin="round"/>
      <polygon points="56,2 53,6 59,6" fill="#3dd68c"/>
    </svg>
  ),

  // 6. Rectangle
  RECTANGLE: () => (
    <svg viewBox="0 0 60 40" width="60" height="40">
      {/* Price action bouncing inside */}
      <polyline
        points="2,28 6,12 10,28 14,12 18,28 22,12 26,28 30,12 34,28 38,12"
        fill="none" stroke="#7c6af7" strokeWidth="1.5" strokeLinejoin="round"
      />
      {/* Support line */}
      <line x1="2" y1="28" x2="38" y2="28" stroke="#f5a623" strokeWidth="1.5" strokeDasharray="3 2"/>
      {/* Resistance line */}
      <line x1="2" y1="12" x2="38" y2="12" stroke="#f5a623" strokeWidth="1.5" strokeDasharray="3 2"/>
      {/* Breakout arrow up */}
      <polyline points="38,12 46,12 46,4" fill="none" stroke="#3dd68c" strokeWidth="1.5" strokeLinejoin="round"/>
      <polygon points="46,4 43,8 49,8" fill="#3dd68c"/>
    </svg>
  ),


  // 1. Symmetrical Triangle — neutral, breaks either way
  SYMMETRICAL_TRIANGLE: () => (
    <svg viewBox="0 0 60 40" width="60" height="40">
      {/* Price action inside converging lines */}
      <polyline
        points="2,8 10,28 16,14 22,24 28,17 34,21 40,19"
        fill="none" stroke="#7c6af7" strokeWidth="1.5" strokeLinejoin="round"
      />
      {/* Upper trendline — descending */}
      <line x1="2" y1="8"  x2="40" y2="19" stroke="#f5a623" strokeWidth="1.5" strokeDasharray="3 2"/>
      {/* Lower trendline — ascending */}
      <line x1="2" y1="28" x2="40" y2="19" stroke="#f5a623" strokeWidth="1.5" strokeDasharray="3 2"/>
      {/* Apex point */}
      <circle cx="40" cy="19" r="1.5" fill="#f5a623"/>
      {/* Breakout — drawn neutral/dotted since direction unknown */}
      <line x1="40" y1="19" x2="50" y2="19" stroke="#aaa" strokeWidth="1.5" strokeDasharray="2 2"/>
      <polygon points="50,15 50,23 56,19" fill="#aaa"/>
    </svg>
  ),

  // 2. Ascending Triangle — Bullish
  ASCENDING_TRIANGLE: () => (
    <svg viewBox="0 0 60 40" width="60" height="40">
      <polyline
        points="2,28 10,12 16,20 22,12 28,18 34,12 40,12"
        fill="none" stroke="#3dd68c" strokeWidth="1.5" strokeLinejoin="round"
      />
      {/* Flat upper resistance */}
      <line x1="2" y1="12" x2="40" y2="12" stroke="#f5a623" strokeWidth="1.5" strokeDasharray="3 2"/>
      {/* Rising lower support */}
      <line x1="2" y1="28" x2="40" y2="12" stroke="#f5a623" strokeWidth="1.5" strokeDasharray="3 2"/>
      {/* Breakout up */}
      <polyline points="40,12 48,12 48,4" fill="none" stroke="#3dd68c" strokeWidth="1.5" strokeLinejoin="round"/>
      <polygon points="48,4 45,8 51,8" fill="#3dd68c"/>
    </svg>
  ),

  // 3. Descending Triangle — Bearish
  DESCENDING_TRIANGLE: () => (
    <svg viewBox="0 0 60 40" width="60" height="40">
      <polyline
        points="2,12 10,28 16,20 22,28 28,22 34,28 40,28"
        fill="none" stroke="#f75f5f" strokeWidth="1.5" strokeLinejoin="round"
      />
      {/* Falling upper resistance */}
      <line x1="2" y1="12" x2="40" y2="28" stroke="#f5a623" strokeWidth="1.5" strokeDasharray="3 2"/>
      {/* Flat lower support */}
      <line x1="2" y1="28" x2="40" y2="28" stroke="#f5a623" strokeWidth="1.5" strokeDasharray="3 2"/>
      {/* Breakdown */}
      <polyline points="40,28 48,28 48,36" fill="none" stroke="#f75f5f" strokeWidth="1.5" strokeLinejoin="round"/>
      <polygon points="48,36 45,32 51,32" fill="#f75f5f"/>
    </svg>
  ),

  // 4. Falling Wedge — Bullish reversal
  FALLING_WEDGE: () => (
    <svg viewBox="0 0 60 40" width="60" height="40">
      <polyline
        points="2,6 10,16 14,12 20,22 24,18 30,26 34,23"
        fill="none" stroke="#3dd68c" strokeWidth="1.5" strokeLinejoin="round"
      />
      {/* Both lines slant DOWN, converging */}
      <line x1="2" y1="6"  x2="34" y2="23" stroke="#f5a623" strokeWidth="1.5" strokeDasharray="3 2"/>
      <line x1="2" y1="16" x2="34" y2="24" stroke="#f5a623" strokeWidth="1.5" strokeDasharray="3 2"/>
      {/* Breakout up — against the slant */}
      <polyline points="34,23 44,23 44,13" fill="none" stroke="#3dd68c" strokeWidth="1.5" strokeLinejoin="round"/>
      <polygon points="44,13 41,17 47,17" fill="#3dd68c"/>
    </svg>
  ),

  // 5. Rising Wedge — Bearish reversal
  RISING_WEDGE: () => (
    <svg viewBox="0 0 60 40" width="60" height="40">
      <polyline
        points="2,34 10,24 14,28 20,18 24,22 30,14 34,17"
        fill="none" stroke="#f75f5f" strokeWidth="1.5" strokeLinejoin="round"
      />
      {/* Both lines slant UP, converging */}
      <line x1="2" y1="34" x2="34" y2="17" stroke="#f5a623" strokeWidth="1.5" strokeDasharray="3 2"/>
      <line x1="2" y1="24" x2="34" y2="16" stroke="#f5a623" strokeWidth="1.5" strokeDasharray="3 2"/>
      {/* Breakdown — against the slant */}
      <polyline points="34,17 44,17 44,27" fill="none" stroke="#f75f5f" strokeWidth="1.5" strokeLinejoin="round"/>
      <polygon points="44,27 41,23 47,23" fill="#f75f5f"/>
    </svg>
  ),
};





// ── Main component ────────────────────────────────────────────────────────────
const CandlePatternIcon = ({ name, size = 1 }) => {
  // normalize name → key
  const key = name?.toUpperCase().replace(/ /g, "_");
  const Icon = patterns[key];

  if (!Icon) return (
    <div style={{ width: 20 * size, height: 40 * size }}
         className="flex items-center justify-center text-slate-500 text-xs">
      ?
    </div>
  );

  return (
    <div style={{ transform: `scale(${size})`, transformOrigin: "left top" }}>
      <Icon />
    </div>
  );
};

export default CandlePatternIcon;