// R-165.241 (BUILD-16b 11-14): at a sealed exit, Dot's line why did not show within 34 s (1-6, Normal and Easy): the keeper's own door
// lines ("We missed some of her marks. They're back there!", stagePlan.ts SEALED_LINES) read as plain information, so the mark card up
// at the door held them ("+1"), and the engine sent none while another line's time ran (`if (!this.stageHint)`). And the door's "N more"
// plate hung behind Pokey at his shoulders, reading "more". Now the engine marks the door's line as the locked exit's (GuideOpts.lock):
// a must whatever its words, cutting in over any card, said at once; the plate is drawn with the words in play, clear over his head.
import test from 'node:test';
import assert from 'node:assert/strict';
import './headlessDom.ts';
import { engineGuideLine } from './dotLines.ts';
import { FADE_K, GuideQueue, TIPS_GAP_MS, type GuideLine, type TickEnv } from './dotGuide.ts';
import { sealedLine, goalLine } from './stagePlan.ts';
import { RealPlay } from './realPlay.ts';
import { PLATE_TOP } from './sanctuaryDoor.ts';
import { HERO_SPRITE_SCALE, HERO_UNITS } from './heroSprite.ts';
import { atSealedDoor } from './rules.ts';

const env: TickEnv = { danger: false, moveCount: () => 0 };
const KEEPER = sealedLine(1, 'relic_hunt')!;

test("the locked exit's line is a must whatever its words (planted: the keeper's 1-5 line without the mark read as information)", () => {
  assert.ok(KEEPER, "1-5's own sealed line");
  assert.notEqual(engineGuideLine(KEEPER, '1-5', { dot: true })?.kind, 'must', 'the defect: its words alone do not say it is the door');
  const l = engineGuideLine(KEEPER, '1-5', { dot: true, lock: true });
  assert.equal(l?.kind, 'must');
  assert.equal(l?.topic, 'exit');
  assert.equal(l?.text, KEEPER);
  const plain = goalLine('sealed', 1, 'harvest', 7)!;
  assert.equal(engineGuideLine(plain, '1-2', { dot: true, lock: true })?.kind, 'must', 'and a plain "Sealed: ..." line stays one');
});

test("Dot's queue on the phone: the sealed line cuts in over the mark card at once (planted: unmarked, it waits behind it)", () => {
  for (const lock of [true, false]) {
    const q = new GuideQueue(true, TIPS_GAP_MS);
    q.fadeK = FADE_K;
    q.readDone = true;
    const mark: GuideLine = { key: 'engine:mark', text: 'Her mark, right where she used to wait for you!', kind: 'info', who: 'Dot', source: 'engine', waitMs: 60000 };
    q.push(mark, 1000);
    let t = 1000;
    while (q.tick(t, env)?.line.key !== 'engine:mark' && t < 40000) t += 50;
    assert.equal(q.tick(t, env)?.line.key, 'engine:mark', 'her mark card is up');
    q.push(engineGuideLine(KEEPER, '1-5', { dot: true, lock })!, t + 600);
    const up = q.tick(t + 700, env)?.line.text;
    if (lock) assert.equal(up, KEEPER, 'the sealed line is up 0.1 s after he reaches the door');
    else assert.equal(up, mark.text, 'unmarked, the mark card holds the screen (the defect)');
  }
});

test("the engine says the door's line at once, marked, over a line still up (1-2 a harvest stage, 1-5 the keeper's words)", () => {
  for (const id of ['1-2', '1-5']) {
    const r = new RealPlay(id, 1);
    const e = r.e as unknown as { guide(t: string, s: number): void; callbacks: { onGuide?: (t: string, s: number, p?: boolean, o?: { lock?: true }) => void }; currentStage: { exitTotemX: number; exitTotemY: number } };
    const got: Array<{ text: string; lock: boolean; t: number }> = [];
    const was = e.callbacks.onGuide;
    e.callbacks.onGuide = (t, s, p, o) => {
      got.push({ text: t, lock: !!o?.lock, t: r.t });
      was?.(t, s, p, o);
    };
    const dx = e.currentStage.exitTotemX, dy = e.currentStage.exitTotemY + 24;
    const x = dx - 260;
    const pl = r.platforms.filter((q) => q.x <= x && q.x + q.width >= x).sort((a, b) => Math.abs(a.y - dy) - Math.abs(b.y - dy))[0];
    r.stand(x, pl.y);
    // (a line still up as he walks in, as her mark's was: before, nothing was sent for the door until its time ran out)
    e.guide('Her mark, right where she used to wait for you!', 3.6);
    let at = -1;
    for (let i = 0; i < 90 && at < 0; i++) {
      r.frame({ right: true });
      if (atSealedDoor(r.p, dx, dy) || got.some((g) => g.lock)) at = r.t;
    }
    const door = got.find((g) => g.lock);
    assert.ok(door, `${id}: no line marked the locked exit's (${got.map((g) => g.text).join(' | ')})`);
    assert.ok(door!.t - got[0].t < 3, `${id}: the door's line came ${(door!.t - got[0].t).toFixed(1)} s after the mark line, inside its 3.6 s`);
  }
});

test("the door's plate hangs clear over Pokey's head as the shut door holds him at it", () => {
  const head = 24 - HERO_UNITS * HERO_SPRITE_SCALE; // (the gate's ground is 24 under the door's origin; his drawn height 89.1, D41)
  const plateBottom = PLATE_TOP + 23;
  assert.ok(plateBottom < head - 40, `plate bottom ${plateBottom.toFixed(1)}, his head ${head.toFixed(1)}: at least 40 px clear`);
});
