const root = process.env.ROOT!;
await import(root + '/src/game/headlessDom.ts');
const T = await import(root + '/src/game/gen2/tower.ts');
const solid = (x: number, y: number, width: number, id = 1) => ({ id, x, y, width, height: 24, type: 'solid' }) as any;
const W = 1280, FLOOR = 1481;
const vine = { id: 1, x: 554, topY: 1256, bottomY: FLOOR, swaySpeed: 1, swayPhase: 0, vineType: 'tree_climb' } as any;
const sx = Number(process.env.SX ?? 470), sw = Number(process.env.SWW ?? 80), sy = Number(process.env.SY ?? 1130);
const b = [solid(650, 1000, 269, 1), solid(136, 1256, 418, 2), solid(sx, sy, sw, 5), solid(0, FLOOR, W, 3)];
try {
  const c = T.towerCatches('down', b, [vine], FLOOR, W);
  console.log('LAY', JSON.stringify(c));
  console.log('SEAMS', JSON.stringify(T.trimSeams));
} catch (e: any) { console.log('THROW', e.message); }
