export type Language = "en" | "zh";

export type ChatRole = "user" | "assistant" | "card" | "system";

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
  order: number;
  cardName: string;
  cardNameZh?: string;
  role: string;
  reason?: string;
  drawnAt: string;
  isActive: boolean;
  userTurnCount: number;
  aiQuestionCount: number;
};

export type WordAnchor = {
  id: string;
  text: string;
  sourceMessageId: string;
  cardId: string;
  selected: boolean;
  createdAt: string;
};

export type QuestionIntent =
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

export type DepthLevel = "scene" | "structure" | "self_relation" | "integration" | "summary";

export type AskedQuestionIntent = {
  intent: QuestionIntent;
  depthLevel: DepthLevel;
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

export type ParchmentSummary = {
  type?: "parchment_summary";
  originalQuestion: string;
  currentQuestion: string;
  questionPath: ParchmentQuestionPathItem[];
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
  questionHistory: QuestionTransform[];
  createdAt: string;
  updatedAt: string;
  language: Language;
  spreadCards: SpreadCard[];
  wordAnchors: WordAnchor[];
  askedQuestionIntents: AskedQuestionIntent[];
  cards?: string[];
  messages: ChatMessage[];
  endedForNow: boolean;
  parchmentSummary?: ParchmentSummary;
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
