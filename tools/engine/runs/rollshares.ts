// RUNS, R-164.11 (the designer, 12:28 PM ET): per roll, on a tree's own builders and its own inspector, 32 rolls (era.ts rollVariants),
// Normal and Easy:
//   hop share   era's action mix on the inspector's chosen route (eraRoll.ts pickRoute(...).used, findBeats; the mix is measureRoll's,
//               eraRoll.ts:273-274): beats 'h' / (beats 'h' + beats 'J');
//   gap share   every jump on that route (jumps.ts routeJumps): the ledge gap (from the take-off ledge's end to the landing's near end, along
//               the jump's way; overlapping pieces, gap <= 0, left out) over the level check's widest single jump at that rise
//               (levelCheck.ts jumpOK searched as the mixer's gate does, w1mix.ts:192-204; Easy also capped by heldMaxGap);
//   rise share  every jump that goes up: its rise over the highest rise that gate allows across a 50 px gap (w1mix.ts:894-896's rule).
// Per roll: hop share, gap share median and p90, rise share median and p90.   npx tsx tools/engine/runs/rollshares.ts <tree> <ids> > out.json
const [root, ids] = process.argv.slice(2);
await import(root + '/src/game/headlessDom.ts');
const { generateAllLevels } = await import(root + '/src/game/worldsData.ts');
const { buildRoll, pickRoute } = await import(root + '/tools/inspect/eraRoll.ts');
const { rollVariants } = await import(root + '/tools/inspect/era.ts');
const { routeJumps } = await import(root + '/tools/inspect/jumps.ts');
const { jumpOK, heldMaxGap } = await import(root + '/src/game/levelCheck.ts');
const { setDifficulty } = await import(root + '/src/game/difficulty.ts');
const levels = new Map(generateAllLevels().map((c: any) => [c.id, c]));
const q = (v: number[], p: number) => { const a = [...v].sort((x, y) => x - y); return a.length ? a[Math.min(a.length - 1, Math.floor(p * a.length))] : null; };
const widest = (easy: boolean, dy: number) => { // easy = the mixer's Easy gate (jumpOK capped by heldMaxGap); false = jumpOK alone
  const A = { id: 0, x: 0, y: 800, width: 100, height: 24, type: 'solid' } as any;
  let lo = 0, hi = 400;
  while (hi - lo > 1) { const m = (lo + hi) >> 1; if (jumpOK(A, { id: 1, x: 100 + m, y: 800 - dy, width: 100, height: 24, type: 'solid' } as any, false).ok) lo = m; else hi = m; }
  return easy ? Math.min(lo, Math.floor(heldMaxGap(A, { id: 1, x: 100 + lo, y: 800 - dy, width: 100, height: 24, type: 'solid' } as any, false))) : lo;
};
const out: any[] = [];
for (const id of ids.split(',')) for (const easy of [false, true]) {
  setDifficulty(easy ? 'easy' : 'normal');
  // (two denominators on Easy, since the request names both: the level check alone, jumpOK, and the mixer's Easy gate, jumpOK capped
  // by heldMaxGap; on Normal they are the same)
  const mk = (gate: boolean) => { const c = new Map<number, number>(); return (dy: number) => { const k = Math.round(dy / 5) * 5; if (!c.has(k)) c.set(k, widest(gate, k)); return c.get(k)!; }; };
  const WJ = mk(false), WG = mk(easy);
  const top = (W: (d: number) => number) => { let m = 0; for (let dy = 10; dy <= 200; dy += 5) if (W(dy) >= 50) m = dy; return m; };
  const maxJ = top(WJ), maxG = top(WG);
  const cfg = levels.get(id)!;
  for (const v of rollVariants(32)) {
    const st = buildRoll(cfg, v, easy);
    const R = pickRoute(cfg.objectiveType, st).used;
    let h = 0, J = 0; for (const b of R.br.beats) { if (b.letter === 'h') h += b.count; if (b.letter === 'J') J += b.count; }
    const gJ: number[] = [], gG: number[] = [], rJ: number[] = [], rG: number[] = [];
    for (const e of routeJumps(R.route)) {
      const A = e.from, B = e.to;
      const gap = e.dir > 0 ? B.x - (A.x + A.width) : A.x - (B.x + B.width);
      if (gap > 0) { const a = WJ(e.rise), b = WG(e.rise); if (a > 0) gJ.push(gap / a); if (b > 0) gG.push(gap / b); }
      if (e.rise > 0) { if (maxJ > 0) rJ.push(e.rise / maxJ); if (maxG > 0) rG.push(e.rise / maxG); }
    }
    out.push({ id, setting: easy ? 'easy' : 'normal', variant: v, maxRiseJumpOK: maxJ, maxRiseGate: maxG, hops: h, jumps: J, hopShare: h + J ? h / (h + J) : null,
      gapMed: q(gJ, 0.5), gapP90: q(gJ, 0.9), gapN: gJ.length, gapGateMed: q(gG, 0.5), gapGateP90: q(gG, 0.9),
      riseMed: q(rJ, 0.5), riseP90: q(rJ, 0.9), riseN: rJ.length, riseGateMed: q(rG, 0.5), riseGateP90: q(rG, 0.9) });
    process.stderr.write(`${id} ${easy ? 'E' : 'N'} ${v}\n`);
  }
}
process.stdout.write(JSON.stringify(out));
