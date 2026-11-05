# CP2: tag each stretch of a strip with the node idea it plays as (designer, 2026-11-05). python3 -I tag_ideas.py strips.json
# Rules read what the player meets, by x: a bounce mushroom starts a "bounce up"; a run of branches above the floor is a
# "canopy run" (with a floor under it in parallel it is "the fork"); short banks/logs at changing heights are "bank hops";
# a rope is a "rope crossing"; a stone on a high log is a "high perch"; long flat floor with nothing else is "flat walk".
import json, sys
d = json.load(open(sys.argv[1]))
def tag(p):
    out = []
    for x, w, y, k, f in p:
        if k == 'mushroom': t = 'bounce up'
        elif k in ('rope',): t = 'rope crossing'
        elif k == 'stone': t = 'high perch'
        elif k == 'branch' and y < 450: t = 'canopy run'
        elif k == 'branch': t = 'low boughs'
        elif k in ('bank', 'log') and w <= 320: t = 'bank hops'
        elif k == 'log' and w > 900 and y >= 560: t = 'floor under canopy'
        else: t = 'flat walk' if w > 320 else 'bank hops'
        out.append((x, x + w, t))
    out.sort()
    segs = []
    for a, b, t in out:
        if t == 'floor under canopy':
            continue  # counted as the low road of a fork below
        if segs and segs[-1][2] == t and a - segs[-1][1] < 450: segs[-1][1] = max(segs[-1][1], b)
        else: segs.append([a, b, t])
    floors = [(a, b) for a, b, t in out if t == 'floor under canopy']
    for s in segs:
        if s[2] == 'canopy run' and any(fa < s[1] and fb > s[0] and min(fb, s[1]) - max(fa, s[0]) > 300 for fa, fb in floors):
            s[2] = 'the fork (canopy over the floor)'
    return segs
res = {}
for s in d:
    segs = tag(s['p']); res[s['name']] = segs
    total = sum(b - a for a, b, _ in segs) or 1
    share = {}
    for a, b, t in segs: share[t] = share.get(t, 0) + (b - a)
    seq = [t for _, _, t in segs]
    runs, best, cur = [], 1, 1
    for i in range(1, len(seq)):
        cur = cur + 1 if seq[i] == seq[i - 1] else 1; best = max(best, cur)
    print(f"== {s['name']}: {len(segs)} stretches, {len(share)} ideas")
    for t, v in sorted(share.items(), key=lambda kv: -kv[1]): print(f"   {t:34s} {v/total:5.0%}")
    print('   order:', ' > '.join(f"{t}" for t in seq))
json.dump(res, open(sys.argv[1].replace('strips.json', '../cp2/idea-tags.json'), 'w'), indent=1)
