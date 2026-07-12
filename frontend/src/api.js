// ─────────────────────────────────────────────────────────────
//  API Base URL — works for both local dev and deployed Vercel
//
//  Priority (||  chain):
//  1. VITE_API_URL  — set in .env (local) or Vercel env vars (production)
//  2. Auto-detect   — if running on localhost, use localhost:5000
//  3. Hard fallback — localhost:5000
// ─────────────────────────────────────────────────────────────

const isLocalhost =
  typeof window !== "undefined" &&
  (window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1");

const API_BASE =
  // 1. Explicit env variable (highest priority — set in Vercel dashboard for prod)
  import.meta.env.VITE_API_URL ||
  // 2. Auto-detect: if we're on localhost, use local backend
  (isLocalhost ? "http://localhost:5000" : "") ||
  // 3. Hard fallback
  "http://localhost:5000";

export default API_BASE;
