import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SEARCH_DEBOUNCE_MS, useDebouncedValue } from "./useDebouncedValue";

describe("useDebouncedValue", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns the initial value immediately", () => {
    const { result } = renderHook(() => useDebouncedValue("a"));

    expect(result.current).toBe("a");
  });

  it("only publishes the latest value after the delay without new changes", () => {
    const { result, rerender } = renderHook(({ value }) => useDebouncedValue(value), {
      initialProps: { value: "" },
    });

    rerender({ value: "A" });
    act(() => vi.advanceTimersByTime(SEARCH_DEBOUNCE_MS - 1));
    rerender({ value: "AB" });
    act(() => vi.advanceTimersByTime(SEARCH_DEBOUNCE_MS - 1));

    expect(result.current).toBe("");

    rerender({ value: "ABC" });
    act(() => vi.advanceTimersByTime(SEARCH_DEBOUNCE_MS));

    expect(result.current).toBe("ABC");
  });

  it("respects a custom delay", () => {
    const { result, rerender } = renderHook(({ value }) => useDebouncedValue(value, 50), {
      initialProps: { value: "x" },
    });

    rerender({ value: "y" });
    act(() => vi.advanceTimersByTime(50));

    expect(result.current).toBe("y");
  });
});
