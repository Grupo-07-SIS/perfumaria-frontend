import { describe, expect, it } from "vitest";
import * as peract from "./index";
import * as legacy from "../ui/form";

describe("Peract form compatibility", () => {
  it("preserves useFormField", () => {
    expect(peract.usePeractFormField).toBeDefined();
    expect(peract.usePeractFormField).toBe(legacy.useFormField);
  });
  it("preserves Form", () => {
    expect(peract.PeractForm).toBeDefined();
    expect(peract.PeractForm).toBe(legacy.Form);
  });
  it("preserves FormItem", () => {
    expect(peract.PeractFormItem).toBeDefined();
    expect(peract.PeractFormItem).toBe(legacy.FormItem);
  });
  it("preserves FormLabel", () => {
    expect(peract.PeractFormLabel).toBeDefined();
    expect(peract.PeractFormLabel).toBe(legacy.FormLabel);
  });
  it("preserves FormControl", () => {
    expect(peract.PeractFormControl).toBeDefined();
    expect(peract.PeractFormControl).toBe(legacy.FormControl);
  });
  it("preserves FormDescription", () => {
    expect(peract.PeractFormDescription).toBeDefined();
    expect(peract.PeractFormDescription).toBe(legacy.FormDescription);
  });
  it("preserves FormMessage", () => {
    expect(peract.PeractFormMessage).toBeDefined();
    expect(peract.PeractFormMessage).toBe(legacy.FormMessage);
  });
  it("preserves FormField", () => {
    expect(peract.PeractFormField).toBeDefined();
    expect(peract.PeractFormField).toBe(legacy.FormField);
  });
});
