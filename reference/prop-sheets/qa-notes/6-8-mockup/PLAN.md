# 6-8 Stilt Climb: the mock-up (step 1, for Matt)

World 6's special stage and its one hand-built stage. Pokey climbs **up** through the mangrove's stilt roots, out of the swamp, while the
dirty, fast tide comes in under him. At the top he gets his first look at the ruins (World 7). Every other World 6 stage runs left to
right; this one runs bottom to top, and the water chases him up.

Pictures in this folder (real engine, a rough blockout: the layout is right, the polish is not):

| File | What it shows |
|---|---|
| `0-layout-and-tide.png` | The whole climb on the left and, on the same heights, the tide against time: a quick player, a careful player on Normal, a first-timer kid on Easy |
| `1-tide-turns-upright.jpg`, `-sideways.jpg` | Up the first root: the tide has turned and is flooding the mudflat he started on (Matt's painted dirty water) |
| `2-lianas-upright.jpg`, `-sideways.jpg` | A perch past a self-swinging liana, the water about a screen below |
| `3-animals-upright.jpg`, `-sideways.jpg` | The animals section: a tayra on the next root shelf, a frog on the shelf the tide has just covered |
| `4-crown-reveal-sideways.jpg` | **A stand-in, not the real art.** The crown with the swamp backdrop swapped for World 7's dusk ruins, to show the idea of the reveal. The real picture needs a new painted backdrop (prompt below) |
| `4-crown-upright-today.jpg` | The crown as the blockout draws it today, with the swamp backdrop. 6-8's existing wayside line already shows up here |

## The climb, bottom to top

About 7,900 px of climb in a column about 1,700 px wide. It zig-zags: a root up at one side, a shelf back across, a liana or a hop on.

1. **Start: the mudflat at low tide.** A wide bank, one root knee to hop. Dot's water line comes before any water can reach him
   ("Careful! That water's dirty and fast."). Nothing moves for the first few seconds. The first stilt root is at the far end.
2. **Learn: the tide turns.** When he is up the first root, the tide turns. The first rise is shown, not sprung: the water floods the
   mudflat he has just left while he stands safe on the shelf, and Dot says "The tide's coming in. Climb!" *(new, needs Matt's
   approval)*. Then roots to climb and short hops, zig-zagging up. A flag.
3. **Develop: lianas up.** Ledge, self-swinging liana, a perch about 80 px higher, then a root up to the next. Three lianas, each one
   left or right. The first is taught on a wide shelf, and the tide holds while he stands there: "Wait for the swing. Let go at
   the top." *(new, needs approval)*. Release windows are sized by the engine's own `pressWindow`: at least 167 ms on Normal and 300 ms
   on Easy. Two lianas above each other keep their heights apart so neither loses its swing.
4. **Rest: slack water.** A wide root shelf with a flag. The tide stops here while he stands at the flag (the breather in the middle).
5. **Twist: the roots' animals.** Poison frogs on the short root shelves (stomp them) and tayras on the long ones (punch them early),
   with roots and hops between. Both animals are taught earlier in World 6, so only a reminder line. Animals stay 120 px clear of
   every take-off and landing (`JUMP_CLEAR`).
6. **Twist: spring tide.** The water comes in a little faster. Four lianas and the roots between them, with a flag on every second
   perch. This is the climax.
7. **Finish: the crown and the ruins.** The tallest root goes up through the canopy to the crown, a long, wide root at the top.
   The mangrove thins out, the camera pulls back for about three seconds, and the ruins stand on the skyline at dusk. The shrine is at
   the far end. Dot: "Stone towers. Past the trees." *(new, needs approval)*. 6-8's approved wayside line ("Near the top he leaves
   room on the root beside him. Habit.") already shows up near the top.

Nothing crumbles. Straight up or down on a root always climbs. There is no locked exit. Every rise is one plain hop.

## The tide: how it works

The tide is the stage's water line rising (Matt's painted dirty water, `badWaterArt.ts`), so it adds no new code-drawn look. It is a
small pure module like 1-8's collapse (`chase.ts`): the engine steps it, and its tests check the rules.

| | Normal | Easy |
|---|---|---|
| Starts | once he is up the first root, after a 2 s churn (the water foams, a rumble, Dot's line) | the same, after 3 s |
| Rises by itself | 24 px/s (spring tide 31) | 16 px/s (spring tide 21) |
| How far below him it waits | about 450 px (just in view upright). If he gets further ahead it speeds up to 90 px/s, so it never falls out of the picture | about 650 px; catches up at 60 px/s |
| Slack water | stops while he stands at a flag, and for 6 s after he leaves it | stops for 10 s |
| First liana | holds while he stands on its shelf, until his first swing | the same |
| When it is off screen | a small ripple and arrow at the bottom edge of the screen (a small code-drawn touch) | the same, plus Dot's "The tide! Keep climbing." when it is within 350 px |
| If it catches him | a splash and a life, like all dirty water in World 6. He goes back to the flag with the water 600 px under it, and it waits 3 s | see the question below |

**Never a cheap death.** The tide catches only a player who stops for a long time between flags: about 18 s on Normal, about 40 s on
Easy. In the blockout, a careful Normal player (half the quick player's speed, waiting a full swing at every liana) is never closer than
about **365 px** to the water. A first-timer kid on Easy (a third of the speed) is never closer than about **360 px** (the chart).
Step 2 proves this in the real engine and adds the tests: the tide never comes within 120 px of a careful player, on both settings.

## Length

The blockout runs about **1:55** for a quick player (an estimate: the inspector measures it in step 2). The build stretches the
animals and spring-tide sections to reach **about 2:30 quick and about 4:00 for a first-timer**. Climbs count 20 s short, so that is
well over the 2-minute floor.

## Art needed (painted: a Gemini prompt for Matt)

The reveal is the stage's payoff, and it is a major part of the screen, so it needs a painted backdrop. Today's World 7 backdrops are
close-ups inside the ruins. The reveal needs the ruins far off, seen over the mangrove canopy. Copy-paste prompt (attach
`src/assets/backdrops/w6dusk-far.webp` and `w7dusk-far.webp` as style references):

> A wide side-scrolling game background, 2048 x 868, in the exact painted style of the two attached images (soft cel shading, dark
> outlines, muted greens). The view from the very top of a giant mangrove tree at dusk: in the foreground, the rounded tops of mangrove
> canopy and a few stilt roots, dark teal and black-green, filling the bottom third. Beyond them, far away across a misty green valley,
> the stone towers and stepped temples of an ancient jungle ruin stand on the skyline, small, hazy and blue-grey, wrapped in vines. A
> warm orange sun low behind the ruins, teal-green sky with a few long clouds. No characters, no text, no frame. The left and right
> edges must tile smoothly.

The tide itself reuses Matt's dirty-water sheet. No other new art is needed for the build.

## One question for Matt

When the tide catches Pokey on **Easy**:

- **A.** It costs a life, like all dirty water in World 6 (Easy is gentler through the slower water, the longer wait and the earlier
  warning). *(the builder's pick: it keeps the World 6 water rule the same everywhere)*
- **B.** On Easy only, the tide washes him back to the last flag with no life lost (2-1's teaching-river style).
- **C.** Something else.
