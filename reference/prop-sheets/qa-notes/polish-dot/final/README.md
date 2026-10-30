# Dot curbed: the full rework (branch `polish-dot`)

Matt, 2026-10-29: *"it feels like she's constantly nagging me... we're drawing a weird blue box around things that doesn't even show
where it's at... As soon as they run in, Dot tells exactly how to do it."* The show-first preview (`../preview/`) was approved with
Matt's three answers: a new save starts on **Tips** (Normal) or **Help** (Easy); Help repeats a reminder only for something taught in
an earlier stage, never twice in one stage; and the 10 room lines, the setting names and "Hear Dot's tips again" are approved.
Nothing here is released.

- [LINES-FOR-MATT.md](LINES-FOR-MATT.md): every new line, room by room, for Matt's yes or no.
- [ROUND-2.md](ROUND-2.md): round 2, after the lead's four notes: every stage line that gave the answer (Matt on 4-4), Dot's voice
  (SR-38, SR-39), clues, boss quotes and card titles (SR-40 to SR-43), the control test's silent start, old and new.
- [TIMELINES.md](TIMELINES.md): every stage of Worlds 1-8, before and after, on both settings, line by line.
- `clips/`: before (top) and after (bottom), 1-6 and 4-3, on both settings. `shots/`: the Polish check's pictures.
- `data/`: the measurements (`before-*.json`, `after-*.json`) and the harness that made them (`pace-harness.mts`).

## How she talks now

- **Tips** (the Normal default): the first time of each new thing, once per save; a warning just before a danger; the locked exit;
  help after two deaths in one spot. At least 30 s between lines that can wait, and **at most 2 lines start in any 30 s** (only a
  first-time hazard about to hit, a warning or the locked exit may make a third). No reminders, no "Still N to collect!", no "This
  way, Pokey!", no nags on a clock, no story chatter in play.
- **Help** (the Easy default): every first time, plus a reminder of something taught in an earlier stage (never twice in one stage),
  15 s between lines that can wait, and at most 3 in any 30 s with the same exceptions.
- **Puzzle rooms never give the answer on entry.** Walking in, she names the problem. If he goes back and forth or fails twice, she
  goes to the piece and nudges ("That log looks heavy."). Only on Help, after more struggle, she says the move. Room lines win over
  everything else; no chatter inside a room; no gap lesson at a room's pieces.
- **No ring, no arrow.** When she points, she flies to the thing (she perches on a log he pushes or a log in a pool) and a small
  sparkle twinkles on it.
- **Never on Pokey.** Her bubble keeps clear of him (24 px of room now); if he or the camera brings him under it, it moves to the half
  of the screen away from him. A story aside steps aside during a camera reveal and comes back after.
- **No words floating in the world.** "LOGS DRIFT!", "SLEEPY SPORES", "STUCK IN THE WEB", "WARM AIR", "IT CRUMBLES", "FULL HEALTH",
  "SHRINE UNSEALED", "SAFE BEHIND THE ROCK", "LIFT IT OUT", "A LEDGE!" and "HIDE! INTO A BUSH" are gone. What they taught is in
  Dot's bubble (or Pokey's), once. A watcher's pass still puts an alarm mark "!" over his head and buzzes the phone, for kids who
  play with the sound off.
- **Her memory (DOT-1).** A tip is kept as heard only once it has been on screen its minimum time. A New Game clears it all, and the
  menu has "Hear Dot's tips again".

## Pacing, Worlds 1-8, before and after

The brisk route through every stage, in order on one save (so "once per save" counts as it does for a real player), with the
setting's filter and gaps. The 1-1 coach and the wayside story beats are not counted. A lesson's second step ("Slide your thumb up to
climb" right after "Flick up into the trunk") counts with its lesson. "Before" is the game at `ef07493` on the same harness ("Just
reminders" for Tips, "Teach me" for Help). Worlds 7 and 8 on this branch are the old-generator stages (gen2 Worlds 7 and 8 are on
their own branches).

**Tips** (targets: about 1.5 a minute in Worlds 1-2, about 1 after, at most 2 in the busiest 30 s)

| World | Lines a stage | Lines a minute | Busiest 30 s | Stages over 2 in 30 s |
|---|---|---|---|---|
| 1 | 4.1 → 3.1 | 1.97 → **1.49** | 4 → 3 | 5 → 2 |
| 2 | 1.9 → 1.7 | 0.98 → **0.87** | 2 → 2 | 0 → 0 |
| 3 | 3.9 → 1.4 | 1.68 → **0.62** | 4 → 3 | 3 → 2 |
| 4 | 3.0 → 2.0 | 1.12 → **0.75** | 6 → 2 | 3 → 0 |
| 5 | 6.4 → 2.4 | 3.20 → **1.20** | 6 → 3 | 7 → 1 |
| 6 | 2.3 → 1.1 | 1.12 → **0.53** | 5 → 1 | 2 → 0 |
| 7 | 1.6 → 0.2 | 0.85 → **0.13** | 2 → 1 | 0 → 0 |
| 8 | 0.7 → 0.1 | 0.35 → **0.06** | 2 → 1 | 0 → 0 |

The five Tips stages still at 3 in some 30 s, and why:
- **1-1**: the flag, the first gap and the first mushroom, 13-28 s. All three are firsts the stage teaches.
- **1-4**: the trunk, the rope and the squirrels' lift room, 3-32 s.
- **3-1**: "Too dark to see" and the glowworm warning, 2 s apart, after the spores.
- **3-2**: the room, the eyes' warning and the next room, 16-46 s.
- **5-2**: the sleeping spiders, the threads and "It hummed!", 7-16 s.

In each, the third line is a first-time hazard or a warning, the two kinds that may not be held back.

**Help**

| World | Lines a stage | Lines a minute | Busiest 30 s |
|---|---|---|---|
| 1 | 5.6 → 5.4 | 2.67 → 2.61 | 5 → 4 |
| 2 | 4.1 → 3.9 | 2.13 → 2.02 | 3 → 4 |
| 3 | 6.0 → 5.6 | 2.59 → 2.40 | 4 → 5 |
| 4 | 9.1 → 5.2 | 3.40 → 1.95 | 6 → 3 |
| 5 | 8.6 → 6.3 | 4.30 → 3.15 | 9 → 4 |
| 6 | 4.2 → 3.3 | 2.02 → 1.58 | 4 → 3 |
| 7 | 1.6 → 1.3 | 0.85 → 0.80 | 2 → 2 |
| 8 | 0.7 → 1.3 | 0.35 → 0.70 | 2 → 1 |

Help says about as much as before in Worlds 1-3 and less from World 4 on. It is the setting for new kids, and every puzzle room now has
its own words for walking in. Its busy spots are back-to-back puzzle rooms (2-3's four cage rooms in 25 s) and a run of different
warnings (3-7: the waking vine, the glowworms, the eyes and the hide, 16-33 s). A room's line is said as he walks in or not at all,
and a warning before its danger, so neither waits for the cap. A quick player who never struggles hears no nudges, so these counts
are the least Help says.

## What was removed

- The blue ring and the arrow (every world), and the floating instruction words listed above.
- On Tips: reminders, "Still N to collect!", "This way, Pokey!", the stuck nag on a clock, chatter in play, and tips again on a
  replay. On both settings: idle chatter inside puzzle rooms, gap lessons at a room's pieces, and Dot's line over a stage's camera reveal.
- 1-9's ring hint row, the idol lesson for a relic hidden in a fern (DOT-15), and the "don't stomp" lesson for World 5's ground
  spiders (Dot had just said "or stomp it", and a stomp does beat them).
- Three wordings of "hide" in a row: a watcher's pass gets one call to hide (1-7 on Help said three in 15 s).

## Also fixed on the way

- **The first river was never taught.** 2-1's water lesson ("Flick up when a log drifts close.") and its upstream tip were dropped
  because he had already jumped a bank, and "jump" was the lesson's move. The old game did the same. A first-time hazard or new
  thing is no longer dropped by a move made elsewhere (the double jump's own tip still is: doing it is learning it, QA v189).
- 1-7's acorn rooms say what the acorn is for, and that the long stretch needs one, without saying the move: "The squirrels' acorn
  tree, and that eagle!" and "Too far to run without an acorn." (QA 6's rule and Matt's no-spoiler rule, both kept).
- From the lead's list: World 7's lesson merge (lessonSaidBy and Pokey's bubble), A2's chirp as the bubble opens and GuideView.lostTo,
  World 6's first-time marks, the Help/Tips defaults, DOT-9, 13, 14, 15, 16 and 17.
- polish-c's guardian-card lines rewritten under Dot's rules: `src/game/bossCardLines.ts` (Pokey's own thought where Dot is away).
  BossCards.tsx should take its line from there when the two branches meet.

## Polish check

| What Matt will look at | Result | Proof |
|---|---|---|
| The floating "LOGS DRIFT! HOP ON AND RIDE" over Pokey at 2-1's first river | Gone; nothing written in the world | `shots/labels-2-1-before-after.jpg` |
| The ring around the log in 1-6 | Gone; she perches by the thing with a sparkle | `shots/ring-1-6-before-after.jpg`, `clips/1-6-*` |
| Dot's bubble on or crowding Pokey, sideways | Up and to the left, clear of him | `shots/river-2-1-sideways.jpg` |
| The same, upright | Above him with clear room. Before the fix it sat a hair over his head; fixed with 24 px of room | `shots/river-2-1-upright.jpg` |
| Upright, in the air and at a seesaw | Below him over the water while he flies; above the seesaw while he stands | `shots/1-6-upright-in-the-air.jpg`, `shots/1-6-upright-seesaw.jpg` |
| A room giving the answer on entry | None in Worlds 1-6 (test: `tools/inspect/dotRooms.test.ts`) | `clips/1-6-*-b-log-and-seesaws.mp4`, `clips/4-3-*-b-pools.mp4` |
| Nagging | Tips, Worlds 1-8: 0.06 to 1.55 lines a minute | tables above |

Rough spots, named plainly:
- **6-8's crown reveal is not clipped.** That stage is on `w6-stilt-climb`, not this branch. The reveal hold (her story aside steps
  aside while the camera pans, and comes back after) is in DotGuide.tsx and covers every stage with a camera reveal. It needs a look
  once the branches meet.
- **The clip bot jumps every second**, so a move tip like "Flick up when a log drifts close." closes after its minimum time on the
  clips (the river shot is that moment). A child standing at the river reads it until they jump.
- **Boss fight feedback still floats**: "TOO TOUGH! HIT THE GLOW" and "NOT YET!" over a boss's armour, and the score and hit pops.
  They are fight feedback, not Dot's lessons, so I left them. The guardian coaching is now in Dot's bubble too (DOT-16).
- **Help's busy spots** are listed above.

## Checks

`npx tsc --noEmit -p .` clean; the full suite (round 2, on the work branch at fac610c8 merged in) 1938 tests, 1936 pass, 0 fail, 2 to-do (the known 4-3 boulder item and one other); `npx vite build` clean, no asset over 4 MiB.
