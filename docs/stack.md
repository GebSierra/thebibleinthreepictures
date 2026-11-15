# Stack check (T0.2)

Checked 2026-11-14 by Opus. Hosting updated 2026-11-15. Versions are from the npm registry (`npm view`) on that date. Check again before relying on any row. In the repo this file is `docs/stack.md`.

## Changes this forces on the plan

1. **Node 26, not Node 20.** `ts-fsrs` 6.0.0 needs Node 24 or newer (its README still says 20; the package itself says 24). Vitest 5 needs 22.12 or newer. Lighthouse needs 22.19 or newer. Node 20 reached end of life on 2026-04-30. Node 26 is the newest LTS line. Pin it in `.nvmrc` and CI.
2. **On iPhone, install before Lesson 1.** A web app added to the home screen gets its own storage, apart from Safari. Progress made in Safari does not move into the installed app. So pilot testers must install first, and the app should say so on first open in a browser tab.
3. **ESV: full notice, no short form.** Crossway's digital rules give no short notice. The full notice goes on the About screen. The "(ESV)" tag alone is only for non-saleable print, like bulletins.
4. **ESV in a store app is not clearly covered.** The standard rules name websites, blogs, social media and ebooks. An installed web app is a website, so the slice is fine. Before the app store step, ask Crossway in writing.
5. **Host: GitHub Pages** (changed 2026-11-15). graceandgladness.com already runs on GitHub Pages from the public `GebSierra/graceandgladness` repo. The app's preview publishes from this repo to its own GitHub Pages address. The release copy goes into a folder of the graceandgladness repo, so it shows at graceandgladness.com/<path>. No new account, no cost.

## Build and app

| Tool | Version | License | Needs | Source | Checked |
|---|---|---|---|---|---|
| Node.js | 26 LTS (26.13.0 on 2026-10-28). EOL 2029-04-30. | MIT | n/a | [endoflife.date/node](https://endoflife.date/node), [Node release schedule post](https://nodejs.org/blog/announcements/evolving-the-nodejs-release-schedule) | 2026-11-14 |
| Vite | 8.3.8 | MIT | Node 20.19+ or 22.12+ | [npm](https://www.npmjs.com/package/vite) | 2026-11-14 |
| @vitejs/plugin-react | 6.3.0 | MIT | Vite 8 | [npm](https://www.npmjs.com/package/@vitejs/plugin-react) | 2026-11-14 |
| React, react-dom | 19.3.1 | MIT | n/a | [npm](https://www.npmjs.com/package/react) | 2026-11-14 |
| TypeScript | 7.0.2 (latest since 2026-07-08). 6.0.3 is the fallback if a tool breaks. | Apache-2.0 | Node 16.20+ | [npm](https://www.npmjs.com/package/typescript) | 2026-11-14 |
| vite-plugin-pwa | 2.0.0 | MIT | Node 20.19+. Supports Vite 3 to 8. Peer deps: workbox-build and workbox-window 7.4.1+ | [npm](https://www.npmjs.com/package/vite-plugin-pwa), [GitHub](https://github.com/vite-pwa/vite-plugin-pwa) | 2026-11-14 |
| ts-fsrs | 6.0.0 (released 2026-10-28) | MIT | **Node 24+** | [npm](https://www.npmjs.com/package/ts-fsrs), [GitHub](https://github.com/open-spaced-repetition/ts-fsrs) | 2026-11-14 |
| yaml (for the build step) | 2.9.1 | ISC | Node 14.6+ | [npm](https://www.npmjs.com/package/yaml) | 2026-11-14 |

### ts-fsrs API, read from the 6.0.0 package

- `fsrs()` makes a scheduler. `createEmptyCard()` makes a card.
- `scheduler.next(card, date, rating)` applies one rating and returns `{ card, log }`.
- `Rating` values: `Manual` 0, `Again` 1, `Hard` 2, `Good` 3, `Easy` 4. Map right to `Rating.Good` and wrong to `Rating.Again`, as the plan says.
- Ships ES modules and CommonJS.

## Tests and checks

| Tool | Version | License | Needs | Source | Checked |
|---|---|---|---|---|---|
| Vitest | 5.1.0 | MIT | Node 22.12+, 24 or 26+. Vite 6 to 8. | [npm](https://www.npmjs.com/package/vitest) | 2026-11-14 |
| @playwright/test | 1.65.1 | Apache-2.0 | Node 20+ | [npm](https://www.npmjs.com/package/@playwright/test) | 2026-11-14 |
| @axe-core/playwright, axe-core | 4.14.0 | MPL-2.0 (dev only, not shipped) | Node 22.12+ | [npm](https://www.npmjs.com/package/@axe-core/playwright) | 2026-11-14 |
| Lighthouse | 13.6.0 | Apache-2.0 | Node 22.19+ | [npm](https://www.npmjs.com/package/lighthouse) | 2026-11-14 |

## Fonts

| Font | Package | License | Source | Checked |
|---|---|---|---|---|
| Archivo | @fontsource/archivo 5.3.0 | OFL-1.1 (bundling allowed) | [npm](https://www.npmjs.com/package/@fontsource/archivo) | 2026-11-14 |
| Figtree | @fontsource/figtree 5.3.0 | OFL-1.1 (bundling allowed) | [npm](https://www.npmjs.com/package/@fontsource/figtree) | 2026-11-14 |

Note: the plan says "no new libraries beyond section 7." The fontsource packages are only a way to bundle the fonts the plan already names. If Opus and Geb prefer, copy the font files in by hand instead.

## Hosting and CI

| Option | Free plan | Fits? | Source | Checked |
|---|---|---|---|---|
| Cloudflare Pages (was the pick on 2026-11-14) | $0. 500 builds a month, 1 at a time, unlimited sites, requests and bandwidth. 20,000 files per site, 25 MB per file, 20 minute build limit. Next plan is Pro, $20 a month billed yearly. | Yes. Works with any GitHub repo. | [pages.cloudflare.com](https://pages.cloudflare.com/), [Pages limits](https://developers.cloudflare.com/pages/platform/limits) | 2026-11-14 |
| **GitHub Pages (chosen 2026-11-15)** | Free plan publishes from public repos. 1 GB site, 100 GB a month soft cap. Both repos are public. | Yes. graceandgladness.com is already served this way. | [GitHub Pages limits](https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits) | 2026-11-14 |
| GitHub Actions (CI) | Public repos: standard runners free. Private repos on GitHub Free: $12 a month of included use, about 2,000 Linux minutes (my arithmetic at $0.006 a minute). | Yes either way | [Actions billing](https://docs.github.com/en/billing/concepts/product-billing/github-actions) | 2026-11-14 |

Preview: `.github/workflows/preview.yml` builds `main` and publishes to this repo's Pages address. One-time setup: Settings > Pages > Source: GitHub Actions. Release to graceandgladness.com: a copy step into that repo's folder, set up at T3.13 once Geb names the path.

## Phone storage

| Platform | What happens to stored progress | Source | Checked |
|---|---|---|---|
| iPhone, Safari tab | After 7 days of Safari use with no visit to the site, Safari may delete all its script-written storage, including local storage. | [web.dev: storage for the web](https://web.dev/articles/storage-for-the-web), [WebKit bug 209501](https://bugs.webkit.org/show_bug.cgi?id=209501) | 2026-11-14 |
| iPhone, home screen app | Exempt from that 7-day rule. Has its own storage, not shared with Safari. | [web.dev](https://web.dev/articles/storage-for-the-web), [WebKit bug 209501](https://bugs.webkit.org/show_bug.cgi?id=209501) | 2026-11-14 |
| Android, Chrome | Storage is "best effort" by default and can be cleared when the phone runs low on space. `navigator.storage.persist()` asks to make it durable. Chrome grants it silently, often for installed apps. | [web.dev: offline data](https://web.dev/learn/pwa/offline-data), [MDN Storage API](https://developer.mozilla.org/en-US/docs/Web/API/Storage_API) | 2026-11-14 |

My sources on the iPhone rules are a few years old. I found nothing newer that changes them, but I could not confirm the current behavior from Apple. P7 (real phones) is the real test.

**What the storage module (T3.3) should do:** call `navigator.storage.persist()` once on start, inside a try/catch, and ignore a "no." Nothing else changes.

## ESV (Crossway)

| Rule | Detail | Source | Checked |
|---|---|---|---|
| Limit without written permission | Up to 500 verses. Not more than half of any one book. Not 25% or more of the whole work. Not in a commentary or other biblical reference work. | [Crossway ESV permissions](https://www.crossway.org/support/esv-bible-permissions/) | 2026-11-14 |
| Digital works covered | Websites, blogs, social media, ebooks. Apps are not named. | same | 2026-11-14 |
| Notice | Digital works must carry the full copyright notice. There is no short digital notice. It begins: "Scripture quotations are from the ESV® Bible (The Holy Bible, English Standard Version®)," | [crossway.org/permissions](https://www.crossway.org/permissions/), "ESV Digital Permissions" | 2026-11-14 |
| ESV API | Server access to ESV text, free for non-commercial use, with its own terms. Not needed for the slice: we quote a few verses as static text. | [api.esv.org](https://api.esv.org/) | 2026-11-14 |

**Action for T3.x (About screen):** copy the full notice word for word from the "ESV Digital Permissions" section of [crossway.org/permissions](https://www.crossway.org/permissions/). My fetch tool could not return the whole notice, so I have not put it here. Do not retype it from memory.

**Open questions, for Geb, not blocking:**

- Is this app a "biblical reference work"? I think not: it is a teaching course, not a commentary or lookup tool. Geb should agree.
- Before any store release, ask Crossway in writing whether the standard rules cover a store app.

## Phone app stores (later, not the slice)

| Item | Cost | Notes | Source | Checked |
|---|---|---|---|---|
| Apple Developer Program | $99 a year | Fee waiver for nonprofit legal entities that ship only free apps. Not for individuals or sole proprietors. Needs the church's legal entity status; press reports say EIN and D-U-N-S number are asked for. | [Apple fee waiver](https://developer.apple.com/support/fee-waiver) | 2026-11-14 |
| Google Play | $25, once | Confirmed on Google's own help page. Organization accounts need a D-U-N-S number. New personal accounts have extra testing rules before release. | [Play Console signup help](https://support.google.com/googleplay/android-developer/answer/6112435) | 2026-11-14 |
| Capacitor | 8.6.2, MIT. CLI needs Node 22+. | iOS builds still need a Mac. | [npm](https://www.npmjs.com/package/@capacitor/core), [Capacitor setup](https://capacitorjs.com/docs/getting-started/environment-setup) | 2026-11-14 |
| iOS cloud build service | Not checked | Check when the store step comes. | n/a | n/a |
