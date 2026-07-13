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

## Run with Docker Compose

Inventory can run next to the local Hekatoncheiros Core compose stack. Start Core first,
then run:

```bash
docker compose up -d --build
```

The app joins the `hekatoncheiros-core_default` Docker network and exposes:

- app base URL inside the Core network: `http://inventory:4010`
- host health URL: `http://localhost:4010/health`

For local install through Core, add `http://inventory:4010` as a trusted origin,
then fetch/install the manifest from that base URL.

Compose intentionally reads `INVENTORY_DATABASE_URL` instead of the plain
local-development `DATABASE_URL`, so a host `.env` can point to `localhost`
without breaking the container. Installer token settings should match Core;
set `INVENTORY_INSTALLER_TOKEN_SECRET` explicitly, or let Compose fall back to
the shared `INSTALLER_TOKEN_SECRET` from `.env`.

The container builds both the backend and `dist-plugin/plugin.js`, and the backend
applies its app schema migrations during startup.

## Runtime package for Core

Core can build and start Inventory from an application catalog entry without restarting
the Core and web containers. Create the package and expose it over HTTP for local testing:

```bash
npm run package:runtime
npm run serve:runtime-package
```

The package and its checksum are written to `dist/runtime-package`. A Core container can
reach the local package server at
`http://host.docker.internal:4020/hc-app-inventory-runtime.tar.gz`. Add
`http://host.docker.internal:4020` to Core's trusted app origins before using local HTTP.

The same server exposes a ready-to-sync development catalog at
`http://host.docker.internal:4020/.well-known/hc/app-catalog.json`. It includes the
non-running app manifest, package URL, and generated checksums, so Core can discover
Inventory before its runtime exists. Set `RUNTIME_PACKAGE_PUBLIC_BASE_URL` when building
the package to generate URLs for a different package host.

Use the checksum printed by `npm run package:runtime` in the catalog deployment metadata:

```json
{
  "type": "compose",
  "package_url": "http://host.docker.internal:4020/hc-app-inventory-runtime.tar.gz",
  "package_sha256": "<SHA-256 FROM THE BUILD>",
  "compose_file": "docker-compose.app.yml",
  "service_name": "inventory",
  "internal_base_url": "http://inventory:4010"
}
```

The runtime Compose file deliberately publishes no host port. Inventory is reachable by
Core through the shared `hekatoncheiros-core_default` network. Test package download first
with install mode `stage_only` and `stage_package: true`; then enable
`APP_RUNTIME_DOCKER_ENABLED` and use install mode `compose`.

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
