import { describe, expect, it } from "vitest";
import * as peract from "./index";
import * as legacy from "../ui/avatar";

describe("Peract avatar compatibility", () => {
  it("preserves Avatar", () => {
    expect(peract.PeractAvatar).toBeDefined();
    expect(peract.PeractAvatar).toBe(legacy.Avatar);
  });
  it("preserves AvatarImage", () => {
    expect(peract.PeractAvatarImage).toBeDefined();
    expect(peract.PeractAvatarImage).toBe(legacy.AvatarImage);
  });
  it("preserves AvatarFallback", () => {
    expect(peract.PeractAvatarFallback).toBeDefined();
    expect(peract.PeractAvatarFallback).toBe(legacy.AvatarFallback);
  });
});
