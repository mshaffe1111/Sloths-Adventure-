# Story review: what doesn't match the new plan, and lines that sound written by a machine

Nothing in the game has been changed yet. This is a list to read, agree with or strike out.

**Status (2026-10-27): Matt approved all of it, including the fixes to his approved lines.**

**Applied in the game:** every change that is only text or a music cue in files that exist today:
- the voice fixes, joke trims and tone fixes (the dropped laugh and triumph stings);
- American English;
- the prologue panic;
- the boss lines;
- the timing title "On the March North";
- the World 5 opening wording;
- Dot's tips;
- the stage goal texts in `stagePlan.ts`.

**Not applied yet:** anything that needs new art, a new story actor (Flicker has no story sprite yet), new stages, or the World 5/6 restructure. Those drafts are kept word for word in "To build with the stages" at the end of this file. The builders should use them exactly.

**Decided (Matt)**
1. Meeca's stage is **"On the March North"**, not "Three days earlier". Every line about the timing follows from that: the title card, the World 5 opening, 5-6's "for one night", weeks-old lantern stakes, and Dot missing it.
2. **World 10: Dot and Flicker guide Pokey together** through the last stages ("it unites the two, they both have guilt"). Reworked in Part 1, item 10: Dot's confession stays at the foot of the mountain; she comes back halfway up; they guide him together; she goes around at the gate; the dawn flour arrival and "Seems to me it's still morning" stay.
3. **Flicker (he/him) stays from the end of World 6's halfway scene to the end of the game.** When Dot is back she's **jealous** (saving Meeca is her chance to make up for her old guilt, and a newcomer is helping in her place). Flicker doesn't understand it, shrugs it off and holds his ground, but is mostly earnest and helpful. The turn is a private scene, with Pokey asleep, where Flicker tells Dot his light got Meeca caught one tree from freedom. Dot recognizes herself in him without telling her own secret, and it gives her the nerve to confess in World 10. Placed and drafted in Part 1, item 9.

Still to ask: whether to edit the approved lines. (Flicker in World 9 is now settled: yes.)

**Summary**
- **Part 1, the new plan:** 11 groups of small fixes (about 30 edits) and four short new scenes. The big one is that "Three days earlier" contradicted Meeca being in the tower since World 1, so her escape is now "On the March North" (decided).
- **Part 2, lines that sound written by a machine:** 28 voice fixes, mostly cuts.
- **Part 3:** four questions for you.
- **Part 4, second pass:** lines that come out of nowhere, tone breaks and music cues, and each character checked across all ten worlds. The story holds together very well: every character stays themselves, and the changes that happen are their arcs. Part 4 has 12 small fixes, mostly dropping a "laugh" music hit under a serious moment, plus a few lines where someone briefly sounds like someone else.
- **Part 5, third pass:** jokes, mood, what each line wants, the bosses, and the story as a whole, world by world. About 15 small fixes:
  - jokes explained or stepped on, cut back to their punchline;
  - Dot's prologue line rewritten so it sounds like panic;
  - one boss line that makes the middle of the bosses' arc clear;
  - three plain-American swaps;
  - one lighting setting.
  
  It ends with a one-page look at the whole story, and the five changes that would lift it most.

## How I judged it

The aim is cleanup, not rewriting. Smallest change wins: cut a phrase before rewriting a line, rewrite a line before a scene. The only new scenes are the four the new plan needs, and each is short.

Rules I used, most of them already in `reference/VOICE.md`:
- **Subtext over saying the feeling.** If the scene already shows it, the narrator doesn't explain it. Characters say feelings sideways ("You know how I feel about thunder").
- **Every voice is different.** If two characters' lines could be swapped, one is wrong. Pokey is slow, flat and dry. Dot runs on, then goes short when it matters. Pell never uses contractions. The General gives orders. Grandma says few, plain words.
- **Concrete detail beats a summing-up line.** A teacup held for forty minutes, not "he was scared".
- **Let a scene end without a button.** No neat closing moral, no aphorism that wraps the moment up.
- **Machine-writing tells:**
  - "It's not X. It's Y." (worst when X was never said);
  - tidy lists of three;
  - pocket sayings ("a ring is just a road that forgot...");
  - polished speeches from characters who don't talk that way;
  - one rhythm for everyone.
  
  One alone proves nothing; I flagged the lines where they pile up.
- **Keep what's on purpose:** Pokey's sarcasm, Dot's rambles, Pell's apologies, the "slow isn't stopped" motif, and the lines you approved in `STORY-REWRITE.md` (marked **[approved]**; I only flag those where the tell is clear).
- **Read it out loud.** If a kid couldn't follow it on the first try, it's too clever.

Sources:
- [Show don't tell, with examples from children's books (Emma Walton Hamilton)](https://emmawaltonhamilton.com/tag/show-dont-tell)
- [Editing secrets for children's writers (Creativity Portal)](https://www.creativity-portal.com/howto/writing/features/write4kids/editing.secrets.html): lean dialogue; editors see talking-animal stories where every character sounds the same without the tags.
- [Creating engaging dialog using subtext (Live Write Thrive)](https://livewritethrive.com/?p=5957)
- [Dynamic dialogue for middle grade and YA (The Winged Pen)](https://thewingedpen.com/myc-dynamic-dialogue/)
- [Signs of AI writing (Pounce)](https://www.pounce.so/signs-of-ai-writing) and [Current AI tells (E. H. Prybylski)](https://ehprybylski.substack.com/p/current-ai-tells): "not X but Y", default triplets, one rhythm. Both say a single tell is weak evidence and it's the pile-up that counts.

---

## Part 1: What doesn't match the new plan

### 1. The big one: "Three days earlier" can't be right

**Where:** `src/game/meecaLines.ts:75`, the title card "Three days earlier".

**What's wrong:** In World 1, Dot already says they took Meeca "all the way up to the Highlands... They put her in a tower" (`storyWorlds.ts:63, 67`). Every note from World 1 on comes from that tower. So when Pokey reaches the Orchid Sanctuary, Meeca has been in the tower for weeks. She can't have escaped three days earlier.

**Fix:** set her escape **on the march north**, the one night the column camped in the sanctuary, weeks before Pokey arrives. That keeps every tower note true. It also matches the old line "carved on the move," and it gives Dot a sting: she followed that column and *missed* it.
- Title card: `'Three days', 'earlier'` → `'On the March', 'North'` **(decided)**
- Sub-line: `'The Orchid Sanctuary, at dusk.'` → `'The Orchid Sanctuary, at night.'`
- The 5-6 clearing below says the lantern stakes are weeks old, not fresh.

### 2. World 5 opening scene (`storyWorlds.ts:216-220`)

Four small changes. The table, the chairs and "a very still chair" stay as they are.
- **216:** `as if they'd been cut on the move.` → `as if they'd been cut in a hurry.`
- **218, Pokey:** `She did this while they marched her past.` → `She got away from them.`
- **Add after 218, Dot:** `She what? No. I followed that column the whole way up. She walked the whole way, Pokey, I watched her—`
- **Add, narrator:** `Dot stopped and looked at the letters again.`
- **219, Dot's hairpin line:** keep as it is. It still works.
- **220, Dot's rule list:** `Rules. Don't sit. Don't eat anything. Don't drink anything. Don't touch the silk. Don't admire the silk. It takes it as a compliment.` → `If she carved one, she carved more. She never leaves just one of anything. Watch the trees.`

Players now learn each rule from a carving, so Dot doesn't list them.

### 3. Dot's World 5 stage tips still list all the rules (`src/game/w5Lines.ts:41-42`)

- `Rules: don't sit, eat, drink, or touch the silk.` + `And don't admire the silk. It loves compliments.` → `Don't sit. That's the one on the tree.`
- The other rules get said where their carvings are: DON'T EAT in 5-2, HANDS OFF THE SILK at 5-4.
- **`w5Lines.ts:27`:** `With a hairpin, on the move.` → `With a hairpin, on the run.`

### 4. Meeca's own stage

`meecaLines.ts` (thoughts at lines 44-66, the caught lines, the ending at 89-99) was written for the old "back in line" stage. Most of it goes with the redesign.

**Keep:**
- the five warnings, word for word;
- `Last one. For Pokey.`;
- every Pell line in the ending.

**Change:**
- `Hairpin. Good. Thumb on the trunk, and hold.` → `Hairpin. Good. Round and round.` (Flicker shows the circle.)

**New ending, in order:**
- Pell: `Good evening, Miss.`
- Meeca: `...How long have you been there?`
- Pell: `Since the first tree. I am sorry.`
- Pell: `I did not see any carving, Miss. I did not see anything.` (existing)
- Flicker, very small: `I was the light.`
- Pell: `It is cold tonight. Here.` / `It is not from the General.` / Meeca: `Thank you, Pell.` / Pell: `Please do not thank me. It is embarrassing.` (all existing)

**Flicker's first line** when they meet in the dark: `You're not from here. Nobody from here walks that loud.`

### 5. 5-6, Where She Ran

**Stage goal** (`stagePlan.ts:79`): `"Meeca's Messages", 'Meeca carved messages as they marched her past. Find {n} of them.'` → `'Where She Ran', 'She got away from them here, for one night. Follow where she ran.'`

**New short scene at the clearing (end of 5-6):**

> *The trail of carvings ended in a small clearing. Four stakes stood in a ring in the grass, the kind soldiers hang lanterns from. The grass between them had mostly grown back.*
> *On the last tree, low down:* DON'T STOP TO LOOK. LOVE, M.
> **Pokey:** She got out.
> **Dot:** Not far enough.
> **Dot:** That's the night I lost them. I was a hill over, following a hibiscus. I told you she walked the whole way. I said that to you.
> *At the edge of the clearing, something small and bright blinked once, and was gone.*

The hibiscus is already in World 1 (`storyWorlds.ts:56`), so this pays it off. Nobody comments on the light.

### 6. World 6 order and noon

- **`stagePlan.ts:90`:** `'Before Noon', 'The Reaver eats lunch at noon. Get through before then.'` → `'Lights in the Roots', 'The roots go dark. Let the firefly light the way.'`
- **`stagePlan.ts:91`:** `'Swing through the roots alone now. Next branch.'` → `'Raise the water, lower the water, and find what Dot left you.'`
- **Dot's 6-6 tip** (`dotLinesData.ts:424`, `way.6-6`): Dot speaks here, but she has already left. → Flicker: `Don't look at me. Look where I'm lighting.`
- **Dot teaching swimming in 6-4** (new stage line, in her voice): `Sloths swim. You swim almost three times faster than you walk. You can hold your breath for forty minutes. Don't look at me like that, it's true.`
- **6-9:** Flicker's warning is just `It's nearly noon.` Pokey's answer stays where it already is, at the boss (`storyBosses.ts:113`), so it isn't said twice.

### 7. Flicker arrives (new, end of World 6's halfway scene, after `storyWorlds.ts:271`)

> *The leaf kept shivering. Then a small light came down through the roots and sat on it.*
> **Flicker:** You're Pokey.
> **Pokey:** Most days.
> **Flicker:** Your name's on a tree back in the orchids. I've been behind you ever since.
> **Pokey:** Can you get a note to her? Over the net?
> **Flicker:** I tried. It hums when anything touches it. They come running.
> **Pokey:** Who are you?
> **Flicker:** Flicker. Somebody who owes her.
> *He didn't say any more. He came and sat on the satchel strap.*

The net line answers "why can't the tiny firefly just carry notes?" before anyone asks it.

### 8. Lines that say Pokey is alone, now that Flicker is with him

All tiny edits:
- **`storyMemories.ts:118`** (after the Reaver): `There was nobody there to hear it. He said it again anyway.` → `Flicker had gone ahead to light the next root. He said it again anyway.`
- **`storyWorlds.ts:277`** (World 7): `He turned to say something to Dot. The air by his shoulder was empty.` → `He turned to say something to Dot. There was only Flicker, which wasn't the same.`
- **`storyWorlds.ts:292`:** `He left a gap after it, for the answer.` → `He left a gap after it, for the answer. Flicker didn't fill it.`
- **`dotLinesData.ts:426`** (`way.6-8`): `...leaves room on the root beside him. Out of habit.` → `...leaves room on the root beside him. Flicker sits in it. It's a lot of room for a firefly.`
- **`dotLinesData.ts:428`** (`way.7.hurt0`): `He says "I'm fine" to the empty ruins, out of habit. The ruins don't argue.` → `He says "I'm fine" to the ruins, out of habit. Nobody argues. Flicker blinks.`
- **`storyWorlds.ts:304`** (World 8): `The fireflies came out as the light went.` → `Flicker went on ahead, and the fireflies came out to meet it as the light went.`
- **`dotLinesData.ts:444`** (`way.8-6`): `Fireflies blink on along the branch ahead, one by one, like a lamp left lit just in case.` → `Flicker's family blinks on along the branch ahead, one by one.`

### 9. Dot and Flicker: jealousy, then the night they understand each other (decided)

Flicker is "he" everywhere. Once he arrives (end of World 6's halfway scene), he stays to the end.

**Who is with Pokey when:**
- **World 6, second half, and World 7:** Flicker only.
- **World 8:** Pokey falls asleep with Flicker, and Dot comes back from Meeca's window. That's the first time Dot and Flicker meet. Dot has already been to the window, so nothing breaks the rule that she doesn't meet Meeca before World 8.
- **World 9:** all three.
- **World 10:** see item 10. Dot leaves at the foot of the mountain, comes back halfway up, and goes around at the gate.
- **The ending:** all of them.

**Why Dot is jealous:** saving Meeca is her chance to make up for the warning she was late with, and a newcomer is doing the helping while she was gone. It's funny on top and real underneath. Flicker doesn't understand why she's prickly, shrugs it off, and holds his ground when she tries to boss him around. Mostly he's just earnest and helpful, because the one he let down is the one they're saving.

**First meeting (World 8, insert after Dot's arrival ramble, `storyWorlds.ts:311`):**

> *Dot stopped. There was a light on Pokey's satchel strap, and it was looking at her.*
> **Dot:** Pokey. There's a bug on you. A glowing one.
> **Flicker:** Flicker. Hello.
> **Dot:** How long has it been glowing at you?
> **Flicker:** Since the mangrove. And I'm a he.
> **Dot:** Since the mangrove. That's a long time to be glowing at somebody.

Then the approved scene goes on as written ("Dot. You came back. You're bleeding.").

**Jealousy and banter, three short beats:**
1. **World 8, stage tips (around 8-3/8-4).** Dot tries to push him around; he holds his ground.
   - Dot: `Flicker, go see if that branch is safe.`
   - Flicker: `You're faster.`
   - Dot: `I'm resting.`
   - Flicker: `You're hovering.`
2. **World 8 halfway scene (before `storyWorlds.ts:334`):**
   - *Flicker lit the branch ahead before Dot could say which one.*
   - Dot: `I was going to say that one.`
   - Flicker: `You can say the next one.`
   
   Then the approved scene goes on ("Dot, you're humming.").
3. **World 9, stage tips (before the Drake, beside `way.9-9`):**
   - Dot: `Plan for the Drake: Pokey says something dry, I panic, he gets confused.`
   - Flicker: `What do I do?`
   - Dot: `Glow quietly.`
   - Flicker: `I don't have a quiet setting.`
   
   Optional fourth, in the Pell scene (after `storyWorlds.ts:359`):
   - Pell: `I am sorry. Is the bug with you?`
   - Dot: `No.`
   - Pokey and Flicker: `Yes.`
   - Pell: `I am sorry. Good evening, sir.`

**The night they understand each other (World 9, new, the night before the mountain, just before "The open gates").** Pokey is asleep. This is the heart of their story. Dot sees herself in him, the one whose light or warning failed someone. She doesn't tell her secret, but the audience feels it.

> *The night before the mountain, Pokey fell asleep against a warm rock with his mouth open. Dot couldn't sleep. She never could, near weather. Flicker sat on a stone a little way off and turned himself down low, so he wouldn't keep anybody up.*
> **Dot:** You can turn that off, you know. Nobody needs it. I can see fine.
> **Flicker:** You flew into a rock an hour ago.
> **Dot:** I was checking the rock.
> **Flicker:** She got out, you know. Meeca. In the orchids. She was nearly all the way out.
> **Dot:** I saw the carvings.
> **Flicker:** She didn't know the way, so I lit it for her. Every tree. I was the one showing her where to go.
> **Flicker:** They followed my light.
> *Dot didn't say anything for a while.*
> **Dot:** How far did she get?
> **Flicker:** One more tree.
> **Dot:** And now you go over it. Every night. Which tree. What if you'd been somewhere else.
> **Flicker:** ...How do you know that?
> *Dot's wing went to the pouch at her side. She looked at Pokey, asleep with his mouth open, for a long time.*
> **Dot:** Lucky guess.
> **Dot:** Tomorrow, at the bottom of the mountain, I might say something to him. If I stop halfway, don't let me.
> **Flicker:** I won't.
> *She sat down on the stone next to him. She didn't take up much room. Neither did he. After a while, he turned himself back up.*

Why it works:
- It's funny until it isn't (the rock).
- There's no speech.
- It turns on one concrete detail: "One more tree."
- Dot describes her own nights as if they were his, and "Lucky guess" is the only cover she has. Kids hear Dot being kind; adults hear her confession coming.
- It's what gives her the nerve to tell Pokey the next morning.

**How this feeds World 10 (item 10):**
- **At the foot of the mountain:** the approved confession happens as written. One optional narration line before it, after `storyWorlds.ts:390`: `Flicker, on the rock beside them, didn't look away.`
- **Halfway up:** when she comes back, the first lines become a callback to their night:
  - Flicker: `You said not to let you stop halfway.`
  - Dot: `I know what I said. I know what I said.` (her own line from World 1)
  
  Then the drafted beat (her wing over his dimming light, "Next step.").
- **At the gate:** "Flicker, stay with him." is Dot handing over the job she was jealous of. That's the jealousy resolved, without a word about it.

**The ending (after Meeca's "Come here.", item 10):**
- Dot: `He's all right. Don't tell him.`
- Flicker: `I'm right here.`

### 10. World 10: Dot and Flicker guide him together (decided), and the ending

The shape: Dot's confession stays where the approved script has it, at the foot of the mountain. She runs from it, out of shame, not to the seam. Pokey climbs the first half with only Flicker. At the halfway point, after Meeca's song, Dot comes back. Dot and Flicker guide him together through the last stages. At the fortress gate, Dot goes around to the cookhouse seam to be "early for something, once." So the General's "I do not know where your bird is" still works, and Dot still turns up at dawn in flour, late, for "Seems to me it's still morning."

**At the foot of the mountain (`storyWorlds.ts:395-400`):** small changes only. The confession lines 392-393 are untouched.
- **395** (Dot): `You don't have to answer. I'm going in. I'm going to be early for something, once. I'm going to be so early that—` → `You don't have to answer. I need a minute. Don't wait for me.` (The "early for something, once" line moves to the gate.)
- **396:** `Dot—` stays.
- **397:** `...and then she was gone along the netting, around the black shoulder of the mountain, toward a badly sewn seam Pokey couldn't see.` → `...and then she was gone into the rain.`
- **398:** `Up the mountain, a flash, and something metal fell over. Then nothing at all.` → moves to the gate scene below.
- **399-400:** `Dot?` and the door "exactly his width" stay.
- **Add after 400:** `Flicker came and sat on his wrist, next to the petal, and lit the first step.`

**Halfway up (add after the song, `storyWorlds.ts:409`):**

> *Something small came down out of the rain and landed on the step in front of him. It was soaked flat, and it was Dot.*
> **Flicker:** You said not to let you stop halfway.
> **Dot:** I know what I said. I know what I said.
> **Dot:** I got as far as the ridge. I sat there. I'm not doing that again. I'm not going to be late for this one.
> *Flicker's light had gone dim in the rain. Dot moved over and held a wing above it, and it came back up.*
> **Pokey:** Next step.
> **Dot:** Next step.

**The last stages (10-6 to 10-9), the two of them together.** Their guilt shows only in what they do, never in a speech:
- Dot flies ahead to find the next handhold, the job she was late for once.
- Flicker stays at Pokey's hands to light them, the light he once gave away.
- Each keeps checking on him and pretending not to.

Tips in voice for the stages:
- Dot: `Next one's left. Left, Pokey. Your other left.`
- Flicker: `Here. Put your hand where I am.`
- Dot: `Don't you go anywhere without me.` (her prologue line, said quietly now)
- Flicker, when the thunder comes and he grabs the rock: `It's only weather.` Dot, after a beat: `It's only weather.`

**At the fortress gate (new, end of 10-9, before the General):**

> **Dot:** This is where I go around. The cookhouse seam. I'm going to be at her window before you're at the top. Early. For something, once.
> **Pokey:** Dot.
> **Dot:** Don't. Go in the front. Flicker, stay with him.
> **Flicker:** I will.
> *Then she was gone along the wall. Up above, a flash, and something metal fell over. Then nothing at all.*
> **Pokey:** Dot?

**Why "Seems to me it's still morning" still lands, and lands harder:** the approved ending has Dot turn up at sunrise, covered in flour, apologizing for being late. Now that comes straight after she promised, at the gate, to be early "for something, once." She's late one more time, the last time, and Pokey forgives her with the same joke he made the first morning she was late. The line doesn't move; only what's in front of it does, and that makes it sharper.

**Everything else in World 10 and the ending still fits:**
- the General's "Where's Dot?" / "I do not know where your bird is";
- Pokey's "She came back every time." That's even truer now, because he's just watched her come back down the mountain to him.

Dot's tip at **`dotLinesData.ts:463`** (`way.10-6`): `Between swings he checks the netting for a small green shape. Nothing yet.` That's still true before the halfway point. If 10-6 falls after it, → `Between swings he checks that the small green shape is still with him. It is.`

**Flicker in the ending (after Dot's return, `storyFinale.ts:113`):** it has been with Pokey all night.

> *The small light on Pokey's wrist lifted off and stopped a little way from Meeca.*
> **Meeca:** There you are. I wondered where my light went.
> **Flicker:** I'm sorry.
> **Meeca:** You got me a whole night out. Come here.

**World 9:** **`dotLinesData.ts:451`** (`way.9-3`): `It's so hot Dot has stopped glowing and started sweating.` → `It's so hot Flicker has stopped glowing and started sweating.` (Dot doesn't glow; Flicker does. He's along in World 9, decided.)

### 11. Smaller continuity

- **`dotLinesData.ts:143`** (`way.1-5`): `These petals are fresher. She came this way not long ago.` She was marched past weeks ago. → `She squashed this one extra flat.` (applied as "squashed": "pressed" trips the touch-words check, which reads it as a button word)
- **Dot's netting flight (4-D):** its notes say she "carries Meeca's note through the netting to the gap". It must stay a pickup at the gap, never reaching Meeca, because Dot's first time at her window is World 8. The text looks fine; it's one to watch when 4-D is redone.
- **"Petals are her trail":** already said plainly in World 1 (`storyWorlds.ts:74, 78`: "Follow the petals" and "The petals go north"). No change needed.
- **Timeline numbers** (ten years since the storm, nine since he left, the five-month flood warning, 191 nights): they agree.

---

## Part 2: Lines that sound written by a machine

Ordered roughly by how strongly they read that way. Smallest fix first.

1. **`dotLinesData.ts:239`** (`way.3-9`): "Seems to me a ring is just a road that forgot where it was going." A pocket saying. → `Seems to me we've been here.`
2. **`dotLinesData.ts:443`** (`way.8-5`): "I tell myself, 'Next branch, then the one after.' That's all a long way is." The second sentence sums it up. → cut it.
3. **`dotLinesData.ts:235`** (`way.3-5`): "In here, quiet is a thing that listens back." Too polished for Dot. → `I used to be good at quiet. Not this quiet.`
4. **`storyBosses.ts:242`** (Thornbark): "It was a heart before the thorns grew around it." A neat moral. → cut; keep "Take this Thorn Heart. Go and bring your Meeca home."
5. **`storyBosses.ts:33`** (Venom Fang): "Take all the time you need. Someone has to." The second half is a saying. → cut it. Pokey's "I usually do." still answers. **[approved]**
6. **`storyWorlds.ts:134`** (Dot): "That's her whole thing. It's also, a little bit, her whole problem." Balanced pair. → `That's her whole thing. Mostly it works.`
7. **`storyWorlds.ts:248`** (narrator): "Rivers are kind when the Heartbloom is open. This one had stopped being kind." A tidy button. → `...This one wasn't.` **[approved]**
8. **`storyWorlds.ts:237`** (Dot): "It's not him I'm scared of. It's what it says..." The "not X, it's Y" shape. → `Not him. What it says, and what he does when he reads it, and that I... that I took so—` (Dot breaks off, which suits her.) **[approved]**
9. **`w5Lines.ts:64`** (Dot): "Slow and steady. But never, ever still." A slogan. → `Keep going. Don't stop anywhere soft.`
10. **`storyBosses.ts:167`** (Magma Drake): "I suppose that is what visitors are for." A wise aside. → cut; "the first visitor puts it out" lands on its own. **[approved]**
11. **`storyFinale.ts:167`** (General): "You are exactly the right age to be brave and foolish." A greeting-card line. → `You are the right age. Keep it.` **[approved]**
12. **`storyFinale.ts:186`** (General): "Thank you for being patient enough to find them, boy." Says the theme out loud. → `In ferns. Of course.` and stop. **[approved]**
13. **`storyFinale.ts:193-194`:** "Somebody is coming home." / "Yes, Grandpa. You are." A tidy button on the biggest moment. Optional: cut Meeca's reply and let the bell's note end it. **[approved; your call]**
14. **`storyWorlds.ts:327`** (Dot): "I can't tell you half of it. It doesn't come in halves." Too neat for Dot under stress. → `I can't tell you half of it. I'll tell him. Once.` **[approved]**
15. **`storyBosses.ts:181`** (General): "I have buried what late costs. I will not bury another." A crafted speech; the General talks in orders. → `I buried her because help was late. Not again.` **[approved]**
16. **`dotLinesData.ts:457`** (`way.10.hurt0`): "He sits. He breathes. He stands. In that order, every time." A drumbeat of three. → `He sits. Then he stands up.`
17. **`dotLinesData.ts:462`** (`way.10-5`): "...Then he stops counting, and just climbs." A summing-up button. → `He counts the steps that are left. He loses count.`
18. **`dotLinesData.ts:413`** (`way.5-3`): "...like doors closing down a hall." A stock simile. → `The orchids fold shut as he passes, one after another.`
19. **`storyMemories.ts:96`** (narrator): "In all the years of her sanctuary, nobody had ever stayed to the bottom." Explains what line 108 (the topped-up cup) already shows. → cut. **[approved]**
20. **`storyWorlds.ts:290`** (narrator): "It was a different quiet from the Grotto's." Tells, doesn't show. → cut; "He stopped to listen to the quiet" is enough. **[approved]**
21. **`storyWorlds.ts:142-143`:** "I'm dim, but I'm steady." / "Dim and steady. I'll take it. I've worked for less." Both sound equally quippy. Keep Pokey's; Dot's → `Dim and steady. Fine. Don't let go of me.` **[approved]**
22. **`storyWorlds.ts:269`** (Dot): "I'm a hummingbird. I live in seams." A slogan inside a good ramble. → cut that sentence; the ramble carries it. **[approved]**
23. **`storyBosses.ts:239`** (Pokey): "It's my best skill." A third beat on a line that already landed. → cut. **[approved]**
24. **`dotLinesData.ts:147`** (`way.1-8`): "Dot has flown to the end of this branch and back four times. I'm still on my first." VOICE.md warns about counting jokes; there are many. → `Dot has flown this branch and back already. Twice, I think.`
25. **`dotLinesData.ts:441`** (`way.8-2`): "...Three days of flying and it's gone. It had a bird in it." Fine, but the "three days" counting repeats the nearby lines. → `...It's gone. It had a bird in it.`
26. **`storyWorlds.ts:383`** (Dot): "It's the one thing I'm sure of about this whole fortress, and I'm counting on it." A little written. → `It's the one thing I'm sure of up here.` **[approved]**
27. **`storyMemories.ts:55`** (Dot): "and I think that should count for something." Fine, but it ends like a speech. → `I was there, and I was loud.` **[approved]**
28. **`w5Lines.ts:35`** (Dot): "Those were guests. They sat down." Keep it. It's the good kind: short, concrete, chilling. Listed so it doesn't get "fixed" by mistake.

Left alone on purpose:
- the prologue, word for word;
- "Meeca sang it in tune. It was worse.";
- "Her handwriting was very steady. It always was when she lied.";
- Pell's apologies;
- "Slow isn't stopped";
- the snail.

These are why the story works.

---

## Part 3: Questions for you

1. ~~Meeca's escape timing~~ **Decided: "On the March North".**
2. ~~World 10, Dot and Flicker~~ **Decided: together** (Part 1, item 10).
3. ~~Flicker in World 9~~ **Decided: yes, he stays to the end.**
4. **The approved lines in Part 2** (marked [approved]): change them, or leave the approved script alone and only fix the stage tips?

---

## Part 4: Second pass (out-of-nowhere lines, tone, and characters across all ten worlds)

Same rules as before: smallest change wins, exact old → new. **[approved]** marks lines from the script you signed off on.

### 4a. Lines that come out of nowhere or don't answer what was said

The story is careful here. Almost every callback is set up first:
- the mailman's package (World 2 → the ending);
- the pelican joke Dot saves for the halfway scene (6-5 → 6-mid → 8-2);
- Pell's lantern held low (World 8 → World 9);
- the four bowls of wrong soup (Pell's report → Pokey's line);
- "Slow is not stopped" (Grandma, World 4 → Pokey, World 5);
- the satchel rubbing his shoulder (the pale stripe → Meeca's sealed note).

What's left:
1. **`storyBosses.ts:235`** (Thornbark): "RUN... or FIGHT." in capitals reads like a game menu, not a tree in pain, and nothing in his voice set it up. → `Run. Please.` **[approved]**
2. **`storyBosses.ts:232`** (Thornbark): "Grrr... the thorns... they whisper..." The "Grrr" is a cartoon noise nobody else in the game makes. → `The thorns... they whisper... Leave this hollow, little sloth...` (cut "Grrr... "). **[approved]**
3. **`storyWorlds.ts:195`** (Dot): "She took a sandwich." A food joke, and your rule is that nobody thinks about food after the kidnapping. → cut it; "She started it at breakfast. I watched her go." still gets the laugh. **[approved]**
4. **`dotLinesData.ts:143`** (`way.1-5`): "These petals are fresher. She came this way not long ago." She was marched past weeks before (already in Part 1, item 11).
5. **`storyBosses.ts:115`** (Pokey): "I'm taller upside down." It answers "I thought you'd be taller," but only if the player knows sloths hang upside down. Fine for most kids. Keep; listed only so it's a choice, not an accident. **[approved]**

### 4b. Tone breaks and music cues

The deliberate turns work, and here's why, so they don't get "fixed":
- **Dot's noon note** ("There's a stain.", laugh) straight into "It is directly overhead." (cliffhanger), World 6: the joke makes the dread land harder.
- **"It's welcoming, Pokey."** (laugh) straight into the General's "Come up, sloth" (war), World 9: one breath, then the threat.
- **Dot in the flour** (laugh) then "Dot!" (triumph) in the ending: the relief is the point after a night of not knowing.
- **The General's "Sometimes." / "Mostly."** (laugh) in the ending: the first time he's allowed to be funny, and he's earned it.

What fights the moment:
6. **`storyWorlds.ts:209`** (World 4 halfway): "Don't. I'll cry, and I can't afford the water weight." The line is Dot dodging, which is right for her. But the **laugh sting** turns it into a punchline right after Pokey's "Oh, Dot." → keep the line, remove `sting: 'laugh'`. **[approved line; music only]**
7. **`storyWorlds.ts:322`** (World 8): "It's hover-sitting. It takes core." This comes right after "Dot, sit down. I have to tell you something," before the biggest reveal so far. Her nervous joke is right; the laugh sting isn't. → remove `sting: 'laugh'`.
8. **`storyMemories.ts:116`** (the "I'm tired" memory): the snail "had a schedule" gets a laugh sting in the saddest stretch of the game. The quiet joke is lovely; the music hit breaks the spell. → remove `sting: 'laugh'`.
9. **`storyWorlds.ts:101`** (World 2): "Don't you dare." Your notes say this is Dot afraid he'll stop, not just a joke. The laugh sting tells players it's only funny. → remove `sting: 'laugh'` so it can be both.
10. **`storyWorlds.ts:383`** (World 10): Dot's tailor joke gets a laugh sting a few lines before the thunder and her confession. Optional: remove the sting so the scene stays low the whole way down.
11. **`storyFinale.ts:167`:** "brave and foolish" is scored with the resolve cue *and* a triumph sting, the size of a boss win, for a small line about a medal (and Part 2 already suggests trimming the line). → remove `sting: 'triumph'`.
12. **`storyWorlds.ts:283`** (World 7): right after Pokey's quiet "Ten, and him." the Golem's four-minute good morning comes in with a comedy cue and a laugh. That's deliberate relief into the boss, and it's funny. Keep, but consider letting "Ten, and him." sit a beat longer (a hush cue on line 282) so the discovery isn't stepped on.

### 4c. Characters across all ten worlds

**Pokey** stays himself everywhere: slow, polite ("Excuse me, sir"), dry, holding on with both hands when scared. His arc is kept and works:
- World 1: he's as surprised as the snake that he won ("Wait till the neighbors hear").
- World 7: "Say that again. Slower. I want to enjoy it."
- World 8: "It ends with me getting there."
- World 10: "I'm afraid of thunder", the one time he says it straight, exactly as VOICE.md plans.

Two small drifts:
- **`storyBosses.ts:233`** (to Thornbark): "You were the Jungle Guardian. Meeca's grandma told me about you. The thorns did this to you, didn't they?" Three explaining sentences in a row is a narrator talking through Pokey. → `Meeca's grandma told me about you. The thorns did this, didn't they?` **[approved]**
- **`storyBosses.ts:168`** (to the Drake): "You sound terrible. Drink some water." Pokey being kind to a boss goes against the rule that the softness comes from the boss, not from Pokey. But it's dry enough to read as a jab. Keep; flagged only so it's a choice.

**Dot** keeps her runaway sentences and goes short when it's serious (World 6's "Go on" scene, World 8's "I know. I've known since the morning he left.", World 10's confession). Her secret-keeping across Worlds 1–8 is consistent, not a drift: she dodges every time the letter comes close. Drift:
- **`storyWorlds.ts:143`:** "I'll take it. I've worked for less." That's Pokey's dry rhythm in Dot's mouth (Part 2, item 21).
- **`storyWorlds.ts:134`:** a wise, balanced line (Part 2, item 6).

**Meeca** is the same person in every note: warm, practical, manners as armor ("Please don't tell him I said thank you"), lying neatly in the tower and writing messy when it's real. The angry scene at the end is her arc, set up by "Who told you that?" in the prologue and "who told him to call me that?" in the tower. No drift.

**The General** talks in short orders and counts, all the way through:
- "Spoons." / "Forty-five." / "One. Two." at her door.
- In the ending, counting stops working: "I have lost count."
- His jokes only come at the very end ("I am beginning to think the bird has a problem."), exactly as VOICE.md says.

One drift: **`storyBosses.ts:181`**, "I have buried what late costs. I will not bury another." That's a crafted speech, not an order (Part 2, item 15).

**Pell** never uses a contraction in any line I checked, and apologizes inside every sentence, including Meeca's stage. No drift. The new lines drafted in Part 1 keep that ("Since the first tree. I am sorry.").

**Grandma:** every line is short, warm and attached to a thing (the chair, the knitting, the fern, the kettle, the fence and the rabbits). No drift.

**The guardians** follow the planned arc. They laugh at him early (snake, croc), have heard rumors by the middle (Prowler, Eagle, Queen, Reaver: "I thought you'd be taller"), and are nervous at the end (Golem calls him early; Monarch hoped he'd take the long way; Drake "did not tidy"). Each keeps its own voice:
- the snake's few s's;
- the croc's vanity;
- the Prowler's stiff formality;
- the eagle's pride;
- the Queen's "darling";
- the Golem's slowness;
- the Monarch's softness;
- the Drake's loneliness.

One thing to trim:
- **`storyBosses.ts:118, 120`** (Reaver): four words in capitals in two lines (LUNCH, WON, NOW, GO). VOICE.md says capitals only for a real shout. Keep "LUNCH"; drop the rest: `and WON` → `and won`, `cold NOW` → `cold now`, `GO.` → `Go.` **[approved]**

**Flicker (new, he/him):** the lines drafted in Part 1 keep him short, local and earnest ("Nobody from here walks that loud", "It hums when anything touches it"). He never jokes about his own guilt. He says "I was the light" once, at the end of Meeca's stage, and tells the whole of it only once, to Dot in World 9 (Part 1, item 9). Keep it that way when the rest of his lines get written.

---

## Part 5: Third pass (jokes, mood, what each line wants, the bosses, and the story as a whole)

### How I judged this pass

- **Jokes:**
  - the funniest word goes last;
  - a joke has one button, and a second one steps on it;
  - never explain the joke;
  - Pokey's sarcasm only works when the opposite is obvious from the picture and the line before.
- **Kids and adults:** a joke kids get on the surface and adults enjoy underneath. A sad moment is played straight, with no gag to rescue it.
- **Mood:**
  - panic talks short, broken and repeating;
  - calm talks in full sentences;
  - a scene holds its mood with sentence length, silence and one concrete detail;
  - relief comes only after it's earned.
- **Intent:** for every line, ask what this character wants right now. A line that only sounds nice, or only fills space, gets cut.
- **Pixar's yardstick:**
  - the story spine (Once upon a time, every day, one day, because of that, until finally);
  - a hero with a want and a flaw;
  - an emotional low point before the end;
  - payoffs set up early;
  - we love a hero for trying more than for winning.
- **The bosses' arc** across the game: stunned and embarrassed early, worried that the rumors were true in the middle, nervous before he even arrives at the end.

I also looked at the art so the words fit what the player sees:
- the backdrops in `src/assets/backdrops/`;
- the story pictures (cell, cookhouse, council, courtyard, door, gates, Grandma's door, hill, nests, ruins, tea, village, war room);
- today's new sheets in `reference/prop-sheets/`.

Sources:
- [Pixar's 22 rules of storytelling, Emma Coats (Laughing Squid)](https://laughingsquid.com/22-rules-of-storytelling/) and [NYFA's summary](https://www.nyfa.edu/student-resources/pixars-rules-for-great-storytelling/)
- [The rules of storytelling, Pixar style (Writer's Digest)](https://writersdigest.com/there-are-no-rules/the-rules-of-storytelling-pixar-style)
- [Put the funniest word at the end (Goodreads author blog)](https://www.goodreads.com/author_blog_posts/24497512-tips-to-add-humor-to-your-writing) and [How to make your lines as funny as… (Chuffah)](https://chuffah.substack.com/p/how-to-make-your-lines-as-funny-as)
- [John Vorhaus's comedy writing tools (No Film School)](https://nofilmschool.com/john-vorhaus-comedy-writing-tools)
- [Three tips on writing dialogue, Peter Selgin (Writer's Digest)](https://writersdigest.com/write-better-fiction/three-tips-on-writing-dialogue) and [Strong feelings, few words (Quote Unquote)](https://blog.quoteunquoteapps.com/296-strong-feelings-few-words/): short staccato lines under stress, the meaning under the line.
- [Effective dialogue (The Write Practice)](https://thewritepractice.com/effective-dialogue/)

### World by world

Each world: what it's about and its tone, then the fixes, smallest first. Lines already fixed in Parts 1–4 aren't repeated.

**Prologue: the slowest morning, then the worst one.**
- **What it does:** warm, funny and specific, with Dot late and the snail joke, then the drop. The thunder is the hinge.
- **Tone:** exactly right until the kidnapping.
- **One problem, and it's the one you named:**
  - **`storyIntro.ts:73`** (Dot, seconds after Meeca is grabbed): "Pokey. Pokey, look at me. Somebody has to see where they take her, and I'm the fast one. I'll follow them, I'll find out where they're going, and I'll come straight back for you. Straight back. Do you hear me? Don't you go anywhere without me." It starts in panic but turns into a calm plan with a reason in it. → `Pokey. Pokey, look at me. Look at me. I'm the fast one. I'll follow them. I'll see where. And I'll come straight back. Straight back, do you hear me? Don't you go anywhere without me.` **[approved]**
- **Keep, on purpose:**
  - Pokey's "Excuse me, sir?... You seem a little grumpy." is him choosing manners in a crisis, which VOICE.md plans; it's who he is.
  - Meeca's "You're blocking my flower" is her indignation as armor.
  - The General's calm is the scariest thing in the scene.

**World 1: following the petals.**
- **What it does:** a gentle start, a little lonely, with laughs from the squirrels and Dot's bush. The heart is the margins note ("She falls off the end of the line"), the first quiet gut-punch, and it's earned.
- **Fixes:** none in the scenes. "It was a nice bush" and "Same thorn, both times" are the right kind of button: last word, then move on.

**World 2: the slow village.**
- **What it does:** the funniest world on purpose (the crier, the mailman, the raft). The sadness hides underneath: "Any day now", and Dot staring at a reed. Kids get the slow village; adults get the parents.
- **Fixes:** only the `Don't you dare.` sting (Part 4).

**World 3: the dark.**
- **What it does:** the first real fear, played straight ("That doesn't make them smaller"), then the fern search for comedy.
- **Fix:**
  - **`storyWorlds.ts:161`** (Dot): "All ferns look alike. That's the thing about ferns." The second sentence explains the joke. → cut `That's the thing about ferns.` **[approved]**

**World 4: the cost.**
- **What it does:** the biggest scare so far (the ledge), then the feathers. The tone is right: Dot's panic on the vine is short and broken, the way it should be.
- **Fix:**
  - **`storyWorlds.ts:207`** (Dot): "...the berry won. It won by a lot. I was really thorough about it." "It won by a lot" steps between the joke and its button. → cut `It won by a lot.` **[approved]**
- **Keep:** after the fall, Dot's "Horns have somebody on the other end. Thunder doesn't. I always listen for which one it is." It looks like a calm aside, but it's her secret (she listens for storms because of the warning she was late with). That's the best kind of line: kids hear a fact, adults hear a confession later.

**World 5: the trap of comfort, and Meeca's night out.**
- **What it does now:** with Meeca's stage first, this becomes the game's high point of hope: a happy escape, a sudden catch. Then Pokey walks the same trail. Tone: lovely and eerie, with the jokes polite and sharp ("That's what makes it scary").
- **Fixes:**
  - **`storyBosses.ts:101`** (Pokey to the Queen): "Sorry I'm late. Somebody carved me a note about your chairs." The sarcasm is "Sorry I'm late." (she set the table a week early). The second sentence explains it. → `Sorry I'm late.` **[approved]**
  - **`storyMemories.ts:95`** (Dot at tea): "...I'm forty percent sugar already. I'm practically a cookie myself." Three jokes in a row, and the last explains the one before. → cut `I'm practically a cookie myself.` **[approved]**
- **Art fit:** Meeca's stage must say night at the start (the camp art is night, then dawn), so the card's "at dusk" changes (Part 1). The Butler, beetle and tea wall all match the words planned.

**World 6: the last note.**
- **What it does:** dread, then loss (Dot leaves), then the game's emotional low point: "I'm tired," the sealed note, "He'll have stopped." This is exactly where Pixar puts it, about two-thirds through, and it pays off "Slow isn't stopped" from World 5. With Flicker arriving, the second half gets a small warm light without losing the loneliness.
- **Fixes:**
  - **`storyWorlds.ts:253`** (Dot): "I've backed up about nine feet, which for me is a lot." For a hummingbird nine feet is nothing, so the joke points the wrong way. → cut `, which for me is a lot`, leaving `I've backed up about nine feet. I'm just over here!` **[approved]**
  - **Art and lighting (code, not text):** the World 6 opening is set to dusk (`storyWorlds.ts:247`, `m: 'dusk'`), but Dot says the sun is "directly overhead." → set the opening chapter to `m: 'day'` and keep dusk for the halfway scene.

**World 7: the quiet.**
- **What it does:** alone (now with Flicker), slow and sad, with the Golem as the one big laugh and the photograph as the heart. The mood is built well: short narrator lines, the empty eleventh chair, Pokey humming badly to fill a gap.
- **Fixes:** none beyond Parts 1 and 4.

**World 8: wake up.**
- **What it does:** warmth comes back (Dot returns, Meeca knows), but with weight (Dot's "I know. I've known since the morning he left."). Then Pell, the funniest new character, right when the story needs air.
- **Fix:**
  - **`storyWorlds.ts:320`** (Dot): "She's really funny when she's scared." This explains Meeca's note joke ("I bet you're asleep right now") to the player. → cut. **[approved]**

**World 9: the last silly one.**
- **What it does:** deliberate relief before the end (the soup, the scarf, the nervous Drake), with the blessing memory as its heart. The relief is earned, coming after Worlds 6–8.
- **Fixes:** none. "I thought I'd start there." is one of the best buttons in the game.

**World 10: thunder.**
- **What it does:** the biggest fear and the biggest confession, and Pokey's one plain "I'm afraid of thunder." Then the climb alone. The mood is built on purpose: short lines, Dot's ramble breaking.
- **Fixes:** only the optional sting from Part 4. Dot's confession is right as it is: broken, repeating ("I took the wrong river. I took the wrong..."), short when it matters.

**The ending.**
- **What it does:** the payoffs land one after another, all set up earlier:
  - the song;
  - "Hello, Grandpa";
  - "I should have knocked";
  - Dot in flour and "Seems to me it's still morning";
  - Grandma's letter, "It was only weather";
  - the snail.
- **Fixes:** Part 2's trims. The epilogue (Gruntlewick, Pell's crooked sign, the Golem finishing his sentence to the chairs) is the best kid-and-adult comedy in the game. Keep it all.

### The bosses: before and after each fight

The arc is already there. One middle boss needs a nudge.

| Guardian | Before | After | Fits the arc? |
|---|---|---|---|
| Venom Fang (1) | Can't picture it ("I did not picture this") | Stunned, embarrassed ("I tied myself in this knot on purpose") | Yes |
| Crocus Rex (2) | Laughs ("logs float past faster") | Embarrassed ("They'll make a sign!") | Yes |
| Shadow Prowler (3) | Heard it, doesn't believe it | Stunned ("I got tired first") | Yes |
| Sky Sovereign (4) | Heard it, "Cats lie" | Embarrassed ("never on the ground"), relieved | **Nudge:** the rumor should be proven true |
| Tarantula Queen (5) | Expected him slow | Saves face ("It was only silk, darling") | Yes |
| Marsh Reaver (6) | Heard the runners talk | Rumors true ("the runners are going to sing about this") | Yes |
| Stone Idol Golem (7) | Calls him early | Amazed ("so... fast") | Yes, the arc turned inside out on purpose |
| Night-Wing Monarch (8) | Nervous ("hoped you would take the long way") | Unsure it counts | Yes |
| Magma Drake (9) | Nervous ("I did not tidy") | Lonely, asks him back | Yes |

- **`storyBosses.ts:89`** (Sky Sovereign): `The cliff is yours.` → `The cat did not lie, then. The cliff is yours.` That pays off her "Cats lie." and puts the "rumors were true" beat in the middle of the game, where it belongs. **[approved]**
- **`storyBosses.ts:80`** (Pokey to the Sovereign): "I'm going to get Meeca back. She came through here with a column of soldiers." The second sentence is filler; she answers "I saw her." anyway. → `I'm going to get Meeca back.` **[approved]**

### Plain American English

There's very little to fix:
- **`storyWorlds.ts:85`** (Meeca's note): "porridge" → `oatmeal`. **[approved]**
- **`storyMemories.ts:184`** (Pell): "say I was in the latrine" → `say I was in the bathroom`. Kids won't know "latrine"; Pell stays formal in everything else. **[approved]**
- **`storyBosses.ts:91`** (Sky Sovereign): "mind the next collar" is a little British. → `watch the next collar`. **[approved]**
- **Art note, not text:** the new World 2 evening backdrop shows houses on stilts, but the story says the village "had dug its houses into the bank" with round doors. Use that backdrop for the river stretches, not where the bank houses are on screen.

### The story as a whole

**Spine:** Once upon a time there was a sloth everyone called too slow. Every day his friend Dot was late, and Meeca waited for him anyway. One day the General took Meeca and said he'd never make it. Because of that, he followed her petals through ten realms. Because of that, he lost the ground under him, then his friend, then his own nerve, and found out who the General was. Until finally he climbed into the thunder he's afraid of, held out his hand, and proved that slow isn't stopped.

**Want and flaw:**
- **Pokey:** wants to get Meeca back. His flaw is that he believes he's too slow and hides every feeling in a joke. The turn is World 10's plain "I'm afraid of thunder."
- **The General:** has the mirror flaw. He thinks fast is the only safe thing.
- **Dot:** is the same fear in a different body.

That's why the ending works: everyone is cured by the same letter.

| World | Want | Tension | Laugh | Heart | How it ends |
|---|---|---|---|---|---|
| Prologue | Watch the flower open | The thunder, the soldiers | Dot late, the snail | "Follow the petals" | Taken. Alone in the rain |
| 1 Canopy | Follow her | Leaving home | Squirrels, the bush | The margins note | The snake |
| 2 River | Get a raft | Waiting (a slow village) | Crier, mailman, croc | "Any day now" | A crooked crown |
| 3 Grotto | Find the way through the dark | First real fear | Ferns | Grandma's things | The ledge goes (biggest scare) |
| 4 Cliffs | Climb back up | The fall, the cost | Eagle's dive | Nine scratches | The eagle grounded |
| 5 Orchids | Don't stop | Comfort as a trap; Meeca caught | Chairs, the Queen | Meeca's night out, her trail | Tea: how the Pact began |
| 6 Mangrove | Cross the water | Dot leaves | The lunch note | **Low point**: "He'll have stopped" | Up out of the swamp |
| 7 Ruins | Keep going alone | Quiet | The Golem | The photograph | He knows who the General is |
| 8 Treetops | Reach her | Night | Pell | Dot returns; Meeca knows | Through the dream |
| 9 Volcano | One last push | The gates open | Soup, scarf, Drake | The blessing memory | The fortress above |
| 10 Highlands | Climb into the thunder | **Biggest fear** | Pell's bad sewing | Dot's confession | The hand held out |
| Ending | Bring everyone home | Meeca's anger | Flour, "Mostly." | Grandma's letter | The snail finishes |

**What works:** the setups and payoffs, all of them. Each character has a voice you could pick out with your eyes closed. The low point is in the right place. Relief comes after the hard stretches, never instead of them. Kids get the slow jokes; adults get the grief under them.

**The biggest changes that would lift it most:**
1. **Fix Meeca's timing** ("On the March North", decided). It turns World 5 from a contradiction into the game's high point of hope.
2. **Finish Flicker's story** in four small scenes (Part 1). It's the one new thread, and a half-told arc would be the only loose end in a very tight story.
3. **Let the sad beats breathe:** drop the five laugh hits under serious lines (Part 4).
4. **Make the prologue's panic sound like panic** (Dot's line above). It's the first scene everyone plays, and the one moment you named.
5. **Put the "rumors were true" beat in the middle** (the Sky Sovereign line). It's one sentence, and it makes the bosses' arc read clearly from end to end.

There's no flat stretch that needs a new scene. Worlds 8 and 9 are both warm, but 8 carries Dot's weight and 9 is the deliberate breather before the storm. Keep both.


---

## To build with the stages

Approved drafts, word for word, to be built with the stages and characters they need. Copied unchanged from Part 1 above.

Also waiting for the rebuild:
- Meeca's card sub-line becomes "The Orchid Sanctuary, at night." once her stage opens on the night camp. It stays "at dusk" until then, to match today's stage.
- Dot's 6-6 tip (`way.6-6`) is spoken by Dot after she has left; it becomes Flicker's line when Flicker exists.
- `way.9-3` (the sweating joke) moves to Flicker.
- `way.10-6` changes as drafted in item 10.

### 4. Meeca's own stage

`meecaLines.ts` (thoughts at lines 44-66, the caught lines, the ending at 89-99) was written for the old "back in line" stage. Most of it goes with the redesign.

**Keep:**
- the five warnings, word for word;
- `Last one. For Pokey.`;
- every Pell line in the ending.

**Change:**
- `Hairpin. Good. Thumb on the trunk, and hold.` → `Hairpin. Good. Round and round.` (Flicker shows the circle.)

**New ending, in order:**
- Pell: `Good evening, Miss.`
- Meeca: `...How long have you been there?`
- Pell: `Since the first tree. I am sorry.`
- Pell: `I did not see any carving, Miss. I did not see anything.` (existing)
- Flicker, very small: `I was the light.`
- Pell: `It is cold tonight. Here.` / `It is not from the General.` / Meeca: `Thank you, Pell.` / Pell: `Please do not thank me. It is embarrassing.` (all existing)

**Flicker's first line** when they meet in the dark: `You're not from here. Nobody from here walks that loud.`

### 5. 5-6, Where She Ran

**Stage goal** (`stagePlan.ts:79`): `"Meeca's Messages", 'Meeca carved messages as they marched her past. Find {n} of them.'` → `'Where She Ran', 'She got away from them here, for one night. Follow where she ran.'`

**New short scene at the clearing (end of 5-6):**

> *The trail of carvings ended in a small clearing. Four stakes stood in a ring in the grass, the kind soldiers hang lanterns from. The grass between them had mostly grown back.*
> *On the last tree, low down:* DON'T STOP TO LOOK. LOVE, M.
> **Pokey:** She got out.
> **Dot:** Not far enough.
> **Dot:** That's the night I lost them. I was a hill over, following a hibiscus. I told you she walked the whole way. I said that to you.
> *At the edge of the clearing, something small and bright blinked once, and was gone.*

The hibiscus is already in World 1 (`storyWorlds.ts:56`), so this pays it off. Nobody comments on the light.

### 6. World 6 order and noon

- **`stagePlan.ts:90`:** `'Before Noon', 'The Reaver eats lunch at noon. Get through before then.'` → `'Lights in the Roots', 'The roots go dark. Let the firefly light the way.'`
- **`stagePlan.ts:91`:** `'Swing through the roots alone now. Next branch.'` → `'Raise the water, lower the water, and find what Dot left you.'`
- **Dot's 6-6 tip** (`dotLinesData.ts:424`, `way.6-6`): Dot speaks here, but she has already left. → Flicker: `Don't look at me. Look where I'm lighting.`
- **Dot teaching swimming in 6-4** (new stage line, in her voice): `Sloths swim. You swim almost three times faster than you walk. You can hold your breath for forty minutes. Don't look at me like that, it's true.`
- **6-9:** Flicker's warning is just `It's nearly noon.` Pokey's answer stays where it already is, at the boss (`storyBosses.ts:113`), so it isn't said twice.

### 7. Flicker arrives (new, end of World 6's halfway scene, after `storyWorlds.ts:271`)

> *The leaf kept shivering. Then a small light came down through the roots and sat on it.*
> **Flicker:** You're Pokey.
> **Pokey:** Most days.
> **Flicker:** Your name's on a tree back in the orchids. I've been behind you ever since.
> **Pokey:** Can you get a note to her? Over the net?
> **Flicker:** I tried. It hums when anything touches it. They come running.
> **Pokey:** Who are you?
> **Flicker:** Flicker. Somebody who owes her.
> *He didn't say any more. He came and sat on the satchel strap.*

The net line answers "why can't the tiny firefly just carry notes?" before anyone asks it.

### 8. Lines that say Pokey is alone, now that Flicker is with him

All tiny edits:
- **`storyMemories.ts:118`** (after the Reaver): `There was nobody there to hear it. He said it again anyway.` → `Flicker had gone ahead to light the next root. He said it again anyway.`
- **`storyWorlds.ts:277`** (World 7): `He turned to say something to Dot. The air by his shoulder was empty.` → `He turned to say something to Dot. There was only Flicker, which wasn't the same.`
- **`storyWorlds.ts:292`:** `He left a gap after it, for the answer.` → `He left a gap after it, for the answer. Flicker didn't fill it.`
- **`dotLinesData.ts:426`** (`way.6-8`): `...leaves room on the root beside him. Out of habit.` → `...leaves room on the root beside him. Flicker sits in it. It's a lot of room for a firefly.`
- **`dotLinesData.ts:428`** (`way.7.hurt0`): `He says "I'm fine" to the empty ruins, out of habit. The ruins don't argue.` → `He says "I'm fine" to the ruins, out of habit. Nobody argues. Flicker blinks.`
- **`storyWorlds.ts:304`** (World 8): `The fireflies came out as the light went.` → `Flicker went on ahead, and the fireflies came out to meet it as the light went.`
- **`dotLinesData.ts:444`** (`way.8-6`): `Fireflies blink on along the branch ahead, one by one, like a lamp left lit just in case.` → `Flicker's family blinks on along the branch ahead, one by one.`

### 9. Dot and Flicker: jealousy, then the night they understand each other (decided)

Flicker is "he" everywhere. Once he arrives (end of World 6's halfway scene), he stays to the end.

**Who is with Pokey when:**
- **World 6, second half, and World 7:** Flicker only.
- **World 8:** Pokey falls asleep with Flicker, and Dot comes back from Meeca's window. That's the first time Dot and Flicker meet. Dot has already been to the window, so nothing breaks the rule that she doesn't meet Meeca before World 8.
- **World 9:** all three.
- **World 10:** see item 10. Dot leaves at the foot of the mountain, comes back halfway up, and goes around at the gate.
- **The ending:** all of them.

**Why Dot is jealous:** saving Meeca is her chance to make up for the warning she was late with, and a newcomer is doing the helping while she was gone. It's funny on top and real underneath. Flicker doesn't understand why she's prickly, shrugs it off, and holds his ground when she tries to boss him around. Mostly he's just earnest and helpful, because the one he let down is the one they're saving.

**First meeting (World 8, insert after Dot's arrival ramble, `storyWorlds.ts:311`):**

> *Dot stopped. There was a light on Pokey's satchel strap, and it was looking at her.*
> **Dot:** Pokey. There's a bug on you. A glowing one.
> **Flicker:** Flicker. Hello.
> **Dot:** How long has it been glowing at you?
> **Flicker:** Since the mangrove. And I'm a he.
> **Dot:** Since the mangrove. That's a long time to be glowing at somebody.

Then the approved scene goes on as written ("Dot. You came back. You're bleeding.").

**Jealousy and banter, three short beats:**
1. **World 8, stage tips (around 8-3/8-4).** Dot tries to push him around; he holds his ground.
   - Dot: `Flicker, go see if that branch is safe.`
   - Flicker: `You're faster.`
   - Dot: `I'm resting.`
   - Flicker: `You're hovering.`
2. **World 8 halfway scene (before `storyWorlds.ts:334`):**
   - *Flicker lit the branch ahead before Dot could say which one.*
   - Dot: `I was going to say that one.`
   - Flicker: `You can say the next one.`
   
   Then the approved scene goes on ("Dot, you're humming.").
3. **World 9, stage tips (before the Drake, beside `way.9-9`):**
   - Dot: `Plan for the Drake: Pokey says something dry, I panic, he gets confused.`
   - Flicker: `What do I do?`
   - Dot: `Glow quietly.`
   - Flicker: `I don't have a quiet setting.`
   
   Optional fourth, in the Pell scene (after `storyWorlds.ts:359`):
   - Pell: `I am sorry. Is the bug with you?`
   - Dot: `No.`
   - Pokey and Flicker: `Yes.`
   - Pell: `I am sorry. Good evening, sir.`

**The night they understand each other (World 9, new, the night before the mountain, just before "The open gates").** Pokey is asleep. This is the heart of their story. Dot sees herself in him, the one whose light or warning failed someone. She doesn't tell her secret, but the audience feels it.

> *The night before the mountain, Pokey fell asleep against a warm rock with his mouth open. Dot couldn't sleep. She never could, near weather. Flicker sat on a stone a little way off and turned himself down low, so he wouldn't keep anybody up.*
> **Dot:** You can turn that off, you know. Nobody needs it. I can see fine.
> **Flicker:** You flew into a rock an hour ago.
> **Dot:** I was checking the rock.
> **Flicker:** She got out, you know. Meeca. In the orchids. She was nearly all the way out.
> **Dot:** I saw the carvings.
> **Flicker:** She didn't know the way, so I lit it for her. Every tree. I was the one showing her where to go.
> **Flicker:** They followed my light.
> *Dot didn't say anything for a while.*
> **Dot:** How far did she get?
> **Flicker:** One more tree.
> **Dot:** And now you go over it. Every night. Which tree. What if you'd been somewhere else.
> **Flicker:** ...How do you know that?
> *Dot's wing went to the pouch at her side. She looked at Pokey, asleep with his mouth open, for a long time.*
> **Dot:** Lucky guess.
> **Dot:** Tomorrow, at the bottom of the mountain, I might say something to him. If I stop halfway, don't let me.
> **Flicker:** I won't.
> *She sat down on the stone next to him. She didn't take up much room. Neither did he. After a while, he turned himself back up.*

Why it works:
- It's funny until it isn't (the rock).
- There's no speech.
- It turns on one concrete detail: "One more tree."
- Dot describes her own nights as if they were his, and "Lucky guess" is the only cover she has. Kids hear Dot being kind; adults hear her confession coming.
- It's what gives her the nerve to tell Pokey the next morning.

**How this feeds World 10 (item 10):**
- **At the foot of the mountain:** the approved confession happens as written. One optional narration line before it, after `storyWorlds.ts:390`: `Flicker, on the rock beside them, didn't look away.`
- **Halfway up:** when she comes back, the first lines become a callback to their night:
  - Flicker: `You said not to let you stop halfway.`
  - Dot: `I know what I said. I know what I said.` (her own line from World 1)
  
  Then the drafted beat (her wing over his dimming light, "Next step.").
- **At the gate:** "Flicker, stay with him." is Dot handing over the job she was jealous of. That's the jealousy resolved, without a word about it.

**The ending (after Meeca's "Come here.", item 10):**
- Dot: `He's all right. Don't tell him.`
- Flicker: `I'm right here.`

### 10. World 10: Dot and Flicker guide him together (decided), and the ending

The shape: Dot's confession stays where the approved script has it, at the foot of the mountain. She runs from it, out of shame, not to the seam. Pokey climbs the first half with only Flicker. At the halfway point, after Meeca's song, Dot comes back. Dot and Flicker guide him together through the last stages. At the fortress gate, Dot goes around to the cookhouse seam to be "early for something, once." So the General's "I do not know where your bird is" still works, and Dot still turns up at dawn in flour, late, for "Seems to me it's still morning."

**At the foot of the mountain (`storyWorlds.ts:395-400`):** small changes only. The confession lines 392-393 are untouched.
- **395** (Dot): `You don't have to answer. I'm going in. I'm going to be early for something, once. I'm going to be so early that—` → `You don't have to answer. I need a minute. Don't wait for me.` (The "early for something, once" line moves to the gate.)
- **396:** `Dot—` stays.
- **397:** `...and then she was gone along the netting, around the black shoulder of the mountain, toward a badly sewn seam Pokey couldn't see.` → `...and then she was gone into the rain.`
- **398:** `Up the mountain, a flash, and something metal fell over. Then nothing at all.` → moves to the gate scene below.
- **399-400:** `Dot?` and the door "exactly his width" stay.
- **Add after 400:** `Flicker came and sat on his wrist, next to the petal, and lit the first step.`

**Halfway up (add after the song, `storyWorlds.ts:409`):**

> *Something small came down out of the rain and landed on the step in front of him. It was soaked flat, and it was Dot.*
> **Flicker:** You said not to let you stop halfway.
> **Dot:** I know what I said. I know what I said.
> **Dot:** I got as far as the ridge. I sat there. I'm not doing that again. I'm not going to be late for this one.
> *Flicker's light had gone dim in the rain. Dot moved over and held a wing above it, and it came back up.*
> **Pokey:** Next step.
> **Dot:** Next step.

**The last stages (10-6 to 10-9), the two of them together.** Their guilt shows only in what they do, never in a speech:
- Dot flies ahead to find the next handhold, the job she was late for once.
- Flicker stays at Pokey's hands to light them, the light he once gave away.
- Each keeps checking on him and pretending not to.

Tips in voice for the stages:
- Dot: `Next one's left. Left, Pokey. Your other left.`
- Flicker: `Here. Put your hand where I am.`
- Dot: `Don't you go anywhere without me.` (her prologue line, said quietly now)
- Flicker, when the thunder comes and he grabs the rock: `It's only weather.` Dot, after a beat: `It's only weather.`

**At the fortress gate (new, end of 10-9, before the General):**

> **Dot:** This is where I go around. The cookhouse seam. I'm going to be at her window before you're at the top. Early. For something, once.
> **Pokey:** Dot.
> **Dot:** Don't. Go in the front. Flicker, stay with him.
> **Flicker:** I will.
> *Then she was gone along the wall. Up above, a flash, and something metal fell over. Then nothing at all.*
> **Pokey:** Dot?

**Why "Seems to me it's still morning" still lands, and lands harder:** the approved ending has Dot turn up at sunrise, covered in flour, apologizing for being late. Now that comes straight after she promised, at the gate, to be early "for something, once." She's late one more time, the last time, and Pokey forgives her with the same joke he made the first morning she was late. The line doesn't move; only what's in front of it does, and that makes it sharper.

**Everything else in World 10 and the ending still fits:**
- the General's "Where's Dot?" / "I do not know where your bird is";
- Pokey's "She came back every time." That's even truer now, because he's just watched her come back down the mountain to him.

Dot's tip at **`dotLinesData.ts:463`** (`way.10-6`): `Between swings he checks the netting for a small green shape. Nothing yet.` That's still true before the halfway point. If 10-6 falls after it, → `Between swings he checks that the small green shape is still with him. It is.`

**Flicker in the ending (after Dot's return, `storyFinale.ts:113`):** it has been with Pokey all night.

> *The small light on Pokey's wrist lifted off and stopped a little way from Meeca.*
> **Meeca:** There you are. I wondered where my light went.
> **Flicker:** I'm sorry.
> **Meeca:** You got me a whole night out. Come here.

**World 9:** **`dotLinesData.ts:451`** (`way.9-3`): `It's so hot Dot has stopped glowing and started sweating.` → `It's so hot Flicker has stopped glowing and started sweating.` (Dot doesn't glow; Flicker does. He's along in World 9, decided.)
