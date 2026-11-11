/* csv.ts
 * Minimal, safe CSV builder — CRLF line endings (Excel-friendly),
 * double-quoted escaping, and spreadsheet-injection guard for text cells.
 */

type Cell = string | number | null | undefined

const escapeCell = (cell: Cell): string => {
  if (typeof cell === "number") {
    return Number.isFinite(cell) ? String(Math.round(cell * 100) / 100) : ""
  }
  let s = cell == null ? "" : String(cell)
  // Formula-injection guard for text cells
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`
  if (/[",\r\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`
  return s
}

export function toCsv(rows: Cell[][]): string {
  return rows.map((row) => row.map(escapeCell).join(",")).join("\r\n")
}

export function csvResponse(filename: string, csv: string): Response {
  return new Response(`﻿${csv}`, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename.replace(/[^A-Za-z0-9._-]/g, "_")}"`,
      "Cache-Control": "no-store",
    },
  })
}
