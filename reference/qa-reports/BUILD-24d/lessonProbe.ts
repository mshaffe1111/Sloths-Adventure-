// BUILD-24d (item 1): where the real engine picks each of Dot's LESSONS on a playthrough (a tier bot, the real engine; RealPlay skips
// lessonTick and the camera as cosmetic, so this puts both back), and for 'gap' which platform edge it read and what lay past it.
//   npx tsx reference/qa-reports/BUILD-24d/lessonProbe.ts <stage> <setting> <seed> [tier]
import '../../../src/game/headlessDom.ts';
import { firstTimer } from '../../../tools/inspect/firsttimer.ts';
import { BOTS } from '../../../tools/inspect/tierBots.ts';
import { setDifficulty } from '../../../src/game/difficulty.ts';
import { GameEngine } from '../../../src/game/engine.ts';
const [stage, setting, seed, tier = 'middle'] = process.argv.slice(2);
setDifficulty(setting as never);
let hooked = false;
const out: string[] = [];
const r: any = firstTimer(stage, Number(seed), (BOTS as any)[tier][setting], {
  cap: 1200,
  onFrame: (s: any) => {
    const e = s.e;
    if (hooked) return;
    hooked = true;
    const P = (GameEngine as any).prototype;
    e.lessonTick = P.lessonTick.bind(e);
    e.updateCamera = P.updateCamera.bind(e);
    const prev = e.callbacks.onLesson;
    e.callbacks.onLesson = (id: string) => {
      const p = e.player;
      let why = '';
      if (id === 'gap') {
        const ps = e.platforms.filter((q: any) => !q.broken && q.type !== 'drift' && Math.abs(q.y - p.y) <= 120 && q.x + q.width >= p.x - 60).sort((a: any, b: any) => a.x - b.x);
        for (let i = 0; i + 1 < ps.length; i++) {
          const edge = ps[i].x + ps[i].width;
          if (ps[i + 1].x - edge > 60 && edge >= p.x && edge - p.x <= 340) {
            why = ` edge of ${ps[i].type}${ps[i].soil ? '/soil' : ''} x${Math.round(ps[i].x)} w${Math.round(ps[i].width)} y${Math.round(ps[i].y)} -> next ${ps[i + 1].type} x${Math.round(ps[i + 1].x)} y${Math.round(ps[i + 1].y)} (gap ${Math.round(ps[i + 1].x - edge)})`;
            break;
          }
        }
      }
      out.push(`t${e.gameTime.toFixed(1)} x${Math.round(p.x)} y${Math.round(p.y)} LESSON ${id}${why}`);
      prev?.(id);
    };
  },
});
console.log(`${stage} ${setting} ${tier} s${seed} end ${r.end}`);
for (const l of out) console.log('  ' + l);
