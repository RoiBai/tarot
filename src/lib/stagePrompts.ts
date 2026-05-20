import type { Language, SoraStage } from "../types";

export function getUserFacingStagePrompt(stage: SoraStage, language: Language): string {
  const zh = language === "zh";
  switch (stage) {
    case "initial_connection":
      return zh ? "让牌和问题先相遇" : "Let the card and question meet";
    case "scene":
      return zh ? "先从这里靠近它" : "Approach it from here";
    case "operating_rule":
      return zh ? "这里好像浮出一个规则" : "A rule seems to be appearing underneath";
    case "resonant_disruption":
      return zh ? "让这张牌带来另一个方向" : "Let this card open another direction";
    case "agency":
      return zh ? "选择一个可以继续带着的问题" : "Choose a question to carry forward";
    case "summary":
      return zh ? "把留下的线索收成一卷" : "Gather the traces into a scroll";
    default:
      return zh ? "沿着问题慢慢看" : "Follow the question gently";
  }
}
