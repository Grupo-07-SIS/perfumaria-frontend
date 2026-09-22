import { describe, expect, it } from "vitest";

const legacyModules = import.meta.glob<Record<string, unknown>>("./ui/*.tsx", { eager: true });
const peractModules = import.meta.glob<Record<string, unknown>>("./peract-*/index.ts", { eager: true });
const names: Record<string, string> = {
  Button: "PeractButtonPrimitive",
  Card: "PeractCardPrimitive",
  Input: "PeractInputControl",
  Select: "PeractSelectRoot",
  Table: "PeractTableRoot",
  Pagination: "PeractPaginationRoot",
};

describe("Peract public catalog", () => {
  for (const [path, legacy] of Object.entries(legacyModules)) {
    const component = path.split("/").pop()!.replace(".tsx", "");
    it(`${component} exposes its legacy API through the Peract entry point`, () => {
      const migrated = peractModules[`./peract-${component}/index.ts`];
      expect(migrated, `Missing Peract entry point: ${component}`).toBeDefined();
      for (const [name, implementation] of Object.entries(legacy)) {
        const publicName = names[name] ?? (name.startsWith("use")
          ? `usePeract${name.slice(3)}`
          : /^[A-Z]/.test(name) ? `Peract${name}` : `peract${name[0].toUpperCase()}${name.slice(1)}`);
        expect(migrated[publicName], `${component}: ${publicName}`).toBe(implementation);
      }
    });
  }
});