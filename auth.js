// auth.js — Google Identity Services (GIS) + Local Auth + Session Management
// Uses GIS Token Model for SPA — no client_secret required.
window.VF = window.VF || {};
VF.Auth = (() => {
  const CLIENT_ID = '191388644055-g85d4jrlpr8a2asjt9ugbhdhci0q73a6.apps.googleusercontent.com';

  const SCOPES = [
    'https://www.googleapis.com/auth/spreadsheets',
    'https://www.googleapis.com/auth/drive.file',
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile',
  ].join(' ');

  let tokenClient = null;
  let _loginCallback = null;

  // ── Initialize GIS token client ────────────────────────────────

  function initTokenClient() {
    if (typeof google === 'undefined' || !google.accounts?.oauth2) {
      return false;
    }

    tokenClient = google.accounts.oauth2.initTokenClient({
      client_id: CLIENT_ID,
      scope:     SCOPES,
      callback:  (resp) => {
        if (_loginCallback) _loginCallback(resp);
      },
      error_callback: (err) => {
        if (_loginCallback) _loginCallback({ error: err.type || 'unknown_error' });
      },
    });
    return true;
  }

  // ── Login via Google (popup) ───────────────────────────────────

  /**
   * Opens the Google sign-in popup.
   * Resolves with the access_token on success.
   * Rejects on error or if GIS is not loaded.
   */
  function login() {
    return new Promise((resolve, reject) => {
      if (!tokenClient && !initTokenClient()) {
        reject(new Error('Google Identity Services no está disponible. Recarga la página e intenta de nuevo.'));
        return;
      }

      _loginCallback = async (response) => {
        _loginCallback = null;

        if (response.error) {
          reject(new Error(`Error de Google: ${response.error}`));
          return;
        }

        try {
          await VF.DB.saveTokens({
            access_token: response.access_token,
            expires_at:   Date.now() + (response.expires_in || 3600) * 1000,
          });
          resolve(response.access_token);
        } catch (err) {
          reject(err);
        }
      };

      tokenClient.requestAccessToken();
    });
  }

  // ── Handle redirect callback (legacy cleanup) ─────────────────

  /**
   * Cleans up any stale OAuth params in the URL from the old redirect flow.
   * Always returns false — the GIS popup flow doesn't use redirects.
   */
  async function handleCallback() {
    const params = new URLSearchParams(window.location.search);
    if (params.has('code') || params.has('error')) {
      window.history.replaceState({}, '', window.location.pathname);
    }
    return false;
  }

  // ── Transparent token access ───────────────────────────────────

  /**
   * Returns a valid access_token if available, or null.
   * With GIS Token Model there are no refresh_tokens — the caller
   * should re-trigger login() when this returns null.
   */
  async function getValidToken() {
    const tokens = await VF.DB.getTokens();
    if (!tokens?.access_token) return null;

    // Token still has more than 5 minutes left
    if (tokens.expires_at > Date.now() + 300_000) {
      return tokens.access_token;
    }

    // Expired — caller must re-authenticate
    return null;
  }

  // ── Session helpers ────────────────────────────────────────────

  function getSession() {
    try {
      const raw = sessionStorage.getItem('vf_session');
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  }

  async function isAuthenticated() {
    const session = getSession();
    if (!session) return false;

    if (session.authType === 'google') {
      const token = await getValidToken();
      return token !== null;
    }

    return true;
  }

  /**
   * Auth guard — call at the top of every protected page.
   * Redirects to login.html if not authenticated.
   */
  async function requireAuth() {
    const authed = await isAuthenticated();
    if (!authed) {
      sessionStorage.removeItem('vf_session');
      window.location.href = 'login.html';
      return null;
    }
    return getSession();
  }

  /** Logout — clear all session data */
  async function logout() {
    // Revoke the Google token if available
    const tokens = await VF.DB.getTokens();
    if (tokens?.access_token) {
      try {
        google.accounts.oauth2.revoke(tokens.access_token);
      } catch (_) { /* ignore — revoke is best-effort */ }
    }

    await VF.DB.saveTokens({ id: 'current', access_token: null, refresh_token: null, expires_at: 0 });
    sessionStorage.removeItem('vf_session');
    localStorage.removeItem('vf_current_user');
    window.location.href = 'login.html';
  }

  return {
    login, handleCallback, getValidToken,
    isAuthenticated, requireAuth, getSession, logout,
    initTokenClient,
  };
})();
