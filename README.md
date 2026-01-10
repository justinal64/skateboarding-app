# Skateboarding App

## Deployment Checklist 🚀

### 1. API Key Security (CRITICAL)
Before shipping to production/App Store, you must restrict the Google Maps/Firebase API Keys to prevent unauthorized usage.

**Steps:**
1.  Go to [Google Cloud Console Credentials](https://console.cloud.google.com/apis/credentials?project=skateboarding-app-cb3d9).
2.  Edit your API Key.
3.  Under **Application restrictions**, select **iOS apps**.
4.  Add your Bundle ID: `com.justinleggett.skateboard` (from `app.json`).
5.  Save.

*Note: You may need to revert this to "None" temporarily if you are testing on localhost/Expo Go.*

### 2. Firestore Rules
Ensure `firestore.rules` content is copied to the Firebase Console to prevent public overwrites of the Trick Library.

### 3. Deploy
Run the following to build for TestFlight:
```bash
npm run deploy:ios
```
