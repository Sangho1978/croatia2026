# MIX73 validation

- DOM structure: `location` and `group` are separate direct `main > section.app-view` siblings.
- Group routing: the router can now find `#group` as a top-level app view; attendance/people tabs remain inside it.
- Location UI: main action label is `위치 지도 조회`; compact group roster shows ON/OFF, distance and last-location time.
- ON visual state: green status/background treatment is separate from each group's left-border colour.
- All-menu item names: increased from the MIX62 compact override to 0.9rem (0.84rem on very narrow screens).
- Map recovery: repeated viewport resize, ResizeObserver, Google tile watchdog, and OpenStreetMap fallback after a visible Google map remains unrendered.
- JavaScript syntax: all JS files passed `node --check`.
- HTML local references: no missing local files.
- Service worker core references: no missing local files.
- New stylesheet brace balance: valid.
- Application cache: `gspa-static-v73-location-group-mapfix`.
