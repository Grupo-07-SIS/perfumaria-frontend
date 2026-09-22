import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const sourceRoot = path.resolve("src");
const migratedFeatures = ["decants", "body-splash", "home", "dashboard", "sales", "sales-history", "online-orders", "people", "settings"];
const sourceFiles = (folder: string): string[] => readdirSync(folder, { withFileTypes: true }).flatMap((entry) => {
  const file = path.join(folder, entry.name);
  return entry.isDirectory() ? sourceFiles(file) : /\.tsx?$/.test(file) && !file.includes(".test.") ? [file] : [];
});

describe("Feature boundaries", () => {
  it.each(migratedFeatures)("keeps %s entry as composition and UI away from data sources", (feature) => {
    const folder = path.join(sourceRoot, "features", feature);
    const entry = sourceFiles(folder).find((file) => /Page\.tsx$/.test(file))!;
    const page = readFileSync(entry, "utf8");
    expect(page).toMatch(/use\w+Facade\(\)/);
    expect(page).not.toMatch(/useState|useEffect|useApp|fetch\(/);
    for (const file of sourceFiles(folder)) {
      const source = readFileSync(file, "utf8");
      expect(source, file).not.toMatch(/from ["'][^"']*app\//);
      if (file.includes(`${path.sep}components${path.sep}`)) {
        expect(source, file).not.toMatch(/import (?!type\b)[^;]+from ["'][^"']*(?:repository\/|core\/store|core\/services)/);
      }
    }
  });

  it("keeps legacy pages as compatibility exports", () => {
    for (const file of sourceFiles(path.join(sourceRoot, "app", "pages"))) {
      expect(readFileSync(file, "utf8").trim(), file).toMatch(/^export \{[^}]+\} from ["'][^"']+["'];?$/);
    }
  });
});