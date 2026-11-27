# BUILD-27c: flownArcs rows from a flight.ts `normal all` log (the columns as 2-5's: rise block/thin best; gap block >=70 / last ground / ANY; bdist d=0)
import re, sys
t = open(sys.argv[1]).read(); st = sys.argv[2]
def sec(name):
    i = t.index('[%s] normal' % name); j = t.find('\n[', i + 1); return t[i:j if j > 0 else None]
rise = {}
for m in re.finditer(r'^\s+(.+?)\s{2,}([\d.]+)\s+[\d.]+\s+([\d.]+)\s+[\d.]+\s*$', sec('rise'), re.M): rise[m.group(1).strip()] = (int(float(m.group(2))), int(float(m.group(3))))
def gaps(block, move):
    i = block.index('  %s   (' % move); seg = block[i:]
    g = lambda lab: int(float(re.search(r'%s\s+([\d.]+)' % re.escape(lab), seg).group(1)))
    return [g('>=70 before lip'), g('last ground frame'), g('ANY (physical)')]
d, dd, bd = sec('dist'), sec('ddist'), sec('bdist')
m = re.search(r'^\s+0\s+([\d.]+)\s+([\d.]+)', bd, re.M); b0, ba0 = int(float(m.group(1))), int(float(m.group(2)))
rows = [('single-hold', rise['single hold'], gaps(d, 'single hold')), ('single-flick', rise['single flick'], gaps(d, 'single flick')),
        ('single-tap', rise['single tap'], gaps(d, 'single tap')), ('double-hold', rise['double hold'], gaps(dd, 'double hold')),
        ('double-flick', rise['double flick'], gaps(dd, 'double flick')), ('double-tap-tap', rise['double tap'], gaps(dd, 'double tap')),
        ('bounce', rise['bounce alone'], [b0, b0, b0]), ('bounce-air', rise['bounce+double hold'], [ba0, ba0, ba0])]
v = 'n' + st.replace('-', '')
for mv, c, g in rows:
    gs = ' / '.join(map(str, g)) if g[0] != g[1] else str(g[0])
    print(f"  ...{v}('{mv}', [{c[0]}, {c[1]}], [{g[0]}, {g[1]}, {g[2]}], 'chain.md §1 \"{st}: {mv} {c[0]} / {c[1]}, gap {gs}\"'),")
