import { AHEAD, CAM, heroBox, landingAhead, showBoth, type Box } from '../../../src/game/cameraFollow.ts';
const VIEWS = { upright: { vw: 440, vh: 792 }, sideways: { vw: 1168, vh: 540 } };
const plain = (px: number, py: number, vw: number, vh: number, f = 1) => ({ x: px - vw * 0.45 + f * CAM.lookAhead, y: py - vh * 0.55 });
const inView = (b: Box, v: { x: number; y: number }, vw: number, vh: number, P = AHEAD.pad) => b.x0 >= v.x + vw * P.l && b.x1 <= v.x + vw * P.r && b.y0 >= v.y + vh * P.t && b.y1 <= v.y + vh * P.b;
const A = { x: 1000, top: 300 }; const L = 420; const ledgeY = A.top + 400;
const back = { x: 200, y: ledgeY, width: 700 }; // the ledge he swung from (ends 100 before the anchor)
for (const [kind, near] of [['SHORT', 430], ['LONG', 500], ['FAR', 560]] as const) {
  const far = { x: A.x + near, y: ledgeY, width: 400 };
  for (const [name, { vw, vh }] of Object.entries(VIEWS)) {
    const row: string[] = [];
    for (const g of [0.2, 0.5, 0.95]) {
      const len = Math.min(L * g, L - 20);
      const hang = { x: A.x, width: 0, y: A.top + len + 30 };
      const land = landingAhead(A.x, 1, hang, [back, far])!;
      const cells: string[] = [];
      for (const th of [-0.45, -0.2, 0, 0.2, 0.405]) {
        const px = A.x + len * Math.sin(th), py = A.top + len * Math.cos(th) + 30;
        const p0 = plain(px, py, vw, vh);
        const v = showBoth(p0.x, p0.y, px, py, land, vw, vh);
        const edgeSeen = v.x + vw * 0.98 - far.x; // px of the far ledge's top visible past its near edge (inside the pad)
        cells.push(`${th}:${inView(land, v, vw, vh) ? 'IN' : 'out'}(${Math.round(edgeSeen)})`);
      }
      row.push(`g${g} ${cells.join(' ')}`);
    }
    console.log(kind, near, name, land0(near), '\n  ' + row.join('\n  '));
  }
}
function land0(n: number) { return `dist from back-of-swing foot ${Math.round(n + 0.435 * 400)}`; }
