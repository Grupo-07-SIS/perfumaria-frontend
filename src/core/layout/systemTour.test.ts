import { describe, expect, it } from "vitest";
import { getSystemTourSections, getSystemTourSteps } from "./systemTour";

describe("system tour steps", () => {
  it("includes only routes available to employees", () => {
    const routes = new Set(getSystemTourSteps(false).map(step => step.route));

    expect(routes).toEqual(new Set([
      "/",
      "/decants",
      "/bodysplash",
      "/vendas/registrar",
    ]));
    expect([...routes].some(route => route.startsWith("/estoque/") || route === "/clientes" || route === "/configuracoes")).toBe(false);
  });

  it("adds stock, categories, people and settings sections for admins", () => {
    const routes = new Set(getSystemTourSteps(true).map(step => step.route));

    expect(routes).toEqual(new Set([
      "/",
      "/estoque/produtos",
      "/estoque/categorias",
      "/decants",
      "/bodysplash",
      "/vendas/registrar",
      "/vendas/historico",
      "/vendas/pedidos",
      "/clientes",
      "/configuracoes",
    ]));
    expect(getSystemTourSteps(true).every(step => step.target.startsWith("[data-tour="))).toBe(true);
  });

  it("exposes independent guided sections for people and account settings", () => {
    const sections = getSystemTourSections(true);
    const ids = sections.map(section => section.id);
    expect(ids).toEqual(["home", "stock", "decants", "body-splash", "sales", "people", "settings"]);
    expect(sections.find(section => section.id === "stock")?.subsections?.map(section => section.id)).toEqual(["products", "categories"]);
    expect(sections.find(section => section.id === "sales")?.subsections?.map(section => section.id)).toEqual(["sale", "sales-history", "online-orders"]);
    expect(sections.find(section => section.id === "people")?.subsections?.map(section => section.id)).toEqual(["people-clients", "people-suppliers", "people-employees"]);
    expect(sections.find(section => section.id === "settings")?.subsections?.map(section => section.id)).toEqual(["settings-stock", "settings-security"]);
    const employeeSections = getSystemTourSections(false);
    expect(employeeSections.map(section => section.id)).toEqual(["home", "decants", "body-splash", "sales"]);
    expect(employeeSections.find(section => section.id === "sales")?.subsections?.map(section => section.id)).toEqual(["sale"]);
    expect(employeeSections.find(section => section.id === "decants")?.steps[0].content).toContain("Consulte os preços");

    const peopleSections = sections.find(section => section.id === "people")?.subsections ?? [];
    expect(peopleSections.find(section => section.id === "people-suppliers")?.steps[2].beforeTargetSelector).toBe("[data-tour='tour-people-tab-suppliers']");
    expect(peopleSections.find(section => section.id === "people-employees")?.steps[2].beforeTargetSelector).toBe("[data-tour='tour-people-tab-employees']");
    expect(sections.find(section => section.id === "settings")?.subsections?.find(section => section.id === "settings-security")?.steps[0].beforeTargetSelector).toBe("[data-tour='tour-settings-security-tab']");
  });
});
