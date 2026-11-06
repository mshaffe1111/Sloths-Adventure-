/**
 * Variety inside the nodes (STAGE-RULES §0c, Matt 2026-11-04) and between neighbours on tempo and map shape (the lead, 2026-11-04).
 *   - §0c rule 2: no template twice in a row, none more than twice in a stage; rule 3: a repeat must change something you feel (the same
 *     template with the same numbers twice is rejected).
 *   - A stage built on the music's beat (w1Rhythm.ts, proto.rhythm) carries its BPM and its nodes, each with its tag, mechanic pair and
 *     bars (beatTrace.ts: 8 eighth-note slots, 'x' a take-off on the beat, 'o' off the beat, 'h' a half-note). Its beat feel is the share
 *     of each; a stage that plays at the BPM and feel of the one before it plays like it.
 *   - The map's shape: the route's height across the stage, in 12 parts, and which way it runs. A stage whose shape matches the one
 *     before it (the same climbs and drops in the same places) is the same walk.
 * Pure on the built stage (core.ts build).
 */
import type { Built } from './core.ts';
import { cosine } from './core.ts';

type Eng = Record<string, any>;

/** one unit of a stage, as the builder laid it: its template, and the numbers it was laid with ('' when the builder does not say) */
export interface Unit { template: string; params: string; x0: number; x1: number }

/**
 * a stage's units: the beat-built stage's nodes (tag and mechanic pair; numbers: the bars, the direction, the density), else the builder's
 * pieces (meta.pieces; numbers: the piece's length to 10 px, all the old pieces tell). Rests are the pauses between units, not templates.
 */
export function unitsOf(stage: Eng): Unit[] {
  const nodes = stage.proto?.rhythm?.nodes as Eng[] | undefined;
  if (nodes?.length) {
    return nodes.filter((n) => n.tag !== 'rest' && n.tag !== 'R').map((n) => ({
      template: `${n.tag} ${n.pair}`,
      params: `${(n.bars ?? []).join('|')} dir ${n.dir} tier ${n.tier}`,
      x0: n.x0,
      x1: n.x1,
    }));
  }
  const pieces = (stage.meta?.pieces ?? []) as Array<{ k: string; x0: number; x1: number }>;
  return pieces.filter((p) => p.k !== 'rest').map((p) => ({ template: p.k, params: `${Math.round((p.x1 - p.x0) / 10) * 10} px`, x0: p.x0, x1: p.x1 }));
}

export interface TemplateFlag { what: string; x: number }
/** §0c rules 2-3 on a stage's units */
export function templateFlags(units: readonly Unit[]): TemplateFlag[] {
  const out: TemplateFlag[] = [];
  for (let i = 1; i < units.length; i++) {
    if (units[i].template === units[i - 1].template) out.push({ what: `the "${units[i].template}" template twice in a row (§0c.2)`, x: Math.round(units[i].x0) });
  }
  const by = new Map<string, Unit[]>();
  for (const u of units) by.set(u.template, [...(by.get(u.template) ?? []), u]);
  for (const [k, us] of by) {
    if (us.length > 2) out.push({ what: `the "${k}" template ${us.length} times in the stage (§0c.2: at most twice)`, x: Math.round(us[2].x0) });
    const seen = new Set<string>();
    for (const u of us) {
      const key = u.params;
      if (seen.has(key)) {
        out.push({ what: `the "${k}" template again with the same numbers (${key}): nothing you feel changed (§0c.3)`, x: Math.round(u.x0) });
        break;
      }
      seen.add(key);
    }
  }
  return out;
}

/** a beat-built stage's BPM and beat feel (the share of take-offs on the beat, off it and on a half-note), or null for any other stage */
export function rhythmOf(stage: Eng): { bpm: number; feel: Map<string, number> } | null {
  const r = stage.proto?.rhythm as { bpm: number; nodes: Eng[] } | undefined;
  if (!r || !r.bpm) return null;
  const feel = new Map<string, number>([['x', 0], ['o', 0], ['h', 0]]);
  for (const n of r.nodes ?? []) for (const bar of (n.bars ?? []) as string[]) for (const c of bar) if (feel.has(c)) feel.set(c, feel.get(c)! + 1);
  return { bpm: r.bpm, feel };
}

/** stages within this many BPM, with beat feels this alike, play at the same tempo */
export const BPM_NEAR = 4;
export const FEEL_ALIKE = 0.9;
export function tempoAlike(a: ReturnType<typeof rhythmOf>, b: ReturnType<typeof rhythmOf>): boolean {
  if (!a || !b) return false;
  return Math.abs(a.bpm - b.bpm) <= BPM_NEAR && cosine(a.feel, b.feel) >= FEEL_ALIKE;
}

/** the map's shape: the route's height (up is +, from its start) in 12 equal parts of its length, and its net direction */
export const SHAPE_PARTS = 12;
export function shapeOf(b: Pick<Built, 'samples'>): number[] {
  const s = b.samples;
  if (s.length < 2) return [];
  const x0 = Math.min(...s.map((q) => q.x)), x1 = Math.max(...s.map((q) => q.x));
  const y0 = s[0].y;
  const out: number[] = [];
  for (let i = 0; i < SHAPE_PARTS; i++) {
    const a = x0 + ((x1 - x0) * i) / SHAPE_PARTS, c = x0 + ((x1 - x0) * (i + 1)) / SHAPE_PARTS;
    const inside = s.filter((q) => q.x >= a && q.x <= c);
    out.push(inside.length ? y0 - inside.reduce((m, q) => m + q.y, 0) / inside.length : out[out.length - 1] ?? 0);
  }
  return out;
}

/**
 * how alike two map shapes are (0-1): 1 less the mean height difference over the parts, against 300 px (a stage's climbs run 0-900 px).
 * Two flat walks are alike; a climb against a flat walk is not.
 */
export const SHAPE_SCALE = 300;
export function shapeAlike(a: readonly number[], b: readonly number[]): number {
  if (!a.length || a.length !== b.length) return 0;
  const d = a.reduce((m, v, i) => m + Math.abs(v - b[i]), 0) / a.length;
  return Math.max(0, 1 - d / SHAPE_SCALE);
}
/** a stage whose map shape is this alike to the one before it is the same walk */
export const SHAPE_ALIKE_MAX = 0.85;
