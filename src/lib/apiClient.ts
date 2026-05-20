import type { AskedQuestionIntent, ChatMessage, ConceptAnchor, FirstCardImpression, Language, OperatingRule, ParchmentSummary, QuestionTransform, RandomnessReflection, SoraStage, SpreadCard, SymbolSelection, UsedGroundingEntryType, WordAnchor } from "../types";
import {
  buildContextPrompt,
  buildSummaryPrompt,
  SUMMARY_SYSTEM_PROMPT,
  SYSTEM_PROMPT,
  type EventType
} from "./promptBuilder";
import { parseJsonObject } from "./jsonParsing";

export type AIRequest = {
  apiKey: string;
  baseUrl: string;
  model: string;
  language: Language;
  originalQuestion: string;
  currentQuestion: string;
  currentStage: SoraStage;
  firstCardImpression?: FirstCardImpression;
  openingSymbolSelection?: SymbolSelection;
  questionHistory: QuestionTransform[];
  operatingRules?: OperatingRule[];
  currentCard: string;
  spreadCards: SpreadCard[];
  wordAnchors?: WordAnchor[];
  conceptAnchors?: ConceptAnchor[];
  randomnessReflections?: RandomnessReflection[];
  usedGroundingEntryTypes?: UsedGroundingEntryType[];
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
  currentStage?: SoraStage;
  firstCardImpression?: FirstCardImpression;
  openingSymbolSelection?: SymbolSelection;
  questionHistory: QuestionTransform[];
  operatingRules?: OperatingRule[];
  spreadCards: SpreadCard[];
  wordAnchors?: WordAnchor[];
  randomnessReflections?: RandomnessReflection[];
  chatHistory: ChatMessage[];
};

function friendlyError(language: Language, message: string): Error {
  return new Error(message || (language === "zh" ? "AI 请求失败，请稍后再试。" : "The AI request failed. Please try again."));
}

function parseSummaryJson(content: string): Partial<ParchmentSummary> | null {
  return parseJsonObject(content) as Partial<ParchmentSummary> | null;
}

function buildFallbackParchmentSummary(request: SummaryRequest): ParchmentSummary {
  const zh = request.language === "zh";
  const userLines = request.chatHistory
    .filter((message) => message.role === "user")
    .map((message) => message.content.trim())
    .filter(Boolean);
  const firstCard = request.spreadCards[0];
  const selectedCardKeywords = request.spreadCards
    .map((card) => card.selectedCardKeyword)
    .filter((keyword): keyword is string => Boolean(keyword));
  const selectedWordAnchors = [
    ...(request.wordAnchors || []).filter((anchor) => anchor.selected).map((anchor) => anchor.text),
    ...selectedCardKeywords
  ];
  const questionPath = request.questionHistory.length
    ? request.questionHistory.map((item) => ({ from: item.fromQuestion, to: item.toQuestion, why: item.reason }))
    : request.originalQuestion !== request.currentQuestion
      ? [
          {
            from: request.originalQuestion,
            to: request.currentQuestion,
            why: zh ? "对话里逐渐靠近的新说法。" : "A newer wording that emerged in the conversation."
          }
        ]
      : [];
  const spreadGrowthStory = request.spreadCards.map((card) => ({
    order: card.order,
    cardName: card.cardName,
    drawnFor: card.drawnFor || card.reason || card.role,
    nodeType: card.nodeType,
    nodeLabel: card.nodeLabel
  }));
  const firstImpression = request.openingSymbolSelection
    ? `${request.openingSymbolSelection.symbolLabel} -> ${
        request.openingSymbolSelection.customMeaning || request.openingSymbolSelection.selectedDirection || ""
      }`
    : request.firstCardImpression?.impressionText || "";
  const smallPieces = buildFallbackSmallPieces(request, userLines, selectedWordAnchors);
  const finalQuestionCandidates = buildFallbackQuestionCandidates(request.language, request.currentQuestion);

  return {
    type: "parchment_summary",
    originalQuestion: request.originalQuestion,
    currentQuestion: request.currentQuestion,
    questionPath,
    concreteScenes: userLines.slice(-3),
    operatingRules: (request.operatingRules || []).map((rule) => rule.text),
    cardDisruptions: request.spreadCards.map((card) =>
      zh
        ? `${card.cardName}以“${card.selectedCardKeyword || card.drawnFor || card.role}”进入了这次问题。`
        : `${card.cardName} entered through "${card.selectedCardKeyword || card.drawnFor || card.role}".`
    ),
    selectedWordAnchors,
    spreadGrowthStory,
    firstRandomCard: firstCard?.cardName,
    firstImpression,
    randomnessReflectionSummary: summarizeFallbackRandomness(request),
    finalCurrentQuestion: request.currentQuestion,
    smallPieces,
    connection: zh
      ? "这份总结是根据已有对话先整理出的版本。它不替你下结论，只把已经出现过的牌、词和问题放回同一张纸上。"
      : "This summary was gathered from the conversation already on the page. It does not close the question; it places the cards, words, and current question together.",
    finalQuestionCandidates,
    selectedFinalQuestion: undefined,
    userEditedFinalQuestion: undefined,
    finalQuestionToCarry: "",
    smallQuestionToCarry: request.currentQuestion,
    gentleSuggestion: zh
      ? "先选一个最小的部分照顾它，不急着把整件事一次说完。"
      : "Choose one small part to tend first; the whole question does not need to be solved at once.",
    questionHistory: request.questionHistory,
    cards: request.spreadCards,
    keyUserReflections: userLines.slice(-6),
    emergingPattern: "",
    finalQuestion: request.currentQuestion,
    encouragement: zh ? "可以从一个很小的动作开始。" : "You can begin with one very small movement.",
    createdAt: new Date().toISOString()
  };
}

function buildFallbackSmallPieces(request: SummaryRequest, userLines: string[], selectedAnchors: string[]): ParchmentSummary["smallPieces"] {
  const zh = request.language === "zh";
  const pieces: ParchmentSummary["smallPieces"] = [];
  const lastUserLine = userLines[userLines.length - 1];
  const firstCard = request.spreadCards[0];

  if (firstCard) {
    pieces.push({
      kind: "card_insight",
      text: zh
        ? `第一张牌是「${firstCard.cardName}」，它先给问题开了一个入口。`
        : `The first card was ${firstCard.cardName}; it opened the first doorway into the question.`,
      source: "first_card",
      sourceWords: [firstCard.cardName]
    });
  }

  if (request.openingSymbolSelection) {
    pieces.push({
      kind: "word_anchor",
      text: zh
        ? `你先注意到「${request.openingSymbolSelection.symbolLabel}」。`
        : `You first noticed "${request.openingSymbolSelection.symbolLabel}."`,
      source: "opening_symbol",
      sourceWords: [request.openingSymbolSelection.symbolLabel]
    });
  }

  if (lastUserLine) {
    pieces.push({
      kind: "small_answer",
      text: zh
        ? `你最后留下的一句话是：“${trimForSummary(lastUserLine)}”。`
        : `One of your last sentences was: "${trimForSummary(lastUserLine)}."`,
      source: "user_words",
      sourceWords: selectedAnchors.slice(0, 3)
    });
  }

  selectedAnchors.slice(0, 3).forEach((anchor) => {
    pieces.push({
      kind: "word_anchor",
      text: zh ? `「${anchor}」是这次对话里被留下的词。` : `"${anchor}" is one of the words left in this conversation.`,
      source: "anchor",
      sourceWords: [anchor]
    });
  });

  while (pieces.length < 3) {
    pieces.push({
      kind: "small_question",
      text: zh ? `当前可以继续带着的问题是：“${request.currentQuestion}”。` : `The question to carry for now is: "${request.currentQuestion}."`,
      source: "current_question",
      sourceWords: []
    });
  }

  return pieces.slice(0, 6);
}

function buildFallbackQuestionCandidates(language: Language, currentQuestion: string): ParchmentSummary["finalQuestionCandidates"] {
  if (language === "zh") {
    return [
      { style: "gentle", question: currentQuestion },
      { style: "direct", question: "这件事里，哪一部分已经不能再用原来的方式撑着？" },
      { style: "action-oriented", question: "今天我可以先让哪一个很小的部分变轻一点？" }
    ];
  }

  return [
    { style: "gentle", question: currentQuestion },
    { style: "direct", question: "What part of this can no longer be held in the old way?" },
    { style: "action-oriented", question: "What is one small part I can make lighter today?" }
  ];
}

function summarizeFallbackRandomness(request: SummaryRequest): string {
  const zh = request.language === "zh";
  if (!request.randomnessReflections?.length) {
    return zh ? "这次没有记录明确的随机性反馈。" : "No explicit randomness checkpoint was recorded in this chat.";
  }

  const latest = request.randomnessReflections[request.randomnessReflections.length - 1];
  return zh
    ? `最后一次随机性反馈记录为：${latest.perceivedConnection}${latest.helpedShift ? ` / ${latest.helpedShift}` : ""}。`
    : `The latest randomness checkpoint was recorded as: ${latest.perceivedConnection}${latest.helpedShift ? ` / ${latest.helpedShift}` : ""}.`;
}

function trimForSummary(text: string): string {
  return text.length > 80 ? `${text.slice(0, 78)}...` : text;
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
    max_tokens: 1800
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
    const parsed = parseSummaryJson(content);
    if (!parsed) {
      return buildFallbackParchmentSummary(request);
    }
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
      concreteScenes: Array.isArray(parsed.concreteScenes) ? parsed.concreteScenes.filter((item): item is string => typeof item === "string") : [],
      operatingRules: Array.isArray(parsed.operatingRules) ? parsed.operatingRules.filter((item): item is string => typeof item === "string") : [],
      cardDisruptions: Array.isArray(parsed.cardDisruptions) ? parsed.cardDisruptions.filter((item): item is string => typeof item === "string") : [],
      selectedWordAnchors: Array.isArray(parsed.selectedWordAnchors) ? parsed.selectedWordAnchors.filter((item): item is string => typeof item === "string") : [],
      spreadGrowthStory: Array.isArray(parsed.spreadGrowthStory) ? parsed.spreadGrowthStory : request.spreadCards.map((card) => ({
        order: card.order,
        cardName: card.cardName,
        drawnFor: card.drawnFor || card.role,
        nodeType: card.nodeType,
        nodeLabel: card.nodeLabel
      })),
      firstRandomCard: parsed.firstRandomCard || request.spreadCards[0]?.cardName,
      firstImpression:
        parsed.firstImpression ||
        (request.openingSymbolSelection
          ? `${request.openingSymbolSelection.symbolLabel} -> ${request.openingSymbolSelection.customMeaning || request.openingSymbolSelection.selectedDirection || ""}`
          : request.firstCardImpression?.impressionText),
      randomnessReflectionSummary: parsed.randomnessReflectionSummary || "",
      finalCurrentQuestion: parsed.finalCurrentQuestion || currentQuestion,
      smallPieces,
      connection: parsed.connection || "",
      finalQuestionCandidates,
      selectedFinalQuestion: undefined,
      userEditedFinalQuestion: undefined,
      finalQuestionToCarry: "",
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
    return buildFallbackParchmentSummary(request);
  }
}
