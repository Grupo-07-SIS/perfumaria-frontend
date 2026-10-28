import { describe, expect, it } from "vitest";
import {
  toProductCategoryOption,
  toProductModel,
  toProductRequestDto,
} from "./product.mapper";

describe("productMapper", () => {
  it("maps the backend product dto to the feature model", () => {
    expect(
      toProductModel({
        categoriaNome: "Perfumes",
        estoqueAtual: 8,
        fkCategoria: 2,
        id: 4,
        margem: 32.5,
        marca: "Chanel",
        medida: "ML",
        nome: "Chanel N°5",
        precoCompra: 120,
        precoVenda: 180,
        status: 1,
        tipoProduto: "BODY_SPLASH",
        volume: 100,
      }),
    ).toEqual({
      ativo: 1,
      categoriaId: 2,
      categoriaNome: "Perfumes",
      estoqueAtual: 8,
      id: 4,
      margem: 32.5,
      marca: "Chanel",
      medida: "ML",
      nome: "Chanel N°5",
      precoCompra: 120,
      precoVenda: 180,
      tipoProduto: "BODY_SPLASH",
      volume: 100,
    });
  });

  it("maps category options and form data into request dto", () => {
    expect(toProductCategoryOption({ id: 7, nome: "Kits" })).toEqual({ id: 7, nome: "Kits" });
    expect(
      toProductRequestDto({
        categoriaId: "7",
        estoqueAtual: "5",
        hasVolume: true,
        marca: "  Dior  ",
        medida: "ML",
        nome: "  Sauvage  ",
        precoCompra: "90.5",
        precoVenda: "150,4",
        volume: "100",
      }),
    ).toEqual({
      estoqueAtual: 5,
      fkCategoria: 7,
      marca: "Dior",
      medida: "ML",
      nome: "Sauvage",
      precoCompra: 90.5,
      precoVenda: 150.4,
      tipoProduto: "PERFUME",
      volume: 100,
    });
  });
});