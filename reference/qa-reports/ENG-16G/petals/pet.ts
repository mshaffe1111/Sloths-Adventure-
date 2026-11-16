import '/home/user/Sloths-Adventure-/src/game/headlessDom.ts';
import { RealPlay } from '/home/user/Sloths-Adventure-/src/game/realPlay.ts';
for (const seed of [1, 2, 3]) {
  const r: any = new RealPlay('1-6', seed);
  const st = r.stage ?? r.e.currentStage; const secs = st.gen2.sections;
  const sec = secs.find((s: any) => s.template === 'w1-16-first-liana');
  const pl = r.platforms.filter((q: any) => q.tag?.startsWith(sec.uid + ':'));
  const out: string[] = [];
  for (const q of pl) for (const c of r.e.collectibles) if ((c.type === 'flower' || c.type === 'leaf') && c.x >= q.x && c.x <= q.x + q.width && q.y - c.y > 0 && q.y - c.y < 60) out.push(`${q.tag.split(':')[1]}@${((c.x - q.x) / q.width).toFixed(2)}${c.fill ? '(fill)' : ''}${c.src ? '(' + c.src + ')' : ''}`);
  const fills = (st.gen2.fills ?? []).filter((f: any) => f.section === sec.uid && f.role === 'pickup').map((f: any) => `${f.socket}`);
  console.log(seed, out.join(' '), '| sockets filled:', fills.join(','), '| petal-pass keys:', Object.keys(r.e.collectibles[0] ?? {}).join(','));
}
