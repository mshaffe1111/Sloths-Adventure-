// The clock audit (EN-C, GAME-MAP A14): every beat a built stage carries, found by shape, on both settings, so the lead can see what
// the one clock (src/game/clock.ts) has to hold: the shortest warning and the shortest cycle of each kind in each world, any timer that
// hurts with no warning, and any stage where Easy's beat is faster than Normal's (ADR-003 decision 4: Easy is never faster).
//   npx tsx tools/engine/clockaudit.ts [--layouts 2] [--stages 4-1,6-3]
import '../../src/game/headlessDom.ts';
import { generateAllLevels } from '../../src/game/worldsData.ts';
import { generateStage, setLayoutVariant } from '../../src/game/stageGenerator.ts';
import { easyStage } from '../../src/game/easyMode.ts';
import { withGoals } from '../../src/game/goals.ts';
import { ROCK } from '../../src/game/rockfall.ts';
import { NEST } from '../../src/game/eaglet.ts';
import { ORCHID } from '../../src/game/w5Kit.ts';
const arg = (k: string) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : undefined; };
const N = Number(arg('--layouts') ?? 2);
const only = arg('--stages')?.split(',');
type Beat = { kind: string; period: number; warn: number; on: number };
const num = (o: any, ...ks: string[]) => ks.every((k) => typeof o[k] === 'number');
/** a timer, by the fields it carries (the same shapes clockMove.test.ts freezes) */
function beatOf(o: any): Beat | null {
  if (typeof o.kind === 'string' && num(o, 'period', 'warn', 'active', 'offset')) return o.kind === 'web' || o.kind === 'dark' || o.kind === 'crumble' ? null : { kind: 'zone:' + o.kind, period: o.period, warn: o.warn, on: o.active };
  if (num(o, 'every', 'warn', 'offset', 'top', 'land')) return { kind: 'rock', period: o.every, warn: o.warn, on: Math.max(0.01, (o.land - o.top) / ROCK.speed) };
  if (num(o, 'sleep', 'stir', 'look', 'offset')) return o.awake ? null : { kind: 'thorn-vine', period: o.sleep + o.stir + o.look, warn: o.stir, on: o.look };
  if (num(o, 'idle', 'warn', 'puff', 'offset')) return { kind: 'teapot', period: o.idle + o.warn + o.puff, warn: o.warn, on: o.puff };
  if (num(o, 'pour', 'ease', 'quiet', 'offset')) return { kind: 'surge-fall', period: o.pour + o.ease + o.quiet, warn: o.ease, on: o.pour };
  if (num(o, 'period', 'open', 'offset', 'w')) return { kind: 'orchid', period: o.period, warn: ORCHID.tell, on: o.period - o.open - ORCHID.tell };
  if (num(o, 'every', 'offset', 'x0', 'x1') && !('top' in o)) return { kind: 'eagle-nest', period: o.every, warn: NEST.stir, on: NEST.look };
  return null;
}
function crawl(o: any, out: Beat[], seen: Set<any>, depth = 0): void {
  if (!o || typeof o !== 'object' || seen.has(o) || depth > 6) return;
  seen.add(o);
  if (Array.isArray(o)) { for (const v of o) crawl(v, out, seen, depth + 1); return; }
  const b = beatOf(o);
  if (b) { out.push(b); return; }
  for (const v of Object.values(o)) crawl(v, out, seen, depth + 1);
}
const r2 = (n: number) => Math.round(n * 100) / 100;
const rows: Record<string, { n: number; minWarn: number; minPeriod: number; stages: Set<string> }> = {};
const unwarned: string[] = [];
const faster: string[] = [];
for (const c of generateAllLevels().filter((l) => !l.secret && (!only || only.includes(l.id)))) {
  for (let v = 1; v <= N; v++) {
    const built: Record<string, Beat[]> = {};
    for (const setting of ['normal', 'easy'] as const) {
      setLayoutVariant(v);
      let st: any = null;
      try { st = setting === 'easy' ? easyStage(withGoals(generateStage({ ...c, unlocked: true }, 'easy'))) : withGoals(generateStage({ ...c, unlocked: true }, 'normal')); } catch { /* the lock names a stage that does not build */ }
      setLayoutVariant(null);
      const beats: Beat[] = [];
      if (st) crawl(st, beats, new Set());
      built[setting] = beats;
      for (const b of beats) {
        const row = (rows[`W${c.worldIndex} ${b.kind} ${setting}`] ??= { n: 0, minWarn: Infinity, minPeriod: Infinity, stages: new Set() });
        row.n++; row.minWarn = Math.min(row.minWarn, b.warn); row.minPeriod = Math.min(row.minPeriod, b.period); row.stages.add(c.id);
        if (!(b.warn > 0)) unwarned.push(`${c.id} ${setting} layout ${v}: ${b.kind} warns for ${b.warn} s`);
      }
    }
    for (const kind of new Set(built.normal.map((b) => b.kind))) {
      const least = (s: string, f: (b: Beat) => number) => Math.min(...built[s].filter((b) => b.kind === kind).map(f));
      for (const [what, f] of [['cycle', (b: Beat) => b.period], ['warning', (b: Beat) => b.warn]] as const) {
        const n = least('normal', f);
        const e = least('easy', f);
        if (e < n - 1e-9) faster.push(`${c.id} layout ${v}: ${kind} shortest ${what} ${r2(e)} s on Easy, ${r2(n)} s on Normal`);
      }
    }
  }
  process.stderr.write(`${c.id} `);
}
console.log('\n\nworld  kind  setting: timers, stages, shortest warning (s), shortest cycle (s)');
for (const k of Object.keys(rows).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))) { const r = rows[k]; console.log(`  ${k}: ${r.n}, ${[...r.stages].join(' ')}, ${r2(r.minWarn)}, ${r2(r.minPeriod)}`); }
console.log(`\nhurting with no warning: ${unwarned.length}`); for (const u of unwarned.slice(0, 40)) console.log('  ' + u);
console.log(`\nEasy faster than Normal: ${faster.length}`); for (const f of faster.slice(0, 60)) console.log('  ' + f);
