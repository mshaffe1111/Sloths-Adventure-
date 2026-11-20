// npx tsx --test tools/inspect/snapperTaught.test.ts   (CI: gates.yml, the engine tools' tests)
/**
 * ENG-SNAP (R-165.339; BUILD-25's castBots on 2-5: the child 7/40 Normal, 16/40 Easy, the kid 0/40, every miss a help-ladder rescue at
 * an awake snapper, traces trace-child-N-L4.txt and trace-child-E-L10.txt). Two toys on snapToys.ts's awake snapper row (ENG-25's, id 2-89),
 * level.md rule 21: each planted RED before its fix, and RED again with its skill switched off.
 *   (a) bonkBrake  after a bonk the bounce never carries him to the snapper's far side: every tier that bonks (the child too, made to
 *                  bonk here with letItSnap off, at the child's own thumb: its reaction, hold and turn times) keeps his side: never more
 *                  than its back past its middle (BACK: its half-body and his; the adult's swing is not held, its thumb's: bounceBreaches),
 *                  never down on its far side while it is dazed, one bonk (no far-side loop), then the kick.
 *   (b) letItSnap  the child and the kid play an awake snapper the TAUGHT way (Dot's line: stand back, let it snap, then kick; the lead's
 *                  ruling 11-18): out of its reach, it snaps at nothing, and his kick lands while it recovers (the kit's `when: 'open'`),
 *                  no bonk at all (the kid held to what its thumb can do: taughtBreaches). Middle, expert and adult keep their bonk
 *                  (held in (a)).
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
  // (the adult's is a first-timer's thumb: its steer is never let go at once (its late lift-off re-arms, R-165.59), so its steered bonk can
  //  reach its back at full run and the bounce swing over it (52 px, Normal v5) before its turn: it is held to where it comes down)
  if (a.past > BACK && name !== 'adult') bad.push(`bounced ${a.past} px past its middle (over ${BACK}): ${at}`);
  if (a.farLand) bad.push(`came down on its far side while it was dazed: ${at}`);
  if (a.cleared.kick !== 1 || !a.shrine || a.hits + a.lives) bad.push(`not chased off clean to the shrine: ${at}`);
  return bad;
}
/**
 * (b) one run's breaches: the taught way. The child: no bonk at all, his kick in its recovery after its snap, chased off clean to the
 * shrine. The kid (no bar, the floor: the packet) is held to what its thumb can do: a first-timer's steer is never let go (its late
 * lift-off re-arms every frame, R-165.59), so it cannot hold a stand and some runs never get the kick in (the help ladder takes it
 * past); it never bonks it by choice (no bonk hop of its own), is never hurt by it, and every kick it lands on one it did not come down on
 * (a hop off the last snap stone onto it, taken as a bonk: adopted) lands in its recovery.
 */
function taughtBreaches(name: string, s: Setting, v: number): string[] {
  const a = snapperWatch('snapper', bot(name, s), seed, v);
  const at = `${name} ${s} v${v}: ${JSON.stringify(a)}`;
  const bad: string[] = [];
  if (a.bonkHops) bad.push(`bonked it by choice (${a.bonkHops} hops): ${at}`);
  if (a.hits + a.lives) bad.push(`hurt by it: ${at}`);
  if (name === 'kid') {
    if (!a.adopted && a.cleared.kick && a.kickedIn !== 'recover') bad.push(`kick not in its recovery after its snap (${a.kickedIn}): ${at}`);
    return bad;
  }
  if (a.bonks) bad.push(`bonked it (${a.bonks}): ${at}`);
  if (a.kickedIn !== 'recover') bad.push(`kick not in its recovery after its snap (${a.kickedIn}): ${at}`);
  if (a.cleared.kick !== 1 || !a.shrine) bad.push(`not chased off to the shrine: ${at}`);
  return bad;
}

for (const [name, s] of BONKERS) {
  test(`(a) bonkBrake: ${name} ${s} bonks once and keeps his side (${name === 'adult' ? '' : `never over ${BACK} px past its middle, `}never down on its far side), variants ${VARIANTS.join(', ')}`, () => {
    const bad = withSkills({ letItSnap: false }, () => VARIANTS.flatMap((v) => bounceBreaches(name, s, v)));
    assert.deepEqual(bad, []);
  });
}
for (const [name, s] of TAUGHT) {
  const what = name === 'kid' ? 'never bonks it by choice, is never hurt by it, kicks only in its recovery' : 'lets it snap and kicks it while it recovers, no bonk';
  test(`(b) letItSnap: ${name} ${s} ${what}, variants ${VARIANTS.join(', ')}`, () => {
    const bad = withSkills({}, () => VARIANTS.flatMap((v) => taughtBreaches(name, s, v)));
    assert.deepEqual(bad, []);
  });
}
if (!off) {
  test('planted (a): with bonkBrake off, the child\'s bounce carries him to its far side again (2-5\'s loop)', () => {
    const bad = withSkills({ letItSnap: false, bonkBrake: false }, () => (['normal', 'easy'] as const).flatMap((s) => VARIANTS.flatMap((v) => bounceBreaches('child', s, v))));
    assert.ok(bad.some((b) => b.includes('far side') || b.includes('px past')), `skill off and the child still kept his side: ${bad.join('; ')}`);
  });
  test('planted (b): with letItSnap off, the child and the kid bonk it by choice (as BUILD-25 saw), at least half the runs', () => {
    const bad = withSkills({ letItSnap: false }, () => TAUGHT.flatMap(([name, s]) => VARIANTS.flatMap((v) => taughtBreaches(name, s, v))));
    assert.ok(bad.filter((b) => b.includes('by choice')).length >= TAUGHT.length * VARIANTS.length / 2, `skill off and they still played the taught way: ${bad.length}`);
  });
}
