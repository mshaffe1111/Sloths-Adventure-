import { swingLandings } from '../../../src/game/levelCheck.ts';
const near = { id: -1, x: -480, y: 400, width: 300, height: 90, type: 'solid' as const };
const out: string[] = [];
for (let gap = 300; gap <= 580; gap += 20) {
  const v = { id: -1, x: 0, topY: 0, bottomY: 420, swaySpeed: 1.1, swayPhase: 0, vineType: 'swing_liana', isSwingingVine: true } as any;
  const far = { id: -2, x: gap, y: 400, width: 300, height: 90, type: 'solid' as const };
  out.push(`${gap}:${swingLandings(near as any, v, 1, [near as any, far as any], 1e9).get(-2) ?? 0}`);
}
console.log('lines by gap (anchor->near edge, ledge 400 under, liana 420):', out.join(' '));
