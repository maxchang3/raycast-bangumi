export const formatSummary = (summary?: string) =>
  summary
    ?.split(/\r?\n/)
    .filter(Boolean)
    .map((line) => `<p>${line}</p>`)
    .join("") || "No summary available."
