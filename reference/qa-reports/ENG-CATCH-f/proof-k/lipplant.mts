// read only: one child Easy roll on the 3-1 draft, with and without noLipHold: frames held past a rim's end (first time, his facing, rim dir, stop.turn), and every unlit / gaveUp / edgeTurn
const root = process.argv[2], roll = +process.argv[3];
await import(root + '/src/game/headlessDom.ts');
const { readyDraft } = await import(root + '/tools/engine/draft.ts');
readyDraft('3-1');
const { firstTimer } = await import(root + '/tools/inspect/firsttimer.ts');
const { CAST_BOTS } = await import(root + '/tools/inspect/castBots.ts');
for (const noLipHold of [false, true]) {
  const seen: string[] = [];
  let prevPast = false;
  const r = firstTimer('3-1', roll, { ...CAST_BOTS.child.easy!, noLipHold }, { cap: 400, dotSetting: true, onFrame(sim: any, bb: any) {
    const g = bb.glowStop, p = sim.p;
    const past = !!g && p.grounded && (p.x - g.rim.x) * g.rim.dir > 0 && bb.e.standingOnId === g.rim.piece.id;
    if (past && !prevPast) seen.push(`t=${bb.e.gameTime.toFixed(2)} rim ${g.rim.x},${Math.round(g.rim.y)} dir ${g.rim.dir} facing ${p.facing} x ${p.x.toFixed(1)} turn ${g.turn ?? '-'} runOff ${!!g.rim.runOff}`);
    if (!past && prevPast) seen.push(`  end t=${bb.e.gameTime.toFixed(2)} x ${p.x.toFixed(1)} grounded ${p.grounded} stop ${!!g}`);
    prevPast = past;
  } });
  console.log(`roll ${roll} noLipHold=${noLipHold} end=${(r as any).end}`);
  console.log('  held past: ' + (seen.join('\n   ') || '-'));
  console.log('  unlit: ' + JSON.stringify(r.dark?.unlit));
  console.log('  gaveUp: ' + JSON.stringify(r.dark?.gaveUp));
}
