"""Bring X-16's batch in (tools/art/hfbatch/make_hdset_spec.py, hdset.sh): the native-resolution far strips, the World 5 mood and World 1
canopy middle and near strips, and the painted sky above each far strip.

    python3 -I tools/art/edges/hdset_in.py <dir with the job's files>

<dir> holds, from the bucket mshaffe111/w5-xfer hfbatch/hdset/: <stem>-far-hd.webp, <name>-hd.webp and pre-<name>-hd.webp and
alpha-<name>.webp for each cut-out (name = w5dusk1-mid, w1c-near, ...), and <stem>-sky.webp.
  far     the repaint as it is (opaque), WebP q92: src/assets/backdrops/<stem>-far.webp
  cut-out cut out the way the native near and mid strips were (striphdcut.py cut2: the sharpened old shape, the start's outline band,
          'paint' for a near strip, 'mix5' for a middle one), then the edge fix on its outer 4 px only (defringe.py --band; World 5 keeps
          its own line, the canopy gets the ink line), the top fade for a middle strip with a solid top (run_all.py TOPFADE)
  sky     tools/art/hfbatch/skycut.py against the new far strip
"""
import importlib.util
import sys
from pathlib import Path

import numpy as np
from PIL import Image

sys.dont_write_bytecode = True
ROOT = Path(__file__).resolve().parents[3]
BACK = ROOT / 'src/assets/backdrops'
HERE = Path(__file__).resolve().parent


def load(name, path):
    spec = importlib.util.spec_from_file_location(name, path)
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


cutmod = load('striphdcut', ROOT / 'tools/art/hfbatch/striphdcut.py')
skycut = load('skycut', ROOT / 'tools/art/hfbatch/skycut.py')
sys.path.insert(0, str(HERE))
from defringe import process  # noqa: E402
from run_all import TOPFADE  # noqa: E402
sys.path.insert(0, str(ROOT / 'tools/art/hfbatch'))
from make_hdset_spec import REDO as REJECTED  # noqa: E402  (the skies that failed review: the far strip covers the view instead)


def main(d, only=None):
    """only: 'cutouts' to redo just the middle and near strips"""
    d = Path(d)
    tmp = d / 'cut'
    tmp.mkdir(exist_ok=True)
    for p in ([] if only == 'cutouts' else sorted(q for q in d.glob('*-far-hd.webp') if not q.name.startswith('pre-'))):
        stem = p.name[:-len('-far-hd.webp')]
        im = Image.open(p).convert('RGB')
        out = BACK / f'{stem}-far.webp'
        im.save(out, 'WEBP', quality=92, method=6)
        print(out.name, im.size, out.stat().st_size // 1024, 'KB')
    for p in sorted(d.glob('*-hd.webp')):
        name = p.name[:-len('-hd.webp')]
        if name.endswith('-far') or name.startswith('pre-'):
            continue
        world, part = name.rsplit('-', 1)
        old = BACK / f'{name}.webp'
        cutp = tmp / f'{name}.webp'
        cutmod.cut2(str(old), str(p), str(d / f'alpha-{name}.webp'), str(cutp), str(d / f'pre-{name}-hd.webp'),
                    'paint' if part == 'near' else 'mix5')
        src = np.asarray(Image.open(cutp).convert('RGBA'))
        w5 = world.startswith('w5')
        px = 1.9 if part == 'near' else 1.5
        out, info = process(src, scale=1, ring=6 if part == 'near' else 4.5, ink=not w5, keep_line=w5, do_despill=True, px=px, band=4,
                            topfade=0.07 if part == 'mid' and world in TOPFADE else 0.0)
        Image.fromarray(out, 'RGBA').save(old, 'WEBP', quality=95, method=6)
        print(old.name, out.shape[1], 'x', out.shape[0], old.stat().st_size // 1024, 'KB', info)
    # (skies only those that passed review: a held-back one is listed in REJECTED, make_hdset_spec.py REDO; five of those got a round 4
    # sky instead, skycut.py --tall PASSED4, which this must not overwrite)
    for p in ([] if only == 'cutouts' else sorted(d.glob('*-sky.webp'))):
        if p.name[:-len('-sky.webp')] in REJECTED:
            continue
        skycut.cut(p.name[:-len('-sky.webp')], str(p))


if __name__ == '__main__':
    main(sys.argv[1], sys.argv[2] if len(sys.argv) > 2 else None)
