# MIX82 - 2026-10-11

- Root folder of ZIP: `Croatia2026/`; `index.html`, `trips.html`, `js/`, `css/`, `assets/` are immediately underneath, no nested version folder.
- Every rostered user, including non-admin participants, can now **check and uncheck their own attendance using ONE `attMyBtn` button** while the current round is active.
- The button stays enabled when checked; its label and `aria-pressed` reflect the server state. Taps are protected by an in-flight lock and Firebase ETag optimistic concurrency.
- To uncheck, delete only the user's own Firebase entry. A checked record saved with another Firebase anonymous UID cannot be undone from a different device.
- Firebase rules changed for Croatia and Turkiye 1: DELETE is permitted only if `data.uid == auth.uid`, a record exists, the same round is current, and the round has not been finalized. PUT retains its previous validation and ownership restrictions.
- Administrators remain Croatia: Han Sangho, Lee Sangmi, Wi Jaebok; Turkiye1: Nam Sangmo, Kim Sujeong, Kim Suyeon. Only admins finalize/reset/start rounds. External escort Minjeong Ji remains attendance viewer only.
- Login screen and integrated portal now show a short visible change history for v79, v80, v81, v82. App build id and service worker cache version bumped to v82.
- Deploy files from inside `Croatia2026/` to the hosting root. To allow uncheck, the updated `Firebase_Rules_v82.txt` MUST separately be applied to Firebase Realtime Database -> Rules. Existing attendance data is not removed by deployment.
- This app's current 4-digit PIN and anonymous Firebase Auth are not a strong per-person identity system. The backend checks UID ownership but cannot infer the real user behind that UID.
