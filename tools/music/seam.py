"""The loop seams: python3 tools/music/seam.py <music dir> <out dir> [piece ...]

For every stem of every piece (or the ones named): decode the .webm as a browser would (ffmpeg), cut the loop out where the player loops
it (manifest guard and length), and measure the jump at the seam against the music's own sample-to-sample movement: the seam's step
(last sample to first, per channel) is ranked among every step in the loop. A seam that is part of the music ranks like any other step;
a click ranks at the very top. Writes <out>/<piece>.seam.mp3: the last 8 s of the loop's full mix (every stem at its calm level) running
into its first 8 s, as heard when it comes round. Prints one line per stem; exits 1 if any seam ranks above the 99.9th percentile.
"""
import json, subprocess, sys
from pathlib import Path
import numpy as np

SR = 48000
music, out = Path(sys.argv[1]), Path(sys.argv[2])
only = set(sys.argv[3:])
man = json.loads((music / 'manifest.json').read_text())
out.mkdir(parents=True, exist_ok=True)

def load(p):
    raw = subprocess.run(['ffmpeg', '-loglevel', 'error', '-i', str(p), '-f', 'f32le', '-ac', '2', '-ar', str(SR), '-'], capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.float32).reshape(-1, 2).copy()

CALM = {'mix': 1, 'bed': 1, 'beat': 1, 'top': 1}
bad = 0
for name, p in man['pieces'].items():
    if only and name not in only:
        continue
    g, n = round(p['guard'] * SR), round(p['length'] * SR)
    mix = np.zeros((n, 2), np.float32)
    for stem, f in p['stems'].items():
        x = load(music / f)[g:g + n]
        if len(x) < n:
            print(f'{name}.{stem}: file too short ({len(x)} < {n})'); bad += 1; continue
        steps = np.abs(np.diff(x, axis=0))
        seam = np.abs(x[0] - x[-1])
        rank = float(max((steps < s).mean() for s in seam))
        pk = float(np.abs(x).max())
        # the steps at the loop's other bar lines (a downbeat's attack is music, at the seam as anywhere)
        bar = n / p['bars']
        onsets = [float(steps[max(0, int(b * bar) - 48):int(b * bar) + 96].max()) for b in range(1, p['bars'])]
        flag = 'CLICK' if rank > 0.999 and seam.max() > 1e-3 and seam.max() > 1.5 * max(onsets) else 'ok'
        if flag != 'ok': bad += 1
        print(f'{name}.{stem}: seam step {seam.max():.5f} (rank {rank * 100:.2f}% of the music\'s own steps; the bar lines\' biggest {max(onsets):.5f}), peak {pk:.3f} {flag}')
        mix += x * CALM.get(stem, 0)
    clip = np.concatenate([mix[-8 * SR:], mix[:8 * SR]])
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-f', 'f32le', '-ar', str(SR), '-ac', '2', '-i', '-', '-codec:a', 'libmp3lame', '-b:a', '192k', str(out / f'{name}.seam.mp3')], input=clip.tobytes(), check=True)
sys.exit(1 if bad else 0)
