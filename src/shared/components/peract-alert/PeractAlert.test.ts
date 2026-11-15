import { describe, expect, it } from "vitest";
import * as peract from "./index";
import * as legacy from "../ui/alert";

describe("Peract alert compatibility", () => {
  it("preserves Alert", () => {
    expect(peract.PeractAlert).toBeDefined();
    expect(peract.PeractAlert).toBe(legacy.Alert);
  });
  it("preserves AlertTitle", () => {
    expect(peract.PeractAlertTitle).toBeDefined();
    expect(peract.PeractAlertTitle).toBe(legacy.AlertTitle);
  });
  it("preserves AlertDescription", () => {
    expect(peract.PeractAlertDescription).toBeDefined();
    expect(peract.PeractAlertDescription).toBe(legacy.AlertDescription);
  });
});
