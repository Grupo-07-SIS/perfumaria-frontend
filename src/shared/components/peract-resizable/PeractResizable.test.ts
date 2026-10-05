import { describe, expect, it } from "vitest";
import * as peract from "./index";
import * as legacy from "../ui/resizable";

describe("Peract resizable compatibility", () => {
  it("preserves ResizablePanelGroup", () => {
    expect(peract.PeractResizablePanelGroup).toBeDefined();
    expect(peract.PeractResizablePanelGroup).toBe(legacy.ResizablePanelGroup);
  });
  it("preserves ResizablePanel", () => {
    expect(peract.PeractResizablePanel).toBeDefined();
    expect(peract.PeractResizablePanel).toBe(legacy.ResizablePanel);
  });
  it("preserves ResizableHandle", () => {
    expect(peract.PeractResizableHandle).toBeDefined();
    expect(peract.PeractResizableHandle).toBe(legacy.ResizableHandle);
  });
});
