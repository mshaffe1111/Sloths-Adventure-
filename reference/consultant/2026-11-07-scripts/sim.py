"""Pokey movement simulation from FEEL.md numbers (no game code).

Order per tick (FEEL.md section 0): steer -> coyote/buffer -> jump -> release cut
-> gravity (+apex hang) -> max-fall clamp -> x += vx*dt, y += vy*dt -> landing.
y is measured UP (positive = above take-off height) in this script.
"""
import math

MAX_RUN = 285.0
AIR_ACC = 1700.0
BLEED = 520.0
G_UP = 1900.0
G_DOWN = 2500.0
HANG = 0.72
HANG_V = 90.0
MAX_FALL = 950.0
JUMP_V = 640.0
CUT_V = 230.0
DJ_V_11 = 540.0 * 1.12   # 604.8 on stage 1-1
DJ_V_25 = 540.0
BOUNCE_V = 830.0
HALF_W = 22.0


def steer_air(vx, dt, hold=True):
    if not hold:
        return vx
    if vx >= MAX_RUN:
        return vx - BLEED * dt          # the over-speed bleed branch
    return min(MAX_RUN, vx + AIR_ACC * dt)


def gravity(vy_up, held, dt):
    """vy_up > 0 means rising. FEEL uses screen y (down +); same rules."""
    rising = vy_up > 0
    g = G_UP if rising else G_DOWN
    if held and abs(vy_up) < HANG_V:
        g *= HANG
    vy_up -= g * dt
    if vy_up < -MAX_FALL:
        vy_up = -MAX_FALL
    return vy_up


def jump_arc(dt=1/30, hold_ticks=None, v0=JUMP_V, vx0=MAX_RUN, launched=False,
             dj_tick=None, dj_v=DJ_V_11, dj_hold_ticks=None, y0=0.0, steer=True,
             until_y=None, max_ticks=200):
    """Return list of (tick, x, y, vx, vy) after each tick's position update.
    hold_ticks: number of ticks (from take-off tick 0) the jump counts as held;
    None = held forever. launched=True: no release cut (mushroom etc.).
    dj_tick: tick index at which a double jump is pressed.
    """
    x, y, vx = 0.0, y0, vx0
    vy = 0.0
    out = []
    jump_start = 0
    for t in range(max_ticks):
        # steer
        vx = steer_air(vx, dt, steer)
        # jump / double jump
        if t == 0:
            vy = v0
            jump_start = 0
            cur_hold = hold_ticks
            cur_launched = launched
        if dj_tick is not None and t == dj_tick:
            if vy > 0:
                vy = math.sqrt(vy * vy + dj_v * dj_v)
            else:
                vy = dj_v
            jump_start = t
            cur_hold = dj_hold_ticks
            cur_launched = False
        held = cur_hold is None or (t - jump_start) < cur_hold
        # release cut
        if not held and not cur_launched and vy > CUT_V:
            vy = CUT_V
        vy = gravity(vy, held, dt)
        x += vx * dt
        y += vy * dt
        out.append((t, x, y, vx, vy))
        if until_y is not None and t > 0 and vy < 0 and y <= until_y:
            break
    return out


def apex(arc):
    return max(p[2] for p in arc)


def airtime_ticks(arc, land_y=0.0):
    for (t, x, y, vx, vy) in arc:
        if t > 0 and vy < 0 and y <= land_y:
            return t + 1, x
    return None, None


def held_ticks_for(ms, dt=1/30):
    # counts as held while time since take-off < ms
    n = 0
    while n * dt * 1000 < ms - 1e-9:
        n += 1
    return n


if __name__ == '__main__':
    dt = 1/30
    print('== Single jump checks vs FEEL.md table (30 fps) ==')
    for name, hold in [('held whole time', None), ('touch 220 ms', held_ticks_for(220)),
                       ('pad 80 ms', held_ticks_for(80)), ('released before take-off', 0)]:
        arc = jump_arc(hold_ticks=hold)
        n, x = airtime_ticks(arc)
        print(f'{name:28s} apex {apex(arc):6.1f}  airtime {n} ticks  centre travel {x:6.1f}')

    print('\n== Touch minimum hold vs apex (what a shorter minimum would give) ==')
    for ms in [0, 40, 80, 100, 130, 160, 190, 220]:
        arc = jump_arc(hold_ticks=held_ticks_for(ms))
        n, x = airtime_ticks(arc)
        print(f'min hold {ms:3d} ms -> apex {apex(arc):6.1f} px, airtime {n} ticks, travel {x:6.1f}')

    print('\n== Frame rate (single step of the whole frame) ==')
    for fps in [30, 25, 20.1]:
        d = 1/fps
        arc = jump_arc(dt=d, hold_ticks=held_ticks_for(220, d))
        print(f'{fps:5.1f} fps (dt {d*1000:4.1f} ms): touch apex {apex(arc):6.1f}')
    for steps, frame_ms in [(2, 50.0), (2, 60.0), (3, 70.0)]:
        d = frame_ms / 1000 / steps
        arc = jump_arc(dt=d, hold_ticks=held_ticks_for(220, d))
        print(f'frame {frame_ms:.0f} ms split into {steps} steps of {d*1000:.1f} ms: apex {apex(arc):6.1f}')

    print('\n== Mushroom bounce (launched, no cut) ==')
    for held in [0, None]:
        arc = jump_arc(v0=BOUNCE_V, launched=True, hold_ticks=held)
        n, x = airtime_ticks(arc)
        print(f'bounce, jump {"held" if held is None else "not held"}: apex {apex(arc):6.1f} px above mushroom top; '
              f'airtime {n} ticks')
    # bounce + double: press double at various ticks
    best = None
    for k in range(1, 26):
        arc = jump_arc(v0=BOUNCE_V, launched=True, hold_ticks=None, dj_tick=k, dj_hold_ticks=None)
        a = apex(arc)
        if best is None or a > best[1]:
            best = (k, a)
        if k in (1, 3, 6, 9, 12, 13, 14, 16, 18):
            print(f'  bounce + double pressed on tick {k:2d}: apex {a:6.1f}')
    print(f'  best: tick {best[0]} apex {best[1]:.1f}')

    print('\n== Double jump (1-1, v2 = 604.8) ==')
    best = None
    for k in range(1, 22):
        arc = jump_arc(hold_ticks=held_ticks_for(220), dj_tick=k, dj_hold_ticks=held_ticks_for(220))
        a = apex(arc)
        n, x = airtime_ticks(arc)
        if best is None or (x or 0) > best[2]:
            best = (k, a, x or 0, n)
    print(f'touch, best length: second flick on tick {best[0]}, apex {best[1]:.1f}, travel {best[2]:.1f}, {best[3]} ticks')
    for k in [2, 5, 8, 10, 11, 12, 14, 16]:
        arc = jump_arc(hold_ticks=held_ticks_for(220), dj_tick=k, dj_hold_ticks=held_ticks_for(220))
        n, x = airtime_ticks(arc)
        print(f'  second flick tick {k:2d}: apex {apex(arc):6.1f}, lands after {n} ticks, travel {x:6.1f}')
