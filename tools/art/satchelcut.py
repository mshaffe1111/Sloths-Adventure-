"""Key the painted satchel (HF still on flat grey) and pack it for the title leaf: python3 -I tools/art/satchelcut.py <in.png> <out.webp> [px]"""
import sys
import numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage
src, dst = sys.argv[1], sys.argv[2]
px = int(sys.argv[3]) if len(sys.argv) > 3 else 192
im = np.asarray(Image.open(src).convert('RGB')).astype(np.float32)
bg = np.median(np.concatenate([im[:24].reshape(-1, 3), im[-24:].reshape(-1, 3), im[:, :24].reshape(-1, 3), im[:, -24:].reshape(-1, 3)]), axis=0)
d = np.sqrt(((im - bg) ** 2).sum(-1))
sat = im.max(-1) - im.min(-1)
fg = (d > 22) | (sat > 28)
# only grey connected to the border is background (keeps grey shine inside the bag)
lab, n = ndimage.label(~fg)
border = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))) - {0}
# and big enclosed grey holes (inside the strap's loop)
sizes = ndimage.sum(np.ones_like(lab), lab, index=np.arange(1, n + 1))
big = {i + 1 for i, a in enumerate(sizes) if a > 0.004 * lab.size}
bgmask = np.isin(lab, list(border | big))
alpha = (~bgmask).astype(np.float32)
alpha = ndimage.binary_opening(alpha > 0.5, iterations=2).astype(np.float32)
a = Image.fromarray((alpha * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(1.2))
rgba = Image.fromarray(im.astype(np.uint8)).convert('RGBA')
rgba.putalpha(a)
bb = rgba.getbbox()
rgba = rgba.crop(bb)
w, h = rgba.size
s = px / max(w, h)
rgba = rgba.resize((max(1, round(w * s)), max(1, round(h * s))), Image.LANCZOS)
canvas = Image.new('RGBA', (px, px), (0, 0, 0, 0))
canvas.paste(rgba, ((px - rgba.width) // 2, (px - rgba.height) // 2))
canvas.save(dst, 'WEBP', quality=88, method=6)
print(dst, canvas.size)
