/** Round away floating-point noise (0.1 + 0.2) to 3 decimal places. */
export function roundQty(n: number): number {
  return Math.round(n * 1000) / 1000;
}

/** Display a quantity: whole numbers plain, common fractions as glyphs, else up to 2 decimals. */
export function formatQty(n: number): string {
  const whole = Math.floor(n);
  const frac = roundQty(n - whole);
  const glyphs: Record<string, string> = { '0.25': '¼', '0.5': '½', '0.75': '¾', '0.333': '⅓', '0.667': '⅔' };
  if (frac === 0) return String(whole);
  const glyph = glyphs[String(frac)];
  if (glyph) return whole === 0 ? glyph : `${whole}${glyph}`;
  return String(Math.round(n * 100) / 100);
}

/** Normalize text for comparison and search: trim, lowercase, collapse spaces. */
export function normalize(s: string): string {
  return s.trim().toLowerCase().replace(/\s+/g, ' ');
}
