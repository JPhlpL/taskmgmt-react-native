import 'dotenv/config'; // loads .env locally

export default ({ config }) => ({
  ...config,
  // 1) Pull your projectId from an env var
  projectId: process.env.EAS_PROJECT_ID,

  // 2) Wire in your public key (from EAS secret or .env)
  extra: {
    ...config.extra,
    EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY:
      process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY,
  },

  // 3) Ensure the Android package remains correct
  android: {
    ...config.android,
    package: config.android.package,
  },
});
