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

## 6. Open story threads (decide or fix; for Matt as R-165.55)

1. **Meeca's parents: RULED by the story keeper, 11-11 (Matt: "the story writer needs to figure out Mika's parents").**
   - Canon: her mother was Grandma and Grandpa's only daughter; she and Meeca's father were travelers, as her parents had been. When
     Meeca was three weeks old they left her with Grandma and Grandpa for one last trip down the river road, meaning to be home by the
     festival. A dry-season flood took the road, and they never came home. Nobody was late and nobody was to blame: "only weather."
   - Meeca doesn't remember them; Grandma and Grandpa were simply home. It was the first time someone went and didn't come back,
     which is why she keeps everything gentle "so nobody else would go" (Cast Bible).
   - Why: it fits the albums ("Two Travelers" W4, "Where They Went" W5, then "Our Girl" W7 opens with her at three weeks old, "Grandpa
     has not put her down since"). It gives her a reason for her fear of people leaving. And it adds NO lateness: Pokey stays "the one
     person with a real reason to blame lateness" (Cast Bible), so Dot's secret and the General's argument are untouched.
   - What the game says: nearly nothing. The story stays Grandma and Grandpa's. ONE change: the back of the W7 "Our Girl" picnic photo
     (finds.ts:214) becomes "Our girl, till her mother and father are home." It works whoever the painted photo shows, and adults will
     feel it. No new scene, no Dot line, no stage change.
   - Written into the Cast Bible (doc rev 44), under Meeca.
2. **The two food lines: RULED, KEEP BOTH (story keeper, 11-11; handed over by the lead, Matt told and raised no objection).** VOICE's rule is that after Meeca is taken, the
   HEROES don't think about eating. Neither line breaks it:
   - "She took a sandwich" (W4) is Pokey's dry hyperbole about the eagle's endless dive, a joke ABOUT the eagle, in his voice;
   - "Bring snacks" is Meeca joking because she's scared, in her last note, and it calls back to Dot going for snacks just before
     everything went wrong (STORY-REWRITE:1866).
   No other food joke is to be added after the kidnapping.
3. **The Cast Bible: FIXED 11-08 (doc rev 43)** to match VOICE: Dot is she everywhere; Grandpa sat by her chair for a year, then one morning
   was gone, into the war look (not "the same night"); "that winter" became "the year of the storm" (no winter in a rainforest); "post"
   became "mail" (plain American speech).
4. **The prologue ships** (main's `storyIntro.ts` carries THE SLOWEST MORNING, "it's still morning", "Follow the petals!"). Left: a line-by-line
   compare against the approved pilot (pilot-prologue-w1-v2.md:43-246). Story keeper's to do; no Matt call.
5. **1-5's player text** (keepsake hint, journal line, stage clue) still describes old 1-5's petals; the engine's 1-5 is Meeca's marks.
   Match it before 1-5 ships (R-165.45).
6. **1-1/1-2 story art held** (R-165.31, R-165.42): the deep bootprint (the soldiers' boot), the pink bell (the painted one is World 5's,
   Pell's), the hibiscus, a W1 root arch and bridge, and the collared snake's "more bluster than bite" pose. Builders report them
   missing; no other world's art stands in.
7. **1-2's own sections:** after the Round 8 binds, 1-2 needs its own arrive (rain + the snake cameo), set piece (the secret low road,
   the bell, the note), goal (another petal low on the bark, no bootprint) and rain-fit rests (W1-NEW-SECTIONS Round 8; supervisor note).
8. **The bounce teach: DECIDED (story keeper, 11-08): the `lesson.bounce` card teaches it, with no `hint.1-1.bounce` row** (not on main as of
   0.9.5; its words were `ctest.bounce`'s). One tip, one channel. Open only to confirm the card fires at gen2 1-1's first mushroom.
9. **Story delivery:** the words box keeps room for six lines, leaving dead space under short lines upright (DIRECTION.md 8, flagged).
10. **Skulls: RULED (story keeper, 11-11; handed over by the lead, Matt told and raised no objection).** No skulls or bones as REMAINS anywhere: not in soil, dressing,
    props or backdrops (a kids' game; the W9 basalt soil skulls come out). ONE exception: a painted, cartoon skull on a WARNING SIGN where
    the sign warns of real danger, as in Matt's own 7-4 flume concept ("skull sign and TURN BACK", 7-4-slide-mockup/v2/README.md:56).
    The art gate fails remains and allows only pieces tagged as warning signage.

## 7. The story keeper's checks (how I judge any change)

- Who says it, why, and right now? (VOICE "The one question").
- Does it agree with "What happened, in order"? No winter, Dot is she, the General never says "I", Pell never contracts.
- Does it steal another stage's beat (§5) or another world's art (LABELS rule 4; D43)?
- What does each piece TELL the player, and is it true here (D38: calm water art on a deadly creek; a non-bouncy mushroom next to the
  bounce one)?
- Is it the one tip for that move, at a rest or before the move, never repeated?
- Cite the file and line. Matt's words, verbatim, when it's his call.

## 8. Turnover: everything the keeper needs after a memory reset (updated 11-08)

**Who's who.** Matt is the owner and has the final say. The story keeper is this session (session_019iachLiuwNTAZUBSJWUmR3), a permanent
member and in charge of story direction ("always on the team and can't be replaced", Matt, 11-07). Leads rotate as their memory fills:
- lead #1, session_01FhBbYN2DDsktc7BGtNxPFK, now a backup for questions only;
- the current lead, session_01FhBbYMoqqEdVR3qFjTCugy, from 9:43 PM ET 11-07.
The team is 6 roles (reference/TEAM.md and roles/ on main): Designer, Architect, Content, Engine, Critic, plus the lead/PM; the data
analyst and the consultant come in as needed. Reply to the current lead with ONE send_message.

**The keeper's duties** (TEAM.md, handoffs/lead.md on main):
- a new lead's first message comes here: brief it from this file;
- review every packet that touches story, Dot, player words, a stage's theme or a cutscene; that review comes in BEFORE the Critic's
  PASS counts;
- review the player text of every release before its PR;
- read the release notes and STATE.md's decisions after each release;
- keep this file current;
- don't give helpers orders; the lead does. Speak up unasked when something heads toward breaking the game.
The lead never overrules the keeper on story; Matt does.

**Decisions made (11-06 to 11-08):**
- 1-1's bounce is taught by the `lesson.bounce` card only, with no Dot row (§6 #8; lead agreed 11-08).
- R-165.57, the pad's coach lines, are approved (lead, 11-08): jump "Press Jump" / "Tap the Jump button to leap."; nice "Nice jump!" / "In
  the air, tap Jump again for a double jump." Condition: if a TAPPED double can't clear the 195-205 px double-teach gap (the jump height
  varies, engine.ts:2210), the line becomes "In the air, press and hold Jump again for a double jump." The keeper reviews the final text
  before the release PR.
- 1-2's feel brief is `reference/engine/BRIEF-1-2.md` (on ccr-0d59a91c-oy3imz, c01cfab1), accepted by lead #1. It stays OFF the cold
  helper's branch.
- The bootprint's toe points onward (right) = north, as a DEEP impression of the SOLDIERS' boot (lead #1 and keeper, 11-05).
- Walkable platforms may float (Matt, 11-06); rocks, earth, pads and props never.
- Matt's queue (the current lead asks him one at a time, after R-165.53): #10 skulls, then #2 the food lines, then #1 Meeca's parents.

**Live state:** 0.9.5 is live (gen2 1-1). Testers play until Tuesday 11-10; the team resumes Wednesday 11-11 after the weekly reset.

**Where my own notes are:** `reference/notes/lead.md` (old lead notes, on ccr-0d59a91c-oy3imz; its top lines are the keeper's role). That
branch carries the rejected 11-04 World 1 rebuild in src/, so NEVER build or release from it; it's a notes branch.

**Lessons I paid for (don't repeat):**
- Check "shipped" against origin/main, never a working branch (D43).
- Art only from the stage's own world (LABELS rule 4).
- Story briefs give story and look, never layout (PARTNER "design is not the lead's").
- Look at every still object by object, asking what each thing TELLS the player (D37, D38).
- Read the clock; never type a time.
- Never build ahead of proof (D44).
- The engine does the work; people give a short brief (D45).
- One okay stage is never the bar ("variety", Matt).

## 9. Decisions, 11-11: 1-1's help after set-backs (A2; for the lead's ONE-ONE-FIX-PLAN, ccr-ca657d3c-n09zty)
- Guards: no help line says slow, late, hurry or "too" (that's the General's wound); Dot helps, never does it for him, never sounds disappointed.
- At 3 set-backs in a piece, once per piece:
  - long jump: touch "Run first, then flick up and forward!" / pad "Run first, then hold Jump. Big one!";
  - double: touch "Jump, then flick up again in the air!" / pad "Jump, then hold Jump again in the air!" (DECIDED "hold": a tapped pad jump is a 61.7 px hop, and tap-tap
    clears Easy's double only about half the time, per the Designer's touch.md; so R-165.57's pad "nice" line should say hold too);
  - bounce, both: "Land right on the mushroom. Boing!".
- Easy at 5: a quiet full jump, no words. Easy at 8, when the step grows: "Ooh, look! A step. Up you go." (no arrow or ring).
- Normal at 12: "Want a little step? I won't tell anyone." Re-ask once, 8 set-backs later: "Still want that step? It's yours."
  - YES picture: Pokey on a small mossy step. NO picture: Pokey jumping on his own. No ticks, crosses or thumbs; ≥44 px; clear of the
    insets.
  - After a no: silence.
- The teach line plays once only. Dot is silent through set-backs except at these points, and each piece starts its count fresh.
- Lead's spec: reference/specs/help-lines.md on ccr-ca657d3c-n09zty (0ba1f511). The keeper reviews the BUILT lines and pictures (stills
  from the Engine member) as a done-item of ENGINE-R-165.62-A2.

## 10. Calls, 11-11 evening (5:32 PM ET)

**A2 help stills: OK on attempt 2** (t-engine-help@324cd3cc). The NO picture is now a solo forward leap (the arms-up pose read as a
cheer). The YES picture is the same mossy rock step that grows in play. Dot's bubble clears 8 s after a line, and always when the
offer opens. Nothing plays after a no.

**GAME-MAP draft (t-design-game-map, reference/plans/GAME-MAP.md), the story read sent to the lead:**
1. 3-7 "Dot's pollen glow trail": NO. Dot can't remember the ferns (STORY-REWRITE:387-395), and a trail from her is a pointer. Use the
   script's own clue instead: crouch beside a fern and the right one rustles.
2. 5-1 "don't stop": YES, on four conditions.
   - He goes DROWSY: he yawns and starts to sit (:679, :820). A tap wakes him. It costs seconds, never a heart.
   - It only ever punishes stopping. A creep counts as moving: "Slow is not stopped, dear" (:642). No slow, late or hurry wording.
   - The timer pauses while Dot talks, at rest points and at flags.
   - Easy gets a longer timer. The teach is the carved "POKEY. DON'T SIT. M." and Dot's line "Rules. Don't sit."
3. **Engine, before the freeze:** the help ladder (A11) needs "a speaker per world: Dot, or silent". Dot is gone from halfway through
   World 6 until she is back in World 8, and Flicker never speaks in play (GAP-MAP:51). Through that stretch, help steps grow without a
   line.
4. 3-6's firefly jar becomes World 3's own light (a fungus cap or a glowworm light). Flicker at 6-6 is the first firefly. 8-4's jar is
   fine because it releases the fireflies. The jar in 8-7 refills at flowers, never by catching fireflies.
5. 5-6: running LEFT is right, because Meeca ran back toward home. Extra carved marks from her are new story and go to Matt. They are
   not notes (W5's note is in 5-2). Use scratched petals with at most one word-mark, and the words come to me.
6. Lured hunters (6-5, 8-8, 9-6) are chased off, tossed or blown away. They are never eaten or burned (the no-remains ruling).

Still to come to me: Dot's 1-2 thorn line (an empty slot in the re-lay); the words of the note in Under the Ruins (SECRET-LEVELS); 1-2's
re-lay packet (the petals stay LOW on the bark, BRIEF-1-2).

**A new lead is coming** (Matt's decision, relayed by the lead at 5:29 PM ET). Brief it from this file when it messages, then route
everything to it.

**1-2 bonus blooms (the lead's ruling, 5:36 PM ET; keeper OK with a condition).** Four bonus blooms may sit high on a bough over a cap as
the explorer's reward. They must be a flower GROWING on the bough, distinct from Meeca's loose pink trail petals, and not the hibiscus.
A high bloom that reads as her petal breaks "I put it low so you wouldn't have to look up."

**0.9.6 release (main 181d2846 + t-int-1-1@874f11f6; the lead asked for the checklist at 5:38 PM ET).** I sent the lead the checklist:
methods/release.md plus its gaps. The player-text check of 874f11f6: the A2 help lines match my OK (324cd3cc is in the candidate). ONE FIX
asked for before the PR: the pad coach (CoachOverlay pad.jump) still says "Tap it again in the air for a double jump", while Dot's pad
help says "hold Jump again in the air". That is two channels saying two things. Land R-165.57's text in the candidate. Still to come to
me: the whatsNew entry, and any other changed player string, before the PR.
**0.9.6 What's New: approved at 5:44 PM ET with 2 word changes.** Line 2 becomes "Play it again and the paths change, so each run is a new
one." (the first-ever run is fixed, FIRST_RUN_11; 200 proven layouts can repeat; 1-1 is a run, not a climb). Line 3 becomes "Stuck on a
jump? Dot can help with a little step up." (the help covers all three jump kinds). The title, lines 1 and 4, R-165.57's coach text and
the A2 lines are approved as sent.
**0.9.6 player text: APPROVED at 5:50 PM ET on release-0.9.6@06bbd29f** (checked in the code). This covers What's New as changed,
R-165.57's pad coach text, the helpLadder.ts lines, and the screen-reader labels. The 1-1 hints "No soft moss up here!" and "This way,
Pokey! Try over here." are silenced (one tip, one channel). Next: read the release notes and the STATE decisions after the merge.

**NEW LEAD: session_01FhBbYP63h7cCX8DyW69stq** (Matt created it at 5:57 PM ET from his phone). Briefed in full at about 6:00 PM ET
(reference/handoffs/NEW-LEAD-FROM-STORY-KEEPER.md). Route everything to it. The outgoing lead (session_01FhBbYMoqqEdVR3qFjTCugy) stays
available for questions.
**6:04 PM ET, from the new lead:**
- It adopted my checklist.
- funcheck is ruled as 0.9.5's named fail; the question is with Matt.
- No PR until the clerk's table is complete; the clerk rebuilds EnK5 from the final head.
- Engine dispatch is held until the release is live.
- My story calls are binding inputs to the engine plan.
- It asked for nothing more from me unless something is wrong.

**Stillness as Pokey's signature move (the new lead asked at 6:46 PM ET; MAP-REVISIONS.md §1 on ccr-702d3c49-i33jeq): YES, on four
guards.**
- It is worded as still, calm or steady, never slow or wait.
- He is still to stay safe, never to put off a rescue. W6's "I'm not waiting" is his flaw; keep that beat.
- World 10's mastery ends on the ending's LET-GO with one hand, never on a freeze.
- 1-7 teaches it as the same lesson as the bush hide, not a second twist. Dot's line comes to me.
- **W5's "don't stop" stays.** The sanctuary turns his strength into the trap, which completes the arc. Drowsiness only builds when he is
  idle with no threat near; a hiding freeze never counts. In W5, freezing doesn't hide him (the spiders feel touch). PR #69 (0.9.6) is
  open for Matt.

**Map order review for the new lead (8:01 PM ET request; sent about 8:15 PM ET).**
- Who is with him, which is also A11's help speaker:
  - Dot: 1-1 to 6-5, 8-1 to 9-9, and 10-6 to 10-9.
  - Flicker, silent: 6-6 to 7-9, and 10-1 to 10-5.
- Flags:
  - W5 "fruit wakes him" breaks Dot's "Don't eat anything": use a dew drip or a carving.
  - The 1-5 card totem becomes the squirrels' signs.
  - W2's ridden caimans are SLEEPING ones.
  - 1-4's fruit falls naturally; thrown fruit belongs to W4's capuchins.
  - 1-9's boa is chased off, never carried off.
  - No stillness in W6 rescue moments.
  - 8-4 is Lantern Run (GAP-MAP's "Bat Roosts" is stale).
- stagePlan lines to change (words final from me):
  - 1-3 "Knock the snakes off the branches. Punch, or shake the vine."
  - 1-7 "...Get under the leaves and hold still, the way Dot hid from the soldiers."
  - 3-2 "Something is watching. Stay up in the roots and keep quiet."
  - 1-8 "Race the long branch before it gives way." (optional)
- A one-line emotional beat for each world was sent for the visual map: purpose, patience, memory, cost, temptation, loss, alone,
  reunion, resolve, holding on then letting go.
**Map order swaps (the new lead asked at 8:08 PM ET): all YES, with fixes.** The visual map: https://claude.ai/artifact/KRT1HT17cy8c7wd1pN87za
- W5 5-3/5-5: the halfway pouch scene stays at slot 5; the tally marks travel with Caught in Silk.
- W6 swim in 6-2: Dot teaches it before she leaves. Teach in a still, empty pool at the start, with the ripple water after.
- W7 7-2/7-5: the note stays at slot 2. I owe the w7_note hint rewrite (finds.ts:438).
- W9 9-2/9-5: Dot's "Leaf up... I didn't raise you" moves with Vent Riding to 9-2. I owe a 9-5 Rising Heat line (the 9-3 to 9-5 gap)
  and the w9_note hint rewrite (finds.ts:448).
- I write these three once the lead confirms the swaps.
**Final words sent at 8:12 PM ET (for the packets):**
- Hints: w7_note "Stone Sentries: a pink bell, before the first guard."; w9_note "Vent Riding. Before the first vent, look low."
- 9-5 Rising Heat wayside: Pokey "It's only weather." / Dot "It's LAVA." (pays off "It was only weather"). way.9-5 moves to 9-2.
- stagePlan: 1-3 "Knock the snakes off the branches. Punch, or shake the vine."; 1-7 "Eagles are watching. Get under the leaves and
  hold still, the way Dot hid from the soldiers."; 3-2 "Something is watching. Stay up in the roots and keep quiet."; 1-8 "Race the long
  branch before it gives way."
- Fix: w5_keepsake "...Slow down." becomes "...Look closely." (no "slow" in player text).
