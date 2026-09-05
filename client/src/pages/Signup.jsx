import { useState } from "react";
import { userApi } from "../services/api";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import ChartBackground from "../components/ui/ChartBackground";
import { useAuth } from "../hooks/useAuth";

export default function Signup() {
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      return toast.error("Please fill in all layout credentials.");
    }

    setIsLoading(true);
    try {
      const res = await userApi.post("/user/signup", formData, { withCredentials: true });

      if (!res.data) {
        throw new Error("No data returned from authentication gateway.");
      }

      setIsAuthenticated(true);
      toast.success("Welcome to Finscope!");
      navigate("/home", { replace: true });
    } catch (err) {
      setIsAuthenticated(false);
      
   
      const errMsg = err.response?.data?.message || err.message;
      toast.error("Signup Failed: " + errMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-full">
      {/* Visual Analytics Side Pane */}
      <div className="hidden lg:flex w-1/2">
        <ChartBackground />
      </div>

      {/* Main Form Entry Container */}
      <div className="w-full lg:w-1/2 bg-slate-900 flex items-center justify-center px-10">
        <div className="w-full max-w-sm">
          {/* Mobile Specific Header */}
          <div className="flex lg:hidden items-center gap-1 mb-8">
            <span className="text-emerald-400 font-bold text-2xl">Fin</span>
            <span className="text-white font-bold text-2xl">Scope</span>
          </div>

          <h2 className="text-white text-2xl font-semibold mb-1">Create Account</h2>
          <p className="text-slate-400 text-sm mb-8">Sign up for a new quantitative workspace</p>

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
              {isLoading ? "Creating Account..." : "Sign up"}
            </button>
          </form>

          <Link to={"/login"}>
            <p className="text-slate-500 text-xs text-center mt-6">
              Already have an account?{" "}
              <span className="text-emerald-400 cursor-pointer hover:underline">
                Sign in
              </span>
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
}
