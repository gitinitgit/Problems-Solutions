# DSA Tracker (MERN + Gatsby)

630 LeetCode problems across 21 weeks, with a dashboard, weekly tracker, concept/theory modules, solution markdown editor, secure authentication, and cloud sync with MongoDB.

## Run

### 1. Backend Server (Express + MongoDB)
```bash
npm run server       # Starts API server on http://localhost:5000
```
Configure your MongoDB connection string in `server/.env` (defaults to `mongodb://localhost:27017/dsa-tracker` or MongoDB Atlas).

### 2. Frontend (Gatsby)
```bash
npm install
npm run develop      # http://localhost:8000
npm run build
```

## Features & Architecture

- **Landing Page & Authentication**:
  - Top Gun hero landing page at `/landing/` with responsive Login and Sign Up.
  - Secure bcrypt password hashing with 12 salt rounds.
  - JWT session tokens stored exclusively in **`httpOnly`, `SameSite` secure cookies** (never exposed to JavaScript or localStorage).
  - Rate limiting, Helmet security headers, CORS origin whitelisting, and strict validation.
  - `ProtectedRoute` wrapper guarding all dashboard, tracker, solutions, and concept views.

- **Cloud Sync**:
  - Automatically synchronizes questions solved, notes, solutions, drafts, revision rounds, and study history to MongoDB.
  - Real-time debounced auto-sync as you solve problems and write notes.
  - Instant cloud save when posting solutions with visual cloud status badges (`☁️ Cloud`).
  - Seamless offline fallback with `localStorage` persistence.

## Where things are
- `server/` – Express API backend with User & TrackerData Mongoose models, auth routes, and data sync controllers.
- `src/pages/landing.js` – Top Gun landing page with login/signup interface.
- `src/components/ProtectedRoute.js` – Authentication route guard for protected pages.
- `src/context/AuthContext.js` – Global authentication state and session management.
- `src/hooks/useTracker.js` – Progress and notes state with bi-directional cloud sync.
- `src/pages/solution.js` – Interactive markdown split-view solution and notes workspace with cloud autosave.
- `content/questions.json` – All questions (topics + weekly plans).

