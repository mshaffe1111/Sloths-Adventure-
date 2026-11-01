/**
 * The game's icon names and the painted kit pieces (icons-painted, 2026-11-01).
 *
 * Every icon a player sees is a painted object drawn by <PaintedIcon> (./PaintedIcon.tsx; how they are made:
 * reference/methods/icons.md), or, inside a line of words, a <TextGlyph> (./TextGlyph.tsx). The old vector glyph set that lived here
 * was replaced outright and deleted; iconRegister.test.ts keeps it from coming back. What stays: the names (stage types, badges and
 * speakers still name their icon this way, and PAINTED_FOR maps each to its painted object) and KitPiece, which draws the 10-30 kit
 * sheet's painted stars and lock badge.
 */
import React from 'react';
import { UI_KIT, UI_KIT_SIZE } from '../../game/uiKitData.ts';

export type IconName =
  // the general set
  | 'lock' | 'star' | 'heart' | 'thornHeart' | 'trophy' | 'book' | 'scroll' | 'map' | 'leaf' | 'flower' | 'sparkle' | 'note'
  | 'shield' | 'swords' | 'boot' | 'key' | 'bolt' | 'paw' | 'magnet' | 'bulb' | 'compass' | 'crown' | 'check' | 'cross' | 'arrow'
  // a few more the menus and badges need
  | 'medal' | 'burst' | 'ghost' | 'sloth' | 'hummingbird' | 'cage'
  // the title and the menus (2026-10-28): sound, full screen, settings, the cards, play, restart, save
  | 'speaker' | 'mute' | 'expand' | 'shrink' | 'gear' | 'cards' | 'play' | 'restart' | 'save'
  // the nine stage types (a boss stage is shown by its painted crest; `boss` is the plain heraldic stand-in)
  | 'sprint' | 'harvest' | 'purge' | 'ascent' | 'stealth' | 'vine' | 'relic' | 'rescue' | 'gauntlet' | 'boss';

/** every icon name */
export const ICON_NAMES: readonly IconName[] = ['lock', 'star', 'heart', 'thornHeart', 'trophy', 'book', 'scroll', 'map', 'leaf', 'flower', 'sparkle', 'note', 'shield', 'swords', 'boot', 'key', 'bolt', 'paw', 'magnet', 'bulb', 'compass', 'crown', 'check', 'cross', 'arrow', 'medal', 'burst', 'ghost', 'sloth', 'hummingbird', 'cage', 'speaker', 'mute', 'expand', 'shrink', 'gear', 'cards', 'play', 'restart', 'save', 'sprint', 'harvest', 'purge', 'ascent', 'stealth', 'vine', 'relic', 'rescue', 'gauntlet', 'boss'] as const;

/** the 10-30 painted kit sheet (src/assets/ui/ui-kit.webp) */
export const UI_KIT_URL = new URL('../../assets/ui/ui-kit.webp', import.meta.url).href;
/** one piece of the painted kit sheet as an <svg> (the lock badge and the star slots are drawn the same way) */
export const KitPiece: React.FC<{ piece: string; width: number | string; height?: number | string; className?: string; style?: React.CSSProperties; label?: string }> = ({ piece, width, height, className, style, label }) => {
  const f = UI_KIT[piece];
  // (a square the size of the piece's longer side, the piece in its middle, clipped to the piece so nothing of its neighbours in the
  // sheet shows; a clip path, not a nested svg, so rules that size `svg` inside a button or a row leave it alone)
  const id = React.useId();
  if (!f) return null;
  const m = Math.max(f.w, f.h);
  const ox = (m - f.w) / 2 - f.x;
  const oy = (m - f.h) / 2 - f.y;
  return (
    <svg
      viewBox={`0 0 ${m} ${m}`}
      width={width}
      height={height ?? width}
      className={className}
      style={style}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      focusable="false"
    >
      <clipPath id={id}>
        <rect x={(m - f.w) / 2} y={(m - f.h) / 2} width={f.w} height={f.h} />
      </clipPath>
      <image href={UI_KIT_URL} x={ox} y={oy} width={UI_KIT_SIZE.w} height={UI_KIT_SIZE.h} clipPath={`url(#${id})`} />
    </svg>
  );
};

