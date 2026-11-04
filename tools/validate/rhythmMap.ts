/**
 * A stage overview of a beat-built World 1 layout (src/game/w1Rhythm.ts): the whole stage cut into rows, nodes coloured by their pacing
 * tag, ledges by what they are, lianas, flags, snakes, carvings, the keepsake, the shrine and Dot's lines; the way on as arrows.
 * w1-rhythm, 2026-11-04, for the plan the lead okays before anything is wired.
 *   npx tsx tools/validate/rhythmMap.ts <1-2|1-5> <seed> <out.svg> [easy]
 */
import { writeFileSync } from 'node:fs';
import { layout12, layout15, type Layout } from '../../src/game/w1Rhythm.ts';
import { stageBpm } from '../../src/game/beatTrace.ts';
import { generateAllLevels } from '../../src/game/worldsData.ts';

const [stage, seedS, out, easyS] = process.argv.slice(2);
const cfg = generateAllLevels().find((l) => l.id === stage)!;
const bpm = stageBpm(cfg);
const L: Layout = (stage === '1-2' ? layout12 : layout15)(Number(seedS), easyS === 'easy', bpm);
const TAG: Record<string, string> = { intro: '#7fb8ff', ramp: '#5fd38a', spike: '#ff8a5c', rest: '#f5e27a', counter: '#c58cff', climax: '#ff5c8a', cool: '#9fe6e6' };
const ROW = 6200, K = 0.3, PAD = 40;
const rows = Math.ceil(L.width / ROW);
const rowH = (L.height - 160) * K + 90;
const W = Math.round(ROW * K + PAD * 2), H = Math.round(rows * rowH + 150);
const parts: string[] = [];
const P = (s: string) => parts.push(s);
P(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" font-family="Helvetica,Arial" font-size="13">`);
P(`<rect width="100%" height="100%" fill="#14201a"/>`);
P(`<text x="${PAD}" y="28" fill="#fff" font-size="20" font-weight="bold">${stage} ${stage === '1-2' ? 'The Petal Trail: over-under loop-back' : 'Where She Walked: the trail down'} (seed ${seedS}, ${easyS === 'easy' ? 'Easy' : 'Normal'}, ${bpm} BPM, ${L.expert.toFixed(0)} s on the beat)</text>`);
const legend = Object.entries(TAG).map(([k, c], i) => `<rect x="${PAD + i * 120}" y="40" width="14" height="14" fill="${c}"/><text x="${PAD + i * 120 + 20}" y="52" fill="#ddd">${k}</text>`).join('');
P(legend);
P(`<text x="${PAD + 860}" y="52" fill="#ddd">grey: catch/bough (safe)  brown dash: crumbling  red: snake  M: Meeca's carving  star: keepsake/note  green line: liana  flag: checkpoint  ⛩ shrine</text>`);
for (let r = 0; r < rows; r++) {
  const ox = r * ROW, oy = 80 + r * rowH;
  const X = (x: number) => PAD + (x - ox) * K, Y = (y: number) => oy + 60 + (y - 280) * K;
  P(`<g><rect x="${PAD}" y="${oy}" width="${ROW * K}" height="${rowH - 20}" fill="#1c2b23" stroke="#33463b"/>`);
  P(`<text x="${PAD + 4}" y="${oy + 14}" fill="#8aa">x ${ox}-${ox + ROW}</text>`);
  for (const n of L.nodes) {
    if (n.x1 < ox || n.x0 > ox + ROW) continue;
    P(`<rect x="${X(Math.max(n.x0, ox))}" y="${Y(n.y) - 70}" width="${(Math.min(n.x1, ox + ROW) - Math.max(n.x0, ox)) * K}" height="12" fill="${TAG[n.tag]}" opacity="0.85"/>`);
    if (n.x0 >= ox) P(`<text x="${X(n.x0) + 2}" y="${Y(n.y) - 74}" fill="${TAG[n.tag]}" font-size="12">${n.tag} ${n.tier}${n.dir < 0 ? ' ←' : ' →'} ${n.seconds}s ${n.density ? n.density + '/s' : ''}</text>`);
  }
  for (const q of L.ledges) {
    if (q.x1 < ox || q.x0 > ox + ROW) continue;
    const c = q.surface === 'catch' || q.surface === 'bough' ? '#7a8a80' : q.surface === 'crumble' ? '#c9935a' : q.surface === 'stump' ? '#8f7a5a' : q.surface === 'apron' ? '#e8e2c8' : q.surface === 'bank' ? '#6d8f4e' : '#a8d080';
    const h = q.surface === 'bank' || q.surface === 'stump' || q.surface === 'apron' ? 8 : 5;
    P(`<rect x="${X(q.x0)}" y="${Y(q.y)}" width="${Math.max(1, (q.x1 - q.x0) * K)}" height="${h}" fill="${c}" ${q.surface === 'crumble' ? 'stroke="#5a3a1a" stroke-dasharray="3,2"' : ''}/>`);
  }
  for (const v of L.vines) if (v.x >= ox && v.x <= ox + ROW) P(`<line x1="${X(v.x)}" y1="${Y(Math.max(200, v.topY))}" x2="${X(v.x)}" y2="${Y(v.bottomY)}" stroke="#3fcf6f" stroke-width="2"/>`);
  for (const p of L.petals) if (p.x >= ox && p.x <= ox + ROW) P(`<circle cx="${X(p.x)}" cy="${Y(p.y)}" r="1.6" fill="#ff9ad5"/>`);
  for (const f of L.flags) if (f.x >= ox && f.x <= ox + ROW) P(`<text x="${X(f.x) - 4}" y="${Y(f.y) - 4}" fill="#fde047">⚑</text>`);
  for (const s of L.snakes) if (s.x >= ox && s.x <= ox + ROW) P(`<circle cx="${X(s.x)}" cy="${Y(s.y) - 4}" r="4" fill="#e04040"/>`);
  for (const m of L.marks) if (m.x >= ox && m.x <= ox + ROW) P(`<text x="${X(m.x) - 5}" y="${Y(m.y) - 8}" fill="#ffb347" font-weight="bold">M</text>`);
  if (L.find && L.find.x >= ox && L.find.x <= ox + ROW) P(`<text x="${X(L.find.x) - 6}" y="${Y(L.find.y) - 6}" fill="#fff" font-size="16">★</text>`);
  if (L.exit.x >= ox && L.exit.x <= ox + ROW) P(`<text x="${X(L.exit.x) - 8}" y="${Y(L.exit.y) - 6}" fill="#fff" font-size="18">⛩</text>`);
  L.lines.forEach((l, i) => { if (l.x >= ox && l.x <= ox + ROW) P(`<text x="${X(l.x)}" y="${Y(l.y) - 40}" fill="#bfe3ff" font-size="11">Dot ${i + 1}: “${l.text}”</text>`); });
  for (const h of L.heartFalls) if (h.x1 >= ox && h.x0 <= ox + ROW) P(`<rect x="${X(Math.max(h.x0, ox))}" y="${oy + rowH - 30}" width="${(Math.min(h.x1, ox + ROW) - Math.max(h.x0, ox)) * K}" height="4" fill="#ff6b6b" opacity="0.6"/>`);
  P(`</g>`);
}
P(`<text x="${PAD}" y="${H - 40}" fill="#ccc">Vertical scale = horizontal (0.3). Gaps in the canopy (top tier) and the floor drop out of the stage: Easy sets him back on his ledge (engine softFall); Normal: a heart (red bar under the row: heartFall) or a life on the floor's pits.</text>`);
P(`<text x="${PAD}" y="${H - 20}" fill="#ccc">Ledges are where the tracer put his feet on the stage's music beat; every landing holds the clumsy thumb (beatTrace.ts tests).</text>`);
P(`</svg>`);
writeFileSync(out, parts.join('\n'));
console.log(out, W, H);
