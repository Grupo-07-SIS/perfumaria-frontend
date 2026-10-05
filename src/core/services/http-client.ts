import axios from "axios";
import { environment } from "../../environment";
import { tokenService } from "../auth/token.service";

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