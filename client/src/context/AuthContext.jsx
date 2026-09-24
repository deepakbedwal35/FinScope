import React, { createContext, useState, useEffect } from "react";
import { userApi, getAccessToken, setAccessToken, removeAccessToken } from "../services/api";

// 🟢 Export the raw context so our isolated hook can read it
export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => getAccessToken());
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(() => !!getAccessToken());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    userApi.get("/user/check-auth", { withCredentials: true })
      .then((res) => {
        if (res.data?.isAuthenticated) {
          setIsAuthenticated(true);
          setUser(res.data.user || null);
        } else {
          setIsAuthenticated(false);
          setUser(null);
          removeAccessToken();
          setToken(null);
        }
      })
      .catch(() => {
        setIsAuthenticated(false);
        setUser(null);
        removeAccessToken();
        setToken(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const loginUser = (authData) => {
    const accessToken = authData?.accessToken || authData?.token;
    if (accessToken) {
      setAccessToken(accessToken);
      setToken(accessToken);
    }
    if (authData?.user) {
      setUser(authData.user);
    }
    setIsAuthenticated(true);
  };

  const logoutUser = async () => {
    try {
      await userApi.post("/user/logout", {}, { withCredentials: true });
    } catch (e) {
      console.error("Logout request error:", e);
    } finally {
      removeAccessToken();
      setToken(null);
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        setIsAuthenticated,
        user,
        setUser,
        token,
        setToken,
        loginUser,
        logoutUser,
        loading,
      }}
    >
      {!loading ? children : (
        <div className="min-h-screen bg-neutral-950 flex items-center justify-center font-mono text-xs tracking-widest text-zinc-400">
          INITIALIZING WORKSPACE...
        </div>
      )}
    </AuthContext.Provider>
  );
};

