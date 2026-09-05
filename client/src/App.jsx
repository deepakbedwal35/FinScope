import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { useAuth } from "./hooks/useAuth"; 

// Component Page Imports
import Landing from "./pages/Landing.jsx";
import Home from "./pages/Home.jsx";
import Watchlist from "./pages/Watchlist.jsx";
import StockDetails from "./pages/StockDetails.jsx";
import FullScan from "./pages/FullScan.jsx";
import Backtesting from "./pages/Backtesting.jsx";
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import AdminPage from "./pages/AdminPage.jsx";
import Recommendation from "./pages/Recommendation.jsx";
import PatternsStock from "./pages/PatternsStock.jsx";

// Custom Layout Wrappers
import ProtectRoute from "./layouts/ProtectRoute.jsx";
import BuyButton from "./features/BuyButton.jsx";

export default function App() {
  const { isAuthenticated, loading } = useAuth();

  // 🟢 Block rendering until the background Auth Context finishes loading
  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center font-mono text-xs tracking-widest text-zinc-500">
        VERIFYING TRANSACTIONS...
      </div>
    );
  }

  return (
    <>
      <Toaster position="top-center" />
      
      <Routes>
        {/* 🟢 PUBLIC OPEN ROUTES */}
        {/* If user is already authenticated, the landing screen auto-routes them to /home */}
        <Route path="/" element={isAuthenticated ? <Navigate to="/home" replace /> : <Landing />} />
        
        {/* Authentication Entry Gateways (Only accessible if NOT logged in) */}
        <Route path="/login" element={isAuthenticated ? <Navigate to="/home" replace /> : <Login />} />
        <Route path="/signup" element={isAuthenticated ? <Navigate to="/home" replace /> : <Signup />} />
        
        {/* Public Analysis Sandbox Routes */}
        <Route path="/fin/recommendations" element={<Recommendation />} />
        <Route path="/admin/page" element={<AdminPage />} />

        {/* 🔒 SECURE PRIVATE ROUTES (Requires token confirmation checks) */}
        <Route element={<ProtectRoute isAuthenticated={isAuthenticated} />}>
          <Route path="/home" element={<Home />} />
          <Route path="/backtest" element={<Backtesting />} />
          <Route path="/watchlist" element={<Watchlist />} />
          <Route path="/fullscan" element={<FullScan />} />
          <Route path="/analyse/:symbol" element={<StockDetails />} />
          <Route path="/buy/:symbol" element={<BuyButton />} />
          <Route path="/all/patterns" element={<PatternsStock />} />
        </Route>

     
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
