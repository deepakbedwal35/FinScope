
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Landing from "../pages/Landing"; // the file completed earlier
import ScanPreview from "../features/ScanPreview";

/**
 * LandingRoute
 *
 * This is the piece that decides what "Try a Live Scan" / "Launch
 * Terminal" actually DO. Landing.jsx itself stays dumb — it just calls
 * whatever `onLaunch` it's given. This wrapper is where the real
 * decision lives: logged in → go to the real app; logged out → show
 * the static example preview instead of a backend call.
 *
 * Wire `isLoggedIn` to your real auth state (e.g. from AuthContext)
 * instead of the placeholder below.
 */

export default function LandingRoute({ isLoggedIn = false }) {
  const navigate = useNavigate();
  const [showPreview, setShowPreview] = useState(false);

  function handleLaunch() {
    if (isLoggedIn) {
      navigate("/home");
    } else {
      // No backend call here — just opens the static example preview.
      setShowPreview(true);
    }
  }

  return (
    <>
    
      <Landing onLaunch={handleLaunch} />
      {showPreview && (
        <ScanPreview onClose={() => setShowPreview(false)} />
      )}
    </>
  );
}