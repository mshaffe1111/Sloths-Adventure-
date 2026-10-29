/**
 * The three acts of the story and the sound each one has (acts.ts): that the stage music follows the written story (Act I sunny and Pokey's,
 * Act II somber and the lullaby sung sadly, Act III heavy and the Iron March), and that none of them stands still.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { ACT_MIX, ACTS, actOfThemeId, actOfWorld, fitShift, LEAD_BAND, LEAD_SIT, MIN_BPM, leadWindow } from './acts.ts';
import { composeStageFull, composeStage } from './composer.ts';
import { orchestrate, PACES } from './orchestrate.ts';
import { BOSS_THEME, THEMES } from './themes.ts';
import { stageMusic } from './scenes.ts';
import { lullaby, stepBy } from './motifs.ts';
import { STYLES } from './styles.ts';
import { SLOMATT_A } from './tunes.ts';
import { noteMidi, parseMelodyBar, SCALES } from './theory.ts';
import { VOICE_RANGE } from './scoreKit.ts';
import type { MelodyTrack } from './music.ts';

const SEEDS = Array.from({ length: 60 }, (_, i) => 1 + i * 7919);

test('the worlds fall into the story\'s three acts', () => {
  assert.deepEqual([1, 2, 3].map(actOfWorld), ['trail', 'trail', 'trail']);
  assert.deepEqual([4, 5, 6, 7].map(actOfWorld), ['cost', 'cost', 'cost', 'cost']);
  assert.deepEqual([8, 9, 10].map(actOfWorld), ['iron', 'iron', 'iron']);
  assert.equal(actOfThemeId('gen-5-123-r'), 'cost');
  assert.equal(actOfThemeId('world9~b'), 'iron');
  assert.equal(actOfThemeId('score_vow'), null);
  assert.deepEqual(ACTS, ['trail', 'cost', 'iron']);
});

test('the bosses follow the acts', () => {
  assert.deepEqual([1, 2, 3].map(BOSS_THEME), ['bossA', 'bossA', 'bossA']);
  assert.deepEqual([4, 5, 6, 7].map(BOSS_THEME), ['bossB', 'bossB', 'bossB', 'bossB']);
  assert.deepEqual([8, 9].map(BOSS_THEME), ['bossC', 'bossC']);
  assert.equal(BOSS_THEME(10), 'bossFinal');
  for (const w of [1, 4, 8, 10]) assert.ok(THEMES[BOSS_THEME(w)], `${BOSS_THEME(w)} exists`);
  assert.equal(actOfThemeId(`${BOSS_THEME(5)}~b`), 'cost');
});

test("every world keeps to its own style's tempo band (styles.ts): the canopy bounces, the grotto and the ruins are slow", () => {
  for (let w = 1; w <= 10; w++) {
    for (const seed of SEEDS) {
      const bpm = composeStage(w, seed).bpm;
      assert.ok(bpm >= STYLES[w].bpm[0] && bpm <= STYLES[w].bpm[1], `world ${w} seed ${seed}: ${bpm}`);
    }
  }
  assert.ok(STYLES[1].bpm[0] > STYLES[3].bpm[1] + 40 && STYLES[7].bpm[1] < 80);
});

test('the story\'s own tunes are quoted exactly, each in its own act and mode', () => {
  const TUNES: Record<string, { bars: string[]; mode: string; acts: string[] }> = {
    pokey: { bars: SLOMATT_A, mode: 'major', acts: ['trail'] },
    lullaby: { bars: lullaby('sq'), mode: 'major', acts: ['iron'] },
    lament: { bars: stepBy(lullaby('44'), 2), mode: 'minor', acts: ['cost'] },
    march: { bars: lullaby('sq', { scale: 'harmonicMinor' }), mode: 'harmonicMinor', acts: ['cost', 'iron'] },
  };
  const seen = new Set<string>();
  for (let w = 1; w <= 10; w++) {
    for (const seed of SEEDS) {
      const { theme, info } = composeStageFull(w, seed);
      if (!info.tune) continue;
      const t = TUNES[info.tune];
      seen.add(info.tune);
      assert.ok(t.acts.includes(actOfWorld(w)), `world ${w} quotes ${info.tune}`);
      assert.equal(theme.scale, t.mode);
      const lead = theme.tracks.find((k) => k.name === 'lead') as MelodyTrack;
      assert.deepEqual(lead.bars.slice(0, 8), t.bars, `${theme.id}: the first eight bars are the ${info.tune} tune`);
      assert.equal(lead.bars.length, 16);
    }
  }
  // (World 8 is a lullaby in three now, styles.ts, and the lullaby quote is written in four: it waits for a version in three)
  assert.deepEqual([...seen].sort(), ['lament', 'march', 'pokey']);
});

test('the lament is the lullaby\'s own notes in the relative minor, and the march is the lullaby with its third and sixth lowered', () => {
  const pitches = (bars: string[], tonic: number, scale: number[]) => bars.flatMap((b) => parseMelodyBar(b, tonic, scale, 16)).map((n) => n.midi);
  const D = noteMidi('D4');
  const sung = pitches(lullaby('sq'), D, SCALES.major);
  // the lament in B minor is the lullaby in D major: the same pitches (the broad counting changes the lengths, not the notes)
  const lament = pitches(stepBy(lullaby('44'), 2), noteMidi('B3'), SCALES.minor).filter((m) => m !== null);
  assert.deepEqual(lament.map((m) => (m as number) % 12), sung.filter((m) => m !== null).map((m) => (m as number) % 12));
  const march = pitches(lullaby('sq', { scale: 'harmonicMinor' }), D, SCALES.harmonicMinor);
  march.forEach((m, i) => {
    const s = sung[i] as number;
    assert.ok(m === s || m === s - 1, `note ${i}: ${m} is the sung note or a semitone under it`);
  });
  assert.ok(march.some((m, i) => m === (sung[i] as number) - 1), 'the march does lower some notes');
});

test('the tune sits in the lead\'s range: the lead and anyone who takes over from it can play every note', () => {
  const SOLO = new Set(Object.keys(LEAD_BAND));
  for (let w = 1; w <= 10; w++) {
    for (const seed of SEEDS) {
      const { theme, info } = composeStageFull(w, seed);
      const lead = theme.tracks.find((k) => k.name === 'lead') as MelodyTrack;
      assert.ok(SOLO.has(lead.inst), `${theme.id}: lead ${lead.inst} is a solo voice`);
      assert.equal(lead.inst, info.lead);
      const shift = lead.shift ?? 0;
      const tonic = noteMidi(theme.tonic);
      const notes = lead.bars.flatMap((b) => parseMelodyBar(b!, tonic, SCALES[theme.scale], theme.stepsPerBar ?? 16)).flatMap((n) => (n.midi === null ? [] : [n.midi + shift]));
      const lo = Math.min(...notes);
      const hi = Math.max(...notes);
      for (const inst of [lead.inst, ...(lead.altInst ? [lead.altInst] : [])]) {
        const range = VOICE_RANGE[inst];
        assert.ok(lo >= range[0] && hi <= range[1], `${theme.id}: ${inst} plays ${lo}..${hi}, its recording covers ${range}`);
      }
      // a cello or a horn plays the written tune an octave down or lower
      if (lead.inst === 'cello' || lead.inst === 'horn') assert.ok(shift < 0, `${theme.id}: ${lead.inst} sits below the written tune`);
      // a quoted tune is placed where its instrument is comfortable
      if (info.tune) {
        const band = LEAD_BAND[lead.inst];
        const tune = lead.bars.slice(0, 8).flatMap((b) => parseMelodyBar(b!, tonic, SCALES[theme.scale], theme.stepsPerBar ?? 16)).flatMap((n) => (n.midi === null ? [] : [n.midi + shift]));
        assert.ok(Math.min(...tune) >= band[0] && Math.max(...tune) <= band[1], `${theme.id}: ${info.tune} on the ${lead.inst}`);
      }
    }
  }
});

test('the placing rules: a tune takes the nearest octave that fits, and a tune that fits nowhere is refused', () => {
  assert.equal(fitShift('cello', 60, 74), -12);
  assert.equal(fitShift('flute', 59, 74), 12, 'Pokey in C is too low for a flute where it is written');
  assert.equal(fitShift('flute', 72, 80), 0);
  assert.equal(fitShift('horn', 60, 75), -12);
  assert.equal(fitShift('oboe', 40, 100), null);
  assert.equal(fitShift('theremin', 60, 70), null);
  for (const inst of Object.keys(LEAD_BAND)) {
    const [lo, hi] = leadWindow(inst);
    assert.ok(hi - lo >= 12, `${inst} has a window of at least an octave`);
    assert.ok(lo >= LEAD_BAND[inst][0] && hi <= LEAD_BAND[inst][1]);
    assert.ok(inst in VOICE_RANGE, `${inst} is a recorded voice`);
  }
  assert.deepEqual(Object.keys(LEAD_SIT).sort(), ['bassoon', 'cello', 'horn', 'trombone']);
});

test('Act I is sunny, Act II somber, Act III heavy', () => {
  const stats = (worlds: number[]) => {
    const modes = new Map<string, number>();
    let n = 0;
    let bpm = 0;
    const leads = new Map<string, number>();
    for (const w of worlds) for (const seed of SEEDS) {
      const { theme, info } = composeStageFull(w, seed);
      modes.set(theme.scale, (modes.get(theme.scale) ?? 0) + 1);
      leads.set(info.lead, (leads.get(info.lead) ?? 0) + 1);
      bpm += theme.bpm;
      n++;
    }
    return { modes, leads, bpm: bpm / n, n };
  };
  const trail = stats([1, 2]);
  const cost = stats([4, 5, 6, 7]);
  const iron = stats([8, 9, 10]);
  // Act I's two sunny worlds are major
  assert.equal(trail.modes.size, 1);
  assert.ok(trail.modes.has('major'));
  // Act II is in the dorian, the minor and the phrygian: no major, no lydian
  assert.ok(![...cost.modes.keys()].some((m) => m === 'major' || m === 'lydian'), `act II modes: ${[...cost.modes.keys()]}`);
  // Act II has no bright flute or violin lead, and Act III leans on the low voices
  assert.ok(!cost.leads.has('flute') && !cost.leads.has('violins'), `act II leads: ${[...cost.leads.keys()]}`);
  assert.ok((trail.leads.get('flute') ?? 0) + (trail.leads.get('clarinet') ?? 0) > 0);
  const low = (iron.leads.get('cello') ?? 0) + (iron.leads.get('horn') ?? 0);
  assert.ok(low / iron.n > 0.3, `Act III: ${low}/${iron.n} stages led by cello or horn`);
  // the heavy act drives hardest; the sunny act is brighter than the somber one
  // (tempo is each world's own now, styles.ts: the march of Act III is faster than the somber Act II)
  assert.ok(iron.bpm > cost.bpm, `${iron.bpm} vs ${cost.bpm}`);
});

test('Act II is dressed without the snare and the triangle, and only its silk and mangrove worlds pluck', () => {
  for (const w of [4, 5, 6]) {
    for (const pace of PACES) {
      for (const seed of SEEDS.slice(0, 12)) {
        const t = orchestrate(composeStage(w, seed), { world: w, pace, seed });
        const bass = t.tracks.find((k) => k.name === 'orchBass');
        // (World 5's pizzicato strings and World 6's plucked double basses are those worlds' own colour: Matt, 2026-10-29)
        if (w === 4) assert.ok(bass && bass.kind === 'pattern' && bass.inst !== 'contraPizz', `world ${w} ${pace}: bass ${bass && 'inst' in bass ? bass.inst : '?'}`);
        assert.ok(!t.tracks.some((k) => k.name === 'snareR' || k.name === 'triR'), `world ${w} ${pace}`);
      }
    }
  }
});

test('the dressing leaves the tune to the fuller orchestra: no second set of doubles', () => {
  for (const w of [2, 6, 9]) {
    const t = orchestrate(composeStage(w, 4242), { world: w, pace: 'run', seed: 4242 });
    assert.ok(!t.tracks.some((k) => ['leadStrings', 'leadReed', 'leadDouble', 'leadHorn'].includes(k.name)));
  }
});

test('only Act I falls back to a written world theme; the later acts always get their own composed sound', () => {
  let trailWritten = 0;
  for (let i = 0; i < 400; i++) {
    for (const w of [1, 2, 3]) if (/^world\d+~/.test(stageMusic(w, `lvl-${i}`, 3, 0, undefined).id)) trailWritten++;
    for (const w of [4, 5, 6, 7, 8, 9, 10]) assert.match(stageMusic(w, `lvl-${i}`, 3, 0, undefined).id, /^gen-/, `world ${w}`);
  }
  assert.ok(trailWritten > 100, `${trailWritten} written themes in Act I`);
});

test('each act\'s mix thins or thickens the orchestra the way its sound needs', () => {
  assert.ok(ACT_MIX.cost.bed.horns < ACT_MIX.trail.bed.horns && ACT_MIX.cost.bed.winds < ACT_MIX.trail.bed.winds, 'Act II is thinner');
  assert.ok(ACT_MIX.cost.drop.includes('flute') && ACT_MIX.iron.drop.includes('flute'), 'no glittering flute doubling in the dark acts');
  assert.ok(ACT_MIX.iron.bed.horns > ACT_MIX.trail.bed.horns && ACT_MIX.iron.bed.low > ACT_MIX.trail.bed.low, 'Act III is heavier');
  assert.ok(ACT_MIX.iron.join.horns < 0, 'the horns come in early in Act III');
  assert.ok(ACT_MIX.cost.join.winds > 0, 'the winds come in late in Act II');
});
