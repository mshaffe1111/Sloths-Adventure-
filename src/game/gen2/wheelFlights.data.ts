/**
 * wheelFlights.data — every world's wheel row FLOWN on the real engine, each setting (wheelFlights.ts flyWheel; written by
 * `npx tsx tools/engine/wheelflights.ts --write`, never by hand; wheelFlights.test.ts flies them again and proves this table is the
 * engine's). Keyed by wheelLay.ts flownKey: the setting and the layout (rim, rim speed, buckets, bucket width, street kind and height).
 */
import type { WheelFlownRow } from './wheelFlights.ts';

export const WHEEL_FLOWN: Readonly<Record<string, WheelFlownRow>> = {
  "normal R160 V60 N6 W120 in": {"turn":16.76,"period":2.79,"lift":264,"board":{"tap":{"share":100,"window":2.8},"walk":{"share":73,"window":2.03}},"ride":"street","walk":{"share":22,"window":3.73},"tap":{"share":30,"window":3.87},"jump":{"share":0,"window":0},"step":3.87},
  "easy R160 V50 N6 W120 in": {"turn":20.11,"period":3.35,"lift":264,"board":{"tap":{"share":100,"window":3.37},"walk":{"share":84,"window":2.83}},"ride":"street","walk":{"share":22,"window":4.5},"tap":{"share":32,"window":4.93},"jump":{"share":0,"window":0},"step":4.93},
  "normal R180 V70 N6 W120 edge": {"turn":16.16,"period":2.69,"lift":304,"board":{"tap":{"share":100,"window":2.7},"walk":{"share":65,"window":1.63}},"ride":"stayed in","walk":{"share":11,"window":1.77},"tap":{"share":18,"window":2.87},"jump":{"share":0,"window":0},"step":2.87},
  "easy R180 V60 N6 W120 edge": {"turn":18.85,"period":3.14,"lift":304,"board":{"tap":{"share":100,"window":3.13},"walk":{"share":77,"window":2.4}},"ride":"stayed in","walk":{"share":13,"window":2.2},"tap":{"share":19,"window":3.5},"jump":{"share":0,"window":0},"step":3.5},
  "normal R180 V70 N6 W120 up80": {"turn":16.16,"period":2.69,"lift":412,"board":{"tap":{"share":100,"window":2.7},"walk":{"share":65,"window":1.63}},"ride":"stayed in","walk":{"share":0,"window":0},"tap":{"share":0,"window":0},"jump":{"share":16,"window":2.27},"step":2.27},
  "easy R180 V60 N6 W120 up60": {"turn":18.85,"period":3.14,"lift":392,"board":{"tap":{"share":100,"window":3.13},"walk":{"share":77,"window":2.4}},"ride":"stayed in","walk":{"share":0,"window":0},"tap":{"share":0,"window":0},"jump":{"share":22,"window":4.07},"step":4.07},
  "normal R200 V70 N6 W120 in": {"turn":17.95,"period":2.99,"lift":344,"board":{"tap":{"share":100,"window":3},"walk":{"share":58,"window":1.7}},"ride":"street","walk":{"share":19,"window":3.5},"tap":{"share":25,"window":3.43},"jump":{"share":0,"window":0},"step":3.5},
  "easy R200 V60 N6 W120 in": {"turn":20.94,"period":3.49,"lift":344,"board":{"tap":{"share":100,"window":3.5},"walk":{"share":70,"window":2.43}},"ride":"street","walk":{"share":20,"window":4.13},"tap":{"share":25,"window":4.1},"jump":{"share":0,"window":0},"step":4.13},
};
