# Google Play rules: what the app has to meet

What Google Play asks of an app (a game above all), worked out for Sloths. Read it whenever you build or change anything that ends up in the Android app: screens, menus, sound, saves, settings, store art. Researched 2026-10-30 from Google's own pages (links at the bottom). Google changes these rules every year, so check the date-bound items (target API, page size) again before the account is set up.

Matt (2026-10-29): "building this also up to code for the Play Store", "I'm not going to like have anything trackable", "most likely be something that I charge for", and "make it to proper standards so that when I am ready, we can start testing it and we don't have to rebuild it all."

Status key: **done** (in the code now), **branch** (built on polish-a2, not merged yet), **todo**, **at submit** (Play Console forms, done when Matt sets up the account).

## 1. Hard gates: the upload is refused without these

| Rule | What it means for us | Status |
|---|---|---|
| Upload as an Android App Bundle (.aab), signed, with Play App Signing | The release workflow makes a signed AAB when the signing secrets exist | branch |
| Target API: new apps and updates must target **Android 16 (API 36)** from 2026-08-31; this goes up by one every year | `targetSdkVersion = 36`, `compileSdkVersion = 36` on polish-a2. Re-check each summer | branch |
| **16 KB memory pages** on 64-bit phones (updates blocked from 2027-02-01) | Capacitor and our plugins are Java/Kotlin, with no native libraries, so we should already pass. Confirm with Android Studio's APK check on the first real build | todo (check) |
| A unique app ID that never changes after the first upload | Placeholder `com.mshaffe1111.slothadventure`. **Pick the final ID before the first upload**: it can never be changed | at submit (Matt) |
| Privacy policy link (on the listing and inside the app) | Even with nothing collected. A short page saying "this game collects nothing", linked from the app's settings | todo |
| Data safety form | Answer "no data collected or shared". It only stays true if the store build has no tracking (§3) | at submit |
| Content rating (the IARC questionnaire) | Cartoon peril, no blood, no chat, no purchases, so it should rate "Everyone" | at submit |
| Target audience and content form | A decision for Matt later: if the ages include under-13s, the Families policy applies (§3). Recommended: yes, since we already meet it | at submit (Matt) |
| Ads declaration | "No ads" | at submit |

## 2. Account path (Matt's personal account)

- A personal account made after 2023-11-13 must run a **closed test with at least 12 testers, opted in for 14 days in a row**, before it can apply for production. An invite doesn't count; a tester has to opt in. Apply after the 14 days; Google's review takes about a week. Line up the 12 testers before the build is ready.
- An organisation account skips that test, but needs a D-U-N-S number (up to 30 days to get).
- **Paid app:** it needs a Google payments profile linked to the account. Changing that profile later means a new developer account and a new fee, so set it up right once. Free apps never need one.
- A free app can never be made paid later (a paid app can go free, but not back), so pick the price before the first release.

## 3. Policy rules this game has to keep

- **No tracking in the store build** (Matt's rule). No analytics, no advertising ID, no device identifiers sent anywhere, no location. The `VITE_STORE_BUILD=1` flag strips the tester recorder and the stats upload; `checkStoreBuild` fails the build if any of it slips back in (branch). Any new feature that sends anything off the phone must stay out of the store build.
- **Families policy** (if the audience includes children): meet COPPA and GDPR for children, send no device identifiers, get no precise location, and use only Families-certified ad SDKs (we have no ads at all). No chat or social features between players (that also bars a game from Teacher Approved). Our plan already meets all of this; just don't add anything that breaks it.
- **"WebView spam" and minimum functionality:** Google removes apps that are just a website in a wrapper. Ours has to be a full game that stands on its own:
  - every asset packed inside the app, never loaded from the website;
  - plays fully offline;
  - no links out to the web version;
  - no broken or "coming soon" dead ends in the store build. The "New look coming soon" tag on Worlds 8-10 is fine on the web, but the store build should ship with those worlds finished.
- **Deceptive behaviour:** no buttons that look like system prompts. No "More games" links unless they're plainly labelled as ads.
- **Paid app worth paying for** (PARTNER.md): Google refunds anyone automatically within 48 hours, so the first minutes must feel worth it.

## 4. Quality bars (miss these and Google shows the app to fewer people)

**Android vitals**, judged over all users' daily sessions:
- user-seen crash rate under **1.09%** overall (8% on any one phone model);
- "not responding" (ANR) rate under **0.47%** overall (8% per model);
- battery use and wake locks are counted too: never hold the screen or CPU awake behind a menu or when the app is in the background.

**Core app quality**, Google's checklist for every app:

| Rule | What it means for us | Status |
|---|---|---|
| Draws edge to edge (forced from API 35; the opt-out is gone at 36) | Nothing tappable under the status bar, the notch, the camera hole or the nav bar. Every button sits inside the safe area (`env(safe-area-inset-*)` plus the native insets). The story Skip under the Wi-Fi icon broke this | branch (fixes), keep checking |
| Fills the screen in portrait and landscape, with no letterboxing | Already a stage rule. Includes foldables: the Game Over box on Matt's foldable didn't fit | todo (foldable fix) |
| Survives folding, unfolding and turning fast without losing state | Rotating or folding mid-stage keeps the run | todo (test) |
| Works in split screen and resizable windows | The game must lay out at odd sizes, not just phone shapes | todo (test) |
| Standard Back, including gesture back | Back pauses play, closes menus, and from the title asks before leaving; no on-screen "press back" prompts | branch |
| Audio focus | Ask for it when sound starts, let go when it stops, go quiet for calls and other apps, mute when the app leaves the screen | branch |
| Keeps state when it leaves the screen and restores it on return | Resume at the last flag, and saves never lost | branch |
| Smooth, steady frame rate (the games vitals) | The APK felt slower than the browser (Matt, 2026-10-30): the game slows down below 20 fps. On the roadmap: measure it inside the app and fix it before the closed test | todo (roadmap) |

## 5. Store listing art (needed to publish)

- App icon: 512 x 512 PNG with transparency, at most 1 MB.
- Feature graphic: 1024 x 500, JPEG or PNG with no transparency. Required.
- Screenshots: at least 2, up to 8 per device type. JPEG or PNG with no transparency. Use real gameplay in both orientations, painted art only (no code-drawn placeholders). Check the exact sizes in Play Console when uploading.
- Short description (80 characters) and full description (4000 characters). No "best" or "#1" claims, no prices in the text.

## 6. Every change that reaches the app: check before it merges

1. Nothing tappable or readable under the status bar, notch, camera hole or nav bar, in both orientations and on a foldable size.
2. Back does something sensible on the new screen.
3. Nothing new is sent off the phone (or it's stripped from the store build and `checkStoreBuild` knows about it).
4. Nothing loads from the web; it works in airplane mode.
5. Sound stops when the app goes to the background, and nothing keeps the phone awake behind a menu.
6. Leaving and coming back (and rotating) keeps the player's place.
7. No dead ends or placeholder screens in the store build.

## Sources

- [Target API level requirements (Android Developers)](https://developer.android.com/google/play/requirements/target-sdk)
- [Target API level requirements (Play Console Help)](https://support.google.com/googleplay/android-developer/answer/11926878)
- [Support 16 KB page sizes](https://developer.android.com/guide/practices/page-sizes)
- [Testing requirements for new personal developer accounts](https://support.google.com/googleplay/android-developer/answer/14151465)
- [Payments profile for paid apps](https://support.google.com/googleplay/android-developer/answer/3092739)
- [Data safety section](https://support.google.com/googleplay/android-developer/answer/10787469)
- [Families: Teacher Approved eligibility](https://support.google.com/googleplay/android-developer/answer/10075896)
- [Kids and families policy changes (Android Developers Blog)](https://android-developers.googleblog.com/2022/11/helping-kids-and-families-find-high-quality-apps-for-kids.html)
- [Common policy violations, incl. webview apps (Android Developers Blog)](https://android-developers.googleblog.com/2020/10/developer-tips-and-guides-common-policy.html)
- [Android vitals](https://developer.android.com/games/optimize/vitals), [crash rate](https://developer.android.com/google/play/vitals/crash), [ANR rate](https://developer.android.com/google/play/vitals/anr)
- [Core app quality guidelines](https://developer.android.com/docs/quality-guidelines/core-app-quality)
- [Handle edge-to-edge enforcement (codelab)](https://developer.android.com/codelabs/edge-to-edge)
- [Store listing graphic assets](https://support.google.com/googleplay/android-developer/answer/9866151)
