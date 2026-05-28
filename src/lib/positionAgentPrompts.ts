import type { Language, PositionReading, SpreadPosition, TarotSpread } from "../types";
import type { TarotDeckCard } from "./tarotDeck";

type BuildPositionAgentPromptArgs = {
  language: Language;
  originalQuestion: string;
  spread: TarotSpread;
  position: SpreadPosition;
  positionReading: PositionReading;
  previousPositions: PositionReading[];
  drawnCard?: TarotDeckCard;
  userObservation?: string;
  choiceA?: string;
  choiceB?: string;
  turnCount: number;
  forceCompletion?: boolean;
};

export function buildPositionAgentPrompt({
  language,
  originalQuestion,
  spread,
  position,
  positionReading,
  previousPositions,
  drawnCard,
  userObservation,
  choiceA,
  choiceB,
  turnCount,
  forceCompletion = false
}: BuildPositionAgentPromptArgs): string {
  const zh = language === "zh";
  const previousContext = previousPositions.length
    ? previousPositions.map(formatPreviousPosition).join("\n")
    : zh
      ? "暂无已完成的位置。"
      : "No completed positions yet.";
  const dialogue = positionReading.dialogue.length
    ? positionReading.dialogue.map((message) => `${message.role}: ${message.content}`).join("\n")
    : zh
      ? "这个位置的对话尚未开始。"
      : "The dialogue for this position has not started yet.";
  const purpose = softenPurpose(zh ? position.agentGoalZh : position.agentGoalEn, language);
  const cardMeaning = drawnCard
    ? zh
      ? `${drawnCard.nameZh} / ${drawnCard.nameEn}: ${drawnCard.shortMeaningZh} 关键词：${drawnCard.keywordsZh.join("、")}`
      : `${drawnCard.nameEn} / ${drawnCard.nameZh}: ${drawnCard.shortMeaningEn} Keywords: ${drawnCard.keywordsEn.join(", ")}`
    : zh
      ? "用户还没有输入牌。"
      : "The user has not entered a card yet.";

  return `
You are not a general chatbot.
You are one gentle reading companion for one specific tarot spread position.

Your only job:
Help the user understand this one position.

Rules:
- Do not answer other positions.
- Do not summarize the whole spread.
- Do not predict fate.
- Do not give direct advice.
- Do not over-explain tarot.
- Do not ask generic therapy questions.
- Ask one precise question at a time.
- Keep the dialogue focused and short.
- Return all prose in ${zh ? "Simplified Chinese" : "English"}.
- Do not call yourself an agent, fortune-teller, therapist, or master.

Use:
- the user's main question
- this position's question
- this position's purpose
- the drawn card's symbolic meaning
- what the user noticed in the card
- previous completed positions only as background, not as the focus

If this is the first response for this position:
- briefly connect the position, card, and user observation
- ask one focused question

If this is a later response:
- use the user's last answer
- deepen or clarify
- if enough material is present, generate an ultimate question/core insight and recommend closing this position

If the user seems impatient, says they do not know, gives very short answers, or has reached the turn limit:
- close earlier
- generate an ultimate question/core insight
- allow completion

${forceCompletion ? "The user chose to close this position. Start gently, as if saying: \"I have enough material now; let me gather this position into one small question.\" Then generate a completion." : ""}
Current response count for this position: ${turnCount}. Maximum responses: 5.

Main question:
${originalQuestion}

Spread:
${zh ? spread.nameZh : spread.nameEn} (${spread.id})

${choiceA || choiceB ? `Choice A: ${choiceA || "(not provided)"}\nChoice B: ${choiceB || "(not provided)"}` : ""}

Current position:
${position.order}. ${zh ? position.titleZh : position.titleEn}

Position question:
${zh ? position.positionQuestionZh : position.positionQuestionEn}

Position purpose:
${purpose}

Drawn card:
${cardMeaning}

User's first visual observation or feeling:
${userObservation || (zh ? "用户还没有写下观察。" : "The user has not written an observation yet.")}

Previous completed positions, as background only:
${previousContext}

Dialogue so far in this position:
${dialogue}

Return structured JSON only.

For a normal response:
{
  "type": "position_agent_response",
  "response": "...",
  "questionToUser": "...",
  "shouldComplete": false,
  "ultimateQuestion": null,
  "coreInsight": null
}

When ready to complete:
{
  "type": "position_agent_completion",
  "response": "...",
  "questionToUser": null,
  "shouldComplete": true,
  "ultimateQuestion": "...",
  "coreInsight": "..."
}
`.trim();
}

function formatPreviousPosition(reading: PositionReading): string {
  const card = reading.card ? `${reading.card.nameEn} / ${reading.card.nameZh}` : "No card";
  const ultimate = reading.ultimateQuestionZh || reading.ultimateQuestionEn || "";
  const insight = reading.coreInsightZh || reading.coreInsightEn || "";
  return `- ${reading.positionOrder}. ${reading.positionTitleEn} / ${reading.positionTitleZh}: ${card}. Question left: ${ultimate || "none"}. Core insight: ${insight || "none"}.`;
}

function softenPurpose(value: string, language: Language): string {
  return language === "zh"
    ? value.replace(/Agent/g, "读牌伙伴")
    : value.replace(/\bagent\b/gi, "reading companion");
}
