# Contributing

Thanks for helping improve Rental Price Tracker.

## Local Development

```bash
npm install
npm run dev
```

Before opening a pull request:

```bash
npm run lint
npm run build
```

## Pull Request Guidelines

- Keep changes focused and explain user-facing behavior changes.
- Do not commit secrets, `.env` files, private keys, production database dumps, or uploaded contract files.
- Include D1 schema or migration changes when changing persisted data.
- Preserve privacy protections for exact addresses, contract files, and admin access logs.

## Code Style

- Follow the existing Next.js App Router structure under `src/app`.
- Prefer small route handlers and shared helpers for cross-cutting behavior.
- Keep UI copy in Traditional Chinese unless the surrounding file clearly uses English.
