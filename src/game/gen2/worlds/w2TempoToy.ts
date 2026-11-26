/**
 * The court's TEMPO toy (reference/design/2-9.md NEW 1, R-165.449; ENG-29b): a REAL World 2 row (level.md rule 23), TEST and TOOL ONLY
 * (nothing in the game imports it). The kit is 2-4's (worlds/w2Arc24.ts kitLib24) cut to its arrival, its first drop (2-4's liana over a
 * river, the river on World 2's `court` row: a log every bar), a pond of snap stones on the court's bar (2-5's jaws, counted in beats),
 * a rest and the jetty, under a brief that names the court's tempo (GraphBrief.tempo: gen2's finish locks every liana to the bar and
 * holds every clock to it, tempo.ts). The row a test lays through listed.ts's test seam (`{ [TEMPO_ID]: tempoRow() }`).
 */
import { BRIEF_24, DROP_LESSON, EXIT_24, SECTIONS_24, STAGE_24, kitLib24 } from './w2Arc24.ts';
import { w2Finish, W2_RIVERS } from './w2.ts';
import { generateAllLevels } from '../../worldsData.ts';
import type { TempoSpec } from '../../tempo.ts';
import type { PadRow } from '../rideLay.ts';
import type { RiverRow } from '../riverLay.ts';
import type { ListedStage } from '../listed.ts';
import type { GraphBrief, SectionTemplate, WorldKit } from '../types.ts';
import type { LevelConfig } from '../../types.ts';

/** the toy's stage id (no listed stage, no other toy: the test seam refuses a listed one) */
export const TEMPO_ID = '2-90';
/** the court's tempo as 2-9.md writes it: one liana swing (TIMED.period: 2.85 s Normal, 3.3 s Easy) is a bar of four */
export const COURT_TEMPO: TempoSpec = { beats: 4, bar: 2.85, easyStretch: 3.3 / 2.85, lock: 0 };
/** a pond of two snap stones counted in the court's beats (a bite on four of one bar; Easy the court's own stretch, 0.825 s a count) */
export const COURT_STONES: PadRow = { by: 'snap', pads: ['snap', 'snap'], gap: 30, snap: { count: 0.7125 }, clock: 'court', easyStretch: COURT_TEMPO.easyStretch };

/** the sections of 2-4 the toy keeps: its arrival, its first drop (one liana over a river), drop-ride-drop (two), a rest and the jetty;
 *  every river of theirs on `court` (2-4's own rows there: long24, ride24, deep24) */
const KEEP = ['w2-24-edge', 'w2-24-first-drop', 'w2-24-drop-ride-drop', 'w2-24-rest'];
/** a kept section as the toy's own (`feel`: an `own` section serves only the stages it names), its 2-4 river row on `court` */
const onCourt = (t: SectionTemplate): SectionTemplate => ({ ...(JSON.parse(JSON.stringify(t).replace(/"row":"(long24|ride24|deep24)"/g, '"row":"court"')) as SectionTemplate), feel: [TEMPO_ID], ...(REPEAT.includes(t.id) ? { maxPerStage: 4, jobs: ['practise', 'signature'] } : {}) });
/** the kept pieces that may come again, and fill the signature (gen2 fills a stage's length by time: the cut pool runs short of a stage's
 *  two minutes otherwise) */
const REPEAT = ['w2-24-drop-ride-drop'];
/** the stones: 2-5's pond shape (a near bank, the stones, the far bank level with it) */
const STONES_SECTION: SectionTemplate = {
  id: 'toy-court-stones', name: 'stones on the beat', feel: [TEMPO_ID], own: true, archetypes: 'any', phases: ['ki', 'sho', 'ten', 'ketsu'], difficulty: 2, needs: ['jump'],
  uses: [], jobs: ['practise'], content: 'floating', terrain: 'river-bank', maxPerStage: 4,
  pieces: [
    { key: 'in', shape: 'bank', w: [360, 360], place: { kind: 'start' }, style: 'log', main: true },
    { key: 'out', shape: 'bank', w: [420, 420], place: { kind: 'pads', after: 'in', row: 'stones' }, style: 'log', main: true, landing: true },
  ],
  entry: { piece: 'in', kind: 'ground' }, exit: { piece: 'out', kind: 'ground' }, exitDy: 0, sockets: [], mirrorable: false,
} as SectionTemplate;

export interface TempoToyOpts {
  /** the court river's row (a planted fault: its speed) */
  court?: RiverRow;
  /** the stones' row (a planted fault: a count off the beat) */
  stones?: PadRow;
  /** the brief's tempo; null: none (the stage laid as it always was) */
  tempo?: TempoSpec | null;
}

/** the toy's kit: 2-4's, cut to the court pieces, under a brief with the tempo */
export function tempoKit(o: TempoToyOpts = {}): WorldKit {
  const k = kitLib24(), M = k.manifest, G = M.graphs!;
  const tempo = o.tempo === undefined ? COURT_TEMPO : o.tempo;
  const brief: GraphBrief = { ...BRIEF_24, deal: { rope: 50, floating: 50 }, ...(tempo ? { tempo } : {}) };
  return { ...k,
    manifest: { ...M,
      sections: [...[...SECTIONS_24.filter((s) => KEEP.includes(s.id)), EXIT_24].map(onCourt), STONES_SECTION],
      rivers: { ...M.rivers, court: o.court ?? W2_RIVERS.court },
      pads: { ...(M.pads ?? {}), stones: o.stones ?? COURT_STONES },
      lessons: { ...M.lessons, [DROP_LESSON]: TEMPO_ID },
      graphs: { ...G, list: [{ id: 'court-toy', archetype: 'vine_runner', code: 'A Tr Pf R S E' }], briefs: { [TEMPO_ID]: brief } },
    } } as WorldKit;
}

/** the toy's level: 2-4's (a vine_runner: reach the jetty) under the toy's id */
export function tempoCfg(): LevelConfig {
  const c = generateAllLevels().find((q) => q.id === STAGE_24 && !q.secret)!;
  return { ...c, id: TEMPO_ID, unlocked: true };
}

/** the toy's stageTable row (World 2's finish, as every World 2 row) */
export const tempoRow = (o: TempoToyOpts = {}, seeds: number[] = []): ListedStage & { seeds: number[] } =>
  ({ kit: () => tempoKit(o), world: (s, _sq, d) => w2Finish(s as never, d) as typeof s, seeds });
