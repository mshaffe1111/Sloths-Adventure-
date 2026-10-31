"""World 10's pressure plate, the start for img2img (2026-10-29, branch gen2-w10-swing; the lead: the kit's plate read as a flat grey
slab): the kit's own stone plate (props-made/w10a 'plate-up') set in a dark iron frame, twice side by side: raised (left) and pressed
down flush with the frame (right), on flat magenta, 1024 x 384.
    python3 tools/art/hfbatch/w10platestart.py  -> tools/art/hfbatch/starts/start-w10plate.webp
"""
from pathlib import Path
from PIL import Image, ImageDraw

R = Path(__file__).resolve().parents[3]
sheet = Image.open(R / 'src/assets/w6to10/props-made/w10a.webp').convert('RGBA')
top = sheet.crop((616 + 90, 0, 616 + 300, 40)).resize((300, 70), Image.LANCZOS)
out = Image.new('RGBA', (1024, 384), (255, 0, 255, 255))
d = ImageDraw.Draw(out)
for k, (x0, lift) in enumerate([(70, 46), (580, 6)]):
    # (the iron frame: a low dark box with a lighter lip, rivets)
    d.rounded_rectangle((x0, 220, x0 + 380, 300), 10, fill=(52, 50, 58, 255), outline=(20, 18, 24, 255), width=6)
    d.rectangle((x0 + 14, 214, x0 + 366, 230), fill=(84, 82, 92, 255), outline=(20, 18, 24, 255), width=4)
    for rx in (x0 + 30, x0 + 190, x0 + 350):
        d.ellipse((rx - 8, 258, rx + 8, 274), fill=(120, 118, 128, 255), outline=(20, 18, 24, 255), width=3)
    # (the stone slab, raised over the frame or sunk into it)
    out.alpha_composite(top, (x0 + 40, 222 - lift - 40 + 10))
dst = Path(__file__).resolve().parent / 'starts/start-w10plate.webp'
out.convert('RGB').save(dst, quality=95)
print(dst)
