// ENG-29-f G6: ONE's early/late PRESS margin on 2-9's court liana(s) at the draft's lock (TEMPO_29, 0.92), on the REAL engine (RealPlay).
// For each setting and grip (LIANA_RIVER.grips), he hangs on the liana at that hold, on the vine's own clock (no shift: the lock holds), and
// presses let-go at game time = a bar's ONE + j frames (j -45..45), on R consecutive bars (the joint cycle with the logs); a press LANDS when
// he next stands on a log of that river or on its far bank, within 5 s (an early press is held to the sweet spot, engine.ts holdLeapForSweet, so a try runs on to its landing); it misses on water or anything else.
// The margin: the frames on each side of ONE (j = 0) that land on every bar, contiguous with ONE. Scratch only (needs t-build-29's w2Arc29).
// npx tsx reference/qa-reports/ENG-29/probes/oneMargin.ts [seed=1] [bars=4]
import '../../../../src/game/headlessDom.ts';
import { withTestStage } from '../../../../src/game/gen2/listed.ts';
import { buildGen2Stage, keptFoes } from '../../../../src/game/gen2/pipeline.ts';
import { packPlan, plantSeedList } from '../../../../src/game/gen2/seedList.ts';
import { DRAFT_ID_29, TEMPO_29, draft29Cfg, draft29Row, kitLib29 } from '../../../../src/game/gen2/worlds/w2Arc29.ts';
import { RealPlay, withFixtureConfig } from '../../../../src/game/realPlay.ts';
import { setDifficulty } from '../../../../src/game/difficulty.ts';
import { lockedLianas, LIANA_RIVER } from '../../../../src/game/gen2/riverLay.ts';
import { tempoBar } from '../../../../src/game/tempo.ts';
import { vineAngle, vineOmega } from '../../../../src/game/physics.ts';

const SEED = Number(process.argv[2] ?? 1), BARS = Number(process.argv[3] ?? 4), F = 1 / 30, J = Number(process.env.J ?? 45);
const cfg = draft29Cfg(DRAFT_ID_29), row = draft29Row([], DRAFT_ID_29);
for (const d of (process.env.ONLYN ? ["normal"] : ["normal", "easy"]) as ("normal"|"easy")[]) {
  withTestStage({ [DRAFT_ID_29]: row }, () => {
    const st = buildGen2Stage({ config: cfg, kit: kitLib29(DRAFT_ID_29), seed: SEED, difficulty: 'normal' });
    const dict: string[] = [];
    const packed = packPlan({ seed: st.gen2.seed, rerolls: st.gen2.rerolls, plan: st.gen2.plan, foes: [...keptFoes(st)] }, dict);
    const undo = plantSeedList(DRAFT_ID_29, { dict, seeds: [SEED], plans: [packed] });
    setDifficulty(d);
    try {
      withFixtureConfig(cfg, () => {
        const sim = new RealPlay(DRAFT_ID_29, SEED);
        const S = sim.stage, e = sim.e as unknown as { gameTime: number; vineClock: number; player: { x: number; y: number; width: number; grounded: boolean; isVineSwinging?: boolean; standingOnId?: number }; standingOnId: number };
        const bar = tempoBar(S.tempo ?? TEMPO_29, d === 'easy');
        const court = lockedLianas(S, d);
        console.log(`${d}: bar ${bar.toFixed(3)} s; lock ${S.tempo?.lock}; ${court.length} locked liana(s); vineShift ${(e.vineClock - e.gameTime).toFixed(4)}; model one=${court.map((c) => c.drops.one).join(',')}`);
        for (const { river, liana: v } of court) for (const grip of LIANA_RIVER.grips) {
          const L = v.bottomY - v.topY, len = Math.min(L * grip, L - 20);
          const lands = (j: number, m: number): string => {
            // (the press at the next ONE m bars on, j frames off it; he is hung a bar before, on the vine's own clock)
            const now = e.gameTime;
            const one = (Math.ceil((now + 2 * bar) / bar) + m + Number(process.env.MOFF ?? 0)) * bar;
            const tPress = one + j * F;
            const tHang = tPress - bar;
            const P = e.player as unknown as Record<string, unknown>;
            // (off the vine and on the start's ground until the hang: a try that ended on the vine (a regrab) leaves nothing behind)
            while (e.gameTime < tHang - 1e-6) { Object.assign(P, { isVineSwinging: false, swingVineId: undefined }); (e as unknown as { swingLeapWait: number }).swingLeapWait = 0; sim.stand(S.platforms[0].x + 20, S.platforms[0].y); sim.frame(); }
            const t = e.vineClock;
            sim.swing(v, { angle: vineAngle(v, t), omega: vineOmega(v, t), len, t });
            sim.died = false;
            while (e.gameTime < tPress - 1e-6) { sim.frame(); if (!e.player.isVineSwinging) return 'fell-off'; }
            sim.frame({ press: true, jump: true, right: !!process.env.RIGHT });
            const TR = process.env.TRACE && j === 0 && m === 0 && Math.round(v.x) === Number(process.env.TRACE) && grip === Number(process.env.GRIP);
            if (TR) console.log('TRACE press t', e.gameTime.toFixed(3), 'x', e.player.x.toFixed(1), 'y', e.player.y.toFixed(1), 'swing', !!e.player.isVineSwinging);
            for (let f = 0; f < 150; f++) {
              sim.frame(process.env.RIGHT ? (process.env.FLICK ? { right: true } : { right: true, jump: true }) : {});
              if (TR && f < 40) { const q = e.player as any; console.log('TRACE', f, e.gameTime.toFixed(3), 'x', q.x.toFixed(1), 'y', q.y.toFixed(1), 'vx', (q.vx ?? 0).toFixed(0), 'vy', (q.vy ?? 0).toFixed(0), q.isVineSwinging ? 'S' : '', q.grounded ? 'G' : '', 'logs', S.platforms.filter((pp) => pp.type === 'drift' && pp.x > river.x0 - 200 && pp.x < river.x1).map((pp) => Math.round(pp.x)).join(',')); }
              if (sim.died) return 'water';
              const p = e.player;
              if (p.grounded) {
                const on = S.platforms.find((q) => q.id === e.standingOnId);
                if (on?.type === 'drift' && on.drift && p.x + p.width / 2 >= river.x0 - 40 && p.x <= river.x1 + 40) return 'log';
                if (p.x >= river.x1 - 4) return 'far';
                return `ground@${Math.round(p.x)}`;
              }
            }
            return e.player.isVineSwinging ? 'hung' : 'air';
          };
          const row: boolean[] = [];
          const why: string[] = [];
          for (let j = -J; j <= J; j++) {
            let all = true;
            for (let m = 0; m < BARS; m++) { const r = lands(j, m); if (r !== 'log' && r !== 'far') { all = false; if (j >= -12 && j <= 12) why.push(`${j}:${m}:${r}`); break; } }
            row.push(all);
          }
          const c = J;
          let early = 0, late = 0;
          if (row[c]) { while (c - early - 1 >= 0 && row[c - early - 1]) early++; while (c + late + 1 < row.length && row[c + late + 1]) late++; }
          const map = row.map((b) => (b ? '#' : '.')).join('');
          console.log(`  liana x${Math.round(v.x)} grip ${grip}: ONE lands ${row[c]}; early ${early} f = ${(early * F).toFixed(2)} s, late ${late} f = ${(late * F).toFixed(2)} s; window ${((early + late + 1) * F).toFixed(2)} s`);
          console.log(`    -1.5s ${map} +1.5s`);
          if (why.length) console.log(`    misses near ONE: ${why.slice(0, 8).join(' ')}`);
        }
      });
    } finally { undo(); setDifficulty('normal'); }
  });
}
