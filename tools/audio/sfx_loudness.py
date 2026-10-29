#!/usr/bin/env python3
"""
SN-2 (polish report 1, 2026-10-29): measure and batch-normalise the recorded effects (src/assets/sfx/*.mp3, Kenney CC0).

  python3 tools/audio/sfx_loudness.py measure [files...]          a table: loudness (LUFS), true peak (dBTP), length
  python3 tools/audio/sfx_loudness.py normalise --target -16 --tp -1 --out DIR [files...]

Loudness is BS.1770 K-weighted, short-term: the loudest 3 s window, or for an effect shorter than that (nearly all of them) the effect
itself from its first to its last sound within 40 dB of its peak (a short-term window over a click is mostly silence, which is why a 3 s
window put uiClick_0 at -70). True peak is the 4x oversampled peak. Normalising is one gain per file (the sound itself is untouched):
to the target, or, for every variant of a sound, to the level the most peaky variant reaches under the ceiling, so the variants stay
together. Needs ffmpeg, numpy and scipy.
"""
import json, os, subprocess, sys
import numpy as np
from scipy.signal import lfilter, resample_poly

SR = 48000

def decode(path):
    if path.endswith('.f32'):
        return np.fromfile(path, dtype='<f4').astype(np.float64)
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', path, '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True, check=True).stdout
    return np.frombuffer(raw, dtype=np.float32).astype(np.float64)

# BS.1770 K-weighting at 48 kHz: the shelf, then the high-pass
SHELF = ([1.53512485958697, -2.69169618940638, 1.19839281085285], [1.0, -1.69065929318241, 0.73248077421585])
HIPASS = ([1.0, -2.0, 1.0], [1.0, -1.99004745483398, 0.99007225036621])

def kweight(x):
    return lfilter(*HIPASS, lfilter(*SHELF, x))

def measure(x):
    if len(x) == 0 or np.max(np.abs(x)) == 0:
        return {'lufs': -70.0, 'tp': -120.0, 'len': 0.0}
    tp = 20 * np.log10(np.max(np.abs(resample_poly(x, 4, 1))) + 1e-12)
    env = np.abs(x)
    loud = np.nonzero(env >= np.max(env) * 10 ** (-40 / 20))[0]
    a, b = loud[0], loud[-1] + 1
    z = kweight(x)[a:b]
    win = 3 * SR
    if len(z) <= win:
        ms = np.mean(z * z)
    else:
        c = np.concatenate([[0.0], np.cumsum(z * z)])
        hop = SR // 10
        ms = max((c[i + win] - c[i]) / win for i in range(0, len(z) - win + 1, hop))
    lufs = -0.691 + 10 * np.log10(ms + 1e-20)
    return {'lufs': round(float(lufs), 2), 'tp': round(float(tp), 2), 'len': round(len(x) / SR, 3)}

def main():
    args = sys.argv[1:]
    cmd = args.pop(0)
    opt = {'--target': -16.0, '--tp': -1.0, '--out': None}
    files = []
    while args:
        a = args.pop(0)
        if a in opt:
            opt[a] = args.pop(0) if a == '--out' else float(args.pop(0))
        else:
            files.append(a)
    rows = []
    meas = {f: measure(decode(f)) for f in files}
    # the variants of one sound (<group>_<n>.mp3) go to one level, so a button tap is never loud one time and quiet the next: the target,
    # or lower when the group's peaky variants would need more than LIMIT_DB of true-peak limiting to reach it under the ceiling (0.3 dB
    # kept for the mp3 encode's overshoot). A variant that needs some limiting gets it (ffmpeg alimiter, 4x oversampled); the rest is gain.
    LIMIT_DB = 3.0
    ceil = opt['--tp'] - 0.3
    group = lambda f: os.path.basename(f).rsplit('_', 1)[0]
    reach = {}
    for f, m in meas.items():
        r = m['lufs'] + (ceil - m['tp'])
        reach.setdefault(group(f), []).append(r)
    level = {g: min(opt['--target'], min(rs) + LIMIT_DB) for g, rs in reach.items()}
    def render(f, want, gain):
        m = meas[f]
        out = os.path.join(opt['--out'], os.path.basename(f))
        # (limiting takes some loudness with the peaks: measure, add back what it took, a few times)
        for _ in range(5):
            over = m['tp'] + gain - ceil
            af = f'volume={gain:.3f}dB'
            if over > 0:
                lim = 10 ** ((ceil - 0.2) / 20)
                af = f'aresample=192000,{af},alimiter=limit={lim:.4f}:attack=1:release=40:level=disabled,aresample=44100'
            subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', f, '-af', af, '-ac', '1', '-ar', '44100', '-c:a', 'libmp3lame', '-b:a', '160k', out], check=True)
            after = measure(decode(out))
            if abs(after['lufs'] - want) < 0.3 or over > LIMIT_DB + 1.5:
                break
            gain = min(gain + want - after['lufs'], ceil - m['tp'] + LIMIT_DB)
        return {'limited_db': round(max(0.0, over), 2), 'gain': round(gain, 2), 'after': after}

    done = {}
    if cmd == 'normalise':
        for f in files:
            done[f] = render(f, level[group(f)], level[group(f)] - meas[f]['lufs'])
        # a variant that could not reach its group's level sets it: the others come down to within 1 dB of it
        for g in reach:
            fs = [f for f in files if group(f) == g]
            low = min(done[f]['after']['lufs'] for f in fs)
            for f in fs:
                if done[f]['after']['lufs'] > low + 1.0:
                    done[f] = render(f, low + 0.5, done[f]['gain'] - (done[f]['after']['lufs'] - (low + 0.5)))
    for f in files:
        m = meas[f]
        row = {'file': os.path.basename(f), **m, **done.get(f, {})}
        rows.append(row)
    print(json.dumps(rows, indent=1))

if __name__ == '__main__':
    main()
