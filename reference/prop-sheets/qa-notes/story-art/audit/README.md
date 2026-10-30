# Cutscene audit (2026-10-30)

Every story picture as the phone shows it: 756 panels, upright 390x844 and sideways 844x390, pixel ratio 3 (1512 shots, `tools/art/storyart/audit.mjs`, analysed by `audit.py`).

- `scenes-<chapter>.jpg`: every picture of that chapter, numbered, upright then sideways (57 sheets).
- `audit-flags.txt`: every character picture drawn above 1.5 screen px per painted px (it reads soft), worst first.
- `by-picture.txt`: the same per painting, with how many shots it appears in and where.
- `guardians-before-after.jpg`: the Reaver and the Golem before and after their 4x story repaint.

## What it found, and what was done

| Flag | Found | Done |
|---|---|---|
| Guardians soft in their boss scenes | Reaver 4.2x, Golem 4.0x, Queen 3.1x, Sovereign 3.0x, Monarch and Drake 2.8x (the game frames) | Every frame a story uses repainted at 4x on the style model (storyGuard.ts, 17 frames); re-shot: 0 flags |
| Pokey's face close-ups | up to 2.1x | cut again at 3x from the 4.4-5.8x paintings (pokeyface pages) |
| Venom Fang, Crocus Rex | 2.0x, 1.9x | not fixed: they are drawn from their animated game sheets (venom-body, croc-anim), not one still |
| Everything else | Pokey, Meeca, Dot, all cels at or under 1.26x | nothing to do |
