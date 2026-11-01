import React, { useState } from 'react';
import type { BadgeStore, LevelRecord } from '../../game/badges.ts';
import { GUARDIAN_ENTRIES, PREDATOR_ENTRIES, PREDATOR_ORDER, ROAD_ENTRIES, predatorMet, roadMet } from '../../game/journal.ts';
import { loreFor } from '../../game/creatureLore.ts';
import { CreaturePic } from '../CreaturePic.tsx';
import { PaintedIcon } from '../icons/PaintedIcon.tsx';
import { SatchelPopup } from './SatchelPopup.tsx';

/** each card's window shows the far painting of the world the creature lives in (2026-10-28), behind its picture or its shadow */
let FAR: Record<string, string> = {};
try {
  FAR = import.meta.glob('../../assets/backdrops/w*-far.webp', { eager: true, query: '?url', import: 'default' }) as Record<string, string>;
} catch {
  FAR = {};
}
export const cardWorld = (w: number): React.CSSProperties | undefined => {
  const u = FAR[`../../assets/backdrops/w${w}-far.webp`];
  return u ? ({ ['--cw' as string]: `url("${u}")` } as React.CSSProperties) : undefined;
};

interface Card {
  id: string;
  art: string;
  name: string;
  tip: string;
  world: number;
  met: boolean;
  foot: React.ReactNode;
}

/**
 * The creature cards (the Trophy Room's Jungle Journal, moved into the satchel whole). Tap a met creature and its short backstory pops
 * up (Matt, 2026-10-31), with its picture big and Dot's tip for it.
 */
export const CreaturesTab: React.FC<{ store: BadgeStore; levels: LevelRecord[] }> = ({ store, levels }) => {
  const [open, setOpen] = useState<Card | null>(null);
  const bossDone = (w: number) => levels.some((l) => l.worldIndex === w && l.miniIndex === 10 && l.completed);
  const preds: Card[] = PREDATOR_ORDER.map((id) => {
    const e = PREDATOR_ENTRIES[id];
    const met = predatorMet(id, store.seen, levels);
    return { id, art: id, name: e.name, tip: e.tip, world: e.first, met, foot: met ? `Defeated ×${store.kills[id] ?? 0}` : <PaintedIcon name="lock" size={15} label="Not met yet" /> };
  });
  const road: Card[] = ROAD_ENTRIES.map((r) => {
    const met = roadMet(r, levels, store.seen);
    return { id: r.id, art: r.id, name: r.name, tip: r.tip, world: r.first, met, foot: met ? <PaintedIcon name="checkmark" size={16} label="Met" /> : <PaintedIcon name="lock" size={15} label="Not met yet" /> };
  });
  const guards: Card[] = GUARDIAN_ENTRIES.map((g) => {
    const met = bossDone(g.world);
    return { id: g.art, art: g.art, name: g.name, tip: `Guardian of World ${g.world}.`, world: g.world, met, foot: met ? <PaintedIcon name="checkmark" size={16} label="Defeated" /> : <PaintedIcon name="lock" size={15} label="Locked" /> };
  });
  const metCount = preds.filter((c) => c.met).length;
  const section = (title: string, list: Card[], locked: (c: Card) => string) => (
    <>
      <div className="tr-sec">{title}</div>
      <div className="tr-grid tr-grid-j">
        {list.map((c) => (
          <div
            key={c.id}
            className={`tr-card ${c.met ? 'sc-tap' : 'lock'}`}
            role={c.met ? 'button' : undefined}
            tabIndex={c.met ? 0 : undefined}
            onClick={c.met ? () => setOpen(c) : undefined}
            onKeyDown={c.met ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setOpen(c); } } : undefined}
          >
            <div className="tr-cpic" style={cardWorld(c.world)}>
              <CreaturePic id={c.art} w={120} h={74} locked={!c.met} />
            </div>
            <div className="tr-cn">{c.met ? c.name : '???'}</div>
            <div className="tr-ct">{c.met ? c.tip : locked(c)}</div>
            <div className="tr-cf">
              <span>World {c.world}</span>
              <b>{c.foot}</b>
            </div>
          </div>
        ))}
      </div>
    </>
  );
  return (
    <>
      <div className="tr-sub tr-jsub">
        {metCount} of {preds.length} predators met · {road.filter((c) => c.met).length} of {road.length} others · {guards.filter((c) => c.met).length} of {guards.length} guardians · tap one for its story
      </div>
      {section('Predators', preds, () => 'Not met yet. Keep exploring.')}
      {section('Met on the road', road, () => 'Not met yet. Keep exploring.')}
      {section('Guardians', guards, (c) => `Guardian of World ${c.world}. Beat the 10th stage to meet it.`)}
      {open && (
        <SatchelPopup title="Creature" label={open.name} onClose={() => setOpen(null)} className="cr-pop">
          <div className="cr-pic" style={cardWorld(open.world)}>
            <CreaturePic id={open.art} w={300} h={180} />
          </div>
          <h2 className="st-name">{open.name}</h2>
          <div className="cr-from">World {open.world}</div>
          <p className="cr-lore">{loreFor(open.id)}</p>
          <p className="cr-tip">
            <b>Dot&apos;s tip</b> {open.tip}
          </p>
        </SatchelPopup>
      )}
    </>
  );
};
