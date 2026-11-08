# CP3 strip map: old 1-1, today's 1-5 and the new mixed 1-5 (layout 1, Normal), side maps in rows of 3,000 px with each node's idea labelled
import json, sys, html, collections
S = '/tmp/claude-0/-home-user-Sloths-Adventure-/d50ed521-ba52-5e68-8178-fcbadf0c9ec7/scratchpad'
sys.path.insert(0, S + '/cp1')
from measure2 import landings, measure
exec(open(S + '/cp1/zones.py').read().split("rows=json.load")[0])
def splits180(r):
    L=[q for q in landings(r) if q[3] not in ('climb','liana')]
    x0,x1=min(q[0] for q in L),max(q[1] for q in L); zones_=0; run=0; x=x0
    while x<x1:
        ys=sorted({q[2] for q in L if q[0]-90<=x<=q[1]+90})
        if len(ys)>=2 and ys[-1]-ys[0]>=120: run+=20
        else: zones_+= run>300; run=0
        x+=20
    return zones_+(run>300)
def pick(f, tag, id_):
    return [r for r in json.load(open(S + '/' + f)) if r['tag'] == tag and r['id'] == id_ and r['setting'] == 'normal' and r['layout'] == 1][0]
tags = json.load(open('/home/user/Sloths-Adventure-/reference/engine/cp2/idea-tags.json'))
ex = json.load(open(S + '/cp3-explain.json'))['1']
newtags = []
for e in ex:
    if e['node'] < 0: lab = e['idea']; newtags.append([e['x0'] - 200, e['x1'] + 200, lab]); continue
    lab = f"n{e.get('nid') or e['node']} {e['idea']}" + (' + canopy' if e.get('canopy') else '') + (f" ({e['road']} road)" if e.get('road') else '')
    newtags.append([e['x0'], e['x1'], lab])
stages = [
    ('old', "Old 1-1", "Matt's bar. A short cycle of bank hops, a bounce up and a canopy over the floor.", pick('cp1-old.json', 'old', '1-1'), tags['Old 1-1 (live)']),
    ('today', "Today's 1-5", '"Just cracking logs." The same pieces over and over.', pick('cp1-new.json', 'new', '1-5'), tags['Rebuilt 1-5']),
    ('mix', 'New 1-5 (mixer, roll 1)', 'Eleven nodes from the designer\'s plan. Canopies ride over the floor ideas; two forks.', pick('cp3-mix.json', 'mix', '1-5'), newtags),
]
def group(p):
    if p['type'] == 'bouncy': return 'mush'
    if 'perch' in p['keys']: return 'bough'
    if p['type'] == 'fragile': return 'break'
    if p['lily'] or (p['style'] is None and p['h'] == 30): return 'water'
    if p['style'] == 'log': return 'log'
    if p['style'] in ('branch', 'canopy_bridge'): return 'bough'
    return 'ground'
GROUPS = [('ground', 'Banks and stones', 1), ('log', 'Logs', 2), ('water', 'Lily pads and reeds', 3), ('bough', 'Boughs and bridges', 4), ('mush', 'Mushrooms', 5), ('break', 'Creaky and crumbling', 6)]
ROW = 3000
def numbers(r, tg):
    m = measure(r)
    W = max(p['x'] + p['w'] for p in r['platforms'])
    two = sum(b - a for a, b in zones(r)) / W
    share = collections.Counter()
    for a, b, lab in tg:
        if '(high road)' in lab or '(low road)' in lab: continue
        k = lab.split(' ', 1)[1] if lab.startswith('n') and lab[1].isdigit() else lab
        share[k.replace(' + canopy', '')] += b - a
    top = share.most_common(1)[0] if share else ('-', 0)
    Ls = landings(r); kc = collections.Counter(q[3] for q in Ls)
    return {'mush': sum(1 for p in r['platforms'] if p['type'] == 'bouncy'), 'creaky': (kc['creaking limb'] + kc['snap twig']) / len(Ls), 'width': W, 'kinds': m['kinds'], 'run': m['run'], 'splits': splits180(r), 'two': two, 'top': (top[0], top[1] / W), 'flat': m['flatPx'], 'updown': (m['up'] + m['down']) / (m['up'] + m['down'] + m['flat'])}
def row_svg(r, tg, x0, sid):
    x1 = x0 + ROW
    ps = [p for p in r['platforms'] if p['x'] + p['w'] > x0 and p['x'] < x1 and not p['catchL'] and 'art' not in p['keys']]
    vs = [v for v in r['vines'] if x0 <= v['x'] <= x1]
    if not ps: return ''
    ys = [p['y'] for p in ps] + [v['top'] for v in vs]
    top, bot = min(ys) - 450, max(p['y'] + min(p['h'], 60) for p in ps) + 40
    out = [f'<svg viewBox="{x0} {top} {ROW} {bot - top}" preserveAspectRatio="xMinYMin meet" role="img" aria-label="{html.escape(sid)} from {x0} to {x1} px">']
    for p in sorted(ps, key=lambda p: p['type'] == 'bouncy'):
        g = group(p)
        h = 30 if p['type'] == 'bouncy' else min(p['h'], 60)
        out.append(f'<rect class="g-{g}" x="{p["x"]}" y="{p["y"]}" width="{p["w"]}" height="{h}" rx="6"/>')
    for v in vs: out.append(f'<line class="vine" x1="{v["x"]}" y1="{v["top"]}" x2="{v["x"]}" y2="{v["bot"]}"/>')
    lanes = [-1e9] * 4
    for a, b, lab in sorted(tg, key=lambda t: t[0]):
        if b < x0 or a > x1: continue
        tw = len(lab) * 44
        # (a label that would run past the row's end slides back so it ends inside the row)
        lx = max(x0 + 10, min(max(a, x0) + 10, x1 - 20 - tw))
        # (never dropped: the first free lane of four, or else the one that frees soonest; the designer read two missing labels as missing
        # nodes on the first map)
        free = [k for k in range(4) if lanes[k] < lx]
        lane = free[0] if free else min(range(4), key=lambda k: lanes[k])
        lanes[lane] = lx + tw + 60
        ly = top + 90 + lane * 95
        out.append(f'<line class="tick" x1="{max(a, x0)}" y1="{ly + 20}" x2="{max(a, x0)}" y2="{bot}"/><text x="{lx}" y="{ly}">{html.escape(lab)}</text>')
    out.append('</svg>')
    return ''.join(out)
secs = []
table = []
for sid, name, blurb, r, tg in stages:
    n = numbers(r, tg)
    table.append((name, n))
    rows = ''.join(f'<div class="row"><div class="rx">{x0 // 1000}k-{(x0 + ROW) // 1000}k px</div>{row_svg(r, tg, x0, name)}</div>' for x0 in range(0, int(n['width']) + 1, ROW))
    secs.append(f'<section class="stage" id="{sid}"><h2>{html.escape(name)}</h2><p class="blurb">{html.escape(blurb)}</p>{rows}</section>')
def fmt(n, k):
    if k == 'two': return f"{n[k] * 100:.0f}%"
    if k == 'top': return f"{html.escape(n[k][0])} {n[k][1] * 100:.0f}%"
    if k in ('updown', 'creaky'): return f"{n[k] * 100:.0f}%"
    if k == 'width': return f"{n[k] / 1000:.1f}k px"
    return str(n[k])
cols = [('width', 'Length'), ('kinds', 'Piece kinds'), ('run', 'Longest run of one piece'), ('splits', 'High/low splits'), ('two', 'Two roads side by side'), ('top', 'Biggest idea'), ('updown', 'Landings that step up or down'), ('flat', 'Longest flat stretch (px)'), ('mush', 'Mushrooms'), ('creaky', 'Creaky or crumbling landings')]
thead = '<tr><th scope="col">Measure</th>' + ''.join(f'<th scope="col">{html.escape(nm)}</th>' for nm, _ in table) + '</tr>'
tbody = ''.join('<tr><th scope="row">' + lab + '</th>' + ''.join(f'<td>{fmt(n, k)}</td>' for _, n in table) + '</tr>' for k, lab in cols)
legend = ''.join(f'<li><span class="sw g-{g}"></span>{lab}</li>' for g, lab, _ in GROUPS) + '<li><span class="sw vinesw"></span>Climbing vine</li>'
tpl = open(S + '/strip_tmpl.html').read()
open(S + '/stripmap/index.html', 'w').write(tpl.replace('{{TABLE}}', f'<table><thead>{thead}</thead><tbody>{tbody}</tbody></table>').replace('{{LEGEND}}', legend).replace('{{SECTIONS}}', ''.join(secs)))
print('ok', [(nm, round(n['width'])) for nm, n in table])
