import type { AskedQuestionIntent, ChatMessage, Language, ParchmentSummary, QuestionTransform, SpreadCard, WordAnchor } from "../types";
import {
  buildContextPrompt,
  buildSummaryPrompt,
  SUMMARY_SYSTEM_PROMPT,
  SYSTEM_PROMPT,
  type EventType
} from "./promptBuilder";

export type AIRequest = {
  apiKey: string;
  baseUrl: string;
  model: string;
  language: Language;
  originalQuestion: string;
  currentQuestion: string;
  questionHistory: QuestionTransform[];
  currentCard: string;
  spreadCards: SpreadCard[];
  wordAnchors?: WordAnchor[];
  askedQuestionIntents?: AskedQuestionIntent[];
  chatHistory: ChatMessage[];
  latestUserMessage?: string;
  eventType?: EventType;
};

export type SummaryRequest = {
  apiKey: string;
  baseUrl: string;
  model: string;
  language: Language;
  originalQuestion: string;
  currentQuestion: string;
  questionHistory: QuestionTransform[];
  spreadCards: SpreadCard[];
  wordAnchors?: WordAnchor[];
  chatHistory: ChatMessage[];
};

function friendlyError(language: Language, message: string): Error {
  return new Error(message || (language === "zh" ? "AI 请求失败，请稍后再试。" : "The AI request failed. Please try again."));
}

async function postChatCompletion(request: AIRequest, useJsonFormat: boolean): Promise<Response> {
  const baseUrl = request.baseUrl.replace(/\/+$/, "");
  const body: Record<string, unknown> = {
    model: request.model,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: buildContextPrompt(request) }
    ],
    temperature: 0.78,
    max_tokens: 340
  };

  if (useJsonFormat) {
    body.response_format = { type: "json_object" };
  }

  return fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${request.apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });
}

async function postSummaryCompletion(request: SummaryRequest, useJsonFormat: boolean): Promise<Response> {
  const baseUrl = request.baseUrl.replace(/\/+$/, "");
  const body: Record<string, unknown> = {
    model: request.model,
    messages: [
      { role: "system", content: SUMMARY_SYSTEM_PROMPT },
      { role: "user", content: buildSummaryPrompt(request) }
    ],
    temperature: 0.72,
    max_tokens: 800
  };

  if (useJsonFormat) {
    body.response_format = { type: "json_object" };
  }

  return fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${request.apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });
}

export async function generateRealAIResponse(request: AIRequest): Promise<string> {
  if (!request.apiKey.trim()) {
    throw friendlyError(
      request.language,
      request.language === "zh"
        ? "没有可用的 API Key。请在设置中添加，或创建 .env.local 后重试。"
        : "No API key is available. Add one in Settings or create .env.local, then try again."
    );
  }

  let response: Response;
  try {
    response = await postChatCompletion(request, true);
    if (response.status === 400 || response.status === 422) {
      response = await postChatCompletion(request, false);
    }
  } catch {
    throw friendlyError(
      request.language,
      request.language === "zh"
        ? "网络连接失败。请检查 Base URL、网络或本地代理设置。"
        : "Network error. Check the Base URL, network, or local proxy settings."
    );
  }

  if (response.status === 401 || response.status === 403) {
    throw friendlyError(
      request.language,
      request.language === "zh" ? "API Key 无效或没有权限。" : "The API key is invalid or lacks permission."
    );
  }

  if (response.status === 429) {
    throw friendlyError(
      request.language,
      request.language === "zh" ? "请求频率受限。请稍后再试。" : "Rate limit reached. Please try again shortly."
    );
  }

  if (!response.ok) {
    throw friendlyError(
      request.language,
      request.language === "zh"
        ? `AI 请求失败，状态码 ${response.status}。`
        : `The AI request failed with status ${response.status}.`
    );
  }

  let data: unknown;
  try {
    data = await response.json();
  } catch {
    throw friendlyError(
      request.language,
      request.language === "zh" ? "AI 返回格式无法解析。" : "The AI response could not be parsed."
    );
  }

  const content = (data as { choices?: Array<{ message?: { content?: string } }> }).choices?.[0]?.message?.content;
  if (!content?.trim()) {
    throw friendlyError(
      request.language,
      request.language === "zh" ? "AI 返回为空。" : "The AI returned an empty response."
    );
  }

  return content.trim();
}

export async function generateParchmentSummary(request: SummaryRequest): Promise<ParchmentSummary> {
  if (!request.apiKey.trim()) {
    throw friendlyError(
      request.language,
      request.language === "zh"
        ? "没有可用的 API Key。请在设置中添加，或创建 .env.local 后重试。"
        : "No API key is available. Add one in Settings or create .env.local, then try again."
    );
  }

  let response: Response;
  try {
    response = await postSummaryCompletion(request, true);
    if (response.status === 400 || response.status === 422) {
      response = await postSummaryCompletion(request, false);
    }
  } catch {
    throw friendlyError(
      request.language,
      request.language === "zh"
        ? "网络连接失败。请检查 Base URL、网络或本地代理设置。"
        : "Network error. Check the Base URL, network, or local proxy settings."
    );
  }

  if (!response.ok) {
    throw friendlyError(
      request.language,
      request.language === "zh"
        ? `羊皮纸总结生成失败，状态码 ${response.status}。`
        : `The parchment summary failed with status ${response.status}.`
    );
  }

  let data: unknown;
  try {
    data = await response.json();
  } catch {
    throw friendlyError(
      request.language,
      request.language === "zh" ? "总结返回格式无法解析。" : "The summary response could not be parsed."
    );
  }

  const content = (data as { choices?: Array<{ message?: { content?: string } }> }).choices?.[0]?.message?.content;
  if (!content?.trim()) {
    throw friendlyError(
      request.language,
      request.language === "zh" ? "总结返回为空。" : "The summary returned empty."
    );
  }

  try {
    const parsed = JSON.parse(content.trim().replace(/^```(?:json)?/i, "").replace(/```$/i, "").trim()) as Partial<ParchmentSummary>;
    const smallPieces = Array.isArray(parsed.smallPieces)
      ? parsed.smallPieces
          .filter((item) => item && typeof item === "object" && typeof item.text === "string")
          .map((item) => ({
            kind: item.kind || "small_answer",
            text: item.text,
            source: item.source || "summary",
            sourceWords: Array.isArray(item.sourceWords) ? item.sourceWords.filter((word): word is string => typeof word === "string") : []
          }))
          .slice(0, 6)
      : [];
    const currentQuestion = parsed.currentQuestion || parsed.finalCurrentQuestion || request.currentQuestion;
    const questionPath = Array.isArray(parsed.questionPath)
      ? parsed.questionPath
          .filter((item) => item && typeof item === "object" && typeof item.from === "string" && typeof item.to === "string")
          .map((item) => ({
            from: item.from,
            to: item.to,
            why: typeof item.why === "string" ? item.why : undefined
          }))
      : request.questionHistory.map((item) => ({
          from: item.fromQuestion,
          to: item.toQuestion,
          why: item.reason
        }));
    const fallbackQuestion = parsed.smallQuestionToCarry || parsed.finalQuestion || currentQuestion;
    const finalQuestionCandidates = Array.isArray(parsed.finalQuestionCandidates)
      ? parsed.finalQuestionCandidates
          .filter((item) => item && typeof item === "object" && typeof item.question === "string")
          .map((item, index) => ({
            style:
              item.style === "direct" || item.style === "action-oriented" || item.style === "gentle"
                ? item.style
                : index === 1
                  ? "direct"
                  : index === 2
                    ? "action-oriented"
                    : "gentle",
            question: item.question
          }))
          .slice(0, 3)
      : [];
    while (finalQuestionCandidates.length < 3) {
      const style = finalQuestionCandidates.length === 1 ? "direct" : finalQuestionCandidates.length === 2 ? "action-oriented" : "gentle";
      finalQuestionCandidates.push({ style, question: fallbackQuestion });
    }
    return {
      type: "parchment_summary",
      originalQuestion: parsed.originalQuestion || request.originalQuestion,
      currentQuestion,
      questionPath,
      finalCurrentQuestion: parsed.finalCurrentQuestion || currentQuestion,
      smallPieces,
      connection: parsed.connection || "",
      finalQuestionCandidates,
      selectedFinalQuestion: parsed.selectedFinalQuestion,
      userEditedFinalQuestion: parsed.userEditedFinalQuestion,
      finalQuestionToCarry: parsed.finalQuestionToCarry || parsed.selectedFinalQuestion || parsed.userEditedFinalQuestion || "",
      smallQuestionToCarry: fallbackQuestion,
      gentleSuggestion: parsed.gentleSuggestion || "",
      questionHistory: request.questionHistory,
      cards: request.spreadCards,
      keyUserReflections: Array.isArray(parsed.keyUserReflections) ? parsed.keyUserReflections : [],
      emergingPattern: parsed.emergingPattern || "",
      finalQuestion: parsed.finalQuestion || request.currentQuestion,
      encouragement: parsed.encouragement || parsed.gentleSuggestion || "",
      createdAt: new Date().toISOString()
    };
  } catch {
    throw friendlyError(
      request.language,
      request.language === "zh" ? "总结 JSON 无法解析。" : "The summary JSON could not be parsed."
    );
  }
}
