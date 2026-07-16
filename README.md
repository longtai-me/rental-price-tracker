# Rental Price Tracker

**透明化租屋實價資料系統** — 可自行架設的社群驅動租屋行情平台。

讓租客、房東、平台業者都能透過群眾外包的方式，共同建立一個公開、透明的台灣租屋實價資料庫。

---

## 功能特色

| 功能 | 說明 |
|---|---|
| 🗺️ 互動地圖 | 以 Leaflet 地圖瀏覽各地租屋資訊，支援地圖邊界自動篩選 |
| 🔍 多條件篩選 | 城市、區域、房型、坪數、租金、設備、交通、性別限制 |
| 📝 刊登申請 | 使用者主動提交租屋實價，含水電費、管理費、合約上傳 |
| ✅ 管理員審核 | 後台一鍵核准/退件/封存/刪除，附存取紀錄與異常通知 |
| 📊 行情分析 | 以 Recharts 顯示區域租金分佈與趨勢 |
| 🛡️ 人機驗證 | Cloudflare Turnstile 保護查詢與提交 |
| 🔒 安全機制 | IP 存取紀錄、異常閾值告警、蜜罐登入偵測 |
| 📄 合約存儲 | 租約文件上傳至 Cloudflare R2，僅管理員可審閱 |

---

## 技術架構

- **前端框架**：Next.js 14 App Router + React 18
- **部署平台**：Cloudflare Pages（`@cloudflare/next-on-pages`）
- **資料庫**：Cloudflare D1（SQLite Edge）
- **檔案儲存**：Cloudflare R2
- **地圖**：Leaflet / React Leaflet
- **圖表**：Recharts
- **人機驗證**：Cloudflare Turnstile

---

## 快速開始（本機開發）

```bash
npm install
npm run dev
```

開啟 [http://localhost:3000](http://localhost:3000)

---

## 完整架設說明

請參閱 **[SETUP_GUIDE.md](./SETUP_GUIDE.md)** — 含 Cloudflare 帳號申請、D1 資料庫建立、R2 設定、環境變數配置、Pages 部署完整步驟。

---

## 環境變數

所有密鑰請設定於 Cloudflare Pages 環境變數，**不要寫入程式碼**。

| 變數名稱 | 用途 |
|---|---|
| `ADMIN_PASSWORD` | 管理員審核/退件/封存 |
| `REMOVE_PASSWORD` | 移除已發布資料 |
| `EDIT_PASSWORD` | 編輯資料 |
| `SUPER_ADMIN_PASSWORD` | 完整管理權限含硬刪除 |
| `ADMIN_ALERT_TO_EMAIL` | 異常告警收件信箱 |
| `ADMIN_ALERT_FROM_EMAIL` | 告警寄件信箱（需通過 Cloudflare Email 驗證） |
| `ADMIN_ALERT_FROM_NAME` | 告警寄件人名稱（選填） |
| `ADMIN_REQUEST_ALERT_THRESHOLD` | IP 請求閾值（預設 10 次/小時） |

---

## 購買與授權

本系統提供以下方案：

### 方案 A：一次性買斷
- 完整原始碼授權（單一部署站台）
- 含 **1 年免費問題排除支援**
- 聯絡：[me@longtai.me](mailto:me@longtai.me)

### 方案 B：月訂閱
- 完整原始碼授權
- 訂閱期間享部分免費問題排除
- 可加購付費客製化服務
- 聯絡：[me@longtai.me](mailto:me@longtai.me)

---

## 管理後台存取記錄

開啟 `/admin` 及管理 API 呼叫皆會記錄 IP 至 D1 `admin_access_logs`，不對外公開。同一 IP 於一小時內達到設定閾值時，透過 Cloudflare Email Service 發送通知。

---

## 安全性說明

- `.env*` 和 `*.pem` 均已列入 `.gitignore`
- `wrangler.toml` 僅含 Cloudflare Binding 名稱與基礎設定，**不含任何密鑰**
- 所有密碼均透過環境變數傳入後端，前端不含任何有效密碼

發現安全漏洞請參閱 [SECURITY.md](./SECURITY.md)，勿直接開公開 Issue。

---

## 授權

MIT License. 詳見 [LICENSE](./LICENSE)。
