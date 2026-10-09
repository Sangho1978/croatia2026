# MIX75 validation

- JS syntax: all app/data/platform JS pass `node --check`.
- JSON: 23 JSON files parse successfully.
- Shirt participants: 28 primary ASCII face images exist and are valid PNG files.
- Legacy fallback: 28 Korean-name face image paths retained and exist.
- Jeans asset exists and is valid PNG.
- Service Worker core cache: 155 local refs, none missing; includes m1.png ... m28.png + jeans.png.
- HTML local file refs: none missing; duplicate IDs: 0.
- Shared state path remains `attendance/<TRIP_CODE>/shirtSelection2026`; Firebase Croatia attendance branch has `.read: auth != null`, so authenticated Croatia users can read all group records.
- Group write controls remain leader-only in UI, with Han Sangho (`한상호`) super-admin override for all 4 groups.
- Admin-only reset-all action writes a newer reset record for groups 1-4.
- Draw animation timing: 5.6 sec seven-color roulette + sequential 0.78 sec/member reveal with dance / shirt pop / head bob / confetti / result tag.
