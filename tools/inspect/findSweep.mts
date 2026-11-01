// Every find stage, N layouts (designed + 1..N), Normal and (gen2) Easy: prints a sha1 per build on stdout and any stage missing its
// find on stderr. Diff two runs (before/after a change) to prove builds are byte-identical. N=40 takes about 7 minutes.
// Run: N=40 npx tsx tools/inspect/findSweep.mts > after.txt 2> after.err   (ONLY=1-4,4-6 limits it)
(globalThis as any).location = { search: '' };
const store: Record<string,string> = {};
(globalThis as any).localStorage = { getItem: (k:string)=>store[k]??null, setItem:(k:string,v:string)=>{store[k]=v}, removeItem:()=>{} };
const { createHash } = await import('node:crypto');
const { generateAllLevels } = await import('../../src/game/worldsData.ts');
const { generateStage, setLayoutVariant } = await import('../../src/game/stageGenerator.ts');
const { isGen2Stage } = await import('../../src/game/gen2/game.ts');
const { findForStage } = await import('../../src/game/finds.ts');
const L = generateAllLevels();
const N = Number(process.env.N ?? 40);
const out: string[] = [];
for (const cfg of L as any[]) {
  if (!findForStage(cfg.worldIndex, cfg.miniIndex) || cfg.secret) continue;
  if (process.env.ONLY && !process.env.ONLY.split(',').includes(cfg.id)) continue;
  const g2 = isGen2Stage(cfg); const miss: string[] = [];
  for (const diff of (g2 ? ['normal','easy'] : ['normal']) as any[]) for (let s = 0; s <= N; s++) {
    setLayoutVariant(s === 0 ? null : s); let st: any;
    try { st = generateStage({ ...cfg, unlocked: true }, diff); } catch (e: any) { out.push(`${cfg.id} ${diff} ${s} ERR`); continue; } finally { setLayoutVariant(null); }
    const fs = st.collectibles.filter((c: any) => c.type === 'find');
    if (fs.length !== 1) miss.push(`${diff[0]}${s}:${fs.length}`);
    out.push(`${cfg.id} ${diff} ${s} ${createHash('sha1').update(JSON.stringify(st)).digest('hex')}`);
  }
  console.error(cfg.id, miss.length ? 'MISSING ' + miss.join(' ') : 'ok');
}
console.log(out.join('\n'));
