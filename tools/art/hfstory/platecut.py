"""Finish the story plates and clean the two Gemini story sheets (HF shopping list row 9, 2026-10-30):

  src/assets/story/plates/raft.webp     #19 the village building the raft (World 2, halfway): hfstory1 plate-raft-s55-23, to 2560 x 2720
  src/assets/story/plates/gorge.webp    #20 Dot holding on to Pokey's claw over the gorge (World 4, Act II): hfstory2's pick, the same
  src/assets/w6to10/gemini/story21-dot-flour.webp   #21: the loose flour puffs (they took the key's pink) to flour white
  src/assets/w6to10/gemini/story18-squirrels.webp   #18: the white sticker rim round each piece peeled off
  reference/prop-sheets/qa-notes/hf-story/review-*.jpg

    python3 -I tools/art/hfstory/platecut.py <takes dir> <game checkout> [gorge pick]
"""
import sys
from pathlib import Path
import numpy as np
from PIL import Image, ImageFilter

T, G = Path(sys.argv[1]), Path(sys.argv[2])
GORGE = sys.argv[3] if len(sys.argv) > 3 else None
QA = G / 'reference/prop-sheets/qa-notes/hf-story'
QA.mkdir(parents=True, exist_ok=True)
PL = G / 'src/assets/story/plates'
for name, pick in (('raft', 'plate-raft-s55-23'), ('gorge', GORGE)):
    if not pick:
        continue
    im = Image.open(T / f'{pick}.webp').convert('RGB').resize((2560, 2720), Image.LANCZOS)
    im.save(PL / f'{name}.webp', 'WEBP', quality=84, method=6)
    im.resize((640, 680), Image.LANCZOS).save(QA / f'review-{name}.jpg', quality=88)
    print(name, (PL / f'{name}.webp').stat().st_size)

GM = G / 'src/assets/w6to10/gemini'
# #21 Dot in flour: the loose puffs (islands apart from her body) took the key's pink: every small island to a warm flour white
from scipy import ndimage
dot = Image.open(GM / 'story21-dot-flour.webp').convert('RGBA')
a = np.asarray(dot).astype(np.float32)
lab, n = ndimage.label(a[..., 3] > 20)
sizes = ndimage.sum(np.ones(lab.shape), lab, range(1, n + 1))
small = np.isin(lab, 1 + np.flatnonzero(sizes < sizes.max() * 0.04))
L = a[..., :3].mean(axis=2)
for c, k in ((0, 1.0), (1, 0.98), (2, 0.95)):
    a[..., c] = np.where(small, np.clip(L * 0.35 + 165 * k, 0, 255), a[..., c])
Image.fromarray(a.astype(np.uint8), 'RGBA').save(GM / 'story21-dot-flour.webp', 'WEBP', quality=90, method=6)
# #18 the squirrels: the white sticker rim peeled off, a pixel at a time from the outside, until the dark outline is reached
sq = np.asarray(Image.open(GM / 'story18-squirrels.webp').convert('RGBA')).copy()
rgb = sq[..., :3].astype(int)
white = (rgb.min(axis=2) > 150) & (rgb.max(axis=2) - rgb.min(axis=2) < 46)  # the rim: pale and grey-white, never his cream fur
for _ in range(18):
    clear = sq[..., 3] < 40
    edge = ndimage.binary_dilation(clear) & ~clear & white
    if not edge.any():
        break
    sq[..., 3][edge] = 0
# specks of the rim left standing alone go too, then a soft one-pixel edge on what is left
solid = ndimage.binary_opening(sq[..., 3] > 40, iterations=2)
lab, n = ndimage.label(solid)
sizes = ndimage.sum(np.ones(lab.shape), lab, range(1, n + 1))
keep = np.isin(lab, 1 + np.flatnonzero(sizes > 400))
sq[..., 3] = np.where(keep, sq[..., 3], 0)
al = Image.fromarray(sq[..., 3]).filter(ImageFilter.GaussianBlur(0.6))
sqi = Image.fromarray(sq, 'RGBA')
sqi.putalpha(al)
sqi.save(GM / 'story18-squirrels.webp', 'WEBP', quality=90, method=6)
for n in ('story21-dot-flour', 'story18-squirrels'):
    im = Image.open(GM / f'{n}.webp').convert('RGBA')
    S = Image.new('RGBA', (im.width, im.height * 2), (24, 20, 28, 255))
    S.paste((128, 128, 128, 255), (0, im.height, im.width, im.height * 2))
    S.alpha_composite(im, (0, 0)); S.alpha_composite(im, (0, im.height))
    S.convert('RGB').resize((S.width // 2, S.height // 2), Image.LANCZOS).save(QA / f'review-{n}.jpg', quality=88)
print('ok')
