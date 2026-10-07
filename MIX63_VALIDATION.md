# MIX63 validation

- Screenshot diagnosis: v62 markup was loading but no application CSS was applied; native browser buttons and raw document flow matched a stylesheet-load failure rather than a normal responsive-layout problem.
- Full production CSS is embedded in `index.html` as a rendering fail-safe.
- Embedded CSS: 25 stylesheets, about 309 KB, parsed with `tinycss2`: 0 parse errors.
- Static render of login screen verified after embedding: styled panel/background/input/button layout restored.
- JavaScript syntax: all local `.js` files pass `node --check`.
- HTML local stylesheet/script/image references: 0 missing.
- Service worker core references: 115 checked, 0 missing.
- JSON parse checks: all JSON files pass.
- Service worker cache bumped to `gspa-static-v63-uihotfix`; registrations use a v63 script URL to prompt update on installed clients.
- ZIP integrity: no errors.
