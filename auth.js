// auth.js — Flujo OAuth 2.0 + PKCE para SPA sin backend
window.VF = window.VF || {};
VF.Auth = (() => {
  const CLIENT_ID = 'TU_CLIENT_ID.apps.googleusercontent.com';
  const REDIRECT_URI = window.location.origin + window.location.pathname;
  const SCOPES = [
    'https://www.googleapis.com/auth/spreadsheets',
    'https://www.googleapis.com/auth/drive.file'
  ].join(' ');

  // --- PKCE helpers ---
  function generateVerifier() {
    const array = new Uint8Array(64);
    crypto.getRandomValues(array);
    return btoa(String.fromCharCode(...array))
      .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }

  async function generateChallenge(verifier) {
    const encoder = new TextEncoder();
    const data = encoder.encode(verifier);
    const digest = await crypto.subtle.digest('SHA-256', data);
    return btoa(String.fromCharCode(...new Uint8Array(digest)))
      .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }

  // --- Login ---
  async function login() {
    const verifier = generateVerifier();
    const challenge = await generateChallenge(verifier);
    // Guardar verifier en sessionStorage (sobrevive al redirect)
    sessionStorage.setItem('pkce_verifier', verifier);

    const params = new URLSearchParams({
      client_id: CLIENT_ID,
      redirect_uri: REDIRECT_URI,
      response_type: 'code',
      scope: SCOPES,
      code_challenge: challenge,
      code_challenge_method: 'S256',
      access_type: 'offline',     // Para obtener refresh_token
      prompt: 'consent'           // Forzar consentimiento la primera vez
    });
    window.location.href =
      `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
  }

  // --- Intercambiar code por tokens ---
  async function handleCallback() {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    if (!code) return false;

    const verifier = sessionStorage.getItem('pkce_verifier');
    if (!verifier) throw new Error('PKCE verifier perdido');

    const resp = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: CLIENT_ID,
        code,
        code_verifier: verifier,
        grant_type: 'authorization_code',
        redirect_uri: REDIRECT_URI
      })
    });

    const tokens = await resp.json();
    await VF.DB.saveTokens({
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expires_at: Date.now() + (tokens.expires_in * 1000)
    });

    sessionStorage.removeItem('pkce_verifier');
    // Limpiar URL (quitar ?code=...)
    window.history.replaceState({}, '', REDIRECT_URI);
    return true;
  }

  // --- Refresh automático del token ---
  async function getValidToken() {
    const tokens = await VF.DB.getTokens();
    if (!tokens) return null;

    // Si faltan más de 5 minutos, usar el token actual
    if (tokens.expires_at > Date.now() + 300000) {
      return tokens.access_token;
    }

    // Refresh
    const resp = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: CLIENT_ID,
        grant_type: 'refresh_token',
        refresh_token: tokens.refresh_token
      })
    });

    const data = await resp.json();
    await VF.DB.saveTokens({
      ...tokens,
      access_token: data.access_token,
      expires_at: Date.now() + (data.expires_in * 1000)
    });
    return data.access_token;
  }

  return { login, handleCallback, getValidToken };
})();