📦 Prerequisites
Node.js & npm/yarn

Expo CLI

bash
Copy
Edit
npm install --global expo-cli
Android Studio (with SDK & NDK):

Install via https://developer.android.com/studio

In SDK Manager, ensure you’ve got:

Android SDK Platform (30+)

Android SDK Build-Tools

NDK (for Reanimated)

Java JDK 11+

Environment variables pointing to your SDK (so CLI builds work):

On macOS/Linux:

bash
Copy
Edit
export ANDROID_SDK_ROOT="$HOME/Library/Android/sdk"
export PATH="$PATH:$ANDROID_SDK_ROOT/emulator:$ANDROID_SDK_ROOT/platform-tools"
On Windows (System → Environment Variables):

makefile
Copy
Edit
ANDROID_SDK_ROOT = C:\Users\<You>\AppData\Local\Android\Sdk
PATH += %ANDROID_SDK_ROOT%\emulator;%ANDROID_SDK_ROOT%\platform-tools
🔧 1. “Eject” to a native project
In your app root (where package.json is):

bash
Copy
Edit
npx expo prebuild --platform android
Generates android/ (and ios/) directories based on your Expo config.

If you already have an android/ folder, skip this step.

🛠️ 2. Configure your Android app
Open android/app/build.gradle and ensure:

groovy
Copy
Edit
android {
  defaultConfig {
    applicationId "com.yourcompany.taskmgmt"    // ← your reverse-domain ID
    minSdkVersion 21
    targetSdkVersion 33
    versionCode 1
    versionName "1.0.0"
  }

  // Disable strict lint on release to avoid variant errors
  lint {
    checkReleaseBuilds false
  }
}
Also verify in app.json or expo.config.js you have:

jsonc
Copy
Edit
{
  "expo": {
    "android": {
      "package": "com.yourcompany.taskmgmt"
    }
  }
}
🔐 3. Generate (or use) a keystore
If you don’t already have one:

bash
Copy
Edit
keytool -genkeypair -v \
  -keystore my-release-key.jks \
  -alias taskmgmtKeyAlias \
  -keyalg RSA -keysize 2048 \
  -validity 10000
Answer the prompts (password, name, etc.).

Move my-release-key.jks into android/ or a secure folder.

Create (or edit) android/gradle.properties and add:

ini
Copy
Edit
MYAPP_UPLOAD_STORE_FILE=my-release-key.jks
MYAPP_UPLOAD_KEY_ALIAS=taskmgmtKeyAlias
MYAPP_UPLOAD_STORE_PASSWORD=<your-keystore-password>
MYAPP_UPLOAD_KEY_PASSWORD=<your-key-password>
📐 4. Build the signed release APK
A) Via Gradle CLI
bash
Copy
Edit
cd android
# Windows
gradlew.bat clean assembleRelease
# macOS/Linux
./gradlew clean assembleRelease
Outputs ➔ android/app/build/outputs/apk/release/app-release.apk

Signed with your keystore (from step 3)

B) (Alternative) Via expo run
If you just want a debug-signed release to test quickly:

bash
Copy
Edit
npx expo run:android --variant release
Also generates a release APK under the same path.

📂 5. Install or distribute
On a device/emulator via ADB:

bash
Copy
Edit
adb install -r android/app/build/outputs/apk/release/app-release.apk
Share the app-release.apk file with testers, or upload to Google Play.

⚙️ 6. (Optional) Over-The-Air updates
If you continue to use Expo Updates, you can push JS changes without rebuilding the binary:

bash
Copy
Edit
expo publish --release-channel production
Your users’ installed APK will fetch the latest JS bundle on launch.

✅ Summary Checklist
Install Android Studio + JDK + set ANDROID_SDK_ROOT.

Run npx expo prebuild --platform android.

Add android.package & disable lint in Gradle config.

Create/signing keystore & configure gradle.properties.

cd android && gradlew assembleRelease → get app-release.apk.

Install via adb or distribute via Google Play.

That’s it! You now have a locally built, production-ready APK for your Expo-powered React Native app.