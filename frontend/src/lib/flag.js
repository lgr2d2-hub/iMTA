// ISO 3166-1 alpha-2 country code → flag emoji
export function codeToFlag(code) {
  if (!code || typeof code !== "string" || code.length !== 2) return "🌍";
  const upper = code.toUpperCase();
  const A = 0x1F1E6;
  const a = "A".charCodeAt(0);
  try {
    return String.fromCodePoint(
      A + upper.charCodeAt(0) - a,
      A + upper.charCodeAt(1) - a,
    );
  } catch {
    return "🌍";
  }
}

// Prefer the explicit flag stored on user; fall back to code-derived emoji.
export function userFlag(user) {
  if (!user) return "🌍";
  if (user.country_flag) return user.country_flag;
  return codeToFlag(user.country_code);
}
