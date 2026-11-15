# Deep research prompt: how the game industry measures and designs difficulty (for Gemini Deep Research, written by the lead 11-14 11:00 PM ET)

## Who this is for and why
I am building a phone-first 2D side-scrolling platformer (touch controls only, portrait and landscape, a fixed 30 fps game loop) with two settings: Easy, for children, and Normal, for players aged 12 and up that must challenge adults. Levels are generated from hand-designed building blocks, and I need a difficulty score I can trust for every level BEFORE players see it, so each level lands in a planned difficulty band and the game ramps smoothly across 10 worlds. My current scoring method failed: it rated a level "medium" that playtesters found "really easy," because it scored only how precise each jump is and ignored a watching enemy, pressure, and stakes. I need the real-world state of the art.

## What I want you to research (be exhaustive; prefer primary sources)
1. **How professional game designers decide and tune difficulty in practice.** Platformers above all (Nintendo's Super Mario series and Super Mario Maker, Celeste, Super Meat Boy, Shovel Knight, Donkey Kong Country, Rayman, Hollow Knight, Ori, Cuphead, Mega Man), but also any genre whose method transfers. Use GDC talks and their transcripts or summaries, developer postmortems (Game Developer / Gamasutra), design interviews, books (e.g. Jesse Schell "The Art of Game Design", Scott Rogers "Level Up!", Raph Koster "A Theory of Fun"), and designers' own blogs. What do they measure, what do they tune, what rules of thumb do they use (difficulty curves, "teach, test, twist", sawtooth curves, checkpoint spacing, coyote time, input buffering), and how do they tell "hard but fair" from "cheap"?
2. **The academic literature on measuring difficulty**, with the actual models and formulas. Start from, and go beyond:
   - Aponte, Levieux & Natkin (2009-2011), difficulty as the probability of failure, measured by play.
   - Isaksen, Gopstein & Nealen (2015, 2018), exploring game space with simulated players that have human motor noise, and survival analysis (the Flappy Bird work).
   - Mourato & Santos (2010), measuring difficulty in platform games, per-obstacle success probability.
   - Smith, Whitehead, Mateas et al., Launchpad rhythm groups and expressive range.
   - Lee & Oulasvirta (2016), error rates in temporal pointing (timed button presses); Fitts' law and the steering law, especially for touch screens.
   - Hunicke (2005) dynamic difficulty adjustment; flow theory as used in games (Csikszentmihalyi, Chen's "Flow in Games"); Yerkes-Dodson.
   - Clear-rate data: Super Mario Maker / Mario Maker 2 public clear rates as large-scale difficulty data, and any papers using it.
   - Any work on predicting level difficulty from level features with machine learning or simulation, procedural content generation with difficulty targets, and player modelling.
3. **The factors that make a level difficult**, each defined and measurable: precision (target size, timing windows), speed of threats, reaction and reading time (time on screen before a threat matters, visual clutter), pressure (simultaneous threats, density, lack of rest), stakes (cost of failure: lives, hearts, distance sent back to the last checkpoint), memory and novelty (first encounter vs practised), decision complexity (number of choices, fake-outs), stealth or "freeze when watched" mechanics (red-light-green-light style), and endurance (long sections without checkpoints). For each: how it is measured, typical numbers, and how it interacts with the others.
4. **Required challenge vs optional risk.** How designers and researchers separate the difficulty of finishing a level from the risk a player chooses (optional collectibles, speed-running, recklessness), and why raw death counts mislead.
5. **Validating a difficulty model against real players**: what metrics studios use (deaths per section, retries, time to clear, quit points, heatmaps), how many playtesters or simulated runs are enough, and how they calibrate bots or simulated players to match humans.
6. **Children vs adults**: published guidance on difficulty, motor skill, reaction time and reading ability for children roughly 5-11, and how family games (Nintendo, LEGO games, Kirby) make an easy mode that still feels like a game.
7. **Phone and touch specifics**: touch input error, reaction time on phones, thumbs covering the screen, and how mobile platformers (Super Mario Run, Rayman Jungle/Fiesta Run, Alto, Leo's Fortune) tune difficulty.

## How I want the answer
- **Start with a one-page summary**: the best method the industry and research offer to score a level's difficulty before players see it, in plain words.
- **Then a recommended scoring model** I can implement: the formula(s), every variable defined, which inputs come from the level's layout and which from simulated or real play, how to combine factors (multiplicative probabilities, expected retries, survival curves, weighted sums: say which and why), and how to map the result onto a 0-100 scale with bands per world.
- **A section per research area above**, with the key findings, the actual formulas and numbers where they exist, and what each means for a 2D platformer on a phone.
- **A "hard but fair vs cheap" checklist** a level must pass, each item testable.
- **A validation plan**: the smallest experiment that would prove the model right or wrong.
- **Sources**: for every claim, the source with a working URL, the author and year, and a direct quote where possible. Mark clearly anything you could only see as an abstract, and anything that is your inference rather than a source's claim. Prefer primary sources (papers, talk recordings, developer posts) over summaries.
- Be specific and quantitative. Where sources disagree, say so and say which you would trust and why.
