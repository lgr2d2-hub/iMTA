import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      navigate("/login", { replace: true, state: { from: location.pathname } });
    } else {
      setReady(true);
    }
  }, [user, loading, navigate, location.pathname]);

  if (loading || !ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFB]">
        <div className="w-10 h-10 border-2 border-[#2E6B5E] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  return children;
}
