import React from "react";

export function Logo({ size = 28 }) {
  return (
    <div className="flex items-center gap-2" data-testid="imta-logo">
      <div
        style={{
          width: size,
          height: size,
          background: "linear-gradient(135deg, #2E6B5E 0%, #4DB8A8 100%)",
          borderRadius: 8,
          color: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: 800,
          fontSize: size * 0.55,
          letterSpacing: -0.5,
        }}
      >
        i
      </div>
      <span style={{ fontWeight: 800, fontSize: 18, color: "#1A1A1A", letterSpacing: -0.3 }}>
        MTA
      </span>
    </div>
  );
}
