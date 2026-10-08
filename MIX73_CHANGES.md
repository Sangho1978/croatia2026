# MIX73 changes

- Fixed a DOM nesting regression: the Group view was accidentally inside the Location view, so location displayed group content and the bottom Group button could not activate a top-level view.
- Renamed the main map action to `위치 지도 조회`.
- Restored the compact group-by-group location roster: two-column member cards on phones, with name, ON/OFF, distance, and last-position time.
- ON users now have a separate green highlight/status pill while the left border still keeps the group colour.
- Enlarged All Menu item names for readability.
- Hardened location map rendering: repeated viewport resize after opening, ResizeObserver recovery, Google tile-load watchdog, and OpenStreetMap fallback if Google remains blank/gray.
- Bumped application/service-worker cache to MIX73.
