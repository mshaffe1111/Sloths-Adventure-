URL: https://www.yachtclubgames.com/blog/specter-of-torment-level-design-deep-dive-5-of-5/
Read: 2026-11-05 ~11:50 AM ET via TinyFish fetch_content, whole article read (the "-5-5/" URL is 404; this is the live address). Verbatim excerpts:

> Well, it's not just one thing, sometimes it feels like a thousand tiny things constantly buzzing around in our brains! But polishing levels isn't done by "feel", it's done by establishing and adhering to a set of guidelines.
> Specter Knight can jump gaps that are up to 5 tiles wide, but we avoid building gaps that wide into our level design. If the player is intended to jump somewhere, they should be able to jump there comfortably, with a few tiles of wiggle room. In fact, platforming challenges typically don't ask the player to jump more than 3 or 4 tiles.
> In 2D Mario games, depending on how fast you're running before you jump, your jump distance can vary wildly. Here in Super Mario Bros, for example, you can jump anywhere between 4 and 10 tiles! And still, most levels in Super Mario Bros never ask you to jump more than 2 or 3 tiles at a time. The challenge comes from how the platforming overlaps with the enemies and objects around it, and rarely from the jumps themselves.
> Even in World 8-1, one of the hardest stages in the game, nothing gets close to that 10 tile maximum.
> We're not here to test whether the player can successfully press the jump button 0.01 seconds before they run off the ledge.
> Avoiding that 5 or 6 tile distance also removes ambiguity from our setups. Either we want you to jump there, and it's 3 or 4 tiles away, or we don't, and it's 7 or 8 tiles away. If you can't jump there, it shouldn't look like you can.
> Wherever an object rides along a track, we time it such that it lines up cleanly and consistently with the other objects in the scene. ... each moving platform is sent at a steady frequency, such that the player can internalize the necessary timing.

Measured from the quotes: Specter's typical gap = 3-4 of 5 tiles = 0.6-0.8 of the maximum; never 5-6 (the ambiguous band); "can't reach" gaps are 7-8 tiles (1.4-1.6x the maximum). SMB: most gaps 2-3 tiles against a 4-10 tile range.
