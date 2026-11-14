/**
 * The chase camera's lead (cameraFollow.ts chaseSpan / chaseBack; 1-8.md NEW 5), measured on the real engine and its real camera
 * (realPlay.ts with updateCamera put back, as cameraLead.test.ts does), upright and sideways, Normal and Easy: on a laid stretch
 * a rolling nut that drops in ahead is SEEN (its round inside the view, under the HUD band) 1 s and more before it reaches him at a
 * full run (1-8.md: "on an upright screen 1 s+ before it reaches him"). PLANTED: with the stage's span taken away (the plain framing,
 * keepAhead 305 px), the same nut is seen later on an upright phone, so the lead is what buys the second.
 * The narrowest phone (320 x 782, 368 px of world) is measured and printed, never hidden: the edge behind gives way first.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { RealPlay } from './realPlay.ts';
import { GameEngine } from './engine.ts';
import { setDifficulty } from './difficulty.ts';
import { chaseBack, chaseSpan, CHASE_VIEW, HUD_BAND } from './cameraFollow.ts';
import { rollRadius, ROLL, type RollSpec } from './rolling.ts';
import type { RollingPiece } from './pieces/rollingPiece.ts';
import type { GeneratedStage } from './stageGenerator.ts';
import type { Platform } from './types.ts';

const FLOOR = 700;
const NUT: RollSpec = { kind: 'low', dropX: 2600, speed: 140, bounce: 8 };

function seen(w: number, h: number, easy: boolean, span = true): { secs: number; heroAt: number; vw: number } {
  setDifficulty(easy ? 'easy' : 'normal');
  const r = new RealPlay('1-3', 1);
  const e = r.e as unknown as { updateCamera: () => void; currentStage: GeneratedStage; viewCssW: number; viewCssH: number; introT: number; applyZoom(): void; camera: { x: number; y: number; viewportWidth: number; viewportHeight: number }; zoom: number; pieces: Array<{ kind: string }>; chaseSpanOf: unknown };
  e.updateCamera = (GameEngine.prototype as unknown as Record<string, () => void>).updateCamera.bind(e);
  const st = e.currentStage;
  st.chase = { stretches: [{ start: 1500, end: 6000 }] };
  st.rolling = [NUT];
  r.bare([{ id: 1, x: 0, y: FLOOR, width: 9000, height: 200, type: 'solid' } as Platform]);
  st.config = { ...st.config, levelHeight: 900 };
  if (!span) (e as unknown as { chaseSpanOf: () => null }).chaseSpanOf = () => null;
  e.viewCssW = w;
  e.viewCssH = h;
  e.introT = 99;
  e.applyZoom();
  r.safe = false;
  r.stand(1700, FLOOR);
  r.p.invincibleTimer = 0;
  for (let i = 0; i < 30; i++) r.frame();
  const piece = e.pieces.find((q) => q.kind === 'rolling') as RollingPiece;
  const nut = piece.list[0];
  const vw = e.camera.viewportWidth;
  const band = (h > w ? HUD_BAND.port : HUD_BAND.land) / e.zoom;
  const rad = rollRadius('low');
  let at = -1;
  for (let i = 0; i < 300; i++) {
    r.frame({ right: true });
    const c = e.camera;
    const inView = nut.phase !== 'wait' && nut.x - rad >= c.x && nut.x + rad <= c.x + vw && nut.y + rad > c.y + band;
    if (at < 0 && inView) at = r.t;
    if (nut.spent) {
      assert.ok(at >= 0, `${w}x${h}: touched by a nut never seen`);
      return { secs: r.t - at, heroAt: (r.p.x - c.x) / vw, vw };
    }
  }
  throw new Error(`${w}x${h}: the nut never reached him`);
}

test('chase camera: on a laid stretch a dropping nut is seen 1 s+ before it reaches him at a full run, upright and sideways, Normal and Easy', () => {
  for (const easy of [false, true]) {
    for (const [w, h] of [[390, 844], [412, 915], [844, 390], [915, 412]] as const) {
      const m = seen(w, h, easy);
      console.log(`  ${easy ? 'Easy' : 'Normal'} ${w}x${h}: seen ${m.secs.toFixed(2)} s before it reached him (view ${m.vw.toFixed(0)} px of world, him at ${(m.heroAt * 100).toFixed(0)}% across)`);
      assert.ok(m.secs >= ROLL.seen - 0.04, `${easy ? 'Easy' : 'Normal'} ${w}x${h}: seen only ${m.secs.toFixed(2)} s before it reached him`);
      assert.ok(m.heroAt >= CHASE_VIEW.backMin - 0.03, `${w}x${h}: him ${(m.heroAt * 100).toFixed(0)}% across, nearer the edge behind than ${CHASE_VIEW.backMin}`);
    }
  }
  // (the narrow phones, measured and named: the edge behind him gives way first, at backMin)
  for (const [w, h] of [[360, 800], [320, 782]] as const) {
    const n = seen(w, h, false);
    console.log(`  Normal ${w}x${h} (narrow): seen ${n.secs.toFixed(2)} s, view ${n.vw.toFixed(0)} px, him at ${(n.heroAt * 100).toFixed(0)}% across`);
  }
  setDifficulty('normal');
});

test('chase camera, PLANTED: with the span taken away (the plain framing) the same nut is seen later on an upright phone', () => {
  const lead = seen(390, 844, false, true);
  const plain = seen(390, 844, false, false);
  console.log(`  390x844 Normal: with the lead ${lead.secs.toFixed(2)} s, plain framing ${plain.secs.toFixed(2)} s`);
  assert.ok(plain.secs < ROLL.seen - 0.04, `plain framing already shows it ${plain.secs.toFixed(2)} s ahead: the lead buys nothing`);
  assert.ok(lead.secs > plain.secs + 0.1);
  setDifficulty('normal');
});

test('chase camera: the span is the stage data (its stretches and hazards), and his place across never nearer the edge behind than backMin', () => {
  assert.equal(chaseSpan({}), null);
  const s = chaseSpan({ chase: { stretches: [{ start: 1000, end: 3000 }, { start: 3500, end: 5000 }] }, rolling: [NUT] });
  assert.ok(s && s.x0 === 1000 - CHASE_VIEW.leadIn && s.x1 === 5000, JSON.stringify(s));
  assert.ok(s!.ahead > 305, `ahead ${s!.ahead}`);
  assert.equal(chaseBack(368, 440), 368 * CHASE_VIEW.backMin);
  assert.equal(chaseBack(1000, 440), 1000 * CHASE_VIEW.backMax);
});

test('chase camera: a chase laid anew on the same stage is framed by its own span (never a stale one)', () => {
  const r = new RealPlay('1-3', 1);
  const e = r.e as unknown as { currentStage: GeneratedStage; chaseSpanOf(st: GeneratedStage): { x0: number } | null };
  const st = e.currentStage;
  st.chase = undefined;
  st.rolling = undefined;
  assert.equal(e.chaseSpanOf(st), null);
  st.chase = { stretches: [{ start: 3000, end: 5000 }] };
  assert.equal(e.chaseSpanOf(st)?.x0, 3000 - CHASE_VIEW.leadIn, 'a chase laid on the same stage object');
  st.rolling = [{ ...NUT, dropX: 2000 }];
  assert.ok((e.chaseSpanOf(st)?.x0 ?? 0) < 2000, 'and its hazards');
});
