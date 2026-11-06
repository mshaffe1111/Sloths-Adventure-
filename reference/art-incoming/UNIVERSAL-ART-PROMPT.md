# Universal art prompt v2 (the lead, 2026-11-06, for Matt's weekend style sheets)

Replaces the MASTER PROMPT in ART-REQUEST-LIST.md. The sizes come from the game itself:
- a long bank is about 200 CSS px on screen, which is about 600 real pixels on a dpr-3 phone;
- today's cut pieces are only about 200 px in the atlas, so they're blown up 3x, which is why everything looks too small and soft;
- 900 px or more on a piece's long side gives 1.5x headroom.

```text
Hand-painted 2D side-scrolling platformer game art, in exactly the style of the attached images: soft painterly cartoon, a dark brown outline, rich textures, light from the upper left. WORLD LOOK: [WORLD LOOK].

DRAW: [N] separate [PIECE], [LAYOUT].

VIEW: seen exactly from the side, like a classic 2D platformer. Flat-on and horizontal: no angle, no perspective, no top-down view, no 3/4 view.

SIZE (this matters most):
- The whole image is at least 2048 px on its long side (best 2048 x 2048 or 2048 x 1024), never over 4096 px.
- Each item fills its space: its long side is at least 900 px and its short side at least 250 px. A single hero item is at least 1600 px on its long side. A tall item is at least 1600 px tall.
- All items on one sheet are drawn at the same scale and the same level of detail.
- Paint full detail at this size; don't draw small and leave empty space.

SHAPE RULES:
- Anything you can stand on has a flat, level walkable top running across its full width, with no bumps, sprouts or spikes sticking up above that line except right at the ends.
- The bottom edge of grounded pieces (rocks, stumps, trunks, walls) is flat and level, as if resting on the ground.
- Walls, trunks, cliffs and ledges are ONE continuous piece from bottom to top, never stacked parts.
- For scale: the player is a small sloth about one fifth as wide as a long log or bank.

BACKGROUND AND EDGES:
- A flat, solid [KEY COLOUR] background, one exact colour, with no gradient, texture, vignette or noise.
- That colour appears nowhere inside the art.
- At least 64 px of clear background around every item and from every edge of the image. Items never touch or overlap each other.
- Crisp edges against the background: no glow, haze, smoke or soft shadow bleeding into it. Any glow is painted inside the item's own outline.
- No cast shadows on the ground.

NEVER: no text, labels, letters, numbers, logos or watermarks; no skulls, bones or crosses; no characters, animals or faces unless asked; nothing floating unless asked; no frames or borders; no ground line or scenery behind the items.
```

## Fill-ins
- **[WORLD LOOK]**: the world's colours and mood in one line, for example "warm earthy greens and browns, mossy, sunrise forest" (World 1)
  or "dark blue-teal cave, glowing moss, crystals" (World 3).
- **[PIECE]**: ONE kind of thing per sheet, for example "mossy fallen logs to walk on", "boulders", "tall tree-trunk walls".
- **[KEY COLOUR]**: magenta #FF00FF. For a world with pink or purple in its art (World 5 orchids, World 8 night canopy), use pure blue
  #0000FF instead.
- **[N] and [LAYOUT]**:
  - Long (logs, banks, bridges): "2 items, stacked one above the other, each the full width", on a 2048 x 2048 sheet.
  - Square (rocks, stumps, props): "4 items in a 2 x 2 grid", on 2048 x 2048.
  - Tall (trunks, walls, cliffs): "3 items side by side, each the full height", on 2048 x 2048.
  - Hero (one big set piece): "1 item, centred, filling the image", on 2048 x 2048.

## Habits that save a re-roll
- Attach 2-3 reference images every time: the world's best existing piece plus one style sample.
- Found a perfect piece? Attach it and ask for "4 more like this, different shapes, same size."
- If the image comes back smaller than 2048 px, ask again: "Same image at 2048 x 2048, full detail."
