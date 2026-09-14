# Native integration checklist

The web app remains in `index.html` and is not replaced automatically.

## Android and iOS native capabilities

- Camera: BI front, BI back, vehicle/motorcycle photo and face video.
- Location: GPS permission and native location access.
- Notifications: native permission and push notification bridge (Firebase FCM).
- Splash: native startup screen so the app can show the splash immediately.
- Phone calls: `tel:` links can hand the number to the system dialer.
- Microphone: required for face/video capture when requested by the app.

## Firebase Push Notifications

Files are in `firebase/`:
- `google-services.json` (Android)
- `GoogleService-Info.plist` (iOS)

The GitHub Actions workflows copy these files automatically into the generated native projects.

### How to use in the web app

Include the bridge script (once):
```html
<script src="native/capacitor-bridge.js"></script>
```

Then:
```js
// Request permission + register
if (window.TchiloNative && TchiloNative.isNative()) {
  TchiloNative.requestNotifications().then(perm => {
    console.log('Notification permission:', perm);
  });
}

// Listen for token / incoming notifications
window.addEventListener('tchilo-push-token', e => {
  const token = e.detail;
  // Send this token to your backend / Supabase
});

window.addEventListener('tchilo-push-received', e => {
  console.log('Notification received', e.detail);
});

window.addEventListener('tchilo-push-action', e => {
  console.log('User tapped notification', e.detail);
});
```

## App Icon & Splash

Place the official icon (the black "t" + 3 colored dots) as:
- `resources/icon.png` (1024×1024)
- `resources/splash.png` (recommended 2732×2732 or 1024×1024)

Then run:
```bash
npx @capacitor/assets generate
npx cap sync
```

## Important

Testing the plain `index.html` in an HTML5 viewer does not reproduce native Capacitor permissions. Camera, GPS and notifications must be tested in the generated Android/iOS app.

The next integration step is to connect the existing UI buttons in `index.html` to Capacitor APIs without replacing the existing application code.
