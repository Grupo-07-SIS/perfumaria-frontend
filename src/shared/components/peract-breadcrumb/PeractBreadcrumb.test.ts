import { describe, expect, it } from "vitest";
import * as peract from "./index";
import * as legacy from "../ui/breadcrumb";

describe("Peract breadcrumb compatibility", () => {
  it("preserves Breadcrumb", () => {
    expect(peract.PeractBreadcrumb).toBeDefined();
    expect(peract.PeractBreadcrumb).toBe(legacy.Breadcrumb);
  });
  it("preserves BreadcrumbList", () => {
    expect(peract.PeractBreadcrumbList).toBeDefined();
    expect(peract.PeractBreadcrumbList).toBe(legacy.BreadcrumbList);
  });
  it("preserves BreadcrumbItem", () => {
    expect(peract.PeractBreadcrumbItem).toBeDefined();
    expect(peract.PeractBreadcrumbItem).toBe(legacy.BreadcrumbItem);
  });
  it("preserves BreadcrumbLink", () => {
    expect(peract.PeractBreadcrumbLink).toBeDefined();
    expect(peract.PeractBreadcrumbLink).toBe(legacy.BreadcrumbLink);
  });
  it("preserves BreadcrumbPage", () => {
    expect(peract.PeractBreadcrumbPage).toBeDefined();
    expect(peract.PeractBreadcrumbPage).toBe(legacy.BreadcrumbPage);
  });
  it("preserves BreadcrumbSeparator", () => {
    expect(peract.PeractBreadcrumbSeparator).toBeDefined();
    expect(peract.PeractBreadcrumbSeparator).toBe(legacy.BreadcrumbSeparator);
  });
  it("preserves BreadcrumbEllipsis", () => {
    expect(peract.PeractBreadcrumbEllipsis).toBeDefined();
    expect(peract.PeractBreadcrumbEllipsis).toBe(legacy.BreadcrumbEllipsis);
  });
});
