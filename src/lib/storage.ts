import type { ChatThread, Settings, SpreadCard, WordAnchor } from "../types";

const THREADS_KEY = "cmr.chatThreads";
const SETTINGS_KEY = "cmr.settings";
const API_KEY_KEY = "cmr.runtimeApiKey";

export const defaultSettings: Settings = {
  language: "en",
  cameraEnabled: false,
  layoutMode: "auto",
  visualIntensity: "mystical",
  apiKeyStorage: "local",
  model: import.meta.env.VITE_OPENAI_MODEL || "gpt-4o",
  baseUrl: import.meta.env.VITE_OPENAI_BASE_URL || "https://api.shubiaobiao.com/v1"
};

const devEnvApiKey = import.meta.env.DEV ? import.meta.env.VITE_OPENAI_API_KEY || "" : "";

export function loadThreads(): ChatThread[] {
  try {
    const raw = localStorage.getItem(THREADS_KEY);
    return raw ? (JSON.parse(raw) as Array<ChatThread & { cards?: string[] }>).map(normalizeThread) : [];
  } catch {
    return [];
  }
}

export function saveThreads(threads: ChatThread[]): void {
  localStorage.setItem(THREADS_KEY, JSON.stringify(threads.map(normalizeThread)));
}

export function upsertThread(thread: ChatThread): ChatThread[] {
  const threads = loadThreads();
  const next = [thread, ...threads.filter((item) => item.id !== thread.id)];
  saveThreads(next);
  return next;
}

export function deleteThread(id: string): ChatThread[] {
  const next = loadThreads().filter((thread) => thread.id !== id);
  saveThreads(next);
  return next;
}

export function loadSettings(): Settings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return defaultSettings;
    const saved = JSON.parse(raw) as Partial<Settings>;
    const next = { ...defaultSettings, ...saved };
    if (!saved.model || saved.model === "gpt-4.1-mini" || saved.model === "gpt-4o-mini") {
      next.model = defaultSettings.model;
    }
    if (!saved.baseUrl || saved.baseUrl === "https://api.openai.com/v1") {
      next.baseUrl = defaultSettings.baseUrl;
    }
    return next;
  } catch {
    return defaultSettings;
  }
}

export function saveSettings(settings: Settings): void {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

export function getRuntimeApiKey(): string {
  try {
    return localStorage.getItem(API_KEY_KEY) || sessionStorage.getItem(API_KEY_KEY) || "";
  } catch {
    return "";
  }
}

export function saveRuntimeApiKey(key: string, mode: Settings["apiKeyStorage"]): void {
  if (mode === "local") {
    localStorage.setItem(API_KEY_KEY, key);
    sessionStorage.removeItem(API_KEY_KEY);
  } else {
    sessionStorage.setItem(API_KEY_KEY, key);
    localStorage.removeItem(API_KEY_KEY);
  }
}

export function clearRuntimeApiKey(): void {
  localStorage.removeItem(API_KEY_KEY);
  sessionStorage.removeItem(API_KEY_KEY);
}

export function maskApiKey(key: string): string {
  const trimmed = key.trim();
  if (!trimmed) return "";
  const suffix = trimmed.slice(-4);
  const prefix = trimmed.startsWith("sk-") ? "sk-" : "";
  return `${prefix}****${suffix}`;
}

export function hasEnvApiKey(): boolean {
  return Boolean(devEnvApiKey.trim());
}

export function getEffectiveApiKey(): string {
  return getRuntimeApiKey() || devEnvApiKey;
}

export function normalizeThread(thread: ChatThread & { cards?: string[] }): ChatThread {
  if (Array.isArray(thread.spreadCards)) {
    return {
      ...thread,
      currentQuestion: thread.currentQuestion || thread.originalQuestion,
      currentStage: thread.currentStage || inferStage(thread),
      questionHistory: Array.isArray(thread.questionHistory) ? thread.questionHistory : [],
      operatingRules: Array.isArray(thread.operatingRules) ? thread.operatingRules : [],
      parchmentSummary: normalizeSummary(thread),
      spreadCards: normalizeSpreadCards(thread.spreadCards, thread.language),
      wordAnchors: normalizeWordAnchors(thread.wordAnchors),
      openingSymbolSelection: thread.openingSymbolSelection,
      randomnessReflections: Array.isArray(thread.randomnessReflections) ? thread.randomnessReflections : [],
      usedGroundingEntryTypes: Array.isArray(thread.usedGroundingEntryTypes) ? thread.usedGroundingEntryTypes : [],
      askedQuestionIntents: normalizeAskedQuestionIntents(thread.askedQuestionIntents)
    };
  }

  const legacyCards = Array.isArray(thread.cards) ? thread.cards : [];
  return {
    ...thread,
    currentQuestion: thread.currentQuestion || thread.originalQuestion,
    currentStage: thread.currentStage || inferStage(thread),
    questionHistory: Array.isArray(thread.questionHistory) ? thread.questionHistory : [],
    operatingRules: Array.isArray(thread.operatingRules) ? thread.operatingRules : [],
    parchmentSummary: normalizeSummary(thread),
    wordAnchors: normalizeWordAnchors(thread.wordAnchors),
    openingSymbolSelection: thread.openingSymbolSelection,
    randomnessReflections: Array.isArray(thread.randomnessReflections) ? thread.randomnessReflections : [],
    usedGroundingEntryTypes: Array.isArray(thread.usedGroundingEntryTypes) ? thread.usedGroundingEntryTypes : [],
    askedQuestionIntents: normalizeAskedQuestionIntents(thread.askedQuestionIntents),
    spreadCards: legacyCards.map((cardName, index) => ({
      id: `${thread.id}_legacy_card_${index + 1}`,
      order: index + 1,
      cardName,
      role: index === 0 ? firstLensRole(thread.language) : genericRole(thread.language, index + 1),
      nodeType: index === 0 ? "first_symbol" : undefined,
      drawnAt: thread.createdAt,
      isActive: index === legacyCards.length - 1,
      userTurnCount: 0,
      aiQuestionCount: 0
    }))
  };
}

function normalizeSummary(thread: ChatThread & { cards?: string[] }): ChatThread["parchmentSummary"] {
  if (!thread.parchmentSummary) return undefined;
  const questionHistory = Array.isArray(thread.parchmentSummary.questionHistory)
    ? thread.parchmentSummary.questionHistory
    : Array.isArray(thread.questionHistory)
      ? thread.questionHistory
      : [];
  const currentQuestion = thread.parchmentSummary.currentQuestion || thread.currentQuestion || thread.originalQuestion;
  const candidateFallback =
    thread.parchmentSummary.smallQuestionToCarry ||
    thread.parchmentSummary.finalQuestion ||
    currentQuestion;
  const finalQuestionToCarry =
    thread.parchmentSummary.finalQuestionToCarry ||
    thread.parchmentSummary.userEditedFinalQuestion ||
    thread.parchmentSummary.selectedFinalQuestion ||
    "";
  return {
    ...thread.parchmentSummary,
    type: "parchment_summary",
    originalQuestion: thread.parchmentSummary.originalQuestion || thread.originalQuestion,
    currentQuestion,
    concreteScenes: Array.isArray(thread.parchmentSummary.concreteScenes) ? thread.parchmentSummary.concreteScenes : [],
    operatingRules: Array.isArray(thread.parchmentSummary.operatingRules) ? thread.parchmentSummary.operatingRules : [],
    cardDisruptions: Array.isArray(thread.parchmentSummary.cardDisruptions) ? thread.parchmentSummary.cardDisruptions : [],
    selectedWordAnchors: Array.isArray(thread.parchmentSummary.selectedWordAnchors) ? thread.parchmentSummary.selectedWordAnchors : [],
    spreadGrowthStory: Array.isArray(thread.parchmentSummary.spreadGrowthStory) ? thread.parchmentSummary.spreadGrowthStory : [],
    firstRandomCard: thread.parchmentSummary.firstRandomCard || thread.spreadCards?.[0]?.cardName,
    firstImpression: thread.parchmentSummary.firstImpression || thread.firstCardImpression?.impressionText,
    randomnessReflectionSummary: thread.parchmentSummary.randomnessReflectionSummary || "",
    questionPath: Array.isArray(thread.parchmentSummary.questionPath)
      ? thread.parchmentSummary.questionPath
      : questionHistory.map((item) => ({
          from: item.fromQuestion,
          to: item.toQuestion,
          why: item.reason
        })),
    finalCurrentQuestion:
      thread.parchmentSummary.finalCurrentQuestion ||
      currentQuestion,
    smallPieces: Array.isArray(thread.parchmentSummary.smallPieces)
      ? thread.parchmentSummary.smallPieces
      : (thread.parchmentSummary.keyUserReflections || []).slice(0, 5).map((text) => ({
          kind: "small_answer" as const,
          text,
          source: "legacy_reflection"
        })),
    connection: thread.parchmentSummary.connection || thread.parchmentSummary.emergingPattern || "",
    finalQuestionCandidates: Array.isArray(thread.parchmentSummary.finalQuestionCandidates)
      ? thread.parchmentSummary.finalQuestionCandidates
      : [
          { style: "gentle" as const, question: candidateFallback },
          { style: "direct" as const, question: candidateFallback },
          { style: "action-oriented" as const, question: candidateFallback }
        ],
    selectedFinalQuestion: thread.parchmentSummary.selectedFinalQuestion,
    userEditedFinalQuestion: thread.parchmentSummary.userEditedFinalQuestion,
    finalQuestionToCarry,
    smallQuestionToCarry:
      thread.parchmentSummary.smallQuestionToCarry ||
      thread.parchmentSummary.finalQuestion ||
      currentQuestion,
    gentleSuggestion:
      thread.parchmentSummary.gentleSuggestion ||
      thread.parchmentSummary.encouragement ||
      "",
    questionHistory,
    cards: Array.isArray(thread.parchmentSummary.cards) ? thread.parchmentSummary.cards : []
  };
}

function normalizeAskedQuestionIntents(value: unknown): ChatThread["askedQuestionIntents"] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is ChatThread["askedQuestionIntents"][number] => Boolean(item && typeof item === "object"))
    .map((item) => ({
      ...item,
      depthLevel: item.depthLevel || "scene",
      soraStage: item.soraStage || "scene"
    }));
}

function normalizeWordAnchors(value: unknown): WordAnchor[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is WordAnchor => Boolean(item && typeof item === "object" && typeof item.text === "string"))
    .map((item) => ({
      ...item,
      stage: item.stage || "scene"
    }));
}

function inferStage(thread: Partial<ChatThread>): ChatThread["currentStage"] {
  if (thread.parchmentSummary) return "summary";
  if (thread.firstCardImpression && !thread.questionHistory?.length) return "initial_connection";
  if (thread.questionHistory?.length) return "agency";
  if (thread.spreadCards?.length) return "resonant_disruption";
  if (thread.operatingRules?.length) return "resonant_disruption";
  return "scene";
}

function normalizeSpreadCards(cards: SpreadCard[], language: ChatThread["language"]): SpreadCard[] {
  const activeIndex = Math.max(0, cards.findIndex((card) => card.isActive));
  const fallbackActive = cards.length - 1;
  return cards.map((card, index) => ({
    ...card,
    order: card.order || index + 1,
    role: card.role || (index === 0 ? firstLensRole(language) : genericRole(language, index + 1)),
    drawnAt: card.drawnAt || new Date().toISOString(),
    isActive: cards.some((item) => item.isActive) ? index === activeIndex : index === fallbackActive,
    userTurnCount: typeof card.userTurnCount === "number" ? card.userTurnCount : 0,
    aiQuestionCount: typeof card.aiQuestionCount === "number" ? card.aiQuestionCount : 0,
    drawnFor: card.drawnFor || card.nodeLabel || card.role,
    nodeLabel: card.nodeLabel || card.drawnFor || card.role,
    nodeType: card.nodeType || (index === 0 ? "first_symbol" : undefined),
    sourceAnchorId: card.sourceAnchorId
  }));
}

function firstLensRole(language: ChatThread["language"]): string {
  return language === "zh" ? "第一道视角" : "First Lens";
}

function genericRole(language: ChatThread["language"], order: number): string {
  return language === "zh" ? `第 ${order} 道视角` : `Lens ${order}`;
}
