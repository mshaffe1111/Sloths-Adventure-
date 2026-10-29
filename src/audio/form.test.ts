import { test } from 'node:test';
import assert from 'node:assert/strict';
import { composeStage } from './composer.ts';
import { stageMusic } from './scenes.ts';
import { themeById } from './themes.ts';
import { autoForm, formBars, FORMS, ornament, parseBar, rerhythm, hint } from './form.ts';
import { chordPcs, hashStr, parseChord, rng, SCALES } from './theory.ts';
import { AudioCore } from './core.ts';
import { Playback } from './music.ts';
import { fakeCtx } from './testCtx.ts';

const len = (b: string) => parseBar(b).reduce((a, t) => a + t.len, 0);
const PCS: Record<string, number> = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
const tonicPc = (t: string) => (PCS[t[0]] + (t[1] === '#' ? 1 : t[1] === 'b' ? -1 : 0) + 12) % 12;

test('every world: a stage plays a form of 8-9 sections, with a C, a bridge and a quiet passage, 64-80 bars long', () => {
  for (let w = 1; w <= 10; w++) {
    for (let s = 1; s <= 12; s++) {
      const th = composeStage(w, s * 7919, 'run');
      assert.ok(th.form, `world ${w} seed ${s}: no form`);
      const names = th.form.map((p) => p.name);
      assert.equal(names[0], 'A', 'a stage still opens on its tune');
      for (const n of ['B', 'C', 'bridge', 'break']) assert.ok(names.includes(n), `world ${w}: no ${n} in ${names}`);
      const bars = formBars(th.form);
      assert.ok(bars >= 64 && bars <= 80, `world ${w}: ${bars} bars`);
    }
  }
});

test('the sections vary: in a whole form no 8 bars of the tune come back note for note more than twice', () => {
  for (let w = 1; w <= 10; w++) {
    const th = composeStage(w, 4242 + w, 'run');
    const blocks = th.form!.map((p) => (p.lines?.lead ?? []).join('|'));
    const counts = new Map<string, number>();
    for (const b of blocks) counts.set(b, (counts.get(b) ?? 0) + 1);
    const most = Math.max(...counts.values());
    assert.ok(most <= 2, `world ${w}: one section's tune plays ${most} times`);
    assert.ok(counts.size >= 7, `world ${w}: only ${counts.size} different tunes in ${blocks.length} sections`);
  }
});

test('each stage gets its own order of sections', () => {
  for (let w = 1; w <= 10; w++) {
    const orders = new Set<string>();
    for (let s = 0; s < 40; s++) orders.add(composeStage(w, hashStr(`${w}-${s}`), 'run').form!.map((p) => p.name).join(' '));
    assert.ok(orders.size >= 3, `world ${w}: ${orders.size} orders`);
    assert.ok(orders.size <= FORMS.length);
  }
});

test("every section stays in the stage's key: each chord's root is a note of the scale", () => {
  for (let w = 1; w <= 10; w++) {
    for (let s = 1; s <= 6; s++) {
      const th = composeStage(w, s * 104729, 'run');
      const t = tonicPc(th.tonic);
      const scale = new Set(SCALES[th.scale].map((x) => (x + t) % 12));
      for (const part of th.form!) {
        for (const c of part.chords) {
          const ch = parseChord(c);
          assert.ok(scale.has(ch.rootPc), `world ${w} ${part.name}: ${c} is outside ${th.tonic} ${th.scale}`);
          assert.ok(chordPcs(ch).length >= 3);
        }
      }
    }
  }
});

test('the variations keep every bar whole, and a hint is quieter than the bar it hints at', () => {
  const r = rng(5);
  for (let w = 1; w <= 10; w++) {
    const th = composeStage(w, 99 + w, 'run');
    for (const b of th.form!.flatMap((p) => p.lines?.lead ?? [])) {
      if (!b) continue;
      assert.equal(len(ornament(b, r)), 16, b);
      assert.equal(len(rerhythm(b, r)), 16, b);
      assert.equal(len(hint(b)), 16, b);
      assert.ok(parseBar(hint(b)).filter((x) => x.n !== null).length <= 2);
    }
  }
});

test("a written world theme a stage plays is laid out as a form too, from its own tune", () => {
  for (let w = 1; w <= 10; w++) {
    const th = themeById(`world${w}~r`) ?? themeById(`world${w}`);
    if (!th) continue;
    const form = autoForm(th, 12345);
    assert.ok(form && form.length >= 5, `world${w}`);
    assert.ok(form.some((p) => p.name === 'break') && form.some((p) => p.name === 'A2'));
  }
  // and the scene says so: every stage's music is played as a form
  for (let w = 1; w <= 10; w++) assert.equal(stageMusic(w, `${w}-3`, 3, 7).form, true);
});

test('the Playback walks the form: section by section, in order, and goes round', () => {
  const ctx = fakeCtx();
  const core = new AudioCore(ctx, { lightRoom: true });
  const th = composeStage(2, 777, 'run');
  const pb = new Playback(core, th, 0, undefined, false, { seed: 777 });
  const seen: string[] = [];
  const bar = (4 * 60) / th.bpm;
  for (let t = 0.3; t < bar * (formBars(th.form!) + 3); t += bar) {
    pb.update(t);
    if (seen[seen.length - 1] !== pb.section) seen.push(pb.section);
  }
  const order = th.form!.map((p) => p.name);
  assert.deepEqual(seen.slice(0, order.length), order);
  assert.equal(seen[order.length], order[0], 'after the last section the form starts again');
});
