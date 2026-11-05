# Super Meat Boy Forever: Tommy Refenes on chunks (primary source, read by the engine critic)

URL: https://gamingbolt.com/super-meat-boy-forever-interview-controls-levels-story-and-more (Shubhankar Parijat, published 2021-01-18)
Read: 2026-11-05, saved by 10:37 AM ET (`date` after the save), TinyFish fetch_content. Verbatim excerpt of the level-generation answer:

> A Chunk is a section of a level that we've designed and decorated by hand. These are usually about the size of a Super Meat Boy
> level from the 2010 game. They have a defined start and a defined end. We built these levels like you would build any level in any
> platformer. We iterated on the design until it felt right, made it look pretty, played through it to give it a par and a difficulty
> rating.
>
> A Level is a collection of 8 Chunks. Each Level has between 70 and 100 Chunks that it can choose from. That means we made 70 to 100
> Super Meat Boy sized chunks per level. 1-1 has their own collection of 100, 1-2 has 100, etc, etc. ...
>
> When playing through a Level in Super Meat Boy Forever, we randomly pull from that Level's library of Chunks, randomly determine if
> there should be a pacifier or a warpzone, order them by difficulty and then add up all of their par times to get a par for the Level.
> ... the game randomly pulls 6 chunks from 1-1's chunk library ...
>
> We keep track to avoid duplicates so you can play through the game several times and not see duplicate chunks.

What it confirms for the critic: R1 L2 and L3 quote it correctly. Pool per level about 70-100 against 6-8 used (about 9-17x), cut per
level, not shared; each chunk rated by hand (par and difficulty) and ordered by rating; duplicates tracked across the whole game.

Also opened, same session: https://github.com/Isetta-Team/Isetta-Website-Raw/blob/master/docs/interviews/TommyRefenes-interview.md
(engine architecture; says nothing about chunk selection; not load-bearing for the spec).
