import type { TarotDeckCard } from "../lib/tarotDeck";

export type Language = "en" | "zh";

export type ChatRole = "user" | "assistant" | "card" | "system";

export type SoraStage = "initial_connection" | "scene" | "operating_rule" | "resonant_disruption" | "agency" | "summary";

export type InteractionState =
  | "breathing"
  | "question_entry"
  | "opening_major_arcana"
  | "opening_symbol_selection"
  | "chat"
  | "drawing_new_card"
  | "new_card_keyword_selection"
  | "pushback"
  | "reflection_scroll";

export type ActiveTask =
  | "answer_ai_question"
  | "choose_word_anchor"
  | "choose_card_keyword"
  | "draw_new_card"
  | "pushback"
  | "summary"
  | "idle";

export type CardNodeType =
  | "first_symbol"
  | "word_anchor"
  | "hidden_rule"
  | "resistance"
  | "unclear_part"
  | "missing_voice"
  | "contradiction"
  | "possible_shift"
  | "user_requested_angle"
  | "carry_forward";

export type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
  timestamp: string;
  cardName?: string;
  type?: "question_shift";
  fromQuestion?: string;
  toQuestion?: string;
};

export type SpreadCard = {
  id: string;
  deckCardId?: string;
  order: number;
  cardName: string;
  cardNameZh?: string;
  role: string;
  reason?: string;
  nodeType?: CardNodeType;
  nodeLabel?: string;
  drawnFor?: string;
  sourceAnchorId?: string;
  cardKeywords?: string[];
  selectedCardKeyword?: string;
  cardMismatchReason?: string;
  drawnAt: string;
  isActive: boolean;
  userTurnCount: number;
  aiQuestionCount: number;
};

export type WordAnchor = {
  id: string;
  text: string;
  sourceMessageId: string;
  cardId?: string;
  stage: SoraStage;
  selected: boolean;
  createdAt: string;
};

export type OperatingRule = {
  id: string;
  text: string;
  sourceUserWords: string[];
  confirmedByUser: boolean;
  createdAt: string;
};

export type QuestionIntent =
  | "symbol_question_connection"
  | "recent_scene"
  | "body_reaction"
  | "trigger_event"
  | "hidden_rule"
  | "hidden_assumption"
  | "missing_voice"
  | "fear_vs_fact"
  | "desire_ownership"
  | "choice_point"
  | "resistance"
  | "relationship_actor"
  | "next_small_action"
  | "self_judgment"
  | "comparison_standard"
  | "social_rule"
  | "worth_proof"
  | "borrowed_desire"
  | "impossible_choice"
  | "emotional_structure"
  | "summary_ready"
  | "clarification"
  | "other";

export type GroundingEntryType =
  | "recent_scene"
  | "body_signal"
  | "trigger_object"
  | "relationship_actor"
  | "repeated_word"
  | "avoidance_moment"
  | "comparison_target"
  | "choice_block"
  | "environment"
  | "time_pattern"
  | "unnamed_part"
  | "card_impression";

export type UsedGroundingEntryType = {
  type: GroundingEntryType;
  questionText: string;
  cardId?: string;
  createdAt: string;
};

export type SpreadId = "one-card-deep-dive" | "two-choice" | "past-present-future" | "celtic-cross";

export type SpreadPosition = {
  id: string;
  order: number;
  titleZh: string;
  titleEn: string;
  positionQuestionZh: string;
  positionQuestionEn: string;
  agentGoalZh: string;
  agentGoalEn: string;
  layout: {
    x: number;
    y: number;
    rotate?: number;
    overlap?: boolean;
  };
};

export type TarotSpread = {
  id: SpreadId;
  nameZh: string;
  nameEn: string;
  descriptionZh: string;
  descriptionEn: string;
  recommendedForZh: string;
  recommendedForEn: string;
  type: "simple" | "celtic";
  positions: SpreadPosition[];
};

export type PositionReadingStatus = "empty" | "active" | "completed" | "skipped";

export type PositionReading = {
  spreadId: string;
  positionId: string;
  positionOrder: number;
  positionTitleZh: string;
  positionTitleEn: string;
  positionQuestionZh: string;
  positionQuestionEn: string;
  agentGoalZh: string;
  agentGoalEn: string;
  card?: TarotDeckCard;
  userObservation?: string;
  dialogue: ChatMessage[];
  ultimateQuestionZh?: string;
  ultimateQuestionEn?: string;
  coreInsightZh?: string;
  coreInsightEn?: string;
  status: PositionReadingStatus;
  turnCount: number;
};

export type PositionAgentStructuredResponse = {
  type: "position_agent_response" | "position_agent_completion";
  response: string;
  questionToUser: string | null;
  shouldComplete: boolean;
  ultimateQuestion: string | null;
  coreInsight: string | null;
};

export type SpreadSummary = {
  type: "spread_summary";
  title: string;
  overview: string;
  deepPattern: string;
  questionToCarry: string;
  gentleSuggestion: string;
  smallPoem: string;
  createdAt: string;
};

export type ConceptAnchorType =
  | "emotion"
  | "behavior"
  | "relationship"
  | "self_judgment"
  | "body"
  | "time"
  | "conflict"
  | "rule"
  | "loss_of_control"
  | "action_block"
  | "other";

export type ConceptAnchor = {
  id: string;
  text: string;
  type: ConceptAnchorType;
  sourceMessageId: string;
  cardId?: string;
  selected?: boolean;
  createdAt: string;
};

export type DepthLevel = "scene" | "structure" | "self_relation" | "integration" | "summary";

export type AskedQuestionIntent = {
  intent: QuestionIntent;
  depthLevel: DepthLevel;
  soraStage: SoraStage;
  questionText: string;
  cardId?: string;
  createdAt: string;
};

export type QuestionTransform = {
  id: string;
  fromQuestion: string;
  toQuestion: string;
  reason?: string;
  cardName?: string;
  cardRole?: string;
  operatingRule?: string;
  createdAt: string;
};

export type ParchmentPieceKind =
  | "small_answer"
  | "small_question"
  | "hidden_concern"
  | "repeated_feeling"
  | "tension"
  | "word_anchor"
  | "card_insight";

export type ParchmentSmallPiece = {
  kind?: ParchmentPieceKind;
  text: string;
  source?: string;
  sourceWords?: string[];
};

export type ParchmentQuestionPathItem = {
  from: string;
  to: string;
  why?: string;
};

export type FinalQuestionCandidate = {
  style: "gentle" | "direct" | "action-oriented";
  question: string;
};

export type SpreadGrowthEntry = {
  order: number;
  cardName: string;
  drawnFor: string;
  nodeType?: CardNodeType;
  nodeLabel?: string;
};

export type FirstCardImpression = {
  cardName: string;
  impressionText: string;
  selectedChip?: string;
  createdAt: string;
};

export type SymbolSelection = {
  id: string;
  cardId: string;
  symbolId: string;
  symbolLabel: string;
  selectedDirection?: string;
  customMeaning?: string;
  createdAt: string;
};

export type RandomnessReflection = {
  id: string;
  cardId: string;
  questionText: string;
  perceivedConnection: "yes" | "a_little" | "not_yet" | "self_connected" | "resist";
  helpedShift?: "yes" | "a_little" | "no" | "resist";
  createdAt: string;
};

export type ParchmentSummary = {
  type?: "parchment_summary";
  originalQuestion: string;
  currentQuestion: string;
  questionPath: ParchmentQuestionPathItem[];
  concreteScenes: string[];
  operatingRules: string[];
  cardDisruptions: string[];
  selectedWordAnchors: string[];
  spreadGrowthStory: SpreadGrowthEntry[];
  firstRandomCard?: string;
  firstImpression?: string;
  randomnessReflectionSummary?: string;
  finalCurrentQuestion: string;
  smallPieces: ParchmentSmallPiece[];
  connection: string;
  finalQuestionCandidates: FinalQuestionCandidate[];
  selectedFinalQuestion?: string;
  userEditedFinalQuestion?: string;
  finalQuestionToCarry?: string;
  smallQuestionToCarry: string;
  gentleSuggestion: string;
  /** Legacy summary fields kept for older saved chats. */
  questionHistory: QuestionTransform[];
  cards: SpreadCard[];
  keyUserReflections: string[];
  emergingPattern: string;
  finalQuestion?: string;
  encouragement: string;
  createdAt: string;
};

export type ChatThread = {
  id: string;
  title: string;
  originalQuestion: string;
  currentQuestion: string;
  firstCardImpression?: FirstCardImpression;
  openingSymbolSelection?: SymbolSelection;
  currentStage: SoraStage;
  questionHistory: QuestionTransform[];
  operatingRules: OperatingRule[];
  createdAt: string;
  updatedAt: string;
  language: Language;
  spreadCards: SpreadCard[];
  wordAnchors: WordAnchor[];
  conceptAnchors?: ConceptAnchor[];
  randomnessReflections: RandomnessReflection[];
  usedGroundingEntryTypes: UsedGroundingEntryType[];
  askedQuestionIntents: AskedQuestionIntent[];
  cards?: string[];
  messages: ChatMessage[];
  endedForNow: boolean;
  parchmentSummary?: ParchmentSummary;
  spreadId?: SpreadId;
  spreadName?: string;
  spreadPositions?: PositionReading[];
  currentPositionIndex?: number;
  choiceA?: string;
  choiceB?: string;
  summary?: SpreadSummary;
};

export type Settings = {
  language: Language;
  cameraEnabled: boolean;
  layoutMode: "auto" | "mobile-preview" | "desktop-preview";
  visualIntensity: "minimal" | "mystical" | "full-ritual";
  apiKeyStorage: "local" | "session";
  model: string;
  baseUrl: string;
};
