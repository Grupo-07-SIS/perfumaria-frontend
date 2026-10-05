import { Endereco } from "../../../core/store/AppContext";
export const ACC = "#c29958";
export const DARK = "#050300";
export const WARM = "#f5ede0";
export const UF_LIST = ["AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO"];
export const EMPTY_ENDERECO: Endereco = {
  cep: "",
  logradouro: "",
  numero: "",
  complemento: "",
  bairro: "",
  cidade: "",
  uf: ""
};
