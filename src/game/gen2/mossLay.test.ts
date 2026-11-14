/**
 * 1-7's moss cover as gen2 content (ENG-E2, 1-7.md NEW 5): World 1's still table (w1Cast.ts W1_STILL) lays a moss carpet, a moss patch
 * and hanging moss as hides (proto.bushes, the covers the cast hides a still sloth in), each at Pokey's scale (w17Art.ts); the node
 * letter m (cover) is laid by them and a node that asks for it with none laid fails by name; a stage with any of them loads the moss
 * pieces before its first frame. Planted: each fails on the base (t-eng-e1@f573675b): no moss rows, m is LATER, no 'w17' sheet.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { CastPlay } from '../castPlay.ts';
import { inCover } from '../stillness.ts';
import { builtStageKeys, type BuiltStage } from '../stageManifest.ts';
import type { Platform } from '../types.ts';
import { MOSS_KINDS, mossAlpha, mossHeight } from '../w17Art.ts';
import { askMisses, LATER_CONTENT, type LaidNode } from './nodeAsks.ts';
import { parseCode } from './nodeCode.ts';
import { asksOf } from './nodeAsks.ts';
import { stillFaults, sweptZones } from './stillLay.ts';
import type { FilledSocket, PropDef, StageSink } from './types.ts';
import { W1_STILL, w1Still } from './worlds/w1Cast.ts';

const G = 500;
const sink = (platforms: Platform[]): StageSink => {
  let e = 100;
  return { platforms, enemies: [], collectibles: [], proto: {}, extras: {}, zones: [], nextPlatformId: () => 1, nextCollectibleId: () => 1, nextEnemyId: () => e++ } as unknown as StageSink;
};
const fill = (socket: string, what: string, x: number, y = G): FilledSocket => ({ section: 's', socket, role: 'prop', what, x, y });
const bank: Platform = { id: 1, x: 0, y: G, width: 2400, height: 40, type: 'solid' } as Platform;

function lay(id: string, x: number, y = G) {
  const out = sink([bank]);
  const kit = w1Still(7, []);
  kit.emit[id](fill('h', id, x, y), kit.props.find((p) => p.id === id)!, out);
  return out.proto.bushes ?? [];
}

test("World 1's still table lays moss: a carpet, a patch and hanging moss, each a hide the manifest asks for by 'hide'", () => {
  const kit = w1Still(7, []);
  for (const id of ['w1-hide-moss', 'w1-hide-moss-patch', 'w1-hide-moss-hang', 'w1-hide-moss-curtain']) {
    const p = kit.props.find((q) => q.id === id) as PropDef;
    assert.ok(p, `${id} is a prop row`);
    assert.ok(p.tags.includes('hide') && p.tags.includes('cover'), `${id} is asked for by hide/cover sockets`);
  }
  const [carpet] = lay('w1-hide-moss', 800);
  assert.deepEqual({ kind: carpet.kind, w: carpet.w, y: carpet.y, hanging: carpet.hanging }, { kind: 'moss', w: 346, y: G, hanging: undefined });
  assert.equal(carpet.x, 800 - 173, 'centred on its socket');
  const [patch] = lay('w1-hide-moss-patch', 800);
  assert.equal(patch.kind, 'mossPatch');
  // hanging moss is tied where its socket stands (its top there) and is a hanging cover
  const [hang] = lay('w1-hide-moss-hang', 800, G - 260);
  assert.deepEqual({ kind: hang.kind, y: hang.y, hanging: hang.hanging }, { kind: 'mossHang', y: G - 260, hanging: true });
  const [curtain] = lay('w1-hide-moss-curtain', 800, G - 260);
  assert.equal(curtain.w, 78);
  for (const b of [carpet, patch, hang, curtain]) assert.ok(MOSS_KINDS.has(b.kind), `${b.kind} is drawn by w17Art`);
});

test('moss at Pokey\'s scale (89.1 px standing): the patch a mound under his height, the drape longer than him, the carpet a strip', () => {
  const patch = mossHeight({ w: (W1_STILL['w1-hide-moss-patch'] as { w: number }).w, kind: 'mossPatch' });
  assert.ok(patch > 60 && patch < 89.1, `patch ${patch.toFixed(1)} px`);
  const drape = mossHeight({ w: 173, kind: 'mossHang' });
  assert.ok(drape > 89.1 && drape < 160, `drape ${drape.toFixed(1)} px: it hides all of him hanging`);
  assert.equal(Math.round(mossHeight({ w: 346, kind: 'moss' })), 36);
});

test('a still sloth on the moss carpet, in the patch, or hanging in the moss is in cover; on the bark beside it, or standing under hanging moss, he is not', () => {
  const [carpet] = lay('w1-hide-moss', 800);
  const [hang] = lay('w1-hide-moss-hang', 1400, G - 260);
  const covers = [carpet, hang];
  const on = (x: number, y: number, grounded: boolean, holding: boolean) => inCover(covers, { x, y, grounded, holding });
  assert.equal(on(700, G, true, false), true, 'anywhere on the carpet');
  assert.equal(on(940, G, true, false), true);
  assert.equal(on(1050, G, true, false), false, 'bare bark past it');
  assert.equal(on(1400, G - 260 + 90, false, true), true, 'hanging in the moss');
  assert.equal(on(1400, G, true, false), false, 'standing on the ground under it');
  // and the cast hides him there: still on the carpet, the eagle never takes him
  const c = new CastPlay({ kinds: ['eagle'], traps: [] }, [], [bank], 1, covers);
  for (let i = 0; i < 30; i++) c.step({ x: 800, y: G, vx: 0, vy: 0, facing: 1, grounded: true, holding: false }, 1 / 30, i / 30, false);
  assert.equal(c.calmNow(false), 1, 'the moss comes all the way in on the carpet');
});

test('a watched stretch laid with moss is fair by the builder\'s check (stillFaults): the carpet counts as cover', () => {
  const out = sink([bank]);
  const kit = w1Still(7, ['teach']);
  const def = (id: string) => kit.props.find((p) => p.id === id)!;
  kit.emit['w1-eagle'](fill('teach', 'w1-eagle', 20), def('w1-eagle'), out);
  kit.emit['w1-hide-moss'](fill('a', 'w1-hide-moss', 420), def('w1-hide-moss'), out);
  kit.emit['w1-hide-moss-patch'](fill('b', 'w1-hide-moss-patch', 1400), def('w1-hide-moss-patch'), out);
  kit.finish(out);
  assert.equal(out.enemies.length, 1);
  const zones = sweptZones(out.enemies);
  assert.equal(zones.length, 1);
  assert.deepEqual(stillFaults({ bushes: out.proto.bushes, watch: zones, platforms: out.platforms }), []);
  // (and the check still bites: the same stretch with the carpet taken away has open ground he cannot cross in a calm)
  assert.ok(stillFaults({ bushes: out.proto.bushes!.filter((b) => b.kind !== 'moss'), watch: zones, platforms: out.platforms }).length > 0);
});

test("node letter m (cover) is laid by a node's hides: asked with none laid, the roll fails by name; with a hide, it holds", () => {
  assert.equal(LATER_CONTENT.m, undefined, 'm is no longer LATER');
  const [tok] = parseCode('Tm<');
  const ask = asksOf(tok, 'teach');
  assert.equal(ask?.content, 'm');
  const node = (props: string[][]): LaidNode => ({ id: 'n1', token: 'Tm<', sections: [{ content: 'ground', double: false, dy: 0 }], enemies: [], finds: [], pickups: 0, props });
  const none = askMisses(ask, node([]), []);
  assert.equal(none.length, 1);
  assert.match(none[0], /content 'm' \(cover\): no hide laid/);
  assert.deepEqual(askMisses(ask, node([['hide', 'cover']]), []), []);
  assert.deepEqual(askMisses(ask, node([['watch']]), []).length, 1, 'a watcher is not cover');
});

test("a built stage with moss, a mossy liana or a perched eagle loads World 1's moss pieces ('w17') before its first frame", () => {
  const base: BuiltStage = { config: { worldIndex: 1, id: '1-7' }, platforms: [], enemies: [], proto: {} } as BuiltStage;
  assert.ok(!builtStageKeys(base).includes('w17'));
  assert.ok(!builtStageKeys({ ...base, proto: { bushes: [{ kind: 'tall' }] } } as BuiltStage).includes('w17'), 'a plain bush is props2');
  assert.ok(builtStageKeys({ ...base, proto: { bushes: [{ kind: 'moss' }] } } as BuiltStage).includes('w17'));
  assert.ok(builtStageKeys({ ...base, proto: { bushes: [{ kind: 'mossHang' }] } } as BuiltStage).includes('w17'));
  assert.ok(builtStageKeys({ ...base, vines: [{ vineType: 'swing_liana', mossy: true }] } as unknown as BuiltStage).includes('w17'));
  assert.ok(builtStageKeys({ ...base, enemies: [{ type: 'eagle', kitPerch: true }] } as unknown as BuiltStage).includes('w17'));
});

test('the carpet never thins while he is in it (it would vanish exactly when he hides); a mound and hanging moss thin as the moss comes', () => {
  assert.equal(mossAlpha('moss', true, 1), 1);
  assert.equal(mossAlpha('mossPatch', false, 0), 1);
  assert.ok(mossAlpha('mossPatch', true, 1) < 0.5);
  assert.ok(mossAlpha('mossHang', true, 0) < 0.7);
});
