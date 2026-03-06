// auth.js — Firebase Auth for VenFinance (Google + Email/Password)
window.VF = window.VF || {};
VF.Auth = (() => {
  const googleProvider = new firebase.auth.GoogleAuthProvider();

  // ── Whitelist check ───────────────────────────────────────────
  async function isWhitelisted(email) {
    try {
      const doc = await firestore.collection('app').doc('whitelist').get();
      if (!doc.exists) return true; // No whitelist doc = open access
      const data = doc.data();
      if (!data.enabled) return true; // Whitelist disabled = open access
      const emails = (data.emails || []).map(e => e.toLowerCase().trim());
      return emails.includes(email.toLowerCase().trim());
    } catch (e) {
      console.warn('Whitelist check failed:', e);
      return true; // If check fails, allow access (don't lock users out)
    }
  }

  async function enforceWhitelist(user) {
    const allowed = await isWhitelisted(user.email);
    if (!allowed) {
      await firebaseAuth.signOut();
      throw { code: 'auth/not-whitelisted', message: 'Tu correo no tiene acceso. Contacta al administrador.' };
    }
  }

  // ── Google Login (popup) ────────────────────────────────────
  async function login() {
    const result = await firebaseAuth.signInWithPopup(googleProvider);
    const user = result.user;
    await enforceWhitelist(user);
    // Save/update profile in Firestore
    await firestore.collection('users').doc(user.uid).set({
      email:     user.email,
      name:      user.displayName || user.email.split('@')[0],
      photoURL:  user.photoURL || null,
      lastLogin: Date.now()
    }, { merge: true });
    return user;
  }

  // ── Email/Password Login ────────────────────────────────────
  async function loginWithEmail(email, password) {
    const result = await firebaseAuth.signInWithEmailAndPassword(email, password);
    await enforceWhitelist(result.user);
    return result;
  }

  // ── Register ────────────────────────────────────────────────
  async function register(email, password, name) {
    // Check whitelist BEFORE creating the account
    const allowed = await isWhitelisted(email);
    if (!allowed) {
      throw { code: 'auth/not-whitelisted', message: 'Tu correo no tiene acceso. Contacta al administrador.' };
    }
    const result = await firebaseAuth.createUserWithEmailAndPassword(email, password);
    await result.user.updateProfile({ displayName: name });
    await firestore.collection('users').doc(result.user.uid).set({
      email,
      name,
      createdAt: Date.now(),
      lastLogin: Date.now()
    }, { merge: true });
    return result;
  }

  // ── Session helpers ─────────────────────────────────────────

  function getSession() {
    const user = firebaseAuth.currentUser;
    if (!user) return null;
    return {
      uid:      user.uid,
      email:    user.email,
      name:     user.displayName || user.email.split('@')[0],
      photoURL: user.photoURL,
      authType: user.providerData[0]?.providerId === 'google.com' ? 'google' : 'local'
    };
  }

  function isAuthenticated() {
    return !!firebaseAuth.currentUser;
  }

  /** Wait for Firebase Auth to resolve, redirect to login if not authenticated or not whitelisted */
  function requireAuth() {
    return new Promise(resolve => {
      const unsub = firebaseAuth.onAuthStateChanged(async (user) => {
        unsub();
        if (!user) {
          window.location.href = 'login.html';
          resolve(null);
        } else {
          try {
            await enforceWhitelist(user);
            resolve({
              uid:      user.uid,
              email:    user.email,
              name:     user.displayName || user.email.split('@')[0],
              photoURL: user.photoURL,
              authType: user.providerData[0]?.providerId === 'google.com' ? 'google' : 'local'
            });
          } catch (e) {
            window.location.href = 'login.html';
            resolve(null);
          }
        }
      });
    });
  }

  function logout() {
    return firebaseAuth.signOut().then(() => {
      window.location.href = 'login.html';
    });
  }

  // ── Legacy compat (no-op — pages that call these won't break) ──
  function handleCallback() { return Promise.resolve(false); }
  function getValidToken()  { return Promise.resolve(null); }
  function initTokenClient() { return false; }

  return {
    login, loginWithEmail, register,
    getSession, isAuthenticated, requireAuth, logout,
    isWhitelisted,
    handleCallback, getValidToken, initTokenClient,
  };
})();
