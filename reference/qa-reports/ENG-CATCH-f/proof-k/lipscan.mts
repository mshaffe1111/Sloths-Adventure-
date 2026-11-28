// read only: for child Easy rolls [a..b] on the 3-1 draft, run to cap s, print every rim a stop is held at past its end (first time, frames), and its unlit
const root = process.argv[2], a = +process.argv[3], b = +process.argv[4], cap = +process.argv[5];
await import(root + '/src/game/headlessDom.ts');
const { readyDraft } = await import(root + '/tools/engine/draft.ts');
readyDraft('3-1');
const { firstTimer } = await import(root + '/tools/inspect/firsttimer.ts');
const { CAST_BOTS } = await import(root + '/tools/inspect/castBots.ts');
for (let roll = a; roll <= b; roll++) {
  const past = new Map<string, { n: number; t: number }>();
  const t0 = Date.now();
  const r = firstTimer('3-1', roll, { ...CAST_BOTS.child.easy! }, { cap, dotSetting: true, onFrame(sim: any, bb: any) {
    const g = bb.glowStop, p = sim.p;
    if (!g || !p.grounded || (p.x - g.rim.x) * g.rim.dir <= 0 || bb.e.standingOnId !== g.rim.piece.id) return;
    const at = `the rim at x ${g.rim.x}, y ${Math.round(g.rim.y)} (` + (g.rim.runOff ? "[runOff]" : "[own]");
    const o = past.get(at) ?? { n: 0, t: bb.e.gameTime }; o.n++; past.set(at, o);
  } });
  const rows = [...past].map(([k, o]) => `${k} t=${o.t.toFixed(2)} n=${o.n} unlit=${(r.dark?.unlit ?? []).filter((u: string) => u.includes(k.replace(/\[.*/, ""))).length}`);
  console.log(`roll ${roll} end=${(r as any).end ?? ''} ${((Date.now() - t0) / 1000).toFixed(1)}s: ${rows.join(' | ') || '-'}`);
}
