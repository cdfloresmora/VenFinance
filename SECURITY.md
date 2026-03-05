# Security

This document describes the security model, implemented protections, and best practices for VenFinance.

## Security Model

VenFinance is a client-side PWA backed by Firebase. All data operations go through Firebase Auth and Firestore, with security rules enforcing per-user isolation.

### Authentication

- **Providers**: Google OAuth 2.0, Email/Password (via Firebase Auth)
- **Session management**: Firebase Auth manages tokens internally — no manual token storage
- **Protected pages**: Every page (except `login.html`) calls `VF.Auth.requireAuth()` on load, redirecting unauthenticated users
- **Password policy**: Minimum 6 characters (Firebase default)

### Data Isolation (Firestore Rules)

All user data is scoped under `users/{uid}/` with the following rule:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

This ensures:
- Users can **only** access their own data
- All operations require authentication (`request.auth != null`)
- The authenticated user's UID must match the document path (`request.auth.uid == userId`)

### Transport Security

- **HTTPS enforcement**: `firebase-config.js` redirects HTTP to HTTPS in production (allows localhost for development)
- **Referrer policy**: `strict-origin-when-cross-origin` on all pages
- **External API calls**: All third-party APIs (Firebase, DolarAPI, Google) are accessed over HTTPS

### Content Security Policy (CSP)

All HTML pages include a CSP meta tag that restricts:

| Directive | Allowed Sources |
|-----------|----------------|
| `default-src` | `'self'` |
| `script-src` | `'self'`, Firebase SDK (`gstatic.com`), Chart.js CDN (where used) |
| `style-src` | `'self'`, `'unsafe-inline'`, Google Fonts |
| `font-src` | `'self'`, Google Fonts (`gstatic.com`) |
| `img-src` | `'self'`, `data:`, `https:` |
| `connect-src` | `'self'`, Firebase APIs, DolarAPI, Google Identity |
| `frame-src` | Google OAuth, Firebase Auth |
| `frame-ancestors` | `'none'` (prevents clickjacking) |
| `base-uri` | `'self'` |
| `form-action` | `'self'` |

### Client-Side Storage

| Storage | Data | Sensitive? |
|---------|------|-----------|
| localStorage | Font preference, theme, language | No |
| Firestore (local cache) | User expenses, income, rates | Yes (encrypted at rest by browser) |
| Service Worker cache | Static HTML/CSS/JS assets | No |

**No authentication tokens, passwords, or PII are stored in localStorage.**

### Input Validation

- **Settings** (`settings.js`): Font, theme, and language values are validated against allowlists before being applied to the DOM
- **Firestore**: All data passes through Firebase SDK which handles serialization safely
- **External API responses**: DolarAPI calls use `AbortSignal.timeout()` to prevent hanging

### Service Worker

- **Strategy**: Network-first for own assets, network-only for external APIs
- **Cache versioning**: Old caches are purged on activation (`vf-v7.3.0`)
- **API bypass**: Firebase, Google, and DolarAPI requests are never cached
- **Offline fallback**: Cached pages served when offline; navigation falls back to `login.html`

## Firebase API Key

The Firebase API key in `firebase-config.js` is **intentionally client-side**. This is the standard pattern for browser-based Firebase apps. The key alone cannot access data — all operations require:

1. A valid Firebase Auth session
2. Firestore Security Rules to pass

The API key is safe to commit because:
- It only identifies the Firebase project (like a project ID)
- Data access is controlled by Firestore Security Rules, not the API key
- Auth operations are protected by Firebase's built-in rate limiting

To add an extra layer of protection, consider enabling [Firebase App Check](https://firebase.google.com/docs/app-check).

## Reporting Vulnerabilities

If you discover a security vulnerability, please report it privately by contacting the project maintainer. Do not open a public issue.
