"""From the native pass to 1-1's game strips (art-1-1-sunrise, 2026-11-05), written to src/assets/backdrops/w1sun2-{far,sky,mid}.webp
(1-1's set: it replaces w1sunrise on 1-1's path, stageBackdrops.ts) and copied to <out dir> so candidates can be swapped in turn.
    python3 -I tools/art/sunrise11/finish.py far <tall-hd.webp> [out dir]           -> <stem>-far (bottom 1302 rows) + <stem>-sky
    python3 -I tools/art/sunrise11/finish.py mid <name> <hd dir> [out dir] [haze]   -> <stem>-mid (keyed/<name>.webp shape, hd paint,
                                                                                       inked, hazed into the far strip now in place)
"""
import importlib.util, os, shutil, subprocess, sys
from pathlib import Path

from PIL import Image

H = Path(__file__).resolve().parent
ROOT = H.parents[2]
BACK = ROOT / 'src/assets/backdrops'
KEYED = ROOT / 'reference/prop-sheets/qa-notes/art-1-1-sunrise/keyed'
PY = sys.executable
# (1-1's own set, w1sun2 (the lead, 11-05 6 PM: 1-3 stays on w1sunrise until its own stills check); STEM= for another)
STEM = os.environ.get('STEM', 'w1sun2')


def mod(p, name):
    spec = importlib.util.spec_from_file_location(name, p)
    m = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(m)
    return m


def save_small(im, p, q=88):
    while True:
        im.save(p, 'WEBP', quality=q, method=6)
        if p.stat().st_size < 250_000 or q <= 60:
            return q
        q -= 6


def far(hd, out=None):
    im = Image.open(hd).convert('RGB')
    Hf = 1302
    f = im.crop((0, im.height - Hf, im.width, im.height))
    if f.width > 4096:
        f = f.resize((4096, round(Hf * 4096 / f.width)), Image.LANCZOS)
    p = BACK / f'{STEM}-far.webp'
    q = save_small(f, p)
    E = int(round(Hf * 0.35 / 16) * 16)
    take = Path('/tmp') / f'sun11-skytake.webp'
    im.crop((0, im.height - Hf - E, im.width, im.height)).save(take, 'WEBP', quality=95)
    subprocess.run([PY, '-I', str(ROOT / 'tools/art/hfbatch/skycut.py'), '--tall', f'{STEM}={take}'], check=True)
    print(p.name, f.size, p.stat().st_size // 1024, 'KB q', q)
    if out:
        Path(out).mkdir(parents=True, exist_ok=True)
        for part in ('far', 'sky'):
            shutil.copy(BACK / f'{STEM}-{part}.webp', Path(out) / f'{STEM}-{part}.webp')


def mid(name, hd, out=None, haze='0.09'):
    hd = Path(hd)
    cutm = mod(ROOT / 'tools/art/hfbatch/striphdcut.py', 'shc')
    tmp = Path('/tmp') / f'sun11-{name}'
    tmp.mkdir(exist_ok=True)
    cutm.cut2(str(KEYED / f'{name}.webp'), str(hd / f'{name}-hd.webp'), str(hd / f'alpha-{name}.webp'), str(tmp / 'cut.webp'),
              str(hd / f'pre-{name}-hd.webp'), 'mix5')
    # (crowns whole, so no top fade: TOPFADE=0, hf-backdrops.md step 3)
    subprocess.run([PY, '-I', str(ROOT / 'tools/art/edges/defringe.py'), str(tmp / 'cut.webp'), str(tmp / 'edge.webp'), '--scale', '1',
                    '--ink', '--px', '1.5'], check=True)
    dst = BACK / f'{STEM}-mid.webp'
    subprocess.run([PY, '-I', str(ROOT / 'tools/art/hfbackdrops/haze.py'), str(tmp / 'edge.webp'), str(BACK / f'{STEM}-far.webp'), str(dst),
                    haze, '0.6'], check=True)
    im = Image.open(dst)
    print(dst.name, im.size, dst.stat().st_size // 1024, 'KB')
    if out:
        Path(out).mkdir(parents=True, exist_ok=True)
        shutil.copy(dst, Path(out) / f'{STEM}-mid.webp')


if __name__ == '__main__':
    c, a = sys.argv[1], sys.argv[2:]
    {'far': lambda: far(*a), 'mid': lambda: mid(*a)}[c]()
