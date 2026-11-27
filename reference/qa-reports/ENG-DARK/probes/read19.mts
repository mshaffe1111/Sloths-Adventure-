// diagnosis only: at each candidate stand (seed:x:y), the bot's jumpFor read facing his way, planted and unplanted, and the stand's time
const T = process.argv[2];
await import(T + '/src/game/headlessDom.ts');
const { readied, readyDraft } = await import(T + '/tools/engine/draft.ts');
if (readied !== '3-1') readyDraft('3-1');
const { firstTimer } = await import(T + '/tools/inspect/firsttimer.ts');
const { CAST_BOTS } = await import(T + '/tools/inspect/castBots.ts');
for (const c of process.argv.slice(3)) {
  const [s, X, Y] = c.split(':').map(Number);
  const out: Record<string, unknown> = { c };
  for (const plant of [true, false]) {
    const reads: string[] = [];
    const r = firstTimer('3-1', s, { ...CAST_BOTS.child.normal!, noLevelRead: plant }, { cap: 1200, dotSetting: true, onFrame(sim, b) {
      const p = sim.p; if (reads.length >= 3 || !p.grounded || Math.abs(p.y - Y) > 2 || Math.abs(p.x - X) > 40) return;
      const bot = b as any; const rd = bot.jumpFor(p, p.facing < 0 ? -1 : 1, bot.floorAt(p.x, p.y, 6));
      if (reads[reads.length - 1] !== rd) reads.push(rd);
    } });
    const st = r.stuck.filter((q: any) => Math.abs(q.y - Y) < 4 && Math.abs(q.x - X) < 60);
    out[plant ? 'planted' : 'unplanted'] = { reads, stuck: st.map((q: any) => `${q.x} ${q.what}${q.t !== undefined ? ' t' + q.t : ''}`) };
  }
  console.log(JSON.stringify(out));
}
