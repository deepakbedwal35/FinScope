import { useEffect, useState } from "react";

export default function DemoBanner() {
  const [demoInfo, setDemoInfo] = useState({ isDemo: false, demoAsOf: null });

  useEffect(() => {
    const handleEvent = (event) => {
      if (event?.detail && typeof event.detail.isDemo === "boolean") {
        setDemoInfo(event.detail);
      }
    };

    window.addEventListener("finscope:demo_status", handleEvent);
    return () => window.removeEventListener("finscope:demo_status", handleEvent);
  }, []);

  if (!demoInfo.isDemo) return null;

  return (
    <div className="bg-amber-950/60 border border-amber-600/40 text-amber-200 px-4 py-2.5 mx-4 mt-3 mb-1 rounded-lg text-sm flex flex-wrap items-center justify-between gap-2 shadow-sm">
      <div className="flex items-center gap-2">
        <span className="text-amber-400 font-bold">ℹ️ Demo Mode:</span>
        <span>Showing sample data. Run a full scan from Admin for live results.</span>
      </div>
      {demoInfo.demoAsOf && (
        <span className="text-xs text-amber-300/80 bg-amber-900/50 px-2 py-0.5 rounded border border-amber-700/30">
          Sample as of {demoInfo.demoAsOf}
        </span>
      )}
    </div>
  );
}

