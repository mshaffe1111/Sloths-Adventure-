#!/bin/bash
# CP3: the fun gate's pacing lines on 1-5 over 16 rolls (the designer's ruling (b), 11-05: judged on the 16-roll median and worst, as every
# other line is), both settings. The inspector writes one report per run, so the rolls go one after another; the numbers are collected per roll.
cd "$(dirname "$0")/../.."
OUT=${1:-/tmp/pace16.jsonl}; : > "$OUT"
for s in $(seq 1 16); do
  npx tsx tools/inspect/inspect.ts --worlds 1 --stages ${SID:-1-5} --seed $s > /dev/null 2>&1
  python3 -I - "$s" "$OUT" <<'PY'
import json, sys
b = json.load(open('tools/inspect/out/report.json'))['stages'][0]
row = {'seed': int(sys.argv[1])}
for st in ('normal', 'easy'):
    p = b['pacing'][st]; lb = p['bursts']['longest'] if isinstance(p['bursts'], dict) else None
    row[st] = {'density': round(p['density'], 3), 'longestRun': round(lb['t1'] - lb['t0'], 1) if lb else None, 'dead': round(b['dead'][st]['longest'], 2), 'flags': [f['what'][:80] for f in p['flags']]}
open(sys.argv[2], 'a').write(json.dumps(row) + '\n')
PY
done
