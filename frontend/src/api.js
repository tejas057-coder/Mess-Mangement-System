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
