import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { X, ArrowRight, BookOpen, Compass, Brain, History, ShieldAlert } from "lucide-react";
import { JOURNEY_STEPS, UNDER_THE_HOOD, DISCLAIMER } from "../../constants/journey";

export default function GettingStartedGuide() {
  const navigate = useNavigate();
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const isDismissed = localStorage.getItem("finscope_guide_dismissed") === "true";
    setDismissed(isDismissed);

    const handleToggleGuide = () => {
      setDismissed((prev) => {
        const next = !prev;
        if (!next) {
          localStorage.removeItem("finscope_guide_dismissed");
        } else {
          localStorage.setItem("finscope_guide_dismissed", "true");
        }
        return next;
      });
    };

    window.addEventListener("finscope:toggle_guide", handleToggleGuide);
    return () => window.removeEventListener("finscope:toggle_guide", handleToggleGuide);
  }, []);

  const handleDismiss = () => {
    localStorage.setItem("finscope_guide_dismissed", "true");
    setDismissed(true);
  };

  if (dismissed) {
    return null;
  }

  const renderStepIcon = (iconName) => {
    switch (iconName) {
      case "Compass":
        return <Compass className="w-4 h-4" />;
      case "Brain":
        return <Brain className="w-4 h-4" />;
      case "History":
        return <History className="w-4 h-4" />;
      case "ShieldAlert":
      default:
        return <ShieldAlert className="w-4 h-4" />;
    }
  };

  return (
    <div className="mx-4 my-3 bg-neutral-900 border border-neutral-700/80 rounded-xl p-4 text-zinc-200 relative shadow-lg">
      <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-purple-400" />
          <h3 className="text-sm font-bold font-mono text-zinc-100 uppercase tracking-wider">
            Getting Started Guide
          </h3>
          <span className="text-[10px] bg-purple-950/60 text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded font-mono">
            Core Workflow
          </span>
        </div>
        <button
          onClick={handleDismiss}
          className="text-zinc-400 hover:text-zinc-100 p-1 rounded-md hover:bg-neutral-800 transition-colors cursor-pointer"
          title="Dismiss guide"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 my-3">
        {JOURNEY_STEPS.map((s) => (
          <div
            key={s.step}
            className="bg-neutral-950/60 border border-neutral-800/80 rounded-lg p-3 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono font-bold text-purple-400">
                  {s.number} / {s.title}
                </span>
                <span className="text-zinc-500">{renderStepIcon(s.icon)}</span>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed mb-3">
                {s.description}
              </p>
            </div>
            <button
              onClick={() => navigate(s.liveUrl || s.demoUrl)}
              className="text-[11px] font-mono text-purple-400 hover:text-purple-300 flex items-center gap-1 font-semibold cursor-pointer"
            >
              <span>{s.cta}</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>

      <div className="pt-2 border-t border-neutral-800/80 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] font-mono text-zinc-400">
        <span>{UNDER_THE_HOOD}</span>
        <span className="text-zinc-500">{DISCLAIMER}</span>
      </div>
    </div>
  );
}

