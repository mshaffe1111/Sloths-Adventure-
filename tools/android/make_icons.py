#!/usr/bin/env python3
"""
The Android app's launcher icons and splash screens (Play Store job, 2026-10-29), made from Pokey's painted face (the HUD portrait,
hero-standard.webp face_happy) on the rainforest green of the web icon. A STAND-IN: the face is 142 px, so the big sizes are upscaled;
Matt's painted icon (a Gemini sheet, reference/PLAY-STORE.md §8) replaces it. Run: python3 tools/android/make_icons.py
"""
import os
from PIL import Image, ImageDraw

ROOT = os.path.join(os.path.dirname(__file__), '..', '..')
RES = os.path.join(ROOT, 'android', 'app', 'src', 'main', 'res')
FACE = Image.open(os.path.join(ROOT, 'src', 'assets', 'hero', 'hero-standard.webp')).convert('RGBA').crop((0, 1685, 142, 1827))
IN, OUT = (22, 101, 52), (6, 31, 18)
BG_HEX = '#0F3D23'
DPI = {'mdpi': 1, 'hdpi': 1.5, 'xhdpi': 2, 'xxhdpi': 3, 'xxxhdpi': 4}

def radial(size):
    im = Image.new('RGB', (size, size))
    px = im.load()
    c = size / 2
    for y in range(size):
        for x in range(size):
            t = min(1.0, (((x - c) ** 2 + (y - c * 0.8) ** 2) ** 0.5) / (size * 0.6))
            px[x, y] = tuple(int(IN[i] + (OUT[i] - IN[i]) * t) for i in range(3))
    return im

def face(px):
    return FACE.resize((px, px), Image.LANCZOS)

def legacy(size, round_=False):
    im = radial(size).convert('RGBA')
    f = face(int(size * 0.8))
    im.alpha_composite(f, ((size - f.width) // 2, int(size * 0.14)))
    if round_:
        m = Image.new('L', (size, size), 0)
        ImageDraw.Draw(m).ellipse((0, 0, size - 1, size - 1), fill=255)
        im.putalpha(m)
    return im

def foreground(size):
    # adaptive icons: 108 dp canvas, the art inside the 66 dp safe circle
    im = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    f = face(int(size * 0.6))
    im.alpha_composite(f, ((size - f.width) // 2, (size - f.width) // 2 + int(size * 0.03)))
    return im

for d, k in DPI.items():
    folder = os.path.join(RES, f'mipmap-{d}')
    legacy(int(48 * k)).save(os.path.join(folder, 'ic_launcher.png'))
    legacy(int(48 * k), True).save(os.path.join(folder, 'ic_launcher_round.png'))
    foreground(int(108 * k)).save(os.path.join(folder, 'ic_launcher_foreground.png'))

# the splash before Android 12 (a full-screen picture): the face on the green, each file at its own size
for root, _, files in os.walk(RES):
    for n in files:
        if n != 'splash.png':
            continue
        p = os.path.join(root, n)
        w, h = Image.open(p).size
        im = Image.new('RGB', (w, h), OUT)
        bg = radial(min(w, h))
        im.paste(bg, ((w - bg.width) // 2, (h - bg.height) // 2))
        f = face(int(min(w, h) * 0.32)).convert('RGBA')
        im = im.convert('RGBA')
        im.alpha_composite(f, ((w - f.width) // 2, (h - f.height) // 2))
        im.convert('RGB').save(p)

# the 512 px store icon (32-bit PNG with alpha), a stand-in until the painted one
legacy(512).save(os.path.join(ROOT, 'reference', 'prop-sheets', 'qa-notes', 'play-store', 'icon-512-standin.png'))
print('icons written; background', BG_HEX)
