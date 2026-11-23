# ENG-27u: read the band scan's shots: the right 24 px strip's mean brightness (rows 15-55% of the height) against the 24 px strip beside it.
# A band: the edge strip near black (< 30) while the strip beside it is not (> 60).   python3 -I bandread27u.py <scan dir>
import sys, os, json
from PIL import Image
d = sys.argv[1]
rows = []
for f in sorted(os.listdir(d)):
    if not f.endswith('.png'): continue
    im = Image.open(os.path.join(d, f)).convert('L'); w, h = im.size
    def mean(x0, x1):
        px = im.crop((x0, int(h * 0.15), x1, int(h * 0.55))).getdata(); return sum(px) / len(px)
    edge, beside = mean(w - 24, w), mean(w - 72, w - 48)
    rows.append({'shot': f, 'edge': round(edge), 'beside': round(beside), 'band': edge < 30 and beside > 60})
for r in rows: print(json.dumps(r))
for stage in ('2-97', '2-7'):
    s = [r for r in rows if r['shot'].startswith(f'scan-{stage}-')]
    print(f'# {stage}: {sum(r["band"] for r in s)} of {len(s)} shots with the band')
