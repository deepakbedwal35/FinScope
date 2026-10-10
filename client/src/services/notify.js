import React from "react";
import toast from "react-hot-toast";

let failedPanels = new Set();
let debounceTimer = null;
const MAX_VISIBLE_TOASTS = 3;
let activeToastIds = [];

function trackToast(id) {
  if (!id) return;
  activeToastIds = activeToastIds.filter((tId) => tId !== id);
  activeToastIds.push(id);
  while (activeToastIds.length > MAX_VISIBLE_TOASTS) {
    const oldestId = activeToastIds.shift();
    toast.dismiss(oldestId);
  }
}

export const notify = {
  // 🟢 User-action success (e.g. Watchlist, login, save)
  success: (msg, id = undefined) => {
    const toastId = id || msg;
    trackToast(toastId);
    return toast.success(msg, {
      id: toastId,
      duration: 3000,
    });
  },

  // 🟢 User-action error (e.g. invalid credentials, failed trade)
  error: (msg, id = undefined) => {
    const toastId = id || msg;
    trackToast(toastId);
    return toast.error(msg, {
      id: toastId,
      duration: 4000,
    });
  },

  // 🟢 Informational alert
  info: (msg, id = undefined) => {
    const toastId = id || msg;
    trackToast(toastId);
    return toast(msg, {
      id: toastId,
      duration: 3500,
      icon: "ℹ️",
    });
  },

  // 🔴 Passive load error aggregator:
  // If multiple home panels fail concurrently, debounce and fire exactly ONE toast.
  aggregatedError: (panelKey, onRetry = null) => {
    failedPanels.add(panelKey);

    if (debounceTimer) clearTimeout(debounceTimer);

    debounceTimer = setTimeout(() => {
      const count = failedPanels.size;
      const text =
        count > 1
          ? `Some market data could not be loaded (${count} panels). Retry?`
          : "Some market data could not be loaded. Retry?";

      trackToast("aggregated-home-load-error");
      toast.error(
        (t) =>
          React.createElement(
            "div",
            { className: "flex items-center gap-3 text-xs" },
            React.createElement("span", null, text),
            onRetry
              ? React.createElement(
                  "button",
                  {
                    onClick: () => {
                      toast.dismiss(t.id);
                      failedPanels.clear();
                      onRetry();
                    },
                    className:
                      "bg-red-900/60 hover:bg-red-800 border border-red-700/50 px-2 py-0.5 rounded text-white font-medium cursor-pointer",
                  },
                  "Retry"
                )
              : null
          ),
        {
          id: "aggregated-home-load-error",
          duration: 5000,
        }
      );
    }, 250);
  },

  // Clear tracked failures on successful load or manual reload
  clearPanelFailure: (panelKey) => {
    failedPanels.delete(panelKey);
  },

  dismiss: (id) => toast.dismiss(id),
};
