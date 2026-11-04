import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Icon } from '../icons/index.tsx';
import { WORLD_NAMES } from '../../game/badges.ts';
import { fmtTime, worldEntries, worldReview, type EntryNames } from '../../game/pokeyJournal.ts';
import type { PlayRecord } from '../../game/playRecords.ts';
import { CreaturePic } from '../CreaturePic.tsx';

export interface JournalStage {
  id: string;
  name: string;
  worldIndex: number;
  miniIndex: number;
  completed: boolean;
  stars: number;
}

export interface JournalWorldExtra {
  teaser?: string;
  creatures: { id: string; name: string }[];
  finds: number;
  findTotal: number;
  /** the world's finds the satchel holds, by title */
  found: string[];
}

/**
 * Pokey's journal as a real book (Matt, 2026-10-31): one page-turn per world. Upright, a world is two pages turned one at a time (its
 * entries, then its review); sideways, the two lie open side by side. Turn with the arrows or a swipe.
 */
export const JournalBook: React.FC<{
  stages: JournalStage[];
  records: Record<string, PlayRecord>;
  names: EntryNames;
  extra: (world: number) => JournalWorldExtra;
}> = ({ stages, records, names, extra }) => {
  // the worlds with something to write: any stage cleared (World 1 always, so a new journal has its first page)
  const worlds = useMemo(() => {
    const out = [1];
    for (let w = 2; w <= 10; w++) if (stages.some((l) => l.worldIndex === w && l.completed)) out.push(w);
    return out;
  }, [stages]);
  const [wide, setWide] = useState(() => typeof window !== 'undefined' && window.innerWidth > window.innerHeight);
  useEffect(() => {
    const f = () => setWide(window.innerWidth > window.innerHeight);
    window.addEventListener('resize', f);
    return () => window.removeEventListener('resize', f);
  }, []);
  // pages: upright, [entries, review] per world; sideways, one spread per world
  const per = wide ? 1 : 2;
  const total = worlds.length * per;
  const latest = (worlds.length - 1) * per;
  const [page, setPage] = useState(latest);
  const [turn, setTurn] = useState<'' | 'fwd' | 'back'>('');
  const go = (d: 1 | -1) => {
    const n = Math.max(0, Math.min(total - 1, page + d));
    if (n === page) return;
    setTurn(d > 0 ? 'fwd' : 'back');
    setPage(n);
  };
  useEffect(() => {
    if (page > total - 1) setPage(total - 1);
  }, [page, total]);
  const touch = useRef<number | null>(null);
  const world = worlds[Math.floor(page / per)] ?? 1;
  const side = wide ? 'both' : page % 2 === 0 ? 'entries' : 'review';

  // (in the game's order: Dot's flight after 4-5, Meeca's night first in World 5; no record line twice on the page)
  const entries = worldEntries(world, stages, records, names);
  const ex = extra(world);
  const rev = worldReview(world, stages, records, { teaser: ex.teaser, creatures: ex.creatures.map((c) => c.name), finds: ex.finds, findTotal: ex.findTotal, found: ex.found });

  const entriesPage = (
    <div className="jb-page jb-left">
      <div className="jb-whead">
        <span>World {world}</span>
        <b>{WORLD_NAMES[world - 1]}</b>
      </div>
      {entries.length === 0 && <p className="jb-hand jb-empty">Nothing yet. The first page is always the hardest. — P.</p>}
      {entries.map((e) => (
        <div key={e.id} className="jb-entry">
          <div className="jb-eh">
            <span>
              {e.id} <b>{e.stage}</b>
            </span>
            <i>{'★'.repeat(e.stars)}{'☆'.repeat(Math.max(0, 3 - e.stars))}</i>
          </div>
          <p className="jb-hand">{e.story.join(' ')}</p>
          {e.notes.length > 0 && <p className="jb-hand jb-note">{e.notes.join(' ')}</p>}
          {e.close && <p className="jb-hand jb-close">{e.close}</p>}
        </div>
      ))}
    </div>
  );
  const reviewPage = (
    <div className="jb-page jb-right">
      <div className="jb-whead">
        <span>World {world}</span>
        <b>{rev.done ? 'Looking back' : 'So far'}</b>
      </div>
      {rev.story.map((s, i) => (
        <p key={i} className={i === 0 ? 'jb-story' : 'jb-hand'}>{s}</p>
      ))}
      {ex.creatures.length > 0 && (
        <>
          <div className="jb-sub">Met here</div>
          <div className="jb-met">
            {ex.creatures.slice(0, 6).map((c) => (
              <span key={c.id} className="jb-crit" title={c.name}>
                <CreaturePic id={c.id} w={54} h={36} />
                <small>{c.name}</small>
              </span>
            ))}
          </div>
        </>
      )}
      {rev.stages.length > 0 && (
        <>
          <div className="jb-sub">{rev.done ? 'The stages' : 'Stages so far'}</div>
          <ul className="jb-list">
            {rev.stages.map((l) => (
              <li key={l.id}>
                <span>{l.id}</span> {l.name} <i>{'★'.repeat(l.stars)}{'☆'.repeat(Math.max(0, 3 - l.stars))}</i>
              </li>
            ))}
          </ul>
        </>
      )}
      {rev.found.length > 0 && (
        <>
          <div className="jb-sub">Found here</div>
          <ul className="jb-list jb-found">
            {rev.found.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        </>
      )}
      {rev.best.length > 0 && (
        <>
          <div className="jb-sub">Best moments</div>
          <ul className="jb-best">
            {rev.best.map((b) => (
              <li key={b}>{b}</li>
            ))}
          </ul>
        </>
      )}
      <div className="jb-sub">The numbers</div>
      <div className="jb-stats">
        <span><b>{rev.stats.cleared}/{rev.stats.total}</b> stages</span>
        <span><b>{rev.stats.stars}</b> stars</span>
        {rev.stats.time > 0 && <span><b>{fmtTime(rev.stats.time)}</b> walking</span>}
        {rev.stats.time > 0 && <span><b>{rev.stats.falls}</b> falls</span>}
        {rev.stats.flowerTotal > 0 && <span><b>{rev.stats.flowers}</b> {world === 8 ? 'flowers' : 'petals'}</span>}
        <span><b>{rev.stats.finds}/{rev.stats.findTotal}</b> finds</span>
      </div>
      {rev.closing && <p className="jb-hand jb-sign jb-closing">{rev.closing}</p>}
    </div>
  );

  return (
    <div className="jb">
      <div
        key={page}
        className={`jb-book jb-${side} ${turn ? `jb-turn-${turn}` : ''}`}
        onTouchStart={(e) => (touch.current = e.touches[0].clientX)}
        onTouchEnd={(e) => {
          if (touch.current == null) return;
          const dx = e.changedTouches[0].clientX - touch.current;
          touch.current = null;
          if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
        }}
      >
        {side !== 'review' && entriesPage}
        {side !== 'entries' && reviewPage}
      </div>
      <div className="jb-nav">
        <button type="button" className="jb-arrow" onClick={() => go(-1)} disabled={page === 0} aria-label="Turn back a page">
          <Icon name="arrow" size={18} rotate={180} />
        </button>
        <span className="jb-pn">
          {wide ? `World ${world}` : `World ${world} · ${side === 'entries' ? 'the stages' : 'looking back'}`}
        </span>
        <button type="button" className="jb-arrow" onClick={() => go(1)} disabled={page >= total - 1} aria-label="Turn the page">
          <Icon name="arrow" size={18} />
        </button>
      </div>
    </div>
  );
};
