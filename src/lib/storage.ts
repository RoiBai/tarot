import type { ChatThread, Settings, SpreadCard } from "../types";

const THREADS_KEY = "cmr.chatThreads";
const SETTINGS_KEY = "cmr.settings";
const API_KEY_KEY = "cmr.runtimeApiKey";

export const defaultSettings: Settings = {
  language: "en",
  cameraEnabled: false,
  layoutMode: "auto",
  visualIntensity: "mystical",
  apiKeyStorage: "local",
  model: import.meta.env.VITE_OPENAI_MODEL || "gpt-4.1-mini",
  baseUrl: import.meta.env.VITE_OPENAI_BASE_URL || "https://api.openai.com/v1"
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
    return raw ? { ...defaultSettings, ...(JSON.parse(raw) as Partial<Settings>) } : defaultSettings;
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
      questionHistory: Array.isArray(thread.questionHistory) ? thread.questionHistory : [],
      parchmentSummary: normalizeSummary(thread),
      spreadCards: normalizeSpreadCards(thread.spreadCards, thread.language),
      wordAnchors: Array.isArray(thread.wordAnchors) ? thread.wordAnchors : [],
      askedQuestionIntents: normalizeAskedQuestionIntents(thread.askedQuestionIntents)
    };
  }

  const legacyCards = Array.isArray(thread.cards) ? thread.cards : [];
  return {
    ...thread,
    currentQuestion: thread.currentQuestion || thread.originalQuestion,
    questionHistory: Array.isArray(thread.questionHistory) ? thread.questionHistory : [],
    parchmentSummary: normalizeSummary(thread),
    wordAnchors: Array.isArray(thread.wordAnchors) ? thread.wordAnchors : [],
    askedQuestionIntents: normalizeAskedQuestionIntents(thread.askedQuestionIntents),
    spreadCards: legacyCards.map((cardName, index) => ({
      id: `${thread.id}_legacy_card_${index + 1}`,
      order: index + 1,
      cardName,
      role: index === 0 ? firstLensRole(thread.language) : genericRole(thread.language, index + 1),
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
  const finalQuestionToCarry =
    thread.parchmentSummary.finalQuestionToCarry ||
    thread.parchmentSummary.userEditedFinalQuestion ||
    thread.parchmentSummary.selectedFinalQuestion ||
    thread.parchmentSummary.smallQuestionToCarry ||
    thread.parchmentSummary.finalQuestion ||
    currentQuestion;
  return {
    ...thread.parchmentSummary,
    type: "parchment_summary",
    originalQuestion: thread.parchmentSummary.originalQuestion || thread.originalQuestion,
    currentQuestion,
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
          { style: "gentle" as const, question: finalQuestionToCarry },
          { style: "direct" as const, question: finalQuestionToCarry },
          { style: "action-oriented" as const, question: finalQuestionToCarry }
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
      depthLevel: item.depthLevel || "scene"
    }));
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
    aiQuestionCount: typeof card.aiQuestionCount === "number" ? card.aiQuestionCount : 0
  }));
}

function firstLensRole(language: ChatThread["language"]): string {
  return language === "zh" ? "第一道视角" : "First Lens";
}

function genericRole(language: ChatThread["language"], order: number): string {
  return language === "zh" ? `第 ${order} 道视角` : `Lens ${order}`;
}
