# ClimbingLog

See it running live here... https://achey.net/ClimbingLog/

## Google Drive sync setup

Ticks are cached locally in IndexedDB but sync to a `ClimbingLog/ticks.csv` file in
Google Drive when signed in. To enable this in a local checkout:

1. In [Google Cloud Console](https://console.cloud.google.com/), create/select a project.
2. Enable the **Google Drive API** (APIs & Services → Library).
3. Configure the **OAuth consent screen** (External, Testing mode is fine — add your own
   Google account as a test user).
4. Create an **OAuth Client ID** (Credentials → Create Credentials → OAuth client ID →
   Web application). Authorized JavaScript origins: `http://localhost:5173` and
   `https://achey.net`. No redirect URI is needed.
5. Copy `.env.example` to `.env` and set `VITE_GOOGLE_CLIENT_ID` to the client ID from
   step 4.
