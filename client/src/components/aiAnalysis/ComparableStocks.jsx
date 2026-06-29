export default function ComparableStocks({ comparable_stocks }) {
  // Fix 1: You must explicitly return the JSX
  return (
    <div className=" bg-neutral-900/40 border border-neutral-800/40 p-5 rounded-xl flex flex-col gap-3">
      <div className="text-sm font-bold tracking-wider uppercase text-neutral-400 border-b border-neutral-800 pb-2">
        Similar Stocks
      </div>
      
      {/* Fix 2: Changed .length to !.length to correctly check for empty arrays */}
      {!comparable_stocks || !comparable_stocks.length ? (
        <div className="text-xs text-neutral-600 italic py-4">No similar stock</div>
      ) : (
        <ul className="list-disc space-y-2.5 list-inside">
          {comparable_stocks.map((stock, index) => (
            <li key={`stock-${index}`} className="text-sm font-normal text-zinc-300 leading-normal pl-1">
              {stock}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
