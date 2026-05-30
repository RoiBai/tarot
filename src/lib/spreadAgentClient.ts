import type {
  ChatMessage,
  Language,
  PositionAgentStructuredResponse,
  PositionReading,
  SpreadPosition,
  SpreadSummary,
  TarotSpread
} from "../types";
import { parseJsonObject } from "./jsonParsing";
import { buildPositionAgentPrompt } from "./positionAgentPrompts";
import { buildSummaryAgentPrompt } from "./summaryAgentPrompt";

type OpenAIConfig = {
  apiKey: string;
  baseUrl: string;
  model: string;
  freeTrialProxyUrl?: string;
  freeTrialThreadId?: string;
};

type PositionAgentRequest = OpenAIConfig & {
  language: Language;
  originalQuestion: string;
  spread: TarotSpread;
  position: SpreadPosition;
  positionReading: PositionReading;
  previousPositions: PositionReading[];
  allPositionReadings?: PositionReading[];
  choiceA?: string;
  choiceB?: string;
  forceCompletion?: boolean;
};

type ReaderSummaryRequest = OpenAIConfig & {
  language: Language;
  originalQuestion: string;
  spread: TarotSpread;
  positionReadings: PositionReading[];
  choiceA?: string;
  choiceB?: string;
};

function friendlyError(language: Language, message?: string): Error {
  return new Error(
    message ||
      (language === "zh"
        ? "AI 请求失败了。请检查 API Key、Base URL，或稍后再试。"
        : "The AI request failed. Check the API key, Base URL, or try again shortly.")
  );
}

async function postJsonCompletion(
  config: OpenAIConfig,
  language: Language,
  systemPrompt: string,
  userPrompt: string,
  maxTokens: number,
  temperature: number
): Promise<string> {
  const apiKey = config.apiKey.trim();
  const freeTrialProxyUrl = config.freeTrialProxyUrl?.trim() || "";

  if (!apiKey && !freeTrialProxyUrl) {
    throw friendlyError(
      language,
      language === "zh"
        ? "没有可用的 API Key。请在设置中添加，或创建 .env.local 后再试。"
        : "No API key is available. Add one in Settings or create .env.local, then try again."
    );
  }
  if (!apiKey && !config.freeTrialThreadId?.trim()) {
    throw friendlyError(
      language,
      language === "zh"
        ? "免费体验入口缺少这次牌阵的记录编号。请刷新后从保存的牌阵继续。"
        : "The free trial is missing this spread session id. Refresh and continue from the saved spread."
    );
  }

  const baseUrl = config.baseUrl.replace(/\/+$/, "");
  const body: Record<string, unknown> = {
    model: config.model,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt }
    ],
    temperature,
    max_tokens: maxTokens,
    response_format: { type: "json_object" }
  };

  async function send(useJsonFormat: boolean) {
    const nextBody = useJsonFormat ? body : { ...body };
    if (!useJsonFormat) delete nextBody.response_format;
    if (!apiKey) {
      return fetch(freeTrialProxyUrl, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          ...nextBody,
          threadId: config.freeTrialThreadId
        })
      });
    }

    return fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(nextBody)
    });
  }

  let response: Response;
  try {
    response = await send(true);
    if (response.status === 400 || response.status === 422) {
      response = await send(false);
    }
  } catch {
    throw friendlyError(
      language,
      language === "zh"
        ? "网络连接失败。请检查 Base URL、网络或本地代理设置。"
        : "Network error. Check the Base URL, network, or local proxy settings."
    );
  }

  if (!response.ok) {
    const message = await readErrorMessage(response);
    if (message) throw friendlyError(language, message);
  }
  if (response.status === 401 || response.status === 403) {
    throw friendlyError(language, language === "zh" ? "API Key 无效或没有权限。" : "The API key is invalid or lacks permission.");
  }
  if (response.status === 429) {
    throw friendlyError(language, language === "zh" ? "请求频率受限。请稍后再试。" : "Rate limit reached. Please try again shortly.");
  }
  if (!response.ok) {
    throw friendlyError(
      language,
      language === "zh" ? `AI 请求失败，状态码 ${response.status}。` : `The AI request failed with status ${response.status}.`
    );
  }

  const data = (await response.json()) as { choices?: Array<{ message?: { content?: string } }> };
  const content = data.choices?.[0]?.message?.content?.trim();
  if (!content) {
    throw friendlyError(language, language === "zh" ? "AI 返回为空。" : "The AI returned an empty response.");
  }
  return content;
}

async function readErrorMessage(response: Response): Promise<string> {
  try {
    const data = await response.clone().json();
    const error = (data as { error?: unknown }).error;
    if (typeof error === "string") return error;
    if (error && typeof error === "object" && "message" in error) {
      const message = (error as { message?: unknown }).message;
      return typeof message === "string" ? message : "";
    }
  } catch {
    // Ignore non-JSON provider errors and keep the existing friendly fallbacks.
  }
  return "";
}

export async function generatePositionAgentResponse(request: PositionAgentRequest): Promise<PositionAgentStructuredResponse> {
  const userPrompt = buildPositionAgentPrompt({
    language: request.language,
    originalQuestion: request.originalQuestion,
    spread: request.spread,
    position: request.position,
    positionReading: request.positionReading,
    previousPositions: request.previousPositions,
    allPositionReadings: request.allPositionReadings,
    drawnCard: request.positionReading.card,
    userObservation: request.positionReading.userObservation,
    choiceA: request.choiceA,
    choiceB: request.choiceB,
    turnCount: request.positionReading.turnCount,
    forceCompletion: request.forceCompletion
  });

  const content = await postJsonCompletion(
    request,
    request.language,
    "You are a gentle tarot reading companion for one spread position. Return JSON only.",
    userPrompt,
    1400,
    0.72
  );
  const parsed = parseJsonObject(content);
  const response = normalizePositionAgentResponse(parsed, request.positionReading, request.language, request.forceCompletion);
  if (!response) {
    throw friendlyError(request.language, request.language === "zh" ? "这个位置的回应格式无法解析。" : "The response for this position could not be parsed.");
  }
  return response;
}

export async function generateReaderSpreadSummary(request: ReaderSummaryRequest): Promise<SpreadSummary> {
  const userPrompt = buildSummaryAgentPrompt({
    language: request.language,
    originalQuestion: request.originalQuestion,
    spread: request.spread,
    positionReadings: request.positionReadings,
    choiceA: request.choiceA,
    choiceB: request.choiceB
  });

  const content = await postJsonCompletion(
    request,
    request.language,
    "You are an experienced tarot reader synthesizing a whole spread. Return JSON only.",
    userPrompt,
    2600,
    0.76
  );
  const parsed = parseJsonObject(content);
  const summary = normalizeSpreadSummary(parsed, request.language);
  if (!summary) {
    throw friendlyError(request.language, request.language === "zh" ? "总结的返回格式无法解析。" : "The summary response could not be parsed.");
  }
  return summary;
}

function normalizePositionAgentResponse(
  parsed: Record<string, unknown> | null,
  reading: PositionReading,
  language: Language,
  forceCompletion?: boolean
): PositionAgentStructuredResponse | null {
  if (!parsed) return null;
  const response = asString(parsed.response);
  const questionToUser = asNullableString(parsed.questionToUser);
  const parsedUltimateQuestion = asNullableString(parsed.ultimateQuestion);
  const parsedCoreInsight = asNullableString(parsed.coreInsight);
  const shouldComplete = Boolean(parsed.shouldComplete) || parsed.type === "position_agent_completion" || forceCompletion;

  if (!response && !questionToUser && !parsedUltimateQuestion) return null;

  if (shouldComplete) {
    const derivedQuestion =
      parsedUltimateQuestion ||
      questionToUser ||
      extractLastQuestion(response) ||
      extractLastAssistantQuestion(reading.dialogue) ||
      buildSpecificFallbackQuestion(reading, language);
    const derivedInsight =
      parsedCoreInsight ||
      response ||
      (language === "zh"
        ? "这个位置已经留下了一点可以继续看的材料。"
        : "This position has left enough material to keep looking from here.");

    return {
      type: "position_agent_completion",
      response:
        response ||
        (language === "zh"
          ? "我已经有足够的材料了，可以先把这个位置收束下来。"
          : "I have enough material now, so this position can be gathered for the moment."),
      questionToUser: null,
      shouldComplete: true,
      ultimateQuestion: derivedQuestion,
      coreInsight: derivedInsight
    };
  }

  return {
    type: "position_agent_response",
    response,
    questionToUser,
    shouldComplete: false,
    ultimateQuestion: null,
    coreInsight: null
  };
}

function normalizeSpreadSummary(parsed: Record<string, unknown> | null, language: Language): SpreadSummary | null {
  if (!parsed) return null;
  const title = asString(parsed.title) || (language === "zh" ? "总结" : "Summary");
  const overview = asString(parsed.overview);
  const deepPattern = asString(parsed.deepPattern);
  const questionToCarry = asString(parsed.questionToCarry);
  const gentleSuggestion = asString(parsed.gentleSuggestion);
  const smallPoem = asString(parsed.smallPoem);

  if (!overview && !deepPattern && !questionToCarry) return null;
  return {
    type: "spread_summary",
    title,
    overview,
    deepPattern,
    questionToCarry,
    gentleSuggestion,
    smallPoem,
    createdAt: new Date().toISOString()
  };
}

function extractLastAssistantQuestion(dialogue: ChatMessage[]): string {
  for (let index = dialogue.length - 1; index >= 0; index -= 1) {
    const message = dialogue[index];
    if (message.role !== "assistant") continue;
    const question = extractLastQuestion(message.content);
    if (question) return question;
  }
  return "";
}

function extractLastQuestion(value: string): string {
  const matches = value.match(/[^。！？!?]*[？?]/g);
  return matches?.at(-1)?.trim() || "";
}

function buildSpecificFallbackQuestion(reading: PositionReading, language: Language): string {
  const title = language === "zh" ? reading.positionTitleZh : reading.positionTitleEn;
  const observation = reading.userObservation?.replace(/\[[^\]]+\]/g, "").trim();
  if (language === "zh") {
    return observation
      ? `在“${title}”这里，${observation}最想让你继续看见什么？`
      : `在“${title}”这里，这张牌最想让你继续看见什么？`;
  }
  return observation
    ? `In "${title}", what does "${observation}" ask you to keep noticing?`
    : `In "${title}", what does this card ask you to keep noticing?`;
}

function asString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function asNullableString(value: unknown): string | null {
  const text = asString(value);
  return text || null;
}
