export const environment = {
  backendUrl: import.meta.env.VITE_BACKEND_URL ?? "http://localhost:8080",
} as const;