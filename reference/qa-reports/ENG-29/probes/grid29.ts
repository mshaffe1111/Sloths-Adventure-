import '../../../../src/game/headlessDom.ts';
import { withTestStage } from '../../../../src/game/gen2/listed.ts';
import { buildGen2Stage } from '../../../../src/game/gen2/pipeline.ts';
import { DRAFT_ID_29, draft29Cfg, draft29Row, kitLib29 } from '../../../../src/game/gen2/worlds/w2Arc29.ts';
import { letGoFall, fallOnLog, LIANA_RIVER } from '../../../../src/game/gen2/riverLay.ts';
import { lianasOverLogs, onRiver } from '../../../../src/game/river.ts';
import { pressLaunches, pressLaunchesFrom, vinePeriod, vineAngle, vineOmega, vineAmp } from '../../../../src/game/physics.ts';
import { withSetting } from '../../../../src/game/settingDials.ts';
const d = (process.argv[2] ?? 'normal') as 'normal' | 'easy';
const st = withTestStage({ [DRAFT_ID_29]: draft29Row([], DRAFT_ID_29) }, () => buildGen2Stage({ config: draft29Cfg(DRAFT_ID_29), kit: kitLib29(DRAFT_ID_29), seed: 1, difficulty: d }));
withSetting(d, () => {
  for (const r of st.rivers ?? []) {
    if (r.speed === 0 || r.open || r.raft || r.flood) continue;
    const logs = st.platforms.filter((p) => p.type === 'drift' && p.drift && onRiver(p.drift, r)).map((p) => p.drift!);
    if (!logs.length) continue;
    for (const v of lianasOverLogs(st.vines ?? [], r)) for (const g of LIANA_RIVER.grips) {
      const T = vinePeriod(v); const LL = v.bottomY - v.topY, len = Math.min(LL * g, LL - 20);
      const L = process.env.OWN ? pressLaunchesFrom(v as any, { angle: vineAngle(v, 0), omega: vineOmega(v, 0), len, t: 0, amp: vineAmp(v) } as any) : pressLaunches(v, g); const n = L.length;
      const ring = (x: number) => { const u = ((x % T) + T) % T; return Math.min(u, T - u); };
      let k1 = 0; L.forEach((l, k) => { if (ring(l.pt) < ring(L[k1].pt)) k1 = k; });
      let row = '';
      for (let j = -45; j <= 45; j++) {
        const k = (((k1 + j) % n) + n) % n, l = L[k];
        const wrap = Math.floor((k1 + j) / n);
        let all = true;
        for (let m = 0; m < 4; m++) { const f = letGoFall(l, logs[0]); if (!(f.far || fallOnLog(f, logs, l.pt + (wrap + m) * T, d === 'easy'))) all = false; }
        row += all ? '#' : '.';
      }
      console.log(`x${Math.round(v.x)} way${r.way ?? 1} g${g} k1 pt ${L[k1].pt.toFixed(3)} t ${L[k1].t.toFixed(3)} call ${L[k1].call} n ${n}`);
      console.log(`  ${row}`);
    }
  }
});
