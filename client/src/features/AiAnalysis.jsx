import { useState } from "react";
import { api } from "../services/api";
import AiDecision from "../components/aiAnalysis/AiDecision";
import AiNewsAnalysis from "../components/aiAnalysis/AiNewsAnalysis";
import { toast } from "react-hot-toast";

export default function AiAnalysis({ symbol }) {
  const [analysisData, setAnalysisData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(null); 

  
  const fetchAiPayload = async (targetTab) => {

    if (analysisData) {
      setActiveTab(targetTab);
      return;
    }

    setIsLoading(true);
    setActiveTab(targetTab); 

    try {
      const res = await api.get(`/ai/${symbol}`);
      setAnalysisData(res.data);
    } catch (e) {
      toast.error("AI Core Engine failed to process symbol logs");
      console.error(e);
      setActiveTab(null); 
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 p-2 w-full  mx-auto font-sans text-zinc-100">
      

      <div className="bg-neutral-900/60 border border-neutral-800/80 backdrop-blur-md p-5 rounded-2xl flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-purple-500 shadow-[0_0_10px_#a855f7]" />
          <h1 className="text-sm font-bold tracking-widest text-purple-300 uppercase">
            AI Quant Engine • Fundamentals + News + Technicals
          </h1>
        </div>


        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-1">
          

          <button
            onClick={() => fetchAiPayload("news")}
            disabled={isLoading}
            className={`flex items-center justify-center gap-2 rounded-xl text-sm font-semibold tracking-wide py-3 px-4 transition-all duration-200 cursor-pointer border ${
              activeTab === "news"
                ? "bg-zinc-800 border-zinc-700 text-purple-300 shadow-sm"
                : "bg-neutral-800/40 border-neutral-800 hover:bg-neutral-800 text-zinc-400"
            }`}
          >
            {isLoading && activeTab === "news" && (
              <span className="w-4 h-4 rounded-full border-2 border-purple-400 border-t-transparent animate-spin" />
            )}
            {isLoading && activeTab === "news" ? "Analyzing Live Sentiment..." : "Fetch & Analyse Live News"}
          </button>

         
          <button
            onClick={() => fetchAiPayload("decision")}
            disabled={isLoading}
            className={`flex items-center justify-center gap-2 rounded-xl text-sm font-semibold tracking-wide py-3 px-4 transition-all duration-200 cursor-pointer border ${
              activeTab === "decision"
                ? "bg-purple-950/20 border-purple-500/30 text-purple-400 shadow-sm shadow-purple-500/5"
                : "bg-purple-900/20 border-purple-900/10 text-purple-300 hover:bg-purple-900/30"
            }`}
          >
            {isLoading && activeTab === "decision" && (
              <span className="w-4 h-4 rounded-full border-2 border-purple-300 border-t-transparent animate-spin" />
            )}
            {isLoading && activeTab === "decision" ? "Running Core Intelligence..." : "Run Full AI Decision"}
          </button>

        </div>
      </div>

      {isLoading && (
        <div className="flex flex-col items-center justify-center p-12 bg-neutral-900/20 border border-neutral-900/60 rounded-xl gap-3">
          <div className="w-6 h-6 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" />
          <div className="text-xs font-mono text-zinc-500 tracking-widest uppercase animate-pulse">
            Processing matrix data arrays for {symbol}...
          </div>
        </div>
      )}

      
      {!isLoading && analysisData && (
        <div className="transition-all duration-300 ease-in-out">
          {activeTab === "news" && (
            <div className="animate-fadeIn">
              <AiNewsAnalysis aiNewsAnalysis={analysisData?.news} comparable_stocks={analysisData?.decision?.comparable_stocks} />
            </div>
          )}
          {activeTab === "decision" && (
            <div className="animate-fadeIn">
              <AiDecision decision={analysisData?.decision} />
            </div>
          )}
        </div>
      )}

    </div>
  );
}
