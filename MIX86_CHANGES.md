# v86 (2026-10-13) changes

- Compact header leftmost tile: **current Open-Meteo temperature** and local observation time, independent of the date selected in the weather forecast screen. Refresh every 30 minutes or when the tab becomes visible; offline uses a clearly labeled recent saved observation (within 90 minutes) or shows no temperature. Does not request GPS.
- **2026-10-13** day agenda begins at **07:00 breakfast**, and **10:00 tour-bus boarding** was added as a fixed-time event; detailed timetable, next-event countdown, day flow, flight-plan index and home summary were updated consistently.
- Previous-flight after-midnight arrival/check-in times retained in an optional collapsed reference section; not listed before breakfast in the day agenda.
- Login screen shows **only v86, v85, v84, v83** notes (4 most recent).
- Version badges / portal synchronized at v86; updated static cache revision, cache-busted changed files.
- Firebase Realtime Database rules are **unchanged** from v82: no new database paths or privilege changes.
