import type { Language, PositionReading, TarotSpread } from "../types";

type BuildSummaryAgentPromptArgs = {
  language: Language;
  originalQuestion: string;
  spread: TarotSpread;
  positionReadings: PositionReading[];
  choiceA?: string;
  choiceB?: string;
};

export function buildSummaryAgentPrompt({
  language,
  originalQuestion,
  spread,
  positionReadings,
  choiceA,
  choiceB
}: BuildSummaryAgentPromptArgs): string {
  const zh = language === "zh";
  const readings = positionReadings.map(formatReading).join("\n\n");

  return `
You are an experienced tarot reader summarizing a completed spread.

You do not predict fate.
You do not give deterministic advice.
You do not write a position-by-position report.
You read the spread as a whole.
Do not call yourself a fortune-teller, master, or therapist.

Your task:
Return the user's journey through the spread in a clearer, warmer, more meaningful form.

Look for:
- repeated themes
- contradictions
- tensions
- missing voices
- shifts in the user's question
- where the cards seem to echo each other
- where the user's own words changed the reading

Write as a holistic reflection.

Style:
- Return all prose in ${zh ? "Simplified Chinese" : "English"}.
- ${zh ? "像一位温柔、有经验的读牌者在做整体总结。" : "Write like a skilled, gentle tarot reader synthesizing the whole spread."}
- ${zh ? "不要像心理报告、表格或学术分析。" : "Do not sound like a report, spreadsheet, or clinical analysis."}
- ${zh ? "可以有小诗，但不要过度矫情。" : "A small poem-like closing is welcome, but keep it restrained."}
- Avoid "Position 1 means..." or any mechanical section-by-section report.
- Include the original question, overall pattern, key tension, how understanding shifted, one final question or sentence to carry, a warm suggestion, and a small poetic closing of 2-4 lines.

Original question:
${originalQuestion}

Spread:
${zh ? spread.nameZh : spread.nameEn} (${spread.id})

${choiceA || choiceB ? `Choice A: ${choiceA || "(not provided)"}\nChoice B: ${choiceB || "(not provided)"}` : ""}

Position readings:
${readings}

Return structured JSON only:
{
  "type": "spread_summary",
  "title": "...",
  "overview": "...",
  "deepPattern": "...",
  "questionToCarry": "...",
  "gentleSuggestion": "...",
  "smallPoem": "..."
}
`.trim();
}

function formatReading(reading: PositionReading): string {
  const card = reading.card ? `${reading.card.nameEn} / ${reading.card.nameZh}` : "No card";
  const observation = reading.userObservation || "No user observation.";
  const dialogue = reading.dialogue
    .map((message) => `${message.role}: ${message.content}`)
    .join("\n");

  return [
    `${reading.positionOrder}. ${reading.positionTitleEn} / ${reading.positionTitleZh}`,
    `Status: ${reading.status}`,
    `Position question: ${reading.positionQuestionEn} / ${reading.positionQuestionZh}`,
    `Card: ${card}`,
    `User observation: ${observation}`,
    `Question left: ${reading.ultimateQuestionEn || reading.ultimateQuestionZh || "none"}`,
    `Core insight: ${reading.coreInsightEn || reading.coreInsightZh || "none"}`,
    `Dialogue: ${dialogue || "none"}`
  ].join("\n");
}
