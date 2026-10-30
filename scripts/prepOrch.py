#!/usr/bin/env python3
"""
Builds the recorded orchestra used by the music engine (src/assets/orch/*.mp3) from VSCO 2 Community Edition
(https://github.com/sgossner/VSCO-2-CE, released under CC0 by Versilian Studios / Sam Gossner).

Usage: python3 scripts/prepOrch.py <path to a VSCO-2-CE checkout> [out dir]

What it does to every chosen recording:
  - mixes it to mono, normalises its loudness so neighbouring notes of an instrument match
  - sustained instruments (strings, brass) are cut to attack + a short steady stretch, and that stretch is made to loop
    seamlessly (the end cross-fades into the material just before the loop start), so a note can be held as long as the
    music needs while the file stays small. The stretch is chosen note by note (pick_loop): the steadiest 1.8 s after the
    attack whose two ends match in level, and what slow swell is left in it is evened out (level_loop), so a held note
    never pumps at its loop point (polish report SN-8: steps of up to 7 dB at a fixed 1.3 s start)
  - short instruments (staccato, pizzicato, drums) are trimmed and faded
  - writes <instrument>_<midi note>_<loop start in ms>.mp3 (a one-shot: loop start 0), and for a sustained note
    <instrument>_<midi note>_<loop start in ms>_<loop length in samples at 44.1 kHz>.mp3

The note a recording was made at comes from its file name (VSCO names octaves one lower than the usual convention), and
is double-checked against a measurement of the recording's pitch.
"""
import os
import re
import subprocess
import sys
import tempfile
import warnings
from pathlib import Path

import numpy as np
from scipy.io import wavfile

warnings.filterwarnings('ignore')
SRC = Path(sys.argv[1]) if len(sys.argv) > 1 else Path('VSCO-2-CE')
OUT = Path(sys.argv[2]) if len(sys.argv) > 2 else Path(__file__).resolve().parent.parent / 'src' / 'assets' / 'orch'
OUT.mkdir(parents=True, exist_ok=True)
SR = 44100
PC = {'C': 0, 'D': 2, 'E': 4, 'F': 5, 'G': 7, 'A': 9, 'B': 11}

# kind: 'sus' (loopable), 'short' (one shot, trimmed to `dur`), 'perc' (one shot, trimmed to `dur`)
# glob is relative to the checkout; target is the loudness (RMS) every note of the instrument is brought to
SETS = [
    ('cello', 'sus', 'Strings/Cello Section/susvib/susvib_*_v3_1.wav', {}),
    ('contra', 'sus', 'Strings/Solo Contrabass/SusVib/*_v3_rr1.wav', {}),
    ('violins', 'sus', 'Strings/Violin Section/susVib/*_v1.wav', {}),
    ('violas', 'sus', 'Strings/Viola Section/susvib/*_v2_1.wav', {}),
    ('horn', 'sus', 'Brass/F Horn/sus/*_v2_1.wav', {}),
    ('trombone', 'sus', 'Brass/Tenor Trombone/sus/*_v2_1.wav', {}),
    ('tuba', 'sus', 'Brass/Tuba/sus/*_v2_rr1_Mid.wav', {}),
    ('celloStac', 'short', 'Strings/Cello Section/spic/spic_*_v2_RR1.wav', {'dur': 0.9}),
    ('violinStac', 'short', 'Strings/Violin Section/Spic/*_v2_rr1.wav', {'dur': 0.8}),
    ('hornStac', 'short', 'Brass/F Horn/stac/*_v2_rr1.wav', {'dur': 0.9}),
    ('contraPizz', 'short', 'Strings/Solo Contrabass/Pizz/*_v1_rr1.wav', {'dur': 1.5}),
    ('timp', 'perc', 'Percussion/Timpani/Timpani?_Hit_v3_rr1_Sum.wav', {'dur': 2.6, 'pitch': 'measure'}),
    ('bdrum', 'perc', 'VSCO 1 Percussion/drums/bass/bdrum_{p,f,ff,fff}_1.wav', {'dur': 2.2, 'pitch': 'order'}),
    ('gong', 'perc', 'VSCO 1 Percussion/varMetal/Gong/gong_hit_{mf,ff,fff}.wav', {'dur': 4.0, 'pitch': 'order'}),
    ('cymbal', 'perc', 'VSCO 1 Percussion/varMetal/Cymbals/clash/crash_hit_{ff_tight,fff_loose}.wav', {'dur': 3.0, 'pitch': 'order'}),
    ('harp', 'short', 'Strings/Harp/KSHarp_*.wav', {'dur': 2.6, 'pitch': 'name', 'shift': -12}),  # this set names its octaves one higher than the others (checked against the pitch of the low notes)
    ('flute', 'sus', 'Woodwinds/Flute/susvib/*_v1_1.wav', {}),
    ('oboe', 'sus', 'Woodwinds/Oboe/Vib/*_v1_Main.wav', {}),
    ('clarinet', 'sus', 'Woodwinds/Clarinet/susLong/*_v2_rr1_sum.wav', {}),
    ('bassoon', 'sus', 'Woodwinds/Bassoon/vib/*_v2_1.wav', {}),
    ('snare', 'perc', 'VSCO 1 Percussion/drums/snare/drum3_marching/snare3_{p,mp,f,fff}_1.wav', {'dur': 0.7, 'pitch': 'order'}),
    ('triangle', 'perc', 'VSCO 1 Percussion/varMetal/triangle/2/triangle2_hit_{p,mp}.wav', {'dur': 2.2, 'pitch': 'order'}),
    ('glock', 'perc', 'Percussion/Glock/glock_medium_*.wav', {'dur': 3.2, 'pitch': 'name'}),
    ('marimba', 'perc', 'Percussion/Marimba/Marimba_hit_Outrigger_*_loud_01.wav', {'dur': 1.6, 'pitch': 'name'}),
]
ONLY = set(os.environ['ONLY'].split(',')) if os.environ.get('ONLY') else None
LOOP_START = 1.3  # the latest the old fixed loop began; pick_loop searches LOOP_EARLIEST..LOOP_LATEST
LOOP_EARLIEST = 0.55
LOOP_LATEST = 2.2
LEVEL_WIN = float(os.environ.get("LEVEL_WIN", "0.12"))  # the window the swell is measured over: about a vibrato cycle
LOOP_LEN = 1.8
GUARD = 0.03  # the last stretch of the loop is the sound just before its start exactly: a decoder that keeps the mp3's encoder delay (up to ~26 ms) still loops seamlessly
REFINE = float(os.environ.get('REFINE', '0.25'))  # how far (s) the start may move to find a cross-fade in phase
XFADE = 0.06  # short, and placed where the two stretches are in phase (refine_loop): a long one drifts out of phase with the vibrato and dips


def load(p):
    sr, d = wavfile.read(str(p))
    d = d.astype(np.float64)
    if d.ndim == 2:
        d = d.mean(1)
    d /= max(1e-9, np.abs(d).max())
    if sr != SR:
        from scipy.signal import resample_poly
        from math import gcd

        g = gcd(sr, SR)
        d = resample_poly(d, SR // g, sr // g)
    return d


def measure_midi(d, early=False):
    """pitch of a recording (MIDI number, fractional) from the cumulative-mean-normalised difference function (YIN)"""
    from scipy.signal import resample_poly

    seg = d[int(SR * 0.05) : int(SR * 0.45)] if early else d[int(SR * 0.4) : int(SR * 1.6)]
    seg = resample_poly(seg, 1, 4)  # 11025 Hz is plenty for fundamentals below 1.5 kHz
    sr = SR / 4
    n = len(seg)
    tmax = int(sr / 27)
    w = n - tmax
    x = seg - seg.mean()
    # difference function via cumulative sums and an FFT cross-correlation
    c = np.cumsum(np.concatenate(([0.0], x**2)))
    ac = np.fft.irfft(np.fft.rfft(x[:w], 2 * n) * np.conj(np.fft.rfft(x, 2 * n)))[: tmax + 1]
    tau = np.arange(tmax + 1)
    dfun = (c[w] - c[0]) + (c[w + tau] - c[tau]) - 2 * ac
    dfun[0] = 0
    cm = np.ones_like(dfun)
    cm[1:] = dfun[1:] * tau[1:] / np.maximum(np.cumsum(dfun[1:]), 1e-12)
    lo = int(sr / 1500)
    thr = 0.15
    cand = np.where(cm[lo:] < thr)[0]
    if len(cand):
        t = lo + cand[0]
        while t + 1 <= tmax and cm[t + 1] < cm[t]:
            t += 1
    else:
        t = lo + int(np.argmin(cm[lo:]))
    # parabolic refinement
    if 1 <= t < tmax:
        a_, b_, c_ = cm[t - 1], cm[t], cm[t + 1]
        den = a_ - 2 * b_ + c_
        t = t + (0.5 * (a_ - c_) / den if abs(den) > 1e-12 else 0)
    return 69 + 12 * np.log2((sr / t) / 440)


def name_midi(name):
    m = re.search(r'_([A-G])(#?)(\d)[_.]', name)
    if not m:
        return None
    return 12 * (int(m.group(3)) + 2) + PC[m.group(1)] + (1 if m.group(2) else 0)


def rms(d):
    return float(np.sqrt((d**2).mean()) + 1e-9)


def expand(pattern):
    # tiny {a,b,c} expansion so a set can name a few files
    m = re.search(r'\{([^}]*)\}', pattern)
    if not m:
        return [pattern]
    return [pattern[: m.start()] + o + pattern[m.end() :] for o in m.group(1).split(',')]


def encode(d, path):
    d = np.clip(d, -1, 1)
    with tempfile.NamedTemporaryFile(suffix='.wav') as t:
        wavfile.write(t.name, SR, (d * 32767).astype(np.int16))
        subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', t.name, '-ac', '1', '-ar', str(SR), '-codec:a', 'libmp3lame', '-q:a', '7', str(path)], check=True)


def levels_db(d, w):
    n = len(d) // w
    x = d[: n * w].reshape(n, w)
    return 20 * np.log10(np.sqrt((x**2).mean(1)) + 1e-9)


def pick_loop(d):
    """the loop start (seconds): the 1.8 s stretch whose two ends match in level and whose level wavers least, as early as that allows"""
    w = int(SR * 0.05)
    lv = levels_db(d, w)
    span = int(LOOP_LEN * SR / w)
    xf = int(XFADE * SR / w)
    best, at = 1e9, LOOP_START
    for i in range(int(LOOP_EARLIEST * SR / w), int(LOOP_LATEST * SR / w) + 1):
        if i + span + 2 > len(lv) or i - xf < 0:
            break
        seg = lv[i - xf : i + span]
        ends = abs(lv[i : i + 2].mean() - lv[i + span - 2 : i + span].mean())
        cost = 4 * ends + np.std(seg) + 0.6 * (seg.max() - seg.min()) / 4 + 0.4 * (i * w / SR - LOOP_EARLIEST)
        if cost < best:
            best, at = cost, i * w / SR
    return refine_loop(d, at)


def refine_loop(d, start):
    """the loop's exact start and length (in samples): a held note repeats its waveform every period, so a loop of a fixed length ends at
    a fixed point of that period and its cross-fade cancels (a dip at every loop). Near the level-matched start and near LOOP_LEN, find the
    start and the length (a whole number of periods, give or take the vibrato) where the cross-fade's two stretches are most alike."""
    f = int(SR * XFADE)
    g = int(SR * GUARD)
    span = int(SR * LOOP_LEN)
    k = int(SR * 0.02)
    best, at, length = -2.0, int(SR * start), span
    for a in range(max(f + g, int(SR * (start - REFINE))), int(SR * (start + REFINE)) + 1, int(SR * 0.01)):
        x = d[a - f - g : a - g]
        lo = a + span - k - f - g
        seg = d[lo : a + span + k - g]
        if lo < 0 or len(seg) < 2 * k + f:
            continue
        num = np.correlate(seg, x, 'valid')
        e = np.cumsum(np.concatenate(([0.0], seg**2)))
        den = np.sqrt((e[f:] - e[:-f])[: len(num)] * (x**2).sum()) + 1e-12
        c = num / den
        i = int(np.argmax(c))
        if c[i] > best:
            best, at, length = float(c[i]), a, span - k + i
    if os.environ.get('LOOP_DEBUG'):
        print(f'      loop at {at / SR:.3f}s for {length / SR:.4f}s, cross-fade likeness {best:.3f}')
    return at / SR, length


def level_loop(d, start, length=None):
    """even out the slow swell of the stretch (from the cross-fade before it to its end) toward its own average level, eased in after the attack"""
    from scipy.ndimage import uniform_filter1d

    a = int(SR * (start - XFADE))
    b = int(SR * start) + (length or int(SR * LOOP_LEN))
    env = np.sqrt(uniform_filter1d(d**2, int(SR * LEVEL_WIN)) + 1e-12)
    target = float(np.sqrt((d[a:b] ** 2).mean()))
    g = np.ones(len(d))
    corr = uniform_filter1d(np.clip(target / env[a:b], 0.35, 2.8), int(SR * 0.03))
    ease = int(SR * 0.2)
    lead = np.linspace(1, corr[0], ease)
    g[max(0, a - ease) : a] = lead[-(a - max(0, a - ease)) :] if a > 0 else lead[:0]
    g[a:b] = corr
    g[b:] = corr[-1]
    return d * g


def make_loop(d, start=LOOP_START, length=None):
    a = int(round(SR * start))
    b = a + (length or int(SR * LOOP_LEN))
    f = int(SR * XFADE)
    g = int(SR * GUARD)
    x = d[:b].copy()
    # the loop's tail cross-fades into the stretch just before the loop start, and its last GUARD seconds are that stretch exactly, so wrapping
    # b -> a is continuous (and stays so if a decoder shifts both points by its delay)
    x[b - g : b] = d[a - g : a]
    t = np.linspace(0, 1, f)
    p, q = d[b - g - f : b - g], d[a - g - f : a - g]
    # stretches in phase are cross-faded in level (their sum keeps its loudness); unlike ones in power
    c = float((p * q).sum() / (np.sqrt((p * p).sum() * (q * q).sum()) + 1e-12))
    if c > 0.6:
        x[b - g - f : b - g] = p * (1 - t) + q * t
    else:
        x[b - g - f : b - g] = p * np.cos(t * np.pi / 2) + q * np.sin(t * np.pi / 2)
    return x


def main():
    total = 0
    for inst, kind, glob, opt in SETS:
        if ONLY and inst not in ONLY:
            continue
        files = []
        for g in expand(glob):
            files += sorted(SRC.glob(g))
        if not files:
            print('!! no files for', inst)
            continue
        recs = []
        meas = []
        for i, p in enumerate(files):
            d = load(p)
            if kind == 'sus':
                if len(d) < SR * (LOOP_EARLIEST + LOOP_LEN + 0.1):
                    print('   too short', p.name)
                    continue
                d = d[: int(SR * (LOOP_LATEST + LOOP_LEN + 0.2))]
            midi = name_midi(p.name)
            if opt.get('pitch') == 'measure':
                midi = int(round(measure_midi(d)))
            elif opt.get('pitch') == 'name':
                midi = midi + opt.get('shift', 0)
            elif opt.get('pitch') == 'order' or midi is None:
                midi = 40 + i * 3  # unpitched sets: any distinct number, used only to pick a sample
            else:
                try:
                    meas.append((midi, measure_midi(d, early=kind == 'short')))
                except Exception:
                    meas.append((midi, None))
            recs.append((midi, d))
        # the libraries are not consistent about octave numbers, even within one instrument, so the measurement
        # decides the octave and the file name decides the note
        fixed = []
        for (midi, d), (n, m) in zip(recs, meas) if meas else ((r, (None, None)) for r in recs):
            # above about MIDI 80 the pitch measurement is no longer reliable (it listens below 1.5 kHz): the file name decides
            if m is not None and n < 80:
                pc = n % 12
                cand = pc + 12 * round((m - pc) / 12)
                if abs(cand - m) > 1.2:
                    print(f'   note check {inst}: name {n} measured {m:.1f} (kept {cand})')
                midi = int(cand)
            fixed.append((midi, d))
        recs = fixed
        # one loudness for the instrument: the median of its notes, so each note is scaled toward it
        levels = [rms(d[int(SR * 0.2) : int(SR * 1.2)]) if kind != 'perc' else rms(d[: int(SR * 0.6)]) for _, d in recs]
        target = float(np.median(levels))
        seen = set()
        for (midi, d), lv in zip(recs, levels):
            if midi in seen:
                continue
            seen.add(midi)
            d = d * (target / lv)
            ls = 0
            if kind == 'sus':
                # the file name carries the start in whole milliseconds: the head is trimmed by the fraction of a millisecond, so the start found
                # (to the sample) lands exactly on one
                exact, length = pick_loop(d)
                trim = int(round((exact - np.floor(exact * 1000) / 1000) * SR))
                d = d[trim:]
                start = np.floor(exact * 1000) / 1000
                d = make_loop(level_loop(d, start, length), start, length)
                ls = int(round(start * 1000))
                # a soft attack on the very first samples removes a click
                k = int(SR * 0.004)
                d[:k] *= np.linspace(0, 1, k)
            else:
                n = int(SR * opt['dur'])
                d = d[:n]
                fade = int(SR * min(0.35, opt['dur'] * 0.25))
                d[-fade:] *= np.linspace(1, 0, fade)
            d = d / max(1e-9, np.abs(d).max()) * 0.8
            # a sustained note's name also carries its loop's length, in samples at 44.1 kHz (orchLoader.parseOrchName)
            out = OUT / (f'{inst}_{midi}_{ls}_{length}.mp3' if kind == 'sus' else f'{inst}_{midi}_{ls}.mp3')
            encode(d, out)
            total += out.stat().st_size
        print(f'{inst:11s} {len(seen):2d} samples')
    print(f'total {total / 1e6:.2f} MB -> {OUT}')


if __name__ == '__main__':
    main()
