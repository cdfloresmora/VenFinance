// auth.js — OAuth 2.0 + PKCE + Local Auth + Session Management
// Uses Proof Key for Code Exchange (RFC 7636) — no client_secret required.
window.VF = window.VF || {};
VF.Auth = (() => {
  const CLIENT_ID = '191388644055-g85d4jrlpr8a2asjt9ugbhdhci0q73a6.apps.googleusercontent.com';

  // Always resolve to the directory root (handles both /index.html and /venfinance/).
  // This must match the URI registered in Google Cloud Console.
  const REDIRECT_URI = (() => {
    const { origin, pathname } = window.location;
    // Redirect to login.html after Google OAuth
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

  // ── PKCE helpers ─────────────────────────────────────────────

  function generateVerifier() {
    const bytes = new Uint8Array(64);
    crypto.getRandomValues(bytes);
    return btoa(String.fromCharCode(...bytes))
      .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }

  async function generateChallenge(verifier) {
    const data   = new TextEncoder().encode(verifier);
    const digest = await crypto.subtle.digest('SHA-256', data);
    return btoa(String.fromCharCode(...new Uint8Array(digest)))
      .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }

  // ── Initiate authorization ───────────────────────────────────

  async function login() {
    const verifier  = generateVerifier();
    const challenge = await generateChallenge(verifier);
    // verifier survives the redirect but not a tab close
    sessionStorage.setItem('pkce_verifier', verifier);

    const params = new URLSearchParams({
      client_id:             CLIENT_ID,
      redirect_uri:          REDIRECT_URI,
      response_type:         'code',
      scope:                 SCOPES,
      code_challenge:        challenge,
      code_challenge_method: 'S256',
      access_type:           'offline',   // request refresh_token
      prompt:                'consent',   // force consent so refresh_token is always issued
    });

    window.location.href =
      `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
  }

  // ── Handle redirect callback ─────────────────────────────────

  /**
   * Call this on every page load.
   * Returns true if a callback was processed (tokens saved), false otherwise.
   * Throws on token-exchange errors so the UI can surface them.
   */
  async function handleCallback() {
    const params = new URLSearchParams(window.location.search);
    const error  = params.get('error');
    const code   = params.get('code');

    if (error) {
      console.error('OAuth error:', error, params.get('error_description'));
      // Clean the URL so we don't loop on reload
      window.history.replaceState({}, '', window.location.pathname);
      return false;
    }

    if (!code) return false; // Normal page load — nothing to handle

    const verifier = sessionStorage.getItem('pkce_verifier');
    if (!verifier) {
      // Session expired between redirect and return — start over
      window.history.replaceState({}, '', window.location.pathname);
      throw new Error('PKCE verifier missing. The session may have expired. Please try logging in again.');
    }

    const resp = await fetch('https://oauth2.googleapis.com/token', {
      method:  'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body:    new URLSearchParams({
        client_id:     CLIENT_ID,
        code,
        code_verifier: verifier,
        grant_type:    'authorization_code',
        redirect_uri:  REDIRECT_URI,
      }),
    });

    const tokens = await resp.json();

    if (!resp.ok || tokens.error) {
      sessionStorage.removeItem('pkce_verifier');
      window.history.replaceState({}, '', window.location.pathname);
      throw new Error(`Token exchange failed: ${tokens.error_description || tokens.error || resp.status}`);
    }

    await VF.DB.saveTokens({
      access_token:  tokens.access_token,
      refresh_token: tokens.refresh_token,       // only present on first auth or with prompt:consent
      expires_at:    Date.now() + tokens.expires_in * 1000,
    });

    sessionStorage.removeItem('pkce_verifier');
    window.history.replaceState({}, '', window.location.pathname);
    return true;
  }

  // ── Transparent token refresh ────────────────────────────────

  /**
   * Returns a valid access_token, refreshing it automatically if close to expiry.
   * Returns null if not authenticated or refresh fails (caller should redirect to login).
   */
  async function getValidToken() {
    const tokens = await VF.DB.getTokens();
    if (!tokens?.access_token) return null;

    // Token still has more than 5 minutes left — use it directly
    if (tokens.expires_at > Date.now() + 300_000) {
      return tokens.access_token;
    }

    // Token is expired or expiring soon — refresh it
    if (!tokens.refresh_token) return null;

    try {
      const resp = await fetch('https://oauth2.googleapis.com/token', {
        method:  'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body:    new URLSearchParams({
          client_id:     CLIENT_ID,
          grant_type:    'refresh_token',
          refresh_token: tokens.refresh_token,
        }),
      });

      const data = await resp.json();

      if (!resp.ok || data.error) {
        // Refresh token revoked or expired — user must log in again
        console.warn('Token refresh failed:', data.error || resp.status);
        return null;
      }

      await VF.DB.saveTokens({
        ...tokens,
        access_token:  data.access_token,
        refresh_token: data.refresh_token || tokens.refresh_token, // Google may issue a new one
        expires_at:    Date.now() + data.expires_in * 1000,
      });

      return data.access_token;
    } catch (e) {
      console.error('Token refresh network error:', e);
      return null;
    }
  }

  // ── Session helpers ────────────────────────────────────────

  /** Get current session info or null */
  function getSession() {
    try {
      const raw = sessionStorage.getItem('vf_session');
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  }

  /** Check if user has a valid session */
  async function isAuthenticated() {
    const session = getSession();
    if (!session) return false;

    if (session.authType === 'google') {
      const token = await getValidToken();
      return token !== null;
    }

    // Local auth — session exists means authenticated
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
    await VF.DB.saveTokens({ id: 'current', access_token: null, refresh_token: null, expires_at: 0 });
    sessionStorage.removeItem('vf_session');
    localStorage.removeItem('vf_current_user');
    window.location.href = 'login.html';
  }

  return {
    login, handleCallback, getValidToken,
    isAuthenticated, requireAuth, getSession, logout,
    REDIRECT_URI
  };
})();
