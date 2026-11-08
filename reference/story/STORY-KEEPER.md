# Story keeper: the story, its voices, Matt's taste and the open threads (the supervisor, 2026-11-07)

> **Matt, 11-07 8:17 PM ET:** "I'm creating a new lead and will be continually replacing as memory fills up. The only written role is you are
> always on the team and can't be replaced, in charge of story direction." Leads rotate; the story keeper is the constant. Every new lead's
> first message comes here. The keeper briefs it on the story, Matt's taste and the traps, and keeps this file current as the turnover note.

The story keeper (this session, session_019iachLiuwNTAZUBSJWUmR3) answers story, dialogue, player-text and taste calls for the lead.
This page protects that knowledge from memory compression. Read it first, then the sources it points to. Every claim cites its source.
When a source and this page disagree, the source wins; fix this page.

## 1. Where the story lives (read these, in this order)

| What | File | Note |
|---|---|---|
| The voice rulebook: who talks how, the facts in order, the boss-fight direction, still-open items | `reference/VOICE.md` | read before touching any line (VOICE:1-3) |
| The whole rewrite, all 10 worlds plus the ending and the continuity pass | `reference/STORY-REWRITE.md` (1,912 lines) | one world at a time, Matt reads each (:3) |
| The newer pilot: Prologue + World 1, as rewritten with Matt | `reference/story-rewrite/pilot-prologue-w1-v2.md` (+ .docx) | the 1-1 and 1-2 story briefs cite it |
| Acts as Word docs | `reference/story-rewrite/act1-w2-w3.docx`, `act2-w4-w7.docx`, `act3-w8-w10-ending.docx`, `direction.docx` | |
| A beat every three stages, world by world | `reference/story-gaps/GAP-MAP.md` | Matt approved the rule (GAP-MAP:5-6) |
| How scenes play (fades, camera, beats, typing pace per voice) | `reference/story-delivery/DIRECTION.md`, generated from `src/game/storyDirect.ts` | the code and the sheet can't disagree |
| Dot's piece lines (W1-4, 9, 10 grab bags) | `reference/DOT-LINES-2026-10-31.md` | under 10 words; plays the first time a piece appears |
| Story review, Oct 27 | `reference/STORY-REVIEW-2026-10-27.md` | |
| Stage story briefs (story and look per stage, never layout) | `reference/engine/story-briefs/1-1.md`, `1-2.md`; the feel brief `reference/engine/BRIEF-1-2.md` | |
| Cast Bible / Story Plan / Story Reader (artifacts) | https://claude.ai/artifact/Ac5U5PnWQgjpjpCo6kxDbS · https://claude.ai/artifact/9KxHMAVgpE9y1CCWFxTSoY · https://claude.ai/artifact/8vVrhUhQUSzC7VqYE4eQcz | HANDOFF:20, :23; the Cast Bible still needs the fixes in §6 |
| **In the game (the code is the truth for what ships)** | `src/game/storyIntro.ts` (prologue), `storyWorlds.ts` (arrivals, WORLD_MID), `midScene.ts`, `storyBosses.ts`, `storyChapters.ts` (AFTER_BOSS memories), `wayside.ts` (one aside per stage), `finds.ts` (Meeca's note `w{N}_note`, keepsakes), `dotLinesData.ts` (every Dot, coach, hint and wayside line), `src/components/stageClue.ts` (the Stage Cleared clues), `pokeyJournal.ts`, `stagePlan.ts` (each world's ten stages), `whatsNew.ts` (release text) | GAP-MAP:22-31 maps where each plays |

## 2. The story bible, in brief

**The world.** A tropical rainforest with a rainy and a dry season, and NO winter, freeze or snow, ever (VOICE "What happened, in order").
Ten realms lie between Pokey and the Highland Fortress; each has a guardian, and every guardian answers to the General (STORY-REWRITE:13).

**The worlds and their guardians** (STORY-REWRITE headings):

| World | Guardian |
|---|---|
| 1 Emerald Canopy | Venom Fang (a bored bouncer; drawls; has a list) |
| 2 Sunlit Riverbank | Crocus Rex |
| 3 Mossy Grotto | Shadow Prowler |
| 4 Mist Cascades | Sky Sovereign (the eagle: "I am never on the ground") |
| 5 Orchid Sanctuary | Tarantula Queen (calls people "darling"; tea at four) |
| 6 Deep Mangrove | Marsh Reaver |
| 7 Ancient Ruins | Stone Idol Golem (can't finish a sentence) |
| 8 Twilight Treetops | Night-Wing Monarch |
| 9 Volcanic Jungle | Magma Drake |
| 10 Stormy Highlands Fortress | General Iron-Claw |
| secret | Thornbark (the tenth council member, who said no) |

**What happened, in order** (VOICE "What happened, in order"; the facts every line must agree with):
- When Pokey was a cub, his parents went out along the far branches in a storm and never came back. Dot was meant to fly the warning
  round the nests; she went down the wrong river and was LATE. Nobody told Pokey anything but "it was a storm."
- Meeca was raised by Grandma and Grandpa in the house with the garden. Grandma kept the Heartbloom for fifty years. Grandpa was
  Iron-Claw, head of the forest's council of ten.
- Ten years before the game, Pokey knocked on their door. Grandpa timed him up the path (fourteen minutes): "Come back when you can
  protect her."
- Then the storm came, and Grandma died in it. The help came late. After the funeral Grandpa sat by her chair for a year, home but not
  there, while Meeca kept the house warm.
- Nine years before the game, the door stood open and his chair was empty. Meeca believes he left her. In truth he went to each council
  member at night with one bargain, "no more waiting, no more late." Nine said yes; Thornbark said no, and the thorns grew through him.
- The Heartbloom hasn't opened for Meeca since Grandma died. The morning the game starts, it begins to open, and the General comes for
  the keeper. He calls her "little bloom", the family's name. To Pokey he says "He's too slow. He was always too slow," and Pokey
  carries that line the whole game (VOICE "General Iron-Claw").
- Meeca is taken to a tower in the north, inside a net of iron thorns, with one gap "about as wide as a folded letter", "Shut by the
  first storm" (story-briefs/1-2.md:10-11). As she is taken she gives Pokey a job: "Follow the petals!" (VOICE "Meeca").
- **The ending** (STORY-REWRITE:1647-1866): Pokey, who holds on to things when it thunders, lets go with one hand and holds it out to the
  beaten General. Dot confesses, voice dropping: "I was late, Pokey. For them." Grandma's letter says "It isn't anybody's fault, my love.
  It was only weather" (Pokey has said "It's only weather" all game to hide being scared). The General sits in the chair the Queen
  dusted for nine years and finishes the cup. They climb to the old tree on the hill; the General goes up last ("Hello, love. I'm late.
  I brought the whole family."). At home the Heartbloom is open, and the snail who set off the morning Meeca was taken is half an inch
  from the finish line. "Of course he made it. He trained for it."

**The people** (VOICE "The people" and the pilot's table, pilot-prologue-w1-v2.md:25-39):

| Who | Voice | Never |
|---|---|---|
| **Pokey**, a slow sloth | Matt: "a slow smart-ass." Low, slow, deadpan about himself, kind, polite. Jokes when he should say the true thing; when something is real, the joke doesn't come. Scared, he holds on with both hands. After the kidnapping he thinks it's his fault for being slow; everything is "I have to save her." | gives speeches; panics |
| **Meeca**, the keeper of the Heartbloom | Quick, bright, a bossy good host; thanks everyone, even her jailers; says sorry to doors. Never a damsel: indignant, not scared ("You're standing in my garden"). In the tower she works out who the General is from small things (the soup made wrong, eleven steps outside her door, a blanket). | says no (until the very end of the game) |
| **Dot**, a hummingbird courier (SHE) | Loud, fast, run-on sentences that interrupt themselves, explanations nobody asked for, louder as she winds up, then dead stop when something is real. A second mother: asks if he's eaten. Always late, terrified of being late (the secret of the storm). | short, neat sentences |
| **General Iron-Claw** (Grandpa) | Short, formal, heavy. Calls himself "the General", never "I". Counts out loud (counting makes a loss feel like a plan). Takes everything literally. | jokes; says sorry (until the very end) |
| **Grandma** | Only in memories, her letter, once maybe in the rain. Gentle, dry, specific. "Dear." "My love." Teaches with a fern or a kettle, never a speech. | |
| **Lieutenant Pell** | Over-polite, apologizes inside his own sentences, corrects himself mid-order. Brings blankets ("It is not from the General"). Ends up opening a tailor's shop with a crooked sign he apologizes to. | uses a contraction, ever |
| **The narrator** | Plain, warm, past tense; says only what the picture can't; at most one dry aside a scene. | tells jokes (they belong to the cast); morals; "little did he know" |
| Others | the squirrels (THE SLOTH sign, "I'll write"); Gruntlewick the crier (a flood warning five months long); Flicker (with Pokey from 6-6 to the gate; given in-play lines by the gap map, GAP-MAP:43-45); the snail | |

**The bosses** (VOICE "Boss fights", Matt's direction): each guardian looks at Pokey and can't believe THIS is what came to fight them.
Pokey tells them flat out he's here to save Meeca. Every boss that thinks "too slow" and loses proves the General wrong once more. It
changes across the game: early bosses laugh (never heard of him), the middle ones have heard rumours and don't believe them, the late
ones know. After losing, each softens on their own (a clue, the itchy collar, the small thing they wanted), not because Pokey is nice.
Each loses in their own voice (STORY-REWRITE:1900). No Pokey apologies in boss fights (VOICE "Things the prologue changes").

**The finds and the journal** (GAP-MAP:17-31; STORY-REWRITE world sections):
- Meeca's note: in plain sight in stage 2 of every world (`finds.ts` `w{N}_note`). It counts as a story beat. Later, Dot leaves six notes
  "where he'll find them by accident" (W6, W8, W9), and three in the satchel (W10).
- Hidden keepsakes: one a world; W3's ferns hold Grandma's locket, rattle, teddy and bell (the bell is the finale's last keepsake). At the
  tea table in the ending, keepsake lines play only for the ones the player found.
- Hidden photo albums, one a world (The Young Scholar, The Hero of the River... The Last Pages): the family's history, the General's
  photograph in W7.
- The General's ledger, page one: a hidden collectable that ships with Act I (pilot :569).
- Pokey's journal page after each guardian (`pokeyJournal.ts`), in his voice ("a slow smart-ass").
- Stage Cleared clues (`stageClue.ts`), e.g. 1-1 "A Bootprint: One deep bootprint in the moss, pointing north. They did not stop here."
  (:16) and 1-2 "Low on the Bark" (:17).
- Finds are a bonus layer and don't count as beats; a player can miss them (GAP-MAP:14-16).

## 3. Dot's rules (in play, in scenes)

- Dot is SHE, everywhere (VOICE "Things the prologue changes").
- In play: no pointer, ring or arrow; no repeated tips; story at rest points, never instructions (PARTNER "The little pieces").
  Coaching lines (coach.run, coach.jump, coach.nice) and approved stage hints are the exceptions, and each plays once, before the move it
  teaches (W1-NEW-SECTIONS Round 7 TT1-TT4).
- Only approved rows: the lead decides Dot and in-stage lines, find hints and stage text (PARTNER "Who decides what"); words come from
  `dotLinesData.ts`. Never new words from a builder. Check "shipped" claims against origin/main, never a working branch (D43).
- One tip, one channel: if a lesson card already teaches a move (e.g. `lesson.bounce`, dotLinesData.ts:16 on main), a Dot hint saying
  the same thing is a repeated tip (supervisor, 11-06).
- A "Dot spot" at a rest is a PLACE; a line goes there only if an approved one fits.
- Piece lines: under 10 words; in 10-1 to 10-5 Pokey says them (Dot is away) (DOT-LINES:3).
- Her voice: run-ons are her character, but on a phone they get pages, not a smaller box (DIRECTION.md 4); 22 ms a letter, the fastest
  (DIRECTION rules).
- She asks if he's eaten only where things are calm (VOICE "Things the prologue changes").

## 4. Matt's taste calls on story (his words where recorded)

- The bar: a Pixar film kids and adults both enjoy. A scene between levels runs under 30 seconds (pilot :13, :19).
- "Why is this being said, by this character, right now?" A line written "to be funny, to explain the plot, or to end the scene neatly"
  isn't finished (VOICE "The one question").
- Real speech is loose; every joke needs its setup in the scene; no tidy button endings; no jokes built on counting numbers (VOICE).
- After Meeca is taken, nobody thinks about snacks or eating; a joke in tension only if it's in character (VOICE). (Two food mentions are
  left for Matt: §6.)
- Plain American speech: "mail", not "post"; no courtroom or British turns; no romantic pet names (Dot is family); capitals only for a
  real shout (VOICE).
- Pokey is "a slow smart-ass" (Matt, 11-01) (VOICE "Pokey").
- Bosses can't believe a sloth came (Matt's direction, VOICE "Boss fights").
- A story beat at the start, middle and end of every world, and never more than about three stages without one (GAP-MAP:5-6).
- 10-6: Dot and Flicker guide him together ("as Matt decided", GAP-MAP:46-48).
- Journal and finds polish: no filler lines in the Journal, no identical find hints, and medal totals never count unreleased worlds (what
  slipped on 11-01, PARTNER first rule).
- Text: no placeholder or arcade words, nothing under the notch, nothing covering Pokey (PARTNER "The little pieces").
- Stage looks follow the story, and no two stages share one look (Matt 11-05, PARTNER "The lead's story role": "last time it was 90%
  branches that were tied to trees").
- In play: rocks, earth, pads and props never float; anything Pokey walks on may (Matt 11-05 10:39 AM and 11-06; MATT-DIRECTION).
  Story pieces must stand on something too (the bootprint flush in the moss; the pink bell on its plant).
- A kids' game: content that reads grim (bones in soil) is out (art director 11-06). A "no skulls" rule is claimed, but no source is
  found in the repo; Matt's own 7-4 concept has a skull WARNING SIGN ("skull sign and TURN BACK", 7-4-slide-mockup/v2/README.md:56). Ask
  him before a blanket ban.

## 5. Each World 1 stage owns its beat (keep out of the others)

From the story briefs (1-1.md:38-43; 1-2.md:36-43):

| Stage | Owns |
|---|---|
| 1-1 | the squirrels, the first petal, the bootprint (soldiers' boot, toe pointing onward = north), morning light, the floor rising into the canopy, the double chain, the golden seed, a quiet end "up in the high branches" |
| 1-2 The Petal Trail | Meeca's note by the pink bell, rain starting, the darker north, the roots and the low road, the iron-collared snake's comic jolt, choosing high or low, the "pink, pink, hibiscus" near miss |
| 1-3 | Dot's "excuse me", the punch and the combat teach; rope |
| 1-4 | the kapok climb, "Meeca climbs this every Sunday", the view north |
| 1-5 | the folded petals ("She's making them last"), the trail chase, creaky limbs; in the engine, Meeca's marks |
| 1-6 / 1-7 | lianas and the vine snakes / the bush ("Was it a nice bush?") |

Petals are pressed flat at the soldiers' MARCHING height, low; they're the trail, never a prize up high (1-1.md:26-27).

## 6. Open story threads (decide or fix)

1. **Meeca's parents:** never mentioned. Leave it unspoken, or give it one line? (VOICE "Still open").
2. **Two food mentions left for Matt:** "She took a sandwich" (the eagle, W4) and "Bring snacks" (Meeca's last note, a callback to Dot
   going for snacks) (STORY-REWRITE:1910, :1866).
3. **The Cast Bible** still says Dot is "he", and that Grandpa vanished the same night Grandma died. Both need the VOICE fixes.
4. **The prologue goes into `storyIntro.ts`** only once the rewrite is approved as a whole (VOICE). Check what ships today against the
   approved pilot.
5. **1-5's player text** (keepsake hint, journal line, stage clue) still describes old 1-5's petals; the engine's 1-5 is Meeca's marks.
   Match it before 1-5 ships (R-165.45).
6. **1-1/1-2 story art held** (R-165.31, R-165.42): the deep bootprint (the soldiers' boot), the pink bell (the painted one is World 5's,
   Pell's), the hibiscus, a W1 root arch and bridge, and the collared snake's "more bluster than bite" pose. Builders report them
   missing; no other world's art stands in.
7. **1-2's own sections:** after the Round 8 binds, 1-2 needs its own arrive (rain + the snake cameo), set piece (the secret low road,
   the bell, the note), goal (another petal low on the bark, no bootprint) and rain-fit rests (W1-NEW-SECTIONS Round 8; supervisor note).
8. **`hint.1-1.bounce`:** its words are main's `ctest.bounce` (the testers' course), not old 1-1's. If the `lesson.bounce` card still
   fires, use one or the other (supervisor, 11-06).
9. **Story delivery:** the words box keeps room for six lines, leaving dead space under short lines upright (DIRECTION.md 8, flagged).
10. **The skull rule:** see §4.

## 7. The story keeper's checks (how I judge any change)

- Who says it, why, and right now? (VOICE "The one question").
- Does it agree with "What happened, in order"? No winter, Dot is she, the General never says "I", Pell never contracts.
- Does it steal another stage's beat (§5) or another world's art (LABELS rule 4; D43)?
- What does each piece TELL the player, and is it true here (D38: calm water art on a deadly creek; a non-bouncy mushroom next to the
  bounce one)?
- Is it the one tip for that move, at a rest or before the move, never repeated?
- Cite the file and line. Matt's words, verbatim, when it's his call.
