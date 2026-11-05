# World 1 rebuild, stages 1-1 to 1-5 (lead's design, 2026-11-04; Matt: "get 1 through 5 so I can play through multiple... if we
can get 5 levels to feel different and have it where the testers can actually go out there and test the new thing, where they're
seeing the new rhythm too")

Source: research 11-04 (reference/research/MATT-RESEARCH-2026-11-04-full.txt): BPM and beat map (line 522), tension curve (line 531),
map shapes (line 596), beat-traced nodes (line 598), 200 px aprons and node checkpoints (lines 602-603); STAGE-RULES §0b and §0c;
the quality supervisor's baseline (reference/qa-reports/world1-baseline.md: "World 1 is one stage played six times"). The research
ledgers (reference/research/ledger/) may add to this; the lead folds them in about 2:30 PM ET.

## The beat is the music's beat (lead, checked in code 2026-11-04)
The player hears each stage's own music, so the beat the moves fall on IS that music's beat, not a number we invent. World 1's music
runs at about 123-134 BPM (src/audio/styles.ts world 1 bpm [126,134]; each stage's exact tempo comes from `stageMusic()` in
src/audio/scenes.ts and `themeById(...).bpm * tempo`). Never type a stage's BPM: read it from `stageBpm` / `stageBeatBpm` (beatTrace.ts, scenes.ts), the one source; the music now plays at that beat whatever the session's salt (w1-rhythm, BEAT_STAGES). At 130 BPM a quarter note is
0.46 s, a half 0.92 s, a whole 1.85 s; Pokey's jump is in the air 0.63 s (physics.ts JUMP_AIRTIME), so a hop fits a half note with a
step of running between. The stages differ by WHICH note values their moves fall on (the "feel" Matt calls dance / flow / rock),
not by the music's speed. beatTrace takes the stage's real BPM from stageMusic, never a typed number. (The research's example BPMs
were for its own idea of each world; ours are set by the music, and the ledger records that.)

## What makes the five differ (each row must differ from every other row in at least four columns)

| Stage | Job (slot) | Map shape | Moves fall on (music ~130 BPM) | Beat feel | Main pair | Look | Signature moment |
|---|---|---|---|---|---|---|---|
| 1-1 Into the Canopy | arrival, teach run/jump/double | linear wave that RISES from the forest floor to the high kapok branches (the name finally true) | half notes (a hop every ~0.92 s) | steady: on the beat, like a march (but never the same gap 4 times running) | run + jump, then double jump | floor -> canopy; the backdrop changes with height | the first double-jump chain up into the canopy, then the view from the top branch |
| 1-2 The Petal Trail | teach the world's thing: vines | over-under loop-back: out along the top on vines, back underneath along the roots | dotted half + quarter (long-short) | swung: swing... land-hop | jump + vine swing | canopy vines, then the dim root level | swinging out over the drop, then seeing the root path you'll come back along |
| 1-3 Branch Snakes | tight terrain + the combat teach | high/low split: high road with snakes and the vault, low road safer and slower | half-note hops, hits on the quarter between | off-beat: punches and stomps land between the hops | combat triangle (stomp vault, punch daze, kick) + snakes | mid-canopy, snake country | the first stomp-vault over a gap (w8-rope2's taught vault) |
| 1-4 Up the Kapok | change of direction: the climb | vertical chimney (kept), the repeated top half rebuilt | whole notes and whole-bar waits (~1.85 s) | wait-and-go, the slowest stage: slow deliberate climbs, waits for the squirrel lift and rope timing | climb + creaking limbs (taught here, 0.6 s to recover) | trunk and sky | the squirrel lift, then the crown with the view over the canopy |
| 1-5 Where She Walked | mid-world spike | a trail: Meeca's carvings lead, closer and closer together, the fastest stage so far | quarters and half notes mixed, the busiest | broken: uneven gaps you read on the run, the fastest stage | snap twigs (required, keep running) over real pits; vines only as its counter-melody (1-2 owns vines) | dusk trail, carvings glowing | the carving chase: marks closer together, the run speeding up into the last stretch |

## Every stage has the research's tension curve (6-8 nodes, line 531), but not the same curve
intro (1 action every 2.5 s, safe) -> ramp (1 every 1.2 s) -> spike (the stage's hardest burst) -> rest (no action; Dot's line;
the collectible teased in sight or by sound) -> counter-melody (a different pair from the stage's main one) -> climax (everything the
stage taught, densest) -> cool-down (a slide or easy glide to the exit). Checkpoint at every node's entrance on a 200 px safe apron.
Every stage has all seven parts, but no two stages place them the same way (the ledger, 11-04 part 2: a fixed curve is itself a
pattern the player feels): where the spike sits, how long the rest is, and which pair the counter-melody brings must differ from the
stage before. The research's own numbers stand: the intro at 1 action every 2.5 s (0.4 a second), the ramp at 1 every 1.2 s, and
a node fails if the same jump gap repeats four times in a row (11-04 line 585).

## Rules for the build (no exceptions)
- No `fillTo()` padding. Length comes from the nodes. **Matt, 2026-11-04: "We need to hold levels to 2 or 2.5 minimum play like i was playing"**: a skilled player playing like Matt (straight through, no deaths, the quick route) takes at least 2:00 on every stage, target 2:30, measured on the validator's quick-route clock AND the adult bot's fastest run; a first-timer on Normal 3-5 min.
- Platforms, vines and branches in flow and tight nodes sit where Pokey's feet land when he jumps on the stage's beat
  (`src/game/beatTrace.ts`, w1-rhythm). A tester should be able to tap along.
- Hazards go on the line the player avoided (research 11-04 line 59, checked by the lead): where the traced run says short-hop or
  duck, a hazard (thorn overhang, snapping snake, pit) sits on the other line, so holding right or skipping the beat costs you.
  This is the direct fix for Matt's "you can outrun them every time".
- **Petals and goal pickups live on the way everyone takes (Matt, 2026-11-04: "make sure that too many petals arent on split
  areas. Keep the core amount on places that the player always have to use.")**: the goal's count must be reachable from the
  shared path alone (the parts every route crosses). Split roads (high/low, side branches, the loop's tiers a route can skip) carry
  only a small bonus, about the same on each road. Goals are set from the fixed bot at about 75% of the total.
  **The split (Matt, 2026-11-04: "do a 70/30 split... 15 of the 30% and 70% would be on the main area. That way the split still
  matters and create replayability")**: 70% of the pickups on the shared path, 15% on each road of a split (or across a stage's
  optional areas). One play down either road reaches 85%, so the goal (about 75%) is always reachable; all 100% takes both roads,
  which is the reason to replay. Tested as math on every roll and setting: goal <= shared path + the smaller road - 5%.
- One named pair per stage, acting ON THE SAME BEAT (11-02 report lines 5, 21-54, 61): "a pair" means the two mechanics meet in
  one move (swing from a vine onto a snapping twig), not both somewhere in the stage. Neighbouring stages never share their pair.
- The twist breaks the rhythm the player just learned (11-02 line 69): the twist node changes the note value (e.g. 1-1's steady
  half notes turn into an off-beat double-jump catch).
- Density climbs through the stage (11-02 lines 65-69): intro groups 5-10 s low, the middle 10-15 s medium, the finale 15-20 s
  high and dense, ending AT the exit (the cool-down is a few seconds, not a walk). fix-petals lets the validator's tight-stretch
  limit (TIGHT_MAX, core.ts) allow the finale's 15-20 s.
- **Long falls hurt (Matt, 2026-11-04: "make long fall hurt")**: landing after a free fall of more than 400 px costs a heart on Normal (a stumble, no heart, on Easy); not while gliding, swinging, on a lift or bouncing. On for 1-1 to 1-5 tonight (w1-rhythm-b, with fallZones); other worlds as they are rebuilt.
- No dead walk over 2.5 s (11-04 line 100): fix it with a slope, a hop or a critter, never just flag it.
- Something bites from 1-1's climax on (pits on Normal, soft on Easy where STAGE-RULES says; Easy stays a cruise).
- Petals and pickups never count as variety (§0c.5). The goal sits on the natural path (D8).
- No two neighbouring stages share a map shape, tempo or beat feel; the validator's "like the stage before" flags for 1-1 to 1-5
  must fall, and funknown.json is lowered.
- Existing World 1 art only today; no Hugging Face spend without Matt's OK on a picture list.
- Each builder sends the lead its stage plan (node table + a top-down layout still) BEFORE wiring, then stills upright and sideways,
  and the quality supervisor records 1-1 -> 1-5 in order on the candidate.

## Who builds what (tonight)
- w1-rhythm: `beatTrace.ts` (pushed first, the others use it), then 1-2 and 1-5.
- w1-rhythm-b (new): 1-1 and 1-4.
- w8-rope2: 1-3, around its accepted R-159.1 combat teach.
- fix-petals: pits (R-6.38) feed all five; the validator reads each node's BPM and beat feel.
- quality supervisor: judges each plan, then the in-order recording 1-1 -> 1-5.
- Lead: approves each plan against this table, shows Matt the five layouts before wiring, builds the release.

Ledgers: all three are in (11-04 part 1, 11-04 part 2, 11-02 full report) (reference/research/ledger/LEDGER-2026-11-04-part2.md); part 1 and the 11-02 report follow.

Timeline (ET): beatTrace pushed about 2:15; all five plans to the lead about 3:00; shown to Matt about 3:15; built and gated about
6:30; in-order recording and lead's look about 7:15; release PR to Matt about 8:00. A stage not at the polish bar by then is named
to Matt and held back, never shipped rough.
