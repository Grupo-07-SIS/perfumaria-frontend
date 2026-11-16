import { describe, expect, it, vi } from "vitest";
import { getSystemTourSections, getSystemTourSteps } from "./systemTour";

describe("system tour steps", () => {
  it("includes only routes available to employees", () => {
    const routes = new Set(getSystemTourSteps(false).map(step => step.route));

    expect(routes).toEqual(new Set([
      "/",
      "/decants",
      "/bodysplash",
      "/vendas/registrar",
      "/vendas/pedidos",
      "/configuracoes",
    ]));
    expect([...routes].some(route => route.startsWith("/estoque/") || route === "/clientes" || route === "/vendas/historico")).toBe(false);
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
    expect(getSystemTourSteps(true).every(step => typeof step.target === "string" && step.target.startsWith("[data-tour="))).toBe(true);
  });

  it("follows the sidebar order and exposes only the subsections available to each role", () => {
    const sections = getSystemTourSections(true);
    const ids = sections.map(section => section.id);
    expect(ids).toEqual(["home", "stock", "sales", "people", "settings"]);
    expect(sections[0].title).toBe("Início");
    expect(sections.find(section => section.id === "stock")?.subsections?.map(section => section.id)).toEqual(["products", "body-splash", "decants", "categories"]);
    expect(sections.find(section => section.id === "sales")?.subsections?.map(section => section.id)).toEqual(["sale", "sales-history", "online-orders"]);
    expect(sections.find(section => section.id === "people")?.subsections?.map(section => section.id)).toEqual(["people-clients", "people-suppliers", "people-employees"]);
    expect(sections.find(section => section.id === "settings")?.subsections?.map(section => section.id)).toEqual(["settings-stock", "settings-security"]);
    const employeeSections = getSystemTourSections(false);
    expect(employeeSections.map(section => section.id)).toEqual(["home", "stock", "sales", "settings"]);
    expect(employeeSections.find(section => section.id === "stock")?.subsections?.map(section => section.id)).toEqual(["body-splash", "decants"]);
    expect(employeeSections.find(section => section.id === "sales")?.subsections?.map(section => section.id)).toEqual(["sale", "online-orders"]);
    expect(employeeSections.find(section => section.id === "settings")?.subsections?.map(section => section.id)).toEqual(["settings-security"]);
    expect(employeeSections.find(section => section.id === "stock")?.subsections?.find(section => section.id === "decants")?.steps[0].content).toContain("Consulte os preços");

    const peopleSections = sections.find(section => section.id === "people")?.subsections ?? [];
    expect(peopleSections.find(section => section.id === "people-clients")?.steps[2].beforeTargetSelector).toBe("[data-tour='tour-people-tab-clients']");
    expect(peopleSections.find(section => section.id === "people-suppliers")?.steps[2].beforeTargetSelector).toBe("[data-tour='tour-people-tab-suppliers']");
    expect(peopleSections.find(section => section.id === "people-employees")?.steps[2].beforeTargetSelector).toBe("[data-tour='tour-people-tab-employees']");
    expect(sections.find(section => section.id === "settings")?.subsections?.find(section => section.id === "settings-security")?.steps[0].beforeTargetSelector).toBe("[data-tour='tour-settings-security-tab']");
  });

  it("explains the current navigation and dashboard controls", () => {
    const steps = getSystemTourSections(true).find(section => section.id === "home")?.steps ?? [];
    expect(steps.find(step => step.title === "Navegação lateral")).toMatchObject({
      target: '[data-tour="tour-sidebar-navigation"]',
      compactTargetSelector: '[data-tour="tour-mobile-navigation"]',
    });
    expect(steps.find(step => step.title === "Período")?.target).toBe('[data-tour="tour-home-period"]');
    expect(steps.find(step => step.title === "Indicadores")?.content).toContain("por canal");
    expect(getSystemTourSections(false).find(section => section.id === "home")?.steps.some(step => step.title === "Período")).toBe(false);
  });

  it("omits the security-question step when the feature is disabled", async () => {
    vi.stubEnv("VITE_SECURITY_QUESTIONS_ENABLED", "false");
    vi.resetModules();
    try {
      const { getSystemTourSteps: getStepsWithFlag } = await import("./systemTour");
      expect(getStepsWithFlag(true).some(step => step.target === '[data-tour="tour-settings-questions"]')).toBe(false);
      expect(getStepsWithFlag(false).some(step => step.target === '[data-tour="tour-settings-password"]')).toBe(true);
      const { getSystemTourSections: getSectionsWithFlag } = await import("./systemTour");
      const security = getSectionsWithFlag(true).find(section => section.id === "settings")?.subsections?.find(section => section.id === "settings-security");
      expect(security?.description).not.toContain("Perguntas");
    } finally {
      vi.unstubAllEnvs();
      vi.resetModules();
    }
  });
});
