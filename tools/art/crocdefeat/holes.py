"""Holes inside a painted creature frame: see-through pixels enclosed by its body (the fault behind Crocus Rex's grey, see-through
defeat card, R-1.1). Prints, per frame, the share of the body's filled outline that is see-through.
  python3 -I tools/art/crocdefeat/holes.py <atlas.webp> <AtlasData.ts> [name-prefix ...]"""
import json, re, sys
import numpy as np
from PIL import Image
from scipy import ndimage

def hole_share(rgba):
    a = np.asarray(rgba)[..., 3]
    solid = a > 128
    if not solid.any(): return 0.0
    outline = ndimage.binary_fill_holes(ndimage.binary_closing(solid, iterations=6))
    return float(((~solid) & outline).sum() / max(1, outline.sum()))

if __name__ == '__main__':
    atlas, data = sys.argv[1], open(sys.argv[2]).read()
    m = re.search(r'Record<string, \w+> = (\{.*?\});', data, re.S)
    fr = json.loads(m.group(1))
    im = Image.open(atlas).convert('RGBA')
    pre = sys.argv[3:]
    for n, f in sorted(fr.items()):
        if pre and not any(n.startswith(p) for p in pre): continue
        print(f'{n:20s} holes {hole_share(im.crop((f["x"], f["y"], f["x"] + f["w"], f["y"] + f["h"]))):.0%}')
