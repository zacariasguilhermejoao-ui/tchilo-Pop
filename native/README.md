# tchilo-Pop — Native app setup

This folder contains only the generic Android/iOS packaging setup for tchilo-Pop.

The existing web application remains in the repository root as `index.html` and is not replaced by the native setup.

## Android

The repository is prepared to generate an Android project with Capacitor and build an APK/AAB through GitHub Actions.

## iOS

The repository is prepared to generate an iOS Xcode project with Capacitor. App Store signing and publishing still require an Apple Developer account and signing configuration.

## Important

No Dunta Taxi functionality is part of tchilo-Pop. App-specific native permissions and plugins should only be added when a tchilo-Pop feature actually requires them.
