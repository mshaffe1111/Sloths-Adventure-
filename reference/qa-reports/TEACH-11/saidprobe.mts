// TEACH-11 scratch probe (not committed; args: TREE stage listed|live N): walk 1-1 on the brisk route with Dot's real queue and the default setting; when is the double line shown?
const TREE = process.argv[2];
await import(TREE + '/src/game/headlessDom.ts');
const { RealPlay } = await import(TREE + '/src/game/realPlay.ts');
const { GameEngine } = await import(TREE + '/src/game/engine.ts');
const { GUIDE, GuideQueue } = await import(TREE + '/src/game/dotGuide.ts');
const { engineGuideLine } = await import(TREE + '/src/game/dotLines.ts');
const { lessonDotLine } = await import(TREE + '/src/game/lessons.ts');
const { movesDone, seenSkills } = await import(TREE + '/src/game/dotGuideHelp.ts');
const { DotSay } = await import(TREE + '/src/game/dotSay.ts');
const { stageList } = await import(TREE + '/tools/inspect/stages.ts');
const { findRoute } = await import(TREE + '/tools/inspect/route.ts');
const { sampleRoute } = await import(TREE + '/tools/inspect/beats.ts');
const { setDifficulty } = await import(TREE + '/src/game/difficulty.ts');
const { provenSeeds } = await import(TREE + '/src/game/gen2/seedList.ts');
const { LISTED } = await import(TREE + '/src/game/gen2/listed.ts');
const { laidAsks } = await import(TREE + '/src/game/gen2/pipeline.ts');
const a = process.argv.slice(3);
const id = a[0] ?? '1-1';
const mode = a[1] ?? 'listed';
const n = Number(a[2] ?? 5);
const verbose = a.includes('-v');
// (the moves the route makes count as done, as dotPace.ts counts them: a move line closes when he makes its move, not at its cap)
const MOVE_OF: Record<string, string[]> = { walk: ['run'], hop: ['jump'], jump: ['jump'], timedHop: ['jump'], bounce: ['bounce'], climb: ['grab', 'climb'], swing: ['grab', 'leap'], rope: ['grab'], glide: ['jump', 'glide'] };
const tally: Record<string, number> = {};
const live: number[] = []; let z = 20261124; while (live.length < n) { z = (z * 1103515245 + 12345) % 2147483648; live.push(10000000 + (z % 89999999)); }
const seeds = mode === 'live' ? live : mode === 'one' ? [n] : provenSeeds(id).slice(0, n);
for (const seed of seeds) for (const d of ['normal', 'easy'] as const) {
  try { localStorage.clear(); } catch { /* */ }
  setDifficulty(d);
  const help = d === 'easy' ? 'teach' : 'reminders';
  let entry; try { entry = stageList([1], seed).stages.find((s: any) => s.id === id); } catch { tally[d + ' BUILD-FAIL'] = (tally[d + ' BUILD-FAIL'] ?? 0) + 1; continue; }
  const route = findRoute(entry.build(false));
  const samples = sampleRoute(route);
  const win = globalThis as any;
  if (win.window) Object.assign(win.window, { innerWidth: 844, innerHeight: 390 });
  const sim = new RealPlay(id, seed);
  const e: any = sim.e;
  sim.safe = false;
  e.damagePlayer = () => {};
  const proto = GameEngine.prototype as any;
  e.lessonTick = proto.lessonTick.bind(e);
  e.updateCamera = proto.updateCamera.bind(e);
  e.resizeCanvas();
  const st: any = sim.stage;
  const kit = LISTED[id]?.kit();
  const tpl = new Map((kit?.manifest.sections ?? []).map((t: any) => [t.id, t]));
  const fsec = st.gen2.sections.find((q: any) => { const t: any = tpl.get(q.template); return t && (t.teaches === 'double' || (t.needs ?? []).includes('double')); });
  const ask = laidAsks(st).find((q: any) => q.move === 'double' || q.block === 'double'); const needX = ask ? ask.x0 : NaN;
  const said: any[] = [];
  e.callbacks.onLesson = (l: any) => said.push({ lesson: l });
  e.callbacks.onGuide = (text: string, _s: number, passed?: boolean, o?: any) => { if (text && !passed) said.push({ text, o }); };
  const q = new GuideQueue(true);
  const seen = seenSkills();
  const dot = new DotSay(q, help as any, seen, movesDone());
  const log: string[] = [];
  const moves: Record<string, number> = {};
  let lastSeg: unknown = null;
  let k = 0, shownAt: number | null = null, shownX = 0, sentAt: number | null = null, reached: number | null = null, why = '';
  const end = samples.length ? samples[samples.length - 1].base : 0;
  const stopX = Number.isFinite(needX) ? needX + 600 : Infinity;
  for (let t = 0; t <= end + 3; t += 1 / 30) {
    if (e.player.x > stopX && shownAt !== null) break;
    if (e.player.x > stopX + 3000) break;
    while (k + 1 < samples.length && samples[k + 1].base <= t) k++;
    const s = samples[k];
    if (s && s.seg !== lastSeg) { lastSeg = s.seg; for (const m of MOVE_OF[s.seg.kind] ?? []) moves[m] = (moves[m] ?? 0) + 1; }
    if (s) { e.player.x = s.x; e.player.y = s.y; e.player.vx = 0; e.player.vy = 0; e.player.grounded = true; e.player.invincibleTimer = 0; e.player.hp = e.player.maxHp; }
    sim.frame();
    if (reached === null && e.player.x >= needX) reached = t;
    for (const x of said.splice(0)) {
      const l = x.lesson ? lessonDotLine(x.lesson, 'screen') : engineGuideLine(x.text, id, { dot: true, ...(x.o ?? {}) });
      if (!l) continue;
      if (/twice|jump twice/i.test(l.text) && sentAt === null) sentAt = t;
      const ok = dot.say(l, t * 1000);
      log.push(`${t.toFixed(1)}s x${Math.round(e.player.x)} SAY ${ok ? '' : '(refused) '}${l.kind}${l.stageTeach ? '/teach' : ''}: ${l.text.slice(0, 44)}`);
    }
    q.tick(t * 1000, { danger: false, hold: t < 1.5, moveCount: (m: string) => moves[m] ?? 0 });
    dot.keep(t * 1000);
    for (const ev of q.drain()) {
      const l = ev.show.line;
      if (ev.type === 'start') {
        log.push(`${t.toFixed(1)}s x${Math.round(e.player.x)} SHOW ${l.text.slice(0, 44)}`);
        if (/twice/i.test(l.text) && shownAt === null) { shownAt = t; shownX = e.player.x; }
      } else {
        log.push(`${t.toFixed(1)}s END(${ev.why}) ${l.text.slice(0, 30)}`);
        if (/twice/i.test(l.text) && shownAt === null) why = ev.why;
      }
    }
  }
  const v = shownAt === null ? `NEVER(${sentAt === null ? 'not sent' : 'sent ' + sentAt.toFixed(1) + 's, ' + (why || 'dropped')})` : reached !== null && shownAt > reached ? 'LATE' : 'before';
  tally[`${d} ${v.replace(/\(.*/, '')}`] = (tally[`${d} ${v.replace(/\(.*/, '')}`] ?? 0) + 1;
  console.log(`${id} seed ${seed} ${d}/${help}: ${v}; first double ${fsec?.template} need x ${Math.round(needX)} reached ${reached?.toFixed(1)}s; shown ${shownAt?.toFixed(1)}s x ${Math.round(shownX)}`);
  if (verbose) for (const l of log) if (l.includes('SAY') || l.includes('SHOW') || l.includes('END')) console.log('   ' + l);
}
setDifficulty('normal');
console.log(JSON.stringify(tally));
void GUIDE;
