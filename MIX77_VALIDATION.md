# MIX77 validation

## Source reconciliation
- Final schedule authority: 2026-10-08 confirmed Croatia guide booklet.
- Meal venue/menu detail source: KCT detailed itinerary; when an older KCT meal time conflicts with the final booklet, the final booklet time is used.
- 10/17 active schedule remains Karlovac old town -> Zagreb -> dinner -> airport; Rastoke is not part of active app itinerary.

## Meal anchors in schedule
- 10/13 13:00 Poklisar Restaurant; 18:00 Grand Hotel Park.
- 10/14 18:00 Hotel Plaza Duce.
- 10/15 13:00 Hotel Trogir Palace; 18:00 Restoran Arkada.
- 10/16 13:00 Restaurant Borje; 18:00 Aminess Kadoor Hotel.
- 10/17 18:00 CRO.K.
- Every non-free CRO_MEALS record has a same-date/same-time schedule event, so app-core renders restaurant/menu details under the chronological schedule event.

## Non-meal reconciliation
- 10/15 Split -> Trogir -> Biograd flow preserved; detailed transfer/check-in times added where non-conflicting.
- 10/16 Zadar -> Plitvice -> Karlovac flow preserved; detailed Plitvice and transfer times added where non-conflicting.
- 10/18 only final two options remain: Orvieto+Civita or Rome city. Assisi removed from active day attraction cards.
- Rome city card matches final booklet: Colosseum, Roman Forum, Piazza Venezia, Trevi Fountain, Piazza Navona, Spanish Steps.

## Technical checks
- 8 itinerary dates present.
- All non-free meals aligned to an itinerary event.
- Duplicate HTML ids: 0.
- Index local references missing: 0.
- JSON parse: 23 files, 0 errors.
- All JS files pass `node --check`.
