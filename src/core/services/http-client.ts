import axios from "axios";
import { environment } from "../../environment";
import { tokenService } from "../auth/token.service";
import { sessionService } from "../auth/session.service";

export const apiClient = axios.create({
  baseURL: environment.backendUrl,
  withCredentials: true,
});

apiClient.interceptors.request.use((config) => {
  const accessToken = tokenService.get();

  if (accessToken) {
    config.headers.set("Authorization", `Bearer ${accessToken}`);
  }

  return config;
});

apiClient.interceptors.response.use(
  response => response,
  error => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      const path = error.config?.url?.split("?")[0];
      const isCredentialRequest = path === "/auth/login" || path === "/auth/alterar-senha" || path === "/auth/alterar-email";
      const accessToken = tokenService.get();
      if (!isCredentialRequest && (!accessToken || error.config?.headers.get("Authorization") === `Bearer ${accessToken}`)) {
        sessionService.clear();
      }
    }
    return Promise.reject(error);
  },
);