// levelCheck swingLandings lines by gap (anchor -> the perch's near edge; the ledge 400 px under the anchor, a 420 px liana, 1-6.md):
// no dial (every liana before it), and the grip dial with and without the double. A link needs 6 lines or more.
import { swingLandings } from '../../../src/game/levelCheck.ts';
const near = { id: -1, x: -480, y: 400, width: 300, height: 90, type: 'solid' as const };
for (const [name, grip, dbl] of [['no dial', undefined, true], ['low', 'low', false], ['low+double', 'low', true], ['high+double', 'high', true]] as const) {
  const out: string[] = [];
  for (let gap = 300; gap <= 600; gap += 20) {
    const v = { id: -1, x: 0, topY: 0, bottomY: 420, swaySpeed: 1.1, swayPhase: 0, vineType: 'swing_liana', isSwingingVine: true, ...(grip ? { grip } : {}) } as any;
    const far = { id: -2, x: gap, y: 400, width: 300, height: 90, type: 'solid' as const };
    out.push(`${gap}:${swingLandings(near as any, v, 1, [near as any, far as any], 1e9, dbl).get(-2) ?? 0}`);
  }
  console.log(name.padEnd(12), out.join(' '));
}
