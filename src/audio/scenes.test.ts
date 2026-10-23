import test from 'node:test';
import assert from 'node:assert/strict';
import { MENU_THEME, sceneForPanel, sceneForScreen } from './scenes.ts';
import { STINGS, stingLength } from './stingers.ts';
import { THEMES, themeById } from './themes.ts';
import { AMBIENT_TYPES } from './ambience.ts';
import { WORLDS_DATA } from '../game/worldsData.ts';
import { INTRO_PANELS, WORLD_STORIES, ENDING_PANELS, bossPanels } from '../game/story.ts';
import { noteMidi, parseChord, parseMelodyBar, SCALES } from './theory.ts';

test('every screen that should have music maps to a real piece', () => {
  for (const screen of ['title', 'world_map', 'playing', 'paused', 'victory', 'game_over', 'story_ending']) {
    for (let w = 1; w <= 10; w++) {
      for (const boss of [false, true]) {
        const s = sceneForScreen(screen, w, boss);
        assert.ok(s && themeById(s.id), `${screen} world ${w} boss ${boss}`);
        assert.ok(s.intensity >= 0 && s.intensity <= 1);
      }
    }
  }
  // cutscenes choose per panel, so the app leaves them alone
  for (const screen of ['story_cutscene', 'world_story', 'boss_intro', 'boss_defeat', 'ending_story']) assert.equal(sceneForScreen(screen, 1, false), null);
});

test('the title screen and the pause menu play the first stage\'s tune, whatever world is behind them', () => {
  assert.equal(MENU_THEME, 'world1');
  for (let w = 1; w <= 10; w++) {
    assert.equal(sceneForScreen('title', w, false)?.id, 'world1');
    assert.equal(sceneForScreen('paused', w, false)?.id, 'world1');
    assert.equal(sceneForScreen('paused', w, true, 'lvl', 3)?.id, 'world1');
    assert.notEqual(sceneForScreen('playing', w, false, 'lvl', 3)?.id, 'world1', 'a stage in play has its own music');
  }
});

test('every cutscene panel in the game has music', () => {
  const all = [
    ...INTRO_PANELS,
    ...ENDING_PANELS,
    ...Object.values(WORLD_STORIES).flatMap((w) => w.panels),
    ...WORLDS_DATA.flatMap((w) => [...bossPanels(w.id, 'intro', w.bossName), ...bossPanels(w.id, 'defeat', w.bossName)]),
  ];
  assert.ok(all.length > 40);
  for (const p of all) {
    const s = sceneForPanel(p);
    assert.ok(themeById(s.id), `${p.chapter}: ${s.id}`);
  }
});

test('story music tells the story: Meeca, the storm, dusk, the boss, the ending', () => {
  const mk = (chapter: string, world = 1, mood = 'day') => ({ chapter, scene: { world, mood } });
  assert.equal(sceneForPanel(mk('PROLOGUE')).id, 'jennifur');
  assert.equal(sceneForPanel(mk('THE STORM', 10, 'storm')).id, 'storyStorm');
  assert.equal(sceneForPanel(mk('THE VOW', 1, 'dusk')).id, 'storyDusk');
  assert.equal(sceneForPanel(mk('WORLD 5 · ORCHID SANCTUARY', 5)).id, 'world5~c');
  assert.equal(sceneForPanel(mk('BOSS · GENERAL IRON-CLAW', 10, 'storm')).id, 'bossFinal~b');
  assert.equal(sceneForPanel(mk('EPILOGUE', 10, 'glow')).id, 'ending');
});

test('every world has an ambience bed', () => {
  for (const w of WORLDS_DATA) assert.ok(AMBIENT_TYPES.includes(w.ambientType), `${w.name}: ${w.ambientType}`);
  assert.equal(new Set(WORLDS_DATA.map((w) => w.ambientType)).size, 10, 'all ten worlds sound different');
});

test('stingers are valid notation and a sensible length', () => {
  for (const [name, s] of Object.entries(STINGS)) {
    const tonic = noteMidi(s.tonic);
    for (const line of s.lines) {
      assert.equal(line.bars.length, s.chords.length, `${name}: ${line.inst} needs a bar per chord`);
      for (const b of line.bars) parseMelodyBar(b, tonic, SCALES[s.scale], 16);
    }
    for (const c of s.chords) parseChord(c);
    for (const h of s.hits) assert.ok(h.bar < s.chords.length && h.step >= 0 && h.step < 16, `${name} hit`);
    const len = stingLength(name);
    assert.ok(len > 2 && len < 14, `${name}: ${len}s`);
  }
});
