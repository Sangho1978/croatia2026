# MIX54 - Personal-only flight display + Tway 24h seat reminder

- Croatia flight page now renders only the logged-in member's own flight/ticket data.
- Removed the team-wide Ryanair seat list and group reservation PDF link from the UI.
- Removed the Ryanair group reservation PDF from this build.
- E-ticket PDFs are no longer service-worker pre-cached; a member's PDF is fetched only when that member opens/downloads it.
- Schedule panels now receive a personal flight card only on dates when the logged-in member has a departure: 10/12 (TW405 + FR5975), 10/17 (FR8836), 10/18 (TW406).
- Generic group-style flight detail cards were removed from the schedule.
- Tway seat-selection reminders are shown in the schedule: TW405 - 10/11 12:35 KST; TW406 - 10/17 21:15 Rome local time, based on the requested 24-hour-before rule.
- Reservation/ticket copy buttons and personal Tway E-ticket download remain available.
- Türkiye 1 roster/admin changes from MIX53 are preserved unchanged.
