# Jiraffe — Project Guide (CONTINUE.md)

> This guide helps developers (and AI assistants) understand and work with the **Jiraffe** project.
> Status: Generated from the current state of the codebase. Some sections are initial assumptions and may need verification.

---

## 1. Project Overview

**Jiraffe** is a front-end web application built with **React 19** and **Vite**. Currently it is set up as an interactive landing/"Get started" page that demonstrates the Vite + React toolchain with Hot Module Replacement (HMR).

### Key Technologies

- **React 19** — UI library (component model, hooks, declarative rendering).
- **Vite 8** — build tool & dev server (fast HMR, ESM-first).
- **JavaScript (JSX)** — project language; no TypeScript configured yet.
- **ESLint 10** — linting with the `react-hooks` and `react-refresh` plugins.
- **CSS (with nesting)** — plain CSS files (`App.css`, `index.css`) using modern CSS features (CSS nesting, `@media`, custom properties/variables).

### High-Level Architecture

The app is a **single-page application** with a very simple structure:

```
index.html  ──▶  src/main.jsx  ──▶  src/App.jsx  ──▶  renders sections
                      │
                      └── imports global styles (index.css)
App.jsx  ── imports styles (App.css) + static assets (img/svg)
```

There is currently **no routing, state-management library, backend, or tests** — the application is a minimal starting point.

---

## 2. Getting Started

### Prerequisites

- **Node.js** (a recent LTS version; Vite 8 requires a modern Node).
- A package manager: **npm** (used in this repo, `package-lock.json` committed).
- (Recommended) An editor with ESLint support (VS Code / WebStorm).

### Installation

```bash
# 1. Clone / navigate into the project
cd jiraffe

# 2. Install dependencies
npm install
```

### Running the Dev Server

```bash
npm run dev
```

This starts Vite with `--host`, so the app is available on your local network.
By default Vite prints the URL (usually `http://localhost:5173`).

### Production Build

```bash
npm run build     # outputs to dist/
npm run preview   # preview the production build locally
```

### Linting

```bash
npm run lint
```

Runs ESLint over the whole project.

> **Note:** No test framework is configured. Running tests is not currently applicable.

---

## 3. Project Structure

```
jiraffe/
├── index.html            # HTML entry point; mounts #root and loads /src/main.jsx
├── package.json          # project metadata, scripts, dependencies
├── package-lock.json     # locked dependency versions (npm)
├── vite.config.js        # Vite configuration (React plugin)
├── eslint.config.js      # flat ESLint configuration
├── .gitignore            # ignored files/folders (node_modules, dist, etc.)
├── README.md             # standard Vite README
├── public/               # static assets served at the root path
│   ├── favicon.svg       # browser tab icon
│   └── icons.svg         # SVG sprite referenced via <use href="/icons.svg#...">
└── src/
    ├── main.jsx          # React entry: renders <App/> into #root (StrictMode)
    ├── App.jsx           # root component; holds page sections & counter state
    ├── App.css           # component-level styles for App
    ├── index.css         # global styles, CSS variables, theming (light/dark)
    └── assets/           # imported images/SVGs (hero.png, react.svg, vite.svg)
```

### Key Files & Their Roles

| File | Role |
|------|------|
| `src/main.jsx` | Bootstrap — creates React root and renders `<App>` in `<StrictMode>`. |
| `src/App.jsx` | Root component; defines UI sections and the `useState` counter. |
| `src/index.css` | Global theme: CSS custom properties (`--accent`, `--bg`, etc.) and light/dark scheme. |
| `src/App.css` | Styles for `App` layout: hero, counter button, next-steps sections. |
| `vite.config.js` | Configures Vite with the React plugin. |
| `eslint.config.js` | Flat-config ESLint rules for JS/JSX. |

---

## 4. Development Workflow

### Coding Conventions

- **Components** are defined as function components named with PascalCase (e.g. `App`).
- **Props/state** use the standard React hooks pattern (`useState`).
- **Assets** are imported as ES modules so Vite can emit/optimize them (e.g. `import heroImg from './assets/hero.png'`).
- **Styles** live in standard `.css` files; global styles in `index.css`, component-specific in matching `.css` files.
- **SVG icons** are referenced from the sprite via `<use href="/icons.svg#id">`.
- Use **semantic HTML** and accessible attributes (`role`, `aria-hidden`) where relevant.

### Testing Approach

- No automated tests are currently configured.
- Verification is manual — run `npm run dev` and check the UI in-browser.

### Build & Deployment

- Dev: `npm run dev`
- Production bundle: `npm run build` → outputs to `dist/`
- Local preview of build: `npm run preview`
- Deployment pipeline: not configured (no CI/CD files present).

### Contribution Guidelines

- Keep components small and focused; extract reusable pieces when a section grows.
- Run `npm run lint` before committing and keep the output clean.
- Follow the existing structure (styles in `.css`, images in `src/assets`, static files in `public`).

---

## 5. Key Concepts

- **Vite Dev Server & HMR** — editing a component re-renders it instantly without a full page reload.
- **StrictMode** — React's development-only wrapper that helps surface potential issues (double-invokes effects/render in dev).
- **CSS custom properties / theming** — `index.css` defines tokens like `--accent` and switches palette for `prefers-color-scheme: dark`.
- **SVG sprite** — icons are stored once in `icons.svg` and reused with `<use>`.
- **Counter state demo** — `App` uses `useState` to demonstrate interactive state (`Count is {n}`).

---

## 6. Common Tasks

### Add a new component

1. Create the file, e.g. `src/MyComponent.jsx`.
2. Export a function component:

   ```jsx
   function MyComponent({ title }) {
     return <h2>{title}</h2>
   }
   export default MyComponent
   ```

3. Import and use it in `App.jsx`:

   ```jsx
   import MyComponent from './MyComponent.jsx'
   // ...
   <MyComponent title="Hello" />
   ```

4. Optionally create `src/MyComponent.css` and import it in the component file.

### Add a new static asset / icon

- **Image:** place it in `src/assets/` and `import` it in code.
- **Icon:** add the symbol to `public/icons.svg`, then reference it with `<use href="/icons.svg#your-id">`.

### Add/change a style token (theme)

1. Open `src/index.css` under `:root`.
2. Add or adjust a variable, e.g. `--accent: #aa3bff;`.
3. Use it in component CSS: `color: var(--accent);`.
4. Also update the `prefers-color-scheme: dark` block if a dark-mode value is needed.

### Run a clean build

```bash
rm -rf dist && npm run build
```

---

## 7. Troubleshooting

| Symptom | Likely cause / fix |
|---------|--------------------|
| `npm run dev` fails / Vite not found | `node_modules` missing → run `npm install`. |
| Port already in use | Vite will pick another port; or stop the process using `:5173`. |
| ESLint errors on commit | Run `npm run lint`, fix reported issues (unused vars, hooks deps, etc.). |
| Images/logos not updating | Ensure assets are imported and are in `src/assets` (not just static refs). |
| Styling looks different | `prefers-color-scheme: dark` changes colors automatically; check OS theme. |

> **Note:** These are general Vite/React troubleshooting entries. If you encounter project-specific issues not listed here, they are not yet documented and should be added.

---

## 8. References

- [Vite Documentation](https://vite.dev/)
- [Vite React plugin (`@vitejs/plugin-react`)](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react)
- [React Documentation](https://react.dev/)
- [React Hooks API Reference](https://react.dev/reference/react)
- [Vite Create Templates (`template-react`)](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react)
- [ESLint flat config guide](https://eslint.org/docs/latest/use/configure/configuration-files)

---

> **⚠️ Needs verification:** This project currently has the default Vite starter template content. As real features are added (routing, API integrations, backend, tests, deployment), update this guide to reflect the actual architecture, workflows, and project-specific conventions.