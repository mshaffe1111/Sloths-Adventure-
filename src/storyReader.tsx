/**
 * The story reader: every scene of the story, played by the same StoryPlayer the game uses, in the order the game plays them.
 * Built only for the private draft page (story-reader.html); the game itself does not load it.
 */
import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import './gameUi.css';
import { StoryPlayer } from './components/StoryPlayer.tsx';
import { INTRO_PANELS, WORLD_STORIES, WORLD_MID, WORLD_GATE, bossPanels, thornbarkPanels, ENDING_PANELS, type StoryPanel } from './game/story.ts';
import { AFTER_BOSS, MEMORIES, endTagPanels, finalePanels } from './game/storyChapters.ts';
import { victoryPanels } from './game/victoryScenes.ts';
import { WORLDS_DATA } from './game/worldsData.ts';
import { FINDS, BONUS_FIND } from './game/finds.ts';
import { FONT_READ } from './game/fonts.ts';

interface Piece { id: string; group: string; title: string; panels: StoryPanel[] }

const ACT: Record<number, string> = { 1: 'Act I · The Trail', 2: 'Act I · The Trail', 3: 'Act I · The Trail', 4: 'Act II · The Cost', 5: 'Act II · The Cost', 6: 'Act II · The Cost', 7: 'Act II · The Cost', 8: 'Act III · The Iron Road', 9: 'Act III · The Iron Road', 10: 'Act III · The Iron Road' };

function build(): Piece[] {
  const out: Piece[] = [{ id: 'prologue', group: 'Prologue', title: 'The prologue', panels: INTRO_PANELS }];
  for (let w = 1; w <= 10; w++) {
    const info = WORLDS_DATA[w - 1];
    const g = `${ACT[w]} · World ${w}, ${info.name}`;
    out.push({ id: `w${w}`, group: g, title: `Arrival`, panels: WORLD_STORIES[w].panels });
    out.push({ id: `m${w}`, group: g, title: 'Halfway: Dot and Pokey', panels: WORLD_MID[w] });
    if (w === 7) {
      out.push({ id: 'tb-i', group: g, title: 'Thornbark, before the fight', panels: thornbarkPanels('intro') });
      out.push({ id: 'tb-d', group: g, title: 'Thornbark, after the fight', panels: thornbarkPanels('defeat') });
    }
    if (WORLD_GATE[w]) out.push({ id: `g${w}`, group: g, title: 'At the gate', panels: WORLD_GATE[w] });
    out.push({ id: `b${w}`, group: g, title: `${info.bossName}, before the fight`, panels: bossPanels(w, 'intro', info.bossName) });
    out.push({ id: `d${w}`, group: g, title: `${info.bossName}, after the fight`, panels: victoryPanels(w, info.bossName) ?? bossPanels(w, 'defeat', info.bossName) });
    for (const id of AFTER_BOSS[w] ?? []) out.push({ id: `mem-${id}`, group: g, title: MEMORIES[id].title + (MEMORIES[id].kind === 'memory' ? ' (a memory)' : ''), panels: MEMORIES[id].panels });
  }
  const everything = [...FINDS.map((f) => f.id), BONUS_FIND.id];
  out.push({ id: 'ending', group: 'The ending', title: 'The ending, no finds collected', panels: ENDING_PANELS });
  out.push({ id: 'ending-full', group: 'The ending', title: 'The ending, every find collected', panels: finalePanels(everything) });
  out.push({ id: 'ending-tag', group: 'The ending', title: 'After the end: the stopwatch (if found)', panels: endTagPanels(everything) });
  return out;
}

const KEY = 'story_reader_pos';
const read = (): string | null => { try { return localStorage.getItem(KEY); } catch { return null; } };
const save = (id: string) => { try { localStorage.setItem(KEY, id); } catch { /* the reader works without it */ } };

const wc = (p: Piece) => p.panels.reduce((n, x) => n + x.text.split(/\s+/).length, 0);

function Reader() {
  const pieces = useMemo(build, []);
  const [at, setAt] = useState<number | null>(null);
  const saved = read();
  const savedIdx = pieces.findIndex((p) => p.id === saved);
  useEffect(() => { if (at !== null) save(pieces[at].id); }, [at, pieces]);

  if (at !== null) {
    const piece = pieces[at];
    const next = pieces[at + 1] && pieces[at + 1].id !== 'ending-full' ? pieces[at + 1] : null;
    return (
      <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
        <StoryPlayer key={piece.id} panels={piece.panels} finishLabel={next ? 'Next scene' : 'Finish'} skipLabel="Skip scene" onFinish={() => setAt(next ? at + 1 : null)} />
        <button onClick={() => setAt(null)} style={{ position: 'fixed', left: 10, top: 50, zIndex: 50, padding: '7px 12px', borderRadius: 99, border: '1px solid #2a5a41', background: 'rgba(11,26,19,.82)', color: '#e8f5ea', font: '600 13px system-ui', cursor: 'pointer' }}>☰ Chapters</button>
      </div>
    );
  }

  let lastGroup = '';
  return (
    <div style={{ minHeight: '100vh', background: '#0b1a13', color: '#e8f5ea', font: `16px/1.45 ${FONT_READ}`, padding: '28px max(16px, var(--sa-left)) 80px' }}>
      <div style={{ maxWidth: 760, margin: '0 auto' }}>
        <div style={{ font: '600 12px system-ui', letterSpacing: '.14em', textTransform: 'uppercase', color: '#f4c85a' }}>Sloths Rainforest Adventures</div>
        <h1 style={{ margin: '6px 0 8px', font: '700 clamp(30px,7vw,46px)/1.05 system-ui', textWrap: 'balance' as never }}>The story draft</h1>
        <p style={{ margin: '0 0 18px', color: '#9bb8a6', maxWidth: '60ch' }}>Every scene, played by the same player the game uses and in the order the game plays them. Each scene carries on into the next. Tap a scene to start there, or start from the top.</p>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 22 }}>
          <button onClick={() => setAt(0)} style={btn(true)}>Start from the beginning</button>
          {savedIdx > 0 && <button onClick={() => setAt(savedIdx)} style={btn(false)}>Continue: {pieces[savedIdx].title}</button>}
        </div>
        {pieces.map((p, i) => {
          const head = p.group !== lastGroup; lastGroup = p.group;
          return (
            <React.Fragment key={p.id}>
              {head && <h2 style={{ margin: '22px 0 8px', font: '600 17px system-ui', color: '#f4c85a' }}>{p.group}</h2>}
              <button onClick={() => setAt(i)} style={{ display: 'flex', width: '100%', justifyContent: 'space-between', gap: 12, textAlign: 'left', padding: '11px 14px', marginBottom: 6, borderRadius: 12, border: '1px solid #24523a', background: '#11301f', color: '#e8f5ea', font: '500 15px system-ui', cursor: 'pointer', minHeight: 44 }}>
                <span>{p.title}</span><span style={{ color: '#9bb8a6', whiteSpace: 'nowrap' }}>{p.panels.length} beats · {wc(p)} words</span>
              </button>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

const btn = (primary: boolean): React.CSSProperties => ({ padding: '12px 18px', borderRadius: 12, border: primary ? '0' : '1px solid #24523a', background: primary ? '#f5a524' : '#11301f', color: primary ? '#1a1205' : '#e8f5ea', font: '700 15px system-ui', cursor: 'pointer', minHeight: 44 });

createRoot(document.getElementById('root')!).render(<Reader />);
