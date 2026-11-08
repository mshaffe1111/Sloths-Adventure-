"""Can a single touch jump cross a level gap of width W? (FEEL.md numbers only.)

Near lip at x = 0, far lip at x = W, both tops at y = 0 (y up positive).
Centre x, half-width 22.

L  = how far the centre passes the near lip before he is airborne
     (0 = centre must be over ground; 15.8 = the 1-1 ledge-catch figure; 22 = any part of the box).
k  = airborne ticks that pass (falling) before the jump registers. 1-1 Normal coyote is
     0.214 s = jumps allowed on airborne ticks 1..6, i.e. k = 0..5 here; Easy 0.248 s -> k = 0..6.
     Negative k = the jump registers |k| ticks before he reaches L (still on the ground).

Far-side rule sets (bracketing the unknown details):
  generous: 8 px foot nudge when the feet cross the top, OR the 26 px lip hoist at the face
  medium  : box must overlap when the feet cross the top, OR the 26 px lip hoist
  strict  : centre within 15.8 px of the edge when the feet cross the top (no nudge, no hoist)
"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from sim import steer_air, gravity, held_ticks_for, MAX_RUN, JUMP_V, CUT_V, HALF_W

DT = 1/30


def trajectory(L, k, hold_ms=220, vx0=MAX_RUN, stand_vx=None):
    hold = held_ticks_for(hold_ms)
    vx = vx0
    pts = []
    if k < 0:
        x = L - 0.0
        # walk back |k| ticks of running from the lip
        # (approximate: step backwards by the alternating run speeds)
        back = 0.0
        v = vx
        for i in range(-k):
            back += v * DT
            v = steer_air(v, DT)
        x = L - back
        y = 0.0
        vy = 0.0
    else:
        x, y, vy = L, 0.0, 0.0
        for i in range(k):          # falling coyote ticks
            vx = steer_air(vx, DT)
            vy = gravity(vy, False, DT)
            x += vx * DT
            y += vy * DT
    if stand_vx is not None:
        vx = stand_vx
    # jump tick 0
    vy = JUMP_V
    for t in range(80):
        if stand_vx is None:
            vx = steer_air(vx, DT)
        held = t < hold
        if not held and vy > CUT_V:
            vy = CUT_V
        vy = gravity(vy, held, DT)
        x += vx * DT
        y_prev = y
        y += vy * DT
        pts.append((t, x, y_prev, y, vy))
        if y < -200:
            break
    return pts


def reach(L, k, **kw):
    pts = trajectory(L, k, **kw)
    x_cross = None
    x_last_hoist = None
    for (t, x, yp, y, vy) in pts:
        if x_cross is None and vy < 0 and yp >= 0 >= y:
            x_cross = x
        if y >= -26:
            x_last_hoist = x
    gen = max(x_cross + HALF_W + 8, x_last_hoist + HALF_W)
    med = max(x_cross + HALF_W, x_last_hoist + HALF_W)
    strict = x_cross + 15.8
    return gen, med, strict, pts


if __name__ == '__main__':
    ks = [-2, -1, 0, 1, 2, 3, 4, 5]
    for label, idx in [('GENEROUS (nudge or hoist)', 0), ('MEDIUM (box overlap or hoist)', 1),
                       ('STRICT (centre within 15.8 px, no hoist)', 2)]:
        print(f'\nSingle touch jump, full run. Widest level gap crossed, rules = {label}')
        print('   k:   ' + ''.join(f'{k:>7d}' for k in ks))
        for L in [0.0, 15.8, 22.0]:
            row = f'L={L:4.1f} '
            for k in ks:
                row += f'{reach(L, k)[idx]:7.1f}'
            print(row)
    # drop during coyote
    print('\nFall below the lip before a coyote jump (k ticks):')
    for k in range(0, 7):
        pts = trajectory(0.0, k)
        # y at jump start = first point's y_prev
        print(f'  k={k}: jump starts {-pts[0][2]:5.1f} px below the lip')
    print('\nStanding touch flick at the lip (carried at 213.75 px/s, nothing steering):')
    for L in [0.0, 15.8]:
        g, m, s, _ = reach(L, 0, stand_vx=213.75)
        print(f'  L={L}: generous {g:6.1f}  medium {m:6.1f}  strict {s:6.1f}')
    print('\nStanding flick with the other thumb also steering (accelerates from 0 in the air):')
    for L in [0.0, 15.8]:
        g, m, s, _ = reach(L, 0, vx0=0.0)
        print(f'  L={L}: generous {g:6.1f}  medium {m:6.1f}  strict {s:6.1f}')
