# RUNS #17 #18: cp2-animals.ts's measure (engine-spec cp2/cp2-animals.ts.txt) on 16 layouts: the first-timer bot's harms whose cause is the
# animal, grouped by animal: each animal of that kind on the stage, and the harms within 200 px of it; turtles within 400 px of each other
# are one line (cp2-animals groups harms within 400 px). Only animals he reached count (x up to his furthest jump or harm + 200 px). Per animal: hearts lost (hits + lives); per line: line size and hearts lost.
# Counted runs only (reference/methods/validator.md step 4: more than 3 rescues or no shrine is not counted); the raw figures over every
# run follow, marked RAW.
#   python3 -I tools/engine/runs/animals.py <ftsweep.json> <animal type> <cause word>
import json, sys, collections
d = json.load(open(sys.argv[1])); kind, word = sys.argv[2], sys.argv[3]
for who, only in [(w, o) for w in ('ADULT', 'KID') for o in (True, False)]:
    per_animal = collections.Counter(); lines = collections.defaultdict(list); n_an = 0; ends = collections.Counter()
    sel = [x for x in d if x['who'] == who and (not only or (x['rescues'] <= 3 and x['end'] == 'shrine'))]
    if not sel: print(f"{d[0]['id']} {kind} {who}: NOT JUDGED, no counted run (ends {dict(collections.Counter(x['end'] for x in d if x['who'] == who))})"); continue
    for r in sel:
        ends[r['end']] += 1
        reach = max([t['x'] for t in r['tries']] + [h['x'] for h in r['harms']] + [0])
        an = sorted(e['x'] for e in r['enemies'] if e['t'] == kind and e['x'] <= reach + 200)  # only the animals he got to
        n_an += len(an)
        hs = [h for h in r['harms'] if word in h['cause']]
        lost = collections.Counter()
        for h in hs:
            i = min(range(len(an)), key=lambda i: abs(an[i] - h['x'])) if an else None
            if i is not None and abs(an[i] - h['x']) <= 400: lost[i] += 1
        for i in range(len(an)): per_animal[lost[i]] += 1
        grp = []
        for i, x in enumerate(an):
            if grp and x - an[grp[-1][-1]] <= 400: grp[-1].append(i)
            else: grp.append([i])
        for g in grp: lines[len(g)].append(sum(lost[i] for i in g))
    tot = sum(per_animal.values())
    print(f"{'' if only else 'RAW '}{d[0]['id']} {kind} {who}: {len(sel)} runs, {tot} animals over {len(set(x['layout'] for x in d))} layouts (ends {dict(ends)}); hearts lost at an animal: " + ', '.join(f'{k}: {v}' for k, v in sorted(per_animal.items())) + f"; past with <= 1 lost {sum(v for k, v in per_animal.items() if k <= 1)}/{tot}; with none lost {per_animal[0]}/{tot} ({per_animal[0] / max(1, tot):.2f})")
    for size in sorted(lines): v = lines[size]; print(f"   lines of {size}: {len(v)}; hearts lost per line {sorted(collections.Counter(v).items())}; <= 1 lost {sum(1 for x in v if x <= 1)}/{len(v)}")
