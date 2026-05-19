import { Archive, Bookmark, Hand, MessageCircle, Settings as SettingsIcon, Square, Wand2 } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { generateParchmentSummary, generateRealAIResponse } from "../lib/apiClient";
import { parseRitualAIResponse, type NextAction, type ParsedAIResponse } from "../lib/aiResponse";
import { t } from "../lib/i18n";
import type { ChatEventType } from "../lib/promptBuilder";
import {
  collectPreviousQuestions,
  extractReframedQuestion,
  getResponseDepthLevel,
  getResponseQuestion,
  getResponseQuestionIntent,
  isDontKnow,
  isDuplicateQuestion,
  isRepeatedDepthLevel,
  isRepeatedQuestionIntent,
  sanitizeRepeatedQuestions
} from "../lib/questionMemory";
import { getEffectiveApiKey, upsertThread } from "../lib/storage";
import { findCardByName } from "../lib/tarotCards";
import { createId, nowIso } from "../lib/utils";
import { extractFallbackWordAnchors, sanitizeWordAnchors } from "../lib/wordAnchors";
import type { ChatMessage as ChatMessageType, ChatThread, DepthLevel, ParchmentSummary as ParchmentSummaryType, QuestionIntent, Settings, SpreadCard as SpreadCardType, WordAnchor } from "../types";
import CardInputPanel from "./CardInputPanel";
import ChatMessage from "./ChatMessage";
import CurrentQuestionHeader from "./CurrentQuestionHeader";
import DynamicSpread from "./DynamicSpread";
import ParchmentSummary from "./ParchmentSummary";
import WordAnchorPanel from "./WordAnchorPanel";

type Props = {
  settings: Settings;
  thread: ChatThread;
  onThreadChange: (thread: ChatThread) => void;
  onOpenSettings: () => void;
  onOpenArchive: () => void;
  onReturnHome: () => void;
};

export default function ReflectiveChat({
  settings,
  thread,
  onThreadChange,
  onOpenSettings,
  onOpenArchive,
  onReturnHome
}: Props) {
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(false);
  const [cardInputOpen, setCardInputOpen] = useState(thread.spreadCards.length === 0);
  const [rolePanelOpen, setRolePanelOpen] = useState(false);
  const [pendingCardRole, setPendingCardRole] = useState("");
  const [pendingCardReason, setPendingCardReason] = useState("");
  const [customRole, setCustomRole] = useState("");
  const [finishPromptOpen, setFinishPromptOpen] = useState(false);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryError, setSummaryError] = useState("");
  const [summary, setSummary] = useState<ParchmentSummaryType | null>(thread.parchmentSummary || null);
  const [notice, setNotice] = useState("");
  const [debugOpen, setDebugOpen] = useState(false);
  const [lastAIAction, setLastAIAction] = useState<string>("");
  const [forcedNextAction, setForcedNextAction] = useState<string>("");
  const [stayOverrideCardId, setStayOverrideCardId] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const text = useMemo(() => t(settings.language), [settings.language]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [thread.messages, loading]);

  useEffect(() => {
    setCardInputOpen(thread.spreadCards.length === 0);
    setRolePanelOpen(false);
    setNotice("");
    setSummary(thread.parchmentSummary || null);
  }, [thread.id, thread.spreadCards.length, thread.parchmentSummary]);

  function commit(messages: ChatMessageType[], patch: Partial<ChatThread> = {}) {
    const next: ChatThread = {
      ...thread,
      ...patch,
      language: settings.language,
      messages,
      updatedAt: nowIso()
    };
    onThreadChange(next);
    return next;
  }

  function commitFrom(base: ChatThread, messages: ChatMessageType[], patch: Partial<ChatThread> = {}) {
    const next: ChatThread = {
      ...base,
      ...patch,
      language: settings.language,
      messages,
      updatedAt: nowIso()
    };
    onThreadChange(next);
    return next;
  }

  async function askAI(
    nextThread: ChatThread,
    latestUserMessage = "",
    eventType: ChatEventType,
    sourceUserMessageId?: string
  ) {
    setLoading(true);
    setNotice("");
    try {
      const answer = await generateRealAIResponse({
        apiKey: getEffectiveApiKey(),
        baseUrl: settings.baseUrl,
        model: settings.model,
        language: settings.language,
        originalQuestion: nextThread.originalQuestion,
        currentQuestion: nextThread.currentQuestion,
        questionHistory: nextThread.questionHistory,
        currentCard: nextThread.spreadCards.find((card) => card.isActive)?.cardName || nextThread.spreadCards.at(-1)?.cardName || "",
        spreadCards: nextThread.spreadCards,
        wordAnchors: nextThread.wordAnchors,
        askedQuestionIntents: nextThread.askedQuestionIntents,
        chatHistory: nextThread.messages,
        latestUserMessage,
        eventType
      });
      const { content, patch, systemMessages } = prepareAssistantResponse(answer, nextThread, latestUserMessage, eventType, sourceUserMessageId);
      const assistant: ChatMessageType = {
        id: createId("msg"),
        role: "assistant",
        content,
        timestamp: nowIso()
      };
      commitFrom(nextThread, [...nextThread.messages, assistant, ...systemMessages], {
        ...patch,
        endedForNow: eventType === "end-for-now"
      });
    } catch (error) {
      const system: ChatMessageType = {
        id: createId("msg"),
        role: "system",
        content: error instanceof Error ? error.message : String(text.noKey),
        timestamp: nowIso()
      };
      commitFrom(nextThread, [...nextThread.messages, system], { endedForNow: eventType === "end-for-now" });
    } finally {
      setLoading(false);
    }
  }

  function prepareAssistantResponse(
    answer: string,
    baseThread: ChatThread,
    latestUserMessage = "",
    eventType: ChatEventType = "follow-up",
    sourceUserMessageId?: string
  ): { content: string; patch: Partial<ChatThread>; systemMessages: ChatMessageType[] } {
    const parsed = parseRitualAIResponse(answer);
    if (!parsed) return { content: answer, patch: {}, systemMessages: [] };

    const previousQuestions = collectPreviousQuestions(baseThread.messages, baseThread.questionHistory);
    let sanitized = sanitizeRepeatedQuestions(parsed, previousQuestions);
    const activeCard = baseThread.spreadCards.find((card) => card.isActive) || baseThread.spreadCards.at(-1);
    const repeatedDirection = getRepeatedQuestionDirection(baseThread, activeCard?.id, sanitized);
    if (repeatedDirection) {
      sanitized = applyRepeatedDirectionAction(sanitized, repeatedDirection, baseThread, settings.language);
    }
    const forced = decideForcedNextAction(baseThread, activeCard, sanitized, settings.language);
    setLastAIAction(getResponseNextAction(sanitized) || "");
    setForcedNextAction(forced?.nextAction || (repeatedDirection ? "repeated_question_intent" : ""));
    if (forced) {
      sanitized = applyForcedNextAction(sanitized, forced);
    }
    if (latestUserMessage && isDontKnow(latestUserMessage)) {
      sanitized = applyDontKnowBridge(sanitized, settings.language);
    }

    const reframedQuestion = extractReframedQuestion(sanitized);
    const patch: Partial<ChatThread> = {};
    const systemMessages: ChatMessageType[] = [];
    const nextWordAnchors = buildWordAnchorsForResponse(
      sanitized,
      baseThread,
      latestUserMessage,
      eventType,
      sourceUserMessageId,
      settings.language
    );

    if (
      reframedQuestion &&
      !isDuplicateQuestion(reframedQuestion, previousQuestions) &&
      !isDuplicateQuestion(reframedQuestion, [baseThread.currentQuestion])
    ) {
      const transform = {
        id: createId("question"),
        fromQuestion: baseThread.currentQuestion,
        toQuestion: reframedQuestion,
        reason: getTransformReason(sanitized),
        cardName: activeCard?.cardName,
        cardRole: activeCard?.role,
        createdAt: nowIso()
      };
      patch.currentQuestion = reframedQuestion;
      patch.questionHistory = [...baseThread.questionHistory, transform];
      systemMessages.push({
        id: createId("msg"),
        role: "system",
        type: "question_shift",
        content:
          settings.language === "zh"
            ? `问题转向：${baseThread.currentQuestion} -> ${reframedQuestion}`
            : `Question shifted: ${baseThread.currentQuestion} -> ${reframedQuestion}`,
        fromQuestion: baseThread.currentQuestion,
        toQuestion: reframedQuestion,
        timestamp: nowIso()
      });
    }

    const contentObject = { ...sanitized } as Record<string, unknown>;
    if (systemMessages.length) {
      contentObject.reframedQuestion = null;
      contentObject.fromQuestion = undefined;
    }
    if (nextWordAnchors.length && sanitized.type === "follow_up") {
      contentObject.wordAnchors = nextWordAnchors.map((anchor) => anchor.text);
      if (!forced && contentObject.nextAction !== "suggest_finish") {
        contentObject.nextAction = "choose_word_anchor";
      }
    }
    if (typeof contentObject.reframedQuestion === "string" && contentObject.reframedQuestion) {
      contentObject.fromQuestion = baseThread.currentQuestion;
    }
    setLastAIAction(typeof contentObject.nextAction === "string" ? contentObject.nextAction : getResponseNextAction(sanitized) || "");

    if (nextWordAnchors.length) {
      patch.wordAnchors = [...baseThread.wordAnchors, ...nextWordAnchors];
    }

    if (activeCard && responseAsksQuestion(contentObject)) {
      patch.spreadCards = (patch.spreadCards || baseThread.spreadCards).map((card) =>
        card.id === activeCard.id ? { ...card, aiQuestionCount: card.aiQuestionCount + 1 } : card
      );
      const intent = typeof contentObject.questionIntent === "string" ? (contentObject.questionIntent as QuestionIntent) : null;
      const depthLevel = typeof contentObject.depthLevel === "string" ? (contentObject.depthLevel as DepthLevel) : null;
      const questionText =
        typeof contentObject.optionalQuestion === "string"
          ? contentObject.optionalQuestion
          : typeof contentObject.questionToUser === "string"
            ? contentObject.questionToUser
            : "";
      if (intent && depthLevel && questionText) {
        patch.askedQuestionIntents = [
          ...(baseThread.askedQuestionIntents || []),
          {
            intent,
            depthLevel,
            questionText,
            cardId: activeCard.id,
            createdAt: nowIso()
          }
        ];
      }
    }

    return { content: JSON.stringify(contentObject), patch, systemMessages };
  }

  function handleCard(cardName: string) {
    const eventType: ChatEventType = thread.spreadCards.length === 0 ? "first-card" : "new-card";
    const cardData = findCardByName(cardName);
    const role = eventType === "first-card" ? firstLensRole(settings.language) : (customRole.trim() || pendingCardRole || fallbackNextRole(settings.language));
    const newSpreadCard: SpreadCardType = {
      id: createId("spread"),
      order: thread.spreadCards.length + 1,
      cardName,
      cardNameZh: cardData?.chineseName,
      role,
      reason: eventType === "first-card" ? undefined : pendingCardReason || role,
      drawnAt: nowIso(),
      isActive: true,
      userTurnCount: 0,
      aiQuestionCount: 0
    };
    const content = (text.cardEntered as (card: string) => string)(cardName);
    const cardMessage: ChatMessageType = {
      id: createId("msg"),
      role: "card",
      content,
      cardName,
      timestamp: nowIso()
    };
    const next = commit([...thread.messages, cardMessage], {
      spreadCards: [...thread.spreadCards.map((card) => ({ ...card, isActive: false })), newSpreadCard],
      endedForNow: false
    });
    setCardInputOpen(false);
    setRolePanelOpen(false);
    setPendingCardRole("");
    setPendingCardReason("");
    setCustomRole("");
    void askAI(next, content, eventType);
  }

  function sendMessage(content = draft.trim(), eventType: Extract<ChatEventType, "follow-up" | "resist"> = "follow-up") {
    if (!content || loading) return;
    const userMessage: ChatMessageType = {
      id: createId("msg"),
      role: "user",
      content,
      timestamp: nowIso()
    };
    const next = commit([...thread.messages, userMessage], {
      endedForNow: false,
      spreadCards: eventType === "follow-up" ? incrementActiveCardUserTurn(thread.spreadCards) : thread.spreadCards
    });
    if (eventType === "follow-up") setStayOverrideCardId("");
    setDraft("");
    void askAI(next, content, eventType, userMessage.id);
  }

  function drawAnother() {
    if (thread.spreadCards.length === 0) {
      setCardInputOpen(true);
      return;
    }
    setRolePanelOpen(true);
    setCardInputOpen(false);
    setNotice(String(text.newCardPrompt));
  }

  function startSuggestedCard(role: string, reason?: string) {
    setPendingCardRole(role);
    setPendingCardReason(reason || role);
    setCustomRole("");
    setRolePanelOpen(false);
    setCardInputOpen(true);
    setNotice(reason || String(text.newCardPrompt));
  }

  function selectWordAnchor(anchorId: string) {
    const target = thread.wordAnchors.find((anchor) => anchor.id === anchorId);
    if (!target) return;
    const nextAnchors = thread.wordAnchors.map((anchor) =>
      anchor.cardId === target.cardId && anchor.sourceMessageId === target.sourceMessageId
        ? { ...anchor, selected: anchor.id === anchorId }
        : anchor
    );
    commit(thread.messages, { wordAnchors: nextAnchors, endedForNow: false });
  }

  function addCustomWordAnchor(textValue: string) {
    const activeCard = getActiveCard(thread);
    if (!activeCard) return;
    const anchor: WordAnchor = {
      id: createId("anchor"),
      text: textValue.trim(),
      sourceMessageId: "custom",
      cardId: activeCard.id,
      selected: true,
      createdAt: nowIso()
    };
    const nextAnchors = thread.wordAnchors
      .map((item) => (item.cardId === activeCard.id && item.sourceMessageId === "custom" ? { ...item, selected: false } : item))
      .concat(anchor);
    commit(thread.messages, { wordAnchors: nextAnchors, endedForNow: false });
  }

  function stayWithAnchor(anchor: WordAnchor) {
    const content =
      settings.language === "zh"
        ? `那就先把「${anchor.text}」留在这张牌下。把它放回最近的一个具体场景里，从那里继续写。`
        : `Stay with "${anchor.text}" under this card. Place it back into one recent scene, then continue from there.`;
    const systemMessage: ChatMessageType = {
      id: createId("msg"),
      role: "system",
      content,
      timestamp: nowIso()
    };
    const activeCard = getActiveCard(thread);
    if (activeCard) setStayOverrideCardId(activeCard.id);
    commit([...thread.messages, systemMessage], { endedForNow: false });
  }

  function drawForAnchor(anchor: WordAnchor) {
    const role = settings.language === "zh" ? `为「${anchor.text}」而抽` : `Drawn for "${anchor.text}"`;
    const reason =
      settings.language === "zh"
        ? `用户选择让下一张牌看向「${anchor.text}」。`
        : `The user chose to let the next card look at "${anchor.text}".`;
    startSuggestedCard(role, reason);
  }

  function carryAnchorToSummary(anchor: WordAnchor) {
    selectWordAnchor(anchor.id);
    setFinishPromptOpen(true);
  }

  function stayWithCard() {
    const prompt: ChatMessageType = {
      id: createId("msg"),
      role: "assistant",
      content: String(text.stayWithCardPrompt),
      timestamp: nowIso()
    };
    const activeCard = getActiveCard(thread);
    if (activeCard) setStayOverrideCardId(activeCard.id);
    commit([...thread.messages, prompt], { endedForNow: false });
    setNotice("");
  }

  function resistReading() {
    sendMessage(String(text.resistMessage), "resist");
  }

  function saveChat() {
    upsertThread(thread);
    setNotice(String(text.saved));
  }

  async function createSummary() {
    setSummaryLoading(true);
    setSummaryError("");
    try {
      const nextSummary = await generateParchmentSummary({
        apiKey: getEffectiveApiKey(),
        baseUrl: settings.baseUrl,
        model: settings.model,
        language: settings.language,
        originalQuestion: thread.originalQuestion,
        currentQuestion: thread.currentQuestion,
        questionHistory: thread.questionHistory,
        spreadCards: thread.spreadCards,
        wordAnchors: thread.wordAnchors,
        chatHistory: thread.messages
      });
      const next = {
        ...thread,
        parchmentSummary: nextSummary,
        endedForNow: true,
        updatedAt: nowIso()
      };
      setSummary(nextSummary);
      setFinishPromptOpen(false);
      onThreadChange(next);
    } catch (error) {
      setSummaryError(error instanceof Error ? error.message : String(text.noKey));
    } finally {
      setSummaryLoading(false);
    }
  }

  const activeCard = getActiveCard(thread);
  const activeWordAnchors = activeCard ? getLatestAnchorGroup(thread.wordAnchors, activeCard.id) : [];
  const repeatedDirectionVisible =
    (lastAIAction === "suggest_new_card" || lastAIAction === "suggest_new_card_or_finish") &&
    forcedNextAction === "repeated_question_intent";

  return (
    <div className="chat-layout fade-in">
      <section className="chat-column">
        <CurrentQuestionHeader
          currentQuestion={thread.currentQuestion}
          originalQuestion={thread.originalQuestion}
          language={settings.language}
        />
        <QuestionPathPanel history={thread.questionHistory} language={settings.language} />
        <div className="chat-stream" aria-live="polite">
          {thread.messages.map((message) => (
            <ChatMessage
              key={message.id}
              message={message}
              language={settings.language}
              onSuggestedNextCard={startSuggestedCard}
              onSuggestedFinish={() => setFinishPromptOpen(true)}
              onStayCurrentCard={stayWithCard}
            />
          ))}
          {loading && <div className="typing">{String(text.typing)}</div>}
          <div ref={scrollRef} />
        </div>
        <WordAnchorPanel
          anchors={activeWordAnchors}
          language={settings.language}
          disabled={loading}
          onSelect={selectWordAnchor}
          onStay={stayWithAnchor}
          onDraw={drawForAnchor}
          onSummary={carryAnchorToSummary}
          onCustom={addCustomWordAnchor}
        />
        <ForcedDecisionPanel
          thread={thread}
          language={settings.language}
          visible={
            !activeWordAnchors.length &&
            !loading &&
            !rolePanelOpen &&
            !cardInputOpen &&
            !finishPromptOpen &&
            shouldShowForcedDecision(thread, stayOverrideCardId)
          }
          onDraw={drawAnother}
          onSummary={() => setFinishPromptOpen(true)}
          onStay={stayWithCard}
        />
        <RepeatedDirectionPanel
          visible={repeatedDirectionVisible && !loading && !rolePanelOpen && !cardInputOpen && !finishPromptOpen}
          language={settings.language}
          canChooseWord={thread.wordAnchors.length > 0}
          onDraw={drawAnother}
          onSummary={() => setFinishPromptOpen(true)}
          onChooseWord={() => setNotice(settings.language === "zh" ? "你可以在上方选择一个刚才出现的词继续。" : "You can choose one of the word anchors above to continue.")}
        />

        <div className="composer">
          <textarea
            value={draft}
            placeholder={String(text.messagePlaceholder)}
            onChange={(event) => setDraft(event.target.value)}
            disabled={loading}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                sendMessage();
              }
            }}
          />
          <button className="primary-action" disabled={loading || !draft.trim()} onClick={() => sendMessage()}>
            <MessageCircle size={17} />
            {String(text.send)}
          </button>
        </div>
      </section>

      <aside className="side-column">
        <DynamicSpread cards={thread.spreadCards} wordAnchors={thread.wordAnchors} language={settings.language} />
        <div className="action-grid">
          <button onClick={stayWithCard} disabled={!thread.spreadCards.length || loading}>
            <MessageCircle size={17} />
            {String(text.stayWithCard)}
          </button>
          <button onClick={drawAnother}>
            <Wand2 size={17} />
            {String(text.drawAnother)}
          </button>
          <button onClick={resistReading} disabled={loading}>
            <Hand size={17} />
            {String(text.resist)}
          </button>
          <button onClick={saveChat}>
            <Bookmark size={17} />
            {String(text.saveChat)}
          </button>
          <button onClick={() => setFinishPromptOpen(true)} disabled={loading}>
            <Square size={17} />
            {String(text.endChat)}
          </button>
          <button onClick={onOpenSettings}>
            <SettingsIcon size={17} />
            {String(text.settings)}
          </button>
          <button onClick={onOpenArchive}>
            <Archive size={17} />
            {String(text.savedChats)}
          </button>
        </div>
        {notice && <p className="notice">{notice}</p>}
        <button className="ghost-action debug-toggle" onClick={() => setDebugOpen((value) => !value)}>
          {String(text.debug)}
        </button>
        {debugOpen && (
          <div className="debug-panel">
            <p><strong>originalQuestion:</strong> {thread.originalQuestion}</p>
            <p><strong>currentQuestion:</strong> {thread.currentQuestion}</p>
            <p><strong>activeCard:</strong> {getActiveCard(thread)?.cardName || "-"}</p>
            <p><strong>activeCard.userTurnCount:</strong> {getActiveCard(thread)?.userTurnCount ?? 0}</p>
            <p><strong>spreadCards.length:</strong> {thread.spreadCards.length}</p>
            <p><strong>wordAnchors:</strong> {thread.wordAnchors.filter((anchor) => anchor.selected).map((anchor) => anchor.text).join(", ") || "-"}</p>
            <p><strong>lastAI.nextAction:</strong> {lastAIAction || "-"}</p>
            <p><strong>forcedNextAction:</strong> {forcedNextAction || "-"}</p>
          </div>
        )}
        {rolePanelOpen && (
          <div className="next-role-panel tarot-panel">
            <h3>{String(text.nextCardRolePrompt)}</h3>
            <div className="role-choice-grid">
              {roleOptions(settings.language).map((option) => (
                <button
                  key={option}
                  className={pendingCardRole === option ? "active" : ""}
                  onClick={() => {
                    setPendingCardRole(option);
                    setPendingCardReason(option);
                  }}
                >
                  {option}
                </button>
              ))}
            </div>
            <label>
              {String(text.customRole)}
              <input value={customRole} onChange={(event) => setCustomRole(event.target.value)} />
            </label>
            <button
              className="primary-action"
              disabled={!pendingCardRole && !customRole.trim()}
              onClick={() => {
                setRolePanelOpen(false);
                setCardInputOpen(true);
              }}
            >
              {String(text.continueToCard)}
            </button>
          </div>
        )}
        <CardInputPanel
          language={settings.language}
          cameraEnabled={settings.cameraEnabled}
          open={cardInputOpen}
          onOpen={() => {
            setCardInputOpen(true);
            if (thread.spreadCards.length > 0) setNotice(String(text.newCardPrompt));
          }}
          onCardSelected={handleCard}
        />
      </aside>

      {finishPromptOpen && (
        <div className="modal-backdrop">
          <section className="modal finish-panel">
            <h2>{String(text.finishPrompt)}</h2>
            {summaryError && <p className="error-text">{summaryError}</p>}
            {summaryLoading && <p className="notice">{String(text.summaryLoading)}</p>}
            <div className="button-row">
              <button className="primary-action" onClick={createSummary} disabled={summaryLoading}>
                {String(text.createSummary)}
              </button>
              <button className="ghost-action" onClick={() => setFinishPromptOpen(false)} disabled={summaryLoading}>
                {String(text.continueChat)}
              </button>
            </div>
          </section>
        </div>
      )}

      {summary && (
        <ParchmentSummary
          summary={summary}
          language={settings.language}
          onUpdate={(nextSummary) => {
            setSummary(nextSummary);
            onThreadChange({
              ...thread,
              parchmentSummary: nextSummary,
              updatedAt: nowIso()
            });
          }}
          onReturnHome={onReturnHome}
          onContinue={() => setSummary(null)}
          onClose={() => setSummary(null)}
        />
      )}
    </div>
  );
}

function firstLensRole(language: Settings["language"]): string {
  return language === "zh" ? "第一道视角" : "First Lens";
}

function fallbackNextRole(language: Settings["language"]): string {
  return language === "zh" ? "新的角度" : "New Angle";
}

function roleOptions(language: Settings["language"]): string[] {
  return language === "zh"
    ? ["隐藏假设", "缺席的声音", "隐形规则", "抗拒之处", "可能的转向", "一个我还说不清的东西"]
    : ["Hidden assumption", "Missing voice", "Invisible rule", "Resistance", "Possible shift", "Something I cannot name yet"];
}

type ForcedAction = {
  nextAction: NextAction;
  suggestedNextCardRole?: string;
  suggestedNextCardReason?: string;
};

function getActiveCard(thread: ChatThread): SpreadCardType | undefined {
  return thread.spreadCards.find((card) => card.isActive) || thread.spreadCards.at(-1);
}

function incrementActiveCardUserTurn(cards: SpreadCardType[]): SpreadCardType[] {
  const activeId = cards.find((card) => card.isActive)?.id || cards.at(-1)?.id;
  return cards.map((card) =>
    card.id === activeId ? { ...card, userTurnCount: card.userTurnCount + 1 } : card
  );
}

function getLatestAnchorGroup(anchors: WordAnchor[], cardId: string): WordAnchor[] {
  const cardAnchors = anchors.filter((anchor) => anchor.cardId === cardId);
  const latest = cardAnchors.at(-1);
  if (!latest) return [];
  return cardAnchors.filter((anchor) => anchor.sourceMessageId === latest.sourceMessageId);
}

function getResponseNextAction(response: ParsedAIResponse): string | undefined {
  return "nextAction" in response ? response.nextAction : undefined;
}

function getTransformReason(response: ParsedAIResponse): string {
  if ("integratedUserAnswer" in response && response.integratedUserAnswer) return response.integratedUserAnswer;
  if ("response" in response && response.response) return response.response;
  if ("inCurrentQuestion" in response && response.inCurrentQuestion) return response.inCurrentQuestion;
  return "AI reframed the active question.";
}

function responseAsksQuestion(response: Record<string, unknown>): boolean {
  return ["optionalQuestion", "questionToUser"].some(
    (key) => typeof response[key] === "string" && String(response[key]).trim().length > 0
  );
}

function decideForcedNextAction(
  thread: ChatThread,
  activeCard: SpreadCardType | undefined,
  _aiResponse: ParsedAIResponse,
  language: Settings["language"]
): ForcedAction | null {
  if (!activeCard) return null;
  const totalCards = thread.spreadCards.length;
  const turns = activeCard.userTurnCount;
  const askedUnderCard = activeCard.aiQuestionCount;
  const zh = language === "zh";

  if (askedUnderCard >= 2) {
    return {
      nextAction: totalCards < 2 ? "suggest_new_card" : "suggest_new_card_or_finish",
      suggestedNextCardRole: zh ? "新的角度" : "New Angle",
      suggestedNextCardReason: zh
        ? "这张牌下面已经问过两个问题了。接下来更适合换一个角度，或者把这段反思收束成卷。"
        : "This card has already carried two questions. It may be better to move to another angle or gather the reflection into a summary."
    };
  }

  if (turns >= 2 && totalCards < 2) {
    return {
      nextAction: "suggest_new_card",
      suggestedNextCardRole: zh ? "新的角度" : "New Angle",
      suggestedNextCardReason: zh
        ? "你已经在这张牌下回答了几次。与其继续绕着同一个问题，不如让下一张牌带来新的方向。"
        : "You have answered under this card a few times. Rather than circling the same question, another card can bring a new direction."
    };
  }

  if (turns >= 2 && totalCards >= 2 && totalCards < 4) {
    return {
      nextAction: "suggest_new_card_or_finish",
      suggestedNextCardRole: zh ? "尚未被看见的部分" : "What has not been seen yet",
      suggestedNextCardReason: zh
        ? "这张牌的线索已经比较完整了。你可以抽下一张牌，也可以进入这次反思的总结。"
        : "The thread under this card has enough shape. You can draw another card, or move into a summary of this reflection."
    };
  }

  if (turns >= 2 && totalCards >= 4) {
    return {
      nextAction: "suggest_finish",
      suggestedNextCardReason: zh
        ? "这个牌阵已经生长出足够多的线索，现在更适合先回看总结，而不是继续增加问题。"
        : "This spread has already grown enough traces. It may be better to gather a summary than keep adding questions."
    };
  }

  return null;
}

function applyForcedNextAction<T extends ParsedAIResponse>(response: T, forced: ForcedAction): T {
  const copy = { ...response } as Record<string, unknown>;
  copy.nextAction = forced.nextAction;
  copy.suggestedNextCardRole = forced.suggestedNextCardRole || null;
  copy.suggestedNextCardReason = forced.suggestedNextCardReason || null;

  if (forced.nextAction !== "continue_current_card" && forced.nextAction !== "ask_user_to_clarify") {
    copy.optionalQuestion = null;
    copy.questionToUser = null;
    copy.questionIntent = null;
    copy.depthLevel = null;
  }

  return copy as T;
}

function applyDontKnowBridge<T extends ParsedAIResponse>(response: T, language: Settings["language"]): T {
  if (response.type !== "follow_up" && response.type !== "resist") return response;
  const zh = language === "zh";
  const copy = { ...response } as Record<string, unknown>;
  copy.optionalQuestion = zh
    ? "最近一次这个问题让你停住，是在哪里、和谁有关、或发生在什么动作之后？"
    : "Where were you the last time this question made you pause, and what had just happened?";
  copy.questionStyle = "recent_moment";
  copy.questionIntent = "recent_scene";
  copy.depthLevel = "scene";
  if (!copy.response) {
    copy.response = zh
      ? "那我们先不急着知道。沿着这张牌看，可以从一个最近的场景开始。"
      : "Then we do not need to know yet. Following this card, we can begin from a recent scene.";
  }
  copy.nextAction = "suggest_new_card";
  copy.suggestedNextCardRole = zh ? "说不清的部分" : "the part that cannot be named yet";
  copy.suggestedNextCardReason = zh
    ? "如果这个场景也很难抓住，可以让下一张牌看向那个暂时说不清的部分。"
    : "If this is still hard to locate, another card can look at the part that cannot be named yet.";
  return copy as T;
}

type RepeatedDirection = "intent" | "text";

function getRepeatedQuestionDirection(
  thread: ChatThread,
  activeCardId: string | undefined,
  response: ParsedAIResponse
): RepeatedDirection | null {
  const intent = getResponseQuestionIntent(response);
  if (isRepeatedQuestionIntent(thread, intent, activeCardId)) return "intent";
  const depthLevel = getResponseDepthLevel(response);
  if (isRepeatedDepthLevel(thread, depthLevel, activeCardId)) return "intent";

  const question = getResponseQuestion(response);
  if (question && isDuplicateQuestion(question, collectPreviousQuestions(thread.messages, thread.questionHistory))) {
    return "text";
  }

  return null;
}

function applyRepeatedDirectionAction<T extends ParsedAIResponse>(
  response: T,
  reason: RepeatedDirection,
  thread: ChatThread,
  language: Settings["language"]
): T {
  const zh = language === "zh";
  const copy = { ...response } as Record<string, unknown>;
  copy.optionalQuestion = null;
  copy.questionToUser = null;
  copy.questionIntent = null;
  copy.depthLevel = null;
  copy.nextAction = thread.spreadCards.length < 2 ? "suggest_new_card" : "suggest_new_card_or_finish";
  copy.suggestedNextCardRole = zh ? "另一个角度" : "Another angle";
  copy.suggestedNextCardReason =
    reason === "intent"
      ? zh
        ? "这个方向我们已经看过一次了。接下来可以换一种方式继续。"
        : "We have already looked in this direction once. We can continue another way."
      : zh
        ? "这个问题和前面的问题太接近了。接下来可以换一种方式继续。"
        : "This question is too close to one already asked. We can continue another way.";
  copy.repetitionNotice = copy.suggestedNextCardReason;
  return copy as T;
}

function buildWordAnchorsForResponse(
  response: ParsedAIResponse,
  thread: ChatThread,
  latestUserMessage: string,
  eventType: ChatEventType,
  sourceUserMessageId: string | undefined,
  language: Settings["language"]
): WordAnchor[] {
  if (eventType !== "follow-up" || !sourceUserMessageId || !latestUserMessage.trim()) return [];
  if (!isMeaningfulAnchorSource(latestUserMessage, language) || isDontKnow(latestUserMessage)) return [];

  const activeCard = getActiveCard(thread);
  if (!activeCard) return [];

  const aiAnchors = response.type === "follow_up" ? response.wordAnchors : undefined;
  const primary = sanitizeWordAnchors(aiAnchors, latestUserMessage, language);
  const fallback = primary.length >= 2 ? [] : extractFallbackWordAnchors(latestUserMessage, language);
  const words = sanitizeWordAnchors([...primary, ...fallback], latestUserMessage, language);
  if (words.length < 2) return [];
  const existing = new Set(
    thread.wordAnchors
      .filter((anchor) => anchor.cardId === activeCard.id && anchor.sourceMessageId === sourceUserMessageId)
      .map((anchor) => anchor.text.toLowerCase())
  );

  return words
    .filter((word) => !existing.has(word.toLowerCase()))
    .slice(0, 5)
    .map((word) => ({
      id: createId("anchor"),
      text: word,
      sourceMessageId: sourceUserMessageId,
      cardId: activeCard.id,
      selected: false,
      createdAt: nowIso()
    }));
}

function isMeaningfulAnchorSource(text: string, language: Settings["language"]): boolean {
  const trimmed = text.trim();
  if (language === "zh" || /[\u4e00-\u9fff]/.test(trimmed)) {
    return [...trimmed.replace(/[^\u4e00-\u9fffA-Za-z0-9]/g, "")].length >= 4;
  }
  return trimmed.split(/\s+/).filter(Boolean).length >= 3;
}

function shouldShowForcedDecision(thread: ChatThread, stayOverrideCardId: string): boolean {
  const activeCard = getActiveCard(thread);
  if (!activeCard || activeCard.id === stayOverrideCardId) return false;
  return activeCard.userTurnCount >= 2;
}

function QuestionPathPanel({
  history,
  language
}: {
  history: ChatThread["questionHistory"];
  language: Settings["language"];
}) {
  if (!history.length) return null;
  const zh = language === "zh";
  return (
    <details className="question-path-panel">
      <summary>{zh ? "问题路径" : "Question Path"}</summary>
      <ol>
        {history.map((item) => (
          <li key={item.id}>
            <span>{item.fromQuestion}</span>
            <strong aria-hidden="true">↓</strong>
            <span>{item.toQuestion}</span>
          </li>
        ))}
      </ol>
    </details>
  );
}

function RepeatedDirectionPanel({
  visible,
  language,
  canChooseWord,
  onDraw,
  onSummary,
  onChooseWord
}: {
  visible: boolean;
  language: Settings["language"];
  canChooseWord: boolean;
  onDraw: () => void;
  onSummary: () => void;
  onChooseWord: () => void;
}) {
  if (!visible) return null;
  const zh = language === "zh";
  return (
    <div className="forced-decision-panel repeated-direction-panel">
      <p>
        {zh
          ? "这个方向我们已经看过一次了。接下来可以换一种方式继续。"
          : "We have already looked in this direction once. We can continue another way."}
      </p>
      <div className="button-row">
        <button className="primary-action" onClick={onDraw}>
          {zh ? "抽一张新牌，看另一个角度" : "Draw a new card for another angle"}
        </button>
        <button className="ghost-action" onClick={onSummary}>
          {zh ? "进入反思卷总结" : "Move to parchment summary"}
        </button>
        <button className="ghost-action" disabled={!canChooseWord} onClick={onChooseWord}>
          {zh ? "选择一个刚才出现的词继续" : "Choose a word anchor to continue"}
        </button>
      </div>
    </div>
  );
}

function ForcedDecisionPanel({
  thread,
  language,
  visible,
  onDraw,
  onSummary,
  onStay
}: {
  thread: ChatThread;
  language: Settings["language"];
  visible: boolean;
  onDraw: () => void;
  onSummary: () => void;
  onStay: () => void;
}) {
  if (!visible) return null;
  const zh = language === "zh";
  const totalCards = thread.spreadCards.length;
  const preferSummary = totalCards >= 3;

  return (
    <div className="forced-decision-panel">
      <p>
        {zh
          ? "这张牌下的线索已经比较完整了。接下来你想怎么继续？"
          : "The thread under this card has enough shape for now. How would you like to continue?"}
      </p>
      <div className="button-row">
        {!preferSummary && (
          <button className="primary-action" onClick={onDraw}>
            {zh ? "抽一张新牌，看另一个角度" : "Draw a new card for another angle"}
          </button>
        )}
        <button className={preferSummary ? "primary-action" : "ghost-action"} onClick={onSummary}>
          {zh ? "进入这次反思的总结" : "Move to reflection summary"}
        </button>
        {preferSummary && (
          <button className="ghost-action" onClick={onDraw}>
            {zh ? "再抽一张牌" : "Draw another card"}
          </button>
        )}
        <button className="ghost-action" onClick={onStay}>
          {zh ? "继续停留在这张牌" : "Stay with this card"}
        </button>
      </div>
    </div>
  );
}
