"""Old/new preview pairs for Matt (polish-sfx, 2026-10-29).

    python3 tools/audio/sfxv1/previews.py <takes dir> <fxcount.json> <out dir> [pair ...]

Old: the game's own effect code, rendered offline through the master chain (render.mjs on the old tree's dev server, port 4304: the base
branch with polish-audio's classic retune and polish-a2's levels merged, so the comparison is with the best version of the old set).
New: the recorded takes, played by the rules the new effect player will follow (PLAYER below), through the same chain (port 4303).
Every pair is written as <pair>-old.mp3 / <pair>-new.mp3 (stereo 128 kbps) and measured (measure.py) into numbers.json.
"""
import json, os, random, subprocess, sys
sys.path.insert(0, os.path.dirname(__file__))
from measure import load, stats, lufs

TAKES, FXC, OUT = sys.argv[1], sys.argv[2], sys.argv[3]
ONLY = set(sys.argv[4:])
HERE = os.path.dirname(os.path.abspath(__file__))
TMP = os.path.join(OUT, '.wav')
os.makedirs(TMP, exist_ok=True)
rnd = random.Random(29)
# each take's gain (dB) from calib.py: the take sits where SN-2 put the old effect it replaces
LEVELS = json.load(open(os.path.join(HERE, 'levels.json')))

# The new player's rules, per effect: takes (file prefix and which take numbers), its level (dB on top of the take's own LUFS), the
# shortest gap between two (s), at most how many may start within 0.3 s (later ones are dropped), the pitch jitter (+-, as a rate) and
# the gain jitter (+- dB). Keyed pickups get almost no pitch jitter: they are tuned.
PLAYER = {
    'rock':       dict(takes=('rock', 6), db=0, gap=0.12, cap=3, pj=0.05, gj=1.5),
    'rockWarn':   dict(takes=('rockWarn', 4), db=0, gap=0.8, cap=1, pj=0.04, gj=1),
    'flower':     dict(takes=('flower', 8), db=0, gap=0.09, cap=3, pj=0.004, gj=1.5),
    'stepMoss':   dict(takes=('stepMoss', 8), db=0, gap=0.17, cap=2, pj=0.04, gj=1.5),
    'stepWood':   dict(takes=('stepWood', 8), db=0, gap=0.17, cap=2, pj=0.04, gj=1.5),
    'stepStone':  dict(takes=('stepStone', 8), db=0, gap=0.17, cap=2, pj=0.04, gj=1.5),
    'stepWater':  dict(takes=('stepWater', 6), db=0, gap=0.17, cap=2, pj=0.04, gj=1.5),
    'jump':       dict(takes=('jump', 6), db=0, gap=0.06, cap=2, pj=0.04, gj=1.5),
    'doubleJump': dict(takes=('doubleJump', 5), db=0, gap=0.06, cap=2, pj=0.04, gj=1.5),
    'swish':      dict(takes=('swish', 6), db=0, gap=0.07, cap=2, pj=0.05, gj=1.5),
    'vine':       dict(takes=('vine', 6), db=0, gap=0.1, cap=2, pj=0.04, gj=1.5),
    'windChime':  dict(takes=('windChime', 5), db=0, gap=1.4, cap=1, pj=0.03, gj=1.5),
    'checkpoint': dict(takes=('checkpoint', 3), db=0, gap=0.5, cap=1, pj=0.0, gj=0),
    'splash':     dict(takes=('splash', 2), db=0, gap=0.3, cap=1, pj=0.03, gj=1),
}


class Player:
    def __init__(self):
        self.last, self.bag, self.recent = {}, {}, {}

    def take(self, fx, sub=None):
        """a shuffle bag: every take once before any repeats, never the same twice in a row"""
        prefix, n = PLAYER[fx]['takes']
        idx = sub if sub is not None else list(range(n))
        key = (fx, tuple(idx))
        bag = self.bag.get(key)
        if not bag:
            bag = list(idx)
            rnd.shuffle(bag)
            if len(bag) > 1 and bag[-1] == self.last.get(key):
                bag[0], bag[-1] = bag[-1], bag[0]
            self.bag[key] = bag
        k = bag.pop()
        self.last[key] = k
        return os.path.join(TAKES, f'{prefix}_{k}.mp3')

    def play(self, fx, t, sub=None, db=0.0, file=None, rate_mul=1.0):
        r = PLAYER[fx]
        if t - self.last.get(('t', fx), -9) < r['gap']:
            return None
        rec = [x for x in self.recent.get(fx, []) if t - x < 0.3]
        if len(rec) >= r['cap']:
            return None
        rec.append(t)
        self.recent[fx] = rec
        self.last[('t', fx)] = t
        f = file or self.take(fx, sub)
        prefix = r['takes'][0]
        k = int(os.path.basename(f).rsplit('_', 1)[1].split('.')[0])
        g = r['db'] + db + LEVELS.get(prefix, [0] * 99)[k] + rnd.uniform(-r['gj'], r['gj'])
        return {'t': t, 'file': f, 'gain': round(10 ** (g / 20), 4), 'rate': round(rate_mul * (1 + rnd.uniform(-r['pj'], r['pj'])), 4)}


def render(port, spec, name):
    p = os.path.join(TMP, name + '.json')
    json.dump(spec, open(p, 'w'))
    w = os.path.join(TMP, name + '.wav')
    subprocess.run(['node', os.path.join(HERE, 'render.mjs'), str(port), p, w], check=True, stdout=subprocess.DEVNULL)
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', w, '-c:a', 'libmp3lame', '-b:a', '128k', os.path.join(OUT, name + '.mp3')], check=True)
    return w


def numbers(w, per_min=None):
    import numpy as np
    s = stats(load(w))
    from measure import load as ld
    st = ld(w, sr=48000, channels=2)
    s['peak'] = round(20 * float(np.log10(np.abs(st).max() + 1e-12)), 1)
    s['lufs'] = lufs(st, 48000)
    if per_min is not None:
        s['per_min'] = per_min
    return s


RESULTS = json.load(open(os.path.join(OUT, 'numbers.json'))) if os.path.exists(os.path.join(OUT, 'numbers.json')) else {}


def pair(name, old_events, new_events, dur, amb=None, old_extra=None, per_min=None):
    if ONLY and name not in ONLY:
        return
    wo = render(4304, {'dur': dur, 'amb': amb, 'events': old_events}, f'{name}-old')
    wn = render(4303, {'dur': dur, 'amb': amb, 'events': new_events}, f'{name}-new')
    RESULTS[name] = {'old': numbers(wo, per_min and per_min[0]), 'new': numbers(wn, per_min and per_min[1])}
    if amb:
        # the effects alone too, so the bed does not blur the numbers (not published)
        fo = render(4304, {'dur': dur, 'events': old_events}, f'.fx-{name}-old')
        fn = render(4303, {'dur': dur, 'events': new_events}, f'.fx-{name}-new')
        RESULTS[name]['old_fx_only'] = numbers(fo)
        RESULTS[name]['new_fx_only'] = numbers(fn)
        for f in (f'.fx-{name}-old.mp3', f'.fx-{name}-new.mp3'):
            os.remove(os.path.join(OUT, f))
    print(name, json.dumps(RESULTS[name]), flush=True)


# ------------------------------------------------------------------------------------------------- the pairs

def rock_single():
    pl = Player()
    pair('rock-single', [{'t': 0.3, 'fx': 'hit', 'arg': 0}], [pl.play('rockWarn', 0.0, db=-3), pl.play('rock', 0.3)], 2.5)


def rock_burst():
    """four rocks inside 0.7 s (two drop points and the cascade over a ledge)"""
    ts = [0.3, 0.45, 0.72, 0.98]
    pl = Player()
    new = [e for t in ts if (e := pl.play('rock', t))]
    pair('rock-burst', [{'t': t, 'fx': 'hit', 'arg': 0} for t in ts], new, 3.0)


def petal_trail():
    """a trail of twelve petals picked up at a run (one every 0.11 s), as in the game: combo 1..12"""
    ts = [0.3 + 0.11 * i for i in range(12)]
    pl = Player()
    new = [e for t in ts if (e := pl.play('flower', t))]
    pair('petal-trail', [{'t': t, 'fx': 'flower', 'arg': i + 1} for i, t in enumerate(ts)], new, 3.2)


def footsteps():
    """ten steps at a walk (0.3 s apart) on each surface; the old set has one footstep for every surface"""
    ts = [0.3 + 0.3 * i for i in range(10)]
    for surf in ['Moss', 'Wood', 'Stone']:
        pl = Player()
        new = [e for t in ts if (e := pl.play('step' + surf, t))]
        pair(f'steps-{surf.lower()}', [{'t': t, 'fx': 'step'} for t in ts], new, 3.6)


def map_new(pl, fx, arg, at, t, world):
    """an old call (name, argument, where in the game it came from) -> the new sound"""
    if fx == 'step':
        surf = {4: 'stepStone', 1: 'stepMoss'}.get(world, 'stepMoss')
        if world == 1 and rnd.random() < 0.35:
            surf = 'stepWood'   # (1-2: half the run is along branches)
        return pl.play(surf, t)
    if fx == 'land':
        s = arg if arg is not None else 0.4
        sub = [0, 1] if s < 0.35 else [2, 3] if s < 0.7 else [4, 5]
        return pl.play('landing' if 'landing' in PLAYER else 'jump', t, sub=sub) if 'landing' in PLAYER else None
    if fx in ('jump', 'doubleJump', 'flower', 'checkpoint'):
        return pl.play(fx, t)
    if fx in ('kick', 'punch', 'megaPunch'):
        return pl.play('swish', t)
    if fx == 'vine':
        return pl.play('windChime' if 'w4Play' in (at or '') else 'vine', t)
    if fx == 'glide':
        k = int(arg or 0)
        return pl.play('glide', t, sub=[{0: 0, 1: 1, 2: 4}[k]]) if 'glide' in PLAYER else None
    if fx == 'whoosh' and 'engine.ts:2068' in (at or ''):
        return pl.play('splash', t)
    if fx == 'hit' and 'engine.ts:2069' in (at or ''):
        return None   # (the water fall: the splash above is the whole sound)
    return None


PLAYER['landing'] = dict(takes=('landing', 6), db=0, gap=0.08, cap=2, pj=0.04, gj=1.5)
PLAYER['glide'] = dict(takes=('glide', 5), db=0, gap=0.03, cap=2, pj=0.03, gj=1)


def stage_mix(stage, start, dur, world, amb, rocks=None, kick_keep=0.35):
    log = json.load(open(FXC))['res'][stage]
    evs = [(t / 1000 - start, fx, arg, at) for t, fx, arg, at in log if start <= t / 1000 < start + dur]
    # the bot swings at nothing all the time: keep about a third of its punches and kicks (a player strikes near enemies)
    evs = [e for e in evs if e[1] not in ('kick', 'punch') or rnd.random() < kick_keep]
    old = [{'t': round(t, 3), 'fx': fx, **({'arg': arg} if arg is not None else {})} for t, fx, arg, at in evs]
    pl = Player()
    new = []
    for t, fx, arg, at in evs:
        e = map_new(pl, fx, arg, at, t, world)
        if e:
            new.append(e)
    for t in rocks or []:
        old.append({'t': t, 'fx': 'hit', 'arg': 0})
        for e in (pl.play('rockWarn', t - 1.4, db=-3), pl.play('rock', t)):
            if e:
                new.append(e)
    pair(f'mix-{stage}', old, new, dur, amb=amb, per_min=(len(old) * 60 / dur, len(new) * 60 / dur))


if __name__ == '__main__':
    rock_single()
    rock_burst()
    petal_trail()
    footsteps()
    # 4-4: the bot's own minute (its chimes, steps, jumps, vines and glides) from 10 s, with the rock drops the stage really has where he
    # passes its three drop points (each every 5-5.6 s, two in reach at once): seven rocks in the 30 s
    stage_mix('4-4', 10, 30, 4, 'waterfall', rocks=[5.2, 9.0, 10.3, 14.6, 15.4, 20.2, 25.8])
    json.dump(RESULTS, open(os.path.join(OUT, 'numbers.json'), 'w'), indent=1)
