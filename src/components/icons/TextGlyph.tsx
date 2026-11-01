/**
 * The few glyphs that sit inside a line of words, not beside it as a picture: the arrow in "Next →", "← Back" and the text arrows
 * of arrowText.tsx, the ♪ in a sung line, and a tick inside a sentence. They take the text's own colour so they belong to the word
 * they mark, at 12-18 px, where a painted object would smear (reference/qa-reports/icons-painted/INVENTORY.md, group E). Drawn in
 * the painted family's way: a chunky rounded stroke with the dark ink outline the painted icons end on. Everything that stands
 * alone as an icon is a <PaintedIcon>.
 */
import React from 'react';

export type TextGlyphName = 'arrow' | 'note' | 'check';

const INK = 'rgba(40, 22, 8, .55)';
const PATH: Record<TextGlyphName, string> = {
  arrow: 'M4.5 12h14M12.5 5.5 19 12l-6.5 6.5',
  check: 'M4.8 12.6l4.8 4.8 9.6-10.2',
  note: 'M9 17.5V6.5l10-2.3v11',
};

export const TextGlyph: React.FC<{ name: TextGlyphName; size?: number | string; rotate?: number; className?: string; label?: string }> = ({
  name,
  size = '1em',
  rotate,
  className,
  label,
}) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    className={className ? `tg ${className}` : 'tg'}
    style={rotate ? { transform: `rotate(${rotate}deg)` } : undefined}
    role={label ? 'img' : undefined}
    aria-label={label}
    aria-hidden={label ? undefined : true}
    focusable="false"
  >
    <path d={PATH[name]} fill="none" stroke={INK} strokeWidth={5.2} strokeLinecap="round" strokeLinejoin="round" />
    <path d={PATH[name]} fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
    {name === 'note' && (
      <>
        <ellipse cx="6.6" cy="17.8" rx="3" ry="2.4" transform="rotate(-18 6.6 17.8)" fill="currentColor" stroke={INK} strokeWidth={1.2} />
        <ellipse cx="16.6" cy="15.6" rx="3" ry="2.4" transform="rotate(-18 16.6 15.6)" fill="currentColor" stroke={INK} strokeWidth={1.2} />
      </>
    )}
  </svg>
);
