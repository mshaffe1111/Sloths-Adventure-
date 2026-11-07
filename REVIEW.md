# Consultant review: Pokey, stage 1-1, the stage builder and the play data

Independent review, 7 November 2026. Sources: FEEL.md, STAGES.md, DATA.md, PLAY.md, STRIPS/, and the research in BENCHMARKS.md. Benchmark claims below refer to the sources listed there.

## Before you read

- **I could not play the live game.** From my machine, the network proxy refused every connection to `mshaffe1111.github.io`, so I couldn't run the portrait (412×915) and landscape (915×412) touch sessions you asked for. Everything below comes from the files. Where I did my own arithmetic, I ran the movement numbers from FEEL.md through a small simulation using the same order of steps and the same 1/30 s tick that FEEL.md describes. I mark those as "my simulation".
- **Ranking** is by impact on players: how many players it hits, multiplied by how badly.
- **Confidence:** *high* means the files show it directly; *medium* means it's a strong inference with one gap; *low* means it's a plausible reading.
- **Fact or taste:** *fact* means it can be checked; *taste* means a judgement where good designers could disagree.
- Every suggestion says WHAT to change and WHY. None of it is code.

### The three headlines

1. **A child on Easy spent 37 minutes on a "3-minute" level,** with 155 put-backs in one section. Nothing in the game changed while that happened, and that child is the only tester who said they wouldn't play the next level.
2. **The double jump is mostly not being taught or used.** Testers made about 2 double jumps per run. The "double-jump" teaching gaps can be crossed with an ordinary late jump, so the first place the double jump is truly required is the end of the stage, where every life on Normal was lost.
3. **The stage builder's own safety numbers are wrong for the part of the stage where players die.** STAGES.md says no fall in 1-1 costs a life. The play data shows 21 lives lost to falls, all of them in the treetop sections at the end.

---

## Findings, ranked by impact on players

### 1. Easy has a put-back loop with no way out, and it turned 3 minutes into 37 for a child

**What this game does.** On Easy, a fall puts Pokey back on the last solid ground he stood on, at most 150 px from the edge, with nothing lost (FEEL.md §8). The put-back repeats without limit; nothing else changes.

**The data.** Player I (Easy, one run):
- 2,231 seconds to finish. The Easy median is 206.
- 187 put-backs, which is 83% of all 224 put-backs in the whole test.
- 155 of those were in a single section, `w1-log-chain`.
- 932 jump inputs, but only **2 double jumps**, and 167 taps read as punches.
- Survey: fun 4, "Would you play the next level?" **No**, "Did Dot's tips help?" **No**. Player I is the only tester to answer No to the next-level question.

On Easy, `w1-log-chain` is floating logs with two 136–140 px rises and level gaps of about 202 px, "all taken with double jumps" (STAGES.md table 3a, #59). A player who can't make the double-jump gesture has no answer to that section, however many times they're put back.

**What strong platformers do.**
- *New Super Mario Bros. Wii* offers Super Guide (a computer-controlled Luigi plays the level) after 8 deaths on one level.
- *Crash Bandicoot* quietly slows hazards, gives a protective mask and adds checkpoints where you keep dying.
- *Yoshi's Woolly World* Mellow Mode lets Yoshi hover forever, so a missed gap stops being a miss.
- *Kirby* floats without limit.

The common pattern is **escalation**: after repeated failure in the same place, the game changes the problem. A put-back is a fast retry. Without escalation it's a treadmill. (BENCHMARKS.md §9, §12)

**Evidence.** DATA.md per-player table, the put-backs-by-player line and the survey row for player I. STAGES.md #59. FEEL.md §8 (soft put-back) and §4 (Jump help is Off by default).

**Suggested change.**
- **WHAT:** Count failures per spot. After a small number of failures in the same section (Super Guide's 8 is a known reference; for a child on Easy, fewer is reasonable), step in with escalating help:
  - first, Dot shows the move;
  - then the gap gains a bridge, a hover or a mushroom, or Jump help switches on;
  - finally, offer "Dot carries you to the next flag".
- **WHAT:** On Easy, switch Jump help on by default.
- **WHY:** The one player who said "No" to the next level is the one who hit the loop. A 10× overrun on a first stage is the strongest drop-off signal in the data. Escalation keeps the fast retry you already have while making sure no section can trap a player for half an hour.

**Confidence:** high. **Fact** (that the loop exists and what it cost); the trigger count is taste.

---

### 2. Lives are lost exactly where the builder reports "no fall costs a life"

**What this game does.** STAGES.md §2 says "Every gap is a soft fall: 8,082 falls across both settings, none costs a life." FEEL.md §8 says the World 1 kit lays no lethal pits on 1-1, and lists "whether any 1-1 roll lets him fall below level height + 120 px" as *not found*.

**The data.** 21 lives were lost, every one by "pit" (DATA.md). They fell only in the treetop sections at the end of the stage:

| Section | Lives lost | Entries |
|---|---|---|
| `w1-log-chain-rise` | 5 | 8 |
| `w1-mushroom-chain-back` | 5 | 11 |
| `w1-mushroom-chain` | 4 | 7 |
| `w1-log-chain` | 3 | 19 |
| `w1-canopy-rungs` | 2 | 4 |
| `w1-canopy-rungs-level` | 1 | 20 |
| `w1-high-walk-up` | 1 | 8 |

Strip B (seed 2727) shows the second row of floating logs over open air.

**What strong platformers do.** They know where their deadly drops are, because checkpoint spacing, coin placement and the difficulty curve all depend on it. Shovel Knight's studio says a lack of checkpoints "can typically cause a lot of frustration". (BENCHMARKS.md §8)

**Evidence.** The builder's fall count appears to measure only *gaps on the route* (`gen2.falls`). It doesn't count falling off the side of a floating log or bough. So its safety rules may never fire in the boughs. For example, FEEL.md §8 allows flags up to 4,000 px apart, but only 2,300 px "where a life can be lost", and the builder believes no life can be lost in 1-1.

**Suggested change.**
- **WHAT:** Have the builder measure every place a fall can end below the level, not only route gaps. Report lethal drops per section and apply the tighter checkpoint rule there.
- **WHAT:** On 1-1, put a floor or a catch bough under every treetop piece, or make treetop falls a put-back on Normal too.
- **WHY:** At the moment the stage's hardest part is also its only deadly part, and the tools say it's safe. That combination means nobody on the team is looking at the spot that ends runs.

**Confidence:** high that the mismatch exists; medium on the cause (I couldn't see the builder code). **Fact.**

---

### 3. The double jump isn't actually taught: the "double-jump gaps" can be crossed with a single late jump

**What this game does.** The second section of every layout is "Intro: double jump", with gaps "laid at 195–203 px" (STAGES.md §0). Later sections use level gaps up to 227 px, and 136–140 px rises "taken with double jumps".

**My simulation** uses FEEL.md's numbers: full run, touch jump, 30 fps steps.
- A plain single jump moves Pokey's centre about 175 px.
- If he runs off the edge and jumps during the 1-1 coyote window (0.214 s, 6 ticks), he gains about 20–30 px more.
- The 26 px lip hoist lets him climb on even when his feet arrive below the far edge.
- On top of that come the 15.8 px ledge catch on the far side and his 44 px-wide body.

Put together, 195–203 px gaps are within reach of one late, running jump, and so, for many players, are the 227 px ones. The 136–140 px *rises* are not: a single jump tops out at about 97 px, plus the 26 px hoist, which makes 123 px.

**The data.** 91 double jumps in 47 runs, about **2 per run**, against about 158 jump inputs per run.

| Player | Runs | Double jumps |
|---|---|---|
| A | 16 | 31 |
| B | 11 | 22 |
| I | 1 | 2 |

A single layout's double-jump intro alone has 2–6 such gaps (STAGES.md table 3b, #7 and #8). So players are crossing the "teaching" gaps without the move being taught. The first place a double jump is *forced* is a 136–140 px rise, which in most layouts comes in the Challenge or Showpiece slot. That's exactly where every life in finding 2 was lost.

**What strong platformers do.** They introduce a move where *only* that move works and failure is cheap, then develop it (Hayashida's introduce → develop → twist → conclude; SMB 1-1 teaching each element alone). (BENCHMARKS.md §10)

**Suggested change.**
- **WHAT:** Make the double-jump intro need the double jump, using a rise taller than about 125 px over a soft floor, rather than a wide gap that generous coyote time can cover. Keep coyote generous; change the *shape* of the test.
- **WHAT:** Make the double jump readable, for example with a visible "second jump ready" cue on Pokey.
- **WHY:** A player who first meets a forced double jump at the end of the stage, over a deadly drop, learns the move at the worst moment. The data's 2-per-run figure says that's what is happening.

**Confidence:** medium-high. The arithmetic and the data agree, but I'm assuming the double-jump counter is accurate and that Pokey leaves the ledge when his centre passes the edge (see Questions). **Fact.**

---

### 4. On touch, every jump is the same height, so there is no short hop

**What this game does.** "Every touch jump counts as held for 220 ms" (FEEL.md §3). By 220 ms the upward speed has already fallen below the 230 px/s cut-off, so releasing the finger changes almost nothing:

| Input | Apex |
|---|---|
| Touch flick | 97.2 px |
| Holding the whole time | 97.8 px |
| Keyboard tap | 10.3 px |

The "apex hang" (lighter gravity at the top) needs the jump to be held when vertical speed is under 90 px/s. That moment comes after the minimum hold has ended, so on touch it seldom applies. In practice the phone version has **one jump height**.

**The data.** Three separate notes from players B and F describe the same thing:
- "Petals sat on a log directly under another log"
- "jumping kept landing on the upper log"
- "had to run off an edge and fall onto it"

That's the problem a short hop solves.

**What strong platformers do.** *Super Mario Run*, a one-finger phone game, keeps variable height: "tapping makes Mario jump, pressing and holding makes him jump higher." *Alto* uses hold time as its second action. *Celeste* and Mario both give a choice of height. (BENCHMARKS.md §3, §14)

**Suggested change.**
- **WHAT:** Let how long the finger stays down after the flick set the height (quick flick and lift = low, flick and keep the finger down = full), with a shorter minimum hold.
- **WHAT:** If you'd rather keep one height, the builder should never place pickups or required landings that need a low jump under a higher surface.
- **WHY:** Players are already reaching for a short jump and not finding one, and it is costing them lives (B: "Lost one life trying").

**Confidence:** high. **Fact** for the mechanics and the notes; keeping a single height would be a legitimate **taste** choice, but then the layouts must respect it.

---

### 5. The bounce is introduced already combined with the double jump

**What this game does.** All three "Intro: bounce" sections (`w1-hop-bounce` in 107 layouts, `w1-mushroom-bank-teach` in 28, `w1-mushroom-lift` in 3) send the player up a bank that is **200–240 px** tall (STAGES.md #10–12). A bounce alone rises 167.6 px at 30 fps (FEEL.md §6), and with the 26 px hoist that's about 194 px. So every first bounce needs a bounce *and* a double jump. My simulation says the combination reaches the most height when the double jump is pressed straight after the bounce, not at the top, which is the opposite of what most players will try.

**The data.** "What felt hardest?" got 19 answers: **"The mushroom bounce": 8**, more than everything else combined. The section ranking can't see this. `w1-hop-bounce` shows 0 put-backs in 59 entries, because a missed bounce just drops you back to the floor to try again.

**What strong platformers do.** They show one new thing at a time, first in safety, then combine it (BENCHMARKS.md §10). In those terms, "bounce plus double jump" is a *develop* or *twist* step, not an introduction.

**Suggested change.**
- **WHAT:** Make the first bounce land on something a bounce alone reaches (under about 150 px), and keep "bounce, then double jump" for a later slot such as Combine, which already exists.
- **WHY:** Testers rated the bounce the hardest thing in a stage whose bounce is supposed to be a lesson. The tools rate that section as effortless, so nobody has been prompted to fix it.

**Confidence:** high on the heights; medium on the cause of the survey answer. **Fact** (heights) and **taste** (where the combination belongs).

---

### 6. The first stage is a lottery of 138 layouts, and its difficulty swings with the draw

**What this game does.** Every press of Play takes the next of 138 shuffled layouts; no two share a section order (STAGES.md §0–1).

**The data.** Put-backs per entry vary enormously by section:

| Section | Put-backs per entry |
|---|---|
| `w1-log-chain` | 8.16 |
| `w1-canopy-rungs-level` | 1.30 |
| `w1-log-chain-rise` | 0.25, but 5 lives lost in 8 entries |
| most other sections | 0 |

Which Showpiece you're dealt (29, 51, 23 or 39 layouts out of 138) largely decides how hard your first stage is. And 47 runs covered 43 layouts, so **no layout has been played often enough to judge it**.

**What strong platformers do.** First stages are fixed and polished. Miyamoto's team reportedly designed SMB 1-1 *last*, once they knew what it needed to teach. A fixed first stage can be playtested many times and tuned, and a returning player can measure their improvement on it. Randomness is normally saved for games built around replay. (BENCHMARKS.md §10)

**Suggested change.**
- **WHAT:** For the first stage a new player sees, use one layout (or a small, tested handful), chosen because the play data shows it teaches well. Keep the shuffle for replays and later stages if you like.
- **WHAT:** Narrow the Showpiece pool for 1-1 to sections that have earned it in testing.
- **WHY:** You can't tune what you can't replay. At the moment, two new players on the same day get first stages whose hardest part differs by an order of magnitude.

**Confidence:** high that the variance exists; that randomness is wrong for a *first* stage is **taste**, with strong genre precedent.

---

### 7. Taps are read as punches in a stage with nothing to punch

**What this game does.** Any short tap becomes a punch (FEEL.md §7). 1-1 has no creatures (FEEL.md §6: `creatures: []`). Punching slows Pokey while it plays out (jab ×0.85 speed, mega ×0.3), and a resting finger becomes a mega punch after 550 ms.

**The data.** 488 taps were read as punches and 161 of them were cancelled. Damage hits from creatures: 0.

| Player | Punches | Cancelled | Note |
|---|---|---|---|
| G | 114 | 102 | one run |
| E | 88 | 55 | |
| I | 167 | – | the child |

That's input noise: fingers trying to do something else, most likely jump or steer.

**What strong platformers do.** The best phone platformers give each finger one clear job (Super Mario Run, Rayman, Alto), or split the screen into fixed jobs and offer buttons (Oddmar, Leo's Fortune). Research on children finds flicks among the *least* intuitive gestures, and 5-year-olds' gestures are recognised correctly only 64% of the time. (BENCHMARKS.md §14, §16)

**Suggested change.**
- **WHAT:** Don't turn taps into punches unless something punchable is nearby. Your sideways *kick* already works this way, firing only within 260 px of a creature. In 1-1, consider leaving punch out until it's introduced.
- **WHY:** In a stage without enemies, every punch read is a misread that slows the player. It adds friction for children in particular, who tap the most.

**Confidence:** high (data and rules). **Fact.**

---

### 8. Petals lead players into trouble instead of along the path

**What this game does.** Each layout has 92–149 petals (STAGES.md §0), placed by the section designs. The builder checks reach for the route, but nothing in the files says it checks whether each petal can be reached with the moves a player has *on 1-1*.

**The data.**
- Player A: "Jumped off cliffs while trying to collect the pink balls."
- Player B, twice: petals under a log that "does not read clearly without the float move." The float (leaf glide) unlocks after 4-1 (FEEL.md §6).
- Player F: petals "on a log that could not be jumped to or dropped onto".
- "Did anything look wrong?" got 5 Yes answers; 2 of the 5 were this, and F's note above came in a separate comment.

**What strong platformers do.** Pickups are breadcrumbs: a row of coins traces the jump you should make, and early on, valuable pickups aren't placed over deadly drops. Detours hinted by pickups are optional and safe to try. (BENCHMARKS.md §13)

**Suggested change.**
- **WHAT:** Add a builder check that every petal is reachable with 1-1's moves *and* the touch jump's real (single) height, and that no petal trail leads off a ledge with no catch below.
- **WHAT:** Where petals sit on a lower road, put the way in at the start of that road, rather than leaving it to a drop.
- **WHY:** Players follow pickups. When pickups point at unreachable places or off cliffs, they teach the player that the game's hints can't be trusted.

**Confidence:** high (four notes from three players). **Fact.**

---

### 9. The play data mostly reflects two practised adults and can't support decisions about the difficulty curve

**What the data is.**
- Players B, D, E and F are one person; G played on B's phone. That's **20 of 47 runs** from one person (22 with G).
- Player A played 16 runs.
- So two people account for 36–38 runs, and only one run comes from a child.
- The testers' page says "about 3 minutes" before play, and "How long did it feel?" came back "About right" **42 of 42** times. A unanimous answer after the length was announced tells you little.
- The section ranking (put-backs + 3 × lives) can't see failures that don't trigger a put-back, such as missed bounces (finding 5), so the hardest-feeling move never shows up as a problem section.

**What strong platformers do.** Nintendo and others watch many first-time players, especially for first stages. Celeste's and Mario's help systems exist because first-timers fail in ways practised testers don't. Designer Erin Robinson's advice is to "have people play your level often, so you can see exactly where players are likely to get lost." (BENCHMARKS.md §13)

**Suggested change.**
- **WHAT:** Before acting on curve or length, run 10 or more *first-time* players, including 3 or more children in your target age range, each on the same fixed layout (see finding 6).
- **WHAT:** Record attempts per obstacle, not only put-backs: mushroom landings, double-jump presses and misses per gap.
- **WHAT:** Ask about length without announcing it first.
- **WHY:** The current numbers can't tell "the stage is right" from "two people have learned it".

**Confidence:** high. **Fact.**

---

### 10. A first stage of three minutes or more is long by phone and genre standards

**What this game does.** Spawn to exit is 30,585–40,729 px. The modelled time is 174–230 s, and the actual median is 204 s on Normal. Layouts have 12–15 sections with 10–15 checkpoints (STAGES.md §1, §4).

**What strong platformers do.**
- Super Mario Run courses mostly have **60–90 s** timers.
- SMB 1-1 is about 3,584 px and takes a first-timer roughly 1–1.5 minutes (common knowledge, not verified).
- Rayman Jungle Run levels are short.
- The median phone session is about **5–6 minutes** (GameAnalytics 2025). A 3.5-minute first stage takes most of a typical session.

(BENCHMARKS.md §11)

**Evidence.** The stage teaches 3 moves in its first 4 sections, then repeats variations for 8–11 more. Most players will have learned what 1-1 teaches by about the halfway point.

**Suggested change.**
- **WHAT:** Try a 1-1 of about 6–8 sections (about 90–120 s) that ends on a short, well-tested Showpiece, and move the treetop finale to 1-2.
- **WHY:** A shorter first stage gives a sooner "I finished a level", leaves fewer chances for the long-tail failures of findings 1–3, and leaves room in the session for 1-2. Test it, though: your survey disagrees (see "They may be right").

**Confidence:** medium. **Taste**, with benchmark support.

---

### 11. 30 fps with a variable step: slower phones get a laggier, slightly different jump

**What this game does.**
- It's locked to 30 fps, and each step uses the real elapsed time. A 60 Hz fixed step is declared but unused (FEEL.md §0).
- Input waits 0–33 ms for the next update, and a jump flick needs at least about 43 ms of finger travel.
- By my simulation, the same jump peaks at 97 px at 30 fps, 95 px at 25 fps and 92 px at 20 fps. Coyote and buffer windows are counted in whole ticks, so they shrink too.

**The data.**
- Adreno 619 in landscape: median 25 fps, 10th percentile 19.5 fps, worst frame 970 ms, 96 stalls.
- The iPhone changed quality level **56 times**, a sign the automatic quality setting keeps switching back and forth.
- Player B: "Sideways felt less responsive for jumping and moving."
- Player D, twice: "The frame rate was poor at times."

**What strong platformers do.** Mick West measured 60 fps games at about 67 ms from press to response, and 30 fps games at 100–300 ms. Players notice from about 150 ms. Precision platformers generally run at 60. (BENCHMARKS.md §15)

**Suggested change.**
- **WHAT:** Run the movement on a fixed step, so a jump is the same on every phone, and test whether the strong phones in your data (Imagination, Adreno 730/735, which hold 30 fps flat) can sustain 60.
- **WHAT:** Damp the quality switching on iPhone.
- **WHY:** The layouts are built against exact jump numbers. A jump that changes with the phone's frame rate makes the same gap harder on cheaper phones, and the responsiveness complaint came from landscape, the slowest orientation.

**Confidence:** medium. The effect on the jump is small; the latency case is benchmark-backed, but I couldn't measure it. **Fact** (mechanism), **taste** (whether 60 fps is worth the cost).

---

### 12. Dot's tips aren't seen

**The data.** "Did Dot's tips help?": "Didn't notice them" 12, No 1, Yes 1.

**What strong platformers do.** They teach through the level's shape rather than text (SMB 1-1). Super Guide and Odyssey Assist *show* the answer (Luigi plays it, arrows point the way) rather than telling. (BENCHMARKS.md §10, §12)

**Suggested change.**
- **WHAT:** Either have Dot *demonstrate* (fly the arc of the jump, hover where the double jump goes) at the moment a player fails, or drop the tips and put the effort into finding 3 and finding 1.
- **WHY:** A help channel that 12 of 14 respondents never noticed costs screen space and doesn't help. It's also the natural carrier for the escalating help in finding 1.

**Confidence:** high. **Fact** that the tips go unnoticed; what replaces them is taste.

---

### 13. The "twist" step is missing from most layouts

**What this game does.** The Twist slot appears only in outline C, which is 9 of 138 layouts (STAGES.md §2). The other 129 go intro → practice/fork → challenge → showpiece → end. Five more twist kinds, and several combination kinds, exist in the pool but appear in no layout (STAGES.md §3).

**What strong platformers do.** Hayashida's structure puts a twist before the conclusion: the known idea is turned on its head, and that's where a stage feels clever. (BENCHMARKS.md §10)

**Suggested change.**
- **WHAT:** If 1-1 is shortened (finding 10), give it one clear idea (the bounce, say), and make its last test a twist on that idea rather than a harder, longer version of it.
- **WHY:** Most layouts get harder at the end without changing character. That may be why testers' hardest-moment answers are about execution, not surprise.

**Confidence:** medium. **Taste.**

---

### 14. Portrait view shows about one second of path ahead at full run

**What this game does.** Upright on a narrow phone, the camera keeps at least 305 px of world ahead at full run (FEEL.md §9). That's about 1.07 s at 285 px/s, and less than a full double jump (up to 331 px). A "look across a gap" rule helps near ledge ends. In landscape, the run lead is 0, but the view is wide.

**The data.** Player C (portrait): "the picture shifted when climbing up onto logs". One "camjump" glitch was also logged.

**What strong platformers do.** Look-ahead toward the direction of travel, plus platform snapping for height (Keren, "Scroll Back"). Super Mario Run's upright framing keeps Mario well toward the trailing side. (BENCHMARKS.md §7)

**Suggested change.**
- **WHAT:** In portrait, check that the landing of every double-jump gap and bounce is on screen *before* take-off, and widen the lead in the treetop sections, which have the longest jumps and the deadly falls.
- **WHY:** A landing you can't see in advance is a guess, and in the boughs a wrong guess costs a life.

**Confidence:** low-medium. I couldn't play to see it. **Fact** (numbers), **taste** (how much is enough).

---

### 15. Lives exist but mean almost nothing

**What this game does.** 3 lives per stage. A Game Over offers Continue at the last flag "with stage progress kept" (FEEL.md §8), and each death shows "N lives left" text for 1.6 s.

**What strong platformers do.** Odyssey dropped lives (it costs coins instead), and Celeste has none. Both keep failure cheap and avoid a counter that looks like a threat. Super Guide's help is triggered by deaths, which turns them into something useful. (BENCHMARKS.md §9, §12)

**Suggested change.**
- **WHAT:** Either remove the lives counter on 1-1, or use the death count as the trigger for finding 1's help instead of showing it as a countdown.
- **WHY:** At the moment it adds tension (especially for a child) without any real cost behind it.

**Confidence:** medium. **Taste.**

---

### 16. A third of the section pool is unused, and a few sections dominate

**What this game does.** 25 of the 90 kinds in the 1-1 pool appear in no layout; `w1-hop-bounce` is in 116 of 138, while 15 kinds appear in 3 or fewer (STAGES.md §0, §3).

**What strong platformers do.** Polished games cut what isn't used, because content that never ships still costs maintenance and checking time. [Folklore, but uncontroversial]

**Suggested change.**
- **WHAT:** Either retire the 25 unused kinds from the 1-1 pool or find out why the builder never picks them (many are twists, combinations or double-jump stairs; see finding 13).
- **WHY:** It keeps the builder's statistics honest and the team's attention on content players actually see.

**Confidence:** high. **Fact**; low impact on players.

---

## Missing entirely

Techniques great games use that this game, as documented, doesn't have at all:

1. **Escalating help at a spot where the player keeps failing** (Super Guide after 8 deaths; Crash's slower hazards and masks). The game has fixed settings (Easy, Jump help, game speed 0.8/0.9, extra lives after 3 Game Overs), but nothing reacts to repeated failure in one section.
2. **A "skip this bit" or "show me" option** (Super Guide's Luigi; Odyssey's guide arrows). A stuck player has no way forward but success.
3. **A hover or float on the easiest setting** (Mellow Mode, Kirby). The game *has* a leaf glide, but it's locked until 4-1. Letting Easy players use a gentle glide from 1-1 would directly address player I's section.
4. **Variable jump height on touch** (Super Mario Run). See finding 4.
5. **A visible "second jump ready" cue.** Nothing in FEEL.md shows the player whether a double jump is still available.
6. **A fixed, hand-tuned first stage** (every Nintendo 1-1). See finding 6.
7. **Telemetry of attempts, not just failures**: tries per mushroom, per gap and per rise. Without it, finding 5 is invisible to your report.
8. **Kid-specific input handling**: ignoring incidental taps, a larger dead zone, and treating any upward motion as a jump on Easy (BENCHMARKS.md §16; 5-year-olds' gestures recognised only 64% of the time).

## They may be right

Choices outside the usual pattern where the evidence supports the team:

- **Very generous coyote time and buffer** (214–248 ms, against Celeste's 100 ms). On a phone, with a flick that takes at least about 43 ms to register and a 30 fps tick, extra forgiveness is reasonable, and no tester complained about missed jumps at ledges. The only cost is finding 3, and the fix there is to change the double-jump test, not the forgiveness.
- **Soft pits on the ground almost everywhere.** No life was lost on the forest floor in 47 runs, the survey never named a ground section as hard, and one tester liked "how rocks move in to cover holes". That's the Odyssey bubble idea made free, and it fits a first stage.
- **The time model.** The builder predicts a median of 188 s on Normal and 201 s on Easy; the actual medians were 204 s and 206 s, within 8%. That's unusually good for a predicted stage time, and the builder can be trusted on pacing.
- **Fun and willingness to continue.** Mean fun was 4.56 on Normal and 4.50 on Easy, and 13 of 16 answered Yes to the next level. Even allowing for finding 9, the core movement is well liked. In the data, the problems are at the edges (the child, the treetops, input misreads), not in the run-and-jump core.
- **Length "about right".** The benchmarks say 3+ minutes is long, but 42 of 42 surveys say it's fine. I discount this because of the "about 3 minutes" announcement and the small tester pool, but a better-designed test could still prove the team right.
- **A fast, quiet retry.** About 1.2 s from fall to control on a life loss, and less on a put-back, sits in the fast-retry family of Celeste. Keep it, and add escalation on top.
- **The same layouts on Easy, with narrower gaps** (138 of 138 identical, gaps ≤ 0.65 of reach). Easy players see the same stage rather than a separate "kids' version". That's in line with Odyssey's and Celeste's approach of assisting the same content.
- **A quiet End section after the Showpiece.** A cool-down after the climax is the "conclude" step done right in every layout.

## Questions I couldn't answer from what I was given

1. **Live play.** The game's host was blocked from my machine. I'd want to play both orientations on a real phone, especially the bounce intro and the treetops in portrait.
2. **Is the "double jumps" counter complete?** Does it count a second jump after a mushroom bounce or a trunk leap? If it undercounts, finding 3's data side weakens, though the arithmetic still stands.
3. **When does Pokey count as having left a ledge?** Is it when his centre passes the edge, or the far side of his body? This sets how wide a single jump really reaches.
4. **How did player I finally get past `w1-log-chain`** with 2 double jumps in the whole run? Was there an adaptive aid (the "rocks that move in to cover holes" player A mentions)? What triggers those rocks, and why didn't they help sooner?
5. **Are falls from the treetop pieces bottomless?** Which builder measure produced "none costs a life"? Did the 2,300 px checkpoint rule apply in those sections?
6. **Which settings were on per run:** Jump help, game speed, steering hand, sensitivity, control mode (Screen or Pad), and orientation?
7. **Testers' ages and experience,** especially player I's age, and whether anyone besides player I is a child.
8. **Session recordings or touch traces** for the bounce intro and the 161 cancelled punches, to see what the fingers were actually trying to do.
9. **What does the testers' page show between runs?** Did players see the move cards each time, and did the "about 3 minutes" line stay on screen?
10. **Per-layout results,** once a layout has been played more than once, to separate layout difficulty from player skill (finding 6).
