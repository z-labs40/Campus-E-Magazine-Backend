import { TextRange } from "../adapters/models/Suggestion";

export function applySuggestionToContent(
  content: string,
  range: TextRange,
  replacement: string
): string {
  const { start, end } = range;
  if (start < 0 || end > content.length || start >= end) {
    return content;
  }
  return content.slice(0, start) + replacement + content.slice(end);
}
