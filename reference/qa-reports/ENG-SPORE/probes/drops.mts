// the 3-1 draft's dark DROP rims 200-280 px over their landing, light asleep (the toy's real row): seed setting x y drop landing piece
import '../../../../src/game/headlessDom.ts';
import { readyDraft } from '../../../../tools/engine/draft.ts';
readyDraft('3-1');
const { generateAllLevels } = await import('../../../../src/game/worldsData.ts');
const { generateStage, setLayoutVariant } = await import('../../../../src/game/stageGenerator.ts');
const { darkRims } = await import('../../../../src/game/gen2/dark.ts');
const cfg = { ...generateAllLevels().find((c) => c.id === '3-1' && !c.secret)!, unlocked: true };
for (let seed = 1; seed <= 12; seed++) for (const d of ['normal'] as const) {
  setLayoutVariant(seed);
  const st = generateStage(cfg, d);
  setLayoutVariant(null);
  for (const r of darkRims(st as never)) {
    const drop = r.land.y - r.y;
    const past = r.dir > 0 ? r.onto.x + r.onto.width - r.x : r.x - r.onto.x;
    if (!r.drop || drop < 150 || drop > 330 || !r.light?.sleep || past < 140) continue;
    // (clean: nothing between the rim and the shelf within a full run's carry, 300 px out)
    const [a, b] = r.dir > 0 ? [r.x, r.x + 300] : [r.x - 300, r.x];
    if (st.platforms.some((q) => q !== r.onto && q.x < b && q.x + q.width > a && q.y > r.y + 4 && q.y < r.land.y - 4)) continue;
    console.log(seed, d, r.x, Math.round(r.y), Math.round(drop), `land ${r.land.x},${Math.round(r.land.y)} on ${Math.round(r.onto.x)}-${Math.round(r.onto.x + r.onto.width)}`, `piece ${Math.round(r.piece.x)}-${Math.round(r.piece.x + r.piece.width)} dir ${r.dir} past ${Math.round(past)}`);
  }
}
