# Aegis - Intel Extraction App

A dark-themed, cyberpunk-aesthetic voice analysis app for Android.

## Setup Instructions

Run these exact terminal commands to initialize the setup (assumes you have Node.js and an initialized expo app named `aegis`):

```bash
# 1. Enter the project directory
cd aegis

# 2. Install necessary Expo modules and Voice library
npx expo install @react-native-voice/voice @react-native-async-storage/async-storage react-native-reanimated @expo/vector-icons

# 3. Install NativeWind and TailwindCSS for styling
npm install nativewind
npm install --save-dev tailwindcss@3.3.2

# 4. Initialize Tailwind config
npx tailwindcss init
```

*Note: The necessary config updates for `tailwind.config.js`, `babel.config.js`, and `app.json` are already included in this repository's source code.*

## Compiling Android APK

To build the project into an APK for Android, you will use EAS (Expo Application Services).

1. Install the EAS CLI globally (if not already installed):
```bash
npm install -g eas-cli
```

2. Login to your Expo account:
```bash
eas login
```

3. Configure EAS Build (already done via `eas.json` in this repo, but run this if starting from scratch):
```bash
eas build:configure
```

4. Build the APK using the `preview` profile:
```bash
eas build -p android --profile preview
```

5. Once the build is complete, you will receive a link to download your `.apk` file.
