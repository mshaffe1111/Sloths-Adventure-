// Moves research (2026-11-05): scan built stages for STAIRS: runs of landings where each next one starts within 60 px to the right
// (overlap allowed) and stands 16..JUMP_RISE px higher. Counts rises per run, the way stairs_vglc.py counts SMB stairs. Heuristic.
import '../../src/game/headlessDom.ts';
import { generateAllLevels } from '../../src/game/worldsData.ts';
import { sim } from '../validate/play.ts';
import { JUMP_RISE } from '../../src/game/physics.ts';
const want = process.argv.slice(2);
const ids = generateAllLevels().filter((c) => !c.secret).map((c) => c.id).filter((id) => !want.length || want.some((w) => id.startsWith(w)));
const dist: Record<number, number> = {}; const steps: number[] = [];
for (const id of ids) {
  let s; try { s = sim(id, 1, 'normal'); } catch { console.log(id, 'build failed'); continue; }
  const ps = (s.stage.platforms as any[]).filter((p) => !p.broken && p.type !== 'bouncy' && p.width >= 40).sort((a, b) => a.x - b.x);
  const runs: { x: number; rises: number; dy: number[] }[] = [];
  const used = new Set<number>();
  for (let i = 0; i < ps.length; i++) {
    if (used.has(i)) continue;
    let cur = ps[i]; const dy: number[] = []; let j = i;
    for (;;) {
      let nxt = -1;
      for (let k = j + 1; k < ps.length && ps[k].x <= cur.x + cur.width + 60; k++) {
        const d = cur.y - ps[k].y; if (d >= 16 && d <= JUMP_RISE && ps[k].x > cur.x) { nxt = k; break; }
      }
      if (nxt < 0) break;
      dy.push(Math.round(cur.y - ps[nxt].y)); used.add(nxt); cur = ps[nxt]; j = nxt;
    }
    if (dy.length >= 2) runs.push({ x: Math.round(ps[i].x), rises: dy.length, dy });
  }
  for (const r of runs) { dist[r.rises] = (dist[r.rises] ?? 0) + 1; steps.push(...r.dy); }
  console.log(`${id}: ${runs.length} stairs` + (runs.length ? ' ' + runs.map((r) => `x${r.x}:${r.rises}[${r.dy.join(',')}]`).join(' ') : ''));
}
steps.sort((a, b) => a - b);
console.log(`JUMP_RISE ${Math.round(JUMP_RISE)} px; rises per stair ${JSON.stringify(dist)}; step height px: median ${steps[steps.length >> 1]}, ` +
  `p10 ${steps[Math.floor(steps.length * 0.1)]}, p90 ${steps[Math.floor(steps.length * 0.9)]}, n ${steps.length}; median step / JUMP_RISE ${(steps[steps.length >> 1] / JUMP_RISE).toFixed(2)}`);
