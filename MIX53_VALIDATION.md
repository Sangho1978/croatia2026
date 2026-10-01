# MIX53 validation

## Croatia flight / E-ticket
- Croatia roster 27 members matched against the English passenger names in the personal TW e-ticket PDFs and the Ryanair group reservation PDF: PASS.
- Croatia member count in `data/flight-tickets.json`: 27.
- Extra passengers not in the Croatia roster were not exposed as Croatia members: `정현웅` (personal TW archive extra) and `MINJEOUNG JEE` (Ryanair group extra).
- Personal e-ticket files: `docs/etickets/m1_tway_eticket.pdf` through `m27_tway_eticket.pdf`: 27/27 present, valid PDF header.
- Ryanair source: `docs/etickets/ryanair_group_reservation.pdf`: present, valid PDF header.
- TW reservation number and individual ticket number are available with one-tap copy controls.
- Ryanair outbound/return reservation numbers are available with one-tap copy controls; assigned seats are shown per person.
- Personal e-ticket download button is available for each logged-in Croatia member.
- Flight / E-ticket entry points are present in all-menu, account/personal menu, and Today quick card.
- Flight / E-ticket UI is Croatia-only and is hidden for other trip teams.
- Representative personal e-ticket and all six Ryanair group pages were rendered successfully and visually checked.

## Türkiye 1 requested-only changes
- Group 1 leader: 이진형.
- Group 2 leader: 황인환.
- Group 3 leader: 배황철.
- Group membership itself was not changed; only leader roles/display ordering were updated.
- Attendance admins: 남상모, 김수정, 김수연.
- Firebase MIX52 -> MIX53 Rules diff is limited to adding 김수연 to the Türkiye 1 `attendanceCurrent` write/validate admin condition.

## Static validation
- JSON parse: PASS (`data/flight-tickets.json`, Türkiye 1 roster/manifest, platform trips, Firebase Rules).
- JavaScript syntax: PASS (new flight data/UI and changed trip/attendance/service-worker scripts).
- `index.html` duplicate IDs: none.
- Local script/link references from `index.html`: no missing files.
- Service worker local CORE references: 140, no missing files.
- Croatia flight dataset names exactly equal the 27-person Croatia peer roster.
- TW PNR consistency: all 27 = `L5S4N3`.
- Ticket number format: all 27 are 13 digits.
- Ryanair seat format: all assigned seats valid (`NN[A-F]`).
