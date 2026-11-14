/**
 * gen2/snakeLay — the vine snake and the false liana as pieces any world lays (1-6.md NEW 2+3; ENG-S4 SNAKE-LAY; NODE letter `n`,
 * nodeLetters.ts). A snake rides a liana the section already lays, so it is laid as 1-4's fields are (w1Arc14.ts finish14): a stage's
 * finish (listed.ts FINISH) finds each laid section's lianas by their piece key (the pieces carry `uid:key` when the stage's brief asks,
 * GraphBrief.tags) and puts the snakes its world's table names on them:
 *   SnakeTable.sections   per section template, the snakes its lianas carry (`SnakeRow`: the liana's key, the route, the beat), and
 *                         what Easy lays instead (1-6.md: on Easy none rise)
 *   SnakeTable.beats      the beats they keep (beat.ts beatDef: off, the tell, the trip); each listed once in the stage's clocks
 *   laySnakes             lays them, and THROWS when the result breaks a snake rule (vineSnake.ts snakeFaults: the beat and its tell,
 *                         a false liana that swings, and the view: the snake seen 1 s before it reaches his hands, its tell seen
 *                         where the view fits it, on the phones the framing names, with the level's top and foot), so a roll that
 *                         cannot be laid fair is never listed
 * A false liana (route 'still') hangs still: the lay takes its swing away (it never sweeps an arc: its tell). The level check leaves it
 * out of the route (levelCheck.ts isFalseLiana), so a section whose only way on is a false liana is refused there.
 *
 * Easy's beats are Normal's stretched (easyStretch >= 1): slower is never less seen, so the view is judged on Normal's beat.
 * No stage id, seed or x lives here: a world's table names section templates and piece keys only.
 */
import { beatDef } from '../beat.ts';
import type { ClockDef, ClockId } from '../stageKit.types.ts';
import type { Vine } from '../types.ts';
import { snakeFaults, type SnakeRoute, type VineSnake } from '../vineSnake.ts';

/** a beat a world's snakes keep: every `period` s it shows its tell for `tell` s, then travels for `on` s; Easy stretches it */
export interface SnakeBeat {
  period: number;
  tell: number;
  on: number;
  easyStretch?: number;
}

/** a snake on one of a section's lianas */
export interface SnakeRow {
  /** the liana's piece key in its section */
  liana: string;
  route: SnakeRoute;
  /** the beat it keeps (a travelling snake; a false liana has none) */
  beat?: ClockId;
  /** its stagger on that beat (s) */
  shift?: number;
  /** how far it comes (vineSnake.ts VineSnake.reach) */
  reach?: number;
  /** on Easy: not laid ('none'), or laid with these instead (1-6.md: on Easy snakes only pass or come down) */
  easy?: 'none' | Partial<Omit<SnakeRow, 'liana' | 'easy'>>;
}

export interface SnakeTable {
  beats: Readonly<Record<ClockId, SnakeBeat>>;
  /** by section template id: the snakes its lianas carry */
  sections: Readonly<Record<string, readonly SnakeRow[]>>;
}

/** the stage the lay finishes: its lianas (tagged by section uid and piece key), its beats, its height, and the sections laid */
export type SnakeStage = { config: { levelHeight: number }; vines: Vine[]; clocks?: ClockDef[]; gen2?: { sections?: ReadonlyArray<{ uid: string; template: string }> } };

/** a world's snake beat as the stage's clock runs it */
export const snakeClock = (id: ClockId, b: SnakeBeat): ClockDef => beatDef(id, b.period, b.tell, b.on, b.easyStretch ?? 1);

/**
 * Put the table's snakes on the stage's laid lianas (`easy`: Easy's rows), list their beats once, and throw if any snake the stage then
 * carries is unfair (snakeFaults). Returns the stage.
 */
export function laySnakes<T extends SnakeStage>(st: T, t: SnakeTable, easy: boolean): T {
  const byTag = new Map<string, Vine>();
  for (const v of st.vines) if (v.tag) byTag.set(v.tag, v);
  const used: ClockId[] = [];
  for (const s of st.gen2?.sections ?? []) {
    for (const row0 of t.sections[s.template] ?? []) {
      const e = easy ? row0.easy : undefined;
      if (e === 'none') continue;
      const row: SnakeRow = e ? { ...row0, ...e } : row0;
      const v = byTag.get(`${s.uid}:${row.liana}`);
      if (!v) throw new Error(`snake lay: section ${s.uid} (${s.template}) laid no piece ${row.liana} (is the stage's brief tagged?)`);
      if (v.vineType === 'tree_climb') throw new Error(`snake lay: section ${s.uid} (${s.template}) piece ${row.liana} is a climbing vine (a snake rides a liana)`);
      if (row.route === 'still') {
        v.snake = { route: 'still' };
        v.swingAmp = 0;
        continue;
      }
      const b = row.beat !== undefined ? t.beats[row.beat] : undefined;
      if (!b || row.beat === undefined) throw new Error(`snake lay: section ${s.uid} (${s.template}) snake on ${row.liana}: its beat ${row.beat ?? '(none)'} is not in the table`);
      if ((b.easyStretch ?? 1) < 1) throw new Error(`snake lay: beat ${row.beat} is quicker on Easy (easyStretch ${b.easyStretch})`);
      const sn: VineSnake = { route: row.route, clock: row.beat, ...(row.shift ? { shift: row.shift } : {}), ...(row.reach !== undefined ? { reach: row.reach } : {}) };
      v.snake = sn;
      if (!used.includes(row.beat)) used.push(row.beat);
    }
  }
  if (used.length) {
    const clocks = (st.clocks ??= []);
    for (const id of used) if (!clocks.some((c) => c.id === id)) clocks.push(snakeClock(id, t.beats[id]));
  }
  const bad = snakeFaults(st);
  if (bad.length) throw new Error(`snake lay: ${bad.length} unfair (${bad[0]})`);
  return st;
}
