# Nx Monorepo Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convert the standalone Angular 21 + Spartacus app into an Nx monorepo workspace with the app source under `apps/storefrontapp/`.

**Architecture:** Install `nx` and `@nx/angular` as devDeps, create `nx.json` manually, move source files with `git mv`, and update all config path references. No source file content changes — only config files are edited. No `nx init` is run (avoids unexpected file mutations).

**Tech Stack:** Nx 21.x, `@nx/angular` 21.x, Angular CLI 21, npm

## Global Constraints

- App folder name: `storefrontapp` (used as Nx project name and BFF `$name`)
- App source path: `apps/storefrontapp/src/`
- Build output path: `./dist/apps/storefrontapp`
- Required build command: `npm run build:storefrontapp`
- Required SSR startup: `node spa.mjs` from `dist/apps/storefrontapp/server/`
- Do NOT run `nx init` — all Nx wiring is done manually
- Do NOT modify any `.ts`, `.html`, or `.scss` source file contents
- Use `git mv` for all file moves to preserve git history
- `node_modules/`, `dist/`, `package-lock.json` stay at root — never move them
- No `project.json` — project stays defined in `angular.json`

---

### Task 1: Install Nx dependencies and create `nx.json`

**Files:**
- Modify: `package.json`
- Create: `nx.json`

**Interfaces:**
- Produces: Nx workspace root — `nx` CLI available, `nx.json` present

- [ ] **Step 1: Install nx and @nx/angular as devDependencies**

  ```bash
  npm install --save-dev nx@~21.0.0 @nx/angular@~21.0.0
  ```

  Expected: `package.json` devDependencies now contain `"nx": "~21.0.0"` and `"@nx/angular": "~21.0.0"`. No errors.

- [ ] **Step 2: Create `nx.json` at the repo root**

  Create `/nx.json` with this exact content:

  ```json
  {
    "$schema": "./node_modules/nx/schemas/nx-schema.json",
    "defaultBase": "main",
    "targetDefaults": {
      "build": {
        "cache": true
      },
      "test": {
        "cache": true
      }
    }
  }
  ```

- [ ] **Step 3: Verify nx CLI is available**

  ```bash
  npx nx --version
  ```

  Expected: prints a version string like `21.x.x` with no errors.

- [ ] **Step 4: Commit**

  ```bash
  git add package.json package-lock.json nx.json
  git commit -m "feat: add nx and @nx/angular dependencies"
  ```

---

### Task 2: Move source files into `apps/storefrontapp/`

**Files:**
- Move: `src/` → `apps/storefrontapp/src/`
- Move: `public/` → `apps/storefrontapp/public/`
- Move: `tsconfig.app.json` → `apps/storefrontapp/tsconfig.app.json`
- Move: `tsconfig.spec.json` → `apps/storefrontapp/tsconfig.spec.json`

**Interfaces:**
- Produces: `apps/storefrontapp/` directory with all app source files

- [ ] **Step 1: Create the apps/storefrontapp directory and move files**

  ```bash
  mkdir -p apps/storefrontapp
  git mv src apps/storefrontapp/src
  git mv public apps/storefrontapp/public
  git mv tsconfig.app.json apps/storefrontapp/tsconfig.app.json
  git mv tsconfig.spec.json apps/storefrontapp/tsconfig.spec.json
  ```

- [ ] **Step 2: Verify the moves**

  ```bash
  ls apps/storefrontapp/
  ```

  Expected output:
  ```
  public  src  tsconfig.app.json  tsconfig.spec.json
  ```

  ```bash
  ls apps/storefrontapp/src/
  ```

  Expected output includes: `app  index.html  main.server.ts  main.ts  server.ts  styles.scss  styles-config.scss  styles`

- [ ] **Step 3: Commit**

  ```bash
  git add apps/
  git commit -m "feat: move app source into apps/storefrontapp"
  ```

---

### Task 3: Update `tsconfig.app.json` and `tsconfig.spec.json`

**Files:**
- Modify: `apps/storefrontapp/tsconfig.app.json`
- Modify: `apps/storefrontapp/tsconfig.spec.json`

**Interfaces:**
- Consumes: files moved in Task 2
- Produces: tsconfig files with correct relative paths from their new location

- [ ] **Step 1: Update `apps/storefrontapp/tsconfig.app.json`**

  Replace the entire file content with:

  ```json
  {
    "extends": "../../tsconfig.json",
    "compilerOptions": {
      "outDir": "../../out-tsc/app",
      "types": [
        "node"
      ]
    },
    "include": [
      "src/**/*.ts"
    ],
    "exclude": [
      "src/**/*.spec.ts"
    ]
  }
  ```

- [ ] **Step 2: Update `apps/storefrontapp/tsconfig.spec.json`**

  Replace the entire file content with:

  ```json
  {
    "extends": "../../tsconfig.json",
    "compilerOptions": {
      "outDir": "../../out-tsc/spec",
      "types": [
        "vitest/globals"
      ]
    },
    "include": [
      "src/**/*.d.ts",
      "src/**/*.spec.ts"
    ]
  }
  ```

- [ ] **Step 3: Update root `tsconfig.json` references**

  In `tsconfig.json`, replace the `references` array:

  Before:
  ```json
  "references": [
    { "path": "./tsconfig.app.json" },
    { "path": "./tsconfig.spec.json" }
  ]
  ```

  After:
  ```json
  "references": [
    { "path": "./apps/storefrontapp/tsconfig.app.json" },
    { "path": "./apps/storefrontapp/tsconfig.spec.json" }
  ]
  ```

- [ ] **Step 4: Commit**

  ```bash
  git add apps/storefrontapp/tsconfig.app.json apps/storefrontapp/tsconfig.spec.json tsconfig.json
  git commit -m "feat: update tsconfig paths for apps/storefrontapp layout"
  ```

---

### Task 4: Update `angular.json` for new project layout

**Files:**
- Modify: `angular.json`

**Interfaces:**
- Consumes: file moves from Task 2, tsconfig paths from Task 3
- Produces: Angular build, serve, and test targets all pointing to `apps/storefrontapp/`

- [ ] **Step 1: Replace `angular.json` with updated content**

  Replace the entire `angular.json` with:

  ```json
  {
    "$schema": "./node_modules/@angular/cli/lib/config/schema.json",
    "version": 1,
    "cli": {
      "packageManager": "npm"
    },
    "newProjectRoot": "projects",
    "projects": {
      "storefrontapp": {
        "projectType": "application",
        "schematics": {
          "@schematics/angular:component": {
            "style": "scss",
            "type": "component",
            "addTypeToClassName": false
          },
          "@schematics/angular:directive": {
            "type": "directive",
            "addTypeToClassName": false
          },
          "@schematics/angular:service": {
            "type": "service",
            "addTypeToClassName": false
          },
          "@schematics/angular:guard": {
            "typeSeparator": "."
          },
          "@schematics/angular:interceptor": {
            "typeSeparator": "."
          },
          "@schematics/angular:module": {
            "typeSeparator": "."
          },
          "@schematics/angular:pipe": {
            "typeSeparator": "."
          },
          "@schematics/angular:resolver": {
            "typeSeparator": "."
          }
        },
        "root": "apps/storefrontapp",
        "sourceRoot": "apps/storefrontapp/src",
        "prefix": "app",
        "architect": {
          "build": {
            "builder": "@angular/build:application",
            "options": {
              "outputPath": "./dist/apps/storefrontapp",
              "browser": "apps/storefrontapp/src/main.ts",
              "polyfills": [
                "zone.js"
              ],
              "tsConfig": "apps/storefrontapp/tsconfig.app.json",
              "inlineStyleLanguage": "scss",
              "assets": [
                {
                  "glob": "**/*",
                  "input": "apps/storefrontapp/public"
                },
                {
                  "glob": "**/*",
                  "input": "./node_modules/@spartacus/smartedit/assets",
                  "output": "assets/"
                }
              ],
              "styles": [
                "apps/storefrontapp/src/styles.scss",
                "apps/storefrontapp/src/styles/spartacus/user.scss",
                "apps/storefrontapp/src/styles/spartacus/cart.scss",
                "apps/storefrontapp/src/styles/spartacus/order.scss",
                "apps/storefrontapp/src/styles/spartacus/checkout.scss",
                "apps/storefrontapp/src/styles/spartacus/storefinder.scss",
                "apps/storefrontapp/src/styles/spartacus/asm.scss",
                "apps/storefrontapp/src/styles/spartacus/product.scss"
              ],
              "stylePreprocessorOptions": {
                "includePaths": [
                  "node_modules/"
                ],
                "sass": {
                  "silenceDeprecations": [
                    "import"
                  ]
                }
              },
              "server": "apps/storefrontapp/src/main.server.ts",
              "security": {
                "allowedHosts": []
              },
              "ssr": {
                "entry": "apps/storefrontapp/src/server.ts"
              },
              "prerender": false
            },
            "configurations": {
              "production": {
                "budgets": [
                  {
                    "type": "initial",
                    "maximumWarning": "500kB",
                    "maximumError": "3.5mb"
                  },
                  {
                    "type": "anyComponentStyle",
                    "maximumWarning": "4kB",
                    "maximumError": "8kB"
                  }
                ],
                "outputHashing": "all"
              },
              "development": {
                "optimization": false,
                "extractLicenses": false,
                "sourceMap": true
              },
              "noSsr": {
                "ssr": false,
                "prerender": false
              }
            },
            "defaultConfiguration": "production"
          },
          "serve": {
            "builder": "@angular/build:dev-server",
            "configurations": {
              "production": {
                "buildTarget": "storefrontapp:build:production,noSsr"
              },
              "development": {
                "buildTarget": "storefrontapp:build:development,noSsr"
              }
            },
            "defaultConfiguration": "development"
          },
          "test": {
            "builder": "@angular/build:unit-test",
            "options": {
              "tsConfig": "apps/storefrontapp/tsconfig.spec.json",
              "stylePreprocessorOptions": {
                "includePaths": [
                  "node_modules/"
                ],
                "sass": {
                  "silenceDeprecations": [
                    "import"
                  ]
                }
              },
              "styles": [
                "apps/storefrontapp/src/styles/spartacus/user.scss",
                "apps/storefrontapp/src/styles/spartacus/cart.scss",
                "apps/storefrontapp/src/styles/spartacus/order.scss",
                "apps/storefrontapp/src/styles/spartacus/checkout.scss",
                "apps/storefrontapp/src/styles/spartacus/storefinder.scss",
                "apps/storefrontapp/src/styles/spartacus/asm.scss",
                "apps/storefrontapp/src/styles/spartacus/product.scss"
              ],
              "assets": [
                {
                  "glob": "**/*",
                  "input": "./node_modules/@spartacus/smartedit/assets",
                  "output": "assets/"
                }
              ]
            }
          }
        }
      }
    }
  }
  ```

- [ ] **Step 2: Commit**

  ```bash
  git add angular.json
  git commit -m "feat: update angular.json for storefrontapp layout"
  ```

---

### Task 5: Update `package.json` scripts and verify build

**Files:**
- Modify: `package.json`

**Interfaces:**
- Consumes: all path and project name changes from Tasks 1–4
- Produces: `npm run build:storefrontapp` produces `dist/apps/storefrontapp/server/spa.mjs`

- [ ] **Step 1: Update scripts in `package.json`**

  Replace the `scripts` section with:

  ```json
  "scripts": {
    "ng": "ng",
    "start": "ng serve",
    "build": "ng build storefrontapp",
    "build:storefrontapp": "ng build storefrontapp && mv dist/apps/storefrontapp/server/server.mjs dist/apps/storefrontapp/server/spa.mjs",
    "watch": "ng build storefrontapp --watch --configuration development",
    "test": "ng test storefrontapp",
    "serve:ssr:storefrontapp": "node dist/apps/storefrontapp/server/spa.mjs",
    "build:ssr": "ng build storefrontapp"
  }
  ```

- [ ] **Step 2: Run the build**

  ```bash
  npm run build:storefrontapp
  ```

  Expected: build completes successfully, last output line contains:
  ```
  Output location: .../dist/apps/storefrontapp
  ```

- [ ] **Step 3: Verify output structure**

  ```bash
  ls dist/apps/storefrontapp/server/ | grep -v chunk
  ```

  Expected output includes `spa.mjs`. Verify `server.mjs` is absent:

  ```bash
  ls dist/apps/storefrontapp/server/server.mjs 2>&1
  ```

  Expected: `No such file or directory`

- [ ] **Step 4: Smoke-test SSR startup**

  ```bash
  node dist/apps/storefrontapp/server/spa.mjs &
  sleep 2
  curl -s -o /dev/null -w "%{http_code}" http://localhost:4000
  kill %1
  ```

  Expected: HTTP status `200`.

- [ ] **Step 5: Commit**

  ```bash
  git add package.json
  git commit -m "feat: update scripts for storefrontapp nx project name"
  ```
