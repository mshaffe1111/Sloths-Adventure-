/**
 * THE PROBE-EQUALITY GATE (ENG-SIM step 1, R-165.470; the spike R-165.462 item 1, B1-B3): a probe (src/game/engineProbe.ts) flies the
 * live engine ahead and puts it back; the bots may only ask it if asking changes NOTHING. On one seed of every world:
 *  (1) the graph prints equal after a probe: the whole harness (RealPlay and its engine) right after a probe prints as right before;
 *  (2) a run probed every 3rd frame ends equal to the same run never probed: the harness's graph and every top-level binding of every
 *      src/ module (tools/engine/moduleStores.ts) at checkpoints and at the end;
 *  (3) the answers thrown away, the bot's rows are today's rows: the kid bot's whole run (firstTimer's FTRun, its wall time aside),
 *      probed every 3rd frame with a candidate press whose answer is dropped, equals the run never probed.
 * The two runs play in two separate module worlds (one bundle imported twice), so neither inherits the other's module state.
 * Planted first (RED on c73cb9766): tipMemory's known leak, the spike's B3 case (2-4 seed 35, Easy: a probe flew past a Dot tip, the
 * tip's module marked it sent, and the live run never said it).
 *
 * MEMOS: module stores a probe may change because they are memos of pure inputs or the probe's own counters; each says why. A store
 * not here that a probe changes fails the gate: register it with playStores.ts (src/game/playStores.ts).
 */
import { before, test } from 'node:test';
import assert from 'node:assert/strict';
import { buildStoreBundle, changedStores, printStores, type StoreRef } from './moduleStores.ts';

const MEMOS: ReadonlyArray<{ mod: string; name: string; why: string }> = [
  { mod: 'src/game/engineProbe.ts', name: 'PROBE_STATS', why: "the probe's own cost counters" },
  { mod: 'src/game/engineProbe.ts', name: 'SHARE_STATS', why: "the probe's own share counters" },
  { mod: 'src/game/physics.ts', name: 'reachTables', why: 'the reach memo: a pure function of the jump numbers, the live run builds the same table' },
  { mod: 'src/game/physics.ts', name: 'dropReachCache', why: 'the drop-reach memo (pure, as reachTables)' },
  { mod: 'src/game/physics.ts', name: 'chainCache', why: 'the chain memo (pure, as reachTables)' },
  { mod: 'src/game/physics.ts', name: 'framesFlown', why: "the reach memo's own cost counter (reachFill.test.ts): it counts the memo's building, which a probe may do first" },
  { mod: 'src/game/controlPrefs.ts', name: 'style', why: "a read-through cache of the phone's control setting; the probe puts the phone's storage back, so the live run reads the same" },
  { mod: 'src/game/haptics.ts', name: 'on', why: "a read-through cache of the phone's haptics setting (as controlPrefs style)" },
  { mod: 'src/game/headlessDom.ts', name: 'g', why: "globalThis (Node's own internals change under it); the globals play uses are Math.random (put back, checked below) and localStorage (saved and put back)" },
];
const memo = (k: string): boolean => MEMOS.some((m) => k.startsWith(m.mod + ' ') && new RegExp(`^${m.name}\\d*$`).test(k.slice(m.mod.length + 1)));

/** one seed of every world (the kid on Easy: the help ladder and the most falls), and the spike's B3 case */
const WORLDS: ReadonlyArray<{ id: string; seed: number }> = [
  { id: '1-1', seed: 3 }, { id: '2-4', seed: 35 }, { id: '3-1', seed: 1 }, { id: '4-1', seed: 1 }, { id: '5-1', seed: 1 },
  { id: '6-1', seed: 1 }, { id: '7-1', seed: 1 }, { id: '8-1', seed: 1 }, { id: '9-1', seed: 1 }, { id: '10-1', seed: 1 },
];
/** the candidate the probes fly: a press and a short hold, then running on (the answer is thrown away) */
const CAND = Array.from({ length: 45 }, (_, k) => ({ right: true, jump: k < 5, press: k === 0 }));
const EVERY = 3;
const CHECK_GRAPH = 10; // (1) on every 10th probe
const CHECK_STORES = 200; // (1) for the module stores too, every 200th probe (a print of them all is about 150 ms)
const CHECKPOINT = 900; // (2) every 30 s of a harness's frames

type World = Record<string, any> & { __STORES: StoreRef[] };
let A: World;
let B: World;
before(async () => {
  const file = await buildStoreBundle('tools/engine/probeGateEntry.ts');
  A = await import(file + '?probed');
  B = await import(file + '?plain');
});
const src = (w: World) => w.__STORES.filter((s) => s.mod.startsWith('src/'));
const stores = (w: World) => {
  const m = printStores(src(w), w.graphPrint);
  for (const k of [...m.keys()]) if (memo(k)) m.delete(k);
  return m;
};

interface Watch {
  /** checkpoints: per harness (in the order made), per frame count, the graph print and the stores print */
  marks: string[];
  probes: number;
  bad: string[];
  undo(): void;
}
/** play every RealPlay frame of world `w` through a watch: checkpoints, and (probing) a probe every EVERY-th frame first */
function watch(w: World, probing: boolean): Watch {
  const RP = w.RealPlay.prototype;
  const frame = RP.frame;
  const sims = new WeakMap<object, { n: number; k: number }>();
  let made = 0;
  let inProbe = false;
  const out: Watch = { marks: [], probes: 0, bad: [], undo: () => { RP.frame = frame; } };
  RP.frame = function (this: any, pad: unknown) {
    if (inProbe) return frame.call(this, pad);
    let s = sims.get(this);
    if (!s) sims.set(this, (s = { n: 0, k: made++ }));
    if (s.n % CHECKPOINT === 0) out.marks.push(`harness ${s.k} frame ${s.n}: ${w.graphPrint(this)} ${JSON.stringify([...stores(w)])}`);
    if (probing && s.n % EVERY === 0) {
      const i = out.probes++;
      const g0 = i % CHECK_GRAPH === 0 ? w.graphPrint(this) : null;
      const s0 = i % CHECK_STORES === 0 ? stores(w) : null;
      const mr = Math.random;
      inProbe = true;
      try {
        w.probe(this, CAND, (e: any) => e.player.x);
      } finally {
        inProbe = false;
      }
      if (Math.random !== mr) out.bad.push(`probe ${i}: Math.random not put back`);
      if (g0 !== null && w.graphPrint(this) !== g0) out.bad.push(`probe ${i} (harness ${s.k} frame ${s.n}): the graph print changed`);
      if (s0) for (const k of changedStores(s0, stores(w))) out.bad.push(`probe ${i} (harness ${s.k} frame ${s.n}): module store ${k} changed`);
    }
    s.n++;
    return frame.call(this, pad);
  };
  return out;
}

/** where two lists of prints first differ, short */
function firstDiff(a: string[], b: string[]): string | null {
  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    if (a[i] === b[i]) continue;
    const x = (a[i] ?? '').split(' '), y = (b[i] ?? '').split(' ');
    const j = x.findIndex((v, n) => v !== y[n]);
    return `checkpoint ${i} (${x.slice(0, 4).join(' ')}): token ${j}: probed ${x.slice(Math.max(0, j - 8), j + 3).join(' ').slice(0, 240)} | plain ${y.slice(Math.max(0, j - 8), j + 3).join(' ').slice(0, 240)}`;
  }
  return null;
}

/** the spike's B3 case: 900 frames of a fixed pad on 2-4 seed 35, Easy, probed 45 frames ahead every 3rd frame, vs never probed */
function b3(w: World, probing: boolean): { marks: string[]; bad: string[]; probes: number } {
  const pad = (i: number) => ({ right: i % 200 < 150, left: i % 200 >= 170, jump: i % 37 < 6, press: i % 37 === 0 });
  const wt = watch(w, probing);
  try {
    const mr = Math.random;
    Math.random = w.rng(1);
    try {
      w.freshPhone('easy');
      const sim = new w.RealPlay('2-4', 35);
      for (let i = 0; i < 900; i++) sim.frame(pad(i));
      wt.marks.push(`end: ${w.graphPrint(sim)} ${JSON.stringify([...stores(w)])}`);
    } finally {
      Math.random = mr;
    }
  } finally {
    wt.undo();
  }
  return wt;
}

test("planted: the spike's B3 case (2-4 seed 35, Easy, 30 s of a fixed pad): probed every 3rd frame ends equal to never probed", () => {
  const p = b3(A, true);
  const q = b3(B, false);
  assert.deepEqual(p.bad, [], 'a probe left a mark');
  assert.ok(p.probes >= 300, `probes ${p.probes}`);
  assert.equal(firstDiff(p.marks, q.marks), null);
});

for (const { id, seed } of WORLDS) {
  test(`${id} seed ${seed}, the kid on Easy: answers thrown away, the run is today's run (rows, graph, every module store)`, () => {
    const run = (w: World, probing: boolean) => {
      const wt = watch(w, probing);
      try {
        const r = w.firstTimer(id, seed, { ...w.FT_KID, setting: 'easy' });
        delete r.ms;
        return { row: JSON.stringify(r), ...wt, end: JSON.stringify([...stores(w)]) };
      } finally {
        wt.undo();
      }
    };
    const p = run(A, true);
    const q = run(B, false);
    assert.deepEqual(p.bad, [], 'a probe left a mark');
    assert.ok(p.probes > 100, `probes ${p.probes}`);
    assert.equal(firstDiff(p.marks, q.marks), null, 'a checkpoint differs');
    assert.equal(firstDiff([p.end], [q.end]), null, 'the module stores at the end differ');
    assert.equal(p.row, q.row, 'the rows differ');
  });
}
