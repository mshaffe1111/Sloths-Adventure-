/**
 * Every puzzle room in Worlds 1-6, as the game builds them (Normal and Easy, two rolls): Dot never gives the answer as he walks in
 * (polish report DOT-2; Matt, 2026-10-29). Each room that speaks on entry names the problem, and has a nudge (after struggle) and the
 * move (Help only, after more struggle); the line on entry does not say the move; every line is under 10 words.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import '../../src/game/headlessDom.ts';
import { stageList } from './stages.ts';
import { tipText, type RoomSpec, type TipLine } from '../../src/game/puzzleKit.ts';

const words = (s: string) => s.trim().split(/\s+/).length;
/** the meaning words of a line (4 letters or more) */
const meaning = (s: string) => new Set(s.toLowerCase().replace(/[^a-z' ]/g, ' ').split(/\s+/).filter((w) => w.length > 3));

function rooms(): Array<{ stage: string; room: RoomSpec }> {
  const out: Array<{ stage: string; room: RoomSpec }> = [];
  for (const w of [1, 2, 3, 4, 5, 6]) {
    for (const seed of [1, 2]) {
      for (const e of stageList([w], seed).stages) {
        for (const easy of [false, true]) {
          let st;
          try {
            st = e.build(easy);
          } catch {
            continue;
          }
          for (const room of st.kit?.rooms ?? []) out.push({ stage: e.id, room });
        }
      }
    }
  }
  return out;
}

test('no puzzle room gives the answer on entry: a name, a nudge and the move, each under 10 words (Worlds 1-6)', () => {
  const all = rooms();
  assert.ok(all.length > 20, `rooms found: ${all.length}`);
  const problems: string[] = [];
  const seen = new Set<string>();
  for (const { stage, room } of all) {
    const t = room.tips;
    // (Meeca's stage speaks through Meeca and Flicker, meecaLines.ts, with its own on-request hints)
    if (!t?.enter || stage.endsWith('-M')) continue;
    const key = `${stage} ${room.id.replace(/\d+$/, '')} ${tipText(t.enter)}`;
    if (seen.has(key)) continue;
    seen.add(key);
    if (!t.nudge || !t.move) problems.push(`${key}: no nudge or move`);
    for (const [k, l] of Object.entries(t)) if (k !== 'mech' && l && words(tipText(l as TipLine)) >= 10) problems.push(`${key}: ${k} is ${words(tipText(l as TipLine))} words`);
    if (t.move) {
      const enter = meaning(tipText(t.enter));
      const mv = [...meaning(tipText(t.move))];
      const shared = mv.filter((w) => enter.has(w));
      if (shared.length >= Math.max(2, mv.length / 2)) problems.push(`${key}: the entry line says the move ("${tipText(t.move)}")`);
    }
  }
  assert.deepEqual(problems, []);
});
