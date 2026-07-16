# Rental Price Tracker — 架設說明手冊

> 適用對象：個人開發者、房產平台業者  
> 聯絡支援：[me@longtai.me](mailto:me@longtai.me)

---

## 目錄

1. [系統需求](#系統需求)
2. [前置準備：Cloudflare 帳號](#前置準備cloudflare-帳號)
3. [步驟一：取得程式碼](#步驟一取得程式碼)
4. [步驟二：建立 D1 資料庫](#步驟二建立-d1-資料庫)
5. [步驟三：建立 R2 儲存桶](#步驟三建立-r2-儲存桶)
6. [步驟四：設定 wrangler.toml](#步驟四設定-wranglertoml)
7. [步驟五：設定環境變數](#步驟五設定環境變數)
8. [步驟六：設定 Turnstile 人機驗證](#步驟六設定-turnstile-人機驗證)
9. [步驟七：部署至 Cloudflare Pages](#步驟七部署至-cloudflare-pages)
10. [步驟八：設定 Email 告警（選填）](#步驟八設定-email-告警選填)
11. [本機開發環境](#本機開發環境)
12. [管理員後台使用說明](#管理員後台使用說明)
13. [常見問題 FAQ](#常見問題-faq)
14. [注意事項](#注意事項)

---

## 系統需求

| 項目 | 需求 |
|---|---|
| Node.js | ≥ 18.x |
| npm | ≥ 9.x |
| Wrangler CLI | ≥ 4.x（`npm i -g wrangler`）|
| Cloudflare 帳號 | 免費方案即可 |
| Git | 任意版本 |

---

## 前置準備：Cloudflare 帳號

1. 前往 [dash.cloudflare.com](https://dash.cloudflare.com) 註冊或登入
2. 記下您的 **Account ID**（右側欄 > 帳戶首頁）
3. 在本機執行登入：

```bash
npx wrangler login
```

瀏覽器會自動跳出授權頁面，允許後即完成。

---

## 步驟一：取得程式碼

```bash
# 解壓縮購買的程式碼包，或從提供的 Git 倉庫 clone
git clone <您收到的 repo URL> my-rental-tracker
cd my-rental-tracker
npm install
```

---

## 步驟二：建立 D1 資料庫

### 2-1. 建立資料庫

```bash
npx wrangler d1 create rental_db
```

執行後會顯示類似：

```
✅ Successfully created DB 'rental_db'
database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
```

**記下這個 `database_id`**，下一步會用到。

### 2-2. 匯入資料庫結構

```bash
# 全新安裝（第一次建立）
npx wrangler d1 execute rental_db --file=schema.sql --remote

# 舊有資料庫升級（若已有資料）
npx wrangler d1 execute rental_db --file=migrations/0001_utilities_and_admin_access_logs.sql --remote
```

---

## 步驟三：建立 R2 儲存桶

R2 用來儲存使用者上傳的租約合約文件。

```bash
npx wrangler r2 bucket create rental-contracts
```

> ⚠️ **注意**：Cloudflare R2 免費方案每月有 10 GB 免費儲存量與 1000 萬次免費讀取。  
> 超過後將按用量計費，請視網站規模評估。

---

## 步驟四：設定 wrangler.toml

開啟 `wrangler.toml`，將 `database_id` 替換為您在步驟二取得的值：

```toml
name = "rental-price-tracker"
compatibility_date = "2024-03-20"
compatibility_flags = ["nodejs_compat"]
pages_build_output_dir = ".vercel/output/static"

[[d1_databases]]
binding = "DB"
database_name = "rental_db"
database_id = "您的-database-id-填在這裡"   # ← 替換這行

[[r2_buckets]]
binding = "R2_CONTRACTS"
bucket_name = "rental-contracts"
```

---

## 步驟五：設定環境變數

所有密碼與密鑰均透過 **Cloudflare Pages 環境變數** 設定，**請勿寫入程式碼**。

### 5-1. 前往 Pages 設定

Cloudflare Dashboard → Workers & Pages → 您的專案 → Settings → Environment Variables

### 5-2. 必填變數

| 變數名稱 | 說明 | 範例 |
|---|---|---|
| `ADMIN_PASSWORD` | 審核/退件/封存操作密碼 | 設定一組強密碼 |
| `REMOVE_PASSWORD` | 移除已發布資料的密碼 | 設定一組強密碼 |
| `EDIT_PASSWORD` | 編輯資料密碼 | 設定一組強密碼 |
| `SUPER_ADMIN_PASSWORD` | 完整管理權限（含硬刪除） | 設定最強密碼 |

### 5-3. Email 告警變數（選填）

| 變數名稱 | 說明 |
|---|---|
| `ADMIN_ALERT_TO_EMAIL` | 收到告警通知的信箱 |
| `ADMIN_ALERT_FROM_EMAIL` | 寄出告警的信箱（需 Cloudflare Email 驗證）|
| `ADMIN_ALERT_FROM_NAME` | 寄件人名稱（選填，預設 `Rental Tracker Alert`）|
| `ADMIN_REQUEST_ALERT_THRESHOLD` | 每小時 IP 請求上限（預設 `10`）|

### 5-4. Turnstile 相關

| 變數名稱 | 說明 |
|---|---|
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Cloudflare Turnstile Site Key（公開） |

> `TURNSTILE_SECRET_KEY` 若有後端驗證需求，請同步設定。

---

## 步驟六：設定 Turnstile 人機驗證

1. 前往 [Cloudflare Dashboard → Turnstile](https://dash.cloudflare.com/?to=/:account/turnstile)
2. 點擊「Add site」
3. 填入您的網站域名（例如 `rental.yourdomain.com`）
4. 選擇「Managed」模式
5. 取得 **Site Key** 與 **Secret Key**

### 6-1. 本機開發設定

建立 `.env.local`（此檔案已列入 .gitignore，不會被提交）：

```bash
NEXT_PUBLIC_TURNSTILE_SITE_KEY=您的-site-key
```

### 6-2. 生產環境

將 `NEXT_PUBLIC_TURNSTILE_SITE_KEY` 加入 Cloudflare Pages 環境變數（Production）。

---

## 步驟七：部署至 Cloudflare Pages

### 方法 A：連接 GitHub 自動部署（推薦）

1. 將程式碼推送到 GitHub / GitLab
2. Cloudflare Dashboard → Workers & Pages → Create → Pages → Connect to Git
3. 選擇您的 repository
4. Build 設定：
   - **Build command**：`npm run pages:build`
   - **Build output directory**：`.vercel/output/static`
5. 點擊「Save and Deploy」
6. 之後每次 push 到 main 分支，自動觸發重新部署

### 方法 B：手動部署

```bash
npm run pages:build
npx wrangler pages deploy .vercel/output/static --project-name=rental-price-tracker
```

---

## 步驟八：設定 Email 告警（選填）

當同一 IP 於一小時內存取管理後台超過閾值次數，系統會寄送告警信。

### 8-1. 啟用 Cloudflare Email Routing

```bash
npx wrangler email sending enable yourdomain.com
npx wrangler email sending dns get yourdomain.com
```

依指示在 DNS 加入對應 TXT/MX 記錄。

### 8-2. 設定環境變數

將 `ADMIN_ALERT_FROM_EMAIL`（例如 `alerts@yourdomain.com`）填入已驗證的寄件地址。

### 8-3. 在 wrangler.toml 加入 Email Binding

```toml
[[send_email]]
binding = "EMAIL"
```

---

## 本機開發環境

```bash
# 安裝依賴
npm install

# 複製環境變數範本
cp .env.example .env.local
# 編輯 .env.local，填入您的 Turnstile Site Key

# 啟動開發伺服器
npm run dev
```

> ⚠️ **本機限制**：本機開發模式使用 Next.js Dev Server，無法直接連接 Cloudflare D1/R2。  
> 要測試完整功能，請使用 `wrangler pages dev`：

```bash
npm run pages:build
npx wrangler pages dev .vercel/output/static
```

---

## 管理員後台使用說明

### 進入後台

前往 `/admin`，完成 Turnstile 人機驗證後輸入管理員密碼（對應 `ADMIN_PASSWORD` 環境變數）。

### 功能說明

| 功能 | 對應密碼 | 說明 |
|---|---|---|
| 審核通過 | `ADMIN_PASSWORD` | 將待審核資料設為公開 |
| 退件 | `ADMIN_PASSWORD` | 將資料退回，不公開 |
| 封存 | `ADMIN_PASSWORD` | 隱藏但保留資料 |
| 移除 | `REMOVE_PASSWORD` | 從公開列表移除 |
| 編輯資料 | `EDIT_PASSWORD` | 修改欄位內容 |
| 硬刪除 | `SUPER_ADMIN_PASSWORD` | 永久從資料庫刪除 |

### 存取記錄

所有進入 `/admin` 及管理 API 的請求均記錄 IP 至 `admin_access_logs`，不對外公開。

---

## 常見問題 FAQ

### Q: 部署後頁面空白？
確認 `wrangler.toml` 的 `database_id` 已正確設定，且 D1 資料庫結構已匯入。

### Q: 提交資料後沒有出現在管理後台？
檢查 API Route 是否正常連接 D1，可查看 Cloudflare Pages → Functions → 日誌。

### Q: R2 合約上傳失敗？
確認 R2 Bucket 名稱與 `wrangler.toml` 中 `bucket_name` 一致，且 R2 已啟用。

### Q: Email 告警沒有收到？
確認 `ADMIN_ALERT_FROM_EMAIL` 已通過 Cloudflare Email 驗證，且 wrangler.toml 有 `[[send_email]]` binding。

### Q: Turnstile 驗證一直失敗？
確認 `.env.local` 或 Pages 環境變數中的 `NEXT_PUBLIC_TURNSTILE_SITE_KEY` 與您在 Turnstile Dashboard 建立的 Site Key 完全一致。

### Q: 本機開發時資料庫連不上？
本機需使用 `npx wrangler pages dev` 才能連接遠端 D1，或使用 `--local` 模式建立本機 D1。

---

## 注意事項

> [!WARNING]
> **資料庫安全**：請妥善保管 Cloudflare API Token 和所有密碼。切勿將 `.env.local` 或任何密鑰提交至 Git。

> [!IMPORTANT]
> **密碼強度**：四組密碼（ADMIN/REMOVE/EDIT/SUPER_ADMIN）建議各自不同，且長度至少 32 字元，使用混合大小寫、數字、符號。

> [!NOTE]
> **wrangler.toml 說明**：`wrangler.toml` 含有您的 D1 database_id 與 R2 bucket 名稱，這些是 **Cloudflare 基礎設施識別碼，非密鑰**，但建議不要公開此檔案。

> [!CAUTION]
> **備份資料**：D1 資料庫目前不支援自動備份，建議定期匯出資料：
> ```bash
> npx wrangler d1 export rental_db --output=backup_$(date +%Y%m%d).sql --remote
> ```

---

## 聯絡支援

- 📧 Email：[me@longtai.me](mailto:me@longtai.me)
- 🕐 服務時間：週一至週五，UTC+8 09:00–18:00
- 一次性買斷方案含 **1 年免費問題排除支援**
- 月訂閱方案含訂閱期間部分免費問題排除
