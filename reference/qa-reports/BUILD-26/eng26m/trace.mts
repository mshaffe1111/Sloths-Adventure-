// ENG-26m: one line per run for a castBots miss (rule 28): seed, where he ended (x, frame), what took him (last harms, stuck spots).
// usage: npx tsx trace.mts <tree> <stage> "<bot> <setting> <seed>" ...   (the same call castBots makes: cap 1200, dotSetting)
const [root, stage, ...keys] = process.argv.slice(2);
await import(`${root}/src/game/headlessDom.ts`);
const { firstTimer } = await import(`${root}/tools/inspect/firsttimer.ts`);
const { CAST_BOTS } = await import(`${root}/tools/inspect/castBots.ts`);
for (const k of keys) {
  const [bot, setting, seedS] = k.split(' ');
  const r: any = firstTimer(stage, Number(seedS), CAST_BOTS[bot][setting], { cap: 1200, dotSetting: true });
  const last = r.harms.slice(-3).map((h: any) => `${h.kind} ${h.cause} @x${Math.round(h.x)},y${Math.round(h.y)} f${Math.round(h.t * 30)}`).join('; ');
  const st = (r.stuck ?? []).slice(-2).map((s: any) => `x${Math.round(s.x)},y${Math.round(s.y)} f${Math.round(s.t * 30)} ${s.what ?? ''}`.slice(0, 140)).join(' | ');
  console.log(`${stage} ${k}: end ${r.end} at x ${Math.round(r.x)} f${Math.round(r.time * 30)} (${r.time} s, progress ${(r.progress * 100).toFixed(0)}%), goal ${r.goal ? `${r.goal.got}/${r.goal.need}` : '-'}, rescued at x [${(r.rescueXs ?? []).map((x: number) => Math.round(x)).join(',')}], layout seed ${r.stageSeed ?? '?'}, harms ${r.harms.length} [${last}]${st ? `, stuck ${st}` : ''}`);
}
