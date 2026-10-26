/**
 * dotFlight — Dot flying her netting stage (dotFlightStage.ts builds it): the rules of her flight, with no drawing and no screen, so
 * the tests can fly her. The engine feeds it the same input Pokey gets (Matt, 2026-10-25: "I don't want to change it too much because
 * it could be a learning curve"; then "maybe the taps can be for hovering"), through the same gesture recogniser:
 *
 *   move left / right   fly left / right
 *   the jump flick      a wing flap up. Three in hand, one back every so often, never two at once: she climbs, she can't rocket
 *   tap                 hover: a buzz of the wings that holds her nearly still for a moment; quick taps keep her there
 *   thumb kept down     after the flick, hover too (the way Pokey's leaf opens while the thumb stays on the glass)
 *
 * (A press-and-hold, Pokey's mega punch, is a hover buzz as well: nothing she does is a punch.)
 *
 * Nectar: flapping and hovering use energy, and a glowing flower fills it fast while she is at its mouth (she hangs there to drink).
 * A drained flower droops, and fills again after a few seconds. Out of energy she can neither flap nor hover: she sinks, slowly, and
 * can still steer, down to a flower. Iron thorns cost a heart and leave a scratch (the story's nine); the mist below is a heart and
 * back to the last flower she drank at. The folded-letter gap at the end slows everything down while she squeezes through.
 */
import { DOT, DOT_H, MIST, THORN_REACH, TOP, drinkBox, flowerCheckpoint, gustState, openingY, segDist, type DotStage } from './dotFlightStage.ts';

/** the input fields she reads (InputEngine.state); presses she uses are cleared, as the engine does for Pokey */
export interface FlightInput {
  left: boolean;
  right: boolean;
  jumpPressed: boolean;
  jumpHeld: boolean;
  punchPressed: boolean;
  megaPunchPressed: boolean;
  kickPressed?: boolean;
}

export type FlightEvent =
  | { k: 'flap' }
  | { k: 'flapEmpty' }
  | { k: 'buzz' }
  | { k: 'sip'; id: number; first: boolean }
  /** a flower is her checkpoint now (she drank at it, or flew past it): a life lost, or Continue after a game over, brings her back here */
  | { k: 'checkpoint'; id: number }
  | { k: 'full' }
  | { k: 'droop'; id: number }
  | { k: 'hurt'; x: number; y: number; dir: number }
  | { k: 'mist' }
  | { k: 'dew'; id: number; x: number; y: number }
  | { k: 'silk'; id: number; x: number; y: number }
  | { k: 'puff'; id: number; x: number; y: number }
  | { k: 'tired' }
  | { k: 'low' }
  | { k: 'bonk' }
  | { k: 'gust'; id: number }
  | { k: 'letter' }
  | { k: 'through' };

export class DotFlight {
  readonly stage: DotStage;
  x: number;
  y: number;
  vx = 0;
  vy = 0;
  face: -1 | 1 = 1;
  energy: number = DOT.energy;
  /** flaps in hand (a fraction is one on its way back) */
  flaps: number = DOT.flaps;
  sinceFlap = 9;
  /** seconds of tap-hover left */
  hoverT = 0;
  hovering = false;
  /** drinking at this flower this step (or -1) */
  sipping = -1;
  tired = false;
  /** seconds she can't be hurt (after a thorn, after coming back) */
  invuln = 0;
  /** seconds since she was last hurt (the flinch pose) */
  sinceHurt = 9;
  scratches = 0;
  /** she hangs where she is until the player first does something (the start, and after coming back) */
  waiting = true;
  /** the stage's own clock (the netting sways and the gusts blow by it) and the slow motion at the gap (1 = normal) */
  t = 0;
  slow = 1;
  /** through the folded-letter gap */
  through = false;
  checkpoint: { x: number; y: number };
  /** what is left in each flower (by id), and when a drooped one fills again */
  nectar = new Map<number, number>();
  regrowAt = new Map<number, number>();
  /** flowers drunk from this run (the first sip at each is a checkpoint) */
  drunk = new Set<number>();
  dewGot = new Set<number>();
  silkGot = new Set<number>();
  popped = new Set<number>();
  /** the wind pushing her this step (for the drawing: feathers ruffle) */
  wind = { x: 0, y: 0 };
  /** she fell into the mist this step (said once, until she is brought back) */
  private fallen = false;
  private lowSaid = false;
  private gustSeen = new Set<number>();
  private letterSaid = false;

  constructor(stage: DotStage) {
    this.stage = stage;
    this.x = stage.spawn.x;
    this.y = stage.spawn.y;
    this.checkpoint = { ...stage.spawn };
    for (const f of stage.flowers) this.nectar.set(f.id, DOT.flowerHolds);
  }

  /** a flap would happen if she were asked now (the gesture recogniser then takes a shorter slide up as one) */
  canFlap(): boolean {
    return !this.through && this.energy > 0 && this.flaps >= 1 && this.sinceFlap >= DOT.gap;
  }

  /** how many times she has been brought back (the control test's recorder notes each: dotRecord.ts) */
  respawns = 0;
  /** the flower her checkpoint is at (its x; the start is -1) */
  cpX = -1;
  /** this flower is her checkpoint now, unless she already has a later one */
  private reach(f: { id: number; x: number; y: number; face: -1 | 1 }, ev: FlightEvent[]) {
    if (f.x <= this.cpX) return;
    this.cpX = f.x;
    this.checkpoint = flowerCheckpoint(f);
    ev.push({ k: 'checkpoint', id: f.id });
  }

  /** back at her checkpoint (the last flower she reached), full of nectar, hanging still until the player moves */
  respawn() {
    this.respawns++;
    this.x = this.checkpoint.x;
    this.y = this.checkpoint.y;
    this.vx = 0;
    this.vy = 0;
    this.energy = DOT.energy;
    this.flaps = DOT.flaps;
    this.tired = false;
    this.hoverT = 0;
    this.invuln = 2;
    this.waiting = true;
    this.slow = 1;
    this.fallen = false;
  }

  /**
   * One step of play (dt in seconds of the game's clock; the gap's slow motion is applied in here). Returns what happened, for the
   * engine to turn into hearts, sounds, sparkles and Dot's lines.
   */
  step(dt: number, inp: FlightInput): FlightEvent[] {
    const ev: FlightEvent[] = [];
    // the squeeze through the gap: everything slows (eased in over half a second, and back out once she is through)
    const L = this.stage.letter;
    const wantSlow = !this.through && this.x > L.slowFrom && this.x < L.x + 60 ? 0.42 : 1;
    this.slow += (wantSlow - this.slow) * Math.min(1, dt * 4);
    if (wantSlow < 1 && !this.letterSaid) {
      this.letterSaid = true;
      ev.push({ k: 'letter' });
    }
    dt *= this.slow;
    const n = Math.max(1, Math.ceil(dt / (1 / 120)));
    const h = dt / n;
    // presses are read once per step, not once per slice
    const dir = (inp.right ? 1 : 0) - (inp.left ? 1 : 0);
    if (this.waiting && (dir !== 0 || inp.jumpPressed || inp.punchPressed || inp.megaPunchPressed)) this.waiting = false;
    if (inp.punchPressed || inp.megaPunchPressed || inp.kickPressed) {
      inp.punchPressed = false;
      inp.megaPunchPressed = false;
      if (inp.kickPressed) inp.kickPressed = false;
      if (this.energy > 0 && !this.through) {
        this.hoverT = DOT.tap;
        ev.push({ k: 'buzz' });
      }
    }
    if (inp.jumpPressed && !this.through) {
      if (this.energy <= 0) {
        inp.jumpPressed = false;
        ev.push({ k: 'flapEmpty' });
      } else if (this.canFlap()) {
        inp.jumpPressed = false;
        this.vy = Math.min(this.vy, -DOT.flapV);
        this.flaps -= 1;
        this.energy = Math.max(0, this.energy - DOT.flapCost);
        this.sinceFlap = 0;
        this.hoverT = 0;
        ev.push({ k: 'flap' });
      }
      // (otherwise the press stays buffered a moment, so a flick a hair early still flaps when the wings are ready)
    }
    for (let i = 0; i < n; i++) this.slice(h, dir, inp.jumpHeld, ev);
    return ev;
  }

  private slice(dt: number, dir: number, held: boolean, ev: FlightEvent[]) {
    const st = this.stage;
    this.t += dt;
    this.sinceFlap += dt;
    this.sinceHurt += dt;
    if (this.invuln > 0) this.invuln -= dt;
    if (this.hoverT > 0) this.hoverT -= dt;
    if (this.sinceFlap >= DOT.gap && this.flaps < DOT.flaps) this.flaps = Math.min(DOT.flaps, this.flaps + dt / DOT.regen);
    if (dir !== 0) this.face = dir > 0 ? 1 : -1;

    // drinking: anywhere in a flower's bloom (and a margin round it) with room in her tank, she hangs there (no energy spent) and
    // fills up fast
    this.sipping = -1;
    if (this.energy < DOT.energy - 0.5 && !this.through) {
      for (const f of st.flowers) {
        if (Math.abs(f.x - this.x) > 160 || (this.nectar.get(f.id) ?? 0) <= 0) continue;
        const b = drinkBox(f);
        if (this.x < b.x0 || this.x > b.x1 || this.y < b.y0 || this.y > b.y1) continue;
        this.sipping = f.id;
        break;
      }
    }
    if (this.sipping >= 0) {
      const f = this.sipping;
      const left = this.nectar.get(f)!;
      const take = Math.min(left, DOT.sip * dt, DOT.energy - this.energy);
      this.energy += take;
      this.nectar.set(f, left - take);
      if (!this.drunk.has(f)) {
        this.drunk.add(f);
        this.reach(st.flowers.find((q) => q.id === f)!, ev);
        ev.push({ k: 'sip', id: f, first: this.drunk.size === 1 });
      }
      if (this.energy >= DOT.energy - 0.5) {
        // full: she keeps hanging there a moment rather than dropping the instant she lets go of the flower
        this.hoverT = Math.max(this.hoverT, DOT.tap);
        ev.push({ k: 'full' });
      }
      if (left - take <= 0.01) {
        this.nectar.set(f, 0);
        this.regrowAt.set(f, this.t + DOT.regrow);
        ev.push({ k: 'droop', id: f });
      }
      if (this.tired && this.energy > 8) this.tired = false;
    }
    for (const [id, at] of this.regrowAt) {
      if (this.t >= at) {
        this.nectar.set(id, DOT.flowerHolds);
        this.regrowAt.delete(id);
      }
    }
    if (this.energy <= 0 && !this.tired) {
      this.tired = true;
      ev.push({ k: 'tired' });
    }
    if (this.energy > 8) this.tired = false;
    if (!this.lowSaid && this.energy < 30) {
      this.lowSaid = true;
      ev.push({ k: 'low' });
    }

    // every flower is a checkpoint, drunk at or not: flying on past one (above the mist) makes it the place she comes back to
    if (!this.fallen && this.y < MIST - 20) {
      for (const f of st.flowers) {
        if (f.x > this.cpX && this.x > f.x + 20 && this.x < f.x + 400) this.reach(f, ev);
      }
    }

    // through the gap: she floats on out into the light, whatever the thumb does
    if (this.through) {
      this.hovering = true;
      this.vx += (90 - this.vx) * Math.min(1, dt * 3);
      this.vy += ((st.letter.y - 30 - this.y) * 1.5 - this.vy) * Math.min(1, dt * 3);
      this.face = 1;
      this.x += this.vx * dt;
      this.y += this.vy * dt;
      return;
    }
    // hovering: a tap's buzz, or the thumb kept down after a flap (once its rise is spent), or waiting at the start, or drinking
    const holding = held && this.sinceFlap > DOT.holdAfter && this.vy > -90;
    const canHover = this.energy > 0 && !this.through;
    this.hovering = this.waiting || this.sipping >= 0 || (canHover && (this.hoverT > 0 || holding));
    if (this.hovering && !this.waiting && this.sipping < 0) this.energy = Math.max(0, this.energy - DOT.hoverCost * dt);

    // across: flat out, or slower hovering or tired; with no direction she brakes
    const mul = this.tired ? DOT.tiredMul : this.hovering && this.sipping < 0 ? DOT.hoverMul : 1;
    if (this.waiting) this.vx *= Math.exp(-DOT.brake * dt);
    else if (dir !== 0) {
      const want = dir * DOT.speed * mul;
      const dv = want - this.vx;
      this.vx += Math.sign(dv) * Math.min(Math.abs(dv), DOT.accel * dt);
    } else this.vx *= Math.exp(-DOT.brake * dt);

    // up and down
    if (this.hovering) {
      const sink = this.sipping >= 0 || this.waiting ? 0 : DOT.hoverSink;
      this.vy += (sink - this.vy) * Math.min(1, dt * 9);
    } else {
      const cap = this.tired ? DOT.tiredFall : Math.abs(this.vx) > DOT.speed * 0.6 ? DOT.cruiseFall : DOT.fall;
      if (this.vy > cap) this.vy += (cap - this.vy) * Math.min(1, dt * 6);
      else this.vy = Math.min(cap, this.vy + DOT.g * dt);
    }

    // the wind through the holes
    this.wind.x = 0;
    this.wind.y = 0;
    for (const g of st.gusts) {
      if (this.x < g.x0 || this.x > g.x1 || this.y < g.y0 || this.y > g.y1) continue;
      if (!gustState(g, this.t).blowing) continue;
      this.wind.x += g.wx;
      this.wind.y += g.wy;
      if (!this.gustSeen.has(g.id)) {
        this.gustSeen.add(g.id);
        ev.push({ k: 'gust', id: g.id });
      }
    }
    if (this.waiting) {
      this.wind.x = 0;
      this.wind.y = 0;
    }
    this.x += (this.vx + this.wind.x) * dt;
    this.y += (this.vy + this.wind.y) * dt;

    this.collide(ev);

    // thorns
    if (this.invuln <= 0) {
      for (const th of st.thorns) {
        if (this.x < Math.min(th.x0, th.x1) - 40 || this.x > Math.max(th.x0, th.x1) + 40) continue;
        if (segDist(this.x, this.y, th) > THORN_REACH) continue;
        // pushed off the strand, away from where she touched it
        const dx = th.x1 - th.x0;
        const dy = th.y1 - th.y0;
        const L = dx * dx + dy * dy;
        const u = L > 0 ? Math.max(0, Math.min(1, ((this.x - th.x0) * dx + (this.y - th.y0) * dy) / L)) : 0;
        const cx = th.x0 + dx * u;
        const cy = th.y0 + dy * u;
        const d = Math.hypot(this.x - cx, this.y - cy) || 1;
        const nx = (this.x - cx) / d;
        const ny = (this.y - cy) / d;
        this.vx = nx * 240;
        this.vy = ny * 240 - 40;
        this.invuln = 1.2;
        this.sinceHurt = 0;
        this.hoverT = 0;
        this.scratches++;
        ev.push({ k: 'hurt', x: cx, y: cy, dir: nx >= 0 ? 1 : -1 });
        break;
      }
    }
    // the mist
    if (this.y > MIST + 8 && !this.through && !this.fallen) {
      this.fallen = true;
      ev.push({ k: 'mist' });
    }

    // dew, puffs, silk
    for (const d of st.dew) {
      if (this.dewGot.has(d.id) || Math.abs(d.x - this.x) > 40) continue;
      if (Math.hypot(d.x - this.x, d.y - this.y) < DOT.R + 16) {
        this.dewGot.add(d.id);
        ev.push({ k: 'dew', id: d.id, x: d.x, y: d.y });
      }
    }
    for (const p of st.puffs) {
      if (this.popped.has(p.id) || Math.abs(p.x - this.x) > 60) continue;
      if (Math.hypot(p.x - this.x, p.y - this.y) < DOT.R + 24 * p.s) {
        this.popped.add(p.id);
        ev.push({ k: 'puff', id: p.id, x: p.x, y: p.y });
      }
    }
    for (const s of st.silk) {
      if (this.silkGot.has(s.id) || Math.abs(s.x - this.x) > 50) continue;
      if (Math.hypot(s.x - this.x, s.y - this.y) < DOT.R + 22) {
        this.silkGot.add(s.id);
        ev.push({ k: 'silk', id: s.id, x: s.x, y: s.y });
      }
    }
    // through the gap
    const lw = st.walls.find((w) => w.id === st.letter.wall);
    if (!this.through && lw && this.x > lw.x + lw.w + DOT.R + 4) {
      this.through = true;
      ev.push({ k: 'through' });
    }
  }

  /** the netting overhead, every wall's iron (all of it but its holes, where they are now) and the panels: she is pushed back out */
  private collide(ev: FlightEvent[]) {
    const r = DOT.R;
    const st = this.stage;
    if (this.y < TOP + r) {
      this.y = TOP + r;
      if (this.vy < 0) this.vy = 0;
    }
    if (this.y > DOT_H) this.y = DOT_H;
    if (this.x < r) {
      this.x = r;
      this.vx = Math.max(0, this.vx);
    }
    let hit = false;
    for (const w of st.walls) {
      if (this.x + r < w.x || this.x - r > w.x + w.w) continue;
      // the solid runs of this wall: from far above to far below, less its holes
      const holes = w.openings.map((o) => [openingY(o, this.t), openingY(o, this.t) + o.h]).sort((a, b) => a[0] - b[0]);
      let y0 = TOP - 400;
      for (const [a, b] of [...holes, [MIST + 600, MIST + 600]]) {
        if (a > y0) hit = this.pushOut(w.x, y0, w.w, a - y0) || hit;
        y0 = Math.max(y0, b);
      }
    }
    for (const p of st.panels) {
      if (this.x + r < p.x || this.x - r > p.x + p.w) continue;
      hit = this.pushOut(p.x, p.y, p.w, p.h) || hit;
    }
    if (hit && Math.hypot(this.vx, this.vy) > 140) ev.push({ k: 'bonk' });
  }

  /** push her circle out of a box; true when she was in it */
  private pushOut(bx: number, by: number, bw: number, bh: number): boolean {
    const r = DOT.R;
    const cx = Math.max(bx, Math.min(this.x, bx + bw));
    const cy = Math.max(by, Math.min(this.y, by + bh));
    let dx = this.x - cx;
    let dy = this.y - cy;
    const d2 = dx * dx + dy * dy;
    if (d2 >= r * r) return false;
    if (d2 < 1e-6) {
      // her middle is inside: out the nearest side
      const left = this.x - bx, right = bx + bw - this.x, up = this.y - by, down = by + bh - this.y;
      const m = Math.min(left, right, up, down);
      if (m === left) { this.x = bx - r; this.vx = Math.min(0, this.vx); }
      else if (m === right) { this.x = bx + bw + r; this.vx = Math.max(0, this.vx); }
      else if (m === up) { this.y = by - r; this.vy = Math.min(0, this.vy); }
      else { this.y = by + bh + r; this.vy = Math.max(0, this.vy); }
      return true;
    }
    const d = Math.sqrt(d2);
    dx /= d;
    dy /= d;
    this.x = cx + dx * r;
    this.y = cy + dy * r;
    // the speed into the iron goes, the rest stays (she slides along it)
    const into = this.vx * dx + this.vy * dy;
    if (into < 0) {
      this.vx -= into * dx * 1.2;
      this.vy -= into * dy * 1.2;
    }
    return true;
  }
}
