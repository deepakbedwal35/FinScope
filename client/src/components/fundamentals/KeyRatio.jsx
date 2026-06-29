import Tooltip from "@mui/material/Tooltip";
export default function  KeyRatio({key_ratios , quality}){
   

    return (
        <div>
            <div className="flex items-center justify-between">
                 <div className="m-5 text-lg font-medium text-amber-200">KEY RATIOS</div>
                 <div className="inline-block text-sm mr-5  px-2 py-1 font-semibold rounded-sm" style={{ 
                                backgroundColor: `${quality?.color}20`, 
                                color:quality?.color
                            }}>{quality?.verdict}</div>

            </div>
           
            
            <div className="pb-2 text-center gap-2 grid grid-cols-5 ">
                <Tooltip title="Total value of a company's shares. It shows company size." className="p-2">
                    <div className=" text-gray-300 pb-2 text-sm font-light">Market Cap</div>
                    <div className="font-medium  text-lg">{key_ratios?.market_cap}</div>      
                </Tooltip>

                <Tooltip title="It indicates how much investors are willing to pay for each rupee of earnings." className="p-2">
                    <div className=" text-sm text-gray-300 pb-2 font-light">PE Ratio</div>
                    <div className="font-medium  text-lg">{key_ratios?.pe_ratio}</div>      
                </Tooltip>

                <Tooltip title="It indicates the company's value relative to its book value." className="p-2">
                    <div className=" text-sm text-gray-300 pb-2 font-light">PB Ratio</div>
                    <div className="font-medium  text-lg">{key_ratios?.pb_ratio}</div>      
                </Tooltip>

                <Tooltip title="It indicates the company's earnings per share for the trailing twelve months." className="p-2">
                    <div className=" text-sm text-gray-300 pb-2 font-light">EPS(TTM)</div>
                    <div className="font-medium  text-lg">{key_ratios?.eps_ttm}</div>      
                </Tooltip>

                <Tooltip title="Return on Equity. It indicates how much profit a company generates for each rupee of shareholders' equity." className="p-2">
                    <div className=" text-sm text-gray-300 pb-2 font-light">ROE</div>
                    <div className="font-medium  text-lg">{key_ratios?.roe}</div>      
                </Tooltip>

                <Tooltip title="It indicates the percentage of profit a company generates from its revenue." className="p-2">
                    <div className=" text-sm text-gray-300 pb-2 font-light">Profit Margin</div>
                    <div className="font-medium  text-lg">{key_ratios?.profit_margin}%</div>      
                </Tooltip>

                <Tooltip title="It indicates the company's debt relative to its equity." className="p-2">
                    <div className=" text-sm text-gray-300 pb-2 font-light">Debt/Equity</div>
                    <div className="font-medium  text-lg">{key_ratios?.debt_to_equity}</div>      
                </Tooltip>

            
                <Tooltip title="It indicates the company's revenue for the trailing twelve months." className="p-2">
                    <div className=" text-sm text-gray-300 pb-2 font-light">Revenue(TTM)</div>
                    <div className="font-medium  text-lg">{`${key_ratios?.revenue_ttm}`}</div>      
                </Tooltip>

                <Tooltip title="It indicates the company's net income for the trailing twelve months." className="p-2">
                    <div className=" text-sm text-gray-300 pb-2 font-light">Net Income(TTM)</div>
                    <div className="font-medium  text-lg">{`${key_ratios?.net_income_ttm}`}</div>      
                </Tooltip>

                <Tooltip title="It indicates the company's free cash flow for the trailing twelve months." className="p-2">
                    <div className=" text-sm text-gray-300 pb-2 font-light">Free Cash Flow</div>
                    <div className="font-medium  text-lg">{`${key_ratios?.free_cash_flow}`}</div>      
                </Tooltip>
                <Tooltip title="It indicates the company's beta." className="p-2">
                    <div className=" text-sm text-gray-300 pb-2 font-light">Beta</div>
                    <div className="font-medium  text-lg">{`${key_ratios?.beta}%`}</div>      
                </Tooltip>
  
            </div> 
        </div>
         

    )
};

