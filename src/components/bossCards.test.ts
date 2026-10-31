import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { bossSpeaker, BOSS_DOT_LINE, BOSS_POKEY_LINE } from './BossCards.tsx';
import { dotPresent } from '../game/wayside.ts';
import { generateAllLevels } from '../game/worldsData.ts';
import { THORNBARK_LEVEL as THORNBARK } from '../game/secret.ts';

const words = (s: string) => s.trim().split(/\s+/).length;

test('UI-16: every guardian card checks dotPresent: Dot speaks where she is with Pokey, Pokey himself where she is away', () => {
  const lairs = generateAllLevels().filter((l) => l.objectiveType === 'boss_lair');
  assert.equal(lairs.length, 10);
  for (const l of [...lairs, THORNBARK]) {
    const s = bossSpeaker(l);
    const here = dotPresent(l.worldIndex, l.miniIndex);
    assert.equal(s.who, here ? 'dot' : 'pokey', `${l.id}: Dot ${here ? 'is' : 'is away'}`);
    const own = (here ? BOSS_DOT_LINE : BOSS_POKEY_LINE)[l.secret ? 11 : l.worldIndex];
    assert.equal(s.line, own, `${l.id} has its own line`);
    assert.ok(words(s.line) < 10, `${l.id}: under ten words`);
    if (!here) assert.doesNotMatch(s.line, /\bPokey\b|\bDot\b/, `${l.id}: Pokey's own thought names no one`);
  }
  // the card itself reads who speaks only through bossSpeaker
  const src = readFileSync(new URL('./BossCards.tsx', import.meta.url), 'utf8');
  const card = src.slice(src.indexOf('export const BossIntroCard'));
  assert.match(card.slice(0, 600), /bossSpeaker\(levelConfig\)/);
  assert.doesNotMatch(card.slice(0, card.indexOf('export function expeditionScore')), /BOSS_DOT_LINE\[/);
});

test("UI-16: World 7's guardian card is Pokey's", () => {
  const w7 = generateAllLevels().find((l) => l.worldIndex === 7 && l.objectiveType === 'boss_lair')!;
  assert.deepEqual(bossSpeaker(w7), { who: 'pokey', line: 'Jump the hammer. Then hit what glows.' });
});
