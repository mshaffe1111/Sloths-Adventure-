# ART: Hugging Face art for 1-4 and 1-5, into the inventory. Opus 5.5 high (art). Budget cap $15 (balance ~$62.9, keep $10 reserve).
Branch: t-art-1113. Why: Matt (10:13 AM ET): "We still need a 2-handed vine animation from Hugging Face" (R-165.178); 1-5 has no sign art
(1-5.md:56-58); painted art for every major look (CLAUDE.md "Polish"). Read reference/handoffs/art-director.md, tools/README.md (the token:
HF_TOKEN or `hf auth login`; it never goes in a file, commit, message or memory), reference/art/HF-SPEND.md, the inventory
(src/game/art/inventory.ts and its catalog), CLAUDE.md "Inventory first" and "To scale with Pokey" (Pokey's drawn height 89.1 units, D41).
## Done, in this order (log every job in reference/art/HF-SPEND.md with what it bought)
1. **Pokey's two-hand vine climb** (R-165.178): painted frames in his sheet's style, both hands on two vines, arms out (Matt: today it looks
   like one vine), never a code stretch; packed like hero-rope (tools/art/rope/ is the model); a still per frame + a strip at game timing.
2. **1-5's set:** leaf-signs (THIS WAY / THAT WAY) and the leaf curtain, the folded petal, her mark on living bark, the root tunnel mouth,
   the rotten fallen trunk, the dusk sky treatment (1-5.md:5, :56-58). World fit tags on each (CONTENT.md "world fit" rule).
3. **1-4's pieces:** the rotting bough (bracket fungus, notched underside: 1-4.md:30; the same piece serves 1-5), the fruit cluster, the
   seed pod; the daytime flyer and the leafcutter ants LAST (1-4.md:4).
4. Every piece labelled in the inventory (worlds, engine use, footing, layer, ship size, scale vs Pokey); artcheck green (<=4096 px; no
   asset over 4 MiB). Stills of each piece beside Pokey at game scale. Push each set as it lands and send the lead one line: B14 and B15 place them.
Story keeper's nature check is done for 1-5 (11-12) and pending for 1-4's vine rework: if a piece fails it, the lead tells you.
