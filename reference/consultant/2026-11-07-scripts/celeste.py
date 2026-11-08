# Celeste jump from the published Player.cs constants (60 fps), held jump vs tap.
G=900.0; HALF=40.0; MAXFALL=160.0; JUMP=105.0; VAR=0.2; MAXRUN=90.0; HBOOST=40.0
RUNREDUCE=400.0; RUNACCEL=1000.0; AIRMULT=0.65
def jump(hold_time, dt=1/60):
    x=0.0; y=0.0; vx=MAXRUN+HBOOST; vy=JUMP; var=VAR; t=0.0; apex=0.0; n=0
    while True:
        held = t < hold_time
        # horizontal: moving right held; over max -> reduce at RUNREDUCE*AIRMULT
        if vx > MAXRUN: vx = max(MAXRUN, vx - RUNREDUCE*AIRMULT*dt)
        # var jump
        if var > 0:
            var -= dt
            if held: vy = max(vy, JUMP)   # up-positive: keep at least JUMP upward
            else: var = 0
        mult = 0.5 if (abs(vy) < HALF and held) else 1.0
        vy = max(-MAXFALL, vy - G*mult*dt)
        x += vx*dt; y += vy*dt; t += dt; n += 1
        apex = max(apex, y)
        if y <= 0 and vy < 0: return apex, n, x, t
for h in [0.0, 0.05, 0.1, 10]:
    a,n,x,t = jump(h)
    print(f'hold {h:5.2f}s: apex {a:5.1f} px ({a/11:4.2f} body heights, {a/8:4.2f} tiles), airtime {t:4.2f}s, travel {x:5.1f} px ({x/8:4.1f} body widths)')
