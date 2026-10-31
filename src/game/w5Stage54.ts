/**
 * 5-4 Silk Bridges (vine_runner, the first stage of the dusk): "Swing across on the silk, and do not admire it."
 *
 * The light is starting to go as the orchids close. The stage's two pieces are the silk lines, swung on like lianas (the liana system
 * with the current vine controls: a Vine with `silk`, w5Kit silkLine), and Dot's fifth rule, "don't admire the silk": lovely shimmering
 * sheets of silk hang by the path, and lingering in front of one starts the drowsy creep faster than standing anywhere else (w5Kit
 * admiring, run by w5Play.ts). The Seamstress makes her first, gentle appearance knitting one of the sheets: she looks up at a player who
 * lingers there (a 0.8 s tell, a "!" over her) and casts lace onto him, more silk at once.
 *
 *   1. START    Dot: it's getting late, swing on the silk (room for the goal card and her line before anything new).
 *   2. LEARN    the first silk line, over solid ground: a safe swing, nothing under it but the path. Then one line over a soft pit.
 *   3. DEVELOP  Dot's fifth rule, and the first silk sheet (its own line as it comes into view); then two lines in a row (her line
 *               about letting go at the front and catching the next comes first), and the Seamstress knitting her sheet.
 *   4. TWIST    three lines in a row with a catch ledge in the pit under them; then the high bridge: branches up, lines hung high,
 *               and a catch ledge under each gap so a miss is a hop back up and another go, never the whole bridge again.
 *   5. FINISH   the pieces again in new pairs, a jumping spider or two on the path between them, a flag after each pair, until a quick
 *               player has had about 2:50 (STAGE_SECONDS).
 *
 * Every drop is a soft pit (a mossy floor, and a step back up the far side): a miss costs a climb, never a life. Every chain is rolled
 * again until a running jump grabs its first line, each line catches the next (more than 0.6 s of let-go moments, and the let-go most
 * players make), and the last one lands on the far side (protoCheck.ts, the engine's own physics). Nothing lies past the shrine.
 */
import { fixPickups } from './flowerReach.ts';
import { G, heartsAtFlags, stageSeconds, stream, type LeafCover, type ProtoExtras, type StageHint } from './protoStage.ts';
import type { GeneratedStage } from './stageGenerator.ts';
import { findForStage } from './finds.ts';
import { catchWindow, earlyCatch, jumpGrab, landWindow } from './protoCheck.ts';
import { airStep, canGrabSwing, swingSetup, inSweetSpot, PHYS, swingGrab, swingStep, timedLaunch, type AirBody } from './physics.ts';
import { PAST_SHRINE } from './rules.ts';
import { silkLine, type Chair, type Seamstress, type SilkSheet, type W5Decor, type W5Extras, type W5Spider } from './w5Kit.ts';
import { W5_HINTS, type W5Hint } from './w5Lines.ts';
import { W5_HEART_UP } from './w5Stages.ts';
import type { Collectible, Enemy, LevelConfig, Platform, Vine } from './types.ts';

/** the floor of a soft pit, and the step out of it (as protoStage.ts) */
const HOLLOW_Y = 710;
const PIT_STEP = 55;
const BANK_H = 90;
/** a catch ledge in a pit: a low branch a plain hop up from the floor, from which a running jump grabs the next line */
export const CATCH_Y = 645;
/** a quick, sure player runs at 285 px/s, and swings across at about 430 */
const RUN = 285;
const SWING = 430;
/** how far a spider's patch keeps from a flag or the spawn (levelCheck.ts SAFE_APPROACH is 200) */
const SAFE_GAP = 230;
/** the high bridge's branch (px above the path), and the step up to it */
const HIGH_UP = 180;
const STEP_UP = 92;

/** what the tests read back about 5-4 */
export interface W54Info {
  flagSeconds: number[];
  /** the first silk line, over solid ground (its vine id, and the ground under it) */
  firstLine: { vine: number; x: number };
  /** every chain of silk lines: its vine ids in order, the take-off (edge, and its height), where it lands, and its catch ledges */
  chains: Array<{ vines: number[]; edge: number; y: number; far: number; farY: number; high: boolean; ledges: number[]; start?: number; land?: number; checked: boolean }>;
  /** the sheets (by index in w5.sheets), and which one the Seamstress knits */
  sheets: number;
  seamSheet: number;
  spiders: number[];
}

/** the earliest let-go the whole-swing check asks to work: just past the bottom of the swing (radians) */
export const WHOLE_FROM = 0.05;
/**
 * A real thumb lets go anywhere from the bottom of the swing to its front, and often without the second jump: every let-go moment of
 * the sweet spot from `from` (radians past hanging straight down) on, with no second jump, must catch the next line (`to`) or land on
 * the platform (`land`). Checked for a line caught high and one caught near its end. (protoCheck's catchWindow only asks for 0.6 s of
 * good moments, with the second jump allowed: let go at the bottom of the swing, real thumbs fell short, the test's thumb at 300 px
 * spacing. A press a beat before the bottom is held for the sweet spot's first moment, physics.ts RELEASE.early, and may still fall
 * short into the soft pit: a climb, and another go.)
 */
export function wholeSwing(A0: Vine, o: { to?: Vine; land?: Platform }, from = WHOLE_FROM): boolean {
  // (the lines at the swings the stage gives them side by side: physics.ts swingSetup)
  const A = { ...A0 };
  const B = o.to ? { ...o.to } : undefined;
  swingSetup(B ? [A, B] : [A]);
  return wholeSwingAt(A, B, o.land, from);
}
function wholeSwingAt(A: Vine, to: Vine | undefined, land: Platform | undefined, from: number): boolean {
  const DT = 1 / 30;
  const len = A.bottomY - A.topY;
  const o = { land };
  for (const k of [0.7, 0.95]) {
    const s = swingGrab({ x: A.x - 40, y: A.topY + Math.min(len * k, len - 20), vx: 300, vy: 100 }, A);
    let seen = false;
    for (let f = 0; f < 120; f++) {
      const at = swingStep(s, A, DT, 1, 0);
      if (!inSweetSpot(s, 1)) {
        if (seen) break;
        continue;
      }
      seen = true;
      // (`from` in radians of the old 0.8 swing: a share of the vine's swing now)
      if (s.angle / Math.max(0.01, s.amp ?? 0.8) < from / 0.8) continue;
      const l = timedLaunch(s, 1);
      const c: AirBody = { x: at.x, y: at.y, vx: l.vx, vy: l.vy };
      let ok = false;
      for (let i = 1; i <= 90 && !ok; i++) {
        const py = c.y;
        airStep(c, DT, 1);
        // (the next line swings on the same clock: where it is when he gets there, physics.ts the self-swing)
        if (to && canGrabSwing(c.x, c.y, to, s.t! + i * DT)) ok = true;
        const L = o.land;
        if (L && c.vy >= 0 && py <= L.y + 14 && c.y >= L.y && c.x > L.x + 10 && c.x < L.x + L.width) ok = true;
        if (c.y > 900) break;
      }
      if (!ok) return false;
    }
    if (!seen) return false;
  }
  return true;
}

/**
 * A running jump off a ledge (edge at `edgeX`, surface `y`) with no second jump, taken in the last 60 px: how many of the six take-off
 * spots grab the line (protoCheck jumpGrab allows the second jump; a first line should not need it)
 */
export function plainGrab(edgeX: number, y: number, v: Vine): number {
  const DT = 1 / 30;
  let ok = 0;
  for (let back = 10; back <= 60; back += 10) {
    const b: AirBody = { x: edgeX - back, y, vx: PHYS.maxRun, vy: -PHYS.jumpV };
    for (let i = 0; i < 70; i++) {
      airStep(b, DT, 1, i < 7);
      if (canGrabSwing(b.x, b.y, v)) {
        ok++;
        break;
      }
      if (b.y > y + 400) break;
    }
  }
  return ok;
}

export function buildW5Stage54(config: LevelConfig, seed: number): GeneratedStage & { proto: ProtoExtras; w54info: W54Info } {
  const R = stream(seed * 7 + 504);
  const P: Platform[] = [];
  const V: Vine[] = [];
  const C: Collectible[] = [];
  const E: Enemy[] = [];
  const checkpoints: Array<{ x: number; y: number; reached: boolean }> = [];
  const hints: StageHint[] = [];
  const beats: Array<[number, number, string]> = [];
  const covers: LeafCover[] = [];
  const chairs: Chair[] = [];
  const sheets: SilkSheet[] = [];
  const seamstresses: Seamstress[] = [];
  const spiders: W5Spider[] = [];
  const decor: W5Decor[] = [];
  const info: W54Info = { flagSeconds: [0], firstLine: { vine: -1, x: 0 }, chains: [], sheets: 0, seamSheet: -1, spiders: [] };
  let pid = 1, cid = 1, eid = 1, vid = 1;
  let expert = 0;
  const r = Math.round;

  // ----- the kit -----
  const bank = (x0: number, x1: number, y = G, style: Platform['style'] = 'log') => {
    const p: Platform = { id: pid++, x: r(x0), y: r(y), width: r(x1) - r(x0), height: BANK_H, type: 'solid', style };
    P.push(p);
    return p;
  };
  const branch = (x0: number, x1: number, y: number) => {
    const p: Platform = { id: pid++, x: r(x0), y: r(y), width: r(x1) - r(x0), height: 24, type: 'solid', style: 'branch' };
    P.push(p);
    return p;
  };
  /** a soft pit between two banks: a mossy floor walled down to it, and a low step at the far wall's foot (protoStage.ts softPit) */
  const softPit = (edge: number, far: number) => {
    const wallTop = G + BANK_H;
    const wallH = HOLLOW_Y - wallTop + 4;
    P.push({ id: pid++, x: r(edge - 60), y: wallTop, width: 60, height: wallH, type: 'solid', style: 'moss_stone', soil: true });
    P.push({ id: pid++, x: r(far), y: wallTop, width: 60, height: wallH, type: 'solid', style: 'moss_stone', soil: true });
    bank(edge - 60, far + 60, HOLLOW_Y, 'moss_stone');
    const sw = far - edge < 170 ? far - edge : 70;
    P.push({ id: pid++, x: r(far - sw), y: HOLLOW_Y - PIT_STEP, width: r(sw), height: PIT_STEP, type: 'solid', style: 'moss_stone', soil: true });
  };
  const line = (x: number, topY: number, bottomY: number) => {
    const v = silkLine(vid++, r(x), r(topY), r(bottomY));
    V.push(v);
    return v;
  };
  const flower = (x: number, y: number, v: Collectible['botanicalVariant'] = 'orchid') => {
    const c: Collectible = { id: cid++, type: 'flower', botanicalVariant: v, x: r(x), y: r(y), collected: false, bobPhase: (x * 0.031) % 6.28 };
    C.push(c);
    return c;
  };
  const row = (x0: number, x1: number, y: number, n: number, v: Collectible['botanicalVariant'] = 'orchid') => {
    for (let i = 0; i < n; i++) flower(x0 + ((x1 - x0) * i) / Math.max(1, n - 1), y, v);
  };
  const arc = (x0: number, x1: number, yTop: number, n: number, v: Collectible['botanicalVariant'] = 'hibiscus') => {
    for (let i = 0; i < n; i++) {
      const t = (i + 0.5) / n;
      flower(x0 + (x1 - x0) * t, yTop + 60 * (1 - Math.sin(Math.PI * t)), v);
    }
  };
  const hint = (x: number, h: W5Hint) => hints.push({ x: r(x), text: h.old, pad: h.pad ?? h.old, keys: h.keys ?? h.old });
  const scenery = (n: string, x: number, w: number, o: Partial<W5Decor> = {}) => decor.push({ n, x: r(x), b: G, w: r(w), ...o });
  /** the garden at dusk along a stretch: ferns, the orchids folding shut, and now and then a guest who sat (a silk-wrapped chair) */
  const garden = (x0: number, x1: number) => {
    for (let gx = x0 + R.r(40, 140); gx < x1 - 60; gx += R.r(180, 320)) {
      const k = R.f();
      if (k < 0.3) scenery('fern', gx, R.r(80, 120));
      else if (k < 0.55) scenery(R.pick(['orchidHalf', 'orchidClosed', 'orchidHalf2'] as const), gx, R.r(60, 84));
      else if (k < 0.8) scenery(R.chance(0.5) ? 'blossom' : 'blossom2', gx, R.r(70, 100));
      else chairs.push({ x: r(gx), y: G, face: R.chance(0.5) ? 1 : -1, wrapped: true });
    }
  };

  // ----- the ground: `x` is the open end of the bank he is on (at G) -----
  let bankFrom = 0;
  let x = 0;
  const run = (len: number) => { x += r(len); };
  const close = () => {
    if (x - bankFrom > 1) bank(bankFrom, x);
  };
  const open = (at: number) => {
    bankFrom = r(at);
    x = r(at);
  };
  let lastFlag = 140;
  const flag = () => {
    const reach = Math.max(-1e9, ...E.map((e) => e.patrolMaxX));
    if (x - 80 - reach < SAFE_GAP) {
      const add = SAFE_GAP - (x - 80 - reach);
      run(add);
      expert += add / RUN;
    }
    lastFlag = r(x - 80);
    checkpoints.push({ x: r(x - 80), y: G, reached: false });
    info.flagSeconds.push(expert);
  };
  const beat = (name: string, f: () => void) => {
    const x0 = x;
    f();
    beats.push([r(x0), r(x), name]);
  };

  // ----- the pieces (each starts and ends on open ground at G) -----
  function rest(len: number, petals = true) {
    const x0 = x;
    run(len);
    if (petals && len > 260) row(x0 + 80, x - 80, G - 34, Math.max(2, r(len / 170)), R.pick(['orchid', 'hibiscus'] as const));
    garden(x0, x);
    expert += len / RUN;
  }

  /** the first silk line, hung over solid ground: a safe swing with nothing under it but the path (petals along its arc) */
  function firstLine() {
    run(R.r(260, 320));
    const vx = x + 80;
    const top = r(R.r(170, 195));
    // (its end well above his head: walking under it, he never takes it by accident; a hop takes it)
    const v = line(vx, top, G - 46);
    info.firstLine = { vine: v.id, x: r(vx) };
    arc(vx - 150, vx + 260, G - 165, 5);
    run(R.r(300, 340));
    garden(vx - 300, x);
    expert += 720 / RUN + 1.5;
    // (a plain stump past it, then on: the lesson's stretch was 6 s of plain walk for a player who walks under the line)
    stump();
  }

  /**
   * `n` silk lines in a row over a soft pit. `ledge`: a catch ledge in the pit under each gap between lines (a miss is a hop back up
   * and a jump for the next line). Rolled again until the jump grabs the first line, each line catches the next, and the last lands.
   */
  function chain(n: number, o: { easy?: boolean; /** catch ledges under the gaps (default) */ ledge?: boolean } = {}) {
    const x0 = x;
    // (a full run-up of flat path before the edge, 240 px or more: a real thumb's run starts there, w5Stage54.test.ts)
    run(R.r(240, 270));
    const edge = x;
    for (let tries = 0; tries < 14; tries++) {
      const easy = !!o.easy || tries > 7;
      const d0 = R.r(170, 200);
      const sp = Array.from({ length: n - 1 }, () => (easy ? R.r(255, 275) : R.r(265, 295)));
      const d1 = R.r(185, 215);
      const xs = [edge + d0];
      for (const s of sp) xs.push(xs[xs.length - 1] + s);
      const farX = r(xs[n - 1] + d1);
      const tops = xs.map(() => r(easy ? R.r(190, 220) : R.r(150, 210)));
      const vs = xs.map((vx, k) => silkLine(-1 - k, r(vx), tops[k], Math.min(G + 30, tops[k] + 410)));
      const far: Platform = { id: -99, x: farX, y: G, width: 400, height: BANK_H, type: 'solid' };
      let ok = jumpGrab(edge, G, vs[0]) >= 4 && plainGrab(edge, G, vs[0]) >= 4;
      for (let k = 0; ok && k < n - 1; k++) ok = catchWindow(vs[k], vs[k + 1]) > 0.6 && earlyCatch(vs[k], vs[k + 1]);
      if (ok) ok = landWindow(n > 1 ? vs[n - 2] : null, vs[n - 1], far) >= 8;
      for (let k = 0; ok && k < n; k++) ok = wholeSwing(vs[k], k < n - 1 ? { to: vs[k + 1] } : { land: far });
      // the catch ledges: under each gap, ending a little short of the next line, from which a running jump grabs it
      const ledges: Array<[number, number]> = [];
      if (ok && o.ledge !== false) {
        for (let k = 0; ok && k < n - 1; k++) {
          const l1 = xs[k + 1] - R.r(70, 100);
          ledges.push([l1 - 130, l1]);
          ok = jumpGrab(l1, CATCH_Y, vs[k + 1]) >= 4;
        }
      }
      if (!ok && tries < 13) continue;
      close();
      softPit(edge, farX);
      const ids = vs.map((v) => line(v.x, v.topY, v.bottomY).id);
      // (the first line's swing starts where a running jump meets it coming back: from about 0.7 to 0.8 of its beat, a real thumb's
      // jump met it swinging away and missed, w5Stage54.test.ts. The rest of the chain follows from it)
      (V[V.length - n] as Vine & { swingPhase?: number }).swingPhase = Math.round((R.r(0.85, 1.22) % 1) * 1000) / 1000;
      const lids = ledges.map(([a, b]) => branch(a, b, CATCH_Y).id);
      for (let k = 0; k < n; k++) {
        arc(k === 0 ? edge + 10 : (xs[k - 1] + xs[k]) / 2, k === n - 1 ? farX - 10 : (xs[k] + xs[k + 1]) / 2, Math.min(G - 150, vs[k].topY + 200), 3);
      }
      info.chains.push({ vines: ids, edge: r(edge), y: G, far: farX, farY: G, high: false, ledges: lids, checked: ok });
      open(farX);
      run(R.r(110, 150));
      garden(farX, x);
      expert += (edge - x0) / RUN + (farX - edge) / SWING + 0.4 * n + (x - farX) / RUN;
      return;
    }
  }

  /**
   * The high bridge: a step up and a branch high over the path, `n` silk lines hung from high in the canopy, and a branch on the far side
   * to land on, then a step down. Under it a soft pit, with a catch ledge under every gap (the hop back up to the next line).
   */
  function highBridge(n: number) {
    const x0 = x;
    run(R.r(180, 240));
    const s0 = x;
    branch(s0, s0 + 150, G - STEP_UP);
    const y0 = G - HIGH_UP;
    const start = branch(s0 + 110, s0 + 110 + R.r(200, 240), y0);
    const edge = start.x + start.width;
    for (let tries = 0; tries < 14; tries++) {
      const easy = tries > 7;
      // (the first line a little nearer the branch's end: at 148 px a real thumb's jump from the branch missed it, w5Stage54.test.ts)
      const xs = [edge + R.r(115, 138)];
      for (let k = 1; k < n; k++) xs.push(xs[k - 1] + (easy ? R.r(250, 270) : R.r(260, 290)));
      const tops = xs.map(() => r(R.r(110, 160)));
      const vs = xs.map((vx, k) => silkLine(-1 - k, r(vx), tops[k], Math.min(y0 + 120, tops[k] + 330)));
      const endB: Platform = { id: -99, x: r(xs[n - 1] + R.r(150, 180)), y: r(y0 + R.r(-16, 16)), width: r(R.r(280, 340)), height: 24, type: 'solid' };
      let ok = jumpGrab(edge, y0, vs[0]) >= 4 && plainGrab(edge, y0, vs[0]) >= 4;
      for (let k = 0; ok && k < n - 1; k++) ok = catchWindow(vs[k], vs[k + 1]) > 0.6 && earlyCatch(vs[k], vs[k + 1]);
      if (ok) ok = landWindow(n > 1 ? vs[n - 2] : null, vs[n - 1], endB) >= 8;
      for (let k = 0; ok && k < n; k++) ok = wholeSwing(vs[k], k < n - 1 ? { to: vs[k + 1] } : { land: endB });
      // a catch ledge under each gap, ending a little short of the next line (a jump from the branch that misses the first line drops
      // to the floor, and the first ledge is a hop up from there)
      const ledges: Array<[number, number]> = [];
      for (let k = 1; ok && k < n; k++) {
        const l1 = xs[k] - R.r(70, 100);
        ledges.push([l1 - 130, l1]);
        ok = jumpGrab(l1, CATCH_Y, vs[k]) >= 4;
      }
      if (!ok && tries < 13) continue;
      // the ground under the start branch runs on a little past its end, then the pit, under the whole bridge
      run(edge + 40 - x);
      const pitEdge = x;
      const farX = r(endB.x + 40);
      close();
      softPit(pitEdge, farX);
      const ids = vs.map((v) => line(v.x, v.topY, v.bottomY).id);
      // (the first line's swing starts where a jump from the branch meets it coming back: from about 0.8 of its beat on, a real
      // thumb's jump from the branch met it swinging away and missed, w5Stage54.test.ts. The rest of the chain follows from it)
      (V[V.length - n] as Vine & { swingPhase?: number }).swingPhase = Math.round(R.r(0.12, 0.5) * 1000) / 1000;
      const lids = ledges.map(([a, b]) => branch(a, b, CATCH_Y).id);
      const eb = branch(endB.x, endB.x + endB.width, endB.y);
      // (and down again: a step at the far end of the landing branch)
      branch(eb.x + eb.width - 40, eb.x + eb.width + 110, G - STEP_UP);
      // (petals on the leap off the branch for the first line, and on the landing branch: where every crossing passes)
      flower(edge - 30, y0 - 40, 'hibiscus');
      flower(edge + 50, y0 - 72, 'hibiscus');
      flower(edge + 110, y0 - 92, 'hibiscus');
      row(eb.x + 50, eb.x + eb.width - 60, eb.y - 34, 2, 'hibiscus');
      info.chains.push({ vines: ids, edge: r(edge), y: y0, far: eb.x, farY: eb.y, high: true, ledges: lids, start: start.id, land: eb.id, checked: ok });
      open(farX);
      x = r(eb.x + eb.width + 110 + R.r(140, 200));
      garden(farX, x);
      expert += (edge - x0) / RUN + 1 + (endB.x - edge) / SWING + 0.4 * n + (x - endB.x) / RUN;
      return;
    }
  }

  /** a shimmering silk sheet by the path, to be walked straight past (`seam`: the Seamstress at its far end, knitting it) */
  function sheetWalk(seam = false) {
    const x0 = x;
    run(R.r(200, 250));
    const s0 = x;
    const w = r(R.r(300, 380));
    sheets.push({ x0: s0, x1: s0 + w, top: G - r(R.r(240, 270)), bottom: G });
    row(x0 + 60, s0 - 60, G - 34, 2, 'orchid');
    run(w);
    if (seam) {
      seamstresses.push({ x: r(x + 50), y: G, dir: -1, sheet: sheets.length - 1 });
      info.seamSheet = sheets.length - 1;
      run(110);
    }
    run(R.r(150, 190));
    row(x - 170, x - 70, G - 34, 2, 'hibiscus');
    garden(x - 180, x);
    expert += (x - x0) / RUN;
  }

  /** a jumping spider on a stretch of path (World 5's: it crouches in full view before it rushes) */
  function spiderRun(len: number) {
    const x0 = x;
    run(len);
    const id = 500 + eid++;
    const sx = x0 + len * R.r(0.45, 0.6);
    const lo = Math.max(x0 + 40, lastFlag + SAFE_GAP, sx - 200), hi = Math.max(sx + 20, Math.min(x - 40, sx + 200));
    E.push({
      id, type: 'spider', x: r(Math.max(sx, lo + 20)), y: G - 12, vx: 0, vy: 0, width: 34, height: 22, hp: 1, maxHp: 1, facing: -1, hitW: 60,
      patrolMinX: r(lo), patrolMaxX: r(hi), attackCooldown: 1.2, telegraphTimer: 0, isAttacking: false, animTimer: 0, hitFlashTimer: 0,
      defeated: false, koTimer: 0, behaviorTimer: 0, edgeMinX: r(lo), edgeMaxX: r(hi), noThread: true, stompable: true,
    } as Enemy);
    spiders.push({ id });
    info.spiders.push(id);
    row(x0 + 80, x - 80, G - 34, Math.max(2, r(len / 200)), 'orchid');
    garden(x0, x);
    expert += len / RUN + 1.4;
  }

  /** a plain soft pit to hop (one jump: 130-160 px), petals over it: a thing already known, with no line of its own */
  function hopPit() {
    run(R.r(120, 170));
    const edge = x;
    const far = r(edge + R.r(130, 160));
    close();
    softPit(edge, far);
    arc(edge + 10, far - 10, G - 128, 3);
    open(far);
    run(R.r(110, 150));
    expert += (far - edge + 260) / RUN + 0.35;
  }
  /** a plain stump to hop up and over (one jump high), a petal on top */
  function stump() {
    run(R.r(100, 150));
    const w = R.r(130, 180), h = R.r(55, 80);
    P.push({ id: pid++, x: r(x), y: r(G - h), width: r(w), height: r(h), type: 'solid', style: 'moss_stone' });
    flower(x + w / 2, G - h - 34, 'hibiscus');
    run(w + R.r(80, 130));
    expert += (w + 230) / RUN + 0.4;
  }
  /** room for a line, `len` px, filled with plain pits and stumps (never a long plain walk: the 4 s quiet rule, 2026-10-31) */
  function room(len: number) {
    const end = x + len;
    while (end - x > 420) {
      if (R.chance(0.5)) hopPit();
      else stump();
    }
    if (end - x > 0) rest(end - x, false);
  }
  /**
   * A finish's pieces, drawn as a shuffled deck: the roll's theme (`keep` of them come back) and `once` more drawn a single time, so two
   * plays hold different pieces and one play still holds several (Matt, 2026-10-31: "very repetitive")
   */
  function deck(all: Array<() => void>, keep: number, once: number) {
    const order = R.shuffle(all.map((_, i) => i));
    const theme = order.slice(0, keep), guests = order.slice(keep, keep + once);
    let left: number[] = [];
    let last = -1;
    let drawn = 0;
    return () => {
      drawn++;
      if (guests.length && drawn % 3 === 2) {
        all[guests.shift()!]();
        return;
      }
      if (!left.length) {
        left = R.shuffle([...theme]);
        if (theme.length > 1 && left[left.length - 1] === last) [left[0], left[left.length - 1]] = [left[left.length - 1], left[0]];
      }
      last = left.pop()!;
      all[last]();
    };
  }

  // ───────────────────────────── 5-4 Silk Bridges ─────────────────────────────
  beat('Start: the light going', () => {
    hint(60, W5_HINTS.s54start);
    // (room for the goal card and her line before the first silk line comes into view, for a player who runs from the first moment;
    // plain pits and stumps in it, which carry no line: it was 11 s of plain walk)
    rest(R.r(700, 760));
    room(R.r(1350, 1400));
  });
  beat('Learn: the first silk line, over solid ground; then one over a pit', () => {
    firstLine();
    flag();
    rest(R.r(300, 380));
    chain(1, { easy: true });
    rest(R.r(260, 320));
  });
  beat("Develop: Dot's fifth rule and the first sheet; two lines in a row; the Seamstress", () => {
    // (the rule well before the sheet; the sheet's own tip comes as it comes into view, w5Play.ts)
    hint(x + 40, W5_HINTS.s54admire);
    rest(R.r(300, 360), false);
    room(R.r(1400, 1440));
    sheetWalk();
    flag();
    hint(x + 40, W5_HINTS.s54chain);
    room(R.r(800, 900));
    chain(2, { easy: true });
    rest(R.r(360, 440));
    sheetWalk(true);
    flag();
  });
  beat('Twist: three in a row, then the high bridge', () => {
    rest(R.r(240, 300));
    chain(3, { ledge: true });
    rest(R.r(260, 320));
    flag();
    hint(x + 40, W5_HINTS.s54high);
    room(R.r(480, 560));
    highBridge(R.chance(0.5) ? 2 : 3);
    rest(R.r(260, 320));
    flag();
  });
  beat('Finish', () => {
    // (the roll's theme: two of these come back, two more come once; each uses only what this stage has taught)
    const next = deck([
      () => { spiderRun(R.r(540, 620)); chain(R.chance(0.5) ? 2 : 3, { ledge: true }); },
      () => { sheetWalk(); highBridge(R.chance(0.5) ? 2 : 3); },
      () => { chain(3, { ledge: true }); spiderRun(R.r(540, 620)); },
      () => { sheetWalk(); chain(2); },
      // two spiders, a soft pit between
      () => { spiderRun(R.r(540, 600)); hopPit(); spiderRun(R.r(540, 600)); },
      // the high bridge, then a spider beyond it
      () => { highBridge(R.chance(0.5) ? 2 : 3); spiderRun(R.r(540, 600)); },
      // two silk lines over a pit, then a sheet
      () => { chain(2, { easy: true }); sheetWalk(); },
      // stumps, then a long chain
      () => { stump(); stump(); chain(R.chance(0.5) ? 3 : 4, { ledge: true }); },
      // stumps, then the high bridge
      () => { stump(); stump(); highBridge(3); },
      // a spider, then a sheet, then a soft pit
      () => { spiderRun(R.r(540, 600)); rest(R.r(120, 160)); sheetWalk(); hopPit(); },
    ], 2, 2);
    let n = 0;
    while (expert < stageSeconds('5-4') - 6 && n < 30) {
      next();
      if (n % 2 === 1) flag();
      n++;
    }
    // (whatever the theme drew, three sheets at least: Dot's fifth rule is this stage's)
    while (sheets.length < 3) sheetWalk();
    hint(x + 40, W5_HINTS.s54end);
    rest(R.r(480, 560));
    if (expert < stageSeconds('5-4')) rest((stageSeconds('5-4') - expert) * RUN + 60);
  });

  // (no World 5 find is set in 5-4: finds.ts FIND_STAGE_IN; one that ever is goes in plain sight on the last stretch, before the shrine)
  const find = findForStage(config.worldIndex, config.miniIndex);
  if (find) C.push({ id: cid++, type: 'find', findId: find.id, hidden: false, x: r(x - 420), y: G - 34, collected: false, bobPhase: 0 });

  // the shrine, and nothing past it
  const exitX = r(x - 220);
  close();
  C.push({ id: cid++, type: 'exit_totem', x: exitX, y: G - 30, collected: false, bobPhase: 0 });
  const past = (px: number) => px > exitX + PAST_SHRINE;
  for (let i = C.length - 1; i >= 0; i--) if (past(C[i].x)) C.splice(i, 1);
  for (let i = chairs.length - 1; i >= 0; i--) if (past(chairs[i].x)) chairs.splice(i, 1);
  for (let i = decor.length - 1; i >= 0; i--) if (past(decor[i].x)) decor.splice(i, 1);
  info.flagSeconds.push(expert);
  info.sheets = sheets.length;

  const W = Math.ceil(x + 20);
  cid = heartsAtFlags(C, checkpoints, cid, W5_HEART_UP);
  const movedPickups = fixPickups({ platforms: P, vines: V, ropes: [] }, C);
  const cfg: LevelConfig = { ...config, levelWidth: W, levelHeight: Math.max(config.levelHeight, 900) };
  const w5: W5Extras = { mood: 'dusk', petals: true, chairs, sheets, seamstresses, spiders, decor };
  return {
    config: cfg,
    trees: [],
    platforms: P,
    vines: V,
    ropes: [],
    enemies: E,
    boss: null,
    collectibles: C,
    spawnX: 140,
    spawnY: G,
    exitTotemX: exitX,
    exitTotemY: G,
    checkpoints: checkpoints.sort((a, b) => a.x - b.x),
    zones: [],
    meta: { attempt: seed, chunks: [], width: W, timing: { layoutSeconds: expert, decorSeconds: 0, route: W } },
    proto: { hints: hints.sort((a, b) => a.x - b.x), covers, beats, movedPickups, w5 },
    w54info: info,
  };
}
