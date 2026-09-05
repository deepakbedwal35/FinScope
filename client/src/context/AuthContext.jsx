import React, { createContext, useState, useEffect } from "react";
import { userApi } from "../services/api";

// 🟢 Export the raw context so our isolated hook can read it
export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    userApi.get("/user/check-auth", { withCredentials: true })
      .then((res) => {
        setIsAuthenticated(!!res.data?.isAuthenticated);
      })
      .catch(() => {
        setIsAuthenticated(false);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, setIsAuthenticated, loading }}>
      {!loading ? children : (
        <div className="min-h-screen bg-neutral-950 flex items-center justify-center font-mono text-xs tracking-widest text-zinc-400">
          INITIALIZING WORKSPACE...
        </div>
      )}
    </AuthContext.Provider>
  );
};
