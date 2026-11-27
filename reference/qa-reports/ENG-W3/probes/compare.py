# ENG-DOWNBOT: rows of one castBots run against another (a fix off vs the head): each (bot, setting, seed) whose end, rescues or
# time differ, with the first rescued spots. python3 compare.py head.jsonl off.jsonl
import json, sys
def load(f):
    return {(r['bot'], r['setting'], r['seed']): r for r in (json.loads(l) for l in open(f) if l.startswith('{'))}
a, b = load(sys.argv[1]), load(sys.argv[2])
same = diff = 0
for k in sorted(set(a) & set(b)):
    x, y = a[k], b[k]
    if (x['end'], x['rescues'], x['time']) == (y['end'], y['rescues'], y['time']): same += 1; continue
    diff += 1
    print(f"{k[0]} {k[1]} {k[2]}: head {x['end']} R{x['rescues']} {x['time']}s | off {y['end']} R{y['rescues']} {y['time']}s | off stuck: {'; '.join(s['what'][:40] + ' @' + str(s['x']) for s in y['stuck'][:3])}")
print(f"{same} rows identical, {diff} differ ({len(set(a) ^ set(b))} rows in one run only)")
