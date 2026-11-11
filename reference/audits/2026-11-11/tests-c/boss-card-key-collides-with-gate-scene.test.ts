/**
 * Audit C (boss slice): App.tsx keeps "this guardian's card has been shown" and "this world's gate scene has been seen" in
 * localStorage. Both keys are built in App.tsx (not exported), so this reads the two templates from the source and builds the key each
 * gives for World 10, the one world with a gate scene (storyWorlds.ts WORLD_GATE = { 10: ... }).
 *
 * The gate scene plays after 10-9 and marks its key; the General's card is skipped when its key is set. One key for both means the
 * General's card (UI-5: "the first time in this save") is never shown to a player who saw the gate scene, which is every player.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { WORLD_GATE } from '../../../../src/game/storyWorlds.ts';

const app = readFileSync(new URL('../../../../src/App.tsx', import.meta.url), 'utf8');
const template = (name: string) => {
  const m = app.match(new RegExp(`const ${name} = \\(([a-z]+)[^)]*\\) => \`([^\`]+)\``));
  assert.ok(m, `${name} is still a one-line template in App.tsx`);
  return { arg: m![1], tpl: m![2] };
};
/** the key the template gives (the only expressions in them: the world, or 11 for the secret stage) */
const keyFor = (name: string, world: number) => {
  const { arg, tpl } = template(name);
  return tpl.replace(/\$\{([^}]+)\}/g, (_, expr: string) => String(new Function(arg, `return ${expr}`)(arg === 'lvl' ? { worldIndex: world, secret: undefined } : world)));
};

test('the guardian card and the gate scene do not share a save key', () => {
  for (const w of Object.keys(WORLD_GATE).map(Number)) {
    const card = keyFor('guardianCardKey', w);
    const gate = keyFor('gateStoryKey', w);
    assert.notEqual(card, gate, `World ${w}: the guardian's card and the gate scene are both kept under ${gate}`);
  }
});
