// The POST (post.ts, gen2/postLay.ts, pieces/postPiece.ts; 2-7's doors, reference/design/2-7.md NEW 2), proven on the out-and-back toy
// (gen2/toyHome.ts): every slot on his path on every roll and both settings, planted RED with one moved 60 px off it (by the check and
// by the bots); a door opens as he passes its slot; the replies on the way home.
import test from 'node:test';
import assert from 'node:assert/strict';
import '../headlessDom.ts';
import { buildGen2Stage } from './pipeline.ts';
import { towerCfg } from './toyTower.ts';
import { homeKit, POST_CODE, TOY_DOORS } from './toyHome.ts';
import { PICK, postFaults } from '../post.ts';
import { PostPiece, POST_PIECE } from '../pieces/postPiece.ts';
import { W2_POST_ART } from './worlds/w2.ts';

const ID = '2-97';
const build = (seed: number, difficulty: 'normal' | 'easy' = 'normal') => buildGen2Stage({ config: { ...towerCfg(ID, 'sprint'), unlocked: true }, kit: homeKit(ID, POST_CODE), seed, difficulty });

test('post: every slot on his path on every roll and both settings; RED with one moved 60 px off it', () => {
  let laid = 0;
  for (const difficulty of ['normal', 'easy'] as const) {
    for (let seed = 1; seed <= 6; seed++) {
      const st = build(seed, difficulty);
      const at = `${difficulty} seed ${seed}`;
      // (a roll whose way out holds too few walked pieces for its doors is refused by name, never laid short: the seed list skips it)
      if (st.gen2.errors.length) {
        assert.equal(st.gen2.errors.length, 1, at);
        assert.match(st.gen2.errors[0], new RegExp(`^post: ${TOY_DOORS} doors asked on the way out and only \\d route pieces 240 px wide, walked`), at);
        continue;
      }
      laid++;
      const post = st.post!;
      assert.equal(post.doors.length, TOY_DOORS, at);
      assert.deepEqual(post.art, W2_POST_ART, at);
      const out = st.gen2.tower!.legs![0];
      for (const d of post.doors) {
        const c = st.collectibles.find((q) => q.id === d.letter)!;
        // (a counted petal in letter art, at his middle straight over the door's ground, on the way out)
        assert.ok(c.type === 'flower' && c.mark === 'letter' && c.x === d.x && c.y === d.y - PICK.up, `${at}: door at ${d.x}`);
        assert.ok(d.x >= out.x0 && d.x <= out.x1, `${at}: door at ${d.x} on the out leg`);
      }
      assert.deepEqual(postFaults(post, st.collectibles, st.platforms), [], at);
      // (home: the petals are replies; none on the way out)
      const replies = st.collectibles.filter((c) => c.mark === 'reply');
      assert.ok(replies.length >= 10 && replies.every((c) => c.x <= st.gen2.tower!.legs!.at(-1)!.x1), `${at}: ${replies.length} replies home`);
      // planted RED: one slot moved 60 px up off his path
      const moved = st.collectibles.map((c) => (c.id === post.doors[0].letter ? { ...c, y: c.y - 60 } : c));
      assert.match(postFaults(post, moved, st.platforms).join('\n'), /post: the slot at x \d+, y \d+ is off his path/, at);
    }
  }
  assert.ok(laid >= 11, `${laid} of 12 rolls lay their doors`);
});

test('post: a door opens the step he passes its slot, and stays open', () => {
  const st = build(2);
  const piece = POST_PIECE.start(st as never, {} as never) as PostPiece;
  const d = st.post!.doors[0];
  const player = { x: d.x - 120, y: d.y };
  const host = { player } as never;
  piece.step(1 / 30, host);
  assert.deepEqual(piece.open, [false, false]);
  player.x = d.x - 10;
  piece.step(1 / 30, host);
  assert.deepEqual(piece.open, [true, false]);
  // (walked on past it, short of the next door's reach: the first stays open, the next still shut; then the next opens on its own pass)
  const d2 = st.post!.doors[1];
  player.x = (d.x + d2.x) / 2;
  piece.step(1 / 30, host);
  assert.deepEqual(piece.open, [true, false]);
  player.x = d2.x;
  piece.step(1 / 30, host);
  assert.deepEqual(piece.open, [true, true]);
});

test('post (the bots): every letter posted on every roll; RED with one slot moved 60 px off his path', async () => {
  const { homeRun } = await import('../../../tools/inspect/homeToys.ts');
  type C = { mark?: string; collected: boolean; y: number };
  const run = (tier: 'middle' | 'expert', setting: 'normal' | 'easy', seed: number, plant = false) => {
    let cs: C[] = [];
    let first = true;
    homeRun(tier, setting, seed, 1, { onFrame: (sim: { e: unknown }) => {
      cs = (sim.e as { collectibles: C[] }).collectibles;
      if (plant && first) cs.find((c) => c.mark === 'letter')!.y -= 60;
      first = false;
    } } as never, POST_CODE);
    return cs.filter((c) => c.mark === 'letter');
  };
  for (const [tier, setting] of [['middle', 'normal'], ['middle', 'easy'], ['expert', 'normal']] as const) {
    for (const seed of [1, 2, 3]) {
      const ls = run(tier, setting, seed);
      assert.equal(ls.filter((c) => c.collected).length, TOY_DOORS, `${tier} ${setting} seed ${seed}: every letter posted`);
    }
  }
  const planted = run('middle', 'normal', 2, true);
  assert.equal(planted.filter((c) => c.collected).length, TOY_DOORS - 1, 'the plant: the slot moved 60 px up is passed under');
});
