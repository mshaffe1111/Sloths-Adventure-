"""
report.py: the data analyst's playthrough report (reference/roles/DATA-ANALYST.md). Started by the lead 2026-11-07 from the first
gen2 1-1 play window. Grow it; don't restart it.

  python3 -I tools/playtesters/report.py <sheet export.json> [<more exports>...]

Each input is a Google Sheets values export of the Sessions tab, columns B..H:
  [player, session, part, device, build, seconds, data], where data is "gz64:<gzip+base64 JSON list of moments>".
Prints: per-section entries, median time, put-backs and lives lost; per-player finishes, lives lost and taps read as punches; glitches.
"""
import base64, collections, gzip, json, statistics, sys


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
    print('\nGLITCHES (player, stage, layout, kind, detail)')
    for g in glitches:
        print('  ', g)


if __name__ == '__main__':
    main(sys.argv[1:])
