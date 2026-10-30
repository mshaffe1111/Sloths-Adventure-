"""Objective numbers for a sound (polish-sfx, 2026-10-29): the lead cannot listen, so every old/new pair gets these.

    python3 tools/audio/sfxv1/measure.py <file> ...        prints one JSON line per file
    from measure import load, stats                          (as a module)

  flatness      spectral flatness, energy-weighted over frames: 0 = a pure tone, 1 = white noise. Pings sit under 0.1, a thud or a rustle
                over 0.2.
  pitched       share of the energy in narrow tonal peaks (12 dB over their +-120 Hz neighbourhood, 80 Hz-10 kHz): a bell or a ping is
                0.6-0.95, a thud, rustle, splash or rumble under 0.25.
  hf6k          share of the energy above 6 kHz, in percent (the "glitter" that reads as ping on a phone speaker).
  centroid      spectral centroid in Hz (brightness).
  peak          sample peak, dBFS.
  lufs          integrated loudness (ITU-R BS.1770, K-weighted, gated); a sound shorter than 0.4 s is measured padded with silence to
                0.4 s, so short sounds read a little low, the same way for old and new.
  dur           seconds above -50 dB of the peak.
"""
import json, subprocess, sys
import numpy as np

SR = 32000


def load(path, sr=SR, channels=1):
    """any file ffmpeg reads, as float32 at `sr`: mono (the average of the channels, so a stereo file never gains level) or [n, channels]"""
    p = subprocess.run(['ffmpeg', '-v', 'error', '-i', str(path), '-ac', str(channels), '-ar', str(sr), '-f', 'f32le', 'pipe:1'],
                       capture_output=True, check=True)
    x = np.frombuffer(p.stdout, np.float32).copy()
    return x if channels == 1 else x.reshape(-1, channels)


def nchan(path):
    p = subprocess.run(['ffprobe', '-v', 'error', '-select_streams', 'a:0', '-show_entries', 'stream=channels', '-of', 'csv=p=0', str(path)],
                       capture_output=True, text=True)
    try:
        return int(p.stdout.strip() or 1)
    except ValueError:
        return 1


def kweight(x, sr):
    from scipy.signal import lfilter
    # BS.1770 pre-filter (high shelf) and RLB high-pass, bilinear for any rate (pyloudnorm's coefficients)
    import pyloudnorm as pyln
    m = pyln.Meter(sr)
    y = x
    for f in m._filters.values():
        y = lfilter(f.b, f.a, y)
    return y


def lufs(x, sr=SR):
    """integrated loudness of a mono [n] or multichannel [n, ch] signal"""
    import pyloudnorm as pyln
    n = int(0.4 * sr)
    if len(x) < n:
        pad = np.zeros((n - len(x),) + x.shape[1:], np.float32)
        x = np.concatenate([x, pad])
    try:
        v = pyln.Meter(sr).integrated_loudness(x.astype(np.float64))
    except Exception:
        return None
    return None if not np.isfinite(v) else round(float(v), 1)


def frames(x, n=1024, hop=512):
    if len(x) < n:
        x = np.concatenate([x, np.zeros(n - len(x), np.float32)])
    k = 1 + (len(x) - n) // hop
    idx = np.arange(n)[None, :] + hop * np.arange(k)[:, None]
    return x[idx] * np.hanning(n)[None, :].astype(np.float32)


def stats(x, sr=SR):
    pk = float(np.max(np.abs(x))) if len(x) else 0.0
    if pk < 1e-6:
        return {'peak': -120.0}
    F = frames(x)
    P = np.abs(np.fft.rfft(F, axis=1)) ** 2 + 1e-12
    e = P.sum(1)
    w = e / e.sum()
    live = e > e.max() * 1e-4
    freqs = np.fft.rfftfreq(F.shape[1], 1 / sr)
    band = (freqs >= 100) & (freqs <= 8000)
    Pb = P[:, band] + P[:, band].max(1, keepdims=True) * 1e-7
    flat = np.exp(np.mean(np.log(Pb), 1)) / np.mean(Pb, 1)
    hf = P[:, freqs >= 6000].sum(1).sum() / P.sum()
    cen = float((P * freqs[None, :]).sum() / P.sum())
    # pitchedness: the share of the energy (80 Hz-10 kHz, frames that carry the sound) sitting in narrow spectral peaks that stand 12 dB or
    # more over the median of their neighbourhood (+-120 Hz). A bell or a ping is nearly all peaks (0.6-0.95); a thud, a rustle, a splash
    # or a rumble is broad (under 0.25), however dark it is.
    from scipy.ndimage import median_filter
    G = frames(x, 4096, 2048)
    Q = np.abs(np.fft.rfft(G, axis=1)) ** 2 + 1e-14
    qf = np.fft.rfftfreq(G.shape[1], 1 / sr)
    qb = (qf >= 80) & (qf <= 10000)
    Q = Q[:, qb]
    qe = Q.sum(1)
    qlive = qe > qe.max() * 1e-3
    dB = 10 * np.log10(Q[qlive])
    med = median_filter(dB, size=(1, 31), mode='nearest')
    peaks = (dB - med) > 12
    pit = float((Q[qlive] * peaks).sum() / Q[qlive].sum()) if qlive.any() else 0.0
    env = np.abs(x)
    above = np.nonzero(env > pk * 10 ** (-50 / 20))[0]
    dur = (above[-1] - above[0]) / sr if len(above) else 0.0
    return {
        'flatness': round(float(np.sum(flat[live] * w[live]) / w[live].sum()), 3),
        'pitched': round(pit, 3),
        'hf6k': round(100 * float(hf), 2),
        'centroid': int(cen),
        'peak': round(20 * np.log10(pk), 1),
        'lufs': lufs(x, sr),
        'dur': round(float(dur), 2),
    }


if __name__ == '__main__':
    for p in sys.argv[1:]:
        if nchan(p) == 2:
            # a stereo mix: the features from the mid, the peak and the loudness from both channels
            s = stats(load(p))
            st = load(p, sr=48000, channels=2)   # (at the mixes' own rate: resampling adds overshoot to the peak)
            s['peak'] = round(20 * float(np.log10(np.abs(st).max() + 1e-12)), 1)
            s['lufs'] = lufs(st, 48000)
        else:
            s = stats(load(p))
        print(json.dumps({'file': p, **s}))
