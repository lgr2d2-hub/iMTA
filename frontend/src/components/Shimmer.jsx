import React from "react";

/**
 * Simple shimmer placeholder used while titles or text blocks are being
 * auto-translated. Matches inline text height so the layout doesn't jump.
 */
export function TitleShimmer({ className = "" }) {
  return (
    <span
      className={`inline-block align-middle h-4 w-4/5 rounded bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 bg-[length:200%_100%] animate-[shimmer_1.4s_linear_infinite] ${className}`}
      data-testid="title-shimmer"
    />
  );
}

export function BlockShimmer({ lines = 3 }) {
  return (
    <div className="space-y-2 mt-2" data-testid="block-shimmer">
      {Array.from({ length: lines }).map((_, i) => (
        <span
          key={i}
          className={`block h-3 rounded bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 bg-[length:200%_100%] animate-[shimmer_1.4s_linear_infinite] ${i === lines - 1 ? "w-3/5" : "w-full"}`}
        />
      ))}
    </div>
  );
}
