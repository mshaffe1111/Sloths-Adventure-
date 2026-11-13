# P-10-b: after the unmix the waterfall's lower half and splash keep a violet cast (blue water plus leftover magenta). Water is
# blue to cyan: pixels whose hue sits in violet (212-330 deg) are turned to the waterfall's own blue (205 deg), brightness and
# saturation kept.
import sys; ROOT = sys.argv[1]; sys.path.insert(0, ROOT + '/pylib')
import numpy as np
from PIL import Image
f = f'{ROOT}/artcut/pieces/P-10-b.png'; im = Image.open(f); al = np.asarray(im)[..., 3]
hsv = np.asarray(im.convert('RGB').convert('HSV')).astype(np.float32).copy()
h = hsv[..., 0] * 360 / 255
k = (h > 212) & (h < 330) & (hsv[..., 1] > 8) & (al > 0)
hsv[..., 0] = np.where(k, 205 * 255 / 360, hsv[..., 0]); print('violet px moved to blue', int(k.sum()))
rgb = np.asarray(Image.fromarray(hsv.astype(np.uint8), 'HSV').convert('RGB'))
Image.fromarray(np.dstack([rgb, al]), 'RGBA').save(f, compress_level=6)
