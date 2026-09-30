import { apiClient } from "../../../core/services/http-client";
import type { OrganizationLimitRequestDto, OrganizationResponseDto } from "./dto/organization.dto";

export const settingsRepository = {
  async getOrganization(id: number): Promise<OrganizationResponseDto> {
    return (await apiClient.get<OrganizationResponseDto>(`/organizacoes/${id}`)).data;
  },
  async updateLimit(id: number, payload: OrganizationLimitRequestDto): Promise<OrganizationResponseDto> {
    return (await apiClient.patch<OrganizationResponseDto>(`/organizacoes/${id}/limite`, payload)).data;
  },
};
