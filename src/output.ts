import TurndownService from "turndown";

export function formatTable(headers: string[], rows: string[][]): string {
  const colWidths = headers.map((h, i) => {
    const maxRow = rows.reduce(
      (max, row) => Math.max(max, (row[i] || "").length),
      0
    );
    return Math.max(h.length, maxRow);
  });

  const headerLine = headers
    .map((h, i) => h.padEnd(colWidths[i]))
    .join("  ");
  const separator = colWidths.map((w) => "-".repeat(w)).join("  ");
  const bodyLines = rows.map((row) =>
    row.map((cell, i) => (cell || "").padEnd(colWidths[i])).join("  ")
  );

  return [headerLine, separator, ...bodyLines].join("\n");
}

export function formatJson(data: unknown): string {
  return JSON.stringify(data, null, 2);
}

let turndownInstance: TurndownService | null = null;

export function htmlToMarkdown(html: string): string {
  if (!turndownInstance) {
    turndownInstance = new TurndownService({
      headingStyle: "atx",
      codeBlockStyle: "fenced",
    });
  }
  return turndownInstance.turndown(html || "");
}
