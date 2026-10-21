import React from 'react';
import { Icon } from './index.tsx';
import { crestFor, crestName, type CrestKey } from './crests.ts';

interface CrestProps {
  /** the world whose guardian to show (1 to 10), or 'thornbark' */
  world: CrestKey;
  /** the medallion's diameter in px (default 48) */
  size?: number;
  /** a guardian not met yet: a dark silhouette with a padlock */
  locked?: boolean;
  className?: string;
  /** spoken name; by default the medallion is decorative */
  label?: string;
}

/**
 * A guardian's round crest: the game's own painted portrait in a gold ring. Locked, it is a darkened silhouette with the
 * lock on it. If a guardian ever has no painted frame it falls back to the plain heraldic `boss` glyph.
 * The ring and field are styled in index.css (.crest-*).
 */
export const Crest: React.FC<CrestProps> = ({ world, size = 48, locked = false, className, label }) => {
  const a = crestFor(world);
  const rw = Math.max(2, Math.round(size * 0.075));
  const inner = size - rw * 2;
  const k = a ? inner / a.s : 1;
  return (
    <span
      className={`crest ${locked ? 'locked' : ''} ${className ?? ''}`.trim()}
      style={{ width: size, height: size, ['--rw' as string]: `${rw}px` }}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      data-world={String(world)}
    >
      <span className="crest-field" style={{ inset: rw }}>
        {a ? (
          <span
            className="crest-art"
            style={{
              width: a.frame.w * k,
              height: a.frame.h * k,
              left: inner / 2 - a.cx * a.frame.w * k,
              top: inner / 2 - a.cy * a.frame.h * k,
              backgroundImage: `url(${a.url})`,
              backgroundSize: `${a.atlas.w * k}px ${a.atlas.h * k}px`,
              backgroundPosition: `${-a.frame.x * k}px ${-a.frame.y * k}px`,
            }}
          />
        ) : (
          <Icon name="boss" size={inner * 0.82} />
        )}
      </span>
      <span className="crest-ring" />
      {locked && (
        <span className="crest-lock">
          <Icon name="lock" size={Math.max(12, Math.round(size * 0.42))} />
        </span>
      )}
    </span>
  );
};

export { crestName };
