import { describe, expect, it } from "vitest";
import * as peract from "./index";
import * as legacy from "../ui/pagination";

describe("Peract pagination compatibility", () => {
  it("preserves Pagination", () => {
    expect(peract.PeractPaginationRoot).toBeDefined();
    expect(peract.PeractPaginationRoot).toBe(legacy.Pagination);
  });
  it("preserves PaginationContent", () => {
    expect(peract.PeractPaginationContent).toBeDefined();
    expect(peract.PeractPaginationContent).toBe(legacy.PaginationContent);
  });
  it("preserves PaginationLink", () => {
    expect(peract.PeractPaginationLink).toBeDefined();
    expect(peract.PeractPaginationLink).toBe(legacy.PaginationLink);
  });
  it("preserves PaginationItem", () => {
    expect(peract.PeractPaginationItem).toBeDefined();
    expect(peract.PeractPaginationItem).toBe(legacy.PaginationItem);
  });
  it("preserves PaginationPrevious", () => {
    expect(peract.PeractPaginationPrevious).toBeDefined();
    expect(peract.PeractPaginationPrevious).toBe(legacy.PaginationPrevious);
  });
  it("preserves PaginationNext", () => {
    expect(peract.PeractPaginationNext).toBeDefined();
    expect(peract.PeractPaginationNext).toBe(legacy.PaginationNext);
  });
  it("preserves PaginationEllipsis", () => {
    expect(peract.PeractPaginationEllipsis).toBeDefined();
    expect(peract.PeractPaginationEllipsis).toBe(legacy.PaginationEllipsis);
  });
});
