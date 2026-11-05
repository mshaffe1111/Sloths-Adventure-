"""Review stills for the W6 wetLeaves remake (2026-11-05): the real game where the piece is laid (6-4's start bank, x 433, flipped;
shots by tools/art/hfbatch/bootshot.mjs STAGE=6-4 BACK=-330, before on the old build and after on the new one), upright and sideways,
each with a 3x close-up of the piece (found as the box where before and after differ), and a contact sheet of the round's takes.
    python3 -I tools/art/hfprops/wetreview.py <shots dir> <takes sheet jpg> <out dir> [shot prefix, default w64] [label]
(the W6 stakeLantern remake uses it too: prefix ln64, label w6StakeLantern; shots STAGE=6-4 BACK=-560, the lantern at x 704)
"""
import sys
from pathlib import Path
import numpy as np
from PIL import Image, ImageDraw, ImageChops

shots, sheet, out = Path(sys.argv[1]), sys.argv[2], Path(sys.argv[3])
PRE = sys.argv[4] if len(sys.argv) > 4 else 'w64'
LABEL = sys.argv[5] if len(sys.argv) > 5 else 'w6WetLeaves'
out.mkdir(parents=True, exist_ok=True)
BANK = {'upright': 505, 'sideways': 225}   # (the 6-4 start bank's top line on screen in these shots)
for tag in ('upright', 'sideways'):
    pair = []
    for when in ('before', 'after'):
        pair.append(Image.open(shots / f'{PRE}-{when}-{tag}.png').convert('RGB'))
    d = np.asarray(ImageChops.difference(*pair).convert('L')) > 24
    # (the piece: the biggest difference cluster in the band just over the bank line, where it stands; the fireflies and the
    # petal pickup bob between shots)
    line = BANK[tag]
    d[:line - 70] = False
    d[line + 12:] = False
    from scipy import ndimage
    lab, n = ndimage.label(ndimage.binary_dilation(d, iterations=3))
    k = 1 + int(np.argmax(ndimage.sum(d, lab, range(1, n + 1))))
    ys, xs = np.nonzero(lab == k)
    cx, cy = int(xs.mean()), int(ys.mean())
    box = (cx - 60, cy - 40, cx + 60, cy + 30)
    for when, im in zip(('before', 'after'), pair):
        im2 = im.copy()
        z = im.crop(box).resize((360, 210), Image.LANCZOS)
        ox, oy = (im.width - 370, im.height - 220)
        dr = ImageDraw.Draw(im2)
        dr.rectangle((ox - 3, oy - 3, ox + 362, oy + 212), fill=(255, 255, 255))
        im2.paste(z, (ox, oy))
        dr.rectangle(box, outline=(255, 255, 0))
        dr.text((8, im.height - 16 if tag == 'upright' else 110), f'{LABEL} {when.upper()}', fill=(255, 255, 0))
        im2.save(out / f'{when}-{tag}.jpg', quality=90)
    print(tag, 'piece near', cx, cy)
S = Image.open(sheet).convert('RGB')
S.save(out / 'contact-takes.jpg', quality=88)
