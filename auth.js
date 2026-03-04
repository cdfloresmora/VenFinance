// auth.js — Firebase Auth for VenFinance (Google + Email/Password)
window.VF = window.VF || {};
VF.Auth = (() => {
  const googleProvider = new firebase.auth.GoogleAuthProvider();

  // ── Google Login (popup) ────────────────────────────────────
  async function login() {
    const result = await firebaseAuth.signInWithPopup(googleProvider);
    const user = result.user;
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
  function loginWithEmail(email, password) {
    return firebaseAuth.signInWithEmailAndPassword(email, password);
  }

  // ── Register ────────────────────────────────────────────────
  async function register(email, password, name) {
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

  /** Wait for Firebase Auth to resolve, redirect to login if not authenticated */
  function requireAuth() {
    return new Promise(resolve => {
      const unsub = firebaseAuth.onAuthStateChanged(user => {
        unsub();
        if (!user) {
          window.location.href = 'login.html';
          resolve(null);
        } else {
          resolve({
            uid:      user.uid,
            email:    user.email,
            name:     user.displayName || user.email.split('@')[0],
            photoURL: user.photoURL,
            authType: user.providerData[0]?.providerId === 'google.com' ? 'google' : 'local'
          });
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
    handleCallback, getValidToken, initTokenClient,
  };
})();
