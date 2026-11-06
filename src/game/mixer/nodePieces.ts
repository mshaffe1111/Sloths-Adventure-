/**
 * V18 (NODES.md §8.3, §8.0 PIECES; Matt, 11-05: "do certain nodes have certain pieces? Vines have to have vines, lily pads need lily
 * pads"): each realised node's pieces match its content row in the key. Every MUST present, no NEVER. The kinds are the designer's
 * LABELS, as catalog.ts transcribes them (landingKind); "in the air" is E3's own support check (support.ts supportBreaches).
 *
 * The node's x-range and token come from the build (gen2's meta: the planner's parser owns the string); the kinds are read from the
 * built stage itself over that range, so the check judges what is drawn, never what a node claims. Only the content letter is read
 * from a token (its second character, §8.1: `JOB content ...`), never the rest of the grammar.
 *
 * c's "landings that each sit higher than the last" (ruled by the designer, engine-spec 4b7840b27): over the node, the landing tops (left
 * to right) rise on at least two thirds of the steps between neighbours, no step goes down (a level rest landing within 10 px is fine),
 * and the last is above the first; judged up to the summit (the highest landing), so a run-out after it is not part of the stair.
 */
import type { Platform } from '../types.ts';
import { landingKind } from './catalog.ts';
import { supportBreaches } from './support.ts';

export const CONTENT_LETTERS = ['g', 'f', 'c', 'b', 'r', 'k', 'w', 'h'] as const;
export type ContentLetter = (typeof CONTENT_LETTERS)[number];
export interface RealisedNode { token: string; x0: number; x1: number; content?: ContentLetter }
type StageIn = Parameters<typeof supportBreaches>[0] & { vines?: Array<{ x: number; vineType?: string }>; ropes?: Array<{ x0: number; x1: number; y: number }> };

/** the content letter of a token (its second character when it is one), or the node's own field */
export const contentOf = (n: RealisedNode): ContentLetter | undefined => n.content ?? (CONTENT_LETTERS as readonly string[]).find((c) => n.token[1] === c) as ContentLetter | undefined;

/** every V18 breach of a stage's realised nodes: the node, its token and the row's MUST or NEVER it misses */
export function nodePieceBreaches(st: StageIn, world: number, nodes: readonly RealisedNode[], o: { stage?: string; climbOwner?: boolean } = {}): string[] {
  const out: string[] = [];
  const air = supportBreaches(st, world);
  const P = st.platforms.filter((p) => !p.broken);
  nodes.forEach((n, i) => {
    const c = contentOf(n);
    if (!c) return;
    const at = `node ${i + 1} (${n.token}, x ${Math.round(n.x0)}-${Math.round(n.x1)})`;
    const inN = (x0: number, x1: number) => x1 > n.x0 && x0 < n.x1;
    const here = P.filter((p) => inN(p.x, p.x + p.width));
    const kinds = new Set(here.flatMap((p) => landingKind(p as never).map((k) => k.name)));
    const airHere = air.filter((b) => inN(b.x, b.x + b.w));
    const stoneAir = airHere.filter((b) => /stone|ruin|pillar/.test(b.kind));
    const has = (...ks: string[]) => ks.some((k) => kinds.has(k));
    const need = (ok: boolean, what: string) => { if (!ok) out.push(`${at}: MUST ${what}`); };
    const never = (bad: boolean, what: string) => { if (bad) out.push(`${at}: NEVER ${what}`); };
    const water = has('lily pad', 'drift log', 'pool log');
    const vines = (st.vines ?? []).filter((v) => v.x > n.x0 && v.x < n.x1);
    const ropes = (st.ropes ?? []).filter((r) => inN(r.x0, r.x1));
    if (c === 'g') {
      need(here.some((p) => p.style === 'moss_stone' && (p.height ?? 0) > 60), 'the moss floor road under it');
      need(has('mossy stone', 'solid log'), 'a moss_stone, a log on a stump-post, a stump, or a mound or bank');
      never(stoneAir.length > 0, `a rock, stone, mound or bank in the air (${stoneAir.length})`);
      never(water, 'water pieces');
      never(ropes.length > 0 || vines.length > 0, 'a rope or vine as the way across');
    } else if (c === 'f') {
      need(has('solid log', 'bough', 'rope bridge'), 'a floating platform: a solid log, a bough or canopy_bridge planks');
      never(stoneAir.length > 0, `a floating rock or stone (${stoneAir.length})`);
      never(world === 1 && has('moving platform'), 'a lift in World 1');
    } else if (c === 'c') {
      // (judged up to the summit, the highest landing: the run-out after it is not the stair (the designer, 11-05, on #40 b))
      const all = here.filter((p) => p.type !== 'bouncy').sort((a, b) => a.x - b.x).map((p) => p.y);
      const tops = all.slice(0, all.indexOf(Math.min(...all)) + 1);
      const steps = tops.slice(1).map((y, j) => tops[j] - y);
      need(tops.length >= 3 && steps.filter((d) => d > 10).length >= (2 / 3) * steps.length && steps.every((d) => d >= -10) && tops[0] > tops[tops.length - 1], 'landings that each sit higher than the last (no step down)');
      never(!o.climbOwner && vines.some((v) => v.vineType === 'tree_climb'), 'a vine climb (tree_climb) outside the stage that owns it');
    } else if (c === 'b') {
      need(has('bounce mushroom') && !airHere.some((b) => b.kind === 'bounce mushroom'), 'a mushroom seated on the floor, a bank, a stump or a log');
      never(airHere.some((b) => b.kind === 'bounce mushroom'), 'a mushroom in the air');
      // (what is drawn: a bouncy piece is World 1's mushroom whatever its style (terrain.ts drawBounce by world); a breaking stone is not)
      never(world === 1 && (has('springy limb') || here.some((p) => p.type === 'fragile' && p.style === 'moss_stone')), 'a bouncy branch or stone in World 1');
    } else if (c === 'r') {
      never(o.stage === '1-1', 'a rope or vine node in 1-1 (not: ropes)');
      need(ropes.length > 0 || vines.length > 0, 'a rope with two anchors, a liana or a climb vine');
    } else if (c === 'k') {
      need(here.some((p) => p.type === 'fragile' && p.style === 'branch'), 'a creaky branch');
      never(world === 1 && has('crumbling floor'), 'the crumbling stone floor in World 1');
    } else if (c === 'w') {
      need(water || (st.proto?.water ?? []).some((z) => inN(z.x0, z.x1)), 'a drawn water zone with pads, bed stones or drift logs');
      never(airHere.some((b) => b.why.startsWith('a water piece off')), 'pads, reeds or drift logs off water');
    }
  });
  return out;
}

/**
 * V19 (NODES.md §8.3, the supervisor's round 5; 1-1.md:23 "up in the high branches... pointed north"): a stage whose trend is up never
 * loses height late. A descent node (job D) in the last third must be followed, before the exit (E), by nodes that leave him HIGHER
 * than where the descent began, and a D is never the node straight before E. Heights are the route's: the highest landing over x (the
 * high road where there are two). Only the token's job letter is read.
 */
export function v19Breaches(st: { platforms: Platform[] }, nodes: readonly RealisedNode[], trend: 'up' | 'down' | 'level'): string[] {
  if (trend !== 'up' || !nodes.length) return [];
  const P = st.platforms.filter((p) => !p.broken && p.type !== 'bouncy');
  const heightAt = (x: number) => Math.min(...P.filter((p) => p.x <= x + 40 && p.x + p.width >= x - 40).map((p) => p.y));
  const end = nodes[nodes.length - 1].x1, start = nodes[0].x0;
  const exitAt = nodes.find((n) => n.token[0] === 'E')?.x0 ?? end;
  const out: string[] = [];
  nodes.forEach((n, i) => {
    if (n.token[0] !== 'D' || n.x0 < start + ((end - start) * 2) / 3) return;
    if (nodes[i + 1]?.token[0] === 'E') out.push(`V19 at node ${i + 1} (${n.token}): a late descent straight before the exit`);
    const from = heightAt(n.x0), then = heightAt(exitAt);
    if (!(then < from)) out.push(`V19 at node ${i + 1} (${n.token}): the exit (y ${Math.round(then)}) is not above where the late descent began (y ${Math.round(from)})`);
  });
  return out;
}
