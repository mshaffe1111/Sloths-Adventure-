/**
 * gen2/chaseTip — the branch's TIP and the still fork's ground, for any chase stage by data (1-8 NEW 7 and 8; R-165.198). Lifted from the
 * dev fixture (chaseFixtureStage.ts layFixturePieces, ENG-B6) by ENG-CL (6), so 1-8 and the fixture lay them with ONE rule.
 *
 * layTip: the last stretch made the branch's tip (chase.ts ChaseStretch.tip: as he leaves it, the whole of the stretch still standing
 * breaks off and falls at once, pieces/chasePiece.ts), with a gap off its end and a liana (phased to a runner where the look says, Vine.runner,
 * eased by pieces/runnerLianaPiece.ts) to the far tree's branch beyond it, laid at the tip's height. Flags in the gap stand on the far branch;
 * pickups and dressing over the gap, creatures in it and hazards on the run to the lip are left out.
 *
 * readyStillFork: the ground of fork `fork` (the living ground after stretch `fork`, any of them but the last) made ready for
 * gen2/stillFork.ts layStillFork: bare rocks and steps standing in its cover and post cleared (never one carrying dressing or a creature:
 * D16), and its flag moved past the post, nearer the next crack, never further from it than the span allows.
 *
 * Each returns what is wrong in words; nothing is laid unless the list is empty. Pure (no canvas, no engine, no stage ids).
 */
import type { ChaseLay } from '../chase.ts';
import type { RollSpec } from '../rolling.ts';
import { lianaProblems, runnerProblems } from '../runnerLiana.ts';
import type { Platform, Vine } from '../types.ts';
import { carries } from './rollLay.ts';
import { STILL_FORK, type StillForkLook } from './stillFork.ts';

/** what a world lays its branch's tip with (World 1: w1Cast.ts W1_TIP) */
export interface TipLook {
  /** the gap off the tip (px) */
  gap: number;
  /** the far tree's branch laid past the gap at the tip's height (px long, more than 0) */
  land: number;
  /** the liana in the gap: `out` px from the lip, its top `up` px over the branch, its foot `foot` px under it; its sway; `runner`: phased
   *  to a runner (Vine.runner: the lip needs runnerLiana.ts RUNNER.from px of level run), else a plain liana he may wait for */
  liana: { out: number; up: number; foot: number; swaySpeed: number; runner: boolean };
}

/** what the lays read and write of a stage */
export interface TipStage {
  chase?: ChaseLay;
  platforms: Platform[];
  vines?: Vine[];
  checkpoints?: Array<{ x: number; y?: number }>;
  collectibles?: Array<{ x: number }>;
  rolling?: RollSpec[];
  proto?: unknown;
  enemies?: Array<{ x: number }>;
}

/** the tip's run-in: hazards landing this far before the lip (px), or within `after` past the far branch's start, are left out */
const TIP_CLEAR = { before: 900, after: 300 } as const;

/** lay the tip on the stage's last stretch (see the head) */
export function layTip(st: TipStage, look: TipLook): string[] {
  const lay = st.chase;
  if (!lay?.stretches.length) return ['tip: no chase laid'];
  if (!(look.land > 0)) return [`tip: the far branch must be longer than 0 px (look.land ${look.land})`];
  const last = lay.stretches[lay.stretches.length - 1];
  const lip = st.platforms.filter((p) => p.chase && Math.abs(p.x + p.width - last.end) < 2).sort((a, b) => a.y - b.y)[0];
  if (!lip) return ['tip: the last stretch ends on no section'];
  const g0 = last.end, g1 = last.end + look.gap, g2 = g1 + look.land;
  // (the far side: the far tree's branch, look.land long, at the tip's height; the ground from the gap to its far end is cut, the ground
  // past it is the stage's own)
  const cut: Platform[] = [];
  for (const p of st.platforms) {
    if (p.x + p.width <= g0 || p.x >= g2) { cut.push(p); continue; }
    if (p.x + p.width > g2) cut.push({ ...p, x: g2, width: p.x + p.width - g2 });
  }
  // (it marks the fall beside it, pit 'drop': the tip's gap is a marked fall, never an unmarked one (ENG-LOOK2), and on a bough stage its
  // end there is the far tree's living branch, never torn, protoArt.ts boughEnds)
  cut.push({ id: st.platforms.reduce((m, q) => Math.max(m, q.id), 0) + 1, x: g1, y: lip.y, width: look.land, height: 400, type: 'solid', pit: 'drop' } as Platform);
  const L = look.liana;
  const v: Vine = { id: (st.vines ?? []).reduce((m, q) => Math.max(m, q.id), 0) + 1, x: g0 + L.out, topY: lip.y - L.up, bottomY: lip.y + L.foot, swaySpeed: L.swaySpeed, swayPhase: 0, vineType: 'swing_liana', isSwingingVine: true, ...(L.runner ? { runner: true } : {}) };
  // (every line counts: the fixture once filtered out "px of run to its lip", which hid runnerLip's stair-step bug, ENG-CL (8))
  const why = L.runner ? runnerProblems(v, cut) : lianaProblems(v, cut);
  if (why.length) return why.map((m) => `tip: ${m}`);
  st.platforms = cut;
  st.vines = [...(st.vines ?? []), v];
  last.tip = true;
  const inGap = (x: number) => x > g0 - 20 && x < g2;
  // (a flag in the gap stands on the far ground; pickups and dressing over it and hazards on the run to the lip are left out)
  // (and at the far branch's top: a flag that kept its old height stood off it, unreachable, ENG-LOOK 1b)
  for (const c of st.checkpoints ?? []) if (inGap(c.x)) Object.assign(c, { x: g1 + 120, y: lip.y });
  st.collectibles = (st.collectibles ?? []).filter((c) => !inGap(c.x));
  if (st.rolling) st.rolling = st.rolling.filter((h) => h.dropX < g0 - TIP_CLEAR.before || h.dropX > g1 + TIP_CLEAR.after);
  const pr = st.proto as Record<string, Array<{ x: number }> | undefined> | undefined;
  for (const k of ['dress', 'decor', 'w3decor', 'kitDecor']) if (pr?.[k]) pr[k] = pr[k]!.filter((q) => !inGap(q.x));
  st.enemies = (st.enemies ?? []).filter((e) => !inGap(e.x));
  return [];
}

/** make fork `fork`'s ground ready for layStillFork (see the head); `look` is the world's still fork (its cover's width) */
export function readyStillFork(st: TipStage, fork: number, look: Pick<StillForkLook, 'cover'>): string[] {
  const lay = st.chase;
  const s = lay?.stretches[fork], next = lay?.stretches[fork + 1];
  if (!s || !next) return [`still fork ${fork}: no stretch after it (nothing would crack when he leaves)`];
  const gy = st.platforms.filter((p) => p.type === 'solid' && s.end + 1 >= p.x && s.end + 1 <= p.x + p.width).sort((a, b) => b.y - a.y)[0]?.y;
  if (gy === undefined) return [`still fork ${fork}: no ground where the collapse stops (${s.end})`];
  const x0 = s.end, x1 = s.end + STILL_FORK.runIn + look.cover.w + STILL_FORK.postPast + 60;
  st.platforms = st.platforms.filter((p) => !(p.type === 'solid' && p.y < gy - 2 && p.y + p.height >= gy - 2 && p.x + p.width > x0 && p.x < x1 && !carries(st, p)));
  // (the fork's flag, where the post must stand to share an upright screen with him in the cover, stands past it: nearer the next crack,
  // as chaseLay's own rule wants it, never further from it than the span allows)
  // (and it stands on what is there: the solid top under its new x nearest its old height, INT-10c, the pair of layTip's flag)
  for (const c of st.checkpoints ?? []) {
    if (!(c.x > x0 && c.x < x1 + STILL_FORK.flagClear)) continue;
    c.x = Math.min(x1 + STILL_FORK.flagClear, next.start - 40);
    const y0 = c.y;
    if (y0 === undefined) continue;
    const under = st.platforms.filter((p) => p.type === 'solid' && p.x <= c.x && c.x <= p.x + p.width).sort((a, b) => Math.abs(a.y - y0) - Math.abs(b.y - y0))[0];
    if (under) c.y = under.y;
  }
  return [];
}
