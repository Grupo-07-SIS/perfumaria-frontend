import { describe, expect, it } from "vitest";
import * as peract from "./index";
import * as legacy from "../ui/table";

describe("Peract table compatibility", () => {
  it("preserves Table", () => {
    expect(peract.PeractTableRoot).toBeDefined();
    expect(peract.PeractTableRoot).toBe(legacy.Table);
  });
  it("preserves TableHeader", () => {
    expect(peract.PeractTableHeader).toBeDefined();
    expect(peract.PeractTableHeader).toBe(legacy.TableHeader);
  });
  it("preserves TableBody", () => {
    expect(peract.PeractTableBody).toBeDefined();
    expect(peract.PeractTableBody).toBe(legacy.TableBody);
  });
  it("preserves TableFooter", () => {
    expect(peract.PeractTableFooter).toBeDefined();
    expect(peract.PeractTableFooter).toBe(legacy.TableFooter);
  });
  it("preserves TableHead", () => {
    expect(peract.PeractTableHead).toBeDefined();
    expect(peract.PeractTableHead).toBe(legacy.TableHead);
  });
  it("preserves TableRow", () => {
    expect(peract.PeractTableRow).toBeDefined();
    expect(peract.PeractTableRow).toBe(legacy.TableRow);
  });
  it("preserves TableCell", () => {
    expect(peract.PeractTableCell).toBeDefined();
    expect(peract.PeractTableCell).toBe(legacy.TableCell);
  });
  it("preserves TableCaption", () => {
    expect(peract.PeractTableCaption).toBeDefined();
    expect(peract.PeractTableCaption).toBe(legacy.TableCaption);
  });
});
