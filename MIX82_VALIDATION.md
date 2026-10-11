# Croatia2026 v82 validation - 2026-10-11

## Package and behaviour
- ZIP extraction creates one top-level folder, `Croatia2026/`.
- `index.html`, `trips.html`, `sw.js`, `manifest.webmanifest`, `js/`, `css/`, `assets/` sit directly below `Croatia2026/`.
- Version information: `v82` in the direct app login, unified portal, Today, account menu and full menu.
- Login change history: v79, v80, v81, v82 in four short visible rows.
- Participant attendance uses one button for both CHECK and UNCHECK; it remains enabled after checking until administrator completion.
- UNCHECK deletes only the authenticated UID owner's own slot record. If checked on a different device/UID, the other device must undo it.
- Croatia administrators remain three users: Han Sangho, Lee Sangmi, Wi Jaebok. Turkiye1 administrators unchanged.
- Firebase rules for both active teams now allow slot DELETE by the owning anonymous UID only in the current uncompleted round; checked-record PUT validation remains unchanged.

## Executed validation
- Chromium browser simulated Firebase REST, not the live participant database.
- Normal non-admin login / one-button CHECK / UNCHECK / CHECK again: passed (headcount 0 -> 1 -> 0 -> 1).
- A manager finalized the round with 1/28 checked: passed, completedBy/time recorded.
- Normal participant could not undo after manager finalization: passed; no extra writes.
- Full menu navigation: 20/20 routes passed, browser JavaScript errors: 0.
- Mobile 360px width: no horizontal body overflow; four login history rows present.
- Static syntax: 61 JS and SW files parsed using node --check.
- Local HTML resource references: 103 unique paths, all exist.
- Service worker CORE offline resources: 158 listed, all exist.
- Original v81 file inventory retained: 381 prior files retained, 4 new documentation/rules files added.
- Live Firebase Rules and network-service end-to-end tests were not performed; perform deployment and device testing separately.

## Deployment
1. Unzip; the root folder is `Croatia2026/`.
2. Publish contents of that folder at the website's existing document root. Do not accidentally put the site one directory level deeper.
3. In Firebase Console -> Realtime Database -> Rules, publish the current `Firebase_Rules_v82.txt` separately. Updating only the ZIP will NOT enable UNCHECK.
4. Reload app and confirm version `v82`; if old PWA cache is shown, close/reopen or reload after the new service worker activates.
5. Device PIN and anonymous Firebase authentication are not server-enforced proof of a person's real identity. The rule checks anonymous UID ownership, not legal identity.
