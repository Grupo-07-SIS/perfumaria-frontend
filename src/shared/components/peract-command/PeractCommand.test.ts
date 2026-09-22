import { describe, expect, it } from "vitest";
import * as peract from "./index";
import * as legacy from "../ui/command";

describe("Peract command compatibility", () => {
  it("preserves Command", () => {
    expect(peract.PeractCommand).toBeDefined();
    expect(peract.PeractCommand).toBe(legacy.Command);
  });
  it("preserves CommandDialog", () => {
    expect(peract.PeractCommandDialog).toBeDefined();
    expect(peract.PeractCommandDialog).toBe(legacy.CommandDialog);
  });
  it("preserves CommandInput", () => {
    expect(peract.PeractCommandInput).toBeDefined();
    expect(peract.PeractCommandInput).toBe(legacy.CommandInput);
  });
  it("preserves CommandList", () => {
    expect(peract.PeractCommandList).toBeDefined();
    expect(peract.PeractCommandList).toBe(legacy.CommandList);
  });
  it("preserves CommandEmpty", () => {
    expect(peract.PeractCommandEmpty).toBeDefined();
    expect(peract.PeractCommandEmpty).toBe(legacy.CommandEmpty);
  });
  it("preserves CommandGroup", () => {
    expect(peract.PeractCommandGroup).toBeDefined();
    expect(peract.PeractCommandGroup).toBe(legacy.CommandGroup);
  });
  it("preserves CommandItem", () => {
    expect(peract.PeractCommandItem).toBeDefined();
    expect(peract.PeractCommandItem).toBe(legacy.CommandItem);
  });
  it("preserves CommandShortcut", () => {
    expect(peract.PeractCommandShortcut).toBeDefined();
    expect(peract.PeractCommandShortcut).toBe(legacy.CommandShortcut);
  });
  it("preserves CommandSeparator", () => {
    expect(peract.PeractCommandSeparator).toBeDefined();
    expect(peract.PeractCommandSeparator).toBe(legacy.CommandSeparator);
  });
});
