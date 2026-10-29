"""Before / after sheets for the boss art batch (hf-art-bosses): for each fight and view, the same moments of the before/ and after/
shots (bossshots.mjs, introshots.mjs) in two labelled rows.
    python3 -I tools/art/hfbosses/compare.py <qa dir>
"""
import sys
from pathlib import Path
from PIL import Image, ImageDraw

QA = Path(sys.argv[1])
SETS = [(f'{b}-10', v, ['01', '03', '05', '07', '09', '11']) for b in range(1, 6) for v in ('up', 'side')]
SETS += [('5-10', v, ['1200', '2000', '3000', '4500']) for v in ('up', 'side')]
SETS += [('4-D', v, ['00', '01', '02']) for v in ('up', 'side')] + [('5-M', v, ['600', '1200', '2000', '3000']) for v in ('up', 'side')]
out = QA / 'compare'
out.mkdir(exist_ok=True)
for lv, view, ks in SETS:
    rows = []
    for tag, d in (('before', 'before'), ('after', 'after')):
        ims = []
        for k in ks:
            p = QA / d / f'{tag[0]}-{lv}-{view}-{k}.jpg'
            ims.append(Image.open(p).convert('RGB') if p.exists() else None)
        rows.append((tag, ims))
    s = 0.5
    w, h = (195, 422) if view == 'up' else (422, 195)
    if not any(im for _, ims in rows for im in ims):
        continue
    S = Image.new('RGB', (len(ks) * (w + 4), 2 * (h + 22)), (40, 40, 40))
    d = ImageDraw.Draw(S)
    for r, (tag, ims) in enumerate(rows):
        d.text((4, r * (h + 22) + 4), f'{lv} {view} {tag}', fill=(255, 230, 0))
        for i, im in enumerate(ims):
            if im:
                S.paste(im.resize((w, h), Image.LANCZOS), (i * (w + 4), r * (h + 22) + 20))
    name = f'{lv}-{view}' + ('-entrance' if lv == '5-10' and ks[0] == '1200' else '')
    S.save(out / f'{name}.jpg', quality=84)
    print(name)
