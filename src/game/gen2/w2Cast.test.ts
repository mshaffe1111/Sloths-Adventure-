/**
 * World 2's snapper cast row (ENG-25; 2-5.md NEW 2; level.md rules 21 and 23): a snapper laid by gen2 on a real stage row (a socket on the
 * far bank of a snap pond, gen2/worlds/w2Cast.ts rows, the kit's spawn joining it to the cast), keeping its stones' bar:
 *   - laid: the clock it keeps is the stage's own and fair for its tell (pipeline.ts beatCastFaults: planted missing clock, short creak);
 *   - the sleeper: a kick chases it off ('chasedOff', counted for the purge), and he is never hurt;
 *   - the awake one: its tell starts only on the bar's creak and its snap only on four; planted: the cast's clock withheld (as before
 *     ENG-25, castPlay.ts never handed one), it never tells at all.
 */
import '../headlessDom.ts';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { beatCastFaults, buildGen2Stage, keptFoes } from './pipeline.ts';
import { cfg as toyCfg, kit as toyKit, meadow } from './toyWorld.ts';
import { withTestStage } from './listed.ts';
import { packPlan, plantSeedList } from './seedList.ts';
import { w2Finish } from './worlds/w2.ts';
import { w2CastSpawn, w2Snappers } from './worlds/w2Cast.ts';
import { TURTLE } from '../predators/world2.ts';
import { RealPlay, withFixtureConfig } from '../realPlay.ts';
import { setDifficulty } from '../difficulty.ts';
import type { PadRow } from './rideLay.ts';
import type { SectionTemplate, WorldKit } from './types.ts';
import type { Enemy, LevelConfig } from '../types.ts';

const ID = '2-96';
const cfg: LevelConfig = { ...toyCfg(ID, 'sprint'), unlocked: true };
const ROW = { by: 'snap', pads: ['snap', 'snap', 'snap'], gap: 40, snap: { count: 0.75 } } as const satisfies PadRow;
const section: SectionTemplate = {
  id: 'toy-snapper', name: 'a snapper by the stones', archetypes: 'any', phases: ['ki', 'sho', 'ten', 'ketsu'], difficulty: 2, maxPerStage: 1,
  pieces: [
    { key: 'near', shape: 'bank', w: [340, 340], place: { kind: 'start' }, main: true },
    { key: 'far', shape: 'bank', w: [520, 520], place: { kind: 'pads', after: 'near', row: 'step' }, main: true, landing: true },
  ],
  sockets: [{ id: 'snapper', role: 'enemy', on: 'far', t: [0.55, 0.55], maxThreat: 3, chance: 1 }],
  entry: { piece: 'near', kind: 'ground' }, exit: { piece: 'far', kind: 'ground' }, exitDy: 0, mirrorable: false,
};
const kitOf = (which: 'snapper' | 'snapper-asleep'): WorldKit => ({
  ...toyKit,
  spawn: w2CastSpawn,
  manifest: {
    ...toyKit.manifest, world: 2, pads: { step: ROW }, creatures: w2Snappers('snap-step').filter((c) => c.id === which), props: [], pairs: [], tips: {},
    sections: [{ ...meadow, phases: ['start', 'rest', 'ki', 'sho', 'ten', 'ketsu', 'goal'], mirrorable: false, sockets: meadow.sockets.filter((k) => k.role !== 'prop' && k.role !== 'enemy') }, section],
  },
});
function built(which: 'snapper' | 'snapper-asleep') {
  const kit = kitOf(which);
  for (let seed = 1; seed <= 20; seed++) {
    const st = buildGen2Stage({ config: cfg, kit, seed, difficulty: 'normal' });
    if (!st.gen2.errors?.length && st.enemies.some((e) => e.type === 'turtle')) return { st, kit, seed };
  }
  throw new Error(`no roll lays the ${which}`);
}
function inPlay<T>(which: 'snapper' | 'snapper-asleep', f: (sim: RealPlay, e: Enemy) => T): T {
  const { st, kit, seed } = built(which);
  const dict: string[] = [];
  const packed = packPlan({ seed: st.gen2.seed, rerolls: st.gen2.rerolls, plan: st.gen2.plan, foes: [...keptFoes(st)] }, dict);
  setDifficulty('normal');
  return withTestStage({ [ID]: { kit: () => kit, world: (s, _sq, d) => w2Finish(s as never, d) as typeof s, seeds: [] } }, () => {
    const undo = plantSeedList(ID, { dict, seeds: [seed], plans: [packed] });
    try {
      return withFixtureConfig(cfg, () => {
        const sim = new RealPlay(ID, seed, cfg);
        const e = (sim as unknown as { e: { enemies: Enemy[] } }).e.enemies.find((q) => q.type === 'turtle')!;
        assert.ok(e?.kit, 'the snapper is the creature kit\'s (in the cast)');
        return f(sim, e);
      });
    } finally {
      undo();
    }
  });
}

test('laid by gen2: the snapper keeps its stones\' bar, the asleep row asleep; the clock is the stage\'s and fair (planted faults named)', () => {
  for (const which of ['snapper', 'snapper-asleep'] as const) {
    const { st } = built(which);
    const t = st.enemies.filter((e) => e.type === 'turtle');
    assert.equal(t.length, 1);
    assert.deepEqual(t[0].kitBeat, { clock: 'snap-step' });
    assert.equal(!!t[0].asleep, which === 'snapper-asleep');
    assert.deepEqual(st.proto?.cast?.kinds, ['turtle'], 'it joins the cast');
    assert.deepEqual(beatCastFaults(st, 2), []);
    assert.match(beatCastFaults({ ...st, enemies: t.map((e) => ({ ...e, kitBeat: { clock: 'snap-none' } })) }, 2).join(), /does not have/);
    const short = (st.clocks ?? []).map((c) => (c.id === 'snap-step' ? { ...c, phases: c.phases.map((p) => (p.name === 'warn' ? { ...p, seconds: 0.3 } : p)) as unknown as typeof c.phases } : c));
    assert.match(beatCastFaults({ ...st, clocks: short }, 2).join(), /warn is shorter than its 0.5 s tell/);
  }
});

test('in play: the sleeper is kicked off: chased off, counted, and he is never hurt', () => {
  inPlay('snapper-asleep', (sim, e) => {
    sim.safe = false;
    sim.p.invincibleTimer = 0;
    sim.stand(e.x - 40, e.y + e.height / 2 + 14);
    sim.p.facing = 1;
    const hp = sim.p.hp;
    for (let f = 0; f < 10; f++) sim.frame();
    sim.frame({ kick: 1 });
    let cleared = -1;
    for (let f = 0; f < 30 * 6 && cleared < 0; f++) {
      sim.frame();
      if (sim.p.enemiesDefeated >= 1) cleared = sim.t;
    }
    assert.ok(cleared > 0, `chased off and counted (phase ${e.kit?.phase}, beatenBy ${e.kit?.beatenBy})`);
    assert.equal(e.kit?.beatenBy, 'kick');
    assert.equal(sim.p.hp, hp, 'never hurt');
  });
});

/** the awake one with him standing in its reach: when each tell and each act began, and the clock's phase then */
function beats(withhold: boolean) {
  return inPlay('snapper', (sim, e) => {
    const eng = (sim as unknown as { e: { cast: { step: (...a: unknown[]) => unknown }; clock: { read: (id: string) => { phase: string } } } }).e;
    if (withhold) {
      const c = eng.cast, orig = c.step.bind(c);
      c.step = (h: unknown, dt: unknown, t: unknown, easy: unknown) => orig(h, dt, t, easy);
    }
    sim.stand(e.x - 60, e.y + e.height / 2 + 14);
    const seen: Array<[string, string]> = [];
    let was = e.kit!.phase;
    // (he shuffles where he stands: a sloth holding still is hidden from it, stillness.ts, and this is the beat, not the stillness)
    for (let f = 0; f < 30 * 7; f++) {
      sim.frame(f % 4 < 2 ? { right: true } : { left: true });
      const ph = e.kit!.phase;
      if (ph !== was && (ph === 'tell' || ph === 'act')) seen.push([ph, eng.clock.read('snap-step').phase]);
      was = ph;
    }
    return seen;
  });
}

test('in play: the awake snapper tells only on the bar\'s creak and snaps only on four (the stones\' count)', () => {
  const seen = beats(false);
  assert.ok(seen.some(([p]) => p === 'tell') && seen.some(([p]) => p === 'act'), `it tells and snaps within 7 s: ${JSON.stringify(seen)}`);
  for (const [p, clock] of seen) assert.equal(clock, p === 'tell' ? 'warn' : 'on', `its ${p} began on the clock's ${clock}`);
});

test('planted: with the stage clock withheld from the cast (as before ENG-25), the beat-keeping snapper never tells', () => {
  assert.deepEqual(beats(true), []);
});

/** he stands `dx` px short of the awake snapper, facing it, and kicks when `when` says; whether it was chased off, and his hearts lost */
function kickAt(dx: number, when: (e: Enemy, f: number) => boolean, prep?: (sim: RealPlay, e: Enemy) => void) {
  return inPlay('snapper', (sim, e) => {
    sim.safe = false;
    sim.p.invincibleTimer = 0;
    sim.stand(e.x - dx, e.y + e.height / 2 + 14);
    sim.p.facing = 1;
    const x0 = sim.p.x;
    prep?.(sim, e);
    const hp = sim.p.hp;
    let kicked = -1;
    // (he shuffles in place until he kicks, so it sees him and keeps its count: a still sloth is hidden from it)
    for (let f = 0; f < 30 * 8 && !e.kit?.leaving; f++) {
      // (the kick faces him to it: the shuffle leaves him facing away half the time)
      if (kicked < 0 && when(e, f)) { sim.p.facing = 1; sim.frame({ kick: 1 }); kicked = f; continue; }
      // (a shuffle on the spot: his feet move, so it sees him, and he is put back where he stood, so he never walks into or past it)
      sim.frame(kicked < 0 ? (f % 4 < 2 ? { right: true } : { left: true }) : {});
      if (kicked < 0) sim.p.x = x0;
      if (kicked >= 0 && f > kicked + 20) break;
    }
    return { kicked: kicked >= 0, off: !!e.kit?.leaving, by: e.kit?.beatenBy ?? null, hurt: hp - sim.p.hp, dx: Math.round(e.x - sim.p.x), ph: e.kit?.phase, at: kicked, kicks: (sim as unknown as { e: { statKicks: number } }).e.statKicks };
  });
}

test('TURTLE: a head-on kick on a CLOSED snapper (awake, at rest on its count) glances off its shell (the lead\'s ruling 11-18: kick when open)', () => {
  const r = kickAt(40, (e, f) => f >= 3 && e.kit?.phase === 'rest');
  assert.ok(r.kicked && r.kicks >= 1 && !r.off, `the kick landed and glanced off: ${JSON.stringify(r)}`);
});

test('TURTLE: right after its snap (recovering) the kick sends it off; after a bonk (dazed) too', () => {
  const snap = kickAt(76, (e) => e.kit?.phase === 'recover');
  assert.ok(snap.off && snap.by === 'kick' && snap.hurt === 0, `after the snap: ${JSON.stringify(snap)}`);
  // (the bonk: the cast's own stomp, as engine.ts resolveStomps calls it on a cast animal he lands on)
  const bonk = kickAt(40, (e) => e.kit?.phase === 'stunned', (sim, e) => (sim as unknown as { e: { cast: { beat: (e: Enemy, w: string, t: number, x: number) => boolean } } }).e.cast.beat(e, 'stomp', sim.t, sim.p.x));
  assert.ok(bonk.off && bonk.by === 'kick' && bonk.hurt === 0, `after a bonk: ${JSON.stringify(bonk)}`);
});

test('planted: with TURTLE\'s kick back to any moment (no `when`), the same head-on kick on a closed snapper clears it', () => {
  const k = TURTLE.beatenBy.kick!;
  const was = k.when;
  delete (k as { when?: string }).when;
  try {
    const r = kickAt(40, (e, f) => f >= 3 && e.kit?.phase === 'rest');
    assert.ok(r.kicks >= 1 && r.off, `cleared without the rule: ${JSON.stringify(r)}`);
  } finally {
    (k as { when?: string }).when = was;
  }
});
