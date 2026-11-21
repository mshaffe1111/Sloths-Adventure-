/**
 * The bot's cage skill (firsttimer.ts CAGE_SKILL; level.md rule 21, toys first; ENG-CAGE 11-20): the real first-timer bot in the real
 * engine on 2-3's OWN gen2-laid row (stageTable '2-3', kit 'w2-23', rolled by the game's listed path: D75, never a dev fixture).
 *   - THE BANK CAGE: cage 1 (a reed cage, cageHp 2, on a flat bank): he stops at it, punches it open and the little one joins his line.
 *     With the skill off he walks past it, and a whole run ends at the sealed door with nobody home.
 *   - THE MOORING POST: cage 4 hung up a climbing vine (2-3 beat 5, ~190 px up a tree_climb vine, nothing to step off onto at its top):
 *     he climbs to it, punches it open from the vine (Pokey punches while climbing: proved on the real engine through the Pad's punch,
 *     InputEngine.triggerTouchPunch, ENG-CAGE REPORT), and the pup joins the line. With the skill off it stays shut.
 * No stage id lives in the skill: any world's cage (a collectible of type 'cage' not held by a puzzle kit) by its data.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CAGE_SKILL, FirstTimerRun, FT_ADULT, FT_CHILD, FT_EXPERT, FT_KID, FT_MIDDLE, freshPhone, rng, type FirstTimer } from './firsttimer.ts';

interface CageRun { end: string; freed: boolean; hp: number; inLine: boolean; t: number }

type Cage = { id: number; x: number; y: number; type: string; collected: boolean; cageHp?: number; critter?: string };

/** one run on 2-3's gen2 row; `post`: stood on the bank before the mooring post's vine first. Reports the cage the toy is about */
function cageRun(who: FirstTimer, seed: number, o: { post?: boolean; cap?: number; skill?: boolean } = {}): CageRun {
  const was = { ...CAGE_SKILL };
  if (o.skill === false) for (const k of Object.keys(CAGE_SKILL) as Array<keyof typeof CAGE_SKILL>) CAGE_SKILL[k] = false;
  freshPhone(who.setting);
  const mr = Math.random;
  Math.random = rng(seed * 7919 + 13);
  try {
    {
      const run = new FirstTimerRun('2-3', seed, who, { cap: o.cap ?? 45 });
      const e = run.e as unknown as Record<string, any>;
      const cages = (e.collectibles as Cage[]).filter((c) => c.type === 'cage').sort((a, b) => a.x - b.x);
      assert.ok(e.follow, `seed ${seed}: 2-3's gen2 row starts its line (proto.follow)`);
      let cage = cages[0];
      if (o.post) {
        const vines = run.sim.vines as Array<{ x: number; topY: number; bottomY: number }>;
        const on = cages.map((c) => ({ c, v: vines.find((v) => Math.abs(v.x - c.x) < 40 && c.y > v.topY && c.y < v.bottomY - 60) })).find((q) => q.v);
        assert.ok(on, `seed ${seed}: a cage hung up a climbing vine (the mooring post)`);
        cage = on.c;
        run.sim.stand(on.v!.x - 220, on.v!.bottomY);
        for (let i = 0; i < 20; i++) run.sim.frame({});
        run.prog.relocate(run.sim.p);
      }
      assert.equal(cage.cageHp, 2, `seed ${seed}: the cage takes two blows`);
      run.play();
      const inLine = ((e.follow.line ?? []) as Array<{ critter?: string; kind?: string; state: string }>).some((f) => f.state !== 'home');
      return { end: run.end, freed: cage.collected, hp: cage.cageHp ?? 2, inLine: inLine || e.follow.home() > 0, t: +run.t.toFixed(1) };
    }
  } finally {
    Math.random = mr;
    Object.assign(CAGE_SKILL, was);
  }
}

const TIERS: Array<[string, FirstTimer]> = [['child', FT_CHILD], ['middle', FT_MIDDLE], ['expert', FT_EXPERT], ['adult', FT_ADULT], ['kid', FT_KID]];
const SEEDS = [1, 2, 3];

test('the bank cage: every bot stops at it, punches it open, and the little one joins his line (2-3 gen2 row, seeds 1-3)', () => {
  for (const [name, who] of TIERS) for (const seed of SEEDS) {
    const r = cageRun(who, seed);
    assert.ok(r.freed, `${name} seed ${seed}: the bank cage stays shut ${JSON.stringify(r)}`);
    assert.ok(r.inLine, `${name} seed ${seed}: freed, but nobody joined the line ${JSON.stringify(r)}`);
  }
});

test('the bank cage, skill off (the plant): he walks past it and the run ends at the sealed door with nobody home', () => {
  const r = cageRun(FT_MIDDLE, 1, { skill: false, cap: 600 });
  assert.equal(r.freed, false, JSON.stringify(r));
  assert.equal(r.end, 'sealed door', JSON.stringify(r));
});

test('the mooring post: he climbs the post, punches its cage open from the vine, and the pup joins the line (seeds 1-3)', () => {
  for (const [name, who] of TIERS) for (const seed of SEEDS) {
    const r = cageRun(who, seed, { post: true, cap: 40 });
    assert.ok(r.freed, `${name} seed ${seed}: the post's cage stays shut ${JSON.stringify(r)}`);
    assert.ok(r.inLine, `${name} seed ${seed}: freed, but the pup never joined ${JSON.stringify(r)}`);
  }
});

test('the mooring post, skill off (the plant): the post cage stays shut', () => {
  const r = cageRun(FT_MIDDLE, 1, { post: true, cap: 40, skill: false });
  assert.equal(r.freed, false, JSON.stringify(r));
});
