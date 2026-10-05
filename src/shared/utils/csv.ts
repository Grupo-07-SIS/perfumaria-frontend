type CsvCell = string | number | null | undefined;

export function serializeCsv(rows: readonly (readonly CsvCell[])[]): string {
  return rows.map(row => row.map(cell => {
    const value = String(cell ?? "");
    const safeValue = typeof cell === "string" && /^[\s\u0000-\u001f]*[=+\-@]/.test(value)
      ? `'${value}` : value;
    return `"${safeValue.replace(/"/g, '""')}"`;
  }).join(";")).join("\r\n");
}
