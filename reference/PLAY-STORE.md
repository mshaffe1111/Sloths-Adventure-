# Play Store checklist (audit 2026-10-29, fixes 2026-10-29 late evening ET)

Matt ran the current APK: "it's buggy, and you can't skip things like the story because it's underneath the Wi-Fi symbol and there's no
way to click it." He'll most likely charge for the app, and he wants nothing trackable at all.

This started as a read-only audit. It is now the audit plus the fixes, on branch `polish-a2`. Each item has a status and an owner:
- **PASS**;
- **FIXED**: done on polish-a2, waiting for a phone test;
- **FAIL**: still open;
- **TO TEST**: needs a phone.

Owners:
- **Matt**: accounts, money, legal answers, art approvals;
- **lead**: decisions and briefs;
- **polish-a2**: this branch's Android work;
- **polish-c**: layouts, including the status bar and foldables in CSS;
- **web**: whichever helper owns the game code being touched.

**Proof so far:** nothing has been run on Android yet. This container can't run the Android SDK or an emulator, because Google's
download server (dl.google.com) is blocked here with a 403. The Android build runs in GitHub Actions (§6), and the debug APK it makes
is what Matt installs for the phone test (§7). The web side was checked here:
- the typecheck;
- the full test suite;
- the web build;
- the store build and its no-tracking check.

## 1. The fixes on polish-a2

| # | Item | Status | What changed | Owner |
|---|---|---|---|---|
| 1.1 | **Story skip under the Wi-Fi icon** (Matt's bug) | **FIXED, TO TEST** | The app now runs truly full screen (immersive). `MainActivity.java` hides the status and navigation bars on every screen. A swipe from the edge brings them back for a moment, then they hide again. With the bars gone, nothing covers the story's Skip button, the HUD or the menus. The page still gets the notch's insets, two ways: Capacitor's SystemBars plugin (`insetsHandling: 'css'` in `capacitor.config.ts`) sets `--safe-area-inset-*` CSS variables, and `env(safe-area-inset-*)` works on WebView 140+. | polish-a2 |
| 1.2 | Insets in CSS | **ASKED** | polish-c was asked to read both, so older WebViews get the notch too: `max(env(safe-area-inset-top, 0px), var(--safe-area-inset-top, 0px))`, and the same for right, bottom and left. Every screen hides the bars, so no screen needs the bar insets. | polish-c |
| 1.3 | Android project | **FIXED** | A real Capacitor project is committed in `android/`, with Capacitor pinned at 8.6.0 and `@capacitor/app` at 8.1.2. CI no longer runs `cap init` / `cap add` on every build; it only copies the game in (`npx cap sync android`). | polish-a2 |
| 1.4 | App ID and name | **FIXED (placeholders)** | Placeholders for now (Matt isn't setting up the Play account yet): the ID `com.mshaffe1111.slothadventure`, the same one the old APK used, so the new app installs over it, and the name "Sloths Rainforest Adventures". Both can change freely until the first Play upload; after that the ID is fixed forever. To change them: `appId`/`appName` in `capacitor.config.ts`, `namespace`/`applicationId` in `android/app/build.gradle`, the Java package folder of `MainActivity.java`, and `res/values/strings.xml`. | Matt (before the first upload) |
| 1.5 | Icon and splash | **FIXED (stand-in), FAIL (final art)** | `tools/android/make_icons.py` makes the adaptive launcher icons and the splash from Pokey's happy face (the hero sheet) on a rainforest-green circle. The splash is dark green with the icon. This is a stand-in: the face is 142 px, upscaled, so it's soft. Preview: `reference/prop-sheets/qa-notes/play-store/icon-512-standin.png`. The real icon needs painted art (the Gemini prompt is in §8). The old web icons (`public/pwa-*.png`, `apple-touch-icon.png`) aren't real icons either: they're crops of a title-screen screenshot. | Matt (art), polish-a2 (wiring it in) |
| 1.6 | Orientation | **PASS, TO TEST** | Not locked: every stage plays upright and sideways (Matt's rule). The activity handles rotation and folding itself (`configChanges`), so turning the phone resizes the page without restarting the game. Android 16 ignores orientation locks on big screens anyway. | phone test |
| 1.7 | Back button | **FIXED, TO TEST** | `App.tsx` listens for `@capacitor/app`'s `backButton` (in the app only). Back first closes any open window with an X: Save & Load, New Game, How to Play, the Trophy Room. Otherwise, by screen: <ul><li>in a stage: pause;</li><li>on the pause menu: resume;</li><li>on Stage Clear or Game Over: go to the map (or dismiss a new-skill card first);</li><li>on the map: go to the title;</li><li>on the title: ask "Leave the game?" (`LeaveDialog.tsx`: Keep playing / Leave; Back again or a tap outside keeps playing). The only place Back can close the app;</li><li>anywhere else, including a story: act as Escape (a story skips; the start menu closes).</li></ul> | polish-a2 |
| 1.8 | Background and calls | **FIXED, TO TEST** | Going to the background (home, switching apps, locking the phone, answering a call) fires `@capacitor/app`'s `pause` event. A stage in play pauses, and the sound stops until the app is back. The app also holds Android's audio focus while it's in front, as games do. When a call rings, an alarm sounds or another app plays, `MainActivity.java` tells the page, and the game's sound stops until the focus comes back (`sound.appHidden`, `conductor.ts`). When another app only speaks for a moment (directions, a notification sound), the game ducks to a quarter of its volume and plays on (`sound.appDucked`). The page's own hidden-tab pause still works too. | polish-a2 |
| 1.9 | Saves survive the app being killed | **PASS, TO TEST** | Progress is written to the WebView's storage at once, at each stage clear and each settings change. That storage lives in the app's data, so it survives kills, restarts and updates, and Android's backup covers it (`allowBackup`). | phone test |
| 1.9b | Killed mid-stage: back at the last flag | **FIXED, TO TEST** | In the app, reaching a flag writes it (`flagResume.ts`); the next start of that same stage begins at that flag, with the flags before it counted, the iris opening on Pokey and "Back at your flag". Ending the stage the normal way (cleared, restarted, left for the map or title) forgets it, and so does a day passing. The app reopens at the title, as any app does after a kill; the player's next Play of that stage starts at the flag. Slides, Dot's flights and the rising tide keep their own flags and start over. | polish-a2 |
| 1.10 | Screen stays on | **FIXED** | `FLAG_KEEP_SCREEN_ON` while the game is in front: a phone dimming mid-jump costs a life. | polish-a2 |
| 1.11 | Vibration | **FIXED** | Added the `VIBRATE` permission. It's a normal permission: no prompt, and nothing to declare on the Data safety form. Without it, the Vibration setting did nothing in the app. | polish-a2 |
| 1.12 | Web-only buttons in the app | **FIXED** | Hidden in the app: <ul><li>the full-screen button (`fullscreen.ts` treats the app as launched full screen);</li><li>"Save to file" works differently: the WebView can't download, so the app writes the file and opens Android's share sheet (Drive, Files, email; `@capacitor/filesystem` and `@capacitor/share`). "Load from file" uses Android's file picker;</li><li>the install prompt (it never fires in the app);</li><li>the update check and the service worker (§2).</li></ul> | polish-a2 |
| 1.13 | Release bundle (.aab), signed | **FIXED (needs Matt's secrets)** | When the four secrets in §3 exist, the workflow builds a signed `bundleRelease`. Until then it skips that step, stays green and leaves a note. The keystore is never in the repo: CI writes it from a secret into the runner's temp folder and deletes it afterwards. | Matt (secrets) |
| 1.14 | Version code / name | **FIXED** | The versionCode is the workflow's run number, which always grows (Play refuses a code it has already seen). The versionName is the tag (`v1.0.0`), or `1.0.<run>` without one. | polish-a2 |
| 1.15 | Target / min API | **PASS** | Target and compile API 36, Play's rule since 2026-08-31. Min API 24 (Android 7.0). There are no native libraries, so the 64-bit and 16 KB page rules are met. | polish-a2 |
| 1.16 | Size | **PASS** | The game is 100 MB, mostly WebP and MP3 that are already compressed. Play's limit is 200 MB compressed. Watch it as the Worlds 6-10 art lands. | lead |
| 1.17 | Low-end phones (start time, memory) | **TO TEST** | The game has a 3.5 MB script and big sprite sheets, so a phone with 2-3 GB of RAM may reload the WebView. Play Vitals will show this during closed testing. | phone test |

## 2. No tracking, at all

Matt wants nothing trackable. The store build is `npm run build:store`, which sets `VITE_STORE_BUILD=1`. Here is what it contains:

| # | Item | Status | How |
|---|---|---|---|
| 2.1 | Tester replay logging and the control-test collector | **FIXED** | In `playRecorder.ts`, the store build gets empty constants for the collector address and key, `ctestEnabled()` is always false, and `send()` returns before any network call. The bundler then drops the address, the key and the beacon code from the build. The web test link keeps all of them. |
| 2.2 | Update check and service worker | **FIXED** | The store build has no service worker and no web manifest (vite-plugin-pwa is left out), and no `version.json` check (`updates.ts`, `main.tsx`). Google Play delivers updates. |
| 2.3 | Analytics, ads, crash reporting | **PASS** | None, in the game or in its dependencies. The check in 2.5 fails the build if one ever arrives. |
| 2.4 | Network calls | **PASS** | The store build contains no web addresses except SVG/XML name tags, which are names and never fetched. Fonts, art and sound all ship inside the app, so the only loading is of the game's own files. |
| 2.5 | **The test that keeps it out** | **FIXED** | `tools/store/checkStoreBuild.mjs` reads every built file and fails if it finds: <ul><li>the collector (`script.google.com`, its key, or `sendBeacon`);</li><li>any analytics, ad or crash-reporting kit by name: Google Analytics, Tag Manager, Firebase, AdMob, DoubleClick, Facebook, Sentry, Mixpanel, Amplitude, Segment, Hotjar, Clarity, PostHog, Bugsnag, Unity Ads, AppLovin;</li><li>a service worker or manifest file;</li><li>any web address that isn't an SVG/XML name tag.</li></ul> `npm run build:store` runs it. The Android workflow runs it too, along with `tools/store/checkStoreBuild.test.ts` (with `STORE_DIST=dist`), before packing the app. So a tracker in the build fails the run, and no APK or AAB gets made. Checked here: the store build passes, and the normal web build fails with 11 hits (the collector, the beacon, the service worker), as it should. |
| 2.6 | Data safety form | **Matt** | With 2.1-2.5 in place, the answer is **No data collected, no data shared.** Saves stay on the phone. |
| 2.7 | Privacy policy page | **FIXED (Matt approves the text)** | `public/privacy.html`, hosted with the game (the live site's `/privacy.html`, which is the URL for the Play Console) and inside the app. It says no data is collected, saves stay on the device, no ads, no third parties, no internet, and explains the web-only test link. Contact: it points at the Play listing's email until Matt picks one. |

## 3. Matt's later steps (when he sets up Play), short

1. Pick the app ID and name (1.4) before the first upload.
2. Make the upload key and add the four GitHub secrets (below). The next workflow run then makes the signed `.aab` by itself.
3. Play Console: developer account (4.9), payments profile and price (4.1-4.5), target audience and content rating (5.1, 5.2), Data
   safety "no data collected" (2.6), the privacy URL (2.7), the store listing art and text (5.4-5.8).
4. Upload the `.aab` to a closed test, accept Play App Signing, run the phone test (§7) on the Play-installed copy.

## 3b. Signing: making the upload key (once)

1. Make the upload key on any computer with Java:
   ```
   keytool -genkeypair -v -keystore sloths-upload.jks -alias sloths-upload -keyalg RSA -keysize 2048 -validity 10000
   ```
   Keep the file and both passwords somewhere safe, such as a password manager. If they're lost, Google has to reset the upload key.
2. Turn the file into text: `base64 -w0 sloths-upload.jks > sloths-upload.b64` (on a Mac: `base64 -i sloths-upload.jks -o sloths-upload.b64`).
3. On GitHub, open the repo's **Settings → Secrets and variables → Actions → New repository secret** and add four secrets:

   | Secret | Value |
   |---|---|
   | `ANDROID_KEYSTORE_BASE64` | the whole text of `sloths-upload.b64` |
   | `ANDROID_KEYSTORE_PASSWORD` | the keystore password from step 1 |
   | `ANDROID_KEY_ALIAS` | `sloths-upload` (the `-alias` from step 1) |
   | `ANDROID_KEY_PASSWORD` | the key password from step 1 (the same as the keystore password if you pressed Enter at that prompt) |

4. Never commit the `.jks` or `.b64` file, and never paste either into a chat.
5. On the first upload in Play Console, accept **Play App Signing**. Google keeps the real app key; yours is only the upload key, so a
   lost upload key can be reset.
6. Run the workflow: Actions → "Build Sloths Adventure Android APK" → Run workflow, or push a tag like `v1.0.0`. The signed bundle is
   that run's `sloths-adventure-aab` artifact. Tagged releases on GitHub get the debug APK only, so the paid bundle is never posted
   where anyone can download it.

## 4. Paid app: what it needs

| # | Item | Status | Detail | Owner |
|---|---|---|---|---|
| 4.1 | Payments profile (merchant account) | **Matt** | In Play Console → Settings → Payments profile: legal name, address, a bank account for payouts, and tax info (in the US, a W-9 in the Console). A price can't be set until this exists. | Matt |
| 4.2 | Price | **Matt** | Set in Play Console → Monetize → App pricing. Google converts the price for each country, and you can set any country's price yourself. Google keeps 15% of the first $1M a year. | Matt |
| 4.3 | Country list | **Matt** | Pick the countries: all of them, or English-speaking ones first, since the game is English only. Some countries can't sell paid apps from a given payments profile; the Console greys those out. | Matt |
| 4.4 | Taxes | **Matt** | Google collects and pays VAT/GST for you in most countries, and US sales tax in most states. | Matt |
| 4.5 | **Paid is decided before launch** | **Matt** | A free app can never become paid. A paid app can go free, but then can't go back to paid. Decide before the first production release. | Matt |
| 4.6 | Families + paid | **PASS** | Allowed. With no ads, no purchases and no data collected, the app fits the Families policy. | - |
| 4.7 | Play license check (LVL) | **Advice: no** | Not added. LVL is old: it adds a Google library and a network call to Play, which goes against "nothing trackable", and a determined copier strips it out anyway. Play already installs a paid app only for people who bought it; the main leak is people sharing the APK. If that ever matters, the option is the newer Play Integrity API, not LVL. | lead + Matt |
| 4.8 | In-app purchases | **None** | Not added, and won't be unless Matt asks. | - |
| 4.9 | Developer account testing rule | **Matt** | A personal developer account made after Nov 2023 must run a closed test, with at least 12 testers opted in for 14 days in a row, before it can publish to production. An organisation account (it needs a D-U-N-S number) is exempt. Matt: which kind is yours? | Matt |

## 5. Policy and listing (from the audit, still open)

| # | Item | Status | Detail | Owner |
|---|---|---|---|---|
| 5.1 | Target audience | **Matt** | Children are in the audience (Easy is for ages 7-12), so the Families policy applies. Declare the age groups honestly, and declare no ads. | Matt |
| 5.2 | Content rating (IARC) | **Matt** | Cartoon punches and stomps (enemies get dizzy or run off), mild peril and bosses: likely ESRB E (maybe "Mild Fantasy Violence") and PEGI 7. | Matt |
| 5.3 | Accessibility basics | **PARTLY** | Still to do: 48 dp hit areas, labels on icon buttons, the screen-shake setting (AN-10). | web |
| 5.4 | Store icon, 512x512 32-bit PNG | **FAIL** | Made from the painted icon (§8). | Matt + polish-a2 |
| 5.5 | Feature graphic, 1024x500 | **FAIL** | From the title art; Matt approves. | Matt |
| 5.6 | Phone screenshots (2-8) and tablet ones | **FAIL** | Clean shots with no debug overlays: sideways at 1920x1080 and upright at 1080x1920. | web |
| 5.7 | Short (80 characters) and full (4000) descriptions | **FAIL** | For example: "Swing, climb and glide through the rainforest with Pokey the sloth." (66 characters). | Matt approves |
| 5.8 | Category, contact email, website | **FAIL (5 min)** | Games → Adventure; Matt's support email; the live site. | Matt |
| 5.9 | Unused packages | **PASS** | `@google/genai`, `express` and `dotenv` are already gone from package.json. | - |

## 6. Proof on Android

- **In this container:** no emulator and no Android SDK, because dl.google.com is blocked here (403). Gradle can't fetch Google's
  Android plugin, so nothing Android was compiled here.
- **In CI: green.** Run 17 on `polish-a2` built the store game, passed the tracking check, compiled the native code and made the
  debug APK (105 MB); the signed bundle step skipped cleanly (no secrets yet). Run 16 had failed on a versionCode typo in
  `build.gradle`, fixed.
- **How it works:** the workflow on `polish-a2` builds the store game and runs the tracking check. Then it builds the debug APK
  (`assembleDebug`) for installing by hand, and, once the secrets are set, the signed bundle (`bundleRelease`). The run's result and
  the APK link go to the lead with this report. If the native code fails to compile, that run is where it shows first.

## 7. Matt's phone test (install the debug APK from the workflow run)

1. **Story skip:** start a new game. The status bar and the navigation bar should be gone. Tap **Skip** at the top: it should work.
   Swipe down from the top: the bars come back for a moment and hide again.
2. **Pause:** in a stage, tap pause, then resume. Press **Back**: it pauses. Press Back again: it resumes.
3. **Game Over:** lose all your hearts. Continue should work, and Back should go to the map.
4. **Menus:** from the title, open the Menu, Save & Load, How to Play, the Trophy Room and the world map. Back should close each one, or
   go up one screen. Back on the title asks "Leave the game?": Keep playing stays, Leave closes it.
5. **Background and calls:**
   - Mid-stage, press Home, then come back: the stage should be paused and silent until you resume.
   - Play music in another app, then open the game: the music should stop and the game's music should play.
   - Have someone call you mid-stage: the game should go silent while the phone rings.
   - With map directions talking (or a notification sound), the game should get quieter for a moment, not stop.
6. **Saves:** clear a stage, then swipe the app away from recent apps (this kills it). Open it again: the stage should still be
   cleared, and your settings kept. Then start a stage, touch its first flag, and swipe the app away. Open it and play that stage:
   Pokey should start at the flag ("Back at your flag").
   In Save & Load, "Save to file" should open the share sheet (save it to Drive or Files), and "Load from file" should load it back.
7. **Orientation:** turn the phone in a stage, on the map and in a story. Everything should fit both ways, with nothing under the notch
   or the camera hole.
8. **Foldable (if you have one):** play folded, then unfold mid-stage, then fold it back. The game should resize and keep going.
9. **Vibration:** with Vibration turned on in the menu, getting hit should buzz.
10. **Airplane mode:** the whole game should play with no network.

## 8. Icon: the Gemini prompt for Matt

> A square mobile game app icon, 1024x1024, painted in the same soft storybook style as the attached Pokey sprite sheet: Pokey the
> three-toed sloth's face, happy, big dark eye patches, hanging upside down from a green vine that curls across the top, filling most
> of the frame. Deep rainforest green background with a soft glow behind his head and a few leaves at the edges. No text, no border,
> no shadow outside the square, nothing important within 15% of the edges (Android crops it into a circle).

Attach `hero-standard.webp` (the face frames) so Gemini keeps Pokey on-model. Once the painting is in the repo, polish-a2 points
`tools/android/make_icons.py` at it, and it makes every launcher size, the splash and the 512 px store icon.

## Sources

- Target API level: https://developer.android.com/google/play/requirements/target-sdk (API 36 from 2026-08-31; extension to 2026-11-01).
- Families policy: https://support.google.com/googleplay/android-developer/answer/9893335
- App size limits: https://support.google.com/googleplay/android-developer/answer/9859372
- 16 KB pages: https://developer.android.com/guide/practices/page-sizes
- Testing for new personal accounts: https://support.google.com/googleplay/android-developer/answer/14151465
- Paid apps and pricing: https://support.google.com/googleplay/android-developer/answer/6334373
- Play App Signing: https://support.google.com/googleplay/android-developer/answer/9842756
- Capacitor 8.6 Android template and SystemBars: the pinned packages in node_modules.

## Where it stopped (2026-10-29, 11:00 PM ET, Matt's stop for the night)

All ten of the lead's fixes are pushed on `polish-a2`. CI run 18 (f1ee3f83, with the Filesystem/Share plugins) is green with the
debug APK; typecheck, the web build and the store build with the no-tracking check pass. The full test suite was stopped for the
night after 636 passing files with 0 failures, before it finished. **Next:** finish the full suite on this commit, then the lead
merges and Matt runs the §7 phone test.
