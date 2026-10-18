import React, { useState, useEffect } from 'react';
import { sound } from '../game/audio.ts';

interface StoryCutsceneProps {
  onFinish: () => void;
}

interface StoryPanel {
  title: string;
  chapter: string;
  speaker: string;
  dialogue: string;
  bgGradient: string;
  sceneType: 'peaceful' | 'kidnap' | 'warrior' | 'journey';
}

const PANELS: StoryPanel[] = [
  {
    chapter: 'PROLOGUE',
    title: 'Peace in the Emerald Canopy',
    speaker: 'Daisy',
    dialogue: 'Milo, look at this blooming orchid! The canopy has never been more peaceful...',
    bgGradient: 'from-emerald-950 via-teal-950 to-stone-950',
    sceneType: 'peaceful',
  },
  {
    chapter: 'THE RAID',
    title: 'Shadows from the Storm',
    speaker: 'General Iron-Claw',
    dialogue: 'Gwahaha! Seize the girl! Take her to the Highland Fortress! No lazy sloth can ever reach my summit!',
    bgGradient: 'from-purple-950 via-red-950 to-stone-950',
    sceneType: 'kidnap',
  },
  {
    chapter: 'THE VOW',
    title: 'A Hero Awakens',
    speaker: 'Milo',
    dialogue: 'Daisy... I will find you! I don’t care how many rivers, predators, or mountain spires stand in my way!',
    bgGradient: 'from-amber-950 via-emerald-950 to-stone-950',
    sceneType: 'warrior',
  },
  {
    chapter: 'THE EXPEDITION',
    title: '10 Realms, 100 Missions',
    speaker: 'Narrator',
    dialogue: 'Armed with sharp claws, ancient martial arts, and swinging vines, Milo leaps into the wild rainforest to rescue his true love!',
    bgGradient: 'from-sky-950 via-emerald-950 to-stone-950',
    sceneType: 'journey',
  },
];

export const StoryCutscene: React.FC<StoryCutsceneProps> = ({ onFinish }) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const panel = PANELS[currentIdx];

  // Sound effects on panel change
  useEffect(() => {
    if (panel.sceneType === 'kidnap') {
      sound.playBossRoar();
    } else if (panel.sceneType === 'warrior') {
      sound.playMegaPunch();
    } else {
      sound.playFruitPickup();
    }
  }, [currentIdx, panel.sceneType]);

  const handleNext = () => {
    if (currentIdx < PANELS.length - 1) {
      setCurrentIdx(currentIdx + 1);
    } else {
      onFinish();
    }
  };

  const handlePrev = () => {
    if (currentIdx > 0) {
      setCurrentIdx(currentIdx - 1);
    }
  };

  // Keyboard navigation (Space/Enter for next, Esc for skip)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'Enter' || e.code === 'ArrowRight') {
        e.preventDefault();
        handleNext();
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        handlePrev();
      } else if (e.code === 'Escape') {
        e.preventDefault();
        onFinish();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [currentIdx]);

  return (
    <div className={`fixed inset-0 z-50 flex flex-col items-center justify-between p-4 sm:p-8 bg-gradient-to-b ${panel.bgGradient} text-white select-none font-game animate-fadeIn`}>
      {/* Top Header & Skip */}
      <div className="w-full max-w-4xl flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 px-3 py-1 rounded-xl text-xs font-black tracking-widest uppercase">
            {panel.chapter}
          </span>
          <span className="text-stone-300 text-sm font-semibold tracking-wide hidden sm:inline">
            Story Chapter {currentIdx + 1} of {PANELS.length}
          </span>
        </div>

        <button
          type="button"
          onClick={onFinish}
          className="bg-black/40 hover:bg-black/60 active:scale-95 border border-stone-600/50 hover:border-emerald-400 text-stone-300 hover:text-white px-4 py-1.5 rounded-xl text-xs font-bold transition-all"
        >
          Skip Intro ➔
        </button>
      </div>

      {/* Main Illustration Canvas / Artwork */}
      <div className="w-full max-w-3xl flex-1 flex flex-col items-center justify-center my-3 sm:my-6 relative">
        <div className="w-full aspect-[16/9] max-h-[400px] bg-black/80 rounded-3xl border-2 border-emerald-500/40 overflow-hidden shadow-2xl relative flex items-center justify-center">
          {panel.sceneType === 'peaceful' && (
            <svg viewBox="0 0 640 360" className="w-full h-full">
              <defs>
                <linearGradient id="skyGrad1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0284c7" />
                  <stop offset="60%" stopColor="#38bdf8" />
                  <stop offset="100%" stopColor="#86efac" />
                </linearGradient>
                <linearGradient id="boughGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#78350f" />
                  <stop offset="50%" stopColor="#451a03" />
                  <stop offset="100%" stopColor="#1c1917" />
                </linearGradient>
                <linearGradient id="miloFur" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#c7925e" />
                  <stop offset="60%" stopColor="#966030" />
                  <stop offset="100%" stopColor="#573315" />
                </linearGradient>
                <linearGradient id="daisyFur" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#d4a373" />
                  <stop offset="60%" stopColor="#a57342" />
                  <stop offset="100%" stopColor="#6f421a" />
                </linearGradient>
              </defs>
              <rect width="640" height="360" fill="url(#skyGrad1)" />

              {/* Distant Rainforest Mountain Ridges */}
              <path d="M0,230 Q160,160 320,210 T640,190 L640,360 L0,360 Z" fill="#0f766e" opacity="0.6" />
              <path d="M0,260 Q180,190 400,240 T640,230 L640,360 L0,360 Z" fill="#14532d" opacity="0.8" />

              {/* Cascading Sunbeams */}
              <polygon points="100,-20 180,-20 320,380 200,380" fill="rgba(254,240,138,0.22)" />
              <polygon points="320,-20 400,-20 540,380 440,380" fill="rgba(254,240,138,0.18)" />

              {/* Massive Ancient Ceiba Branch */}
              <path d="M-20,220 Q240,200 660,230 L660,360 L-20,360 Z" fill="url(#boughGrad)" />
              {/* Moss Carpet */}
              <path d="M-20,215 Q240,195 660,225 L660,240 Q240,210 -20,230 Z" fill="#22c55e" />
              <path d="M-20,213 Q240,193 660,223 L660,228 Q240,200 -20,220 Z" fill="#86efac" />

              {/* Hanging Vines & Orchids Draped Down */}
              <path d="M80,240 Q95,290 85,340" stroke="#15803d" strokeWidth="5" fill="none" strokeLinecap="round" />
              <path d="M140,245 Q155,305 145,350" stroke="#166534" strokeWidth="4" fill="none" strokeLinecap="round" />
              <path d="M520,240 Q505,300 515,355" stroke="#15803d" strokeWidth="5" fill="none" strokeLinecap="round" />
              <circle cx="85" cy="335" r="9" fill="#ec4899" />
              <circle cx="145" cy="345" r="8" fill="#f43f5e" />
              <circle cx="515" cy="350" r="10" fill="#a855f7" />

              {/* Milo the Sloth (Left) - Detailed & Adorable */}
              <g transform="translate(225, 175)">
                {/* Sloth Body */}
                <ellipse cx="0" cy="20" rx="46" ry="38" fill="url(#miloFur)" />
                {/* Soft Cream Chest Patch */}
                <ellipse cx="6" cy="18" rx="28" ry="24" fill="#fef3c7" />

                {/* Left Arm resting on branch */}
                <ellipse cx="-34" cy="24" rx="16" ry="10" fill="#966030" transform="rotate(-15 -34 24)" />
                {/* 3 Pearly Claws */}
                <circle cx="-48" cy="24" r="3" fill="#fef3c7" stroke="#451a03" strokeWidth="1" />
                <circle cx="-46" cy="29" r="3" fill="#fef3c7" stroke="#451a03" strokeWidth="1" />
                <circle cx="-42" cy="33" r="3" fill="#fef3c7" stroke="#451a03" strokeWidth="1" />

                {/* Right Arm holding Blooming Golden Orchid towards Daisy */}
                <path d="M25,18 Q55,5 72,-10" stroke="#966030" strokeWidth="16" fill="none" strokeLinecap="round" />
                {/* Paws holding flower stem */}
                <circle cx="72" cy="-10" r="7" fill="#fef3c7" />
                {/* Glowing Golden Orchid Blossom */}
                <g transform="translate(72, -22)">
                  <circle cx="0" cy="0" r="14" fill="#fde047" opacity="0.4" />
                  <ellipse cx="-6" cy="-4" rx="7" ry="5" fill="#facc15" />
                  <ellipse cx="6" cy="-4" rx="7" ry="5" fill="#facc15" />
                  <ellipse cx="-4" cy="6" rx="6" ry="5" fill="#f59e0b" />
                  <ellipse cx="4" cy="6" rx="6" ry="5" fill="#f59e0b" />
                  <circle cx="0" cy="0" r="4" fill="#ffffff" />
                </g>

                {/* Milo's Cute Round Head */}
                <circle cx="4" cy="-22" r="34" fill="#a57342" />
                {/* Cheek Tufts */}
                <ellipse cx="-26" cy="-14" rx="9" ry="12" fill="#8c5a32" />
                {/* Dark Chocolate Eye Masks */}
                <ellipse cx="12" cy="-24" rx="16" ry="12" fill="#381e0d" transform="rotate(10 12 -24)" />
                <ellipse cx="-8" cy="-24" rx="14" ry="11" fill="#381e0d" transform="rotate(-10 -8 -24)" />

                {/* Cream Muzzle */}
                <ellipse cx="4" cy="-14" rx="17" ry="12" fill="#fffbeb" />
                {/* Shiny Black Button Nose */}
                <ellipse cx="6" cy="-17" rx="6" ry="4.5" fill="#18181b" />
                <circle cx="4.5" cy="-18" r="1.5" fill="#ffffff" />
                {/* Sweet Smiling Mouth */}
                <path d="M-1,-11 Q6,-6 13,-11" stroke="#381e0d" strokeWidth="2.5" fill="none" strokeLinecap="round" />

                {/* Big Glossy Soulful Eyes */}
                {/* Left Eye */}
                <ellipse cx="-8" cy="-24" rx="6.5" ry="7.5" fill="#0f172a" />
                <circle cx="-10" cy="-26" r="2.8" fill="#ffffff" />
                <circle cx="-6" cy="-22" r="1.4" fill="#ffffff" />
                {/* Right Eye looking lovingly at Daisy */}
                <ellipse cx="14" cy="-24" rx="6.5" ry="7.5" fill="#0f172a" />
                <circle cx="12" cy="-26" r="2.8" fill="#ffffff" />
                <circle cx="16" cy="-22" r="1.4" fill="#ffffff" />
              </g>

              {/* Daisy the Sloth (Right) - In Love & Blushing */}
              <g transform="translate(415, 175)">
                {/* Sloth Body */}
                <ellipse cx="0" cy="20" rx="44" ry="36" fill="url(#daisyFur)" />
                {/* Soft Cream Chest Patch */}
                <ellipse cx="-6" cy="18" rx="26" ry="22" fill="#fef3c7" />

                {/* Arms resting cutely together */}
                <ellipse cx="-20" cy="25" rx="14" ry="10" fill="#a57342" />
                <ellipse cx="20" cy="25" rx="14" ry="10" fill="#a57342" />
                {/* Pearly claws */}
                <circle cx="-18" cy="33" r="3" fill="#fef3c7" stroke="#451a03" strokeWidth="1" />
                <circle cx="18" cy="33" r="3" fill="#fef3c7" stroke="#451a03" strokeWidth="1" />

                {/* Daisy's Cute Round Head */}
                <circle cx="-4" cy="-22" r="33" fill="#b45309" />
                {/* Cheek Tufts */}
                <ellipse cx="26" cy="-14" rx="9" ry="12" fill="#92400e" />

                {/* Dark Chocolate Eye Masks */}
                <ellipse cx="-12" cy="-24" rx="15" ry="11" fill="#381e0d" transform="rotate(-10 -12 -24)" />
                <ellipse cx="8" cy="-24" rx="15" ry="11" fill="#381e0d" transform="rotate(10 8 -24)" />

                {/* Cream Muzzle */}
                <ellipse cx="-4" cy="-14" rx="16" ry="11" fill="#fffbeb" />
                {/* Shiny Black Button Nose */}
                <ellipse cx="-5" cy="-17" rx="5.5" ry="4" fill="#18181b" />
                <circle cx="-6.5" cy="-18" r="1.4" fill="#ffffff" />
                {/* Sweet Happy Smile */}
                <path d="M-11,-11 Q-4,-6 3,-11" stroke="#381e0d" strokeWidth="2.5" fill="none" strokeLinecap="round" />

                {/* Blushing Rosy Cheeks */}
                <ellipse cx="-24" cy="-14" rx="7" ry="4.5" fill="rgba(244,63,94,0.4)" />
                <ellipse cx="16" cy="-14" rx="7" ry="4.5" fill="rgba(244,63,94,0.4)" />

                {/* Large Beautiful Eyes with Long Eyelashes */}
                {/* Left Eye */}
                <ellipse cx="-12" cy="-24" rx="6.5" ry="7.5" fill="#0f172a" />
                <circle cx="-14" cy="-26" r="2.8" fill="#ffffff" />
                <circle cx="-10" cy="-22" r="1.4" fill="#ffffff" />
                <path d="M-18,-29 L-22,-34 M-14,-32 L-15,-37" stroke="#0f172a" strokeWidth="1.8" strokeLinecap="round" />
                {/* Right Eye */}
                <ellipse cx="8" cy="-24" rx="6.5" ry="7.5" fill="#0f172a" />
                <circle cx="6" cy="-26" r="2.8" fill="#ffffff" />
                <circle cx="10" cy="-22" r="1.4" fill="#ffffff" />
                <path d="M12,-29 L16,-34 M8,-32 L9,-37" stroke="#0f172a" strokeWidth="1.8" strokeLinecap="round" />

                {/* Daisy's Signature Blooming Pink Orchid Flower Tucked Behind Ear */}
                <g transform="translate(24, -42)">
                  <circle cx="0" cy="0" r="18" fill="rgba(244,63,94,0.3)" />
                  <ellipse cx="-7" cy="-7" rx="9" ry="6" fill="#f43f5e" transform="rotate(-30 -7 -7)" />
                  <ellipse cx="7" cy="-7" rx="9" ry="6" fill="#f43f5e" transform="rotate(30 7 -7)" />
                  <ellipse cx="-8" cy="6" rx="8" ry="6" fill="#ec4899" transform="rotate(30 -8 6)" />
                  <ellipse cx="8" cy="6" rx="8" ry="6" fill="#ec4899" transform="rotate(-30 8 6)" />
                  <ellipse cx="0" cy="-10" rx="9" ry="7" fill="#fb7185" />
                  <circle cx="0" cy="0" r="5" fill="#fef08a" />
                  <circle cx="0" cy="0" r="2" fill="#ffffff" />
                </g>
              </g>

              {/* Fluttering Blue Morpho Butterflies */}
              <g transform="translate(320, 110)">
                <ellipse cx="-12" cy="0" rx="14" ry="10" fill="#38bdf8" />
                <ellipse cx="12" cy="0" rx="14" ry="10" fill="#38bdf8" />
                <ellipse cx="0" cy="0" rx="3" ry="8" fill="#0f172a" />
              </g>
              <g transform="translate(480, 80) scale(0.7)">
                <ellipse cx="-12" cy="0" rx="14" ry="10" fill="#38bdf8" />
                <ellipse cx="12" cy="0" rx="14" ry="10" fill="#38bdf8" />
                <ellipse cx="0" cy="0" rx="3" ry="8" fill="#0f172a" />
              </g>
            </svg>
          )}

          {panel.sceneType === 'kidnap' && (
            <svg viewBox="0 0 640 360" className="w-full h-full">
              <defs>
                <linearGradient id="stormSky" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0f172a" />
                  <stop offset="40%" stopColor="#311042" />
                  <stop offset="75%" stopColor="#450a0a" />
                  <stop offset="100%" stopColor="#09090b" />
                </linearGradient>
              </defs>
              <rect width="640" height="360" fill="url(#stormSky)" />

              {/* Lightning Strikes */}
              <polygon points="260,0 230,110 270,120 210,240 235,160 215,150" fill="#fde047" opacity="0.95" />
              <polygon points="490,0 470,80 500,90 450,180 470,120 455,115" fill="#facc15" opacity="0.8" />

              {/* Billowing Storm Clouds */}
              <circle cx="120" cy="50" r="80" fill="#18181b" opacity="0.85" />
              <circle cx="280" cy="30" r="95" fill="#09090b" opacity="0.9" />
              <circle cx="490" cy="40" r="105" fill="#1e1b4b" opacity="0.85" />

              {/* General Iron-Claw - Giant Terrifying Harpy Eagle */}
              <g transform="translate(420, 85)">
                {/* Massive Wing Spans */}
                {/* Left Wing */}
                <path d="M-20,-10 Q-120,-80 -210,-20 Q-140,20 -30,10 Z" fill="#27272a" stroke="#ca8a04" strokeWidth="2.5" />
                {/* Feathers fringe */}
                <path d="M-180,-25 Q-140,-5 -90,15" stroke="#71717a" strokeWidth="4" fill="none" />
                {/* Right Wing */}
                <path d="M20,-10 Q120,-80 210,-20 Q140,20 30,10 Z" fill="#27272a" stroke="#ca8a04" strokeWidth="2.5" />
                <path d="M180,-25 Q140,-5 90,15" stroke="#71717a" strokeWidth="4" fill="none" />

                {/* Eagle Body & Crest */}
                <ellipse cx="0" cy="0" rx="36" ry="44" fill="#3f3f46" />
                <ellipse cx="0" cy="4" rx="26" ry="32" fill="#71717a" />
                {/* Raptor Crest Feathers */}
                <polygon points="0,-48 -14,-78 -4,-50" fill="#18181b" />
                <polygon points="6,-48 16,-82 12,-48" fill="#18181b" />
                <polygon points="-8,-46 -24,-72 -14,-46" fill="#27272a" />

                {/* Menacing Golden-Red Glowing Raptor Eyes */}
                <circle cx="-14" cy="-22" r="7.5" fill="#fde047" />
                <circle cx="-14" cy="-22" r="4" fill="#ef4444" />
                <circle cx="-15" cy="-24" r="1.5" fill="#ffffff" />
                <circle cx="14" cy="-22" r="7.5" fill="#fde047" />
                <circle cx="14" cy="-22" r="4" fill="#ef4444" />
                <circle cx="13" cy="-24" r="1.5" fill="#ffffff" />
                {/* Piercing raptor brow */}
                <path d="M-24,-30 L-6,-22 M6,-22 L24,-30" stroke="#09090b" strokeWidth="4" strokeLinecap="round" />

                {/* Sharp Hooked Golden Eagle Beak */}
                <path d="M-8,-16 Q0,-12 8,-16 Q10,4 0,16 Q-10,4 -8,-16 Z" fill="#eab308" stroke="#78350f" strokeWidth="1.5" />

                {/* Giant Razor-Sharp Steel Talons Clutching the Golden Cage */}
                <g transform="translate(0, 48)">
                  <path d="M-22,0 L-22,24 M-14,0 L-14,26 M-6,0 L-6,22" stroke="#eab308" strokeWidth="6" strokeLinecap="round" />
                  <path d="M6,0 L6,22 M14,0 L14,26 M22,0 L22,24" stroke="#eab308" strokeWidth="6" strokeLinecap="round" />
                  {/* Razor talons hooks */}
                  <path d="M-22,24 Q-28,34 -20,38" stroke="#ca8a04" strokeWidth="4" fill="none" strokeLinecap="round" />
                  <path d="M-14,26 Q-18,36 -10,40" stroke="#ca8a04" strokeWidth="4" fill="none" strokeLinecap="round" />
                  <path d="M14,26 Q18,36 10,40" stroke="#ca8a04" strokeWidth="4" fill="none" strokeLinecap="round" />
                  <path d="M22,24 Q28,34 20,38" stroke="#ca8a04" strokeWidth="4" fill="none" strokeLinecap="round" />
                </g>
              </g>

              {/* The Golden Bamboo Cage with Daisy Inside Crying Out */}
              <g transform="translate(420, 195)">
                {/* Cage Glow Aura */}
                <circle cx="0" cy="0" r="60" fill="rgba(234, 179, 8, 0.25)" />

                {/* Daisy Inside Cage */}
                <g transform="translate(0, 6)">
                  <ellipse cx="0" cy="14" rx="28" ry="24" fill="#a57342" />
                  <circle cx="0" cy="-14" r="22" fill="#b45309" />
                  <ellipse cx="0" cy="-10" rx="14" ry="10" fill="#fffbeb" />
                  <ellipse cx="0" cy="-12" rx="4" ry="3" fill="#18181b" />
                  {/* Crying open mouth */}
                  <ellipse cx="0" cy="-4" rx="6" ry="8" fill="#450a0a" />
                  {/* Tears streaming down */}
                  <path d="M-7,-7 Q-12,2 -8,14" stroke="#38bdf8" strokeWidth="3" fill="none" />
                  <path d="M7,-7 Q12,2 8,14" stroke="#38bdf8" strokeWidth="3" fill="none" />
                  {/* Daisy reaching paws through the bars */}
                  <path d="M-12,8 L-42,14" stroke="#a57342" strokeWidth="9" strokeLinecap="round" />
                  <path d="M12,8 L42,14" stroke="#a57342" strokeWidth="9" strokeLinecap="round" />
                  {/* Claws */}
                  <circle cx="-42" cy="14" r="3" fill="#fef3c7" />
                  <circle cx="42" cy="14" r="3" fill="#fef3c7" />
                </g>

                {/* Sturdy Golden Cage Bars */}
                <rect x="-44" y="-46" width="88" height="96" rx="14" fill="none" stroke="#eab308" strokeWidth="6" />
                <line x1="-24" y1="-46" x2="-24" y2="50" stroke="#ca8a04" strokeWidth="4.5" />
                <line x1="0" y1="-46" x2="0" y2="50" stroke="#ca8a04" strokeWidth="4.5" />
                <line x1="24" y1="-46" x2="24" y2="50" stroke="#ca8a04" strokeWidth="4.5" />
                {/* Heavy lock ring on top */}
                <circle cx="0" cy="-52" r="10" fill="none" stroke="#ca8a04" strokeWidth="5" />
              </g>

              {/* Daisy's Falling Pink Orchid Flower & Drifting Petals */}
              <g transform="translate(340, 240) rotate(35)">
                <ellipse cx="-6" cy="-6" rx="8" ry="5" fill="#f43f5e" />
                <ellipse cx="6" cy="-6" rx="8" ry="5" fill="#f43f5e" />
                <ellipse cx="-7" cy="5" rx="7" ry="5" fill="#ec4899" />
                <ellipse cx="7" cy="5" rx="7" ry="5" fill="#ec4899" />
                <circle cx="0" cy="0" r="4" fill="#fef08a" />
              </g>
              {/* Petals falling */}
              <ellipse cx="310" cy="270" rx="6" ry="3" fill="#f43f5e" transform="rotate(45 310 270)" />
              <ellipse cx="280" cy="300" rx="5" ry="3" fill="#fb7185" transform="rotate(15 280 300)" />

              {/* Tree Branch Below */}
              <path d="M-20,290 Q200,260 660,300 L660,360 L-20,360 Z" fill="#451a03" />

              {/* Milo Reaching Up Desperately in Horror (Left) */}
              <g transform="translate(150, 230)">
                <ellipse cx="0" cy="40" rx="46" ry="36" fill="url(#miloFur)" />
                <circle cx="14" cy="-4" r="34" fill="#a57342" />
                <ellipse cx="14" cy="-4" rx="20" ry="14" fill="#fffbeb" />
                {/* Shocked Eyes */}
                <circle cx="6" cy="-12" r="7.5" fill="#ffffff" />
                <circle cx="22" cy="-12" r="7.5" fill="#ffffff" />
                <circle cx="8" cy="-12" r="4" fill="#0f172a" />
                <circle cx="24" cy="-12" r="4" fill="#0f172a" />
                {/* Open Crying Mouth */}
                <ellipse cx="15" cy="4" rx="8" ry="11" fill="#450a0a" stroke="#09090b" strokeWidth="2" />
                {/* Reaching arms stretching upwards toward Daisy */}
                <path d="M25,20 L85,-35" stroke="#966030" strokeWidth="15" strokeLinecap="round" />
                <path d="M10,20 L65,-45" stroke="#78350f" strokeWidth="14" strokeLinecap="round" />
                {/* Claws outstretched */}
                <circle cx="85" cy="-35" r="4" fill="#fef3c7" />
                <circle cx="65" cy="-45" r="4" fill="#fef3c7" />
              </g>
            </svg>
          )}

          {panel.sceneType === 'warrior' && (
            <svg viewBox="0 0 640 360" className="w-full h-full">
              <defs>
                <linearGradient id="warriorGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#450a0a" />
                  <stop offset="50%" stopColor="#78350f" />
                  <stop offset="100%" stopColor="#064e3b" />
                </linearGradient>
              </defs>
              <rect width="640" height="360" fill="url(#warriorGrad)" />

              {/* Radiant Power Aura */}
              <circle cx="320" cy="180" r="160" fill="rgba(244, 63, 94, 0.25)" />
              <circle cx="320" cy="180" r="110" fill="rgba(250, 204, 21, 0.25)" />

              {/* Milo Close-Up Portrait */}
              <g transform="translate(320, 185)">
                {/* Fluffy Body */}
                <ellipse cx="0" cy="70" rx="95" ry="75" fill="#78350f" />
                <ellipse cx="0" cy="65" rx="60" ry="50" fill="#fef3c7" />

                {/* Milo's Heroic Determined Head */}
                <circle cx="0" cy="-20" r="64" fill="#a57342" />
                <ellipse cx="-42" cy="-8" rx="14" ry="18" fill="#8c5a32" />
                <ellipse cx="42" cy="-8" rx="14" ry="18" fill="#8c5a32" />

                {/* Dark Chocolate Eye Masks */}
                <ellipse cx="-20" cy="-24" rx="22" ry="16" fill="#381e0d" transform="rotate(-10 -20 -24)" />
                <ellipse cx="20" cy="-24" rx="22" ry="16" fill="#381e0d" transform="rotate(10 20 -24)" />

                {/* Cream Muzzle */}
                <ellipse cx="0" cy="-8" rx="26" ry="18" fill="#fffbeb" />
                <ellipse cx="0" cy="-14" rx="9" ry="6" fill="#18181b" />
                <circle cx="-2" cy="-15" r="2.2" fill="#ffffff" />

                {/* Fierce Determined Hero Brow */}
                <path d="M-34,-38 L-8,-30" stroke="#381e0d" strokeWidth="5.5" strokeLinecap="round" />
                <path d="M34,-38 L8,-30" stroke="#381e0d" strokeWidth="5.5" strokeLinecap="round" />

                {/* Large Determined Heroic Eyes with Fire Reflecting */}
                <ellipse cx="-18" cy="-24" rx="10" ry="11" fill="#0f172a" />
                <circle cx="-20" cy="-27" r="4.2" fill="#ffffff" />
                <circle cx="-15" cy="-20" r="2.2" fill="#facc15" />
                <ellipse cx="18" cy="-24" rx="10" ry="11" fill="#0f172a" />
                <circle cx="16" cy="-27" r="4.2" fill="#ffffff" />
                <circle cx="21" cy="-20" r="2.2" fill="#facc15" />

                {/* Determined Clenched Mouth */}
                <path d="M-16,-1 Q0,-4 16,-1" stroke="#381e0d" strokeWidth="3.5" fill="none" strokeLinecap="round" />

                {/* Left Paw holding Daisy's Fallen Pink Orchid Flower with Love */}
                <g transform="translate(-85, 45)">
                  <circle cx="0" cy="0" r="22" fill="#a57342" />
                  {/* Daisy's Pink Flower Resting Tenderly in Paw */}
                  <g transform="translate(0, -10)">
                    <ellipse cx="-6" cy="-6" rx="8" ry="5" fill="#f43f5e" />
                    <ellipse cx="6" cy="-6" rx="8" ry="5" fill="#f43f5e" />
                    <ellipse cx="-7" cy="5" rx="7" ry="5" fill="#ec4899" />
                    <ellipse cx="7" cy="5" rx="7" ry="5" fill="#ec4899" />
                    <circle cx="0" cy="0" r="4" fill="#fef08a" />
                  </g>
                </g>

                {/* Right Fist Clenched with Razor-Sharp Claws & Crackling Lightning */}
                <g transform="translate(95, 45)">
                  <circle cx="0" cy="0" r="26" fill="#a57342" stroke="#573315" strokeWidth="3" />
                  {/* 3 Razor Sharp Sloth Claws */}
                  <path d="M-12,-16 L-12,-42 Q-10,-46 -6,-40" stroke="#ffffff" strokeWidth="5.5" strokeLinecap="round" fill="none" />
                  <path d="M0,-18 L0,-48 Q2,-52 6,-46" stroke="#ffffff" strokeWidth="5.5" strokeLinecap="round" fill="none" />
                  <path d="M12,-16 L12,-42 Q14,-46 18,-40" stroke="#ffffff" strokeWidth="5.5" strokeLinecap="round" fill="none" />
                  {/* Crackling Energy Sparks */}
                  <path d="M-10,-48 L-16,-60 L-8,-58 L-12,-72" stroke="#fde047" strokeWidth="3" fill="none" />
                  <path d="M15,-45 L22,-58 L14,-56 L18,-68" stroke="#38bdf8" strokeWidth="3" fill="none" />
                </g>
              </g>
            </svg>
          )}

          {panel.sceneType === 'journey' && (
            <svg viewBox="0 0 640 360" className="w-full h-full">
              <defs>
                <linearGradient id="expSky" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0284c7" />
                  <stop offset="40%" stopColor="#0d9488" />
                  <stop offset="100%" stopColor="#14532d" />
                </linearGradient>
              </defs>
              <rect width="640" height="360" fill="url(#expSky)" />

              {/* Towering Rainforest Peaks */}
              <polygon points="60,360 180,110 300,360" fill="#042f2e" opacity="0.8" />
              <polygon points="280,360 460,70 620,360" fill="#022c22" opacity="0.9" />

              {/* The Evil Highland Fortress at the Peak */}
              <g transform="translate(460, 65)">
                <rect x="-18" y="0" width="36" height="32" fill="#18181b" />
                <polygon points="0,-16 -22,0 22,0" fill="#27272a" />
                <circle cx="0" cy="-6" r="6" fill="#ef4444" />
                <path d="M-10,32 L-10,45 M10,32 L10,45" stroke="#ca8a04" strokeWidth="3" />
                {/* Daisy's Golden Cage Beacon */}
                <circle cx="0" cy="46" r="7" fill="#facc15" />
              </g>

              {/* Rushing Waterfall */}
              <path d="M160,200 L180,360 L150,360 Z" fill="rgba(255,255,255,0.75)" />

              {/* Giant Ancient Banyan Trees on Left & Right */}
              <path d="M-40,160 Q60,180 80,360 L-40,360 Z" fill="#451a03" />
              <path d="M680,180 Q580,200 560,360 L680,360 Z" fill="#451a03" />

              {/* Long Hanging Liana Swinging Across the Canyon */}
              <path d="M60,40 Q220,110 310,210" stroke="#15803d" strokeWidth="8" fill="none" strokeLinecap="round" />
              <path d="M60,40 Q220,110 310,210" stroke="#86efac" strokeWidth="2.5" fill="none" strokeLinecap="round" />

              {/* Milo in Epic Mid-Air Tarzan Vine Swing */}
              <g transform="translate(310, 210) rotate(25)">
                <ellipse cx="0" cy="18" rx="34" ry="26" fill="url(#miloFur)" />
                <ellipse cx="4" cy="16" rx="20" ry="16" fill="#fef3c7" />
                <circle cx="8" cy="-12" r="22" fill="#a57342" />
                <ellipse cx="12" cy="-12" rx="10" ry="8" fill="#fffbeb" />
                <ellipse cx="14" cy="-14" rx="4" ry="3" fill="#18181b" />

                {/* Big Determined Eye */}
                <ellipse cx="12" cy="-14" rx="6" ry="6.5" fill="#0f172a" />
                <circle cx="10" cy="-16" r="2.5" fill="#ffffff" />
                {/* Hero smile */}
                <path d="M8,-7 Q14,-4 20,-8" stroke="#381e0d" strokeWidth="2" fill="none" />

                {/* Claws Gripping Vine Sturdily */}
                <ellipse cx="2" cy="-30" rx="9" ry="6" fill="#a57342" />
                <circle cx="-3" cy="-34" r="3" fill="#fef3c7" />
                <circle cx="2" cy="-36" r="3" fill="#fef3c7" />
                <circle cx="7" cy="-34" r="3" fill="#fef3c7" />
              </g>
            </svg>
          )}

          {/* Vignette border */}
          <div className="absolute inset-0 border border-emerald-400/30 rounded-3xl pointer-events-none shadow-inner" />
        </div>
      </div>

      {/* Comic Dialogue Card & Progress Controls */}
      <div className="w-full max-w-4xl bg-black/80 border-2 border-amber-400/60 rounded-3xl p-5 sm:p-6 shadow-2xl backdrop-blur-md z-10 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Speaker & Speech */}
        <div className="flex flex-col gap-1.5 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-amber-400 font-black text-sm uppercase tracking-wider">
              {panel.speaker}
            </span>
            <span className="text-stone-400 text-xs">— {panel.title}</span>
          </div>
          <p className="text-stone-100 text-sm sm:text-base font-medium leading-relaxed">
            "{panel.dialogue}"
          </p>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-3 shrink-0">
          {currentIdx > 0 && (
            <button
              type="button"
              onClick={handlePrev}
              className="bg-stone-800 hover:bg-stone-700 active:scale-95 border border-stone-600 text-stone-200 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all"
            >
              Back
            </button>
          )}
          <button
            type="button"
            onClick={handleNext}
            className="bg-gradient-to-r from-amber-500 to-emerald-500 hover:from-amber-400 hover:to-emerald-400 active:scale-95 text-stone-950 font-black px-6 py-2.5 rounded-2xl text-xs sm:text-sm shadow-lg shadow-amber-500/30 transition-all flex items-center gap-2"
          >
            {currentIdx < PANELS.length - 1 ? (
              <>
                Next <span>→</span>
              </>
            ) : (
              <>
                Start Adventure! <span>★</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Bottom dots */}
      <div className="flex items-center gap-2 mt-2">
        {PANELS.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setCurrentIdx(i)}
            className={`w-3 h-3 rounded-full transition-all ${
              i === currentIdx ? 'bg-amber-400 w-8' : 'bg-stone-600 hover:bg-stone-400'
            }`}
            aria-label={`Jump to scene ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
};
