import { useState}  from "react";
import {userApi} from "../services/api"
import { Link  ,useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {useAuth} from "../context/AuthContext"
import ChartBackground from "../components/ui/ChartBackground"
export default function Login(){
    const [formData , setFormData] = useState({
        email: "",
        password: "",
    })
      
    const navigate = useNavigate();
    const {isAuthenticated, setIsAuthenticated} = useAuth();
    const handleChange =  (e)=>{
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        })
    };
   
    const handleSubmit = async (e)=>{
    
        e.preventDefault();
        userApi.post("/user/login" , formData , {withCredentials:true})
        .then((res)=>{
            if(!res) toast.error("Login Failed! No response from server.");
            
            
            setIsAuthenticated(true);
            
            toast.success("Welcome Trader" );
            navigate("/home" , {replace: true});
        })
        .catch((e)=> {
            setIsAuthenticated(false);
            toast.error("Login Failed! " + e.message);
           
        })
    }
    

    return(


      
        <div className="flex h-screen w-full">


    <div className="hidden lg:flex w-1/2">
      <ChartBackground/>
    </div>

   
    <div className="w-full lg:w-1/2 bg-slate-900 flex items-center justify-center px-10">
      <div className="w-full max-w-sm">

       
        <div className="flex lg:hidden items-center gap-1 mb-8">
          <span className="text-emerald-400 font-bold text-2xl">Fin</span>
          <span className="text-white font-bold text-2xl">Scope</span>
        </div>

        <h2 className="text-white text-2xl font-semibold mb-1">Welcome back</h2>
        <p className="text-slate-400 text-sm mb-8">Sign in to your account</p>

       
        <div className="space-y-4 border p-6 m-2 rounded-lg border-white/20 ">
          <div>
            <label className="text-slate-400 text-xs mb-1 block">Email</label>
            <input
              type="email"
              placeholder="you@example.com"
              name="email"
              value={formData.email} onChange={handleChange}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg 
                         px-4 py-3 text-white text-sm outline-none
                         focus:border-emerald-500 transition-colors"
            />
          </div>
          <div>
            <label className="text-slate-400 text-xs mb-1 block">Password</label>
            <input
              type="password"
              placeholder="••••••••"
              name="password"
              value={formData.password} onChange={handleChange}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg 
                         px-4 py-3 text-white text-sm outline-none
                         focus:border-emerald-500 transition-colors"
            />
          </div>

          <button onClick={handleSubmit} className="w-1/2  bg-emerald-500 cursor-pointer hover:bg-emerald-400 
                             text-white font-medium py-3 rounded-lg 
                             transition-colors text-sm mt-2">
            Sign In
          </button>
        </div>

        <Link to={'/signup'}>
        <p className="text-slate-500 text-xs text-center mt-6">
          Don't have an account?{" "}
          <span className="text-emerald-400 cursor-pointer hover:underline">
            Sign up
          </span>
        </p>
        </Link>

      </div>
    </div>

  </div>
    )
    
}