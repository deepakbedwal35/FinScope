import { useState } from "react";
import { userApi } from "../services/api";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../hooks/useAuth";
import ChartBackground from "../components/ui/ChartBackground";

export default function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const { setIsAuthenticated } = useAuth();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Centralised, clean function handling login requests
  const executeLogin = async (payload) => {
    setIsLoading(true);
    try {
      const res = await userApi.post("/user/login", payload, { withCredentials: true });
      
      if (!res.data) {
        throw new Error("No data returned from authentication gateway.");
      }

      setIsAuthenticated(true);
      toast.success("Welcome Trader");
      navigate("/home", { replace: true });
    } catch (e) {
      setIsAuthenticated(false);
      // Grabs clean error string from backend validator responses if available
      const errMsg = e.response?.data?.message || e.response?.data?.errors?.[0] || e.message;
      toast.error("Login Failed! " + errMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      return toast.error("Please fill in all layout credentials.");
    }
    executeLogin(formData);
  };

  const handleDemoAccount = (e) => {
    e.preventDefault();
    const demoPayload = {
      email: "demo1@gmail.com",
      password: "demo123",
    };
    
  
    setFormData(demoPayload);
    
    executeLogin(demoPayload);
  };

  return (
    <div className="flex h-screen w-full">
  
      <div className="hidden lg:flex w-1/2">
        <ChartBackground />
      </div>


      <div className="w-full lg:w-1/2 bg-slate-900 flex items-center justify-center px-10">
        <div className="w-full max-w-sm">
          {/* Mobile Specific Header */}
          <div className="flex lg:hidden items-center gap-1 mb-8">
            <span className="text-emerald-400 font-bold text-2xl">Fin</span>
            <span className="text-white font-bold text-2xl">Scope</span>
          </div>

          <h2 className="text-white text-2xl font-semibold mb-1">Welcome back</h2>
          <p className="text-slate-400 text-sm mb-8">Sign in to your account</p>

          <form onSubmit={handleSubmit} className="space-y-4 border p-6 m-2 rounded-lg border-white/20">
            <div>
              <label className="text-slate-400 text-xs mb-1 block">Email</label>
              <input
                type="email"
                placeholder="you@example.com"
                name="email"
                disabled={isLoading}
                value={formData.email}
                onChange={handleChange}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white text-sm outline-none focus:border-emerald-500 transition-colors disabled:opacity-50"
              />
            </div>
            <div>
              <label className="text-slate-400 text-xs mb-1 block">Password</label>
              <input
                type="password"
                placeholder="••••••••"
                name="password"
                disabled={isLoading}
                value={formData.password}
                onChange={handleChange}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white text-sm outline-none focus:border-emerald-500 transition-colors disabled:opacity-50"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-emerald-500 cursor-pointer hover:bg-emerald-400 text-white font-medium py-3 rounded-lg transition-colors text-sm mt-2 disabled:bg-emerald-700"
            >
              {isLoading ? "Verifying..." : "Sign In"}
            </button>
            
            <button
              type="button"
              onClick={handleDemoAccount}
              disabled={isLoading}
              className="w-full cursor-pointer border-white/10 border bg-blue-600/40 hover:bg-blue-600/60 text-white font-medium py-3 rounded-lg transition-colors text-sm mt-2 disabled:bg-blue-800/40"
            >
              Demo Account
            </button>
          </form>

          <Link to={"/signup"}>
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
  );
}
