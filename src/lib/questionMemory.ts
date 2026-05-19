import { parseRitualAIResponse, type ParsedAIResponse } from "./aiResponse";
import type { ChatMessage, ChatThread, DepthLevel, QuestionIntent, QuestionTransform } from "../types";

export function normalizeQuestion(text: string): string {
  return text
    .toLowerCase()
    .replace(/[“”"'‘’`，。！？；：,.!?;:()[\]{}]/g, "")
    .replace(/\s+/g, "")
    .trim();
}

export function isSimilarQuestion(a: string, b: string): boolean {
  const left = normalizeQuestion(a);
  const right = normalizeQuestion(b);
  if (!left || !right) return false;
  if (left === right) return true;
  if (left.includes(right) || right.includes(left)) {
    return Math.min(left.length, right.length) / Math.max(left.length, right.length) > 0.7;
  }
  const bigrams = (value: string) => {
    const set = new Set<string>();
    for (let index = 0; index < value.length - 1; index += 1) set.add(value.slice(index, index + 2));
    return set;
  };
  const aSet = bigrams(left);
  const bSet = bigrams(right);
  if (!aSet.size || !bSet.size) return false;
  const intersection = [...aSet].filter((item) => bSet.has(item)).length;
  return intersection / Math.min(aSet.size, bSet.size) > 0.7;
}

export function collectPreviousQuestions(messages: ChatMessage[], history: QuestionTransform[] = []): string[] {
  const questions = new Set<string>();
  history.forEach((item) => {
    if (item.fromQuestion) questions.add(item.fromQuestion);
    if (item.toQuestion) questions.add(item.toQuestion);
  });

  messages.forEach((message) => {
    if (message.role === "assistant") {
      const parsed = parseRitualAIResponse(message.content);
      extractParsedQuestions(parsed).forEach((question) => questions.add(question));
    }
    const matches = message.content.match(/[^?？\n]{4,}[?？]/g) || [];
    matches.forEach((question) => questions.add(question.trim()));
  });

  return [...questions].filter(Boolean);
}

export function isDuplicateQuestion(question: string | undefined, previousQuestions: string[]): boolean {
  if (!question) return false;
  return previousQuestions.some((previous) => isSimilarQuestion(question, previous));
}

export function isRepeatedQuestionIntent(
  thread: Pick<ChatThread, "askedQuestionIntents">,
  intent: QuestionIntent | null | undefined,
  activeCardId?: string
): boolean {
  if (!intent) return false;
  const asked = Array.isArray(thread.askedQuestionIntents) ? thread.askedQuestionIntents : [];
  const sameCardCount = asked.filter((item) => item.intent === intent && item.cardId === activeCardId).length;
  const totalCount = asked.filter((item) => item.intent === intent).length;
  if (sameCardCount >= 1) return true;
  if (totalCount >= 2) return true;
  return false;
}

export function isRepeatedDepthLevel(
  thread: Pick<ChatThread, "askedQuestionIntents">,
  depthLevel: DepthLevel | null | undefined,
  activeCardId?: string
): boolean {
  if (!depthLevel) return false;
  const asked = Array.isArray(thread.askedQuestionIntents) ? thread.askedQuestionIntents : [];
  const sameCardCount = asked.filter((item) => item.depthLevel === depthLevel && item.cardId === activeCardId).length;
  const totalCount = asked.filter((item) => item.depthLevel === depthLevel).length;
  if (depthLevel === "scene" && sameCardCount >= 1) return true;
  if (sameCardCount >= 2) return true;
  if (totalCount >= 3) return true;
  return false;
}

export function getResponseQuestion(response: ParsedAIResponse): string | undefined {
  if ("optionalQuestion" in response && response.optionalQuestion) return response.optionalQuestion;
  if ("questionToUser" in response && response.questionToUser) return response.questionToUser;
  return undefined;
}

export function getResponseQuestionIntent(response: ParsedAIResponse): QuestionIntent | null | undefined {
  if ("questionIntent" in response) return response.questionIntent;
  return undefined;
}

export function getResponseDepthLevel(response: ParsedAIResponse): DepthLevel | null | undefined {
  if ("depthLevel" in response) return response.depthLevel;
  return undefined;
}

export function sanitizeRepeatedQuestions<T extends ParsedAIResponse>(
  response: T,
  previousQuestions: string[]
): T {
  const copy = { ...response } as ParsedAIResponse;
  if ("optionalQuestion" in copy && isDuplicateQuestion(copy.optionalQuestion, previousQuestions)) {
    copy.optionalQuestion = undefined;
    if ("questionIntent" in copy) copy.questionIntent = null;
    if ("depthLevel" in copy) copy.depthLevel = null;
  }
  if ("questionToUser" in copy && isDuplicateQuestion(copy.questionToUser, previousQuestions)) {
    copy.questionToUser = undefined;
    if ("questionIntent" in copy) copy.questionIntent = null;
    if ("depthLevel" in copy) copy.depthLevel = null;
  }
  if ("reframedQuestion" in copy && isDuplicateQuestion(copy.reframedQuestion, previousQuestions)) {
    copy.reframedQuestion = undefined;
  }
  if ("optionalQuestion" in copy && copy.optionalQuestion && isVagueQuestion(copy.optionalQuestion)) {
    copy.optionalQuestion = undefined;
    if ("questionStyle" in copy) copy.questionStyle = "none";
    if ("questionIntent" in copy) copy.questionIntent = null;
    if ("depthLevel" in copy) copy.depthLevel = null;
  }
  if ("questionToUser" in copy && copy.questionToUser && isVagueQuestion(copy.questionToUser)) {
    copy.questionToUser = undefined;
    if ("questionIntent" in copy) copy.questionIntent = null;
    if ("depthLevel" in copy) copy.depthLevel = null;
  }
  return copy as T;
}

export function isDontKnow(text: string): boolean {
  const normalized = normalizeQuestion(text);
  return ["我不知道", "不知道", "idontknow", "dontknow", "notsure", "unclear"].some((needle) =>
    normalized.includes(needle)
  );
}

function isVagueQuestion(question: string): boolean {
  const normalized = normalizeQuestion(question);
  const vague = [
    "未被发现的情感",
    "未被发现的需求",
    "内心深处真正想要",
    "被压抑的声音",
    "探索自己的内在智慧",
    "hiddenemotion",
    "hiddenneed",
    "trueinnerneed",
    "innerwisdom"
  ];
  return vague.some((item) => normalized.includes(normalizeQuestion(item)));
}

export function extractReframedQuestion(response: ParsedAIResponse | null): string | undefined {
  if (!response) return undefined;
  if ("reframedQuestion" in response) return response.reframedQuestion;
  return undefined;
}

function extractParsedQuestions(response: ParsedAIResponse | null): string[] {
  if (!response) return [];
  const questions: string[] = [];
  if ("questionToUser" in response && response.questionToUser) questions.push(response.questionToUser);
  if ("optionalQuestion" in response && response.optionalQuestion) questions.push(response.optionalQuestion);
  if ("reframedQuestion" in response && response.reframedQuestion) questions.push(response.reframedQuestion);
  if ("newQuestion" in response && response.newQuestion) questions.push(response.newQuestion);
  if ("finalQuestion" in response && typeof response.finalQuestion === "string") questions.push(response.finalQuestion);
  return questions;
}
