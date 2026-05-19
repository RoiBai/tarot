import { CircleDot, Sparkle } from "lucide-react";
import { parseRitualAIResponse, type ParsedAIResponse } from "../lib/aiResponse";
import type { ChatMessage as ChatMessageType, Language } from "../types";
import QuestionTransformation from "./QuestionTransformation";

type Props = {
  message: ChatMessageType;
  language: Language;
  onSuggestedNextCard?: (role: string, reason?: string) => void;
  onSuggestedFinish?: () => void;
  onStayCurrentCard?: () => void;
};

export default function ChatMessage({
  message,
  language,
  onSuggestedNextCard,
  onSuggestedFinish,
  onStayCurrentCard
}: Props) {
  const ritual = message.role === "assistant" ? parseRitualAIResponse(message.content) : null;

  if (message.role === "system" && message.type === "question_shift" && message.fromQuestion && message.toQuestion) {
    return (
      <article className="message message-system message-question-shift">
        <QuestionTransformation
          fromQuestion={message.fromQuestion}
          toQuestion={message.toQuestion}
          language={language}
        />
        <MessageTime timestamp={message.timestamp} language={language} />
      </article>
    );
  }

  if (message.role === "assistant" && ritual) {
    return (
      <article className="message message-assistant message-ai-ritual">
        <div className="ai-ritual-card">
          <MessageKindLabel role="assistant" language={language} />
          <RenderRitualResponse
            response={ritual}
            language={language}
            onSuggestedNextCard={onSuggestedNextCard}
            onSuggestedFinish={onSuggestedFinish}
            onStayCurrentCard={onStayCurrentCard}
          />
          <MessageTime timestamp={message.timestamp} language={language} />
        </div>
      </article>
    );
  }

  return (
    <article className={`message message-${message.role}`}>
      <div className="message-mark" aria-hidden="true">
        {message.role === "card" ? <Sparkle size={16} /> : <CircleDot size={12} />}
      </div>
      <div>
        <MessageKindLabel role={message.role} language={language} />
        <p>{message.content}</p>
        <MessageTime timestamp={message.timestamp} language={language} />
      </div>
    </article>
  );
}

function MessageKindLabel({ role, language }: { role: ChatMessageType["role"]; language: Language }) {
  if (role === "system") return null;
  const labels =
    language === "zh"
      ? {
          card: "牌进入了问题",
          assistant: "这张牌正在改变问题被观看的位置",
          user: "你的回应"
        }
      : {
          card: "Card entered the question",
          assistant: "This card is shifting where the question is seen from",
          user: "Your response"
        };
  return <span className={`message-kind-label message-kind-${role}`}>{labels[role]}</span>;
}

function RenderRitualResponse({
  response,
  language,
  onSuggestedNextCard,
  onSuggestedFinish,
  onStayCurrentCard
}: {
  response: ParsedAIResponse;
  language: Language;
  onSuggestedNextCard?: (role: string, reason?: string) => void;
  onSuggestedFinish?: () => void;
  onStayCurrentCard?: () => void;
}) {
  const label = labels(language);

  if (response.type === "plain") {
    return <p className="ai-reflection-line">{response.plainText}</p>;
  }

  if (response.type === "ending") {
    return response.response ? <p className="ai-reflection-line">{response.response}</p> : null;
  }

  if (response.type === "ending_prompt") {
    return (
      <>
        {response.response && <p className="ai-reflection-line">{response.response}</p>}
        {response.nextAction === "suggest_finish" && (
          <div className="next-card-suggestion">
            <strong>{label.readyForSummary}</strong>
            <ActionButtons
              label={label}
              onSuggestedNextCard={onSuggestedNextCard}
              onSuggestedFinish={onSuggestedFinish}
              onStayCurrentCard={onStayCurrentCard}
            />
          </div>
        )}
      </>
    );
  }

  if (response.type === "resist") {
    return (
      <>
        <BuiltFromWords words={response.builtFromUserWords} language={language} />
        {response.response && <p className="ai-reflection-line">{response.response}</p>}
        {response.optionalQuestion && (
          <AIQuestionBlock title={label.optionalQuestion} content={response.optionalQuestion} />
        )}
        <NextActionPanel
          response={response}
          label={label}
          onSuggestedNextCard={onSuggestedNextCard}
          onSuggestedFinish={onSuggestedFinish}
          onStayCurrentCard={onStayCurrentCard}
        />
      </>
    );
  }

  if (response.type === "follow_up") {
    return (
      <>
        {response.cardTitle && <div className="ai-card-label">{response.cardTitle}</div>}
        <BuiltFromWords words={response.builtFromUserWords} language={language} />
        {response.continuingWithCard && (
          <AISection title={label.continuingWithCard} content={response.continuingWithCard} />
        )}
        {response.integratedUserAnswer && (
          <AISection title={label.integratedUserAnswer} content={response.integratedUserAnswer} />
        )}
        {response.response && <AISection title={label.response} content={response.response} />}
        {response.optionalQuestion && (
          <AIQuestionBlock title={label.optionalQuestion} content={response.optionalQuestion} />
        )}
        <NextActionPanel
          response={response}
          label={label}
          onSuggestedNextCard={onSuggestedNextCard}
          onSuggestedFinish={onSuggestedFinish}
          onStayCurrentCard={onStayCurrentCard}
        />
      </>
    );
  }

  if (response.type === "card_entry") {
    return (
      <>
        {response.cardTitle && <div className="ai-card-label">{response.cardTitle}</div>}
        {response.cardRole && <div className="ai-card-role">{response.cardRole}</div>}
        <BuiltFromWords words={response.builtFromUserWords} language={language} />
        {response.cardMeaning && <AISection title={label.cardMeaning} content={response.cardMeaning} />}
        {response.spreadConnection && <AISection title={label.spreadConnection} content={response.spreadConnection} />}
        {(response.inCurrentQuestion || response.inYourQuestion) && (
          <AISection title={label.inYourQuestion} content={response.inCurrentQuestion || response.inYourQuestion || ""} />
        )}
        {response.questionToUser && <AIQuestionBlock title={label.continueQuestion} content={response.questionToUser} />}
        <NextActionPanel
          response={response}
          label={label}
          onSuggestedNextCard={onSuggestedNextCard}
          onSuggestedFinish={onSuggestedFinish}
          onStayCurrentCard={onStayCurrentCard}
        />
      </>
    );
  }

  return (
    <>
      {response.cardEntrance && <div className="ai-card-label">{response.cardEntrance}</div>}
      {response.reflection && <p className="ai-reflection-line">{response.reflection}</p>}
      {response.hiddenTurn && <p className="ai-reflection-line hidden-turn">{response.hiddenTurn}</p>}
    </>
  );
}

function BuiltFromWords({ words, language }: { words?: string[]; language: Language }) {
  if (!words?.length) return null;
  const label = language === "zh" ? "这次回应来自你提到的：" : "This response is built from your words:";
  return (
    <p className="built-from-words">
      {label} {words.slice(0, 3).join(" / ")}
    </p>
  );
}

function NextActionPanel({
  response,
  label,
  onSuggestedNextCard,
  onSuggestedFinish,
  onStayCurrentCard
}: {
  response: Extract<ParsedAIResponse, { type: "card_entry" | "follow_up" | "resist" }>;
  label: ReturnType<typeof labels>;
  onSuggestedNextCard?: (role: string, reason?: string) => void;
  onSuggestedFinish?: () => void;
  onStayCurrentCard?: () => void;
}) {
  if (response.nextAction === "suggest_finish") {
    return (
      <div className="next-card-suggestion">
        <strong>{label.readyForSummary}</strong>
        <ActionButtons
          label={label}
          onSuggestedNextCard={onSuggestedNextCard}
          onSuggestedFinish={onSuggestedFinish}
          onStayCurrentCard={onStayCurrentCard}
        />
      </div>
    );
  }

  if (response.nextAction === "suggest_new_card_or_finish") {
    return (
      <div className="next-card-suggestion">
        <strong>{label.newCardOrFinish}</strong>
        {response.suggestedNextCardReason && <p>{response.suggestedNextCardReason}</p>}
        <div className="button-row">
          {response.suggestedNextCardRole && (
            <button
              className="primary-action"
              onClick={() => onSuggestedNextCard?.(response.suggestedNextCardRole || "", response.suggestedNextCardReason)}
            >
              {label.drawFor(response.suggestedNextCardRole)}
            </button>
          )}
          <button className="ghost-action" onClick={onSuggestedFinish}>
            {label.moveToSummary}
          </button>
          <button className="ghost-action" onClick={onStayCurrentCard}>
            {label.stayCurrent}
          </button>
        </div>
      </div>
    );
  }

  const shouldSuggestCard = response.nextAction === "suggest_new_card" || response.suggestNextCard;
  if (!shouldSuggestCard || !response.suggestedNextCardRole) return null;
  return (
    <div className="next-card-suggestion">
      <strong>{label.suggestedDraw(response.suggestedNextCardRole)}</strong>
      {response.suggestedNextCardReason && <p>{response.suggestedNextCardReason}</p>}
      <div className="button-row">
        <button
          className="primary-action"
          onClick={() => onSuggestedNextCard?.(response.suggestedNextCardRole || "", response.suggestedNextCardReason)}
        >
          {label.drawFor(response.suggestedNextCardRole)}
        </button>
        <button className="ghost-action" onClick={onStayCurrentCard}>
          {label.stayCurrent}
        </button>
        <button className="ghost-action" onClick={onSuggestedFinish}>
          {label.finishForNow}
        </button>
      </div>
    </div>
  );
}

function ActionButtons({
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
  return (
    <div className="button-row">
      <button className="primary-action" onClick={onSuggestedFinish}>
        {label.moveToSummary}
      </button>
      <button className="ghost-action" onClick={onStayCurrentCard}>
        {label.continueChat}
      </button>
      <button
        className="ghost-action"
        onClick={() => onSuggestedNextCard?.(label.anotherAngleRole, label.anotherAngleReason)}
      >
        {label.drawAnother}
      </button>
    </div>
  );
}

function AISection({ title, content }: { title: string; content: string }) {
  return (
    <section className="ai-section">
      <span className="ai-question-title">{title}</span>
      <p className="ai-reflection-line">{content}</p>
    </section>
  );
}

function AIQuestionBlock({ title, content }: { title: string; content: string }) {
  return (
    <div className="ai-question-block">
      <span className="ai-question-title">{title}</span>
      <p>“{content}”</p>
    </div>
  );
}

function MessageTime({ timestamp, language }: { timestamp: string; language: Language }) {
  return (
    <time>
      {new Intl.DateTimeFormat(language === "zh" ? "zh-CN" : "en", {
        hour: "2-digit",
        minute: "2-digit"
      }).format(new Date(timestamp))}
    </time>
  );
}

function labels(language: Language) {
  if (language === "zh") {
    return {
      cardMeaning: "牌面",
      spreadConnection: "和前面的牌一起看",
      inYourQuestion: "带入你的问题",
      continueQuestion: "继续问",
      optionalQuestion: "可以继续带着的小问题",
      continuingWithCard: "沿着这张牌继续看",
      integratedUserAnswer: "整合你的回答",
      response: "回应",
      stayCurrent: "先不抽，继续当前牌",
      finishForNow: "暂时结束",
      readyForSummary: "这段反思也许可以收束成一卷。",
      newCardOrFinish: "这张牌下面的线索已经有了形状。",
      moveToSummary: "进入总结",
      continueChat: "继续对话",
      drawAnother: "再抽一张牌",
      anotherAngleRole: "新的角度",
      anotherAngleReason: "让下一张牌带来新的方向。",
      drawFor: (role: string) => `为“${role}”抽一张牌`,
      suggestedDraw: (role: string) => `建议：为“${role}”抽一张牌`
    };
  }

  return {
    cardMeaning: "Card meaning",
    spreadConnection: "With the previous cards",
    inYourQuestion: "In your question",
    continueQuestion: "Continue",
    optionalQuestion: "A question to carry",
    continuingWithCard: "Continuing with this card",
    integratedUserAnswer: "Integrating your answer",
    response: "Response",
    stayCurrent: "Stay with current card",
    finishForNow: "Finish for now",
    readyForSummary: "This reflection may be ready for a summary.",
    newCardOrFinish: "The thread under this card has enough shape.",
    moveToSummary: "Move to summary",
    continueChat: "Continue chatting",
    drawAnother: "Draw another card",
    anotherAngleRole: "New Angle",
    anotherAngleReason: "You chose to let the next card bring a new direction.",
    drawFor: (role: string) => `Draw for "${role}"`,
    suggestedDraw: (role: string) => `Suggested: Draw a card for "${role}"`
  };
}
