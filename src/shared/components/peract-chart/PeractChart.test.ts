import { describe, expect, it } from "vitest";
import * as peract from "./index";
import * as legacy from "../ui/chart";

describe("Peract chart compatibility", () => {
  it("preserves ChartContainer", () => {
    expect(peract.PeractChartContainer).toBeDefined();
    expect(peract.PeractChartContainer).toBe(legacy.ChartContainer);
  });
  it("preserves ChartTooltip", () => {
    expect(peract.PeractChartTooltip).toBeDefined();
    expect(peract.PeractChartTooltip).toBe(legacy.ChartTooltip);
  });
  it("preserves ChartTooltipContent", () => {
    expect(peract.PeractChartTooltipContent).toBeDefined();
    expect(peract.PeractChartTooltipContent).toBe(legacy.ChartTooltipContent);
  });
  it("preserves ChartLegend", () => {
    expect(peract.PeractChartLegend).toBeDefined();
    expect(peract.PeractChartLegend).toBe(legacy.ChartLegend);
  });
  it("preserves ChartLegendContent", () => {
    expect(peract.PeractChartLegendContent).toBeDefined();
    expect(peract.PeractChartLegendContent).toBe(legacy.ChartLegendContent);
  });
  it("preserves ChartStyle", () => {
    expect(peract.PeractChartStyle).toBeDefined();
    expect(peract.PeractChartStyle).toBe(legacy.ChartStyle);
  });
});
