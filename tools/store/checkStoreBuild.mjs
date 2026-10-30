#!/usr/bin/env node
/**
 * The Play Store build may not track anyone (Matt, 2026-10-30: "nothing trackable at all"). Run after `npm run build:store`
 * (it runs this itself) and in the Android workflow before the app is packed: it reads every file the build made and fails if it finds
 * - the tester collector (the control test, the play recordings), its key, or its sending code;
 * - any analytics, ads or crash-report service;
 * - a service worker or a web manifest (the app updates through Google Play and makes no network calls of its own);
 * - any web address outside the short list below (SVG and XML name tags, which are names and never fetched).
 * Usage: node tools/store/checkStoreBuild.mjs [dist]
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { pathToFileURL } from 'node:url';

/** words that only appear when a tracker, ad kit or the tester collector is in the build */
export const BANNED = [
  'script.google.com',
  'macros/s/',
  'sct-57496e7010785ac1',
  'google-analytics',
  'googletagmanager',
  'gtag(',
  'firebaseio', 'firebase.google', 'firebaseapp',
  'doubleclick.net',
  'googlesyndication',
  'admob',
  'facebook.net',
  'connect.facebook',
  'sentry.io',
  'mixpanel',
  'amplitude.com',
  'segment.io',
  'hotjar',
  'clarity.ms',
  'posthog',
  'bugsnag',
  'unityads',
  'applovin',
];

/** addresses that are names, not places the game connects to */
export const ALLOWED_URLS = [
  /^https?:\/\/www\.w3\.org\//,
  /^https?:\/\/react\.dev\/errors\//, // React's error text names its help page; it is never fetched
  /^https?:\/\/reactjs\.org\/docs\/error-decoder/,
];

const TEXT = /\.(js|mjs|css|html|json|webmanifest|txt|svg)$/i;

/** what is wrong with one file's text ([] when it is clean) */
export function problemsIn(name, text) {
  const out = [];
  const lower = text.toLowerCase();
  for (const w of BANNED) if (lower.includes(w.toLowerCase())) out.push(`${name}: "${w}"`);
  for (const m of text.matchAll(/https?:\/\/[A-Za-z0-9.-]+[^\s"'`)<>\\]*/g)) {
    if (!ALLOWED_URLS.some((re) => re.test(m[0]))) out.push(`${name}: address ${m[0].slice(0, 80)}`);
  }
  // the collector's beacon folds away in the store build; a beacon left anywhere is a leak
  if (text.includes('sendBeacon')) out.push(`${name}: sendBeacon`);
  return out;
}

/** every problem in a built folder */
export function checkDir(dir) {
  const out = [];
  const walk = (d) => {
    for (const f of readdirSync(d)) {
      const p = join(d, f);
      if (statSync(p).isDirectory()) walk(p);
      else {
        const rel = relative(dir, p);
        if (/^(sw|registerSW)\.js$|^workbox-.*\.js$|\.webmanifest$/.test(f)) out.push(`${rel}: service worker or web manifest file`);
        if (TEXT.test(f)) out.push(...problemsIn(rel, readFileSync(p, 'utf8')));
      }
    }
  };
  walk(dir);
  return out;
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  const dir = process.argv[2] ?? 'dist';
  const bad = checkDir(dir);
  if (bad.length) {
    console.error(`Store build check FAILED (${bad.length}):\n  ${bad.slice(0, 60).join('\n  ')}`);
    process.exit(1);
  }
  console.log(`Store build check passed: ${dir} has no tracking, ads, collector, service worker or outside addresses.`);
}
