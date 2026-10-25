import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { BADGES, GUARDIANS } from '../../game/badges.ts';
import type { ObjectiveType } from '../../game/types.ts';
import { splitArrows } from './arrowText.tsx';
import { badgeIconName, guardianWorld } from './badgeIcons.ts';
import { CRESTS, crestFor, crestForSpeaker, crestName } from './crests.ts';
import { ICON_NAMES } from './index.tsx';
import { speakerMark } from './speakers.ts';
import { STAGE_TYPES, stageTypeInfo } from './stageTypes.ts';

const OBJECTIVES: ObjectiveType[] = ['sprint', 'harvest', 'purge', 'ascent', 'stealth', 'vine_runner', 'relic_hunt', 'rescue', 'gauntlet', 'boss_lair'];

test('every objective type has a glyph that exists and a one-word label', () => {
  for (const t of OBJECTIVES) {
    const info = stageTypeInfo(t);
    assert.ok(ICON_NAMES.includes(info.icon), `${t} -> ${info.icon} is in the icon set`);
    assert.ok(/^[A-Z][a-z]+( [a-z]+)?$/.test(info.label), `${t} label "${info.label}"`);
  }
  assert.equal(Object.keys(STAGE_TYPES).length, OBJECTIVES.length);
});

test('the nine stage types each read as their own glyph; the boss lair is the crest glyph', () => {
  const glyphs = OBJECTIVES.filter((t) => t !== 'boss_lair').map((t) => stageTypeInfo(t).icon);
  assert.equal(new Set(glyphs).size, 9);
  assert.equal(stageTypeInfo('boss_lair').icon, 'boss');
  assert.equal(stageTypeInfo('stealth').label, 'Stealth');
  assert.equal(stageTypeInfo('vine_runner').icon, 'vine');
  assert.equal(stageTypeInfo('relic_hunt').icon, 'relic');
});

test('an unknown stage type still gets a glyph', () => {
  assert.equal(stageTypeInfo('mystery' as ObjectiveType).icon, 'sprint');
});

test('the icon set has the full list the menus, badges and stage types ask for', () => {
  const need = [
    'lock', 'star', 'heart', 'thornHeart', 'trophy', 'book', 'scroll', 'map', 'leaf', 'flower', 'sparkle', 'note', 'shield', 'swords', 'boot', 'key', 'bolt', 'paw', 'magnet', 'bulb', 'compass', 'crown', 'check', 'cross', 'arrow',
    'sprint', 'harvest', 'purge', 'ascent', 'stealth', 'vine', 'relic', 'rescue', 'gauntlet', 'boss',
  ];
  for (const n of need) assert.ok(ICON_NAMES.includes(n as never), n);
});

test('every world has a painted crest of its own guardian, framed inside its sheet', () => {
  for (let w = 1; w <= 10; w++) {
    const c = crestFor(w);
    assert.ok(c, `world ${w} crest`);
    assert.equal(c.name, GUARDIANS[w - 1]);
    assert.equal(crestName(w), GUARDIANS[w - 1]);
    const f = c.frame;
    assert.ok(f && f.w > 8 && f.h > 8, `world ${w} frame ${c.frameName}`);
    assert.ok(f.x >= 0 && f.y >= 0 && f.x + f.w <= c.atlas.w && f.y + f.h <= c.atlas.h, `world ${w} frame is inside the atlas`);
    assert.ok(c.cx > 0 && c.cx < 1 && c.cy > 0 && c.cy < 1 && c.s > 20, `world ${w} window`);
    assert.ok(existsSync(fileURLToPath(c.url)), `world ${w} atlas file exists`);
  }
});

test('the secret guardian has a crest too, and nothing unknown does', () => {
  assert.equal(crestFor('thornbark')?.name, 'Thornbark');
  assert.equal(crestFor(0), undefined);
  assert.equal(crestFor(11), undefined);
  assert.equal(crestName(11), 'Guardian');
  assert.equal(Object.keys(CRESTS).length, 13); // ten guardians, Thornbark, and the portraits of Meeca and Dot
  for (const k of ['meeca', 'dot'] as const) {
    const c = crestFor(k)!;
    assert.ok(c.frame && c.frame.x + c.frame.w <= c.atlas.w && c.frame.y + c.frame.h <= c.atlas.h, `${k} frame inside its atlas`);
    assert.ok(existsSync(fileURLToPath(c.url)), `${k} atlas file exists`);
  }
});

test('story speakers that are guardians map to their crest', () => {
  assert.equal(crestForSpeaker('Venom Fang'), 1);
  assert.equal(crestForSpeaker('General Iron-Claw'), 10);
  assert.equal(crestForSpeaker('Thornbark'), 'thornbark');
  assert.equal(crestForSpeaker('Meeca'), 'meeca');
  assert.equal(crestForSpeaker('Dot'), 'dot');
  assert.equal(crestForSpeaker('Pokey'), undefined);
});

test('every badge draws as an icon of the set, and the Thorn Heart badge is the thorn heart', () => {
  for (const b of BADGES) assert.ok((ICON_NAMES as string[]).includes(b.icon), `${b.id} icon "${b.icon}" is in the set`);
  assert.equal(badgeIconName('thornHeart'), 'thornHeart');
  assert.equal(badgeIconName('\u{1F3C6}'), 'star'); // an emoji or any unknown name falls back to a star
  assert.equal(BADGES.find((b) => b.id === 'thorn_heart')?.icon, 'thornHeart');
});

test('guardian badges find their world, other badges do not', () => {
  assert.equal(guardianWorld('guardian_1'), 1);
  assert.equal(guardianWorld('guardian_10'), 10);
  assert.equal(guardianWorld('first_steps'), undefined);
  assert.equal(guardianWorld('guardian_x'), undefined);
  const g = BADGES.filter((b) => b.id.startsWith('guardian_'));
  assert.equal(g.length, 10);
  for (const b of g) assert.ok(crestFor(guardianWorld(b.id)!), `${b.id} has a crest`);
});

test('who stands beside a name in a story: Pokey a face, guardians a crest, the rest an icon', () => {
  assert.deepEqual(speakerMark('Pokey'), { kind: 'pokey' });
  assert.deepEqual(speakerMark('Venom Fang'), { kind: 'crest', key: 1 });
  assert.deepEqual(speakerMark('Dot'), { kind: 'dot' });
  assert.deepEqual(speakerMark('Narrator'), { kind: 'icon', icon: 'book' });
  assert.deepEqual(speakerMark('Petal'), { kind: 'icon', icon: 'flower' });
  for (const who of ['Grandma', 'Lieutenant Pell', 'Grandfather']) assert.deepEqual(speakerMark(who), { kind: 'head' });
  const other = speakerMark('Somebody New');
  assert.equal(other.kind, 'icon');
  if (other.kind === 'icon') assert.ok((ICON_NAMES as string[]).includes(other.icon));
});

test('control hints are cut into words and arrows', () => {
  assert.deepEqual(splitArrows('Quick flick \u2190 \u2192 to kick'), [{ text: 'Quick flick ' }, { arrow: 'l' }, { text: ' ' }, { arrow: 'r' }, { text: ' to kick' }]);
  assert.deepEqual(splitArrows('\u2191'), [{ arrow: 'u' }]);
  assert.deepEqual(splitArrows('Slide \u2193 to duck, \u2191 to jump').filter((p) => 'arrow' in p), [{ arrow: 'd' }, { arrow: 'u' }]);
  assert.deepEqual(splitArrows('Tap to punch'), [{ text: 'Tap to punch' }]);
  assert.deepEqual(splitArrows(''), []);
});
