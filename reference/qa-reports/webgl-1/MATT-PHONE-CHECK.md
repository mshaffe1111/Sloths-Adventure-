# Phone check for the GPU backdrop (GPU plan stage 1): the card for Matt

**What it answers:** is the new way of drawing the backdrop faster on your phones, and does it make the level slower to start? It
looks the same either way. Nothing ships until this says yes.

**Test link (its own page, not your usual test link):** https://claude.ai/artifact/MaBaabWAKZXQGjx81NpstM

**What you need:** your phones, charged, power saver off. **About 5 minutes a phone:** two short runs.

**On each phone:**
1. Open the link with `#ctest` on the end:
   `https://claude.ai/artifact/MaBaabWAKZXQGjx81NpstM#ctest`
   Name the run after the phone, e.g. `Matt Pixel`. Tap Start. **Watch how long it takes from tapping Start until you can move
   Pokey.** Play the level the way you normally play (about 2 minutes), then tap "I'm done" twice.
2. Open it again with `#ctest&gpuback=0` on the end (the old way of drawing the backdrop):
   `https://claude.ai/artifact/MaBaabWAKZXQGjx81NpstM#ctest&gpuback=0`
   Name it after the phone plus `2D`, e.g. `Matt Pixel 2D`. Same thing: watch the start, play about 2 minutes, "I'm done" twice.
3. If the recording badge says "not sending from this link", stop and tell the lead: that link can't send.

**What to send back, one line a phone:**
- the phone's name;
- **the start:** did the first run (new way) take longer to get going than the `2D` run? Pick one: **same**, **a little longer**
  (you noticed, but it didn't bother you), or **clearly longer** (it felt like waiting);
- anything that looked wrong or felt choppy.

Example: `Pixel: start same, nothing wrong.`

Everything else sends itself to the testers' sheet: the frame times, the phone's GPU, the start time in milliseconds, and a
`backdrop` line saying which way it drew.

**What we read from it** (the lead does this, not you):
- **The start.** In this container 1-1 started 0.91 s later with the new way (5.4 s against 4.5 s); 5-M and 8-1 were 0.1-0.2 s later.
  The `ready` time in each run's `backdrop` line gives the phone's number; Matt's word says whether a person notices it.
- Each phone's new-way run against its `2D` run: average frame time, the worst stretches, and stalls over 100 ms.
- The `backdrop` line:
  - `backdrop: GPU, copy X ms ... ready Y ms` means the phone used the new way;
  - `backdrop: 2D (...), ready Y ms` means the phone's browser can't copy it cheaply, so it quietly kept the old way. That's fine,
    and it tells us that phone gains nothing.
- One run each way is a first look, not proof: each run is a new random level. If a phone is close or mixed, the lead asks for one
  more pair on that phone.
- **Ship rule:** the new way merges only if it is no slower on any phone, faster on at least one, and Matt doesn't call the start
  "clearly longer" on any phone.
