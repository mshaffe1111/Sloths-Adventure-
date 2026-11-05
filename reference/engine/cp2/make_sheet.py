# CP2 sheet generator (designer, 2026-11-05): python3 -I make_sheet.py ../cp1/strips.json out.html
# Draws every World 1 piece kind with its real sizes, and every node idea as a grey strip: a real stretch cut from a shipped
# stage where one exists, else laid out from real piece sizes (marked "laid out").
import json, sys, html
d = json.load(open(sys.argv[1])); S = {s['name']: s['p'] for s in d}
COL = {'branch': 'var(--k-bough)', 'log': 'var(--k-log)', 'bank': 'var(--k-bank)', 'creaking limb': 'var(--k-snap)', 'stone': 'var(--k-stone)',
       'bridge': 'var(--k-bridge)', 'mushroom': 'var(--k-mush)', 'liana': 'var(--k-vine)', 'catch branch': 'var(--k-bough)',
       'climb vine': 'var(--k-vine)', 'rope': 'var(--k-rope)', 'solid': 'var(--k-stone)'}
NAME = {'branch': 'Bough', 'log': 'Log', 'bank': 'Bank', 'creaking limb': 'Snap twig / rotten limb', 'stone': 'Mossy stone',
        'bridge': 'Rope bridge', 'mushroom': 'Bounce mushroom', 'liana': 'Swing vine', 'catch branch': 'Catch bough',
        'climb vine': 'Climb vine', 'rope': 'Shimmy rope'}
stats = {}
for n, p in S.items():
    for x, w, y, k, f in p: stats.setdefault(k, []).append((w, n))
def q(a, t): a = sorted(a); return a[int(t * (len(a) - 1))]
def strip(pieces, x0, x1, label_src):
    sel = [(x, w, y, k) for x, w, y, k, *_ in pieces if x < x1 and x + w > x0]
    if not sel: return ''
    ys = [y for *_, y, k in sel]; ymin, ymax = min(ys) - 60, max(ys) + 30
    W, H = x1 - x0, max(200, ymax - ymin)
    out = [f'<svg viewBox="0 0 {W} {H}" role="img" aria-label="{html.escape(label_src)}" preserveAspectRatio="xMidYMid meet">']
    for x, w, y, k in sel:
        c = COL.get(k, 'var(--fg)')
        if k == 'lily':
            out.append(f'<rect x="{x - x0 - 90}" y="{y - ymin + 8}" width="{w + 180}" height="40" fill="var(--k-water)" opacity="0.35"/><rect x="{x - x0}" y="{y - ymin}" width="{w}" height="12" rx="6" fill="var(--k-vine)"/>')
            continue
        if k == 'turtle':
            out.append(f'<ellipse cx="{x - x0 - 60}" cy="{y - ymin - 10}" rx="24" ry="12" fill="var(--k-mush)"/>')
            continue
        if k == 'boa':
            out.append(f'<ellipse cx="{x - x0 - 35}" cy="{y - ymin - 14}" rx="38" ry="14" fill="var(--k-mush)"/><text x="{x - x0 - 35}" y="{y - ymin - 36}" text-anchor="middle" font-size="26" fill="var(--muted)">boa</text>')
            continue
        if k in ('liana', 'climb vine'):
            out.append(f'<line x1="{x - x0}" y1="{y - ymin - 160}" x2="{x - x0}" y2="{y - ymin}" stroke="{c}" stroke-width="10"/>')
        elif k == 'rope':
            out.append(f'<line x1="{x - x0}" y1="{y - ymin}" x2="{x - x0 + w}" y2="{y - ymin}" stroke="{c}" stroke-width="10" stroke-dasharray="18 8"/>')
        else:
            h = 26 if k != 'mushroom' else 40
            out.append(f'<rect x="{x - x0}" y="{y - ymin}" width="{max(w, 8)}" height="{h}" rx="5" fill="{c}"/>')
    out.append('</svg>'); return ''.join(out)
def laid(parts):  # parts: (kind, width, dy, gap)
    x, y, p = 0, 600, []
    for k, w, dy, gap in parts:
        y -= dy; p.append((x, w, y, k, ''))
        if k == 'boa': x -= 0
        x += w + gap
    return p, x
IDEAS = [
 ('Bank hops', 'hops across creek banks and logs at changing heights', 'real', ('Old 1-1 (live)', 3100, 4400)),
 ('Bounce up', 'bounces off a mushroom up into the canopy', 'real', ('Old 1-1 (live)', 11150, 12750)),
 ('The fork', 'boughs up high, a long log below: pick the high road or the low road', 'real', ('Old 1-1 (live)', 13000, 15400)),
 ('Bough stair', 'climbs a tree bough by bough, each a different length (on Easy, more and smaller steps: rises of +40 at most)', 'laid', [('stone', 120, 0, 90), ('branch', 110, 70, 80), ('branch', 220, 60, 70), ('branch', 160, 70, 90), ('branch', 430, 50, 0)]),
 ('Snap-twig dash', 'keeps moving because the twigs break under him', 'real', ('Rebuilt 1-5', 4000, 6200)),
 ('Rotten-branch drop', 'rides a breaking limb down to a lower path', 'laid', [('branch', 220, 0, 60), ('creaking limb', 225, -40, 120), ('catch branch', 110, -150, 80), ('bank', 150, -120, 0)]),
 ('Vine relay', 'swings vine to vine over a gap', 'real', ('Rebuilt 1-2', 0, 0)),
 ('The climb', 'goes straight up a vine, then out along a bough', 'laid', [('bank', 220, 0, 40), ('climb vine', 0, 0, 0), ('branch', 260, 170, 0)]),
 ('Rope crossing', 'goes hand over hand along a rope over a gap', 'real', ('Rebuilt 1-3', 21900, 23200)),
 ('Bridge walk', 'crosses one long rope bridge', 'real', ('Rebuilt 1-2', 0, 0)),
 ('Stump hop', 'crosses broken ground on stones of three heights (on Easy, rises of +40 at most)', 'laid', [('bank', 150, 0, 90), ('stone', 60, 50, 80), ('stone', 120, 40, 90), ('stone', 233, -70, 90), ('bank', 220, -20, 0)]),
 ('Animal on the path', 'one boa in the way: jump it, wait, or kick-roll it', 'laid', [('bank', 230, 0, 0), ('log', 180, 0, 0), ('boa', 0, 0, 0), ('log', 170, 0, 0), ('bank', 230, 0, 0)]),
 ('Lily-pad hop', 'hops across still water on lily pads; falling in puts him back on the bank (from the World 1 test version, Matt 11-05)', 'laid', [('bank', 170, 0, 85), ('lily', 94, 30, 90), ('lily', 88, 0, 80), ('lily', 102, 0, 95), ('lily', 86, 0, 85), ('bank', 200, -30, 0)]),
 ('Turtle line', 'snapping turtles along the ground: punch one from behind, or kick its shell into the others (World 1 test version)', 'laid', [('bank', 300, 0, 0), ('turtle', 0, 0, 0), ('bank', 180, 0, 0), ('turtle', 0, 0, 0), ('bank', 200, 0, 0), ('turtle', 0, 0, 0), ('bank', 300, 0, 0)]),
]
def first_of(name, kind, span):
    for x, w, y, k, f in S[name]:
        if k == kind: return x - 150, x + span
    return 0, 0
AUTO = {'Vine relay': ('Rebuilt 1-2', 'liana', 1300), 'The climb': ('Rebuilt 1-4', 'climb vine', 1100), 'Bridge walk': ('Rebuilt 1-2', 'bridge', 1100)}
cards = []
for name, does, how, src in IDEAS:
    if how == 'real':
        st, a, b = src
        if name in AUTO: st, kd, span = AUTO[name]; a, b = first_of(st, kd, span)
        svg = strip(S[st], a, b, name); note = f'Real stretch: {st}, x {int(a)}-{int(b)}'
    elif how == 'laid':
        p, W = laid(src); svg = strip(p, -40, W + 40, name); note = 'Laid out from real piece sizes (not yet in a stage)'
    else:
        svg = '<div class="tbd">Not drawn: no World 1 stage on main has lily pads.</div>'; note = 'Waits on Matt'
    cards.append(f'<article class="idea"><h3>{name}</h3><p>{html.escape(does)}</p><div class="strip">{svg}</div><p class="src">{note}</p></article>')
rows = []
for k, v in sorted(stats.items(), key=lambda kv: -len(kv[1])):
    if k == 'solid': continue
    ws = [w for w, _ in v]; used = sorted({n.replace(' (live)', '') for _, n in v})
    sz = '—' if max(ws) == 0 else f'{int(q(ws, .1))} / {int(q(ws, .5))} / {int(q(ws, .9))}'
    rows.append(f'<tr><td><span class="sw" style="background:{COL[k]}"></span>{NAME.get(k, k)}</td><td class="num">{len(v)}</td><td class="num">{sz}</td><td>{", ".join(used)}</td></tr>')
page = open(sys.argv[3]).read().replace('{{CARDS}}', '\n'.join(cards)).replace('{{ROWS}}', '\n'.join(rows))
open(sys.argv[2], 'w').write(page)
