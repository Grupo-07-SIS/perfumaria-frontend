export const environment = {
  backendUrl: import.meta.env.VITE_BACKEND_URL || "http://localhost:8080",
  features: {
    securityQuestionsEnabled: import.meta.env.VITE_SECURITY_QUESTIONS_ENABLED !== "false",
  },
} as const;