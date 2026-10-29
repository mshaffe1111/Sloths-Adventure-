/**
 * Dot's pacing (a development tool, like the rest of tools/inspect): how many of her lines a quick player hears in each stage, and when,
 * on a "Dot's help" setting, playing the stages in order on one save (what she has taught carries on, as in the game).
 *
 *   npx tsx tools/inspect/dotPace.ts [--help teach|reminders] [--worlds 1,2] [--fresh] [--list 1-6,4-3|all] [--json out.json]
 *
 * The quick player is the inspector's brisk route (route.ts), walked in the real engine (realPlay.ts): each frame Pokey is stood where
 * the route has him at that moment, so the engine says its stage tips, lessons and goal lines where he passes them (with the camera
 * and the lessons running, as on a phone). Those lines go through Dot's queue and her help setting as the app runs them (dotSay.ts:
 * the Tips filter and gap, heard once shown); the moves the route makes (jumps, climbs, swings) count as done. He never struggles, so
 * no struggle help is said, and the first stage's coach and the wayside story beats are not counted. `--fresh`: every stage on a phone
 * with nothing taught yet (the polish report's first count). Prints per stage: lines, lines a minute, and the most in any 30 s.
 */
import { RealPlay } from '../../src/game/realPlay.ts';
import { GameEngine } from '../../src/game/engine.ts';
import { GUIDE, GuideQueue, type GuideLine, type MoveId } from '../../src/game/dotGuide.ts';
import { engineGuideLine } from '../../src/game/dotLines.ts';
import { lessonDotLine, type LessonId } from '../../src/game/lessons.ts';
import { markMoveDone, markSkillSeen, movesDone, seenSkills, type DotHelp } from '../../src/game/dotGuideHelp.ts';
import { DotSay } from '../../src/game/dotSay.ts';
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
const MOVE_IDS: MoveId[] = ['run', 'jump', 'double', 'grab', 'climb', 'leap', 'glide', 'punch', 'kick', 'crouch', 'push', 'bounce'];

export interface Paced {
  id: string;
  world: number;
  seconds: number;
  lines: Array<{ t: number; text: string; kind: string; key: string }>;
  /** the most lines that started in any 30 s */
  busiest: number;
}

/** the most lines that start in any `win` seconds */
export function busiestIn(lines: ReadonlyArray<{ t: number }>, win = 30): number {
  let most = 0;
  for (const l of lines) most = Math.max(most, lines.filter((m) => m.t >= l.t && m.t < l.t + win).length);
  return most;
}

/** one stage on the phone as it is now (localStorage carries what earlier stages taught) */
export function pace(id: string, seed: number, help: DotHelp): Paced {
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
  const q = new GuideQueue(!/-D$/.test(id));
  const seen = seenSkills();
  const dot = new DotSay(q, help, seen, movesDone());
  const moves: Record<string, number> = {};
  const marked = new Set<string>();
  const lines: Paced['lines'] = [];
  const shownN: number[] = [];
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
      if (l) dot.say(l, t * 1000);
    }
    q.tick(t * 1000, { danger: false, hold: t < 1.5, moveCount: (m: MoveId) => moves[m] ?? 0 });
    dot.keep(t * 1000);
    // (the moves he has done, kept for later stages, as DotGuide.tsx keeps them)
    for (const m of MOVE_IDS) if (!marked.has(m) && (moves[m] ?? 0) > 0) {
      marked.add(m);
      markMoveDone(m);
    }
    for (const ev of q.drain()) {
      const l = ev.show.line;
      if (ev.type === 'start') {
        lines.push({ t: +t.toFixed(1), text: l.text, kind: l.kind, key: l.key });
        shownN.push(ev.show.n);
      } else {
        // (a line cut before its minimum time never really reached the screen, her bubble comes after her flight: not counted)
        const i = shownN.indexOf(ev.show.n);
        if (ev.why === 'cut' && t * 1000 - ev.show.startedAt < GUIDE.minShowMs && i >= 0) {
          lines.splice(i, 1);
          shownN.splice(i, 1);
        }
        if (l.skill && (ev.why === 'done' || (ev.why === 'read' && !l.move))) {
          markSkillSeen(l.skill);
          seen.add(l.skill);
        }
        if (l.next && (ev.why === 'done' || ev.why === 'read')) dot.say(l.next, t * 1000);
      }
    }
  }
  return { id, world, lines, seconds: end, busiest: busiestIn(lines) };
}

if (process.argv[1]?.includes('dotPace')) {
  const a = process.argv.slice(2);
  const arg = (k: string, d: string) => {
    const i = a.indexOf(`--${k}`);
    return i >= 0 ? a[i + 1] : d;
  };
  const help = arg('help', 'reminders') as DotHelp;
  const worlds = arg('worlds', '1,2,3,4,5,6').split(',').map(Number);
  const fresh = a.includes('--fresh');
  const list = new Set(arg('list', '').split(',').filter(Boolean));
  const out: Paced[] = [];
  localStorage.clear();
  for (const w of worlds) {
    for (const entry of stageList([w], 1).stages) {
      if (/-D$/.test(entry.id)) continue;
      if (fresh) localStorage.clear();
      const r = pace(entry.id, 1, help);
      out.push(r);
      const perMin = r.seconds > 0 ? r.lines.length / (r.seconds / 60) : 0;
      console.log(`${r.id} (${Math.round(r.seconds)} s): ${r.lines.length} lines, ${perMin.toFixed(1)} a minute, busiest 30 s ${r.busiest}`);
      if (list.has(r.id) || list.has('all')) for (const l of r.lines) console.log(`    ${l.t.toFixed(0)}s [${l.kind}] ${l.text}`);
    }
    const ws = out.filter((r) => r.world === w);
    const n = ws.reduce((s, r) => s + r.lines.length, 0);
    const sec = ws.reduce((s, r) => s + r.seconds, 0);
    console.log(`World ${w} on ${help}: ${(n / ws.length).toFixed(1)} lines a stage, ${(n / (sec / 60)).toFixed(2)} a minute, busiest 30 s ${Math.max(...ws.map((r) => r.busiest))}`);
  }
  const j = arg('json', '');
  if (j) void import('node:fs').then((fs) => fs.writeFileSync(j, JSON.stringify(out, null, 1)));
}
