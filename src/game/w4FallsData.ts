// from src/assets/w4/falls.json (World 4's waterfall set, Hugging Face, the art helper's hf-art-blocking, 2026-10-29): where each piece
// sits in src/assets/w4/falls.webp. Keep the two in step. Draw them with w4FallsArt.ts.
//   bodies   fallNarrow, fallMedium, fallWide: falling water, each repeats top to bottom with no seam
//   pillar   wet stone with water trickling down it, repeats top to bottom
//   lips     lip1..3: the rock at a fall's top, its top edge at the piece's top; the pour hangs below and fades out, so a body joins under it
//   foot     splash1, splash2: white water where a fall lands, repeating side to side, the bottom faded
//   mist     mist1, mist2 (a low cloud, its foot at the bottom), plume (rising spray, its foot at the bottom)
export interface FallFrame { x: number; y: number; w: number; h: number }
export const FALL_FRAMES = {
  fallNarrow: { x: 0, y: 0, w: 168, h: 598 },
  fallMedium: { x: 172, y: 0, w: 233, h: 598 },
  fallWide: { x: 409, y: 0, w: 355, h: 598 },
  pillar: { x: 768, y: 0, w: 181, h: 618 },
  lip1: { x: 953, y: 0, w: 372, h: 176 },
  lip2: { x: 1329, y: 0, w: 373, h: 182 },
  lip3: { x: 0, y: 622, w: 366, h: 182 },
  splash1: { x: 370, y: 622, w: 508, h: 185 },
  splash2: { x: 882, y: 622, w: 508, h: 168 },
  mist1: { x: 1394, y: 622, w: 484, h: 191 },
  mist2: { x: 0, y: 817, w: 450, h: 190 },
  plume: { x: 454, y: 817, w: 220, h: 567 },
} satisfies Record<string, FallFrame>;
