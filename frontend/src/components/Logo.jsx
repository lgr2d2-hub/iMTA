import React from "react";
import { useNavigate } from "react-router-dom";

export function Logo({ size = 34 }) {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => navigate("/dashboard")}
      className="flex items-center gap-2 hover:opacity-80 transition-opacity"
      data-testid="imta-logo"
      aria-label="Go to dashboard"
    >
      <img
        src="https://customer-assets.emergentagent.com/job_korea-migrants/artifacts/fkevrnsw_image.png"
        alt="iMTA"
        style={{ height: size, width: "auto", display: "block" }}
      />
    </button>
  );
}
