/**
 * 5-9's puzzle rooms in the real engine, in the stage the game builds (gen2/game.ts): every shipped roll that holds a room, entered
 * through the game's own path (the layout number, generateStage on the difficulty, the engine), on Normal and Easy, sideways and
 * upright. The room is solved the way its lesson teaches (w5Arena.test.ts plays each room on its own; this plays it where it stands in
 * the shipped stages), with no life or heart lost, and he walks on past it.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import '../headlessDom.ts';
import { RealPlay } from '../realPlay.ts';
import { setDifficulty } from '../difficulty.ts';
import { GEN2_SEEDS } from './seeds.ts';
import { TEA_RISE } from './worlds/w5Arena.ts';

type Run = { spec: { id: string }; box: { x0: number; x1: number }; beyond: { x: number; y: number } | null } & Record<string, any>;

const ROOM_ROLLS = GEN2_SEEDS['5-9'].seeds.flatMap((s, i) => {
  const room = /w5a-room-(cake|tea)/.exec(s.sections)?.[1];
  return room ? [{ i, room: room as 'cake' | 'tea' }] : [];
});

function enter(variant: number, d: 'normal' | 'easy', w: number, h: number): { sim: RealPlay; r: Run } {
  setDifficulty(d);
  const sim = new RealPlay('5-9', variant);
  const e = sim.e as any;
  assert.equal(e.currentStage.gen2?.budget.difficulty, d, 'built by gen2 on the difficulty played');
  assert.equal(e.kit?.rooms.length, 1, 'the roll holds its room');
  e.viewCssW = w;
  e.viewCssH = h;
  e.introT = 99;
  e.applyZoom();
  sim.safe = false;
  const r = e.kit.rooms[0] as Run;
  // (at the room's door, on its floor: the reset post stands just inside)
  sim.stand(r.resets[0].x - 30, r.resets[0].y);
  sim.frame();
  return { sim, r };
}
/** walk to x (a plain walk; stopped dead by a step, a hop over it, as a player does) */
const walkTo = (sim: RealPlay, x: number, tol = 8) => {
  let last = sim.p.x;
  let still = 0;
  for (let i = 0; i < 600 && Math.abs(sim.p.x - x) > tol; i++) {
    const dir = sim.p.x < x ? { right: true } : { left: true };
    still = Math.abs(sim.p.x - last) < 0.5 && sim.p.grounded ? still + 1 : 0;
    last = sim.p.x;
    if (still > 4) {
      sim.frame({ ...dir, press: true });
      for (let k = 0; k < 8; k++) sim.frame({ ...dir, jump: true });
      still = 0;
    } else sim.frame(dir);
  }
  sim.frame();
};
const face = (sim: RealPlay, dir: 1 | -1) => {
  sim.frame(dir > 0 ? { right: true } : { left: true });
  sim.frame();
};

test('5-9 ships rooms: half its rolls hold one, both rooms among them', () => {
  assert.ok(ROOM_ROLLS.length >= 8, `${ROOM_ROLLS.length} of 16`);
  assert.ok(ROOM_ROLLS.some((x) => x.room === 'cake') && ROOM_ROLLS.some((x) => x.room === 'tea'));
});

const SCREENS = [['sideways', 844, 390], ['upright', 390, 844]] as const;
for (const { i, room } of ROOM_ROLLS) {
  for (const d of ['normal', 'easy'] as const) {
    // (both screens on the first roll of each room; sideways on the rest, to keep the suite quick)
    const first = ROOM_ROLLS.find((x) => x.room === room)!.i === i;
    for (const [name, w, h] of first ? SCREENS : SCREENS.slice(0, 1)) {
      test(`5-9 roll ${i}, ${d}, ${name}: the ${room} room in the shipped stage is solved in the real engine, and he walks on`, () => {
        const { sim, r } = enter(i, d, w, h);
        const lives = sim.e.lives;
        const hp = sim.p.hp;
        const kit = (sim.e as any).kit;
        if (room === 'cake') {
          const dozer = r.beetles.find((b: any) => /dozer$/.test(b.spec.id));
          const beetle = r.beetles.find((b: any) => b !== dozer);
          const gate = r.gates[0];
          // (he comes in and stands back while it eats: inside the room)
          walkTo(sim, Math.max(r.box.x0 + 30, dozer.home - 150));
          for (let k = 0; k < 30 * 6 && dozer.st.mode !== 'sleep'; k++) sim.frame();
          assert.equal(dozer.st.mode, 'sleep', 'the dozer shows what a cake does');
          walkTo(sim, r.sources[0].x - 40);
          face(sim, 1);
          sim.frame({ punch: true });
          assert.ok(kit.holding, 'a cake from the stool');
          walkTo(sim, r.plates[0].x - 50);
          face(sim, 1);
          sim.frame({ punch: true });
          sim.wait(0.5);
          walkTo(sim, r.plates[0].x - 200);
          for (let k = 0; k < 30 * 10 && beetle.st.mode !== 'sleep'; k++) sim.frame();
          assert.equal(beetle.st.mode, 'sleep', 'the beetle ate it and slept on the plate');
          assert.equal(gate.open, true);
          walkTo(sim, gate.x + 140);
          assert.ok(sim.p.x > gate.x + 100, `through the gate (${sim.p.x.toFixed(0)})`);
        } else {
          const butler = r.gates[0];
          const lift = r.lifts[0];
          const pot = r.teapots[0];
          const floorY = r.resets[0].y;
          // (on the plank's near end: the pot is in reach from there, as the room shows)
          walkTo(sim, lift.plat.x + 12, 4);
          face(sim, -1);
          sim.frame({ punch: true });
          assert.ok(pot.tipped, 'the pot tipped from the plank');
          sim.wait(4.5);
          assert.ok(sim.p.y < floorY - TEA_RISE + 10, `up with the lift (${sim.p.y.toFixed(0)})`);
          walkTo(sim, r.beyond!.x);
          sim.wait(0.5);
          assert.ok(sim.p.grounded && sim.p.x > butler.wall.x + 100, `over the Butler's arch (${sim.p.x.toFixed(0)}, ${sim.p.y.toFixed(0)})`);
        }
        // (the room cost nothing: no life, no heart)
        assert.equal(sim.e.lives, lives, 'no life lost');
        assert.equal(sim.p.hp, hp, 'no heart lost');
        // (and on along the stage, hopping any step as he meets it: past the room the gauntlet's spiders may be waiting)
        const x = sim.p.x;
        sim.safe = true;
        walkTo(sim, x + 300);
        assert.ok(sim.p.x > x + 150, `he walks on past the room (${x.toFixed(0)} -> ${sim.p.x.toFixed(0)})`);
        setDifficulty('normal');
      });
    }
  }
}
