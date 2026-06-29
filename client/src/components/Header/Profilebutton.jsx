import {useState , useRef} from "react"
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'
import PermIdentityIcon from '@mui/icons-material/PermIdentity';
import LogoutButton from "./LogoutButton"
import {Link} from 'react-router-dom'
export default function Profilebutton(){
    const [isOpen , setIsOpen] = useState(false);
    const timeOutRef = useRef(null);
    const handleMouseEnter = ()=>{
        if(timeOutRef.current){
            clearTimeout(timeOutRef.current);
        }
        setIsOpen(true);
    }
    const handleMouseLeave = ()=>{
        timeOutRef.current = setTimeout(()=>{
            setIsOpen(false);
        }, 200); // delay of 200ms before closing the menu
    }
    return(
        <div
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            className="relative inline-block text-white"

        
        >
            <Menu as="div"  open={isOpen} onClose = {()=>setIsOpen(false)} className="relative inline-block text-white">
                <MenuButton className="border-0  cursor-pointer inline-flex gap-x-1.5 text-gray-100 rounded-lg hover:bg-neutral-700  p-2 ">
                    
                    <Link to="/profile"><PermIdentityIcon  aria-hidden="true" className="size-5 text-gray-100" /></Link>
                </MenuButton>

                <MenuItems
                    transition
                    static = {isOpen}
                    className="absolute right-0 z-10 mt-2 w-30 origin-top-right divide-y divide-white/10 rounded-md bg-neutral-700  transition">
                    <div className="">
                    <MenuItem >
                        <LogoutButton />
                    </MenuItem>
                    
                    </div>
                </MenuItems>
            </Menu>

        </div>
    )
}





    // <Menu as="div" className="relative inline-block">
    //   <MenuButton className="border-0 cursor-pointer inline-flex gap-x-1.5 text-gray-100 rounded-lg hover:bg-neutral-700  p-2 ">
    //     Tools 
    //     <KeyboardArrowDownTwoToneIcon aria-hidden="true" className="-mr-1 size-5 text-gray-400" />
    //   </MenuButton>

    //   <MenuItems
    //     transition
    //     className="absolute right-0 z-10 mt-2 w-56 origin-top-right divide-y divide-white/10 rounded-md bg-neutral-800  transition data-closed:scale-95 data-closed:transform data-closed:opacity-0 data-enter:duration-100 data-enter:ease-out data-leave:duration-75 data-leave:ease-in"
    //    >
    //     <div className="py-1">
    //       <MenuItem>
    //         <Link to="/backtest" className="block px-4 py-2 font-bold text-sm text-gray-300 data-focus:bg-white/5 data-focus:text-white data-focus:outline-hidden">
    //           Backtest
    //         </Link>
    //       </MenuItem>
    //       <MenuItem>
    //         <Link to="/analyse" className="block px-4 py-2 font-bold text-sm text-gray-300 data-focus:bg-white/5 data-focus:text-white data-focus:outline-hidden">
    //           Analyse your Stock
    //         </Link>
    //       </MenuItem>
    //     </div>
    //     <div className="py-1">
    //       <MenuItem>
    //         <Link to="/scanner" className="block px-4 py-2 font-bold text-sm text-gray-300 data-focus:bg-white/5 data-focus:text-white data-focus:outline-hidden">
    //           Scanner
    //         </Link>
    //       </MenuItem>
    //       <MenuItem>
    //         <a
    //           href="#"
    //           className="block px-4 py-2 font-bold text-sm text-gray-300 data-focus:bg-white/5 data-focus:text-white data-focus:outline-hidden"
    //         >
    //           Move
    //         </a>
    //       </MenuItem>
    //     </div>
        
        
          
      
    //   </MenuItems>
    // </Menu>

