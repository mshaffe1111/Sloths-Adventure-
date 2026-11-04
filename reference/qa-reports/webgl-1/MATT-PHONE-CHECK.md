# Phone check for the GPU backdrop (GPU plan stage 1): the card for Matt

**What it answers:** is the new way of drawing the backdrop faster on your phones, and does it make the level slower to start? It
looks the same either way. Players never get it: it's on only on the testers' link, until your numbers decide (then the switch is
deleted).

**When:** after the measured release is live. The lead tells you.

**The link (the live testers' link):** https://mshaffe1111.github.io/Sloths-Adventure-/#ctest

**What you need:** the Pixel, the Samsung and the OnePlus, charged, power saver off. **About 5 minutes a phone:** two short runs. The
OnePlus matters most: it's the one that stutters.

**On each phone:**
0. Open the link once, close the tab, and open it again, so the phone isn't playing an old saved copy of the game.
1. Open `https://mshaffe1111.github.io/Sloths-Adventure-/#ctest`. Name the run after the phone, e.g. `Matt OnePlus`. Tap Start.
   **Watch how long it takes from tapping Start until you can move Pokey.** Play the level the way you normally play (about 2
   minutes), then tap "I'm done" twice.
2. Open `https://mshaffe1111.github.io/Sloths-Adventure-/#ctest&gpuback=0` (the old way of drawing the backdrop). Name it after the phone
   plus `2D`, e.g. `Matt OnePlus 2D`. Same thing: watch the start, play about 2 minutes, "I'm done" twice.
3. If the recording badge says "not sending from this link", stop and tell the lead.

**What to send back, one line a phone:**
- the phone's name;
- **the start:** did the first run take longer to get going than the `2D` run? Pick one: **same**, **a little longer** (you noticed,
  but it didn't bother you), or **clearly longer** (it felt like waiting);
- **the stutter:** was the first run smoother, the same, or choppier than the `2D` run?

Example: `OnePlus: start same, first run smoother.`

Everything else goes to the testers' sheet by itself: the frame times, the stalls, the phone's GPU, the start time in milliseconds,
and a `backdrop` line saying which way it drew.

**What we read from it** (the lead does this, not you):
- **That the runs are the new build.** Each run's build stamp is the measured release's, and its `backdrop` line is there. A run with no
  `backdrop` line is an old cached copy: ask for that pair again.
- **The start.** In the test container 1-1 started 0.91 s later with the new way (5.4 s against 4.5 s); 5-M and 8-1 were 0.1-0.2 s
  later. The `ready` time in each `backdrop` line gives the phone's number; Matt's word says whether a person notices.
- **The stutter.** Each phone's `#ctest` run against its `2D` run: stalls over 100 ms (and how many are the game's own draw, `d` in the
  stall line), the worst stretches, the average frame time. The 0.9.4 baseline (11-04, before this release, plain 2D):

  | Phone | Stalls over 100 ms, two runs | Worst frame |
  |---|---|---|
  | Pixel | 0 | 100 ms |
  | Samsung | 2 | 150 ms |
  | OnePlus | 33 (about 25 the game's own draw, 150-460 ms) | 500 ms |
- **The `backdrop` line:**
  - `backdrop: GPU, copy X ms ... ready Y ms` means the phone used the new way;
  - `backdrop: 2D (...), ready Y ms` means the phone's browser can't copy it cheaply, so it quietly kept the old way. That's fine: that
    phone gains nothing.
- **One pair is a first look, not proof.** Each run is a new random level. If a phone is close or mixed, the lead asks for one more pair
  on it.
- **Ship rule:** the GPU backdrop goes to everyone only if it is no slower on any phone, faster on at least one, and Matt doesn't call the
  start "clearly longer" on any. Otherwise stages 0 and 1 come out. Either way the switch is deleted that day.
