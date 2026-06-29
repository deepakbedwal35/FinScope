export default function ToolsMenuCard({ title, desc, logo, premium = false, onClick }) {
  return (
    <div
      onClick={onClick}
      className="flex items-start gap-3 p-3 rounded-xl cursor-pointer hover:bg-neutral-800/60 transition-colors"
    >
      <div className="shrink-0 w-11 h-11 rounded-xl bg-neutral-800 flex items-center justify-center">
        {logo}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-sm text-white">{title}</span>
          {premium && (
            <span className="flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white">
              👑 Pro
            </span>
          )}
        </div>
        <p className="text-xs text-gray-400 mt-0.5 leading-snug">{desc}</p>
      </div>
    </div>
  );
}