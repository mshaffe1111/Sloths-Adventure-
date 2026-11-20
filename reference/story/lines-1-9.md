# 1-9 The Boa's Branches: the player lines, approved by the story keeper (KEEPER-19, 11-18)

Authority: Matt 11-13, "the storykeeper has full authority to add to the story and to approve all lines" (packet KEEPER-19, written by
the lead 9:59 AM ET 11-18). For BUILD-19.
Read for this: reference/story/STORY-KEEPER.md (§2 the bible, §3 Dot's rules, §7 checks), the design (origin/t-pitch-b
reference/design/1-9.md: the beats table, "For the story keeper" :59-63, "Nature check" :81-85), 1-7's and 1-8's lines for voice
(lines-1-7.md, lines-1-8.md), the boa's kit (predators/world1.ts BOA: engage 150, beatenBy trap/lure/still/punch, fears eagle), the cast's
said keys (castPlay.types.ts:39: trap, punch, spared), W1_CAST_SAID (w1Cast.ts:98), the bots' read words (tools/inspect/firsttimer.ts
takeIn :1749), the goal words (stagePlan.ts goalLine / SEALED_LINES / GOAL_WORDS), the journals (journal.ts:28, creatureLore.ts:10,
pokeyJournal.ts:57), the banned words (whatsNew.test.ts:28 is What's New only; playerText.test.ts:35 BANNED). Word counts are `wc -w`.

## The lines (verbatim; the builder copies these, a test holds them equal)

| id | Key | Who, where | Line | Words |
|---|---|---|---|---|
| (a) | `boa` | Dot, teach, 800+ px before beat 1 (by the shed skin on arrival; nothing hurts in the first 1,300 px) | Boas only see wiggles. Still sloths look like branches! | 9 |
| (b) | `freeze` | Dot, THE freeze teach, 800+ px before beat 2 (the freeze, safe) | Boa rearing up? Don't move, and it slides off! | 9 |
| (c) | `miss` | Dot, teach, 800+ px before beat 5 (make it miss) | When a boa misses, punch its nose. Bop! | 8 |
| (d) | `nest` | Dot, teach, 800+ px before beat 7 (the roost; the twist: don't stop) | Eagle's nest! Boas bolt from it. So do we! | 9 |
| (e) | `eye` | Dot, teach, 800+ px before beat 12 (two hunters) | Eagle! Into the green. Its eye scares boas off! | 9 |
| (f) | `splash` | Dot, once, as the Old Boa hits the river and swims off (beat 14, the eagle's way only) | Splash! Off she swims in a big old huff. | 9 |
| (g) | `mark` | Dot, at her mark on the exit (beat 15; the river glints below) | Her mark! Her trail runs down to that river. | 9 |
| (h) | MISSION_19 | the stage card (stagePlan.ts:63 on main, replaces "Fight through the boa's guards and reach the shrine.") | Boas snap at anything that moves. Outsmart them, and collect her petals. | 12 |
| (i) | `sealed` | Dot, at a LOCKED exit (1-9's petal count; see "For the builder") | We passed some of her petals. Back we creep! | 9 |
| (j) | journal `boa` | the creature journal's boa entry (journal.ts:28 `tip`, replaces "Coiled and watching. Let it strike, then punch it three times.") | Senses warmth through its lips. A cool, still sloth seems like moss. | 12 |
| (k) | `said.trap` | Dot, once, the first time a boa is chased off (1-9's cast `said.trap`: beat 1's dropped load is the first) | Away she slithers. Not hurt, just terribly insulted! | 8 |

Plus one conflict settled (below): Pokey's journal page `'1-9'` (pokeyJournal.ts:57) is rewritten:
**`'1-9': "A boa looked me in the eye and decided I was a branch. I've been called worse.",`** (17 words, as 1-8's page).

## Why each one, and its one-line check

- **(a) boa.** The stage's one rule, said once and then only shown (the design's Oddworld lesson). "Wiggles" is a child's word for any movement and calls back 1-7's "No wiggling in a bush!". True of the kit's boa: a still sloth outside
  its 150 px is ignored for ever, and stillness in its rear sends it off (predators/world1.ts:45-47, "a still sloth is a branch to it").
  Not a move yet (no "freeze"), so (b) is still the one teach. *Check: 9 words, no control word, true in this stage (unlike the eagle in
  1-7, whose `seesStill` kept "only sees what moves" out of 1-7's text).*
- **(b) freeze.** The read (it rears up) and the move (don't move) and the reward (it slides off). **"Don't move", never "freeze" and never
  "hold still"** (see conflict 1). "Don't move" is one of the two phrases the packet names for the bots' takeIn. *Check: 9 words; holds
  "don't move" (straight apostrophe); no "hold"; true (beatenBy.still: flees 4 s).*
- **(c) miss.** Mario Bros.' window, in Dot's mouth: when it misses, its head is out (0.8 s), so punch it. "Punch" is 1-3's move word
  (and takeIn's `punch`); "Bop!" keeps it gentle (dazed 2.5 s, never hurt). *Check: 8 words; "punch" is a move word, not a control word
  (no tap); true (beatenBy.punch when 'open').*
- **(d) nest.** Says the two things the beat needs: boas run from the nest (the lure post, chased off for good) and so do WE, so he keeps
  going (the twist, "This time, DON'T stop"; the creaky limb under the boa) and never reads the eagle as a friend (it hunts sloths, 1-7).
  The eagle is not on screen at beat 7 (the cast has it in 12 and 14 only), so "Eagle's nest" names the snag. *Check: 9 words; not "Don't
  stop here" (w5Kit.ts:795 already says that); no "slow", "late", "hurry", "too".*
- **(e) eye.** Two hunters, one line: hide (1-7's "the green") and why that helps (its eye passing a boa chases it off, core.ts:221-236).
  "Into the green" also meets takeIn's hide words (green + into). *Check: 9 words; 1-7's move named with 1-7's word; nobody hurt (scares
  off).*
- **(f) splash.** The Old Boa is fine: she swims (boas do swim), she is cross, the end. "Big old" winks at "Old Boa" without a joke on
  numbers. Plays only on the eagle's way (on the freeze way she flees 4 s and there is no splash). *Check: 9 words; huffy and unhurt;
  "she" as creatureLore.ts:10's boa ("the whole tree hers").*
- **(g) mark.** Opens like 1-6, 1-7 and 1-8's exits ("Her mark!") so the trail sounds like one trail, then points at the river below
  (World 2, Sunlit Riverbank) and stops dead, as Dot does when it is real. It does not say "next": 1-10 (Venom Fang) still stands
  between. *Check: 9 words; Meeca leads (her mark, her trail); no promise the stage can't keep.*
- **(h) MISSION_19.** The old line names guards, fighting and a shrine; the design has none (the forest beats the boas; the goal is petals,
  1-9.md "Goal petals (the kit's count)"). New: the danger gently ("snap", not "hunt"), the stage's idea (outsmart, not fight), the goal
  in the HUD's verb ("Collect", GOAL_WORDS harvest), as 1-7's mission does. *Check: 12 words on a card (not a speech box, as 1-7/1-8's
  missions); no "defeat", no "guards", no "shrine".*
- **(i) sealed.** Dot explains the locked exit: we went past petals, go back. "Creep" is the stage's own expert move (tap in, it never
  rears in time), so the line hints how to go back past a boa safely. Distinct from 1-5 "We missed some of her marks", 1-6 "Back we go!",
  1-7 "Sneak back for them!". *Check: 9 words; going back is possible here (the boughs stay; unlike 1-8, whose exit never locks).*
- **(j) journal.** Fact-checked (below). Replaces a tip that is now untrue: the kit's boa is never punched three times; a punch dazes it
  (beatenBy.punch 'stunned' 2.5 s). "Moss" is the real look (the algae in his fur) and sits beside (a)'s "branches". *Check: 12 words, journal.test.ts:31's cap for tips (KEEPER-19b, 11-18: was 15); true; no "freeze"; no move
  that 1-9 doesn't have.*
- **(k) said.trap.** W1_CAST_SAID's voice (offended, unhurt) with its own words: the snakes' line is "Off he glides, not a scratch, just
  very offended!" (w1Cast.ts:98); the boa's must not repeat it. *Check: 8 words; once (castPlay.types.ts: `trap` said once); nobody hurt.*

## The story conflicts, settled

1. **"freeze" (the packet asks for "freeze" or "don't move"): "don't move" is the word.** The bible says the forest has "NO winter, freeze
   or snow, ever" (STORY-KEEPER.md §2, VOICE "What happened, in order"). The command "Freeze!" is not weather, but in a game that never
   once says freeze, the first time it appears should not be a teach a child will repeat. "Don't move" is plainer, is the design's own
   felt line for the Old Boa ("...don't... move", beat 14), and is the packet's other bot word. The code and design may keep calling the
   move "the freeze"; no player line does.
2. **The goal: gauntlet ("Defeat N predators") is wrong for 1-9.** stagePlan.ts:63 has 1-9 as `gauntlet`, whose goalLine words are "Defeat
   {n} predators to open the sanctuary" (GOAL_WORDS: purge/gauntlet), and dotLinesData.ts:129 `lock.ring.snakes` "Snakes from above!
   Clear them all to open the way". The design's goal is petals and no boa is ever defeated (chased off, dazed, or it flees). So 1-9's
   goal words must count petals or say nothing but (i); "defeat", "guards" and "shrine" never show in 1-9.
3. **Pokey's journal page `'1-9'` (pokeyJournal.ts:57): REWRITTEN.** "Fought the boa's guards all the way along his branches. They were
   only doing their job. So was I." tells a fight with guards that the new 1-9 never has. New (Pokey, past tense, deadpan, three beats,
   true to beat 2's "It looked right at me and thought I was a branch"): "A boa looked me in the eye and decided I was a branch.
   I've been called worse."
4. **The boa is "she".** creatureLore.ts:10 makes the boa a she who "considers the whole tree hers", which is this stage's name. (f) and
   (k) follow it. The snakes' W1_CAST_SAID stays "he".
5. **The eagle is no friend.** The design calls beat 7 "the eagle is on his side"; no line says so. (d) and (e) use the eagle's NEST and
   EYE, which boas fear, and (d) has us run from it too. 1-7's eagle still hunts sloths; nothing here softens it.

## Nature check (1-9.md "left for the story keeper"): PASS

| Thing | Verdict |
|---|---|
| A boa lying in wait on a bough | REAL: boa constrictors are ambush predators that wait for prey to come along (Wikipedia, Boa constrictor) |
| "Senses warmth through its lips" (j) | REAL: boas "can sense heat via cells in their lips" (same page) |
| "A cool, still sloth" (j) | REAL: sloths run a low, variable body temperature for a mammal, and their fur carries green algae (Brown-throated sloth) |
| "Seems like moss" (j), "only see wiggles" (a) | storybook, built on the two facts above; fine for a storybook forest and true of the game's boa |
| Boas wary of the harpy eagle (d, e) | fair: harpies take snakes as well as sloths (Wikipedia, Harpy eagle); a nest that scares a boa off is storybook |
| The Old Boa swims off (f) | REAL: boas swim |
| Nobody hurt | HOLDS: every boa slithers, flees, is dazed or swims; no line says anything is caught or eaten |

## Checked against the rules

- Speech boxes 8-9 words (`wc -w`), under 10 (STAGE-RULES §5b.7, R-165.260); the mission 12 (a card); the journal tip 12 (journal.test.ts:31 caps tips at 12), Pokey's page 17.
- Banned words: none of playerText BANNED; no "slow", "late", "hurry" or "too" (the General's wound). "Branch" is banned in What's New
  only (whatsNew.test.ts:28); it is the stage's own name word.
- No control words: no tap, press, swipe, flick, button, hold, duck, crouch, slide down. "Punch" (1-3), "creep" (the stage's move).
- Repeats: grepped src/ on origin/main (6e7b85f8f) for "only see wiggles", "look like branches", "rearing up", "punch its nose", "Eagle's
  nest", "bolt from", "Into the green", "scares boas", "big old huff", "trail runs", "snap at anything", "Outsmart", "Back we creep",
  "warmth through", "insulted", "called worse", "Don't move": no player line uses them (hits are code comments only).
- World 1 has no made things in any line; Dot is she; Meeca leads (her mark, her trail, her petals).
- One tip, one channel: each teach plays once, before its beat; (a) states the rule, (b) is the only move teach for stillness.

## For the builder and the lead (code, not words; the keeper does not edit code)

- **New replaces old when 1-9 ships:** dotLinesData.ts:114 `hint.1-9.guard` ("A guard! ... tap to punch it", a guard and a control word),
  :129 `lock.ring.snakes` (the gauntlet's ring), stagePlan.ts:63's mission (h), journal.ts:28's boa tip (j), pokeyJournal.ts:57 (conflict
  3). `way.1-9` (dotLinesData.ts:143) and the stage clue (stageClue.ts:24 "Coiled Branches") stay.
- **The locked exit (i):** SEALED_LINES is keyed `world:type` (stagePlan.ts:208). If 1-9 stays `gauntlet` with `gathers: 'petals'`, the
  key '1:gauntlet' is 1-9's alone in World 1 (safe), but goalLine must not say "Defeat ... predators" for it (conflict 2). If 1-9 takes
  another type, key (i) to 1-9 alone. Without a petal count the exit never locks and (i) is not needed.
- **(k)** goes in 1-9's own cast `said.trap` (it overrides W1_CAST_SAID's snake line for this stage). **(f)** needs a hook when the
  eagle's eye chases off the Old Boa (the splash), not on the freeze way.
- **Bots:** (b) holds "don't move"; takeIn (firsttimer.ts:1766) reads `still` only from "stand/stay/keep still", so BUILD-19 adds
  "don't move" (and "freeze", for code) as the packet says. (c) holds "punch"; (e) holds "green" + "into" (takeIn's hide).
- The lines live in one object (LINES_19, MISSION_19, SEALED_19) in 1-9's world file (w1Arc19.ts) with a verbatim test, as w1Arc17.ts
  and w1Arc18.ts hold theirs.
