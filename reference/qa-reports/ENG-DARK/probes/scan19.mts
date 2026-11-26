// diagnosis only: child Normal, noLevelRead planted, rolls 1-40, castBots' call; prints planted stuck lines with no unplanted line within 30 px
import fs from 'node:fs';
const T = process.argv[2], base = process.argv[3];
await import(T + '/src/game/headlessDom.ts');
const { readied, readyDraft } = await import(T + '/tools/engine/draft.ts');
if (readied !== '3-1') readyDraft('3-1');
const { firstTimer } = await import(T + '/tools/inspect/firsttimer.ts');
const { CAST_BOTS } = await import(T + '/tools/inspect/castBots.ts');
const un: Record<number, { x: number; what: string }[]> = {};
for (const f of base.split(',')) for (const l of fs.readFileSync(f, 'utf8').split('\n')) { if (!l) continue; const j = JSON.parse(l);
  if (j.bot === 'child' && j.setting === 'normal') un[j.seed] = j.stuck; }
for (let s = 1; s <= 40; s++) {
  const r = firstTimer('3-1', s, { ...CAST_BOTS.child.normal!, noLevelRead: true }, { cap: 1200, dotSetting: true });
  const fresh = r.stuck.filter((q: any) => !(un[s] ?? []).some((u) => Math.abs(u.x - q.x) < 30));
  console.log(JSON.stringify({ seed: s, end: r.end, time: r.time, rescues: r.rescues, loop: r.dark?.loop, fresh: fresh.map((q: any) => `${q.x},${q.y}: ${q.what}`) }));
}
