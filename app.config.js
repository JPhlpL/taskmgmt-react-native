import 'dotenv/config';
import appJson from './app.json';

export default {
  // copy everything from your app.json's `"expo"` key:
  ...appJson.expo,

  // 1) ensure your EAS projectId is set here:
  projectId: process.env.EAS_PROJECT_ID,

  // 2) wire in your EAS env vars under extra:
  extra: {
    ...appJson.expo.extra,
    EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY: process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY,
    // add other env keys here if needed
  },

  // 3) double-check your android.package:
  android: {
    ...appJson.expo.android,
    package: 'com.jphlpl.taskmgmt',      // replace with your true reverse-domain ID
  },
};
