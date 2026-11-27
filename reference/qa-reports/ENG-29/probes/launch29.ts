import '../../../../src/game/headlessDom.ts';
import { withTestStage } from '../../../../src/game/gen2/listed.ts';
import { buildGen2Stage } from '../../../../src/game/gen2/pipeline.ts';
import { DRAFT_ID_29, draft29Cfg, draft29Row, kitLib29 } from '../../../../src/game/gen2/worlds/w2Arc29.ts';
import { airStep, pressLaunchesFrom, vineAngle, vineOmega, vineAmp, vinePeriod } from '../../../../src/game/physics.ts';
const st = withTestStage({ [DRAFT_ID_29]: draft29Row([], DRAFT_ID_29) }, () => buildGen2Stage({ config: draft29Cfg(DRAFT_ID_29), kit: kitLib29(DRAFT_ID_29), seed: 1, difficulty: 'normal' }));
const v = (st.vines ?? []).filter((q) => Math.abs(q.x - 14389) < 2)[0] ?? (console.log('vines', (st.vines ?? []).map((q) => Math.round(q.x)).filter((x) => x > 14000 && x < 15000).join(',')), process.exit(0)) as never;
const LL = v.bottomY - v.topY, len = Math.min(LL * 0.95, LL - 20), P = vinePeriod(v);
for (const lag of [0, 1 / 60]) {
  const L = pressLaunchesFrom(v as any, { angle: vineAngle(v, lag), omega: vineOmega(v, lag), len, t: lag, amp: vineAmp(v) } as any);
  let k1 = 0, best = 9; L.forEach((l, k) => { let u = ((l.pt % P) + P) % P; if (u > P - 1e-6) u = 0; if (u < best) { best = u; k1 = k; } });
  console.log("n", L.length, "k1", k1); const l = L[(k1 + 4) % L.length]; const c = { x: l.x, y: l.y, vx: l.vx, vy: l.vy }; airStep(c, 1 / 30, 1, false);
  console.log('lag', lag.toFixed(4), 'ONE+4 pt%P', (((l.pt % P) + P) % P).toFixed(4), l.call, 'frame0 x', c.x.toFixed(2), 'y', c.y.toFixed(2), 'vx', c.vx.toFixed(1), 'vy', c.vy.toFixed(1), 'press x', l.px.toFixed(1));
}
