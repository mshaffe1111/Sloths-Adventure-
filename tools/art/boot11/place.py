"""Review stills for the boot11 bootprint (2026-11-05): a cut decal composited at its game size onto endshot.mjs's real 1-1 end shots
(upright 412x915 and sideways 915x412 at deviceScaleFactor 2), at world (WX, the walking line + MID_DY), each with a 4x close-up beside
it. A stand-in placement only: engine-core draws the clue in game (gen2 reports its place, w1.ts:594).
    python3 -I tools/art/boot11/place.py <shots dir> <out dir> <name>=<decal webp> ...
"""
import json, sys
from pathlib import Path

from PIL import Image, ImageDraw

shots, out = Path(sys.argv[1]), Path(sys.argv[2])
out.mkdir(parents=True, exist_ok=True)
# the cameras endshot.mjs printed (BACK=260: Pokey at x 37266 on the end bank, top y 722; the door at x 37526)
CAMS = {'up': (37134.0, 184.55, 824 / 440), 'side': (36586.73, 425.0, 1830 / 1199.27)}
# (the decal hangs from the walking line: the bank top is seen edge-on, so anything above the line sits on the background)
WX, LINE = 37392, 722
for arg in sys.argv[3:]:
    name, path = arg.split('=')
    P = Image.open(path).convert('RGBA')
    gw, gh = P.width / 4, P.height / 4
    for o, (cx, cy, k) in CAMS.items():
        im = Image.open(shots / f'end-{o}.png').convert('RGBA')
        w, h = round(gw * k), round(gh * k)
        x, y = round((WX - gw / 2 - cx) * k), round((LINE - 1 - cy) * k)
        im.alpha_composite(P.resize((w, h), Image.LANCZOS), (x, y))
        # the close-up: 4x of the spot, the frame the player sees beside it
        zw, zh = round(w * 2.2), round(h * 3.4)
        zx, zy = x - (zw - w) // 2, y - (zh - h) // 2
        z = im.crop((zx, zy, zx + zw, zy + zh)).resize((zw * 4 // 2, zh * 4 // 2), Image.LANCZOS)
        full = im.convert('RGB')
        full.save(out / f'{name}-{o}.jpg', quality=90)
        z.convert('RGB').save(out / f'{name}-{o}-zoom.jpg', quality=92)
        print(name, o, 'drawn', w, 'x', h, 'device px at', x, y)
