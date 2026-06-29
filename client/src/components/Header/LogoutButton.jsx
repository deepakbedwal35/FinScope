import { Logout } from "@mui/icons-material";
import { userApi } from "../../services/api";
import toast from "react-hot-toast";
import LogoutIcon from '@mui/icons-material/Logout';
import {useNavigate , useOutletContext} from "react-router-dom";
import { use } from "react";
import {useAuth} from "../../context/AuthContext"


export default function LogoutButton(){
    const navigate = useNavigate();
//    const context = useOutletContext();
    // it helps to get the setIsAuthenticated function from the parent 
    // component which is App.jsx in this case. 
    // because we need to set the isAuthenticated state variable to false when 
    // the user logs out.
    // otherwise we pass the setIsAuthenticated function as a prop to 
    // the Header component and then from Header component we pass it to
    //  LogoutButton component but it is a bit messy and also we need to pass it 
    // through multiple components if we want to use it in other components as well. 
    // so using useOutletContext is a better way to do this.
//    const setIsAuthenticated = context?.setIsAuthenticated || (()=>{}); // default value is an empty function to avoid error if context is not provided.
   const {isAuthenticated, setIsAuthenticated} = useAuth() ;
const handleLogout = ()=>{
        userApi.post("/user/logout" , {} , {withCredentials: true})
        .then((res)=>{
            if(res.data.success){
                setIsAuthenticated(false);
                toast.success("Logged out successfully!");
                navigate("/");
            }
        })
        .catch((err)=>{
            toast.error("Logout Failed: " + err.message);
        })
    }


    return(
        
         <button onClick={handleLogout} className=" block px-2 w-full text-start cursor-pointer hover:bg-white/5 hover:text-white py-2 font-bold text-sm text-gray-300 data-focus:bg-white/5 data-focus:text-white "><LogoutIcon /> Logout</button> 
       
    )


}