#!/usr/bin/env python3
"""
The Android app's launcher icons and splash screens, from the game's icon E (Matt's pick, 2026-10-30: Pokey's own painted face on
bark brown to leaf green; made by tools/art/hfui/icon_de.py into reference/store/icon-fg-432.png, icon-bg-432.png, icon-512.png):
  mipmap-*/ic_launcher_foreground.png  the adaptive icon's front (108 dp, his head inside the 66 dp safe circle)
  mipmap-*/ic_launcher_background.png  its painted back (108 dp), used by mipmap-anydpi-v26/ic_launcher*.xml
  mipmap-*/ic_launcher.png, _round.png the old-Android icons (48 dp): the launcher's middle of the same picture, rounded square / round
  drawable*/splash.png                 the splash before Android 12: the icon's middle centred on the bark brown
  values/ic_launcher_background.xml    the bark brown (also the Android 12+ splash colour, styles.xml)
Run: python3 tools/android/make_icons.py
"""
import os
from PIL import Image, ImageDraw

ROOT = os.path.join(os.path.dirname(__file__), '..', '..')
RES = os.path.join(ROOT, 'android', 'app', 'src', 'main', 'res')
STORE = os.path.join(ROOT, 'reference', 'store')
FG = Image.open(os.path.join(STORE, 'icon-fg-432.png')).convert('RGBA')
BG = Image.open(os.path.join(STORE, 'icon-bg-432.png')).convert('RGB')
FULL = BG.convert('RGBA')
FULL.alpha_composite(FG)
# (what a launcher shows of the 108 dp canvas: the middle 72 dp)
MID = FULL.crop((62, 62, 370, 370))
BARK = (92, 56, 26)
BG_HEX = '#%02X%02X%02X' % BARK
DPI = {'mdpi': 1, 'hdpi': 1.5, 'xhdpi': 2, 'xxhdpi': 3, 'xxxhdpi': 4}


def legacy(size, round_=False):
    im = MID.resize((size, size), Image.LANCZOS)
    m = Image.new('L', (size, size), 0)
    d = ImageDraw.Draw(m)
    if round_:
        d.ellipse((0, 0, size - 1, size - 1), fill=255)
    else:
        d.rounded_rectangle((0, 0, size - 1, size - 1), round(size * 0.18), fill=255)
    im.putalpha(m)
    return im


for d, k in DPI.items():
    folder = os.path.join(RES, f'mipmap-{d}')
    legacy(int(48 * k)).save(os.path.join(folder, 'ic_launcher.png'))
    legacy(int(48 * k), True).save(os.path.join(folder, 'ic_launcher_round.png'))
    FG.resize((int(108 * k), int(108 * k)), Image.LANCZOS).save(os.path.join(folder, 'ic_launcher_foreground.png'))
    BG.resize((int(108 * k), int(108 * k)), Image.LANCZOS).save(os.path.join(folder, 'ic_launcher_background.png'))

ADAPTIVE = '''<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@mipmap/ic_launcher_background"/>
    <foreground android:drawable="@mipmap/ic_launcher_foreground"/>
</adaptive-icon>
'''
for n in ('ic_launcher.xml', 'ic_launcher_round.xml'):
    with open(os.path.join(RES, 'mipmap-anydpi-v26', n), 'w') as f:
        f.write(ADAPTIVE)
with open(os.path.join(RES, 'values', 'ic_launcher_background.xml'), 'w') as f:
    f.write(f'<?xml version="1.0" encoding="utf-8"?>\n<resources>\n    <color name="ic_launcher_background">{BG_HEX}</color>\n</resources>\n')

# the splash before Android 12 (a full-screen picture): the icon's middle, rounded, centred on the bark brown, each file at its size
for root, _, files in os.walk(RES):
    for n in files:
        if n != 'splash.png':
            continue
        p = os.path.join(root, n)
        w, h = Image.open(p).size
        im = Image.new('RGBA', (w, h), BARK + (255,))
        ic = legacy(int(min(w, h) * 0.36))
        im.alpha_composite(ic, ((w - ic.width) // 2, (h - ic.height) // 2))
        im.convert('RGB').save(p)

print('icons written; background', BG_HEX)
