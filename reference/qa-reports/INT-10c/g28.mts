import '/home/user/Sloths-Adventure-/src/game/headlessDom.ts';
import { generateAllLevels } from '/home/user/Sloths-Adventure-/src/game/worldsData.ts';
import { generateStage, setLayoutVariant } from '/home/user/Sloths-Adventure-/src/game/stageGenerator.ts';
import { withGoals } from '/home/user/Sloths-Adventure-/src/game/goals.ts';
import { walkedStage } from '/home/user/Sloths-Adventure-/src/game/petals.ts';
import { walkedSpan } from '/home/user/Sloths-Adventure-/src/game/gen2/walkedSpan.ts';
const [id, a, b] = process.argv.slice(2); const x0 = +a, x1 = +b;
const l = generateAllLevels().find((q: any) => q.id === id)!;
setLayoutVariant(1);
const st: any = withGoals(generateStage({ ...l, unlocked: true }, 'normal'));
setLayoutVariant(null);
const ws: any = walkedStage(st);
for (const p of st.platforms.filter((q: any) => q.x < x1 && q.x + q.width > x0 && q.type !== 'bouncy')) { const w = walkedSpan(p, ws); console.log(p.id, Math.round(p.x), Math.round(p.x + p.width), p.y, p.type, 'span', Math.round(w.lo), Math.round(w.hi), 'away', ws.away?.(p)); }
console.log('vines', JSON.stringify(st.vines.filter((v: any) => v.x > x0 && v.x < x1).map((v: any) => [Math.round(v.x), v.vineType ?? '', v.isSwingingVine ? 'swing' : ''])));
