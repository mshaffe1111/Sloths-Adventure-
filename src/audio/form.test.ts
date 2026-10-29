import { test } from 'node:test';
import assert from 'node:assert/strict';
import { composeStage } from './composer.ts';
import { stageMusic } from './scenes.ts';
import { themeById } from './themes.ts';
import { autoForm, formBars, ornament, parseBar, POKEY_MOTIF, POKEY_MOTIF12, rerhythm, hint } from './form.ts';
import { chordPcs, hashStr, parseChord, rng, SCALES } from './theory.ts';
import { AudioCore } from './core.ts';
import { Playback } from './music.ts';
import { fakeCtx } from './testCtx.ts';

const len = (b: string) => parseBar(b).reduce((a, t) => a + t.len, 0);
const PCS: Record<string, number> = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
const tonicPc = (t: string) => (PCS[t[0]] + (t[1] === '#' ? 1 : t[1] === 'b' ? -1 : 0) + 12) % 12;

test("every world: a stage is a pool of 12-16 chunks from 2-3 tunes of its own, with a C, a bridge and quiet passages", () => {
  for (let w = 1; w <= 10; w++) {
    for (let s = 1; s <= 12; s++) {
      const th = composeStage(w, s * 7919, 'run');
      assert.ok(th.form && th.chain, `world ${w} seed ${s}: no chunk pool`);
      const names = th.form.map((p) => p.name);
      for (const n of ['A', 'B', 'C', 'bridge', 'break', 'A·2', 'B·2']) assert.ok(names.includes(n), `world ${w}: no ${n} in ${names}`);
      assert.ok(names.length >= 12 && names.length <= 16, `world ${w}: ${names.length} chunks`);
      const tunes = new Set(th.form.map((p) => p.tune));
      assert.ok(tunes.size >= 2 && tunes.size <= 3);
      for (const p of th.form) assert.equal(formBars([p]), 8, `world ${w} ${p.name} is 8 bars`);
    }
  }
});

test("Pokey's motif opens a tune in every world, on that world's lead", () => {
  for (let w = 1; w <= 10; w++) {
    const th = composeStage(w, 99 * w, 'run');
    const p = th.form!.find((x) => x.name === 'A·2')!;
    const bars = (p.lines!.lead as string[]).slice(0, 2);
    // the motif's shape, in scale steps, whatever octave it sits in
    const steps = (b: string) => parseBar(b).filter((t) => t.n !== null).map((t) => t.n!);
    const want = (th.stepsPerBar === 12 ? POKEY_MOTIF12 : POKEY_MOTIF).map(steps);
    const got = bars.map(steps);
    const d = got[0][0] - want[0][0];
    assert.equal(d % 7, 0, `world ${w}: moved by whole octaves`);
    assert.deepEqual(got.map((b) => b.map((n) => n - d)), want, `world ${w}`);
    assert.ok(!p.inst, 'the motif is on the lead itself');
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

test('the chunks never come in the same order twice: two stages of a world differ, and the same stage plays the same each time', () => {
  const seq = (w: number, seed: number) => {
    const th = composeStage(w, seed, 'run');
    const pb = new Playback(new AudioCore(fakeCtx(), { lightRoom: true }), th, 0, undefined, false, { seed });
    pb.update(300);
    return pb.chunks.join(' ');
  };
  for (const w of [1, 5, 9]) {
    assert.notEqual(seq(w, 1001), seq(w, 2002));
    assert.equal(seq(w, 1001), seq(w, 1001));
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
    const n = th.stepsPerBar ?? 16;
    for (const b of th.form!.flatMap((p) => p.lines?.lead ?? [])) {
      if (!b) continue;
      assert.equal(len(b), n, b);
      assert.equal(len(ornament(b, r)), n, b);
      assert.equal(len(rerhythm(b, r)), n, b);
      assert.equal(len(hint(b, n)), n, b);
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

test('a chained stage never brings a chunk back within two minutes, over ten minutes of play, in every world', () => {
  for (let w = 1; w <= 10; w++) {
    const th = composeStage(w, 31 * w + 7, 'run');
    const pb = new Playback(new AudioCore(fakeCtx(), { lightRoom: true }), th, 0, undefined, false, { seed: 31 * w + 7 });
    pb.update(600);
    const barSec = 240 / th.bpm;
    const chunkSec = 8 * barSec;
    const order = pb.chunks;
    assert.ok(order.length * chunkSec >= 590);
    const last = new Map<string, number>();
    order.forEach((name, i) => {
      if (last.has(name)) assert.ok((i - last.get(name)!) * chunkSec >= 120, `world ${w}: ${name} back after ${((i - last.get(name)!) * chunkSec).toFixed(0)} s`);
      last.set(name, i);
    });
    // and the quiet passage never comes twice in a row
    for (let i = 1; i < order.length; i++) assert.ok(!(order[i].startsWith('break') && order[i - 1].startsWith('break')));
  }
});

test('a chained stage plays its sections in the order it chose', () => {
  const ctx = fakeCtx();
  const core = new AudioCore(ctx, { lightRoom: true });
  const th = composeStage(2, 777, 'run');
  const pb = new Playback(core, th, 0, undefined, false, { seed: 777 });
  const seen: string[] = [];
  const bar = (4 * 60) / th.bpm;
  for (let t = 0.3; t < bar * 8 * 6; t += bar) {
    pb.update(t);
    if (seen[seen.length - 1] !== pb.section) seen.push(pb.section);
  }
  assert.deepEqual(seen.slice(0, 5), pb.chunks.slice(0, 5));
});

test("the signature, the menu loop and the map's ten variations are valid notation; the hook opens with Pokey's motif, in a key and meter no world has", async () => {
  const { signatureTheme, menuTheme, mapTheme } = await import('./signature.ts');
  const { STYLES } = await import('./styles.ts');
  for (const th of [signatureTheme(), menuTheme(), ...Array.from({ length: 10 }, (_, i) => mapTheme(i + 1))]) {
    for (const p of th.form!) {
      for (const lines of Object.values(p.lines ?? {})) for (const b of lines) if (b) assert.equal(len(b), th.stepsPerBar ?? 16, `${th.id} ${p.name}: ${b}`);
      for (const c of p.chords) parseChord(c);
    }
    const pb = new Playback(new AudioCore(fakeCtx(), { lightRoom: true }), th, 0, undefined, false, { seed: 3 });
    pb.update(120);
  }
  const sig = signatureTheme();
  assert.deepEqual((sig.form!.find((p) => p.name === 'A')!.lines!.hook as string[]).slice(0, 2), POKEY_MOTIF12);
  const secs = formBars(sig.form!) * (60 / sig.bpm) * 12 / 4;
  assert.ok(secs >= 45 && secs <= 100, `the statement runs ${secs.toFixed(0)} s`);
  assert.ok(menuTheme().chain && !sig.chain);
  // its own key and groove: no world is in B-flat, and no world is in 12/8 at a pace like it
  for (let w = 1; w <= 10; w++) assert.ok(!(STYLES[w].meter === 12 && STYLES[w].bpm[1] >= 100), `world ${w}`);
  assert.equal(sig.tonic, 'Bb3');
  const lead = (w: number) => (mapTheme(w).tracks.find((t) => t.name === 'tune') as { inst: string }).inst;
  assert.notEqual(lead(1), lead(9));
});
