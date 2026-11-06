// The testers' recorder moments (the lead, 11-06: what else the data should capture), each planted in the real engine (realPlay.ts):
// pickup, softFall, dot, move (the first double jump and the first bounce of a stage, once each), and section in plain words. The pause
// and restart moments are App.tsx's (PauseMenu's taps); they are checked in the browser with the rest (tools/perf/clipcheck.mjs walks
// the testers' link) and named here only as a reminder.
import test from 'node:test';
import assert from 'node:assert/strict';
import './headlessDom.ts';
import { RealPlay } from './realPlay.ts';
import { recorder } from './playRecorder.ts';
import { setDifficulty } from './difficulty.ts';
import { dotLogId } from './recorderLabels.ts';
import { sectionLabel } from '../components/ctestStretches.ts';
import type { Collectible, Platform } from './types.ts';

const P = (id: number, x: number, y: number, width: number, height = 24, type: Platform['type'] = 'solid', style: Platform['style'] = 'moss_stone'): Platform => ({ id, x, y, width, height, type, style });

/** what the recorder is asked to note, while the test runs (recording "on", nothing sent) */
function listen(): { log: Array<[string, string]>; stop: () => void } {
  const log: Array<[string, string]> = [];
  const r = recorder as unknown as { on: boolean; event: (w: string, d?: string | number) => void };
  const was = { on: r.on, event: r.event };
  r.on = true;
  r.event = (w, d) => log.push([w, d === undefined ? '' : String(d)]);
  return {
    log,
    stop: () => {
      r.on = was.on;
      r.event = was.event;
    },
  };
}

/** a bare stage: a long floor, nothing else */
function bare(r: RealPlay, extra: Platform[] = []) {
  const e = (r as unknown as { e: { platforms: Platform[]; enemies: unknown[]; collectibles: Collectible[]; proto: { hints: unknown[] } | null } }).e;
  e.platforms.splice(0, e.platforms.length, P(9001, 0, 700, 4000, 300), ...extra);
  e.enemies.splice(0, e.enemies.length);
  e.collectibles.splice(0, e.collectibles.length);
  if (e.proto) e.proto.hints = [];
  return e;
}

test("recorder 'move': the first double jump and the first bounce of a stage, once each, with x; a new stage notes them again", () => {
  const r = new RealPlay('1-1', 1);
  bare(r, [P(9002, 1600, 680, 70, 20, 'bouncy', undefined)]);
  const { log, stop } = listen();
  try {
    recorder.stageStart();
    for (let n = 0; n < 2; n++) {
      r.fly(600 + n * 300, 400, 0, 0, 1);
      r.frame({ press: true, jump: true });
      for (let i = 0; i < 40; i++) r.frame({});
    }
    const dbl = log.filter(([w, d]) => w === 'move' && d.startsWith('double'));
    assert.equal(dbl.length, 1, JSON.stringify(log));
    assert.match(dbl[0][1], /^double \d+$/);
    // the mushroom: dropped onto it
    r.fly(1635, 560, 0, 200, 1);
    for (let i = 0; i < 30; i++) r.frame({});
    r.fly(1635, 560, 0, 200, 1);
    for (let i = 0; i < 30; i++) r.frame({});
    const bnc = log.filter(([w, d]) => w === 'move' && d.startsWith('bounce'));
    assert.equal(bnc.length, 1, JSON.stringify(log));
    // a restart: noted again
    recorder.stageStart();
    r.fly(900, 400, 0, 0, 1);
    r.frame({ press: true, jump: true });
    assert.equal(log.filter(([w, d]) => w === 'move' && d.startsWith('double')).length, 2);
  } finally {
    stop();
  }
});

test("recorder 'pickup': a petal and a heart he takes, by kind and x; a heart left (full hearts) is not one", () => {
  const r = new RealPlay('1-1', 1);
  const e = bare(r);
  const base = { collected: false, bobPhase: 0 };
  e.collectibles.push({ ...base, id: 9101, type: 'flower', x: 800, y: 680 } as Collectible, { ...base, id: 9102, type: 'heart', x: 1200, y: 680 } as Collectible);
  const { log, stop } = listen();
  try {
    r.stand(700, 700);
    r.p.hp = r.p.maxHp;
    for (let i = 0; i < 30 * 5 && r.p.x < 1300; i++) r.frame({ right: true });
    const picks = log.filter(([w]) => w === 'pickup').map(([, d]) => d);
    assert.deepEqual(picks, ['flower 800'], `full hearts: the heart stays (${JSON.stringify(log)})`);
    r.p.hp = 1;
    r.stand(1100, 700);
    for (let i = 0; i < 30 * 2 && r.p.x < 1300; i++) r.frame({ right: true });
    assert.deepEqual(log.filter(([w]) => w === 'pickup').map(([, d]) => d), ['flower 800', 'heart 1200']);
  } finally {
    stop();
  }
});

test("recorder 'dot': the line Dot really says, by its review id (old words or new), never the raw words when the review has it", () => {
  const r = new RealPlay('1-1', 1);
  bare(r);
  const { log, stop } = listen();
  try {
    (r as unknown as { e: { guide: (t: string, s: number) => void } }).e.guide('Jump the little gaps', 3);
    assert.deepEqual(log.filter(([w]) => w === 'dot'), [['dot', 'hint.1-1.gaps']]);
  } finally {
    stop();
  }
  assert.equal(dotLogId('Hop from stone to stone', '1-1'), 'hint.1-1.stones');
  assert.equal(dotLogId('Flick up to hop stone to stone.', '1-1'), 'hint.1-1.stones', 'the new words find the same line');
  assert.equal(dotLogId('Something nobody wrote down'), '"Something nobody wrote down"');
  assert.equal(dotLogId(''), '');
});

test("recorder 'softFall': Easy's put-back is noted with x (no life lost)", () => {
  setDifficulty('easy');
  const r = new RealPlay('1-1', 1);
  try {
    const e = bare(r) as unknown as { platforms: Platform[]; softAt: unknown };
    e.platforms.splice(0, e.platforms.length, P(9001, 200, 600, 600, 300), P(9003, 1500, 600, 400, 300));
    e.softAt = null;
    r.stand(700, 600);
    for (let i = 0; i < 10; i++) r.frame({});
    const { log, stop } = listen();
    try {
      for (let i = 0; i < 30 * 6 && !log.some(([w]) => w === 'softFall'); i++) r.frame({ right: true });
      const sf = log.filter(([w]) => w === 'softFall');
      assert.ok(sf.length >= 1, JSON.stringify(log));
      assert.match(sf[0][1], /^\d+$/);
      assert.ok(!log.some(([w]) => w === 'lostLife'), 'a soft fall costs no life');
    } finally {
      stop();
    }
  } finally {
    setDifficulty('normal');
  }
});

test("recorder 'section': a gen2 stretch in the survey's plain words, then its id; the old course's names as they are", () => {
  assert.equal(sectionLabel('w1-stones:ki'), 'The stepping stones | w1-stones:ki');
  assert.equal(sectionLabel('w1-meadow:rest'), 'Walking | w1-meadow:rest');
  assert.equal(sectionLabel('Long jumps'), 'Long jumps');
  const { log, stop } = listen();
  try {
    const rec = recorder as unknown as { pokey: (x: number, y: number, vx: number, vy: number, s: string, sec: string) => void; section: string };
    rec.section = '';
    rec.pokey(100, 500, 0, 0, 'g', 'w1-learn:ki');
    rec.pokey(140, 500, 0, 0, 'g', 'w1-learn:ki');
    assert.deepEqual(log.filter(([w]) => w === 'section'), [['section', 'The first jumps | w1-learn:ki']], 'once, on the way in');
  } finally {
    stop();
  }
});

test("recorder 'dot': the first-run coach's line (its old words, which the review keeps as coach.run) gets its id too", () => {
  // (the browser run of 11-06 logged it as quoted words: the review's plain-words table does not hold the coach's lines)
  assert.equal(dotLogId('Touch anywhere and slide to run. You do not have to touch Pokey. Put your thumb down anywhere on the screen and slide sideways. Slide the other way to turn around.', '1-1'), 'coach.run');
});
