/**
 * Tiny discovery hint: a quiet mono line ("◇ hold the CTA…") placed next to
 * hard-to-find toys so new visitors can decipher them. Static on purpose —
 * hints must not add motion of their own.
 */
export function HintTag({ text, className }: { text: string; className?: string }) {
  return (
    <span aria-hidden="true" className={`hint-tag ${className ?? ""}`}>
      <span className="hint-tag__glyph">◇</span> {text}
    </span>
  );
}
