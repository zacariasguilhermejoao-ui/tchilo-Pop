# Native integration checklist

The web app remains in `index.html` and is not replaced automatically.

## Android and iOS native capabilities

- Camera: BI front, BI back, vehicle/motorcycle photo and face video.
- Location: GPS permission and native location access.
- Notifications: native permission and push notification bridge.
- Splash: native startup screen so the app can show the splash immediately.
- Phone calls: `tel:` links can hand the number to the system dialer.
- Microphone: required for face/video capture when requested by the app.

## Important

Testing the plain `index.html` in an HTML5 viewer does not reproduce native Capacitor permissions. Camera, GPS and notifications must be tested in the generated Android/iOS app.

The next integration step is to connect the existing UI buttons in `index.html` to Capacitor APIs without replacing the existing application code.
