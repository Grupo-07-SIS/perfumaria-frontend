import { describe, expect, it } from "vitest";
import * as peract from "./index";
import * as legacy from "../ui/select";

describe("Peract select compatibility", () => {
  it("preserves Select", () => {
    expect(peract.PeractSelectRoot).toBeDefined();
    expect(peract.PeractSelectRoot).toBe(legacy.Select);
  });
  it("preserves SelectContent", () => {
    expect(peract.PeractSelectContent).toBeDefined();
    expect(peract.PeractSelectContent).toBe(legacy.SelectContent);
  });
  it("preserves SelectGroup", () => {
    expect(peract.PeractSelectGroup).toBeDefined();
    expect(peract.PeractSelectGroup).toBe(legacy.SelectGroup);
  });
  it("preserves SelectItem", () => {
    expect(peract.PeractSelectItem).toBeDefined();
    expect(peract.PeractSelectItem).toBe(legacy.SelectItem);
  });
  it("preserves SelectLabel", () => {
    expect(peract.PeractSelectLabel).toBeDefined();
    expect(peract.PeractSelectLabel).toBe(legacy.SelectLabel);
  });
  it("preserves SelectScrollDownButton", () => {
    expect(peract.PeractSelectScrollDownButton).toBeDefined();
    expect(peract.PeractSelectScrollDownButton).toBe(legacy.SelectScrollDownButton);
  });
  it("preserves SelectScrollUpButton", () => {
    expect(peract.PeractSelectScrollUpButton).toBeDefined();
    expect(peract.PeractSelectScrollUpButton).toBe(legacy.SelectScrollUpButton);
  });
  it("preserves SelectSeparator", () => {
    expect(peract.PeractSelectSeparator).toBeDefined();
    expect(peract.PeractSelectSeparator).toBe(legacy.SelectSeparator);
  });
  it("preserves SelectTrigger", () => {
    expect(peract.PeractSelectTrigger).toBeDefined();
    expect(peract.PeractSelectTrigger).toBe(legacy.SelectTrigger);
  });
  it("preserves SelectValue", () => {
    expect(peract.PeractSelectValue).toBeDefined();
    expect(peract.PeractSelectValue).toBe(legacy.SelectValue);
  });
});
