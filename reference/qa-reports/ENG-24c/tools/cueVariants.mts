// cue vs the real engine on ENG-24's drop toy: per frame of a hang, the engine's glow (glowCue) against a real press at that frame
const ROOT = process.env.ROOT ?? '/home/user/Sloths-Adventure-';
await import(`${ROOT}/src/game/headlessDom.ts`);
const { withTestStage } = await import(`${ROOT}/src/game/gen2/listed.ts`);
const { buildGen2Stage, keptFoes } = await import(`${ROOT}/src/game/gen2/pipeline.ts`);
const { packPlan, plantSeedList } = await import(`${ROOT}/src/game/gen2/seedList.ts`);
const { RealPlay, withFixtureConfig, DT } = await import(`${ROOT}/src/game/realPlay.ts`);
const { setDifficulty } = await import(`${ROOT}/src/game/difficulty.ts`);
const { vinePeriod } = await import(`${ROOT}/src/game/physics.ts`);
const { letGoTable, letGoLands } = await import(`${ROOT}/src/game/letGoCue.ts`);
const { kitFor, cfg, ID, fixtureSeed } = await import(`${ROOT}/tools/inspect/lianaRiverToys.ts`);
const { w2Finish } = await import(`${ROOT}/src/game/gen2/worlds/w2.ts`);
const [row = 'long', easyRow = row, setting = 'normal', gripS = '0.7', dirS = '1', framesS = '0', mode = 'held', glideS = 'off'] = process.argv.slice(2);
const dir = Number(dirS) as 1 | -1;
if (process.env.INSET) { const m = await import(`${ROOT}/src/game/letGoCue.ts`); (m.CUE as any).inset = Number(process.env.INSET); }
const seed = fixtureSeed('drop', row as never, ['normal', 'easy'], easyRow as never)!;
const kit = kitFor('drop', row as never, easyRow as never);
const st = buildGen2Stage({ config: cfg, kit, seed, difficulty: 'normal' });
const dict: string[] = [];
const packed = packPlan({ seed: st.gen2.seed, rerolls: st.gen2.rerolls, plan: st.gen2.plan, foes: [...keptFoes(st)] }, dict);
await withTestStage({ [ID]: { kit: () => kit, world: (s: any, _sq: any, d: any) => w2Finish(s, d), seeds: [] } } as never, async () => {
  const undo = plantSeedList(ID, { dict, seeds: [seed], plans: [packed] });
  try {
    await withFixtureConfig(cfg, async () => {
      setDifficulty(setting as never);
      const mk = () => new RealPlay(ID, 1);
      const r = mk();
      if (process.env.REAL) r.useRealInput();
      const e = r.e as any;
      if (glideS === 'off') e.skills.delete('glide');
      const v = r.vines.find((q: any) => q.vineType === 'swing_liana')!;
      const river = (e.currentStage.rivers ?? []).find((q: any) => q.speed > 0)!;
      const logsP = r.platforms.filter((q: any) => q.type === 'drift' && q.drift.x0 === river.x0);
      const T = vinePeriod(v);
      const d0 = logsP[0].drift;
      const cycle = (d0.x1 - d0.x0 + d0.width) / logsP.length / d0.speed;
      const L = (v.bottomY - v.topY) * Number(gripS);
      const F = Number(framesS) || Math.round(Math.max(cycle, T) / DT) * 2;
      const vc0 = 7 * T + 0.37, gt0 = 11.3;
      // the hang: a full swing of warm-up, then F frames read
      const hang = (upTo: number, press: boolean, md = mode) => {
        r.swing(v, { angle: 0, omega: 0, len: L, t: vc0 - T });
        e.sweetSnap = null; e.swingLeapWait = 0;
        r.t = gt0 - T;
        const warm = Math.round(T / DT);
        const pad = dir === 1 ? { right: true } : { left: true };
        for (let i = 0; i < warm + upTo; i++) r.frame(pad);
        if (!press) return null;
        r.frame({ ...pad, press: true });
        let out = 'WATER';
        for (let f = 1; f < 150; f++) {
          r.frame({ ...pad, jump: md === 'held' || (md === 'touch' && f < 7) });
          if (r.p.isVineSwinging) continue;
          if (r.p.grounded) { const q = r.platforms.find((p: any) => p.id === r.standingOn); out = q?.type === 'drift' ? 'LOG' : r.p.x > (river.x0 + river.x1) / 2 ? 'FAR' : 'NEAR'; break; }
          if (r.died || r.p.y > river.surfaceY + 60) break;
        }
        return out;
      };
      // the glow per frame on ONE continuous hang
      r.swing(v, { angle: 0, omega: 0, len: L, t: vc0 - T });
      e.sweetSnap = null; e.swingLeapWait = 0;
      r.t = gt0 - T;
      const pad = dir === 1 ? { right: true } : { left: true };
      for (let i = 0; i < Math.round(T / DT); i++) r.frame(pad);
      const { inSweetSpot } = await import(`${ROOT}/src/game/physics.ts`);
      const sweetF: boolean[] = [];
      const glow: boolean[] = [], clk: Array<[number, number, number]> = [];
      for (let f = 0; f < F; f++) { r.frame(pad); glow.push(!!e.glowCue); sweetF.push(inSweetSpot({ angle: r.p.swingAngle, omega: r.p.swingAngularVelocity, len: r.p.swingLength, amp: v.swingAmp } as any, dir)); clk.push([e.vineClock, e.gameTime, r.p.swingLength]); }
      const modes = ['held', 'tap', 'touch'];
      const truth: Record<string, string[]> = {};
      for (const md of modes) { truth[md] = []; for (let f = 0; f < F; f++) truth[md].push(hang(f, true, md)!); }
      const good = (o: string) => o === 'LOG' || (dir === 1 ? o === 'FAR' : o === 'NEAR');
      const tab = letGoTable(v, L, dir, d0);
      const logs = logsP.map((p: any) => p.drift);
      const { driftX, DRIFT_CATCH } = await import(`${ROOT}/src/game/river.ts`);
      const { FORGIVE } = await import(`${ROOT}/src/game/physics.ts`);
      const { letGoAt } = await import(`${ROOT}/src/game/letGoCue.ts`);
      const easy = setting === 'easy';
      const onLog = (fa: any, off: number, inset: number) => {
        const half = 44 * (DRIFT_CATCH.side + (easy ? DRIFT_CATCH.easySide : 0)) - inset;
        const landPx = easy ? FORGIVE.easy.landPx : 0;
        return fa.cross.some((q: any) => logs.some((d: any) => {
          const lx = driftX(d, q.dt + off);
          if (q.x + half > lx && q.x - half < lx + d.width) return true;
          if (!landPx || !q.above) return false;
          const missL = lx - (q.x + half), missR = q.x - half - (lx + d.width);
          return Math.max(missL, missR) <= landPx && (missL > 0 ? q.vx : -q.vx) >= 30;
        }));
      };
      const lateOkAt = (f: number) => true;
      const tab5 = letGoTable(v, L - 5, dir, d0);
      const at = (tb: any, f: number) => letGoAt(tb, clk[f][0]);
      const ok = (tb: any, f: number, inset: number, clocks: number[]) => { const fa = at(tb, f); return fa.far || clocks.every((c) => onLog(fa, clk[f][1] + c, inset)); };
      const variants: Record<string, (f: number) => boolean> = {
        glow: (f) => glow[f],
        sweetOld: (f) => sweetF[f],
        c5: (f) => ok(tab5, f, 0, [0]),
        c5s: (f) => ok(tab5, f, 0, [-DT]),
        c5b: (f) => ok(tab5, f, 0, [0, -DT]),
        c5b3: (f) => ok(tab5, f, 3, [0, -DT]),
        c5b6: (f) => ok(tab5, f, 6, [0, -DT]),
        both06: (f) => ok(tab5, f, 3, [0, -DT]) && ok(tab, f, 3, [0, -DT]),
      };
      const res: string[] = [];
      for (const [name, fn] of Object.entries(variants)) {
        const parts: string[] = [];
        for (const md of modes) {
          let fn2 = 0, miss = 0, lands = 0;
          for (let f = 0; f < F; f++) { const t = good(truth[md][f]); if (t) lands++; const g = fn(f); if (g && !t) fn2++; if (!g && t) miss++; }
          parts.push(`${md} fN${fn2} m${miss}/${lands}`);
        }
        res.push(`${name}: ${parts.join(' ')}`);
      }
      if (process.env.PRINT) for (let f = 0; f < F; f++) if (glow[f] && !good(truth.tap[f])) { const fa = letGoAt(tab, clk[f][0]); console.log('falseNow f', f, 'truth', truth.tap[f], 'prev', glow[f - 1], truth.tap[f - 1], 'next', glow[f + 1], truth.tap[f + 1], 'model', JSON.stringify(fa)); }
      console.log(`${row}/${easyRow} ${setting} grip ${gripS} dir ${dir} frames ${F} | ${res.join(' | ')}`);
    });
  } finally { undo(); }
});
