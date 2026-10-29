"""Rebuild every cut-out backdrop strip through defringe.py, from its pinned source in git (repeatable: same input every time).

    python3 -I tools/art/edges/run_all.py [--clean] [--only w1-near,w5dusk2-mid] [--out DIR]

--clean   no ink line (the comparison take); the default draws it (see README.md for why)
--out     write somewhere else than src/assets/backdrops (for comparisons)

Each source is first made seamless with A1's join (scripts/strip-seamless.py, VI-4), then cleaned: seamless first, so the edge
fix also cleans any edge the join makes. A new strip: add a row to RECIPES with the commit that holds its keyed source, then run this. Far strips are opaque and need none."""
import argparse
import importlib.util
import subprocess
import sys
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
BACK = 'src/assets/backdrops'

# (stems, source commit, defringe options). The commit is the strip as it was before any upscaler or fix touched it.
ORIG_1024 = ['--scale', '2', '--esrgan', '--q', '90']  # the 1024 px paintings, enlarged 2x (as 18bedcc did, minus the black)
RECIPES = [
    (['w1', 'w2', 'w3', 'w4', 'w6', 'w7', 'w10'], '18bedcc^', ORIG_1024 + ['--ink']),
    # Matt's World 8 and 9 strips, 2800 px: sharpened through the model at the same size (as 8687ee6 did, minus the black)
    (['w8', 'w9'], '9f2dbfe', ['--scale', '1', '--esrgan', '--ring', '2', '--q', '90', '--ink']),
    # World 1's canopy, keyed off white: un-mix the white halo, clear the leftover key in the sky
    (['w1c'], '31c243f', ['--scale', '1', '--ring', '3', '--unveil', '3', '--unmix', '252,252,252', '--q', '82', '--ink']),
    # World 5 (Gemini, 2048 px): its outline is a clean painted ink line, kept; only the magenta spill and the black under the
    # cut (which lossy WebP smears into the edge) are fixed
    (['w5', 'w5gold2', 'w5dusk1', 'w5dusk2', 'w5twi1', 'w5twi2'], '8c1f0ab', ['--scale', '1', '--keep-line', '--despill', '--q', '82']),
    (['w5night'], '1baf7ca', ['--scale', '1', '--keep-line', '--despill', '--q', '82']),
]


# one-off fixes on a source before anything else: w5dusk2-near's unkeyed background panels (unpanel.py)
PRE = {'w5dusk2-near': 'unpanel'}


def seamless(src, dst):
    """VI-4 first (the lead, 2026-10-29: seamless, then the edge fix): A1's join from scripts/strip-seamless.py, on the source,
    kept lossless for the edge fix. The clear margin and the soft rim columns are cut off both ends, then the last band joined onto
    the first along the seam where the two look most alike"""
    spec = importlib.util.spec_from_file_location('ss', ROOT / 'scripts' / 'strip-seamless.py')
    ss = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(ss)
    import numpy as np
    from PIL import Image
    a = np.asarray(Image.open(src).convert('RGBA')).astype(float)
    l, r = ss.painted_cols(a)
    k = a.shape[1] / 2048
    rim, band = round(ss.RIM * k), round(ss.BAND * k)
    a = a[:, l + rim:r - rim]
    a[..., 3] /= 255
    out = ss.bs.seamless(a, band)
    px = np.dstack([np.clip(out[..., :3], 0, 255), np.clip(out[..., 3] * 255, 0, 255)]).round().astype(np.uint8)
    Image.fromarray(px, 'RGBA').save(dst)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--clean', action='store_true')
    ap.add_argument('--only', default='')
    ap.add_argument('--out', default=str(ROOT / BACK))
    o = ap.parse_args()
    only = set(filter(None, o.only.split(',')))
    out = Path(o.out)
    out.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory() as tmp:
        for stems, rev, opts in RECIPES:
            for stem in stems:
                for part in ('mid', 'near'):
                    name = f'{stem}-{part}'
                    if only and name not in only:
                        continue
                    src = Path(tmp) / f'{name}.webp'
                    src.write_bytes(subprocess.run(['git', 'show', f'{rev}:{BACK}/{name}.webp'], cwd=ROOT, check=True,
                                                   capture_output=True).stdout)
                    args = [a for a in opts if not (o.clean and a == '--ink')]
                    if name in PRE:
                        spec = importlib.util.spec_from_file_location(PRE[name], Path(__file__).with_name(f'{PRE[name]}.py'))
                        mod = importlib.util.module_from_spec(spec)
                        spec.loader.exec_module(mod)
                        import numpy as np
                        from PIL import Image
                        fixed = Path(tmp) / f'{name}-pre.png'
                        Image.fromarray(getattr(mod, PRE[name])(np.asarray(Image.open(src).convert('RGBA'))), 'RGBA').save(fixed)
                        src = fixed
                    joined = Path(tmp) / f'{name}-seamless.png'
                    seamless(src, joined)
                    subprocess.run([sys.executable, '-I', str(Path(__file__).with_name('defringe.py')), str(joined),
                                    str(out / f'{name}.webp'), *args], check=True)


if __name__ == '__main__':
    main()
