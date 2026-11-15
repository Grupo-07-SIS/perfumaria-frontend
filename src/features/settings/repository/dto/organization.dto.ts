export interface OrganizationResponseDto {
  idOrganizacao: number;
  nome: string;
  limite: number | null;
}

export interface OrganizationLimitRequestDto {
  limite: number;
}