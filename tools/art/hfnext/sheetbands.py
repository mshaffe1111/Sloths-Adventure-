"""ART-SHEETS (R-165.379): the BAND check the lead asked for (a pooled fur mean is fooled by pose shading). Fur px (sheetbody.py mask) split at the
sheet's OWN median L: its light half vs the plain pose's light half, dark vs dark, dE. Sources: git:<rev> (the sheet at that rev) or a path.
    python3 -I tools/art/hfnext/sheetbands.py swim git:4f0853b96 src/assets/hero/pokey-swim.webp
"""
import io, subprocess, sys
sys.path.insert(0, 'tools/art/hfnext'); argv = sys.argv; sys.argv = ['x']
import numpy as np
from PIL import Image
import sheetbody as SB
k = argv[1]; srcs = argv[2:]
PLf = SB.fur(SB.load('src/assets/hero/hero-standard.webp')[478:478 + 209, 674:674 + 127]); med = np.median(PLf[:, 0])
def bands(F):
    # the band split is by RANK within each sheet (its own top half of L = the light fur, the head and face), so a darker sheet's light
    # fur is compared with the plain pose's light fur
    m = np.median(F[:, 0]); return F[F[:, 0] >= m].mean(0), F[F[:, 0] < m].mean(0)
pl, pd = bands(PLf)
print(f'plain light {pl.round(1)} dark {pd.round(1)}')
for s in srcs:
    if s.startswith('git:'):
        im = np.asarray(Image.open(io.BytesIO(subprocess.run(['git', 'show', s[4:] + ':src/assets/hero/' + SB.SHEET[k] + '.webp'], capture_output=True, check=True).stdout)).convert('RGBA')).astype(np.float32)
    else:
        im = SB.load(s)
    F = np.concatenate([SB.fur(im[r['y']:r['y'] + r['h'], r['x']:r['x'] + r['w']]) for n, r in SB.FRAMES[k].items() if not n.startswith('face_')])
    l, d = bands(F)
    print(f'{s:60s} light {l.round(1)} = {np.linalg.norm(l - pl):.2f} dE off plain light | dark {d.round(1)} = {np.linalg.norm(d - pd):.2f} off | pooled {np.linalg.norm(F.mean(0) - PLf.mean(0)):.2f}')
