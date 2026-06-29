# Frontend Architecture

This document describes the design, folder structures, layouts, context managers, and UI components of the **TerraSpotter** React frontend. This content is structured for inclusion in Chapter 4 (System Design) and Chapter 6 (Implementation) of the project documentation.

---

## 1. Folder Structure

The frontend is built using React 19, structured around a component-based layout:

```text
frontend/src/
├── assets/             # Vector graphics, logo icons, and background SVGs
├── components/         # Reusable application components
│   ├── ui/             # Core UI components (button, card, input)
│   ├── ChatUI.jsx      # Agentic AI chatbot dialogue panel
│   ├── Navbar.jsx      # Sticky responsive navigation component
│   └── Protection/     # Route guards
├── context/            # React Contexts for global state
│   ├── ThemeContext.js # Handles dark/light theme state
│   └── UserContext.js  # Authenticated session and profile context
├── layouts/            # Page templates (e.g., MainLayout.jsx)
├── lib/                # Utility helpers
├── locales/            # Localization dictionary files (en, hi, mr, de, es)
├── pages/              # Mapped view components (Home, Browse, Forum, etc.)
├── App.jsx             # Main routing map
├── main.jsx            # Entry point loading context and i18n
└── i18n.js             # Internationalization engine configuration
```

---

## 2. Routing Architecture & Access Guards

The application uses **React Router DOM** (v7) to manage client-side routing.

### 2.1 Code Splitting (Lazy Loading)
To optimize initial page load performance, page files are loaded dynamically using React's `lazy` wrapper and rendering under a `<Suspense>` boundary containing a loading spinner component:
```javascript
const Browse = lazy(() => import("./pages/Browse"));
```

### 2.2 Access Guards (`ProtectedRoute.jsx`)
Private and administrative routes (like dashboard views, profile editors, and review feeds) are wrapped within a `<ProtectedRoute>` component.
- **Evaluation Mechanism:** The guard queries `UserContext`. If the user is unauthenticated, it redirects them to the `/login` route.
- **Admin Verification:** Routes like `/admin/pending` and `/lands/:id/verify` are further protected to ensure the user has the required admin permissions.

---

## 3. Global State Management & Context Providers

The application manages global state using React's built-in **Context API**:

### 3.1 User Context (`UserContext.jsx`)
- **State Tracked:** Active logged-in user profile, session validation status, and loading state.
- **Key Operations:**
  - `checkSession()`: Fetches the authenticated user profile from `/api/auth/session` on startup.
  - `login(email, password)`: Submits credentials to `/api/auth/login` and updates user state.
  - `logout()`: Clears local state and invalidates the session cookie via the backend.

### 3.2 Theme Context (`ThemeContext.jsx`)
- **State Tracked:** Visual mode theme (`light` or `dark`).
- **Key Operations:**
  - Persists preference in `localStorage` under the key `"theme"`.
  - Toggles classes dynamically on the root HTML document body.

---

## 4. API Integration Layer (Axios)

The frontend communicates with backend APIs using the **Axios** library. A pre-configured Axios instance handles all requests:

* **Session Persistence:** Configured with `withCredentials: true` to ensure the browser automatically transmits the session `JSESSIONID` cookie with every request.
* **Base URL Integration:** Resolves base target domains dynamically using environment variables (`import.meta.env.VITE_API_URL`).

---

## 5. Theme and Styling System (Vanilla CSS Variables)

Styling uses a combination of customized **Vanilla CSS variables** and modern CSS classes:
- **Design Tokens:** Base tokens (colors, border radii, shadows) are defined inside `index.css` using theme variables that map to specific styles in `light` and `dark` modes:
  ```css
  :root {
    --background: #ffffff;
    --text-primary: #111827;
  }
  .dark {
    --background: #0f172a;
    --text-primary: #f8fafc;
  }
  ```
- **Component Styling:** Primitives use standard variables, allowing themes to update dynamically.

---

## 6. Internationalization System (i18n)

The platform supports five languages to ensure accessibility for local farmers, surveyors, and coordinators:
1. **English** (`en.json`)
2. **Hindi** (`hi.json`)
3. **Marathi** (`mr.json`)
4. **Spanish** (`es.json`)
5. **German** (`de.json`)

### Core Setup (`i18n.js`)
The internationalization engine utilizes `i18next` with `react-i18next` and `i18next-browser-languagedetector`.
- **Language Switcher:** A reusable dropdown component (`LanguageSwitcher.jsx`) allows users to toggle languages instantly without reloading the page.
- **Language Detection:** Detects and saves preferences in the browser, falling back to English if no local translation is found.

---

## 7. Frontend Design Patterns Implemented

1. **State Pulling & Context Provider Pattern:** Encapsulates state changes within context wrappers (`UserContext`), exposing clean custom hooks (`useUser()`) to avoid prop drilling.
2. **Compound Component Primitives:** Core primitives (buttons, inputs, cards) are designed as modular components using libraries like `clsx` and `tailwind-merge` to compile dynamic CSS classes.
3. **Skeleton Loading Screens:** Lazy-loaded routes render clean skeleton loaders to improve the perceived performance during page transitions.
4. **Responsive Layout Grid:** Layouts use CSS Grid and Flexbox rules, adapting from desktop maps to mobile-first interfaces.
