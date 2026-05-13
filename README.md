# Muthu Printers Mobile

This repository is a pnpm + Turborepo JavaScript monorepo for a React Native mobile app package and an Express/Node.js API package.

The repo uses plain JavaScript ESM modules. Runtime contracts are enforced with small shared packages, JSDoc where useful, and zod for request validation.

## Layout

```text
apps/
  mobile/       React Native JavaScript app
  api/          Express/Node.js API

packages/
  api-client/   Shared fetch-based API client
  config/       Shared configuration package placeholder
  contracts/    Runtime constants and JSDoc contracts
  errors/       Shared application error classes
  logger/       Shared logger with sensitive metadata sanitization
  ui/           Shared UI package placeholder
  validation/   Shared zod validation middleware

tooling/
  eslint/       Shared JavaScript ESLint flat configs
```

## Commands

Run commands from the repository root:

```sh
pnpm dev
pnpm build
pnpm lint
pnpm typecheck
pnpm test
pnpm format
pnpm clean
```

`typecheck` is a no-op in JavaScript packages unless a package adds a lightweight validation step later.

## API

The API lives in `apps/api` and runs directly from JavaScript source:

```sh
pnpm --filter @app/api dev
pnpm --filter @app/api start
```

Available endpoints:

- `GET /health`
- `POST /echo` example endpoint using shared zod validation

## API Client

The React Native app can use `@repo/api-client` to call the API without depending on Express or React:

```js
import { createApiClient } from "@repo/api-client";

const api = createApiClient({
  baseUrl: "http://localhost:4000",
  getToken: async () => "optional-auth-token",
  timeoutMs: 10000
});

const health = await api.getHealth();
const echoed = await api.echo("hello");
```

## Mobile App

The React Native app lives in `apps/mobile` and uses JavaScript/JSX:

```sh
pnpm --filter @app/mobile start
pnpm --filter @app/mobile android
pnpm --filter @app/mobile ios
```

The local API base URL is configured in `apps/mobile/src/config/env.js`. Android emulators use `http://10.0.2.2:4000` to reach an API running on the host machine.

## Shared Tooling

ESLint flat configs are published from `@repo/eslint-config`:

```js
import config from "@repo/eslint-config/base";

export default config;
```

Use `@repo/eslint-config/node` for Node.js/backend packages and `@repo/eslint-config/react-native` for React Native packages.

## Workspace

pnpm discovers packages from:

- `apps/*`
- `packages/*`
- `tooling/*`

Turborepo orchestrates `dev`, `build`, `lint`, `typecheck`, `test`, and `clean` across workspace packages.
