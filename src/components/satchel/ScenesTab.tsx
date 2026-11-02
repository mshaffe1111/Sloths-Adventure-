import React from 'react';
import { Icon } from '../icons/index.tsx';
import { KIND_LABEL, sceneList, sceneUnlocked, type SceneEntry, type SceneProgress } from '../../game/sceneList.ts';
import { WORLD_NAMES } from '../../game/badges.ts';

/**
 * Every cutscene in story order, from the prologue on (Matt, 2026-10-31). Each one plays on a tap; "Play all in order" plays every
 * open scene one after another, from the prologue. Scenes open by progress (sceneList.ts), so a player who passed them before gets
 * them at once.
 */
export const ScenesTab: React.FC<{ progress: SceneProgress; onPlay: (queue: SceneEntry[]) => void }> = ({ progress, onPlay }) => {
  const list = sceneList();
  const open = list.filter((e) => sceneUnlocked(e, progress));
  const groups: { world: number; items: SceneEntry[] }[] = [];
  for (const e of list) {
    const g = groups[groups.length - 1];
    if (g && g.world === e.world) g.items.push(e);
    else groups.push({ world: e.world, items: [e] });
  }
  const head = (w: number) => (w === 0 ? 'Before the journey' : w === 11 ? 'The end, and after' : `World ${w} · ${WORLD_NAMES[w - 1]}`);
  return (
    <>
      <div className="ss-top">
        <div className="tr-sub tr-jsub">
          {open.length} of {list.length} scenes open · in story order
        </div>
        <button type="button" className="ss-all" onClick={() => onPlay(open)} disabled={!open.length}>
          <Icon name="play" size={18} /> Play all in order
        </button>
      </div>
      {groups.map((g) => {
        // a world not reached yet shows as one locked line, not a wall of locks
        const any = g.items.some((e) => sceneUnlocked(e, progress));
        return (
          <React.Fragment key={g.world}>
            <div className="tr-sec">{head(g.world)}</div>
            {any ? (
              <div className="ss-list">
                {g.items.map((e) => {
                  const ok = sceneUnlocked(e, progress);
                  return (
                    <button key={e.id} type="button" className={`ss-row ss-${e.kind} ${ok ? '' : 'lock'}`} disabled={!ok} onClick={() => onPlay([e])}>
                      <span className="ss-ic">{ok ? <Icon name="play" size={16} /> : <Icon name="lock" size={14} />}</span>
                      <span className="ss-t">
                        <b>{ok ? e.title : '???'}</b>
                        <small>{ok ? KIND_LABEL[e.kind] : e.hint}</small>
                      </span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="ss-row lock ss-world">
                <span className="ss-ic"><Icon name="lock" size={14} /></span>
                <span className="ss-t">
                  <b>{g.items.length} scenes</b>
                  <small>{g.items[0].hint}</small>
                </span>
              </div>
            )}
          </React.Fragment>
        );
      })}
    </>
  );
};
