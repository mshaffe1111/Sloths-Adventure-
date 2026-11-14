// ENG-16G: name the beat at a spot of 1-6 (the section whose pieces span x) and the lianas above it: SPOTS="seed:x,seed:x" [SET=easy]
import '../../../../src/game/headlessDom.ts';
import { RealPlay } from '../../../../src/game/realPlay.ts';
import { setTimedSwing } from '../../../../src/game/physics.ts';
for (const sp of (process.env.SPOTS ?? '').split(',')) {
  const [seed, x] = sp.split(':').map(Number);
  if (process.env.SET === 'easy') { try { localStorage.setItem('sloth_difficulty', 'easy'); } catch {} }
  const r: any = new RealPlay('1-6', seed, process.env.SET === 'easy' ? { easy: true } as any : undefined);
  setTimedSwing(process.env.SET === 'easy');
  const st = r.stage ?? r.e.currentStage; const secs = st.gen2?.sections ?? [];
  const nm = (tag: string) => { const [u, k] = tag.split(':'); return `${(secs.find((s: any) => s.uid === u)?.template ?? u).replace('w1-16-', '')}:${k}`; };
  const left = r.platforms.filter((q: any) => q.tag && q.x <= x).sort((a: any, b: any) => b.x + b.width - (a.x + a.width))[0];
  const right = r.platforms.filter((q: any) => q.tag && q.x > x).sort((a: any, b: any) => a.x - b.x)[0];
  const vines = r.vines.filter((v: any) => v.tag && Math.abs(v.x - x) < 400).map((v: any) => `${nm(v.tag)}@${Math.round(v.x)}${v.snake ? `(${v.snake.route})` : ''}${(v.swingAmp ?? 0) === 0 ? '(still)' : ''}`);
  console.log(`seed ${seed} x ${x}: after ${left ? `${nm(left.tag)} [${left.x}..${left.x + left.width}] y ${left.y}` : '-'}; before ${right ? `${nm(right.tag)} [${right.x}..] y ${right.y}` : '-'}; vines near: ${vines.join(' ')}`);
}
