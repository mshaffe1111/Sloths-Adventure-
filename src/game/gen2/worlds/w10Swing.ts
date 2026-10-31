/**
 * gen2/worlds/w10Swing — World 10's swings across the fortress (DESIGN.md B11, B12 step 2): chains off the iron netting, the walls' torn
 * banners and the storm ropes (reference/STORY-REWRITE.md "World 10: Stormy Highlands Fortress": "Iron thorns,
 * floor to cloud, humming faintly in the wind"; stagePlan 10-6 "The Iron Netting: Swing along the iron netting").
 *
 * Every swing here is the engine's one liana (physics.ts, World 6's vine-fix: it swings by itself, up and down climb, left and right only
 * turn him, letting go is the only choice): the look changes (W10_LIANA_LOOK, drawn by w10SwingArt.ts), the swing never does, so every
 * window the core measures (pipeline lianaBand, physics.ts pressWindow: Normal 167 ms, Easy 300 ms) is the window he gets.
 *
 * The rules every section here keeps (STAGE-RULES §6 "World 6 on gen2", and Worlds 7 and 8's swing builders):
 *   - a liana hangs past a ledge's end and the gap under it is the world's own fall (w10.ts `pit`): a soft pit climbs back to the swing's
 *     ledge (pipeline backPit), never on to the perch, so the swing is the only way on (no floor to walk under it);
 *   - a perch lies past every jump and the leaf glide and sits about 80 px over the swing's ledge (RAISE), stepping back down after it;
 *   - a perch in front of a lower piece is 200 px or more: levelCheck's jump links pass through walls, so from the pit's floor under a swing
 *     it "jumps" through a narrow perch onto the piece behind it, and the swing reads as optional (World 8, 2026-10-29);
 *   - chains keep a rampart perch between every two swings (levelCheck follows ledge -> liana -> ledge, never liana to liana);
 *   - a hop over the fall is a third of a jump or so, never a lower stone, never a second-jump gap;
 *   - sections are 600-1700 px, plus 370 px a liana (w10Swing.test.ts); a liana section is never mirrored;
 *   - no climbing vine (World 10's climbs are its ascents'), so no vine ever stands on a ledge's face;
 *   - nothing here crumbles, and no animal stands on a knee flat (JUMP_CLEAR: the pipeline drops one there).
 *
 * World 10 is the climb Pokey makes alone (Dot goes ahead along the netting in the world's first scene: wayside.ts dotPresent). The swing
 * is a move he has had since World 4, so no section here teaches it and none says a line.
 *
 * Which stages: 10-6 The Iron Netting (a vine runner: every section here), and as heavy beats among the ground, 10-7 The Walls (purge) and, in its finale, 10-9 The Fortress Gate (a gauntlet: the two guarded swings and the chain pair only) (W10S_STAGES; the chain runs and the three-swing chain only in 10-6, W10S_ONLY, so no two stages of the world
 * share a 20 s stretch; 10-3 Thunder takes none: its storm-watched stretches need the room, w10.test.ts: STAGE-RULES §2 "Sameness"). The main World 10 builder (gen2-w10) folds them in with withW10Swing.
 */
import type { Difficulty, SectionPiece, SectionTemplate, Socket, WorldKit } from '../types.ts';

// ───────────────────────────── the stages, the tags ─────────────────────────────

/** the stages these sections go to (w10Game.ts folds them in with withW10Swing) */
export const W10S_STAGES: readonly number[] = [6, 7, 9];
/** sections only one stage takes (the rest go to every stage of W10S_STAGES): the long chains are the Iron Netting's own */
export const W10S_ONLY: Record<string, number[]> = {
  'w10s-chain-run': [6],
  'w10s-storm-ropes': [6],
  'w10s-guard-pair': [6, 7, 9],
  'w10s-chain-pair': [6, 7, 9],
  'w10s-guard-wall': [6, 7, 9],
};
/** 10-9 The Fortress Gate (a gauntlet) takes only these, its finale's swings over the gate's chasm (the rest stay out of it) */
const GATE_SWINGS = new Set(['w10s-guard-pair', 'w10s-chain-pair', 'w10s-guard-wall']);
/**
 * The animals a swing section's sockets may hold, by the world's creature tags (w10.ts W10_TAG once the main builder's kit is in: the
 * fortress's guards on the walls). Until then the stand-in kit's tags (w10SwingHarness.ts) are World 6's: 'hunter' (prowlers), 'quick'.
 */
export const W10S_FOES = { guard: ['hunter', 'guard'], small: ['quick', 'hunter', 'guard'] } as const;
/** the world's scenery tag (a crate stack, a brazier, a weapon rack: w10.ts props) */
export const W10S_SCENERY = 'scenery';

/**
 * How each swing looks (w10SwingArt.ts): a chain off the netting (the kit's own), a torn banner,
 * a storm rope. Per section, per liana (in the order they hang, left to right): the looks it may take; the roll picks one by where it
 * hangs (w10SwingLooks), so a retry keeps the look and a fresh roll may change it.
 */
export type W10LianaLook = 'chain' | 'banner' | 'rope';
export const W10_LIANA_LOOK: Record<string, readonly (readonly W10LianaLook[])[]> = {
  'w10s-first-chain': [['chain']],
  'w10s-chain-pair': [['chain', 'banner'], ['chain', 'rope']],
  'w10s-chain-run': [['chain'], ['banner'], ['chain', 'rope']],
  'w10s-banner-stair': [['banner']],
  'w10s-guard-wall': [['chain', 'banner']],
  'w10s-swing-crenels': [['chain', 'rope', 'banner']],
  'w10s-storm-ropes': [['rope'], ['rope']],
  'w10s-tower-gap': [['chain', 'banner']],
  'w10s-guard-pair': [['chain', 'rope'], ['banner', 'chain']],
};

// ───────────────────────────── helpers ─────────────────────────────

type W = SectionPiece['w'];
type Opt = Partial<Socket>;
const petals = (id: string, on: string, t: Socket['t'], count = 2, span = 120): Socket => ({ id, role: 'pickup', on, t, dn: 34, count, span });
const foe = (id: string, on: string, t: Socket['t'], kinds: readonly string[], max: number, o: Opt = {}): Socket => ({ id, role: 'enemy', on, t, allow: [...kinds], maxThreat: max, easy: 'soften', ...o });
const scenery = (id: string, on: string, t: Socket['t'], chance = 0.6): Socket => ({ id, role: 'prop', on, t, allow: [W10S_SCENERY], chance });
/** a flag's spot on a section's last perch (each section has one: the pipeline's fallback, 80 px short of the section's end, can stand
 *  at the next section's chasm, w10.test.ts) */
const flag = (on: string, t: Socket['t']): Socket => ({ id: 'flag', role: 'flag', on, t });

const bank = (key: string, w: W, place: SectionPiece['place'] = { kind: 'start' }, o: Partial<SectionPiece> = {}): SectionPiece => ({ key, shape: 'bank', w, place, ...o });
/** a rampart step up `dy` px (one plain hop), or down */
const up = (key: string, after: string, dy: number, w: W): SectionPiece => bank(key, w, { kind: 'walk', after, dy: -dy });
const down = (key: string, after: string, dy: number, w: W): SectionPiece => bank(key, w, { kind: 'walk', after, dy });
/** a hop over a gap in the wall walk: a third of a jump or so, soft (a run of hops over World 10's deep chasms is a glide trap: w10.test.ts) */
const hop = (key: string, after: string, w: W, share: W = [0.3, 0.42]): SectionPiece => bank(key, w, { kind: 'pit', after, jump: 'jump', share, soft: true }, { landing: true });
/** a swing past `after`'s end, its anchor 400-420 px up (a longer one throws him further: its perch can lie past the glide) */
const liana = (key: string, after: string): SectionPiece => ({ key, shape: 'liana', w: 0, place: { kind: 'swing', after, top: [400, 420] } });
/** how far a perch sits above its swing's ledge (STAGE-RULES §6: a level perch past the glide is out of the calm swing's reach) */
export const RAISE = -80;
/** the perch past a swing, a landing (Easy widens it); the gap under it is the world's fall */
const perch = (key: string, after: string, w: W, dy: W = RAISE): SectionPiece => bank(key, w, { kind: 'land', after, dy }, { landing: true });

const LIVE: SectionTemplate['phases'] = ['sho', 'ten', 'ketsu'];

/** a swing section: ground ports at both ends, never mirrored (a liana's perch is sized left to right) */
const swingSection = (s: Omit<SectionTemplate, 'entry' | 'exit' | 'exitDy' | 'archetypes' | 'mirrorable'> & { first: string; last: string }): SectionTemplate => {
  const { first, last, ...rest } = s;
  return { archetypes: 'any', ...rest, entry: { piece: first, kind: 'ground' }, exit: { piece: last, kind: 'ground' }, exitDy: 0, mirrorable: false };
};

// ───────────────────────────── one swing at a time ─────────────────────────────

/** one chain off the netting, rampart to rampart, a merlon past it (a stage's first swing: a wide perch to land on) */
const firstChain = swingSection({
  id: 'w10s-first-chain',
  name: 'one chain over the drop',
  phases: ['ki', 'sho'],
  difficulty: 3,
  weight: 2,
  pieces: [bank('a', [220, 260]), liana('l1', 'a'), perch('b', 'l1', [260, 300]), up('k', 'b', 40, [120, 150]), down('c', 'k', 40 - RAISE, [200, 240])],
  first: 'a',
  last: 'c',
  sockets: [petals('a', 'a', 0.35, 2, 80), petals('b', 'b', 0.4, 2, 80), petals('k', 'k', 0.5, 1), scenery('crates', 'c', [0.55, 0.8], 0.5), flag('b', 0.6)],
});

/** up the battlement stair, a torn banner off its top step, down the far side */
const bannerStair = swingSection({
  id: 'w10s-banner-stair',
  name: 'up the stair, a banner off the top',
  phases: ['sho', 'ten'],
  difficulty: 5,
  weight: 2,
  pieces: [
    bank('a', [150, 180]),
    up('s1', 'a', 50, [110, 140]),
    up('s2', 's1', 50, [140, 170]),
    liana('l1', 's2'),
    perch('b', 'l1', [220, 250]),
    down('b2', 'b', 50 - RAISE, [120, 140]),
    up('k', 'b2', 40, [90, 110]),
    down('c', 'k', 90, [190, 230]),
  ],
  first: 'a',
  last: 'c',
  sockets: [petals('s1', 's1', 0.5, 1), petals('s2', 's2', 0.4, 1), petals('b', 'b', 0.5, 2, 80), foe('foe', 'c', [0.6, 0.85], W10S_FOES.small, 2.5, { phases: ['ten'], chance: 0.5 }), flag('b', 0.6)],
});

/** a swing onto a wall walk where a guard keeps watch: land, then deal with him */
const guardWall = swingSection({
  id: 'w10s-guard-wall',
  name: 'swing onto the guarded wall',
  phases: ['ten', 'ketsu'],
  difficulty: 6,
  weight: 2,
  pieces: [bank('a', [190, 230]), liana('l1', 'a'), perch('b', 'l1', [470, 540]), hop('c', 'b', [170, 200]), down('d', 'c', -RAISE, [170, 210])],
  first: 'a',
  last: 'd',
  sockets: [petals('b', 'b', 0.2, 2, 80), foe('foe', 'b', [0.55, 0.75], W10S_FOES.guard, 3), petals('c', 'c', 0.5, 1), scenery('rack', 'd', [0.5, 0.8], 0.5), flag('b', 0.25)],
});

/** a swing, then the crenels at a run (a sprint's rhythm: swing, hop, hop, a knee) */
const swingCrenels = swingSection({
  id: 'w10s-swing-crenels',
  name: 'a swing, then the crenels (run)',
  phases: LIVE,
  difficulty: 5,
  weight: 2,
  pieces: [
    bank('a', [170, 200]),
    liana('l1', 'a'),
    perch('b', 'l1', [210, 240]),
    up('k1', 'b', 45, [100, 130]),
    down('c', 'k1', 45 - RAISE, [120, 150]),
    hop('d', 'c', [140, 170]),
    hop('e', 'd', [140, 160]),
    // (a knee at the end: on Easy, with fewer guards, the run still ends on a hop)
    up('k2', 'e', 40, [90, 100]),
    down('f', 'k2', 40, [180, 210]),
  ],
  first: 'a',
  last: 'f',
  sockets: [petals('b', 'b', 0.5, 1), petals('k1', 'k1', 0.5, 1), petals('d', 'd', 0.5, 1), petals('k2', 'k2', 0.5, 1), foe('foe', 'f', [0.6, 0.85], W10S_FOES.small, 2.5, { chance: 0.5 }), flag('b', 0.6)],
});

/** a tower top, a swing across to the next tower, and down its outer stair in two drops with a knee between */
const towerGap = swingSection({
  id: 'w10s-tower-gap',
  name: 'tower to tower',
  phases: ['sho', 'ten'],
  difficulty: 4,
  weight: 2,
  pieces: [
    bank('a', [200, 240]),
    up('t', 'a', 60, [170, 200]),
    liana('l1', 't'),
    perch('b', 'l1', [230, 270]),
    down('b2', 'b', 60, [120, 140]),
    up('k', 'b2', 40, [90, 110]),
    down('c', 'k', 40 - RAISE, [200, 240]),
  ],
  first: 'a',
  last: 'c',
  sockets: [petals('t', 't', 0.5, 1), petals('b', 'b', 0.4, 2, 80), petals('k', 'k', 0.5, 1), scenery('brazier', 'c', [0.5, 0.8], 0.6), flag('b', 0.6)],
});

// ───────────────────────────── chains of swings ─────────────────────────────

/** two swings with a merlon perch between */
const chainPair = swingSection({
  id: 'w10s-chain-pair',
  name: 'two swings, a merlon between',
  phases: LIVE,
  difficulty: 5,
  weight: 2,
  pieces: [bank('a', [200, 240]), liana('l1', 'a'), perch('p1', 'l1', [210, 240]), down('p1d', 'p1', -RAISE, [140, 170]), liana('l2', 'p1d'), perch('b', 'l2', [220, 260]), down('c', 'b', -RAISE, [200, 240])],
  first: 'a',
  last: 'c',
  sockets: [petals('p1', 'p1', 0.5, 1), petals('b', 'b', 0.4, 2, 90), foe('foe', 'c', [0.6, 0.85], W10S_FOES.small, 2, { phases: ['ten', 'ketsu'], chance: 0.4 }), flag('b', 0.6)],
});

/** three swings along the netting, perches between (the Iron Netting's climax) */
const chainRun = swingSection({
  id: 'w10s-chain-run',
  name: 'three swings along the netting',
  phases: ['ten', 'ketsu'],
  difficulty: 7,
  maxPerStage: 1,
  weight: 2,
  extraSeconds: 2,
  pieces: [
    bank('a', [150, 170]),
    liana('l1', 'a'),
    perch('p1', 'l1', [200, 220]),
    down('p1d', 'p1', -RAISE, [100, 110]),
    liana('l2', 'p1d'),
    perch('p2', 'l2', [200, 220]),
    down('p2d', 'p2', -RAISE, [100, 110]),
    liana('l3', 'p2d'),
    perch('b', 'l3', [200, 220]),
    down('c', 'b', -RAISE, [150, 170]),
  ],
  first: 'a',
  last: 'c',
  sockets: [petals('p1', 'p1', 0.5, 1), petals('p2', 'p2', 0.5, 1), petals('b', 'b', 0.4, 2, 90), flag('b', 0.6)],
});

/** two storm ropes off the netting, a merlon between, then the crenels (the storm's own stretch: the ropes toss, the swing doesn't) */
const stormRopes = swingSection({
  id: 'w10s-storm-ropes',
  name: 'two storm ropes, then the crenels',
  phases: ['ten', 'ketsu'],
  difficulty: 6,
  weight: 2,
  extraSeconds: 1,
  pieces: [
    bank('a', [150, 180]),
    liana('l1', 'a'),
    perch('p1', 'l1', [200, 220]),
    down('p1d', 'p1', -RAISE, [110, 130]),
    liana('l2', 'p1d'),
    perch('b', 'l2', [210, 230]),
    down('c', 'b', -RAISE, [120, 140]),
    hop('d', 'c', [140, 160]),
    up('k', 'd', 40, [90, 100]),
    down('e', 'k', 40, [150, 170]),
  ],
  first: 'a',
  last: 'e',
  sockets: [petals('p1', 'p1', 0.5, 1), petals('b', 'b', 0.4, 2, 80), petals('d', 'd', 0.5, 1), foe('foe', 'e', [0.6, 0.85], W10S_FOES.small, 2.5, { chance: 0.5 }), flag('b', 0.6)],
});

/** a swing, a guarded merlon, a second swing off its far end, down to the wall walk */
const guardPair = swingSection({
  id: 'w10s-guard-pair',
  name: 'a swing, the guard, the second swing',
  phases: ['ten', 'ketsu'],
  difficulty: 7,
  maxPerStage: 1,
  weight: 2,
  extraSeconds: 1,
  pieces: [
    bank('a', [190, 220]),
    liana('l1', 'a'),
    // (long enough for a guard 120 px clear of the landing and the take-off: JUMP_CLEAR)
    perch('p1', 'l1', [440, 500]),
    down('p1d', 'p1', -RAISE, [140, 160]),
    liana('l2', 'p1d'),
    perch('b', 'l2', [220, 260]),
    down('c', 'b', -RAISE, [200, 240]),
  ],
  first: 'a',
  last: 'c',
  sockets: [petals('p1a', 'p1', 0.15, 1), foe('foe', 'p1', [0.5, 0.65], W10S_FOES.guard, 3), petals('b', 'b', 0.4, 2, 80), flag('b', 0.6)],
});

// ───────────────────────────── the set ─────────────────────────────

/** World 10's swing sections */
export const W10_SWING_SECTIONS: readonly SectionTemplate[] = [
  firstChain, bannerStair, guardWall, swingCrenels, towerGap,
  chainPair, chainRun, stormRopes, guardPair,
];

/** does stage `stage` take section `id` (W10S_STAGES, W10S_ONLY) */
export const w10SwingFor = (stage: number, id: string): boolean =>
  W10S_STAGES.includes(stage) && (stage !== 9 || GATE_SWINGS.has(id)) && (!W10S_ONLY[id] || W10S_ONLY[id].includes(stage));

/**
 * World 10's kit for stage `stage` with the swing sections joined, for the stages that take them (W10S_STAGES, W10S_ONLY; none for the
 * rest). The world's own manifest (gen2/worlds/w10.ts) stays as it is: w10Game.ts folds this in.
 */
export function withW10Swing(kit: WorldKit, stage: number, _difficulty: Difficulty = 'normal'): WorldKit {
  if (!W10S_STAGES.includes(stage)) return kit;
  const M = kit.manifest;
  const have = new Set(M.sections.map((s) => s.id));
  const add = W10_SWING_SECTIONS.filter((s) => !have.has(s.id) && w10SwingFor(stage, s.id));
  return { ...kit, manifest: { ...M, sections: [...M.sections, ...add] } };
}

/**
 * Each swing's look on a built stage (w10SwingArt.ts draws it): the lianas of each placed swing section, left to right, take that
 * section's looks (W10_LIANA_LOOK), one picked by where it hangs, so a retry keeps the look and a fresh roll may change it. Any other
 * liana (a section of the main builder's) is a chain. The main builder's finish pass calls it (w10Finish).
 */
export function w10SwingLooks<S extends { vines: Array<{ x: number; vineType?: string; hangLook?: string }>; gen2?: { sections: Array<{ template: string; x0: number; x1: number }> } }>(st: S): S {
  const lianas = st.vines.filter((v) => v.vineType === 'swing_liana').sort((a, b) => a.x - b.x);
  for (const v of lianas) v.hangLook = 'chain';
  for (const s of st.gen2?.sections ?? []) {
    const looks = W10_LIANA_LOOK[s.template];
    if (!looks) continue;
    const mine = lianas.filter((v) => v.x >= s.x0 && v.x <= s.x1);
    mine.forEach((v, i) => {
      const can = looks[Math.min(i, looks.length - 1)];
      v.hangLook = can[Math.abs(Math.round(v.x / 7)) % can.length];
    });
  }
  return st;
}
