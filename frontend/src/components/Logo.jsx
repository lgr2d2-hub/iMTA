import React from "react";
import { useNavigate } from "react-router-dom";

/**
 * CSS-based iMTA wordmark. Uses inline text instead of an image so the logo
 * never breaks due to missing or slow-loading assets. The lowercase `i` is
 * teal-light and the `MTA` is teal-dark to match the brand palette.
 *
 * Props:
 *  - size: pixel font-size (defaults to 22 for header, pass 36 for splash).
 *  - clickable: when true (default), wraps the wordmark in a button that
 *    navigates to /dashboard.
 */
export function Logo({ size = 22, clickable = true, testId = "imta-logo" }) {
  const navigate = useNavigate();

  const wordmark = (
    <span
      style={{
        fontFamily: "'Inter', sans-serif",
        fontSize: `${size}px`,
        fontWeight: 800,
        fontStyle: "italic",
        color: "#4DB8A8",
        letterSpacing: "-1px",
        lineHeight: 1,
      }}
    >
      i<span style={{ color: "#2E8B7A" }}>MTA</span>
    </span>
  );

  if (!clickable) {
    return (
      <div data-testid={testId} style={{ display: "inline-flex" }}>
        {wordmark}
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
      {wordmark}
    </button>
  );
}
