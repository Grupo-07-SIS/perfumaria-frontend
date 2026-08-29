import { environment } from "../../../environment";
import type { LoginRequestDto } from "./dto/login-request.dto";
import type { LoginResponseDto } from "./dto/login-response.dto";

interface AuthenticateParams {
  credentials: LoginRequestDto;
}

export const loginRepository = {
  async authenticate({ credentials }: AuthenticateParams): Promise<LoginResponseDto> {
    const response = await fetch(`${environment.backendUrl}/auth/login`, {
      body: JSON.stringify(credentials),
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
    });

    if (!response.ok) {
      throw new Error(`LOGIN_REQUEST_FAILED:${response.status}`);
    }

    return response.json() as Promise<LoginResponseDto>;
  },
};