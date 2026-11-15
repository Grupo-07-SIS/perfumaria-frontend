export const environment = {
  backendUrl: import.meta.env.VITE_BACKEND_URL || (import.meta.env.DEV
    ? "http://localhost:8080"
    : "https://perfumaria-backend-production.up.railway.app"),
  features: {
    securityQuestionsEnabled: import.meta.env.VITE_SECURITY_QUESTIONS_ENABLED !== "false",
  },
} as const;