import type { DepthLevel, QuestionIntent } from "../types";

export type ParsedAIResponse =
  | {
      type: "card_entry";
      fromQuestion?: string;
      cardTitle?: string;
      cardRole?: string;
      cardMeaning?: string;
      spreadConnection?: string;
      inCurrentQuestion?: string;
      inYourQuestion?: string;
      questionToUser?: string;
      questionIntent?: QuestionIntent | null;
      depthLevel?: DepthLevel | null;
      builtFromUserWords?: string[];
      reframedQuestion?: string;
      newQuestion?: string;
      nextAction?: NextAction;
      suggestNextCard?: boolean;
      suggestedNextCardRole?: string;
      suggestedNextCardReason?: string;
    }
  | {
      type: "follow_up";
      fromQuestion?: string;
      cardTitle?: string;
      continuingWithCard?: string;
      response?: string;
      integratedUserAnswer?: string;
      wordAnchors?: string[];
      optionalQuestion?: string;
      questionStyle?: QuestionStyle;
      questionIntent?: QuestionIntent | null;
      depthLevel?: DepthLevel | null;
      builtFromUserWords?: string[];
      reframedQuestion?: string;
      nextAction?: NextAction;
      suggestNextCard?: boolean;
      suggestedNextCardRole?: string;
      suggestedNextCardReason?: string;
    }
  | {
      type: "resist";
      response?: string;
      optionalQuestion?: string;
      questionStyle?: QuestionStyle;
      questionIntent?: QuestionIntent | null;
      depthLevel?: DepthLevel | null;
      builtFromUserWords?: string[];
      reframedQuestion?: string;
      nextAction?: NextAction;
      suggestNextCard?: boolean;
      suggestedNextCardRole?: string;
      suggestedNextCardReason?: string;
    }
  | {
      type: "ending";
      response?: string;
      nextAction?: NextAction;
    }
  | {
      type: "ending_prompt";
      response?: string;
      nextAction?: NextAction;
    }
  | {
      type: "plain";
      plainText: string;
    }
  | {
      type: "legacy_transform";
      cardEntrance?: string;
      reflection?: string;
      hiddenTurn?: string;
      reframedQuestion?: string;
    };

export type NextAction =
  | "continue_current_card"
  | "suggest_new_card"
  | "suggest_new_card_or_finish"
  | "suggest_finish"
  | "ask_user_to_clarify"
  | "choose_word_anchor";

export type QuestionStyle =
  | "recent_moment"
  | "scene"
  | "body"
  | "trigger"
  | "avoidance"
  | "choice"
  | "none";

function stripCodeFence(value: string): string {
  return value
    .trim()
    .replace(/^```(?:json)?/i, "")
    .replace(/```$/i, "")
    .trim();
}

function stringOrUndefined(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function booleanOrUndefined(value: unknown): boolean | undefined {
  return typeof value === "boolean" ? value : undefined;
}

function stringArrayOrUndefined(value: unknown): string[] | undefined {
  if (!Array.isArray(value)) return undefined;
  const items = value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean);
  return items.length ? items : undefined;
}

function nextActionOrUndefined(value: unknown): NextAction | undefined {
  return value === "continue_current_card" ||
    value === "suggest_new_card" ||
    value === "suggest_new_card_or_finish" ||
    value === "suggest_finish" ||
    value === "ask_user_to_clarify" ||
    value === "choose_word_anchor"
    ? value
    : undefined;
}

function questionStyleOrUndefined(value: unknown): QuestionStyle | undefined {
  return value === "recent_moment" ||
    value === "scene" ||
    value === "body" ||
    value === "trigger" ||
    value === "avoidance" ||
    value === "choice" ||
    value === "none"
    ? value
    : undefined;
}

function questionIntentOrNull(value: unknown): QuestionIntent | null | undefined {
  return value === "recent_scene" ||
    value === "body_reaction" ||
    value === "trigger_event" ||
    value === "hidden_rule" ||
    value === "hidden_assumption" ||
    value === "missing_voice" ||
    value === "fear_vs_fact" ||
    value === "desire_ownership" ||
    value === "choice_point" ||
    value === "resistance" ||
    value === "relationship_actor" ||
    value === "next_small_action" ||
    value === "self_judgment" ||
    value === "comparison_standard" ||
    value === "social_rule" ||
    value === "worth_proof" ||
    value === "borrowed_desire" ||
    value === "impossible_choice" ||
    value === "emotional_structure" ||
    value === "summary_ready" ||
    value === "clarification" ||
    value === "other"
    ? value
    : value === null
      ? null
      : undefined;
}

function depthLevelOrNull(value: unknown): DepthLevel | null | undefined {
  return value === "scene" ||
    value === "structure" ||
    value === "self_relation" ||
    value === "integration" ||
    value === "summary"
    ? value
    : value === null
      ? null
      : undefined;
}

export function parseRitualAIResponse(content: string): ParsedAIResponse | null {
  try {
    const parsed = JSON.parse(stripCodeFence(content)) as Record<string, unknown>;
    if (!parsed || typeof parsed !== "object") return null;

    if (parsed.type === "card_entry") {
      return {
        type: "card_entry",
        fromQuestion: stringOrUndefined(parsed.fromQuestion),
        cardTitle: stringOrUndefined(parsed.cardTitle),
        cardRole: stringOrUndefined(parsed.cardRole),
        cardMeaning: stringOrUndefined(parsed.cardMeaning),
        spreadConnection: stringOrUndefined(parsed.spreadConnection),
        inCurrentQuestion: stringOrUndefined(parsed.inCurrentQuestion),
        inYourQuestion: stringOrUndefined(parsed.inYourQuestion),
        questionToUser: stringOrUndefined(parsed.questionToUser),
        questionIntent: questionIntentOrNull(parsed.questionIntent),
        depthLevel: depthLevelOrNull(parsed.depthLevel),
        builtFromUserWords: stringArrayOrUndefined(parsed.builtFromUserWords),
        reframedQuestion: stringOrUndefined(parsed.reframedQuestion),
        newQuestion: stringOrUndefined(parsed.newQuestion),
        nextAction: nextActionOrUndefined(parsed.nextAction),
        suggestNextCard: booleanOrUndefined(parsed.suggestNextCard),
        suggestedNextCardRole: stringOrUndefined(parsed.suggestedNextCardRole),
        suggestedNextCardReason: stringOrUndefined(parsed.suggestedNextCardReason)
      };
    }

    if (parsed.type === "follow_up") {
      return {
        type: "follow_up",
        fromQuestion: stringOrUndefined(parsed.fromQuestion),
        cardTitle: stringOrUndefined(parsed.cardTitle),
        continuingWithCard: stringOrUndefined(parsed.continuingWithCard),
        response: stringOrUndefined(parsed.response),
        integratedUserAnswer: stringOrUndefined(parsed.integratedUserAnswer),
        wordAnchors: stringArrayOrUndefined(parsed.wordAnchors),
        optionalQuestion: stringOrUndefined(parsed.optionalQuestion),
        questionStyle: questionStyleOrUndefined(parsed.questionStyle),
        questionIntent: questionIntentOrNull(parsed.questionIntent),
        depthLevel: depthLevelOrNull(parsed.depthLevel),
        builtFromUserWords: stringArrayOrUndefined(parsed.builtFromUserWords),
        reframedQuestion: stringOrUndefined(parsed.reframedQuestion),
        nextAction: nextActionOrUndefined(parsed.nextAction),
        suggestNextCard: booleanOrUndefined(parsed.suggestNextCard),
        suggestedNextCardRole: stringOrUndefined(parsed.suggestedNextCardRole),
        suggestedNextCardReason: stringOrUndefined(parsed.suggestedNextCardReason)
      };
    }

    if (parsed.type === "resist") {
      return {
        type: "resist",
        response: stringOrUndefined(parsed.response),
        optionalQuestion: stringOrUndefined(parsed.optionalQuestion),
        questionStyle: questionStyleOrUndefined(parsed.questionStyle),
        questionIntent: questionIntentOrNull(parsed.questionIntent),
        depthLevel: depthLevelOrNull(parsed.depthLevel),
        builtFromUserWords: stringArrayOrUndefined(parsed.builtFromUserWords),
        reframedQuestion: stringOrUndefined(parsed.reframedQuestion),
        nextAction: nextActionOrUndefined(parsed.nextAction),
        suggestNextCard: booleanOrUndefined(parsed.suggestNextCard),
        suggestedNextCardRole: stringOrUndefined(parsed.suggestedNextCardRole),
        suggestedNextCardReason: stringOrUndefined(parsed.suggestedNextCardReason)
      };
    }

    if (parsed.type === "ending") {
      return {
        type: "ending",
        response: stringOrUndefined(parsed.response),
        nextAction: nextActionOrUndefined(parsed.nextAction)
      };
    }

    if (parsed.type === "ending_prompt") {
      return {
        type: "ending_prompt",
        response: stringOrUndefined(parsed.response),
        nextAction: nextActionOrUndefined(parsed.nextAction)
      };
    }

    if (typeof parsed.plainText === "string") {
      return { type: "plain", plainText: parsed.plainText.trim() };
    }

    if (typeof parsed.reframedQuestion === "string") {
      return {
        type: "legacy_transform",
        cardEntrance: stringOrUndefined(parsed.cardEntrance),
        reflection: stringOrUndefined(parsed.reflection),
        hiddenTurn: stringOrUndefined(parsed.hiddenTurn),
        reframedQuestion: stringOrUndefined(parsed.reframedQuestion)
      };
    }

    return null;
  } catch {
    return null;
  }
}
