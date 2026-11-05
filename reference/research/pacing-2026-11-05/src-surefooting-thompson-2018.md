# Tommy Thompson, "Keep Running | Procedural Level Generation in Sure Footing" (Game Developer featured blog, 2018)

URL: https://www.gamedeveloper.com/design/keep-running-procedural-level-generation-in-sure-footing
Read: 2026-11-05 ~11:12 AM ET, whole text, from the copy the level designer saved (origin/engine-design:reference/engine/designer-sources/www-gamedeveloper-com-design-keep-running-procedural-level-generation-in-sure-fo.txt, 98 lines). Verbatim excerpts (line numbers are that file's):

:23 > This is why I chose it as a test-bed for a research project I started back in 2014 exploring how to manage the expressive power of a level generator.
:51 > The system then drafts a sprint by running a search through the grammar while respecting the constraints that have been imposed
:53 > As the designer that means I have to sit and make a stack of different variations of the same pattern: such as hopscotches, two and three-prong paths, stair wells, drops, spring sequences and more.
:59 > All of these budget values and the like are hand tweaked at design level, allowing for me to better balance parts of the game having play-tested it in the wild.
:61 > there are multiple versions of each generator, with three geometry generators and 17 action generators at the time of this video.
:85 > With over 30 unique parameters in the PCG, enemy AI and more that influence the overall state of play
:95 > Sure Footing is out now Steam and Itch.io for PC and we're continuing to tweak and update the game over the next year.

What it gives for #160: NO count of fix rounds. Sure Footing has no fixed levels to fix: the only thing ever tuned is the generator (budgets, costs, 17 action generators), by play-testing "in the wild", for years (2014 research start; still tweaking after launch).
