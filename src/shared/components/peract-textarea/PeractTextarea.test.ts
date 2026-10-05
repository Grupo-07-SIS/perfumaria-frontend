import { describe, expect, it } from "vitest";
import * as peract from "./index";
import * as legacy from "../ui/textarea";

describe("Peract textarea compatibility", () => {
  it("preserves Textarea", () => {
    expect(peract.PeractTextarea).toBeDefined();
    expect(peract.PeractTextarea).toBe(legacy.Textarea);
  });
});
