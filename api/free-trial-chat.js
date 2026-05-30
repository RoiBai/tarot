import { createHmac, timingSafeEqual } from "node:crypto";

const COOKIE_NAME = "cmr_free_trial";
const DEFAULT_MAX_CALLS = 40;
const DEFAULT_MAX_TOKENS = 2200;
const DEFAULT_MODEL = "gpt-4o";
const DEFAULT_BASE_URL = "https://api.openai.com/v1";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 180;

export default async function handler(request, response) {
  response.setHeader("Cache-Control", "no-store");

  if (request.method === "OPTIONS") {
    response.status(204).end();
    return;
  }

  if (request.method !== "POST") {
    response.status(405).json({ error: "Method not allowed." });
    return;
  }

  const apiKey = process.env.FREE_TRIAL_OPENAI_API_KEY || process.env.OPENAI_API_KEY || "";
  if (!apiKey.trim()) {
    response.status(503).json({ error: "免费体验还没有配置好。请稍后再试，或联系我获取 key/token。" });
    return;
  }

  let payload;
  try {
    payload = await readJsonBody(request);
  } catch {
    response.status(400).json({ error: "Request body must be valid JSON." });
    return;
  }

  const threadId = normalizeThreadId(payload.threadId);
  if (!threadId) {
    response.status(400).json({ error: "Missing reading session id." });
    return;
  }

  const cookieSecret = process.env.FREE_TRIAL_COOKIE_SECRET || apiKey;
  const trialState = readTrialState(request.headers.cookie || "", cookieSecret);
  if (trialState.invalid) {
    response.status(403).json({ error: "这台设备的免费体验记录无效。请联系我获取 key/token 后继续。" });
    return;
  }

  const state = trialState.state;
  if (state && state.threadId !== threadId) {
    response.status(403).json({ error: "这台设备已经用过免费体验了。你可以联系我获取 key/token 后继续。" });
    return;
  }

  const maxCalls = positiveInt(process.env.FREE_TRIAL_MAX_CALLS, DEFAULT_MAX_CALLS);
  const usedCalls = state?.calls || 0;
  if (usedCalls >= maxCalls) {
    response.status(429).json({ error: "这次免费体验的额度已经用完。你可以联系我获取 key/token 后继续。" });
    return;
  }

  const upstreamBody = buildUpstreamBody(payload);
  if (!upstreamBody) {
    response.status(400).json({ error: "Missing chat messages." });
    return;
  }

  const baseUrl = (process.env.FREE_TRIAL_OPENAI_BASE_URL || process.env.OPENAI_BASE_URL || DEFAULT_BASE_URL).replace(/\/+$/, "");

  let upstreamResponse;
  try {
    upstreamResponse = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(upstreamBody)
    });
  } catch {
    response.status(502).json({ error: "免费体验入口暂时连不上模型服务。请稍后再试。" });
    return;
  }

  const text = await upstreamResponse.text();
  const contentType = upstreamResponse.headers.get("content-type") || "application/json";

  if (upstreamResponse.ok) {
    const nextState = {
      threadId,
      calls: usedCalls + 1,
      createdAt: state?.createdAt || Date.now(),
      updatedAt: Date.now()
    };
    response.setHeader("Set-Cookie", serializeCookie(COOKIE_NAME, encodeState(nextState, cookieSecret), request));
  }

  response.status(upstreamResponse.status);
  response.setHeader("Content-Type", contentType);
  response.send(text);
}

async function readJsonBody(request) {
  if (request.body && typeof request.body === "object" && !Buffer.isBuffer(request.body)) {
    return request.body;
  }
  if (typeof request.body === "string") {
    return JSON.parse(request.body || "{}");
  }

  let raw = "";
  for await (const chunk of request) {
    raw += chunk;
  }
  return JSON.parse(raw || "{}");
}

function buildUpstreamBody(payload) {
  const messages = Array.isArray(payload.messages)
    ? payload.messages
        .map((message) => ({
          role: normalizeRole(message?.role),
          content: typeof message?.content === "string" ? message.content.slice(0, 16000) : ""
        }))
        .filter((message) => message.role && message.content)
    : [];

  if (!messages.length) return null;

  const maxTokensLimit = positiveInt(process.env.FREE_TRIAL_MAX_TOKENS, DEFAULT_MAX_TOKENS);
  const maxTokens = Math.min(positiveInt(payload.max_tokens, 900), maxTokensLimit);
  const temperature = clamp(Number(payload.temperature), 0, 1.2, 0.72);
  const model = process.env.FREE_TRIAL_OPENAI_MODEL || (typeof payload.model === "string" ? payload.model : DEFAULT_MODEL);
  const body = {
    model,
    messages,
    temperature,
    max_tokens: maxTokens
  };

  if (payload.response_format?.type === "json_object") {
    body.response_format = { type: "json_object" };
  }

  return body;
}

function normalizeRole(role) {
  return ["system", "user", "assistant"].includes(role) ? role : "";
}

function normalizeThreadId(value) {
  return typeof value === "string" ? value.replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 120) : "";
}

function readTrialState(cookieHeader, secret) {
  const raw = getCookie(cookieHeader, COOKIE_NAME);
  if (!raw) return { state: null, invalid: false };

  const [encoded, signature] = raw.split(".");
  if (!encoded || !signature || !safeEqual(signature, sign(encoded, secret))) {
    return { state: null, invalid: true };
  }

  try {
    const state = JSON.parse(Buffer.from(encoded, "base64url").toString("utf8"));
    if (!state || typeof state.threadId !== "string" || typeof state.calls !== "number") {
      return { state: null, invalid: true };
    }
    return { state, invalid: false };
  } catch {
    return { state: null, invalid: true };
  }
}

function encodeState(state, secret) {
  const encoded = Buffer.from(JSON.stringify(state)).toString("base64url");
  return `${encoded}.${sign(encoded, secret)}`;
}

function sign(value, secret) {
  return createHmac("sha256", secret).update(value).digest("base64url");
}

function safeEqual(left, right) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
}

function getCookie(cookieHeader, name) {
  return cookieHeader
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${name}=`))
    ?.slice(name.length + 1);
}

function serializeCookie(name, value, request) {
  const secure = request.headers["x-forwarded-proto"] === "https" ? "; Secure" : "";
  return `${name}=${value}; Path=/; Max-Age=${COOKIE_MAX_AGE}; HttpOnly; SameSite=Lax${secure}`;
}

function positiveInt(value, fallback) {
  const next = Number.parseInt(String(value), 10);
  return Number.isFinite(next) && next > 0 ? next : fallback;
}

function clamp(value, min, max, fallback) {
  if (!Number.isFinite(value)) return fallback;
  return Math.min(Math.max(value, min), max);
}
