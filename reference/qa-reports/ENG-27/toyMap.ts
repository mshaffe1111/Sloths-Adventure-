// ENG-27 show-first: the out-and-back toy as laid (seed, setting), drawn from above as an SVG: the out leg, the column, the home leg, each
// river with its current's arrow, flags, petals, spawn and shrine, and the middle bot's path over it (homeToys.ts homeRun, onFrame).
import { writeFileSync } from 'node:fs';
import { homeRun, homeStage } from '../../../tools/inspect/homeToys.ts';
const [seedArg = '1', setting = 'normal', out = 'toy-map.svg'] = process.argv.slice(2);
const seed = Number(seedArg);
const st = homeStage(seed, setting as 'normal');
const path: Array<[number, number]> = [];
let f = 0;
const run = homeRun('middle', setting as 'normal', seed, 1, { onFrame: (sim: { p: { x: number; y: number } }) => { if (f++ % 10 === 0) path.push([sim.p.x, sim.p.y]); } } as never);
const xs = st.platforms.flatMap((p) => [p.x, p.x + p.width]), ys = st.platforms.flatMap((p) => [p.y, p.y + Math.min(p.height, 300)]);
const X0 = Math.min(...xs) - 100, X1 = Math.max(...xs) + 100, Y0 = Math.min(...ys) - 300, Y1 = Math.max(...ys) + 100;
const S = 0.09, W = (X1 - X0) * S, H = (Y1 - Y0) * S * 2.2;
const sx = (x: number) => ((x - X0) * S).toFixed(1), sy = (y: number) => ((y - Y0) * S * 2.2).toFixed(1);
const legs = st.gen2.tower!.legs!;
const col = { right: '#c98b4a', down: '#8a6d4a', left: '#6b8e3a' } as Record<string, string>;
const legOf = (p: { x: number; y: number }) => legs.find((g) => p.x >= g.x0 - 1 && p.x <= g.x1 + 1 && p.y >= g.y0 - 1 && p.y <= g.y1 + 1);
const parts: string[] = [];
parts.push(`<rect width="100%" height="100%" fill="#f4f1e8"/>`);
for (const g of legs) parts.push(`<rect x="${sx(g.x0)}" y="${sy(g.y0)}" width="${((g.x1 - g.x0) * S).toFixed(1)}" height="${((g.y1 - g.y0) * S * 2.2).toFixed(1)}" fill="${col[g.travel]}" opacity="0.12" stroke="${col[g.travel]}" stroke-dasharray="4 3"/><text x="${sx(g.x0) }" y="${(Number(sy(g.y0)) - 4).toFixed(1)}" font-size="13" font-family="sans-serif" fill="${col[g.travel]}">${g.travel} leg (x ${Math.round(g.x0)}-${Math.round(g.x1)})</text>`);
for (const r of st.rivers ?? []) {
  const y = sy(r.surfaceY), x0 = Number(sx(r.x0)), x1 = Number(sx(r.x1)), m = (x0 + x1) / 2, d = r.dir * 10;
  parts.push(`<rect x="${x0}" y="${y}" width="${(x1 - x0).toFixed(1)}" height="10" fill="#3b82c4" opacity="0.75"/><path d="M${(m - d).toFixed(1)} ${Number(y) + 5} L${(m + d).toFixed(1)} ${Number(y) + 5} M${(m + d).toFixed(1)} ${Number(y) + 5} l${(-r.dir * 5).toFixed(1)} -4 M${(m + d).toFixed(1)} ${Number(y) + 5} l${(-r.dir * 5).toFixed(1)} 4" stroke="#fff" stroke-width="2"/>`);
}
for (const p of st.platforms) {
  if (p.type === 'drift') continue;
  const g = legOf(p);
  parts.push(`<rect x="${sx(p.x)}" y="${sy(p.y)}" width="${Math.max(1, p.width * S).toFixed(1)}" height="${Math.max(2, Math.min(p.height, 60) * S * 2.2).toFixed(1)}" fill="${g ? col[g.travel] : '#555'}"/>`);
}
for (const p of st.platforms.filter((q) => q.type === 'drift')) parts.push(`<rect x="${sx(p.x)}" y="${sy(p.y)}" width="${(p.width * S).toFixed(1)}" height="3" fill="#5a3b1c"/>`);
for (const c of st.collectibles.filter((q) => q.type === 'flower')) parts.push(`<circle cx="${sx(c.x)}" cy="${sy(c.y)}" r="2" fill="#e05a9a"/>`);
for (const c of st.checkpoints ?? []) parts.push(`<path d="M${sx(c.x)} ${sy(c.y)} v-16 l9 4 l-9 4" fill="#d92b2b" stroke="#d92b2b"/>`);
parts.push(`<polyline points="${path.map(([x, y]) => `${sx(x)},${sy(y - 40)}`).join(' ')}" fill="none" stroke="#222" stroke-width="1.2" opacity="0.7"/>`);
parts.push(`<circle cx="${sx(st.spawnX)}" cy="${sy(st.spawnY)}" r="6" fill="#222"/><text x="${Number(sx(st.spawnX)) + 8}" y="${sy(st.spawnY - 30)}" font-size="13" font-family="sans-serif">spawn</text>`);
parts.push(`<rect x="${Number(sx(st.exitTotemX)) - 5}" y="${Number(sy(st.exitTotemY)) - 22}" width="10" height="22" fill="#34a853"/><text x="${Number(sx(st.exitTotemX)) + 8}" y="${sy(st.exitTotemY - 40)}" font-size="13" font-family="sans-serif">shrine</text>`);
const petals = st.collectibles.filter((q) => q.type === 'flower').length;
const title = `toy out-and-back (toyHome.ts), seed ${seed} ${setting}: ${legs.map((g) => g.travel).join(' / ')}; rivers ${st.rivers?.length} (arrows = current); flags ${st.checkpoints?.length}; petals ${petals}; middle bot: ${run.end} at ${run.finishSeconds} s, lives ${run.lives}`;
parts.push(`<text x="10" y="${(H - 10).toFixed(0)}" font-size="15" font-family="sans-serif" fill="#222">${title}</text>`);
writeFileSync(out, `<svg xmlns="http://www.w3.org/2000/svg" width="${W.toFixed(0)}" height="${H.toFixed(0)}" viewBox="0 0 ${W.toFixed(0)} ${H.toFixed(0)}">${parts.join('')}</svg>`);
console.log(title, '->', out, `${W.toFixed(0)}x${H.toFixed(0)}`);
