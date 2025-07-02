// app.config.js
import 'dotenv/config';

export default ({ config }) => ({
  ...config,
  extra: {
    EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY: process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY,
    // add more here as needed:
    EXPO_PUBLIC_DEV_API_URL: process.env.EXPO_PUBLIC_DEV_API_URL,
    EXPO_PUBLIC_PROD_API_URL: process.env.EXPO_PUBLIC_PROD_API_URL
  },
});
