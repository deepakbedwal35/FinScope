import { useState, useEffect } from "react"
import {api} from "../services/api.js"
import KeyRatio from "../components/fundamentals/KeyRatio.jsx";
import Tooltip from "@mui/material/Tooltip";
import { toast } from "react-hot-toast";
import QuarterlyResult from "../components/fundamentals/QuarterlyResult.jsx";
import AnnualPL from "../components/fundamentals/AnnualPL.jsx";
import Dividend from "../components/fundamentals/Dividend.jsx";
import LightbulbIcon from '@mui/icons-material/Lightbulb';

export default function Fundamentals({ data }) {

  return (
    <div>
    
      {data && <div className=" ">
          
          <div className ="flex flex-col p-4 text-lg text-white  bg-neutral-900 rounded-xl ">
              <div className="text-amber-300">{data?.info?.name}</div>
              <div className="text-sm font-light text-gray-300">{data?.info?.sector}, {data?.info?.industry}, {data?.employees} employees</div>
              <div className="pt-2 mx-4  text-xs text-gray-400 font-light">{data?.info?.description}</div>
              <div className="pt-2 text-sm text-end text-gray-300 font-medium"><span className="text-gray-300">For more information, visit <a href={data?.info?.website} target="_blank" rel="noopener noreferrer" className="text-cyan-100 hover:underline">{data?.info?.website}</a></span> </div>

          </div> 
          <div className="mt-4  rounded-xl bg-neutral-900 "><KeyRatio key_ratios = {data?.ratios} quality={data?.quality}/></div>
          <div className="bg-neutral-900 rounded-xl mt-4"><AnnualPL title={"Quarterly Result"} annual = {data?.quarterly}/></div>
          <div className="bg-neutral-900 rounded-xl mt-4"><AnnualPL title={"Annual PL"} annual = {data?.annual}/></div>
          <div className="bg-neutral-900 rounded-xl p-4 mt-4"><Dividend dividends={data?.dividends}/></div>
      
      </div>}
    </div>
    
  )
}

// {
//   "company_info": {
//     "name": "Reliance Industries Limited",
//     "sector": "Energy",
//     "industry": "Oil & Gas Refining & Marketing",
//     "employees": 404501,
//     "website": "https://www.ril.com",
//     "description": "Reliance Industries Limited engages in the hydrocarbon exploration and production, oil and chemicals, retail, and digital service businesses worldwide. It operates through Oil to Chemicals, Oil and Gas, Retail, Digital Services, and Others segments. The company offers refining and marketing products, including liquefied petroleum gas, propylene, naphtha, gasoline, jet/aviation turbine fuel, kerosi...",
//     "exchange": "NSI",
//     "currency": "INR"
//   },
//   "key_ratios": {
//     "market_cap": "₹17.88L Cr",
//     "pe_ratio": 22.12,
//     "forward_pe": 18.38,
//     "pb_ratio": 1.98,
//     "ps_ratio": 1.69,
//     "roe": 9.1,
//     "roa": 3.7,
//     "profit_margin": 7.6,
//     "operating_margin": 10,
//     "debt_to_equity": 36.65,
//     "current_ratio": 1.1,
//     "quick_ratio": 0.58,
//     "beta": 0.24,
//     "52w_high": 1611.8,
//     "52w_low": 1290,
//     "dividend_yield": null,
//     "payout_ratio": 9.2,
//     "eps_ttm": 59.72,
//     "book_value": 668,
//     "revenue_ttm": "₹10.57L Cr",
//     "net_income_ttm": "₹808 Cr",
//     "free_cash_flow": "₹218 Cr",
//     "enterprise_value": "₹21.10L Cr",
//     "market_cap_raw": 17879101603840
//   },
//   "quarterly": [],
//   "annual": [
//     {
//       "year": "2026",
//       "revenue": 10572190000000,
//       "revenue_str": "₹10.57L Cr",
//       "profit": 807750000000,
//       "profit_str": "₹808 Cr",
//       "ebitda": 2049060000000,
//       "ebitda_str": "₹2.05L Cr",
//       "margin_pct": 7.6,
//       "rev_growth": null,
//       "prof_growth": null,
//       "profit_color": "#3dd68c",
//       "rev_g_color": "#aaaaaa",
//       "pro_g_color": "#aaaaaa",
//       "rev_arrow": "—",
//       "prof_arrow": "—",
//       "is_profit": true
//     },
//     {
//       "year": "2025",
//       "revenue": 9646930000000,
//       "revenue_str": "₹9.65L Cr",
//       "profit": 696480000000,
//       "profit_str": "₹696 Cr",
//       "ebitda": 1812740000000,
//       "ebitda_str": "₹1.81L Cr",
//       "margin_pct": 7.2,
//       "rev_growth": -8.8,
//       "prof_growth": -13.8,
//       "profit_color": "#3dd68c",
//       "rev_g_color": "#f75f5f",
//       "pro_g_color": "#f75f5f",
//       "rev_arrow": "▼ -8.8%",
//       "prof_arrow": "▼ -13.8%",
//       "is_profit": true
//     },
//     {
//       "year": "2024",
//       "revenue": 9010640000000,
//       "revenue_str": "₹9.01L Cr",
//       "profit": 696210000000,
//       "profit_str": "₹696 Cr",
//       "ebitda": 1769440000000,
//       "ebitda_str": "₹1.77L Cr",
//       "margin_pct": 7.7,
//       "rev_growth": -6.6,
//       "prof_growth": 0,
//       "profit_color": "#3dd68c",
//       "rev_g_color": "#f75f5f",
//       "pro_g_color": "#aaaaaa",
//       "rev_arrow": "▼ -6.6%",
//       "prof_arrow": "→ -0.0%",
//       "is_profit": true
//     },
//     {
//       "year": "2023",
//       "revenue": 8778350000000,
//       "revenue_str": "₹8.78L Cr",
//       "profit": 667020000000,
//       "profit_str": "₹667 Cr",
//       "ebitda": 1533070000000,
//       "ebitda_str": "₹1.53L Cr",
//       "margin_pct": 7.6,
//       "rev_growth": -2.6,
//       "prof_growth": -4.2,
//       "profit_color": "#3dd68c",
//       "rev_g_color": "#f75f5f",
//       "pro_g_color": "#f75f5f",
//       "rev_arrow": "▼ -2.6%",
//       "prof_arrow": "▼ -4.2%",
//       "is_profit": true
//     }
//   ],
//   "dividends": [
//     {
//       "date": "14 Aug 2025",
//       "amount": 5.5,
//       "amount_str": "₹5.5/share",
//       "year": "2025"
//     },
//     {
//       "date": "19 Aug 2024",
//       "amount": 5,
//       "amount_str": "₹5.0/share",
//       "year": "2024"
//     },
//     {
//       "date": "21 Aug 2023",
//       "amount": 4.5,
//       "amount_str": "₹4.5/share",
//       "year": "2023"
//     },
//     {
//       "date": "18 Aug 2022",
//       "amount": 4,
//       "amount_str": "₹4.0/share",
//       "year": "2022"
//     },
//     {
//       "date": "11 Jun 2021",
//       "amount": 3.5,
//       "amount_str": "₹3.5/share",
//       "year": "2021"
//     },
//     {
//       "date": "02 Jul 2020",
//       "amount": 3.25,
//       "amount_str": "₹3.25/share",
//       "year": "2020"
//     },
//     {
//       "date": "02 Aug 2019",
//       "amount": 3.22,
//       "amount_str": "₹3.22/share",
//       "year": "2019"
//     },
//     {
//       "date": "27 Jun 2018",
//       "amount": 2.97,
//       "amount_str": "₹2.97/share",
//       "year": "2018"
//     }
//   ],
//   "error": null
// }