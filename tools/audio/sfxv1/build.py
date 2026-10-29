"""Build the recorded effect set from the CC0 Freesound clips (polish-sfx, 2026-10-29).

    python3 tools/audio/sfxv1/build.py <clips dir> <out dir> [effect ...]

<clips dir> holds the unpacked clips (<cat>__<freesound id>.ogg) that fsscan.py PASS=ids pulled for tagscan.py's picks: every source
is chosen by its uploader's own Freesound title and tags (the archive's AI captions proved wrong too often: a synth drum captioned as a
thud, a pint glass as crumbling rock). Each source below carries its title in a comment; LICENCES.md lists them all. Each effect is several takes (round-robin in the game), every take its own mix of layers
from different recordings with its own pitch, so a run of them never repeats. Takes are levelled to the effect's LUFS (variants within
1.5 dB) with peaks at -1 dBFS or under, and written as <name>_<n>.wav (previews) and <name>_<n>.mp3 (game).
"""
import glob, json, os, sys
import numpy as np
sys.path.insert(0, os.path.dirname(__file__))
from kit import *

CLIPS, OUT = sys.argv[1], sys.argv[2]
ONLY = set(sys.argv[3:])
rng = np.random.default_rng(29)
USED = {}


def src(fid):
    """a source clip by Freesound id (any category)"""
    hits = glob.glob(os.path.join(CLIPS, '**', f'*__{fid}.ogg'), recursive=True)
    if not hits:
        raise FileNotFoundError(fid)
    USED.setdefault(int(fid), os.path.basename(hits[0]).split('__')[0])
    return load(hits[0])


def hits(x, thr=0.2, mingap=0.12, n=128):
    """the onsets (seconds) of separate events in a recording (footsteps, mallet notes)"""
    k = len(x) // n
    r = np.sqrt((x[: k * n].reshape(k, n) ** 2).mean(1))
    d = np.diff(np.concatenate([[0], r]))
    d[d < 0] = 0
    t = thr * d.max()
    out, last = [], -1e9
    for i, v in enumerate(d):
        if v > t and (i - last) * n / SR > mingap and v == d[max(0, i - 3): i + 4].max():
            out.append(i * n / SR)
            last = i
    return out


def seg_id(fid, start, dur):
    """a stretch of a recording by id, for slices()"""
    return seg(src(fid), start, dur)


def slices(fid, dur=0.3, thr=0.2, mingap=0.15, pre=0.006):
    """each separate event of a recording (by id, or a signal already cut), cut to `dur` (or to the next event) with a short fade"""
    x = src(fid) if not isinstance(fid, np.ndarray) else fid
    on = hits(x, thr, mingap)
    out = []
    for i, t in enumerate(on):
        nxt = on[i + 1] if i + 1 < len(on) else len(x) / SR
        s = seg(x, max(0, t - pre), min(dur, nxt - t - 0.004))
        if len(s) > 0.04 * SR:
            out.append(fade(s, 0.001, min(0.06, len(s) / SR / 3)))
    return out


def level(takes, lufs_target):
    """each take to the effect's loudness; a take that came out (nearly) silent is left out"""
    out = []
    for t in takes:
        if len(t) and np.abs(t).max() > 1e-3 and lufs(t) is not None:
            out.append(to_lufs(t, lufs_target))
    return out




def loudest(x, dur, hop=0.02, at=False):
    """the `dur` s stretch of a recording with the most energy (the call itself, not the room around it); at=True also gives where"""
    n, h = int(dur * SR), int(hop * SR)
    if len(x) <= n:
        return (x, 0) if at else x
    e = np.convolve(x.astype(np.float64) ** 2, np.ones(n), 'valid')[::h]
    i = int(np.argmax(e)) * h
    return (x[i: i + n], i) if at else x[i: i + n]


def seg_id(fid, start, dur):
    return seg(src(fid), start, dur)


# ------------------------------------------------------------------------------------------------- the sources, by Freesound title

ROCK_HIT = [350750, 350749, 504959, 390838]           # "stonehit1", "stonehit2", "Đánh Đá" (hitting stone), "RockBang02"
ROCK_FALL = [381645, 336023, 162671, 17809]          # "RockFall1b", "Rocks" (boulders, pebbles), "avl01" (rock rubble), "Terra" (earth, pebbles)
DIG = [593896, 593893, 593892, 593895]               # "dig6/3/4/1" (debris, mining)
THUD = [207824, 494926, 464527, 339832, 426316, 125391]   # "Thump" (heavy fall, jump landing), "Thud", "jump" (thud), "thud", "Hits", "Punch"
STEP_FOREST = [181728, 328844, 534365, 426315]       # "footsteps" (woods), "ZOOM0002" (forest walking), "Walking" (forest leaves), "Grass"
STEP_WOOD = [208104, 277162, 567953, 390685]         # "Wood Steps", "Shed Floor", "Steps" (wood), "PasosMadera"
STEP_STONE = [231851, 511782, 249808, 169147]        # "Walk Stone", "rock fs" (pebbles, rocks), "Footsteps" (cave, rock), "Footsteps" (gravel)
STEP_WATER = [553241, 583756, 106395, 468131, 455057, 167927]   # "Wet Footsteps", "wet footsteps", "puddlewalk", "Puddle", "footsteps-mud", "Squelch" (puddle)
MARIMBA = {48: 577692, 50: 577695, 52: 577699, 53: 577700, 55: 577701, 57: 577688, 59: 577686, 60: 577691}   # notes C3..C4, one by one
KNOCK = [623079, 243033, 114682, 114683, 57925]      # "knock" (wooden desk), "Knock", "whack01/02" (a stick), "tree 01" (hitting a tree)
LOG = [575904, 316728, 457263, 326299]               # "Throwing logs", "Bois-empile" (piling logs), "Sticks Dropping", "Falling Bamboo"
LEAVES = [464693, 551040, 551044, 551045, 489957]    # "treeshake", "Blätters 06/08/11" (branch leaves), "Branches"
AIR = [264467, 264468, 369698, 262829, 72189, 72190]  # "Air 01/02" (swish), "Whoosh" (swing), "Whoosh" (stick), "whip01/02" (fist through air)
WINGS = [530078, 631928, 631927, 545613, 472269]     # "flapping" (wings), "wings01", "wings 02", "WIngs#04", "01-Aleteo" (bird wings)
CLOTH = [399586, 100415, 429694, 429693]             # "jacket", "cloth 03", "Cloth 1", "Cloth 2"
ROPE = [455559, 596514, 231438, 288932]              # "swing ropes" (tree), "Rope Swinging", "hamp rope creaks", "knot-tieing"
CREAK = [509536, 346140, 154655, 13841]              # "Creaks" (wood), "Wood Creak", "Wood Creeks", "8" (wood creak)
SNAP = [183450, 319231, 152413, 322411]              # "Wood Crack 5" (tree), "Stick Snap 1", "Stick Snap1", "Twig Snap 04"
SPLASH = [530150, 396311, 396310, 521950, 207139]    # "POOL SPLASH 2" (dive), "watersplash", "watersplashing", "Water Impact" (puddle), "PuddleSplash"
SQUISH = [248253, 536765, 530617, 361030]            # "Splat!" (cabbage), "Squish", "Slime" (mud), "splat2"
BITE = [169188, 429976, 558384]                      # "apple" (bite, crunch), "Apple" (crunch), "pomme"
BIG = [512244, 536736]                               # "Thuds" (enormous impact), "Chop" (axe into wood)
THUNDER = [564990, 564989, 564987, 564991]           # "THS01/02/04/08" (storm field recording)


def slices_of(ids, dur, thr=0.2, mingap=0.15, top=None):
    """the separate events of several recordings, loudest first (a thud's sub-bass, which no phone plays, is cut at 70 Hz)"""
    pool = []
    for f in ids:
        pool += [hp(x, 70, 4) if ids is THUD else x for x in slices(f, dur, thr, mingap)]
    pool.sort(key=lambda s: -np.abs(s).max())
    return pool[:top] if top else pool


def note(m, dur=0.6, tau=0.25, lpf=2600):
    """a marimba note at MIDI m, from the nearest recorded note (C3..C4), moved by resampling; its top rolled off"""
    base = min(MARIMBA, key=lambda k: abs((m - k) % 12) + 0.01 * abs(m - k))
    x = trim(src(MARIMBA[base]), thr_db=-24, back=0.002)
    y = rate(x, 2 ** ((m - base) / 12))[: int(dur * SR)]
    return fade(env_decay(lp(hp(y, 120), lpf, 4), tau), 0.002, min(0.15, dur / 3))


def leafy(i, dur=0.3, lpf=4500):
    rs = slices_of(LEAVES, dur, 0.2, 0.15)
    return fade(lp(hp(rs[i % len(rs)], 500), lpf), 0.004, 0.08)


def airs():
    return [trim(seg(src(f), 0, 1.5), thr_db=-26) for f in AIR]


def stroke(i, r=1.0, dur=0.25, lo=300, hi=4500):
    a = airs()
    return fade(lp(hp(rate(loudest(a[i % len(a)], dur), r), lo), hi), 0.01, 0.08)


# ------------------------------------------------------------------------------------------------- the effects

def rock():
    """a falling stone landing (4-4 and every rockfall): a stone striking stone, a little rubble settling after. No ring."""
    hits_ = slices_of(ROCK_HIT, 0.5, 0.25, 0.2, top=10)
    grit = [loudest(src(f), 1.0) for f in ROCK_FALL]
    thud = slices_of(THUD, 0.4, 0.3, 0.2, top=6)
    out = []
    for i in range(6):
        h = fade(lp(hp(rate(hits_[i], rng.uniform(0.85, 1.0)), 80), 4500, 4), 0.003, 0.08)
        t = fade(sat(lp(thud[i % len(thud)], 1800), 1.4), 0.001, 0.08)
        g = fade(env_decay(lp(hp(grit[i % len(grit)], 400), 5500), 0.3), 0.04, 0.3)
        out.append(fade(mix((h, 0, 0), (t, 0, -6), (g, rng.uniform(0.06, 0.12), -14)), 0.001, 0.15))
    return level(out, -16)


def rockWarn():
    """the grit that trickles down just before a rock drops (a warning to hear, not only to see)"""
    out = []
    for f in DIG + [ROCK_FALL[3]]:
        x = loudest(src(f), 0.7)
        out.append(fade(lp(hp(x, 600), 4200), 0.1, 0.3))
    return level(out[:4], -28)


def flower():
    """a petal: one soft marimba note (real wood, its top rolled off), with a breath of leaves. Eight notes of a pentatonic, so a trail
    wanders instead of climbing."""
    out = []
    for i, m in enumerate([67, 69, 72, 74, 76, 79, 64, 71]):
        out.append(fade(mix((note(m, 0.55, 0.18, 2600), 0, 0), (leafy(i, 0.25), 0, -20)), 0.001, 0.1))
    return level(out, -24)


def steps(ids, dur, lpf, hpf, n, target, thr=0.2):
    pool = slices_of(ids, dur, thr, 0.18)[: n * 2]
    rng.shuffle(pool)
    return level([fade(lp(hp(rate(s, rng.uniform(0.95, 1.05)), hpf), lpf), 0.001, 0.05) for s in pool[:n]], target)


def stepMoss():
    """a soft footfall on the forest floor"""
    return steps(STEP_FOREST, 0.26, 4000, 120, 8, -30)


def stepWood():
    """a footfall on a branch or a plank: a hollow knock"""
    return steps(STEP_WOOD, 0.24, 4500, 100, 8, -29)


def stepStone():
    """a footfall on rock: a dry tap with a little grit"""
    return steps(STEP_STONE, 0.22, 5000, 120, 8, -30)


def stepWater():
    """a footfall in shallow water: a small slosh"""
    return steps(STEP_WATER, 0.32, 4500, 100, 6, -29)


def jump():
    """a hop: a push of air and cloth, and a scuff off the ground. Soft: it plays 30-50 times a minute."""
    cloth = slices_of(CLOTH, 0.15, 0.25, 0.08, top=8)
    scuff = slices_of(STEP_FOREST, 0.12, 0.2, 0.15, top=8)
    out = []
    for i in range(6):
        out.append(mix((fade(lp(hp(scuff[i], 150), 3500), 0.001, 0.04), 0, -2), (fade(lp(hp(cloth[i % len(cloth)], 300), 5000), 0.002, 0.05), 0.005, -4),
                       (stroke(i, rng.uniform(1.1, 1.3), 0.2), 0.01, -6)))
    return level(out, -30)


def doubleJump():
    """the second hop in mid-air: a flutter of wings"""
    out = []
    for i, f in enumerate(WINGS):
        w = loudest(src(f), 0.3)
        out.append(mix((fade(lp(hp(w, 300), 4500), 0.02, 0.1), 0, 0), (stroke(i + 1, 1.1, 0.25), 0, -8)))
    return level(out, -28)


def glide():
    """the Leaf Glide: 0 the leaf opens (a cloth snap and a gust), 1-3 a flutter while drifting, 4 it folds away"""
    cl = slices_of(CLOTH, 0.2, 0.25, 0.08, top=6)
    opn = mix((fade(lp(hp(cl[0], 300), 5000), 0.002, 0.06), 0, 0), (stroke(2, 1.0, 0.5, 200, 3500), 0.02, -5))
    flut = [fade(lp(hp(loudest(src(f), 0.45), 300), 4000), 0.05, 0.15) for f in WINGS[1:4]]
    fold = mix((fade(lp(hp(cl[1], 300), 4500), 0.01, 0.1), 0, 0), (leafy(3, 0.3), 0.02, -6))
    return [to_lufs(opn, -27), *[to_lufs(f, -34) for f in flut], to_lufs(fold, -31)]


def landing():
    """touching down, by how far he fell: small (a soft pad), medium (a thump and leaves), big (a heavy thump with grit). Two each"""
    th = slices_of(THUD, 0.5, 0.3, 0.2, top=6)
    pad = slices_of(STEP_FOREST, 0.25, 0.2, 0.15, top=4)
    grit = loudest(src(ROCK_FALL[1]), 0.6)
    out = []
    for i in range(2):
        out.append(to_lufs(fade(mix((lp(pad[i], 3000), 0, 0), (leafy(i, 0.25), 0.004, -10)), 0.001, 0.06), -29))
    for i in range(2):
        out.append(to_lufs(fade(mix((sat(lp(th[i], 2200), 1.3), 0, 0), (leafy(i + 2, 0.3), 0.004, -6)), 0.001, 0.08), -24))
    for i in range(2):
        g = fade(env_decay(lp(hp(grit, 600), 5000), 0.2), 0.02, 0.2)
        out.append(to_lufs(fade(mix((env_decay(sat(lp(th[(i + 2) % len(th)], 2000), 1.6), 0.15), 0, 0), (leafy(i + 4, 0.3), 0.004, -5), (g, 0.05, -14)), 0.001, 0.1), -19))
    return out


def vine():
    """grabbing a vine: a hand on rope, the leaves on it, and the vine creaking under his weight"""
    rp = [loudest(src(f), 0.25) for f in ROPE]
    cr = [loudest(src(f), 0.5) for f in CREAK]
    out = []
    for i in range(6):
        out.append(mix((fade(lp(hp(rp[i % 4], 150), 4000), 0.002, 0.06), 0, 0), (leafy(i, 0.3), 0.01, -10),
                       (fade(lp(hp(cr[i % 4], 120), 3000), 0.05, 0.2), 0.06, -9)))
    return level(out, -27)


def swish():
    """a punch or a kick through the air (the hit, if it lands, is its own sound)"""
    return level([stroke(i, rng.uniform(1.2, 1.45), 0.2, 400, 5000) for i in range(6)], -29)


def splash():
    """into the water: 0-1 a full plunge, 2-3 a body-sized splash, 4-5 a small dip"""
    big = [loudest(src(f), 1.3) for f in SPLASH[:2]]
    mid = [loudest(src(f), 0.7) for f in SPLASH[2:4]]
    small = [loudest(src(f), 0.4) for f in (SPLASH[4], STEP_WATER[2])]
    return (level([fade(lp(hp(x, 80), 6000), 0.002, 0.4) for x in big], -18) + level([fade(lp(hp(x, 120), 6000), 0.002, 0.25) for x in mid], -22)
            + level([fade(lp(hp(x, 150), 5500), 0.002, 0.12) for x in small], -27))


def checkpoint():
    """a flag: its cloth catching the wind, and two warm notes rising (a reward, so it may sing; softly)"""
    cl = slices_of(CLOTH, 0.4, 0.25, 0.1, top=3)
    return level([mix((fade(lp(hp(cl[k], 300), 5000), 0.01, 0.12), 0, -4), (note(a, 0.8, 0.35), 0.05, 0), (note(b, 0.8, 0.35), 0.18, -2))
                  for k, (a, b) in enumerate([(67, 72), (69, 74), (64, 69)])], -22)


def windChime():
    """4-4's chimes swinging when the wind comes (a warning): hollow sticks knocking on a breath of wind, never metal"""
    kn = slices_of(KNOCK, 0.2, 0.25, 0.08)
    out = []
    for i in range(5):
        layers, t = [], 0.05
        for k in range(int(rng.integers(4, 7))):
            x = kn[(i * 3 + k * 5) % len(kn)]
            layers.append((fade(env_decay(lp(hp(rate(x, rng.uniform(0.9, 1.2)), 200), 2500, 4), 0.07), 0.004, 0.05), t, -rng.uniform(0, 6)))
            t += rng.uniform(0.07, 0.2)
        out.append(fade(mix((stroke(i, 0.8, 1.0, 150, 2500), 0, -10), *layers), 0.01, 0.2))
    return level(out, -27)


def creatureHits():
    """a hit landing, one kind per body (combat.ts MATERIALS), three light and three heavy takes each: fur (a punch into a pelt), scale
    (a slap on hide), chitin (a crack of shell), feather (a thump in a burst of feathers), armor (stone and iron bosses: stone), generic
    (a soft body thump). No shared generic hit any more."""
    th = slices_of(THUD, 0.35, 0.3, 0.2, top=8)
    cl = slices_of(CLOTH, 0.15, 0.25, 0.08, top=6)
    sn = slices_of(SNAP, 0.2, 0.3, 0.15, top=6)
    sq = [loudest(src(f), 0.25) for f in SQUISH]
    st = slices_of(ROCK_HIT, 0.4, 0.25, 0.2, top=6)
    wg = [loudest(src(f), 0.3) for f in WINGS]
    out = {}
    for mat in ['generic', 'fur', 'scale', 'chitin', 'feather', 'armor']:
        takes = []
        for heavy in (0, 1):
            for i in range(3):
                r = rng.uniform(0.95, 1.05) * (0.86 if heavy else 1.0)
                b = sat(lp(rate(th[(i + 3 * heavy) % len(th)], r), 2400), 1.4 + heavy)
                if mat == 'fur':
                    x = mix((b, 0, 0), (fade(lp(hp(cl[i], 400), 4500), 0.002, 0.05), 0.003, -8))
                elif mat == 'scale':
                    x = mix((b, 0, -2), (fade(lp(hp(sq[i], 200), 5000), 0.001, 0.06), 0, -4))
                elif mat == 'chitin':
                    x = mix((b, 0, -4), (fade(lp(hp(sn[i], 500), 5500), 0.001, 0.05), 0, -2))
                elif mat == 'feather':
                    x = mix((b, 0, 0), (fade(lp(hp(wg[i], 400), 5000), 0.005, 0.12), 0.01, -7))
                elif mat == 'armor':
                    x = mix((env_decay(lp(hp(rate(st[i], r * 0.92), 80), 4000), 0.14), 0, 0), (b, 0, -6))
                else:
                    x = b
                if heavy:
                    x = mix((x, 0, 0), (lp(rate(th[(i + 1) % len(th)], 0.8), 900), 0.005, -3))
                takes.append(fade(x, 0.001, 0.08))
        out[f'hit_{mat}'] = level(takes[:3], -24) + level(takes[3:], -20)
    return out


# each creature's knock-out: its own voice (Freesound ids by title, how long a cut, the rate it plays at), then the body falling
KO = {
    'snake':   ([553374, 343927, 343928], 0.45, 0.95),     # "Snake Hiss", "hiss2", "hiss3" (cat hiss, snake)
    'boa':     ([343928, 553374, 343927], 0.55, 0.8),
    'eagle':   ([583615, 536732, 529073], 0.45, 1.0),      # "Eagle" (scream), "Caw" (raven), "Crow"
    'harpy':   ([583615, 583615, 387543], 0.55, 0.85),     # "Eagle", "corvo" (crow)
    'ocelot':  ([71408, 615893, 343927], 0.5, 1.0),        # "mau2" (cat cry, cat yell), "mew", "hiss2"
    'jaguar':  ([496131, 571287, 571288], 0.8, 0.95),      # "Tiger Growl", "jaguar growl roar", "tiger roar"
    'caiman':  ([536746, 556788, 179312], 0.7, 0.75),      # "Pig" (grunt, snort), "Pig Sty" (grunt), "snort": a deep reptile grunt
    'tayra':   ([134791, 536753, 128473], 0.4, 1.0),       # "Rats" (squeak), "Rat" (squeak), "a monkey" (squeal)
    'frog':    ([536759, 430176, 275845], 0.45, 1.0),      # "Frog" (croak, ribbit), "sapos" (croak), "Frog" (croaking)
    'spider':  ([392495, 392495, 392495], 0.3, 1.0),       # "CorreteoArdilla" (a scamper on a log) and a twig's crack
    'ant':     ([392495, 392495, 392495], 0.25, 1.2),
    'boss':    ([559600, 270383, 410343], 0.9, 0.85),      # "LION ROAR", "lion growls", "Roar" (lion, tiger)
}


def knockouts():
    th = slices_of(THUD, 0.4, 0.3, 0.2, top=6)
    sn = slices_of(SNAP, 0.2, 0.3, 0.15, top=6)
    out = {}
    for kind, (ids, dur, r) in KO.items():
        takes, taken = [], {}
        for i, fid in enumerate(ids):
            x = src(fid)
            for a0, b0 in taken.get(fid, []):
                x[a0:b0] = 0
            v, at = loudest(hp(x, 120), dur, at=True)
            taken.setdefault(fid, []).append((at, at + len(v)))
            if kind in ('spider', 'ant'):
                v = mix((lp(hp(v, 800), 6000), 0, -4), (lp(hp(sn[i], 400), 5500), 0, 0))
            v = fade(lp(rate(v, r * rng.uniform(0.96, 1.04)), 5500 if kind in ('eagle', 'harpy', 'tayra') else 4200), 0.01, min(0.15, dur / 3))
            fl = fade(sat(lp(th[i % len(th)], 2200), 1.3), 0.001, 0.08)
            land = len(v) / SR * 0.7
            takes.append(fade(mix((v, 0, 0), (fl, land, -5), (leafy(i * 2, 0.25), land + 0.005, -11)), 0.001, 0.1))
        out[f'ko_{kind}'] = level(takes, -22 if kind != 'boss' else -18)
    return out


def bossSlam():
    """the boss card's name landing (SN-10): a huge low impact, wood slamming, and a far roll of thunder"""
    out = []
    for k, t in enumerate(THUNDER[:2]):
        b = sat(lp(trim(src(BIG[0]), maxdur=1.6), 2500), 1.3)
        wd = lp(hp(trim(src(BIG[1]), maxdur=0.4), 120), 5000)
        r = fade(lp(hp(loudest(src(t), 2.6), 30), 1500), 0.3, 1.2)
        out.append(fade(mix((b, 0, 0), (wd, 0, -5 - 2 * k), (r, 0.25, -8)), 0.001, 0.6))
    return level(out, -14)


# ------------------------------------------------------------------------------------------------- pickups, rewards, the rest

def figure(notes, gap, tau=0.3, extra=()):
    return fade(mix(*[(note(m, 0.8, tau), k * gap, -k * 0.5) for k, m in enumerate(notes)], *extra), 0.001, 0.25)


def leaf():
    """a leaf picked up: a soft brush of leaves, no note"""
    return level([leafy(i, 0.3) for i in range(6)], -30)


def fruit():
    """a fruit: a bite, and one warm low note"""
    bites = [loudest(src(f), 0.25) for f in BITE]
    return level([mix((fade(lp(hp(bites[i % 3], 300), 5000), 0.002, 0.08), 0, 0), (note(m, 0.5, 0.18), 0.03, -8)) for i, m in enumerate([64, 67, 62, 69])], -25)


def heart():
    """a heart: two warm notes, low, and a breath"""
    return level([mix((note(a, 0.8, 0.3), 0, 0), (note(b, 0.8, 0.3), 0.12, -2), (stroke(i, 0.8, 0.4, 200, 2500), 0, -14))
                  for i, (a, b) in enumerate([(60, 67), (62, 69), (57, 64)])], -23)


def superHeart():
    """the super heart: a bigger moment, a rising figure over a swell of leaves"""
    return level([figure([60, 64, 67, 72], 0.11, 0.4, ((leafy(0, 1.0), 0, -12),)), figure([62, 66, 69, 74], 0.11, 0.4, ((leafy(1, 1.0), 0, -12),))], -18)


def power():
    """the power-ups, 0 speed (a gust and quick taps), 1 invincible (a warm rising figure and leaves), 2 magnet (low warm notes)"""
    sp = mix((stroke(0, 1.0, 0.6, 200, 4000), 0, -4), *[(note(72 + 2 * k, 0.3, 0.1), 0.05 + 0.06 * k, -2) for k in range(5)])
    inv = figure([60, 67, 72, 76], 0.08, 0.5, ((leafy(2, 0.8), 0, -10),))
    mag = mix(*[(note(m, 1.0, 0.6, 1600), 0.04 * k, -2) for k, m in enumerate([48, 55, 60])], (stroke(1, 0.8, 0.6, 150, 2500), 0.1, -12))
    return level([fade(sp, 0.001, 0.15), inv, fade(mag, 0.001, 0.3)], -19)


def relic():
    return level([figure([62, 67, 71, 74], 0.13, 0.45), figure([60, 64, 69, 72], 0.13, 0.45)], -18)


def oneUp():
    return level([figure([60, 64, 67, 72], 0.09, 0.35)], -18)


def star():
    """the Stage Cleared stars, a warm note each, rising (star 0, 1, 2)"""
    return level([figure([m], 0.1, 0.4) for m in (67, 71, 74)], -20)


def critter():
    """a critter freed: its happy chirp and a rustle as it scampers off"""
    ch = [loudest(src(f), 0.35) for f in (536753, 134791, 128473)]
    return level([mix((fade(lp(hp(rate(c, 0.9), 400), 3800), 0.005, 0.1), 0, 0), (leafy(i + 2, 0.3), 0.15, -8)) for i, c in enumerate(ch)], -22)


def hurt():
    """Pokey hurt: a body thump, a shake of leaves and the air knocked out of him (no synth voice)"""
    th = slices_of(THUD, 0.4, 0.3, 0.2, top=3)
    return level([mix((sat(lp(th[i], 2400), 1.5), 0, 0), (leafy(i, 0.3), 0.01, -6), (stroke(i + 3, 0.9, 0.25, 300, 3000), 0.03, -10)) for i in range(3)], -18)


def climb():
    """claws on bark: a short scratch on wood (5 takes)"""
    cr = [loudest(src(f), 0.22) for f in CREAK] + [loudest(src(ROPE[3]), 0.22), loudest(src(ROPE[2]), 0.22)]
    return level([fade(lp(hp(x, 400), 5000), 0.01, 0.08) for x in cr], -30)


def eagle():
    """a bird of prey's scream (the eagle's dive)"""
    calls = slices(583615, 0.6, 0.3, 0.3)[:2] + [loudest(src(529073), 0.6)]   # "Eagle" (scream), "Crow"
    return level([fade(lp(hp(s_, 500), 6000), 0.005, 0.15) for s_ in calls], -20)


def ui():
    """the menus, to match the wooden HUD: a soft wooden tap, confirm (two taps rising), back (a leaf rustle), pause (leaves closing),
    unpause (opening)"""
    kn = slices_of(KNOCK, 0.15, 0.25, 0.08, top=6)
    tp = [fade(lp(hp(rate(t, r), 250), 3500), 0.001, 0.05) for t in kn[:3] for r in (1.0, 1.12)]
    conf = [mix((tp[0], 0, 0), (rate(tp[2], 1.25), 0.07, 0)), mix((tp[1], 0, 0), (rate(tp[3], 1.25), 0.07, 0))]
    closing = leafy(0, 0.45, 3500)
    return {'uiTap': level(tp, -30), 'uiConfirm': level(conf, -28), 'uiBack': level([leafy(i, 0.35) for i in (1, 2, 3)], -30),
            'pauseIn': [to_lufs(closing, -30)], 'pauseOut': [to_lufs(closing[::-1].copy(), -30)]}


def megaPunch():
    th = slices_of(THUD, 0.4, 0.3, 0.2, top=3)
    return level([mix((stroke(i, 1.05, 0.35, 200, 4500), 0, 0), (sat(lp(th[i], 2000), 1.8), 0.15, -4)) for i in range(3)], -22)


def bounce():
    """a mushroom bounce: a soft, fleshy squash and a rising "bwomp" (a body thump bent upward in pitch), never a metal spring"""
    th = slices_of(THUD, 0.35, 0.3, 0.2, top=3)
    out = []
    for i in range(3):
        x = lp(th[i], 1800)
        n = len(x)
        pos = np.cumsum(np.linspace(0.75, 1.35, n))
        pos = pos[pos < n - 1]
        y = np.interp(pos, np.arange(n), x).astype(np.float32)
        s_ = fade(lp(hp(loudest(src(SQUISH[i]), 0.25), 150), 3500), 0.002, 0.08)
        out.append(fade(mix((sat(y, 1.4), 0, 0), (s_, 0, -4)), 0.001, 0.08))
    return level(out, -22)


def world():
    """world things: a log knocked or landing, stone crumbling, a thorn bush, a wooden gate"""
    logs = [fade(lp(hp(loudest(src(f), 0.6), 60), 4000), 0.002, 0.15) for f in LOG[:3]]
    crum = [fade(mix((lp(hp(loudest(src(ROCK_FALL[k]), 0.8), 200), 5000), 0, 0), (lp(hp(loudest(src(DIG[k]), 0.3), 400), 5000), 0.05, -6)), 0.01, 0.25) for k in (0, 2)]
    thorn = [lp(fade(mix((leafy(i, 0.35), 0, 0), (lp(hp(loudest(src(SNAP[i]), 0.2), 600), 5500), 0.03, -6)), 0.01, 0.1), 4500) for i in range(3)]
    kn = slices_of(KNOCK, 0.3, 0.25, 0.1, top=2)
    gate = [fade(mix((lp(hp(loudest(src(CREAK[i]), 0.9), 120), 3000), 0, 0), (lp(kn[i], 3500), 0.7, -3)), 0.05, 0.15) for i in range(2)]
    return {'log': level(logs, -22), 'crumble': level(crum, -22), 'thorns': level(thorn, -26), 'gate': level(gate, -22)}


def puzzle():
    """the puzzle sounds (polish-audio's PUZZLE_SOUNDS but gate and chime), from real wood, stone, rope and leaves"""
    kn = slices_of(KNOCK, 0.15, 0.25, 0.08, top=4)
    th = slices_of(THUD, 0.3, 0.3, 0.2, top=2)
    tap = fade(lp(hp(kn[0], 250), 3500), 0.001, 0.05)
    thud = fade(sat(lp(th[0], 2200), 1.3), 0.001, 0.06)
    rp = [fade(lp(hp(loudest(src(f), 0.5), 120), 3000), 0.05, 0.15) for f in ROPE[:2]]
    P = {
        'pick': mix((leafy(0), 0, 0), (tap, 0.02, -4)),
        'drop': mix((thud, 0, 0), (leafy(1), 0.01, -8)),
        'wrap': mix((rp[0], 0, 0), (fade(lp(hp(loudest(src(CLOTH[2]), 0.3), 300), 4000), 0.01, 0.08), 0.05, -4)),
        'reset': mix((stroke(1, 0.9, 0.4, 300, 3000), 0, -2), (tap, 0.3, -2)),
        'press': mix((fade(lp(kn[1], 3500), 0.001, 0.05), 0, 0), (thud, 0.05, -6)),
        'lift': mix((rp[1], 0, 0), (leafy(2), 0.1, -10)),
        'lever': mix((rp[0], 0, -4), (fade(lp(kn[2], 3500), 0.001, 0.05), 0.25, 0)),
        'throw': stroke(2, 1.2, 0.3, 300, 4500),
        'shift': mix((fade(lp(hp(loudest(src(ROCK_FALL[0]), 0.6), 200), 4000), 0.04, 0.2), 0, 0), (thud, 0.45, -6)),
        'solved': figure([67, 72, 76], 0.1, 0.4, ((leafy(3, 0.5), 0, -10),)),
    }
    return {f'pz_{k}': [to_lufs(fade(v, 0.001, 0.1), -24 if k != 'solved' else -20)] for k, v in P.items()}


def respawn():
    """Pokey coming back after a lost life: a soft puff of leaves and two warm notes rising"""
    return level([mix((leafy(4, 0.4), 0, -6), (note(64, 0.7, 0.25), 0.05, 0), (note(69, 0.7, 0.25), 0.18, -1))], -22)


# ------------------------------------------------------------------------------------------------- the world beds (SN-9)

LOOP = 20.0


def loop(x, length=LOOP, xf=2.0, start=0.0):
    """a seamless loop of `length` s: the stretch after it is crossfaded (equal power) into its own start"""
    need = int((length + xf) * SR)
    x = seg(x, min(start, max(0.0, len(x) / SR - length - xf)), length + xf)
    while len(x) < need:
        x = np.concatenate([x, x])
    x = x[:need]
    n, k = int(length * SR), int(xf * SR)
    y = x[:n].copy()
    w = np.linspace(0, np.pi / 2, k)
    y[:k] = y[:k] * np.sin(w) + x[n: n + k] * np.cos(w)
    return y.astype(np.float32)


def bedmix(*layers):
    out = np.zeros(int(LOOP * SR), np.float32)
    for x, g, h, l in layers:
        y = x
        if h:
            y = hp(y, h)
        if l:
            y = lp(y, l)
        out += y[: len(out)] * db(g)
    return out


BEDS = {
    # world: ([(freesound id, start s, gain dB, hp Hz, lp Hz)], loudness)
    1: ([(528632, 2, 0, 150, 8000), (151776, 1, -10, 300, 6000)], -30),   # "10" (calm birds, field), "Selva" (Bolivia, jungle crickets)
    2: ([(45662, 2, 0, 100, 7000), (528632, 6, -10, 600, 8000)], -28),   # "water" (brook, flowing stream), birds far
    3: ([(613148, 2, 0, 60, 5000)], -31),                                  # "cave" (cave ambience, stone)
    4: ([(235819, 2, 0, 100, 6000), (592364, 1, -6, 60, 3000)], -27),     # "Río Cadí" (river, waterfall, forest), "Flood" (waterfall)
    5: ([(549881, 2, 0, 200, 7000), (151776, 4, -8, 300, 6000)], -29),    # "Parrots" (aviary, jungle), "Selva"
    6: ([(580325, 2, 0, 100, 6000), (381718, 3, -6, 150, 5000)], -29),    # "marsh" (bog, frogs, birds), "Frogs1a" (swamp)
    7: ([(376443, 2, -2, 60, 3000), (614471, 2, -6, 80, 3500)], -31),     # "Wind" (gusts in trees), "31" (wind howl)
    8: ([(151776, 2, 0, 200, 7000), (608969, 4, -10, 150, 5000)], -30),   # "Selva" (jungle crickets at night), "frogs" (night chorus)
    9: ([(167473, 2, 0, 60, 4000), (17808, 3, -6, 60, 3000)], -28),       # "boil3" (a slow boil, deep), "Foc" (fire crackling)
    10: ([(29561, 2, 0, 120, 8000), (376443, 6, -8, 60, 2500)], -25),     # "rain" (field recording), "Wind" (gusts)
}


def beds():
    out = {}
    for w, (layers, target) in BEDS.items():
        ls = [(loop(src(f), start=a), g, h, l) for f, a, g, h, l in layers]
        out[f'bed{w}'] = [to_lufs(bedmix(*ls), target, -3)]
    return out


def shots():
    """the one-shots a bed scatters at random over its loop, so it never sounds like a loop"""
    birds = [fade(lp(hp(x, 600), 7000), 0.01, 0.15) for x in slices_of([269067, 511541], 1.2, 0.3, 0.6)]   # "bird" (forest morning), "Chirp 2" (jungle)
    drips = [fade(lp(hp(x, 300), 6000), 0.001, 0.05) for x in slices_of([353692, 353691, 353694, 22438], 0.3, 0.3, 0.3)]   # "drip8/3/9", "Drip"
    croaks = [fade(lp(hp(x, 120), 4500), 0.005, 0.08) for x in slices_of([536759, 430176, 275845], 0.45, 0.25, 0.25)]
    thunder = [fade(lp(hp(loudest(src(f), 2.6), 30), 2500), 0.2, 0.9) for f in THUNDER]
    far = [fade(lp(b, 3200), 0.02, 0.2) for b in birds]
    return {'shotBirds': level(birds[:6], -30), 'shotBirdsFar': level(far[:6], -36), 'shotDrips': level(drips[:6], -34),
            'shotCroaks': level(croaks[:6], -30), 'shotThunder': level(thunder, -24)}


EFFECTS = {f.__name__: f for f in [rock, rockWarn, flower, stepMoss, stepWood, stepStone, stepWater, jump, doubleJump, glide, landing, vine, swish,
                                   splash, checkpoint, windChime, bossSlam]}


def seed(name):
    """every effect draws its jitter from its own seed, so building one never changes another"""
    global rng
    import zlib
    rng = np.random.default_rng(zlib.crc32(name.encode()))


GROUPS = {'hits': creatureHits, 'kos': knockouts, 'beds': lambda: {**beds(), **shots()}, 'rest': lambda: {**ui(), **world(), **puzzle()}}
SINGLE_REST = [leaf, fruit, heart, superHeart, power, relic, oneUp, star, critter, hurt, climb, eagle, megaPunch, bounce, respawn]


if __name__ == '__main__':
    os.makedirs(OUT, exist_ok=True)
    jobs = {}
    for name, fn in list(EFFECTS.items()) + [(f.__name__, f) for f in SINGLE_REST]:
        if not ONLY or name in ONLY or (fn in SINGLE_REST and 'rest' in ONLY):
            seed(name)
            jobs[name] = fn()
    for g, fn in GROUPS.items():
        if not ONLY or g in ONLY:
            seed(g)
            jobs.update(fn())
    for name, takes in jobs.items():
        for i, t in enumerate(takes):
            write_wav(os.path.join(OUT, f'{name}_{i}.wav'), t)
            if name.startswith('bed'):
                write_mp3(os.path.join(OUT, f'{name}_{i}.mp3'), t, kbps=40, sr=24000)   # (the beds are long: smaller)
            else:
                write_mp3(os.path.join(OUT, f'{name}_{i}.mp3'), t)
        print(name, len(takes), 'takes', flush=True)
    json.dump({str(k): v for k, v in USED.items()}, open(os.path.join(OUT, 'sources.json'), 'w'), indent=1)
