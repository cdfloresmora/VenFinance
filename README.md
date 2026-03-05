# VenFinance

**Personal finance tracker for Venezuela** — Track expenses, income, and exchange rates with real-time currency data.

<p align="center">
  <img src="assets/icons/icon-192.png" alt="VenFinance Logo" width="96" />
</p>

VenFinance is an installable Progressive Web App (PWA) built for Venezuelans who manage finances across multiple exchange rates (BCV, parallel, personal). It calculates the true cost of every expense in three dimensions: Bolivares, official USD, and real USD.

## Features

- **Expense tracking** — Record expenses in Bs, USD, or EUR with automatic multi-rate conversion
- **Income management** — Track income sources with BCV-rate conversion to Bolivares
- **Exchange rates** — Fetch live BCV/parallel rates from DolarAPI; log personal purchase rates
- **Dashboard analytics** — Monthly balance, budget progress, category breakdown, and charts
- **Dollar purchases** — Register currency exchanges and track your Bolivar balance
- **Recurring expenses** — Manage subscriptions and fixed monthly costs
- **Budget goals** — Set monthly USD limits with visual progress tracking
- **Offline-first** — Full functionality without internet; syncs when back online
- **Installable PWA** — Works as a native app on Android, iOS, and desktop
- **Dark/Light mode** — System-matching themes with manual toggle
- **Bilingual** — Complete Spanish and English localization (i18n)
- **Google Sheets export** — Optional data export via Sheets API

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Vanilla JavaScript, HTML5, CSS3 (custom properties) |
| Backend | Firebase (Auth, Firestore, offline persistence) |
| Auth | Google OAuth 2.0 + Email/Password |
| Data | Firestore NoSQL with cross-tab sync |
| Rates API | [DolarAPI](https://ve.dolarapi.com) (BCV & parallel rates) |
| Charts | [Chart.js](https://www.chartjs.org/) 4.x |
| Fonts | [Sora](https://fonts.google.com/specimen/Sora) + [JetBrains Mono](https://fonts.google.com/specimen/JetBrains+Mono) |
| PWA | Service Worker (network-first), Web Manifest |
| Export | Google Sheets API v4 (optional) |

## Project Structure

```
VenFinance/
├── index.html            # Main page — expense form + recent transactions
├── login.html            # Authentication (Google / Email+Password)
├── dashboard.html        # Analytics — balance, charts, monthly summary
├── ingresos.html         # Income tracking
├── rates.html            # Exchange rates + dollar purchase log
├── style.css             # Design system — variables, components, responsive
├── css/
│   └── global.css        # Dynamic theme & font classes
├── js/
│   └── settings.js       # i18n, theme, font preference manager
├── auth.js               # Firebase Auth wrapper (VF.Auth)
├── db.js                 # Firestore CRUD wrapper (VF.DB)
├── calc.js               # Financial calculation engine (VF.Calc)
├── sheets.js             # Google Sheets API integration (VF.Sheets)
├── firebase-config.js    # Firebase project initialization
├── sw.js                 # Service Worker — caching & offline
├── sync.js               # Background sync stub
├── manifest.json         # PWA manifest
└── assets/
    └── icons/            # PWA icons (192, 512, apple-touch)
```

## Getting Started

### Prerequisites

- A [Firebase](https://console.firebase.google.com) project
- A web server (or any static hosting: GitHub Pages, Vercel, Netlify, Firebase Hosting)

### Firebase Setup

1. Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable **Authentication** providers:
   - Google Sign-In
   - Email/Password
3. Create a **Firestore Database** in production mode
4. Set Firestore **Security Rules**:
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
5. Go to **Project Settings > General > Your apps > Add web app**
6. Copy the config object into `firebase-config.js`

### Local Development

```bash
# Clone the repository
git clone https://github.com/cdfloresmora/VenFinance.git
cd VenFinance

# Serve with any static server
npx serve .
# or
python3 -m http.server 8080
```

Open `http://localhost:8080` (or your server's port) in a browser.

### Deploy

VenFinance is a static site — deploy to any hosting provider:

```bash
# Firebase Hosting
firebase init hosting
firebase deploy

# GitHub Pages
git push origin main  # enable Pages in repo settings

# Netlify / Vercel
# Just connect the repo — zero config needed
```

## Architecture

VenFinance uses a modular namespace pattern under `VF.*`:

| Module | Namespace | Purpose |
|--------|-----------|---------|
| `auth.js` | `VF.Auth` | Login, logout, session management |
| `db.js` | `VF.DB` | Firestore CRUD for all collections |
| `calc.js` | `VF.Calc` | Expense conversion, budget math |
| `sheets.js` | `VF.Sheets` | Google Sheets read/write |
| `settings.js` | `VFSettings` | Theme, font, language preferences |

### Data Model (Firestore)

All data is scoped per user under `users/{uid}/`:

| Collection | Purpose |
|-----------|---------|
| `gastos` | Expense records |
| `ingresos` | Income records |
| `cambios` | Dollar purchase transactions |
| `tasas` | Exchange rate history (keyed by date) |
| `presupuestos` | Monthly budget goals |
| `recurring` | Recurring expenses / subscriptions |
| `config` | User configuration (spreadsheet ID, etc.) |

### Three-Dimensional Expense Tracking

Every expense is calculated in three values:

1. **Monto en Bs** — Actual Bolivares spent
2. **USD Oficial** — Equivalent at the official BCV rate
3. **USD Real** — True cost based on your personal purchase rate

This lets you see the real purchasing power advantage of buying dollars at better-than-official rates.

## Security

See [SECURITY.md](SECURITY.md) for the full security model and best practices.

Key points:
- Firebase Security Rules enforce per-user data isolation
- Authentication via Firebase Auth (Google OAuth + Email/Password)
- Content Security Policy (CSP) headers on all pages
- HTTPS enforcement in production
- No sensitive data stored in localStorage
- Service Worker uses network-first caching strategy

## License

This project is private. All rights reserved.
