URL: https://nothings.org/gamedev/herringbone/herringbone_tiles.html
Fetched: 2026-11-04 22:34 ET with TinyFish fetch_content (engine critic). Sean Barrett, "Herringbone Wang Tiles".

Excerpts used by CRITIC.md (verbatim):

"As long as you have at least one tile for each case, you can automtaically generate a tiling. However, you need more than one tile for each case to avoid reptition."

"With two edge variations (colors) per edge type, that means a minimum of 16 pre-authored tiles. With three edge variations, that's a minium of 81 tiles ... I'll call such a collection of tiles a \"complete stochastic set\"."

"if you use the complete stochastic set, the filling algorithm is trivial, because we guarantee that we have a tile that can match every possible constraint on every combination of edges."

"(E.g. if you thought you wanted about 64 pre-authored tiles with 3 edge constraints, just make 81 instead.)"

"Also you can see that it's extremely incoherent, since there's no planning or structure to anything."

"We can make all tiles always fully-connected internally, so that we don't have to track those specially. Then we know that a map is always fully-connected, but at this point it's too homogenously connected to be interesting."

What it supports in CRITIC.md: DESIGNER §5.7 and §10.0 cite Barrett for "joins cannot fail". The same page says an edge contract with nothing above it gives output that is "extremely incoherent" and "too homogenously connected to be interesting": safety of the seam is not a source of structure. A's stage spec and hero room supply the structure, so this is a caution on the seams' feel, not on their safety (see CRITIC.md cause A-5 and VERIFICATION_PASSED V2).
