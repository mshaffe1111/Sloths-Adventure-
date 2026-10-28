"""Start pictures for the Gemini characters' Wan clips (2026-10-27): each chosen cut-out cell (transparent PNG) is flipped to face
right if needed and laid on the pipeline's flat grey with room to move, in the clip's own shape, then saved as a small WebP so it
can be put in the bucket through the Hugging Face connector (this machine cannot reach huggingface.co).

    python3 -I tools/art/anim/prep_starts.py <cut dir w5> <cut dir w6> <out dir>

STARTS: name -> (cell, flip, (w, h) of the clip, share of the frame height the figure fills)
"""
import json, sys
from pathlib import Path

from PIL import Image

GREY = (200, 200, 200)
LONG = 448  # long side of the uploaded picture (the job scales it to the clip size; the cells are only ~100-250 px, so 448 keeps all their detail and keeps the base64 upload small)
STARTS = {
    'flicker-hover': ('w5:flicker-08', True, (704, 704), 0.55),
    'flicker-fly': ('w5:flicker-12', True, (704, 704), 0.55),
    'flicker-perch': ('w5:flicker-08', True, (704, 704), 0.5),
    'meeca-carry': ('w5:meeca-carry-06', False, (704, 704), 0.78),
    'meeca-throw': ('w5:meeca-carry-09', False, (704, 704), 0.75),
    'beetle-waddle': ('w5:beetle-02', False, (832, 480), 0.62),
    'beetle-eat': ('w5:beetle-10', True, (832, 480), 0.62),
    'beetle-sleepy': ('w5:beetle-12', True, (832, 480), 0.62),
    'beetle-sleep': ('w5:beetle-16', True, (832, 480), 0.55),
    'butler-walk': ('w5:butler-09', False, (704, 704), 0.78),
    'butler-horror': ('w5:butler-05', False, (704, 704), 0.78),
    'otter-scamper': ('w6:runners-02', False, (832, 480), 0.55),
    'otter-swim': ('w6:runners-11', False, (832, 480), 0.35),
    'otter-jab': ('w6:runners-05', False, (704, 704), 0.75),
    'caiman-snap': ('w6:caiman-items-02', False, (832, 480), 0.45),
}


def make(cell, flip, wh, share, dirs):
    d, n = cell.split(':')
    im = Image.open(Path(dirs[d]) / f'{n}.png').convert('RGBA')
    im = im.crop(im.getbbox())
    if flip:
        im = im.transpose(Image.FLIP_LEFT_RIGHT)
    w, h = wh
    s = min(share * h / im.height, 0.8 * w / im.width)
    im = im.resize((max(1, round(im.width * s)), max(1, round(im.height * s))), Image.LANCZOS)
    c = Image.new('RGBA', (w, h), GREY + (255,))
    c.alpha_composite(im, ((w - im.width) // 2, (h - im.height) // 2))
    k = LONG / max(w, h)
    return c.convert('RGB').resize((round(w * k), round(h * k)), Image.LANCZOS)


if __name__ == '__main__':
    dirs = {'w5': sys.argv[1], 'w6': sys.argv[2]}
    out = Path(sys.argv[3]); out.mkdir(parents=True, exist_ok=True)
    tot = 0
    for name, (cell, flip, wh, share) in STARTS.items():
        p = out / f'{name}.webp'
        im = make(cell, flip, wh, share, dirs)
        im.save(p, 'WEBP', quality=88, method=6)
        if p.stat().st_size > 9000:  # the busy butler cells: a smaller file is easier to put through the connector intact
            im.save(p, 'WEBP', quality=70, method=6)
        tot += p.stat().st_size
        print(name, p.stat().st_size)
    print('total', tot)
    (out / 'starts.json').write_text(json.dumps({k: list(v) for k, v in STARTS.items()}, indent=1))
