# 租屋實價登錄 Tracker

透明化的台灣租屋實價登錄查詢與刊登系統。使用者可以提交實際租屋資訊，管理員審核後公開於地圖、列表與行情分析介面。

GitHub: [longtai-me/rental-price-tracker](https://github.com/longtai-me/rental-price-tracker)

## Features

- 租屋地圖查詢、價格篩選、坪數/房數/設備/交通條件篩選
- 租屋資訊提交與管理員審核流程
- 水電收費標準紀錄：含房租、台水台電、其他一般/夏季收費
- 租賃契約附件上傳至 Cloudflare R2
- Cloudflare D1 儲存租屋資料與隱藏的後台 access log
- `/admin` 開啟與後台 API 請求會記錄 IP，達門檻時可透過 Cloudflare Email Service 通知開發者

## Tech Stack

- Next.js 14 App Router
- React 18
- Cloudflare Pages / `@cloudflare/next-on-pages`
- Cloudflare D1
- Cloudflare R2
- Leaflet / React Leaflet
- Recharts

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Cloudflare Setup

`wrangler.toml` expects:

- D1 binding: `DB`
- R2 binding: `R2_CONTRACTS`
- Email binding: `EMAIL`

For a new database:

```bash
wrangler d1 execute rental_db --file=schema.sql
```

For an existing database, apply the migration:

```bash
wrangler d1 execute rental_db --file=migrations/0001_utilities_and_admin_access_logs.sql
```

## Environment Variables

Set secrets in Cloudflare Pages, not in committed files.

| Variable | Purpose |
| --- | --- |
| `ADMIN_PASSWORD` | Approve/reject/unarchive listings |
| `REMOVE_PASSWORD` | Remove published listings |
| `EDIT_PASSWORD` | Edit listing data |
| `SUPER_ADMIN_PASSWORD` | Full admin permissions, including hard delete |
| `ADMIN_ALERT_TO_EMAIL` | Developer notification recipient |
| `ADMIN_ALERT_FROM_EMAIL` | Verified Cloudflare Email sender |
| `ADMIN_ALERT_FROM_NAME` | Optional sender display name |
| `ADMIN_REQUEST_ALERT_THRESHOLD` | Optional threshold, defaults to `10` requests per IP per hour |

## Admin Access Logs

Opening `/admin` records a hidden D1 row in `admin_access_logs`. Admin API calls are recorded too. These logs are not exposed in the UI or public API. When the same IP reaches the configured request threshold within one hour, the app sends a notification through Cloudflare Email Service if `EMAIL`, `ADMIN_ALERT_TO_EMAIL`, and `ADMIN_ALERT_FROM_EMAIL` are configured.

## Cloudflare Email Setup

Onboard a sending domain first, then configure the sender address:

```bash
wrangler email sending enable yourdomain.com
wrangler email sending dns get yourdomain.com
```

Use a verified sender such as `alerts@yourdomain.com` for `ADMIN_ALERT_FROM_EMAIL`.

## Sensitive Information Check

The repository was scanned for common secret markers (`PASSWORD`, `TOKEN`, `KEY`, `SECRET`, private key headers, mail/API strings). No hard-coded credentials were found.

Notes:

- `.env*` and `*.pem` are ignored by `.gitignore`.
- `wrangler.toml` contains Cloudflare binding names, a D1 database id, and an R2 bucket name. These are infrastructure identifiers, not secret credentials.
- Uploaded contracts are stored in R2 and served only through the contract route.

Before publishing changes, run another scan:

```bash
rg -n "SECRET|PASSWORD|TOKEN|KEY|BEGIN|PRIVATE" -g '!node_modules' -g '!package-lock.json'
```

## Scripts

```bash
npm run dev
npm run build
npm run lint
npm run pages:build
```

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) before opening a pull request.

## Security

Please report vulnerabilities using the process in [SECURITY.md](SECURITY.md). Do not open public issues for sensitive reports.

## License

MIT. See [LICENSE](LICENSE).
