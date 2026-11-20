import { PAD_HOP, PAD_LAY, PAD_SIZES } from '../../../src/game/gen2/rideLay.ts';
import { PADS_22 } from '../../../src/game/gen2/worlds/w2Arc22.ts';
const W = (k: string) => (k === 'stone' ? PAD_LAY.stoneW : k === 'crown' ? PAD_LAY.crownW : (PAD_SIZES as any)[k].w);
for (const [id, row] of Object.entries(PADS_22) as [string, any][]) {
  const gaps = row.pads.map((_: unknown, i: number) => (typeof row.gap === 'number' ? row.gap : row.gap[i]));
  const out: string[] = [];
  for (let i = 1; i < row.pads.length; i++) {
    const gap = gaps[i], w = W(row.pads[i]);
    const room = gap + w; // a running flick from the very edge lands 175 px on: inside the next floor if gap + w >= 175
    const win = PAD_HOP.touch.along - gap; // he must take off within this many px of the edge to reach it
    out.push(`${row.pads[i - 1]}->${row.pads[i]} gap ${gap} w ${w}: overshoot room ${room - PAD_HOP.touch.along} px, take-off window ${win} px (pad tap ${PAD_HOP.pad.along - gap})`);
  }
  console.log(id, row.by, '|', out.join(' | ') || '(one piece: bank to pad and back)');
}
