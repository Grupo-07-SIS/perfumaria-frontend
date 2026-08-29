import { describe, expect, it } from "vitest";
import { toCategoryModel, toCategoryRequestDto } from "./category.mapper";

describe("categoryMapper", () => {
  it("maps the backend response dto to the feature model", () => {
    expect(
      toCategoryModel({
        id: 10,
        nome: "Perfumes",
        qtdProdVinculados: 4,
      }),
    ).toEqual({
      id: 10,
      linkedProducts: 4,
      nome: "Perfumes",
    });
  });

  it("creates a trimmed request dto", () => {
    expect(toCategoryRequestDto("  Body Splash  ")).toEqual({ nome: "Body Splash" });
  });
});