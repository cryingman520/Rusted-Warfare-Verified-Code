# Native creative tools

The Windows and Android builds bundle the browser editors, courses, reference data and pixel tools locally

No AI model weights are shipped or downloaded, the cloud AI endpoints are used only when Online AI is enabled

Windows uses .NET 9 WinForms and the existing Microsoft Edge WebView2 Runtime, publishing includes the .NET runtime in one executable

Android uses the device WebView, local asset interception and the system document picker, no broad storage permission is requested

Build the local website asset bundle with `node scripts/bundle-native.cjs` from the repository root

Windows build: `dotnet publish native/windows/RWTools.csproj -c Release -o artifacts/windows`

For Android Studio, open `native/android`, use JDK 17 or later and the Gradle version compatible with the pinned Android plugin, build a signed APK for sideloading or a signed Android App Bundle for Play

Signing keys and passwords must remain outside this repository, retain the same package name and signing key for future updates

The application defaults to offline mode, the user can switch to Online AI without changing the locally saved project
