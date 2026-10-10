import React from "react";
import { Link } from "react-router-dom";

export default function DemoPageBadge({ title, date = "09 Oct 2026" }) {
  return (
    <div className="bg-gradient-to-r from-purple-950/40 via-neutral-900 to-indigo-950/40 border-b border-purple-900/30 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
      <div className="flex items-center gap-2">
        <span className="bg-purple-600/30 text-purple-300 font-mono font-bold px-2 py-0.5 rounded border border-purple-500/30 tracking-wider uppercase text-[10px]">
          Demo Data
        </span>
        <span className="text-zinc-300 font-medium">
          {title ? `${title} • ` : ""}Sample snapshot as of {date}
        </span>
      </div>

      <div className="flex items-center gap-4">
        <span className="text-[11px] text-zinc-500 hidden md:inline">
          Sample data only, not investment advice.
        </span>
        <Link
          to="/signup"
          className="bg-purple-600 hover:bg-purple-500 text-white font-mono font-semibold px-3 py-1 rounded-md text-[11px] tracking-wider transition-all duration-150 shadow-[0_0_10px_rgba(168,85,247,0.3)]"
        >
          SIGN UP FOR LIVE DATA →
        </Link>
      </div>
    </div>
  );
}

