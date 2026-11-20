# 2-5 River Snappers ("Count to Four"): the player lines, approved by the story keeper (KEEPER-25, written 5:13 PM ET 11-19)

Authority: Matt 11-13, "the storykeeper has full authority to add to the story and to approve all lines" (packet
reference/packets/2026-11-20/KEEPER-25.md). For 2-5's build (DESIGN-24-25; the design is origin/t-design-24 reference/design/2-5.md: the
arc :32-42, "First appearances" :46, "For the story keeper" :65). The snapper's rule is ENG-25b's (origin/t-eng-25b
src/game/predators/world2.ts TURTLE: `kick: { ends: 'chasedOff', when: 'open' }`, open = asleep, recovering right after its snap, or
dazed by a bonk; head-on at any other moment the kick glances off and he is bitten; REPORT.md "What the 2-5 builder needs" 1).
Checked on origin/main 6e7b85f8f: stagePlan.ts:70 (the 2-5 row), goalLine :197, SEALED_LINES :208, GOAL_WORDS :216, countWord :233;
engine.ts:3520 (the 'late' line), :3558 (the locked exit); hud/goalInfo.ts:120-145 (the purge card); journal.ts:30 (the turtle card);
journal.test.ts:31 (12-word tips, touch words); creatureLore.ts:12; pokeyJournal.ts:64; stageClue.ts:31; dotLinesData.ts:151, 152, 160,
161 (the old 2-5 rows); World 2's voice (lines-2-1.md, lines-2-2.md on main; lines-2-4.md on origin/t-keeper-24). Counts are `wc -w`.
Every speech line is under 10 words (STAGE-RULES §5b.7).

## The lines (verbatim; the builder copies these, a test holds them equal)

| Ask | Key | Who, where | Line | Words |
|---|---|---|---|---|
| 1 | `count` | Dot, THE teach, 800+ px before beat 1 (the one soft stone), on the arrival bank as the clack echoes | The stones bite on four! One, two, three, off! | 9 |
| 2 | `snapper` | Dot, teach, 800+ px before beat 2 (the sleeper on the sandbar) | Snappers are just grumpy. A kick sends them home! | 9 |
| 3 | `snap` | Dot, teach, 800+ px before beat 4 (the first AWAKE snapper, on the bank by the logs); the rule line | Awake ones? Stand back, let it snap, then kick! | 9 |
| 4 | `follow` | Dot, teach, 800+ px before beat 6 (the wave, Normal 5 stones, Easy 3) | The snaps run ahead now. Stay right behind them! | 9 |
| 5 | `quiet` | Dot, once, at beat 9 after the Big Snap, when the last snappers have dived and Pokey stands on the old mossy stone (he is still: the box covers no jump) | Shh. Hear that? Just the river again. | 7 |
| 6 | journal `turtle` | the Snapping Turtle card's tip (journal.ts:30, REPLACES "Head-on it hides. Flick sideways to kick the shell.", conflict 2) | Can't hide in its shell, so it snaps. Kick right after! | 11 |
| 7 | `mission` | the stage card (stagePlan.ts:70, REPLACES "Chase the snappers off the bank.") | The stones bite on four. Hop across and send the snappers home. | 12 |
| 8 | `sealed` | Dot at the locked exit: SEALED_LINES `'2:purge'` (2-5 is World 2's only purge, stagePlan.ts:65-74); said in place of goalLine's 'sealed' ("Sealed: defeat 2 more predators to open it"), the count beside it on the HUD | Some snappers are still back there. Send them home! | 9 |

Ids for the kit, as 2-1's and 2-4's: `w25.count`, `w25.snapper`, `w25.snap`, `w25.follow`, `w25.quiet`; MISSION_25 for the card;
`SEALED_LINES['2:purge']` held equal to the kit's SEALED_25 by a test. TEACH lines (said on Normal's default Tips as on Help, D50):
`count`, `snapper`, `snap`, `follow`.
Kept as they are (true for 2-5 and its new snapper): Pokey's page `'2-5'` (pokeyJournal.ts:64, "Snapping turtles. They snap. It says so
right in the name. I respected the honesty, and asked them to leave.") and the clue `'2-5'` (stageClue.ts:31, "The Raft"). Meeca's note
is 2-2's, not 2-5's. creatureLore.ts:12 (Matt-approved 11-01, "change them only with his OK") stays.

## Why each one, and its one-line check

1. **count.** The stage's one idea in the player's own words (the design's hook: "the one where the stones bite on four") and the count
   he says in his head ("One... two... three... OFF!", the design's beat 1 feel). True: the jaw opens a notch on one, two, three and
   claps on four (the count 0.75 s; the warn sits at the end of three, the bite is four), on both settings (Easy x1.5, the same four).
   "The stones", not "these": said 800 px early, the stone is not on screen. It counts to four as a rule, not a joke (VOICE: no jokes
   built on counting numbers). *Check: 9 words; no control word; no "wait", "slow", "late", "hurry", "too" (lines-2-1.md:29, lines-2-2.md:23).*
2. **snapper.** The design's "only grumpy" (World 2: nobody hurt; it paddles off huffy) and the one move that ends it, the kick (TURTLE
   `first: 'kick'`, the only `chasedOff`). True at beat 2: the sleeper is OPEN, so the plain kick cannot fail (ENG-25b 1). "Home",
   not "away" or "off": a child's word, and kinder. *Check: 9 words; "kick" is a move word.*
3. **snap.** The rule the packet asked to make plain, without the word "wait" (it stays out of Pokey's help, lines-2-2.md:23): "let it
   snap, then kick" IS the wait, in order. "Stand back" is the half a child needs to live through it: the snap reaches 46 px ahead
   (TURTLE act.reach) and it engages at 85, so from a step back the snap misses and the kick lands in the 0.75 s it recovers. "Awake
   ones?" turns line 2 (the sleeper took a plain kick) into the new case in two words. **Kick, not bonk (pushback on the ask's "bonk it
   right after it snaps"):** on ENG-25b's TURTLE the bonk (stomp) has no `when`: it dazes a snapper at ANY moment, so a line telling him to
   wait before the bonk teaches a wait that is not there, and leaves the move that DOES fail head-on (the kick) unexplained. The kick is
   what glances off; the line is about the kick. A bonk stays the player's own find (design beat 4's "Bonk! Off you go."). *Check: 9 words;
   true on the kit rule; said before beat 4, the first awake snapper (beat 2's is asleep).*
4. **follow.** The twist named the design's way ("Follow the snap!"): the wave runs AHEAD, so he goes behind it. It promises no timing
   it cannot keep (it does not say "hop on the one that just snapped": a stone stays shut 0.75 s after its clap and bites anyone who lands
   in it). True on Easy's 3-wave as on Normal's 5. The design never lays a wave that runs back at him ("never laid"), so "ahead" is
   always true. *Check: 9 words.*
5. **quiet.** The pay-off of a loud, counted stage: the clacks stop and the river's own sound comes back. Dot talks faster the slower
   the river gets (lines-2-1.md:6); here, for once, she whispers, and that is the beat. No joke, no button ending (VOICE). It leads into
   the design's exit feel ("Shhh"). *Check: 7 words; once; after the snap, when he stands still on the mossy stone.*
6. **turtle (journal).** Fact-checked (Nature check below). The first sentence is a real fact a child can repeat ("snapping turtles
   can't hide in their shells, so they snap"); the second is the new rule in three words. *Check: 11 words, journal.test.ts:31's cap; no
   press/key/button/space/arrow/click; true on the kit rule.*
7. **mission.** The stage's idea and its goal on one card. The old line is half true: the snappers sit on sandbars and logs as well as
   the bank, and it leaves out the stones, which ARE the stage. "Send ... home" agrees with the goal card (goalInfo.ts:122, "send 6
   turtles on their way") and with line 2. No count of snappers (the card has it). *Check: 12 words on a card (as 2-4's MISSION_24).*
8. **sealed.** STAGE-RULES:88: Dot explains any locked exit. Without this row 2-5's locked exit says goalLine's "Sealed: defeat 2 more
   predators to open it": "defeat" breaks World 2's rule (nobody hurt; they only paddle off). In the pattern of World 1's own (1-6
   "Petals still on the lianas! Back we go!"): what is missing, and where (the snappers he skipped are behind him on a left-to-right
   stage), and what to do. *Check: 9 words; the number is on the HUD beside it.*

## The story conflicts (for the lead and the builder; the keeper does not edit code)

1. **The 'late' line says "defeat".** engine.ts:3520 says goalLine('late') at 70% along when he is well short: for 2-5 that is "Still 2
   predators to defeat before the sanctuary opens" (GOAL_WORDS :227, purge = Defeat / predator). Approved fix, the words only:
   GOAL_WORDS(2, 'purge') = { verb: 'Chase off', one: 'snapper', many: 'snappers' }, so it reads "Still 2 snappers to chase off before the
   sanctuary opens"; and countWord(2, 'purge') = 'snappers', so the HUD counter agrees (stagePlan.ts:233 says "predators" today). World 2's
   only purge is 2-5, so nothing else moves. (An engine line: the lead routes it; the builder does level data only, level.md rule 22.)
2. **The journal card's tip is false on the new snapper** (journal.ts:30 "Head-on it hides. Flick sideways to kick the shell."): the kit
   snapper never hides; a head-on kick glances off. But the hand-built rivers' turtles still run predatorAI.ts turtleGuard (the hide), and
   ENG-25b says the new rule "reaches no live stage". So line 6 lands WITH the change that puts the new snapper where turtles are met
   (new replaces old, D40), not before: a card that lies about the live game is the D38 fault.
3. **The old 2-5 rows teach the old turtle** (dotLinesData.ts:151 float.shellHid "IT HID! GET BEHIND IT, OR KICK THE SHELL", :152
   hint.2-5.kick "Head-on, it hides. Kick the shell!", :160 hint.2-5.row "A row of snappers. Kick a shell into the others!", :161
   hint.2-5.snappers "Snappers! Hit one from behind, or jump on it."). On the kit 2-5 they are REPLACED by lines 2 and 3 and must not fire
   (one tip, one channel; two teaches for one snapper would contradict each other). They retire with the old 2-5 when the kit stage
   replaces it. ctest.turtles (:504, the testers' course) is not 2-5's and is left alone.
4. **"Turtles" on the card, "snappers" everywhere else.** The goal card names the cast kind (goalInfo.ts creatureNoun('turtle') ->
   "send 6 turtles on their way"). True (a snapper is a snapping turtle) and not a blocker; if the lead wants one word on screen, the
   cast kind's display word is the place, not these lines.

## Nature check: PASS
| Thing | Verdict |
|---|---|
| Snapping turtles can't hide in their shells, so they snap | TRUE. The plastron (under-shell) is small, so the head and legs cannot pull in, and they snap to defend themselves (Nature Conservancy of Canada, natureconservancy.ca featured species "Snapping turtle"; Toronto Zoo, torontozoo.com "Snapping turtle"). |
| Snappers in the water would rather leave than fight (the stage's "only grumpy, paddles off") | TRUE as typical: in the water they swim away and dive (Toronto Zoo); a bite is their defence out of the water. Not in a line; it backs the stage's tone. |
| A snapping turtle in a rainforest river | TRUE. The South American snapping turtle (Chelydra acutirostris) lives in rivers, streams and swamps of northwestern Colombia and Ecuador, sea level to about 600 m (reptilesofecuador.com, Chelydra acutirostris). |
| Turtles are never hurt | Kept: the kick ends it 'chasedOff' (it paddles off), the bonk dazes it; nothing in a line hurts one. |

## Learned (for the next keeper)
- Read the predator's `beatenBy` before writing a "how to beat it" line: the move that needs the wait is the one with `when`; a line about
  the other move teaches a wait the game does not have.
- A purge stage's locked exit and 'late' line come from generic goal words ("defeat ... predators"): every non-violent purge world needs
  its own SEALED_LINES row and GOAL_WORDS words, or Dot says "defeat" in a world where nobody is hurt.
