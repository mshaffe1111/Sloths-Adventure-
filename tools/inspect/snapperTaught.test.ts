// npx tsx --test tools/inspect/snapperTaught.test.ts   (CI: gates.yml, the engine tools' tests)
/**
 * ENG-SNAP (R-165.339; BUILD-25's castBots on 2-5: the child 7/40 Normal, 16/40 Easy, the kid 0/40, every miss a help-ladder rescue at
 * an awake snapper, traces trace-child-N-L4.txt and trace-child-E-L10.txt). Two toys on snapToys.ts's awake snapper row (ENG-25's, id 2-89),
 * level.md rule 21: each planted RED before its fix, and RED again with its skill switched off.
 *   (a) bonkBrake  after a bonk the bounce never carries him to the snapper's far side: every tier that bonks (the child too, made to
 *                  bonk here with letItSnap off, at the child's own thumb: its reaction, hold and turn times) keeps his side: never more
 *                  than its back past its middle (BACK: its half-body and his), never down on its far side while it is dazed, one bonk
 *                  (no far-side loop), then the kick.
 *   (b) letItSnap  the child and the kid play an awake snapper the TAUGHT way (Dot's line: stand back, let it snap, then kick; the lead's
 *                  ruling 11-18): out of its reach, it snaps at nothing, and his kick lands while it recovers (the kit's `when: 'open'`),
 *                  no bonk at all. Middle, expert and adult keep their bonk (held in (a)).
 * SNAP_SKILL_OFF=bonkBrake|letItSnap runs the held tests with that skill off (the RED the REPORT shows); the planted tests below do it in CI.
 */
import '../../src/game/headlessDom.ts';
import test from 'node:test';
import assert from 'node:assert/strict';
import { SKILLS, type FirstTimer } from './firsttimer.ts';
import { CAST_BOTS } from './castBots.ts';
import { snapperSeed, snapperWatch } from './snapToys.ts';

type Setting = 'normal' | 'easy';
const VARIANTS = [1, 2, 3, 4, 5, 6];
/** its half-body (the row's 48 px body) and his (HERO_HALF_W): past this he is off its back, on its far side */
const BACK = 24 + 14;
const bot = (name: string, s: Setting): FirstTimer => CAST_BOTS[name][s]!;
const BONKERS: Array<[string, Setting]> = [['child', 'normal'], ['child', 'easy'], ['middle', 'normal'], ['middle', 'easy'], ['expert', 'normal'], ['adult', 'normal'], ['adult', 'easy']];
const TAUGHT: Array<[string, Setting]> = [['child', 'normal'], ['child', 'easy'], ['kid', 'normal'], ['kid', 'easy']];
const seed = snapperSeed('snapper');
const off = process.env.SNAP_SKILL_OFF as keyof typeof SKILLS | undefined;

function withSkills<T>(set: Partial<Record<keyof typeof SKILLS, boolean>>, f: () => T): T {
  const was = { ...SKILLS };
  Object.assign(SKILLS, set, off ? { [off]: false } : {});
  try {
    return f();
  } finally {
    Object.assign(SKILLS, was);
  }
}
/** (a) one run's breaches: every tier that bonks keeps his side and bonks once */
function bounceBreaches(name: string, s: Setting, v: number): string[] {
  // (the child is made to bonk: with letItSnap on it plays the taught way and never bonks an awake snapper)
  const a = snapperWatch('snapper', bot(name, s), seed, v);
  const at = `${name} ${s} v${v}: ${JSON.stringify(a)}`;
  const bad: string[] = [];
  if (a.bonks < 1) bad.push(`no bonk (nothing proven): ${at}`);
  if (a.bonks > 1) bad.push(`bonked ${a.bonks} times (the far-side loop): ${at}`);
  if (a.past > BACK) bad.push(`bounced ${a.past} px past its middle (over ${BACK}): ${at}`);
  if (a.farLand) bad.push(`came down on its far side while it was dazed: ${at}`);
  if (a.cleared.kick !== 1 || !a.shrine || a.hits + a.lives) bad.push(`not chased off clean to the shrine: ${at}`);
  return bad;
}
/** (b) one run's breaches: the taught way, no bonk */
function taughtBreaches(name: string, s: Setting, v: number): string[] {
  const a = snapperWatch('snapper', bot(name, s), seed, v);
  const at = `${name} ${s} v${v}: ${JSON.stringify(a)}`;
  const bad: string[] = [];
  if (a.bonks) bad.push(`bonked it (${a.bonks}): ${at}`);
  if (a.kickedIn !== 'recover') bad.push(`kick not in its recovery after its snap (${a.kickedIn}): ${at}`);
  if (a.cleared.kick !== 1 || !a.shrine || a.hits + a.lives) bad.push(`not chased off clean to the shrine: ${at}`);
  return bad;
}

for (const [name, s] of BONKERS) {
  test(`(a) bonkBrake: ${name} ${s} bonks once and keeps his side (never over ${BACK} px past its middle, never down on its far side), variants ${VARIANTS.join(', ')}`, () => {
    const bad = withSkills({ letItSnap: false }, () => VARIANTS.flatMap((v) => bounceBreaches(name, s, v)));
    assert.deepEqual(bad, []);
  });
}
for (const [name, s] of TAUGHT) {
  test(`(b) letItSnap: ${name} ${s} lets it snap and kicks it while it recovers, no bonk, variants ${VARIANTS.join(', ')}`, () => {
    const bad = withSkills({}, () => VARIANTS.flatMap((v) => taughtBreaches(name, s, v)));
    assert.deepEqual(bad, []);
  });
}
if (!off) {
  test('planted (a): with bonkBrake off, the child\'s bounce carries him to its far side again (2-5\'s loop)', () => {
    const bad = withSkills({ letItSnap: false, bonkBrake: false }, () => (['normal', 'easy'] as const).flatMap((s) => VARIANTS.flatMap((v) => bounceBreaches('child', s, v))));
    assert.ok(bad.some((b) => b.includes('far side') || b.includes('px past')), `skill off and the child still kept his side: ${bad.join('; ')}`);
  });
  test('planted (b): with letItSnap off, the child and the kid never kick it in its recovery (they bonk, as BUILD-25 saw)', () => {
    const bad = withSkills({ letItSnap: false }, () => TAUGHT.flatMap(([name, s]) => VARIANTS.flatMap((v) => taughtBreaches(name, s, v))));
    assert.ok(bad.filter((b) => b.includes('not in its recovery')).length >= TAUGHT.length * VARIANTS.length / 2, `skill off and they still played the taught way: ${bad.length}`);
  });
}
