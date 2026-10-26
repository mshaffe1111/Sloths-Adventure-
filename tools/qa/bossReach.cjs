/**
 * Boss reach, measured by touch: a scripted hero plays a boss fight through the QA harness (server.cjs) with a persona's thumbs, waits
 * out every attack at one refuge, and when the weak point opens it waits a 0.8 s reaction and then goes for it by touch (steer, flick,
 * tap) the way a player would, getting down a tree or off a ledge included. It prints, for each opening, how long it stayed open and
 * when the first hit landed, so the fairness rule (open >= reach + 0.8 s + 0.6 s) is checked against real input, not ideal input.
 *
 *   node tools/qa/server.cjs <port> <dev build url> <out dir>          (once, in the background)
 *   node tools/qa/bossReach.cjs <port> <stage> <land|port> <refuge> [persona] [openings]
 *
 * Refuges: 1-10 tree | stump | coils; 3-10 ledge (a low shelf) | floor | flee (runs from every wind-up and roar). Every heart lost
 * is printed with what hurt him and what the boss was doing (the engine's bossHurtLog). This is a measuring tool: it reads the fight's state through
 * the harness's `eval` (a blind tester never does).
 */
const http = require('http');
const [port, stage = '1-10', view = 'port', refuge = 'tree', persona = 'steph', want = '3'] = process.argv.slice(2);

const call = (body) =>
  new Promise((res, rej) => {
    const req = http.request({ host: '127.0.0.1', port: Number(port), method: 'POST', path: '/' }, (r) => {
      let s = '';
      r.on('data', (c) => (s += c));
      r.on('end', () => res(JSON.parse(s)));
    });
    req.on('error', rej);
    req.end(JSON.stringify(body));
  });
const act = (...steps) => call({ cmd: 'do', steps, noshot: true });

const STATE = `(() => { const e = __engine(); const b = e.boss, br = b.ai, p = e.player, a = e.currentStage.arena;
  return { t: e.gameTime, px: p.x, py: p.y, climbing: !!p.climbing, grounded: !!p.grounded, swinging: !!p.isVineSwinging, hp: p.hp, lives: e.lives,
    left: a.left, right: a.right, floor: a.floor, on: e.standingOnId, bx: b.x, bw: b.width, f: b.facing, bhp: b.hp, st: br.state, mv: br.move, bt: br.t,
    reach: br.d.reach, entrance: !!e.entrance, hurts: e.bossHurtLog.length, lastHurt: e.bossHurtLog[e.bossHurtLog.length - 1] ?? null, plats: e.platforms.filter((q) => q.y < a.floor - 10 && q.x < a.right && q.x + q.width > a.left).map((q) => [q.id, q.x, q.x + q.width, q.y]) }; })()`;
const peek = async () => JSON.parse((await call({ cmd: 'eval', text: STATE })).text);

let steering = 'none';
async function steer(dir, ms = 100) {
  if (dir === 'lift') {
    if (steering !== 'none') await act('lift');
    steering = 'none';
    return act(`wait ${ms}`);
  }
  if (steering !== dir) {
    steering = dir;
    return act(`steer ${dir} ${ms}`);
  }
  return act(`wait ${ms}`);
}

/** go to the refuge for an attack, by touch; true once there */
async function toRefuge(s) {
  const L = s.left;
  if (refuge === 'tree') {
    const vx = L + 20;
    if (!s.climbing) {
      if (Math.abs(s.px - vx) > 14) return steer(s.px > vx ? 'left' : 'right', 100), false;
      await steer('up', 100);
      return false;
    }
    // up the trunk, stopping short of the top (pushing on at the top hops off it)
    if (s.py > s.floor - 300) return steer('up', 100), false;
    await steer('lift', 100);
    return true;
  }
  if (refuge === 'stump' || refuge === 'ledge') {
    const ledges = s.plats.filter((q) => s.floor - q[3] < 170).sort((a, b) => Math.abs((a[1] + a[2]) / 2 - s.px) - Math.abs((b[1] + b[2]) / 2 - s.px));
    const l = ledges[0];
    if (!l) return true;
    if (s.on === l[0]) return steer('lift', 100), true;
    const mid = (l[1] + l[2]) / 2;
    if (Math.abs(s.px - mid) > 30) return steer(s.px > mid ? 'left' : 'right', 100), false;
    await steer('lift', 30);
    await act('flick up', 'wait 200', 'flick up', 'wait 300');
    return false;
  }
  if (refuge === 'coils') {
    // on the floor right by his coils (a hop over the head when it comes)
    const x = s.bx + s.f * (s.bw / 2 + 40);
    if (s.st === 'act' && Math.abs(s.px - x) < 60) return act('flick up', 'wait 150', 'flick up', 'wait 300'), true;
    if (Math.abs(s.px - x) > 20) return steer(s.px > x ? 'left' : 'right', 100), false;
    return steer('lift', 100), true;
  }
  if (refuge === 'flee') {
    // run away from him as soon as he starts anything (a crouch, a roar), for a second
    const away = s.px < s.bx ? 'left' : 'right';
    if (s.st === 'tell' || s.st === 'roar' || s.st === 'act') return steer(away, 100), true;
  }
  return steer('lift', 100), true;
}

/** where the weak point is (1-10: the dazed head along the floor; 3-10: from the boss's moves) */
function spot(s) {
  if (stage === '1-10') {
    const tip = s.reach;
    return { x: tip - s.f * 70, up: 45 };
  }
  // (bossDefs.ts PROWLER weakByMove / weakStun: across from his middle, and up from the floor)
  const by = { shadowStep: [133, 92], clawCombo: [45, 50], pounce: [-9, 148], streak: [-190, 52] };
  const [dx, up] = s.st === 'stun' ? [46, 70] : by[s.mv] ?? [133, 92];
  return { x: s.bx + s.f * dx, up };
}

(async () => {
  console.log((await call({ cmd: 'persona', name: persona })).text);
  await call({ cmd: 'start', stage, view });
  let s = await peek();
  while (s.entrance) {
    await act('wait 300');
    s = await peek();
  }
  const out = [];
  let open0 = -1;
  let firstHit = -1;
  let hp0 = 0;
  let lastOpen = false;
  let openMove = '';
  let openFrom = {};
  let hurts = 0;
  for (let i = 0; i < 3000 && out.length < Number(want); i++) {
    s = await peek();
    if (s.hurts > hurts) {
      hurts = s.hurts;
      const h = s.lastHurt;
      console.log(`  HURT at ${h.t.toFixed(1)} s by ${h.by}: he was in ${h.state} ${h.move ?? ''} (${h.bt.toFixed(2)} s in)`);
    }
    if (s.bhp <= 0) break;
    // (an opening: the recovery after a move that leaves one, or a stun; 1-10 opens only after the lunge)
    const open = (s.st === 'rec' && (stage !== '1-10' || s.mv === 'sweep')) || s.st === 'stun';
    if (open && !lastOpen) {
      open0 = s.t - s.bt;
      openMove = s.st === 'stun' ? `${s.mv}:stun` : s.mv;
      openFrom = { x: Math.round(s.px), up: Math.round(s.floor - s.py) };
      hp0 = s.bhp;
      firstHit = -1;
      // the reaction: a person sees the glow and only then moves
      await steer('lift', 800);
      lastOpen = true;
      continue;
    }
    if (!open && lastOpen) {
      out.push({ move: openMove, open: +(s.t - open0).toFixed(2), firstHit: firstHit < 0 ? null : +firstHit.toFixed(2), from: openFrom });
      console.log(`opening ${out.length} (${openMove}, from ${JSON.stringify(openFrom)}): open ${(s.t - open0).toFixed(2)} s, first hit ${firstHit < 0 ? 'NONE' : firstHit.toFixed(2) + ' s'} after it opened`);
    }
    lastOpen = open;
    if (open) {
      if (s.bhp < hp0 && firstHit < 0) firstHit = s.t - open0;
      if (process.env.DBG) console.log(`  ${(s.t - open0).toFixed(2)} p ${Math.round(s.px)},${Math.round(s.floor - s.py)} climb ${s.climbing} gr ${s.grounded} spot ${Math.round(spot(s).x)} bhp ${s.bhp}`);
      // off the tree: down (a held thumb), then off the bottom
      if (s.climbing) {
        await steer('down', 100);
        continue;
      }
      const sp = spot(s);
      // up on a ledge with the spot low: walk off its nearer end (toward the spot)
      const feet = s.floor - s.py;
      const ledge = s.grounded && feet > 40 ? s.plats.find((q) => q[0] === s.on) : null;
      // (a punch reaches 8..54 above the feet)
      // (the spot is about 100 tall: wholly below the punch only when its top is under the feet + 8)
      const below = sp.up + 50 < feet + 8;
      if (ledge && below) {
        const exit = sp.x < ledge[1] ? ledge[1] - 30 : sp.x > ledge[2] ? ledge[2] + 30 : sp.x - ledge[1] < ledge[2] - sp.x ? ledge[1] - 30 : ledge[2] + 30;
        await steer(exit > s.px ? 'right' : 'left', 100);
        continue;
      }
      const d = sp.x - s.px;
      if (Math.abs(d) > 40) {
        await steer(d > 0 ? 'right' : 'left', 100);
        continue;
      }
      // face it and tap (a jump kick for one up high)
      await steer(d > 0 ? 'right' : 'left', 30);
      if (sp.up - 50 < feet + 54) await act('tap', 'wait 120');
      else await act('flick up', 'wait 120', 'tap', 'wait 200');
      continue;
    }
    await toRefuge(s);
  }
  console.log(JSON.stringify({ stage, view, refuge, persona, openings: out }));
  process.exit(0);
})();
