import { describe, expect, it } from "vitest";
import { toDecantModel, toDecantRequestDto, toPerfumeOption } from "./decant.mapper";

describe("decantMapper", () => {
  it("maps flat prices and keeps the perfume id and display name", () => {
    expect(toDecantModel({
      id: 11,
      perfumeId: 7,
      perfumeNome: "Chanel N°5",
      preco2ml: 12,
      preco3ml: 17,
      preco5ml: 25,
      preco10ml: 45,
    })).toEqual({
      id: 11,
      perfumeId: 7,
      perfume: "Chanel N°5",
      preco2ml: 12,
      preco3ml: 17,
      preco5ml: 25,
      preco10ml: 45,
    });
  });

  it("maps product options and form values to the request", () => {
    expect(toPerfumeOption({ id: 7, nome: "Chanel N°5" })).toEqual({ id: 7, nome: "Chanel N°5" });
    expect(toDecantRequestDto({
      perfumeId: "7",
      preco2ml: "12,50",
      preco3ml: "17",
      preco5ml: "25.25",
      preco10ml: "45",
    })).toEqual({ perfumeId: 7, preco2ml: 12.5, preco3ml: 17, preco5ml: 25.25, preco10ml: 45 });
  });
});