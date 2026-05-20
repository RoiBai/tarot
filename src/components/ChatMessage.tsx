import { useState } from "react";
import { parseRitualAIResponse, type ParsedAIResponse } from "../lib/aiResponse";
import type { ChatMessage as ChatMessageType, FinalQuestionCandidate, Language } from "../types";
import QuestionTransformation from "./QuestionTransformation";

type Props = {
  message: ChatMessageType;
  language: Language;
  onSuggestedNextCard?: (role: string, reason?: string) => void;
  onSuggestedFinish?: () => void;
  onStayCurrentCard?: () => void;
  onConfirmRule?: (rule: string, sourceWords: string[]) => void;
  onEditRule?: (rule: string) => void;
  onRejectRule?: () => void;
  onChooseResonance?: (choice: string) => void;
  onSelectQuestion?: (question: string, style?: string) => void;
};

type RitualData = {
  response?: string;
  possibleRules?: string[];
  sourceUserWords?: string[];
  cardMeaning?: string;
  disruption?: string;
  resonanceOptions?: string[];
  questionCandidates?: FinalQuestionCandidate[];
  symbolConnection?: string;
  spreadConnection?: string;
  inCurrentQuestion?: string;
  inYourQuestion?: string;
  questionToUser?: string;
  optionalQuestion?: string;
};

export default function ChatMessage({
  message,
  language,
  onSuggestedNextCard,
  onSuggestedFinish,
  onStayCurrentCard,
  onConfirmRule,
  onEditRule,
  onRejectRule,
  onChooseResonance,
  onSelectQuestion
}: Props) {
  const ritual = message.role === "assistant" ? parseRitualAIResponse(message.content) : null;

  if (message.role === "system" && message.type === "question_shift" && message.fromQuestion && message.toQuestion) {
    return (
      <article className="message message-system message-question-shift">
        <QuestionTransformation fromQuestion={message.fromQuestion} toQuestion={message.toQuestion} language={language} />
        <MessageTime timestamp={message.timestamp} language={language} />
      </article>
    );
  }

  if (message.role === "assistant" && ritual) {
    return (
      <article className="message message-assistant message-ai-ritual">
        <MessageKind role={message.role} language={language} />
        <RitualResponse
          response={ritual}
          language={language}
          onSuggestedNextCard={onSuggestedNextCard}
          onSuggestedFinish={onSuggestedFinish}
          onStayCurrentCard={onStayCurrentCard}
          onConfirmRule={onConfirmRule}
          onEditRule={onEditRule}
          onRejectRule={onRejectRule}
          onChooseResonance={onChooseResonance}
          onSelectQuestion={onSelectQuestion}
        />
        <MessageTime timestamp={message.timestamp} language={language} />
      </article>
    );
  }

  if (message.role === "assistant" && looksLikeJsonObject(message.content)) {
    return (
      <article className="message message-assistant message-ai-ritual">
        <MessageKind role={message.role} language={language} />
        <div className="ai-ritual-card">
          <MaybeSection title={labels(language).response} content={extractLooseField(message.content, "response") || extractLooseField(message.content, "cardMeaning") || extractLooseField(message.content, "reflection")} />
          <MaybeQuestion title={labels(language).continueQuestion} content={extractLooseField(message.content, "optionalQuestion") || extractLooseField(message.content, "questionToUser")} />
        </div>
        <MessageTime timestamp={message.timestamp} language={language} />
      </article>
    );
  }

  return (
    <article className={`message message-${message.role}`}>
      <MessageKind role={message.role} language={language} />
      <p>{message.content}</p>
      <MessageTime timestamp={message.timestamp} language={language} />
    </article>
  );
}

function looksLikeJsonObject(content: string) {
  return /^\s*(?:```json\s*)?\{/.test(content) && /"type"\s*:/.test(content);
}

function extractLooseField(content: string, field: string) {
  const stripped = content.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "");
  const match = stripped.match(new RegExp(`"${field}"\\s*:\\s*"((?:\\\\.|[^"\\\\])*)"`, "s"));
  if (!match?.[1]) return "";
  try {
    return JSON.parse(`"${match[1].replace(/\r?\n/g, "\\n")}"`);
  } catch {
    return match[1].replace(/\\"/g, '"').replace(/\\n/g, "\n");
  }
}

function RitualResponse({
  response,
  language,
  onSuggestedNextCard,
  onSuggestedFinish,
  onStayCurrentCard,
  onConfirmRule,
  onEditRule,
  onRejectRule,
  onChooseResonance,
  onSelectQuestion
}: {
  response: ParsedAIResponse;
  language: Language;
  onSuggestedNextCard?: (role: string, reason?: string) => void;
  onSuggestedFinish?: () => void;
  onStayCurrentCard?: () => void;
  onConfirmRule?: (rule: string, sourceWords: string[]) => void;
  onEditRule?: (rule: string) => void;
  onRejectRule?: () => void;
  onChooseResonance?: (choice: string) => void;
  onSelectQuestion?: (question: string, style?: string) => void;
}) {
  const label = labels(language);
  const data = response as RitualData;

  if (response.type === "sora_rule") {
    return (
      <div className="ai-ritual-card">
        <MaybeSection title={label.response} content={data.response} />
        <RuleChoicePanel
          rules={Array.isArray(data.possibleRules) ? data.possibleRules : []}
          sourceWords={Array.isArray(data.sourceUserWords) ? data.sourceUserWords : []}
          label={label}
          onConfirmRule={onConfirmRule}
          onEditRule={onEditRule}
          onRejectRule={onRejectRule}
        />
      </div>
    );
  }

  if (response.type === "sora_disruption") {
    return (
      <div className="ai-ritual-card">
        <MaybeSection title={label.cardMeaning} content={data.cardMeaning} />
        <MaybeSection title={label.disruption} content={data.disruption} />
        <ResonancePanel options={language === "zh" ? label.defaultResonanceOptions : data.resonanceOptions || label.defaultResonanceOptions} onChoose={onChooseResonance} />
      </div>
    );
  }

  if (response.type === "sora_agency") {
    return (
      <div className="ai-ritual-card">
        <MaybeSection title={label.response} content={data.response} />
        <QuestionCandidatePanel candidates={data.questionCandidates || []} label={label} onSelectQuestion={onSelectQuestion} />
      </div>
    );
  }

  if (response.type === "ending_prompt") {
    return (
      <div className="ai-ritual-card">
        <MaybeSection title={label.response} content={data.response} />
        <SummaryActionPanel
          label={label}
          onSuggestedNextCard={onSuggestedNextCard}
          onSuggestedFinish={onSuggestedFinish}
          onStayCurrentCard={onStayCurrentCard}
        />
      </div>
    );
  }

  const primaryTitle = response.type === "follow_up" || response.type === "resist" ? label.response : label.cardMeaning;
  const embeddedQuestion = splitTrailingQuestion(data.inCurrentQuestion || data.inYourQuestion);
  const explicitQuestion = data.questionToUser || data.optionalQuestion;
  const fallbackQuestion =
    !explicitQuestion && !embeddedQuestion.question && !responseSuggestsAction(response)
      ? label.fallbackQuestion
      : "";

  return (
    <div className="ai-ritual-card">
      <MaybeSection title={primaryTitle} content={data.cardMeaning || data.response} />
      <MaybeSection content={data.symbolConnection} />
      <MaybeSection content={embeddedQuestion.body} />
      <MaybeSection title={label.spreadConnection} content={data.spreadConnection} />
      <MaybeQuestion title={label.continueQuestion} content={explicitQuestion || embeddedQuestion.question || fallbackQuestion} />
      <NextActionPanel
        response={response as Extract<ParsedAIResponse, { type: "card_entry" | "follow_up" | "resist" }>}
        label={label}
      />
    </div>
  );
}

function RuleChoicePanel({
  rules,
  sourceWords,
  label,
  onConfirmRule,
  onEditRule,
  onRejectRule
}: {
  rules: string[];
  sourceWords: string[];
  label: ReturnType<typeof labels>;
  onConfirmRule?: (rule: string, sourceWords: string[]) => void;
  onEditRule?: (rule: string) => void;
  onRejectRule?: () => void;
}) {
  const [answered, setAnswered] = useState(false);
  if (answered || !rules.length) return null;
  const closeAfter = (action?: () => void) => {
    setAnswered(true);
    action?.();
  };
  return (
    <div className="sora-choice-panel">
      {rules.map((rule) => (
        <article className="sora-rule-option" key={rule}>
          <p>{rule}</p>
          <div className="button-row">
            <button className="primary-action" onClick={() => closeAfter(() => onConfirmRule?.(rule, sourceWords))}>
              {label.ruleYes}
            </button>
            <button className="ghost-action" onClick={() => closeAfter(() => onEditRule?.(rule))}>
              {label.ruleEdit}
            </button>
          </div>
        </article>
      ))}
      <button className="ghost-action" onClick={() => closeAfter(onRejectRule)}>
        {label.ruleOther}
      </button>
    </div>
  );
}

function ResonancePanel({ options, onChoose }: { options: string[]; onChoose?: (choice: string) => void }) {
  const [answered, setAnswered] = useState(false);
  if (answered) return null;
  const softened = softenResonanceOptions(options);
  return (
    <div className="sora-choice-panel resonance-options">
      {softened.map((option) => (
        <button
          key={option}
          className="ghost-action"
          onClick={() => {
            setAnswered(true);
            onChoose?.(option);
          }}
        >
          {option}
        </button>
      ))}
    </div>
  );
}

function QuestionCandidatePanel({
  candidates,
  label,
  onSelectQuestion
}: {
  candidates: FinalQuestionCandidate[];
  label: ReturnType<typeof labels>;
  onSelectQuestion?: (question: string, style?: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const [answered, setAnswered] = useState(false);
  if (answered) return null;
  const choose = (question: string, style?: string) => {
    setAnswered(true);
    onSelectQuestion?.(question, style);
  };
  return (
    <div className="sora-choice-panel agency-options">
      {candidates.slice(0, 3).map((candidate) => (
        <article className="agency-question-option" key={`${candidate.style}-${candidate.question}`}>
          <span>{label.styleName(candidate.style)}</span>
          <p>{candidate.question}</p>
          <div className="button-row">
            <button className="primary-action" onClick={() => choose(candidate.question, candidate.style)}>
              {label.chooseQuestion}
            </button>
            <button
              className="ghost-action"
              onClick={() => {
                setEditing(true);
                setDraft(candidate.question);
              }}
            >
              {label.editQuestion}
            </button>
          </div>
        </article>
      ))}
      <button
        className="ghost-action"
        onClick={() => {
          setEditing(true);
          setDraft("");
        }}
      >
        {label.noneFit}
      </button>
      {editing && (
        <div className="agency-question-editor">
          <textarea value={draft} onChange={(event) => setDraft(event.target.value)} placeholder={label.writeOwnQuestion} />
          <button className="primary-action" disabled={!draft.trim()} onClick={() => choose(draft.trim(), "edited")}>
            {label.saveQuestion}
          </button>
        </div>
      )}
    </div>
  );
}

function NextActionPanel({
  response,
  label
}: {
  response: Extract<ParsedAIResponse, { type: "card_entry" | "follow_up" | "resist" }>;
  label: ReturnType<typeof labels>;
}) {
  const shouldShowHint = response.nextAction === "suggest_new_card" || response.nextAction === "suggest_new_card_or_finish" || response.nextAction === "suggest_finish" || response.suggestNextCard;
  if (!shouldShowHint) return null;
  const heading = response.nextAction === "suggest_finish" ? label.readyForSummary : label.readyForNextCard;
  return (
    <div className="next-card-suggestion passive">
      <strong>{heading}</strong>
      {response.suggestedNextCardReason ? <p>{response.suggestedNextCardReason}</p> : response.nextAction !== "suggest_finish" && <p>{label.drawPanelOpened}</p>}
    </div>
  );
}

function SummaryActionPanel({
  label,
  onSuggestedNextCard,
  onSuggestedFinish,
  onStayCurrentCard
}: {
  label: ReturnType<typeof labels>;
  onSuggestedNextCard?: (role: string, reason?: string) => void;
  onSuggestedFinish?: () => void;
  onStayCurrentCard?: () => void;
}) {
  const [answered, setAnswered] = useState(false);
  if (answered) return null;
  const closeAfter = (action?: () => void) => {
    setAnswered(true);
    action?.();
  };
  return (
    <div className="next-card-suggestion">
      <strong>{label.readyForSummary}</strong>
      <div className="button-row">
        <button className="primary-action" onClick={() => closeAfter(onSuggestedFinish)}>
          {label.moveToSummary}
        </button>
        <button className="ghost-action" onClick={() => closeAfter(onStayCurrentCard)}>
          {label.continueChat}
        </button>
        <button className="ghost-action" onClick={() => closeAfter(() => onSuggestedNextCard?.(label.anotherAngleRole, label.anotherAngleReason))}>
          {label.drawAnother}
        </button>
      </div>
    </div>
  );
}

function MaybeSection({ title, content }: { title?: string; content?: string | null }) {
  if (!content) return null;
  return (
    <section className="ai-section">
      {title && <span className="ai-question-title">{title}</span>}
      <p className="ai-reflection-line">{content}</p>
    </section>
  );
}

function MaybeQuestion({ title, content }: { title?: string; content?: string | null }) {
  if (!content) return null;
  return (
    <div className="ai-question-block">
      <span>{title || "You can start here:"}</span>
      <p>{content}</p>
    </div>
  );
}

function responseSuggestsAction(response: ParsedAIResponse) {
  const data = response as { nextAction?: string; suggestNextCard?: boolean };
  return (
    data.nextAction === "suggest_new_card" ||
    data.nextAction === "suggest_new_card_or_finish" ||
    data.nextAction === "suggest_finish" ||
    Boolean(data.suggestNextCard)
  );
}

function splitTrailingQuestion(content?: string | null) {
  const text = typeof content === "string" ? content.trim() : "";
  if (!text) return { body: "", question: "" };
  const match = text.match(/([\s\S]*?)([^。！？!?]*[？?])\s*$/);
  if (!match) return { body: text, question: "" };
  const body = match[1].trim();
  const question = match[2].trim();
  if (question.length < 8) return { body: text, question: "" };
  return { body, question };
}

function MessageTime({ timestamp, language }: { timestamp: string; language: Language }) {
  return (
    <time>
      {new Intl.DateTimeFormat(language === "zh" ? "zh-CN" : "en", { hour: "2-digit", minute: "2-digit" }).format(new Date(timestamp))}
    </time>
  );
}

function MessageKind({ role, language }: { role: ChatMessageType["role"]; language: Language }) {
  const label =
    language === "zh"
      ? role === "card"
        ? "牌进入了"
        : role === "assistant"
          ? "回应"
          : role === "system"
            ? "记录"
            : "你"
      : role === "card"
        ? "Card entered"
        : role === "assistant"
          ? "Response"
          : role === "system"
            ? "Note"
            : "You";
  return <span className={`message-kind-label message-kind-${role}`}>{label}</span>;
}

function softenResonanceOptions(options: string[]): string[] {
  const joined = options.join(" ");
  if (/[\u4e00-\u9fff]/.test(joined)) {
    return ["我想先接受这个连接", "有一点贴近", "我想反驳它", "不太舒服，但可以看看"];
  }
  return options.filter((option) => !/interpret this card myself/i.test(option));
}

function labels(language: Language) {
  if (language === "zh") {
    return {
      cardMeaning: "这张牌",
      spreadConnection: "和前面的牌一起看",
      continueQuestion: "可以从这里接：",
      fallbackQuestion: "如果继续，可以只接一句：这段里哪一点最贴近你，哪一点不贴近？",
      response: "回应",
      disruption: "这张牌打开的方向",
      ruleYes: "先按这个看",
      ruleEdit: "我想改一下",
      ruleOther: "都不太像",
      chooseQuestion: "选择这个问题",
      editQuestion: "改一下",
      noneFit: "都不贴合，我自己写",
      writeOwnQuestion: "写下更贴近你的问题",
      saveQuestion: "保存这个问题",
      defaultResonanceOptions: ["我想先接受这个连接", "有一点贴近", "我想反驳它", "不太舒服，但可以看看"],
      styleName: (style: string) => (style === "gentle" ? "轻一点" : style === "direct" ? "直接一点" : "行动一点"),
      readyForNextCard: "下一步：抽一张新牌",
      drawPanelOpened: "右侧抽牌面板已经打开，可以直接选择线上抽牌或实体牌。",
      readyForSummary: "这里可以先收成一个总结。",
      moveToSummary: "进入总结",
      continueChat: "继续对话",
      drawAnother: "抽另一张牌",
      anotherAngleRole: "新的角度",
      anotherAngleReason: "用户选择让下一张牌带来新的角度。"
    };
  }
  return {
    cardMeaning: "This card",
    spreadConnection: "With the cards so far",
    continueQuestion: "You can start here:",
    fallbackQuestion: "If you continue, you can answer with one sentence: what feels closest here, and what does not fit?",
    response: "Response",
    disruption: "The direction this card opens",
    ruleYes: "Use this for now",
    ruleEdit: "I want to edit it",
    ruleOther: "None fit",
    chooseQuestion: "Choose this question",
    editQuestion: "Edit",
    noneFit: "None fit, I will write one",
    writeOwnQuestion: "Write a question that feels closer",
    saveQuestion: "Save this question",
    defaultResonanceOptions: ["I want to accept this connection for now", "It connects a little", "I want to resist it", "It feels uncomfortable but worth looking at"],
    styleName: (style: string) => (style === "gentle" ? "Gentle" : style === "direct" ? "Direct" : "Action-oriented"),
    readyForNextCard: "Next: draw a new card",
    drawPanelOpened: "The draw panel is open on the side. You can choose an online draw or select a physical card.",
    readyForSummary: "This can be gathered into a summary.",
    moveToSummary: "Move to summary",
    continueChat: "Continue chatting",
    drawAnother: "Draw another card",
    anotherAngleRole: "New angle",
    anotherAngleReason: "The user chose to let the next card bring a new angle."
  };
}
