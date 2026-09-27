# Install on an iPhone

## Free personal preview with Expo Go

Install Expo Go from the iPhone App Store. Connect the phone and computer to the same network, then run `bunx expo start --go` in this project. Scan the terminal QR code with the iPhone Camera and open the link in Expo Go. Keep the development server running while loading the project. If a firewall prompt appears, allow access on your trusted private network.

This opens the tracker inside Expo Go rather than installing a standalone app. Habits remain in local SQLite storage for the project; deleting Expo Go or clearing its storage can remove them. Use an Expo Go version compatible with SDK 57.

## Optional standalone build

The `preview` EAS Build profile creates a standalone, signed iOS app for registered physical devices. It includes the JavaScript bundle and does not need a running development server.

## First-time setup

You need an Expo account and a paid Apple Developer Program membership. Run the following from the project directory, signing in directly in the CLI when prompted:

```powershell
bunx eas-cli login
bunx eas-cli init
bunx eas-cli device:create
bunx eas-cli build --platform ios --profile preview
```

Open the device-registration link on your iPhone and complete registration before starting the build. During the first build, choose a unique iOS bundle identifier and let EAS configure signing with your Apple Developer team. Include your registered iPhone in the provisioning profile.

When the build succeeds, open its EAS installation link in Safari on the registered iPhone and select Install. The build page also provides the signed `.ipa` file. An IPA signed for another device will not install; register additional devices and rebuild or re-sign when needed.

Do not commit Apple credentials, certificates, or provisioning profiles. Keep the generated EAS project ID and bundle identifier in app configuration for subsequent builds.

Without a paid Apple Developer membership, you can preview the app through Expo Go with `bunx expo start --go`; that is not a standalone app installation.

Reference: https://docs.expo.dev/build/internal-distribution/
