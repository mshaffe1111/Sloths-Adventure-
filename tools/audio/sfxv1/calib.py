"""Levels for the new takes (polish-sfx, 2026-10-29; SN-2): each take is set to the loudness polish-a2's plan gave the old effect it
replaces (FX_REF and FX_MIX in sfxMix.ts, measured on the old effect rendered through the master chain), plus ADJUST for what Matt called
out. Writes levels.json: {effect: [gain dB per take]}.

    python3 tools/audio/sfxv1/calib.py <takes dir> <out levels.json>
"""
import json, os, subprocess, sys, tempfile
import numpy as np
sys.path.insert(0, os.path.dirname(__file__))
from measure import load, lufs

TAKES, OUTP = sys.argv[1], sys.argv[2]
HERE = os.path.dirname(os.path.abspath(__file__))
# new effect -> (old effect, its argument for each take group, take groups), and the change in dB from the old effect's level
MAP = {
    'rock':       ('hit', [0], None, -3),          # "the rocks falling... annoying": a little under the old hit
    'rockWarn':   ('hit', [0], None, -15),         # the grit before a rock: a whisper
    'flower':     ('flower', [1, 2, 3, 4], None, -3),   # a trail must not sound like pinball
    'stepMoss':   ('step', [None], None, 0),
    'stepWood':   ('step', [None], None, 0),
    'stepStone':  ('step', [None], None, 0),
    'stepWater':  ('step', [None], None, 0),
    'jump':       ('jump', [None], None, 0),
    'doubleJump': ('doubleJump', [None], None, 0),
    'swish':      ('kick', [None], None, -2),
    'vine':       ('vine', [None], None, 0),
    'windChime':  ('vine', [None], None, -4),     # it fired as the vine sound up to every 0.6 s
    'checkpoint': ('checkpoint', [None], None, 0),
    'splash':     ('splash', [0, 0, 1, 1, 2, 2], 'per-take', 0),
    'landing':    ('land', [0.2, 0.2, 0.5, 0.5, 0.95, 0.95], 'per-take', 0),
    'glide':      ('glide', [0, 1, 1, 1, 2], 'per-take', 0),
}


def render_many(port, specs):
    d = tempfile.mkdtemp(dir='/tmp/claude-0')
    p = os.path.join(d, 'specs.json')
    json.dump(specs, open(p, 'w'))
    subprocess.run(['node', os.path.join(HERE, 'render.mjs'), str(port), p, os.path.join(d, 'r.wav')], check=True, stdout=subprocess.DEVNULL)
    out = []
    for i in range(len(specs)):
        st = load(os.path.join(d, f'r_{i}.wav'), sr=48000, channels=2)
        out.append(lufs(st, 48000))
    return out


def ntakes(name):
    n = 0
    while os.path.exists(os.path.join(TAKES, f'{name}_{n}.mp3')):
        n += 1
    return n


# where the old level is not one to keep, a fixed target (LUFS, measured the same way): the old vine grab renders at -7 LUFS, the loudest
# effect in the game (sfxMix.ts CLASSIC_LOUDNESS reads it as -36 and lifts it ~17 dB), and the old glide flutter at -44 (inaudible)
FIXED = {'vine': -17.0, 'windChime': -21.0, ('glide', 1): -27.0, ('glide', 2): -27.0, ('glide', 3): -27.0}

levels = {}
old_specs, old_keys = [], []
for name, (old, args, mode, adj) in MAP.items():
    for a in sorted(set(args), key=lambda v: (v is None, v)):
        for v in range(4):
            ev = {'t': 0.1, 'fx': old}
            if a is not None:
                ev['arg'] = a
            old_specs.append({'dur': 2.5, 'events': [ev]})
            old_keys.append((name, a))
old_l = render_many(4304, old_specs)
old_level = {}
for k, v in zip(old_keys, old_l):
    old_level.setdefault(k, []).append(v)
old_level = {k: float(np.mean([x for x in v if x is not None])) for k, v in old_level.items()}

new_keys = [(name, i) for name in MAP for i in range(ntakes(name))]


def target_of(name, i):
    old, args, mode, adj = MAP[name]
    a = args[i] if mode == 'per-take' else (args[0] if len(args) == 1 else None)
    ref = old_level[(name, a)] if a is not None or len(args) == 1 else float(np.mean([old_level[(name, x)] for x in args]))
    return ref, FIXED.get((name, i), FIXED.get(name, ref + adj))


# the master chain compresses, so a gain change does not move the loudness by as much: render with the gain, correct, three times
gain = {k: 0.0 for k in new_keys}
for it in range(4):
    specs = [{'dur': 2.5, 'events': [{'t': 0.1, 'file': os.path.join(TAKES, f'{n}_{i}.mp3'), 'gain': 10 ** (gain[(n, i)] / 20), 'rate': 1}]}
             for n, i in new_keys]
    got = render_many(4303, specs)
    worst = 0.0
    for k, v in zip(new_keys, got):
        ref, target = target_of(*k)
        err = target - v
        worst = max(worst, abs(err))
        gain[k] += err * (1.0 if it == 0 else 1.6)
    print('pass', it, 'worst error %.2f dB' % worst, flush=True)
for (name, i) in new_keys:
    ref, target = target_of(name, i)
    levels.setdefault(name, []).append(round(gain[(name, i)], 2))
    print(name, i, 'old %.1f' % ref, 'target %.1f' % target, '-> %+.1f dB' % gain[(name, i)], flush=True)
json.dump(levels, open(OUTP, 'w'), indent=1)
