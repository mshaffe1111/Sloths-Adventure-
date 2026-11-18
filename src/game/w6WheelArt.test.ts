/**
 * World 6's painted sluice wheels (w6WheelArt.ts; the lead's ruling 8:50 PM ET 11-14, ENG-W2): 6-7's water-room lever is drawn as one of
 * Matt's two root wheels, in scale with Pokey, its frames as their sheets give them, and its sheets preloaded with 6-7 alone.
 * (The draw itself is proven on the real screen: reference/qa-reports/ENG-W2/stills/w67-*.)
 */
import './headlessDom.ts';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { W6_WHEELS, WHEEL_H, wheelFor, isW6Wheel } from './w6WheelArt.ts';
import { W6_WATER_FRAMES } from './w6PropsData.ts';
import { waterRoomSpec } from './gen2/worlds/w6Rooms.ts';
import { stageSheets } from './stageSheets.ts';
import { generateAllLevels } from './worldsData.ts';

test("the wheels' frames are their sheets' own (w6PropsData's water room; props-made/w6balt.json)", () => {
  const { ['sluice-wheel']: a } = W6_WATER_FRAMES;
  assert.deepEqual({ ...W6_WHEELS['sluice-wheel'], sheet: undefined }, { ...a, sheet: undefined });
  const balt = JSON.parse(fs.readFileSync(new URL('../assets/w6to10/props-made/w6balt.json', import.meta.url), 'utf8')) as { pairs?: Record<string, unknown>; takes?: Record<string, unknown> } & Record<string, unknown>;
  const frameIn = (o: unknown): unknown => (o && typeof o === 'object' ? ('sluice-wheel-b' in o && typeof (o as Record<string, unknown>)['sluice-wheel-b'] === 'object' ? (o as Record<string, unknown>)['sluice-wheel-b'] : Object.values(o).map(frameIn).find((f) => f)) : undefined);
  const { sheet: _s, ...b } = W6_WHEELS['sluice-wheel-b'];
  assert.deepEqual(frameIn(balt), b, 'w6balt.json gives sluice-wheel-b this frame');
});

test("a wheel is drawn in scale with Pokey: the catalog's 1.57 x his 89.1 px", () => {
  const inv = JSON.parse(fs.readFileSync(new URL('./art/inventory/w6.json', import.meta.url), 'utf8')) as { cols: string[]; rows: unknown[][] };
  const row = inv.rows.map((r) => Object.fromEntries(inv.cols.map((c, i) => [c, r[i]]))).find((o) => o.id === 'game/w6to10/gemini/w6b-water-room-take2#sluice-wheel') as { pokey_scale: number; scale_ok: boolean };
  assert.ok(row && row.scale_ok, 'the catalog holds the wheel in scale');
  assert.ok(Math.abs(WHEEL_H - row.pokey_scale * 89.1) <= 2, `${WHEEL_H} px against ${row.pokey_scale} x 89.1`);
});

test("6-7's water room: its sluice lever is drawn as one of the two wheels, the same lever always the same wheel", () => {
  const lever = waterRoomSpec.pieces.find((p) => p.kind === 'lever' && p.id === 'sluice') as { looks?: readonly string[] } | undefined;
  assert.deepEqual(lever?.looks, ['sluice-wheel', 'sluice-wheel-b']);
  assert.ok(lever!.looks!.every(isW6Wheel));
  const seen = new Set<string>();
  for (let x = 1000; x < 1400; x += 17) { const w = wheelFor(lever!.looks!, x); assert.ok(w); assert.equal(wheelFor(lever!.looks!, x), w); seen.add(w!); }
  assert.equal(seen.size, 2, 'both wheels show across rolls');
  assert.equal(wheelFor(['not-a-wheel'], 5), undefined);
});

test("the wheels' sheets load with 6-7, and with no other stage", () => {
  const withWheels = generateAllLevels().filter((c) => !c.secret && stageSheets(c, { hand: true, paint: true }).includes('w6-wheels')).map((c) => c.id);
  assert.deepEqual(withWheels, ['6-7']);
});
