import axios from "axios";
import { apiClient } from "../../../core/services/http-client";
import type { LoginRequestDto } from "./dto/login-request.dto";
import type { LoginResponseDto } from "./dto/login-response.dto";

interface AuthenticateParams {
  credentials: LoginRequestDto;
}

export const loginRepository = {
  async authenticate({ credentials }: AuthenticateParams): Promise<LoginResponseDto> {
    try {
      const response = await apiClient.post<LoginResponseDto>("/auth/login", credentials);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`LOGIN_REQUEST_FAILED:${error.response?.status ?? "unknown"}`);
      }

      throw error;
    }
  },
};