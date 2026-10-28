/**
 * meecaBot — a quick player for Meeca's stage (5-M) in the real engine (realPlay.ts), with the pad's controls and a finger tracing
 * circles to carve: it plays every room the right way (no traps, no hints), reads each line about as fast as a quick reader does, and
 * taps the story box on. Its clock is the stage's length for a quick player who never misses (meecaReal.test.ts: at least 2:30;
 * the time model, meecaStage.ts meecaSeconds, gives 3:20 to 4:20).
 *
 * Each step is a small plan the bot works through a frame at a time; `hardWay` makes it fall for each room's trap first (the chair,
 * the silk line, a polite cup of tea), as a curious player would, to prove the traps hold and let go and cost nothing.
 */
import type { RealPlay, Pad } from './realPlay.ts';
import type { MeecaPlay } from './meecaPlay.ts';
import type { KitPlay } from './puzzlePlay.ts';
import type { Platform } from './types.ts';
import { MEECA_G as MEECA_PATH } from './meecaStage.ts';

/** a quick reader: how long a line of the story box stays before the tap (s) */
export const readQuick = (text: string): number => Math.max(0.9, 0.5 + 0.22 * text.trim().split(/\s+/).length);
/** how fast a finger traces round (radians a frame: about one and a half turns a second) */
const TRACE = 0.3;

export class MeecaBot {
  readonly mc: MeecaPlay;
  readonly kit: KitPlay;
  /** every room's moment, as the bot met it: [what, game time] */
  readonly log: Array<[string, number]> = [];
  constructor(readonly sim: RealPlay, readonly hardWay = false) {
    this.mc = (sim.e as { mc: MeecaPlay }).mc;
    this.kit = (sim.e as { kit: KitPlay }).kit;
  }
  private get p() {
    return this.sim.p;
  }
  private f(pad: Pad = {}) {
    this.sim.frame(pad);
  }
  private wait(s: number) {
    for (let i = 0; i < Math.round(s * 30); i++) this.f();
  }
  private note(what: string) {
    this.log.push([what, this.mc.t]);
  }
  /** walk (or run) to x on the ground she is on; false if it took too long */
  walkTo(x: number, tol = 6, max = 30 * 25): boolean {
    for (let i = 0; i < max; i++) {
      if (Math.abs(this.p.x - x) <= tol && this.p.grounded) {
        this.f();
        return true;
      }
      this.f(this.p.x < x ? { right: true } : { left: true });
    }
    return false;
  }
  face(d: 1 | -1) {
    if ((this.p.facing >= 0 ? 1 : -1) === d) return;
    this.f(d > 0 ? { right: true } : { left: true });
    this.f();
  }
  tap() {
    this.f({ punch: true });
    this.f();
  }
  /** trace circles at the next trunk until it is cut */
  carve(max = 30 * 20): boolean {
    const want = this.mc.marked + 1;
    const tr = this.mc.next!;
    this.walkTo(tr.standX, 10);
    for (let i = 0; i < max && this.mc.marked < want; i++) this.f({ circle: TRACE });
    this.note(`carved ${tr.id}`);
    return this.mc.marked >= want;
  }
  /** a running jump from the end of the ground she is on onto `to` */
  hopTo(to: Platform): boolean {
    for (let i = 0; i < 30 * 6; i++) {
      const pl = this.p;
      if (pl.grounded && Math.abs(pl.y - to.y) < 3 && pl.x > to.x + 8 && pl.x < to.x + to.width - 8) return true;
      const edge = this.sim.platforms.find((q) => q.id === this.sim.standingOn);
      const nearEdge = pl.grounded && edge && pl.x > edge.x + edge.width - 26;
      this.f(nearEdge ? { right: true, press: true } : pl.grounded ? { right: true } : { right: true, jump: true });
    }
    return false;
  }
  /** onto the next platform of a trail: run at it, jump at the edge or at a face, a second jump when it is higher than one reaches */
  stepTo(to: Platform): boolean {
    let second = false;
    for (let i = 0; i < 30 * 8; i++) {
      const pl = this.p;
      const on = this.sim.standingOn === to.id && pl.grounded;
      if (on && pl.x >= to.x + Math.min(40, to.width / 2)) return true;
      // (past it already: a jump carried her over a short piece of ground)
      if (pl.grounded && pl.x > to.x + to.width && pl.y - to.y > -160 && pl.y - to.y < 220) return true;
      const here = this.sim.platforms.find((q) => q.id === this.sim.standingOn);
      const ahead = to.x - pl.x;
      const higher = pl.y - to.y;
      let pad: Pad = { right: true };
      if (pl.grounded) {
        second = false;
        // (the next piece of ground going on at the same height is no edge: she walks onto it)
        const seam = !!here && Math.abs(to.x - (here.x + here.width)) < 3 && Math.abs(to.y - here.y) < 3;
        const atEdge = !!here && here.id !== to.id && !seam && pl.x > here.x + here.width - 22;
        const atFace = higher > 20 && ahead < 70 && ahead > -to.width;
        // (lower ground ahead, and this the edge of what she stands on: she just walks off)
        if (here && here.id !== to.id && (atFace || (atEdge && higher > -40))) pad = { right: true, press: true };
      } else {
        pad = { right: true, jump: true };
        // (a second flick at the top of the first jump, when the first will not reach)
        if (!second && pl.vy > -120 && pl.y - to.y > 30) {
          pad = { right: true, press: true };
          second = true;
        }
      }
      this.f(pad);
    }
    return false;
  }
  /** up a climbing trunk to its top, and over onto the branch */
  climbUp(vineId: number): boolean {
    const v = this.sim.vines.find((q) => q.id === vineId)!;
    this.walkTo(v.x, 8);
    for (let i = 0; i < 30 * 6 && !(this.p.grounded && this.p.y <= v.topY + 4); i++) this.f(this.p.climbing ? { up: true } : { up: true, right: Math.abs(this.p.x - v.x) > 20 });
    // (off the top onto the branch, a step in)
    for (let i = 0; i < 12; i++) this.f({ right: true });
    return this.p.grounded && this.p.y <= v.topY + 4;
  }
  /** a whole trail, step by step */
  trail(i: number): boolean {
    const tr = this.mc.st.trails[i];
    for (const s of tr.steps) {
      const ok = s.kind === 'climb' ? this.climbUp(s.vine) : this.stepTo(this.sim.platforms.find((q) => q.id === s.id)!);
      if (!ok) {
        this.note(`stuck on trail ${tr.name} at ${s.kind} ${s.kind === 'plat' ? s.id : s.vine}`);
        return false;
      }
    }
    this.note(`trail ${tr.name}`);
    return true;
  }

  /** tap the story box on, reading each line */
  readScene() {
    for (let k = 0; k < 20 && (this.mc.phase === 'endingA' || this.mc.phase === 'endingB'); k++) {
      const l = this.mc.sceneLine;
      if (!l) {
        this.f();
        continue;
      }
      const at = this.mc.line;
      this.wait(readQuick(l.text));
      this.tap();
      for (let i = 0; i < 6 && this.mc.line === at && (this.mc.phase === 'endingA' || this.mc.phase === 'endingB'); i++) this.f();
    }
  }

  // ───────────────────────────── the stage, step by step ─────────────────────────────

  card() {
    this.wait(2.2);
    this.tap();
    this.note('card');
  }
  prologue() {
    // (through the camp on tiptoe and out into the woods; the paths that look the same, Flicker blinking on: she stops a moment as he
    // speaks)
    this.walkTo(this.mc.st.trails[0].x0 - 20);
    this.trail(0);
    this.walkTo(this.mc.st.flickerX + 10);
    this.wait(1.2);
    this.note('flicker');
    this.carve();
    this.trail(1);
  }
  room1() {
    const room = this.kit.rooms.find((r) => r.spec.id === 'sit')!;
    const chair = room.chairs[0];
    const sp = room.saplings[0];
    this.wait(1.4);
    if (this.hardWay) {
      // the obvious step: the chair. It holds her, she wiggles free
      this.walkTo(chair.x - 70);
      this.f({ right: true, press: true });
      for (let i = 0; i < 24 && chair.state === 'empty'; i++) this.f({ right: true, jump: true });
      this.wait(1.4);
      for (let k = 0; k < 8 && chair.state !== 'pop'; k++) for (let i = 0; i < 3; i++) this.f(k % 2 ? { left: true } : { right: true });
      this.wait(1.2);
      this.note('chair');
    }
    this.walkTo(sp.x, 4);
    for (let i = 0; i < 30 * 6 && !sp.bent; i++) this.f({ up: true });
    this.wait(0.3);
    this.note('sapling');
    this.carve();
    this.trail(2);
  }
  room2() {
    const room = this.kit.rooms.find((r) => r.spec.id === 'eat')!;
    const [plateA, plateB] = room.plates;
    const src = room.sources[0];
    const gate = room.gates[0];
    // she comes in: the dozing beetle by the door eats its cake and falls asleep, where she can see it
    this.walkTo(room.beetles[0].home - 160);
    for (let i = 0; i < 30 * 6 && room.beetles[0].st.mode !== 'sleep'; i++) this.f();
    this.note('beetle slept');
    this.walkTo(src.x - 44);
    this.face(1);
    this.tap();
    this.walkTo(plateB.x - 44);
    this.face(1);
    this.tap();
    this.walkTo(plateA.x, 10);
    for (let i = 0; i < 30 * 10 && !gate.open; i++) this.f();
    this.note('gate');
    this.carve();
    this.walkTo(this.mc.st.trails[3].x0 - 20);
    this.trail(3);
  }
  room3() {
    const room = this.kit.rooms.find((r) => r.spec.id === 'silk')!;
    const src = room.sources[0];
    const knot = room.knots[0];
    const ladder = room.ladders[0];
    this.wait(1.0);
    if (this.hardWay) {
      const v = room.silks[0].vine!;
      this.walkTo(v.x - 20);
      this.f({ right: true, press: true });
      for (let i = 0; i < 20 && room.silks[0].state === 'free'; i++) this.f({ right: true, jump: true });
      for (let i = 0; i < 30 * 4 && room.silks[0].state !== 'free'; i++) this.f();
      this.note('silk');
    }
    for (let tries = 0; tries < 6 && !knot.snapped; tries++) {
      this.walkTo(src.x - 44);
      this.face(1);
      this.tap();
      // the spot under the knot a flick up throws from (a little short of the bank, stepping in a little each try)
      this.walkTo(knot.x - 100 + tries * 12, 4);
      this.face(1);
      this.f({ press: true });
      this.wait(1.4);
    }
    this.note('knot');
    for (let i = 0; i < 30 * 2 && ladder.show < 1; i++) this.f();
    this.walkTo(ladder.vine!.x, 4);
    for (let i = 0; i < 30 * 4 && this.p.y > ladder.vine!.topY + 30; i++) this.f({ up: true });
    for (let i = 0; i < 30 * 2 && !this.p.grounded; i++) this.f({ up: true, right: true });
    this.note('ladder');
    this.carve();
    this.walkTo(this.mc.st.trails[4].x0 - 20);
    this.trail(4);
  }
  room4() {
    const room = this.kit.rooms.find((r) => r.spec.id === 'tea')!;
    const lift = room.lifts[0];
    const butler = room.gates[0];
    this.wait(1.0);
    if (this.hardWay) {
      this.walkTo(butler.x - 112);
      this.face(1);
      this.tap();
      this.wait(3.2);
      this.note('polite');
    }
    this.walkTo(lift.plat.x + 16, 6);
    this.face(-1);
    this.tap();
    for (let i = 0; i < 30 * 6 && lift.level < 0.999; i++) this.f();
    this.note('lift');
    this.walkTo(butler.x, 10);
    this.walkTo(butler.x + 120, 10);
    this.carve();
    this.walkTo(this.mc.st.trails[5].x0 - 20);
    this.trail(5);
  }
  room5() {
    const room = this.kit.rooms.find((r) => r.spec.id === 'look')!;
    const ledges = room.ledges.map((l) => l.plat);
    const bankP = this.sim.platforms.find((q) => q.id === room.spec.beyond.on)!;
    // (in Flicker's light, a step at a time: each step shows as she nears it)
    this.walkTo(ledges[0].x - 70);
    for (const l of [...ledges, bankP]) {
      for (let i = 0; i < 30 && l.broken; i++) this.f();
      if (!this.stepTo(l)) break;
    }
    this.note('steps');
    for (let i = 0; i < 30 * 3 && this.mc.phase === 'play'; i++) this.f({ right: true });
    // she stops to look; Pell steps out
    for (let i = 0; i < 30 * 14 && this.mc.phase === 'look'; i++) this.f();
    this.note('pell');
    this.readScene();
    this.carve();
    this.readScene();
    for (let i = 0; i < 30 * 4 && this.mc.phase !== 'done'; i++) this.f();
    this.note('done');
  }
  /** the whole stage */
  play() {
    this.card();
    this.prologue();
    this.room1();
    this.room2();
    this.room3();
    this.room4();
    this.room5();
  }
}

/**
 * The floor of a trail section, walked (meecaStage.test.ts, meecaReal.test.ts, tools/inspect/meecaPace.ts): from the path at x0, hold
 * right (and with `hop`, jump at whatever stops her, a second flick at the top) for up to 30 s, with the section's trunks switched off.
 * `through`: she stood on the path at x1. Matt (2026-10-28): the floor must never get her past a climb.
 */
export function floorWalker(sim: RealPlay, x0: number, x1: number, hop: boolean): { through: boolean; climbs: number } {
  const mc = (sim.e as { mc: MeecaPlay }).mc;
  mc.phase = 'play';
  mc.marked = mc.st.trunks.length;
  let climbs = 0;
  for (const v of sim.vines) {
    if (v.kit || v.x < x0 - 40 || v.x > x1 + 40) continue;
    v.off = true;
    climbs++;
  }
  const g = sim.platforms.filter((p) => p.x <= x0 + 4 && p.x + p.width >= x0 + 4).sort((a, b) => b.y - a.y).find((p) => p.y <= MEECA_PATH + 1);
  sim.stand(x0 + 4, g ? g.y : MEECA_PATH);
  let best = sim.p.x;
  let still = 0;
  let air = 0;
  for (let i = 0; i < 30 * 30; i++) {
    const p = sim.p;
    let pad: Pad = { right: true };
    if (hop && p.grounded && still >= 3) {
      pad = { right: true, press: true };
      still = 0;
      air = 0;
    } else if (hop && !p.grounded) {
      air++;
      pad = air === 9 ? { right: true, press: true } : { right: true, jump: air < 16 };
    }
    sim.frame(pad);
    if (sim.p.x > best + 1) {
      best = sim.p.x;
      still = 0;
    } else still++;
    if (sim.p.x >= x1 - 10 && sim.p.grounded && Math.abs(sim.p.y - MEECA_PATH) < 3) return { through: true, climbs };
  }
  return { through: false, climbs };
}
