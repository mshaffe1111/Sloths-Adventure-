// Liana to liana (ENG-S5; 1-6 beat 4 "The chain": "Two lianas, then three, liana to liana ... SHORT, SHORT, LONG"): planted tests. Red
// without the chain catch in the walk (levelCheck 3a), the gen2 chain lay (pipeline swing after a liana, chainRelease), the row
// (w1Swing.ts W1_CHAIN_SECTIONS) or the swing camera's lead onto the next liana's whole swing (cameraFollow.ts lianaBox).
import test from 'node:test';
import assert from 'node:assert/strict';
import { buildGen2Stage, chainRelease, layLocal, lianaRelease, planBudget, rngFor, VINE } from '../pipeline.ts';
import { cfg as toyCfg, kit as toyKit, manifest as toyManifest } from '../toyWorld.ts';
import { chainLines, validateStage } from '../../levelCheck.ts';
import { chainPhase, chainWindow, isChain, setTimedSwing, swingClearance, swingReach, TIMED, type SwingVine } from '../../physics.ts';
import { HURT_SHOW, hurtFocus, landingAhead, lianaBox, SWING_CAM, SWING_SEEN } from '../../cameraFollow.ts';
import { LIANA, type SectionTemplate, type WorldKit } from '../types.ts';
import type { Vine } from '../../types.ts';
import { generateAllLevels } from '../../worldsData.ts';
import { w1World } from './w1.ts';
import { w6Kit } from './w6.ts';
import { THORN_ROW } from './w1Arc12.ts';
import { W1_CHAIN_SECTIONS, withSwing } from './w1Swing.ts';
import { findW1Pits } from '../../w1Pits.ts';

const liana = (id: number, x: number, o: Partial<Vine> = {}): Vine =>
  ({ id, x, topY: 0, bottomY: 420, swaySpeed: 1.1, swayPhase: 0, vineType: 'swing_liana', isSwingingVine: true, swingAmp: 0.3, swingPeriod: 2.85, ...o });

test('the chain window counts a press only with the next liana\'s WHOLE swing in view (SWING_SEEN, gen2 chainRelease), both settings, Easy wider', () => {
  const at = (dx: number, d: 'normal' | 'easy') => chainRelease({ x: 0, topY: 0, bottomY: 420 }, { amp: 0.45, period: VINE.period[d] }, { x: dx, topY: 0, bottomY: 420 }, { amp: 0.45, period: VINE.period[d] }, d);
  for (const d of ['normal', 'easy'] as const) {
    setTimedSwing(d === 'easy');
    // 420 px on, both swinging fully: the leap catches it (the engine's press, chainWindow), but its foot swings out to ~600 px, past what
    // he sees as he presses (SWING_SEEN 414 ahead of him): so it is never laid
    const A = { x: 0, topY: 0, bottomY: 420, swingAmp: 0.45, swingPeriod: TIMED.period, swingPhase: 0 };
    const B0 = { x: 420, topY: 0, bottomY: 420, swingAmp: 0.45, swingPeriod: TIMED.period };
    assert.ok(chainWindow(A, { ...B0, swingPhase: chainPhase(A, B0) }) > 0, `${d}: the leap no longer catches it at all: the test proves nothing`);
    assert.equal(at(420, d), 0, `${d}: a liana whose swing he cannot see whole is laid`);
  }
  setTimedSwing(false);
  // nearer, it is whole in view: a window, and Easy's slower swing and wider sweet spot leave the wider one
  assert.ok(at(300, 'normal') >= LIANA.window.normal && at(300, 'easy') >= at(300, 'normal'), `300 px: Normal ${at(300, 'normal')} s, Easy ${at(300, 'easy')} s`);
});

test('the chain catch is the engine\'s own press onto the next liana as it swings (physics chainWindow), at the phase the stage gives it', () => {
  setTimedSwing(false);
  const A = liana(1, 0, { swingPhase: 0 });
  const B0 = liana(2, 280);
  const B = { ...B0, swingPhase: chainPhase(A as SwingVine, B0 as SwingVine) };
  assert.ok(isChain(A, B), 'two lianas 280 px apart are a chain');
  // a press on A catches B for a good part of the swing (6 lines = 200 ms)
  assert.ok(chainLines(A, B) >= 6, `280 px: ${chainLines(A, B)} lines`);
  // B out of any leap's reach: no line at all
  assert.equal(chainWindow(A as SwingVine, { ...B, x: 1400 } as SwingVine), 0);
  // the grip dial rides it: from the top ('high'), a far liana is out of reach where the low holds still catch it
  const far = { ...B, x: 520, swingAmp: 0.45, swingPhase: chainPhase(A as SwingVine, { ...B0, x: 520, swingAmp: 0.45 } as SwingVine) };
  assert.ok(chainLines(A, far) >= 6 && chainLines({ ...A, grip: 'high' }, far) < chainLines(A, far), `520 px: low ${chainLines(A, far)}, top ${chainLines({ ...A, grip: 'high' }, far)}`);
});

// the toy world's banks over a void, with a three-liana chain and nothing between: the bank, l1, l2, l3, the far bank
const chain: SectionTemplate = {
  id: 'toy-chain', name: 'three lianas, liana to liana', archetypes: 'any', phases: ['sho', 'ten', 'ketsu'], difficulty: 5, weight: 8,
  pieces: [
    { key: 'near', shape: 'bank', w: [300, 400], place: { kind: 'start' } },
    { key: 'l1', shape: 'liana', w: 0, place: { kind: 'swing', after: 'near', top: [400, 420], grip: 'high' } },
    { key: 'l2', shape: 'liana', w: 0, place: { kind: 'swing', after: 'l1', top: [400, 420], grip: 'high', share: [0, 0.35] } },
    { key: 'l3', shape: 'liana', w: 0, place: { kind: 'swing', after: 'l2', top: [400, 420], share: [0, 0.35] } },
    // (narrow, as the W1 rows': the chain's last perch is laid whole in view as he presses, so a wide bank would come in near)
    { key: 'far', shape: 'bank', w: [120, 140], place: { kind: 'land', after: 'l3', dy: [0, 0], share: [0.75, 1] } },
  ],
  entry: { piece: 'near', kind: 'ground' }, exit: { piece: 'far', kind: 'ground' }, exitDy: 0, sockets: [], mirrorable: false,
};

test('built: a three-liana chain with no perch between is laid, and the stage\'s own level check walks it liana to liana (toy world, both settings)', () => {
  const world: WorldKit = withSwing({ ...toyKit, manifest: { ...toyManifest, pit: 'void', sections: [...toyManifest.sections, chain] } });
  let built = 0;
  for (const d of ['normal', 'easy'] as const) {
    for (let seed = 1; seed <= 6; seed++) {
      const st = buildGen2Stage({ config: toyCfg('5-7', 'stealth'), kit: world, seed, difficulty: d });
      const what = `${d} seed ${seed}`;
      assert.deepEqual(validateStage(st).errors, [], what);
      for (const s of st.gen2.sections.filter((x) => x.template === chain.id)) {
        const ls = st.vines.filter((v) => v.vineType === 'swing_liana' && v.x >= s.x0 && v.x <= s.x1).sort((a, b) => a.x - b.x);
        assert.equal(ls.length, 3, `${what}: ${ls.length} lianas in ${s.uid}`);
        // nothing to stand on between the first liana and the last, at the height he swings at (a perch would make it no chain; Easy's
        // soft pit and its stair lie 200 px and more under the bank)
        const between = st.platforms.filter((p) => p.x + p.width > ls[0].x + 40 && p.x < ls[2].x - 40 && p.y < ls[0].bottomY + 100);
        assert.deepEqual(between.map((p) => `${p.x},${p.y},${p.width}`), [], `${what}: a perch between the lianas`);
        // the walk goes liana to liana: with the first or the last liana gone the far bank is cut off (no ledge between them to land on,
        // so only a catch in the air joins them; with the middle one gone the first may still catch the last, 2 x ~250 px on: the engine
        // lets him, so the walk does too)
        for (const k of [0, 2]) {
          const cut = { ...st, vines: st.vines.filter((v) => v !== ls[k]) };
          assert.ok(validateStage(cut).errors.length > 0, `${what}: the stage still walks with l${k + 1} gone (a way round the chain)`);
        }
        built++;
      }
    }
  }
  assert.ok(built > 0, 'no seed laid the chain: the test proves nothing');
});

const all = generateAllLevels();
const k1 = withSwing(w1World());
const KITS = [['1-6', { ...k1, manifest: { ...k1.manifest, hurtFloor: THORN_ROW } }], ['6-3', withSwing(w6Kit(3))]] as const;

test('World 1\'s chain rows (1-6 beat 4: SHORT, SHORT, LONG over thorns) lay on World 1\'s and World 6\'s kits, both settings: every link\'s window, both swinging, never meeting, the next swing whole in view', () => {
  const was = { ...TIMED };
  for (const [id, kit] of KITS) {
    const cfg = { ...all.find((l) => l.id === id)!, unlocked: true };
    for (const t of W1_CHAIN_SECTIONS) {
      for (let i = 1; i <= 3; i++) {
        const wins: Record<string, number[]> = {};
        for (const d of ['normal', 'easy'] as const) {
          const L = layLocal(t, planBudget(cfg, kit.manifest, d), rngFor(i));
          const what = `${id} ${d} ${t.id} roll ${i}`;
          const ls = L.pieces.filter((q) => q.hang?.kind === 'liana');
          assert.equal(ls.length, t.pieces.filter((p) => p.shape === 'liana').length, what);
          const a = L.pieces.find((q) => q.key === 'a')!, b = L.pieces.find((q) => q.key === 'b')!;
          wins[d] = [];
          for (let k = 1; k < ls.length; k++) {
            const A = ls[k - 1], B = ls[k], sA = A.hang!.swing!, sB = B.hang!.swing!;
            const w = chainRelease({ x: A.x, topY: A.y, bottomY: A.y + A.h }, sA, { x: B.x, topY: B.y, bottomY: B.y + B.h }, sB, d);
            assert.ok(w >= LIANA.window[d], `${what}: l${k}->l${k + 1} window ${w} s`);
            wins[d].push(w);
            const vA = { x: A.x, topY: A.y, bottomY: A.y + A.h, swingAmp: sA.amp }, vB = { x: B.x, topY: B.y, bottomY: B.y + B.h, swingAmp: sB.amp };
            assert.ok(swingClearance(vA, vB) >= -0.5, `${what}: l${k} and l${k + 1} swing into each other (${swingClearance(vA, vB)})`);
            assert.ok(sA.amp >= VINE.amp / 2 - 1e-9 && sB.amp >= VINE.amp / 2 - 1e-9, `${what}: a chain liana barely swings (${sA.amp}, ${sB.amp})`);
            // the next liana's whole swing within SWING_SEEN of where he can be as he presses (the camera leads with it, lianaBox)
            assert.ok(B.x + swingReach(vB) - (A.x + A.h * Math.sin(sA.amp)) <= SWING_SEEN, `${what}: l${k + 1}'s swing is never whole in view`);
            // SHORT from a top hold (the row's 'high' dial on every liana but the last)
            assert.equal(sA.grip, 'high', `${what}: l${k} is SHORT, its dial is the top`);
          }
          // the last liana's LONG leap onto the perch, level with the bough the chain left; the gap under the whole chain is the perch's
          const C = ls[ls.length - 1];
          assert.equal(C.hang!.swing!.grip, undefined, `${what}: the last gap is LONG (no dial)`);
          // (counting only presses that see the whole perch, as a dialled liana's: the chain's last liana is linked by the engine's press, so
          // its band runs past the view; ENG-S5's upright still had the perch off screen as he pressed)
          assert.ok(lianaRelease({ x: C.x, topY: C.y, bottomY: C.y + C.h }, C.hang!.swing!, { x: b.x, y: b.y, w: b.w }, d, true) >= LIANA.window[d], `${what}: the perch is not whole in view for a window as he presses`);
          // (and by the camera's own cap, not the lay's measure: its far end, as much of it as the camera shows whole, within SWING_SEEN of
          // the furthest his swing takes him ahead)
          assert.ok(b.x + Math.min(b.w, SWING_CAM.perch) <= C.x + C.h * Math.sin(C.hang!.swing!.amp) + SWING_SEEN, `${what}: the perch is past what he ever sees whole as he presses`);
          assert.equal(b.y, a.y, what);
          const g = L.gaps.filter((x) => x.pit);
          assert.equal(g.length, 1, `${what}: one gap under the whole chain`);
          assert.ok(g[0].x0 <= ls[0].x && g[0].x1 >= C.x, `${what}: the gap spans the chain`);
          // Normal: thorns (the hurt hollow, no steps out); Easy: the soft moss pit with its stair back up
          if (d === 'normal') assert.ok(g[0].hurt && !g[0].back, `${what}: Normal's gap is not the thorn hollow`);
          else assert.ok(!g[0].hurt && g[0].back, `${what}: Easy's gap is not the soft moss pit`);
          // nothing to stand on between the bough and the perch
          assert.deepEqual(L.pieces.filter((q) => !q.hang && q.key !== 'a' && q.key !== 'b').map((q) => q.key), [], what);
        }
        // the same lay on Easy leaves the wider window on every link (its slower swing and wider sweet spot)
        wins.normal.forEach((w, k) => assert.ok(wins.easy[k] >= w, `${id} ${t.id} roll ${i}: Easy's window ${wins.easy[k]} < Normal's ${w} (link ${k + 1})`));
      }
    }
  }
  Object.assign(TIMED, was);
});

test('upright on a swing, the view leads with the next liana\'s WHOLE swing (to its foot\'s far side): the lay\'s SWING_SEEN is what he sees', () => {
  // swinging on a liana at x 0, his feet about 30 under his hold; the next liana 260 px on, swinging 0.3 rad either side
  const hang = { x: 0, width: 0, y: 400 };
  const next = { x: 260, topY: 0, bottomY: 420, swingAmp: 0.3 };
  const box = landingAhead(0, 1, hang, [], [next], true)!;
  assert.deepEqual(box, lianaBox(260, 420 * Math.sin(0.3), box.y1 - 4, 1));
  assert.ok(box.x1 >= 260 + 420 * Math.sin(0.3) - 0.01, `the view stops at ${box.x1}, short of the foot's far swing`);
  // on the LAST liana, over the hollow: the floor under him (160 px down, from his anchor on) never out-scores the perch across the gap
  const floor = { x: -500, y: 560, width: 1000 }, perch = { x: 335, y: 400, width: 130 };
  const toPerch = landingAhead(0, 1, hang, [floor, perch], [], true)!;
  assert.ok(toPerch.x1 >= 335 + 120, `on a swing the view leads to the floor under him (${JSON.stringify(toPerch)}), not the perch across`);
  // a still climb (no swing) and sideways (not `whole`) keep the old lip
  assert.ok(landingAhead(0, 1, hang, [], [{ ...next, swingAmp: undefined }], true)!.x1 <= 300);
  assert.ok(landingAhead(0, 1, hang, [], [next], false)!.x1 <= 300);
});

test('built: World 1\'s chain row over a PAINTED thorn hollow on Normal (banks reach down to its floor, w1Pits finds it lip to lip), Easy\'s soft moss pit', () => {
  // (off a 24 px bough the hollow had no lips and the thorn bed was never painted: a plain block under the chain, ENG-S5's pits probe)
  const t = { ...W1_CHAIN_SECTIONS[1], archetypes: 'any' as const, weight: 8 };
  const world: WorldKit = withSwing({ ...toyKit, manifest: { ...toyManifest, pit: 'soft', hurtFloor: THORN_ROW, sections: [...toyManifest.sections, t] } });
  let built = 0;
  for (const d of ['normal', 'easy'] as const) {
    for (let seed = 1; seed <= 2; seed++) {
      const st = buildGen2Stage({ config: toyCfg('5-7', 'stealth'), kit: world, seed, difficulty: d });
      assert.deepEqual(validateStage(st).errors, [], `${d} seed ${seed}`);
      for (const s of st.gen2.sections.filter((x) => x.template === t.id)) {
        const ls = st.vines.filter((v) => v.vineType === 'swing_liana' && v.x >= s.x0 && v.x <= s.x1).sort((a, b) => a.x - b.x);
        const hurt = findW1Pits(st.platforms).filter((g) => g.kind === 'hurt' && g.x0 <= ls[0].x && g.x1 >= ls[ls.length - 1].x);
        if (d === 'normal') assert.equal(hurt.length, 1, `${d} seed ${seed} ${s.uid}: no painted thorn hollow under the chain`);
        else assert.equal(hurt.length, 0, `${d} seed ${seed} ${s.uid}: Easy lays thorns under the chain`);
        built++;
      }
    }
  }
  assert.ok(built > 0, 'no seed laid the chain row: the test proves nothing');
});

test('a swing over a hollow that hurts asks the view to keep its thorn bed in (hurtFocus, the engine\'s focus): sideways the swing view\'s foot sat at the lip', () => {
  const floor = { x: 300, y: 560, width: 900 };
  // over the hollow, swinging: the box runs from his head down past the hollow's floor, where the thorn bed stands
  assert.deepEqual(hurtFocus([floor], 700, 330), { x0: 660, x1: 740, y0: 330 - 104, y1: 560 + HURT_SHOW });
  // not over it (on the bank before it), or the floor above him: nothing asked
  assert.equal(hurtFocus([floor], 200, 330), null);
  assert.equal(hurtFocus([{ ...floor, y: 300 }], 700, 330), null);
});
