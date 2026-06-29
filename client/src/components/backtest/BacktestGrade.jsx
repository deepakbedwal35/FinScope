export default function BacktestGrade({grade , metrics}){
    const GRADE_CONFIG = {
  "A+": { text: "text-[#00ff88]", bg: "bg-[#00ff88]/10", border: "border-[#00ff88]/20", label: "ELITE SETUP" },
  "A":  { text: "text-[#3dd68c]", bg: "bg-[#3dd68c]/10", border: "border-[#3dd68c]/20", label: "STRONG" },
  "B":  { text: "text-[#7c6af7]", bg: "bg-[#7c6af7]/10", border: "border-[#7c6af7]/20", label: "GOOD" },
  "C":  { text: "text-[#f5a623]", bg: "bg-[#f5a623]/10", border: "border-[#f5a623]/20", emoji: "⚖️", label: "MODERATE" },
  "D":  { text: "text-[#f75f5f]", bg: "bg-[#f75f5f]/10", border: "border-[#f75f5f]/20", emoji: "⚠️", label: "WEAK" },
  "F":  { text: "text-[#ff3333]", bg: "bg-[#ff3333]/10", border: "border-[#ff3333]/20", emoji: "🚫", label: "AVOID" },
  "UNKNOWN": { text: "text-slate-400", bg: "bg-slate-400/10", border: "border-slate-400/20", emoji: "❓", label: "N/A" }
};
    return(
        <div className={`p-2 flex flex-col border border-white/20 items-center rounded-xl  ${GRADE_CONFIG[grade].text} ${GRADE_CONFIG[grade].bg}`}>
            <div className={`text-sm ${GRADE_CONFIG[grade].text}`}>Grade {grade} Performance</div>
            <div className={` text-4xl ${GRADE_CONFIG[grade].text}`}>{grade}</div>
            <div className={`flex flex-row ${GRADE_CONFIG[grade].text}`}>{metrics.total}<p className="pl-2"> trades</p> </div>
            <div className=" grid grid-cols-2 ">
                <div className=" flex flex-col items-center p-4 ">{metrics.win_rate}%<p className="text-[12px] text-neutral-400">Win rate </p> </div>
                <div className=" flex flex-col items-center  p-4">{metrics.avg_return}%<p className="text-[12px] text-neutral-400">Avg Return </p> </div>
            </div>

            <div className=" grid grid-cols-2 ">
                <div className=" flex flex-col items-center p-4 ">{metrics?.avg_mfe}%<p className="text-[12px] text-neutral-400">Avg MFE </p> </div>
                <div className=" flex flex-col items-center  p-4">{metrics.avg_mae}%<p className="text-[12px] text-neutral-400">Avg MAE </p> </div>
            </div>
            


        </div>
    )

}