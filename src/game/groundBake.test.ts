// npx tsx --test src/game/groundBake.test.ts
/**
 * R-165.380 (ENG-WALL-d): a zoom ease never re-keys the painted ground. The ground's squares (protoArt.ts drawGroundChunks) are keyed on
 * the bake scale and the view the soil's darkening is laid out for; the intro's dolly eases the zoom in over INTRO_ZOOM_SECS, and when
 * those two followed the frame's own zoom every eased frame threw every square away and drew the whole ground live (ENG-WALL-c: 30 of
 * the start's frames upright, 24 sideways). Held here on the real engine, upright and sideways: across the dolly the zoom moves (the
 * plant: the ease is real) and the key's scale and view do not, and the key mid-ease is the settled one (no re-key when the ease ends).
 */
import './bossPlayDom.ts';
import { headlessScreen } from './bossPlayDom.ts';
import test from 'node:test';
import assert from 'node:assert/strict';
import { GameEngine } from './engine.ts';
import { generateAllLevels } from './worldsData.ts';
import { groundBakeKey, setDepthView } from './protoArt.ts';
import type { LevelConfig } from './types.ts';

type Eng = { introT: number; zoom: number; applyZoom(): void; renderDpr(): number; groundView(): { vh: number; over: number } };

function engine(w: number, h: number): Eng {
  const lvl = generateAllLevels().find((l) => l.id === '1-1')!;
  const input = { state: {} };
  return new GameEngine(headlessScreen(w, h), { ...lvl, unlocked: true } as LevelConfig, input as never, {
    onProgressUpdate: () => {}, onVictory: () => {}, onDefeat: () => {}, onGameOver: () => {},
  } as never) as unknown as Eng;
}

/** the key's two parts for this frame, the way the render hands them to the ground (engine.ts render -> setDepthView -> drawGroundChunks) */
function keyNow(e: Eng): { scale: string; view: number } {
  const gv = e.groundView();
  (setDepthView as (vh: number, over?: number) => void)(gv.vh, gv.over);
  const k = groundBakeKey(e.renderDpr() * e.zoom);
  return { scale: k.scale.toFixed(4), view: k.view };
}

for (const [name, w, h] of [['upright', 412, 915], ['sideways', 915, 412]] as const) {
  test(`R-165.380: the intro dolly keeps the ground's key and its darkening's view, ${name} (planted)`, () => {
    const e = engine(w, h);
    e.introT = 99;
    e.applyZoom();
    const settled = keyNow(e);
    const restZoom = e.zoom;
    const zooms: number[] = [];
    const keys: string[] = [];
    for (e.introT = 0; e.introT < 1.3 + 1 / 30; e.introT += 1 / 30) {
      e.applyZoom();
      zooms.push(e.zoom);
      const k = keyNow(e);
      keys.push(`${k.scale}|${k.view}`);
    }
    // (the plant: the dolly really eases the zoom, by more than 5%, and ends at the rest zoom)
    assert.ok(Math.max(...zooms) / Math.min(...zooms) > 1.05, `the dolly eases the zoom (${Math.min(...zooms).toFixed(3)} -> ${Math.max(...zooms).toFixed(3)})`);
    assert.ok(Math.abs(zooms[zooms.length - 1] - restZoom) < 1e-9, 'the dolly ends at the rest zoom');
    // (every eased frame keys the ground as the settled frame does: no square is thrown away, the shade's band never moves)
    const changes = keys.filter((k, i) => i > 0 && k !== keys[i - 1]).length;
    assert.equal(changes, 0, `the ground's key changes on ${changes} of ${keys.length} dolly frames (${keys[0]} -> ${keys[keys.length - 1]})`);
    assert.equal(keys[0], `${settled.scale}|${settled.view}`, 'the first dolly frame is keyed as the settled frame');
  });
}
