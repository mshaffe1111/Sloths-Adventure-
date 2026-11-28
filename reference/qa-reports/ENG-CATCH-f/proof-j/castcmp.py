# compare castBots rows on two trees: a run that holds (pass and time >= floor) on base and not on cand is a regression
import json, sys
base, cand, floor_c = sys.argv[1], sys.argv[2], float(sys.argv[3])
def load(f): return {(r['bot'], r['setting'], r['seed']): r for r in map(json.loads, filter(str.strip, open(f)))}
B, C = load(base), load(cand)
holds = lambda r: r['pass'] and r['time'] >= floor_c
keys = sorted(set(B) | set(C))
print(f"runs base {len(B)} cand {len(C)}; floor {floor_c} s")
summ = {}
for k in keys:
    s = summ.setdefault(k[:2], [0, 0, 0])
    s[0] += 1; s[1] += bool(k in B and holds(B[k])); s[2] += bool(k in C and holds(C[k]))
print("bot    setting  holds base -> cand (of N)")
for (b, st), (n, hb, hc) in sorted(summ.items()): print(f"{b:6} {st:7}  {hb:2} -> {hc:2}  (of {n})")
reg = [k for k in keys if k in B and holds(B[k]) and not (k in C and holds(C[k]))]
gain = [k for k in keys if k in C and holds(C[k]) and not (k in B and holds(B[k]))]
fmt = lambda r: (f"{r['time']} s" if r['pass'] else (r.get('error') or f"{r['end']} rescued x{r['rescues']}"))
print(f"REGRESSIONS (holds on base, not on cand): {len(reg)}")
for k in reg: print("  ", k, "base", fmt(B[k]), "| cand", fmt(C[k]) if k in C else "missing")
print(f"gains (holds on cand, not on base): {len(gain)}")
for k in gain: print("  ", k, "base", fmt(B[k]) if k in B else "missing", "| cand", fmt(C[k]))
