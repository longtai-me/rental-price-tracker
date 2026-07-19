import { NextRequest, NextResponse } from 'next/server';
import { getRequestContext } from '@cloudflare/next-on-pages';
import { z } from 'zod';

export const runtime = 'edge';

interface Env {
  DB: any;
  AI: any;
}

// ─────────────────────────────────────────────────────────────
// MCP Protocol helpers
// ─────────────────────────────────────────────────────────────

const MCP_VERSION = '2024-11-05';

interface McpTool {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
}

interface McpRequest {
  jsonrpc: '2.0';
  id?: string | number | null;
  method: string;
  params?: any;
}

interface McpResponse {
  jsonrpc: '2.0';
  id?: string | number | null;
  result?: any;
  error?: { code: number; message: string; data?: any };
}

function mcpResult(id: string | number | null | undefined, result: any): McpResponse {
  return { jsonrpc: '2.0', id: id ?? null, result };
}

function mcpError(id: string | number | null | undefined, code: number, message: string, data?: any): McpResponse {
  return { jsonrpc: '2.0', id: id ?? null, error: { code, message, data } };
}

// ─────────────────────────────────────────────────────────────
// Tool definitions
// ─────────────────────────────────────────────────────────────

const TOOLS: McpTool[] = [
  {
    name: 'search_rentals',
    description: 'Search rental listings by structured filters such as city, district, price range, area, room count, pet policy, parking, etc. Returns a list of matching rentals.',
    inputSchema: {
      type: 'object',
      properties: {
        city: { type: 'string', description: 'City name in Chinese, e.g. 台北市' },
        district: { type: 'string', description: 'District name in Chinese, e.g. 大安區' },
        minPrice: { type: 'number', description: 'Minimum monthly rent in TWD' },
        maxPrice: { type: 'number', description: 'Maximum monthly rent in TWD' },
        minArea: { type: 'number', description: 'Minimum area in ping (坪)' },
        maxArea: { type: 'number', description: 'Maximum area in ping (坪)' },
        rooms: { type: 'integer', description: 'Number of bedrooms' },
        hasParking: { type: 'boolean', description: 'Requires parking' },
        canPet: { type: 'boolean', description: 'Allows pets' },
        needsSubsidize: { type: 'boolean', description: 'Eligible for rental subsidy' },
        needsHuji: { type: 'boolean', description: 'Allows household registration (戶籍)' },
        verifiedOnly: { type: 'boolean', description: 'Only verified listings' },
        limit: { type: 'integer', description: 'Max results (default 20, max 100)', default: 20 },
      },
    },
  },
  {
    name: 'get_rental_detail',
    description: 'Fetch full details of a rental by its ID.',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Rental UUID' },
      },
      required: ['id'],
    },
  },
  {
    name: 'recommend_rentals',
    description: 'Given a natural language description of user preferences, search rentals and return ranked recommendations with AI-generated reasoning.',
    inputSchema: {
      type: 'object',
      properties: {
        preferences: { type: 'string', description: 'Natural language preferences, e.g. "我在找台北可以養貓、有車位、月租兩萬以下的套房"' },
        city: { type: 'string', description: 'Optional city hint' },
        maxPrice: { type: 'number', description: 'Optional max price hint' },
        limit: { type: 'integer', description: 'Number of recommendations (default 5, max 20)', default: 5 },
      },
      required: ['preferences'],
    },
  },
  {
    name: 'analyze_rental',
    description: 'Analyze a specific rental listing and provide pros/cons, price fairness, and suitability summary.',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Rental UUID' },
        userPreferences: { type: 'string', description: 'Optional user preferences context' },
      },
      required: ['id'],
    },
  },
];

// ─────────────────────────────────────────────────────────────
// Validation schemas
// ─────────────────────────────────────────────────────────────

const SearchArgsSchema = z.object({
  city: z.string().optional(),
  district: z.string().optional(),
  minPrice: z.number().optional(),
  maxPrice: z.number().optional(),
  minArea: z.number().optional(),
  maxArea: z.number().optional(),
  rooms: z.number().int().optional(),
  hasParking: z.boolean().optional(),
  canPet: z.boolean().optional(),
  needsSubsidize: z.boolean().optional(),
  needsHuji: z.boolean().optional(),
  verifiedOnly: z.boolean().optional(),
  limit: z.number().int().min(1).max(100).default(20),
});

const GetDetailArgsSchema = z.object({
  id: z.string().uuid(),
});

const RecommendArgsSchema = z.object({
  preferences: z.string().min(1),
  city: z.string().optional(),
  maxPrice: z.number().optional(),
  limit: z.number().int().min(1).max(20).default(5),
});

const AnalyzeArgsSchema = z.object({
  id: z.string().uuid(),
  userPreferences: z.string().optional(),
});

// ─────────────────────────────────────────────────────────────
// Database helpers
// ─────────────────────────────────────────────────────────────

function formatRental(row: any) {
  return {
    id: row.id,
    city: row.city,
    district: row.district,
    address: row.address,
    propertyType: row.propertyType,
    type: row.type,
    rooms: row.rooms,
    livingRooms: row.livingRooms,
    bathrooms: row.bathrooms,
    kitchens: row.kitchens,
    area: row.area,
    floor: row.floor,
    totalFloors: row.totalFloors,
    buildingAge: row.buildingAge,
    price: row.price,
    pricePerPing: row.pricePerPyeong,
    hasElevator: Boolean(row.hasElevator),
    hasParking: Boolean(row.hasParking),
    hasBalcony: Boolean(row.hasBalcony),
    hasManager: Boolean(row.hasManager),
    canCook: Boolean(row.canCook),
    canPet: Boolean(row.canPet),
    canMoveHuji: Boolean(row.canMoveHuji),
    canSubsidize: Boolean(row.canSubsidize),
    trashService: Boolean(row.trashService),
    managementFee: row.managementFee,
    genderRestriction: row.genderRestriction === 'none' ? '不限' : row.genderRestriction === 'female' ? '限女' : '限男',
    electricityBillingType: row.electricityBillingType || (row.includesElectricity ? 'included' : 'taipower'),
    electricityPricePerKwh: row.electricityPricePerKwh,
    electricitySummerPricePerKwh: row.electricitySummerPricePerKwh,
    waterBillingType: row.waterBillingType || (row.includesWater ? 'included' : 'taiwater'),
    waterPricePerUnit: row.waterPricePerUnit,
    waterSummerPricePerUnit: row.waterSummerPricePerUnit,
    transportation: row.transports ? row.transports.split(',') : [],
    equipment: row.equipments ? row.equipments.split(',') : [],
    features: row.features ? row.features.split(',') : [],
    verificationStatus: row.verificationStatus,
    posterRole: row.posterRole,
    agencyFeeCharged: Boolean(row.agencyFeeCharged),
    startDate: row.startDate,
    leaseTerm: row.leaseTerm,
    badLandlord: Boolean(row.badLandlord),
    ghostStory: row.ghostStory,
    lat: row.latitude,
    lng: row.longitude,
  };
}

async function searchRentals(env: Env, args: z.infer<typeof SearchArgsSchema>) {
  let query = 'SELECT * FROM rentals WHERE approved = 1';
  const params: any[] = [];
  const conditions: string[] = [];

  if (args.city) { conditions.push('city = ?'); params.push(args.city); }
  if (args.district) { conditions.push('district = ?'); params.push(args.district); }
  if (args.minPrice !== undefined) { conditions.push('price >= ?'); params.push(args.minPrice); }
  if (args.maxPrice !== undefined) { conditions.push('price <= ?'); params.push(args.maxPrice); }
  if (args.minArea !== undefined) { conditions.push('area >= ?'); params.push(args.minArea); }
  if (args.maxArea !== undefined) { conditions.push('area <= ?'); params.push(args.maxArea); }
  if (args.rooms !== undefined) { conditions.push('rooms = ?'); params.push(args.rooms); }
  if (args.hasParking) { conditions.push('hasParking = 1'); }
  if (args.canPet) { conditions.push('canPet = 1'); }
  if (args.needsSubsidize) { conditions.push('canSubsidize = 1'); }
  if (args.needsHuji) { conditions.push('canMoveHuji = 1'); }
  if (args.verifiedOnly) { conditions.push("(verificationStatus = 'verified' OR posterRole = 'government' OR contractFile IS NOT NULL)"); }

  if (conditions.length) query += ` AND ${conditions.join(' AND ')}`;
  query += ' ORDER BY createdAt DESC LIMIT ? OFFSET ?';
  params.push(args.limit, 0);

  const { results } = await env.DB.prepare(query).bind(...params).all();
  return (results || []).map(formatRental);
}

async function getRentalById(env: Env, id: string) {
  const { results } = await env.DB.prepare('SELECT * FROM rentals WHERE id = ? AND approved = 1').bind(id).all();
  if (!results || results.length === 0) return null;
  return formatRental(results[0]);
}

// ─────────────────────────────────────────────────────────────
// Workers AI helpers
// ─────────────────────────────────────────────────────────────

async function callWorkersAI(env: Env, messages: { role: 'system' | 'user' | 'assistant'; content: string }[]) {
  if (!env.AI) {
    throw new Error('Workers AI binding (AI) is not configured in wrangler.toml');
  }
  const response = await env.AI.run('@cf/meta/llama-3.3-70b-instruct-fp8-fast', { messages });
  // Workers AI text generation returns { response: string }
  if (response && typeof response === 'object' && 'response' in response) {
    return (response as any).response;
  }
  return JSON.stringify(response);
}

async function generateRecommendations(env: Env, preferences: string, rentals: any[], limit: number) {
  const prompt = `你是一位專業的租屋推薦助手。請根據以下使用者需求，從提供的租屋物件中挑出最適合的 ${limit} 筆，並說明推薦理由。

使用者需求：${preferences}

租屋物件資料（JSON）：
${JSON.stringify(rentals.slice(0, limit * 3), null, 2)}

請嚴格回傳 JSON 陣列，每個元素包含：
- id: 物件 ID
- score: 1-10 的適合度分數
- reason: 簡短推薦理由（50 字內）
- concerns: 可能的缺點或注意事項（50 字內）

範例輸出格式：
[
  {"id": "uuid-1", "score": 9, "reason": "...", "concerns": "..."},
  {"id": "uuid-2", "score": 7, "reason": "...", "concerns": "..."}
]

只回傳 JSON 陣列，不要 markdown、不要其他說明。`;

  const result = await callWorkersAI(env, [
    { role: 'system', content: '你是一位熟悉台灣租屋市場的推薦助手，只輸出合法 JSON 陣列，絕不使用 markdown 程式碼區塊。' },
    { role: 'user', content: prompt },
  ]);

  try {
    const cleaned = String(result)
      .replace(/^```(?:json)?\s*|\s*```$/g, '')
      .trim();
    const parsed = JSON.parse(cleaned);
    if (Array.isArray(parsed)) return parsed;
    if (parsed && typeof parsed === 'object') {
      // Model may wrap the array in an object (e.g. { "recommendations": [...] })
      for (const key of Object.keys(parsed)) {
        const val = (parsed as any)[key];
        if (Array.isArray(val)) return val;
      }
      // Fallback: if object has a single key whose value is an array, use it
      const values = Object.values(parsed);
      if (values.length === 1 && Array.isArray(values[0])) return values[0];
    }
    return [parsed];
  } catch {
    return { raw: result };
  }
}

async function generateAnalysis(env: Env, rental: any, userPreferences?: string) {
  const prompt = `請分析以下租屋物件的優缺點、租金合理性與適合度。

物件資料：
${JSON.stringify(rental, null, 2)}

${userPreferences ? `使用者偏好：${userPreferences}` : ''}

請回傳 JSON：
{
  "summary": "整體評價（80 字內）",
  "pros": ["優點1", "優點2"],
  "cons": ["缺點1", "缺點2"],
  "priceFairness": "租金合理性評估（50 字內）",
  "suitabilityScore": 1-10,
  "warnings": ["注意事項1"]
}

只回傳 JSON。`;

  const result = await callWorkersAI(env, [
    { role: 'system', content: '你是一位熟悉台灣租屋市場的分析助手，只輸出合法 JSON。' },
    { role: 'user', content: prompt },
  ]);

  try {
    const cleaned = String(result)
      .replace(/^```(?:json)?\s*|\s*```$/g, '')
      .trim();
    return JSON.parse(cleaned);
  } catch {
    return { raw: result };
  }
}

// ─────────────────────────────────────────────────────────────
// Tool dispatcher
// ─────────────────────────────────────────────────────────────

async function handleToolCall(env: Env, name: string, args: any) {
  switch (name) {
    case 'search_rentals': {
      const parsed = SearchArgsSchema.parse(args);
      const data = await searchRentals(env, parsed);
      return { content: [{ type: 'text', text: JSON.stringify({ total: data.length, data }, null, 2) }] };
    }

    case 'get_rental_detail': {
      const parsed = GetDetailArgsSchema.parse(args);
      const data = await getRentalById(env, parsed.id);
      if (!data) {
        return { content: [{ type: 'text', text: JSON.stringify({ error: 'Rental not found' }) }], isError: true };
      }
      return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
    }

    case 'recommend_rentals': {
      const parsed = RecommendArgsSchema.parse(args);
      const searchArgs: z.infer<typeof SearchArgsSchema> = {
        city: parsed.city,
        maxPrice: parsed.maxPrice,
        limit: parsed.limit * 3,
      };
      const rentals = await searchRentals(env, searchArgs);
      let recommendations = await generateRecommendations(env, parsed.preferences, rentals, parsed.limit);
      // Normalize: if model wrapped the array in { raw: [...] }, unwrap it
      if (recommendations && typeof recommendations === 'object' && !Array.isArray(recommendations)) {
        const values = Object.values(recommendations);
        if (values.length === 1 && Array.isArray(values[0])) {
          recommendations = values[0];
        }
      }
      return { content: [{ type: 'text', text: JSON.stringify({ total: rentals.length, recommendations }, null, 2) }] };
    }

    case 'analyze_rental': {
      const parsed = AnalyzeArgsSchema.parse(args);
      const rental = await getRentalById(env, parsed.id);
      if (!rental) {
        return { content: [{ type: 'text', text: JSON.stringify({ error: 'Rental not found' }) }], isError: true };
      }
      const analysis = await generateAnalysis(env, rental, parsed.userPreferences);
      return { content: [{ type: 'text', text: JSON.stringify({ rental, analysis }, null, 2) }] };
    }

    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

// ─────────────────────────────────────────────────────────────
// HTTP handlers
// ─────────────────────────────────────────────────────────────

export async function GET(request: NextRequest) {
  // SSE endpoint for MCP streaming (basic implementation)
  const headers = new Headers({
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
  });

  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();
      controller.enqueue(encoder.encode('event: endpoint\ndata: /api/ai/mcp\n\n'));
      // Keep connection open; real implementation would queue messages
    },
  });

  return new Response(stream, { headers });
}

export async function POST(request: NextRequest) {
  try {
    const env = getRequestContext().env as unknown as Env;
    if (!env || !env.DB) {
      return NextResponse.json({ error: 'Database not bound' }, { status: 500 });
    }

    const body = (await request.json()) as McpRequest | McpRequest[];
    const requests = Array.isArray(body) ? body : [body];
    const responses: McpResponse[] = [];

    for (const req of requests) {
      if (req.jsonrpc !== '2.0') {
        responses.push(mcpError(req.id, -32600, 'Invalid Request'));
        continue;
      }

      try {
        switch (req.method) {
          case 'initialize': {
            responses.push(mcpResult(req.id, {
              protocolVersion: MCP_VERSION,
              capabilities: { tools: {}, logging: {} },
              serverInfo: { name: 'rental-price-tracker-mcp', version: '1.0.0' },
            }));
            break;
          }

          case 'initialized':
          case 'notifications/initialized': {
            // No response needed for notifications
            break;
          }

          case 'tools/list': {
            responses.push(mcpResult(req.id, { tools: TOOLS }));
            break;
          }

          case 'tools/call': {
            const { name, arguments: args } = req.params || {};
            const result = await handleToolCall(env, name, args || {});
            responses.push(mcpResult(req.id, result));
            break;
          }

          default: {
            responses.push(mcpError(req.id, -32601, `Method not found: ${req.method}`));
          }
        }
      } catch (err: any) {
        responses.push(mcpError(req.id, -32603, err?.message || 'Internal error'));
      }
    }

    return NextResponse.json(responses.length === 1 ? responses[0] : responses);
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Invalid request' }, { status: 400 });
  }
}
