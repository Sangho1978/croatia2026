# Croatia2026 v83 validation · 2026-10-11

## Changes verified
- Ji Minjeong, the tour escort (not in 27 participant E-tickets), gets an inline **이용 가능한 정보가 없습니다** on My E-ticket; current session and flight route remain active.
- Supervising professor Na Jongmin sees the same no-ticket notice, while retaining authorized photo-guide access (all four groups).
- When tapping My E-ticket inside the account popover, the popover closes and the route displays its notice; login overlay remains hidden.
- For external tour escort, the shared-finance menu opens an inline unavailable notice instead of silently redirecting to Today; no expense form/data and no Firebase expense lookup are initiated.
- Tour escort's unavailable group photo guide presents an explanatory message, without showing any group-specific content.
- Regular participants retain personal flight E-ticket access and authorized shared-expense functions.
- Croatia roster unaffected: 27 participants + 1 professor, escort still separate; attendance administrators remain Han Sangho, Lee Sangmi, Wi Jaebok.
- Portal, app login screen, Today, Account and full menu display version v83 and concise release history v79–v83.

## Test results
- Browser simulation (Chromium, 393px and 360px widths): all account-specific cases above passed.
- App menu routes: 20/20 navigation cases passed in browser, no JavaScript errors.
- HTML linked local resources: 105 paths verified (index.html, trips.html).
- Service Worker CORE resources: 160 paths verified. New cache version is v83.
- JavaScript + Service Worker syntax: 62 files passed Node.js --check.
- Previous v82 source inventory retained: 386 files, 3 added before validation report.
- Firebase Realtime Database rules: exactly unchanged from v82. Re-publishing Rules is **not necessary** for this version.
- Browser tests simulate Firebase; this does not verify production Firebase, real network services, or the deployed hosting environment.

## Deployment
1. Extract ZIP: the only root folder is `Croatia2026/`.
2. Its `index.html`, `trips.html`, service worker, CSS, JS and assets are immediately below that folder.
3. Publish **the contents** of `Croatia2026/` at your existing hosting document root if your current site loads `index.html` from the root. To host under `/Croatia2026/`, deploy the whole folder there and use that URL.
4. Reload your app and check that it shows `APP v83`, not an old cached version. The service worker uses a new cache name.
5. Firebase Rules v82 remain active; no database rule change for v83.
