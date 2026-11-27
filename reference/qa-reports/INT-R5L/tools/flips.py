import json, sys, os
# usage: flips.py <main dir> <fix dir>  -> per stage: rows, differing, pass->fail flips (named), fail->pass, rescue/lives moves
M, F = sys.argv[1:3]
for st in ['2-1', '2-2', '2-4', '2-5', '1-4']:
    pm, pf = f'{M}/{st}.jsonl', f'{F}/{st}.jsonl'
    if not (os.path.exists(pm) and os.path.exists(pf)): print(st, 'MISSING', os.path.exists(pm), os.path.exists(pf)); continue
    a = {(r['bot'], r['setting'], r['seed']): r for r in map(json.loads, open(pm))}
    b = {(r['bot'], r['setting'], r['seed']): r for r in map(json.loads, open(pf))}
    ks = sorted(set(a) & set(b)); diff = [k for k in ks if {x: v for x, v in a[k].items() if x != 'time'} != {x: v for x, v in b[k].items() if x != 'time'}]
    pf_ = [k for k in ks if a[k].get('pass') and not b[k].get('pass')]; fp = [k for k in ks if not a[k].get('pass') and b[k].get('pass')]
    print(f"{st}: rows {len(ks)} (main {len(a)}, fix {len(b)}), differ {len(diff)}, PASS->FAIL {len(pf_)}, fail->pass {len(fp)}")
    for k in pf_: print('  PASS->FAIL', k, {x: (a[k].get(x), b[k].get(x)) for x in ('end', 'lives', 'rescues', 'time') }, b[k].get('stuck'))
    for k in fp: print('  fail->pass', k, {x: (a[k].get(x), b[k].get(x)) for x in ('end', 'lives', 'rescues')})
    rm = [k for k in diff if a[k].get('rescues') != b[k].get('rescues')]
    for k in rm[:12]: print('  rescues', k, a[k].get('rescues'), '->', b[k].get('rescues'), 'lives', a[k].get('lives'), '->', b[k].get('lives'))
