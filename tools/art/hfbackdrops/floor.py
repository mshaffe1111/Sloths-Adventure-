"""Absolute depth floor for an upright frame (lead, 2026-11-01): top 60% (below the HUD) of the 412x915 shot must have a luminance
std >= 31 (the lowest of the sets the lead approved: 8-8) AND its darkest 10% no brighter than 73 (p10; the W7 courtyard, the
brightest approved): a pale haze can keep its spread but has no dark silhouettes.
    python3 -I tools/art/hfbackdrops/floor.py <shots dir> <stage> ...
"""
import sys
import numpy as np
from PIL import Image
d = sys.argv[1]
for s in sys.argv[2:]:
    im = np.asarray(Image.open(f'{d}/{s}-412x915-b.png').convert('L')).astype(float)
    t = im[int(im.shape[0] * .07):int(im.shape[0] * .6)]
    sd, p10 = t.std(), np.percentile(t, 10)
    print(f'{s}: std {sd:.1f} p10 {p10:.0f} {"PASS" if sd >= 31 and p10 <= 73 else "FAIL"}')
