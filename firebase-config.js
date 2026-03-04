// firebase-config.js — Firebase initialization for VenFinance
//
// SETUP INSTRUCTIONS:
// 1. Go to https://console.firebase.google.com
// 2. Create a new project (or use existing)
// 3. Authentication → Sign-in method → Enable "Google" and "Email/Password"
// 4. Firestore Database → Create database → Start in production mode
// 5. Firestore → Rules → paste:
//      rules_version = '2';
//      service cloud.firestore {
//        match /databases/{database}/documents {
//          match /users/{userId}/{document=**} {
//            allow read, write: if request.auth != null && request.auth.uid == userId;
//          }
//        }
//      }
// 6. Project Settings → General → Your apps → Add web app → Copy config below

const firebaseConfig = {
  apiKey:            "YOUR_API_KEY",
  authDomain:        "YOUR_PROJECT.firebaseapp.com",
  projectId:         "YOUR_PROJECT_ID",
  storageBucket:     "YOUR_PROJECT.firebasestorage.app",
  messagingSenderId: "YOUR_SENDER_ID",
  appId:             "YOUR_APP_ID"
};

firebase.initializeApp(firebaseConfig);

// Firestore offline persistence (works across tabs)
firebase.firestore().enablePersistence({ synchronizeTabs: true })
  .catch(err => {
    if (err.code === 'failed-precondition') {
      console.warn('[Firebase] Persistence: multiple tabs open, only one can enable.');
    } else if (err.code === 'unimplemented') {
      console.warn('[Firebase] Persistence: not supported by this browser.');
    }
  });

// Global references used by auth.js and db.js
window.firestore    = firebase.firestore();
window.firebaseAuth = firebase.auth();
