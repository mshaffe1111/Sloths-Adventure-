# Critic's run: the whole-game variety baseline from era.ts JSON (one file per world and setting), against STAGE-RULES §2's lines
# (era.ts `rules`: diversity ≥0.35 between rolls, look-alike cosine <0.78 and 20 s window <0.30 against the world's other stages,
# ≥120 s, no quiet stretch over 4 s). Usage: python3 erasum.py <dir> <tag> (files <tag>-w<N>-<setting>.json)
import json, sys, os, statistics as st
d, tag = sys.argv[1], sys.argv[2]
tot = {}
for setting in ('normal', 'easy'):
    print(f'=== {tag}, {setting} ===')
    print(f"{'stage':<6} {'div':>5} {'win':>5} {'acts':>4} {'seqs':>4} {'lkal':>4}  {'short':>5} {'quiet':>5} {'dead':>4} {'valid':>5}  look-alike with (rolls of 16)")
    for w in range(1, 11):
        f = os.path.join(d, f'{tag}-w{w}-{setting}.json')
        if not os.path.exists(f): continue
        J = json.load(open(f)); n = J['rolls']; divs = []
        for s in J['stages']:
            dv = s['diversity']; fl = s['fails']; ds = s['distinct']
            if dv.get('cosine') is None: dv = dict(dv, cosine=float('nan'))
            lw = ', '.join(f'{k}:{v}' for k, v in sorted(s['lookalikeWith'].items(), key=lambda kv: -kv[1])[:3])
            divs.append(dv['cosine']) if dv['cosine'] == dv['cosine'] else None
            print(f"{s['id']:<6} {dv['cosine']:>5.2f} {(dv['window'] if dv['window'] is not None else float('nan')):>5.2f} {ds['actions']:>4} {ds['sequences']:>4} {fl['lookalike']:>4}  {fl['short']:>5} {fl['quiet']:>5} {fl['dead']:>4} {fl['validator']:>5}  {lw}")
            tot.setdefault(setting, []).append((s['id'], dv['cosine'], fl['lookalike'], n, fl['lookWindow'], fl['quiet'], fl['dead'], fl['short']))
        print(f"-- W{w}: median diversity {st.median(divs) if divs else float('nan'):.2f}; under 0.35: {sum(x < 0.35 for x in divs)}/{len(divs)}; skipped {len(J.get('skipped') or [])}")
    print()
for setting, rows in tot.items():
    ok = [r for r in rows if r[1] == r[1]]
    under = [r for r in ok if r[1] < 0.35]; look = [r for r in rows if r[2] > r[3] / 2]
    print(f'{tag} {setting}: {len(rows)} stages; diversity under 0.35: {len(under)} (median {st.median([r[1] for r in ok]):.2f}); stages where over half the rolls look like another stage of the world: {len(look)}; a roll breaking quiet (>4 s): {sum(r[5] > 0 for r in rows)}, dead-time share: {sum(r[6] > 0 for r in rows)}, short (<120 s): {sum(r[7] > 0 for r in rows)}')
