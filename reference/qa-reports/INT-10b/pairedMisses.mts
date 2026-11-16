// INT-10b: every paired-column petal miss on 1-4 (fieldPetals.test's own climbs, all of them, not the first): seeds 1-6, both settings
import '../../../src/game/headlessDom.ts';
import { RealPlay } from '../../../src/game/realPlay.ts';
import { setDifficulty } from '../../../src/game/difficulty.ts';
import { FIELD_FEEL, type Hands } from '../../../src/game/vineField.ts';
import type { Collectible, Vine } from '../../../src/game/types.ts';
type E = { hands: Hands | null; field: { pods: unknown[] } | null };
function paired(r: RealPlay): Array<{ c: Collectible; a: Vine; b: Vine }> {
  const fv = r.vines.filter((v) => v.field);
  const out: Array<{ c: Collectible; a: Vine; b: Vine }> = [];
  for (const c of r.collectibles) {
    if (c.type !== 'flower') continue;
    const span = fv.filter((v) => c.y >= v.topY + 10 && c.y <= v.bottomY - 10 && Math.abs(v.x - c.x) <= FIELD_FEEL.reach);
    let best: { a: Vine; b: Vine } | null = null;
    for (const a of span) for (const b of span)
      if (a.x < b.x && b.x - a.x <= FIELD_FEEL.reach && c.x >= a.x && c.x <= b.x && (!best || Math.abs((a.x + b.x) / 2 - c.x) < Math.abs((best.a.x + best.b.x) / 2 - c.x))) best = { a, b };
    if (best) out.push({ c, ...best });
  }
  return out;
}
for (const setting of ['normal', 'easy'] as const) {
  setDifficulty(setting);
  for (const seed of [1, 2, 3, 4, 5, 6]) {
    const r = new RealPlay('1-4', seed);
    const e = r.e as unknown as E;
    e.field!.pods = [];
    const out: string[] = [];
    for (const { c, a, b } of paired(r)) {
      e.hands = { a, b: null }; c.collected = false;
      r.climb(a, Math.min(a.bottomY - 4, c.y + 150));
      let two = false;
      for (let i = 0; i < 40 && !c.collected; i++) { r.frame({ up: true, right: i >= 3 && b.x > a.x, left: i >= 3 && b.x < a.x }); if (e.hands?.b) two = true; }
      if (!c.collected || !two) out.push(`${c.x},${c.y} pair ${a.x}/${b.x} top ${Math.min(a.topY, b.topY)}${two ? '' : ' (no second hand)'}${c.collected ? '' : ' MISSED'} his box top ${Math.round(r.p.y)}`);
    }
    console.log(`${setting} seed ${seed}: ${paired(r).length} paired, ${out.length} faults${out.length ? ': ' + out.join(' ; ') : ''}`);
  }
}
setDifficulty('normal');
