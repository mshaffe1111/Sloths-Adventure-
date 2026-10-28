/**
 * Dot's pacing (a development tool, like the rest of tools/inspect): how many of her lines a quick player hears in a stage, and when.
 *
 *   npx tsx tools/inspect/dotPace.ts [1-1,1-7,2-2] [--seed 1] [--plain]
 *
 * The quick player is the inspector's brisk route (route.ts), walked in the real engine (realPlay.ts): each frame Pokey is stood where
 * the route has him at that moment, so the engine says its stage tips, lessons and goal lines where he passes them (with the camera
 * and the lessons running, as on a phone). Those lines go through Dot's queue as the app runs it (dotGuide.ts), toned down (CALM, as
 * Worlds 1-4 have her) or, with --plain, as before; the moves the route makes (jumps, climbs, swings) count as done. A first-time
 * player: nothing taught on this phone yet; he hides from a watcher in time. Prints, per stage, how many lines went up (and with
 * --list, each with the second it came at).
 */
import { RealPlay } from '../../src/game/realPlay.ts';
import { GameEngine } from '../../src/game/engine.ts';
import { GuideQueue, type GuideLine, type MoveId } from '../../src/game/dotGuide.ts';
import { engineGuideLine } from '../../src/game/dotLines.ts';
import { lessonDotLine, type LessonId } from '../../src/game/lessons.ts';
import { stageList } from './stages.ts';
import { findRoute, type Seg } from './route.ts';
import { sampleRoute } from './beats.ts';

// (a phone: the lines in their touch words, lessons.ts lessonInputMode)
try {
  const w = globalThis as unknown as { window?: { matchMedia?: unknown } };
  if (w.window) w.window.matchMedia = () => ({ matches: true });
} catch {
  /* no window */
}

const MOVE_OF: Partial<Record<Seg['kind'], MoveId[]>> = {
  walk: ['run'], hop: ['jump'], jump: ['jump'], timedHop: ['jump'], bounce: ['bounce'], climb: ['grab', 'climb'], swing: ['grab', 'leap'], rope: ['grab'], glide: ['jump', 'glide'],
};

export interface Paced { id: string; lines: Array<{ t: number; text: string }>; seconds: number }

export function pace(id: string, seed: number, calm: boolean): Paced {
  try {
    localStorage.clear();
  } catch {
    /* no storage */
  }
  const world = Number(id.split('-')[0]);
  const entry = stageList([world], seed).stages.find((s) => s.id === id);
  if (!entry) throw new Error(`no stage ${id}`);
  const route = findRoute(entry.build(false));
  const samples = sampleRoute(route);
  // (a phone held sideways: the lessons wait for their thing to be on screen)
  const win = globalThis as unknown as { window?: { innerWidth: number; innerHeight: number } };
  if (win.window) Object.assign(win.window, { innerWidth: 844, innerHeight: 390 });
  const sim = new RealPlay(id, seed);
  const e = sim.e;
  sim.safe = false;
  e.damagePlayer = () => {};
  const proto = GameEngine.prototype as unknown as Record<string, (...a: unknown[]) => unknown>;
  e.lessonTick = proto.lessonTick.bind(e);
  e.updateCamera = proto.updateCamera.bind(e);
  e.resizeCanvas();
  const said: Array<{ text: string; lesson?: LessonId }> = [];
  e.callbacks.onLesson = (l: LessonId) => said.push({ text: '', lesson: l });
  e.callbacks.onGuide = (text: string, _s: number, passed?: boolean) => {
    if (text && !passed) said.push({ text });
  };
  const q = new GuideQueue(calm);
  const moves: Record<string, number> = {};
  const lines: Paced['lines'] = [];
  let k = 0;
  let lastSeg: Seg | null = null;
  const end = samples.length ? samples[samples.length - 1].base : 0;
  for (let t = 0; t <= end + 3; t += 1 / 30) {
    while (k + 1 < samples.length && samples[k + 1].base <= t) k++;
    const s = samples[k];
    if (s) {
      if (s.seg !== lastSeg) {
        lastSeg = s.seg;
        for (const m of MOVE_OF[s.seg.kind] ?? []) moves[m] = (moves[m] ?? 0) + 1;
      }
      e.player.x = s.x;
      e.player.y = s.y;
      e.player.vx = 0;
      e.player.vy = 0;
      e.player.grounded = true;
      // (not hurt: a lesson waits for a moment he is not, lessons.ts cardSafe; and nothing hurts him on the route)
      e.player.invincibleTimer = 0;
      e.player.hp = e.player.maxHp;
    }
    sim.frame();
    // (a quick player hides from a watcher in time: it never catches him, so its warnings are the ones a hider hears)
    e.watchCaught = false;
    for (const x of said.splice(0)) {
      const l: GuideLine | null | undefined = x.lesson ? lessonDotLine(x.lesson, 'screen') : engineGuideLine(x.text, id, { dot: true });
      if (l) q.push(l, t * 1000);
    }
    q.tick(t * 1000, { danger: false, hold: t < 1.5, moveCount: (m: MoveId) => moves[m] ?? 0 });
    for (const ev of q.drain()) if (ev.type === 'start') lines.push({ t, text: ev.show.line.text });
  }
  return { id, lines, seconds: end };
}

if (process.argv[1]?.includes('dotPace')) {
  const a = process.argv.slice(2);
  const ids = (a.find((x) => /^\d-\d/.test(x)) ?? '1-1,1-7,2-2,2-5,3-2,4-1').split(',');
  const si = a.indexOf('--seed');
  const seed = si >= 0 ? Number(a[si + 1]) : 1;
  for (const id of ids) {
    const before = pace(id, seed, false);
    const after = pace(id, seed, true);
    console.log(`${id} (seed ${seed}, route ${Math.round(after.seconds)} s): ${before.lines.length} lines before, ${after.lines.length} after`);
    if (a.includes('--list')) for (const [name, r] of [['before', before], ['after', after]] as const) console.log(`  ${name}: ` + r.lines.map((l) => `${l.t.toFixed(0)}s ${l.text}`).join(' | '));
  }
}
