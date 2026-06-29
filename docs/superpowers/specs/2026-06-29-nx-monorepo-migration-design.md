# Nx Monorepo Migration Design

## Overview

Convert the existing standalone Angular 21 + Spartacus app into an Nx monorepo workspace. The app source moves from the repo root into `apps/storefrontapp/`. No shared libraries are created — this is a minimal structural migration only.

**Approach:** Manually install `nx` + `@nx/angular` devDeps, create `nx.json` by hand, then relocate files using `git mv`. We do NOT run `nx init` (it can modify files unexpectedly); instead every change is explicit and reviewable.

---

## Target Structure

```
my-spartacus-app-standalone/        ← Nx workspace root
├── nx.json                          ← new: minimal Nx config
├── package.json                     ← updated: nx + @nx/angular devDeps, updated scripts
├── angular.json                     ← updated: paths point into apps/storefrontapp/
├── tsconfig.json                    ← updated: references point into apps/storefrontapp/
├── apps/
│   └── storefrontapp/
│       ├── tsconfig.app.json        ← moved from root, paths updated
│       ├── tsconfig.spec.json       ← moved from root, paths updated
│       ├── public/                  ← moved from root
│       └── src/                     ← moved from root src/
│           ├── index.html
│           ├── main.ts
│           ├── main.server.ts
│           ├── server.ts
│           ├── styles.scss
│           ├── styles-config.scss
│           ├── styles/
│           └── app/
└── dist/
    └── apps/
        └── storefrontapp/           ← output path updated from my-spartacus-app-standalone
```

---

## Configuration Changes

### `nx.json` (new)

Minimal Nx config:
- `defaultBase: "main"`
- Nx caching enabled for `build`, `test`, `serve` targets
- `@nx/angular` plugin registered

### `package.json`

**devDependencies to add:**
- `nx`: `~21.0.0`
- `@nx/angular`: `~21.0.0`

**Scripts to update:**
- Rename `build:my-spartacus-app-standalone` → `build:storefrontapp`
  - Value: `nx build storefrontapp && mv dist/apps/storefrontapp/server/server.mjs dist/apps/storefrontapp/server/spa.mjs`
- Rename `serve:ssr:my-spartacus-app-standalone` → `serve:ssr:storefrontapp`
  - Value: `node dist/apps/storefrontapp/server/spa.mjs`
- Keep `build` script as-is (`ng build`) for generic use

**BFF Orchestrator alignment:** `$name` = `storefrontapp` (folder name), so `npm run build:storefrontapp` is the required build command.

### `angular.json`

Project `my-spartacus-app-standalone` entry updates:
- `root`: `""` → `"apps/storefrontapp"`
- `sourceRoot`: `"src"` → `"apps/storefrontapp/src"`
- `options.outputPath`: `"./dist/apps/my-spartacus-app-standalone"` → `"./dist/apps/storefrontapp"`
- `options.browser`: `"src/main.ts"` → `"apps/storefrontapp/src/main.ts"`
- `options.server`: `"src/main.server.ts"` → `"apps/storefrontapp/src/main.server.ts"`
- `options.ssr.entry`: `"src/server.ts"` → `"apps/storefrontapp/src/server.ts"`
- `options.tsConfig`: `"tsconfig.app.json"` → `"apps/storefrontapp/tsconfig.app.json"`
- `options.styles`: all `src/styles*` paths prefixed with `apps/storefrontapp/`
- `options.assets`: `"input": "public"` → `"input": "apps/storefrontapp/public"`; smartedit asset stays pointing to `node_modules/`
- `test.options.tsConfig`: `"tsconfig.spec.json"` → `"apps/storefrontapp/tsconfig.spec.json"`
- `test.options.styles`: all `src/styles*` paths prefixed with `apps/storefrontapp/`
- `test.options.assets`: smartedit asset path unchanged (node_modules)

No `project.json` is created — project stays defined in `angular.json`.

### `tsconfig.json` (root)

Update `references`:
- `"./tsconfig.app.json"` → `"./apps/storefrontapp/tsconfig.app.json"`
- `"./tsconfig.spec.json"` → `"./apps/storefrontapp/tsconfig.spec.json"`

### `apps/storefrontapp/tsconfig.app.json`

- `extends`: `"../../tsconfig.json"`
- `compilerOptions.outDir`: `"../../out-tsc/app"`
- `include`: `["src/**/*.ts"]`
- `exclude`: `["src/**/*.spec.ts"]`

### `apps/storefrontapp/tsconfig.spec.json`

- `extends`: `"../../tsconfig.json"`
- `compilerOptions.outDir`: `"../../out-tsc/spec"`
- `include`: `["src/**/*.d.ts", "src/**/*.spec.ts"]`

---

## File Moves (via `git mv`)

| From | To |
|------|----|
| `src/` | `apps/storefrontapp/src/` |
| `public/` | `apps/storefrontapp/public/` |
| `tsconfig.app.json` | `apps/storefrontapp/tsconfig.app.json` |
| `tsconfig.spec.json` | `apps/storefrontapp/tsconfig.spec.json` |

Source file contents (`.ts`, `.html`, `.scss`) are **not modified** — all app-internal imports are relative and remain valid after the move.

---

## Constraints

- No shared libraries created
- No `project.json` — project remains in `angular.json`
- No source file content changes — only moves
- `server.ts` runtime path resolution (`../browser`, `index.server.html`) is relative to build output, not source — no changes needed
- `git mv` used for all moves to preserve git history
- `node_modules/` and `dist/` stay at root, not moved

---

## BFF Orchestrator Alignment (Post-Migration)

| Requirement | Value |
|---|---|
| Build command | `npm run build:storefrontapp` |
| Output directory | `./dist/apps/storefrontapp` |
| SSR entrypoint | `dist/apps/storefrontapp/server/spa.mjs` |
| SSR startup | `node spa.mjs` |
