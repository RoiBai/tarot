import { findDeckCard } from "./tarotDeck";

export function getCardKeywords(cardNameOrId: string, language: "en" | "zh"): string[] {
  const card = findDeckCard(cardNameOrId);
  if (!card) return language === "zh" ? ["还说不清", "距离", "停顿", "入口"] : ["unclear", "distance", "pause", "entry point"];
  return language === "zh" ? card.keywordsZh : card.keywordsEn;
}

export function getCardMeaningAngle(cardNameOrId: string, language: "en" | "zh"): string {
  const card = findDeckCard(cardNameOrId);
  if (!card) {
    return language === "zh"
      ? `「${cardNameOrId}」可以先作为一个入口，不急着把它说成答案。`
      : `${cardNameOrId} can be used as an entry point, not as an answer.`;
  }
  return language === "zh"
    ? `${card.shortMeaningZh}先借这些词看一眼，不把它们当成答案。`
    : `${card.shortMeaningEn} Let's borrow these words as angles, not answers.`;
}
