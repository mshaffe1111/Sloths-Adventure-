"""Start for Venom Fang's painted body strip (AN-7, hf-art-bosses, 2026-10-29): his neck was drawn in code as a stiff tube of strokes.
This lays out a straight run of his own body in the colours the code sampled from Matt's body tile (venomRig.ts COL): the dark outline,
the green back with its highlight, the pale jagged markings, the cream belly with its plates along the bottom. img2img (img2imggpu.py)
paints it; bosscut-venom.py cuts a seamless tile the game lays along the bending spine.
    python3 -I tools/art/hfbosses/venomstart.py <out.webp>
"""
import sys
from PIL import Image, ImageDraw

OUT = sys.argv[1]
W, H = 1536, 256
im = Image.new('RGB', (W, H), (255, 0, 255))
d = ImageDraw.Draw(im)
top, bot = 64, 192
d.rectangle((0, top - 6, W, bot + 6), fill=(29, 18, 16))
d.rectangle((0, top, W, bot), fill=(77, 138, 115))
d.rectangle((0, top + 8, W, top + 20), fill=(93, 156, 131))
belly = top + int((bot - top) * 0.58)
d.rectangle((0, belly, W, bot), fill=(238, 215, 180))
d.rectangle((0, bot - 14, W, bot), fill=(201, 173, 142))
d.line((0, belly, W, belly), fill=(29, 18, 16), width=3)
for x in range(0, W, 34):  # belly plates
    d.line((x, belly + 2, x - 6, bot - 2), fill=(120, 84, 60), width=3)
for x in range(0, W, 128):  # the pale jagged markings along the back
    d.polygon([(x + 10, top + 4), (x + 50, top + 40), (x + 70, top + 18), (x + 110, top + 44), (x + 118, top + 4)], fill=(180, 205, 184))
im.save(OUT, quality=92)
print(OUT)
