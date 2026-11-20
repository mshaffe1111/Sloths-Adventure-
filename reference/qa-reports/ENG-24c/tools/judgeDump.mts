// prints lianaDrops for every toy row x setting x liana shape (run from a repo root: ROOT env)
const ROOT = process.env.ROOT!;
await import(`${ROOT}/src/game/headlessDom.ts`);
const { setDifficulty } = await import(`${ROOT}/src/game/difficulty.ts`);
const { setTimedSwing, TIMED } = await import(`${ROOT}/src/game/physics.ts`);
const { layRiver, lianaDrops } = await import(`${ROOT}/src/game/gen2/riverLay.ts`);
const { TOY_RIVERS } = await import(`${ROOT}/tools/inspect/lianaRiverToys.ts`);
const out: string[] = [];
for (const d of ['normal', 'easy'] as const) {
  setDifficulty(d); setTimedSwing(d === 'easy');
  for (const row of Object.keys(TOY_RIVERS)) {
    for (const [dx, top, len, amp, ph] of [[165, 390, 410, 0.45, 0], [120, 300, 380, 0.3, 0.37], [300, 450, 320, 0.45, 0.81]] as const) {
      let id = 100;
      const { logs } = layRiver((TOY_RIVERS as any)[row], 2000, 800, () => id++);
      const v = { id: 50, x: 2000 + dx, topY: top, bottomY: top + len, vineType: 'swing_liana', isSwingingVine: true, swingAmp: amp, swingPeriod: TIMED.period, swingPhase: ph, swaySpeed: 1, swayPhase: 0 } as any;
      const r = lianaDrops(v, logs.map((p: any) => p.drift), d);
      out.push(`${d} ${row} ${dx}/${top}/${len}/${amp}/${ph}: ${r.share} ${r.wait} ${r.period}`);
    }
  }
}
console.log(out.join('\n'));
