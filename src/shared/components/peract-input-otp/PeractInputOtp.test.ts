import { describe, expect, it } from "vitest";
import * as peract from "./index";
import * as legacy from "../ui/input-otp";

describe("Peract input-otp compatibility", () => {
  it("preserves InputOTP", () => {
    expect(peract.PeractInputOTP).toBeDefined();
    expect(peract.PeractInputOTP).toBe(legacy.InputOTP);
  });
  it("preserves InputOTPGroup", () => {
    expect(peract.PeractInputOTPGroup).toBeDefined();
    expect(peract.PeractInputOTPGroup).toBe(legacy.InputOTPGroup);
  });
  it("preserves InputOTPSlot", () => {
    expect(peract.PeractInputOTPSlot).toBeDefined();
    expect(peract.PeractInputOTPSlot).toBe(legacy.InputOTPSlot);
  });
  it("preserves InputOTPSeparator", () => {
    expect(peract.PeractInputOTPSeparator).toBeDefined();
    expect(peract.PeractInputOTPSeparator).toBe(legacy.InputOTPSeparator);
  });
});
