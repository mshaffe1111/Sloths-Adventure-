import React from 'react';
import { heroSpriteEnabled } from '../game/heroSprite.ts';

const TITLE_IDLE = new URL('../assets/hero/title-idle.webp', import.meta.url).href;
const TITLE_BLINK = new URL('../assets/hero/title-blink.webp', import.meta.url).href;

/**
 * Title-screen scenery: a warm sunset-jungle scene drawn entirely as SVG.
 * Split into layers so each can anchor/scale independently on any screen shape:
 *   TitleDefs      - shared gradients + reusable shapes (render once, zero size)
 *   TitleBackdrop  - sky, sun, mountains, jungle, river (covers the screen)
 *   TitleFrame     - dark leaf/palm silhouettes hugging the left & right edges
 *   TitleHero      - branch, hanging vines and the sloth (fits the content column)
 *   TitleFireflies - drifting glow dots (covers the screen, sits in front)
 */

export const TitleDefs: React.FC = () => (
  <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true" focusable="false">
    <defs>
      <linearGradient id="ts-sky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#f2623a" />
        <stop offset=".35" stopColor="#ff9a4a" />
        <stop offset=".62" stopColor="#ffcb73" />
        <stop offset=".8" stopColor="#ffe7a6" />
      </linearGradient>
      <radialGradient id="ts-sunGlow">
        <stop offset="0" stopColor="#fff6c8" stopOpacity=".95" />
        <stop offset=".45" stopColor="#ffd98a" stopOpacity=".45" />
        <stop offset="1" stopColor="#ffb35a" stopOpacity="0" />
      </radialGradient>
      <linearGradient id="ts-mist" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#ffe9b0" stopOpacity="0" />
        <stop offset="1" stopColor="#ffe9b0" stopOpacity=".75" />
      </linearGradient>
      <linearGradient id="ts-water" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#4fbfa8" />
        <stop offset="1" stopColor="#14705f" />
      </linearGradient>
      <linearGradient id="ts-fur" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#c79a68" />
        <stop offset="1" stopColor="#a97b4c" />
      </linearGradient>
      <radialGradient id="ts-iris">
        <stop offset="0" stopColor="#8a5a2c" />
        <stop offset=".6" stopColor="#4b2c14" />
        <stop offset="1" stopColor="#20120a" />
      </radialGradient>

      {/* palm frond + palm top */}
      <g id="ts-frond">
        <path d="M0 0C28-34 92-46 160-6C108-22 52-14 0 0Z" />
        <path d="M0 0C20-10 70-26 150-8" fill="none" stroke="#000" strokeOpacity=".18" strokeWidth="2" />
      </g>
      <g id="ts-palm">
        <use href="#ts-frond" transform="rotate(-165)" />
        <use href="#ts-frond" transform="rotate(-135)" />
        <use href="#ts-frond" transform="rotate(-105)" />
        <use href="#ts-frond" transform="rotate(-75)" />
        <use href="#ts-frond" transform="rotate(-45)" />
        <use href="#ts-frond" transform="rotate(-15)" />
        <use href="#ts-frond" transform="rotate(15)" />
        <use href="#ts-frond" transform="rotate(165) scale(1,-1)" />
      </g>
      {/* big banana-style leaf */}
      <g id="ts-leaf">
        <path d="M0 0C50-130 230-175 340-92C250-96 120-62 0 0Z" />
        <path d="M0 0C110-60 230-100 330-92" fill="none" stroke="#000" strokeOpacity=".22" strokeWidth="3" />
      </g>
      {/* orange bloom */}
      <g id="ts-bloom">
        <path d="M0 0C-6-40-30-62-52-70C-30-44-18-24 0 0Z" fill="#ff7a1f" />
        <path d="M0 0C4-46 28-70 56-78C34-48 20-26 0 0Z" fill="#ff9a2e" />
        <path d="M0 0C-2-50 4-84 -6-112C16-84 18-46 0 0Z" fill="#ffc247" />
        <circle r="5" fill="#ffe27a" />
      </g>
      {/* hanging vine */}
      <g id="ts-vine">
        <path d="M0 0C10 40-10 80 4 130C14 170-6 200 2 240" fill="none" stroke="#2f7a3f" strokeWidth="5" strokeLinecap="round" />
        <ellipse cx="9" cy="60" rx="15" ry="7" transform="rotate(35 9 60)" fill="#4cb35a" />
        <ellipse cx="-6" cy="110" rx="15" ry="7" transform="rotate(-30 -6 110)" fill="#3c9a4b" />
        <ellipse cx="12" cy="165" rx="15" ry="7" transform="rotate(30 12 165)" fill="#5cc866" />
        <ellipse cx="-2" cy="222" rx="13" ry="6" transform="rotate(-25 -2 222)" fill="#3c9a4b" />
      </g>
    </defs>
  </svg>
);

/** Full-screen sunset sky, mountains, jungle and river. */
export const TitleBackdrop: React.FC = () => (
  <svg
    className="absolute inset-0 w-full h-full"
    viewBox="0 0 1280 720"
    preserveAspectRatio="xMidYMid slice"
    aria-hidden="true"
  >
    <rect width="1280" height="720" fill="url(#ts-sky)" />
    <circle cx="640" cy="330" r="330" fill="url(#ts-sunGlow)" />
    <circle cx="640" cy="330" r="118" fill="#fff4bf" />

    {/* light rays */}
    <g opacity=".16" fill="#fff6c8">
      <polygon points="640,330 160,0 300,0" />
      <polygon points="640,330 470,0 560,0" />
      <polygon points="640,330 760,0 860,0" />
      <polygon points="640,330 1000,0 1160,0" />
    </g>

    {/* clouds */}
    <g fill="#ff9d6b" opacity=".75">
      <ellipse cx="250" cy="170" rx="150" ry="26" />
      <ellipse cx="330" cy="150" rx="80" ry="26" />
      <ellipse cx="1010" cy="200" rx="170" ry="24" />
      <ellipse cx="1090" cy="178" rx="84" ry="26" />
    </g>
    <g fill="#ffd2a0" opacity=".8">
      <ellipse cx="320" cy="140" rx="70" ry="14" />
      <ellipse cx="1082" cy="168" rx="72" ry="14" />
    </g>

    {/* mountains */}
    <path d="M0 470L90 400L160 330L215 395L300 300L380 410L470 360L560 440L700 380L800 330L880 250L940 330L1040 390L1120 330L1200 400L1280 360V560H0Z" fill="#8fbf84" opacity=".75" />
    <path d="M0 500L120 430L210 470L330 380L450 470L600 420L760 480L900 400L1030 470L1150 410L1280 470V580H0Z" fill="#5da56d" opacity=".9" />
    <rect x="0" y="380" width="1280" height="200" fill="url(#ts-mist)" />

    {/* mid jungle */}
    <path d="M0 520C80 470 160 500 240 480C320 460 380 500 470 490C560 480 620 510 700 500C800 485 860 470 950 490C1040 510 1120 470 1280 500V620H0Z" fill="#2f7d4c" />
    <g fill="#256b41">
      <use href="#ts-palm" transform="translate(170 400) scale(.55)" />
      <use href="#ts-palm" transform="translate(340 430) scale(.45)" />
      <use href="#ts-palm" transform="translate(940 410) scale(.5)" />
      <use href="#ts-palm" transform="translate(1110 440) scale(.42)" />
    </g>
    <g stroke="#1c5232" strokeWidth="7" strokeLinecap="round">
      <path d="M170 400L160 520" />
      <path d="M340 430L335 520" />
      <path d="M940 410L948 520" />
      <path d="M1110 440L1104 520" />
    </g>
    <rect x="0" y="470" width="1280" height="140" fill="url(#ts-mist)" opacity=".55" />

    {/* river + sun reflection */}
    <path d="M0 585C200 570 420 600 640 590C860 580 1060 600 1280 585V720H0Z" fill="url(#ts-water)" />
    <g fill="#fff0b0" opacity=".55">
      <ellipse cx="640" cy="608" rx="150" ry="5" />
      <ellipse cx="640" cy="632" rx="100" ry="4" />
      <ellipse cx="640" cy="656" rx="56" ry="3" />
    </g>
  </svg>
);

/**
 * Dark foreground silhouettes tucked into the four screen corners.
 * Each corner piece keeps its own proportions (no cropping, no hard clip edges),
 * so the framing scales with the screen instead of being sliced.
 */
const CORNER_WIDTH = 'clamp(150px, 30vw, 620px)';

const CornerTop: React.FC<{ mirrored?: boolean }> = ({ mirrored }) => (
  <svg
    className="absolute top-0 pointer-events-none"
    style={{
      width: CORNER_WIDTH,
      aspectRatio: '420 / 360',
      overflow: 'visible',
      [mirrored ? 'right' : 'left']: 0,
      transform: mirrored ? 'scaleX(-1)' : undefined,
    }}
    viewBox="0 0 420 360"
    aria-hidden="true"
  >
    <g fill="#0f2418">
      <path d="M-10 0V330C10 250 30 150 60 90C90 40 120 20 150 0Z" />
      <use href="#ts-palm" transform="translate(120 120) scale(1.05)" />
    </g>
    <g fill="#1b4a2c" opacity=".9">
      <use href="#ts-leaf" transform="translate(-10 40) rotate(40) scale(.7)" />
    </g>
  </svg>
);

const CornerBottom: React.FC<{ mirrored?: boolean }> = ({ mirrored }) => (
  <svg
    className="absolute bottom-0 pointer-events-none"
    style={{
      width: CORNER_WIDTH,
      aspectRatio: '420 / 360',
      overflow: 'visible',
      [mirrored ? 'right' : 'left']: 0,
      transform: mirrored ? 'scaleX(-1)' : undefined,
    }}
    viewBox="0 360 420 360"
    aria-hidden="true"
  >
    {/* rocks */}
    <path d="M-20 720C20 640 120 630 210 650C270 664 300 700 320 720Z" fill="#7a5a48" />
    <path d="M-20 720C20 662 100 654 170 668C130 684 100 700 90 720Z" fill="#9a7660" opacity=".7" />
    {/* big foreground leaves + blooms */}
    <g fill="#123a26">
      <use href="#ts-leaf" transform="translate(-20 730) rotate(-62) scale(1.15)" />
      <use href="#ts-leaf" transform="translate(40 740) rotate(-28) scale(.95)" />
    </g>
    <g fill="#1c5535">
      <use href="#ts-leaf" transform="translate(-10 740) rotate(-46) scale(.8)" />
    </g>
    <g transform="translate(70 640) scale(.9)"><use href="#ts-bloom" /></g>
    <g transform="translate(120 668) scale(.55) rotate(18)"><use href="#ts-bloom" /></g>
  </svg>
);

export const TitleFrame: React.FC = () => (
  <>
    <CornerTop />
    <CornerTop mirrored />
    <CornerBottom />
    <CornerBottom mirrored />
  </>
);

/** Branch, swaying vines and the hanging sloth. Width-fluid, height-capped by the parent. */
export const TitleHero: React.FC<{ className?: string }> = ({ className }) => {
  const paint = heroSpriteEnabled();
  return (
  <svg
    className={className}
    viewBox="340 50 600 350"
    preserveAspectRatio="xMidYMin meet"
    style={{ overflow: 'visible' }}
    aria-hidden="true"
  >
    {/* branch (runs far past the viewBox so it always reaches both screen edges) */}
    <path d="M-900 76C-300 118 520 98 640 100C760 98 1500 118 2180 72" fill="none" stroke="#4a2a14" strokeWidth="22" strokeLinecap="round" />
    <path d="M-900 70C-300 112 520 92 640 94C760 92 1500 112 2180 66" fill="none" stroke="#7a4a26" strokeWidth="9" strokeLinecap="round" opacity=".9" />
    <path d="M120 88C320 120 520 104 640 104" fill="none" stroke="#2f9a4a" strokeWidth="5" strokeDasharray="26 12" opacity=".9" />

    {/* vines */}
    <g className="ts-sway"><use href="#ts-vine" transform="translate(270 108)" /></g>
    <g className="ts-sway ts-b"><use href="#ts-vine" transform="translate(430 112) scale(.8)" /></g>
    <g className="ts-sway ts-c"><use href="#ts-vine" transform="translate(860 112) scale(.9)" /></g>
    <g className="ts-sway"><use href="#ts-vine" transform="translate(1010 110)" /></g>

    {!paint && (
      <>
      {/* hero sloth */}
      <g className="ts-hang">
        <g transform="translate(640 80) scale(.86) translate(0 153)">
          {/* arms */}
          <path d="M-52 40C-70 -20-60 -80-40 -124" stroke="#9a6d41" strokeWidth="30" strokeLinecap="round" fill="none" />
          <path d="M52 40C70 -20 60 -80 40 -124" stroke="#9a6d41" strokeWidth="30" strokeLinecap="round" fill="none" />
          <path d="M-52 40C-70 -20-60 -80-40 -124" stroke="#c79a68" strokeWidth="22" strokeLinecap="round" fill="none" />
          <path d="M52 40C70 -20 60 -80 40 -124" stroke="#c79a68" strokeWidth="22" strokeLinecap="round" fill="none" />
          {/* claws gripping the branch */}
          <g stroke="#fff3dc" strokeWidth="5.5" strokeLinecap="round" fill="none">
            <path d="M-52 -126C-56 -140-52 -148-46 -152" />
            <path d="M-42 -128C-42 -142-38 -150-32 -153" />
            <path d="M-32 -126C-30 -138-24 -146-18 -148" />
            <path d="M52 -126C56 -140 52 -148 46 -152" />
            <path d="M42 -128C42 -142 38 -150 32 -153" />
            <path d="M32 -126C30 -138 24 -146 18 -148" />
          </g>

          {/* body */}
          <ellipse cx="0" cy="104" rx="72" ry="84" fill="url(#ts-fur)" />
          <ellipse cx="0" cy="118" rx="44" ry="56" fill="#f1dcc0" />
          {/* fur strokes + warm rim light */}
          <g stroke="#b88a58" strokeWidth="3.2" strokeLinecap="round" fill="none" opacity=".75">
            <path d="M-58 70q-6 10 0 20" /><path d="M-62 110q-6 10 0 20" /><path d="M-54 148q-4 9 2 16" />
            <path d="M58 70q6 10 0 20" /><path d="M62 110q6 10 0 20" /><path d="M54 148q4 9 -2 16" />
          </g>
          <path d="M-70 96C-72 60-56 36-40 28" fill="none" stroke="#ffe3a8" strokeWidth="4" strokeLinecap="round" opacity=".55" />
          <path d="M70 96C72 60 56 36 40 28" fill="none" stroke="#ffe3a8" strokeWidth="4" strokeLinecap="round" opacity=".55" />
          <g stroke="#d9bc94" strokeWidth="3" strokeLinecap="round">
            <path d="M-14 100l4 8" /><path d="M8 112l4 8" /><path d="M-6 136l4 8" /><path d="M16 144l3 7" /><path d="M-22 122l4 8" />
          </g>

          {/* feet */}
          <ellipse cx="-34" cy="184" rx="26" ry="14" fill="#9a6d41" />
          <ellipse cx="34" cy="184" rx="26" ry="14" fill="#9a6d41" />
          <g stroke="#fff3dc" strokeWidth="4.5" strokeLinecap="round">
            <path d="M-48 192l-4 8" /><path d="M-36 194l-2 9" /><path d="M-24 192l0 8" />
            <path d="M48 192l4 8" /><path d="M36 194l2 9" /><path d="M24 192l0 8" />
          </g>

          {/* head */}
          <path d="M-70 -6C-74 -52-40 -80 0 -80C40 -80 74 -52 70 -6C68 38 36 62 0 62C-36 62 -68 38 -70 -6Z" fill="url(#ts-fur)" />
          <g fill="#c79a68">
            <circle cx="-36" cy="-74" r="9" /><circle cx="-14" cy="-80" r="10" /><circle cx="10" cy="-81" r="10" /><circle cx="32" cy="-76" r="9" />
            <circle cx="-56" cy="-56" r="8" /><circle cx="56" cy="-56" r="8" /><circle cx="-69" cy="-30" r="7" /><circle cx="69" cy="-30" r="7" />
          </g>
          <path d="M-68 8C-64 44-36 62 0 62C36 62 64 44 68 8C50 40 28 50 0 50C-28 50-50 40-68 8Z" fill="#8d6238" opacity=".35" />
          <path d="M-50 -58C-30 -76 30 -76 50 -58C30 -68-30 -68-50 -58Z" fill="#ffe3a8" opacity=".55" />

          {/* face */}
          <path d="M-56 -8C-58 -40-34 -58 0 -58C34 -58 58 -40 56 -8C54 28 32 50 0 50C-32 50 -54 28 -56 -8Z" fill="#f4e3c8" />
          <ellipse cx="-27" cy="-6" rx="19" ry="16" transform="rotate(24 -27 -6)" fill="#6a4426" />
          <ellipse cx="27" cy="-6" rx="19" ry="16" transform="rotate(-24 27 -6)" fill="#6a4426" />
          <g className="ts-blink">
            <ellipse cx="-27" cy="-6" rx="13" ry="14.5" fill="url(#ts-iris)" />
            <circle cx="-32" cy="-13" r="5.2" fill="#fff" />
            <circle cx="-22" cy="0" r="2.4" fill="#fff" opacity=".85" />
          </g>
          <g className="ts-blink">
            <ellipse cx="27" cy="-6" rx="13" ry="14.5" fill="url(#ts-iris)" />
            <circle cx="22" cy="-13" r="5.2" fill="#fff" />
            <circle cx="32" cy="0" r="2.4" fill="#fff" opacity=".85" />
          </g>
          <ellipse cx="-38" cy="22" rx="10" ry="6" fill="#ff9a8a" opacity=".38" />
          <ellipse cx="38" cy="22" rx="10" ry="6" fill="#ff9a8a" opacity=".38" />
          <ellipse cx="0" cy="14" rx="10" ry="7" fill="#3a2414" />
          <ellipse cx="-3" cy="11.5" rx="3.4" ry="1.8" fill="#fff" opacity=".6" />
          <path d="M0 21V28M-15 30Q0 44 15 30" fill="none" stroke="#6a4426" strokeWidth="3.4" strokeLinecap="round" />
        </g>
      </g>
      </>
    )}
  </svg>
  );
};

const FIREFLIES: Array<{ cx: number; cy: number; r: number; delay: number }> = [
  { cx: 210, cy: 330, r: 4, delay: 0 },
  { cx: 330, cy: 260, r: 3, delay: -1 },
  { cx: 480, cy: 380, r: 3.5, delay: -2 },
  { cx: 820, cy: 300, r: 4, delay: -0.5 },
  { cx: 960, cy: 370, r: 3, delay: -1.5 },
  { cx: 1060, cy: 280, r: 3.5, delay: -2.5 },
  { cx: 150, cy: 500, r: 3, delay: -3 },
  { cx: 1130, cy: 520, r: 3.5, delay: -0.8 },
  { cx: 560, cy: 540, r: 3, delay: -2.2 },
  { cx: 740, cy: 560, r: 3, delay: -1.2 },
];

export const TitleFireflies: React.FC = () => (
  <svg
    className="absolute inset-0 w-full h-full pointer-events-none"
    viewBox="0 0 1280 720"
    preserveAspectRatio="xMidYMid slice"
    aria-hidden="true"
  >
    <g fill="#fff3a6">
      {FIREFLIES.map((f, i) => (
        <circle key={i} className="ts-fly ts-drift" style={{ animationDelay: `${f.delay}s` }} cx={f.cx} cy={f.cy} r={f.r} />
      ))}
    </g>
  </svg>
);

/**
 * The painted Pokey standing on top of the logo, looking out at the sunrise. A plain element placed from the
 * logo's own font size, so his feet stay on the letters at every screen size. Renders nothing when the classic
 * hero is selected (the hanging vector sloth in TitleHero takes over).
 */
export const TitleSlomatt: React.FC = () => {
  if (!heroSpriteEnabled()) return null;
  return (
    <div className="title-slomatt" aria-hidden="true">
      <div className="title-slomatt-breathe">
        <img src={TITLE_IDLE} alt="" draggable={false} />
        <img className="title-slomatt-blink" src={TITLE_BLINK} alt="" draggable={false} />
      </div>
    </div>
  );
};
