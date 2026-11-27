import sys,re
f=sys.argv[1]; s=open(f).read()
s=s.replace("  const put = (x0: number, x1: number, y: number, L: number) => {","  let WHY = '', EE: any = null;\n  const put = (x0: number, x1: number, y: number, L: number) => {\n    if (process.env.TC_LOG) console.error('[TC]', flow, WHY, EE ? `end ${Math.round(EE.x)} of ${Math.round(EE.p.x)}-${Math.round(EE.p.x+EE.p.width)}@${Math.round(EE.p.y)}` : '', `-> ${Math.round(x0)}-${Math.round(x1)}@${Math.round(y)}`);",1)
s=s.replace("      if (catchUnder(all, e.x, e.p.y, most) !== undefined) continue;","      if (catchUnder(all, e.x, e.p.y, most) !== undefined) continue;\n      EE = e; WHY = 'r1';",1)
s=s.replace("      const lo = e.p.y + BODY_H + 12,","      WHY = 'r2'; const lo = e.p.y + BODY_H + 12,",1)
s=s.replace("      const x0 = Math.max(24, Math.min(width - 24 - TOWER.catchW, e.x - TOWER.catchW / 2));","      WHY = 'r4'; const x0 = Math.max(24, Math.min(width - 24 - TOWER.catchW, e.x - TOWER.catchW / 2));",1)
s=s.replace("        if (L >= 0) { put(x0, x1, e.p.y, L); added++; continue; }","        if (L >= 0) { WHY = 'r3'; put(x0, x1, e.p.y, L); added++; continue; }",1)
s=s.replace("      if (flow === 'down') {\n        const s = slotUnder(","      WHY = 'r5'; if (flow === 'down') {\n        const s = slotUnder(",1)
open(f,'w').write(s); print(s.count('WHY ='))
# (box 21) with a second argument 'rch': also log [RCH] for every going-down put over a slot by more than SLOT_REACH (needs c14's
# slotUnder + SLOT_REACH appended to the copy first: git show 040a56547:src/game/gen2/tower.ts, from 'export const SLOT_REACH' up to
# 'the verdict: each of')
if len(sys.argv) > 2 and sys.argv[2] == 'rch':
    s = open(f).read()
    old = "    if (process.env.TC_LOG) console.error('[TC]',"
    new = """    if (process.env.TC_LOG && flow === 'down' && EE) { const sl = slotUnder(all, x0, x1, y); if (sl && sl.y - y > SLOT_REACH) { const dipF = all.filter((q) => q.type === 'solid' && q.y > sl.y + 1 && q.x < sl.x1 && q.x + q.width > sl.x0).map((q) => q.y - sl.y); const arr = vines.filter((v) => v.vineType === 'tree_climb' && Math.abs(v.bottomY - sl.y) < 30 && v.x > sl.x0 - 400 && v.x < sl.x1 + 400).map((v) => Math.round(v.x)); console.error('[RCH]', WHY, `end ${Math.round(EE.x)} of ${Math.round(EE.p.x)}-${Math.round(EE.p.x+EE.p.width)}@${Math.round(EE.p.y)}`, `bough ${Math.round(x0)}-${Math.round(x1)}@${Math.round(y)}`, `slot ${sl.x0}-${sl.x1}@${sl.y} up ${sl.y - y}`, `fallOver ${EE.x >= sl.x0 && EE.x <= sl.x1 ? 1 : 0}`, `dip ${dipF.length ? Math.min(...dipF) : 'none'}`, `past ${x0 < sl.x0 - 2 ? 'L' : ''}${x1 > sl.x1 + 2 ? 'R' : ''}`, `vinesAt ${arr.join(',')}`); } }
""" + old
    assert old in s; s = s.replace(old, new, 1); open(f, 'w').write(s); print('rch on')
