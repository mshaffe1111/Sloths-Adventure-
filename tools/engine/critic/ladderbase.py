# Critic's run: the shipped game's own "how much, how often" for each mechanic (old W1 on main; W2-W4, identical on main and engine-mixer),
# against ENGINE-SPEC L1311-1321's OPEN amounts. Input: mechcount.ts JSON files. Median over 16 layouts per stage.
import json, sys, statistics as st
C = {}; order = []
for f in sys.argv[1:]:
    d = json.load(open(f)); order += d['stages']; C.update(d['counts'])
order = [s for s in order if not s.endswith('-10')]  # lairs out (the ladder skips lairs)
band = lambda n: 'none' if n == 0 else 'touch' if n <= 2 else 'some' if n <= 6 else 'lots'
mechs = sorted({m for s in C.values() for m in s})
print('stages:', ' '.join(order)); print()
print(f"{'mechanic':<14} {'first':<5} {'teach n':<7} {'echo +1,+2':<11} {'own-world rest: present / of':<29} {'later worlds: present / of':<26} bands after first (touch/some/lots)")
for m in mechs:
    med = {s: st.median(C[s].get(m, [0])) for s in order}
    pres = [s for s in order if med[s] > 0]
    if not pres or m == 'gap': continue
    f = pres[0]; i = order.index(f); w = f.split('-')[0]
    echo = [med[s] for s in order[i + 1:i + 3]]
    own = [s for s in order[i + 3:] if s.split('-')[0] == w]
    later = [s for s in order[i + 1:] if s.split('-')[0] != w]
    after = [band(med[s]) for s in order[i + 1:] if med[s] > 0]
    print(f"{m:<14} {f:<5} {med[f]:<7g} {','.join(f'{e:g}' for e in echo):<11} {sum(med[s] > 0 for s in own):>3} / {len(own):<23} {sum(med[s] > 0 for s in later):>3} / {len(later):<20} {after.count('touch')}/{after.count('some')}/{after.count('lots')}")
