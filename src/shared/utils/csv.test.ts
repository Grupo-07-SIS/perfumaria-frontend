import { describe, expect, it } from "vitest";
import { serializeCsv } from "./csv";

describe("serializeCsv", () => {
  it.each(["=1+1", "+1+1", "-1+1", "@SUM(A1)", "  =1+1", "\t=1+1", "\r\n@text", "\u0000=1+1"])("neutralizes formula-like text %j", value => {
    expect(serializeCsv([[value]])).toBe(`"'${value}"`);
  });

  it("quotes separators, quotes and multiline cells without creating extra columns", () => {
    expect(serializeCsv([['Nome; "especial"\nsegunda linha', 12.5], ["Sauvage", 2]]))
      .toBe('"Nome; ""especial""\nsegunda linha";"12.5"\r\n"Sauvage";"2"');
  });

  it("preserves trusted numeric values and empty cells", () => {
    expect(serializeCsv([[-12.5, 0, null, undefined]])).toBe('"-12.5";"0";"";""');
  });
});
