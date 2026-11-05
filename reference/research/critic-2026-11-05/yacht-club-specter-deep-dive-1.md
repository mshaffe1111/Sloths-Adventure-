# Yacht Club Games, "Specter of Torment Level Design Deep Dive (1/5)" (primary source, read by the engine critic)

URL: https://www.yachtclubgames.com/blog/specter-of-torment-level-design-deep-dive-1-5/
Read: 2026-11-05 10:54 AM ET, TinyFish fetch_content. Verbatim excerpts that bear on ENGINE-SPEC.md:

> We put these elements "on cooldown" for Specter and did not include them.  [weighted platform puzzles, wind rooms seen enough]

> Each level should have about 26 regular rooms and 6 secret optional rooms. ... A consistent length means that every stage will take a
> similar amount of time and have a similarly digestible amount of content. Any longer or shorter and the level might drag on or feel
> like it was missing stuff. Players start to develop a sense of their progress, and rely on it too ("I bet I'm near the end"). Plus,
> it lets us reinforce or subvert that expectation later for fun!

> Each level starts with about 5 enemies and 5 objects planned. ... No unitaskers allowed! Every element should have a considered
> interaction with the other elements in the level that shows why they are grouped together.

> No gameplay concepts should overstay their welcome, and no gameplay concepts should only show up as one-offs. Spectacles like
> minibosses and bosses are an exception – you can only show your "magic trick" once.

> Resources like gold, collectibles, checkpoints, and secrets should be distributed in a fun and consistent manner.

> Level mechanics should prepare you for that level's boss fight.

> The shape of each stage should reinforce the level's thematics. Many of Flying Machine's rooms are stacked on top of one another ...
> while most rooms in Lost City are headed downward ... Generally, as the game progresses the levels start flatter and grow more
> towering in shape, as the challenges (literally) ramp up.

> By the end of the project we're always better at making levels, so we also loop back around to revisit earlier areas and make sure
> they're up to the same level of quality we've reached by the end!

Bearing (critic): against ENGINE-SPEC L667 (neighbours differ ≥20% in length) Yacht Club keeps length consistent by unit count and
subverts it on purpose; for L1301-1305 (hazards stay home) and the one-stage lift/warm air (L1472-1473), "no ... one-offs"; for X-9
(LEDGER-2026-11-02-full.md:130-134), "prepare you for that level's boss"; for map shape per stage (part1:315-318), "the shape of each
stage should reinforce ... flatter ... more towering"; for pairs (LEDGER-2026-11-02-full.md:24-31), "every element should have a
considered interaction with the other elements".
