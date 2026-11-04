# Phone check for the GPU backdrop (GPU plan stage 1): the card for Matt

**What it answers:** is the new way of drawing the backdrop faster on your phones? It looks the same either way. Nothing ships until
this says yes.

**What you need:** the Pixel, the Samsung and the OnePlus, charged, with no power saver. About 10 minutes a phone. The lead sends you
the test link (`<TEST LINK>` below).

**On each phone:**
1. Open `<TEST LINK>#ctest`. Name the run after the phone, e.g. `Matt Pixel`, and tap Start. Play the short level the way you normally
   play (about two minutes), then tap "I'm done" twice. Do it **twice**: every run is a new random level.
2. Open `<TEST LINK>#ctest&gpuback=0` (the old way of drawing the backdrop). Name it after the phone plus `2D`, e.g. `Matt Pixel 2D`,
   and play two runs the same way.
3. If the recording badge says "not sending from this link", stop and tell the lead: that link can't send.

**What to send back:** nothing but "done", and which phones you used. Each run sends its numbers to the testers' sheet by itself: the
frame times, the phone's GPU, and a `backdrop` line saying which way it drew and what the copy cost.

**What we read from it** (the lead does this, not you):
- On each phone, the runs against the `2D` runs: average frame time, the worst stretches, stalls over 100 ms, and the `ready` time
  (how long the stage takes to start).
- The `backdrop` line:
  - `backdrop: GPU, copy X ms` means the phone used the new way;
  - `backdrop: 2D (copy ... a readback ...)` means the phone's browser can't do it cheaply, so it quietly kept the old way. That's
    fine, and it tells us that phone gains nothing.
- **Ship rule:** the new way merges only if it is no slower on any of the three phones and faster on at least one.
