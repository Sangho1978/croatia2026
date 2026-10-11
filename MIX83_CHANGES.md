# Croatia2026 v83 changes · 2026-10-11

- Personal flight E-ticket menu: signed-in accounts without a matching ticket (e.g., tour escort Ji Minjeong and supervising professor) see the notice **이용 가능한 정보가 없습니다** inside the current screen, never a prompt to re-login.
- Account menu: tapping My E-ticket closes the account popover and keeps the authenticated identity and selected route.
- Expenses menu: an external guide account stays on the expenses screen, sees an unavailable notice, and makes no expenses Firebase read. The menu is not hidden from that account; the existing Firebase/API access gate remains enforced.
- Report photography guide: accounts not included in a photo group see an unavailable notice with no group-specific cards, instead of an empty or confusing guide; teacher/regular group permissions unchanged.
- Public shared rooming list, timetable, flights for matched participants, attendance, group finance access, all other menus stay unchanged.
- Mobile-safe notice card and updated v83 labels on Login/Today/Account/Menu/Portal; service worker cache version bumped.
- Firebase Rules unchanged from v82 (no new database permissions required).
- This ZIP unpacks into `Croatia2026/` with `index.html` immediately inside.
