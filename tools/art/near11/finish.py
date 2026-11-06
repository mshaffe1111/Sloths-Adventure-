"""From the native pass to 1-1's new near strip (art director, 2026-11-06), the same steps as tools/art/sunrise11/finish.py mid, with
the near's numbers from reference/methods/hf-backdrops.md (ink --px 2 for a near, haze 0.08 into the far strip's light).
    python3 -I tools/art/near11/finish.py <keyed name> <hd dir> <out.webp> [haze]
The far strip it hazes into is src/assets/backdrops/w1sun2-far.webp (1-1's set, from art-1-1-sunrise-2).
"""
import importlib.util, subprocess, sys
from pathlib import Path

from PIL import Image

H = Path(__file__).resolve().parent
ROOT = H.parents[2]
KEYED = ROOT / 'reference/prop-sheets/qa-notes/near11/keyed'
PY = sys.executable


def mod(p, name):
    spec = importlib.util.spec_from_file_location(name, p)
    m = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(m)
    return m


def near(name, hd, out, haze='0.08'):
    hd = Path(hd)
    cutm = mod(ROOT / 'tools/art/hfbatch/striphdcut.py', 'shc')
    tmp = Path('/tmp') / f'near11-{name}'
    tmp.mkdir(exist_ok=True)
    cutm.cut2(str(KEYED / f'{name}.webp'), str(hd / f'{name}-hd.webp'), str(hd / f'alpha-{name}.webp'), str(tmp / 'cut.webp'),
              str(hd / f'pre-{name}-hd.webp'), 'mix5')
    subprocess.run([PY, '-I', str(ROOT / 'tools/art/edges/defringe.py'), str(tmp / 'cut.webp'), str(tmp / 'edge.webp'), '--scale', '1',
                    '--ink', '--px', '2'], check=True)
    subprocess.run([PY, '-I', str(ROOT / 'tools/art/hfbackdrops/haze.py'), str(tmp / 'edge.webp'),
                    str(ROOT / 'src/assets/backdrops/w1sun2-far.webp'), str(out), haze, '0.6'], check=True)
    im = Image.open(out)
    print(Path(out).name, im.size, Path(out).stat().st_size // 1024, 'KB')


if __name__ == '__main__':
    near(*sys.argv[1:])
