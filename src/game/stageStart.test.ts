/**
 * The first seconds of every World 1-4 stage (QA 2026-10-28, build 39fc3db: 2-2 drowned a fresh player at 0.9 s, and Dot's "Flick up
 * just before the edge." came only after the life was lost; 2-5 bit him in the first two seconds, before her first line).
 *
 * Played in the real engine (realPlay.ts), with real damage, the lessons and the camera running, by a player who holds right from the
 * very first frame and does nothing else, upright (390x844) and sideways (844x390):
 *   - nothing hurts him, and he cannot fall or walk into water, in the first START_SAFE seconds;
 *   - the first thing that does hurt him comes after one of Dot's lines (a stage tip or a lesson) that went up at least LEAD before it,
 *     through Dot's queue as the app runs it (dotGuide.ts, with the goal card holding it for its first moments).
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { RealPlay } from './realPlay.ts';
import { GameEngine } from './engine.ts';
import { GuideQueue, type MoveId } from './dotGuide.ts';
import { engineGuideLine } from './dotLines.ts';
import { lessonDotLine, type LessonId } from './lessons.ts';
import { DANGER } from './dotGuideWatch.ts';

/** seconds of plain walking in which nothing may hurt him */
export const START_SAFE = 4;
/** Dot's first line is up at least this long (s) before the first thing that hurts him */
const LEAD = 0.8;
/** how long the plain walk goes on (s), looking for the first thing that hurts */
const LOOK = 12;
/** the goal card holds Dot's queue for its first moments (GoalCard.tsx: armed at 0.9 s, 0.48 s to shrink) */
const CARD_MS = 1500;

const STAGES: string[] = [];
for (const w of [1, 2, 3, 4]) for (let m = 1; m <= 9; m++) STAGES.push(`${w}-${m}`);
const VIEWS = { upright: [390, 844], sideways: [844, 390] } as const;

// (a phone: the lines in their touch words, lessons.ts lessonInputMode)
try {
  const w = globalThis as unknown as { window?: { matchMedia?: unknown } };
  if (w.window) w.window.matchMedia = () => ({ matches: true });
} catch {
  /* no window */
}

interface Start {
  /** when (s) and what first hurt him, or null */
  hurt: { t: number; what: string } | null;
  /** when Dot's first line went up through her queue (s), and its words */
  first: { t: number; text: string } | null;
}

function walkRight(id: string, view: readonly [number, number]): Start {
  // a first-timer: nothing taught on this phone yet
  try {
    localStorage.clear();
  } catch {
    /* no storage */
  }
  const win = globalThis as unknown as { window?: { innerWidth: number; innerHeight: number } };
  if (win.window) {
    win.window.innerWidth = view[0];
    win.window.innerHeight = view[1];
  }
  const sim = new RealPlay(id, 1);
  const e = sim.e;
  sim.safe = false;
  // (the harness skips the lessons and the camera: here they run, as on a phone, since a lesson waits for its thing to be on screen)
  const proto = GameEngine.prototype as unknown as Record<string, (...a: unknown[]) => unknown>;
  e.lessonTick = proto.lessonTick.bind(e);
  e.updateCamera = proto.updateCamera.bind(e);
  e.resizeCanvas();
  const q = new GuideQueue();
  let clock = 0;
  const said: Array<{ text: string; lesson?: LessonId }> = [];
  const cb = e.callbacks;
  cb.onLesson = (l: LessonId) => said.push({ text: '', lesson: l });
  cb.onGuide = (text: string, _s: number, passed?: boolean) => {
    if (text && !passed) said.push({ text });
  };
  let hurt: Start['hurt'] = null;
  e.loseLife = (why: string) => {
    hurt ??= { t: sim.t, what: `a life (${why})` };
    sim.died = true;
  };
  sim.p.invincibleTimer = 0;
  let hp = sim.p.hp;
  let first: Start['first'] = null;
  const moves: Record<string, number> = {};
  let wasAir = false;
  for (let i = 0; i < LOOK * 30 && !hurt; i++) {
    sim.frame({ right: true });
    if (sim.p.hp < hp) hurt ??= { t: sim.t, what: `a heart at x ${Math.round(sim.p.x)}` };
    hp = sim.p.hp;
    const p = sim.p;
    if (!p.grounded && !wasAir && p.vy < -60) moves.jump = (moves.jump ?? 0) + 1;
    wasAir = !p.grounded;
    for (const s of said.splice(0)) {
      const l = s.lesson ? lessonDotLine(s.lesson, 'screen') : engineGuideLine(s.text, id, { dot: true });
      if (l) q.push(l, clock);
    }
    const danger = e.enemies.some((en: { defeated: boolean; x: number; y: number }) => !en.defeated && Math.abs(en.x - p.x) < DANGER.foeDx && Math.abs(en.y - p.y) < DANGER.foeDy)
      || (!p.grounded && !p.climbing && p.vy > DANGER.fallVy);
    q.tick(clock, { danger, hold: clock < CARD_MS, moveCount: (m: MoveId) => moves[m] ?? 0 });
    for (const ev of q.drain()) if (ev.type === 'start' && !first) first = { t: clock / 1000, text: ev.show.line.text };
    clock += 1000 / 30;
  }
  return { hurt, first };
}

for (const [name, view] of Object.entries(VIEWS)) {
  test(`World 1-4 stage starts (${name}): nothing hurts a plain walk right in the first ${START_SAFE} s, and Dot speaks before the first thing that does`, () => {
    const bad: string[] = [];
    for (const id of STAGES) {
      const r = walkRight(id, view);
      if (process.env.START_DEBUG) console.log(name, id, JSON.stringify(r));
      if (r.hurt && r.hurt.t < START_SAFE) bad.push(`${id}: lost ${r.hurt.what} at ${r.hurt.t.toFixed(1)} s`);
      else if (r.hurt && (!r.first || r.first.t > r.hurt.t - LEAD)) {
        bad.push(`${id}: lost ${r.hurt.what} at ${r.hurt.t.toFixed(1)} s, ${r.first ? `Dot's first line ("${r.first.text}") only at ${r.first.t.toFixed(1)} s` : 'before Dot said anything'}`);
      }
    }
    assert.deepEqual(bad, []);
  });
}
