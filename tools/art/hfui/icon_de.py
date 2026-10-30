"""App icon options D and E (Matt, 2026-10-30: "I do like the yellow version the best. And maybe a green and brown that kind of matches
our colors... more brown on the outside and it gets greener as it goes through, with Pokey right in the middle"), from Pokey's OWN
painted story cel (storyHdData_pokey face_happy, src/assets/story/hd/pokey-3.webp), no generation of him:
  D  A's warm gold field
  E  the menu kit's bark brown at the edges to the leaf tokens' green in the middle, with the title's own painted canopy worked in as a
     soft texture (not a flat gradient)
Each: the head spanning 0.6 of the 108 dp icon (the 66 dp safe zone is 0.61), a soft warm glow behind him so he lifts off the field.
512 px PNGs in reference/store/icon-options/, adaptive layers (fg/bg 432) beside them, and the launcher check sheet.
    python3 -I tools/art/hfui/icon_de.py <game checkout> <title square render png>
"""
import sys
from pathlib import Path
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

GAME, SQUARE = Path(sys.argv[1]), Path(sys.argv[2])
OUT = GAME / 'reference/store/icon-options'
OUT.mkdir(parents=True, exist_ok=True)
N = 1024
cel = Image.open(GAME / 'src/assets/story/hd/pokey-3.webp').convert('RGBA').crop((620, 0, 928, 308))
HEAD = (47, 45, 261, 250)   # ear to ear, the tuft to the chin, in the cel
s = 0.6 * N / (HEAD[2] - HEAD[0])
fig = cel.resize((round(cel.width * s), round(cel.height * s)), Image.LANCZOS)
cx, cy = (HEAD[0] + HEAD[2]) / 2 * s, (HEAD[1] + HEAD[3]) / 2 * s
pos = (round(N / 2 - cx), round(N * 0.47 - cy))
fg = Image.new('RGBA', (N, N), (0, 0, 0, 0))
fg.alpha_composite(fig, pos)
# (the cel's chest fades to a grey band at its lower edge: his shoulders fade out cleanly into the field well above it)
chin = pos[1] + HEAD[3] * s
ramp = np.clip(1 - (np.arange(N, dtype=np.float32) - (chin - 0.02 * N)) / (0.09 * N), 0, 1)
a = np.asarray(fg).astype(np.float32)
a[..., 3] *= ramp[:, None]
fg = Image.fromarray(a.astype(np.uint8), 'RGBA')

yy, xx = np.mgrid[0:N, 0:N].astype(np.float32)
r = np.sqrt((xx - N / 2) ** 2 + (yy - N / 2) ** 2) / (N / 2)


def field_gold():
    base = np.array([230, 185, 95], np.float32)
    k = np.clip(1.08 - 0.22 * r, 0.82, 1.08)[..., None]  # (a touch lighter in the middle)
    return Image.fromarray(np.clip(base * k, 0, 255).astype(np.uint8))


def field_bark_leaf():
    leaf = np.array([96, 168, 70], np.float32)    # the leaf tokens' green
    bark = np.array([92, 56, 26], np.float32)     # the menu kit's dark wood
    t = np.clip((r - 0.5) / 0.42, 0, 1) ** 1.2   # (green round him past his head, browning toward the edge the launcher still shows)
    col = leaf * (1 - t[..., None]) + bark * t[..., None]
    # the title's own painted canopy as texture: its light and dark, blurred soft, worked into the field
    tex = Image.open(SQUARE).convert('L').resize((N, N), Image.LANCZOS).filter(ImageFilter.GaussianBlur(6))
    L = np.asarray(tex).astype(np.float32) / 255
    L = (L - L.mean()) / (L.std() + 1e-6)
    col = col * (1 + 0.12 * L[..., None])
    return Image.fromarray(np.clip(col, 0, 255).astype(np.uint8))


def glow(bg, rgb, a):
    g = Image.new('L', (N, N), 0)
    ImageDraw.Draw(g).ellipse((N * 0.2, N * 0.16, N * 0.8, N * 0.78), fill=a)
    out = bg.convert('RGBA')
    out.paste(rgb + (255,), (0, 0), g.filter(ImageFilter.GaussianBlur(70)))
    return out


opts = {'D-gold': glow(field_gold(), (255, 236, 170), 120), 'E-bark-leaf': glow(field_bark_leaf(), (200, 240, 140), 70)}
L_ = Image.new('RGB', (2 * 460 + 20, 480), (30, 30, 30))
d = ImageDraw.Draw(L_)
for i, (k, bg) in enumerate(opts.items()):
    full = bg.copy()
    full.alpha_composite(fg)
    full.convert('RGB').resize((512, 512), Image.LANCZOS).save(OUT / f'{k}-512.png')
    bg.convert('RGB').resize((432, 432), Image.LANCZOS).save(OUT / f'{k}-bg-432.png')
    fg.resize((432, 432), Image.LANCZOS).save(OUT / f'{k}-fg-432.png')
    x = 10 + i * 470
    d.text((x, 4), k, fill=(255, 230, 0))
    L_.paste(full.convert('RGB').resize((200, 200), Image.LANCZOS), (x, 20))
    mid = full.convert('RGB').crop((146, 146, 878, 878))
    for j, sz in enumerate((96, 48)):
        for n, (sh, lightbg) in enumerate((('circle', 0), ('sq', 0), ('circle', 1))):
            m = Image.new('L', (sz, sz), 0)
            md = ImageDraw.Draw(m)
            (md.ellipse if sh == 'circle' else (lambda b, fill: md.rounded_rectangle(b, sz // 4, fill=fill)))((0, 0, sz - 1, sz - 1), fill=255)
            px, py = x + n * 145, 240 + j * 120
            if lightbg:
                L_.paste((235, 235, 235), (px - 10, py - 10, px + 116, py + 110))
            L_.paste(mid.resize((sz, sz), Image.LANCZOS), (px + (96 - sz) // 2, py + (96 - sz) // 2), m)
L_.save(GAME / 'reference/prop-sheets/qa-notes/hf-ui/icon-options-DE.jpg', quality=90)
print('ok')

# ───── the chosen icon (Matt, 2026-10-30: E) into the store and web icons ─────
if len(sys.argv) > 3 and sys.argv[3] == '--use-E':
    bg = opts['E-bark-leaf']
    full = bg.copy()
    full.alpha_composite(fg)
    full = full.convert('RGB')
    ST = GAME / 'reference/store'
    full.resize((512, 512), Image.LANCZOS).save(ST / 'icon-512.png')
    fg.resize((432, 432), Image.LANCZOS).save(ST / 'icon-fg-432.png')
    bg.convert('RGB').resize((432, 432), Image.LANCZOS).save(ST / 'icon-bg-432.png')
    PUB = GAME / 'public'
    # (the icons nothing masks, the web app's, the iPhone's and the tab's, show the middle 72 of the 108 dp, as a launcher would;
    # the maskable one keeps the whole canvas for the system to cut)
    mid = full.crop((146, 146, 878, 878))
    mid.resize((512, 512), Image.LANCZOS).save(PUB / 'pwa-512x512.png')
    mid.resize((192, 192), Image.LANCZOS).save(PUB / 'pwa-192x192.png')
    mid.resize((180, 180), Image.LANCZOS).save(PUB / 'apple-touch-icon.png')
    full.resize((512, 512), Image.LANCZOS).save(PUB / 'pwa-maskable-512x512.png')
    mid.resize((48, 48), Image.LANCZOS).save(PUB / 'favicon-48.png')
    print('icon E in place')
