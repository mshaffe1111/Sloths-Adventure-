/**
 * Dot's pacing, in order on one save, on a help setting, for the code at ROOT (old or new).
 *   ROOT=/path npx tsx pace2.ts --help teach|reminders [--worlds 1,2] [--fresh] [--list 1-6,4-3] [--json out.json]
 * Old code: Teach me / Just reminders as the old DotGuide filtered (helpAllows, knownMoveTip in calm worlds, skills marked on done/read,
 * tips and lessons marked at send). New code: dotSay.ts (the filter, the Tips gap, heard on minShowMs).
 */
const ROOT = process.env.ROOT ?? '/home/user/Sloths-Adventure-';
const a = process.argv.slice(2);
const arg = (k: string, d?: string) => { const i = a.indexOf('--' + k); return i >= 0 ? a[i + 1] : d; };
const help = (arg('help', 'teach') as 'teach' | 'reminders' | 'quiet');
const worlds = (arg('worlds', '1,2,3,4,5,6') as string).split(',').map(Number);
const fresh = a.includes('--fresh');
const listIds = new Set((arg('list', '') as string).split(',').filter(Boolean));
const jsonOut = arg('json');
const dumpDir = arg('dump');
const dumpIds = new Set((arg('dumpIds', '') as string).split(',').filter(Boolean));

const { RealPlay } = await import(ROOT + '/src/game/realPlay.ts');
const { GameEngine } = await import(ROOT + '/src/game/engine.ts');
const DG = await import(ROOT + '/src/game/dotGuide.ts');
const { engineGuideLine } = await import(ROOT + '/src/game/dotLines.ts');
const { lessonDotLine } = await import(ROOT + '/src/game/lessons.ts');
const H = await import(ROOT + '/src/game/dotGuideHelp.ts');
const { stageList } = await import(ROOT + '/tools/inspect/stages.ts');
const { findRoute } = await import(ROOT + '/tools/inspect/route.ts');
const { sampleRoute } = await import(ROOT + '/tools/inspect/beats.ts');
const SAY = await import(ROOT + '/src/game/dotSay.ts').catch(() => null);
const newCode = !!SAY;

try { const w = globalThis as any; if (w.window) w.window.matchMedia = () => ({ matches: true }); } catch {}
const MOVE_OF: Record<string, string[]> = { walk: ['run'], hop: ['jump'], jump: ['jump'], timedHop: ['jump'], bounce: ['bounce'], climb: ['grab', 'climb'], swing: ['grab', 'leap'], rope: ['grab'], glide: ['jump', 'glide'] };
const MOVE_IDS = ['run', 'jump', 'double', 'grab', 'climb', 'leap', 'glide', 'punch', 'kick', 'crouch', 'push', 'bounce'];
const CALM_WORLDS = new Set([1, 2, 3, 4]);

localStorage.clear();
localStorage.setItem('sloth_dot_help', help);
const out: any[] = [];
for (const world of worlds) {
  const entries = stageList([world], 1).stages;
  for (const entry of entries) {
    const id = entry.id;
    if (fresh) { localStorage.clear(); localStorage.setItem('sloth_dot_help', help); }
    if (dumpDir && dumpIds.has(id)) {
      const st: Record<string, string> = {};
      for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i)!; st[k] = localStorage.getItem(k)!; }
      (await import('node:fs')).writeFileSync(`${dumpDir}/state-${id}.json`, JSON.stringify(st));
    }
    let route;
    try { route = findRoute(entry.build(false)); } catch (e) { console.log(id, 'no route'); continue; }
    const samples = sampleRoute(route);
    const win = globalThis as any;
    if (win.window) Object.assign(win.window, { innerWidth: 844, innerHeight: 390 });
    const sim = new RealPlay(id, 1);
    const e = sim.e;
    sim.safe = false;
    e.damagePlayer = () => {};
    const proto = GameEngine.prototype as any;
    e.lessonTick = proto.lessonTick.bind(e);
    e.updateCamera = proto.updateCamera.bind(e);
    e.resizeCanvas();
    const said: Array<{ text: string; lesson?: string }> = [];
    e.callbacks.onLesson = (l: string) => said.push({ text: '', lesson: l });
    e.callbacks.onGuide = (text: string, _s: number, passed?: boolean) => { if (text && !passed) said.push({ text }); };
    const calm = newCode ? !/-D$/.test(id) : CALM_WORLDS.has(world) && !/-D$/.test(id);
    const q = new DG.GuideQueue(calm);
    const seen: Set<string> = H.seenSkills();
    const movesBefore: Set<string> = H.movesDone();
    const dsay = newCode ? new SAY!.DotSay(q, help, seen, movesBefore, true) : null;
    const say = (l: any, now: number) => {
      if (dsay) return dsay.say(l, now);
      if (!H.helpAllows(l, help, seen, true)) return;
      if (q.calm && H.knownMoveTip(l, movesBefore)) return;
      q.push(l, now);
    };
    const moves: Record<string, number> = {};
    const marked = new Set<string>();
    const lines: Array<{ t: number; text: string; kind: string }> = [];
    let k = 0;
    let lastSeg: any = null;
    const end = samples.length ? samples[samples.length - 1].base : 0;
    for (let t = 0; t <= end + 3; t += 1 / 30) {
      while (k + 1 < samples.length && samples[k + 1].base <= t) k++;
      const s = samples[k];
      if (s) {
        if (s.seg !== lastSeg) { lastSeg = s.seg; for (const m of MOVE_OF[s.seg.kind] ?? []) moves[m] = (moves[m] ?? 0) + 1; }
        e.player.x = s.x; e.player.y = s.y; e.player.vx = 0; e.player.vy = 0; e.player.grounded = true;
        e.player.invincibleTimer = 0; e.player.hp = e.player.maxHp;
      }
      sim.frame();
      e.watchCaught = false;
      for (const x of said.splice(0)) {
        const l = x.lesson ? lessonDotLine(x.lesson, 'screen') : engineGuideLine(x.text, id, { dot: true });
        if (l) say(l, t * 1000);
      }
      q.tick(t * 1000, { danger: false, hold: t < 1.5, moveCount: (m: string) => moves[m] ?? 0 });
      dsay?.keep(t * 1000);
      if (q.calm) for (const m of MOVE_IDS) if (!marked.has(m) && (moves[m] ?? 0) > 0) { marked.add(m); H.markMoveDone(m); }
      for (const ev of q.drain()) {
        if (ev.type === 'start') lines.push({ t: +t.toFixed(1), text: ev.show.line.text, kind: ev.show.line.kind, key: ev.show.line.key, n: ev.show.n } as any);
        else {
          // (a line cut before its minimum time never really reached the screen, the bubble comes after her flight: not counted)
          if (ev.why === 'cut' && t * 1000 - ev.show.startedAt < 1500) { const i = lines.findIndex((x: any) => x.n === ev.show.n); if (i >= 0) lines.splice(i, 1); }
          const l = ev.show.line;
          if (l.skill && (ev.why === 'done' || (ev.why === 'read' && !l.move))) { H.markSkillSeen(l.skill); seen.add(l.skill); }
          if (l.next && (ev.why === 'done' || ev.why === 'read')) say(l.next, t * 1000);
        }
      }
    }
    // busiest 30 s
    let busiest = 0;
    for (const l of lines) busiest = Math.max(busiest, lines.filter((m) => m.t >= l.t && m.t < l.t + 30).length);
    const r = { id, world, seconds: +end.toFixed(0), n: lines.length, perMin: +(lines.length / (end / 60)).toFixed(2), busiest, lines };
    out.push(r);
    const show = listIds.has(id) || listIds.has('all');
    console.log(`${id} ${r.seconds}s lines ${r.n} perMin ${r.perMin} busiest30 ${busiest}` + (show ? '\n   ' + lines.map((l) => `${l.t}s [${l.kind}] ${l.text}  {${l.key}}`).join('\n   ') : ''));
  }
}
if (jsonOut) (await import('node:fs')).writeFileSync(jsonOut, JSON.stringify(out, null, 1));
