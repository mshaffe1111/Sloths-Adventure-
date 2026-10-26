/**
 * A plain autopilot for Dot's netting flight (tests only, dotFlight.test.ts): it flies a roll of the stage with her real rules
 * (dotFlight.ts), up to each hole and through it, drinking at each flower, waiting out the gusts and the sway, with the same input
 * a thumb gives. It is no player (it flaps and hovers clumsily), but if it gets to the folded-letter gap with hearts to spare, the
 * stage can be flown.
 */
import { DotFlight, type FlightInput } from './dotFlight.ts';
import { DOT, gustState, openingY, type DotStage } from './dotFlightStage.ts';

const blank = (): FlightInput => ({ left: false, right: false, jumpPressed: false, jumpHeld: false, punchPressed: false, megaPunchPressed: false });

export function autopilot(st: DotStage, maxSeconds = 900) {
  const d = new DotFlight(st);
  let i = 1;
  let hurts = 0;
  let mists = 0;
  let t = 0;
  let hold = 0;
  const walls = [...st.walls].sort((a, b) => a.x - b.x);
  const log: string[] = [];
  for (; t < maxSeconds && !d.through; t += 1 / 30) {
    while (i < st.route.length - 1 && d.x > st.route[i].x + 8) i++;
    const p = st.route[i];
    const inp = blank();
    // the next wall ahead, and the hole the route takes through it
    const w = walls.find((wl) => wl.x + wl.w + 10 > d.x);
    let ty = p.y;
    let go = true;
    if (w && w.x - d.x < 190) {
      const wp = st.route.find((r) => r.wall === w.id);
      const o = w.openings.find((oo) => !oo.pocket && wp && Math.abs(oo.y + oo.h / 2 - wp.y) < oo.h) ?? w.openings.find((oo) => !oo.pocket)!;
      const top = openingY(o, d.t);
      ty = top + o.h / 2;
      // (the room between the thorns along a hole's edges, if it has them)
      const edged = st.thorns.some((th) => Math.min(th.x0, th.x1) < w.x + w.w && Math.max(th.x0, th.x1) > w.x && Math.abs(th.y0 - th.y1) < 20);
      const slack = edged ? o.h / 2 - DOT.R - 22 : o.h / 2 - DOT.R - 4;
      if (d.x < w.x - (edged ? 54 : 4) && Math.abs(d.y - ty) > slack) go = false;
      // a swaying hole: aim where it will be a moment from now
      if (o.sway) ty = openingY(o, d.t + 0.25) + o.h / 2;
    }
    // a way between thorn strands (no wall): line up before getting there
    if (p.k === 'gap' && p.wall === undefined && p.x - d.x < 110 && Math.abs(d.y - p.y) > 45) go = false;
    // a gust in her face: wait in front of it until it has blown and the petals have settled
    for (const g of st.gusts) {
      if (g.wx === 0 || d.x > g.x1 || d.x < g.x0 - 90) continue;
      const s = gustState(g, d.t);
      if (d.x < g.x0 + 10 && (s.blowing || s.warn > 0)) go = false;
    }
    // at a flower: drink until nearly full
    const f = st.flowers.find((fl) => Math.abs(fl.x - d.x) < 120 && Math.abs(fl.y - d.y) < 200 && (d.nectar.get(fl.id) ?? 0) > 0);
    let back = false;
    if (f && d.energy < 90) {
      ty = f.y;
      go = f.x - d.x > 16;
      back = f.x - d.x < -16;
    }
    if (go) inp.right = true;
    else if (back) inp.left = true;
    // up and down: flap when below where it wants to be, hold the thumb down to hover when near it
    const err = d.y - ty;
    if (err > 18 && d.canFlap() && d.vy > -120) inp.jumpPressed = true;
    if (Math.abs(err) < 40 || !go) hold = 0.3;
    if (err < -30) hold = 0;
    if (hold > 0) {
      hold -= 1 / 30;
      inp.jumpHeld = true;
      if (!d.hovering && d.sinceFlap > 0.3) inp.punchPressed = true;
    }
    for (const e of d.step(1 / 30, inp)) {
      if (e.k === 'hurt') {
        hurts++;
        log.push(`hurt at ${Math.round(e.x)},${Math.round(e.y)}`);
      }
      if (e.k === 'mist') {
        mists++;
        i = Math.max(1, st.route.findIndex((r) => r.x >= d.checkpoint.x));
        log.push(`mist at ${Math.round(d.x)} (energy ${Math.round(d.energy)}, t ${Math.round(t)})`);
        d.respawn();
      }
    }
  }
  return { through: d.through, t, hurts, mists, d, log };
}
