ToDo: Make a walkthrough on how to build this app

``if modified url need to do this first -> npx expo start -c``
1. Must first delete the android folder if exists
2. npx expo prebuild --platform android
3. modify the AndroidManifest.xml (taskmgmt\android\app\src\main) with this
<application android:name=".MainApplication" android:label="@string/app_name" android:icon="@mipmap/ic_launcher" android:roundIcon="@mipmap/ic_launcher_round" android:allowBackup="true" android:theme="@style/AppTheme" android:supportsRtl="true" android:fullBackupContent="@xml/secure_store_backup_rules" android:dataExtractionRules="@xml/secure_store_data_extraction_rules" android:usesCleartextTraffic="true">
TAKE NOTE! this is only when you support local dev (http request) but ending it needs to be on https with ssl certified
4. Execute npx expo run:android --variant release
5. You can see result on the
taskmgmt\android\app\build\outputs\apk\release