import type { Language, PositionReading, SpreadPosition, TarotSpread } from "../types";
import type { TarotDeckCard } from "./tarotDeck";
import { formatTarotKnowledgeForPrompt } from "./tarotCardKnowledge";

type BuildPositionAgentPromptArgs = {
  language: Language;
  originalQuestion: string;
  spread: TarotSpread;
  position: SpreadPosition;
  positionReading: PositionReading;
  previousPositions: PositionReading[];
  allPositionReadings?: PositionReading[];
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
  allPositionReadings = [],
  drawnCard,
  userObservation,
  choiceA,
  choiceB,
  turnCount,
  forceCompletion = false
}: BuildPositionAgentPromptArgs): string {
  const zh = language === "zh";
  const previousContext = previousPositions.length
    ? previousPositions.map((reading) => formatPositionEvidence(reading, language)).join("\n\n")
    : zh
      ? "暂无已完成的牌位。"
      : "No completed positions yet.";
  const dialogue = positionReading.dialogue.length
    ? positionReading.dialogue.map((message) => `${message.role}: ${message.content}`).join("\n")
    : zh
      ? "这个牌位的对话尚未开始。"
      : "The dialogue for this position has not started yet.";
  const allUserInputs = formatAllUserInputs(allPositionReadings.length ? allPositionReadings : [positionReading], language);
  const cardMeaning = drawnCard
    ? zh
      ? `${drawnCard.nameZh} / ${drawnCard.nameEn}: ${drawnCard.shortMeaningZh} 关键词：${drawnCard.keywordsZh.join("、")}`
      : `${drawnCard.nameEn} / ${drawnCard.nameZh}: ${drawnCard.shortMeaningEn} Keywords: ${drawnCard.keywordsEn.join(", ")}`
    : zh
      ? "用户还没有为这个牌位输入牌。"
      : "The user has not entered a card for this position yet.";
  const localCardKnowledge = formatTarotKnowledgeForPrompt(drawnCard, language);
  const purpose = zh ? position.agentGoalZh : position.agentGoalEn;

  return `
You are not a general chatbot.
You are one careful tarot reading companion for exactly one spread position.

Non-negotiable scope:
- Work only on the current position.
- Use the user's original question and every user input already available in this spread conversation.
- Use previous completed positions as evidence and background, but do not turn this response into a whole-spread summary.
- Do not predict fate.
- Do not state a decision as certain.
- Do not give vague, generic reassurance.
- Do not ask generic therapy questions.
- Do not call yourself an agent, fortune-teller, therapist, or master.
- Return all prose in ${zh ? "Simplified Chinese" : "English"}.

Depth requirements:
- Be concrete. Tie every interpretation to at least one of: the user's words, the current position, the card image, the card keywords, or the spread context.
- Name 1-3 possible directions the card may point to in this position. Use open language: ${zh ? "“可能”“像是”“值得留意”“不一定是结论”" : "\"may,\" \"seems,\" \"worth noticing,\" \"not necessarily the conclusion\""}.
- You may offer gentle advice or a next focus, but never as a command or prediction.
- Avoid vague phrases unless immediately grounded. Bad: ${zh ? "“你需要面对内心的阴影。” Good: “这张牌里的倒下杯子更像是在指向你提到的那种失落：你还在看已经失去的部分，但牌面也提醒你，身后仍有两个杯子代表尚未用上的支持。”" : "\"You need to face your shadow.\" Good: \"The spilled cups connect to the disappointment you named; the two standing cups suggest support that is still present but not yet in view.\""}

First-response structure:
1. Start with the card and position in one concrete sentence.
2. Add one transition sentence that explicitly connects the user's current question to this card/position.
3. Then give a grounded interpretation with keywords or image details.
4. End with one precise question to the user.
5. Keep the first response in 2-3 short paragraphs. Do not write one long paragraph.

Later-response structure:
1. Use the user's latest answer.
2. Clarify or deepen one concrete thread.
3. If enough material is present, close the position with an ultimate question and core insight.
4. Keep each paragraph short: usually 1-2 sentences. Use blank lines between paragraphs.

Completion criteria:
- Close when the user asks to close, seems impatient, gives very short answers, says they do not know, or has reached the turn limit.
- When closing, produce one ultimate question and one core insight for this position.

${forceCompletion ? (zh ? "用户选择关闭这个牌位。请温和地收束，不要继续追问。" : "The user chose to close this position. Gather it gently; do not keep probing.") : ""}
Current response count for this position: ${turnCount}. Maximum responses: 5.

Main question:
${originalQuestion}

All user inputs in this spread conversation:
${allUserInputs}

Spread:
${zh ? spread.nameZh : spread.nameEn} (${spread.id})

Spread map:
${formatSpreadMap(spread, language)}

${choiceA || choiceB ? `Choice A: ${choiceA || "(not provided)"}\nChoice B: ${choiceB || "(not provided)"}` : ""}

Current position:
${position.order}. ${zh ? position.titleZh : position.titleEn}

Position question:
${zh ? position.positionQuestionZh : position.positionQuestionEn}

Position purpose:
${purpose}

Drawn card:
${cardMeaning}

Additional local card information:
${localCardKnowledge}

User's first visual observation or feeling:
${userObservation || (zh ? "用户还没有写下对牌面的观察。" : "The user has not written an observation yet.")}

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

function formatSpreadMap(spread: TarotSpread, language: Language): string {
  return spread.positions
    .slice()
    .sort((a, b) => a.order - b.order)
    .map((position) => {
      const title = language === "zh" ? position.titleZh : position.titleEn;
      const question = language === "zh" ? position.positionQuestionZh : position.positionQuestionEn;
      return `${position.order}. ${title}: ${question}`;
    })
    .join("\n");
}

function formatAllUserInputs(readings: PositionReading[], language: Language): string {
  const lines: string[] = [];
  for (const reading of readings.slice().sort((a, b) => a.positionOrder - b.positionOrder)) {
    const title = language === "zh" ? reading.positionTitleZh : reading.positionTitleEn;
    if (reading.userObservation) {
      lines.push(`- ${title} observation: ${reading.userObservation}`);
    }
    for (const message of reading.dialogue) {
      if (message.role === "user") {
        lines.push(`- ${title} user input: ${message.content}`);
      }
    }
  }
  return lines.length ? lines.join("\n") : language === "zh" ? "暂无牌位内用户输入，只有原问题。" : "No position-level user input yet; only the original question is available.";
}

function formatPositionEvidence(reading: PositionReading, language: Language): string {
  const title = language === "zh" ? reading.positionTitleZh : reading.positionTitleEn;
  const question = language === "zh" ? reading.positionQuestionZh : reading.positionQuestionEn;
  const card = reading.card ? `${reading.card.nameEn} / ${reading.card.nameZh}` : "No card";
  const ultimate = reading.ultimateQuestionZh || reading.ultimateQuestionEn || "";
  const insight = reading.coreInsightZh || reading.coreInsightEn || "";
  const observation = reading.userObservation || "";
  return [
    `- Position ${reading.positionOrder}: ${title}`,
    `  Position question: ${question}`,
    `  Card: ${card}`,
    `  User observation: ${observation || "none"}`,
    `  Question left: ${ultimate || "none"}`,
    `  Core insight: ${insight || "none"}`
  ].join("\n");
}
