/** Rounded minutes at ~200 wpm, minimum 1. */
export function readTime(body: string): number {
  const words = body.trim().split(/\s+/).length;
  return Math.max(1, Math.round(words / 200));
}
