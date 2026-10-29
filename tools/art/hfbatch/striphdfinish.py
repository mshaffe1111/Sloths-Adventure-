"""Finish one world's native-resolution strips (VI-2, 2026-10-29): cut the picked takes into src/assets/backdrops-hd/, and write the
review pictures to reference/prop-sheets/qa-notes/hf-art-backdrops/:
  wN-<part>-phone.jpg  the upright phone view (390x844, drawn as the game draws it), old left and new right, two places on the strip
                       (device scale 3 shrunk to 1.5 to keep the file small)
  wN-<part>-zoom.jpg   a 1:1 device-pixel close-up: old | Real-ESRGAN only | the repaint
  wN-<part>-diff.jpg   the whole strip, old above and new below, the six most changed cells boxed
  wN-<part>-seam.jpg   the strip's right end running into its left end (old above, new below), a red tick at the join
    python3 -I tools/art/hfbatch/striphdfinish.py <raw dir> <take>[:<mode>] ...     e.g. <raw> w1-near-s25-7 w1-mid-s25-7:mix5
The cut is striphdcut.py cut2 with the start: 'paint' (the default) is the repaint inside and the Real-ESRGAN start's clean outline on
the outer 5 px; 'mix5' is half the repaint and half the start inside (the mid strips: there the repaint washed out the inner lines).
<raw dir> holds the unpacked takes (<take>.webp, pre-<take>.webp, alpha-<stem>.webp)."""
import os, subprocess, sys
from PIL import Image

R = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
H = os.path.join(R, 'tools/art/hfbatch')
QA = os.path.join(R, 'reference/prop-sheets/qa-notes/hf-art-backdrops')
OUT = os.path.join(R, 'src/assets/backdrops-hd')
os.makedirs(QA, exist_ok=True); os.makedirs(OUT, exist_ok=True)
raw = sys.argv[1]
tmp = os.path.join(raw, 'fin'); os.makedirs(tmp, exist_ok=True)


def run(*a):
    subprocess.run(['python3', '-I', *a], check=True)


for arg in sys.argv[2:]:
    take, _, mode = arg.partition(':')
    mode = mode or 'paint'
    stem = take.split('-s')[0]
    part = stem.rsplit('-', 1)[1]
    old = os.path.join(R, 'src/assets/backdrops', stem + '.webp')
    new = os.path.join(OUT, stem + '.webp')
    run(f'{H}/striphdcut.py', 'cut2', old, f'{raw}/{take}.webp', f'{raw}/alpha-{stem}.webp', new, f'{raw}/pre-{take}.webp', mode)
    run(f'{H}/striphdcut.py', 'seam', new)
    pre = f'{tmp}/pre-{stem}.webp'
    run(f'{H}/striphdcut.py', 'cut2', old, f'{raw}/pre-{take}.webp', f'{raw}/alpha-{stem}.webp', pre)
    fx = {'near': ['0.1', '0.55'], 'mid': ['0.12', '0.6']}[part]
    run(f'{H}/striphdcut.py', 'crops', old, new, part, f'{tmp}/{stem}-phone.jpg', *fx)
    run(f'{H}/striphdcut.py', 'crops', old, pre, part, f'{tmp}/{stem}-phonepre.jpg', *fx)
    im = Image.open(f'{tmp}/{stem}-phone.jpg')
    im.resize((im.width // 2, im.height // 2), Image.LANCZOS).save(f'{QA}/{stem}-phone.jpg', quality=84)
    # the close-up: the painted band of the first place, where the strip has the most going on
    import numpy as np
    a = np.asarray(Image.open(f'{tmp}/{stem}-phone.jpg').convert('L')).astype(float)[60:, :1170]
    rowvar = np.abs(np.diff(a, axis=1)).mean(1)
    y = int(np.argmax(np.convolve(rowvar, np.ones(600), 'valid')))
    box = (285, 60 + y, 885, 60 + y + 600)
    o = Image.open(f'{tmp}/{stem}-phone.jpg').crop(box)
    n = Image.open(f'{tmp}/{stem}-phone.jpg').crop((box[0] + 1194, box[1], box[2] + 1194, box[3]))
    p = Image.open(f'{tmp}/{stem}-phonepre.jpg').crop((box[0] + 1194, box[1], box[2] + 1194, box[3]))
    from PIL import ImageDraw
    z = Image.new('RGB', (1840, 624), (0, 0, 0))
    d = ImageDraw.Draw(z)
    for i, (t, q) in enumerate((('old (on a phone, 3x)', o), ('Real-ESRGAN only', p), ('new: repainted', n))):
        z.paste(q, (i * 620, 24)); d.text((i * 620 + 4, 6), t, fill=(255, 255, 0))
    z.save(f'{QA}/{stem}-zoom.jpg', quality=88)
    run(f'{H}/striphddiff.py', old, new, f'{QA}/{stem}-diff.jpg')
    run(f'{H}/striphdseam.py', old, new, f'{tmp}/{stem}-seam.jpg', '400')
    s = Image.open(f'{tmp}/{stem}-seam.jpg')
    s.resize((s.width // 2, s.height // 2), Image.LANCZOS).save(f'{QA}/{stem}-seam.jpg', quality=85)
    print(stem, os.path.getsize(new), 'bytes')
