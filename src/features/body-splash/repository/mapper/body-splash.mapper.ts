import type { BodySplashItem, BodySplashModalFormValues, BodySplashProductOption } from "../../models/body-splash.models";
import type { BodySplashRequestDto } from "../dto/body-splash-request.dto";
import type { BodySplashProductDto, BodySplashResponseDto } from "../dto/body-splash-response.dto";

function parseDecimal(value: string) {
  return Number(value.replace(",", "."));
}

export function toBodySplashModel(dto: BodySplashResponseDto, produtoId?: number): BodySplashItem {
  return {
    id: dto.id,
    produtoId,
    produto: dto.produtoNome,
    preco10ml: dto.preco10ml,
    preco15ml: dto.preco15ml,
    preco20ml: dto.preco20ml,
    preco25ml: dto.preco25ml,
    preco30ml: dto.preco30ml,
  };
}

export function toBodySplashProductOption(dto: BodySplashProductDto): BodySplashProductOption {
  return { id: dto.id, nome: dto.nome };
}

export function toBodySplashRequestDto(values: BodySplashModalFormValues): BodySplashRequestDto {
  return {
    produtoId: Number(values.produtoId),
    preco10ml: parseDecimal(values.precos.preco10ml),
    preco15ml: parseDecimal(values.precos.preco15ml),
    preco20ml: parseDecimal(values.precos.preco20ml),
    preco25ml: parseDecimal(values.precos.preco25ml),
    preco30ml: parseDecimal(values.precos.preco30ml),
  };
}