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
//          match /app/whitelist {
//            allow read: if request.auth != null;
//          }
//          match /users/{userId}/{document=**} {
//            allow read, write: if request.auth != null && request.auth.uid == userId;
//          }
//        }
//      }
// 6. Project Settings → General → Your apps → Add web app → Copy config below


// Enforce HTTPS in production
if (location.protocol !== 'https:' && location.hostname !== 'localhost' && location.hostname !== '127.0.0.1') {
  location.replace('https:' + location.href.substring(location.protocol.length));
}

const firebaseConfig = {
  apiKey:            "AIzaSyDnSZXOjHqb3fpDYY-_gbYulApomeAXRVo",
  authDomain:        "venfinance-62592.firebaseapp.com",
  projectId:         "venfinance-62592",
  storageBucket:     "venfinance-62592.firebasestorage.app",
  messagingSenderId: "954306771476",
  appId:             "1:954306771476:web:886c506175d5d0c4590501"
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
