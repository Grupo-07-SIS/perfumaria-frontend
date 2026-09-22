import { describe, expect, it } from "vitest";
import * as peract from "./index";
import * as legacy from "../ui/accordion";

describe("Peract accordion compatibility", () => {
  it("preserves Accordion", () => {
    expect(peract.PeractAccordion).toBeDefined();
    expect(peract.PeractAccordion).toBe(legacy.Accordion);
  });
  it("preserves AccordionItem", () => {
    expect(peract.PeractAccordionItem).toBeDefined();
    expect(peract.PeractAccordionItem).toBe(legacy.AccordionItem);
  });
  it("preserves AccordionTrigger", () => {
    expect(peract.PeractAccordionTrigger).toBeDefined();
    expect(peract.PeractAccordionTrigger).toBe(legacy.AccordionTrigger);
  });
  it("preserves AccordionContent", () => {
    expect(peract.PeractAccordionContent).toBeDefined();
    expect(peract.PeractAccordionContent).toBe(legacy.AccordionContent);
  });
});
