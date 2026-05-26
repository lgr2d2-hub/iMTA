import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const LOGO_URL = "https://customer-assets.emergentagent.com/job_korea-migrants/artifacts/m7c4vug1_image.png";

/**
 * iMTA brand logo.
 *
 * Renders the brush-stroke wordmark image. If the image ever fails to load
 * (network blocked, asset removed) we automatically fall back to an inline
 * CSS wordmark so the brand never disappears.
 *
 * Props:
 *  - size: pixel height of the logo (defaults to 28 for header, pass larger
 *    values like 120 for splash screens).
 *  - clickable: when true (default) wraps the logo in a button that navigates
 *    to /dashboard.
 *  - testId: data-testid for tests.
 */
export function Logo({ size = 28, clickable = true, testId = "imta-logo" }) {
  const navigate = useNavigate();
  const [broken, setBroken] = useState(false);

  const content = broken ? (
    <span
      style={{
        fontFamily: "'Inter', sans-serif",
        fontSize: `${Math.round(size * 0.78)}px`,
        fontWeight: 800,
        fontStyle: "italic",
        color: "#4DB8A8",
        letterSpacing: "-1px",
        lineHeight: 1,
      }}
    >
      i<span style={{ color: "#2E8B7A" }}>MTA</span>
    </span>
  ) : (
    <img
      src={LOGO_URL}
      alt="iMTA"
      onError={() => setBroken(true)}
      style={{ height: size, width: "auto", display: "block" }}
    />
  );

  if (!clickable) {
    return (
      <div data-testid={testId} style={{ display: "inline-flex" }}>
        {content}
      </div>
    );
  }

  return (
    <button
      onClick={() => navigate("/dashboard")}
      className="hover:opacity-80 transition-opacity"
      style={{ cursor: "pointer", display: "inline-flex", background: "none", border: 0, padding: 0 }}
      data-testid={testId}
      aria-label="Go to dashboard"
    >
      {content}
    </button>
  );
}
