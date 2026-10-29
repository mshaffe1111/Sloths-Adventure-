"""Rebuild every cut-out backdrop strip through defringe.py, from its pinned source in git (repeatable: same input every time).

    python3 -I tools/art/edges/run_all.py [--clean] [--only w1-near,w5dusk2-mid] [--out DIR]

--clean   no ink line (the comparison take); the default draws it (see README.md for why)
--out     write somewhere else than src/assets/backdrops (for comparisons)

A new strip: add a row to RECIPES with the commit that holds its keyed source, then run this. Far strips are opaque and need none."""
import argparse
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
                    subprocess.run([sys.executable, '-I', str(Path(__file__).with_name('defringe.py')), str(src),
                                    str(out / f'{name}.webp'), *args], check=True)


if __name__ == '__main__':
    main()
