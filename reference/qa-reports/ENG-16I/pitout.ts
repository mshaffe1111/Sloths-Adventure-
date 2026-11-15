// ENG-16I: from the top step of the stair in the pit AFTER a creaky perch (the perch broken), can he take the liana ahead? A person's try:
// stand on the step at its forward end, run forward, jump at the lip (or not), hold forward; the frame he catches a liana, or where he lands.
//   npx tsx reference/qa-reports/ENG-16I/pitout.ts <variant> <section template> <perch tag> <liana tag>
import '../../../src/game/headlessDom.ts';
import { RealPlay } from '../../../src/game/realPlay.ts';
const [vs, tpl, perchTag, lianaTag] = process.argv.slice(2);
const v = Number(vs);
for (const jumpAt of [-1, 0, 10, 20, 30, 40]) {
  const rp = new RealPlay('1-6', v);
  const g = (rp.stage as { gen2?: { sections: Array<{ uid: string; template: string; x0: number; x1: number }> } }).gen2!;
  const sec = g.sections.find((s) => s.template === tpl)!;
  const perch = rp.platforms.find((p) => (p as { tag?: string }).tag === `${sec.uid}:${perchTag}`)!;
  const liana = rp.vines.find((l) => (l as { tag?: string }).tag === `${sec.uid}:${lianaTag}`)!;
  // (the perch broken, as after his landing on it; the stair's top step: the highest untagged solid starting at the perch's far end)
  Object.assign(perch, { broken: true, regrowAt: 1e9 });
  const steps = rp.platforms.filter((p) => !(p as { tag?: string }).tag && Math.abs(p.x - (perch.x + perch.width)) < 2 && p.x < liana.x).sort((a, b) => a.y - b.y);
  const top = steps[0];
  rp.stand(top.x + 10, top.y);
  let caught = '', f = 0, jumped = false;
  for (; f < 120 && !caught; f++) {
    const p = rp.p;
    const lip = top.x + top.width - p.x;
    const press = jumpAt >= 0 && !jumped && p.grounded && lip <= jumpAt;
    if (press) jumped = true;
    rp.frame({ right: true, press, jump: press || (jumped && f < 200) } as never);
    if (rp.p.isVineSwinging || rp.p.climbing) caught = `caught ${(rp.p as { vine?: { tag?: string } }).vine?.tag ?? 'a vine'} at f${f} x ${Math.round(rp.p.x)} y ${Math.round(rp.p.y)}`;
  }
  console.log(`seed ${v} ${tpl}: step top x ${Math.round(top.x)}..${Math.round(top.x + top.width)} y ${Math.round(top.y)}; liana ${lianaTag} x ${Math.round(liana.x)} ${Math.round(liana.topY)}..${Math.round(liana.bottomY)}; jump ${jumpAt < 0 ? 'none (walk off)' : `${jumpAt} px before the lip`}: ${caught || `no catch; at f${f} x ${Math.round(rp.p.x)} y ${Math.round(rp.p.y)} grounded ${rp.p.grounded}`}`);
}
