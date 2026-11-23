// The COLUMN DRESS (columnDress.ts, gen2/columnDressLay.ts, pieces/columnDressPiece.ts; READY-27): a painted set piece stood at the foot
// of every column of a stage of legs, behind the column's ledges, by the brief's spec (2-7's weir, reference/design/2-7.md Art (4): "the
// weir: a stepped stone face with white water, the D leg's dressing"; the catalog's w2-next#weir row: drawn behind the catch ledges, its
// foot under the floor). Proven on the out-and-back toy (gen2/toyHome.ts, the post's code), every roll and both settings: one piece per
// column, inside the column, its foot sunk into the floor by the spec; the stage otherwise laid exactly as it is without it; RED when a
// piece is moved 60 px off its foot or out of its column, or when a column is too narrow to hold it (refused by name, never laid over
// the walls). The piece draws each one on layer 'back' by its inventory id, in its box.
import test from 'node:test';
import assert from 'node:assert/strict';
import '../headlessDom.ts';
import { buildGen2Stage } from './pipeline.ts';
import { towerCfg } from './toyTower.ts';
import { homeKit, POST_CODE } from './toyHome.ts';
import { W2_WEIR } from './worlds/w2.ts';
import { columnDressFaults, dressFeet, type ColumnDressSpec } from '../columnDress.ts';
import { COLUMN_DRESS_PIECE, ColumnDressPiece } from '../pieces/columnDressPiece.ts';
import { builtStageKeys } from '../stageManifest.ts';
import type { WorldKit } from './types.ts';

const ID = '2-97';
/** the post toy's kit, its brief asking for `spec` at every column's foot (none when absent) */
function kit(spec?: ColumnDressSpec): WorldKit {
  const k = homeKit(ID, POST_CODE);
  const briefs = k.manifest.graphs!.briefs!;
  if (spec) briefs[ID] = { ...briefs[ID], columnDress: spec };
  return k;
}
const build = (seed: number, difficulty: 'normal' | 'easy', spec?: ColumnDressSpec) =>
  buildGen2Stage({ config: { ...towerCfg(ID, 'sprint'), unlocked: true }, kit: kit(spec), seed, difficulty });
type Built = ReturnType<typeof build>;
const columns = (st: Built) => (st.gen2.tower?.legs ?? []).filter((l) => l.frame);

test('column dress: one at the foot of every column on every roll and both settings, inside it, its foot sunk by the spec; nothing else moves', () => {
  let laid = 0;
  for (const difficulty of ['normal', 'easy'] as const) {
    for (let seed = 1; seed <= 6; seed++) {
      const at = `${difficulty} seed ${seed}`;
      const st = build(seed, difficulty, W2_WEIR);
      const bare = build(seed, difficulty);
      // (a roll the toy refuses without the dress is refused the same with it: the dress never makes or breaks a roll)
      assert.deepEqual(st.gen2.errors, bare.gen2.errors, at);
      if (st.gen2.errors.length) continue;
      const cols = columns(st);
      assert.ok(cols.length >= 1, `${at}: the toy lays a column`);
      const dress = st.columnDress ?? [];
      assert.equal(dress.length, cols.length, `${at}: one per column`);
      cols.forEach((c, i) => {
        const d = dress[i];
        assert.equal(d.art, W2_WEIR.art, at);
        assert.equal(d.w, W2_WEIR.w, at);
        assert.equal(d.h, W2_WEIR.h, at);
        assert.ok(d.x >= c.frame!.x0 && d.x + d.w <= c.frame!.x1, `${at}: inside the column ${c.frame!.x0}..${c.frame!.x1}, laid ${d.x}..${d.x + d.w}`);
        assert.equal(d.y + d.h, c.floorY! + W2_WEIR.sink, `${at}: its foot sunk ${W2_WEIR.sink} px into the floor`);
      });
      assert.deepEqual(columnDressFaults(dress, st.gen2.tower?.legs ?? [], W2_WEIR), [], at);
      // (the stage is the same stage: the dress is a picture, never a platform, a petal, a river or a race)
      assert.deepEqual(st.platforms, bare.platforms, `${at}: the platforms`);
      assert.deepEqual(st.collectibles, bare.collectibles, `${at}: the petals`);
      assert.deepEqual(st.pacer, bare.pacer, `${at}: the pacer`);
      assert.deepEqual(st.post, bare.post, `${at}: the post`);
      assert.equal(bare.columnDress, undefined, `${at}: a brief with no dress lays none`);
      laid++;
    }
  }
  assert.ok(laid >= 10, `laid on ${laid} rolls of 12`);
});

test('column dress (planted RED): moved 60 px off its foot, or out of its column, or one missing, is found by name', () => {
  const st = build(1, 'normal', W2_WEIR);
  const legs = st.gen2.tower!.legs!;
  const dress = st.columnDress!;
  assert.deepEqual(columnDressFaults(dress, legs, W2_WEIR), []);
  const up = dress.map((d, i) => (i === 0 ? { ...d, y: d.y - 60 } : d));
  assert.match(columnDressFaults(up, legs, W2_WEIR).join(' / '), /foot/);
  const out = dress.map((d, i) => (i === 0 ? { ...d, x: columns(st)[0].frame!.x1 - d.w / 2 } : d));
  assert.match(columnDressFaults(out, legs, W2_WEIR).join(' / '), /outside its column/);
  assert.match(columnDressFaults(dress.slice(1), legs, W2_WEIR).join(' / '), /columns/);
});

test('column dress (planted RED): a column narrower than the piece is refused by name, never laid over its walls', () => {
  const wide: ColumnDressSpec = { ...W2_WEIR, w: 5000 };
  const st = build(1, 'normal', wide);
  assert.equal(st.columnDress, undefined);
  assert.equal(st.gen2.errors.length, 1);
  assert.match(st.gen2.errors[0], /^column dress: w2-next#weir is 5000 px wide and the column at x \d+ holds \d+ px$/);
});

test('column dress: the piece draws each one on layer back by its inventory id, in its box, only near the view; none without a dress', () => {
  const st = build(1, 'normal', W2_WEIR);
  const host = { view: { x: 0, y: 0, w: 400, h: 700, zoom: 1 } } as never;
  assert.equal(COLUMN_DRESS_PIECE.start({ ...st, columnDress: undefined } as never, host), null);
  const piece = COLUMN_DRESS_PIECE.start(st as never, host);
  assert.ok(piece instanceof ColumnDressPiece);
  assert.deepEqual(piece.layers, ['back']);
  // (DRESS-27: the column's climb stands in its dress, so protoArt draws it down behind the dress's foam)
  assert.equal(dressFeet(st.columnDress!, st.vines).length, st.columnDress!.length, 'each dressed column\'s climb stands in its dress');
  const drawn: unknown[][] = [];
  const p = new ColumnDressPiece(st.columnDress!, (_ctx, ...a) => (drawn.push(a), true));
  const d = st.columnDress![0];
  p.draw({} as CanvasRenderingContext2D, 'back', { view: { x: d.x - 300, y: d.y, w: 400, h: 700, zoom: 1 } } as never);
  assert.deepEqual(drawn, [[d.art, d.x, d.y, d.w, d.h]]);
  drawn.length = 0;
  p.draw({} as CanvasRenderingContext2D, 'back', { view: { x: d.x + d.w + 100, y: d.y, w: 400, h: 700, zoom: 1 } } as never);
  assert.deepEqual(drawn, [], 'off screen: not drawn');
});

test('column dress: a stage that lays one asks for its sheet before its first frame; a stage without one does not', () => {
  const st = build(1, 'normal', W2_WEIR);
  const bare = { ...st, pacer: undefined, post: undefined, columnDress: undefined };
  assert.ok(!builtStageKeys(bare as never).includes('w2-next'));
  assert.ok(builtStageKeys({ ...bare, columnDress: st.columnDress } as never).includes('w2-next'));
});
