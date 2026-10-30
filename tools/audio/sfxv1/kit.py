"""Small offline processing kit for the recorded effect set (polish-sfx, 2026-10-29). Everything works on mono float32 at SR.

Recipes (build.py) crop the CC0 recordings, line their onsets up, filter, layer and level them, then write each take twice: a WAV for the
previews and an MP3 for the game (mono, 32 kHz, the same format sampleLoader.ts already decodes).
"""
import subprocess
import numpy as np
from scipy.signal import butter, sosfilt, resample_poly
from measure import load as _load, lufs, SR

_cache = {}


def load(path):
    if path not in _cache:
        _cache[path] = _load(path)
    return _cache[path].copy()


def db(x):
    return 10 ** (x / 20)


def seg(x, start=0.0, dur=None):
    a = int(start * SR)
    return x[a: a + int(dur * SR)] if dur else x[a:]


def onset(x, thr_db=-30, back=0.004):
    """index of the first sample over thr_db of the peak, less `back` seconds"""
    pk = np.abs(x).max() + 1e-9
    i = int(np.argmax(np.abs(x) > pk * db(thr_db)))
    return max(0, i - int(back * SR))


def trim(x, thr_db=-30, back=0.004, tail_db=-50, maxdur=None):
    """from just before the onset to where the sound falls under tail_db of its peak (or maxdur)"""
    x = x[onset(x, thr_db, back):]
    pk = np.abs(x).max() + 1e-9
    n = 256
    k = len(x) // n
    if k > 1:
        r = np.abs(x[: k * n]).reshape(k, n).max(1)
        live = np.nonzero(r > pk * db(tail_db))[0]
        if len(live):
            x = x[: (live[-1] + 1) * n]
    if maxdur:
        x = x[: int(maxdur * SR)]
    return x


def fade(x, fin=0.002, fout=0.05):
    x = x.copy()
    a, b = int(fin * SR), int(fout * SR)
    if a:
        x[:a] *= np.linspace(0, 1, a) ** 2
    if b and b < len(x):
        x[-b:] *= np.linspace(1, 0, b) ** 2
    return x


def env_decay(x, tau):
    """an exponential decay over the take (tau seconds): shortens a ringing tail"""
    return x * np.exp(-np.arange(len(x)) / (tau * SR))


def hp(x, f, order=2):
    return sosfilt(butter(order, f, 'highpass', fs=SR, output='sos'), x).astype(np.float32)


def lp(x, f, order=2):
    return sosfilt(butter(order, min(f, SR / 2 - 100), 'lowpass', fs=SR, output='sos'), x).astype(np.float32)


def bp(x, f0, f1, order=2):
    return sosfilt(butter(order, [f0, f1], 'bandpass', fs=SR, output='sos'), x).astype(np.float32)


def shelf(x, f, gain_db, kind='high'):
    """a gentle shelf made from a split: the band past f is turned by gain_db"""
    band = hp(x, f) if kind == 'high' else lp(x, f)
    return (x + band * (db(gain_db) - 1)).astype(np.float32)


def rate(x, r):
    """play `r` times as fast (pitch and speed together, like a tape): 1.1 = a little higher and shorter"""
    if abs(r - 1) < 1e-3:
        return x
    up, down = int(round(1000 / r)), 1000
    return resample_poly(x, up, down).astype(np.float32)


def sat(x, k=2.0):
    """soft saturation: adds harmonics so a low thump reads on a phone speaker"""
    return (np.tanh(x * k) / np.tanh(k)).astype(np.float32)


def mix(*layers, length=None):
    """layers: (signal, offset seconds, gain dB)"""
    n = max(int(o * SR) + len(s) for s, o, _ in layers)
    if length:
        n = max(n, int(length * SR))
    y = np.zeros(n, np.float32)
    for s, o, g in layers:
        a = int(o * SR)
        y[a: a + len(s)] += s * db(g)
    return y


def norm_peak(x, peak_db=-1.0):
    return (x * db(peak_db) / (np.abs(x).max() + 1e-9)).astype(np.float32)


def limit(x, ceil_db=-1.0):
    """a soft limiter: peaks over the ceiling are rounded off (tanh), everything under it passes untouched"""
    c = db(ceil_db)
    knee = c * 0.7
    y = x.copy()
    over = np.abs(y) > knee
    y[over] = np.sign(y[over]) * (knee + (c - knee) * np.tanh((np.abs(y[over]) - knee) / (c - knee)))
    return y.astype(np.float32)


def to_lufs(x, target, peak_db=-1.0):
    """level to `target` LUFS; a take whose peaks would pass peak_db has them rounded off by the limiter (up to 6 dB of it), and only
    past that is the whole take pulled down"""
    y = x.astype(np.float32)
    for _ in range(3):
        v = lufs(y)
        if v is None:
            break
        y = y * db(target - v)
        pk = np.abs(y).max()
        if pk > db(peak_db + 6):
            y = y * db(peak_db + 6) / pk
        y = limit(y, peak_db)
    return y.astype(np.float32)


def write_wav(path, x, sr=SR):
    import soundfile as sf
    sf.write(str(path), np.clip(x, -1, 1), sr, subtype='PCM_16')


def write_mp3(path, x, kbps=48, sr=SR):
    """mono MP3 for the game; LAME's own delay is trimmed by the browser's decoder from the encoder header"""
    pcm = np.clip(x, -1, 1).astype(np.float32).tobytes()
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'f32le', '-ar', str(SR), '-ac', '1', '-i', 'pipe:0', '-ar', str(sr),
                    '-c:a', 'libmp3lame', '-b:a', f'{kbps}k', str(path)], input=pcm, check=True)


def write_ogg(path, x, kbps=64):
    pcm = np.clip(x, -1, 1).astype(np.float32).tobytes()
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'f32le', '-ar', str(SR), '-ac', '1', '-i', 'pipe:0', '-c:a', 'libvorbis', '-b:a', f'{kbps}k',
                    str(path)], input=pcm, check=True)
