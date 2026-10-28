import React from 'react';

/** true on a short screen (a phone held sideways), where the result cards have to give up some room */
export function useShortScreen(): boolean {
  const q = '(max-height: 520px)';
  const [short, setShort] = React.useState(() => typeof window !== 'undefined' && !!window.matchMedia?.(q).matches);
  React.useEffect(() => {
    const m = window.matchMedia?.(q);
    if (!m) return;
    const on = () => setShort(m.matches);
    m.addEventListener?.('change', on);
    return () => m.removeEventListener?.('change', on);
  }, []);
  return short;
}

/** the heading across the top of the result cards (stage cleared / game over): carved into a little log like every heading (2026-10-28) */
export const ClrRibbon: React.FC<{ title: string; tone?: 'gold' | 'dusk' }> = ({ title, tone = 'gold' }) => (
  <div className={`clr-ribbon ${tone}`}>
    <h2 className="kit-plaque">
      <span>{title}</span>
    </h2>
  </div>
);

export interface ChipSpec {
  label: string;
  value: string;
  colour?: string;
}

/** a row of small result chips; the row sizes itself to however many there are */
export const ClrChips: React.FC<{ chips: ChipSpec[]; small?: boolean }> = ({ chips, small }) => (
  <div className={`clr-chips${small ? ' sm' : ''}`} style={{ ['--n' as string]: chips.length }}>
    {chips.map((c) => (
      <div className="clr-chip" key={c.label}>
        <span>{c.label}</span>
        <b style={c.colour ? { color: c.colour } : undefined}>{c.value}</b>
      </div>
    ))}
  </div>
);
