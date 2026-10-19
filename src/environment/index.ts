export const environment = {
  backendUrl: import.meta.env.DEV
    ? "http://localhost:8080"
    : import.meta.env.VITE_BACKEND_URL ?? "https://perfumaria-backend-production.up.railway.app",
} as const;