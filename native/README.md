# Native configuration

This directory documents the native capabilities required by tchilo-Pop when the Capacitor Android and iOS projects are generated.

## Required permissions

### Android
- Camera: document photos, vehicle photos and face/video capture
- Location: GPS and ride tracking
- Notifications: ride and message notifications
- Microphone: video/voice features when requested
- Internet/network access
- Phone/dialer: opening the system dialer from the call button

### iOS
- Camera usage description
- Photo library usage description
- Microphone usage description
- Location usage description
- Notifications authorization
- Network access

## Important

The web application remains in the repository root as `index.html`. Native projects should be generated with Capacitor from this repository rather than replacing the existing web application.
