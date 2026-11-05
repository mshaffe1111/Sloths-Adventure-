# Matt Thorson + Noel Berry, Celeste Classic (PICO-8, 2015), full Lua source

URL: https://gist.github.com/sherjilozair/0663956e065e9588fd3ab5c36f77575c ("Source code for pico-8 version of Celeste", posted 2018-06-17; the file header reads "-- ~celeste~ -- matt thorson + noel berry")
Read: 2026-11-05 ~11:40 AM ET, TinyFish fetch_content, whole file read. Verbatim lines (PICO-8 `_update` runs at 30 fps; the game's own clock proves it):

> function _update()
>  frames=((frames+1)%30)
>  if frames==0 and level_index()<30 then
>   seconds=((seconds+1)%60)

Crumbling floor ("fall_floor"):
> function break_fall_floor(obj)
>  if obj.state==0 then
>   psfx(15)
>   obj.state=1
>   obj.delay=15--how long until it falls
> ...
>  elseif this.state==1 then
>   this.delay-=1
>   if this.delay<=0 then
>    this.state=2
>    this.delay=60--how long it hides for
>    this.collideable=false
> ...
>  elseif this.state==2 then
>   this.delay-=1
>   if this.delay<=0 and not this.check(player,0,0) then
>    psfx(7)
>    this.state=0
>    this.collideable=true

Touch triggers it from above or either side:
>  if this.check(player,0,-1) or this.check(player,-1,0) or this.check(player,1,0) then
>   break_fall_floor(this)

Player forgiveness:
>  if (jump) then
>   this.jbuffer=4
> ...
>  if on_ground then
>   this.grace=6

Measured from the code (exact, not estimates), at 30 fps:
- crumble delay 15 frames = 0.50 s from first touch to gone; it is gone 60 frames = 2.0 s, then comes back (only once the player is not inside it);
- the shake is drawn as 3 sprite steps over the 15 frames (`spr(23+(15-this.delay)/5,...)`), so the warning is visible for the whole 0.5 s;
- jump buffer 4 frames = 133 ms; coyote time ("grace") 6 frames = 200 ms.
