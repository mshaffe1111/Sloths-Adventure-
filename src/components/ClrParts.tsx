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

/** the folded banner across the top of the result cards (stage cleared / game over) */
export const ClrRibbon: React.FC<{ title: string; tone?: 'gold' | 'dusk' }> = ({ title, tone = 'gold' }) => {
  const c = tone === 'gold'
    ? { tail: '#b45309', body: '#fbbf24', edge: '#92400e', shine: '#fde68a' }
    : { tail: '#9a3412', body: '#fdba74', edge: '#7c2d12', shine: '#ffedd5' };
  return (
    <div className={`clr-ribbon ${tone}`}>
      <svg viewBox="0 0 420 68" preserveAspectRatio="none" aria-hidden="true">
        <path d="M0 14h40v46H0l16-23z" fill={c.tail} />
        <path d="M420 14h-40v46h40l-16-23z" fill={c.tail} />
        <path d="M30 4h360v56H30z" fill={c.body} stroke={c.edge} strokeWidth="3" strokeLinejoin="round" />
        <path d="M30 14h360" stroke={c.shine} strokeWidth="3" opacity=".8" />
      </svg>
      <h2>{title}</h2>
    </div>
  );
};

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
