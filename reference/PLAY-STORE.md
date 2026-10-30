# Play Store readiness (audit, 2026-10-29 evening ET)

Matt: "we'll want to make sure that we're building this up to code for the Play Store." The web game becomes an Android app through
Capacitor once web 1.0 is done; the project is complete when the app is submitted (STATUS.md). This is a read-only audit of what
exists today (ccr at 1c395663): nothing in the game or the build was changed for it. Each item: **PASS**, **FAIL** or **UNKNOWN**
(needs a device or a decision), the fix, and who owns it.

Owners: **Matt** (accounts, money, legal answers, approvals), **lead** (decisions and briefs), **android** (a new helper to set up the
Android project and the release build; nobody owns this yet), **polish-c** (layouts, already on the status bar and foldables),
**web** (whichever helper owns the touched game code).

## 0. What would change how we build now

These are the items to act on early, because later work builds on them:

1. **The Android project is thrown away and regenerated on every CI run** (`.github/workflows/build-apk.yml` runs `npx cap init` and
   `npx cap add android` each time, with whatever Capacitor version npm has that day: 8.6.0 tonight). So nothing Android-side can be
   set or kept: icons, splash, version number, signing, permissions, back-button code, orientation, app name. **Fix:** generate the
   `android/` project once, pin Capacitor (`@capacitor/core`, `cli`, `android` at one exact version in package.json), commit `android/`,
   and have CI only `npx cap sync android` and build. Owner: android.
2. **CI builds a debug APK only** (`assembleDebug`). Play takes a signed release **App Bundle** (`.aab`). **Fix:** add a release job:
   `./gradlew bundleRelease`, signed with an upload key kept in GitHub Actions secrets, with versionCode bumped every upload. Owner:
   android (Matt creates the key and the secrets).
3. **The control-test recorder ships in every build, the app included.** `playRecorder.ts` sends touch logs, Pokey's moves, device
   kind/screen/browser and a tester nickname to Matt's Google Sheet (an Apps Script web app at script.google.com, via sendBeacon and fetch).
   It runs only when the address has `#ctest` or `?ctest=1`, and the app's address never does, so in the app it is dormant. But the
   collector URL and key are in the shipped bundle (checked: `dist/assets/index-*.js`), and Google's review judges the code it can see.
   For a kids' app with "no data collected" on the Data safety form, it must not be there. **Fix:** strip the recorder, the control test
   gate and the collector from the Android build with a build flag (e.g. `VITE_APP_BUILD=1` makes `ctestEnabled()` a constant false so
   the bundler drops the code), and keep it for the web test link. Owner: web (the lead decides; QA keeps using the web link).
4. **Web-only features that do nothing or break inside the app.** In the app they are dead ends or broken buttons:
   - the "install the game" prompt and "save progress to desktop" (`usePWAInstall.ts`, a `data:` download link);
   - the save-file export (`SaveLoadDialog.tsx`, a blob download). Android's WebView has no download handler, so the button does
     nothing;
   - the "new version ready" check and service worker (`updates.ts`, vite-plugin-pwa). The app updates through Play;
   - the fullscreen button (`fullscreen.ts`, the Fullscreen API). The app should be immersive by itself instead.

   **Fix:** an `isApp()` check (Capacitor's `Capacitor.isNativePlatform()`), hiding install, desktop save and update in the app;
   save export via `@capacitor/filesystem` and the share sheet; immersive full screen set natively. Owner: web + android.
5. **Haptics need a permission.** AN-9's buzzes use `navigator.vibrate`. In Android's WebView that needs `android.permission.VIBRATE`
   in the manifest, and Capacitor's template has only INTERNET, so the Vibration setting silently does nothing in the app. **Fix:** add
   VIBRATE (a normal permission, no prompt, no Data safety impact) or use `@capacitor/haptics`. Owner: android.

## 1. Build and technical requirements

| # | Item | Status | Finding | Fix | Owner |
|---|---|---|---|---|---|
| 1.1 | App Bundle (AAB) | **FAIL** | Debug APK only (`assembleDebug`), attached to GitHub releases. | `bundleRelease`, signed; upload the .aab. Keep the APK only for side-loading tests. | android |
| 1.2 | Target API level | **PASS*** | Play requires API 36 (Android 16) for new apps and updates since 2026-08-31 (extension to 2026-11-01 on request). Capacitor 8.6's template sets target 36 and compile 36. *Only because the version is unpinned today; pin it (0.1). | Pin Capacitor 8.x; when Play's 2027 deadline comes, move with it. | android |
| 1.3 | Minimum API level | **PASS** | minSdk 24 (Android 7.0) from the template. Play sets no minimum. The game needs a recent WebView (CompressionStream, Web Audio, big WebP sheets); WebView updates through Play on 7.0+. | Keep 24, or raise to 26+ if low-end testing shows old WebViews struggling. | android |
| 1.4 | 64-bit and 16 KB pages | **PASS** | A plain Capacitor app ships no native `.so` libraries, so both are met. | Re-check if a plugin with native code is added. | android |
| 1.5 | Play App Signing / upload key | **FAIL** | No keystore, no secrets, no signing config. | Matt creates an upload key, enrols in Play App Signing (Google holds the app key), and stores the upload key and passwords as Actions secrets. | Matt + android |
| 1.6 | Version code / name | **FAIL** | Regenerated as 1 / "1.0" every build. Play refuses an upload whose versionCode isn't higher. | versionCode from the run number or tag; versionName from the release tag. | android |
| 1.7 | App ID | **PASS (decide)** | `com.mshaffe1111.slothadventure`, set in CI. It can never change after the first upload. | Matt confirms it (or picks e.g. `com.<studio>.slothsrainforest`) before the first upload. | Matt |
| 1.8 | Permissions | **PASS** | Template: INTERNET only. Needed for nothing in the app once 0.3 is done: all assets are local. | Keep INTERNET (harmless, and needed by the update check if kept) or drop it after 0.3; add VIBRATE (0.5). No dangerous permissions. | android |
| 1.9 | Offline play | **PASS** | Everything is bundled: fonts are local woff2 (`src/assets/fonts`), sounds and art are local, no CDN. The only network calls are the dormant recorder (0.3) and the version check of a local file. | Test once in airplane mode on a device. | android (test) |
| 1.10 | Back button and gesture | **FAIL (partly)** | In a stage, `backGuard.ts` keeps a history entry, so back pauses the stage: good. Everywhere else (title, map, pause menu, journal, cards, story) Capacitor's default runs: back goes back in history, or **closes the app**. A child pressing back on the map loses the app; back on the pause menu doesn't close the menu. Android 16 also uses predictive back. | `@capacitor/app` `backButton` listener: close the open card or menu, else go up one screen (stage → pause, pause → resume, map → title), and on the title ask "Leave the game?". Never exit mid-stage. | web + android |
| 1.11 | Killed mid-stage, saves survive | **PASS (saves) / UNKNOWN (resume)** | Progress is saved to localStorage at each stage clear (`sloth_lvl_<id>`, App.tsx) and settings at once. WebView storage lives in the app's data and survives kills and updates (and is in Android backup: `allowBackup="true"`). A kill mid-stage drops that stage's progress: the app reopens at the title. That's acceptable for a platformer, but it should be a choice. | Device test: kill in a stage via Developer options, reopen, and check saves. Optional: resume at the stage's last flag. Consider `@capacitor/preferences` mirroring the save, so a WebView data reset can't lose it. | web (test: android) |
| 1.12 | Audio focus | **UNKNOWN (partly PASS)** | When the app is hidden (call screen, home, lock), `visibilitychange` suspends the AudioContext (conductor.ts): good. But Web Audio in a WebView doesn't take Android audio focus, so the game plays over the player's music, and a call ringing while the game is in front won't duck it. | Device test with music playing and an incoming call. If it fails, a small native piece (or a plugin) requesting audio focus and pausing on loss. | android |
| 1.13 | Status bar, notches, foldables | **UNKNOWN** | Target 36 forces edge-to-edge (Android 15+ enforces it, 16 removed the opt-out): the game draws under the status and navigation bars. `viewport-fit=cover` is set; whether the HUD respects the insets in the app is untested. Large screens on target 36 ignore orientation locks and must handle resizing. | polish-c's layout work, then check in the app on a phone with a notch, a foldable (both screens) and a tablet. Immersive mode (hide the bars in play). | polish-c + android |
| 1.14 | Orientation | **PASS** | No lock (web manifest `orientation: any`; Capacitor's activity handles `orientation\|screenSize` without restarting). Every stage plays upright and sideways (Matt's rule). | Keep. Confirm the game resizes cleanly on rotation in the app. | android (test) |
| 1.15 | Start time, crashes, ANRs on low-end phones | **UNKNOWN** | Cold start = WebView + a 3.6 MB JS bundle + the title's art; some stage sheets are 10-20 MB decoded (App.tsx comment). Low-RAM phones risk WebView renderer kills, which Play Vitals counts as crashes. PF-1 is on iPhone frame drops. No crash reporting (good for privacy; Play Vitals is enough). | A native splash (not Capacitor's default image) until the title is ready; test on a 2-3 GB RAM Android phone; watch Play Vitals in closed testing. | android + PF-1 |
| 1.16 | Size limits | **PASS** | `dist/` is 99 MB uncompressed, mostly already-compressed WebP and MP3. Play's base module limit is 200 MB compressed (4 GB with asset packs); no file over 4 MiB. Downloads over 200 MB over mobile data get a warning; we're under. | Watch the size as Worlds 6-10 art lands; asset packs if it nears 200 MB. | lead |
| 1.17 | App icon and splash | **FAIL** | `cap add android` gives Capacitor's default icon and splash. | Generate adaptive icons and a splash from Matt's art (`@capacitor/assets`), committed with `android/`. | android (art: Matt approves) |
| 1.18 | Unused dependencies | **PASS (tidy)** | `@google/genai`, `express`, `dotenv` are in package.json (from the AI Studio start) but not in the bundle (checked). | Remove them so no reviewer or scanner wonders. | web |

## 2. Policy (kids and families)

| # | Item | Status | Finding | Fix | Owner |
|---|---|---|---|---|---|
| 2.1 | Target audience and Families policy | **PASS (code) / to declare** | No ads, no analytics, no tracking SDK, no accounts, no chat, no purchases, no location, no device IDs (checked the dependencies and the bundle). If the target audience includes children (it does: Easy is for ages 7-12), the whole Families policy applies. | In Play Console, Target audience: the age groups chosen honestly (likely 6-8, 9-12, 13+ "and all ages"). No ads declared. | Matt |
| 2.2 | Privacy policy page | **FAIL** | None exists. It's required for every app, and for Families apps it must be accurate and on a public, non-PDF web page. | A short page on the live site, e.g. `/privacy.html`: no personal data collected, saves stay on the device, no ads, no third parties, a contact email. If the tester link stays on the web build, say what it sends and that it's opt-in. Linked in the Console and inside the app (menu). | web (text: Matt approves) |
| 2.3 | Data safety form | **UNKNOWN until 0.3** | With the recorder stripped from the app (0.3): **No data collected, no data shared**, data encrypted in transit (n/a), deletion (uninstall clears it). With the recorder still in the bundle, a reviewer could see an endpoint that receives touch logs, device info and a typed nickname: then "App activity / Device info collected", which is not what a kids' game should show. | Do 0.3, then answer "no data collected". | lead + Matt |
| 2.4 | Content rating (IARC questionnaire) | **UNKNOWN** | Cartoon animals are punched, kicked and stomped (they get dizzy or run off, no blood), with mild peril and boss fights. The IARC answers likely give ESRB Everyone (possibly E with "Mild Fantasy Violence"), PEGI 7, USK 6. No gambling, no purchases, no user content. | Matt answers the questionnaire in the Console; this doc's answers can be the draft. | Matt |
| 2.5 | Accessibility basics | **PARTLY** | Have: settings for sound (music and effects separately), vibration, Dot's help level and story lines; text at least 12 px (UI-14); Easy mode; `prefers-reduced-motion` respected in some CSS (hud, cleared, dotGuide); every stage plays both ways up. Missing or untested: on-screen buttons' sizes against 48 dp; the menu working with TalkBack (buttons need labels); reduced motion for screen shake (AN-10); colour-only cues. | A short pass: 48 dp hit areas, `aria-label` on icon buttons, the shake setting (AN-10). Not a Play blocker, but Families reviews like it. | web |
| 2.6 | Developer account testing rule | **UNKNOWN** | A personal Play developer account created after Nov 2023 must run a closed test with at least 12 testers opted in for 14 days in a row before it can publish to production. An organisation account (needs a D-U-N-S number) is exempt. | Matt: which account type? If personal, plan 2+ weeks of closed testing with 12+ testers (the QA group fits) before the release date. | Matt |
| 2.7 | Ads / in-app purchases | **PASS** | None, and none planned. | Declare "no ads" in the Console. | Matt |

## 3. Store listing assets

| # | Asset | Required | Have | Status | Fix / owner |
|---|---|---|---|---|---|
| 3.1 | App icon 512x512, 32-bit PNG (with alpha) | yes | `public/pwa-512x512.png`, 512x512 but 24-bit RGB (no alpha) | **FAIL (small)** | Re-export as 32-bit PNG; ideally a fresh icon from the painted art. Matt approves. |
| 3.2 | Feature graphic 1024x500 (JPG or 24-bit PNG, no alpha) | yes | none | **FAIL** | From the title art (Pokey and Meeca, the log): a Gemini sheet or HF, Matt approves. |
| 3.3 | Phone screenshots: 2-8, 16:9 or 9:16, 320-3840 px per side | yes (min 2) | many QA stills, but with debug overlays and odd sizes | **FAIL** | 4-8 clean shots, sideways 1920x1080 and upright 1080x1920 (games show better sideways): the title, a World 1 swing, the eagle, a puzzle room, a boss, the map. |
| 3.4 | 7" and 10" tablet screenshots | for the tablet listing | none | **FAIL** | The same scenes at tablet sizes, after polish-c's layouts. |
| 3.5 | Foldable / Chromebook screenshots | optional | none | **UNKNOWN** | After polish-c; optional. |
| 3.6 | Short description (80 characters max) | yes | `metadata.json` has a 140-character line | **FAIL** | e.g. "Swing, climb and glide through the rainforest with Pokey the sloth." (66). Matt approves. |
| 3.7 | Full description (4000 characters max) | yes | none | **FAIL** | Draft from STORY and the worlds list; Matt approves. |
| 3.8 | App name (30 characters max) | yes | "Sloths Rainforest Adventures" (28) | **PASS** | Matt confirms the name (CI uses "Sloths Adventure"). |
| 3.9 | Promo video (YouTube) | optional | trailer work exists in reference | **optional** | Later. |
| 3.10 | Category and tags | yes | none | **FAIL (5 min)** | Games, Adventure (or Platformer/Action); tags: Platformer, Casual. Matt. |
| 3.11 | Contact email, website | yes | none in repo | **FAIL (5 min)** | Matt's support address; the live site URL. |

## 4. Suggested order

1. Matt: account type (2.6), app ID (1.7), name (3.8). These gate everything.
2. android: commit a pinned Capacitor `android/` project; release AAB job with signing and versionCode; icon and splash; VIBRATE
   (0.1, 0.2, 1.5, 1.6, 1.17, 0.5).
3. web: app-build flag that strips the recorder and hides the web-only buttons; back-button handling (0.3, 0.4, 1.10).
4. web: privacy page; Matt answers the content rating and Data safety ("no data collected") (2.2-2.4).
5. Device tests (offline, kill and restore, audio focus, notch, foldable, low-end start; 1.9-1.15) on the closed-testing build.
6. Store assets (section 3), then the 14-day closed test if the account needs it, then production.

## Sources

- Target API level requirements: https://developer.android.com/google/play/requirements/target-sdk (API 36 from 2026-08-31,
  extension to 2026-11-01).
- Families policy: https://support.google.com/googleplay/android-developer/answer/9893335
- App size limits: https://support.google.com/googleplay/android-developer/answer/9859372
- 16 KB pages: https://developer.android.com/guide/practices/page-sizes
- Testing for new personal accounts: https://support.google.com/googleplay/android-developer/answer/14151465
- Capacitor 8.6.0's Android template (checked from npm tonight): minSdk 24, target and compile 36, INTERNET only, allowBackup true.
