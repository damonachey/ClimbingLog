const SCOPE = "https://www.googleapis.com/auth/drive.file";
const SIGNED_IN_KEY = "climbing-log:googleSignedIn";
const TOKEN_STORAGE_KEY = "climbing-log:googleToken";
const EXPIRY_SKEW_MS = 60_000;

let tokenClient = null;
let accessToken = null;
let tokenExpiresAt = 0;
let pending = null;

function restoreToken() {
  try {
    const raw = sessionStorage.getItem(TOKEN_STORAGE_KEY);
    if (!raw) return;
    const { accessToken: token, expiresAt } = JSON.parse(raw);
    if (token && expiresAt && Date.now() < expiresAt - EXPIRY_SKEW_MS) {
      accessToken = token;
      tokenExpiresAt = expiresAt;
    }
  } catch {
    // Ignore corrupt storage.
  }
}
restoreToken();

function handleTokenResponse(response) {
  if (!pending) return;
  const { resolve, reject } = pending;
  pending = null;
  if (response.error) {
    reject(new Error(response.error));
    return;
  }
  accessToken = response.access_token;
  tokenExpiresAt = Date.now() + response.expires_in * 1000;
  localStorage.setItem(SIGNED_IN_KEY, "1");
  sessionStorage.setItem(TOKEN_STORAGE_KEY, JSON.stringify({ accessToken, expiresAt: tokenExpiresAt }));
  resolve(accessToken);
}

function getTokenClient() {
  if (tokenClient) return tokenClient;
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  if (!clientId) throw new Error("VITE_GOOGLE_CLIENT_ID is not configured");
  tokenClient = window.google.accounts.oauth2.initTokenClient({
    client_id: clientId,
    scope: SCOPE,
    callback: handleTokenResponse,
    error_callback: () => {
      if (!pending) return;
      const { reject } = pending;
      pending = null;
      reject(new Error("Google sign-in was cancelled or blocked"));
    },
  });
  return tokenClient;
}

function requestToken(prompt) {
  return new Promise((resolve, reject) => {
    pending = { resolve, reject };
    getTokenClient().requestAccessToken({ prompt });
  });
}

function hasValidToken() {
  return accessToken != null && Date.now() < tokenExpiresAt - EXPIRY_SKEW_MS;
}

export function signIn() {
  return requestToken("consent");
}

export async function trySilentSignIn() {
  if (hasValidToken()) return accessToken;
  if (localStorage.getItem(SIGNED_IN_KEY) !== "1") return null;
  try {
    return await requestToken("");
  } catch {
    return null;
  }
}

export async function getValidToken() {
  if (hasValidToken()) return accessToken;
  return requestToken("");
}

export function signOut() {
  const token = accessToken;
  accessToken = null;
  tokenExpiresAt = 0;
  localStorage.removeItem(SIGNED_IN_KEY);
  sessionStorage.removeItem(TOKEN_STORAGE_KEY);
  if (token) window.google?.accounts?.oauth2?.revoke(token);
}

export function isSignedIn() {
  return accessToken != null;
}
