"""Candidate footstep sets for Pokey (polish-sfx, 2026-10-30; Matt: "I don't like the walking sound... It sounds like somebody chewing").
Today's forest step is cut from people walking on dry leaves: a crunch in the 1-4 kHz band, which is where chewing lives. Each candidate
here is a slow, soft sloth padding instead: a low, muffled body thump, a little hand-on-cloth or leaf brush on top, nothing crunchy or
wet, and a separate wood version (a soft hollow knock) for planks and branches.

    python3 tools/audio/sfxv1/footcand.py <full-band clips dir> <out dir> [soft-steps clips dir]

Writes <set>-<surface>_<n>.wav (the takes) and <set>-walkrun.mp3 / .wav (walk, then run, on leaves then on wood, at the game's own step
spacing: a step every 52 px, at a walk ~0.45 s apart and at a full run (285 px/s) 0.18 s apart), plus today's for comparison.
"""
import glob, json, os, sys
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
CLIPS, OUT = sys.argv[1], sys.argv[2]
SOFT = sys.argv[3] if len(sys.argv) > 3 else None
sys.argv = [sys.argv[0], CLIPS, OUT, '--fullband']
sys.path.insert(0, HERE)
import build as B   # noqa: E402  (the recipes' sources and helpers; its main does not run on import)
from kit import fade, hp, lp, mix, rate, write_mp3, write_wav, SR   # noqa: E402
from measure import lufs, load   # noqa: E402

os.makedirs(OUT, exist_ok=True)
rng = np.random.default_rng(30)


def phone(x):
    """roughly what a phone's speaker plays: little under 300 Hz"""
    return hp(x, 300, 2)


def loud(x):
    """the loudness of one short take as a phone plays it (padded to 0.6 s, so the meter has a block to read)"""
    p = np.zeros(int(0.6 * SR), np.float32)
    x = phone(x)
    p[: min(len(x), len(p))] = x[: len(p)]
    v = lufs(p)
    return -70.0 if v is None else v


def at(x, target):
    return (x * 10 ** ((target - loud(x)) / 20)).astype(np.float32)


def soften(x, attack=0.008, cut=None):
    """a footfall's click softened: a slower attack, and the top rolled off"""
    if cut:
        x = lp(x, cut, 4, scale=False)
    return fade(x, attack, 0.06)


# the sources (all CC0, full-band originals; ids in build.py)
thumps = B.slices_of(B.THUD, 0.3, 0.3, 0.2, top=8)
cloth = B.slices_of(B.CLOTH, 0.18, 0.25, 0.1, top=10)
knocks = B.slices_of(B.KNOCK, 0.2, 0.25, 0.1, top=8)
wood_steps = B.slices_of(B.STEP_WOOD, 0.24, 0.2, 0.18, top=10)
forest = B.slices_of(B.STEP_FOREST, 0.26, 0.2, 0.18, top=12)


LEAF_SLICES = B.slices_of(B.LEAVES, 0.24, 0.2, 0.15)


def smooth(x, ms=12):
    """a rustle with its crackle smoothed away: the sound is kept, its fast flicker of tiny clicks evened out by riding its
    envelope (a 12 ms average) instead of the raw peaks"""
    k = max(1, int(ms / 1000 * SR))
    env = np.sqrt(np.convolve(x ** 2, np.ones(k) / k, mode='same')) + 1e-6
    fast = np.sqrt(np.convolve(x ** 2, np.ones(16) / 16, mode='same')) + 1e-6
    return (x * np.minimum(1.0, env / fast)).astype(np.float32)


def brush(i, dur=0.16, cut=1800):
    """a foot brushing leaves: a slow swell, no crackle"""
    x = LEAF_SLICES[i % len(LEAF_SLICES)][: int(dur * SR)]
    return fade(lp(smooth(hp(x, 300)), cut, 4, scale=False), 0.03, 0.07)


def pad(i, r):
    """a soft body thump: a thud, slowed, its click and its sub-bass (which no phone plays) taken off"""
    return soften(lp(hp(rate(thumps[i % len(thumps)], r), 140), 1100, 4, scale=False), 0.01)


SETS = {}

# A: "padded paws": a low, soft thump with the faintest cloth brush; on wood, the same thump with a muffled hollow knock
leaf, wood = [], []
for i in range(6):
    r = rng.uniform(0.78, 0.9)
    leaf.append(mix((pad(i, r), 0, 0), (fade(lp(smooth(hp(cloth[i % len(cloth)], 300)), 1800, 4, scale=False), 0.02, 0.06), 0.004, -6),
                    (brush(i), 0.01, -14)))
    wood.append(mix((pad(i + 2, r), 0, -3), (soften(lp(hp(rate(knocks[i % len(knocks)], 0.75), 200), 1500, 4, scale=False), 0.004), 0, 0)))
SETS['A'] = ('Padded paws', 'A low, soft thump, like a padded paw settling, with the faintest brush of fur. On wood: the same thump '
             'and a muffled hollow knock.', leaf, wood)

# B: "leaf brush": the foot brushing through leaves and moss (a slow swish, no crunch) over a very light thump
leaf, wood = [], []
for i in range(6):
    r = rng.uniform(0.85, 0.95)
    leaf.append(mix((brush(i, 0.2, 2000), 0, 6), (pad(i, r), 0.02, -6)))
    wood.append(mix((soften(lp(hp(rate(wood_steps[i % len(wood_steps)], 0.85), 160), 1700, 4, scale=False), 0.006), 0, 0),
                    (brush(i + 3, 0.14, 1800), 0.01, -8)))
SETS['B'] = ('Leaf brush', 'The foot brushing through moss and leaves, a slow swish with a very light thump under it, no crunch. On '
             'wood: a real foot on boards, muffled.', leaf, wood)

# C: "muffled forest": today's real forest-floor steps with the crunch taken out (low-passed at 1.4 kHz, slowed, softer attack)
leaf, wood = [], []
for i in range(6):
    r = rng.uniform(0.8, 0.88)
    leaf.append(soften(lp(hp(rate(forest[i], r), 150), 1400, 4, scale=False), 0.012))
    wood.append(soften(lp(hp(rate(wood_steps[i + 2], r), 160), 1500, 4, scale=False), 0.006))
SETS['C'] = ('Muffled forest', "Today's real forest-floor footsteps with the crunch taken out: only their low, muffled part, slowed a "
             'little. On wood: real steps on boards, the same way.', leaf, wood)

if SOFT:
    # D: real soft footfalls (barefoot, paws, sneaking: the soft-steps scan), their top rolled off
    files = sorted(glob.glob(os.path.join(SOFT, '*.ogg')))
    pool = []
    for f in files:
        x = load(f)
        pool += B.slices(x, 0.28, 0.25, 0.2)[:4]   # (a few from each recording, so no one walker dominates)
    if pool:
        pool.sort(key=lambda s: -np.abs(s).max())
        leaf = [mix((soften(lp(hp(rate(s, 0.9), 70), 1600, 4, scale=False), 0.008), 0, 0), (brush(i, 0.14, 2000), 0.01, -18))
                for i, s in enumerate(pool[:6])]
        wood = [mix((soften(lp(hp(rate(s, 0.85), 70), 1600, 4, scale=False), 0.006), 0, 0),
                    (soften(lp(hp(rate(knocks[i % len(knocks)], 0.75), 150), 1000, 4, scale=False), 0.004), 0, -8))
                for i, s in enumerate(pool[6:12] or pool[:6])]
        SETS['D'] = ('Bare feet', 'Real recordings of bare feet and soft paws, their top rolled off, with a wisp of leaf. On wood: the '
                     'same footfall with a muffled knock.', leaf, wood)

# today's (the game's takes and gains), for comparison
def todays(fx):
    import re
    ts = open(os.path.join(HERE, '..', '..', '..', 'src', 'audio', 'sfxRecLevels.ts')).read()
    gains = json.loads(re.search(fx + r': (\[[^\]]*\])', ts).group(1))
    takes = [load(f) for f in sorted(glob.glob(os.path.join(sys.argv_today, f'{fx}_*.wav')), key=lambda p: int(p.rsplit('_', 1)[1][:-4]))]
    return [(t * 10 ** ((g - 6) / 20)).astype(np.float32) for t, g in zip(takes, gains)]


sys.argv_today = os.environ.get('TODAY', '/tmp/claude-0/sfx/new2')
today_leaf, today_wood = todays('stepMoss'), todays('stepWood')
# today's loudness per step, as it plays (take gain and the -6 dB mix); the candidates sit 4 dB under it
ref = float(np.mean([loud(t) for t in today_leaf + today_wood]))
QUIET = -4.0


def walkrun(leaf, wood, seed):
    """walk 6 steps then run 10, on leaves; then the same on wood. Every step gets the game's own jitter (pitch +-4%, gain +-1.5 dB)
    from a shuffle bag, as sfxRec.ts plays them"""
    r = np.random.default_rng(seed)
    events, t = [], 0.3
    for takes in (leaf, wood):
        for gap, n in ((0.45, 6), (0.18, 10)):
            bag = []
            for _ in range(n):
                if not bag:
                    bag = list(r.permutation(len(takes)))
                x = rate(takes[bag.pop()], 1 + r.uniform(-0.04, 0.04))
                events.append((x * 10 ** (r.uniform(-1.5, 1.5) / 20), t))
                t += gap
            t += 0.6
        t += 0.6
    out = np.zeros(int((t + 0.5) * SR), np.float32)
    for x, s in events:
        a = int(s * SR)
        out[a: a + len(x)] += x[: len(out) - a]
    return out


meta = {'ref_lufs': round(ref, 1), 'sets': {}}
for key, (name, words, leaf, wood) in SETS.items():
    leaf = [at(x, ref + QUIET) for x in leaf]
    wood = [at(x, ref + QUIET) for x in wood]
    for surf, takes in (('leaf', leaf), ('wood', wood)):
        for i, x in enumerate(takes):
            write_wav(os.path.join(OUT, f'{key}-{surf}_{i}.wav'), x)
    w = walkrun(leaf, wood, 7)
    write_wav(os.path.join(OUT, f'{key}-walkrun.wav'), w)
    write_mp3(os.path.join(OUT, f'{key}-walkrun.mp3'), w, kbps=96, sr=32000)
    meta['sets'][key] = {'name': name, 'words': words}
w = walkrun(today_leaf, today_wood, 7)
write_wav(os.path.join(OUT, 'today-walkrun.wav'), w)
write_mp3(os.path.join(OUT, 'today-walkrun.mp3'), w, kbps=96, sr=32000)
json.dump(meta, open(os.path.join(OUT, 'sets.json'), 'w'), indent=1)
print(json.dumps(meta, indent=1))
