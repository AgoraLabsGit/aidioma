import type { CorrectionPresentation } from "@/lib/evaluation/contracts";

export function correctionSegments(presentation: CorrectionPresentation) {
  const { text, highlights } = presentation;
  const segments: { className?: string; key: string; value: string }[] = [];
  let cursor = 0;
  highlights.forEach((highlight, index) => {
    if (highlight.start > cursor) {
      segments.push({
        key: `plain-${cursor}`,
        value: text.slice(cursor, highlight.start),
      });
    }
    segments.push({
      className:
        highlight.kind === "spelling" ? "correction-segment correction-close" : "correction-segment correction-changed",
      key: `mark-${index}-${highlight.start}`,
      value: text.slice(highlight.start, highlight.end),
    });
    cursor = highlight.end;
  });
  if (cursor < text.length) {
    segments.push({ key: `plain-${cursor}`, value: text.slice(cursor) });
  }
  return segments.length > 0 ? segments : [{ key: "plain-0", value: text }];
}
