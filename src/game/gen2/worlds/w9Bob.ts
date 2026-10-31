/**
 * gen2/worlds/w9Bob — World 9's moving logs (Matt, 2026-10-31: "platforms move up and down... the logs that you run on actually move up and
 * down, and it's a timing"; Worlds 9 and 10 first). GRAB-BAG.md N1-N3 (reference/prop-sheets/qa-notes/w9/):
 *   rafts    (9-1, taught there)  pumice rafts bobbing on the lava's heat draught in a row, out of step: the jump off waits for the top
 *   logs     (9-5, 9-9)           one long charred log, slower and deeper: run it while it is up (9-5's then takes the leaf over a vent)
 *   pistons  (9-8)                a hex column rising out of its well to a ledge no jump reaches: step on at the bottom, ride it up
 * Each is a gen2 `raft` piece (pipeline BOB; lift.ts LiftInfo `bob`): the engine rides it like 2-7's basket lift, levelCheck reaches it at
 * its top and its bottom, the inspector reads a raft or a log as a timed hop (`J|bob-raft`, `J|bob-log`) and a piston as a ride (`V|piston`),
 * and w9BobArt.ts draws Matt's painted pieces. Each theme has its own gate (w9Ground W9_BOB_GATES) and its sections `use` it.
 *
 * Teaching (STAGE-RULES §1): 9-1's first raft is the rafts theme's first section on every rafts roll, over a soft crust floor on every
 * setting, Dot's line on the way in (W9_TIPS raft). The logs ride the same way (taught by 9-1). 9-8's first piston carries its own line.
 */
import type { SectionPiece, SectionTemplate } from '../types.ts';
import { W9_LESSON } from './w9.ts';
import { W9_BOB_GATES, W9_THEME, W9H } from './w9Ground.ts';

const { bank, up, down, petals, geyser, scenery, tip, foe, thread, section, ALL, MID, LIVE, HOT, SMALL, ANY } = W9H;
type W = SectionPiece['w'];

/** a moving log past `after` (pipeline place `raft`): a raft or a log a jump out at its top stop; `soft` keeps the lesson's pit soft */
const bob = (key: string, after: string, kind: 'raft' | 'log', w: W, share: W = [0.55, 0.7], soft = false): SectionPiece =>
  ({ key, shape: 'raft', w, place: { kind: 'raft', after, bob: kind, share, ...(soft ? { soft: true } : {}) }, landing: true });
/** the bank past a row of rafts: a plain jump off the last one at its top (the pit under the row ends here) */
const off = (key: string, after: string, w: W, share: W = [0.55, 0.7], soft = false): SectionPiece =>
  bank(key, w, { kind: 'pit', after, jump: 'jump', share, ...(soft ? { soft: true } : {}) }, { landing: true });
/** a piston column in its well past `after`, rising past every jump to its top stop */
const piston = (key: string, after: string, w: W = [100, 120]): SectionPiece => ({ key, shape: 'raft', w, place: { kind: 'raft', after, bob: 'piston' } });

const RAFT = W9_LESSON.raft;
const PISTON = W9_LESSON.piston;
/** the time model's wait at a moving log: about a third of its cycle (pipeline BOB: ~3 s Normal, ~4.6 s Easy) */
const BOB_WAIT = 1.2;
const PISTON_RIDE = 2.4;

// ───────────────────────────── 9-1: the rafts ─────────────────────────────

/** the first raft (every rafts roll): one raft in a narrow pool, soft under it on every setting, wide banks, Dot's line on the way in */
const firstRaft = section({
  id: 'w9-first-raft',
  name: 'the first raft',
  archetypes: ['sprint'],
  phases: ['ki', 'sho'],
  difficulty: 3,
  teaches: RAFT,
  uses: [W9_THEME.rafts],
  maxPerStage: 1,
  extraSeconds: BOB_WAIT * 2,
  pieces: [bank('a', [320, 360]), bob('r', 'a', 'raft', [160, 180], [0.45, 0.55], true), off('b', 'r', [300, 340], [0.45, 0.55], true), up('k', 'b', 30, [140, 160]), down('c', 'k', 30, [180, 220])],
  last: 'c',
  sockets: [tip(RAFT, 'a', 0.2), petals('r', 'r', 0.5, 1), petals('b', 'b', 0.5, 2, 80), petals('k', 'k', 0.5, 1)],
  mirrorable: false,
});

/** two rafts out of step over the lava */
const raftPair = section({
  id: 'w9-raft-pair',
  name: 'two rafts',
  archetypes: ['sprint'],
  phases: LIVE,
  difficulty: 5,
  uses: [W9_THEME.rafts, RAFT],
  extraSeconds: BOB_WAIT * 2,
  pieces: [bank('a', [260, 300]), bob('r1', 'a', 'raft', [150, 170]), bob('r2', 'r1', 'raft', [150, 170]), off('b', 'r2', [300, 340]), up('k', 'b', 32, [140, 160]), down('c', 'k', 32, [180, 220])],
  last: 'c',
  sockets: [petals('r1', 'r1', 0.5, 1), petals('r2', 'r2', 0.5, 1), petals('b', 'b', 0.5, 2, 80), scenery('smoke', 'c', [0.4, 0.6], 0.5)],
  mirrorable: true,
});

/** three rafts, each out of step with the next: a rhythm (jump, wait, jump) */
const raftRow = section({
  id: 'w9-raft-row',
  name: 'a row of rafts',
  archetypes: ['sprint'],
  phases: ['sho', 'ten'],
  difficulty: 6,
  uses: [W9_THEME.rafts, RAFT],
  extraSeconds: BOB_WAIT * 3,
  pieces: [bank('a', [240, 280]), bob('r1', 'a', 'raft', [140, 160]), bob('r2', 'r1', 'raft', [140, 160]), bob('r3', 'r2', 'raft', [140, 160]), off('b', 'r3', [320, 360]), up('k', 'b', 30, [140, 160]), down('c', 'k', 30, [160, 200])],
  last: 'c',
  sockets: [petals('r1', 'r1', 0.5, 1), petals('r2', 'r2', 0.5, 1), petals('r3', 'r3', 0.5, 1), petals('b', 'b', 0.4, 1)],
  mirrorable: true,
});

/** two rafts onto a geyser's flat: wait out the raft, then the geyser */
const raftGeyser = section({
  id: 'w9-raft-geyser',
  name: 'rafts to a geyser',
  archetypes: ['sprint'],
  phases: HOT,
  difficulty: 7,
  uses: [W9_THEME.rafts, RAFT, W9H.GEYSER],
  extraSeconds: BOB_WAIT * 2 + W9H.GEYSER_WAIT,
  pieces: [bank('a', [240, 280]), bob('r1', 'a', 'raft', [150, 170]), bob('r2', 'r1', 'raft', [150, 170]), off('b', 'r2', [420, 460]), up('k', 'b', 32, [140, 160]), down('c', 'k', 32, [200, 240])],
  last: 'c',
  sockets: [petals('r1', 'r1', 0.5, 1), petals('r2', 'r2', 0.5, 1), geyser('gh', 'b', 0.6), petals('b', 'b', 0.2, 1), petals('k', 'k', 0.5, 1)],
  mirrorable: true,
});

// ───────────────────────────── 9-5 and 9-9: the charred logs ─────────────────────────────

/** one long log across a wide chasm: run it while it is up */
const logBridge = section({
  id: 'w9-log-bridge',
  name: 'the log bridge',
  archetypes: ['sprint', 'gauntlet'],
  phases: ALL,
  difficulty: 5,
  uses: [W9_THEME.logs],
  extraSeconds: BOB_WAIT * 1.5,
  pieces: [bank('a', [280, 320]), bob('l', 'a', 'log', [260, 300], [0.5, 0.62]), off('b', 'l', [300, 340], [0.5, 0.62]), up('k', 'b', 30, [140, 160]), down('c', 'k', 30, [180, 220])],
  last: 'c',
  sockets: [petals('l', 'l', 0.5, 2, 120), petals('b', 'b', 0.5, 1), scenery('log', 'c', [0.4, 0.6], 0.5), thread('r', 'c', 0.5)],
  mirrorable: true,
});

/** two logs out of step, a knob between the banks */
const logPair = section({
  id: 'w9-log-pair',
  name: 'two logs',
  archetypes: ['sprint', 'gauntlet'],
  phases: LIVE,
  difficulty: 6,
  uses: [W9_THEME.logs],
  extraSeconds: BOB_WAIT * 3,
  pieces: [bank('a', [260, 300]), bob('l1', 'a', 'log', [240, 270]), bob('l2', 'l1', 'log', [240, 270]), off('b', 'l2', [320, 360]), up('k', 'b', 30, [140, 160]), down('c', 'k', 30, [180, 220])],
  last: 'c',
  sockets: [petals('l1', 'l1', 0.5, 1), petals('l2', 'l2', 0.5, 1), petals('b', 'b', 0.5, 1), thread('r', 'c', 0.5)],
  mirrorable: true,
});

/** 9-5: ride the log up, then open the leaf over the vent's chasm (the glide's soft pit climbs back) */
const logGlide = section({
  id: 'w9-log-glide',
  name: 'log, then the leaf',
  archetypes: ['sprint'],
  phases: MID,
  difficulty: 6,
  uses: [W9_THEME.logs],
  extraSeconds: BOB_WAIT * 1.5,
  pieces: [bank('a', [280, 320]), bob('l', 'a', 'log', [240, 270]), off('b', 'l', [260, 300]), W9H.glide('c', 'b', [320, 360], [0.55, 0.65]), up('k', 'c', 30, [140, 160]), down('d', 'k', 30, [180, 220])],
  last: 'd',
  sockets: [petals('l', 'l', 0.5, 1), petals('b', 'b', 0.5, 1), petals('c', 'c', 0.5, 2, 80)],
  mirrorable: false,
});

/** 9-9: a log to the guard's landing (an animal waits past it) */
const logHoard = section({
  id: 'w9-log-hoard',
  name: 'log to the guard',
  archetypes: ['gauntlet'],
  phases: LIVE,
  difficulty: 7,
  uses: [W9_THEME.logs],
  extraSeconds: BOB_WAIT * 1.5,
  pieces: [bank('a', [260, 300]), bob('l', 'a', 'log', [250, 280]), off('b', 'l', [420, 460]), up('k', 'b', 32, [140, 160]), down('c', 'k', 32, [200, 240])],
  last: 'c',
  sockets: [petals('l', 'l', 0.5, 1), foe('foe', 'b', [0.6, 0.7], ANY, 3.5, { chance: 0.9 }), petals('k', 'k', 0.5, 1)],
  mirrorable: true,
});

// ───────────────────────────── 9-8: the pistons ─────────────────────────────

/** the first piston (every pistons roll): step on at the bottom, ride it up to the ledge a thread waits on, Dot's line on the way in */
const firstPiston = section({
  id: 'w9-first-piston',
  name: 'the first piston',
  archetypes: ['relic_hunt'],
  phases: ['ki', 'sho'],
  difficulty: 3,
  teaches: PISTON,
  uses: [W9_THEME.pistons],
  maxPerStage: 1,
  extraSeconds: PISTON_RIDE,
  pieces: [bank('a', [300, 340]), piston('p', 'a'), up('t', 'p', 0, [260, 300]), down('s', 't', 100, [140, 160]), down('c', 's', 110, [220, 260])],
  last: 'c',
  sockets: [tip(PISTON, 'a', 0.2), thread('r', 't', 0.6), petals('t', 't', 0.3, 1), petals('s', 's', 0.5, 1)],
  mirrorable: false,
});

/** two pistons: up one to a ledge, along it to a second, up again, then down the steps */
const pistonPair = section({
  id: 'w9-piston-pair',
  name: 'two pistons',
  archetypes: ['relic_hunt'],
  phases: LIVE,
  difficulty: 6,
  uses: [W9_THEME.pistons, PISTON],
  extraSeconds: PISTON_RIDE * 2,
  pieces: [bank('a', [260, 300]), piston('p1', 'a'), up('t1', 'p1', 0, [220, 260]), piston('p2', 't1'), up('t2', 'p2', 0, [240, 280]), down('s1', 't2', 110, [140, 160]), down('s2', 's1', 110, [140, 160]), down('s3', 's2', 100, [140, 160]), down('c', 's3', 100, [200, 240])],
  last: 'c',
  sockets: [petals('t1', 't1', 0.5, 1), thread('r', 't2', 0.5), petals('s1', 's1', 0.5, 1), petals('s3', 's3', 0.5, 1)],
  mirrorable: false,
});

/** a piston to a high ledge with a lava chasm on it, then down */
const pistonChasm = section({
  id: 'w9-piston-chasm',
  name: 'piston to the high chasm',
  archetypes: ['relic_hunt'],
  phases: MID,
  difficulty: 6,
  uses: [W9_THEME.pistons, PISTON],
  extraSeconds: PISTON_RIDE,
  pieces: [bank('a', [260, 300]), piston('p', 'a'), up('t', 'p', 0, [220, 260]), W9H.lava('t2', 't', [260, 300]), down('s', 't2', 110, [140, 160]), down('c', 's', 110, [220, 260])],
  last: 'c',
  sockets: [petals('t', 't', 0.5, 1), thread('r', 't2', 0.5), petals('s', 's', 0.5, 1), foe('foe', 'c', [0.55, 0.65], SMALL, 2, { phases: LIVE, chance: 0.6 })],
  mirrorable: false,
});

// ───────────────────────────── 9-3 and 9-9: the sinking ember slabs ─────────────────────────────

const SINK = W9_LESSON.sink;
/** an ember slab past `after` that sinks while he stands on it, over a soft channel (the crust under it and its steps out are the long way:
 *  the slabs are never needed, STAGE-RULES §1) */
const slab = (key: string, after: string, w: W = [130, 150]): SectionPiece => ({ key, shape: 'raft', w, place: { kind: 'raft', after, bob: 'sink', share: [0.3, 0.42], soft: true }, landing: true });
const offSoft = (key: string, after: string, w: W) => off(key, after, w, [0.3, 0.42], true);

/** 9-3's gate for the slabs (its start is always a gate: w9Game themed), the canopy's plain basalt run */
const sinkGate3: SectionTemplate = section({
  id: 'w9s-gate-sinkers',
  name: 'ember canopy: the sinking slabs (gate)',
  archetypes: ['vine_runner'],
  phases: ['start'],
  difficulty: 1,
  teaches: W9_THEME.sinkers,
  weight: 6,
  pieces: [bank('a', [220, 260]), up('k1', 'a', 30, [130, 160]), down('f1', 'k1', 30, [220, 260]), up('k2', 'f1', 30, [130, 160]), down('c', 'k2', 30, [200, 240])],
  last: 'c',
  sockets: [petals('k1', 'k1', 0.5, 1), petals('f1', 'f1', 0.5, 2, 80), petals('k2', 'k2', 0.5, 1), scenery('log', 'a', [0.5, 0.6], 0.9)],
  mirrorable: false,
});

/** the first slabs (every sinkers roll): two over a soft channel, Dot's line on the way in */
const firstSink = section({
  id: 'w9-first-sinker',
  name: 'the first sinking slabs',
  archetypes: ['vine_runner', 'gauntlet'],
  phases: ['ki', 'sho'],
  difficulty: 3,
  teaches: SINK,
  uses: [W9_THEME.sinkers],
  maxPerStage: 1,
  extraSeconds: 1,
  pieces: [bank('a', [300, 340]), slab('s1', 'a'), slab('s2', 's1'), offSoft('b', 's2', [280, 320]), up('k', 'b', 30, [140, 160]), down('c', 'k', 30, [200, 240])],
  last: 'c',
  sockets: [tip(SINK, 'a', 0.2), petals('s1', 's1', 0.5, 1), petals('s2', 's2', 0.5, 1), petals('b', 'b', 0.5, 1)],
  mirrorable: false,
});

/** a run of three slabs: hurry across */
const sinkRun = section({
  id: 'w9-sinker-run',
  name: 'a run of sinking slabs',
  archetypes: ['vine_runner', 'gauntlet'],
  phases: LIVE,
  difficulty: 5,
  uses: [W9_THEME.sinkers, SINK],
  extraSeconds: 1,
  pieces: [bank('a', [260, 300]), slab('s1', 'a'), slab('s2', 's1'), slab('s3', 's2'), offSoft('b', 's3', [300, 340]), up('k', 'b', 32, [140, 160]), down('c', 'k', 32, [200, 240])],
  last: 'c',
  sockets: [petals('s1', 's1', 0.5, 1), petals('s2', 's2', 0.5, 1), petals('s3', 's3', 0.5, 1), petals('k', 'k', 0.5, 1)],
  mirrorable: true,
});

/** two runs of slabs with a basalt knob between */
const sinkTwin = section({
  id: 'w9-sinker-twin',
  name: 'two runs of sinking slabs',
  archetypes: ['vine_runner', 'gauntlet'],
  phases: MID,
  difficulty: 6,
  uses: [W9_THEME.sinkers, SINK],
  extraSeconds: 2,
  pieces: [bank('a', [240, 280]), slab('s1', 'a'), slab('s2', 's1'), offSoft('m', 's2', [220, 260]), slab('t1', 'm'), slab('t2', 't1'), offSoft('b', 't2', [260, 300])],
  last: 'b',
  sockets: [petals('s1', 's1', 0.5, 1), petals('s2', 's2', 0.5, 1), petals('m', 'm', 0.5, 1), petals('t2', 't2', 0.5, 1)],
  mirrorable: true,
});

/** 9-9: slabs to a guard's landing */
const sinkHoard = section({
  id: 'w9-sinker-hoard',
  name: 'sinking slabs to the guard',
  archetypes: ['gauntlet'],
  phases: LIVE,
  difficulty: 7,
  uses: [W9_THEME.sinkers, SINK],
  extraSeconds: 1,
  pieces: [bank('a', [260, 300]), slab('s1', 'a'), slab('s2', 's1'), offSoft('b', 's2', [420, 460]), up('k', 'b', 32, [140, 160]), down('c', 'k', 32, [200, 240])],
  last: 'c',
  sockets: [petals('s1', 's1', 0.5, 1), petals('s2', 's2', 0.5, 1), foe('foe', 'b', [0.6, 0.7], ANY, 3.5, { chance: 0.9 }), petals('k', 'k', 0.5, 1)],
  mirrorable: true,
});

// ───────────────────────────── 9-3 and 9-8: the ropes over the lava (the burnt bridges) ─────────────────────────────

/** a ledge past a gap no jump or glide clears, a shimmy rope across (World 1's shimmy, known by World 9: no new line) */
const rope = (key: string, after: string, w: W, gap: W = [460, 520]): SectionPiece => bank(key, w, { kind: 'rope', after, gap });
/** the time model's crossing: the rope at ROPE_SPEED (120 px a second) */
const ROPE_T = 4.5;

/** 9-3's gate for the ropes */
const ropeGate3: SectionTemplate = section({
  id: 'w9s-gate-bridges',
  name: 'ember canopy: the ropes over the lava (gate)',
  archetypes: ['vine_runner'],
  phases: ['start'],
  difficulty: 1,
  teaches: W9_THEME.bridges,
  weight: 6,
  pieces: [bank('a', [220, 260]), up('k1', 'a', 30, [130, 160]), down('f1', 'k1', 30, [220, 260]), up('k2', 'f1', 30, [130, 160]), down('c', 'k2', 30, [200, 240])],
  last: 'c',
  sockets: [petals('k1', 'k1', 0.5, 1), petals('f1', 'f1', 0.5, 2, 80), petals('k2', 'k2', 0.5, 1), scenery('smoke', 'a', [0.5, 0.6], 0.9)],
  mirrorable: false,
});

/** one rope over a lava chasm */
const ropeCross = section({
  id: 'w9-rope-cross',
  name: 'rope over the lava',
  archetypes: ['vine_runner', 'relic_hunt'],
  phases: ALL,
  difficulty: 5,
  uses: [W9_THEME.bridges],
  extraSeconds: ROPE_T,
  pieces: [bank('a', [280, 320]), rope('b', 'a', [280, 320]), up('k', 'b', 30, [140, 160]), down('c', 'k', 30, [200, 240])],
  last: 'c',
  sockets: [petals('a', 'a', 0.5, 1), petals('b', 'b', 0.5, 2, 80), petals('k', 'k', 0.5, 1), thread('r', 'b', 0.6)],
  mirrorable: true,
});

/** two ropes, a basalt ledge between them */
const ropeTwin = section({
  id: 'w9-rope-twin',
  name: 'two ropes over the lava',
  archetypes: ['vine_runner', 'relic_hunt'],
  phases: LIVE,
  difficulty: 6,
  uses: [W9_THEME.bridges],
  extraSeconds: ROPE_T * 2,
  pieces: [bank('a', [260, 300]), rope('b', 'a', [220, 260], [440, 500]), rope('c', 'b', [280, 320], [440, 500])],
  last: 'c',
  sockets: [petals('a', 'a', 0.5, 1), petals('b', 'b', 0.5, 1), petals('c', 'c', 0.5, 1), thread('r', 'b', 0.5)],
  mirrorable: true,
});

/** a rope, then a lava chasm jumped and a knob */
const ropeChasm = section({
  id: 'w9-rope-chasm',
  name: 'rope, then the chasm',
  archetypes: ['vine_runner', 'relic_hunt'],
  phases: MID,
  difficulty: 6,
  uses: [W9_THEME.bridges],
  extraSeconds: ROPE_T,
  pieces: [bank('a', [260, 300]), rope('b', 'a', [300, 340]), W9H.lava('c', 'b', [300, 340]), up('k', 'c', 30, [140, 160]), down('d', 'k', 30, [200, 240])],
  last: 'd',
  sockets: [petals('b', 'b', 0.5, 1), petals('c', 'c', 0.5, 1), petals('k', 'k', 0.5, 1), thread('r', 'd', 0.5)],
  mirrorable: true,
});

export const W9_BOB_SECTIONS: readonly SectionTemplate[] = [
  ropeGate3, W9_BOB_GATES.bridges8, ropeCross, ropeTwin, ropeChasm,
  sinkGate3, W9_BOB_GATES.sinkers9, firstSink, sinkRun, sinkTwin, sinkHoard,
  W9_BOB_GATES.rafts, firstRaft, raftPair, raftRow, raftGeyser,
  W9_BOB_GATES.logs5, W9_BOB_GATES.logs9, logBridge, logPair, logGlide, logHoard,
  W9_BOB_GATES.pistons, firstPiston, pistonPair, pistonChasm,
];

/** which stages hold which (STAGE-RULES §2 "Sameness": neighbours in play share none; GRAB-BAG.md §4) */
export const W9_BOB_STAGE: Readonly<Record<string, readonly number[]>> = {
  [W9_BOB_GATES.rafts.id]: [1], [firstRaft.id]: [1], [raftPair.id]: [1], [raftRow.id]: [1], [raftGeyser.id]: [1],
  [W9_BOB_GATES.logs5.id]: [5], [logGlide.id]: [5], [W9_BOB_GATES.logs9.id]: [9], [logHoard.id]: [9], [logBridge.id]: [5, 9], [logPair.id]: [5, 9],
  [ropeGate3.id]: [3], [W9_BOB_GATES.bridges8.id]: [8], [ropeCross.id]: [3, 8], [ropeTwin.id]: [3, 8], [ropeChasm.id]: [3, 8],
  [sinkGate3.id]: [3], [W9_BOB_GATES.sinkers9.id]: [9], [firstSink.id]: [3, 9], [sinkRun.id]: [3, 9], [sinkTwin.id]: [3, 9], [sinkHoard.id]: [9],
  [W9_BOB_GATES.pistons.id]: [8], [firstPiston.id]: [8], [pistonPair.id]: [8], [pistonChasm.id]: [8],
};
