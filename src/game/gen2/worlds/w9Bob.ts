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

/** the Drake's hoard's own guards (9-9: no other stage has the harpies; the boas coil only on 9-4's doorstep), so its moving logs and slabs
 *  never read like another stage's on the look-alike measure (curation's 1-in-5 cap dropped half of 9-9's rolls) */
const HOARD = ['harpy', 'boa'];
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
  sockets: [petals('l', 'l', 0.5, 1), foe('foe', 'b', [0.6, 0.7], HOARD, 3.5, { chance: 1 }), petals('k', 'k', 0.5, 1)],
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
  archetypes: ['vine_runner', 'gauntlet', 'purge'],
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
  archetypes: ['vine_runner', 'gauntlet', 'purge'],
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
  archetypes: ['vine_runner', 'gauntlet', 'purge'],
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
  archetypes: ['gauntlet', 'purge'],
  phases: LIVE,
  difficulty: 7,
  uses: [W9_THEME.sinkers, SINK],
  extraSeconds: 1,
  pieces: [bank('a', [260, 300]), slab('s1', 'a'), slab('s2', 's1'), offSoft('b', 's2', [420, 460]), up('k', 'b', 32, [140, 160]), down('c', 'k', 32, [200, 240])],
  last: 'c',
  sockets: [petals('s1', 's1', 0.5, 1), petals('s2', 's2', 0.5, 1), foe('foe', 'b', [0.6, 0.7], HOARD, 3.5, { chance: 1 }), petals('k', 'k', 0.5, 1)],
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

// ───────────────────────────── 9-3: its ropes and slabs between the chains (the vine stage swings on every roll) ─────────────────────────────

/** a chain past `after` (w9Swing.ts's: its anchor 400-420 px over the ledge) and the perch it swings to, 80 px up, then a step down */
const chainTo = (p: string, after: string, perchW: W = [220, 260]): SectionPiece[] => [
  { key: `${p}l`, shape: 'liana', w: 0, place: { kind: 'swing', after, top: [400, 420] } },
  bank(`${p}p`, perchW, { kind: 'land', after: `${p}l`, dy: -80 }, { landing: true }),
  bank(`${p}d`, [140, 170], { kind: 'walk', after: `${p}p`, dy: 80 }),
];
const CHAIN_T = 2.5;

/** a rope over the lava, then a chain */
const ropeChain = section({
  id: 'w9-rope-chain',
  name: 'rope, then a chain',
  archetypes: ['vine_runner'],
  phases: W9H.ALL,
  difficulty: 6,
  uses: [W9_THEME.bridges],
  extraSeconds: ROPE_T + CHAIN_T,
  pieces: [bank('a', [240, 280]), rope('b', 'a', [220, 260]), ...chainTo('c', 'b')],
  last: 'cd',
  sockets: [petals('b', 'b', 0.5, 1), petals('cp', 'cp', 0.4, 2, 90), petals('cd', 'cd', 0.5, 1)],
  mirrorable: false,
});

/** a chain, then a rope over the lava */
const chainRope = section({
  id: 'w9-chain-rope',
  name: 'a chain, then a rope',
  archetypes: ['vine_runner'],
  phases: W9H.ALL,
  difficulty: 6,
  uses: [W9_THEME.bridges],
  extraSeconds: ROPE_T + CHAIN_T,
  pieces: [bank('a', [220, 260]), ...chainTo('c', 'a'), rope('e', 'cd', [260, 300]), up('k', 'e', 30, [140, 160]), down('f', 'k', 30, [200, 240])],
  last: 'f',
  sockets: [petals('cp', 'cp', 0.4, 2, 90), petals('e', 'e', 0.5, 1), petals('k', 'k', 0.5, 1)],
  mirrorable: false,
});

/** sinking slabs over a soft channel, then a chain */
const sinkChain = section({
  id: 'w9-sinker-chain',
  name: 'sinking slabs, then a chain',
  archetypes: ['vine_runner'],
  phases: W9H.ALL,
  difficulty: 6,
  uses: [W9_THEME.sinkers, SINK],
  extraSeconds: 1 + CHAIN_T,
  pieces: [bank('a', [240, 280]), slab('s1', 'a'), slab('s2', 's1'), offSoft('b', 's2', [220, 260]), ...chainTo('c', 'b')],
  last: 'cd',
  sockets: [petals('s1', 's1', 0.5, 1), petals('s2', 's2', 0.5, 1), petals('cp', 'cp', 0.4, 2, 90)],
  mirrorable: false,
});

/** a chain, then sinking slabs */
const chainSink = section({
  id: 'w9-chain-sinker',
  name: 'a chain, then sinking slabs',
  archetypes: ['vine_runner'],
  phases: W9H.ALL,
  difficulty: 6,
  uses: [W9_THEME.sinkers, SINK],
  extraSeconds: 1 + CHAIN_T,
  pieces: [bank('a', [220, 260]), ...chainTo('c', 'a'), slab('s1', 'cd'), slab('s2', 's1'), slab('s3', 's2'), offSoft('f', 's3', [240, 280])],
  last: 'f',
  sockets: [petals('cp', 'cp', 0.4, 2, 90), petals('s2', 's2', 0.5, 1), petals('f', 'f', 0.5, 1)],
  mirrorable: false,
});

// ───────────────────────────── 9-1 and 9-6: the ash caps (World 9's bounce plant) ─────────────────────────────

const CAP = W9_LESSON.cap;
/** an ash cap (bounceArt.ts cap-w9) standing at a bank's end, its cap a little over it (World 8's moon flower, w8Branch.ts) */
const cap = (key: string, on: string): SectionPiece => ({ key, shape: 'bouncy', w: [80, 90], place: { kind: 'over', on, at: [0.78, 0.84], dy: [-28, -22] }, main: true });
/** the high rock past it, inside the bounce's reach (~181): World 8's 170 */
const CAP_HI = 170;
const high = (key: string, on: string, w: W): SectionPiece => bank(key, w, { kind: 'over', on, at: 1, dy: -CAP_HI }, { main: true });

/** the first ash cap (every caps roll): up onto the high rock and down, Dot's line on the way in */
const firstCap = section({
  id: 'w9-first-cap',
  name: 'the first ash cap',
  archetypes: ['sprint', 'purge'],
  phases: ['ki', 'sho'],
  difficulty: 3,
  teaches: CAP,
  uses: [W9_THEME.caps],
  maxPerStage: 1,
  pieces: [bank('a', [320, 360]), cap('f', 'a'), high('hi', 'a', [260, 300]), down('b', 'hi', CAP_HI, [240, 280])],
  last: 'b',
  sockets: [tip(CAP, 'a', 0.2), petals('a', 'a', 0.35, 1), petals('hi', 'hi', 0.5, 2, 100), petals('b', 'b', 0.5, 1)],
  mirrorable: false,
});

/** two caps, each up onto its own high rock, a lava chasm between */
const capPair = section({
  id: 'w9-cap-pair',
  name: 'two ash caps',
  archetypes: ['sprint', 'purge'],
  phases: LIVE,
  difficulty: 5,
  uses: [W9_THEME.caps, CAP],
  pieces: [bank('a', [300, 340]), cap('f1', 'a'), high('h1', 'a', [220, 260]), down('m', 'h1', CAP_HI, [300, 340]), cap('f2', 'm'), high('h2', 'm', [220, 260]), down('b', 'h2', CAP_HI, [220, 260])],
  last: 'b',
  sockets: [petals('h1', 'h1', 0.5, 2, 90), petals('m', 'm', 0.4, 1), petals('h2', 'h2', 0.5, 2, 90)],
  mirrorable: false,
});

/** a cap up to the high rock, a lava chasm off its far end, a hunter past it (9-6) */
const capChasm = section({
  id: 'w9-cap-chasm',
  name: 'ash cap, then the chasm',
  archetypes: ['sprint', 'purge'],
  phases: MID,
  difficulty: 6,
  uses: [W9_THEME.caps, CAP],
  pieces: [bank('a', [300, 340]), cap('f', 'a'), high('hi', 'a', [260, 300]), W9H.lava('c', 'hi', [320, 360], [0.55, 0.7]), down('d', 'c', 60, [200, 240]), down('e', 'd', 110, [240, 280])],
  last: 'e',
  sockets: [petals('hi', 'hi', 0.5, 2, 90), petals('c', 'c', 0.5, 1), foe('foe', 'e', [0.55, 0.65], SMALL, 2.5, { phases: LIVE, chance: 0.7 })],
  mirrorable: false,
});

// ───────────────────────────── 9-9's own: the hoard's guards with its logs and slabs ─────────────────────────────

/** 9-9: two logs, a guard on the landing between them */
const logGuards = section({
  id: 'w9-log-guards',
  name: 'logs between the guards',
  archetypes: ['gauntlet'],
  phases: W9H.ALL,
  difficulty: 7,
  uses: [W9_THEME.logs],
  extraSeconds: BOB_WAIT * 3,
  pieces: [bank('a', [260, 300]), bob('l1', 'a', 'log', [240, 270]), off('m', 'l1', [400, 440]), bob('l2', 'm', 'log', [240, 270]), off('b', 'l2', [280, 320])],
  last: 'b',
  sockets: [petals('l1', 'l1', 0.5, 1), foe('foe', 'm', [0.5, 0.6], HOARD, 3.5, { chance: 1 }), petals('l2', 'l2', 0.5, 1), petals('b', 'b', 0.5, 1)],
  mirrorable: true,
});

/** 9-9: slabs, a guard, slabs */
const sinkGuards = section({
  id: 'w9-sinker-guards',
  name: 'slabs between the guards',
  archetypes: ['gauntlet'],
  phases: W9H.ALL,
  difficulty: 7,
  uses: [W9_THEME.sinkers, SINK],
  extraSeconds: 2,
  pieces: [bank('a', [240, 280]), slab('s1', 'a'), slab('s2', 's1'), offSoft('m', 's2', [400, 440]), slab('t1', 'm'), slab('t2', 't1'), offSoft('b', 't2', [260, 300])],
  last: 'b',
  sockets: [petals('s1', 's1', 0.5, 1), foe('foe', 'm', [0.5, 0.6], HOARD, 3.5, { chance: 1 }), petals('t2', 't2', 0.5, 1)],
  mirrorable: true,
});

export const W9_BOB_SECTIONS: readonly SectionTemplate[] = [
  logGuards, sinkGuards,
  W9_BOB_GATES.caps1, W9_BOB_GATES.caps6, firstCap, capPair, capChasm,
  ropeChain, chainRope, sinkChain, chainSink,
  ropeGate3, W9_BOB_GATES.bridges8, ropeCross, ropeTwin, ropeChasm,
  sinkGate3, W9_BOB_GATES.sinkers9, W9_BOB_GATES.sinkers6, firstSink, sinkRun, sinkTwin, sinkHoard,
  W9_BOB_GATES.rafts, firstRaft, raftPair, raftRow, raftGeyser,
  W9_BOB_GATES.logs5, W9_BOB_GATES.logs9, logBridge, logPair, logGlide, logHoard,
  W9_BOB_GATES.pistons, firstPiston, pistonPair, pistonChasm,
];

/** which stages hold which (STAGE-RULES §2 "Sameness": neighbours in play share none; GRAB-BAG.md §4) */
export const W9_BOB_STAGE: Readonly<Record<string, readonly number[]>> = {
  [W9_BOB_GATES.rafts.id]: [1], [firstRaft.id]: [1], [raftPair.id]: [1], [raftRow.id]: [1], [raftGeyser.id]: [1],
  [W9_BOB_GATES.logs5.id]: [5], [logGlide.id]: [5], [W9_BOB_GATES.logs9.id]: [9], [logHoard.id]: [9], [logGuards.id]: [9], [logBridge.id]: [5], [logPair.id]: [5],
  [W9_BOB_GATES.caps1.id]: [1], [W9_BOB_GATES.caps6.id]: [6], [firstCap.id]: [1, 6], [capPair.id]: [1, 6], [capChasm.id]: [1, 6],
  [ropeGate3.id]: [3], [W9_BOB_GATES.bridges8.id]: [8], [ropeCross.id]: [8], [ropeTwin.id]: [8], [ropeChasm.id]: [8], [ropeChain.id]: [3], [chainRope.id]: [3],
  [sinkGate3.id]: [3], [W9_BOB_GATES.sinkers9.id]: [9], [W9_BOB_GATES.sinkers6.id]: [6], [firstSink.id]: [3, 6], [sinkRun.id]: [6], [sinkTwin.id]: [6], [sinkGuards.id]: [9], [sinkChain.id]: [3], [chainSink.id]: [3], [sinkHoard.id]: [9],
  [W9_BOB_GATES.pistons.id]: [8], [firstPiston.id]: [8], [pistonPair.id]: [8], [pistonChasm.id]: [8],
};
