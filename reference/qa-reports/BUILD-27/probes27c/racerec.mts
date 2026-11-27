// BUILD-27c scratch: a bot's run on 2-7 recorded for racepuppet.mjs: per frame his plain fields, every drifting platform's x/y (by its
// index in engine.platforms) and the pacer piece's plain fields; and the frame its verdict is set (who docked first)
import fs from 'node:fs';
import '../wt-b27c-f1/src/game/headlessDom.ts';
import { firstTimer } from '../wt-b27c-f1/tools/inspect/firsttimer.ts';
import { CAST_BOTS } from '../wt-b27c-f1/tools/inspect/castBots.ts';
const [bot = 'adult', setting = 'normal', seedS = '1', out = 'race.json', fromS = '0'] = process.argv.slice(2);
const prim = (v: unknown) => v === null || ['number', 'boolean', 'string'].includes(typeof v);
const flat = (o: Record<string, unknown>) => { const r: Record<string, unknown> = {}; for (const [k, v] of Object.entries(o)) if (prim(v)) r[k] = v; return r; };
const frames: Array<Record<string, unknown>> = []; let verdictAt = -1, verdict: unknown = null, n = 0;
const r: any = firstTimer('2-7', Number(seedS), (CAST_BOTS as any)[bot][setting], { cap: 1200, dotSetting: true, onFrame: (sim: any) => {
  const e = sim.e as any;
  const pc = e.pieces?.find?.((q: any) => q.kind === 'pacer') ?? null;
  const v = pc?.verdict ?? null;
  if (v && verdictAt < 0) { verdictAt = n; verdict = v; }
  if (n++ >= Number(fromS)) frames.push({ n: n - 1, t: +sim.t.toFixed(3), P: flat(e.player), D: e.platforms.map((q: any, i: number) => (q.drift || q.vx ? [i, +q.x.toFixed(2), +q.y.toFixed(2)] : null)).filter(Boolean), pc: pc ? { ...flat(pc), verdict: pc.verdict ?? undefined } : null });
} });
fs.writeFileSync(out, JSON.stringify({ bot, setting, seed: Number(seedS), end: r.end, time: r.time, verdictAt, verdict, frames }));
console.log(`${bot} ${setting} seed ${seedS}: ${n} frames (${frames.length} kept from ${fromS}), end ${r.end} ${r.time} s; verdict at frame ${verdictAt} ${JSON.stringify(verdict)}`);
