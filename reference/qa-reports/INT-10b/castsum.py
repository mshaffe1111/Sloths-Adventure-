# INT-10b: castBots --json lines summarised per bot and setting (pass, lives, rescues, failing seeds). Args: jsonl stage
import json,sys,collections
rows=[json.loads(l) for l in open(sys.argv[1]) if l.startswith('{')]
by=collections.defaultdict(list)
for r in rows: by[(r['bot'],r['setting'])].append(r)
print(f"castBots {sys.argv[2]}: {len(rows)} runs")
for k,v in sorted(by.items()):
    fails=[r for r in v if not r['pass']]
    why=collections.Counter(f"{r['end']}{' rescued x'+str(r['rescues']) if r.get('rescues') else ''}" for r in fails)
    print(f"  {k[0]:6} {k[1]:6} PASS {len(v)-len(fails)}/{len(v)}; lives {sum(r['lives'] for r in v)}; rescues {sum(r.get('rescues',0) for r in v)}" + (f"; fails {dict(why)} seeds {[r['seed'] for r in fails]}" if fails else ''))
