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

sys.dont_write_bytecode = True  # (it imports scripts/strip-seamless.py: no __pycache__ left in scripts/)
ROOT = Path(__file__).resolve().parents[3]
BACK = 'src/assets/backdrops'

# (stems, source commit, defringe options[, extras]). The commit holds the strip as it was before any upscaler or fix touched it.
# extras: 'part' adds options for the mid or the near only; 'dir' reads the source from another folder at that commit; 'seamless':
# False skips A1's join (the source is already joined)
HD = 'src/assets/backdrops-hd'
HD_REV = 'cd71d17'  # hf-art-backdrops: Matt's native-resolution near and mid strips (VI-2), joined, still with the old dark ring
# near strips are 1736 tall (2x the 868 of a 2048 strip), mids 1302 (1.5x): the untrusted ring and the ink line scale with them. Only the
# outer 4 px change (--band 4: the lead, 2026-10-29, every pixel further in and every thin feature is the painting's own), WebP q95
HD_PART = {'near': ['--ring', '6', '--px', '1.9', '--band', '4'], 'mid': ['--ring', '4.5', '--px', '1.5', '--band', '4']}
HD_X = {'dir': HD, 'seamless': False}
RECIPES = [
    (['w1', 'w2', 'w3', 'w6', 'w7', 'w8', 'w9', 'w10'], HD_REV, ['--scale', '1', '--despill', '--q', '95', '--ink'],
     {**HD_X, 'part': HD_PART}),
    # World 4 also graded warmer and less grey on its mid strip (VI-18; grade.py does its far strips)
    (['w4'], HD_REV, ['--scale', '1', '--despill', '--q', '95', '--ink'],
     {**HD_X, 'part': {'near': HD_PART['near'], 'mid': HD_PART['mid'] + ['--grade']}}),
    # World 5's gold set: its own clean ink line kept, the spill clamped (as the other World 5 sets below)
    (['w5'], HD_REV, ['--scale', '1', '--keep-line', '--despill', '--q', '95', '--band', '4'], HD_X),
    # World 1's canopy, keyed off white: un-mix the white halo, clear the leftover key in the sky
    (['w1c'], '31c243f', ['--scale', '1', '--ring', '3', '--unveil', '3', '--unmix', '252,252,252', '--q', '82', '--ink']),
    # World 5's other moods (Gemini, 2048 px): its outline is a clean painted ink line, kept; only the magenta spill and the black
    # under the cut (which lossy WebP smears into the edge) are fixed
    (['w5gold2', 'w5dusk1', 'w5dusk2', 'w5twi1', 'w5twi2'], '8c1f0ab', ['--scale', '1', '--keep-line', '--despill', '--q', '82']),
    (['w5night'], '1baf7ca', ['--scale', '1', '--keep-line', '--despill', '--q', '82']),
]
# the middle strips whose top edge is solid paint (trees, the cave roof run off it): upright that edge is on screen, so their top 7% fades
# out into the far strip's painted sky (sideways those rows are always above the screen). Measured: alpha in their top rows; w8's trees
# start lower but are cut off just as straight (the fade starts at the first painted row).
TOPFADE = {'w1', 'w1c', 'w3', 'w5', 'w5gold2', 'w5dusk1', 'w5dusk2', 'w5twi1', 'w5twi2', 'w5night', 'w7', 'w8'}

# (before the native-resolution strips, 2026-10-29, Worlds 1-4, 6, 7 and 10 came from the 1024 px originals at 18bedcc^ with
# ['--scale', '2', '--esrgan', '--ink'], and Worlds 8-9 from 9f2dbfe with ['--scale', '1', '--esrgan', '--ring', '2', '--ink'])


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
        for stems, rev, opts, *extra in RECIPES:
            x = extra[0] if extra else {}
            for stem in stems:
                for part in ('mid', 'near'):
                    name = f'{stem}-{part}'
                    if only and name not in only:
                        continue
                    src = Path(tmp) / f'{name}.webp'
                    src.write_bytes(subprocess.run(['git', 'show', f'{rev}:{x.get("dir", BACK)}/{name}.webp'], cwd=ROOT, check=True,
                                                   capture_output=True).stdout)
                    args = [a for a in opts + x.get('part', {}).get(part, []) if not (o.clean and a == '--ink')]
                    if part == 'mid' and stem in TOPFADE:
                        args += ['--topfade', '0.07']
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
                    if x.get('seamless', True):
                        seamless(src, joined)
                    else:
                        joined = src
                    subprocess.run([sys.executable, '-I', str(Path(__file__).with_name('defringe.py')), str(joined),
                                    str(out / f'{name}.webp'), *args], check=True)


if __name__ == '__main__':
    main()
