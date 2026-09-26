# MIX06 references (checked 2026-09-19)

## Exchange rates
- Frankfurter official API: https://frankfurter.dev/
- v1 supported endpoints and daily publication: https://frankfurter.dev/v1/
- Open Access ExchangeRate-API (daily, attribution required): https://www.exchangerate-api.com/docs/free

Latest published reference rate != tick-by-tick market quote. Basis date is shown independently of fetch time.

## Web geolocation and screen wake lock
- W3C Geolocation, exposed to Window; visibility requirements: https://www.w3.org/TR/geolocation/
- Chrome Page Lifecycle: https://developer.chrome.com/docs/web-platform/page-lifecycle-api
- Screen Wake Lock: https://developer.mozilla.org/en-US/docs/Web/API/Screen_Wake_Lock_API

Screen Wake Lock only affects a visible document. Browser backgrounding, termination or PWA installation does not grant continuous background GPS.

## Native apps and existing alternatives
- iOS location background mode: https://developer.apple.com/documentation/corelocation/cllocationmanager/allowsbackgroundlocationupdates
- Android background access: https://developer.android.com/develop/sensors-and-location/location/background
- Google Maps location sharing (iPhone): https://support.google.com/maps/answer/15437054?co=GENIE.Platform%3DiOS&hl=ko
- Google Maps location sharing (Android): https://support.google.com/maps/answer/15437054?co=GENIE.Platform%3DAndroid&hl=ko

Native apps require permission, platform configuration and distribution. Google Maps sharing is a separate service, not an automatic input to this Firebase database.
