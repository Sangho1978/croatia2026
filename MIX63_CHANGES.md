# MIX63 UI hotfix

- Fixed the completely unstyled/default-browser UI failure seen on Android.
- Root cause class: the page markup loaded while external CSS was not being applied. The symptom was native gray buttons, raw headings, visible account panel, and no app layout.
- Embedded the full production CSS bundle directly inside `index.html` as a fail-safe. Existing external CSS files are retained for maintainability, but the UI no longer depends on them to render correctly.
- Rewrote CSS image URLs for inline context so bundled backgrounds continue to resolve from the app root.
- Bumped the service-worker static cache to `gspa-static-v63-uihotfix`.
- Versioned service-worker registration URLs to force an update on installed/PWA clients.
- No itinerary, weather, location-distance, attendance, flight, meal, or group feature logic was removed.
