import type { CardNodeType, ConceptAnchorType, DepthLevel, FinalQuestionCandidate, QuestionIntent, SoraStage } from "../types";
import { parseJsonObject, stripJsonCodeFence } from "./jsonParsing";

export type ParsedAIResponse =
  | {
      type: "sora_scene";
      stage: "scene";
      response?: string;
      questionToUser?: string;
      questionIntent?: QuestionIntent | null;
      depthLevel?: DepthLevel | null;
      builtFromUserWords?: string[];
      nextAction?: NextAction;
    }
  | {
      type: "sora_rule";
      stage: "operating_rule";
      possibleRules?: string[];
      sourceUserWords?: string[];
      builtFromUserWords?: string[];
      response?: string;
      nextAction?: NextAction;
    }
  | {
      type: "sora_disruption";
      stage: "resonant_disruption";
      cardTitle?: string;
      cardMeaning?: string;
      operatingRule?: string;
      disruption?: string;
      resonanceOptions?: string[];
      builtFromUserWords?: string[];
      nextAction?: NextAction;
    }
  | {
      type: "sora_agency";
      stage: "agency";
      response?: string;
      questionCandidates?: FinalQuestionCandidate[];
      builtFromUserWords?: string[];
      nextAction?: NextAction;
    }
  | {
      type: "card_entry";
      stage?: SoraStage;
      fromQuestion?: string;
      cardTitle?: string;
      cardRole?: string;
      cardMeaning?: string;
      symbolConnection?: string;
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
      suggestedNodeType?: CardNodeType;
      suggestedNodeLabel?: string;
      suggestedNextCardRole?: string;
      suggestedNextCardReason?: string;
    }
  | {
      type: "follow_up";
      stage?: SoraStage;
      fromQuestion?: string;
      cardTitle?: string;
      continuingWithCard?: string;
      response?: string;
      integratedUserAnswer?: string;
      wordAnchors?: string[];
      conceptAnchors?: Array<{ text: string; type: ConceptAnchorType }>;
      optionalQuestion?: string;
      questionStyle?: QuestionStyle;
      questionIntent?: QuestionIntent | null;
      depthLevel?: DepthLevel | null;
      builtFromUserWords?: string[];
      reframedQuestion?: string;
      nextAction?: NextAction;
      suggestNextCard?: boolean;
      suggestedNodeType?: CardNodeType;
      suggestedNodeLabel?: string;
      suggestedNextCardRole?: string;
      suggestedNextCardReason?: string;
    }
  | {
      type: "resist";
      stage?: SoraStage;
      response?: string;
      optionalQuestion?: string;
      questionStyle?: QuestionStyle;
      questionIntent?: QuestionIntent | null;
      depthLevel?: DepthLevel | null;
      builtFromUserWords?: string[];
      reframedQuestion?: string;
      nextAction?: NextAction;
      suggestNextCard?: boolean;
      suggestedNodeType?: CardNodeType;
      suggestedNodeLabel?: string;
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
  | "choose_word_anchor"
  | "wait_for_user_response"
  | "user_confirm_rule"
  | "user_choose_resonance"
  | "user_select_question";

export type QuestionStyle =
  | "recent_moment"
  | "scene"
  | "body"
  | "trigger"
  | "avoidance"
  | "choice"
  | "time"
  | "none";

function stripCodeFence(value: string): string {
  return stripJsonCodeFence(value);
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
    value === "choose_word_anchor" ||
    value === "wait_for_user_response" ||
    value === "user_confirm_rule" ||
    value === "user_choose_resonance" ||
    value === "user_select_question"
    ? value
    : undefined;
}

function soraStageOrUndefined(value: unknown): SoraStage | undefined {
  return value === "initial_connection" ||
    value === "scene" ||
    value === "operating_rule" ||
    value === "resonant_disruption" ||
    value === "agency" ||
    value === "summary"
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
    value === "time" ||
    value === "none"
    ? value
    : undefined;
}

function unescapeJsonString(value: string): string | undefined {
  try {
    return JSON.parse(`"${value.replace(/\r?\n/g, "\\n")}"`);
  } catch {
    return value.replace(/\\"/g, '"').replace(/\\n/g, "\n").trim() || undefined;
  }
}

function looseStringField(content: string, field: string): string | undefined {
  const pattern = new RegExp(`"${field}"\\s*:\\s*"((?:\\\\.|[^"\\\\])*)"`, "s");
  const match = content.match(pattern);
  return match?.[1] ? unescapeJsonString(match[1]) : undefined;
}

function looseArrayField(content: string, field: string): string[] | undefined {
  const pattern = new RegExp(`"${field}"\\s*:\\s*\\[([\\s\\S]*?)\\]`, "s");
  const match = content.match(pattern);
  if (!match?.[1]) return undefined;
  const items = [...match[1].matchAll(/"((?:\\.|[^"\\])*)"/g)]
    .map((item) => unescapeJsonString(item[1]) || "")
    .map((item) => item.trim())
    .filter(Boolean);
  return items.length ? items : undefined;
}

function parseLooseRitualResponse(content: string): ParsedAIResponse | null {
  const stripped = stripCodeFence(content);
  if (!/^\s*\{/.test(stripped) || !/"type"\s*:/.test(stripped)) return null;
  const type = looseStringField(stripped, "type");
  if (type === "follow_up") {
    return {
      type: "follow_up",
      stage: soraStageOrUndefined(looseStringField(stripped, "stage")),
      fromQuestion: looseStringField(stripped, "fromQuestion"),
      cardTitle: looseStringField(stripped, "cardTitle"),
      continuingWithCard: looseStringField(stripped, "continuingWithCard"),
      response: looseStringField(stripped, "response"),
      integratedUserAnswer: looseStringField(stripped, "integratedUserAnswer"),
      wordAnchors: looseArrayField(stripped, "wordAnchors"),
      optionalQuestion: looseStringField(stripped, "optionalQuestion"),
      questionStyle: questionStyleOrUndefined(looseStringField(stripped, "questionStyle")),
      questionIntent: questionIntentOrNull(looseStringField(stripped, "questionIntent")),
      depthLevel: depthLevelOrNull(looseStringField(stripped, "depthLevel")),
      builtFromUserWords: looseArrayField(stripped, "builtFromUserWords"),
      reframedQuestion: looseStringField(stripped, "reframedQuestion"),
      nextAction: nextActionOrUndefined(looseStringField(stripped, "nextAction")),
      suggestedNextCardRole: looseStringField(stripped, "suggestedNextCardRole"),
      suggestedNextCardReason: looseStringField(stripped, "suggestedNextCardReason")
    };
  }
  if (type === "card_entry") {
    return {
      type: "card_entry",
      stage: soraStageOrUndefined(looseStringField(stripped, "stage")),
      cardTitle: looseStringField(stripped, "cardTitle"),
      cardRole: looseStringField(stripped, "cardRole"),
      cardMeaning: looseStringField(stripped, "cardMeaning"),
      symbolConnection: looseStringField(stripped, "symbolConnection"),
      spreadConnection: looseStringField(stripped, "spreadConnection"),
      inCurrentQuestion: looseStringField(stripped, "inCurrentQuestion"),
      inYourQuestion: looseStringField(stripped, "inYourQuestion"),
      questionToUser: looseStringField(stripped, "questionToUser"),
      questionIntent: questionIntentOrNull(looseStringField(stripped, "questionIntent")),
      depthLevel: depthLevelOrNull(looseStringField(stripped, "depthLevel")),
      builtFromUserWords: looseArrayField(stripped, "builtFromUserWords"),
      reframedQuestion: looseStringField(stripped, "reframedQuestion"),
      nextAction: nextActionOrUndefined(looseStringField(stripped, "nextAction")),
      suggestedNextCardRole: looseStringField(stripped, "suggestedNextCardRole"),
      suggestedNextCardReason: looseStringField(stripped, "suggestedNextCardReason")
    };
  }
  return null;
}

function questionIntentOrNull(value: unknown): QuestionIntent | null | undefined {
  return value === "symbol_question_connection" ||
    value === "recent_scene" ||
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

function cardNodeTypeOrUndefined(value: unknown): CardNodeType | undefined {
  return value === "first_symbol" ||
    value === "word_anchor" ||
    value === "hidden_rule" ||
    value === "resistance" ||
    value === "unclear_part" ||
    value === "missing_voice" ||
    value === "contradiction" ||
    value === "possible_shift" ||
    value === "user_requested_angle" ||
    value === "carry_forward"
    ? value
    : undefined;
}

function conceptAnchorTypeOrOther(value: unknown): ConceptAnchorType {
  return value === "emotion" ||
    value === "behavior" ||
    value === "relationship" ||
    value === "self_judgment" ||
    value === "body" ||
    value === "time" ||
    value === "conflict" ||
    value === "rule" ||
    value === "loss_of_control" ||
    value === "action_block" ||
    value === "other"
    ? value
    : "other";
}

function conceptAnchorArrayOrUndefined(value: unknown): Array<{ text: string; type: ConceptAnchorType }> | undefined {
  if (!Array.isArray(value)) return undefined;
  const items = value
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const record = item as Record<string, unknown>;
      const text = stringOrUndefined(record.text);
      if (!text) return null;
      return { text, type: conceptAnchorTypeOrOther(record.type) };
    })
    .filter((item): item is { text: string; type: ConceptAnchorType } => Boolean(item));
  return items.length ? items : undefined;
}

export function parseRitualAIResponse(content: string): ParsedAIResponse | null {
  try {
    const parsed = parseJsonObject(content);
    if (!parsed || typeof parsed !== "object") return parseLooseRitualResponse(content);

    if (parsed.type === "sora_scene") {
      return {
        type: "sora_scene",
        stage: "scene",
        response: stringOrUndefined(parsed.response),
        questionToUser: stringOrUndefined(parsed.questionToUser),
        questionIntent: questionIntentOrNull(parsed.questionIntent),
        depthLevel: depthLevelOrNull(parsed.depthLevel),
        builtFromUserWords: stringArrayOrUndefined(parsed.builtFromUserWords),
        nextAction: nextActionOrUndefined(parsed.nextAction)
      };
    }

    if (parsed.type === "sora_rule") {
      return {
        type: "sora_rule",
        stage: "operating_rule",
        possibleRules: stringArrayOrUndefined(parsed.possibleRules),
        sourceUserWords: stringArrayOrUndefined(parsed.sourceUserWords),
        builtFromUserWords: stringArrayOrUndefined(parsed.builtFromUserWords),
        response: stringOrUndefined(parsed.response),
        nextAction: nextActionOrUndefined(parsed.nextAction)
      };
    }

    if (parsed.type === "sora_disruption") {
      return {
        type: "sora_disruption",
        stage: "resonant_disruption",
        cardTitle: stringOrUndefined(parsed.cardTitle),
        cardMeaning: stringOrUndefined(parsed.cardMeaning),
        operatingRule: stringOrUndefined(parsed.operatingRule),
        disruption: stringOrUndefined(parsed.disruption),
        resonanceOptions: stringArrayOrUndefined(parsed.resonanceOptions),
        builtFromUserWords: stringArrayOrUndefined(parsed.builtFromUserWords),
        nextAction: nextActionOrUndefined(parsed.nextAction)
      };
    }

    if (parsed.type === "sora_agency") {
      const questionCandidates: FinalQuestionCandidate[] | undefined = Array.isArray(parsed.questionCandidates)
        ? parsed.questionCandidates
            .filter((item): item is Record<string, unknown> => Boolean(item && typeof item === "object"))
            .map((item, index): FinalQuestionCandidate => ({
              style:
                item.style === "direct" || item.style === "action-oriented" || item.style === "gentle"
                  ? item.style
                  : index === 1
                    ? "direct"
                    : index === 2
                      ? "action-oriented"
                      : "gentle",
              question: stringOrUndefined(item.question) || ""
            }))
            .filter((item) => item.question)
        : undefined;
      return {
        type: "sora_agency",
        stage: "agency",
        response: stringOrUndefined(parsed.response),
        questionCandidates,
        builtFromUserWords: stringArrayOrUndefined(parsed.builtFromUserWords),
        nextAction: nextActionOrUndefined(parsed.nextAction)
      };
    }

    if (parsed.type === "card_entry") {
      return {
        type: "card_entry",
        stage: soraStageOrUndefined(parsed.stage),
        fromQuestion: stringOrUndefined(parsed.fromQuestion),
        cardTitle: stringOrUndefined(parsed.cardTitle),
        cardRole: stringOrUndefined(parsed.cardRole),
        cardMeaning: stringOrUndefined(parsed.cardMeaning),
        symbolConnection: stringOrUndefined(parsed.symbolConnection),
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
        suggestedNodeType: cardNodeTypeOrUndefined(parsed.suggestedNodeType),
        suggestedNodeLabel: stringOrUndefined(parsed.suggestedNodeLabel),
        suggestedNextCardRole: stringOrUndefined(parsed.suggestedNextCardRole),
        suggestedNextCardReason: stringOrUndefined(parsed.suggestedNextCardReason)
      };
    }

    if (parsed.type === "follow_up") {
      return {
        type: "follow_up",
        stage: soraStageOrUndefined(parsed.stage),
        fromQuestion: stringOrUndefined(parsed.fromQuestion),
        cardTitle: stringOrUndefined(parsed.cardTitle),
        continuingWithCard: stringOrUndefined(parsed.continuingWithCard),
        response: stringOrUndefined(parsed.response),
        integratedUserAnswer: stringOrUndefined(parsed.integratedUserAnswer),
        wordAnchors: stringArrayOrUndefined(parsed.wordAnchors),
        conceptAnchors: conceptAnchorArrayOrUndefined(parsed.conceptAnchors),
        optionalQuestion: stringOrUndefined(parsed.optionalQuestion),
        questionStyle: questionStyleOrUndefined(parsed.questionStyle),
        questionIntent: questionIntentOrNull(parsed.questionIntent),
        depthLevel: depthLevelOrNull(parsed.depthLevel),
        builtFromUserWords: stringArrayOrUndefined(parsed.builtFromUserWords),
        reframedQuestion: stringOrUndefined(parsed.reframedQuestion),
        nextAction: nextActionOrUndefined(parsed.nextAction),
        suggestNextCard: booleanOrUndefined(parsed.suggestNextCard),
        suggestedNodeType: cardNodeTypeOrUndefined(parsed.suggestedNodeType),
        suggestedNodeLabel: stringOrUndefined(parsed.suggestedNodeLabel),
        suggestedNextCardRole: stringOrUndefined(parsed.suggestedNextCardRole),
        suggestedNextCardReason: stringOrUndefined(parsed.suggestedNextCardReason)
      };
    }

    if (parsed.type === "resist") {
      return {
        type: "resist",
        stage: soraStageOrUndefined(parsed.stage),
        response: stringOrUndefined(parsed.response),
        optionalQuestion: stringOrUndefined(parsed.optionalQuestion),
        questionStyle: questionStyleOrUndefined(parsed.questionStyle),
        questionIntent: questionIntentOrNull(parsed.questionIntent),
        depthLevel: depthLevelOrNull(parsed.depthLevel),
        builtFromUserWords: stringArrayOrUndefined(parsed.builtFromUserWords),
        reframedQuestion: stringOrUndefined(parsed.reframedQuestion),
        nextAction: nextActionOrUndefined(parsed.nextAction),
        suggestNextCard: booleanOrUndefined(parsed.suggestNextCard),
        suggestedNodeType: cardNodeTypeOrUndefined(parsed.suggestedNodeType),
        suggestedNodeLabel: stringOrUndefined(parsed.suggestedNodeLabel),
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
    return parseLooseRitualResponse(content);
  }
}
