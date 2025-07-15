// app.config.js
import 'dotenv/config';
import appJson from './app.json';

export default ({ config }) => ({
  ...appJson.expo,
  extra: {
    ...appJson.expo.extra,
    EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY: process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY,
    // add more here as needed:
    EXPO_PUBLIC_PROD_API_URL: process.env.EXPO_PUBLIC_PROD_API_URL,
    // EXPO_PUBLIC_DEV_API_URL: process.env.EXPO_PUBLIC_DEV_API_URL // commented out for now
  },
});
