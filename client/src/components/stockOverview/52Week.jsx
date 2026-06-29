import ArrowDropDownOutlinedIcon from '@mui/icons-material/ArrowDropDownOutlined';
import { Tooltip } from '@mui/material';

export default function Week52({ stockData }) {
    if (!stockData || !stockData.w52l || !stockData.w52h) return null;

    const currentPrice = stockData.Price ?? stockData?.price;
    const low52W = stockData.w52l;
    const high52W = stockData.w52h;

    // Calculate total mathematical range span
    const totalRange = high52W - low52W;

    // Calculate absolute relative percentage position of the price inside the range (0% to 100%)
    let rangePercentage = 0;
    if (totalRange > 0) {
        rangePercentage = ((currentPrice - low52W) / totalRange) * 100;
    }

    // Guard rail limits to keep the tracker arrow strictly inside the bar boundary
    const boundedPercentage = Math.min(Math.max(rangePercentage, 0), 100);

    return (
        <div className="font-light px-1 text-base w-full">
            <div className="pb-1 text-neutral-400 text-sm font-medium">52 Week Low / High</div>
             
            <div className="mt-6 relative w-full select-none">
                {/* Positional Tracker Marker Pointer */}
                <Tooltip 
                    title={`${currentPrice.toFixed(2)} (${stockData.dist_52w?.toFixed(2) ?? "0.00"}% away from 52W High)`} 
                    placement="top"
                    arrow
                >
                    <div 
                        className="absolute -top-[22px] transition-all duration-300 ease-out z-10 text-amber-50" 
                        style={{ 
                            left: `${boundedPercentage}%`, 
                            transform: 'translateX(-50%)' // Centers the icon handle perfectly over the exact percentage mark
                        }}
                    >
                        <ArrowDropDownOutlinedIcon className="scale-125" />
                    </div>
                </Tooltip>

                {/* Progress Visual Range Track Bar */}
                <div 
                    className="h-2 w-full rounded-full" 
                    style={{ background: 'linear-gradient(to right, #ef4444 0%, #eab308 50%, #22c55e 100%)' }}
                ></div>

                {/* Boundary Numeric Value Labels */}
                <div className="flex justify-between text-xs font-mono pt-2 text-neutral-400">
                    <div>{low52W.toFixed(2)}</div>
                    <div>{high52W.toFixed(2)}</div>
                </div>
            </div>
        </div>
    );
}
