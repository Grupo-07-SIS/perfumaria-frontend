import { describe, expect, it } from "vitest";
import * as peract from "./index";
import * as legacy from "../ui/tabs";

describe("Peract tabs compatibility", () => {
  it("preserves Tabs", () => {
    expect(peract.PeractTabs).toBeDefined();
    expect(peract.PeractTabs).toBe(legacy.Tabs);
  });
  it("preserves TabsList", () => {
    expect(peract.PeractTabsList).toBeDefined();
    expect(peract.PeractTabsList).toBe(legacy.TabsList);
  });
  it("preserves TabsTrigger", () => {
    expect(peract.PeractTabsTrigger).toBeDefined();
    expect(peract.PeractTabsTrigger).toBe(legacy.TabsTrigger);
  });
  it("preserves TabsContent", () => {
    expect(peract.PeractTabsContent).toBeDefined();
    expect(peract.PeractTabsContent).toBe(legacy.TabsContent);
  });
});
