#!/usr/bin/env python3
"""Check every file:line citation in reference/engine/SPEC-TRACE.md.
Resolves short names to (branch, path), prints the cited line(s), and checks that a number or key word
from the row appears on the cited line range (exact lines, no slack). Usage: python3 -I citecheck.py [--all]"""
import re, subprocess, sys, functools
REPO = '/home/user/Sloths-Adventure-'
CCR, DES, MIX, MAIN, WT = 'a42689e6', 'db3342a1', '7d9ad9a9', '68b31e66', None
PLAN, RHY = 'origin/engine-plan', 'origin/w1-rhythm'
SHORT = {
 'D': (DES, 'reference/engine/DESIGNER.md'), 'MD': (CCR, 'reference/engine/MATT-DIRECTION.md'),
 'ccr': (CCR, 'reference/STAGE-RULES.md'), 'RM': (CCR, 'reference/ROADMAP.md'), 'ST': (CCR, 'reference/STATUS.md'),
 'LD': (CCR, 'reference/roles/LEVEL-DESIGNER.md'), 'BR': (CCR, 'reference/engine/story-briefs/1-1.md'),
 'MW1': (CCR, 'reference/qa-reports/validator/mechanics-world1.md'),
 'R1': (CCR, 'reference/research/engine-2026-11-05/R1-shipped-pipelines.md'), 'R2': (CCR, 'reference/research/engine-2026-11-05/R2-academic-pcg.md'),
 'R3': (CCR, 'reference/research/engine-2026-11-05/R3-fun-by-math.md'), 'R4': (CCR, 'reference/research/engine-2026-11-05/R4-mobile-and-architecture.md'),
 'GP': (WT, 'reference/GEMINI-PCG-RESEARCH.md'), 'GL': (WT, 'reference/GEMINI-LEDGER.md'),
 'GV': (WT, 'reference/research/GEMINI-VARIETY-2026-11-02-full.txt'), 'GVs': (WT, 'reference/research/GEMINI-VARIETY-2026-11-02.md'),
 'LEG': (DES, 'reference/research/ledger/LEDGER-ENGINE-GEMINI.md'), 'LEP': (DES, 'reference/research/ledger/LEDGER-ENGINE-PAPERS.md'),
 'GE': (DES, 'reference/research/engine-2026-11-04/GEMINI-ENGINE-ARCHITECTURE.txt'), 'CA': (DES, 'reference/research/engine-2026-11-04/CARMO-thesis-2024.txt'),
 'TA': (DES, 'reference/research/engine-2026-11-04/TANAGRA-paper.txt'), 'GC': (DES, 'reference/research/engine-2026-11-04/GEMINI-CRITICAL-AGENTS.txt'),
 'LCA': (DES, 'reference/research/ledger/LEDGER-CRITICAL-AGENTS.md'), 'PERFORMANCE-RULES': (WT, 'reference/PERFORMANCE-RULES.md'),
 'PARTNER.md': (CCR, 'reference/PARTNER.md'), 'w1mix': (MIX, 'src/game/mixer/w1mix.ts'), 'ES': (WT, 'reference/engine/ENGINE-SPEC.md'),
}
CODE = {'dotLinesData.ts': 'src/game/dotLinesData.ts', 'protoStage.ts': 'src/game/protoStage.ts', 'stageClue.ts': 'src/components/stageClue.ts',
 'lessons.ts': 'src/game/lessons.ts', 'biomes.ts': 'src/game/biomes.ts', 'stagePlan.ts': 'src/game/stagePlan.ts', 'levelCheck.ts': 'src/game/levelCheck.ts',
 'easyMode.ts': 'src/game/easyMode.ts', 'engine.ts': 'src/game/engine.ts', 'beatTrace.ts': 'src/game/beatTrace.ts', 'core.ts': 'tools/validate/core.ts'}
DOCS = {'PLAN.md': (PLAN, 'reference/engine/PLAN.md'), 'W1-REBUILD-PLAN.md': (CCR, 'reference/W1-REBUILD-PLAN.md'), 'reference/W1-REBUILD-PLAN.md': (CCR, 'reference/W1-REBUILD-PLAN.md')}
BR_TAG = {'[main]': MAIN, '[ccr]': CCR, '[engine-mixer 7d9ad9a9]': MIX, '[w1-rhythm]': RHY, '[engine-plan]': PLAN}
@functools.lru_cache(None)
def lines(branch, path):
    try:
        if branch is None: return open(f'{REPO}/{path}', encoding='utf-8').read().split('\n')
        return subprocess.run(['git', '-C', REPO, 'show', f'{branch}:{path}'], capture_output=True, text=True, check=True).stdout.split('\n')
    except Exception: return None
def resolve(name, cell):
    if name in SHORT: return SHORT[name]
    if name in DOCS: return DOCS[name]
    base = name.split('/')[-1]
    if name.startswith(('cp1/', 'cp2/', 'cp3/')): return (WT, 'reference/engine/' + name)
    if name.startswith(('src/', 'tools/')): p = name
    elif base in CODE: p = CODE[base]
    else: return None
    br = RHY if base == 'beatTrace.ts' else CCR if base == 'core.ts' else MAIN
    m = re.search(re.escape(name) + r'[^|;]*?(\[(main|ccr|engine-mixer 7d9ad9a9|w1-rhythm|engine-plan)\])', cell)
    if m: br = BR_TAG[m.group(1)]
    return (br, p)
CITE = re.compile(r'(?<![\w/.-])((?:cp[123]/|src/|tools/)?[A-Za-z][\w./-]*?)(?::| )(\d+)(?:-(\d+))?((?:, :\d+(?:-\d+)?)*)')
STOP = set('the and that with from this only every their there which about after before never under over into each more less than none they his her its for not'.split())
def keys(text):
    t = text.lower()
    nums = set(re.findall(r'\d+(?:[.,]\d+)+|\d{2,}', t))
    words = {w for w in re.findall(r"[a-z][a-z'-]{4,}", t) if w not in STOP}
    return nums, words
def check(rng, nums, words):
    blob = ' '.join(rng).lower()
    hit = [n for n in nums if n in blob or n.replace(',', '') in blob]
    hitw = [w for w in words if w in blob]
    return hit, hitw
def main():
    show_all = '--all' in sys.argv
    trace = open(f'{REPO}/reference/engine/SPEC-TRACE.md').read().split('\n')
    tot = ok = miss = unres = 0
    for ln, row in enumerate(trace, 1):
        if not row.startswith('| ') or row.startswith('|---'): continue
        cells = [c.strip() for c in row.split('|')[1:-1]]
        cites = []
        for ci, cell in enumerate(cells):
            for m in CITE.finditer(cell):
                name, a, b, more = m.group(1), int(m.group(2)), m.group(3), m.group(4)
                if m.group(0)[len(name)] == ' ' and name != 'ES': continue  # "X n" form only for ES
                if name == 'ES' and ci < 1: continue  # first column is the spec line itself
                if name in ('E', 'C', 'P', 'F', 'W', 'L') : continue
                spans = [(a, int(b) if b else a)]
                for mm in re.finditer(r':(\d+)(?:-(\d+))?', more or ''):
                    spans.append((int(mm.group(1)), int(mm.group(2) or mm.group(1))))
                cites.append((name, spans, cell))
        if not cites: continue
        nums, words = keys(' '.join(cells[:2] + cells[3:5]) if len(cells) >= 6 else row)
        for name, spans, cell in cites:
            r = resolve(name, cell)
            for a, b in spans:
                tot += 1
                L = lines(*r) if r else None
                if not L:
                    unres += 1; print(f'UNRESOLVED trace:{ln} {name}:{a}'); continue
                rng = L[a-1:b] if b >= a else []
                hn, hw = check(rng, nums, words)
                strong = [n for n in hn if len(n) >= 3]
                good = bool(strong) or (bool(hn) and len(hw) >= 1) or len(hw) >= 3 or (len(hw) >= 2 and b - a < 3)
                if good: ok += 1
                else: miss += 1
                if not good or show_all:
                    print(f"{'OK  ' if good else 'MISS'} trace:{ln} {name}:{a}{'-'+str(b) if b!=a else ''} nums={sorted(hn)[:4]} words={sorted(hw)[:4]}")
                    print('     row:', ' | '.join(cells[:2])[:110])
                    for i, l in enumerate(rng[:3], a): print(f'     {i}: {l[:150]}')
    print(f'checked {tot}, ok {ok}, miss {miss}, unresolved {unres}')
main()
