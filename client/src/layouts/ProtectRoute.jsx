import {Navigate , Outlet} from "react-router-dom"
import {toast} from "react-hot-toast"
export default function ProtectRoute({isAuthenticated , loading}){
    if(loading){
        // toast.loading("Checking authentication...")
        return <div>Loading...</div>
    }
    if(!isAuthenticated){
        return <Navigate to={"/"} replace/>
    }
    return <Outlet/>

}