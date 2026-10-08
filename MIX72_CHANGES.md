# MIX72 Changes

## Location UI simplification
- Rebuilt the Location screen around one main card for ordinary users.
- Removed duplicate general-user controls: `지금 위치 전송`, top `일행 새로고침`, `내 위치 설정 · 지금 갱신`, screen wake/help controls, and the separate self identity/organization card.
- Kept only one compact action row: `실시간 지도` + small `새로고침`.
- Replaced the map-button emoji with an inline SVG map-pin icon so it cannot render as a broken glyph.
- Removed `간단히 / 자세히` list modes and unified them into one compact roster.
- Removed the extra group total button board; each group header now shows only `위치 n/전체`.
- General roster rows now show only name, ON/OFF status, distance guidance, and last-location time. Organization/title are not shown.
- The general guidance is condensed to one line. If my location is OFF, other members' last positions from the past 24h remain visible; distance appears after turning my location ON.

## Admin-only controls
- Advanced location operation controls are moved into `관리자 도구` and hidden for normal users.
- Croatia location admin resolves to `한상호` (trip attendance operator fallback).
- Admin tools retain manual share/start/stop, one-time send, screen wake, map reconnection, backend state, data usage, and full reset.

## Location data behavior retained
- OFF users remain visible when a valid last position exists within 24 hours.
- Positions older than 24 hours are excluded.
- Map markers include valid last-known positions regardless of current sharing ON/OFF.
- Distance is computed only while the logged-in user's own location sharing is ON.
