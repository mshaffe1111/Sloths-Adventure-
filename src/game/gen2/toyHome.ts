/**
 * gen2/toyHome: a tiny test world for the OUT-AND-BACK shape (ENG-27; reference/design/2-7.md "READY before the builder", level.md rule
 * 23): a run right on World 2's ground with a river flowing back at him, a way DOWN (the toy tower's drops), and a run back LEFT on the
 * ground at the column's foot with rivers flowing left, with him. Laid by gen2 the way the game lays a listed stage (legs.ts, the
 * lay's mirror of a left leg, its rivers turned with it), so the lay, the verdicts, the flags, the petals and the bots can be proven on
 * a left leg with water before any level is built on it.
 *
 * Nothing here is played, and it is no stage of the game: 2-7's own pieces come with 2-7's build. No stage id, seed or place of the
 * game's (the stage id the brief is keyed by is the caller's).
 */
import type { SectionPiece, SectionTemplate, WorldKit } from './types.ts';
import { dropsDown, landing, upManifest } from './toyTower.ts';
import { logRun, pitHop, stepRun } from './toyLegs.ts';
import { W2_GROUND, W2_POST_ART, W2_RACE, W2_RIVERS } from './worlds/w2.ts';

type Job = NonNullable<SectionTemplate['jobs']>[number];
type Content = NonNullable<SectionTemplate['content']>;
type Row = keyof typeof W2_RIVERS;

const brick = (of: SectionTemplate, id: string, job: Job, content: Content): SectionTemplate => {
  const { teaches: _t, uses: _u, ...plain } = of;
  return { ...plain, id, name: id, jobs: [job], content, phases: ['ki', 'sho', 'ten', 'ketsu'] };
};
/** World 2's bank he waits on, `w` exact */
const bank = (key: string, w: number): SectionPiece => ({ key, shape: 'bank', w: [w, w], place: { kind: 'start' }, style: 'log', main: true });
/** the far bank of a river of World 2's row `row` laid from `after` (place `river`, riverLay.ts layRiver) */
const across = (key: string, after: string, row: Row, w: number): SectionPiece => ({ key, shape: 'bank', w: [w, w], place: { kind: 'river', after, row }, style: 'log', main: true, landing: true });
/** a river crossing: a bank, the water of row `row`, a bank (three petals on the far bank: the natural line off the logs) */
const crossing = (id: string, job: Job, row: Row): SectionTemplate => ({
  id, name: `${id} (${row})`, archetypes: 'any', phases: ['ki', 'sho', 'ten', 'ketsu'], difficulty: 3, jobs: [job], content: 'water',
  pieces: [bank('near', 280), across('far', 'near', row, 320)],
  entry: { piece: 'near', kind: 'ground' }, exit: { piece: 'far', kind: 'ground' }, exitDy: 0,
  sockets: [{ id: 'petals', role: 'pickup', on: 'far', t: 0.5, dn: 34, count: 3, span: 120, allow: ['pickups'] }],
  mirrorable: false,
});

/** one brick a beat. Out (right): a bank hop, a river flowing back at him (`back`). Down: the toy tower's drops. Home (left): logs over a
 *  pit, a river with him (`ride`, its splash-back), a step run, the twin river, the long river (the signature) */
export const HOME_BRICKS: SectionTemplate[] = [
  brick(pitHop, 'home-practise-ground', 'practise', 'ground'),
  crossing('home-test-back', 'test', 'back'),
  brick(dropsDown, 'home-descent', 'descent', 'climb'),
  brick(logRun, 'home-practise-floating', 'practise', 'floating'),
  crossing('home-practise-ride', 'practise', 'ride'),
  brick(stepRun, 'home-flow', 'flow', 'ground'),
  crossing('home-twist-twin', 'twist', 'twin'),
  brick(logRun, 'home-twist-floating', 'twist', 'floating'),
  crossing('home-signature-long', 'signature', 'long'),
];

/** the post toy's doors on the way out (2-7 has 6 on its longer out leg, three on the weir's porches; POST_CODE's holds 2 walked pieces
 *  clear of the spawn, its flags, each other, every log's landing and every double jump's on 11 rolls of 12, the 12th refused by name) */
export const TOY_DOORS = 2;

/** the toy's graph: out right with the river at him, down a column, home left with the rivers (2-7's shape, its node string's legs) */
export const HOME_CODE = 'A Pg1> Xw1> R /D Dc_ /L Pf1< Pw1> Mg1> Ww1> R Sw1> E';
/** the POST toy's (ENG-27c): the same with a flow of ground and a rest before the weir, 2-7's longer way out, where its doors stand (on
 *  HOME_CODE's short out leg only one door stood clear of a log's and a double jump's landing on 3 rolls in 12). It lays the post */
export const POST_CODE = 'A Pg1> Xw1> R Fg1> R /D Dc_ /L Pf1< Pw1> Mg1> Ww1> R Sw1> E';
/** the same beats turned back at the out leg's own ground (no column): the overlay the 2-7 designer found (Pushback 1), refused by name */
export const SAME_GROUND_CODE = 'A Pg1> Xw1> R /L Pf1< Pw1> Mg1> Wf1> R Sw1> E';

/** a kit whose one graph is `code`, for the stage `stageId` (the brief is keyed by the stage's id, which the caller names) */
/** the toy's kit for a graph code; `post`: its brief lays the post (POST_CODE's does unless asked otherwise) */
export const homeKit = (stageId: string, code = HOME_CODE, post = code === POST_CODE): WorldKit => ({
  manifest: {
    ...upManifest,
    world: 2,
    name: 'Toy out and back',
    ground: { y: W2_GROUND.y, bankH: W2_GROUND.bankH, style: 'log' },
    rivers: W2_RIVERS,
    creatures: [], props: [], pairs: [], tips: {},
    sections: [landing, ...HOME_BRICKS],
    graphs: {
      list: [{ id: 'home', archetype: 'sprint', code }],
      // (the deal is the code's own content mix: 2 ground, 3 water, 1 climb, 1 floating of 7)
      briefs: { [stageId]: { ends: 'quiet', trend: 'level', branching: 'none', teaches: [], deal: { ground: 200 / 7, water: 300 / 7, climb: 100 / 7, floating: 100 / 7 }, dealExact: true, pacer: W2_RACE, ...(post ? { post: { doors: TOY_DOORS, art: W2_POST_ART } } : {}) } },
      chunkSeconds: 10,
    },
  },
  emit: {},
});
