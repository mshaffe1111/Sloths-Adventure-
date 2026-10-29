/**
 * The game's three faces for canvas text (UI-13), the same three as the screens' CSS (index.css --font-fun, --font-ui, --font-read):
 * a canvas cannot read a CSS variable, so the families are spelt out here, and fonts.test.ts checks they match the stylesheet.
 */
/** display: titles and big numbers (Cherry Bomb One has one weight; ask for 400) */
export const FONT_DISPLAY = "'Cherry Bomb One', 'Outfit', sans-serif";
/** UI: labels, signs and small counts (Outfit 500, 700, 900) */
export const FONT_UI = "'Outfit', sans-serif";
/** reading: story and Dot's words (Atkinson Hyperlegible Next 400, 500, 600) */
export const FONT_READ = "'Atkinson Read', 'Atkinson Hyperlegible Next', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif";
