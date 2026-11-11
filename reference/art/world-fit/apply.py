# Apply a multi-world fit table to a cut folder: catalog.csv gets 'world' = worlds best first and 'world_why'; CATALOG.md gets the
# per-piece table and counts rebuilt and a "By world" section.  usage: apply.py <fit module> <cut folder>
import sys, csv, re, importlib
sys.path.insert(0, '.')
from worlds import W, GAP, fmt
F = importlib.import_module(sys.argv[1]).F; C = sys.argv[2]
rows = list(csv.DictReader(open(f'{C}/catalog.csv'))); cols = list(rows[0].keys())
if 'world_why' not in cols: cols.insert(cols.index('world') + 1, 'world_why')
missing = [r['id'] for r in rows if r['id'] not in F]
assert not missing, missing
for r in rows:
    ws, why = F[r['id']]
    r['world'] = fmt(ws) if ws else ''; r['world_why'] = why if ws else ''
with open(f'{C}/catalog.csv', 'w', newline='') as f:
    w = csv.DictWriter(f, cols); w.writeheader(); [w.writerow(r) for r in rows]
kept = [r for r in rows if r['status'] == 'kept']
md = open(f'{C}/CATALOG.md').read()
# per-piece table
a = md.index('## Every piece'); b = md.index('## Rejected')
head = md[a:b].split('\n| id |')[0]
T = [head.rstrip() + '\n', '| id | label | kind | size | walk y (x0-x1) flat | worlds, best first | why | float | notes |', '|---|---|---|---|---|---|---|---|---|']
for x in kept:
    wk = f"{x['walk_y']} ({x['walk_x0']}-{x['walk_x1']}) {x.get('flat', '')}" if x['walk_x0'] else (x['walk_y'] or '')
    T.append(f"| {x['id']} | {x['label']} | {x['kind']} | {x['w']}x{x['h']} | {wk} | {x['world']} | {x['world_why']} | {x['float_class']} | {x['notes']} |")
md = md[:a] + '\n'.join(T) + '\n\n' + md[b:]
# counts table: replace the world columns with "fits W1" and "fits W2"
a = md.index('## Counts per kind'); b = md.index('\n\n', md.index('| **total**', a))
kinds = sorted(set(x['kind'] for x in rows))
fits = lambda x, n: x['world'] and any(p.strip().startswith(f'{n} ') for p in x['world'].split(';'))
T = ['## Counts per kind\n', '| Kind | Kept | Rejected | fits W1 | fits W2 |', '|---|---|---|---|---|']
for k in kinds:
    kk = [x for x in kept if x['kind'] == k]
    T.append(f"| {k} | {len(kk)} | {sum(1 for x in rows if x['kind'] == k and x['status'] != 'kept')} | {sum(1 for x in kk if fits(x, 1))} | {sum(1 for x in kk if fits(x, 2))} |")
T.append(f"| **total** | **{len(kept)}** | **{len(rows) - len(kept)}** | **{sum(1 for x in kept if fits(x, 1))}** | **{sum(1 for x in kept if fits(x, 2))}** |")
md = md[:a] + '\n'.join(T) + md[b:]
# By world section
B = ['## By world (Matt, 11-11: "determine where they work the best... some may work in multiple worlds")\n',
     'Every world a piece fits, judged by material and mood (STORY-KEEPER\'s ten worlds); **bold** = that world is the piece\'s best fit. '
     'The gap is what reference/art/KIT-AUDIT.md (11-06) says the world\'s kit is short of. '
     '**Made things are never World 1** (the lead, 11-11: no made things in the home forest; rope is a made thing, like the lantern): ladders, rope bridges and rope posts, crates, barrels, the lever, sawn posts and boards, carved totems and carved or rune stones go to W2 Sunlit Riverbank (rope and wood work) or W7 Ancient Ruins (carved stone, the lever). Natural pieces (rock, stump, log, root steps, moss, fungus) stay as tagged.\n',
     '| World | Pieces (best fit in bold) | Its kit gap |', '|---|---|---|']
for n in W:
    ps = [(x['id'], x['world'].split(';')[0].strip().startswith(f'{n} ')) for x in kept if fits(x, n)]
    B.append(f"| {n} {W[n]} ({len(ps)}) | {', '.join(f'**{i}**' if best else i for i, best in ps) or 'none'} | {GAP[n]} |")
B = '\n'.join(B) + '\n\n'
if '## By world' in md:
    a = md.index('## By world'); b = md.index('## ', a + 5); md = md[:a] + B + md[b:]
else:
    a = md.index('## Every piece'); md = md[:a] + B + md[a:]
md = re.sub(r'World fit adds \*\*later world\*\*[^\n]*\n', 'World fit is now every world a piece fits, best first, with a reason (Matt, 11-11; "By world" below). Float classes follow Matt\'s 11-07 ruling; the ladders and the rope bridge are **attached**.\n', md)
open(f'{C}/CATALOG.md', 'w').write(md)
print('applied', len(rows), 'rows;', {n: sum(1 for x in kept if fits(x, n)) for n in W})
