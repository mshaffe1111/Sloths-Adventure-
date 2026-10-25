"""after cut.py: the pawprint becomes a print lying in the mud (squashed, soft oval edge); the glows' halos a little lighter"""
import numpy as np
from PIL import Image, ImageFilter, ImageDraw
im = Image.open('cut/pawprint.png').convert('RGBA'); W, H = im.size
c = im.crop((int(W * .10), int(H * .10), int(W * .90), int(H * .93)))
w, h = c.size
mask = Image.new('L', (w, h), 0); ImageDraw.Draw(mask).ellipse((w * .03, h * .03, w * .97, h * .97), fill=255)
mask = mask.filter(ImageFilter.GaussianBlur(w * 0.045))
c.putalpha(Image.fromarray(np.minimum(np.asarray(c.getchannel('A')), np.asarray(mask)).astype(np.uint8)))
c.resize((w, int(h * 0.34)), Image.LANCZOS).save('cut/pawprint.png')
for n in ['glowLit', 'mushrooms']:
    arr = np.asarray(Image.open(f'cut/{n}.png')).astype(float)
    al = arr[..., 3]; arr[..., 3] = np.where(al < 250, al * 0.7, al)
    Image.fromarray(arr.astype(np.uint8), 'RGBA').save(f'cut/{n}.png')
