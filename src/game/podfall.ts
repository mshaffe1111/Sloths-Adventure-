/**
 * podfall — falling pods (1-4.md engine piece 3: "4-1's rockfall down a column, a tell, the cost by data"), the first hazard on the
 * stage beat (beat.ts). A ripe pod hangs under a bough over a column of a vine field. Its beat's 'warn' is the tell: it creaks and its
 * fluff trickles down the column (1.0 s on Normal, 1.5 s on Easy by the beat's stretch: 1-4.md "Pods fair"); on 'on' it lets go, drops
 * down the column at the rockfall's speed and bursts on the wood under it; through 'off' a new one swells. A pod is dodged SIDEWAYS: a
 * step to a vine out of its column. On two hands he spans two columns, so a pod down either finds him (1-4.md: "the fast way is the
 * exposed way"). Columns on one beat keep in step; each column's `shift` staggers it (half a beat apart, say).
 *
 * What a pod costs is the piece's own data (`cost`): 'knock' knocks him off his vine to the catch bough under him; 'heart' does that and
 * costs a heart (Normal; Easy's pods only knock, 1-4.md "Easy ... no hearts lost to pods"). Nothing he does harms a pod.
 *
 * Pure (no canvas, no engine, no stage ids): the stage builder, the engine (fieldPlay.ts) and the tests agree on every pod.
 */
import { ROCK } from './rockfall.ts';
import type { ClockRead } from './clock.ts';
import type { ClockDef } from './stageKit.types.ts';
import type { Platform, Vine } from './types.ts';
import { beatDef, beatFaults, type OnBeat } from './beat.ts';
import { beatOf } from './clock.ts';

/** what a pod costs him when it finds him */
export type PodCost = 'knock' | 'heart';

/** a column a pod falls down, on a stage beat (its `clock` and `shift`) */
export interface PodColumn extends OnBeat {
  id: number;
  /** the field vine whose column it falls down (its x is the vine's), if it is over one */
  vine?: number;
  x: number;
  /** where its bottom hangs (it lets go from here), and the wood it bursts on (y) */
  top: number;
  land: number;
  cost: PodCost;
  /** how fast it falls (px/s): the stage's own number (1-4: w1Arc14.ts PODS_14), else POD.speed */
  speed?: number;
}

export const POD = {
  /** how fast it falls (px/s): the rockfall's steady drop (rockfall.ts ROCK.speed), a fall you can read */
  speed: ROCK.speed,
  /** how long the burst shows on the wood (s) */
  burst: 0.5,
  /** its body, for hitting him (px): a kapok pod about a quarter of his drawn height long (89.1, heroSprite.ts; LESSONS D41) */
  radius: 14,
  /** how far either side of a hand's line a pod finds him (px): his arms and head on the vine, never the vine beside it (70-90 px away) */
  hands: 26,
  /** how far either side of his middle it finds him off a vine (px): rockfall's 22 + 14, the same body */
  body: ROCK.radius + 14,
  /** the tell's least length (s): Matt 11-14 (R-165.227, "let us know that there's about to have something drop"): the mock he saw
   *  warned 1.5 s, and no pod may warn less (was 1-4.md's 1.0 s) */
  tellMin: 1.5,
  /** no two tells he can see start within this long of each other (s): World 1 is one thing at a time (1-4.md "Rules") */
  apart: 1.5,
  /** how far apart two columns may be and still both be in his view (px): an upright phone's 440 px across, a little over */
  seen: 480,
  /** the farthest sound wood may be under any point of a column (px): STAGE-RULES §2 "Falls in climbs" */
  catchBelow: 450,
} as const;

export type PodPhase = 'idle' | 'warn' | 'fall' | 'burst' | 'gone';
export interface PodState {
  phase: PodPhase;
  /** 0..1 through the phase (idle: through the beat's quiet, as a new pod swells) */
  u: number;
  /** its bottom's height (px) */
  y: number;
  /** which beat it is on (a hit counts once a beat) */
  cycle: number;
}

/** the seconds a pod takes to fall its column */
export const fallSeconds = (p: Pick<PodColumn, 'top' | 'land' | 'speed'>): number => Math.max(0.01, (p.land - p.top) / (p.speed ?? POD.speed));

/** the 'on' a pod's beat needs to fall a column `len` px and burst (s), with a breath to spare */
export const podOn = (len: number, speed: number = POD.speed): number => Math.ceil(((Math.max(0, len) / speed) + POD.burst + 0.1) * 10) / 10;

/** a pods' beat: one every `period` s, a `tell`-s tell, long enough 'on' for its longest column (`len` px); Easy times `easyStretch` */
export const podBeat = (id: string, period: number, tell: number, len: number, easyStretch: number, offset = 0, speed: number = POD.speed): ClockDef =>
  beatDef(id, period, tell, podOn(len, speed), easyStretch, offset);

/** what a pod is doing, from its beat's read (StageClock.read(p.clock, p.shift)) */
export function podAt(p: PodColumn, r: Pick<ClockRead, 'phase' | 'u' | 'into' | 'cycle'>): PodState {
  if (r.phase === 'warn') return { phase: 'warn', u: r.u, y: p.top, cycle: r.cycle };
  if (r.phase === 'on') {
    const fallT = fallSeconds(p);
    if (r.into < fallT) return { phase: 'fall', u: r.into / fallT, y: p.top + r.into * (p.speed ?? POD.speed), cycle: r.cycle };
    if (r.into < fallT + POD.burst) return { phase: 'burst', u: (r.into - fallT) / POD.burst, y: p.land, cycle: r.cycle };
    return { phase: 'gone', u: 0, y: p.land, cycle: r.cycle };
  }
  return { phase: 'idle', u: r.phase === 'off' ? r.u : 1, y: p.top, cycle: r.cycle };
}

/**
 * Does a falling pod find him now? `xs`: the lines he occupies (on a vine field, each hand's vine x; off one, his middle), `feetY` his
 * feet, `height` his body. Off a vine the body's width counts (`POD.body`); on vines, only a pod down a column he holds (`POD.hands`).
 */
export function podHits(p: PodColumn, s: PodState, xs: readonly number[], feetY: number, height: number, onVines: boolean): boolean {
  if (s.phase !== 'fall') return false;
  const near = onVines ? POD.hands : POD.body;
  if (!xs.some((x) => Math.abs(x - p.x) < near)) return false;
  return s.y > feetY - height && s.y - POD.radius * 2 < feetY;
}

/**
 * What is wrong with a stage's pods, in words (none: they may be laid). 1-4.md "Rules" and "Pods fair":
 *   - the beats are fair (beat.ts beatFaults): a tell of POD.tellMin or more; two columns he can see at once never start their tells
 *     within POD.apart s; each pod's beat is in the stage;
 *   - each pod's beat leaves it time to fall its column and burst before the beat comes round;
 *   - a pod over a field vine leaves a free vine within that vine's reach (no pod falls down it), so a step aside always dodges it;
 *   - sound wood lies under every vine a pod falls on within POD.catchBelow px of its foot (the knock lands him on it).
 * `reach`: how far a step to a neighbour reaches (vineField.ts FIELD_FEEL.reach). Checked on the setting `easy`.
 */
export function podFaults(pods: readonly PodColumn[], clocks: readonly ClockDef[], vines: readonly Vine[], platforms: readonly Platform[], reach: number, easy = false): string[] {
  const used = clocks.filter((c) => pods.some((p) => p.clock === c.id));
  const out = beatFaults(used, pods.map((p) => ({ clock: p.clock, shift: p.shift, id: `pod ${p.id}`, x: p.x, y0: p.top, y1: p.land })), { tellMin: POD.tellMin, apart: POD.apart, seen: POD.seen }, easy);
  for (const p of pods) {
    const c = clocks.find((q) => q.id === p.clock);
    if (!c) continue;
    const b = beatOf(c, easy);
    let on = 0;
    b.names.forEach((n, i) => { if (n === 'on') on += b.seconds[i]; });
    if (on < fallSeconds(p) + POD.burst - 1e-6) out.push(`pod ${p.id}: its beat's 'on' (${on.toFixed(2)} s) is too short to fall its column and burst`);
  }
  const podded = new Set(pods.map((p) => p.vine).filter((v): v is number => v !== undefined));
  for (const p of pods) {
    if (p.vine === undefined) continue;
    const v = vines.find((q) => q.id === p.vine);
    if (!v) {
      out.push(`pod ${p.id}: its vine ${p.vine} is not in the stage`);
      continue;
    }
    const free = vines.some((q) => q !== v && q.field && !podded.has(q.id) && Math.abs(q.x - v.x) <= reach && q.bottomY > v.topY && q.topY < v.bottomY);
    if (!free) out.push(`pod ${p.id}: no free vine within a step (${reach} px) of vine ${v.id}`);
    const wood = platforms.filter((q) => !q.broken && v.x >= q.x - 4 && v.x <= q.x + q.width + 4 && q.y >= v.bottomY - 4).map((q) => q.y);
    const under = wood.length ? Math.min(...wood) : Infinity;
    if (under - v.bottomY > POD.catchBelow) out.push(`pod ${p.id}: the wood under vine ${v.id}'s foot is ${Number.isFinite(under) ? Math.round(under - v.bottomY) : 'no'} px down (over ${POD.catchBelow})`);
  }
  return out;
}
