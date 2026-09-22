import { describe, expect, it } from "vitest";
import * as peract from "./index";
import * as legacy from "../ui/calendar";

describe("Peract calendar compatibility", () => {
  it("preserves Calendar", () => {
    expect(peract.PeractCalendar).toBeDefined();
    expect(peract.PeractCalendar).toBe(legacy.Calendar);
  });
});
