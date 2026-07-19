# Rental Price Tracker — AI / MCP 整合說明

## 概述

本專案已新增一個符合 **Model Context Protocol (MCP)** 標準的 HTTP endpoint，讓外部 AI 工具（如 Claude Desktop、Cursor、Windsurf、自架 Agent 等）能夠直接調用租屋資料，進行搜尋、推薦與分析。

- Endpoint：`https://tracker.longtai.org/api/ai/mcp`
- 傳輸方式：HTTP POST（JSON-RPC 2.0）
- 部署位置：Cloudflare Pages / Worker
- LLM 後端：Cloudflare Workers AI（`@cf/meta/llama-3.3-70b-instruct-fp8-fast`）

---

## 提供的 Tools

### 1. `search_rentals`

以結構化條件搜尋租屋物件。

**參數：**

| 欄位 | 類型 | 說明 |
|---|---|---|
| city | string | 縣市，例如 `台北市` |
| district | string | 區域，例如 `大安區` |
| minPrice | number | 最低月租 |
| maxPrice | number | 最高月租 |
| minArea | number | 最小坪數 |
| maxArea | number | 最大坪數 |
| rooms | integer | 房間數 |
| hasParking | boolean | 需要車位 |
| canPet | boolean | 允許寵物 |
| needsSubsidize | boolean | 可申請租屋補助 |
| needsHuji | boolean | 可遷戶籍 |
| verifiedOnly | boolean | 僅顯示已驗證物件 |
| limit | integer | 最大回傳筆數（預設 20，最大 100） |

**範例請求：**

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "search_rentals",
    "arguments": {
      "city": "台中市",
      "maxPrice": 10000,
      "canPet": true,
      "limit": 5
    }
  }
}
```

---

### 2. `get_rental_detail`

以 UUID 取得單一物件完整資料。

**參數：**

| 欄位 | 類型 | 說明 |
|---|---|---|
| id | string | 租屋物件 UUID |

**範例請求：**

```json
{
  "jsonrpc": "2.0",
  "id": 2,
  "method": "tools/call",
  "params": {
    "name": "get_rental_detail",
    "arguments": {
      "id": "5887d475-1a1c-4f63-8ba0-f153dd8a4c96"
    }
  }
}
```

---

### 3. `recommend_rentals`

根據自然語言偏好，由 Workers AI 推薦最適合的物件並給出理由。

**參數：**

| 欄位 | 類型 | 說明 |
|---|---|---|
| preferences | string | 自然語言需求描述（必填） |
| city | string | 縣市提示（選填） |
| maxPrice | number | 最高月租提示（選填） |
| limit | integer | 推薦筆數（預設 5，最大 20） |

**範例請求：**

```json
{
  "jsonrpc": "2.0",
  "id": 3,
  "method": "tools/call",
  "params": {
    "name": "recommend_rentals",
    "arguments": {
      "preferences": "我在找台中可以養貓、有車位、月租一萬以下的套房",
      "city": "台中市",
      "maxPrice": 10000,
      "limit": 3
    }
  }
}
```

**回傳結構：**

```json
{
  "total": 2,
  "recommendations": [
    {
      "id": "5887d475-1a1c-4f63-8ba0-f153dd8a4c96",
      "score": 8,
      "reason": "可養貓、月租6千",
      "concerns": "無車位"
    }
  ]
}
```

---

### 4. `analyze_rental`

針對單一物件進行 AI 分析，包含優缺點、租金合理性、適合度評分。

**參數：**

| 欄位 | 類型 | 說明 |
|---|---|---|
| id | string | 租屋物件 UUID（必填） |
| userPreferences | string | 使用者偏好上下文（選填） |

**範例請求：**

```json
{
  "jsonrpc": "2.0",
  "id": 4,
  "method": "tools/call",
  "params": {
    "name": "analyze_rental",
    "arguments": {
      "id": "5887d475-1a1c-4f63-8ba0-f153dd8a4c96",
      "userPreferences": "預算一萬以下、可以養貓、需要戶籍"
    }
  }
}
```

**回傳結構：**

```json
{
  "rental": { ... },
  "analysis": {
    "summary": "...",
    "pros": [...],
    "cons": [...],
    "priceFairness": "...",
    "suitabilityScore": 7,
    "warnings": [...]
  }
}
```

---

## 初始化與工具列表

### 初始化

```json
{
  "jsonrpc": "2.0",
  "id": 0,
  "method": "initialize",
  "params": {
    "protocolVersion": "2024-11-05",
    "capabilities": {},
    "clientInfo": { "name": "your-client", "version": "1.0.0" }
  }
}
```

### 取得工具列表

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/list"
}
```

---

## 部署設定

### wrangler.toml

已新增 Workers AI binding：

```toml
[ai]
binding = "AI"
```

無需 API key，費用由 Cloudflare 帳戶依 Workers AI 用量計費。

### package.json

已安裝相依套件：

- `@modelcontextprotocol/sdk`
- `zod`

---

## 測試指令

```bash
# 列出工具
curl -s -X POST https://tracker.longtai.org/api/ai/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'

# 推薦租屋
curl -s -X POST https://tracker.longtai.org/api/ai/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 2,
    "method": "tools/call",
    "params": {
      "name": "recommend_rentals",
      "arguments": {
        "preferences": "我在找台中可以養貓、有車位、月租一萬以下的套房",
        "city": "台中市",
        "maxPrice": 10000,
        "limit": 3
      }
    }
  }'
```

---

## 注意事項

1. **資料量**：目前資料庫僅有少量測試資料，推薦結果會隨資料增加而改善。
2. **Workers AI 計費**：`recommend_rentals` 與 `analyze_rental` 會調用 LLM，會產生 Workers AI 費用。
3. **SSE 支援**：GET `/api/ai/mcp` 目前為簡易 SSE endpoint，未來可擴充為完整 streaming MCP server。
4. **認證**：目前 endpoint 為公開。若需保護，建議新增 API key 或 Cloudflare Access。

---

## 未來擴充建議

- 加入 `compare_rentals` 工具，比較多個物件。
- 加入 `get_price_trends` 工具，回傳區域租金統計。
- 支援 MCP SSE streaming，讓 AI 工具即時接收結果。
- 加入 API key 認證與速率限制。
