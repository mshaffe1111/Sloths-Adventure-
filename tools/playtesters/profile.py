"""
profile.py: turns the control-test recordings (Matt's "Sloths control tests" sheet, decoded into one JSON per session)
into a play-style profile per tester. The bot playtesters copy these: how long their touches last, how far and fast
they flick, where their thumbs land, how sloppy their jump flicks are, how quick they act, and what they said.

  python3 -I tools/playtesters/profile.py <folder of decoded sessions> tools/playtesters/personas

Only numbers and the tester's own survey answers go into a profile; no raw finger log is kept in the repo.
"""
import collections, glob, json, math, os, statistics, sys

WANT = {'Jen': 'jen', 'Sally': 'sally', 'Steph Roberts': 'steph', 'Brycen': 'brycen', 'Matt': 'matt',
        # Sasa is Sally on a second, bigger Android (552 wide): same thumbs, folded in (Matt, 2026-10-26)
        'Sasa': 'sally'}


def pct(xs, p):
    if not xs:
        return None
    xs = sorted(xs)
    return round(xs[min(len(xs) - 1, int(len(xs) * p))], 3)


def spread(xs):
    return {'p10': pct(xs, 0.1), 'p50': pct(xs, 0.5), 'p90': pct(xs, 0.9)} if xs else None


def device_size(dev):
    # "iPhone; 402x713 portrait; ..."
    try:
        wh = dev.split(';')[1].strip().split(' ')
        w, h = (int(v) for v in wh[0].split('x'))
        return w, h, wh[1]
    except Exception:
        return 400, 800, 'portrait'


def profile(sessions):
    strokes = []  # one per finger: down..up
    gaps = []  # ms between one finger lifting and the next going down
    two = 0
    frames = 0
    intents = collections.Counter()
    jump_hold = []
    events = collections.Counter()
    surveys = []
    seconds = 0.0
    sizes = []
    devices = collections.Counter()
    section_times = []
    for s in sessions:
        w, h, orient = device_size(s['device'])
        devices[f"{s['device'].split(';')[0]} {w}x{h} {orient}"] += 1
        live = {}
        last_up = None
        jump_at = None
        t0 = t1 = None
        last_section = None
        for part in s['parts']:
            if not isinstance(part, list):
                continue
            for l in part:
                k, t = l[0], l[1]
                t0 = t if t0 is None else min(t0, t)
                t1 = t if t1 is None else max(t1, t)
                if k == 'd':
                    if last_up is not None and not live:
                        gaps.append(t - last_up)
                    live[l[2]] = {'t': t, 'x0': l[3], 'y0': l[4], 'pts': [(t, l[3], l[4])], 'w': w, 'h': h}
                    if len(l) > 5 and l[5]:
                        sizes.append(l[5])
                    frames += 1
                    if len(live) > 1:
                        two += 1
                elif k == 'm' and l[2] in live:
                    live[l[2]]['pts'].append((t, l[3], l[4]))
                elif k in ('u', 'c') and l[2] in live:
                    f = live.pop(l[2])
                    if k == 'u':
                        f['pts'].append((t, l[3], l[4]))
                        strokes.append(f)
                    last_up = t
                elif k == 'i':
                    intents[l[2]] += 1
                    if l[2] in ('jump', 'tapjump'):
                        jump_at = t
                    elif l[2] == 'jumpUp' and jump_at is not None:
                        jump_hold.append(t - jump_at)
                        jump_at = None
                elif k == 'e':
                    events[l[2]] += 1
                    if l[2] == 'survey':
                        try:
                            surveys.append(json.loads(l[3]))
                        except Exception:
                            surveys.append(l[3])
                    if l[2] == 'section':
                        if last_section is not None:
                            section_times.append((t - last_section) / 1000)
                        last_section = t
        if t0 is not None:
            seconds += (t1 - t0) / 1000

    kinds = collections.Counter()
    tap_dur, flick_len, flick_speed, flick_dur, drag_dur, hold_dur = [], [], [], [], [], []
    up_wobble, start_x, start_y = [], [], []
    for f in strokes:
        (ta, xa, ya), (tb, xb, yb) = f['pts'][0], f['pts'][-1]
        dur = max(1, tb - ta)
        path = sum(math.hypot(b[1] - a[1], b[2] - a[2]) for a, b in zip(f['pts'], f['pts'][1:]))
        dx, dy = xb - xa, yb - ya
        net = math.hypot(dx, dy)
        start_x.append(xa / f['w'])
        start_y.append(ya / f['h'])
        if path < 12 and dur < 300:
            kinds['tap'] += 1
            tap_dur.append(dur)
        elif path < 12:
            kinds['hold'] += 1
            hold_dur.append(dur)
        elif dur < 300 and net / dur > 0.25:
            kinds['flick'] += 1
            flick_len.append(net)
            flick_speed.append(net / dur)
            flick_dur.append(dur)
            if dy < 0 and abs(dy) > abs(dx):
                up_wobble.append(abs(math.degrees(math.atan2(dx, -dy))))
        else:
            kinds['drag'] += 1
            drag_dur.append(dur)
    n = max(1, len(strokes))
    mins = max(seconds / 60, 0.01)
    left = sum(1 for x in start_x if x < 0.5) / max(1, len(start_x))
    return {
        'sessions': len(sessions),
        'minutesPlayed': round(mins, 1),
        'devices': dict(devices),
        'strokes': len(strokes),
        'mix': {k: round(v / n, 3) for k, v in kinds.items()},
        'tapMs': spread(tap_dur),
        'holdMs': spread(hold_dur),
        'flickPx': spread(flick_len),
        'flickPxPerMs': spread(flick_speed),
        'flickMs': spread(flick_dur),
        'dragMs': spread(drag_dur),
        'jumpFlickOffVerticalDeg': spread(up_wobble),
        'jumpHoldMs': spread(jump_hold),
        'gapBetweenTouchesMs': spread(gaps),
        'touchStartX': spread(start_x),
        'touchStartY': spread(start_y),
        'leftHalfShare': round(left, 3),
        'twoFingerShare': round(two / max(1, frames), 3),
        'touchSizePx': spread(sizes),
        'perMinute': {k: round(v / mins, 1) for k, v in intents.items()},
        'hurtPerMinute': round(events['hurt'] / mins, 2),
        'livesLostPerMinute': round(events['lostLife'] / mins, 2),
        'secondsPerSection': spread(section_times),
        'quits': events['quit'],
        'finishes': events['finish'],
        'stuckHelp': events['stuckHelp'],
        'survey': surveys,
    }


def main():
    src, out = sys.argv[1], sys.argv[2]
    os.makedirs(out, exist_ok=True)
    by = collections.defaultdict(list)
    for f in sorted(glob.glob(os.path.join(src, '*.json'))):
        s = json.load(open(f))
        if s['player'] in WANT:
            by[WANT[s['player']]].append(s)
    for key, sessions in by.items():
        p = profile(sessions)
        p['name'] = sessions[0]['player'].split(' ')[0]
        # how they got better: one snapshot per real session, oldest first (a bot plays its Nth batch with the Nth snapshot)
        p['curve'] = []
        for s in sorted(sessions, key=lambda s: s['session']):
            one = profile([s])
            if one['strokes'] < 50:
                continue
            p['curve'].append({k: one[k] for k in (
                'minutesPlayed', 'mix', 'tapMs', 'flickPx', 'flickPxPerMs', 'jumpFlickOffVerticalDeg', 'touchStartX', 'touchStartY',
                'leftHalfShare', 'twoFingerShare', 'gapBetweenTouchesMs', 'hurtPerMinute', 'livesLostPerMinute', 'secondsPerSection')})
            p['curve'][-1]['session'] = s['session']
        json.dump(p, open(os.path.join(out, f'{key}.json'), 'w'), indent=1)
        print(key, p['minutesPlayed'], 'min', p['strokes'], 'strokes', p['mix'])


if __name__ == '__main__':
    main()
