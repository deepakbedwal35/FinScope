import React from "react";

export default function InlineErrorState({ title = "Data Unavailable", message = "Could not load data from backend.", onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center p-6 bg-neutral-900/60 border border-neutral-800 rounded-xl text-center gap-2.5 my-2">
      <div className="text-amber-500 text-sm font-semibold flex items-center gap-1.5">
        <span>⚠️</span>
        <span>{title}</span>
      </div>
      <p className="text-xs text-neutral-400 max-w-md">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-1 px-3 py-1 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-neutral-200 text-xs rounded-md font-mono tracking-wider transition-colors cursor-pointer"
        >
          Retry
        </button>
      )}
    </div>
  );
}

