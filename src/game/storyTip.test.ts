// A stage's own STORY beat (ENG-JETTY item 3, 11-23): a tip the world marks as a story line (WorldManifest.storyTips, by tip id, with
// its speaker) is laid as StageHint.story and said through GuideOpts.who as a story line, so it is heard on Normal's default (Tips) and
// Easy's (Help); a plain tip is chatter to Tips and dropped there (dotGuideHelp.ts helpAllows; 2-7's hand-over and race challenge).
// RED without the field: the hint carries no speaker, the engine sends no `who`, and Tips drops the line.
import test from 'node:test';
import assert from 'node:assert/strict';
import './headlessDom.ts';
import { RealPlay } from './realPlay.ts';
import { buildGen2Stage } from './gen2/pipeline.ts';
import { generateAllLevels } from './worldsData.ts';
import { LINES_25, STAGE_25, kitLib25, lineId25 } from './gen2/worlds/w2Arc25.ts';
import { engineGuideLine } from './dotLines.ts';
import { helpAllows } from './dotGuideHelp.ts';
import type { StageHint } from './protoStage.ts';
import type { WorldKit } from './gen2/types.ts';

test("story tip 1: a world's story tip is laid with its speaker (2-5's 'quiet' marked a story beat on a planted kit); others are not", () => {
  const k = kitLib25();
  const kit = { ...k, manifest: { ...k.manifest, storyTips: { [lineId25('quiet')]: 'Dot' } } } as WorldKit;
  const cfg = generateAllLevels().find((c) => c.id === STAGE_25 && !c.secret)!;
  const st = buildGen2Stage({ config: cfg, kit, seed: 1, difficulty: 'normal' }) as unknown as { proto: { hints: StageHint[] } };
  const quiet = st.proto.hints.find((h) => h.text === LINES_25.quiet);
  assert.ok(quiet, "the 'quiet' tip is laid");
  assert.equal(quiet.story, 'Dot', 'with its speaker');
  assert.ok(st.proto.hints.filter((h) => h !== quiet).every((h) => h.story === undefined), 'no other tip is a story beat');
  // (the kit as shipped marks none: nothing moves on a listed stage until its data asks)
  const plain = buildGen2Stage({ config: cfg, kit: k, seed: 1, difficulty: 'normal' }) as unknown as { proto: { hints: StageHint[] } };
  assert.ok(plain.proto.hints.every((h) => h.story === undefined));
});

test('story tip 2: the engine says a story hint with its speaker, and it is heard on Tips and Help defaults; a plain hint is dropped on Tips', () => {
  const r = new RealPlay('2-1', 1);
  const e = r.e as unknown as { proto: { hints: StageHint[] }; guide(text: string, s: number, o?: { who?: string; teach?: true }): void };
  const said: Array<{ text: string; who?: string }> = [];
  const g = e.guide.bind(e);
  e.guide = (text, s, o) => (said.push({ text, who: o?.who }), g(text, s, o));
  const x = r.p.x;
  const STORY = 'Planted: a story beat by Pokey.';
  const PLAIN = 'Planted: a plain line.';
  e.proto.hints.push({ x: x + 10, text: STORY, pad: STORY, keys: STORY, story: 'Pokey' }, { x: x + 30, text: PLAIN, pad: PLAIN, keys: PLAIN });
  for (const at of [x + 12, x + 32]) {
    for (let i = 0; i < 3; i++) {
      r.p.x = at;
      r.frame();
    }
  }
  const story = said.find((l) => l.text === STORY), plain = said.find((l) => l.text === PLAIN);
  assert.deepEqual(story, { text: STORY, who: 'Pokey' }, 'the story hint goes with its speaker');
  assert.equal(plain?.who, undefined, 'a plain hint goes as before');
  const s = engineGuideLine(STORY, '2-1', { dot: true, who: 'Pokey' })!, p = engineGuideLine(PLAIN, '2-1', { dot: true })!;
  for (const help of ['reminders', 'teach'] as const) assert.ok(helpAllows(s, help, new Set(), true), `the story beat is heard on ${help}`);
  assert.equal(helpAllows(p, 'reminders', new Set(), true), false, 'a plain line is chatter to Tips (why the field exists)');
});
