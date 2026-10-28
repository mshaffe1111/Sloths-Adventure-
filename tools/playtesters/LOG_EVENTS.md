# Control-test log fields (QA notes)

The coding team's recorder writes these; QA's decoder is `logscan.py`. Sheet times in "Arrived" are Pacific; Matt is Eastern.

## Device column (2026-10-28 on)
The existing parts stay in place; a browser part is added at the end, after "touch N":
`iPhone; 393x658 portrait; screen 393x852; dpr 3; touch 5; iOS WebView 17; in Facebook; framed`
- browser and major version: Chrome, Safari, Samsung Internet, Firefox, Edge, Opera, "Android WebView", "iOS WebView" (an app's own view)
- optional `in <App>`: Facebook, Messenger, Instagram, TikTok, Snapchat, X, LinkedIn, Pinterest, Line, Google app, Discord
- shell: `browser`, `framed` (inside another page, e.g. Matt's Claude test link) or `installed` (home screen)

## env moment (2026-10-28 on)
Each run's data starts with `['e', 0, 'env', "browser ...; app ...; system Android 14|iOS 17.6; shell ...; gpu <renderer>[ (software)]; memory N GB; cores N; lang ..; net 4g; zoom 1.00; orientation ...[; reduced motion][; dark mode]"]`.
`(software)` means the browser draws with no graphics chip (SwiftShader/llvmpipe). That is the likely cause of 1-3 fps runs (Sally/Sasa).
`logscan.py` lists every run's env and flags software drawing.

## Other kinds
section, hurt, lostLife, quit, fps, mem, stall, blank, camjump, quality, long, hidden, look, bossHurt ("by state move secs"), survey, finish.
Skip-tips taps are ignored for 1.2 s and logged (2026-10-28 fix).
