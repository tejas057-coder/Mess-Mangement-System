// Central API base URL — reads from VITE_API_URL env variable.
// Local:      http://localhost:5000  (set in frontend/.env)
// Production: your deployed backend URL (set in Vercel environment variables)
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default API_BASE;
