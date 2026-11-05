# Matt's direction for the engine (his words; the level designer designs from this, the lead checks against it)

## 2026-11-05 ~12:05 AM ET
"So how do I make sure that pieces are being used and it's being done in ways that real platformers are built? When we first started
off, we were doing really good. And we really hit a wall the last week or so. But the first stage is the best stage in the game. It
needs tweaked to be able to be created under a generator, but that's how the generator should be designing things. Not having 16
bridges linked where you just jump from them. It should be having a huge set of platforms to pick from, different sizes, laid out
different ways, going up, different branches that you can take, one going higher, one going lower. Everything we do is all or
nothing."

Earlier the same night:
- "the beats were more of how the player played, not so much with the music... you set the jumps up so that a player can get into a
  rhythm, not so much that the rhythm has to go with the song."
- "the whole point was to make the engine not based upon what we already have, but what the best way of doing it."
- On the rebuilt five: "on level 5, it's just run over the cracking logs. Nothing else... You don't mix any platforms into it. It's not
  a variety. Like, at least we used to have the lily pads and everything else."
- "the designer has full say in how the pieces get used and how the engine gets built."

## 2026-11-04 ~11:1x PM ET (said to the planner directly)
"I liked all the pieces... They all looked good. They all played well. They were redundant."
So today's pieces (logs, bridges, boughs, snap twigs, vines, stumps, rotten branches, the climb and the split) are KEPT in the
engine's library, look and feel included. The fault is the mix, not the pieces. The engine's first job is mixing them so no stage
repeats.

## The reference: the OLD 1-1 (live on main), Matt's best stage
The generator is aimed at the way the old 1-1 is built, not the rebuilt one. It is the bar every generated stage is measured against.

## How Matt can check it (the checks the lead runs; the designer decides how to meet them)
1. **The old 1-1 measured as the baseline** (first checkpoint): its count of platform kinds and sizes, the spread of sizes, how far
   it climbs and drops, how many places the route splits (higher / lower), the longest run of the same piece in a row, and how
   often something new appears. Every generated stage must match or beat those numbers.
2. **The piece library shown first**: one sheet of every platform and piece the generator can pick, in its sizes and kinds,
   before any stage is built from it. "A huge set of platforms to pick from."
3. **Side-by-side map**: each generated stage's layout drawn as a plain top-down/side map next to the old 1-1's, so the mix, the
   climbs and the high/low splits can be judged in ten seconds.
4. **No all-or-nothing**: a stage fails if one piece makes up most of it, or if the same piece runs many times in a row (the
   thresholds come from the old 1-1's own numbers).
5. **Matt plays it** in grey-box against the old 1-1 / 1-2 before any art.
