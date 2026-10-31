# Pokey's animation, round 3 (2026-10-31, the lead's list)

Branch `pokey-anim`. Before = `13158ad8` (rounds 1-2 merged with ccr-0d59a91c-oy3imz), after = this branch. Every scene is driven by
`tools/art/pokeyanim/rec.mjs` (one engine step of 1/30 s and one render a frame) on both builds, upright and sideways; the traces of his
body (and, on 7-4, the slide's own body) are byte-identical: `trace-before-*.json` / `trace-after-*.json`.

| # | Item | What changed | Proof |
|---|---|---|---|
| 1 | Rope | Qwen-Edit in-betweens of Matt's cells 2-3, 3-4, 4-5, 5-6 (the rope Qwen drew cut away): the hand-over-hand is 10 frames over the same travel (was 6). 1-2 and 6-1 came out heavier-outlined, not used. | `rope-side.jpg`, `rope-up.jpg`, `rope-*-before-after.mp4` (SCENE=rope, 1-3) |
| 2 | Punch | The jab is a 9-frame Wan clip started on the cross's own frame: faces us like the cross and hook, the fist by his face in the wind-up. The hook comes back through its own wind-up cell (it popped). | `jab-sheets.jpg`, `jab-side.jpg`, `jab-up.jpg` (SCENE=punch) |
| 3 | Slide (7-4) | He rides sitting, arms out for balance, and leans into each side from the seat (Qwen-Edit from his flume grip pose; it was the standing arms-hanging pose). The tip and weight follow the lean all the way (they snapped on past 0.4); a squash onto his seat landing a jump; dark wood-coloured dust off his seat. | `slide-side.jpg`, `slide-up.jpg`, `slide-*-before-after.mp4` (SCENE=slide, 7-4) |
| 4 | Vine swing | In-betweens between hanging still and the full kick / trail (it jumped straight to the full kick at 0.3 rad), and the body trails the swing a little. | `vine-sheet.jpg`, `vine-side.jpg`, `vine-up.jpg`, `vine-*-before-after.mp4` (SCENE=vine, 1-6) |
| 5 | Flip gaps | A cross-fade across each change of the painted roll was tried and thrown: two faces through each other (`flip-melt.jpg`). The roll from round 1 stays. | `flip-melt.jpg` |
| 6 | Small hop | A hop that never rises faster than 300 px/s (the vault over a trunk top, a step off a ledge) keeps his painted frames, not the video leap. | `small-hop-side.jpg`, `small-hop-up.jpg` (SCENE=climbtop) |
| 7 | Landing dust | engine.ts spawnJumpDust: the hardest puff 84 -> 54 wide, the side puffs 48 -> 30. | `landing-dust-side.jpg`, `landing-dust-up.jpg` (the moves scene) |
| - | Inventory | Air punch and air kick, stomp, bounce: checked, clean wind-up/hit/recover sets. | `../INVENTORY.md` |

Hugging Face: `tools/art/pokeyanim/jobs.txt` (anim5, anim6, anim7; about $3.08).
