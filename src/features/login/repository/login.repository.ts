import { authService } from "../../../core/services/auth.service";
import type { Funcionario } from "../../../app/context/AppContext";
import type { LoginRequestDto } from "./dto/login-request.dto";
import { toLoginUserDto } from "./mapper/login-user.mapper";

interface AuthenticateParams {
  credentials: LoginRequestDto;
  users: Funcionario[];
}

export const loginRepository = {
  authenticate({ credentials, users }: AuthenticateParams) {
    return authService.login({
      credentials,
      users: users.map(toLoginUserDto),
    });
  },
};