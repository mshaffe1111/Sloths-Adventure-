// RUNS, the E3 side by side: the stage as tools/engine/stonesupport.ts reads it (tools/validate/play.ts sim -> RealPlay, the real engine
// after its own load: stage.platforms less broken ones), with each landing's catalogue entry (src/game/mixer/catalog.ts LANDINGS, matched
// as stonesupport.ts matches: name, mayFloat, element) and the fields support.py reads (style, type, size, flags, keys), plus the stage's
// trunks, trees, water (rivers + proto.water) and floor. 16 layouts x 2 settings.
//   npx tsx tools/engine/runs/simdump.ts <tag> <ids comma> [--root <tree>] > out.json
// --root <tree> builds another tree's stages (main, for the old 1-1) with this tree's catalogue; play.ts's sim is setDifficulty + new
// RealPlay(id, layout), done here from the root's own src/game.
import { LANDINGS } from '../../../src/game/mixer/catalog.ts';
const [tag, ids] = process.argv.slice(2);
const ri = process.argv.indexOf('--root');
const root = ri >= 0 ? process.argv[ri + 1] : new URL('../../..', import.meta.url).pathname;
await import(root + '/src/game/headlessDom.ts');
const { RealPlay } = await import(root + '/src/game/realPlay.ts');
const { setDifficulty } = await import(root + '/src/game/difficulty.ts');
const sim = (id: string, v: number, s: 'normal' | 'easy') => { setDifficulty(s); return new RealPlay(id, v); };
const out: unknown[] = [];
for (const id of ids.split(',')) for (const setting of ['normal', 'easy'] as const) for (let v = 1; v <= 16; v++) {
  const r = sim(id, v, setting); const s: any = r.stage; const e: any = r.e;
  const P = s.platforms.filter((p: any) => !p.broken);
  out.push({ tag, id, layout: v, setting, floorY: s.config.levelHeight,
    water: [...(s.rivers ?? []).map((q: any) => ({ x0: q.x0, x1: q.x1, y: q.surfaceY })), ...(s.proto?.water ?? [])],
    trunks: (s.proto?.trunks ?? e.proto?.trunks ?? []).map((t: any) => ({ x: t.x, topY: t.topY, bottomY: t.bottomY, w: t.w })),
    trees: (s.trees ?? []).map((t: any) => ({ x: t.x, groundY: t.groundY, topY: t.topY, w: t.trunkWidth })),
    platforms: P.map((p: any) => { const k = LANDINGS.find((q) => q.match(p)); return { id: p.id, x: p.x, y: p.y, w: p.width, h: p.height ?? 24, type: p.type, style: p.style ?? null,
      deco: !!(p.decorative || p.isDecor || p.ghost), lily: !!(p.lily || p.lilyPad), soil: !!p.soil, catchL: !!p.catch,
      keys: Object.keys(p).filter((x) => !['id', 'x', 'y', 'width', 'height', 'type', 'style'].includes(x)).join('|'),
      kind: k?.name ?? null, mayFloat: k?.mayFloat ?? null, element: k?.element ?? null, art: p.art ?? null }; }) });
  process.stderr.write(`${id} ${setting} L${v}\n`);
}
process.stdout.write(JSON.stringify(out));
