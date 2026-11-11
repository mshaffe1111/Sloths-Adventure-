"""
report.py: the data analyst's playthrough report (reference/roles/DATA-ANALYST.md). Started by the lead 2026-11-07 from the first
gen2 1-1 play window; grown by the analyst 2026-11-09 (window ending 11-10). Grow it; don't restart it.

ONE command, rerun on every pull (a later pull is a superset, so the whole window reruns; --delta shows only the new rows' runs):

  python3 -I tools/playtesters/report.py <export dir or .json files> [--delta "11/9/2026 19:25:00"] [--self-test]

Input: Google Sheets values exports of the Sessions tab (the connector's get_values result: {"range", "values"}), saved OUTSIDE the
repo. Columns A..H (Arrived, Player, Session, Part, Device, Version, Seconds, Data) or the 11-07 layout B..H; told apart by width.
Data is "gz64:<gzip+base64 JSON list of moments>" or "raw:<JSON>" (LOG_EVENTS.md).

Privacy (DATA-ANALYST.md): players are joined by tester code (else name) and printed ONLY as P1, P2, ... in order of first arrival.
No name, code, device model or survey text is ever printed. Only counts leave this script.

Sides (R-165.59): a run's `gen2` build commit is checked with git against release-0.9.5 (e92bdcdb, merged 2026-11-06 18:32 ET):
on main at or after it = "since"; `dev`, a commit not on main, or one git does not know = "other". A session with no commit is sided by
its Version (build time) column against the boundary.
"""
import base64, collections, gzip, json, math, os, re, statistics, subprocess, sys
from datetime import datetime, timedelta, timezone

BOUNDARY_COMMIT = 'e92bdcdb'
BOUNDARY_TIME = datetime(2026, 11, 6, 18, 32, 50, tzinfo=timezone(timedelta(hours=-5)))
TOP_VX = 520  # the fastest horizontal speed the engine sets: the swing leap's cap, SWING.leapMax (physics.ts:373, tarzanLaunch :689)
STUCK_S = 120  # a run that spends this long in one section counts as stuck there
WEIGHT = {'quit': 5, 'life': 3, 'stuck': 3, 'putback': 1, 'glitch': 2, 'misread': 1}  # severity per player affected (DATA-ANALYST.md "Ranking");
# on Easy a put-back is what a lost life is on Normal (LOG_EVENTS.md softFall), so Easy put-backs weigh as lives
REPO = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
C = collections.Counter
D = collections.defaultdict


# ---------------------------------------------------------------- loading
def export_files(args):
    out = []
    for a in args:
        if os.path.isdir(a):
            out += sorted(os.path.join(a, f) for f in os.listdir(a) if f.endswith('.json'))
        else:
            out.append(a)
    return out


def norm_row(r):
    """-> dict with arrived, player, session, part, version, data (A..H or the old B..H)."""
    if len(r) >= 8 or (r and re.match(r'\d+/\d+/\d{4}', str(r[0]))):
        r = list(r) + [''] * (8 - len(r))
        a, p, s, part, dev, ver, _sec, data = r[:8]
    else:
        r = list(r) + [''] * (7 - len(r))
        a = ''
        p, s, part, dev, ver, _sec, data = r[:7]
    return {'arrived': a, 'player': p, 'session': s, 'part': int(part or 0) if str(part).isdigit() else 0, 'version': ver,
            'data': data, 'device': dev}


def decode(c):
    if c.startswith('gz64:'):
        return json.loads(gzip.decompress(base64.b64decode(c[5:])).decode())
    if c.startswith('raw:'):
        return json.loads(c[4:])
    return None


def parse_arrived(a):
    """the sheet's Arrived cell, in the sheet's own time zone (America/Los_Angeles, the spreadsheet's setting), as Eastern time
    (always 3 h ahead: both zones change clocks on the same dates)"""
    try:
        return datetime.strptime(a, '%m/%d/%Y %H:%M:%S') + timedelta(hours=3)
    except ValueError:
        return None


def load(paths):
    rows, unread = [], 0
    for p in paths:
        for r in json.load(open(p))['values']:
            if r and r[0] != 'Arrived':
                rows.append(norm_row(r))
    rows.sort(key=lambda r: (r['session'], r['part']))
    sessions = {}
    for r in rows:
        s = sessions.setdefault(r['session'], {'player': r['player'], 'rows': 0, 'm': [], 'version': r['version'],
                                               'first': r['arrived'], 'last': r['arrived'], 'device': r['device']})
        s['rows'] += 1
        s['last'] = max(s['last'], r['arrived'], key=lambda x: parse_arrived(x) or datetime.min)
        s['first'] = min(s['first'], r['arrived'], key=lambda x: parse_arrived(x) or datetime.max)
        try:
            ms = decode(r['data'])
        except Exception:
            ms = None
        if ms is None:
            unread += 1
            continue
        s['m'] += ms
    return sessions, len(rows), unread


# ---------------------------------------------------------------- who and which side
def player_key(s):
    for m in s['m']:
        if m[0] == 'e' and m[2] == 'tester':
            return 'code:' + str(m[3]).lstrip('~')
    cell = s['player'] or ''
    if ' · ' in cell:
        return 'code:' + cell.split(' · ')[-1].strip().lstrip('~')
    return 'name:' + cell.strip().lower()


_side_cache = {}


def commit_side(c):
    if c in _side_cache:
        return _side_cache[c]
    side = 'other'
    if c and c != 'dev':
        try:
            ok = lambda *a: subprocess.run(['git', '-C', REPO, *a], capture_output=True).returncode == 0
            if ok('cat-file', '-e', c + '^{commit}') and ok('merge-base', '--is-ancestor', c, 'origin/main') \
                    and ok('merge-base', '--is-ancestor', BOUNDARY_COMMIT, c):
                side = 'since'
        except OSError:
            pass
    _side_cache[c] = side
    return side


def session_side(s):
    builds = [str(m[3]).split(' build ')[1].split()[0] for m in s['m']
              if m[0] == 'e' and m[2] in ('gen2', 'env') and ' build ' in str(m[3])]
    if builds:
        sides = {commit_side(b) for b in builds}
        return 'since' if sides == {'since'} else 'other'
    try:
        v = datetime.fromisoformat(s['version'])
    except ValueError:
        return 'other'
    return 'before' if v < BOUNDARY_TIME else 'other'


# ---------------------------------------------------------------- runs and section slices
def sec_id(label):
    tail = str(label).split('|')[-1].strip()
    return tail.split(':')[0], str(label).split('|')[0].strip()


def runs_of(sessions, pseud):
    runs = []
    for sid, s in sessions.items():
        run = None
        for m in s['m']:
            if m[0] == 'e' and m[2] == 'gen2':
                parts = str(m[3]).split()
                kv = dict(zip(parts[4::2], parts[5::2]))
                run = {'who': pseud[player_key(s)], 'session': sid, 'stage': parts[0], 'seed': parts[2], 'mode': parts[3],
                       'build': kv.get('build', ''), 'list': kv.get('list', ''), 'm': [], 'last': s['last']}
                runs.append(run)
            if run is not None:
                run['m'].append(m)
    for r in runs:
        slice_run(r)
    return runs


def slice_run(r):
    """Cut the run into section slices. A slice ends at the next section line, the finish, or the run's last moment; time spent away
    (hidden..shown) is taken out. Each slice keeps the x range Pokey's own lines covered, for the speed check."""
    r['slices'], r['finish'], r['end'] = [], None, 'left'
    cur, hid_at = None, None
    t_last = r['m'][-1][1] if r['m'] else 0

    def close(t):
        if cur:
            cur['t1'] = t
            cur['dur'] = max(0.0, (t - cur['t0']) / 1000 - cur['away'])
            r['slices'].append(cur)
    for m in r['m']:
        k, t = m[0], m[1]
        if k == 'p' and cur is not None:
            cur['xs'].append(m[2])
            continue
        if k != 'e':
            if k == 'i' and m[2] == 'punch' and cur is not None:
                cur['punch'] += 1
            continue
        n, d = m[2], str(m[3]) if len(m) > 3 else ''
        if n == 'section' and r['finish'] is None:
            close(t)
            sid, words = sec_id(d)
            cur = {'id': sid, 'words': words, 't0': t, 'away': 0.0, 'xs': [], 'life': [], 'soft': 0, 'hurt': 0, 'pause': 0,
                   'punch': 0, 'stuckHelp': 0, 'glitch': []}
        elif n == 'finish' and r['finish'] is None:
            r['finish'] = (t, int(float(d or 0)))
            close(t)
            cur = None
        elif n == 'hidden':
            hid_at = t
        elif n == 'shown':
            mm = re.search(r'away ([\d.]+)', d)
            if cur is not None and mm:
                cur['away'] += float(mm.group(1))
            hid_at = None
        elif n == 'restart' and d.startswith('menu'):
            r['end'] = 'restart'
        elif n == 'quit' and r['finish'] is None:
            r['end'] = 'quit'
        elif cur is not None:
            if n == 'lostLife':
                cur['life'].append(d.split()[0] if d else '?')
            elif n == 'softFall':
                cur['soft'] += 1
            elif n == 'hurt':
                cur['hurt'] += 1
            elif n == 'pause':
                cur['pause'] += 1
            elif n == 'stuckHelp':
                cur['stuckHelp'] += 1
            elif n in ('camjump', 'jitter', 'blank', 'err', 'flipflop', 'contextlost'):
                # (not skipOffer: that is the "Skip tips" button shown on Dot's first tip, DotGuide.tsx:409-424; teaching counts it)
                cur['glitch'].append((n, d[:60]))
    if r['finish'] is None:
        close(t_last)
    else:
        r['end'] = 'finish'
    r['quit_in'] = r['slices'][-1]['id'] if r['end'] in ('left', 'quit', 'restart') and r['slices'] else None


# ---------------------------------------------------------------- helpers
def med(xs):
    return statistics.median(xs) if xs else 0


def rng(xs):
    return f'{min(xs):.0f}-{max(xs):.0f}' if xs else '-'


def seeds_of(runs):
    c = C(r['seed'] for r in runs)
    return ' '.join(f'{s}' + (f'x{n}' if n > 1 else '') for s, n in c.most_common(6))


# ---------------------------------------------------------------- report sections
def sides_table(sessions, pseud):
    print('SIDES (Before 0.9.5 / since / other; counts only, R-165.59)')
    t = D(lambda: {'rows': 0, 'sessions': 0, 'players': set(), 'first': None, 'last': None})
    for sid, s in sessions.items():
        side = session_side(s)
        x = t[side]
        x['rows'] += s['rows']
        x['sessions'] += 1
        x['players'].add(pseud[player_key(s)])
        for a in (s['first'], s['last']):
            d = parse_arrived(a)
            if d:
                x['first'] = min(x['first'] or d, d)
                x['last'] = max(x['last'] or d, d)
    for side in ('before', 'since', 'other'):
        x = t[side]
        span = f"{x['first']:%m-%d %H:%M} .. {x['last']:%m-%d %H:%M} ET" if x['first'] else '-'
        print(f"  {side:7} rows {x['rows']:5}  sessions {x['sessions']:4}  players {len(x['players']):3}  arrived {span}")
    both = t['before']['players'] & t['since']['players']
    print(f'  players on both sides of the boundary: {len(both)}\n')


def overview(runs):
    print('RUNS (gen2 1-1, by setting)')
    for mode in ('normal', 'easy'):
        rs = [r for r in runs if r['mode'] == mode]
        if not rs:
            continue
        fin = [r for r in rs if r['end'] == 'finish']
        ends = C(r['end'] for r in rs)
        ends['left'] = sum(1 for r in rs if r['end'] == 'left' and r['slices'])
        never = sum(1 for r in rs if not r['slices'])
        print(f"  {mode:6} runs {len(rs):3}  players {len({r['who'] for r in rs}):2}  layouts {len({r['seed'] for r in rs}):3}  "
              f"finished {len(fin)} ({len({r['who'] for r in fin})} players)  restarted {ends['restart']}  quit {ends['quit']}  "
              f"left mid-stage {ends['left']}  left before the first section {never}")
        ft = [r['finish'][1] for r in fin]
        lives = [sum(len(s['life']) for s in r['slices']) for r in fin]
        print(f"         finish time median {med(ft):.0f}s range {rng(ft)}  lives lost per finished run median {med(lives)} "
              f"range {rng(lives)}")
        lists = C(r['list'] for r in rs)
        print(f"         seed lists {dict(lists)}  builds {dict(C(r['build'] for r in rs))}")
    print()


def section_rows(runs, mode):
    """per section id: one record per run that entered it (time is the run's total in it; entries are its slices)"""
    per = D(list)
    for r in runs:
        if r['mode'] != mode:
            continue
        agg = {}
        for s in r['slices']:
            a = agg.setdefault(s['id'], {'run': r, 'words': s['words'], 'dur': 0.0, 'entries': 0, 'life': [], 'soft': 0,
                                         'pause': 0, 'glitch': [], 'stuckHelp': 0})
            a['dur'] += s['dur']
            a['entries'] += 1
            a['life'] += s['life']
            a['soft'] += s['soft']
            a['pause'] += s['pause']
            a['glitch'] += s['glitch']
            a['stuckHelp'] += s['stuckHelp']
        for sid, a in agg.items():
            a['quit'] = r['quit_in'] == sid and r['end'] != 'finish'
            per[sid].append(a)
    return per


def sections(runs):
    findings = []
    for mode in ('normal', 'easy'):
        per = section_rows(runs, mode)
        if not per:
            continue
        print(f'SECTIONS, {mode} (per run that entered: time in it, entries, lives lost, put-backs; players in brackets)')
        print(f"  {'section':28} {'stretch':30} runs pl  time med (range)   re-entries  lives(pl)  put-backs(pl)  quit(pl)  "
              f"stuck>{STUCK_S}s(pl)")
        order = sorted(per, key=lambda k: -sum(len(a['life']) * 3 + a['soft'] + 5 * a['quit'] for a in per[k]))
        for sid in order:
            A = per[sid]
            pl = lambda f: {a['run']['who'] for a in A if f(a)}
            lives = sum(len(a['life']) for a in A)
            soft = sum(a['soft'] for a in A)
            quits = sum(a['quit'] for a in A)
            stuck = [a for a in A if a['dur'] >= STUCK_S]
            durs = [a['dur'] for a in A]
            print(f"  {sid[:28]:28} {A[0]['words'][:30]:30} {len(A):4} {len({a['run']['who'] for a in A}):2}  "
                  f"{med(durs):6.1f}s ({rng(durs):>9})  {sum(a['entries'] - 1 for a in A):5}      "
                  f"{lives:3}({len(pl(lambda a: a['life']))})    {soft:4}({len(pl(lambda a: a['soft']))})      "
                  f"{quits:2}({len(pl(lambda a: a['quit']))})   {len(stuck):2}({len({a['run']['who'] for a in stuck})})")
            for kind, f, n in (('life', lambda a: a['life'], lives), ('putback', lambda a: a['soft'], soft),
                               ('quit', lambda a: a['quit'], quits), ('stuck', lambda a: a['dur'] >= STUCK_S, len(stuck))):
                hit = [a for a in A if f(a)]
                if not hit:
                    continue
                who = C(a['run']['who'] for a in hit)
                causes = C(c for a in hit for c in a['life']) if kind == 'life' else C()
                per_player = C()
                for a in hit:
                    per_player[a['run']['who']] += len(a['life']) if kind == 'life' else a['soft'] if kind == 'putback' else 1
                top_share = max(per_player.values()) / max(1, sum(per_player.values()))
                findings.append({'mode': mode, 'section': sid, 'words': A[0]['words'], 'kind': kind, 'count': n,
                                 'players': len(who), 'of_players': len({a['run']['who'] for a in A}), 'runs': len(hit),
                                 'of_runs': len(A), 'seeds': seeds_of([a['run'] for a in hit]), 'causes': dict(causes),
                                 'top_share': top_share,
                                 'score': len(who) * (WEIGHT['life'] if kind == 'putback' and mode == 'easy' else WEIGHT[kind])})
        print()
    return findings


def stretches(runs):
    """the same, folded by the plain words the survey offers (one stretch spans several layout pieces)"""
    for mode in ('normal', 'easy'):
        per = D(lambda: {'runs': set(), 'who': set(), 'life': 0, 'lw': set(), 'soft': 0, 'dur': D(float)})
        for r in runs:
            if r['mode'] != mode:
                continue
            for s in r['slices']:
                x = per[s['words']]
                x['runs'].add(id(r))
                x['who'].add(r['who'])
                x['life'] += len(s['life'])
                x['soft'] += s['soft']
                x['dur'][id(r)] += s['dur']
                if s['life']:
                    x['lw'].add(r['who'])
        if not per:
            continue
        print(f'STRETCHES, {mode} (the survey\'s plain words)')
        for w, x in sorted(per.items(), key=lambda kv: -kv[1]['life']):
            print(f"  {w[:34]:34} runs {len(x['runs']):3} players {len(x['who']):2}  time med {med(list(x['dur'].values())):6.1f}s  "
                  f"lives {x['life']:3} ({len(x['lw'])} players)  put-backs {x['soft']:3}")
        print()


def validate(runs):
    """the recorder numbers the 11-07 review distrusted, judged against what they can physically be"""
    print(f'VALIDATION (top horizontal speed {TOP_VX} px/s)')
    # 1. the 11-07 method: a section's time = from its line to the next section line, any run, the last section never closed
    old = D(list)
    for r in runs:
        prev = None
        for m in r['m']:
            if m[0] == 'e' and m[2] == 'section':
                sid = sec_id(m[3])[0]
                if prev:
                    old[prev[0]].append((m[1] - prev[1]) / 1000)
                prev = (sid, m[1])
        if prev:
            old.setdefault(prev[0], [])
    # each section's length on each layout: the widest x range Pokey's own lines covered in it on that seed
    length = D(int)
    for r in runs:
        for s in r['slices']:
            if s['xs']:
                k = (r['seed'], s['id'])
                length[k] = max(length[k], max(s['xs']) - min(s['xs']))
    sec_len = D(list)
    for (seed, sid), L in length.items():
        sec_len[sid].append(L)
    bad = []
    for sid, ts in old.items():
        L = med(sec_len.get(sid, []))
        floor = L / TOP_VX
        m = med(ts)
        if not ts or (L and m < floor):
            bad.append((sid, len(ts), m, L, floor))
    print(f'  11-07 method: {len(bad)} sections print a median under length/{TOP_VX} (impossible) or have no time at all:')
    for sid, n, m, L, floor in sorted(bad, key=lambda b: -b[3])[:8]:
        print(f'    {sid:30} slices {n:4}  median {m:5.1f}s  length med {L:5.0f}px  floor {L:.0f}/{TOP_VX} = {floor:4.1f}s'
              + ('  (never closed: printed as 0 s)' if not n else ''))
    shorts = sum(1 for ts in old.values() for t in ts if t < 1)
    print(f'  11-07 method: {shorts} of {sum(len(t) for t in old.values())} slices under 1 s (back-and-forth re-entries, '
          f'respawns into an earlier section)')
    # 2. this report's slices: speed over each slice can never pass the top speed
    sl = [s for r in runs for s in r['slices'] if s['xs'] and s['dur'] > 0]
    fast = [s for s in sl if (max(s['xs']) - min(s['xs'])) / s['dur'] > TOP_VX]
    clean = [s for s in fast if not s['life'] and not s['soft']]
    print(f'  this report: {len(fast)} of {len(sl)} slices span their x range faster than {TOP_VX} px/s; {len(fast) - len(clean)} '
          f'of them hold a put-back or lost life (the respawn moves him back, so the span is not run), {len(clean)} do not; the '
          f'last section is closed by the finish, so it has a real time')
    # 3. the double jump: `move double` is the FIRST use per stage start (playRecorder.ts:409-416, engine.ts:864-867, :2211)
    md = C()
    for r in runs:
        md[sum(1 for m in r['m'] if m[0] == 'e' and m[2] == 'move' and str(m[3]).startswith('double'))] += 1
    print(f'  move double per run: {dict(md)} (at most 1 per stage start by design: count runs that used it, never uses)\n')


def players(runs, sessions):
    print('PLAYERS (pseudonyms only)')
    by = D(list)
    for r in runs:
        by[r['who']].append(r)
    surveys = []  # (player, answers): the v2 level-test survey, one per run
    who_of = {r['session']: r['who'] for r in runs}
    for sid, s in sessions.items():
        for m in s['m']:
            if m[0] == 'e' and m[2] == 'survey' and sid in who_of:
                try:
                    j = json.loads(str(m[3]))
                except ValueError:
                    continue
                if isinstance(j, dict) and j.get('v') == 2:
                    surveys.append((who_of[sid], j))
    for who in sorted(by, key=lambda w: int(w[1:])):
        rs = by[who]
        fin = [r['finish'][1] for r in rs if r['finish']]
        mins = sum(s['dur'] for r in rs for s in r['slices']) / 60
        lives = sum(len(s['life']) for r in rs for s in r['slices'])
        soft = sum(s['soft'] for r in rs for s in r['slices'])
        punch = sum(s['punch'] for r in rs for s in r['slices'])
        modes = '/'.join(sorted({r['mode'] for r in rs}))
        print(f"  {who:4} {modes:11} runs {len(rs):3} finished {len(fin):2} times {fin[:6]}  minutes {mins:5.1f}  lives {lives:3} "
              f"({lives / max(mins, 0.1):.2f}/min)  put-backs {soft:3}  punch intents {punch:3} ({punch / max(mins, 0.1):.1f}/min)  left mid-stage {sum(r['end'] != 'finish' and bool(r['slices']) for r in rs)}")
    foes = sum(1 for r in runs for m in r['m'] if m[0] == 'e' and m[2] in ('stomp', 'hurt'))
    print(f'  stomps + hurts in these runs: {foes} (0 = nothing in the stage can be punched, so every punch intent is a misread)')
    # a punch the player meant as a jump: NOT taken back by the jab rule (punchCancel, touchGestures.ts:487-499, CT-17) and followed by a
    # jump PRESS (`jump`; `jumpUp` is the release, TouchController.tsx:50) within 0.6 s among the next 5 intents (jumps_of)
    retried, total, kept = C(), C(), C()
    for r in runs:
        j = jumps_of(r, None)
        total[r['who']] += j['punch']
        kept[r['who']] += j['punchKept']
        if j['misread']:
            retried[r['who']] += j['misread']
    print(f'  punches {sum(total.values())}, taken back by the jab rule {sum(total.values()) - sum(kept.values())}, kept '
          f'{sum(kept.values())}; kept and followed by a jump press within 0.6 s (next 5 intents): {sum(retried.values())}, '
          f'{len(retried)} of {len(by)} players {dict(sorted(retried.items()))}')
    misread = []
    if foes == 0 and retried:
        top = max(retried.values()) / max(1, sum(retried.values()))
        misread.append({'mode': 'both', 'section': '(every section)', 'words': 'tap read as punch', 'kind': 'misread',
                        'count': sum(retried.values()), 'players': len(retried), 'of_players': len(by),
                        'runs': len({id(r) for r in runs if retried.get(r['who'])}), 'of_runs': len(runs),
                        'seeds': seeds_of([r for r in runs if retried.get(r['who'])]), 'causes': {}, 'top_share': top,
                        'score': len(retried) * WEIGHT['misread']})
    ans, ans_who = C(), D(set)
    for who, j in surveys:
        for k in ('fun', 'long', 'knew', 'tips', 'next'):
            if k in j:
                ans[(k, str(j[k]))] += 1
                ans_who[(k, str(j[k]))].add(who)
        for h in j.get('hard', []) or []:
            ans[('hard', h)] += 1
            ans_who[('hard', h)].add(who)
    print(f'  survey answers ({len(surveys)} v2 surveys; answer: runs/players; free text never read out):')
    for k in ('fun', 'long', 'knew', 'tips', 'next', 'hard'):
        row = {a: f'{n}/{len(ans_who[(kk, a)])}' for (kk, a), n in sorted(ans.items()) if kk == k}
        if row:
            print(f'    {k:5} {row}')
    print()
    return misread


def phones(runs, sessions):
    print('PHONES (by orientation at start; fps lines are every 5 s of play)')
    rows = D(lambda: {'fps': [], 'sd': [], 'stall': 0, 'long': 0, 'q': 0, 'runs': 0, 'who': set(), 'launch': []})
    for r in runs:
        orient = 'portrait'
        for m in r['m']:
            if m[0] == 'e' and m[2] == 'screen':
                orient = 'landscape' if 'landscape' in str(m[3]) else 'portrait'
                break
        x = rows[(r['mode'], orient)]
        x['runs'] += 1
        x['who'].add(r['who'])
        for m in r['m']:
            if m[0] != 'e':
                continue
            d = str(m[3]) if len(m) > 3 else ''
            if m[2] == 'fps':
                f = re.match(r'([\d.]+)fps.*?sd ([\d.]+)ms', d)
                if f:
                    x['fps'].append(float(f.group(1)))
                    x['sd'].append(float(f.group(2)))
            elif m[2] in ('stall', 'long'):
                x[m[2]] += 1
            elif m[2] == 'quality' and d.startswith('q'):
                x['q'] += 1
    for (mode, o), x in sorted(rows.items()):
        print(f"  {mode:6} {o:9} runs {x['runs']:3} players {len(x['who']):2}  fps med {med(x['fps']):4.1f} (min {min(x['fps'] or [0]):4.1f})  "
              f"sd med {med(x['sd']):4.1f}ms  stalls {x['stall']:4}  long {x['long']:4}  resolution steps {x['q']}")
    print()


def glitches(runs):
    print('GLITCHES (kind, section, layout seed, x, player)')
    g = D(list)
    for r in runs:
        for s in r['slices']:
            for n, d in s['glitch']:
                x = re.search(r'x(-?\d+)', d)
                g[n].append((s['id'], r['seed'], x.group(1) if x else '?', r['who'], d))
    for n, L in sorted(g.items(), key=lambda kv: -len(kv[1])):
        print(f"  {n:10} {len(L):3} in {len({l[1] for l in L})} layouts, {len({l[3] for l in L})} players; by section "
              f"{dict(C(l[0] for l in L).most_common(5))}")
        for l in L[:6]:
            print(f'     {l[0]:26} seed {l[1]:>6} x{l[2]:>6} {l[3]}  {l[4][:40]}')
    print()


def teaching(runs):
    print("TEACHING (each player's FIRST run per setting: hints show once per device, tipMemory.ts)")
    for mode in ('normal', 'easy'):
        seen, rs = set(), []
        for r in runs:
            if r['mode'] == mode and r['who'] not in seen and r['slices']:
                seen.add(r['who'])
                rs.append(r)
        if not rs:
            continue
        shown_before, no_line, dbl_before_teach, first_dbl = 0, 0, 0, []
        for r in rs:
            t_need = next((s['t0'] for s in r['slices'] if 'double' in s['words'].lower()), None)
            t_line = next((m[1] for m in r['m'] if m[0] == 'e' and m[2] == 'dot' and 'double' in str(m[3])), None)
            t_dbl = next((m[1] for m in r['m'] if m[0] == 'e' and m[2] == 'move' and str(m[3]).startswith('double')), None)
            if t_need is None:
                continue
            if t_line is None:
                no_line += 1
            elif t_line <= t_need:
                shown_before += 1
            if t_dbl is not None and t_dbl < t_need:
                dbl_before_teach += 1
            if t_dbl is not None:
                first_dbl.append((t_dbl - r['m'][0][1]) / 1000)
        n = sum(1 for r in rs if any('double' in s['words'].lower() for s in r['slices']))
        allr = [r for r in runs if r['mode'] == mode]
        skip = sum(1 for r in allr for m in r['m'] if m[0] == 'e' and m[2] == 'skipOffer')
        help_ = sum(1 for r in allr for m in r['m'] if m[0] == 'e' and m[2] == 'stuckHelp')
        print(f'  {mode:6} "Skip tips" offered (skipOffer) {skip} in {len(allr)} runs; stuckHelp (wall-jump watch only, '
              f'engine.ts:4524) {help_}')
        print(f'  {mode:6} first runs reaching a double-jump section {n}: line shown before it {shown_before}, never shown {no_line}; '
              f'double used before that section {dbl_before_teach}; first double {med(first_dbl):.0f}s into the run '
              f'(range {rng(first_dbl)})')
    print()


def ranking(findings):
    print(f'RANKING (players affected x severity {WEIGHT}; a finding resting on 1-2 players or one player\'s >=70% share is marked)')
    findings.sort(key=lambda f: (-f['score'], -f['count']))
    for i, f in enumerate(findings[:15], 1):
        flag = ' ONE-PLAYER' if f['players'] == 1 else ' FEW' if f['players'] == 2 else ''
        flag += ' SKEWED' if f['top_share'] >= 0.7 and f['players'] > 1 else ''
        print(f"  {i:2}. score {f['score']:3}  {f['mode']:6} {f['section']:28} {f['kind']:7} x{f['count']:3}  players "
              f"{f['players']}/{f['of_players']}  runs {f['runs']}/{f['of_runs']}  {f['causes'] or ''}{flag}\n"
              f"        seeds {f['seeds']}")
    print()


# ---------------------------------------------------------------- bot profiles (--profiles <outdir>), W11-ANALYST attempt 5
# Everything the player bots need, so the sheet can be purged (Matt, 11-11). Aggregates only: P-numbers, no name, code, device model,
# session id or survey text. Field meanings and methods: tools/playtesters/profiles/README.md.
JAB_CANCEL_MS = 100  # touchGestures.ts:91 TUNING.jabCancelMs: a punch taken back within this is the designed jab-then-flick (CT-17)
MISREAD_MS = 600  # an UNCANCELLED punch followed by a jump press within this, among the next 5 intents
COYOTE_MAX_MS = 400  # an air press this soon after walking off a ledge (no jump in between) is a late (coyote) press
LIP_LOOK_PX = 300  # a ground press counts as aimed at the lip when the walkable edge ahead is this close
THIN_TIER, THIN_PLAYER, PLACED_MIN = 10, 5, 0.8  # under this many gen2 runs a tier or a player is marked thin
HALF_BODY = 22  # Pokey is 44 px wide and p.x is his middle: he stays on the ground until his middle is about 22 px past the edge


def dist(xs, digits=1):
    """nearest-rank percentiles; digits=3 for shares (0..1) and px/ms, where 0.1 would lose up to 40 px of thumb placement"""
    xs = sorted(x for x in xs if x is not None)
    if not xs:
        return None
    q = lambda f: round(xs[min(len(xs) - 1, int(len(xs) * f))], digits)
    return {'n': len(xs), 'p10': q(0.1), 'p25': q(0.25), 'p50': q(0.5), 'p75': q(0.75), 'p90': q(0.9)}


def layouts_for(runs):
    """the platforms of every layout played, rebuilt by tools/playtesters/layouts.ts (needs npx tsx; the run's `list` must match)"""
    keys = sorted({f"{r['seed']} {r['mode']}" for r in runs})
    try:
        out = subprocess.run(['npx', 'tsx', 'tools/playtesters/layouts.ts'], cwd=REPO, input='\n'.join(keys),
                             capture_output=True, text=True, timeout=1800).stdout
        L = json.loads(out)
    except Exception as e:  # no node: the lip measures are left out, the rest is built
        print(f'  layouts: not rebuilt ({str(e)[:80]}); lip measures skipped')
        return {}, None
    return L, L.get('_list')


def ground_runs(plats):
    """walkable surfaces: platform tops merged where they touch at the same height -> {y: [(x0, x1), ...]}"""
    by = D(list)
    for p in plats:
        by[p[1]].append((p[0], p[0] + p[2]))
    out = {}
    for y, segs in by.items():
        segs.sort()
        merged = [list(segs[0])]
        for a, b in segs[1:]:
            if a <= merged[-1][1] + 2:
                merged[-1][1] = max(merged[-1][1], b)
            else:
                merged.append([a, b])
        out[y] = merged
    return out


def walked_off(g, G, x_now=None):
    """the ground line g was within 60 px of the edge he was moving toward: that edge's distance to x_now (+ = past it), else None"""
    x, y, vx = g[2], g[3], g[4]
    for a, b in G.get(y, []):
        if a - HALF_BODY <= x <= b + HALF_BODY:
            edge = b if vx > 0 else a
            if abs(edge - x) > 60:
                return None
            if x_now is None:
                return True
            return round((x_now - edge) if vx > 0 else (edge - x_now))
    return None


def jumps_of(r, G):
    """the run's jump presses, measured: hold, the lip, coyote, the second press; and its punches"""
    o = {'hold': [], 'lip': [], 'still': 0, 'ground': 0, 'coyoteMs': [], 'coyotePx': [], 'dblDelay': [], 'airNoFirst': 0,
         'punch': 0, 'punchTakenBack': 0, 'punchKept': 0, 'misread': 0}
    last_p, air_since, jumped_in_air, first_air_press, left_ground = None, None, False, None, None
    il = [m for m in r['m'] if m[0] == 'i']
    nxt = {id(m): i for i, m in enumerate(il)}
    for m in r['m']:
        k = m[0]
        if k == 'p':
            st = str(m[6])[0]
            if st == 'g' and (first_air_press is None or m[1] - first_air_press > 150):
                # (a ground line in the tick between a ground press and the take-off keeps the press)
                air_since, jumped_in_air, first_air_press = None, False, None
            elif st == 'a' and last_p is not None and str(last_p[6])[0] == 'g':
                air_since = m[1]
                left_ground = last_p
            last_p = m
            continue
        if k != 'i':
            continue
        n = m[2]
        if n == 'jump':
            up = next((q[1] for q in il[nxt[id(m)] + 1:] if q[2] == 'jumpUp'), None)
            if up is not None and up - m[1] < 5000:
                o['hold'].append(up - m[1])
            st = str(last_p[6])[0] if last_p else '?'
            if st in ('g', 'k'):
                o['ground'] += 1
                x, y, vx = last_p[2], last_p[3], last_p[4]
                if abs(vx) < 30:
                    o['still'] += 1
                elif G:
                    for a, b in G.get(y, []):
                        if a - HALF_BODY <= x <= b + HALF_BODY:
                            d = (b - x) if vx > 0 else (x - a)
                            if d <= LIP_LOOK_PX:
                                o['lip'].append(d)
                            break
                jumped_in_air, first_air_press = True, m[1]
            elif st == 'a':
                if jumped_in_air and first_air_press is not None:
                    o['dblDelay'].append(m[1] - first_air_press)
                    jumped_in_air = False
                elif air_since is not None and m[1] - air_since <= COYOTE_MAX_MS and left_ground is not None and G \
                        and abs(left_ground[4]) >= 30 and walked_off(left_ground, G):
                    # he walked off a ledge (his last ground line within 60 px of the edge he was moving toward) and pressed late
                    o['coyoteMs'].append(m[1] - air_since)
                    o['coyotePx'].append(walked_off(left_ground, G, last_p[2]))
                    jumped_in_air, first_air_press = True, m[1]
                else:
                    o['airNoFirst'] += 1
        elif n == 'punch':
            o['punch'] += 1
            later = il[nxt[id(m)] + 1:nxt[id(m)] + 6]
            if any(q[2] == 'punchCancel' and q[1] - m[1] <= JAB_CANCEL_MS + 50 for q in later):
                o['punchTakenBack'] += 1
            else:
                o['punchKept'] += 1
                if any(q[2] == 'jump' and 0 < q[1] - m[1] <= MISREAD_MS for q in later):
                    o['misread'] += 1
    return o


def run_facts(r, G):
    j = jumps_of(r, G)
    pieces = D(lambda: {'t': 0.0, 'lives': 0, 'putbacks': 0})
    stretch = D(float)
    for s_ in r['slices']:
        pc = pieces[s_['id']]
        pc['t'] += s_['dur']
        pc['lives'] += len(s_['life'])
        pc['putbacks'] += s_['soft']
        stretch[s_['words']] += s_['dur']
    return {'mode': r['mode'], 'seed': r['seed'], 'finished': r['end'] == 'finish', 'finishS': r['finish'][1] if r['finish'] else None,
            'leftIn': r['quit_in'] if r['end'] != 'finish' and r['slices'] else None, 'played': bool(r['slices']),
            'lives': sum(len(s_['life']) for s_ in r['slices']), 'putbacks': sum(s_['soft'] for s_ in r['slices']),
            'pauses': sum(s_['pause'] for s_ in r['slices']), 'minutes': sum(s_['dur'] for s_ in r['slices']) / 60,
            'pieces': pieces, 'stretch': stretch, 'j': j, 'steer': steering_of(r),
            'doubleUsed': any(m[0] == 'e' and m[2] == 'move' and str(m[3]).startswith('double') for m in r['m'])}


def pool(facts):
    """one block of play numbers over a list of run facts"""
    J = D(list)
    cnt = C()
    for f in facts:
        for k in ('hold', 'lip', 'coyoteMs', 'coyotePx', 'dblDelay'):
            J[k] += f['j'][k]
        for k in ('still', 'ground', 'airNoFirst', 'punch', 'punchTakenBack', 'punchKept', 'misread'):
            cnt[k] += f['j'][k]
    played = [f for f in facts if f['played']]
    mins = sum(f['minutes'] for f in played) or 0.01
    pieces = D(lambda: {'runs': 0, 'lives': 0, 'putbacks': 0, 'seconds': []})
    stretch = D(list)
    for f in played:
        for pid, pc in f['pieces'].items():
            x = pieces[pid]
            x['runs'] += 1
            x['lives'] += pc['lives']
            x['putbacks'] += pc['putbacks']
            x['seconds'].append(pc['t'])
        for w, t in f['stretch'].items():
            stretch[w].append(t)
    return {
        'runs': len(facts), 'runsPlayed': len(played), 'finished': sum(f['finished'] for f in facts),
        'finishSeconds': dist([f['finishS'] for f in facts if f['finishS']]),
        'livesPerRun': round(sum(f['lives'] for f in played) / max(1, len(played)), 2),
        'putbacksPerRun': round(sum(f['putbacks'] for f in played) / max(1, len(played)), 2),
        'pausesPerRun': round(sum(f['pauses'] for f in played) / max(1, len(played)), 2),
        'leftMidStage': dict(C(f['leftIn'] for f in facts if f['leftIn'])),
        'doubleUsedShare': round(sum(f['doubleUsed'] for f in played) / max(1, len(played)), 2),
        'jumpHoldMs': dist(J['hold']),
        'groundPressToLipPx': dist(J['lip']),
        'groundPressFromStandstillShare': round(cnt['still'] / max(1, cnt['ground']), 3),
        'latePressAfterLeavingLedgeMs': dist(J['coyoteMs']),
        'latePressPastLipPx': dist(J['coyotePx']),
        'latePressShareOfLipJumps': round(len(J['coyoteMs']) / max(1, len(J['coyoteMs']) + len(J['lip'])), 3),
        'secondPressDelayMs': dist(J['dblDelay']),
        'airPressWithoutFirstJump': cnt['airNoFirst'],
        'punchesPerMinute': round(cnt['punch'] / mins, 2),
        'punchTakenBackShare': round(cnt['punchTakenBack'] / max(1, cnt['punch']), 3),
        'misreadPerMinute': round(cnt['misread'] / mins, 2),
        'misreadShareOfKeptPunches': round(cnt['misread'] / max(1, cnt['punchKept']), 3),
        'pieces': {k: {'runs': v['runs'], 'lives': v['lives'], 'putbacks': v['putbacks'], 'seconds': dist(v['seconds'])}
                   for k, v in sorted(pieces.items())},
        'stretchSeconds': {k: dist(v) for k, v in sorted(stretch.items())},
        'steering': steering_pool(facts),
    }


TIER_RULE = ('child: median finish >= 380 s on any setting, or >= 20 put-backs a run on Easy; expert: median finish <= 190 s and '
             '<= 1.0 lives + put-backs a run; middle: everyone else with a finished gen2 1-1 run; unrated: no finished run')


def tier_of(facts):
    fin = [f['finishS'] for f in facts if f['finishS']]
    if not fin:
        return 'unrated'  # no finished run: too little to tier
    played = [f for f in facts if f['played']] or facts
    med_f = statistics.median(fin)
    easy_pb = [f['putbacks'] for f in played if f['mode'] == 'easy']
    if med_f >= 380 or (easy_pb and statistics.mean(easy_pb) >= 20):
        return 'child'
    if med_f <= 190 and sum(f['lives'] + f['putbacks'] for f in played) / max(1, len(played)) <= 1.0:
        return 'expert'
    return 'middle'


def survey_counts(sessions, pid_of_session):
    out = D(C)
    for sid, s_ in sessions.items():
        for m in s_['m']:
            if m[0] == 'e' and m[2] == 'survey' and sid in pid_of_session:
                try:
                    j = json.loads(str(m[3]))
                except ValueError:
                    continue
                if isinstance(j, dict) and j.get('v') == 2:
                    for k in ('fun', 'long', 'knew', 'tips', 'next'):
                        if k in j:
                            out[pid_of_session[sid]][f'{k}={j[k]}'] += 1
                    for h in j.get('hard', []) or []:
                        out[pid_of_session[sid]][f'hard={h}'] += 1
    return out


def screen_of(text):
    """'402x713 ...' -> (402, 713) or None"""
    m_ = re.search(r'(\d{2,5})x(\d{2,5})', text or '')
    return (int(m_.group(1)), int(m_.group(2))) if m_ else None


def orient(wh):
    return 'portrait' if wh[1] >= wh[0] else 'landscape'


def touch_numbers(sessions_of_player):
    """Touch numbers by orientation. Each stroke is placed on the screen size IN FORCE when the finger went down (the device line, then
    every `start` and `screen` moment), so a phone turned mid-session never gives a share over 1. Stroke kinds as profile.py: tap
    (path < 12 px, < 300 ms), hold (path < 12 px), flick (< 300 ms, over 0.25 px/ms), else drag."""
    acc = D(lambda: {'strokes': [], 'gaps': [], 'two': 0, 'downs': 0, 'ms': 0.0, 'W': [], 'H': [], 'sizes': []})
    unplaced = 0
    play = C()
    secs = 0.0
    for s_ in sessions_of_player:
        # the size at the start: the device line's, else the session's first `start` / `screen` line; none known: its strokes stay unplaced
        wh = screen_of((s_.get('device') or '').split(';')[1] if ';' in (s_.get('device') or '') else '') or next(
            (screen_of(str(m[3])) for m in s_['m'] if m[0] == 'e' and m[2] in ('start', 'screen') and screen_of(str(m[3]))), None)
        live, last_up, t_or, t0, t1 = {}, None, None, None, None
        for m in s_['m']:
            k, t = m[0], m[1]
            if not isinstance(t, (int, float)):
                continue
            t0 = t if t0 is None else min(t0, t)
            t1 = t if t1 is None else max(t1, t)
            if t_or is None:
                t_or = t
            if k == 'e' and m[2] in ('start', 'screen'):
                n_ = screen_of(str(m[3]))
                if n_ and n_ != wh:
                    if wh:
                        acc[orient(wh)]['ms'] += max(0, t - t_or)
                    t_or, wh = t, n_
                if m[2] == 'start':
                    play['starts'] += 1
            elif k == 'e':
                if m[2] in ('hurt', 'lostLife', 'quit', 'finish', 'stuckHelp'):
                    play[m[2]] += 1
            elif k == 'i':
                play['i:' + str(m[2])] += 1
            elif k == 'd' and wh is None:
                unplaced += 1
            elif k == 'd':
                o = acc[orient(wh)]
                if last_up is not None and not live:
                    o['gaps'].append(t - last_up)
                live[m[2]] = {'pts': [(t, m[3], m[4])], 'wh': wh}
                o['downs'] += 1
                if len(live) > 1:
                    o['two'] += 1
                if len(m) > 5 and m[5]:
                    o['sizes'].append(m[5])
            elif k == 'm' and m[2] in live:
                live[m[2]]['pts'].append((t, m[3], m[4]))
            elif k in ('u', 'c') and m[2] in live:
                f = live.pop(m[2])
                if k == 'u':
                    f['pts'].append((t, m[3], m[4]))
                    W, H = f['wh']
                    x0, y0 = f['pts'][0][1], f['pts'][0][2]
                    if not (0 <= x0 <= W and 0 <= y0 <= H):
                        if 0 <= x0 <= H and 0 <= y0 <= W:
                            W, H = H, W  # turned, and the screen line had not settled yet (0.4 s)
                        else:
                            unplaced += 1
                            continue
                    f['W'], f['H'] = W, H
                    acc[orient((W, H))]['strokes'].append(f)
                last_up = t
        if t0 is not None:
            secs += (t1 - t0) / 1000
            if wh:
                acc[orient(wh)]['ms'] += max(0, t1 - (t_or or t1))
    placed = sum(len(a['strokes']) for a in acc.values())
    out = {'unplacedStrokes': unplaced, 'touchPlacedShare': round(placed / max(1, placed + unplaced), 3)}
    for o, a in sorted(acc.items()):
        kinds, tap, hold, fl, fls, flm, drag, wob, sx, sy = C(), [], [], [], [], [], [], [], [], []
        for f in a['strokes']:
            (ta, xa, ya), (tb, xb, yb) = f['pts'][0], f['pts'][-1]
            dur = max(1, tb - ta)
            path = sum(math.hypot(q[1] - p_[1], q[2] - p_[2]) for p_, q in zip(f['pts'], f['pts'][1:]))
            dx, dy = xb - xa, yb - ya
            net = math.hypot(dx, dy)
            sx.append(xa / f['W'])
            sy.append(ya / f['H'])
            a['W'].append(f['W'])
            a['H'].append(f['H'])
            if path < 12 and dur < 300:
                kinds['tap'] += 1
                tap.append(dur)
            elif path < 12:
                kinds['hold'] += 1
                hold.append(dur)
            elif dur < 300 and net / dur > 0.25:
                kinds['flick'] += 1
                fl.append(net)
                fls.append(net / dur)
                flm.append(dur)
                if dy < 0 and abs(dy) > abs(dx):
                    wob.append(abs(math.degrees(math.atan2(dx, -dy))))
            else:
                kinds['drag'] += 1
                drag.append(dur)
        assert all(0 <= v <= 1 for v in sx + sy), 'a touch share over 1'
        n_ = max(1, len(a['strokes']))
        out[o] = {'strokes': len(a['strokes']), 'minutes': round(a['ms'] / 60000, 1),
                  'mix': {k: round(v / n_, 3) for k, v in kinds.items()}, 'tapMs': dist(tap), 'holdMs': dist(hold),
                  'flickPx': dist(fl), 'flickPxPerMs': dist(fls, 3), 'flickMs': dist(flm), 'dragMs': dist(drag),
                  'jumpFlickOffVerticalDeg': dist(wob), 'touchStartX': dist(sx, 3),
                  'touchStartY': dist(sy, 3), 'leftHalfShare': round(sum(v < 0.5 for v in sx) / n_, 3),
                  'twoFingerShare': round(a['two'] / max(1, a['downs']), 3), 'touchSizePx': dist(a['sizes']),
                  'gapBetweenTouchesMs': dist(a['gaps']), 'screenWidthPx': dist(a['W']), 'screenHeightPx': dist(a['H'])}
    mins = max(secs / 60, 0.01)
    out['play'] = {'minutes': round(mins, 1), 'starts': play['starts'], 'finishes': play['finish'], 'quits': play['quit'],
                   'stuckHelp': play['stuckHelp'], 'hurtPerMinute': round(play['hurt'] / mins, 2),
                   'livesLostPerMinute': round(play['lostLife'] / mins, 2),
                   'intentsPerMinute': {k[2:]: round(v / mins, 1) for k, v in sorted(play.items()) if k.startswith('i:')}}
    return out


def steering_of(r):
    """steer spells, stops, ducks and climbs in one run (the game's steering is digital: move left / right / none)"""
    o = {'moveHoldMs': [], 'moveGapMs': [], 'reversals': 0, 'reversalGapMs': [], 'moves': 0, 'dragToMovePx': [], 'standStillMs': [], 'duckMs': [],
         'climbMs': [], 'climbSpeed': []}
    cur, since, last_dir, let_go = None, None, None, None
    fingers, last_f = {}, None
    still_at, duck_at, climb_at = None, None, None
    for m in r['m']:
        k, t = m[0], m[1]
        if k == 'd':
            fingers[m[2]] = [m[3], m[3]]
            last_f = m[2]
        elif k == 'm' and m[2] in fingers:
            fingers[m[2]][1] = m[3]
            last_f = m[2]
        elif k == 'i' and m[2] == 'move':
            d_ = str(m[3]) if len(m) > 3 else 'none'
            if cur is not None and since is not None:
                (o['moveHoldMs'] if cur != 'none' else o['moveGapMs']).append(t - since)
            if d_ == 'none' and cur in ('left', 'right'):
                last_dir, let_go = cur, t
            if d_ != 'none':
                o['moves'] += 1
                # a reversal: left -> (none) -> right, or straight across; its gap is the time with no direction held
                if cur in ('left', 'right') and d_ != cur:
                    o['reversals'] += 1
                    o['reversalGapMs'].append(0)
                elif cur == 'none' and last_dir and d_ != last_dir:
                    o['reversals'] += 1
                    o['reversalGapMs'].append(t - let_go)
                if last_f in fingers:
                    o['dragToMovePx'].append(abs(fingers[last_f][1] - fingers[last_f][0]))
            cur, since = d_, t
        elif k == 'i' and m[2] == 'duck':
            if str(m[3]) == '1':
                duck_at = t
            elif duck_at is not None:
                o['duckMs'].append(t - duck_at)
                duck_at = None
        elif k == 'p':
            st = str(m[6])[0]
            if st == 'g' and abs(m[4]) < 10:
                still_at = t if still_at is None else still_at
            elif still_at is not None:
                if t - still_at >= 100:
                    o['standStillMs'].append(t - still_at)
                still_at = None
            if st == 'c':
                climb_at = t if climb_at is None else climb_at
                o['climbSpeed'].append(abs(m[5]))
            elif climb_at is not None:
                o['climbMs'].append(t - climb_at)
                climb_at = None
    return o


def steering_pool(runs_):
    S_ = D(list)
    mv = rv = 0
    for r in runs_:
        o = r['steer']
        for k_, v in o.items():
            if isinstance(v, list):
                S_[k_] += v
        mv += o['moves']
        rv += o['reversals']
    return {'moveHoldMs': dist(S_['moveHoldMs']), 'moveGapMs': dist(S_['moveGapMs']),
            'reversalShare': round(rv / max(1, mv), 3), 'reversalGapMs': dist(S_['reversalGapMs']), 'dragToMovePx': dist(S_['dragToMovePx']),
            'standStillMs': dist(S_['standStillMs']), 'duckMs': dist(S_['duckMs']), 'climbMs': dist(S_['climbMs']),
            'climbSpeedPxPerS': dist([v for v in S_['climbSpeed'] if v > 0])}


def profiles(sessions, runs, pseud, outdir):
    print(f'PROFILES -> {outdir}')
    L, lst = layouts_for(runs)
    lists = {r['list'] for r in runs}
    if lst and lists != {lst}:
        print(f'  layouts: the runs logged list {lists}, the code builds {lst}: lip measures skipped')
        L = {}
    G = {k: ground_runs(v) for k, v in L.items() if not k.startswith('_') and isinstance(v, list)}
    facts = D(list)
    for r in runs:
        facts[r['who']].append(run_facts(r, G.get(f"{r['seed']} {r['mode']}")))
    # the layouts are the ones played: every ground line of Pokey's (p.y is his feet, p.x his middle) should sit on a rebuilt top
    on = tot = 0
    for r in runs:
        g = G.get(f"{r['seed']} {r['mode']}")
        if not g:
            continue
        for m in r['m']:
            if m[0] == 'p' and str(m[6])[0] == 'g':
                tot += 1
                on += any(a - 60 <= m[2] <= b + 60 for a, b in g.get(m[3], []))
    ground_check = f'{on} of {tot} ground lines sit on a rebuilt platform top (same y, x within 60 px of its ends)'
    print(f'  layouts: {ground_check}')
    by_player_sessions = D(list)
    pid_of_session = {}
    for sid, s_ in sessions.items():
        by_player_sessions[pseud[player_key(s_)]].append(s_)
        pid_of_session[sid] = pseud[player_key(s_)]
    surveys = survey_counts(sessions, pid_of_session)
    os.makedirs(os.path.join(outdir, 'players'), exist_ok=True)
    os.makedirs(os.path.join(outdir, 'tiers'), exist_ok=True)
    tiers, index = D(list), {}
    for pid in sorted(by_player_sessions, key=lambda w: int(w[1:])):
        ss = by_player_sessions[pid]
        side = C(session_side(s_) for s_ in ss).most_common(1)[0][0]
        fs = facts.get(pid, [])
        tier = tier_of(fs) if fs else None
        tn = touch_numbers(ss)
        thin_why = [w for w, bad in ((f'gen2 runs under {THIN_PLAYER}', bool(fs) and len(fs) < THIN_PLAYER),
                                     (f'touchPlacedShare under {PLACED_MIN}', tn['touchPlacedShare'] < PLACED_MIN)) if bad]
        doc = {'player': pid, 'side': side, 'tier': tier, 'sessions': len(ss), 'gen2Runs': len(fs), 'thin': bool(thin_why),
               'thinWhy': thin_why, 'touchPlacedShare': tn['touchPlacedShare'], 'touch': tn,
               # every stage they played (the old stages have the vines: 1-1 has no climbing)
               'steeringAllStages': steering_pool([{'steer': steering_of({'m': s_['m']})} for s_ in ss])}
        # how their touch changed: one snapshot per session of 50+ strokes, oldest first (profile.py's 'curve', no session ids)
        curve = []
        for s_ in sorted(ss, key=lambda s_: parse_arrived(s_['first']) or datetime.min):
            one = touch_numbers([s_])
            for o in ('portrait', 'landscape'):
                if o in one and one[o]['strokes'] >= 50:
                    curve.append({'orientation': o, **{k: one[o][k] for k in (
                        'strokes', 'minutes', 'mix', 'tapMs', 'flickPx', 'flickPxPerMs', 'jumpFlickOffVerticalDeg', 'touchStartX',
                        'touchStartY', 'leftHalfShare', 'twoFingerShare', 'gapBetweenTouchesMs')},
                        'livesLostPerMinute': one['play']['livesLostPerMinute']})
        doc['touchCurve'] = curve
        if fs:
            tiers[tier].append(pid)
            doc['gen2_1_1'] = {mode: pool([f for f in fs if f['mode'] == mode]) for mode in ('normal', 'easy')
                               if any(f['mode'] == mode for f in fs)}
            doc['gen2_1_1']['firstRun'] = pool(fs[:1])
            doc['gen2_1_1']['laterRuns'] = pool(fs[1:]) if len(fs) > 1 else None
            doc['gen2_1_1']['finishTrend'] = [f['finishS'] for f in fs if f['finishS']]
            doc['survey'] = dict(surveys.get(pid, {}))
        json.dump(doc, open(os.path.join(outdir, 'players', f'{pid}.json'), 'w'), indent=1)
        index[pid] = {'side': side, 'tier': tier, 'sessions': len(ss), 'gen2Runs': len(fs), 'runs': len(fs),
                      'thin': bool(thin_why), 'thinWhy': thin_why, 'touchPlacedShare': tn['touchPlacedShare']}
    for tier, pids in tiers.items():
        fs = [f for p in pids for f in facts[p]]
        firsts = [facts[p][0] for p in pids]
        laters = [f for p in pids for f in facts[p][1:]]
        doc = {'tier': tier, 'rule': TIER_RULE, 'players': pids, 'runs': len(fs), 'thin': len(fs) < THIN_TIER,
               'thinRule': f'thin: a tier under {THIN_TIER} runs; a player under {THIN_PLAYER} gen2 runs or with touchPlacedShare under {PLACED_MIN}: sample, do not trust its tails', 'note': 'pooled over runs; perPlayer keeps one player from '
               'counting as many', 'all': {mode: pool([f for f in fs if f['mode'] == mode]) for mode in ('normal', 'easy')
                                           if any(f['mode'] == mode for f in fs)},
               'firstRun': pool(firsts), 'laterRuns': pool(laters) if laters else None,
               'perPlayer': {p: {'runs': len(facts[p]), 'finishMedianS': (statistics.median([f['finishS'] for f in facts[p]
                                 if f['finishS']]) if any(f['finishS'] for f in facts[p]) else None),
                                 'jumpHoldMsP50': (dist(sum((f['j']['hold'] for f in facts[p]), [])) or {}).get('p50'),
                                 'groundPressToLipPxP50': (dist(sum((f['j']['lip'] for f in facts[p]), [])) or {}).get('p50')}
                             for p in pids},
               'touch': touch_numbers([s_ for p in pids for s_ in by_player_sessions[p]]),
               'steeringAllStages': steering_pool([{'steer': steering_of({'m': s_['m']})} for p in pids
                                                   for s_ in by_player_sessions[p]])}
        json.dump(doc, open(os.path.join(outdir, 'tiers', f'{tier}.json'), 'w'), indent=1)
        print(f'  tier {tier:6}: {len(pids)} players {pids}, {len(fs)} runs')
    json.dump({'rule': TIER_RULE, 'thinRule': f'thin: a tier under {THIN_TIER} runs; a player under {THIN_PLAYER} gen2 runs or with touchPlacedShare under {PLACED_MIN}',
               'layoutList': lst, 'groundCheck': ground_check, 'tiers': {t: {'players': p_, 'runs': sum(len(facts[x]) for x in p_),
                                                                            'thin': sum(len(facts[x]) for x in p_) < THIN_TIER}
                                                                         for t, p_ in tiers.items()},
               'players': index}, open(os.path.join(outdir, 'index.json'), 'w'), indent=1)
    print(f'  {len(index)} player files, {len(tiers)} tier files, index.json')


def self_test():
    """the slicing on a made-up run: times close on the next section and on the finish; away time is removed"""
    r = {'m': [['e', 0, 'gen2', '1-1 seed 7 normal build x list y'], ['e', 1000, 'section', 'A | a:ki'], ['p', 1100, 0, 0, 0, 0, 'g'],
               ['p', 3000, 400, 0, 0, 0, 'g'], ['e', 3500, 'hidden', 'x400'], ['e', 9500, 'shown', 'away 6s'],
               ['e', 11000, 'section', 'B | b:goal'], ['e', 12000, 'lostLife', 'pit'], ['e', 15000, 'finish', '15']]}
    slice_run(r)
    a, b = r['slices']
    assert (a['id'], round(a['dur'], 3), b['id'], b['dur'], b['life'], r['end']) == ('a', 4.0, 'b', 4.0, ['pit'], 'finish'), r
    r2 = {'m': r['m'][:7]}
    slice_run(r2)
    assert r2['end'] == 'left' and r2['quit_in'] == 'b', r2
    assert norm_row(['11/9/2026 16:25:00', 'P', 's', '3', 'd', 'v', '4', 'raw:[]'])['part'] == 3
    assert norm_row(['P', 's', '3', 'd', 'v', '4', 'raw:[]'])['session'] == 's'
    print('self-test passed')


def main(argv):
    if '--self-test' in argv:
        return self_test()
    delta = None
    if '--delta' in argv:
        i = argv.index('--delta')
        delta = datetime.strptime(argv[i + 1], '%m/%d/%Y %H:%M:%S')  # Eastern time, as this report prints it
        argv = argv[:i] + argv[i + 2:]
    prof = None
    if '--profiles' in argv:
        i = argv.index('--profiles')
        prof = argv[i + 1]
        argv = argv[:i] + argv[i + 2:]
    sessions, nrows, unread = load(export_files(argv))
    pseud = {}
    for s in sorted(sessions.values(), key=lambda s: parse_arrived(s['first']) or datetime.min):
        pseud.setdefault(player_key(s), f'P{len(pseud) + 1}')
    print(f'{nrows} rows read, {unread} without readable data, {len(sessions)} sessions, {len(pseud)} players; '
          f'last row arrived {max(parse_arrived(s["last"]) or datetime.min for s in sessions.values()):%m-%d %H:%M} ET\n')
    sides_table(sessions, pseud)
    runs = [r for r in runs_of(sessions, pseud) if r['stage'] == '1-1']
    if delta:
        runs = [r for r in runs if (parse_arrived(r['last']) or datetime.min) > delta]
        print(f'DELTA: only runs whose session sent a row after {delta}: {len(runs)} runs\n')
    overview(runs)
    validate(runs)
    findings = sections(runs)
    stretches(runs)
    findings += players(runs, sessions)
    phones(runs, sessions)
    glitches(runs)
    teaching(runs)
    ranking(findings)
    if prof:
        profiles(sessions, [r for r in runs_of(sessions, pseud) if r['stage'] == '1-1'], pseud, prof)


if __name__ == '__main__':
    main(sys.argv[1:])
