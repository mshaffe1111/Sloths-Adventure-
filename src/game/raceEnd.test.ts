// A pacer race's END line (ENG-JETTY, 11-23; reference/story/lines-2-7.md rows 4 and the keeper's conflict 3): the step HE reaches the
// dock, won or lost, the stage's own line is said ONCE by the speaker it names: never mid-race (the boat docking first says nothing),
// never twice (a respawn after the dock, and the finish crossed again), and only from the stage's brief (tip ids in the world's tips).
// The toy plants a race on a listed stage and plays it through the engine's own loop (RealPlay): with the hook (engine.ts sayRaceEnd)
// taken out, tests 1 and 2 are RED (no line at the dock).
import test from 'node:test';
import assert from 'node:assert/strict';
import './headlessDom.ts';
import { RealPlay } from './realPlay.ts';
import { buildGen2Stage } from './gen2/pipeline.ts';
import { towerCfg } from './gen2/toyTower.ts';
import { HOME_CODE, homeKit } from './gen2/toyHome.ts';
import { raceEndsOf, type Pacer, type RaceEndSaid, type RaceEnds } from './pacer.ts';
import { engineGuideLine } from './dotLines.ts';
import { helpAllows } from './dotGuideHelp.ts';
import type { WorldKit } from './gen2/types.ts';

const WIN = 'Planted: you beat the toy boat!';
const LOSE = 'Planted: the toy boat got there first.';
const ENDS: RaceEnds<RaceEndSaid> = { win: { text: WIN, who: 'Dot' }, lose: { text: LOSE, who: 'Pokey' } };
const DT = 1 / 30;

type Said = { text: string; who?: string; t: number };
type Eng = { pieces: unknown[]; startPieces(): void; respawnAtCheckpoint(reason: 'pit', take?: boolean): void; gameTime: number; currentStage: { pacer?: Pacer };
  guide(text: string, s: number, o?: { who?: string }): void };

/** a listed stage's real engine with a toy race planted from where he stands: the start just ahead, the dock a little past it (on his own
 *  ground, so nothing but the race moves), the boat's time `seconds`; every line the engine says is noted with its speaker */
function plant(seconds = 5) {
  const r = new RealPlay('2-1', 1);
  const e = r.e as unknown as Eng;
  const x = r.p.x;
  const pacer: Pacer = { x0: x + 4, x1: x + 40, lane: r.p.y, dir: 1, yMin: -1e9, seconds, middle: seconds * 0.9, rideOnly: seconds * 2, under: 1, art: [], ends: ENDS };
  e.currentStage.pacer = pacer;
  e.startPieces();
  const said: Said[] = [];
  const g = e.guide.bind(e);
  e.guide = (text, s, o) => (said.push({ text, who: o?.who, t: e.gameTime }), g(text, s, o));
  /** play `n` steps with him held at `at` (the pieces step before he moves, so each step reads him there) */
  const hold = (at: number, n = 1) => {
    for (let i = 0; i < n; i++) {
      r.p.x = at;
      r.p.vx = 0;
      r.frame();
    }
  };
  const race = () => said.filter((l) => l.text === WIN || l.text === LOSE);
  return { r, e, pacer, hold, race };
}

test('race end 1 (WIN): Dot says the win line once, the step he reaches the dock before the boat; nothing mid-race; nothing again', () => {
  const { e, pacer, hold, race } = plant();
  hold(pacer.x0 - 10, 5);
  hold(pacer.x0 + 1, 30);
  assert.equal(race().length, 0, 'never mid-race: a second on the leg says nothing');
  hold(pacer.x1 + 1);
  assert.deepEqual(race().map((l) => [l.text, l.who]), [[WIN, 'Dot']], 'the win line, by Dot, the step he reaches the dock');
  hold(pacer.x1 + 1, 60);
  assert.equal(race().length, 1, 'once: standing on at the dock says it no more');
  // (a fall after the dock, and the finish crossed again: the verdict outlives the respawn; nothing is said again)
  e.respawnAtCheckpoint('pit', false);
  hold(pacer.x0 + 1, 10);
  hold(pacer.x1 + 1, 30);
  assert.equal(race().length, 1, 'never twice: the finish replayed after a respawn says nothing');
});

test('race end 2 (LOSE): the boat docks first and says nothing; Pokey says the lose line once when HE reaches the dock', () => {
  const { pacer, hold, race } = plant(2);
  hold(pacer.x0 + 1, Math.round(3 / DT));
  assert.equal(race().length, 0, 'the boat docking while he is still out says nothing (no clock on screen, the design :29)');
  hold(pacer.x1 + 1);
  assert.deepEqual(race().map((l) => [l.text, l.who]), [[LOSE, 'Pokey']], 'the lose line, by Pokey, the step he reaches the dock');
  hold(pacer.x1 + 1, 60);
  assert.equal(race().length, 1, 'once');
});

test('race end 3: a stage start lays a new race, whose own finish is said once (the last race\'s mark does not carry)', () => {
  const { e, pacer, hold, race } = plant();
  hold(pacer.x0 + 1, 3);
  hold(pacer.x1 + 1, 3);
  assert.equal(race().length, 1);
  e.startPieces();
  hold(pacer.x0 - 10, 3);
  hold(pacer.x0 + 1, 3);
  assert.equal(race().length, 1, 'the new race says nothing mid-race');
  hold(pacer.x1 + 1, 3);
  assert.equal(race().length, 2, "the new race's finish is said once");
});

test('race end 4: a race with no end lines says nothing at its finish (the hook reads only the brief)', () => {
  const { e, pacer, hold, race } = plant();
  e.currentStage.pacer = { ...pacer, ends: undefined };
  e.startPieces();
  hold(pacer.x0 + 1, 3);
  hold(pacer.x1 + 1, 30);
  assert.equal(race().length, 0);
});

test("race end 5: the brief's race-end tip ids are read from the world's tips when the stage is laid; a missing tip is named", () => {
  const ID = '2-97';
  const k = homeKit(ID, HOME_CODE);
  const G = k.manifest.graphs!;
  const kit = { ...k, manifest: { ...k.manifest, tips: { ...k.manifest.tips, 'toy.win': WIN, 'toy.lose': LOSE },
    graphs: { ...G, briefs: { ...G.briefs, [ID]: { ...G.briefs![ID], raceEnd: { win: { tip: 'toy.win', who: 'Dot' }, lose: { tip: 'toy.lose', who: 'Pokey' } } } } } } } as WorldKit;
  const st = buildGen2Stage({ config: { ...towerCfg(ID, 'sprint'), unlocked: true }, kit, seed: 1, difficulty: 'normal' });
  assert.ok(st.pacer, 'the toy lays its pacer');
  assert.deepEqual(st.pacer.ends, ENDS, "the laid pacer carries the brief's lines in the world's words, each with its speaker");
  // (without the brief's lines: no ends; with an id the world has no words for: the problem is named, nothing half-laid)
  const plain = buildGen2Stage({ config: { ...towerCfg(ID, 'sprint'), unlocked: true }, kit: k, seed: 1, difficulty: 'normal' });
  assert.equal(plain.pacer?.ends, undefined, 'a brief with no race-end lines lays none');
  const bad = raceEndsOf({ win: { tip: 'toy.win', who: 'Dot' }, lose: { tip: 'toy.nope', who: 'Pokey' } }, { 'toy.win': WIN });
  assert.equal(bad.ends, undefined);
  assert.deepEqual(bad.problems, ["race end: the lose line's tip 'toy.nope' has no words in the world's tips"]);
});

test("race end 6: Dot's guide says it as a story line by its named speaker, on every help setting's default (D50), never Dot's words by Pokey", () => {
  const lose = engineGuideLine(LOSE, '2-97', { dot: true, who: 'Pokey' })!;
  assert.equal(lose.who, 'Pokey');
  assert.equal(lose.kind, 'story');
  assert.equal(lose.source, 'story');
  assert.equal(lose.text, LOSE, 'in its own words');
  const win = engineGuideLine(WIN, '2-97', { dot: true, who: 'Dot' })!;
  assert.equal(win.who, 'Dot');
  // (Normal's default is Tips ('reminders'), Easy's Help ('teach'): the line passes both, with the story switch on as it starts)
  for (const help of ['reminders', 'teach'] as const) {
    assert.ok(helpAllows(win, help, new Set(), true), `said on ${help}`);
    assert.ok(helpAllows(lose, help, new Set(), true), `said on ${help}`);
  }
  assert.equal(engineGuideLine(WIN, '2-97', { dot: false, who: 'Dot' }), null, "with Dot away her line is not put in Pokey's mouth");
});
