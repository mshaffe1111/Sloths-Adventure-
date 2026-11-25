// a still (schematic) of a roll's wood, vines and hop rooms in a box, old lay vs new lay side by side
const [set, seedS, x0S, x1S, y0S, y1S, out] = process.argv.slice(2);
const seed = +seedS, X0 = +x0S, X1 = +x1S, Y0 = +y0S, Y1 = +y1S;
const panels: string[] = [];
for (const [k, T] of [['today (7d12c344b)', process.env.A!], ['hop room kept (642e737b)', process.env.B!]] as const) {
  await import(`${T}/src/game/headlessDom.ts`);
  const { readyDraft } = await import(`${T}/tools/engine/draft.ts`);
  const { generateAllLevels } = await import(`${T}/src/game/worldsData.ts`);
  const { buildGen2Stage } = await import(`${T}/src/game/gen2/pipeline.ts`);
  const { LISTED } = await import(`${T}/src/game/gen2/listed.ts`);
  const { hopRooms } = await import(`${T}/src/game/gen2/tower.ts`);
  readyDraft('3-1');
  const cfg = generateAllLevels().find((c: any) => c.id === '3-1' && !c.secret)!;
  const st: any = buildGen2Stage({ config: cfg, kit: LISTED['3-1'].kit(), seed, difficulty: set });
  const S = 0.75, W = (X1 - X0) * S, H = (Y1 - Y0) * S;
  const sx = (x: number) => (x - X0) * S, sy = (y: number) => (y - Y0) * S;
  let g = `<rect width="${W}" height="${H}" fill="#f4efe4"/>`;
  for (const r of hopRooms(st.platforms, st.vines)) if (r.x1 > X0 && r.x0 < X1 && r.y > Y0 && r.y - 180 < Y1) g += `<rect x="${sx(r.x0)}" y="${sy(r.y - 180)}" width="${(r.x1 - r.x0) * S}" height="${180 * S}" fill="${r.what === 'dip' ? '#f6c56b' : '#9fd39a'}" opacity="0.55"/>`;
  for (const v of st.vines) if (v.x > X0 && v.x < X1 && v.bottomY > Y0 && v.topY < Y1) g += `<line x1="${sx(v.x)}" y1="${sy(v.topY)}" x2="${sx(v.x)}" y2="${sy(v.bottomY)}" stroke="#2e7d32" stroke-width="4"/>`;
  for (const q of st.platforms) if (q.x < X1 && q.x + q.width > X0 && q.y > Y0 && q.y < Y1) g += `<rect x="${sx(q.x)}" y="${sy(q.y)}" width="${q.width * S}" height="${12 * S + 4}" fill="#6d4c41"/><text x="${sx(q.x) + 2}" y="${sy(q.y) + 20}" font-size="11" fill="#333">${q.x}-${q.x + q.width}@${q.y}</text>`;
  for (const m of st.gen2?.towerMiss ?? []) { const mm = /x (\d+)-(\d+), y (\d+): (\d+) px/.exec(String(m)); if (mm) { const ex = +mm[1] - 24 > X0 && +mm[1] - 24 < X1 ? +mm[1] - 24 : +mm[2] + 24; g += `<line x1="${sx(ex)}" y1="${sy(+mm[3])}" x2="${sx(ex)}" y2="${sy(+mm[3] + +mm[4])}" stroke="#c62828" stroke-width="3" stroke-dasharray="6 4"/><text x="${sx(ex) + 4}" y="${sy(+mm[3] + +mm[4] / 2)}" font-size="13" fill="#c62828">${mm[4]} px blind</text>`; } }
  panels.push(`<g><text x="4" y="16" font-size="15" font-weight="bold">${k}: ${set} ${seed}</text><g transform="translate(0,22)">${g}</g></g>`);
}
const W = (X1 - X0) * 0.75, H = (Y1 - Y0) * 0.75 + 22;
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W * 2 + 20}" height="${H}">${panels[0]}<g transform="translate(${W + 20},0)">${panels[1].slice(3)}</svg>`;
const { chromium } = (await import('module')).createRequire(import.meta.url)('playwright');
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: Math.ceil(W * 2 + 20), height: Math.ceil(H) } });
await p.setContent(`<body style="margin:0;font-family:sans-serif">${svg}</body>`); await p.screenshot({ path: out }); await b.close();
console.log('wrote', out);
