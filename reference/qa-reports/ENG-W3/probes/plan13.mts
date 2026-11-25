// which plan entry lays the wood at a given y (draft 3-1, SEED, Y): its keys and pieces
const T = process.env.TREE!;
await import(`${T}/src/game/headlessDom.ts`);
const { readyDraft } = await import(`${T}/tools/engine/draft.ts`);
const { generateAllLevels } = await import(`${T}/src/game/worldsData.ts`);
const { buildGen2Stage } = await import(`${T}/src/game/gen2/pipeline.ts`);
const { LISTED } = await import(`${T}/src/game/gen2/listed.ts`);
readyDraft('3-1');
const cfg = generateAllLevels().find((c: any) => c.id === '3-1' && !c.secret)!;
const st: any = buildGen2Stage({ config: cfg, kit: LISTED['3-1'].kit(), seed: Number(process.env.SEED), difficulty: process.env.SET ?? 'normal' });
const Y = Number(process.env.Y);
const pl = st.gen2.plan;
console.log('plan[0] keys', Object.keys(pl[0]).join(','));
console.log(JSON.stringify(pl[0]).slice(0, 600)); console.log("pieces?", Object.keys(st.gen2).join(","));
for (const p of pl) {
  const s = JSON.stringify(p);
  if (s.includes(String(Y))) console.log(s.slice(0, 700));
}
const secs = st.gen2.sections;
console.log('sections', Array.isArray(secs) ? secs.length : typeof secs, JSON.stringify(Array.isArray(secs) ? secs[0] : secs).slice(0, 400));
if (Array.isArray(secs)) for (const s of secs) { const j = JSON.stringify(s); if (j.includes(`"y":${Y}`) || j.includes(String(Y))) console.log('SEC', j.slice(0, 500)); }
const fl = st.gen2.fills; console.log('fills', Array.isArray(fl) ? fl.length : typeof fl, JSON.stringify(fl).slice(0, 300));
const tw = st.gen2.tower; console.log('tower keys', Object.keys(tw).join(','));
for (const k of Object.keys(tw)) { const j = JSON.stringify(tw[k]); if (j && j.includes(String(Y))) console.log('TW', k, j.slice(Math.max(0, j.indexOf(String(Y)) - 250), j.indexOf(String(Y)) + 150)); }
for (const f of fl) if (f.y > Y - 300 && f.y < Y + 200) { const sc = st.gen2.sections.find((s: any) => s.uid === f.section); console.log('FILL', JSON.stringify(f), '<-', JSON.stringify(sc)); }
console.log('runouts', JSON.stringify(tw.runouts).slice(0, 400));
