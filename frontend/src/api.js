// ─────────────────────────────────────────────────────────────
//  API Base URL — works for both local dev and deployed Vercel
//
//  HOW IT WORKS:
//  • Local dev:  reads VITE_API_URL from frontend/.env
//               (set to http://localhost:5000)
//  • Production: reads VITE_API_URL from Vercel dashboard
//               Settings → Environment Variables → VITE_API_URL
//               (set to your Render/Railway backend URL)
//
//  ⚠️  Vercel does NOT read your local .env file.
//      You MUST set VITE_API_URL in the Vercel dashboard!
// ─────────────────────────────────────────────────────────────

const envURL = import.meta.env.VITE_API_URL;

const isLocalhost =
  typeof window !== "undefined" &&
  (window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1");

const API_BASE =
  // 1. Explicit env variable — MUST be set in Vercel dashboard for prod
  (envURL && envURL.trim() !== "" ? envURL.trim() : null) ||
  // 2. Auto-detect localhost
  (isLocalhost ? "http://localhost:5000" : null) ||
  // 3. Hard fallback (should never reach this in production)
  "http://localhost:5000";

if (!isLocalhost && !envURL) {
  console.warn(
    "[MessMate] ⚠️ VITE_API_URL is not set!\n" +
    "Go to Vercel → Settings → Environment Variables\n" +
    "and add: VITE_API_URL = https://your-backend.onrender.com"
  );
}

export default API_BASE;
