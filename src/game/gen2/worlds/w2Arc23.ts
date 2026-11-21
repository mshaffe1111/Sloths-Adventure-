/**
 * gen2/worlds/w2Arc23 — 2-3 "Stuck in the Reeds: Walk Them Home" as designed (reference/design/2-3.md, DESIGN-23 on t-design-23; BUILD-23,
 * the lead's GO 8:05 PM ET 11-20). WORLD DATA: no engine line names this stage; kitLib23 gives World 2's kit 2-3's rows (stageTable.ts kit
 * 'w2-23', listed.ts KITS), and the game rolls it the way it rolls every gen2 stage.
 *
 * ONE idea (2-3.md): "Punch open the reed cages and the little ones follow you home, slower than you: when the heron looks up, get
 * everybody into the reeds." All game Pokey is the slow one; here he is the fast one and the little ones set the pace. The heron never
 * wants Pokey (too big): it reads THEM (followPlay.ts), and a seen one scampers back to hide at the stretch's start. Nobody is hurt.
 *
 * THE PIECES (ENG-23: follow.ts, followPlay.ts, followArt.ts, lineFaults.ts; World 2's reed clump as a hide, Bush 'reeds'; the heron as
 * World 2's watcher through stillLay.ts, as 1-7's eagle; W2_FOLLOW; 2-2's pads, rideLay.ts).
 *
 * THE ARC (2-3.md "THE NODE STRING" `A Tg1< Tm1&<:&heron R Pw1<:#soft Xm1&>:&heron R Pr1< Wp1&>:#soft:&heron R Cm1&>:&heron R Sg1< E`, one
 * brick a beat; the heron is a watch prop, not a creature cast (the lead's GO), so no &heron marks; the design's p (2-2's pads) is laid
 * as f, 2-5's precedent):
 *   A  arrive: the marsh, Dot's `follow` 800+ px before cage 1
 *   Tg the first cage, safe: one reed cage on a flat bank (a duckling), nothing that hurts
 *   Tm the heron, safe: `heron` + `look` 800+ px before; one wide reed bed (Normal 300, Easy 340); its first look only warns (free first),
 *      the long calm; the flag before
 *   Pw the parade swims: stones over splash-back water, the line paddles behind him; cage 2 (an otter pup) on the far bank
 *   Xm clump to clump: two clumps over open mud (Normal G 400, W 300; Easy G 350, W 340); the heron; cage 3 (a capybara pup) in the far
 *      clump; the flag before
 *   Pr up the mooring post: cage 4 hung on the post (a climbing vine with nothing to step off onto at its top); the line waits at its foot
 *   Wf TWIST: no stopping on the pond: 2-2's sinking pads over a watched pond to a reed isle; the heron over the pond
 *   Cm everything: cage 5 mid-way, three clumps over G 350; Normal two herons out of step (the second 3.2 s late), Easy one; the flag before
 *   S  home: the village boardwalk, the families' jetty 200 px before the door
 *   E  the village gate
 *   R  a rest on the bank after Tm, Xm, Wf and Cm
 */
import { w2World, W2_FOLLOW } from './w2.ts';
import { clipWatches, STILL, stillEmitters, stillProps, type StillRow } from '../stillLay.ts';
import type { PadRow } from '../rideLay.ts';
import type { Difficulty } from '../../difficulty.ts';
import type { WatchZone } from '../../watcher.ts';
import type { GraphBrief, NodeJob, PropDef, SectionPiece, SectionTemplate, Socket, StageSink, WorldKit } from '../types.ts';

export const STAGE_23 = '2-3';
/** 2-3 is World 2's third stage (the heron's calm by stillLay's band) */
const STAGE_N = 3;

/** 2-3's ONE graph (2-3.md's node string, the heron a watch prop, p as f; its three reed beats (m, cover) laid as h, the heron the stage's
 *  watched hazard, 1-7's precedent: the realised code reads a node's content from its section's ContentType, which has no cover, so a
 *  cover beat realises as 'g' and V11 refused 4 of 7 'g' (ENGINE-WORTHY: pipeline.ts realisedCode :1085 cannot realise m)) */
export const ARC_23: Record<string, string> = { 'reeds-23-arc': 'A Tg Th R Pw Xh R Pr Wf R Ch R S E' };

/** the lesson 2-3 teaches: the little ones follow you; hide them from the heron (World 2's manifest lessons) */
export const FOLLOW_LESSON = 'follow';
/** the second: the heron reads the little ones; into the reeds right after it looks (beat 2) */
export const HERON_LESSON = 'heron';

/** 2-3's brief, all of it data (a rescue: bring the little ones home; its content nodes by letter; `ends: 'quiet'`: the homecoming is
 *  the signature, no finale) */
export const BRIEF_23: GraphBrief = {
  ends: 'quiet', trend: 'level', branching: 'none', teaches: [FOLLOW_LESSON, HERON_LESSON], deal: { ground: 14.3, hazard: 42.9, water: 14.3, rope: 14.3, floating: 14.2 }, dealExact: true,
  tags: true, petals: 'few',
};

/** the story keeper's lines for 2-3, verbatim (reference/story/lines-2-3.md on t-keeper-23-29, approved 11-18). The only player words this
 *  file holds; w2Arc23.test.ts holds each equal to the keeper's file */
export const LINES_23 = {
  /** Dot, TEACH, 800+ px before cage 1 (beat 1), on the arrival bank */
  follow: "Punch a cage open. They'll follow you home!",
  /** Dot, TEACH, 800+ px before beat 2 (the heron's first look), as the heron comes on screen */
  heron: 'The heron wants little ones! Into the reeds!',
  /** Dot, said right after `heron` */
  look: 'Go right after it looks. Wait for everyone!',
  /** Dot, the FIRST time a little one is spooked in the stage; later spooks are Help only */
  spooked: 'One got spooked! Go back and get it!',
  /** Dot at the LOCKED gate when a cage is still shut */
  missingCage: "One's still in its cage! Back we go!",
  /** Dot at the LOCKED gate when no cage is shut but a spooked one waits at its reed */
  missingReed: "One's still hiding in the reeds! Back we go!",
  /** Pokey, once, at the foot of the mooring post (beat 5) as the line stops behind him, before he climbs */
  post: 'Everybody wait here. This part is sloth work.',
  /** Dot, quiet, once, as the last little one reaches its family on the jetty (beat 8) */
  home: "They're home. Nobody was late.",
} as const;
/** the journal: the heron's card name and tip (12 words) */
export const HERON_CARD_23 = { name: 'Cocoi Heron', tip: 'Waits like a statue to catch fish. Move right after it looks.' } as const;
/** the stage card (stagePlan.ts World 2's 2-3 row) */
export const MISSION_23 = 'Free the little ones and walk them home, past the heron.';
/** the goal's fixed lines ({n} the live count; n = 1: "little one") */
export const GOAL_LINES_23 = { goalStart: 'Walk {n} little ones home to open the sanctuary', goalLate: 'Still {n} little ones to walk home' } as const;
/** the HUD's count word ("3/5 home") */
export const COUNT_WORD_23 = 'home';
/** a line's id in the kit: its own, `w23.<key>` */
export const lineId23 = (line: keyof typeof LINES_23): string => `w23.${line}`;
/** the lines Dot says as TEACH lines (said on Normal's default Tips as on Help, D50) */
export const TEACH_23 = ['follow', 'heron', 'look', 'spooked'] as const;

// ───────────────────────────── the reeds and the heron ─────────────────────────────
/**
 * World 2's hides and its watcher for 2-3, as stillLay.ts rows (each id also a tag, so a socket asks for exactly the clump the beat is
 * designed with). The clumps by 2-3.md's flown widths: Normal 260-300 (the let-go window that holds him and all five: 260 = 0.3 s,
 * 300 = 0.4 s), Easy 340 (0.5 s); the heron's calm: taught long (the first look free), then the flown 5.0 s (STILL_RULE.calmMin)
 */
export const W23_STILL = {
  'w2-reeds-260': { role: 'hide', bush: 'reeds', w: 260 },
  'w2-reeds-300': { role: 'hide', bush: 'reeds', w: 300 },
  'w2-reeds-340': { role: 'hide', bush: 'reeds', w: 340 },
  'w2-heron': { role: 'watch', calm: { teach: [8, 9], early: [5, 6], late: [5, 5.5] }, lesson: ['teach-heron'], free: 'lesson' },
} as const satisfies Record<string, StillRow>;
type Reed = 260 | 300 | 340;

/** beat 7's second heron starts this late on Normal (2-3.md: two herons out of step, 3.2 s; lineFaults' safe window) */
export const LAG_23 = 3.2;

// ───────────────────────────── the pieces ─────────────────────────────
type R2 = [number, number];
/** a muddy marsh bank he walks on, `w` exact, level with the one before */
const bank = (key: string, after: string | null, w: number): SectionPiece => ({ key, shape: 'bank', w: [w, w], place: after ? { kind: 'walk', after, dy: [0, 0] } : { kind: 'start' }, style: 'log', main: true });
/** World 2's boulder to hop on the bank (the kit's painted rock, 50 px) */
const rock = (key: string, on: string, at: number): SectionPiece => ({ key, shape: 'block', w: [110, 120], place: { kind: 'on', on, at: [at, at], h: [50, 50] }, style: 'moss_stone', landing: true });
/** the far bank of a pond laid from `after` on 2-3's row `row` (gen2 place `pads`, rideLay.ts layPads) */
const pond = (key: string, after: string, row: Pond23, w: number): SectionPiece => ({ key, shape: 'bank', w: [w, w], place: { kind: 'pads', after, row }, style: 'log', main: true, landing: true });
/** a climbing vine on `on` at `x` px in (onW its width), `h` tall: the mooring post's rope (a tree_climb vine) */
const post = (key: string, on: string, onW: number, x: number, h: number): SectionPiece => ({ key, shape: 'vine', w: [0, 0], place: { kind: 'climb', on, at: [x / onW, x / onW], h: [h, h] } });

const petal = (id: string, on: string, t: number | R2, n = 1): Socket => ({ id, role: 'pickup', on, t, dn: 34, count: n, span: 80 });
const flag = (on: string, t = 0.3): Socket => ({ id: 'flag', role: 'flag', on, t });
const tip = (id: string, on: string, t: number, line: keyof typeof LINES_23): Socket => ({ id, role: 'tip', on, t, allow: [lineId23(line)] });
/** a reed clump centred on `on` at `t` (stillLay's hide emitter) */
const reeds = (id: string, on: string, t: number, w: Reed): Socket => ({ id, role: 'prop', on, t, allow: [`w2-reeds-${w}`] });
/** the heron's watch socket at the start of `on`: ids starting 'teach' are its lesson (the long calm, the free first look) */
const heron = (id: string, on: string, t = 0.03): Socket => ({ id, role: 'prop', on, t, allow: ['w2-heron'] });
/** a reed cage on `on` at `t` with its little one (a designed goal item: every one laid where it stands) */
const cage = (id: string, on: string, t: number, critter: 'duck' | 'otter' | 'capy', dn = 30): Socket => ({ id, role: 'objective', on, t, dn, allow: ['cage', critter] });

/** 2-3's ponds (rideLay.ts PadRow): the parade's stones (2-3.md beat 3: 90 px stones, 60 px of water between, splash-back) and the
 *  twist's 2-2 sinking pad (beat 6: no stopping on a pad; ONE small pad, so reed to reed is under 360 px of pond on both settings
 *  (lineFaults; two pads read 500 px), splash-back) */
export const PADS_23 = {
  parade23: { by: 'weight', pads: ['stone', 'stone'], gap: 60, safe: true },
  sink23: { by: 'weight', pads: ['small'], gap: 70, safe: true },
} as const satisfies Record<string, PadRow>;
type Pond23 = keyof typeof PADS_23;

// ───────────────────────────── a brick ─────────────────────────────
type Lay = { pieces: SectionPiece[]; sockets: Socket[] };
type V = { id: string; lay: Lay; easy?: Lay };
type Content = 'ground' | 'hazard' | 'water' | 'rope' | 'floating';
/** a brick (2-5's form, w2Arc25.ts): its first piece `in`, its last `out`, a version's Easy twin beside it, served to 2-3 alone, once */
function brick(o: { id: string; name: string; jobs: NodeJob[]; difficulty: number; content: Content | 'structural'; window?: [number, number]; teaches?: string; uses?: string[]; versions: V[]; phases?: SectionTemplate['phases']; maxPerStage?: number; tags?: string[] }): SectionTemplate {
  const ren = (ps: SectionPiece[]) => {
    const a = ps[0].key, z = ps[ps.length - 1].key;
    const f = (s: string) => (s === a ? 'in' : s === z ? 'out' : s);
    return ps.map((p) => ({ ...p, key: f(p.key), ...(p.from ? { from: f(p.from) } : {}), place: Object.fromEntries(Object.entries(p.place).map(([q, v]) => [q, (q === 'after' || q === 'on') && typeof v === 'string' ? f(v) : v])) as SectionPiece['place'] }));
  };
  const sk = (ps: SectionPiece[], ss: Socket[]) => { const a = ps[0].key, z = ps[ps.length - 1].key; return ss.map((s) => ({ ...s, on: s.on === a ? 'in' : s.on === z ? 'out' : s.on })); };
  const first = ren(o.versions[0].lay.pieces)[0];
  const versions = o.versions.flatMap((v) => [
    { id: v.id, pieces: ren(v.lay.pieces).slice(1), sockets: sk(v.lay.pieces, v.lay.sockets), ...(v.easy ? { easy: `${v.id}-easy` } : {}) },
    ...(v.easy ? [{ id: `${v.id}-easy`, pieces: ren(v.easy.pieces).slice(1), sockets: sk(v.easy.pieces, v.easy.sockets), easyOnly: true }] : []),
  ]);
  return {
    id: `w2-23-${o.id}`, name: o.name, feel: [STAGE_23], own: true, archetypes: 'any', phases: o.phases ?? ['ki', 'sho', 'ten', 'ketsu'], difficulty: o.difficulty, needs: ['walk'],
    ...(o.teaches ? { teaches: o.teaches } : {}), uses: o.uses ?? [], jobs: o.jobs, content: o.content, terrain: 'river-bank', maxPerStage: o.maxPerStage ?? 1, ...(o.window ? { window: o.window } : {}),
    ...(o.tags ? { tags: o.tags } : {}),
    pieces: [first], subBlocks: [{ id: 'body', versions }], entry: { piece: 'in', kind: 'ground' }, exit: { piece: 'out', kind: 'ground' }, exitDy: 0, sockets: [], mirrorable: false,
  } as SectionTemplate;
}

// ───────────────────────────── the beats ─────────────────────────────
/** [A] beat 0, arrive: the marsh, a boulder to hop; Dot's `follow` 800+ px before cage 1 (beat 1's cage stands 760 px into its brick) */
const arrival: Lay = {
  pieces: [bank('a', null, 440), rock('ra', 'a', 0.55), bank('b', 'a', 420), rock('rc', 'c', 0.5), bank('c', 'b', 400), bank('z', 'c', 300)],
  sockets: [tip('t-follow', 'b', 0.3, 'follow'), petal('pb', 'b', 0.7)],
};
/** [Tg] beat 1, the first cage, safe: a flat bank, the cage on it, nothing that hurts; then room to run and see it lag */
const firstCage: Lay = {
  pieces: [bank('a', null, 440), rock('ra', 'a', 0.4), bank('b', 'a', 560), rock('rc', 'c', 0.5), bank('c', 'b', 560), rock('rd', 'd', 0.5), bank('d', 'c', 420), bank('z', 'd', 300)],
  sockets: [flag('a', 0.15), cage('cage1', 'b', 0.7, 'duck'), petal('pc', 'c', 0.2), petal('pd', 'd', 0.8)],
};
/** [Tm] beat 2, the heron, safe: `heron` + `look` 800+ px before the bed; one wide reed bed 200 px on from the heron's stretch start; its
 *  first look only warns, the long calm; the flag before */
const firstHeron = (easy: boolean): Lay => ({
  pieces: [bank('a', null, 560), rock('rb', 'b', 0.5), rock('ra', 'a', 0.45), bank('b', 'a', 440), bank('c', 'b', 300), bank('d', 'c', easy ? 380 : 340), rock('re', 'e', 0.5), bank('e', 'd', 420), bank('z', 'e', 300)],
  sockets: [flag('a', 0.08), tip('t-heron', 'a', 0.2, 'heron'), tip('t-look', 'a', 0.6, 'look'), heron('teach-heron', 'c', 0.03), reeds('r1', 'd', 0.5, easy ? 340 : 300)],
});
/** [Pw] beat 3, the parade swims: stones over splash-back water; the line paddles behind him on his path; cage 2 (an otter pup) on the
 *  far bank, a boulder before it */
const parade: Lay = {
  pieces: [bank('a', null, 440), rock('ra', 'a', 0.4), pond('c', 'a', 'parade23', 520), rock('rd', 'd', 0.5), bank('d', 'c', 520), bank('z', 'd', 300)],
  sockets: [cage('cage2', 'c', 0.6, 'otter'), petal('pa', 'a', 0.4)],
};
/** [Xm] beat 4, clump to clump: two clumps over open mud, the heron on its calm; cage 3 (a capybara pup) in the far clump; the flag before.
 *  Normal G 400 (the dial, <= 500 one heron), W 300; Easy G 350, W 340 */
const clumps = (easy: boolean): Lay => {
  const W: Reed = easy ? 340 : 300, G = easy ? 350 : 400;
  return {
    pieces: [bank('a', null, 460), rock('ra', 'a', 0.6), bank('b', 'a', W), rock('rm', 'm', 0.5), bank('m', 'b', G), bank('c', 'm', W), rock('rd', 'd', 0.5), bank('d', 'c', 520), bank('z', 'd', 300)],
    sockets: [flag('a', 0.2), heron('watch-clumps', 'b', 0.03), reeds('r1', 'b', 0.5, W), reeds('r2', 'c', 0.5, W), cage('cage3', 'c', 0.6, 'capy')],
  };
};
/** [Pr] beat 5, up the mooring post: cage 4 hung near the top of the post (a climbing vine, nothing to step off onto at its top); the line
 *  waits at its foot; the pup drops to the bank and walks to the line */
const POST_H = 230;
const mooring: Lay = {
  pieces: [bank('a', null, 440), rock('ra', 'a', 0.5), bank('b', 'a', 360), post('pv', 'b', 360, 260, POST_H), rock('rc', 'c', 0.5), bank('c', 'b', 560), bank('z', 'c', 300)],
  sockets: [cage('cage4', 'b', 260 / 360, 'otter', POST_H - 40)],
};
/** [Wf] beat 6, TWIST: no stopping on the pond: 2-2's sinking pads over the watched pond to a reed isle (a short bank in its reeds) */
const pondTwist = (easy: boolean): Lay => ({
  pieces: [bank('a', null, 440), rock('ra', 'a', 0.4), bank('b', 'a', easy ? 360 : 320), pond('i', 'b', 'sink23', easy ? 380 : 340), bank('d', 'i', 560), rock('rd', 'd', 0.5), bank('z', 'd', 300)],
  sockets: [heron('watch-pond', 'b', 0.03), reeds('r0', 'b', 0.5, easy ? 340 : 300), reeds('ri', 'i', 0.5, easy ? 340 : 300)],
});
/** [Cm] beat 7, everything: three clumps over G 350, cage 5 in the middle one; Normal two herons out of step (the finish's lag), Easy one */
const everything = (easy: boolean): Lay => {
  const W: Reed = easy ? 340 : 300, G = 350;
  return {
    pieces: [bank('a', null, 460), rock('ra', 'a', 0.6), bank('b', 'a', W), rock('rm', 'm', 0.5), bank('m', 'b', G), bank('c', 'm', W), rock('rn', 'n', 0.5), bank('n', 'c', G), bank('d', 'n', W), rock('re', 'e', 0.5), bank('e', 'd', 420), bank('z', 'e', 300)],
    sockets: [flag('a', 0.2), heron('watch-two', 'b', 0.03), reeds('r1', 'b', 0.5, W), reeds('r2', 'c', 0.5, W), reeds('r3', 'd', 0.5, W), cage('cage5', 'c', 0.6, 'capy')],
  };
};
/** [S] beat 8, home: the village boardwalk; the families on the jetty; Dot's quiet `home` */
const homecoming: Lay = {
  pieces: [bank('a', null, 440), rock('ra', 'a', 0.4), bank('b', 'a', 900), rock('rb', 'b', 0.6), rock('rc', 'c', 0.5), bank('c', 'b', 620), bank('z', 'c', 300)],
  sockets: [],
};
/** [R] a rest on the bank between beats: a boulder to hop, petals */
const rest: Lay = {
  pieces: [bank('a', null, 360), rock('ra', 'a', 0.5), bank('b', 'a', 460), rock('rc', 'c', 0.6), bank('c', 'b', 360), bank('z', 'c', 300)],
  sockets: [{ id: 'find', role: 'findSpot', on: 'a', t: 0.5 }, petal('pz', 'z', 0.5)],
};

/** THE ARC'S BRICKS (2-3.md), one job each */
export const BEATS_23: SectionTemplate[] = [
  brick({ id: 'marsh', name: 'the marsh', jobs: ['arrive'], difficulty: 1, content: 'structural', phases: ['start'], versions: [{ id: 'marsh', lay: arrival }] }),
  brick({ id: 'first-cage', name: 'the first cage, safe', jobs: ['teach'], difficulty: 1, content: 'ground', teaches: FOLLOW_LESSON, window: [0, 0.2], versions: [{ id: 'cage', lay: firstCage }] }),
  brick({ id: 'first-heron', name: 'the heron, safe', jobs: ['teach'], difficulty: 1, content: 'hazard', teaches: HERON_LESSON, uses: [FOLLOW_LESSON], window: [0.05, 0.35], tags: ['cover'], versions: [{ id: 'bed', lay: firstHeron(false), easy: firstHeron(true) }] }),
  brick({ id: 'parade', name: 'the parade swims', jobs: ['practise'], difficulty: 2, content: 'water', uses: [FOLLOW_LESSON], window: [0, 0.6], versions: [{ id: 'stones', lay: parade }] }),
  brick({ id: 'clumps', name: 'clump to clump', jobs: ['test'], difficulty: 4, content: 'hazard', uses: [FOLLOW_LESSON, HERON_LESSON], tags: ['cover'], versions: [{ id: 'two', lay: clumps(false), easy: clumps(true) }] }),
  brick({ id: 'post', name: 'up the mooring post', jobs: ['practise'], difficulty: 3, content: 'rope', window: [0.3, 1], versions: [{ id: 'post', lay: mooring }] }),
  brick({ id: 'pond', name: 'no stopping on the pond', jobs: ['twist'], difficulty: 5, content: 'floating', uses: [FOLLOW_LESSON, HERON_LESSON], tags: ['cover'], versions: [{ id: 'isle', lay: pondTwist(false), easy: pondTwist(true) }] }),
  brick({ id: 'everything', name: 'everything', jobs: ['combine'], difficulty: 6, content: 'hazard', uses: [FOLLOW_LESSON, HERON_LESSON], tags: ['cover'], versions: [{ id: 'three', lay: everything(false), easy: everything(true) }] }),
  brick({ id: 'home', name: 'home', jobs: ['signature'], difficulty: 1, content: 'ground', versions: [{ id: 'boardwalk', lay: homecoming }] }),
  brick({ id: 'rest', name: 'a rest on the bank', jobs: ['rest'], difficulty: 1, content: 'structural', phases: ['rest'], maxPerStage: 6, versions: [{ id: 'bank', lay: rest }] }),
];

/** [E] the village gate: the far bank and the exit totem */
export const EXIT_23: SectionTemplate = {
  id: 'w2-23-gate', name: 'the village gate', feel: [STAGE_23], own: true, archetypes: 'any', phases: ['goal'], difficulty: 1, needs: ['walk'], jobs: ['exit'], content: 'structural', terrain: 'river-bank',
  pieces: [{ key: 'in', shape: 'bank', w: [300, 300], place: { kind: 'start' }, style: 'log', main: true, landing: true }],
  subBlocks: [{ id: 'body', versions: [{ id: 'bank', pieces: [{ key: 'out', shape: 'bank', w: [560, 580], place: { kind: 'walk', after: 'in', dy: [0, 0] }, style: 'log', main: true, landing: true }], sockets: [{ id: 'exit-totem', role: 'objective', on: 'out', t: 0.85, allow: ['exit_totem'] }] }] }],
  entry: { piece: 'in', kind: 'ground' }, exit: { piece: 'out', kind: 'ground' }, exitDy: 0, sockets: [], mirrorable: false,
} as SectionTemplate;

/** every section that is 2-3's own */
export const SECTIONS_23: SectionTemplate[] = [...BEATS_23, EXIT_23];

type FinishStage = { proto?: Partial<StageSink['proto']>; gen2?: { sections: Array<{ uid: string; template: string; x0: number; x1: number }> } };
/** the twist's brick: its heron watches the whole pond, from the near bank's clump over the pads to the isle (a watched stretch ends at
 *  a gap: stillLay watchedRun; here the look is ACROSS the water, 2-3.md beat 6 "the heron over the pond") */
const POND_23 = 'w2-23-pond';

/**
 * 2-3's finish (listed.ts FINISH 'w2-23'): the little ones follow him (proto.follow = World 2's row); each watched stretch cut to its
 * reeds (clipWatches); on Normal beat 7's stretch gets its second heron, LAG_23 s out of step (WatchZone.lag); on Easy one.
 */
export function finish23<T extends FinishStage>(st: T, difficulty: Difficulty): T {
  const sink = st as unknown as Pick<StageSink, 'proto'>;
  (sink.proto as { follow?: typeof W2_FOLLOW }).follow = W2_FOLLOW;
  // (the pond's stretch first, to the isle's reeds and STILL.past on: clipWatches then keeps it, its last hide the isle's)
  for (const sec of st.gen2?.sections ?? []) {
    if (sec.template !== POND_23) continue;
    const z = sink.proto.watch?.find((q) => q.x0 >= sec.x0 - 1 && q.x0 <= sec.x1);
    const isle = (sink.proto.bushes ?? []).filter((b) => b.x >= sec.x0 && b.x + b.w <= sec.x1).sort((a, b) => b.x - a.x)[0];
    if (!z || !isle) throw new Error(`2-3 finish: the pond (${sec.uid}) has ${z ? 'no isle reeds' : 'no heron'}`);
    z.x1 = Math.round(isle.x + isle.w + STILL.past - STILL.inset);
  }
  clipWatches(sink);
  if (difficulty !== 'easy') {
    const zones = sink.proto.watch ?? [];
    const bushes = sink.proto.bushes ?? [];
    // (beat 7 is the stretch with three clumps in it: the only one; its second heron reads the same stretch, out of step)
    const two = zones.filter((z) => bushes.filter((b) => b.x + b.w > z.x0 && b.x < z.x1).length >= 3);
    for (const z of two) zones.push({ ...z, freeFirst: undefined, lag: LAG_23 } as WatchZone);
  }
  return st;
}

/**
 * World 2's kit with 2-3's rows over it (stageTable.ts kit 'w2-23', listed.ts KITS): its pool is its own sections alone; its reeds and
 * heron (stillLay.ts); its ponds; its graph and brief; the keeper's lines as the kit's tips.
 */
export function kitLib23(): WorldKit {
  const k = w2World(), M = k.manifest, G = M.graphs!;
  const props: PropDef[] = stillProps(W23_STILL).map((p) => ({ ...p, tags: [...p.tags, p.id] }));
  return { ...k,
    emit: { ...k.emit, ...stillEmitters(W23_STILL, STAGE_N) },
    manifest: { ...M,
      props: [...M.props.filter((p) => !props.some((q) => q.id === p.id)), ...props],
      sections: SECTIONS_23,
      pads: PADS_23,
      moves: [...M.moves.filter((m) => m !== 'climb'), 'climb'],
      lessons: { ...M.lessons, [FOLLOW_LESSON]: STAGE_23, [HERON_LESSON]: STAGE_23 },
      required: {},
      tips: { ...M.tips, ...Object.fromEntries((Object.keys(LINES_23) as Array<keyof typeof LINES_23>).map((key) => [lineId23(key), LINES_23[key]])) },
      teachTips: [...(M.teachTips ?? []), ...TEACH_23.map(lineId23)],
      graphs: { ...G, list: [...G.list.filter((g) => g.archetype !== 'rescue'), ...Object.entries(ARC_23).map(([id, code]) => ({ id, archetype: 'rescue' as const, code }))], briefs: { ...G.briefs, [STAGE_23]: BRIEF_23 } },
    } } as WorldKit;
}
