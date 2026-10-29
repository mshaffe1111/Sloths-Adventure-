"""Build the recorded effect set from the CC0 Freesound clips (polish-sfx, 2026-10-29).

    python3 tools/audio/sfxv1/build.py <clips dir> <out dir> [effect ...]

<clips dir> holds the unpacked scan clips (<cat>__<freesound id>.ogg, from fsscan.py via the carrier); every source is named by its
Freesound id, and LICENCES.md lists each one. Each effect is several takes (round-robin in the game), every take its own mix of layers
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


def slices(fid, dur=0.3, thr=0.2, mingap=0.15, pre=0.006):
    """each separate event of a recording, cut to `dur` (or to the next event) with a short fade"""
    x = src(fid)
    on = hits(x, thr, mingap)
    out = []
    for i, t in enumerate(on):
        nxt = on[i + 1] if i + 1 < len(on) else len(x) / SR
        s = seg(x, max(0, t - pre), min(dur, nxt - t - 0.004))
        if len(s) > 0.04 * SR:
            out.append(fade(s, 0.001, min(0.06, len(s) / SR / 3)))
    return out


def level(takes, lufs_target):
    return [to_lufs(t, lufs_target) for t in takes]


# ------------------------------------------------------------------------------------------------- the effects

def rock():
    """a falling stone landing (4-4 and every rockfall): a low thud, a dry crunch on top, a short trickle of grit after. No ring."""
    thuds = [trim(seg(src(9028), 0, 1.0)), trim(src(290093)), trim(src(193851)), trim(src(290349))]
    # (506662, 313696 and 9028's second hit were tried and dropped: the first rings at 4-5.5 kHz, the others are pitched booms)
    crunch = [trim(src(378614), maxdur=0.5), trim(seg(src(527283), 0, 0.7)), trim(seg(src(137247), 0.9, 0.5))]
    grit = [seg(src(560054), 0.05, 1.1), seg(src(162668), 0.8, 1.1), seg(src(137247), 1.5, 1.0)]
    out = []
    for i in range(6):
        th = thuds[i % len(thuds)]
        th = sat(lp(rate(th, rng.uniform(0.86, 1.04)), 2200, 4), 1.6)
        th = fade(env_decay(th, 0.18), 0.001, 0.08)
        cr = crunch[(i + 1) % len(crunch)]
        cr = env_decay(lp(hp(rate(cr, rng.uniform(0.92, 1.08)), 350), 5500), 0.12)
        gr = grit[(i + 2) % len(grit)]
        gr = fade(env_decay(lp(hp(gr, 700), 5200), 0.28), 0.03, 0.25)
        out.append(fade(mix((th, 0, 0), (cr, 0.004, -5), (gr, rng.uniform(0.07, 0.13), -15)), 0.001, 0.12))
    return level(out, -16)


def rockWarn():
    """the grit that trickles down just before a rock drops (a warning to hear, not only to see)"""
    out = []
    for fid, a in [(560054, 0.0), (162668, 2.0), (137247, 0.4), (162668, 3.1)]:
        x = seg(src(fid), a, 0.9)
        out.append(fade(lp(hp(x, 900), 5500), 0.12, 0.35))
    return level(out, -28)


def flower():
    """a petal: a soft chime with a dull top. A marimba's wooden attack over a warm bell tone (its upper partials rolled off), and a breath
    of leaves. Eight takes on eight notes of a pentatonic, so a trail wanders instead of climbing."""
    x = src(555240)
    on = hits(x, 0.25, 0.08)
    toks = []
    for k in [0, 3, 13, 16, 19, 20, 22, 2]:
        t = on[k]
        nxt = on[k + 1] if k + 1 < len(on) else len(x) / SR
        toks.append(seg(x, t - 0.003, min(0.3, nxt - t - 0.004)))
    bell = trim(src(8487), thr_db=-20, back=0.002)
    bf = 410.0   # the bell tone's fundamental (measured)
    leaves = [seg(src(461460), 0.2, 0.25), seg(src(386202), 0.5, 0.25), seg(src(624094), 0.1, 0.25)]
    # target notes (MIDI): a C-major pentatonic around A4, as the game transposes pickups into the music's key
    notes = [69, 72, 74, 76, 67, 79, 71.0 + 1, 64]
    out = []
    for i, m in enumerate(notes):
        hz = 440 * 2 ** ((m - 69) / 12)
        body = rate(bell, hz / bf)[: int(0.7 * SR)]
        body = fade(env_decay(lp(hp(body, 200), 2200, 4), 0.22), 0.004, 0.15)
        tok = toks[i]
        tok = fade(env_decay(lp(hp(tok, 250), 3000, 4), 0.06), 0.002, 0.05)
        lv = fade(lp(hp(leaves[i % 3], 900), 4500), 0.01, 0.12)
        out.append(fade(mix((body, 0.004, 0), (tok, 0, -7), (lv, 0, -20)), 0.001, 0.1))
    return level(out, -24)


def steps(fids, dur, lpf, hpf, n, target, thr=0.2, gain_jit=2.0):
    pool = []
    for f in fids:
        pool += slices(f, dur, thr)
    # strongest first: quiet scuffs make weak takes
    pool.sort(key=lambda s: -np.abs(s).max())
    pool = pool[: max(n * 2, n)]
    rng.shuffle(pool)
    out = []
    for s in pool[:n]:
        s = lp(hp(rate(s, rng.uniform(0.94, 1.06)), hpf), lpf)
        out.append(fade(s, 0.001, 0.05))
    return level(out, target)


def stepMoss():
    """a soft footfall on the forest floor: a muffled pad and a little rustle"""
    return steps([532133, 405112, 407186], 0.26, 3800, 90, 8, -30)


def stepWood():
    """a footfall on a branch or a plank: a hollow knock"""
    return steps([25040, 392811, 148796, 571954], 0.24, 4500, 110, 8, -29)


def stepStone():
    """a footfall on rock: a dry tap with a little grit"""
    return steps([452001, 615985, 378129], 0.22, 5000, 140, 8, -30)


def stepWater():
    """a footfall in shallow water: a small slosh"""
    return steps([181784, 265632, 624005], 0.32, 4200, 120, 6, -29)


def whooshes():
    """single air strokes: sliced from a run of swishes, plus two whole ones"""
    out = slices(332675, 0.35, 0.25, 0.12)
    out += [trim(src(552774), thr_db=-24, maxdur=0.6), trim(src(464573), maxdur=0.45)]
    return out


def jump():
    """a hop: a quick push of air and cloth, and a tiny scuff of leaves off the ground. Soft: it plays 30-50 times a minute."""
    air = whooshes()
    cloth = [trim(src(266783)), *slices(260503, 0.12, 0.3, 0.05)]
    scuff = slices(532133, 0.12, 0.2) + slices(405112, 0.12, 0.2)
    out = []
    for i in range(6):
        w = air[(i * 2) % len(air)]
        w = fade(lp(hp(rate(w, rng.uniform(1.15, 1.35)), 300), 4500)[: int(0.22 * SR)], 0.004, 0.08)
        c = fade(lp(hp(cloth[i % len(cloth)], 400), 5000)[: int(0.15 * SR)], 0.002, 0.06)
        sc = fade(lp(hp(scuff[i % len(scuff)], 200), 3500), 0.001, 0.04)
        out.append(mix((sc, 0, -2), (c, 0.005, -4), (w, 0.01, -6)))
    return level(out, -30)


def doubleJump():
    """the second hop in mid-air: a flutter, like a leaf caught by the wind"""
    # (341820, a steady flapping, was tried and dropped: it reads as a mechanical buzz)
    fl = [seg(src(528250), a, 0.3) for a in (0.2, 0.9, 1.6, 2.3)] + [trim(src(319614), maxdur=0.3)]
    air = whooshes()
    out = []
    for i in range(5):
        f = fade(lp(hp(fl[i], 350), 4200), 0.02, 0.1) * np.hanning(len(fl[i])) ** 0.3
        f = f.astype(np.float32) * 3.0
        w = fade(lp(hp(rate(air[(i * 3 + 1) % len(air)], rng.uniform(1.0, 1.2)), 300), 4000)[: int(0.3 * SR)], 0.01, 0.1)
        out.append(mix((f.astype(np.float32), 0, -3), (w, 0.0, -6)))
    return level(out, -28)


def glide():
    """the Leaf Glide: 0 the leaf opens (a cloth snap and a gust), 1 a flutter while drifting, 2 it folds away (a soft rustle)"""
    opn = fade(mix((lp(hp(trim(src(266783)), 300), 5000), 0, 0), (lp(hp(trim(src(552774), thr_db=-24, maxdur=0.6), 250), 3500), 0.02, -5)), 0.002, 0.15)
    flut = [fade(lp(hp(seg(src(528250), a, 0.45), 300), 4000), 0.05, 0.15) for a in (0.3, 1.1, 1.9)]
    fold = fade(lp(hp(seg(src(260503), 0, 0.3), 300), 4500), 0.01, 0.12)
    return [to_lufs(opn, -27), *[to_lufs(f, -34) for f in flut], to_lufs(fold, -31)]


def landing():
    """touching down, by how far he fell: small (a soft pad), medium (a thump and leaves), big (a heavy thump with grit). Two takes each"""
    small = [trim(src(552900), maxdur=0.25), trim(src(209765), maxdur=0.25)]
    med = [trim(src(290349), maxdur=0.5), trim(src(559309), maxdur=0.5)]
    big = [trim(src(193851), maxdur=0.7), trim(src(290093), maxdur=0.7)]
    rust = slices(532133, 0.25, 0.2) + slices(407186, 0.25, 0.2)
    grit = seg(src(560054), 0.05, 0.6)
    out = []
    for i, x in enumerate(small):
        out.append(to_lufs(fade(mix((lp(x, 2500), 0, 0), (lp(hp(rust[i], 300), 4000), 0.004, -8)), 0.001, 0.06), -29))
    for i, x in enumerate(med):
        out.append(to_lufs(fade(mix((sat(lp(x, 2200), 1.4), 0, 0), (lp(hp(rust[i + 2], 300), 4500), 0.004, -6)), 0.001, 0.08), -24))
    for i, x in enumerate(big):
        g = fade(env_decay(lp(hp(grit, 700), 5000), 0.2), 0.02, 0.2)
        body = env_decay(sat(lp(x, 2000), 1.8), 0.11)
        out.append(to_lufs(fade(mix((body, 0, 0), (lp(hp(rust[i + 4], 300), 4500), 0.004, -5), (g, 0.05, -14)), 0.001, 0.1), -19))
    return out


def vine():
    """grabbing a vine: a palm slapping bark-wrapped rope, a rustle of its leaves, and the vine's creak under his weight"""
    slap = [trim(src(502553), maxdur=0.2), trim(src(557647), maxdur=0.2), trim(src(552900), maxdur=0.2)]
    creak = [seg(src(562603), a, 0.55) for a in (0.2, 1.1, 2.0, 2.9)]
    rust = slices(461460, 0.25, 0.2) + slices(386202, 0.25, 0.2)
    out = []
    for i in range(6):
        sl = fade(lp(hp(rate(slap[i % 3], rng.uniform(0.9, 1.05)), 150), 3000), 0.001, 0.05)
        cr = fade(lp(hp(rate(creak[i % 4], rng.uniform(0.95, 1.1)), 120), 2500), 0.06, 0.2)
        ru = fade(lp(hp(rust[i % len(rust)], 900), 5000), 0.005, 0.1)
        out.append(mix((sl, 0, 0), (ru, 0.01, -10), (cr, 0.05, -9)))
    return level(out, -27)


def swish():
    """a punch or a kick through the air (the hit, if it lands, is its own sound)"""
    air = whooshes()
    out = []
    for i in range(6):
        w = air[(i * 5) % len(air)]
        w = fade(lp(hp(rate(w, rng.uniform(1.3, 1.6)), 400), 5000)[: int(0.2 * SR)], 0.003, 0.07)
        out.append(w)
    return level(out, -29)


def splash():
    """into the water: 0-1 a full plunge, 2-3 a body-sized splash, 4-5 a small dip"""
    big = [trim(src(316581), maxdur=1.4), trim(src(535955), maxdur=1.4)]
    small = slices(166986, 0.4, 0.3) + slices(223366, 0.5, 0.3)
    out = []
    for x in big:
        out.append(to_lufs(fade(lp(hp(x, 80), 6000), 0.002, 0.4), -18))
    for x in big:
        y = rate(x, 1.12)[: int(0.8 * SR)]
        out.append(to_lufs(fade(lp(hp(y, 150), 6000), 0.002, 0.3), -22))
    for x in small[:2]:
        out.append(to_lufs(fade(lp(hp(x, 150), 5500), 0.002, 0.15), -27))
    return out


def checkpoint():
    """a flag: its cloth catching the wind, and two warm notes rising (a reward, so it may sing; softly)"""
    bell = trim(src(8487), thr_db=-20, back=0.002)
    flag = fade(lp(hp(seg(src(260503), 0, 0.45), 300), 5000), 0.01, 0.15)
    out = []
    for pair in [(67, 72), (69, 74), (64, 69)]:
        ns = []
        for k, m in enumerate(pair):
            b = rate(bell, 440 * 2 ** ((m - 69) / 12) / 410.0)[: int(0.9 * SR)]
            ns.append((fade(env_decay(lp(hp(b, 200), 2600, 4), 0.35), 0.004, 0.2), 0.05 + 0.13 * k, -3 * k))
        out.append(mix((flag, 0, -4), *ns))
    return level(out, -22)


def windChime():
    """4-4's chimes swinging when the wind comes (a warning): a hollow wooden clatter on a breath of wind, never a metal ping"""
    x = src(275284)
    on = hits(x, 0.25, 0.08)
    toks = [seg(x, t - 0.003, 0.22) for t in on[:16]]
    wind = [seg(src(f), a, 1.6) for f, a in ((552184, 0), (464573, 0)) if len(seg(src(f), a, 1.6)) > SR * 0.2]
    out = []
    for i in range(5):
        layers = []
        t = 0.05
        for k in range(int(rng.integers(4, 7))):
            tk = toks[(i * 3 + k * 5) % len(toks)]
            tk = fade(env_decay(lp(hp(rate(tk, rng.uniform(0.5, 0.62)), 200), 2200, 4), 0.07), 0.002, 0.05)
            layers.append((tk, t, -rng.uniform(0, 6)))
            t += rng.uniform(0.07, 0.2)
        w = wind[i % len(wind)]
        w = fade(lp(hp(w, 200), 2500), 0.15, 0.3)
        out.append(fade(mix((w, 0, -10), *layers), 0.01, 0.2))
    return level(out, -27)


def creatureHits():
    """a hit landing, one kind per body (combat.ts MATERIALS), three takes each, light then heavy versions:
    fur (a punch into a pelt), scale (a slap on hide), chitin (a crack of shell), feather (a thump in a burst of feathers),
    armor (stone and iron bosses: a stone thud), generic (a soft body thump). No shared generic hit any more."""
    punch = [trim(src(320628), maxdur=0.3), trim(src(522548), maxdur=0.3), trim(src(390557), maxdur=0.3)]
    slap = [trim(src(552432), maxdur=0.25), trim(src(418530), maxdur=0.25), trim(src(496696), maxdur=0.25)]
    crack = [trim(src(434832), maxdur=0.2), trim(src(10118), maxdur=0.2), trim(src(456475), maxdur=0.2)]
    body = [trim(src(290349), maxdur=0.4), trim(src(559309), maxdur=0.4), trim(src(552900), maxdur=0.3)]
    feath = [trim(src(319614), maxdur=0.3), seg(src(528250), 0.4, 0.3), seg(src(528250), 1.4, 0.3)]
    fur = slices(260503, 0.15, 0.3, 0.05)
    stone = [trim(seg(src(9028), 0, 1.0)), trim(src(290093)), trim(src(498584), maxdur=0.4)]
    out = {}
    for mat in ['generic', 'fur', 'scale', 'chitin', 'feather', 'armor']:
        takes = []
        for heavy in (0, 1):
            for i in range(3):
                r = rng.uniform(0.95, 1.05) * (0.86 if heavy else 1.0)
                b = sat(lp(rate(body[i], r), 2400), 1.5 + heavy)
                if mat == 'fur':
                    x = mix((lp(hp(rate(punch[i], r), 120), 4000), 0, 0), (b, 0, -4), (lp(hp(fur[i % len(fur)], 500), 5000), 0.005, -12))
                elif mat == 'scale':
                    x = mix((lp(hp(rate(slap[i], r), 200), 5000), 0, 0), (b, 0.002, -5))
                elif mat == 'chitin':
                    x = mix((lp(hp(rate(crack[i], r), 400), 5500), 0, -2), (b, 0, -6))
                elif mat == 'feather':
                    f = fade(lp(hp(feath[i], 400), 5000), 0.005, 0.12)
                    x = mix((b, 0, 0), (f, 0.01, -6))
                elif mat == 'armor':
                    st = sat(lp(rate(stone[i], r * 0.92), 2200, 4), 1.6)
                    x = mix((env_decay(st, 0.14), 0, 0), (b, 0, -6))
                else:
                    x = mix((b, 0, 0), (lp(hp(rate(punch[(i + 1) % 3], r), 150), 3500), 0, -6))
                if heavy:
                    x = mix((x, 0, 0), (lp(rate(body[(i + 1) % 3], 0.8), 900), 0.005, -3))
                takes.append(fade(x, 0.001, 0.08))
        out[f'hit_{mat}'] = level(takes[:3], -24) + level(takes[3:], -20)
    return out


def loudest(x, dur, hop=0.02, at=False):
    """the `dur` s stretch of a recording with the most energy (the call itself, not the room around it); at=True also gives where"""
    n, h = int(dur * SR), int(hop * SR)
    if len(x) <= n:
        return (x, 0) if at else x
    e = np.convolve(x.astype(np.float64) ** 2, np.ones(n), 'valid')[::h]
    i = int(np.argmax(e)) * h
    return (x[i: i + n], i) if at else x[i: i + n]


# each creature's knock-out: its own voice (Freesound ids, how long a cut, the rate it plays at), then the body falling
KO = {
    'snake':   ([363796, 401499, 363796], 0.45, 0.95),   # (293778 was tried: a steam whistle, not a hiss)
    'boa':     ([401499, 363796, 401499], 0.55, 0.8),
    'eagle':   ([75162, 75162, 237107], 0.4, 1.0),
    'harpy':   ([75162, 554250, 75162], 0.5, 0.85),
    'ocelot':  ([588624, 607243, 471880], 0.5, 1.0),
    'jaguar':  ([483821, 447074, 242195], 0.8, 0.95),
    'caiman':  ([584409, 584409, 476354], 0.7, 0.9),
    'tayra':   ([438260, 616662, 576401], 0.4, 1.05),
    'frog':    ([491923, 374737, 620572], 0.45, 1.0),
    'spider':  ([434022, 434022, 434022], 0.3, 1.0),
    'ant':     ([434022, 434022, 434022], 0.25, 1.2),
    'boss':    ([516679, 221688, 483821], 0.9, 0.85),
}


def knockouts():
    flop = [trim(src(290349), maxdur=0.4), trim(src(559309), maxdur=0.4), trim(src(552900), maxdur=0.3)]
    puff = slices(532133, 0.25, 0.2) + slices(407186, 0.25, 0.2)
    crack = [trim(src(434832), maxdur=0.2), trim(src(10118), maxdur=0.2), trim(src(456475), maxdur=0.2)]
    out = {}
    for kind, (ids, dur, r) in KO.items():
        takes = []
        taken = {}
        for i, fid in enumerate(ids):
            x = src(fid)
            # the same recording again: the stretch already taken is blanked, so the next take is another moment of it
            for a0, b0 in taken.get(fid, []):
                x[a0:b0] = 0
            if kind in ('spider', 'ant'):
                a0 = (i * 0.15) % max(0.01, len(x) / SR - dur)
                v = mix((lp(hp(seg(x, a0, dur), 800), 6000), 0, -4), (lp(hp(crack[i], 400), 5500), 0.0, 0))
            else:
                v, at = loudest(hp(x, 120), dur, at=True)
                taken.setdefault(fid, []).append((at, at + len(v)))
            v = fade(lp(rate(v, r * rng.uniform(0.96, 1.04)), 4200 if kind not in ('eagle', 'harpy', 'tayra') else 5500), 0.01, min(0.15, dur / 3))
            fl = fade(sat(lp(flop[i % 3], 2200), 1.4), 0.001, 0.08)
            pf = fade(lp(hp(puff[(i * 2) % len(puff)], 500), 4500), 0.002, 0.08)
            land = len(v) / SR * 0.7
            takes.append(fade(mix((v, 0, 0), (fl, land, -5), (pf, land + 0.005, -11)), 0.001, 0.1))
        out[f'ko_{kind}'] = level(takes, -22 if kind != 'boss' else -18)
    return out


def bossSlam():
    """the boss card's name landing (SN-10): a huge low impact, the wood of the card slapping down, and a far roll of thunder after"""
    out = []
    for big, rum in ((522406, 430204), (569425, 166971)):   # (297426 was tried: it rings like a tuned drum)
        b = sat(lp(trim(src(big), maxdur=2.0), 2500), 1.4)
        slap = lp(hp(trim(src(498584), maxdur=0.4), 150), 5000)
        r = fade(lp(hp(seg(src(rum), 0.3, 2.6), 40), 1200), 0.4, 1.2)
        out.append(fade(mix((b, 0, 0), (slap, 0, -4), (r, 0.25, -8)), 0.001, 0.6))
    return level(out, -14)


# ------------------------------------------------------------------------------------------------- the world beds (SN-9)

LOOP = 20.0


def loop(x, length=LOOP, xf=2.0, start=0.0):
    """a seamless loop of `length` s: the stretch after it is crossfaded (equal power) into its own start"""
    x = seg(x, start, length + xf)
    if len(x) < (length + xf) * SR:
        x = np.concatenate([x, x])[: int((length + xf) * SR)]
    n, k = int(length * SR), int(xf * SR)
    y = x[:n].copy()
    w = np.linspace(0, np.pi / 2, k)
    y[:k] = y[:k] * np.sin(w) + x[n: n + k] * np.cos(w)
    return y.astype(np.float32)


def bedmix(*layers):
    """layers: (signal, gain dB, hp, lp): each made a loop, filtered, summed"""
    out = np.zeros(int(LOOP * SR), np.float32)
    for x, g, h, l in layers:
        y = x
        if h:
            y = hp(y, h)
        if l:
            y = lp(y, l)
        out += y[: len(out)] * db(g)
    return out


# (tried and dropped: 573829, a cave hum, is a pitched drone; 459391, fire and bubbling, has a steady whistle at 2.2 kHz; 67121's
# bubbling and 564788's crackle glide like a whistle)
BEDS = {
    # world: ([(freesound id, start s, gain dB, hp Hz, lp Hz)], one-shot sources [(id, kind)], loudness)
    1: ([(353311, 2, 0, 200, 9000), (396665, 0, -6, 80, 3000)], [(464787, 'birds')], -30),
    2: ([(523313, 1, 0, 100, 7000), (516620, 0, -8, 600, 9000)], [(464787, 'birds')], -28),
    3: ([(554780, 2, -10, 60, 900), (541231, 4, -2, 300, 7000)], [(534192, 'drips'), (365287, 'drips')], -31),
    4: ([(427878, 2, 0, 120, 4500), (396665, 5, -8, 80, 2500)], [(353311, 'birds')], -27),
    5: ([(464787, 4, 0, 300, 6500), (578004, 0, -4, 400, 6500), (177672, 3, -12, 2000, 6000)], [(353311, 'birds')], -29),
    6: ([(391437, 2, 0, 150, 6000), (580664, 3, -6, 60, 3000), (445984, 0, -10, 1500, 7000)], [(438646, 'croaks')], -29),
    7: ([(267013, 2, -2, 80, 2500), (396665, 8, -4, 80, 3500)], [(464787, 'birds')], -31),
    8: ([(445984, 2, 0, 400, 7500), (424356, 5, -6, 600, 7500), (469021, 0, -12, 150, 4000)], [], -30),
    9: ([(459393, 2, 0, 50, 3500), (554780, 6, -8, 40, 500)], [], -28),
    10: ([(327778, 2, 0, 150, 8000), (267013, 4, -6, 60, 2500)], [], -25),
}


def beds():
    out = {}
    for w, (layers, shots, target) in BEDS.items():
        ls = [(loop(src(f), start=a), g, h, l) for f, a, g, h, l in layers]
        out[f'bed{w}'] = [to_lufs(bedmix(*ls), target, -3)]
    return out


EFFECTS = {f.__name__: f for f in [rock, rockWarn, flower, stepMoss, stepWood, stepStone, stepWater, jump, doubleJump, glide, landing, vine, swish,
                                   splash, checkpoint, windChime, bossSlam]}

if __name__ == '__main__':
    os.makedirs(OUT, exist_ok=True)
    report = {}
    jobs = dict(EFFECTS)
    if not ONLY or 'hits' in ONLY:
        for k, v in creatureHits().items():
            jobs[k] = (lambda v=v: v)
    if not ONLY or 'kos' in ONLY:
        for k, v in knockouts().items():
            jobs[k] = (lambda v=v: v)
    if not ONLY or 'beds' in ONLY:
        for k, v in beds().items():
            jobs[k] = (lambda v=v: v)
    for name, fn in jobs.items():
        if ONLY and name not in ONLY and not (name.startswith('bed') and 'beds' in ONLY) and not (name.startswith('hit_') and 'hits' in ONLY) and not (name.startswith('ko_') and 'kos' in ONLY):
            continue
        takes = fn()
        for i, t in enumerate(takes):
            write_wav(os.path.join(OUT, f'{name}_{i}.wav'), t)
            if name.startswith('bed'):
                write_mp3(os.path.join(OUT, f'{name}_{i}.mp3'), t, kbps=40, sr=24000)   # (the beds are long: smaller)
            else:
                write_mp3(os.path.join(OUT, f'{name}_{i}.mp3'), t)
        report[name] = len(takes)
        print(name, len(takes), 'takes', flush=True)
    used_path = os.path.join(OUT, 'sources.json')
    old = json.load(open(used_path)) if os.path.exists(used_path) else {}
    old.update({str(k): v for k, v in USED.items()})
    json.dump(old, open(used_path, 'w'), indent=1)
