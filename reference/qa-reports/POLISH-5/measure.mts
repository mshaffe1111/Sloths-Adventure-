// POLISH-5 item 3: per stage, over its first N listed seeds, both settings: the double asks (level gaps over 246 px, rises over a
// single jump's climb) and the widest gaps. Copies the relay test's gapsOf/risesOf rules (w1.relay.test.ts:119, :78) read-only.
import '/home/user/Sloths-Adventure-/src/game/headlessDom.ts';
import { RealPlay } from '/home/user/Sloths-Adventure-/src/game/realPlay.ts';
import { setDifficulty } from '/home/user/Sloths-Adventure-/src/game/difficulty.ts';
import { loadSeedList } from '/home/user/Sloths-Adventure-/src/game/gen2/seedList.ts';
const N = Number(process.env.N ?? 20), R = Math.round;
const med = (a: number[]) => { const s = [...a].sort((x, y) => x - y); return s.length ? s[Math.floor(s.length / 2)] : 0; };
for (const id of process.argv.slice(2)) {
  await loadSeedList(id);
  for (const setting of ['normal', 'easy'] as const) {
    setDifficulty(setting);
    const rows: Array<{ dGap: number; dTest: number; rises: number; widest: number; widestLevel: number; holes: number }> = [];
    for (let v = 1; v <= N; v++) {
      const st: any = new RealPlay(id, v).stage;
      const S = st.platforms.filter((p: any) => p.type !== 'bouncy' && !p.broken);
      const seen = new Set<number>(); const gaps: any[] = [];
      for (const d of [...(st.gen2?.drops ?? [])].sort((a: any, b: any) => a.x0 - b.x0 || b.x1 - a.x1)) {
        if (d.site === 'hole-under-route') continue;
        if (seen.has(R(d.x0))) continue; seen.add(R(d.x0));
        const far = S.filter((q: any) => Math.abs(q.x - d.x1) <= 3).sort((a: any, b: any) => a.y - b.y)[0];
        gaps.push({ w: d.x1 - d.x0, floored: d.ends.kind === 'floor', level: !far || Math.abs(far.y - d.lipY) <= 50 });
      }
      const holes = (st.gen2?.drops ?? []).filter((d: any) => d.site === 'hole-under-route').length;
      let rises = 0;
      for (const P of S) {
        const behind = S.filter((q: any) => q !== P && q.x < P.x && q.x + q.width > P.x - 246 && q.y >= P.y - 250);
        if (!behind.length) continue;
        const rise = Math.min(...behind.map((q: any) => q.y - P.y));
        if (rise <= 2) continue;
        const climb = P.height < 50 ? 117 : 123;
        if (rise > climb && !st.platforms.some((b: any) => b.type === 'bouncy' && b.x < P.x && P.x - (b.x + b.width) <= 60)) rises++;
      }
      const dbl = gaps.filter((g) => g.level && g.w > 246);
      rows.push({ dGap: dbl.length, dTest: dbl.filter((g) => !g.floored).length, rises, widest: R(Math.max(0, ...gaps.map((g) => g.w))), widestLevel: R(Math.max(0, ...gaps.filter((g) => g.level).map((g) => g.w))), holes });
    }
    const col = (k: keyof typeof rows[0]) => `${med(rows.map((r) => r[k]))} (${Math.min(...rows.map((r) => r[k]))}-${Math.max(...rows.map((r) => r[k]))})`;
    console.log(`${id} ${setting.padEnd(6)} N=${N} | double gaps ${col('dGap')} | of them unfloored tests ${col('dTest')} | rises over the climb (no mushroom) ${col('rises')} | widest level gap ${col('widestLevel')} | widest gap ${col('widest')} | holes under route ${col('holes')}`);
  }
}
