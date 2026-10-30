import sys, numpy as np, cv2
from PIL import Image
def clean(path, out, box, thr, preview):
    im = np.array(Image.open(path).convert('RGBA'))
    x0, y0, x1, y1 = box
    reg = im[y0:y1, x0:x1].copy()
    rgb = reg[..., :3].astype(np.uint8)
    lum = cv2.cvtColor(rgb, cv2.COLOR_RGB2GRAY).astype(np.int16)
    base = cv2.medianBlur(lum.astype(np.uint8), 21).astype(np.int16)
    mask = ((lum - base) > thr) & (reg[..., 3] > 250)
    # keep only the body: dark pixels' surroundings (the word sits on the near-black belly)
    dark = cv2.erode((base < 70).astype(np.uint8), np.ones((5, 5), np.uint8)) > 0
    mask = mask & dark
    mask = cv2.dilate(mask.astype(np.uint8) * 255, np.ones((5, 5), np.uint8))
    # what the fill may borrow from: the invisible pixels round the bird are given the belly's own colour first
    src = rgb.copy()
    body = (reg[..., 3] > 250) & dark & (mask == 0)
    src[reg[..., 3] <= 250] = np.median(rgb[body], axis=0).astype(np.uint8)
    fixed = cv2.inpaint(cv2.cvtColor(src, cv2.COLOR_RGB2BGR), mask, 4, cv2.INPAINT_TELEA)
    reg[..., :3] = np.where(mask[..., None] > 0, cv2.cvtColor(fixed, cv2.COLOR_BGR2RGB), rgb)
    new = im.copy(); new[y0:y1, x0:x1] = reg
    Image.fromarray(new).save(out, 'WEBP', quality=int(sys.argv[2]), method=6)
    # preview: before / mask / after on the warm backdrop, 3x
    def comp(a):
        bg = np.zeros_like(a); bg[..., :3] = (200, 90, 70); bg[..., 3] = 255
        al = a[..., 3:4] / 255.0
        return (a[..., :3] * al + bg[..., :3] * (1 - al)).astype(np.uint8)
    pad = 30
    A = comp(im[y0 - pad:y1 + pad, x0 - pad:x1 + pad]); B = comp(np.array(Image.open(out).convert('RGBA'))[y0 - pad:y1 + pad, x0 - pad:x1 + pad])
    M = np.zeros_like(A); M[pad:-pad, pad:-pad] = mask[..., None]
    Image.fromarray(np.vstack([A, M, B])).resize((A.shape[1] * 3, A.shape[0] * 9), Image.NEAREST).save(preview)
    print(path, 'masked px', int((mask > 0).sum()))
mode = sys.argv[1]
S = sys.argv[3]
if mode == 'atlas': clean(S + '/eagle-atlas.orig.webp', 'src/assets/enemies/eagle-atlas.webp', (683 + 80, 326 + 140, 683 + 205, 326 + 185), int(sys.argv[4]), S + '/dewm-atlas.png')
else: clean(S + '/eagle-anim.orig.webp', 'src/assets/enemies/eagle-anim.webp', (1040 + 130, 470 + 215, 1040 + 300, 470 + 275), int(sys.argv[4]), S + '/dewm-anim.png')
