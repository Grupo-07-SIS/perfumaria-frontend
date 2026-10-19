import { apiClient } from "../../../core/services/http-client";
import type { AccountSessionResponseDto, ChangeEmailRequestDto, ChangePasswordRequestDto } from "./dto/account-settings.dto";
import type { OrganizationLimitRequestDto, OrganizationResponseDto } from "./dto/organization.dto";

export const settingsRepository = {
  async getOrganization(id: number): Promise<OrganizationResponseDto> {
    return (await apiClient.get<OrganizationResponseDto>(`/organizacoes/${id}`)).data;
  },
  async updateLimit(id: number, payload: OrganizationLimitRequestDto): Promise<OrganizationResponseDto> {
    return (await apiClient.patch<OrganizationResponseDto>(`/organizacoes/${id}/limite`, payload)).data;
  },
  async changePassword(payload: ChangePasswordRequestDto): Promise<AccountSessionResponseDto> {
    return (await apiClient.patch<AccountSessionResponseDto>("/auth/alterar-senha", payload)).data;
  },
  async changeEmail(payload: ChangeEmailRequestDto): Promise<AccountSessionResponseDto> {
    return (await apiClient.patch<AccountSessionResponseDto>("/auth/alterar-email", payload)).data;
  },
};
