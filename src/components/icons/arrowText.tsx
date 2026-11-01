import { TextGlyph } from './TextGlyph.tsx';
import React from 'react';
import { Icon } from './index.tsx';

export type ArrowDir = 'l' | 'r' | 'u' | 'd';
export type ArrowPiece = { text: string } | { arrow: ArrowDir };

const DIRS: Record<string, ArrowDir> = { '←': 'l', '→': 'r', '↑': 'u', '↓': 'd' };
const TURN: Record<ArrowDir, number> = { r: 0, d: 90, l: 180, u: 270 };

/** a string cut into plain text and the four arrow characters (the control hints are written with them) */
export function splitArrows(text: string): ArrowPiece[] {
  const out: ArrowPiece[] = [];
  let run = '';
  for (const ch of text) {
    const d = DIRS[ch];
    if (d) {
      if (run) out.push({ text: run });
      run = '';
      out.push({ arrow: d });
    } else run += ch;
  }
  if (run) out.push({ text: run });
  return out;
}

/** control hints such as "Slide ← → to run": the arrow characters drawn as the game's own arrow icon, so they look the same on every phone */
export function arrowText(text: string, size: number | string = '0.95em'): React.ReactNode {
  const parts = splitArrows(text);
  if (parts.length === 1 && 'text' in parts[0]) return text;
  return parts.map((p, i) => ('arrow' in p ? <TextGlyph key={i} name="arrow" size={size} rotate={TURN[p.arrow]} className="ic-arrow" /> : <React.Fragment key={i}>{p.text}</React.Fragment>));
}
