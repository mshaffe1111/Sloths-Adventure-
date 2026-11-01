/**
 * The painted icons (icons-painted, Matt 2026-11-01: "The satchel looks great but look at the other art. Generic. Standards need
 * enforced... Same for all icons in the game. Polish."). Every icon is a real object from Pokey's world, painted on Hugging Face
 * in the satchel's own recipe (style model at 1.0, one object on flat grey, keyed by tools/art/icons/cut.py), one cut-out webp per
 * object in src/assets/icons/ at twice its largest size on screen. How they are made: reference/methods/icons.md.
 *
 *   <PaintedIcon name="map" size={64} />                 decorative (alt="")
 *   <PaintedIcon name="lock" size={20} label="Locked" /> the icon alone carries the meaning, so it gets a name
 *
 * `mute` is the sound drum, dimmed, with the carved X over its corner. The old vector <Icon> (./index.tsx) is kept only for the
 * crisp glyphs that sit inside a line of text (iconRegister.test.ts holds the list of files still using it; it only shrinks).
 */
import React from 'react';

const FILES = import.meta.glob('../../assets/icons/*.webp', { eager: true, query: '?url', import: 'default' }) as Record<string, string>;
const URLS: Record<string, string> = Object.fromEntries(
  Object.entries(FILES).map(([k, v]) => [k.slice(k.lastIndexOf('/') + 1, -5), v]),
);

export const PAINTED_NAMES = ['map', 'story', 'howto', 'sound', 'mute', 'gear', 'play', 'restart', 'close', 'lock', 'star', 'back'] as const;
export type PaintedName = (typeof PAINTED_NAMES)[number];

export const paintedUrl = (name: string): string | undefined => URLS[name];

export interface PaintedIconProps {
  name: PaintedName;
  /** pixels, or any CSS length (default 24) */
  size?: number | string;
  label?: string;
  className?: string;
  style?: React.CSSProperties;
}

export const PaintedIcon: React.FC<PaintedIconProps> = ({ name, size = 24, label, className, style }) => {
  const cls = className ? `pic ${className}` : 'pic';
  const box: React.CSSProperties = { width: size, height: size, ...style };
  const aria = label ? { role: 'img', 'aria-label': label } : { 'aria-hidden': true as const };
  if (name === 'mute') {
    return (
      <span className={`${cls} pic-mute`} style={box} {...aria}>
        <img src={URLS.sound} alt="" draggable={false} decoding="async" className="pic-mute-obj" />
        <img src={URLS.close} alt="" draggable={false} decoding="async" className="pic-mute-x" />
      </span>
    );
  }
  return <img src={URLS[name]} alt={label ?? ''} draggable={false} decoding="async" className={cls} style={box} {...(label ? {} : { 'aria-hidden': true })} />;
};
