// Prints the preview timelines as JSON: npx tsx tools/audio/specs.ts before|after > specs.json
import { stageMusic, sceneForScreen } from '../../src/audio/scenes.ts';
import { themeById } from '../../src/audio/themes.ts';
import { autoForm } from '../../src/audio/form.ts';
import fs from 'node:fs';

const which = process.argv[2] === 'after' ? 'after' : 'before';
const after = which === 'after';
const OBJ: Record<number, string | undefined> = { 1: undefined, 2: undefined, 3: 'climb', 4: undefined, 5: 'sneak', 6: undefined, 7: undefined, 8: 'climb', 9: undefined, 10: 'defeat' };
import { WORLDS_DATA } from '../../src/game/worldsData.ts';
const AMB: Record<number, string> = Object.fromEntries(WORLDS_DATA.map((d, i) => [i + 1, d.ambientType]));
const specs: Record<string, unknown> = {};
const timeline: Record<string, unknown> = {};
for (let w = 1; w <= 10; w++) {
  // (World 2's 4th stage plays its written theme, one stage in five does: the preview takes its 5th, a composed one, to show the form)
  const lvl = w === 2 ? 5 : 4;
  const s = stageMusic(w, `${w}-${lvl}`, lvl, 0, OBJ[w]);
  const events: unknown[] = [{ t: 0, amb: AMB[w] }];
  if (after) {
    // the sections' start times, so the moments land in different sections and the README can name them
    const th = themeById(s.id)!;
    const form = th.form ?? autoForm(th, s.seed ?? 0) ?? [];
    const bar = (4 * 60) / (th.bpm * (s.tempo ?? 1)) * ((th.stepsPerBar ?? 16) / 16);
    let t = 0.05;
    const parts: Array<{ name: string; t: number; inst?: string }> = [];
    for (const p of form) {
      parts.push({ name: p.name, t: Math.round(t * 10) / 10, ...(p.inst ? { inst: Object.values(p.inst).join() } : {}) });
      t += bar * p.chords.reduce((a, c) => a + (Number(/\*(\d+)$/.exec(c)?.[1]) || 1), 0);
    }
    const starts = parts.map((p) => p.t);
    const at = (lo: number) => starts.find((x) => x >= lo && parts[starts.indexOf(x)].name !== 'break') ?? lo;
    const danger = at(28);
    const dark = at(danger + 14);
    const exit = Math.max(dark + 10, 76);
    events.push({ t: danger, state: { danger: 1 }, intensity: 0.75 }, { t: danger + 13, state: { danger: 0 }, intensity: 0.35 }, { t: dark, state: { dark: 1 } }, { t: exit, state: { dark: 0, exit: 1 }, intensity: 0.6 });
    timeline[`world${w}`] = { id: s.id, bpm: th.bpm, parts: parts.filter((p) => p.t < 90), danger: [danger, danger + 13], dark: [dark, exit], exit };
  } else {
    events.push({ t: 34, intensity: 0.85 }, { t: 50, intensity: 0.35 }, { t: 76, intensity: 0.6 });
  }
  specs[`world${w}`] = { seconds: 90, music: { id: s.id, seed: s.seed, tempo: s.tempo, intensity: 0.3, ...(after ? { form: true } : {}) }, events };
}
const boss = sceneForScreen('playing', 5, true, '5-10')!;
specs.boss = {
  seconds: 80,
  music: { id: boss.id, seed: boss.seed, tempo: 1, intensity: 0.6 },
  events: after
    ? [{ t: 0, state: { boss: 1 } }, { t: 26, state: { boss: 2 }, tempo: 1.04, intensity: 0.8 }, { t: 52, state: { boss: 3 }, tempo: 1.08, intensity: 1 }]
    : [{ t: 26, tempo: 1.04, intensity: 0.8 }, { t: 52, tempo: 1.08, intensity: 1 }],
};
const w1 = stageMusic(1, '1-2', 2, 0);
// the effects reel: each moment the review named, over quiet World 1 music
const reel: Array<[number, Record<string, unknown>, Record<string, unknown>]> = [
  [2, { fx: 'land', arg: 0.1 }, { fx: 'land', arg: 0.1 }],
  [3.2, { fx: 'land', arg: 0.4 }, { fx: 'land', arg: 0.4 }],
  [4.4, { fx: 'land', arg: 0.9 }, { fx: 'land', arg: 0.9 }],
  [7, { fx: 'whoosh' }, { fx: 'splash', arg: 0 }],
  [7.15, { fx: 'hit' }, {}],
  [9.5, {}, { fx: 'splash', arg: 1 }],
  [11.5, {}, { fx: 'splash', arg: 2 }],
  [14, {}, { fx: 'respawn' }],
  [17, { fx: 'checkpoint' }, { cue: 'checkpoint' }],
  [21, {}, { cue: 'discovery' }],
  [24.5, {}, { cue: 'secret' }],
  [28, {}, { cue: 'lowHealth' }],
  [32, { sting: 'bossAppear' }, { fx: 'bossAppear' }],
  [38, { fx: 'whoosh' }, { fx: 'puzzle', arg: 0 }],
  [39.5, { fx: 'whoosh' }, { fx: 'puzzle', arg: 1 }],
  [41, { fx: 'hurt' }, { fx: 'puzzle', arg: 2 }],
  [42.5, { fx: 'checkpoint' }, { fx: 'puzzle', arg: 3 }],
  [44, { fx: 'whoosh' }, { fx: 'puzzle', arg: 4 }],
  [45.5, { fx: 'whoosh' }, { fx: 'puzzle', arg: 5 }],
  [47, {}, { fx: 'puzzle', arg: 6 }],
  [48.5, {}, { fx: 'puzzle', arg: 7 }],
  [50, {}, { fx: 'puzzle', arg: 8 }],
  [51.5, {}, { fx: 'puzzle', arg: 9 }],
  [53, {}, { fx: 'puzzle', arg: 10 }],
  [54.5, {}, { fx: 'puzzle', arg: 11 }],
  [57, { fx: 'oneUp' }, { fx: 'oneUp' }],
  [59, { fx: 'uiConfirm' }, { fx: 'uiConfirm' }],
  [60.5, { fx: 'uiBack' }, { fx: 'uiBack' }],
];
specs.effects = {
  seconds: 64,
  music: { id: w1.id, seed: w1.seed, tempo: w1.tempo, intensity: 0.25, ...(after ? { form: true } : {}) },
  events: [{ t: 0, amb: 'gentle_breeze' }, ...(after ? [{ t: 36, state: { puzzle: 1 } }] : []), ...reel.map(([t, b, a]) => ({ t, ...(after ? a : b) })).filter((e) => Object.keys(e).length > 1)],
};
// each effect over a stage's own music: the old (classic) version, then 2.2 s later the new one (the lead, 2026-10-29)
const PAIRS: Array<[string, Record<string, unknown>[], Record<string, unknown>[]]> = [
  ['checkpoint', [{ fx: 'legacyCheckpoint' }], [{ cue: 'checkpoint' }]],
  ['falling in water', [{ fx: 'whoosh' }, { fx: 'hit', dt: 0.15 }], [{ fx: 'splash', arg: 0 }]],
  ['a small hop landing', [], [{ fx: 'landing', arg: 0.15 }]],
  ['respawn', [], [{ fx: 'respawn' }]],
  ['first discovery', [], [{ cue: 'discovery' }]],
  ['secret found', [{ fx: 'relic' }], [{ cue: 'secret' }]],
  ['last heart', [{ fx: 'heartbeat' }], [{ cue: 'lowHealth' }]],
  ['boss appears', [{ sting: 'bossAppear' }], [{ fx: 'bossAppear', arg: 5 }]],
  ['puzzle: a vine wraps', [{ fx: 'hurt' }], [{ fx: 'puzzle', arg: 2 }]],
  ['puzzle: reset', [{ fx: 'legacyCheckpoint' }], [{ fx: 'puzzle', arg: 3 }]],
  ['puzzle: lever', [{ fx: 'punch' }], [{ fx: 'puzzle', arg: 7 }]],
  ['puzzle: press', [{ fx: 'climb' }], [{ fx: 'puzzle', arg: 4 }]],
  ['puzzle: solved', [{ fx: 'shrine' }], [{ fx: 'puzzle', arg: 11 }]],
];
const pairTimes: Array<[string, number]> = [];
for (const w of [1, 4, 9]) {
  const s = stageMusic(w, `${w}-4`, 4, 0, OBJ[w]);
  const events: unknown[] = [{ t: 0, amb: AMB[w] }];
  PAIRS.forEach(([name, old, neu], i) => {
    const t = 3 + i * 5;
    if (w === 1) pairTimes.push([name, t]);
    for (const e of old) events.push({ ...e, t: t + Number(e.dt ?? 0) });
    for (const e of neu) events.push({ ...e, t: t + 2.2 + Number(e.dt ?? 0) });
  });
  if (after) specs[`effects-w${w}`] = { seconds: 3 + PAIRS.length * 5 + 2, music: { id: s.id, seed: s.seed, tempo: s.tempo, intensity: 0.3, form: true }, events };
}
if (after && process.env.PAIRS) fs.writeFileSync(process.env.PAIRS, JSON.stringify(pairTimes));
console.log(JSON.stringify(specs, null, 1));
if (after && process.env.TIMELINE) fs.writeFileSync(process.env.TIMELINE, JSON.stringify(timeline, null, 1));
