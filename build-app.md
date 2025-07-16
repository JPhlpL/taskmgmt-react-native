ToDo: Make a walkthrough on how to build this app

1. Must first delete the android folder if exists
2. npx expo prebuild --platform android
3. modify the AndroidManifest.xml with this
<application android:name=".MainApplication" android:label="@string/app_name" android:icon="@mipmap/ic_launcher" android:roundIcon="@mipmap/ic_launcher_round" android:allowBackup="true" android:theme="@style/AppTheme" android:supportsRtl="true" android:fullBackupContent="@xml/secure_store_backup_rules" android:dataExtractionRules="@xml/secure_store_data_extraction_rules" android:usesCleartextTraffic="true">
TAKE NOTE! this is only when you support local dev (http request) but ending it needs to be on https with ssl certified
4. Execute npx expo run:android --variant release
