import { describe, expect, it } from "vitest";
import {
  toBodySplashModel,
  toBodySplashProductOption,
  toBodySplashRequestDto,
} from "./body-splash.mapper";

const response = {
  id: 11,
  produtoNome: "Lavanda & Ylang",
  preco10ml: 8,
  preco15ml: 11,
  preco20ml: 14,
  preco25ml: 17,
  preco30ml: 20,
};

describe("bodySplashMapper", () => {
  it("maps the flat response while accepting an optional resolved product id", () => {
    expect(toBodySplashModel(response, 7)).toEqual({
      id: 11,
      produtoId: 7,
      produto: "Lavanda & Ylang",
      preco10ml: 8,
      preco15ml: 11,
      preco20ml: 14,
      preco25ml: 17,
      preco30ml: 20,
    });
    expect(toBodySplashModel(response)).toEqual({
      id: 11,
      produtoId: undefined,
      produto: "Lavanda & Ylang",
      preco10ml: 8,
      preco15ml: 11,
      preco20ml: 14,
      preco25ml: 17,
      preco30ml: 20,
    });
  });

  it("maps product options and form values to the flat request", () => {
    expect(toBodySplashProductOption({ id: 7, nome: "Lavanda & Ylang" })).toEqual({
      id: 7,
      nome: "Lavanda & Ylang",
    });
    expect(toBodySplashRequestDto({
      produtoId: "7",
      precos: {
        preco10ml: "8,50",
        preco15ml: "11",
        preco20ml: "14.25",
        preco25ml: "17",
        preco30ml: "20",
      },
    })).toEqual({
      produtoId: 7,
      preco10ml: 8.5,
      preco15ml: 11,
      preco20ml: 14.25,
      preco25ml: 17,
      preco30ml: 20,
    });
  });
});