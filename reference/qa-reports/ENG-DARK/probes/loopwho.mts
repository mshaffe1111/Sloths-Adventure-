// which rim a high-loop run goes over again and again: GEN2_DRAFT=3-1 npx tsx <this> <bot> <setting> <seed>
import path from 'node:path';
const root = process.cwd();
const [bot, setting, seed] = process.argv.slice(2);
const { readyDraft } = await import(path.join(root, 'tools/engine/draft.ts'));
readyDraft('3-1');
const cb = await import(path.join(root, 'tools/inspect/castBots.ts'));
const ft = await import(path.join(root, 'tools/inspect/firsttimer.ts'));
let B: any;
const r = ft.firstTimer('3-1', Number(seed), cb.CAST_BOTS[bot][setting], { dotSetting: true, onFrame(sm: any, b: any) { B = b; const t = sm.e.gameTime; if (t >= Number(process.env.T0 ?? 1e9) && t < Number(process.env.T0) + 1.6) console.log('t', t.toFixed(2), Math.round(sm.p.x), Math.round(sm.p.y), Math.round(sm.p.vx), Math.round(sm.p.vy), sm.p.grounded ? 'G' : 'air', sm.p.climbing ? 'climb' : '', 'stop', b.glowStop ? b.glowStop.rim.x + ':' + b.glowStop.rim.dir + ':' + (b.glowStop.turn ?? '') : '-', 'way', b.way, 'gave', b.glowGaveUp.size); } });
console.log(bot, setting, seed, r.end, r.time, JSON.stringify({ ...r.dark, unlit: r.dark?.unlit.length }));
const m = new Map<string, any[]>();
for (const c of B.rimWatch.crossings) { if (c.climbed) continue; const k = `${c.rim.x},${Math.round(c.rim.y)} dir ${c.rim.dir} piece ${c.rim.piece.x}+${c.rim.piece.width}`; (m.get(k) ?? m.set(k, []).get(k)!).push(c.t.toFixed(1)); }
for (const [k, ts] of [...m].sort((a, b) => b[1].length - a[1].length).slice(0, 3)) console.log(ts.length, k, ts.slice(0, 14).join(' '));
