# The lead's picks for 1-9, 2-1, 2-2 (pitch round PITCH-19-22, reference/methods/pitch.md step 5). Decided 7:30 PM ET 11-14.
Sources: reference/design/pitches/PITCH-A.md (origin/t-pitch-a, high) and PITCH-B.md (origin/t-pitch-b, xhigh), written blind to each other.

## 1-9 The Boa's Branches: MERGE, "Be the bait"
Both pitchers reached the same idea on their own: the boa strikes at movement, so Pokey makes it strike where HE chooses. Taken:
- From A: three answers per boa (drop trap, bait it beside the eagle's roost, the long stare: thumb off the glass), and the finale where he
  lets 1-7's eagle see him by the Old Boa, hides in moss, and the eagle's pass chases the boa into the river (nobody eaten). Dropping
  GAME-MAP's "the boa copies your path" (the boa never walks, world1.ts:53; C1 is 4-12 h for one level).
- From B: the punish window (a missed strike leaves its head out 0.8 s, a punch dazes it: Mario Bros.' "make it helpless first, and the
  window closes"), and the freeze moment in slow motion when a boa is beaten by stillness inside its reach.
- Tributes: **Mario Bros.** (arcade 1983; Matt's own favourite on the Atari 7800: the pre-1990 classic), **Oddworld: Abe's Oddysee** (1997,
  lesser-known: one creature with one readable rule, set against another), **Limbo** (2010, lesser-known: a hunter beaten by the world,
  not a weapon). No famous-few game needed. Our own idea: the stillness that hid him in 1-7 becomes the move that beats a hunter.
- Normal **9.5** (DIFFICULTY.md:61), Easy about 5.5. B's warning holds: the Normal freeze window may be only 0.30 s (0.8 s rear minus 0.5 s to
  go still): FLY it on the real engine before laying; widen the rear, not the rule, if it's unfair.
- Engine (R-165.257): boa rows in World 1's cast (data); the eagle's roost as a lure row (lureLay.ts wired, S); the freeze slow motion (S);
  bot skills bait / freeze / punch a missed strike on a planted toy. Art: the roost (a dead snag with a nest), from the inventory or one HF job.

## 2-1 Down to the River: B, with A's fact
- B's "the river is your road": swing down out of the canopy, wait for a log, ride it, step off; the river's knock sets the beat.
- A's code fact wins over the map line: the bank takes him (engine.ts:1847-1852), so the danger is the WATER between logs, not "the reeds".
  Reeds end a log's run as scenery and a cue, not a hazard, unless the engine member makes them one for every river (then it's a piece).
- Tributes: **Frogger** (1981, the pre-1990 classic; Matt named it, MAP-REVISIONS §7), **Jungle Hunt** (1983, lesser-known: the river leg
  between vine legs), **Bit.Trip Runner** (2010, lesser-known: the beat). Sonic (A's) dropped for B's Frogger.
- Normal **9.0** PROPOSED (A: World 2's band floor, just under 1-9's 9.5; the slot formula's 9.5 would tie 1-9), Easy about 5.4.
- Engine (R-165.256): the World 2 gen2 kit, then the river as a gen2 section (riverLay.ts), log ride + step-off bot skill.

## 2-2 Petals for the Crown: A, "The pond breathes", with B's greed
- A's idea: pads sink while he stands and RISE after he leaves (ride.ts:22-23, 100-110), so the pond breathes; there-and-back waiting, a
  twist where a row sinks on the pond's beat, a giant crown lily that holds (Victoria amazonica, a real plant). B's 12+ bite added: extra
  flowers on the smallest pads. "World 1 taught stillness saves him; 2-2 is the first place stillness sinks him" (B) is the hook.
- Tributes: **Wonder Boy** (1986, classic and lesser-known: each pad a draining meter, never the whole level), **Super Mario Bros. 3**'s donut
  lifts (the one famous game), and ONE lesser-known pick from PLATFORMER-100-MATT.md by the final designer (Frogger is 2-1's).
- Normal **12.5** PROPOSED (A: the slot formula's step on 9.0), Easy about 7.5.
- Engine: sinking pads in play + a rideLay pad row (M), beat pads (S, beatBrick), the crown lily (S + art).
- Engine-worthy (B): flowerReach.ts:139 never places a petal on pads or logs; World 2 needs it. Goes to the World 2 engine member.

## Next
One designer writes reference/design/1-9.md, 2-1.md and 2-2.md from these picks (1-9 first: its engine starts as soon as its node list is
final). The story keeper writes the lines. 1-9's engine packet starts in the next free engine slot; 2-1/2-2 sections follow ENG-W2's kit.

## Story keeper rulings on 2-1 / 2-2 (7:53 PM ET; lines APPROVED on t-story@50da9e58, lines-2-1.md and lines-2-2.md)
World 2's voice: the river is in no hurry; Dot talks faster the slower things get. Builders apply these (canon, not taste):
1. The village is DUG INTO the bank with PLEASE BE PATIENT doors, never stilt houses (2-1's end; World 2 kit art).
2. Meeca spent her petals on the king's crown: 2-1's petals are FEW, and 2-2's crown flowers are the pond's own (lavender water hyacinth,
   the lily's white), never pink.
3. 2-2 is World 2's note stage: Meeca's note is laid (at w2_note, past the 2nd flag).
4. The World 2 arrival scene plays at 2-1's village gate (it is set in the village), not on arriving in the world.
Look (nature check PASS): the counter-flow is an eddy channel by an islet; the bounce is a bent Guadua bamboo or palm frond (no mushroom in
World 2); the heron is a cocoi heron. Pads never say "don't stop / be still" (that's World 5's lesson).
