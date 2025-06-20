// app.config.js
import 'dotenv/config';

export default ({ config }) => ({
  ...config,
  extra: {
    EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY: process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY,
    // add more here as needed:
    // API_BASE_URL: process.env.API_BASE_URL,
  },
});
