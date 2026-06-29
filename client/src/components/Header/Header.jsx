import { Link , NavLink } from "react-router-dom"
import DensityMediumIcon from '@mui/icons-material/DensityMedium';
import Person2Icon from '@mui/icons-material/Person2';
import Profilebutton from "./Profilebutton"
import ToolsDropdown from "./ToolsDropDownButton";
import HomeFilledIcon from '@mui/icons-material/HomeFilled';
import {useState , useEffect} from "react"
import SearchStocks from "./SearchStocks";

function Header(){
    let tabs = ["Home","Watchlist"  , "Tools" , "Profile" ];
    

    
    return(
        
        <div class="flex mb-4 top-0 z-50 w-full font-mono items-center justify-between px-4 py-2 border-y border-neutral-600  bg-neutral-900  mx  ">

            <NavLink to="/home" className= {({isActive}) => `block text-gray-200 font-bold  rounded-lg   p-2 ${isActive ? 'text-blue-500' : 'text-gray-300'}`}>FinScope</NavLink>
                
            <div className="flex flex-row items-center justify-between pl-2 gap-10 mr-2">
                
                <div className=""><SearchStocks/></div>
                <NavLink to="/home" className= {({isActive}) => `block  hover:text-blue-500 rounded-lg hover:bg-neutral-700  p-2 ${isActive ? 'text-blue-500' : 'text-gray-300'}`}><HomeFilledIcon /></NavLink>
                <NavLink to="/watchlist" className= {({isActive}) => `block  hover:text-blue-500 rounded-lg hover:bg-neutral-700  p-2 ${isActive ? 'text-blue-500' : 'text-gray-300'}`}>Watchlist</NavLink>
                {/* <NavLink to="/list/trades" className= {({isActive}) => `block  hover:text-blue-500 rounded-lg hover:bg-neutral-700 font-medium p-2 ${isActive ? 'text-blue-500' : 'text-gray-300'}`}>Portfolio</NavLink> */}
                <div className="ml-2 "><ToolsDropdown/></div>
                <div className="ml-2"><Profilebutton/></div>
            
            </div>     
        </div>
    )

}

export default Header