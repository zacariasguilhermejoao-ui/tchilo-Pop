# tchilo-Pop — Android + iOS

The project is configured to be packaged as a native Android and iOS application with Capacitor.

## Build setup

```bash
npm install
npx cap add android
npx cap add ios
npx cap sync
```

## Native features to configure next

- Camera/photo capture
- Video capture
- Geolocation/GPS
- Push notifications
- Microphone
- Phone/dialer links
- Status bar and splash screen
- App icon

The existing `index.html` remains the web application entry point and is not replaced by this setup.
