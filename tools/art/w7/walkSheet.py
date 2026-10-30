"""Contact sheets for a World 7 walk (tools/art/w7/walk.mjs): every frame of a stage at a quarter size in rows, upright and sideways, and
every wall join's 2x crop in a row under them.
    python3 -I tools/art/w7/walkSheet.py <walk dir> <out dir>
"""
import sys
from pathlib import Path
from PIL import Image, ImageDraw

src, out = Path(sys.argv[1]), Path(sys.argv[2])
out.mkdir(parents=True, exist_ok=True)
for stage in sorted(p for p in src.iterdir() if p.is_dir()):
    for size in ('upright', 'sideways'):
        d = stage / size
        frames = sorted(d.glob('f*.png'))
        joins = sorted(d.glob('join-*.png'))
        if not frames:
            continue
        k = 4
        fw, fh = Image.open(frames[0]).size
        tw, th = fw // k, fh // k
        per = 12 if size == 'upright' else 6
        rows = (len(frames) + per - 1) // per
        jh = 260 if joins else 0
        sheet = Image.new('RGB', (per * tw, rows * th + jh + 30), (24, 24, 24))
        dr = ImageDraw.Draw(sheet)
        dr.text((6, 6), f'{stage.name} {size}: {len(frames)} frames, a frame every half screen; {len(joins)} wall joins at 2x below', fill=(240, 220, 120))
        for i, f in enumerate(frames):
            sheet.paste(Image.open(f).convert('RGB').resize((tw, th)), ((i % per) * tw, 30 + (i // per) * th))
        x = 0
        for j in joins:
            im = Image.open(j).convert('RGB')
            im = im.resize((im.width * jh // max(1, im.height), jh)) if im.height > jh else im
            if x + im.width > sheet.width:
                break
            sheet.paste(im, (x, 30 + rows * th))
            x += im.width + 4
        sheet.save(out / f'{stage.name}-{size}.jpg', quality=80)
        print(out / f'{stage.name}-{size}.jpg', sheet.size)
