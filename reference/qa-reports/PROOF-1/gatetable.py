# Prints the PROOF-1 gate table (markdown) from logs/table.txt: name | exit | s | ET end | one-line result (last PASS/FAIL line of its log)
import os, re, sys
d = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'logs')
print('| run | exit | s | ET end | result |\n|---|---|---|---|---|')
for line in open(os.path.join(d, 'table.txt')):
    name, ex, s, et, cmd = line.rstrip('\n').split('|', 4)
    res = ''
    p = os.path.join(d, name + '.log')
    if os.path.exists(p):
        txt = open(p, errors='replace').read()
        txt = re.sub(r'\x1b\[[0-9;]*m', '', txt)
        tests = re.findall(r'^# (tests|pass|fail|todo|skipped) (\d+)', txt, re.M)
        if tests: res = ', '.join(f'{k} {v}' for k, v in tests)
        else:
            hits = [l.strip() for l in txt.splitlines() if re.search(r'\b(PASS|FAIL)\b', l)]
            res = (hits[-1] if hits else txt.strip().splitlines()[-1] if txt.strip() else '')[:140]
    print(f'| {name} | {ex} | {s} | {et} | {res.replace("|", "/")} |')
