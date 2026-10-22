import React from 'react';
import { perfEnabled, perfLog, setPerfPref } from '../game/perfLog.ts';
import { sound } from '../game/audio.ts';
import { learned } from '../game/frameGovernor.ts';

/**
 * The frame-time check's panel (only while the menu switch is on). A small box in the corner: frames per second and the number of freezes.
 * Tap it to open the full report (timeline, freezes, notes), then Copy it or take a screenshot and send it over.
 */
export const PerfReadout: React.FC<{ stageId: string }> = ({ stageId }) => {
  const [on, setOn] = React.useState(perfEnabled());
  const [open, setOpen] = React.useState(false);
  const [, tick] = React.useReducer((n: number) => n + 1, 0);
  const [copied, setCopied] = React.useState('');
  const ref = React.useRef<HTMLPreElement>(null);

  React.useEffect(() => {
    const sync = () => setOn(perfEnabled());
    window.addEventListener('sloth-perf', sync);
    return () => window.removeEventListener('sloth-perf', sync);
  }, []);
  React.useEffect(() => {
    if (!on) return;
    const id = window.setInterval(tick, 250);
    return () => window.clearInterval(id);
  }, [on]);

  if (!on) return null;
  const st = perfLog.stats();
  const lv = perfLog.live(performance.now());
  // is the game's sound running, and is any signal coming out of it (the meter on the output)
  let snd = '?';
  try {
    const a = sound.debug() as { state?: string; muted?: boolean; rms?: number };
    snd = a.muted ? 'muted' : `${a.state ?? '?'} ${(a.rms ?? 0) > 0.0005 ? 'signal' : 'silent'}`;
  } catch {
    /* no audio */
  }
  const text = perfLog.report(`stage ${stageId}, sound ${snd}, quality ${learned.quality} of 2, ${navigator.userAgent.replace(/^Mozilla\/5.0 /, '').slice(0, 90)}`);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied('Copied');
    } catch {
      // the clipboard can be refused inside the page: select the text so a long-press can copy it
      const el = ref.current;
      if (el) {
        const r = document.createRange();
        r.selectNodeContents(el);
        const sel = window.getSelection();
        sel?.removeAllRanges();
        sel?.addRange(r);
      }
      setCopied('Select and copy the text');
    }
    window.setTimeout(() => setCopied(''), 2500);
  };
  const btn: React.CSSProperties = { font: 'inherit', padding: '4px 10px', borderRadius: 8, border: '1px solid rgba(255,255,255,.35)', background: 'rgba(255,255,255,.12)', color: '#fff' };
  return (
    <div
      style={{ position: 'fixed', left: 6, top: 'calc(env(safe-area-inset-top, 0px) + 54px)', zIndex: 60, maxWidth: 'min(92vw, 560px)', font: '11px/1.35 ui-monospace, Menlo, monospace', color: '#fff', background: 'rgba(8,16,12,.78)', borderRadius: 10, padding: open ? 8 : '5px 10px', pointerEvents: 'auto' }}
    >
      <div onClick={() => setOpen(!open)} style={{ cursor: 'pointer', fontSize: 15, fontWeight: 700, letterSpacing: 0.2 }}>
        {lv.secs}s · {st.fps} fps · now {lv.recent} ms · worst {st.max} ms · {st.hitches} freeze{st.hitches === 1 ? '' : 's'}
        {lv.heap !== null ? ` · mem ${lv.heap} MB` : ''} · snd {snd} · q{learned.quality} {open ? '▾' : '▸'}
      </div>
      {open && (
        <>
          <pre ref={ref} style={{ margin: '6px 0', whiteSpace: 'pre-wrap', maxHeight: '48vh', overflow: 'auto', userSelect: 'text' }}>{text}</pre>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
            <button type="button" style={btn} onClick={copy}>Copy report</button>
            <button type="button" style={btn} onClick={() => setPerfPref(false)}>Turn off</button>
            <span>{copied}</span>
          </div>
        </>
      )}
    </div>
  );
};
