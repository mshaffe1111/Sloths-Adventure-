# Dot, round 3: World 5 to 8 lines swept (for the lead's approval)

The lead's line bar (2026-10-29, Matt lifted the pause at 7:55 PM ET): under 10 words in play, never the answer, name the danger on first sight and give the move only after a real struggle. Started from the work branch at 246c310f. Nothing here is released.

**27 lines changed: 1 cut, 26 rewritten.**

| Where | Was | Now | Why |
|---|---|---|---|
| World 5 (w5.chair) | Slide past the chairs. Never sit. | **Soft chairs. They keep whoever sits.** | said the move |
| World 5 (w5.cake) | Cakes make you slow! Flick up over them. | **Cakes make you slow!** | said the move |
| World 5 (w5.butler) | A butler! Tap to punch his tray away. | **A butler! He won't let you by.** | said how to beat him |
| World 5 (w5.pot) | Slide past the pot between puffs. | **That teapot puffs sleepy steam.** | said when to go |
| World 5 (w5.thread) | Flick up over the threads. Spiders listen. | **Threads! The spiders listen to them.** | said the move |
| World 5 (w5.sheet) | Slide straight past the silk. Don't look. | **The silk sheets catch whoever looks.** | said the move |
| World 5 (w5.orchid) | Quick! Flick up before the orchid shuts! | **Orchids! They close, then open again.** | said when to go |
| World 5 (w5.cocoon) | Somebody's in there! Tap to punch it open. | **Somebody's in there!** | said how to open it |
| World 5 (w5.spider) | Tap to punch the spider, or stomp it. | **Spiders! These ones are soft.** | said how to beat it |
| World 5 (w5.seamstress) | The Seamstress! Slide past before she looks up. | **The Seamstress. She sews whoever she sees.** | said when to go |
| World 5 (hint.5-2.doze) | Sleeping spiders. Flick up over them. Shh. | **Sleeping spiders. Shh.** | said the move |
| World 5 (hint.5-3.sooner) | They shut sooner now. Go when one opens. | **They shut sooner now.** | said when to go |
| World 5 (hint.5-4.start) | Getting late. Swing on the silk. | **Getting late. Silk lines ahead.** | said the move |
| World 5 (hint.5-4.chain) | Flick up at the front. Next silk line! | (cut) | said when to let go (the silk tip teaches the let-go) |
| World 5 (hint.5-4.high) | Hop up high. A branch below catches misses. | **Silk way up high. A branch catches misses.** | said the route |
| World 6 (watch) | The water's watching. Duck into the roots! | **The water's watching. The roots hide you.** | said the move; the roots hiding him is a rule he cannot see |
| World 6 (tide) | Mud! Cross while the tide is out. | **Mud flats. The tide comes back.** | said when to go |
| World 6 (caiman) | A caiman! Don't stomp it. Punch, or hop over. | **A caiman! Too tough to stomp.** | said how to beat it |
| World 6 (frog) | Poison frog. Stomp it, never touch it. | **Poison frog. Touching it hurts.** | said how to beat it |
| World 6 (tayra) | A tayra! Quick, so punch it early. | **A tayra! It's quick.** | said how to beat it |
| World 6 (harpy) | A harpy! It slides, then stomps. Jump clear. | **A harpy! It slides, then stomps.** | said what to do |
| World 6 (the dark roots) | The roots go dark. Stay in the firefly's light. | **The roots go dark. Only the firefly glows.** | said what to do; the firefly is the one thing it names (the lead: the dark is a new mechanic with nothing to see) |
| World 7 (crumble) | Cracked tiles. Don't stand still. | **Cracked tiles. They won't hold long.** | said what to do |
| World 7 (water) | Dirty water down there. Hop it, don't touch. | **Dirty water down there.** | said what to do |
| World 7 (sentry) | A stone sentry. Hit it before it jabs. | **A stone sentry. It jabs.** | said how to beat it |
| World 7 (seal room, Easy entry) | Sealed. A stone on that plate, maybe. | **Sealed. This old door won't budge.** | a nudge on entry; on Easy too the entry names the problem, the nudge comes after struggle |
| World 7 (lever room, Easy entry) | A lever by the door. Worth a pull. | **Another sealed door. How does this one open?** | the answer on entry |

## Kept as they are, and why

- **World 5's after-a-hit lines** ("That cake made you slow. Keep sliding.", "Sleepy steam! Slide past between puffs.", "She saw you looking! Slide left and right.", the silk creeping and the wrap): they come after he is caught, the struggle tier.
- **The silk's swing** ("Flick up into the silk to swing." then "Then flick up and forward to let go."): a control taught the first time it is needed; World 5 turned the vine lesson off so this tip teaches it. It may now skip the busy cap (5-5 held it 255 px late otherwise).
- **5-1 and 5-2's second-jump and tall-stump reminders**: reminders of a move taught in 1-1. Tips drops reminders; Help says one (Matt's answer 2). QA timing tests pin them.
- **5-2's "Don't sit. That's the one on the tree.", 5-4's "Rule five. Don't admire the silk.", the stage openers and "Nearly through" lines**: Dot's rules and mood, not a moment's answer.
- **The locked-exit lines** (World 5's arena, World 6's hunters and fights, World 7's relics and guards): the locked exit is always explained.
- **World 6's and World 7's room tiers** (approved in round 1) and World 7's asked-for room hints.
- **"Spring tide! It's faster now.", "Brown vines. Still strong enough to climb.", "So dark. Follow the fireflies."**: a change or a rule he cannot see.
- **The water lines**: Matt's own words, kept (the lead, 2026-10-29).
- **World 8**: the work branch still has the old World 8 stages, and none of their rows tells the move. World 8's gen2 lines are not on the work branch yet; "Careful! It's a long way down." is approved and on record.

## Code that came with it

- A thing's first line that names the thing, not the move, is read and goes: it no longer waits for a move it does not name (dotLines.ts).
- World 7's Easy rooms open with the same line as Normal: the entry names the problem on both settings, and the nudge comes after struggle.
- World 5's tests now check the new bar (a first sight names the thing, never the move) where they checked the old one (every tip names the thumb move).

Checks: tsc clean; the full suite (HF-ART-BRIEF globs) 2016 tests, 2014 pass, 0 fail, 2 to-do (the known 4-3 boulder item and one other); vite build clean, no asset over 4 MiB.
