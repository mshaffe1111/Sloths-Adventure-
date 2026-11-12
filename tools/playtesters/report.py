"""
report.py: the data analyst's playthrough report (reference/roles/DATA-ANALYST.md). Started by the lead 2026-11-07 from the first
gen2 1-1 play window. Grow it; don't restart it.

  python3 -I tools/playtesters/report.py <sheet export.json> [<more exports>...]
  python3 -I tools/playtesters/report.py --self-test     (invented fixture rows; prints one line, exits 1 on a mismatch)

Each input is a Google Sheets values export of the Sessions tab, columns B..H:
  [player, session, part, device, build, seconds, data], where data is "gz64:<gzip+base64 JSON list of moments>".
Prints: per-section entries, median time, put-backs and lives lost; per-player finishes, lives lost and taps read as punches; glitches;
the moves (double jump, bounce): runs that used each and how many times. The recorder logs a stage's first use of a move as
`move <kind> <x>` and, since R-165.58, every later use as `use <kind> <x>`; a log from before that has only the `move` row, so its
runs count as before and its uses count 1 per run (a floor).
"""
import base64, collections, gzip, io, json, os, statistics, sys, tempfile
from contextlib import redirect_stdout


def load(paths):
    rows = []
    for p in paths:
        rows += [r for r in json.load(open(p))['values'] if r]
    rows.sort(key=lambda r: (r[1], int(r[2] or 0)))
    sessions = collections.defaultdict(list)
    for r in rows:
        c = r[6] if len(r) > 6 else ''
        if not c.startswith('gz64:'):
            continue
        try:
            sessions[(r[0], r[1])] += json.loads(gzip.decompress(base64.b64decode(c[5:])).decode())
        except Exception:
            pass
    return sessions


def runs_of(sessions):
    runs = []
    for (who, _sess), moments in sessions.items():
        run = None
        for m in moments:
            if m[0] == 'e' and m[2] == 'gen2':
                parts = str(m[3]).split()
                run = {'who': who, 'stage': parts[0], 'seed': parts[2], 'mode': parts[3], 'm': []}
                runs.append(run)
            if run is not None:
                run['m'].append(m)
    return runs


def main(paths):
    runs = runs_of(load(paths))
    sec_time, sec_entries = collections.defaultdict(list), collections.Counter()
    sec_soft, sec_lives = collections.Counter(), collections.Counter()
    punches, lives, finishes, glitches = collections.Counter(), collections.Counter(), collections.defaultdict(list), []
    move_runs, move_uses = collections.Counter(), collections.Counter()
    for r in runs:
        cur, t_in = None, None
        for m in r['m']:
            if m[0] == 'e' and m[2] == 'section':
                name = str(m[3]).split('|')[-1].strip().split(':')[0]
                if cur and t_in is not None:
                    sec_time[cur].append((m[1] - t_in) / 1000)
                cur, t_in = name, m[1]
                sec_entries[name] += 1
            elif m[0] == 'e' and m[2] == 'softFall' and cur:
                sec_soft[cur] += 1
            elif m[0] == 'e' and m[2] == 'lostLife':
                sec_lives[cur] += 1
                lives[r['who']] += 1
            elif m[0] == 'i' and m[2] == 'punch':
                punches[r['who']] += 1
            elif m[0] == 'e' and m[2] == 'finish':
                finishes[r['who']].append(int(m[3]))
            elif m[0] == 'e' and m[2] in ('move', 'use') and len(m) > 3:
                kind = str(m[3]).split()[0]
                move_uses[kind] += 1
                if m[2] == 'move':
                    move_runs[kind] += 1
            elif m[0] == 'e' and m[2] in ('camjump', 'jitter', 'blank', 'err', 'skipOffer'):
                glitches.append((r['who'], r['stage'], r['seed'], m[2], str(m[3])[:80]))
    print(f'{len(runs)} runs, {len(set(r["who"] for r in runs))} players, {len(set(r["seed"] for r in runs))} layouts\n')
    print('SECTIONS (ranked by put-backs plus 3x lives lost, per entry)')
    ranked = sorted(sec_entries, key=lambda s: -(sec_soft[s] + 3 * sec_lives[s]) / sec_entries[s])
    for s in ranked[:20]:
        t = sec_time[s]
        print(f'  {s:32} entries {sec_entries[s]:4}  median {statistics.median(t) if t else 0:5.1f}s  '
              f'put-backs {sec_soft[s]:4}  lives lost {sec_lives[s]:3}')
    print('\nPLAYERS')
    for who in sorted(finishes, key=lambda w: -len(finishes[w])):
        f = finishes[who]
        print(f'  {who:36} finished {len(f):3}  median {statistics.median(f):6.0f}s  trend {f[:6]}  '
              f'lives lost {lives[who]:3}  taps read as punches {punches[who]:4}')
    print('\nMOVES (runs that used it: one `move` row per stage start; uses: `move` plus `use` rows)')
    for kind in sorted(move_uses):
        print(f'  {kind:10} runs {move_runs[kind]:4}  uses {move_uses[kind]:5}')
    print('\nGLITCHES (player, stage, layout, kind, detail)')
    for g in glitches:
        print('  ', g)


def _export(sessions):
    """invented sessions -> a Sheets values export (columns B..H), one part each"""
    rows = []
    for (who, sess), moments in sessions.items():
        packed = 'gz64:' + base64.b64encode(gzip.compress(json.dumps(moments).encode())).decode()
        rows.append([who, sess, '1', 'fixture-device', 'fixture-build', '60', packed])
    return {'values': rows}


def self_test():
    """Invented rows only (no tester). OLD: a log from before R-165.58 (`move` only); NEW: the same run with its later uses as `use`."""
    start = ['e', 0, 'gen2', '1-1 seed 12345 normal']
    old_run = [start, ['e', 100, 'section', 'The stepping stones | w1-fixture-a:ki'], ['e', 900, 'move', 'double 600'],
               ['e', 1500, 'move', 'bounce 2635'], ['e', 2000, 'softFall'], ['e', 4100, 'section', 'The log | w1-fixture-b'],
               ['e', 5000, 'finish', 120]]
    new_run = old_run[:3] + [['e', 1100, 'use', 'double 1000'], ['e', 1300, 'use', 'double 1400']] + old_run[3:4] + \
        [['e', 1800, 'use', 'bounce 2635']] + old_run[4:]
    # what this report printed for the old row before R-165.58 (the lines above MOVES: they must not move)
    before = ['1 runs, 1 players, 1 layouts', '', 'SECTIONS (ranked by put-backs plus 3x lives lost, per entry)',
              '  w1-fixture-a                     entries    1  median   4.0s  put-backs    1  lives lost   0',
              '  w1-fixture-b                     entries    1  median   0.0s  put-backs    0  lives lost   0', '', 'PLAYERS',
              '  fixture-A                            finished   1  median    120s  trend [120]  lives lost   0  taps read as punches    0']

    def run(sessions):
        with tempfile.TemporaryDirectory() as d:
            path = os.path.join(d, 'export.json')
            with open(path, 'w') as f:
                json.dump(_export(sessions), f)
            out = io.StringIO()
            with redirect_stdout(out):
                main([path])
            return out.getvalue().splitlines()

    old = run({('fixture-A', 's1'): old_run})
    new = run({('fixture-A', 's1'): new_run})
    fails = []
    if old[:len(before)] != before:
        fails.append(f'old-format row no longer reads as before: {old[:len(before)]}')
    if 'double     runs    1  uses     1' not in [l.strip() and l[2:] for l in old]:
        fails.append(f'old-format moves: {old}')
    want_new = ['bounce     runs    1  uses     2', 'double     runs    1  uses     3']
    if [l[2:] for l in new if l[2:].startswith(('bounce ', 'double '))] != want_new:
        fails.append(f'new-format moves not counted by uses: {new}')
    if new[:len(before)] != before:
        fails.append(f'new-format row changed the lines above MOVES: {new[:len(before)]}')
    if fails:
        print('report.py self-test: FAIL\n  ' + '\n  '.join(fails))
        return 1
    print('report.py self-test: ok (old-format row: double runs 1 uses 1, as before; new-format row: double runs 1 uses 3, '
          'bounce runs 1 uses 2)')
    return 0


if __name__ == '__main__':
    if sys.argv[1:] == ['--self-test']:
        sys.exit(self_test())
    main(sys.argv[1:])
