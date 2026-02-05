# hc-app-inventory
Inventory application for the Hekatoncheiros platform.

Backend + UI plugin module for `app_inventory`.

## UI plugin (execution model)

This application **does not expose a standalone UI**. The UI is delivered as a plugin module
consumed by the Hekatoncheiros core web shell.

The UI plugin entrypoint lives in:

- `src/plugin.ts`

The plugin exports:

- `register(appContext)` – returns route declarations and navigation entries

The core shell is responsible for:

- routing
- authentication/session handling
- privilege evaluation

The UI communicates with the backend **only through the core-provided API client** (`appContext.api`).

## Run backend

```bash
cp .env.example .env
npm install
npm run dev
```

**Note:** `npm run db:migrate` expects `.env` to be present (DATABASE_URL is loaded via `dotenv`).

## Build UI plugin module

```bash
npm run build:plugin
```

The output is an ESM module in `dist-plugin/plugin.js`.

### Dev server (developer tool only)

You may use the Vite dev server for local development,
but it is **not** a user-facing frontend and is not required at runtime:

```bash
npm run dev:web
```

## Licensing

The source code of this application is licensed under the Apache 2.0 License.

Usage of the application is subject to runtime licensing
(enforced by the Hekatoncheiros core platform), including
limits on tenants, data volume, and features.
