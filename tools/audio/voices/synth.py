"""The story's voices (story-delivery, Matt 2026-10-30): a short babble per character, Celeste / Animal Crossing style. Each character
gets a handful of sung-spoken syllables made here by formant synthesis (a glottal pulse through vowel resonances, with consonant onsets
of noise or hum), in their own pitch, speed, size of throat and grain: Pokey low and slow, Dot fast and chirpy, Meeca warm, the General
gravel, Pell nervous, each guardian their own. No recordings, no licences.

Each character's takes are written back to back, with silence between, into one small mp3 (src/assets/voices/<slug>.mp3); voice.ts cuts
them apart at the silences once it has decoded the file. The table of who has how many takes is src/audio/voiceData.ts (written here too).

    python3 tools/audio/voices/synth.py [--wav <dir>]   (needs numpy and ffmpeg)
"""
import json, math, os, subprocess, sys, tempfile
import numpy as np

SR = 24000
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
OUT = os.path.join(ROOT, 'src', 'assets', 'voices')
GAP = 0.12  # silence between takes in the file (s)

# vowel formants (Hz, adult male; a character's `size` scales them: a smaller throat, higher formants)
VOWELS = {
    'a': (730, 1090, 2440, 3400), 'e': (530, 1840, 2480, 3500), 'i': (300, 2200, 2950, 3600), 'o': (570, 840, 2410, 3300),
    'u': (330, 870, 2240, 3300), 'ae': (660, 1720, 2410, 3400), 'uh': (640, 1190, 2390, 3400), 'oo': (440, 1020, 2240, 3300),
}
BW = (80, 100, 140, 200)

# onset: kind, centre freq (noise) or formants (voiced glide)
ONSETS = {
    '': None, 'm': ('nasal', 250), 'n': ('nasal', 300), 'b': ('vburst', 600), 'd': ('vburst', 1700), 'g': ('vburst', 2200),
    'p': ('burst', 900), 't': ('burst', 4000), 'k': ('burst', 2000), 's': ('hiss', 6000), 'sh': ('hiss', 3000), 'h': ('breath', 1500),
    'l': ('glide', (360, 1300, 2700, 3400)), 'w': ('glide', (300, 700, 2200, 3300)), 'y': ('glide', (280, 2250, 3000, 3600)),
    'r': ('glide', (420, 1300, 1600, 3200)), 'f': ('hiss', 4500), 'ch': ('hiss', 3500),
}


def resonator(x, f, bw, sr=SR):
    """a Klatt two-pole resonator; f and bw may be arrays (per sample)"""
    n = len(x)
    f = np.broadcast_to(np.asarray(f, float), (n,))
    bw = np.broadcast_to(np.asarray(bw, float), (n,))
    r = np.exp(-math.pi * bw / sr)
    c = -r * r
    b = 2 * r * np.cos(2 * math.pi * f / sr)
    a = 1 - b - c
    y = np.zeros(n)
    y1 = y2 = 0.0
    for i in range(n):
        v = a[i] * x[i] + b[i] * y1 + c[i] * y2
        y[i] = v
        y2, y1 = y1, v
    return y


def bandnoise(n, fc, q, rng):
    return resonator(rng.standard_normal(n) * 0.3, fc, fc / q)


def glottal(f0, rng, v):
    """the pulse train for a pitch curve f0 (per sample): Rosenberg pulses, differentiated, with jitter, shimmer and (for gravel) fry"""
    n = len(f0)
    out = np.zeros(n)
    ph = 0.0
    amp = 1.0
    per_jit = 1.0
    k = 0
    fry = v.get('fry', 0.0)
    tp, tn = 0.42, 0.16
    for i in range(n):
        ph += f0[i] * per_jit / SR
        if ph >= 1.0:
            ph -= 1.0
            k += 1
            per_jit = 1 + rng.normal(0, 0.006 + 0.07 * fry)
            amp = max(0.2, 1 + rng.normal(0, 0.03 + 0.35 * fry))
            if fry and k % 2:
                amp *= 1 - 0.55 * fry  # every other pulse weaker: the creak
        if ph < tp:
            g = 0.5 * (1 - math.cos(math.pi * ph / tp))
        elif ph < tp + tn:
            g = math.cos(0.5 * math.pi * (ph - tp) / tn)
        else:
            g = 0.0
        out[i] = g * amp
    d = np.diff(out, prepend=0.0)
    return d / (np.max(np.abs(d)) + 1e-9)


def env(n, a, r):
    e = np.ones(n)
    na, nr = max(1, int(a * SR)), max(1, int(r * SR))
    e[:na] = np.linspace(0, 1, na) ** 1.5
    e[-nr:] *= np.linspace(1, 0, nr) ** 2
    return e


def syllable(v, onset, vowel, rng, pitch_end=1.0, stutter=False):
    dur = v['dur'] * rng.uniform(0.88, 1.12)
    size = v['size']
    n = int(dur * SR)
    t = np.arange(n) / SR
    # the pitch: the character's own, a glide over the syllable, vibrato
    f0 = v['f0'] * rng.uniform(0.97, 1.03) * np.linspace(1.0, v.get('glide', 1.0) * pitch_end, n)
    if v.get('vib'):
        depth, rate = v['vib']
        f0 = f0 * (1 + depth * np.sin(2 * math.pi * rate * t + rng.uniform(0, 6.28)))
    src = glottal(f0, rng, v)
    br = v.get('breath', 0.08)
    noise = rng.standard_normal(n) * 0.5
    src = src * (1 - 0.6 * min(1, br)) + noise * br * (0.35 + 0.65 * np.abs(src))
    # formants: from the onset's (a glide) or the vowel's own, scaled by the throat size
    vf = np.array(VOWELS[vowel], float) * size
    o = ONSETS[onset]
    trans = min(n, int(0.045 * SR))
    fs = []
    for j in range(4):
        f = np.full(n, vf[j])
        if o and o[0] == 'glide':
            f[:trans] = np.linspace(o[1][j] * size, vf[j], trans)
        elif o and o[0] in ('vburst', 'nasal') and j < 2:
            f[:trans] = np.linspace(vf[j] * 0.75, vf[j], trans)
        if v.get('wobble'):
            f = f * (1 + v['wobble'] * np.sin(2 * math.pi * 11 * t))
        fs.append(f)
    gains = v.get('fgain', (1.0, 0.8, 0.45, 0.25))
    y = np.zeros(n)
    for j in range(4):
        y += gains[j] * resonator(src, fs[j], BW[j] * (1 + 0.6 * br))
    y *= env(n, v.get('attack', 0.012), v.get('release', 0.05))
    # the onset, in front of the vowel
    pre = np.zeros(0)
    if o:
        kind, p = o
        if kind == 'nasal':
            m = int(0.045 * SR)
            h = resonator(glottal(np.full(m, f0[0]), rng, v), p * size, 100) * 0.6
            pre = h * env(m, 0.01, 0.01)
        elif kind == 'hiss':
            m = int(0.055 * SR)
            pre = bandnoise(m, min(9000, p * min(size, 1.3)), 2.5, rng) * env(m, 0.02, 0.012) * 1.2
        elif kind == 'breath':
            m = int(0.04 * SR)
            pre = bandnoise(m, p, 1.2, rng) * env(m, 0.01, 0.01) * 0.6
        elif kind in ('burst', 'vburst'):
            m = int((0.012 if kind == 'vburst' else 0.022) * SR)
            pre = bandnoise(m, min(8000, p * size), 1.8, rng) * env(m, 0.001, 0.008) * (1.4 if kind == 'burst' else 0.8)
    s = np.concatenate([pre, y])
    if stutter:
        # Pell: the first sound twice, fast ("b-b-but")
        cut = s[: int(0.06 * SR)] * env(int(0.06 * SR), 0.004, 0.02)
        s = np.concatenate([cut, np.zeros(int(0.03 * SR)), s])
    if v.get('purr'):
        tt = np.arange(len(s)) / SR
        s = s * (1 - v['purr'] * 0.5 * (1 + np.sin(2 * math.pi * 26 * tt)))
    if v.get('crackle'):
        clicks = (rng.random(len(s)) < v['crackle'] / SR) * rng.uniform(-1, 1, len(s)) * 2.5
        s = s + resonator(clicks, 2500, 1500) * 0.5
    return s


def lowpass(x, fc):
    # a gentle one-pole, twice
    a = math.exp(-2 * math.pi * fc / SR)
    for _ in range(2):
        y = np.zeros_like(x)
        p = 0.0
        for i in range(len(x)):
            p = (1 - a) * x[i] + a * p
            y[i] = p
        x = y
    return x


def highpass(x, fc):
    a = math.exp(-2 * math.pi * fc / SR)
    y = np.zeros_like(x)
    px = py = 0.0
    for i in range(len(x)):
        py = a * (py + x[i] - px)
        px = x[i]
        y[i] = py
    return y


# who sounds how. f0 Hz, dur s per syllable, size = throat (formant scale), glide = pitch over a syllable, breath, fry (gravel), vib
# (depth, rate), lp = the top of the voice; `sylls` = the onset+vowel takes. `gap` (ms) and `every` (letters) are how often a syllable
# plays while a line types, `type` (ms a letter) how fast the line types: voiceData.ts carries them to the game.
V = {
    'pokey': dict(f0=118, dur=0.20, size=0.94, glide=0.93, breath=0.16, lp=2600, attack=0.03, release=0.09,
                  sylls=['m-o', 'h-uh', 'b-oo', 'n-a', 'w-o', 'l-uh', 'm-u', 'h-o'], gap=170, every=4, type=40, level=-19),
    'dot': dict(f0=470, dur=0.075, size=1.42, glide=1.10, breath=0.06, lp=7000, attack=0.006, release=0.03,
                sylls=['d-i', 't-e', 'p-i', 'b-ae', 'd-e', 'k-i', 'ch-i', 't-a', 'w-i', 'y-e'], gap=62, every=2, type=22, level=-21),
    'meeca': dict(f0=275, dur=0.13, size=1.18, glide=0.97, breath=0.14, lp=4200, attack=0.02, release=0.06, vib=(0.012, 5.5),
                  sylls=['m-e', 'l-a', 'n-i', 'y-o', 'h-a', 'w-e', 'm-a', 'l-i'], gap=120, every=3, type=32, level=-20),
    'general': dict(f0=86, dur=0.15, size=0.85, glide=0.9, breath=0.12, fry=0.75, lp=2400, attack=0.008, release=0.05,
                    sylls=['g-uh', 'r-o', 'k-a', 'd-uh', 'h-a', 'b-o', 't-uh', 'g-a'], gap=150, every=4, type=36, level=-18),
    'pell': dict(f0=178, dur=0.085, size=1.0, glide=1.06, breath=0.1, vib=(0.045, 8.5), fgain=(1.0, 0.95, 0.6, 0.25), lp=3800,
                 attack=0.006, release=0.03, sylls=['b-uh', 'p-e', 'm-i', 'b-e', 'w-e', 'n-uh', 'p-a', 'y-e'], stutter=[0, 4], gap=80, every=2, type=27,
                 level=-20),
    'grandma': dict(f0=205, dur=0.16, size=1.1, glide=0.95, breath=0.24, vib=(0.03, 5.0), lp=3200, attack=0.025, release=0.08,
                    sylls=['h-o', 'm-a', 'n-e', 'l-oo', 'w-a', 'd-e', 'h-uh', 'm-o'], gap=150, every=4, type=38, level=-20),
    'grandfather': dict(f0=98, dur=0.16, size=0.9, glide=0.94, breath=0.14, fry=0.25, lp=2600, attack=0.02, release=0.08,
                        sylls=['h-o', 'm-uh', 'n-a', 'w-o', 'b-uh', 'l-a', 'h-a', 'd-o'], gap=150, every=4, type=36, level=-19),
    'flicker': dict(f0=690, dur=0.05, size=1.6, glide=1.05, breath=0.05, vib=(0.06, 30), lp=8000, attack=0.003, release=0.02,
                    sylls=['b-i', 's-i', 't-i', 'p-e', 'd-i', 'w-i'], gap=55, every=2, type=24, level=-23),
    'squirrel': dict(f0=520, dur=0.06, size=1.5, glide=1.08, breath=0.08, lp=7000, attack=0.003, release=0.02,
                     sylls=['ch-i', 't-ae', 'k-i', 'ch-e', 't-i', 'p-ae'], gap=58, every=2, type=22, level=-22),
    # one of the General's soldiers: gruff, clipped, a little bored
    'soldier': dict(f0=124, dur=0.1, size=0.92, glide=0.93, breath=0.12, fry=0.3, lp=3000, attack=0.006, release=0.04,
                    sylls=['g-uh', 'd-a', 'h-o', 'k-uh', 't-a', 'b-uh'], gap=110, every=3, type=30, level=-19),
    # the village crier: old, booming, in no hurry at all, a tremble in it
    'crier': dict(f0=132, dur=0.21, size=0.93, glide=0.96, breath=0.12, vib=(0.04, 4.2), fgain=(1.0, 0.9, 0.6, 0.3), lp=3400, attack=0.02,
                  release=0.09, sylls=['h-o', 'y-e', 'f-uh', 'l-oo', 'd-a', 'w-o'], gap=190, every=4, type=46, level=-18),
    # the guardians
    'thornbark': dict(f0=68, dur=0.22, size=0.78, glide=0.92, breath=0.16, fry=0.95, lp=1900, attack=0.03, release=0.1,
                      sylls=['g-o', 'r-uh', 'k-oo', 'b-o', 'h-uh', 'd-oo'], gap=200, every=4, type=40, level=-18),
    'venom': dict(f0=150, dur=0.12, size=1.0, glide=0.97, breath=0.6, lp=6000, attack=0.01, release=0.06,
                  sylls=['s-i', 'sh-a', 's-e', 'h-i', 's-uh', 'sh-i'], gap=110, every=3, type=34, level=-21),
    'croc': dict(f0=78, dur=0.17, size=0.8, glide=0.93, breath=0.12, fry=0.35, wobble=0.05, lp=2000, attack=0.02, release=0.08,
                 sylls=['g-uh', 'b-a', 'r-o', 'm-uh', 'g-o', 'w-a'], gap=160, every=4, type=36, level=-18),
    'prowler': dict(f0=104, dur=0.14, size=0.9, glide=0.95, breath=0.38, purr=0.5, lp=2600, attack=0.02, release=0.07,
                    sylls=['m-uh', 'r-o', 'h-a', 'n-uh', 'w-o', 'h-o'], gap=135, every=3, type=36, level=-19),
    'sky': dict(f0=205, dur=0.1, size=1.06, glide=1.02, breath=0.06, fgain=(1.0, 0.9, 0.7, 0.4), lp=5200, attack=0.006, release=0.04,
                sylls=['k-a', 't-e', 'g-a', 'p-o', 'k-e', 'r-a'], gap=100, every=3, type=30, level=-20),
    'queen': dict(f0=228, dur=0.12, size=1.1, glide=0.94, breath=0.12, vib=(0.028, 6.2), fgain=(1.0, 1.0, 0.6, 0.35), lp=4800, attack=0.01,
                  release=0.06, sylls=['d-a', 'l-i', 'm-a', 'n-e', 'h-a', 't-e'], gap=115, every=3, type=33, level=-20),
    'reaver': dict(f0=106, dur=0.15, size=0.88, glide=0.95, breath=0.2, wobble=0.09, lp=2200, attack=0.02, release=0.07,
                   sylls=['b-uh', 'g-o', 'm-uh', 'b-o', 'l-uh', 'g-uh'], gap=150, every=4, type=36, level=-19),
    'golem': dict(f0=56, dur=0.26, size=0.74, glide=0.96, breath=0.08, fry=0.6, lp=1500, attack=0.04, release=0.12,
                  sylls=['d-o', 'g-uh', 'm-o', 'b-oo', 'h-uh'], gap=240, every=5, type=44, level=-18),
    'monarch': dict(f0=255, dur=0.14, size=1.14, glide=0.96, breath=0.5, vib=(0.02, 4.5), lp=4500, attack=0.03, release=0.08,
                    sylls=['h-a', 'w-e', 'l-i', 'h-o', 's-e', 'n-a'], gap=135, every=3, type=36, level=-21),
    'drake': dict(f0=80, dur=0.16, size=0.84, glide=0.9, breath=0.18, fry=0.65, crackle=60, lp=2600, attack=0.01, release=0.07,
                  sylls=['g-a', 'r-uh', 'k-o', 'h-a', 'd-uh', 'b-a'], gap=150, every=4, type=34, level=-18),
}

# the story's speaker names to the voices (the Narrator has none: the narration is read, not spoken)
SPEAKERS = {
    'Pokey': 'pokey', 'Dot': 'dot', 'Meeca': 'meeca', 'General Iron-Claw': 'general', 'Lieutenant Pell': 'pell', 'Grandma': 'grandma',
    'Grandfather': 'grandfather', 'Gruntlewick': 'crier', 'Soldier': 'soldier', 'Flicker': 'flicker', 'Squirrel': 'squirrel', 'Thornbark': 'thornbark', 'Venom Fang': 'venom',
    'Crocus Rex': 'croc', 'Shadow Prowler': 'prowler', 'Sky Sovereign': 'sky', 'Tarantula Queen': 'queen', 'Marsh Reaver': 'reaver',
    'Stone Idol Golem': 'golem', 'Night-Wing Monarch': 'monarch', 'Magma Drake': 'drake',
}


def render(slug, v):
    rng = np.random.default_rng(sum(map(ord, slug)) * 7919)
    takes = []
    for k, sy in enumerate(v['sylls']):
        onset, vowel = sy.split('-')
        s = syllable(v, onset, vowel, rng, stutter=k in v.get('stutter', []))
        s = highpass(s, 140)
        s = lowpass(s, v['lp'])
        # each take at the character's loudness (RMS of the voiced part)
        rms = math.sqrt(float(np.mean(s[np.abs(s) > 0.05 * np.max(np.abs(s))] ** 2)))
        s = s * (10 ** (v['level'] / 20) / (rms + 1e-9))
        peak = np.max(np.abs(s))
        if peak > 0.89:
            s = s * 0.89 / peak
        takes.append(s)
    return takes


def main():
    wav_dir = sys.argv[sys.argv.index('--wav') + 1] if '--wav' in sys.argv else None
    only = sys.argv[sys.argv.index('--only') + 1].split(',') if '--only' in sys.argv else None
    os.makedirs(OUT, exist_ok=True)
    table = {}
    for slug, v in V.items():
        if only and slug not in only:
            continue
        takes = render(slug, v)
        gap = np.zeros(int(GAP * SR))
        body = np.concatenate([np.concatenate([gap, t]) for t in takes] + [gap])
        pcm = (np.clip(body, -1, 1) * 32767).astype('<i2').tobytes()
        with tempfile.NamedTemporaryFile(suffix='.raw', delete=False) as f:
            f.write(pcm)
            raw = f.name
        mp3 = os.path.join(OUT, f'{slug}.mp3')
        subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-f', 's16le', '-ar', str(SR), '-ac', '1', '-i', raw, '-codec:a', 'libmp3lame',
                        '-b:a', '40k', mp3], check=True)
        if wav_dir:
            os.makedirs(wav_dir, exist_ok=True)
            subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-f', 's16le', '-ar', str(SR), '-ac', '1', '-i', raw, os.path.join(wav_dir, f'{slug}.wav')], check=True)
        os.remove(raw)
        table[slug] = dict(takes=len(takes), gap=v['gap'], every=v['every'], type=v['type'])
        print(f'{slug:12s} {len(takes)} takes, {os.path.getsize(mp3)} bytes')
    if only:
        return
    ts = ['/** written by tools/audio/voices/synth.py: each voice\'s takes (in src/assets/voices/<slug>.mp3), the shortest gap between two syllables',
          ' *  (ms), a syllable every `every` letters, and how fast its lines type (ms a letter) */',
          'export interface VoiceSpec { takes: number; gap: number; every: number; type: number }',
          'export const VOICES: Readonly<Record<string, VoiceSpec>> = {']
    for slug, t in table.items():
        ts.append(f"  {slug}: {{ takes: {t['takes']}, gap: {t['gap']}, every: {t['every']}, type: {t['type']} }},")
    ts.append('};')
    ts.append('/** the story\'s speakers to their voices (the Narrator has none: the narration is read, not spoken) */')
    ts.append('export const SPEAKER_VOICE: Readonly<Record<string, string>> = {')
    for name, slug in SPEAKERS.items():
        ts.append(f"  {json.dumps(name) if '-' in name or ' ' in name else name}: '{slug}',")
    ts.append('};')
    open(os.path.join(ROOT, 'src', 'audio', 'voiceData.ts'), 'w').write('\n'.join(ts).replace('"', "'") + '\n')


if __name__ == '__main__':
    main()
