# MIX75 changes

- Restored the original T-shirt draw effect: seven shirt colors rotate for 5.6 seconds, then final colors are revealed one participant at a time with dance, shirt-pop, head-bob, confetti and winner tag effects.
- T-shirt menu is visually distinguished with a rainbow accent and progress badge.
- Han Sangho is a T-shirt super-admin: he has the same draw/confirm/reset rights as every group leader for all groups and an admin-only reset-all control.
- All authenticated Croatia users continue to read the same shared `attendance/<trip>/shirtSelection2026` path; leader/admin changes are visible to everyone through refresh/polling.
- Shirt face images now use ASCII-safe primary filenames (`m1.png` ... `m28.png`), retain legacy Korean-name path fallback, preload on entry and are included in the Service Worker core cache for offline/reliable display.
- Service Worker / cache-busting updated to MIX75.
