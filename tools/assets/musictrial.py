#!/usr/bin/env python3
"""Music trial (task AS-1, test-side only). The .webm files are Opus music, rendered by tools/music/record.mjs; the clean way to
lower their size is to record again with a lower KBPS (one lossy pass from the source), not to re-encode the shipped Opus.

    python3 tools/assets/musictrial.py <wav dir> <out dir>

For each <piece>.<stem>.loop.wav (record.mjs KEEP_WAV=<wav dir>), encodes with the recorder's own ffmpeg settings at the current
bitrate and at lower ones, and measures against the source WAV: bytes, the frequency where the encode falls 10 dB under the source
(bandwidth), and the noise-to-signal ratio in four bands (STFT magnitude error, dB; lower is better). Writes <out dir>/music.json.
"""
import json, os, subprocess, sys
import numpy as np

wavdir, out = sys.argv[1], sys.argv[2]
os.makedirs(out, exist_ok=True)
RATES = {'mix': (80, 64, 56, 48), 'stereo': (64, 56, 48, 40), 'mono': (40, 32, 28, 24)}
MONO = {'drive', 'shine', 'dark', 'boss'}


def dec(p, ch):
    raw = subprocess.check_output(['ffmpeg', '-v', 'error', '-i', p, '-f', 'f32le', '-ac', str(ch), '-ar', '48000', '-'])
    return np.frombuffer(raw, 'f4').reshape(-1, ch).mean(1)


def spec(x, n=2048, hop=1024):
    w = np.hanning(n).astype('f4')
    fr = np.lib.stride_tricks.sliding_window_view(x, n)[::hop] * w
    return np.abs(np.fft.rfft(fr, axis=1))


res = []
for f in sorted(os.listdir(wavdir)):
    if not f.endswith('.loop.wav'):
        continue
    piece, stem = f[:-9].rsplit('.', 1)
    ch = 1 if stem in MONO else 2
    rates = RATES['mix'] if stem == 'mix' else RATES['mono' if ch == 1 else 'stereo']
    src = os.path.join(wavdir, f)
    ref = dec(src, ch)
    R = spec(ref)
    freqs = np.fft.rfftfreq(2048, 1 / 48000)
    row = dict(piece=piece, stem=stem, ch=ch, seconds=len(ref) / 48000, enc={})
    for k in rates:
        o = os.path.join(out, f'{piece}.{stem}.{k}k.webm')
        subprocess.check_call(['ffmpeg', '-y', '-v', 'error', '-i', src, '-ac', str(ch), '-c:a', 'libopus', '-b:a', f'{k}k', '-vbr', 'on', '-application', 'audio', o])
        y = dec(o, ch)
        # (ffmpeg drops the decoder's pre-skip, so the decode lines up with the source sample for sample)
        n = min(len(ref), len(y))
        Y = spec(y[:n]); Rn = R[:len(Y)]
        # (a downmix to one channel can change the level: match the level first, so only the codec's error is counted)
        Y = Y * float((Y * Rn).sum() / max(1e-12, (Y * Y).sum()))
        e = np.abs(Y - Rn)
        bands = {}
        for lo, hi in ((0, 4000), (4000, 8000), (8000, 12000), (12000, 20000)):
            m = (freqs >= lo) & (freqs < hi)
            bands[f'{lo // 1000}-{hi // 1000}k'] = round(float(10 * np.log10((e[:, m] ** 2).sum() / max(1e-12, (Rn[:, m] ** 2).sum()))), 1)
        pr, py = (Rn ** 2).mean(0), (Y ** 2).mean(0)
        ok = 10 * np.log10(py + 1e-12) > 10 * np.log10(pr + 1e-12) - 10
        audible = pr > pr.max() * 1e-6
        bw = float(freqs[np.where(ok & audible)[0].max()]) if (ok & audible).any() else 0
        row['enc'][k] = dict(bytes=os.path.getsize(o), nsr=bands, bw=round(bw))
    res.append(row)
    print(piece, stem, {k: (v['bytes'], v['nsr'], v['bw']) for k, v in row['enc'].items()}, flush=True)
json.dump(res, open(os.path.join(out, 'music.json'), 'w'), indent=1)
