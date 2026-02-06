# hc-app-inventory

> ⚠️ **Project status: Early development**
>
> This project is part of the Hekatoncheiros platform and is under active development.
> APIs, features, and internal architecture are not yet stable and may change.
> This repository is not production-ready.

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

### Database model (tenant DB + app schema)

Inventory uses the **tenant database** and isolates data in a fixed schema `app_inventory`.

Example `.env`:

```env
DATABASE_URL=postgres://hc_user:hc_password@localhost:5432/hc_core
```

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
