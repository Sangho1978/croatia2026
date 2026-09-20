# 출석 알림 동작 범위 (MIX12)

## 현재 앱에서 되는 것
- Firebase Realtime Database 출석 상태를 앱이 실시간으로 수신하는 동안:
  - 출석 시작: `@@@ 출석체크가 시작되었습니다. 출석체크 해주세요.` 형식의 앱 내부 알림
  - 28/28 완료: `28명 모두 출석 체크가 완료되었습니다.` 앱 내부 알림
- 사용자가 `🔔 알림 켜기`를 눌러 브라우저 알림을 허용한 경우, 앱이 실행 중이고 이벤트를 수신할 수 있는 상태에서는 Service Worker 시스템 알림도 시도합니다.

## 플랫폼별
- Android Chrome: HTTPS GitHub Pages에서 알림 허용 후 사용 가능. 앱/탭이 OS에 의해 정지되지 않은 동안 이벤트 감지 후 시스템 알림 표시를 시도합니다.
- iPhone/iPad: iOS/iPadOS 16.4+에서 **홈 화면에 추가한 웹앱**만 Web Push 알림 권한을 요청할 수 있습니다. 현재 앱의 알림은 앱이 이벤트를 감지할 수 있을 때 표시합니다.

## 현재 구조에서 안 되는 것
브라우저/PWA가 완전히 종료되거나 OS가 웹앱 실행을 정지한 상태에서, Realtime Database의 출석 시작을 스스로 감지해 알림을 보내는 **진짜 백그라운드 푸시**는 정적 GitHub Pages + RTDB 클라이언트만으로 구현할 수 없습니다.

이를 하려면 Firebase Cloud Messaging(Web Push) 구독 + Service Worker + 서버/Cloud Function 같은 신뢰할 수 있는 발송 백엔드가 추가로 필요합니다. 서버가 출석 시작/완료 이벤트를 감지한 뒤 구독자에게 푸시를 보내야 합니다.

공식 참고:
- Apple Web Push: https://webkit.org/blog/13878/web-push-for-web-apps-on-ios-and-ipados/
- Firebase Web FCM: https://firebase.google.com/docs/cloud-messaging/js/receive
- MDN Notifications: https://developer.mozilla.org/en-US/docs/Web/API/Notifications_API
