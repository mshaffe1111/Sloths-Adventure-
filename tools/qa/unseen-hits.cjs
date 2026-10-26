// QA lead check (World 5 jumping spiders): run a stage holding right (hopping now and then); on every heart lost, say where the
// and whether it was on screen while it crouched (its tell). Hearts are refilled after each hit so the run keeps going.
//   node tools/qa/unseen-hits.cjs <port> <stage> <view> [seconds]
const http = require('http');
const [port, stage, view = 'port', secs = '120'] = process.argv.slice(2);
const call = (body) => new Promise((res, rej) => {
  const r = http.request({ host: '127.0.0.1', port: Number(port), method: 'POST', path: '/' }, (s) => { let d = ''; s.on('data', (c) => (d += c)); s.on('end', () => res(JSON.parse(d))); });
  r.on('error', rej); r.end(JSON.stringify(body));
});
const STATE = `(() => { const e = __engine(), p = e.player, vw = innerWidth / (e.camera.zoom || 1);
  const foes = e.enemies.filter((f) => !f.defeated && Math.abs(f.x - p.x) < 600).map((f) => ({ x: Math.round(f.x + f.width / 2), y: Math.round(f.y), id: f.id, t: (e.w5 && e.w5.gates && e.w5.gates.get(f.id) && e.w5.gates.get(f.id).phase === 'windup') ? 1 : 0, a: !!f.isAttacking, vx: Math.round(f.vx) }));
  return { t: e.gameTime, hp: p.hp, px: Math.round(p.x), py: Math.round(p.y), cam: Math.round(e.camera.x), vw: Math.round(vw), done: !!e.stageComplete, prog: Math.round(p.x), foes }; })()`;
(async () => {
  await call({ cmd: 'start', stage, view });
  await call({ cmd: 'do', steps: ['wait 1500'], noshot: true });
  const hist = []; const HIST = 40;
  let last = null, hits = 0, behind = 0, unseen = 0;
  for (let i = 0; i < Number(secs) * 10; i++) {
    const steps = i % 15 === 0 ? ['steer right 0', 'flick up', 'wait 60'] : ['steer right 0', 'wait 100'];
    await call({ cmd: 'do', steps, noshot: true });
    const s = JSON.parse((await call({ cmd: 'eval', text: STATE })).text);
    hist.push(s); if (hist.length > HIST) hist.shift();
    if (last && s.hp < last.hp) {
      hits++;
      // the foe that hit: the nearest one now
      const f = s.foes.sort((a, b) => Math.abs(a.x - s.px) - Math.abs(b.x - s.px))[0];
      if (f) {
        const side = f.x < s.px ? 'BEHIND' : 'ahead';
        if (side === 'BEHIND') behind++;
        // was it on screen while it crouched (its w5 gate's windup) in the last 4 s?
        const crouch = hist.map((h) => ({ h, g: h.foes.find((q) => q.id === f.id) })).filter(({ g }) => g && g.t > 0);
        const seen = crouch.some(({ h, g }) => g.x >= h.cam && g.x <= h.cam + h.vw);
        if (!seen) unseen++;
        console.log(`hit ${hits} at x${s.prog} t${s.t.toFixed(1)}: foe ${side} by ${Math.abs(f.x - s.px)} px; Pokey ${s.px - s.cam} px from the left edge (view ${s.vw}); its crouch ${crouch.length ? (seen ? 'was on screen' : 'was OFF screen') : 'not seen in the last 4 s'}`);
      } else console.log(`hit ${hits} at x${s.prog}: no foe within 600 px (a hazard?)`);
      await call({ cmd: 'eval', text: '(() => { const p = __engine().player; p.hp = p.maxHp; return 1; })()' });
    }
    last = s;
    if (s.done) { console.log('stage done'); break; }
  }
  console.log(`summary ${stage} ${view}: ${hits} hits, ${behind} from behind, ${unseen} with the crouch off screen or unseen`);
})();
