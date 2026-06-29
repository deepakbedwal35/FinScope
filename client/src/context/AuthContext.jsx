import {createContext , useContext ,useState , useEffect } from "react";
import {userApi} from "../services/api"
const AuthContext = createContext(null);
import {toast} from "react-hot-toast"
export const AuthProvider = ({children})=>{
    const [isAuthenticated , setIsAuthenticated] = useState(false);
    const [loading , setLoading] = useState(true);
    useEffect(()=>{
        const toastId = toast.loading("Checking authentication...");
        userApi.get("/user/check-auth" , {withCredentials: true})
        .then((res)=>{
            if(res.data.isAuthenticated){
                 setIsAuthenticated(true);
                 toast.success("Authenticated successfully" , {id: toastId});
            }
        })
        .catch((err)=>{
            setIsAuthenticated(false);
            toast.dismiss(toastId);
        })
        .finally(()=>{
            setLoading(false);
            toast.dismiss(toastId);
        });
        
    }, [])

    return (
        <AuthContext.Provider value = {{isAuthenticated , setIsAuthenticated , loading}}>
            {children}
        </AuthContext.Provider>
    )
    
}

export const useAuth = () => useContext(AuthContext);
