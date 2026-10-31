/**
 * World 8 on gen2 (DESIGN.md B12 step 6): the kit and its sections. The ids are unique, every socket asks for something the world has,
 * every tip has Dot's line (under 10 words), every section lays in 600 to 1800 px (+370 a liana, +250 a glide) on Normal and Easy and ends level with
 * its exitDy, nothing crumbles, a section that climbs, drops, swings, holds a tip or a dark stretch is never mirrored, each theme a
 * stage's gate opens has sections to carry it, every dark stretch starts and ends on a lit bough of its own section, every
 * stage holds at least one dark section, and Easy is the same stage as Normal (the same sections, never more animals). The shipped
 * rolls as the game plays them are w8Game.test.ts's; the rooms are w8Rooms.test.ts's.
 */
import '../../headlessDom.ts';
import test from 'node:test';
import assert from 'node:assert/strict';
import { generateAllLevels } from '../../worldsData.ts';
import { buildGen2Stage, layLocal, planBudget, rngFor } from '../pipeline.ts';
import type { SectionTemplate } from '../types.ts';
import { W8_CREATURES, W8_GEN2_STAGES, W8_MANIFEST, W8_NEW_LINES, W8_PROPS, W8_TIPS, w8Finish } from './w8.ts';
import { W8_DARK_REQUIRED, W8_GAME_STAGES, W8_REQUIRED, W8_SWING_STAGES, w8Falls, w8GameKit } from './w8Game.ts';
import { W8_SECTIONS, W8_THEME } from './w8Sections.ts';
import { W8_BRANCH_SECTIONS } from './w8Branch.ts';
import { W8_SWING_SECTIONS } from './w8Swing.ts';
import { W8R_NEW_LINES } from './w8Rooms.ts';

const LEVELS = generateAllLevels();
const cfgOf = (id: string) => ({ ...LEVELS.find((c) => c.id === id)!, unlocked: true });
const words = (s: string) => s.split(/\s+/).filter(Boolean).length;
const ALL: SectionTemplate[] = [...W8_SECTIONS, ...W8_SWING_SECTIONS, ...W8_BRANCH_SECTIONS];

test('the manifest: ids unique, every socket asks for something the world has, every tip has a short line', () => {
  const ids = (xs: Array<{ id: string }>) => new Set(xs.map((x) => x.id)).size === xs.length;
  assert.ok(ids(W8_PROPS) && ids(W8_CREATURES) && ids(ALL));
  assert.deepEqual([...W8_GEN2_STAGES], [...W8_GAME_STAGES]);
  assert.deepEqual(W8_MANIFEST.handBuilt, ['8-4', '8-7', '8-10']);
  // (a fall from a lit bough costs a life on Normal: the world's pit is 'void'; the dark's, second-jump and start gaps stay soft; a glide's is a heart fall)
  assert.equal(W8_MANIFEST.pit, 'void');
  for (const t of ALL.map(w8Falls)) {
    const keys = t.pieces.map((p) => p.key);
    const from = keys.indexOf(t.sockets.find((k) => k.id === 'darkFrom')?.on ?? '');
    const to = keys.indexOf(t.sockets.find((k) => k.id === 'darkTo')?.on ?? '');
    t.pieces.forEach((p, i) => {
      const pl = p.place as { kind: string; soft?: boolean; jump?: string };
      if (!['jump', 'double', 'pit', 'land'].includes(pl.kind)) return;
      if (from >= 0 && to >= 0 && i > from && i <= to) assert.equal(pl.soft, true, `${t.id}.${p.key}: a gap in the dark is soft`);
      if (pl.kind === 'double' || pl.jump === 'double') assert.equal(pl.soft, true, `${t.id}.${p.key}: a second-jump gap is soft`);
      // (a glide's gap is a heart fall on Normal, outside the dark and the start: w8Heart.test.ts)
      if (pl.jump === 'glide' && !(from >= 0 && to >= 0 && i > from && i <= to) && !t.phases.includes('start')) assert.notEqual(pl.soft, true, `${t.id}.${p.key}: a glide gap is a heart fall, not a soft pit`);
      if (t.phases.includes('start')) assert.equal(pl.soft, true, `${t.id}.${p.key}: a start's gap is soft`);
    });
  }
  const tags = new Set([...W8_PROPS.flatMap((p) => p.tags), ...W8_PROPS.map((p) => p.id)]);
  const creatures = new Set(W8_CREATURES.flatMap((c) => [c.id, ...(c.tags ?? [])]));
  for (const s of ALL) {
    for (const k of s.sockets) {
      assert.ok(s.pieces.some((p) => p.key === k.on), `${s.id}.${k.id} sits on a piece it has`);
      if (k.role === 'prop') assert.ok(k.allow!.some((a) => tags.has(a)), `${s.id}.${k.id}: ${k.allow}`);
      if (k.role === 'enemy') assert.ok(k.allow!.length && k.allow!.every((a) => creatures.has(a)), `${s.id}.${k.id}`);
      if (k.role === 'tip') assert.ok(W8_TIPS[k.allow![0]], `${s.id}.${k.id}: Dot has a line for ${k.allow![0]}`);
    }
    assert.ok(!s.pieces.some((p) => p.style === 'ruin'), `${s.id}: nothing crumbles`);
    // (never mirrored: a climb, a drop, a liana, a tip on its first piece, a dark stretch (Dot's line on its lit first bough comes first))
    const tip = s.sockets.some((k) => k.role === 'tip');
    const dark = s.sockets.some((k) => k.id === 'darkFrom');
    const hangs = s.pieces.some((p) => p.shape === 'liana' || p.shape === 'vine');
    if (s.exitDy !== 0 || tip || dark || hangs) assert.equal(s.mirrorable, false, s.id);
    // (a dark stretch starts after its section's first piece and ends before its last: a lit bough each side, for the flags)
    if (dark) {
      const keys = s.pieces.map((p) => p.key);
      const from = keys.indexOf(s.sockets.find((k) => k.id === 'darkFrom')!.on);
      const to = keys.indexOf(s.sockets.find((k) => k.id === 'darkTo')!.on);
      if (!s.room) assert.ok(from > 0 && to < keys.length - 1 && from < to, `${s.id}: the dark from ${keys[from]} to ${keys[to]}`);
    }
  }
  for (const l of [...Object.values(W8_TIPS), ...W8_NEW_LINES, ...W8R_NEW_LINES]) assert.ok(words(l) < 10, l);
});

test('the sections lay in their own space, 600-1800 px (+370 a liana), level at their ends, on Normal and Easy', () => {
  for (const d of ['normal', 'easy'] as const) {
    const budget = planBudget(cfgOf('8-5'), W8_MANIFEST, d);
    for (const s of ALL) {
      if (s.room) continue;
      for (let r = 1; r <= 12; r++) {
        const L = layLocal(s, budget, rngFor(r));
        // (a liana's gap lies past the glide, 370 px more; a moonlight glide's past the double jump, 250 px more)
        const lianas = L.pieces.filter((p) => p.shape === 'liana').length;
        const glides = s.pieces.filter((p) => p.place.kind === 'pit' && p.place.jump === 'glide').length;
        assert.ok(L.width >= 600 && L.width <= 1800 + 370 * lianas + 250 * glides, `${s.id} ${d}: ${L.width} px`);
        assert.ok(Math.abs(L.exit.y - s.exitDy) <= 25, `${s.id}: exitDy ${s.exitDy}, laid ${L.exit.y}`);
      }
    }
  }
});

test('each stage: the themes its sections use are opened by its gates, it holds a dark section, its required sections are its own', () => {
  const themes = new Set<string>(Object.values(W8_THEME));
  for (const id of W8_GAME_STAGES) {
    const n = Number(id.split('-')[1]);
    const M = w8GameKit(n).manifest;
    const mine = (s: SectionTemplate) => s.archetypes === 'any' || s.archetypes.includes(cfgOf(id).objectiveType as never);
    const opened = new Set(M.sections.flatMap((s) => (s.phases.includes('start') && s.teaches && mine(s) ? [s.teaches] : [])));
    // (the vine stages' kind of swing is their theme: 8-3's chains or hunters' swings, 8-5's swings to a trunk, kept apart: w8Game.ts)
    // (and the fight stages' animals: 8-8 hunts the harpies and the small cats, 8-9 the jaguars and the boa guards, w8.ts W8_STAGE_FOES)
    // (8-1's and 8-6's lit trunks went to 8-5: 8-1's themes are the leaps and the night, 8-6's the hunters' glides and the leaps)
    assert.ok(opened.size >= (W8_SWING_STAGES.includes(n) ? 1 : n === 2 ? 3 : 2), `${id}: ${opened.size} gates`);
    // (each theme a gate opens has sections of its own to carry the roll; a filler of a theme the stage never opens just sits unused)
    for (const t of opened) if (themes.has(t)) assert.ok(M.sections.filter((s) => s.uses?.includes(t)).length >= 2, `${id}: the ${t} theme has under two sections`);
    assert.ok(M.sections.some((s) => s.sockets.some((k) => k.id === 'darkFrom')), `${id}: no dark`);
    for (const r of W8_REQUIRED[id]) assert.ok(M.sections.some((s) => s.id === r.section), `${id}: ${r.section} is not in its kit`);
    if (W8_DARK_REQUIRED[id]) assert.ok(W8_REQUIRED[id].some((r) => r.section === W8_DARK_REQUIRED[id]), id);
    // (the night harpy hunts 8-8 and 8-9 only; the lianas are the vine stages')
    assert.equal(M.creatures.some((c) => c.id === 'harpy'), n === 8, id);
    assert.equal(M.sections.some((s) => s.pieces.some((p) => p.shape === 'liana')), n === 3 || n === 5, id);
  }
});

test('Easy is the same stage as Normal under kinder rules: the same sections, never more animals', () => {
  for (const id of ['8-1', '8-6', '8-8']) {
    for (let seed = 1; seed <= 4; seed++) {
      const n = w8Finish(buildGen2Stage({ config: cfgOf(id), kit: w8GameKit(Number(id.split('-')[1]), 'normal'), seed, difficulty: 'normal' }));
      const e = w8Finish(buildGen2Stage({ config: cfgOf(id), kit: w8GameKit(Number(id.split('-')[1]), 'easy'), seed, difficulty: 'easy' }));
      assert.deepEqual(e.gen2.sections.map((s) => [s.template, s.mirrored]), n.gen2.sections.map((s) => [s.template, s.mirrored]), `${id} ${seed}`);
      assert.ok(e.enemies.length <= n.enemies.length, `${id} ${seed}: Easy ${e.enemies.length}, Normal ${n.enemies.length}`);
    }
  }
});
