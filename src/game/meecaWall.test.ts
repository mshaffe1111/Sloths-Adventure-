/**
 * 5-M (Meeca), QA 2026-10-31 (Matt: "it just puts you back to where the cocoon is"): a trunk she has not cut yet is a wall at the trunk
 * itself, from the sky to the ground. Every way past it is tried, at every trunk, on several rolls, held sideways and upright, with the
 * Jump help off and on: walking, running jumps, the second jump, from every raised piece (a ledge, a log, a cocoon) and every climb (a
 * post, a tree) near it. She never gets past it, and she is never moved back more than a frame's step in one frame (no snap-back from far
 * away, ever). Cut, it lets her on. And the checkpoints: past the camp, past the trail mark, at each room's door, each behind the next
 * trunk to cut; a run picked up at a flag starts there with the trunks behind it cut.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { RealPlay } from './realPlay.ts';
import { MeecaBot } from './meecaBot.ts';
import { WALL_STEP, type MeecaPlay } from './meecaPlay.ts';
import { setJumpHelp, type JumpHelp } from './jumpHelp.ts';
import { carveSeconds } from './meecaStage.ts';

type Pad = Parameters<RealPlay['frame']>[0];

function sim(seed: number, w: number, h: number, help: JumpHelp): { sim: RealPlay; mc: MeecaPlay } {
  try {
    localStorage.removeItem('sloth_tips_5-M');
  } catch {
    /* no storage */
  }
  setJumpHelp(help);
  const s = new RealPlay('5-M', seed);
  Object.assign(s.e, { viewCssW: w, viewCssH: h, introT: 99 });
  s.e.applyZoom();
  (s.e.input as { source: string }).source = 'gesture';
  new MeecaBot(s).card();
  const mc = (s.e as { mc: MeecaPlay }).mc;
  mc.flicker.on = true;
  mc.flicker.show = 1;
  return { sim: s, mc };
}

/** the moves tried from wherever she is put: each a list of pads, played in turn */
const ROUTES: Array<[string, Pad[]]> = [
  ['walk', Array(90).fill({ right: true })],
  ['running jump', [...Array(8).fill({ right: true }), { right: true, jump: true, press: true }, ...Array(40).fill({ right: true, jump: true })]],
  [
    'second jump',
    [
      ...Array(6).fill({ right: true }),
      { right: true, jump: true, press: true },
      ...Array(10).fill({ right: true, jump: true }),
      { right: true },
      { right: true, jump: true, press: true },
      ...Array(40).fill({ right: true, jump: true }),
    ],
  ],
  ['hops', Array.from({ length: 120 }, (_, i) => (i % 20 === 0 ? { right: true, jump: true, press: true } : { right: true, jump: i % 20 < 12 }))],
  ['climb then right', [...Array(80).fill({ up: true }), ...Array(10).fill({ up: true, right: true }), { right: true, jump: true, press: true }, ...Array(50).fill({ right: true, jump: true })]],
];

for (const [name, w, h] of [['sideways', 844, 390], ['upright', 390, 844]] as const) {
  for (const help of ['off', 'forward'] as const) {
    test(`5-M ${name}, Jump help ${help}: no way past a trunk not cut yet, and never a snap back`, () => {
      try {
        for (const seed of [1, 38, 75, 112]) {
          const probe = sim(seed, w, h, help);
          const trunks = probe.mc.st.trunks;
          for (let i = 0; i < trunks.length; i++) {
            const tr = trunks[i];
            const wall = tr.x + tr.w / 2 + 14;
            // where she is put to try: the trunk's own spot, a run-up behind it, and every raised piece and climb near it
            const starts: Array<{ x: number; y: number; why: string }> = [
              { x: tr.standX, y: tr.standY, why: 'at the trunk' },
              { x: tr.x - 220, y: tr.standY, why: 'a run-up' },
            ];
            for (const pl of probe.sim.platforms) {
              if (pl.y >= tr.standY + 4 || pl.x > wall - 10 || pl.x + pl.width < wall - 420 || pl.width < 30) continue;
              starts.push({ x: Math.min(pl.x + pl.width - 12, wall - 14), y: pl.y, why: `on a raised piece at ${Math.round(pl.x)},${pl.y}` });
            }
            for (const v of probe.sim.vines) {
              if (v.x > wall - 4 || v.x < wall - 420) continue;
              starts.push({ x: v.x, y: v.bottomY + 6, why: `at the climb ${v.id} (x ${Math.round(v.x)})` });
            }
            for (const st of starts) {
              for (const [route, pads] of ROUTES) {
                const { sim: s, mc } = sim(seed, w, h, help);
                mc.marked = i;
                if (i === trunks.length - 1) mc.phase = 'last';
                s.stand(st.x, st.y);
                s.frame();
                let prev = s.p.x;
                const at = `seed ${seed} ${name} help ${help}, trunk ${tr.id}, ${st.why}, ${route}`;
                for (const pad of pads) {
                  s.frame(pad);
                  assert.ok(s.p.x <= wall + 0.01, `${at}: got past (x ${s.p.x.toFixed(1)}, wall ${wall})`);
                  assert.ok(prev - s.p.x <= 12, `${at}: moved back ${(prev - s.p.x).toFixed(1)} px in one frame`);
                  prev = s.p.x;
                }
                assert.equal(mc.marked, i, `${at}: nothing cut by the routes`);
              }
            }
          }
        }
      } finally {
        setJumpHelp('off');
      }
    });
  }
}

test('5-M: cut, the trunk lets her on; and her stop there carves (the ring, the ghost finger, the "done")', () => {
  const { sim: s, mc } = sim(1, 844, 390, 'off');
  const tr = mc.st.trunks[0];
  s.stand(tr.x - 200, tr.standY);
  for (let i = 0; i < 90; i++) s.frame({ right: true });
  const wall = tr.x + tr.w / 2 + 14;
  assert.ok(Math.abs(s.p.x - wall) < 1, `stopped at the wall (${s.p.x})`);
  assert.equal(mc.carveSpot, true, 'where she stops she can carve');
  assert.equal(mc.ringOn, 0);
  assert.equal(mc.ringFinger, true, 'the ghost finger shows');
  assert.equal(mc.bubble?.who, 'flicker', "Flicker's reminder at the stop");
  for (let i = 0; i < 30 * 20 && mc.marked === 0; i++) s.frame({ circle: 0.45 });
  assert.equal(mc.marked, 1);
  assert.equal(mc.doneTrunk, 0, 'the done moment');
  for (let i = 0; i < 60; i++) s.frame({ right: true });
  assert.ok(s.p.x > wall + 100, 'and on she goes');
});

test('5-M: three tries that carve nothing open the slow way: a still finger held down carves', () => {
  const { sim: s, mc } = sim(1, 390, 844, 'off');
  const tr = mc.st.trunks[0];
  s.stand(tr.standX, tr.standY);
  s.frame();
  for (let i = 0; i < 30; i++) s.frame({ touchHold: true });
  assert.equal(mc.cut[0], 0, 'a held finger carves nothing at first');
  for (let k = 0; k < 3; k++) {
    s.frame({ punch: true });
    for (let i = 0; i < 20; i++) s.frame();
  }
  assert.equal(mc.holdOk, true);
  for (let i = 0; i < 30 * 30 && mc.marked === 0; i++) s.frame({ touchHold: true });
  assert.equal(mc.marked, 1, `held: ${mc.cut[0].toFixed(2)} of ${carveSeconds(tr.lines)}`);
});

test('5-M: checkpoints past the camp, past the mark and at every room door, each behind the next trunk; a run picked up at a flag', () => {
  for (const seed of [1, 38, 75, 112]) {
    const s = new RealPlay('5-M', seed);
    const mc = (s.e as { mc: MeecaPlay }).mc;
    const cps = s.stage.checkpoints ?? [];
    assert.ok(cps.length >= 7, `${cps.length} flags`);
    const st = mc.st;
    assert.ok(cps.some((c) => c.x > st.campEnd && c.x < st.trunks[0].x), 'one past the camp');
    assert.ok(cps.some((c) => c.x > st.trunks[0].x + st.trunks[0].w / 2 + 14 && c.x < st.trunks[1].x), 'one past the mark');
    // (room 5's door is in the dark, where no flag may stand: its flag is past room 4's trunk, the last thing before it)
    const rooms = (s.e as { kit: { rooms: Array<{ box: { x0: number; x1: number } }> } }).kit.rooms;
    rooms.forEach((r, k) => {
      const before = st.trunks[k].x + st.trunks[k].w / 2 + 14;
      assert.ok(cps.some((c) => Math.abs(c.x - r.box.x0) < 200 || (k === rooms.length - 1 && c.x > before && c.x < r.box.x0)), `one at room ${k + 1}'s door (${r.box.x0})`);
    });
    // each flag stands on ground, and none sits between a trunk and the wall past it
    for (const c of cps) {
      assert.ok(s.platforms.some((p) => p.type === 'solid' && Math.abs(p.y - c.y) < 1 && c.x >= p.x && c.x <= p.x + p.width), `flag at ${c.x} on the ground`);
    }
    // picked up at the fourth flag: the trunks behind it cut, Flicker with her, and the card holds her there
    const flag = cps[3];
    mc.resumeAt(flag.x);
    assert.equal(mc.marked, st.trunks.filter((t) => t.x < flag.x).length);
    assert.equal(mc.flicker.on, true);
    mc.after();
    assert.equal(s.p.x, flag.x);
  }
});

test(`5-M: a jump of more than ${WALL_STEP} px in a frame is her being put somewhere: the wall never drags her back from it`, () => {
  const { sim: s, mc } = sim(1, 844, 390, 'off');
  const tr = mc.st.trunks[0];
  s.stand(tr.x - 100, tr.standY);
  s.frame();
  s.stand(tr.x + 600, tr.standY);
  s.frame();
  assert.ok(s.p.x > tr.x + 500, `${s.p.x}`);
});
