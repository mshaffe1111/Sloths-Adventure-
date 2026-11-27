// ENG-DARK probe: walk off the shaft rim on the 3-1 draft, seed 1: where he goes, frame by frame (every 6th)
import '../../../../src/game/headlessDom.ts';
import { readyDraft } from '../../../../tools/engine/draft.ts';
import { RealPlay } from '../../../../src/game/realPlay.ts';
import { generateAllLevels } from '../../../../src/game/worldsData.ts';
import { darkRims } from '../../../../src/game/gen2/dark.ts';
readyDraft('3-1');
const r = new RealPlay('3-1', 1, { ...generateAllLevels().find((c) => c.id === '3-1' && !c.secret)!, unlocked: true });
const rim = darkRims(r.stage).find((q) => q.light?.sleep && q.land.y - q.y >= 110 && q.land.y - q.y <= 420)!;
console.log('rim', rim.x, rim.y, rim.dir, 'piece', rim.piece.x, rim.piece.width, 'land', rim.land);
r.stand(rim.x - rim.dir * 30, rim.y); r.p.facing = rim.dir;
for (let i = 0; i < 60; i++) { r.frame(rim.dir > 0 ? { right: true } : { left: true }); if (i % 6 === 0) console.log(i, Math.round(r.p.x), Math.round(r.p.y), r.p.grounded, Math.round(r.p.vx)); }
