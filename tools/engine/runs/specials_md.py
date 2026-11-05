# RUNS "Specials": the markdown table from specials.py's rows.   python3 -I tools/engine/runs/specials_md.py specials-rows.jsonl
import json, sys, re
CAP = 0.253  # the interim float cap: old 1-1's share (support.py), the lead's ruling 11-05
rows = [json.loads(l) for l in open(sys.argv[1])]
print('| Stage | Builder | Support: float N / E; floating stones a build | Water | Length (quick clock, Normal) | Ladder: first here / brought back | Look-alike vs neighbours (rolls of 16; layouts) | Fixes that reach it by shared code | Still a hand (builder) fix |')
print('|---|---|---|---|---|---|---|---|---|')
for r in rows:
    fl = r['float']; fN = float(fl.split('%')[0]) / 100 if fl != '-' else None
    st = int(r['stones'].split()[0]) if r['stones'] != '-' else 0
    water = ('rivers / water signs' if r['rivers'] else 'pit water only') + ('; 4-3 falls and tides (own arrays)' if r['id'] == '4-3' else '') + ('; CALM pool' if r['swim'] else '') + ' (W3: one kind, PASS)'
    reach = []
    reach.append(f'render-stone: {st} open-air stone pieces a build drawn on a column or as kin' if st else 'render-stone: no open-air stone to change')
    cr = r['crumble']
    if 'engine default' in cr: reach.append('crumble 0.5 s: its pieces on the engine default take it')
    reach.append('water kind -> art: its water is drawn by the shared painters, so it lands here when built (not on any branch yet)' if r['id'] != '4-3' else 'water kind -> art: pit water yes; the falls and tides use 4-3\'s own painter')
    if re.match(r'(5|8)-10$', r['id']) or r['id'].startswith('3-'): reach.append('keyscan: a remade frame it draws (R-164.15 list)')
    hand = []
    if fN is not None and fN > CAP: hand.append(f'floats {fN:.0%} over the 25.3% interim cap')
    if 'UNTIMED' in r['clock']: hand.append('the quick clock does not time it (stageTime.ts:152)')
    elif 'under 2:00' in r['clock']: hand.append('under the 2:00 floor')
    if 'own' in cr: hand.append(f'crumble 0.5 s must be set in its builder ({cr})')
    lk = [x for x in r['look'].split(', ') if '/16' in x and int(x.split()[1].split('/')[0]) >= 8]
    if lk: hand.append('plays like ' + ', '.join(lk))
    if r['id'] == '4-3': hand.append('water kind -> art in its own falls/tides painter')
    print(f"| {r['id']} {r['name']} | {r['builder']} | {fl}; {r['stones']} | {water} | {r['clock']} | {r['teaches'] or '-'} / {r['echoes']} | {r['look']}; {r['layouts']} | {'; '.join(reach)} | {'; '.join(hand) or 'none found'} |")
