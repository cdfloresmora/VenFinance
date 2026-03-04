// auth.js — Google OAuth + Local Auth + Session Management
// Primary: GIS Token Model (popup). Fallback: Implicit flow (redirect).
window.VF = window.VF || {};
VF.Auth = (() => {
  const CLIENT_ID = '191388644055-g85d4jrlpr8a2asjt9ugbhdhci0q73a6.apps.googleusercontent.com';

  // Redirect URI for implicit flow fallback — must match Google Cloud Console.
  const REDIRECT_URI = (() => {
    const { origin, pathname } = window.location;
    const dir = pathname.endsWith('/')
      ? pathname
      : pathname.slice(0, pathname.lastIndexOf('/') + 1);
    return origin + dir + 'login.html';
  })();

  const SCOPES = [
    'https://www.googleapis.com/auth/spreadsheets',
    'https://www.googleapis.com/auth/drive.file',
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile',
  ].join(' ');

  let tokenClient = null;
  let _loginCallback = null;

  // ── GIS initialization ─────────────────────────────────────

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
        if (_loginCallback) _loginCallback({ error: err.type || 'popup_error' });
      },
    });
    return true;
  }

  // ── Login ──────────────────────────────────────────────────

  /**
   * Initiates Google login.
   * - If GIS library is loaded → opens a popup (resolves with access_token).
   * - Otherwise → falls back to implicit redirect flow (navigates away).
   */
  function login() {
    // Try GIS popup first
    if (tokenClient || initTokenClient()) {
      return new Promise((resolve, reject) => {
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

    // Fallback: implicit redirect flow (response_type=token)
    console.log('[Auth] GIS not available, falling back to implicit redirect');
    const params = new URLSearchParams({
      client_id:              CLIENT_ID,
      redirect_uri:           REDIRECT_URI,
      response_type:          'token',
      scope:                  SCOPES,
      include_granted_scopes: 'true',
    });
    window.location.href =
      `https://accounts.google.com/o/oauth2/v2/auth?${params}`;

    // Page navigates away — return a never-resolving promise
    return new Promise(() => {});
  }

  // ── Handle redirect callback ──────────────────────────────

  /**
   * Call on every page load.
   * Handles the hash fragment from the implicit flow (#access_token=...).
   * Also cleans up stale code= params from the old PKCE flow.
   * Returns true if a token was extracted and saved, false otherwise.
   */
  async function handleCallback() {
    // ① Check hash fragment for implicit flow token
    const hash = window.location.hash.substring(1);
    if (hash) {
      const params = new URLSearchParams(hash);
      const accessToken = params.get('access_token');
      const expiresIn   = params.get('expires_in');
      const error       = params.get('error');

      if (error) {
        window.history.replaceState({}, '', window.location.pathname);
        throw new Error(`Error de Google: ${error}`);
      }

      if (accessToken) {
        await VF.DB.saveTokens({
          access_token: accessToken,
          expires_at:   Date.now() + (parseInt(expiresIn) || 3600) * 1000,
        });
        window.history.replaceState({}, '', window.location.pathname);
        return true;
      }
    }

    // ② Clean up stale code= params from old PKCE flow
    const searchParams = new URLSearchParams(window.location.search);
    if (searchParams.has('code') || searchParams.has('error')) {
      window.history.replaceState({}, '', window.location.pathname);
    }

    return false;
  }

  // ── Token access ──────────────────────────────────────────

  /**
   * Returns a valid access_token or null.
   * No refresh_token with implicit/GIS flows — caller should
   * re-trigger login() when this returns null.
   */
  async function getValidToken() {
    const tokens = await VF.DB.getTokens();
    if (!tokens?.access_token) return null;

    // Token still has more than 5 minutes left
    if (tokens.expires_at > Date.now() + 300_000) {
      return tokens.access_token;
    }

    return null;
  }

  // ── Session helpers ───────────────────────────────────────

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

  async function requireAuth() {
    const authed = await isAuthenticated();
    if (!authed) {
      sessionStorage.removeItem('vf_session');
      window.location.href = 'login.html';
      return null;
    }
    return getSession();
  }

  async function logout() {
    const tokens = await VF.DB.getTokens();
    if (tokens?.access_token) {
      try { google.accounts.oauth2.revoke(tokens.access_token); }
      catch (_) { /* best-effort */ }
    }
    await VF.DB.saveTokens({ id: 'current', access_token: null, refresh_token: null, expires_at: 0 });
    sessionStorage.removeItem('vf_session');
    localStorage.removeItem('vf_current_user');
    window.location.href = 'login.html';
  }

  return {
    login, handleCallback, getValidToken,
    isAuthenticated, requireAuth, getSession, logout,
    initTokenClient, REDIRECT_URI,
  };
})();
