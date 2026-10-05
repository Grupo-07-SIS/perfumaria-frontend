import type { BodySplashItem } from "../models/body-splash.models";
export const ACC = "#c29958";
export const DARK = "#050300";
export const WARM = "#f5ede0";
export const VOLUMES: Array<{
  key: keyof Omit<BodySplashItem, "id" | "produto" | "produtoId">;
  label: string;
}> = [{
  key: "preco10ml",
  label: "10ml"
}, {
  key: "preco15ml",
  label: "15ml"
}, {
  key: "preco20ml",
  label: "20ml"
}, {
  key: "preco25ml",
  label: "25ml"
}, {
  key: "preco30ml",
  label: "30ml"
}];
