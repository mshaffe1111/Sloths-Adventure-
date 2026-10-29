#!/usr/bin/env python3
"""
The clean-sweep report: every walk's findings (seams.py) grouped by cause, each cause with an owner, a crop and the stages it is in.

  python3 tools/inspect/sweepReport.py WALKDIR [WALKDIR ...] --out reference/polish-report/CLEAN-SWEEP.md [--crops DIR]

A cause is a picture file, or the function that drew a code-made canvas, or a code colour, so one bad ground tile is one line however
many spots it makes. Owners follow the lead's routing (the polish-clean brief, 2026-10-29): polish-edges has the backdrop strips,
hf-art-ground soil and dressing, hf-art-stage gates, water, flags and pickups, hazard-anim repeating effects; the rest is
polish-clean's.
"""
import argparse
import json
import os
import re
import shutil
import sys
from collections import defaultdict

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from seams import postfilter  # noqa: E402

STRIP = re.compile(r'(^|[-_/])(far|mid|near|sky|strip|backdrop)([-_.]|$)|w\dc-|sunrise|kapok|rapids|evening|cavern|sinkhole|terraces|-mist|dawn|dusk|twi\d|gold\d', re.I)

# (owner, family, test on the finding) in order: the first that matches wins
RULES = [
    ('polish-edges', 'Backdrop strips: edges, halos, key colour, joins', lambda f, c, n: bool(STRIP.search(n)) and f['kind'] in ('fringe', 'key', 'line', 'repeat', 'style')),
    ('hazard-anim', 'Repeating effects drawn in code (lightning, rain, sparks, dust)', lambda f, c, n: f['kind'] == 'shape' and re.search(r'#ffffff|lightning|bolt|rain|spark|dust|grit', c, re.I) and f['sub'] in ('code line', 'dashed line')),
    ('hf-art-stage', 'Checkpoint flag, exit gates, water and pickups drawn in code', lambda f, c, n: f['kind'] == 'shape' and re.search(r'#e5e7eb|#9ca3af|#fde047|water|gate|door|flag', c, re.I)),
    ('hf-art-stage', 'Water pieces (joins, repeats, blow-up)', lambda f, c, n: re.search(r'water', n, re.I) is not None),
    ('hf-art-ground', 'Ground drawn in code: soil, caps, strata, roots, columns, shafts', lambda f, c, n: re.search(r'paint(Soil|Strata|GrassCap|MossCap|ReedCap|AshCap|RuinCap|StoneCap|Roots|Overhang|Lip|Bank)|tileCanvas|drawColumn|shaftPattern|groundTiles|getSoil|soil', c + n, re.I) is not None),
    ('hf-art-ground', 'Ground outline strokes and fills drawn in code', lambda f, c, n: f['kind'] in ('shape', 'line') and re.search(r'#3b1f0c|#14100a|#331c0f|#291b10|#24170c|#282018|#655441|#2d302d|#0d0a12|code rect grad:lin', c) is not None),
    ('hf-art-ground', 'Ground and dressing pieces: tile joins, repeats, cut edges, floating dressing', lambda f, c, n: re.search(r'^w\d+(-props|-kit)?\.webp|props\d?-atlas|dress|flowers-atlas|plants-atlas|w\d+-ground|soil|lip', n) is not None and f['kind'] in ('line', 'repeat', 'float', 'style', 'shape')),
]


def owner_of(f):
    c = f.get('cause', '')
    n = (f.get('piece') or {}).get('n') or ''
    n = re.sub(r'-[A-Za-z0-9_]{8}\.(webp|png)$', r'.\1', n)
    for own, fam, test in RULES:
        try:
            if test(f, c, n):
                return own, fam
        except Exception:
            continue
    return 'polish-clean', {
        'fringe': 'Halos and dark rings on cut-out sheets (the cut-out pipeline)',
        'key': 'Key colour left on cut-out sheets (the cut-out pipeline)',
        'shape': 'Other code-drawn shapes still showing',
        'line': 'Other hard lines',
        'repeat': 'Other copy-paste repeats',
        'style': 'Pieces drawn far blurrier or sharper than their neighbours',
        'float': 'Floating props',
        'hud': 'HUD and text cut off or overlapping',
    }.get(f['kind'], 'Other')


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('dirs', nargs='+')
    ap.add_argument('--out', required=True)
    ap.add_argument('--crops', help='folder for the crops (default: next to --out, clean-sweep/)')
    ap.add_argument('--title', default='Clean sweep: every stage walked both ways, findings by cause')
    a = ap.parse_args()
    crops = a.crops or os.path.join(os.path.dirname(a.out), 'clean-sweep')
    os.makedirs(crops, exist_ok=True)
    finds, walks = [], []
    for root in a.dirs:
        for sid in sorted(os.listdir(root)):
            for o in ('up', 'side'):
                wd = os.path.join(root, sid, o)
                if not os.path.exists(os.path.join(wd, 'seams.json')):
                    continue
                w = json.load(open(os.path.join(wd, 'walk.json')))
                w['_dir'] = wd
                walks.append(w)
                byframe = defaultdict(list)
                for f in json.load(open(os.path.join(wd, 'seams.json'))):
                    f['_root'] = root
                    byframe[f['frame']].append(f)
                # (walks read before the block-joint filter get it here)
                for fr, fs in byframe.items():
                    finds += postfilter(fs)
    causes = defaultdict(list)
    for f in finds:
        causes[(f['kind'], f['sub'], f['cause'])].append(f)
    fams = defaultdict(list)
    for k, fs in causes.items():
        own, fam = owner_of(fs[0])
        fams[(own, fam)].append((k, fs))
    order = ['polish-clean', 'polish-edges', 'hf-art-ground', 'hf-art-stage', 'hazard-anim']
    per = defaultdict(lambda: defaultdict(int))
    for f in finds:
        per[(f['stage'], f['orient'])][owner_of(f)[0]] += 1
    L = [f'# {a.title}', '',
         f"{len(walks)} walks ({len({w['id'] for w in walks})} stages), {sum(len(w['frames']) for w in walks)} frames, "
         f"{len(finds)} findings (one per cause per frame), {len(causes)} causes in {len(fams)} groups.", '',
         'Counts are frames where the cause shows; "spots" adds up every place in those frames. Crops: `clean-sweep/`.', '']
    for own in order + sorted({o for o, _ in fams} - set(order)):
        groups = [(fam, items) for (o, fam), items in fams.items() if o == own]
        if not groups:
            continue
        L += [f'## {own}', '']
        groups.sort(key=lambda g: -sum(len(fs) for _, fs in g[1]))
        for fam, items in groups:
            n = sum(len(fs) for _, fs in items)
            st = sorted({f['stage'] for _, fs in items for f in fs}, key=lambda s: [int(x) if x.isdigit() else 99 for x in re.split(r'-', s)])
            L += [f'### {fam}', '', f'{n} frames in {len(st)} stages: {", ".join(st)}', '']
            items.sort(key=lambda it: -len(it[1]))
            for (kind, sub, cause), fs in items[:25]:
                spots = sum(f.get('spots', 1) for f in fs)
                stg = sorted({f['stage'] for f in fs})
                ori = sorted({f['orient'] for f in fs})
                ex = next((f for f in sorted(fs, key=lambda f: -f.get('spots', 1)) if f.get('crop')), None)
                link = ''
                if ex:
                    slug = re.sub(r'[^A-Za-z0-9]+', '_', f'{kind}_{sub}_{cause}')[:80]
                    dst = os.path.join(crops, slug + '.jpg')
                    try:
                        shutil.copy(os.path.join(ex['_root'], ex['crop']), dst)
                        link = f" [crop]({os.path.relpath(dst, os.path.dirname(a.out))}) ({ex['stage']} {ex['orient']} frame {ex['frame']}, x {ex.get('x_world', '?')})"
                    except OSError:
                        pass
                    if ex.get('proof'):
                        pdst = os.path.join(crops, slug + '-proof.jpg')
                        try:
                            shutil.copy(os.path.join(ex['_root'], ex['proof']), pdst)
                            link += f" [file proof]({os.path.relpath(pdst, os.path.dirname(a.out))})"
                        except OSError:
                            pass
                L.append(f"- **{kind} / {sub}**: {cause}: {len(fs)} frames, {spots} spots, {len(stg)} stages ({', '.join(stg[:10])}{'...' if len(stg) > 10 else ''}), {'/'.join(ori)}.{link}")
            if len(items) > 25:
                L.append(f'- ... and {len(items) - 25} smaller causes of the same kind ({sum(len(fs) for _, fs in items[25:])} frames).')
            L.append('')
    L += ['## Count per stage (frames with a finding, by owner)', '', '| stage | ' + ' | '.join(order) + ' | all |', '|---|' + '---|' * (len(order) + 1)]
    key = lambda s: [int(x) if x.isdigit() else 99 for x in re.split(r'-', s[0])] + [s[1]]
    for k in sorted(per, key=key):
        L.append(f"| {k[0]} {k[1]} | " + ' | '.join(str(per[k].get(o, 0)) for o in order) + f" | {sum(per[k].values())} |")
    open(a.out, 'w').write('\n'.join(L) + '\n')
    json.dump({f"{s} {o}": dict(v) for (s, o), v in per.items()}, open(os.path.splitext(a.out)[0] + '-counts.json', 'w'), indent=1)
    print(f'{len(finds)} findings, {len(causes)} causes -> {a.out}')


if __name__ == '__main__':
    main()
