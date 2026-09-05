import React from "react";
import { userApi } from "../../services/api";
import toast from "react-hot-toast";
import LogoutIcon from '@mui/icons-material/Logout';
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

export default function LogoutButton() {
  const navigate = useNavigate();
  const { setIsAuthenticated } = useAuth();

  const handleLogout = async () => {
    try {
      const res = await userApi.post("/user/logout", {}, { withCredentials: true });
      
      if (res.data && res.data.success) {
        localStorage.removeItem("token");
        sessionStorage.removeItem("token");
        setIsAuthenticated(false);
        toast.success("Logged out successfully!");
        navigate("/login", { replace: true });
      }
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message;
      toast.error("Logout Failed: " + errMsg);
    }
  };

  return (
    <div className="relative group/tooltip inline-block w-full flex justify-center py-1">
      {/* 🟢 Enlarged Icon Button Wrapper */}
      <button 
        onClick={handleLogout} 
        aria-label="Log Out"
        className="flex items-center justify-center p-3 rounded-xl cursor-pointer text-gray-400 hover:text-red-400 hover:bg-red-500/10 active:scale-95 transition-all duration-200 outline-none"
      >
        {/* 🟢 Enlarged Material UI Vector Icon */}
        <LogoutIcon sx={{ fontSize: 22 }} />
      </button>

      {/* 🟢 Pure CSS Snappy Tooltip Anchor */}
      <span className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 pointer-events-none opacity-0 scale-95 group-hover/tooltip:opacity-100 group-hover/tooltip:scale-100 transition-all duration-150 ease-out bg-neutral-900 border border-neutral-800 text-[10px] font-mono font-bold tracking-widest text-zinc-300 uppercase px-2.5 py-1.5 rounded-md shadow-xl z-50 whitespace-nowrap">
        End Session
      </span>
    </div>
  );
}
