# Build Command Standardization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Align the Spartacus app's build configuration with the BFF Orchestrator SPA conventions: named build script, standardized output directory, and `spa.mjs` SSR entrypoint.

**Architecture:** Three config-only changes — add a named npm script, set the Angular output path, and rename the SSR server entry to `spa.mjs`. No source code changes required; all changes are in `package.json` and `angular.json`.

**Tech Stack:** Angular CLI 21, `@angular/build:application` builder, npm scripts

## Global Constraints

- Project name (used as `$name`): `my-spartacus-app-standalone`
- Required build command: `npm run build:my-spartacus-app-standalone`
- Required output directory: `./dist/apps/my-spartacus-app-standalone`
- Required SSR startup: `node spa.mjs` (must be named `spa.mjs` inside the server output folder)
- Do not remove the existing `build` script — keep it alongside the new one
- Do not change any source `.ts` files

---

### Task 1: Add named build script to package.json

**Files:**
- Modify: `package.json`

**Interfaces:**
- Produces: `npm run build:my-spartacus-app-standalone` — runs `ng build` with no extra flags (production is already the default configuration in `angular.json`)

- [ ] **Step 1: Open `package.json` and add the named script**

  In the `"scripts"` section, add one line after the existing `"build"` entry:

  ```json
  "build:my-spartacus-app-standalone": "ng build"
  ```

  The `scripts` block should look like this afterwards:

  ```json
  "scripts": {
    "ng": "ng",
    "start": "ng serve",
    "build": "ng build",
    "build:my-spartacus-app-standalone": "ng build",
    "watch": "ng build --watch --configuration development",
    "test": "ng test"
  }
  ```

- [ ] **Step 2: Verify the script is callable**

  Run:
  ```bash
  npm run build:my-spartacus-app-standalone -- --help
  ```
  Expected: Angular CLI build help text printed (no "missing script" error).

- [ ] **Step 3: Commit**

  ```bash
  git add package.json
  git commit -m "feat: add named build script build:my-spartacus-app-standalone"
  ```

---

### Task 2: Set output directory to `./dist/apps/my-spartacus-app-standalone`

**Files:**
- Modify: `angular.json`

**Interfaces:**
- Consumes: named build script from Task 1
- Produces: build output at `./dist/apps/my-spartacus-app-standalone/` (with `browser/` and `server/` subdirectories inside)

- [ ] **Step 1: Add `outputPath` to the build options in `angular.json`**

  In `angular.json`, under `projects > my-spartacus-app-standalone > architect > build > options`, add:

  ```json
  "outputPath": "./dist/apps/my-spartacus-app-standalone"
  ```

  The `options` block opening should look like this afterwards:

  ```json
  "options": {
    "outputPath": "./dist/apps/my-spartacus-app-standalone",
    "browser": "src/main.ts",
    ...
  }
  ```

- [ ] **Step 2: Run the build and verify the output location**

  ```bash
  npm run build:my-spartacus-app-standalone
  ```

  Expected last line of output:
  ```
  Output location: /path/to/my-spartacus-app-standalone/dist/apps/my-spartacus-app-standalone
  ```

  Also verify:
  ```bash
  ls dist/apps/my-spartacus-app-standalone/
  ```
  Expected: `browser/  server/  3rdpartylicenses.txt  prerendered-routes.json`

- [ ] **Step 3: Commit**

  ```bash
  git add angular.json
  git commit -m "feat: set build output path to dist/apps/my-spartacus-app-standalone"
  ```

---

### Task 3: Rename SSR server entry to `spa.mjs`

**Files:**
- Modify: `angular.json`

**Interfaces:**
- Consumes: output directory from Task 2
- Produces: `dist/apps/my-spartacus-app-standalone/server/spa.mjs` — the SSR entrypoint startable with `node spa.mjs`

**Background:** By default `@angular/build:application` names the SSR server bundle after the `entry` filename (`server.ts` → `server.mjs`). Setting `"outputMode": "server"` and providing an explicit `"externalDependencies"` is not needed — the builder supports overriding the output filename via the `ssr.outputFile` option (available in `@angular/build` ≥ 17.3).

- [ ] **Step 1: Add `outputFile` to the `ssr` config in `angular.json`**

  Locate the `ssr` block under `projects > my-spartacus-app-standalone > architect > build > options`:

  Before:
  ```json
  "ssr": {
    "entry": "src/server.ts"
  }
  ```

  After:
  ```json
  "ssr": {
    "entry": "src/server.ts",
    "outputFile": "spa.mjs"
  }
  ```

- [ ] **Step 2: Run the build**

  ```bash
  npm run build:my-spartacus-app-standalone
  ```

  Expected: build succeeds (same warnings about budget/CommonJS as before are fine).

- [ ] **Step 3: Verify `spa.mjs` is the only `.mjs` entrypoint in the server folder**

  ```bash
  ls dist/apps/my-spartacus-app-standalone/server/*.mjs | grep -v chunk
  ```

  Expected output includes `spa.mjs`. Verify `server.mjs` is gone:
  ```bash
  ls dist/apps/my-spartacus-app-standalone/server/server.mjs 2>&1
  ```
  Expected: `No such file or directory`

- [ ] **Step 4: Smoke-test SSR startup**

  ```bash
  cd dist/apps/my-spartacus-app-standalone/server && node spa.mjs
  ```

  Expected: `Node Express server listening on http://localhost:4000` (Ctrl-C to stop).

- [ ] **Step 5: Commit**

  ```bash
  git add angular.json
  git commit -m "feat: rename SSR server bundle to spa.mjs"
  ```
