# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Start the dev server (choose platform interactively)
npm start

# Start on a specific platform
npm run ios
npm run android
npm run web

# Lint
npm run lint

# Build for TestFlight / App Store submission
npm run deploy:ios
```

**Firebase Cloud Functions** (run from `functions/` directory):

```bash
npm run build   # TypeScript compile
npm run serve   # Local emulator
npm run deploy  # Deploy to Firebase
npm run logs    # Stream function logs
```

There is no test suite in this project.

## Environment Setup

Copy `.env.example` to `.env` and fill in Firebase credentials (`EXPO_PUBLIC_FIREBASE_*`). All env vars use the `EXPO_PUBLIC_` prefix to be accessible in the React Native bundle.

## Architecture

**Expo Router** (file-based routing) with a tab layout:

- `app/_layout.tsx` — root layout; wraps everything in `AuthProvider`, handles auth redirects, and calls `fetchTricks` on auth state change
- `app/(tabs)/` — four tabs: All Tricks, Learning (IN_PROGRESS), Done (COMPLETED), Profile
- `app/login.tsx`, `app/register.tsx`, `app/verify-email.tsx` — public auth screens

**State management** is a single Zustand store (`store/trickStore.ts`) with `AsyncStorage` persistence. The store holds all `Trick` objects (metadata merged with per-user status) and exposes `fetchTricks`, `updateTrickStatus`, and `addTrick`. Status updates are optimistic—rolled back via re-fetch on failure.

**Firebase backend:**

- `lib/firebase.ts` — initialises Firebase app, exports `auth` and `db` (Firestore)
- `context/AuthContext.tsx` — wraps `onAuthStateChanged`; exposes `user`, `loading`, `signOut`
- `functions/src/index.ts` — two callable Cloud Functions:
  - `getTricks` — returns all public tricks plus the authenticated user's private tricks
  - `addTrick` — creates a user-owned private trick; always sets `isPublic: false`
- Firestore collections: `tricks` (trick metadata) and `user_tricks` (per-user progress, doc id `{userId}_{trickId}`)

**Data flow:** `fetchTricks(userId)` calls the `getTricks` Cloud Function for trick metadata, then queries `user_tricks` directly from the client to merge status. The combined `Trick[]` is stored in Zustand and persisted to AsyncStorage.

**UI components:**

- `TrickGrid` — `FlashList`-backed responsive grid; manages `TrickDetailModal` open/close state; uses `memo` on `TrickGridItem`
- `TrickCardContent` — renders a single card with `SpriteIcon` + trick info
- `SpriteIcon` — crops `assets/images/skate-sprites-multicolor.png` (6×5 sprite sheet) using a clipped `Image`; index mapping is in `utils/trickIcons.ts`
- `TrickDetailModal` — detail view with status action buttons
- `TrickDirectory` — searchable/filterable list (used on the All Tricks tab)
- `AddTrickModal` — form for creating custom tricks

**Theming:** `constants/AppTheme.ts` defines `COLORS` (dark neon palette), `NeonTheme` (React Navigation theme), and `neonGlow`/`textGlow` helpers for cross-platform glow effects. NativeWind (Tailwind) is configured for utility classes; custom colours are mapped via `tailwind.config.js`.

**Path aliases:** `@/` maps to the project root (configured in `tsconfig.json` and `babel.config.js`).

## Deployment Notes (from README)

Before shipping to the App Store:

1. Restrict the Firebase API key to the bundle ID `com.justinleggett.skateboard` in Google Cloud Console
2. Ensure Firestore security rules are deployed via the Firebase Console

## Pre-Launch Issue Tracker

The canonical list of outstanding work for App Store submission lives outside this repo in Obsidian:

`~/Documents/obsidian/skateboarding-app/pre-launch-issues.md`

It is grouped by severity (🛑 blockers, ⚠️ definitely fix, 🧰 should fix, ✅ done) and ends with a suggested fix order. When the user says "work through pre-launch issues" or references an issue number (e.g. "issue #3"), read that file first. Update the file as items complete so it stays the source of truth — do not duplicate the list into this repo.

Related: the BOLTS marketing site and legal pages (`/privacy`, `/terms`) are hosted on **Netlify** at `boltsapp.app`, in a separate repo. Don't add hosting config to this repo's `firebase.json`.
