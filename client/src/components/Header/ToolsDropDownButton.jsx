import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'
import { ChevronDownIcon } from '@heroicons/react/20/solid'
import KeyboardArrowDownTwoToneIcon from '@mui/icons-material/KeyboardArrowDownTwoTone';
import {
  ScanIcon, BacktestIcon, RecommendIcon,
  SearchStockIcon, SectorIcon, WatchlistIcon
} from "../ui/MenuIcon";
import {Link, useNavigate} from 'react-router-dom'
import ToolsMenuCard from './ToolsMenuCard';
export default function ToolsDropDownButton() {
  const navigate  = useNavigate();
  return (
    <Menu as="div" className="relative border-0 inline-block">
      <MenuButton className="border-0 hover:text-blue-500 cursor-pointer inline-flex gap-x-1.5 text-gray-100 rounded-lg hover:bg-neutral-700  p-2 ">
        Tools 
        <KeyboardArrowDownTwoToneIcon aria-hidden="true" className="-mr-1 hover:text-blue-500 size-5 text-gray-400" />
      </MenuButton>

      <MenuItems
        transition
        className="absolute right-0 z-50 mt-2 border border-white/20 w-100 origin-top-right divide-y rounded-2xl divide-white/10  bg-neutral-950  transition data-closed:scale-95 data-closed:transform data-closed:opacity-0 data-enter:duration-100 data-enter:ease-out data-leave:duration-75 data-leave:ease-in"
       >
        {/* <div className="py-1"> */}
          <MenuItem >
            <ToolsMenuCard 
              title="Full Scan"
              desc="Scan 1000+ NSE stocks with indicator, RSI, volume & grade filters."
              logo={<ScanIcon />}
              onClick={() => navigate("/fullscan")}  
              />
          </MenuItem>
        
         
          <MenuItem className="block px-4 py-2 font-bold text-sm text-gray-300 data-focus:bg-white/5 data-focus:text-white data-focus:outline-hidden">
            <ToolsMenuCard
            title="Backtest"
            desc="Test entry/exit strategies on 5-10 years of historical data."
            logo={<BacktestIcon />}
            onClick={() => navigate("/backtest")}
            />
          </MenuItem>
          
          <MenuItem>
          <ToolsMenuCard
            title="Recommendations"
            desc="Curated high-grade setups with entry, SL, targets & confidence."
            logo={<RecommendIcon />}
            onClick={() => navigate("/fin/recommendations")}
          />
          </MenuItem>
      
        {/* <div className="py-1">
          <MenuItem>
           
          </MenuItem>
          <MenuItem>
           
          </MenuItem>
        </div> */}
        
        
          
      
      </MenuItems>
    </Menu>
  )
}
