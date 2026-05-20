import { Archive, Bookmark, Hand, Home, MessageCircle, Settings as SettingsIcon, Square, Wand2 } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { parseRitualAIResponse } from "../lib/aiResponse";
import { generateParchmentSummary, generateRealAIResponse } from "../lib/apiClient";
import { getCardKeywords, getCardMeaningAngle } from "../lib/cardKeywords";
import { parseJsonObject } from "../lib/jsonParsing";
import { getEffectiveApiKey, upsertThread } from "../lib/storage";
import type { TarotDeckCard } from "../lib/tarotDeck";
import { createId, nowIso } from "../lib/utils";
import type {
  ActiveTask,
  ChatMessage as ChatMessageType,
  ChatThread,
  DepthLevel,
  Language,
  ParchmentSummary as ParchmentSummaryType,
  QuestionIntent,
  SoraStage,
  Settings,
  SpreadCard as SpreadCardType
} from "../types";
import CardInputPanel from "./CardInputPanel";
import ChatMessage from "./ChatMessage";
import CurrentQuestionHeader from "./CurrentQuestionHeader";
import DynamicSpread from "./DynamicSpread";
import ParchmentSummary from "./ParchmentSummary";

type Props = {
  settings: Settings;
  thread: ChatThread;
  onThreadChange: (thread: ChatThread) => void;
  onOpenSettings: () => void;
  onOpenArchive: () => void;
  onReturnHome: () => void;
};

type ChatEventType = "follow-up" | "new-card" | "resist";

function bumpActiveCardCounter(cards: SpreadCardType[], key: "userTurnCount" | "aiQuestionCount") {
  const activeCard = cards.find((card) => card.isActive) || cards.at(-1);
  if (!activeCard) return cards;
  return cards.map((card) => (card.id === activeCard.id ? { ...card, [key]: (card[key] || 0) + 1 } : card));
}

function getResponseQuestion(content: string): { questionText: string; intent: QuestionIntent; depthLevel: DepthLevel; stage: SoraStage } | null {
  const parsed = parseRitualAIResponse(content);
  if (!parsed) return null;
  const response = parsed as {
    questionToUser?: string;
    optionalQuestion?: string;
    questionIntent?: QuestionIntent | null;
    depthLevel?: DepthLevel | null;
    stage?: SoraStage;
  };
  const questionText = response.questionToUser || response.optionalQuestion;
  if (!questionText) return null;
  return {
    questionText,
    intent: response.questionIntent || "other",
    depthLevel: response.depthLevel || "integration",
    stage: response.stage || "resonant_disruption"
  };
}

function parseRawJson(content: string): Record<string, unknown> | null {
  return parseJsonObject(content);
}

function responseSuggestsNewCard(content: string) {
  const parsed = parseRitualAIResponse(content) as { nextAction?: string; suggestNextCard?: boolean } | null;
  return Boolean(parsed && (parsed.nextAction === "suggest_new_card" || parsed.suggestNextCard));
}

function hasQuestionForUser(content: Record<string, unknown>) {
  return Boolean(
    (typeof content.questionToUser === "string" && content.questionToUser.trim()) ||
      (typeof content.optionalQuestion === "string" && content.optionalQuestion.trim())
  );
}

function ensureNewCardQuestion(content: Record<string, unknown>, thread: ChatThread, language: Language) {
  if (hasQuestionForUser(content)) return content;
  const activeCard = getActiveCard(thread);
  const cardName = activeCard?.cardName || (language === "zh" ? "这张牌" : "this card");
  const keyword = activeCard?.selectedCardKeyword || activeCard?.cardMismatchReason || activeCard?.nodeLabel || "";
  const next = { ...content };
  next.type = "card_entry";
  next.questionToUser =
    language === "zh"
      ? keyword
        ? `你可以先回答一个很小的问题：这个「${keyword}」更像你现在的哪个部分：身体的累、脑子停不下来的累，还是一件具体没收尾的事？`
        : `你可以先回答一个很小的问题：${cardName} 让你更想到身体的累、脑子停不下来的累，还是一件具体没收尾的事？`
      : keyword
        ? `You can begin with one small question: does "${keyword}" feel closer to bodily tiredness, thoughts that will not stop, or one unfinished thing?`
        : `You can begin with one small question: does ${cardName} feel closer to bodily tiredness, thoughts that will not stop, or one unfinished thing?`;
  next.questionIntent = "choice_point";
  next.depthLevel = "integration";
  next.nextAction = "continue_current_card";
  return next;
}

function isStrongAgreement(message: string) {
  return /很对|非常对|就是|完全|强烈|说中了|贴合|exactly|totally|yes|right/i.test(message);
}

function maxQuestionsForCard(message: string) {
  if (isStrongAgreement(message)) return 5;
  if (message.trim().length < 12) return 2;
  return 3;
}

function isPushbackText(message: string) {
  return /不对|不是|不贴|不太贴|无关|没有关系|反驳|不接受|wrong|does not|doesn't|not fit|resist|no\b/i.test(message);
}

function userGaveCauseOrEnoughAnswer(message: string) {
  return /因为|所以|就是|原因|做了很久|太久|一直|burn(?:ed)?\s*out|耗|消耗|累|疲惫|没力气|撑不住|overwork|too long|because/i.test(message);
}

function questionAsksForSameCause(question: string) {
  return /为什么|原因|如何显现|怎么显现|怎么表现|怎样表现|是什么导致|哪里.*累|疲惫.*原因|what.*cause|why|how.*show|how.*manifest/i.test(question);
}

function stopCauseLoop(content: Record<string, unknown>, thread: ChatThread, language: Language, latestUserMessage: string) {
  const question = typeof content.questionToUser === "string" ? content.questionToUser : typeof content.optionalQuestion === "string" ? content.optionalQuestion : "";
  if (!userGaveCauseOrEnoughAnswer(latestUserMessage) || !questionAsksForSameCause(question)) return content;

  const activeCard = getActiveCard(thread);
  const keyword = activeCard?.selectedCardKeyword || activeCard?.nodeLabel || (language === "zh" ? "这份累" : "this tiredness");
  const answer = latestUserMessage.trim();
  const next = { ...content };
  next.type = "follow_up";
  next.cardMeaning = undefined;
  next.response =
    language === "zh"
      ? `是的，这里已经不用再追问“为什么累”了。你已经说得很清楚：做了很久，已经 burn out。`
      : `Yes. We do not need to keep asking why you are tired. You have already named it: it has gone on too long, and you are burned out.`;
  next.integratedUserAnswer = answer;
  next.optionalQuestion =
    language === "zh"
      ? `如果把「${keyword}」放在这里，下一步更值得看的不是原因，而是：你现在最需要少承担一点，停下一点，还是换一种节奏？`
      : `If we place "${keyword}" here, the next useful question is not the cause, but this: do you most need to carry less, stop for a while, or change the rhythm?`;
  next.questionToUser = null;
  next.questionIntent = "next_small_action";
  next.depthLevel = "integration";
  next.nextAction = "continue_current_card";
  return next;
}

function buildFollowUpRescue(thread: ChatThread, language: Language, latestUserMessage: string) {
  const activeCard = getActiveCard(thread);
  const cardName = activeCard?.cardName || (language === "zh" ? "这张牌" : "this card");
  const keyword = activeCard?.selectedCardKeyword || activeCard?.cardMismatchReason || activeCard?.nodeLabel || cardName;
  const answer = latestUserMessage.trim();
  const pushedBack = isPushbackText(answer);

  return JSON.stringify({
    type: "follow_up",
    continuingWithCard: cardName,
    response:
      language === "zh"
        ? pushedBack
          ? `好，我们先把刚才的连接放下。你说「${answer}」，这个不贴合本身也值得留下。`
          : `是的，你把「${keyword}」落到了自己的生活里：${answer}。这比继续解释牌义更重要。`
        : pushedBack
          ? `All right, we can put the previous connection down. You said, "${answer}", and that mismatch is useful too.`
          : `Yes. You placed "${keyword}" inside your own life: ${answer}. That matters more than repeating the card meaning.`,
    integratedUserAnswer: answer,
    builtFromUserWords: [keyword, answer].filter(Boolean).slice(0, 3),
    wordAnchors: [],
    conceptAnchors: [],
    optionalQuestion:
      language === "zh"
        ? pushedBack
          ? `如果只看这张牌，最没有碰到你处境的是哪里：太像建议、太抽象，还是方向错了？`
          : `如果只看今天，这个「${keyword}」最先会落在哪一个很小的动作上？`
        : pushedBack
          ? "Looking only at this card, what misses your situation most: too advice-like, too abstract, or the wrong direction?"
          : `If you only look at today, where would "${keyword}" land as one small action?`,
    questionStyle: "scene",
    questionIntent: pushedBack ? "resistance" : "next_small_action",
    depthLevel: "scene",
    reframedQuestion: null,
    nextAction: "continue_current_card",
    suggestedNextCardRole: null,
    suggestedNextCardReason: null
  });
}

function buildCardEntryRescue(content: Record<string, unknown>, thread: ChatThread, language: Language) {
  const activeCard = getActiveCard(thread);
  const cardName = activeCard?.cardName || (language === "zh" ? "这张牌" : "this card");
  const keyword = activeCard?.selectedCardKeyword || activeCard?.cardMismatchReason || activeCard?.nodeLabel || cardName;
  const cardMeaning = typeof content.cardMeaning === "string" ? content.cardMeaning : typeof content.response === "string" ? content.response : "";
  const direction = typeof content.disruption === "string" ? content.disruption : typeof content.inCurrentQuestion === "string" ? content.inCurrentQuestion : cardMeaning;

  return JSON.stringify({
    type: "card_entry",
    cardTitle: cardName,
    cardRole: activeCard?.role || (language === "zh" ? "新的角度" : "New angle"),
    cardMeaning,
    symbolConnection: null,
    spreadConnection: null,
    inCurrentQuestion: direction,
    questionToUser:
      language === "zh"
        ? `如果把「${keyword}」放回你的问题里，最近哪个很小的时刻最像它？`
        : `If you place "${keyword}" beside your question, what small recent moment feels closest to it?`,
    questionIntent: "recent_scene",
    depthLevel: "scene",
    builtFromUserWords: [keyword].filter(Boolean),
    reframedQuestion: null,
    nextAction: "continue_current_card",
    suggestedNextCardRole: null,
    suggestedNextCardReason: null
  });
}

function normalizeResponseFlow(content: string, thread: ChatThread, eventType: ChatEventType, language: Language, latestUserMessage: string) {
  const activeCard = getActiveCard(thread);
  const parsed = parseRawJson(content);
  if (!parsed) return content;

  if (eventType === "follow-up" && (parsed.type === "sora_disruption" || parsed.type === "card_entry" || parsed.nextAction === "user_choose_resonance")) {
    return buildFollowUpRescue(thread, language, latestUserMessage);
  }

  if (eventType === "new-card") {
    if (parsed.type === "sora_disruption" || parsed.nextAction === "user_choose_resonance") {
      return buildCardEntryRescue(parsed, thread, language);
    }

    return JSON.stringify(ensureNewCardQuestion(parsed, thread, language));
  }

  if (eventType !== "follow-up" || !activeCard) return content;

  const unlooped = stopCauseLoop(parsed, thread, language, latestUserMessage);
  if (unlooped !== parsed) return JSON.stringify(unlooped);

  if (parsed.nextAction === "suggest_new_card" || parsed.suggestNextCard === true) {
    parsed.questionToUser = null;
    parsed.optionalQuestion = null;
    parsed.questionIntent = null;
    parsed.depthLevel = null;
  }

  if (parsed.nextAction === "suggest_finish" && (thread.spreadCards.length < 2 || activeCard.userTurnCount < 2)) {
    parsed.nextAction = "continue_current_card";
  }

  const question = typeof parsed.questionToUser === "string" ? parsed.questionToUser : typeof parsed.optionalQuestion === "string" ? parsed.optionalQuestion : "";
  if (question.trim() && activeCard.aiQuestionCount >= maxQuestionsForCard(latestUserMessage)) {
    parsed.questionToUser = null;
    parsed.optionalQuestion = null;
    parsed.questionIntent = null;
    parsed.depthLevel = null;
    parsed.nextAction = thread.spreadCards.length >= 2 ? "suggest_finish" : "suggest_new_card";
    parsed.suggestedNextCardRole = language === "zh" ? "为刚才反复出现的部分抽一张牌" : "Draw a card for the part that keeps returning";
    parsed.suggestedNextCardReason =
      language === "zh"
        ? "这个入口已经被说出来了，可以换一张牌让它从另一个角度继续。"
        : "This doorway has already been named; another card can continue it from a different angle.";
  }

  return JSON.stringify(parsed);
}

function getReframedQuestionFromResponse(content: string) {
  const parsed = parseRawJson(content);
  if (!parsed) return "";
  const reframed = typeof parsed.reframedQuestion === "string" ? parsed.reframedQuestion.trim() : "";
  const newQuestion = typeof parsed.newQuestion === "string" ? parsed.newQuestion.trim() : "";
  return reframed || newQuestion;
}

export default function ReflectiveChat({
  settings,
  thread,
  onThreadChange,
  onOpenSettings,
  onOpenArchive,
  onReturnHome
}: Props) {
  const zh = settings.language === "zh";
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(false);
  const [cardInputOpen, setCardInputOpen] = useState(false);
  const [activeTask, setActiveTask] = useState<ActiveTask>("idle");
  const [pendingKeywordCardId, setPendingKeywordCardId] = useState("");
  const [pushbackOpen, setPushbackOpen] = useState(false);
  const [pushbackReason, setPushbackReason] = useState("");
  const [pushbackNote, setPushbackNote] = useState("");
  const [finishPromptOpen, setFinishPromptOpen] = useState(false);
  const [exitConfirmOpen, setExitConfirmOpen] = useState(false);
  const [summary, setSummary] = useState<ParchmentSummaryType | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryError, setSummaryError] = useState("");
  const [notice, setNotice] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const activeCard = useMemo(() => getActiveCard(thread), [thread.spreadCards]);
  const pendingKeywordCard = thread.spreadCards.find((item) => item.id === pendingKeywordCardId);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [thread.messages, loading, pendingKeywordCardId]);

  function commitFrom(baseThread: ChatThread, messages: ChatMessageType[], patch: Partial<ChatThread> = {}) {
    const next: ChatThread = {
      ...baseThread,
      ...patch,
      messages,
      updatedAt: nowIso()
    };
    upsertThread(next);
    onThreadChange(next);
    return next;
  }

  function commit(messages: ChatMessageType[], patch: Partial<ChatThread> = {}) {
    return commitFrom(thread, messages, patch);
  }

  async function askAI(nextThread: ChatThread, latestUserMessage: string, eventType: ChatEventType = "follow-up") {
    setLoading(true);
    setNotice("");
    try {
      const response = await generateRealAIResponse({
        apiKey: getEffectiveApiKey(),
        baseUrl: settings.baseUrl,
        model: settings.model,
        language: settings.language,
        originalQuestion: nextThread.originalQuestion,
        currentQuestion: nextThread.currentQuestion,
        currentStage: eventType === "follow-up" && nextThread.currentStage === "resonant_disruption" ? "scene" : nextThread.currentStage,
        firstCardImpression: nextThread.firstCardImpression,
        openingSymbolSelection: nextThread.openingSymbolSelection,
        questionHistory: nextThread.questionHistory,
        operatingRules: nextThread.operatingRules,
        currentCard: getActiveCard(nextThread)?.cardName || "",
        spreadCards: nextThread.spreadCards,
        wordAnchors: nextThread.wordAnchors,
        conceptAnchors: nextThread.conceptAnchors,
        randomnessReflections: nextThread.randomnessReflections,
        usedGroundingEntryTypes: nextThread.usedGroundingEntryTypes,
        askedQuestionIntents: nextThread.askedQuestionIntents,
        chatHistory: nextThread.messages,
        latestUserMessage,
        eventType
      });
      const normalizedResponse = normalizeResponseFlow(response, nextThread, eventType, settings.language, latestUserMessage);
      const assistantMessage: ChatMessageType = {
        id: createId("msg"),
        role: "assistant",
        content: normalizedResponse,
        timestamp: nowIso()
      };
      const responseQuestion = getResponseQuestion(normalizedResponse);
      const reframedQuestion = getReframedQuestionFromResponse(normalizedResponse);
      const shouldShiftQuestion = Boolean(reframedQuestion && reframedQuestion !== nextThread.currentQuestion);
      const shouldOpenCardDrawer = responseSuggestsNewCard(normalizedResponse);
      const shiftMessage: ChatMessageType | null = shouldShiftQuestion
        ? {
            id: createId("msg"),
            role: "system",
            type: "question_shift",
            content:
              settings.language === "zh"
                ? `问题转向：${nextThread.currentQuestion} -> ${reframedQuestion}`
                : `Question shifted: ${nextThread.currentQuestion} -> ${reframedQuestion}`,
            fromQuestion: nextThread.currentQuestion,
            toQuestion: reframedQuestion,
            timestamp: nowIso()
          }
        : null;
      commitFrom(nextThread, [...nextThread.messages, assistantMessage, ...(shiftMessage ? [shiftMessage] : [])], {
        endedForNow: false,
        ...(eventType === "new-card" && nextThread.currentStage === "resonant_disruption" ? { currentStage: "scene" as const } : {}),
        ...(shouldShiftQuestion
          ? {
              currentQuestion: reframedQuestion,
              questionHistory: [
                ...nextThread.questionHistory,
                {
                  id: createId("question"),
                  fromQuestion: nextThread.currentQuestion,
                  toQuestion: reframedQuestion,
                  reason: settings.language === "zh" ? "由这轮回应临时改写" : "Reframed by this response",
                  cardName: getActiveCard(nextThread)?.cardName,
                  cardRole: getActiveCard(nextThread)?.role,
                  createdAt: nowIso()
                }
              ]
            }
          : {}),
        ...(responseQuestion
          ? {
              spreadCards: bumpActiveCardCounter(nextThread.spreadCards, "aiQuestionCount"),
              askedQuestionIntents: [
                ...(nextThread.askedQuestionIntents || []),
                {
                  intent: responseQuestion.intent,
                  depthLevel: responseQuestion.depthLevel,
                  soraStage: responseQuestion.stage,
                  questionText: responseQuestion.questionText,
                  cardId: getActiveCard(nextThread)?.id,
                  createdAt: nowIso()
                }
              ]
            }
          : {})
      });
      if (shouldOpenCardDrawer) {
        setCardInputOpen(true);
        setActiveTask("draw_new_card");
        setPushbackOpen(false);
        setFinishPromptOpen(false);
      }
    } catch (error) {
      setNotice(error instanceof Error ? error.message : zh ? "请求失败了。" : "Request failed.");
    } finally {
      setLoading(false);
    }
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
      spreadCards: bumpActiveCardCounter(thread.spreadCards, "userTurnCount"),
      endedForNow: false
    });
    setDraft("");
    void askAI(next, content, eventType);
  }

  function drawAnother() {
    setCardInputOpen(true);
    setActiveTask("draw_new_card");
    setPushbackOpen(false);
    setFinishPromptOpen(false);
    setNotice("");
  }

  function closeCardInput() {
    setCardInputOpen(false);
    setActiveTask("idle");
    setNotice("");
  }

  function handleCard(selectedCard: TarotDeckCard) {
    const cardName = zh ? selectedCard.nameZh : selectedCard.nameEn;
    const newCard: SpreadCardType = {
      id: createId("spread"),
      deckCardId: selectedCard.id,
      order: thread.spreadCards.length + 1,
      cardName,
      cardNameZh: selectedCard.nameZh,
      role: zh ? "新的角度" : "New angle",
      reason: zh ? "从右侧面板抽入" : "Drawn from the side panel",
      nodeType: "user_requested_angle",
      nodeLabel: zh ? "新的角度" : "New angle",
      drawnAt: nowIso(),
      isActive: true,
      userTurnCount: 0,
      aiQuestionCount: 0,
      cardKeywords: getCardKeywords(selectedCard.id, settings.language)
    };
    const cardMessage: ChatMessageType = {
      id: createId("msg"),
      role: "card",
      cardName,
      content: zh ? `「${cardName}」加入了这次对话。` : `${selectedCard.nameEn} joined this conversation.`,
      timestamp: nowIso()
    };
    commit([...thread.messages, cardMessage], {
      spreadCards: [...thread.spreadCards.map((card) => ({ ...card, isActive: false })), newCard],
      currentStage: "resonant_disruption",
      endedForNow: false
    });
    setCardInputOpen(false);
    setActiveTask("choose_card_keyword");
    setPendingKeywordCardId(newCard.id);
  }

  function chooseCardKeyword(keyword: string) {
    const card = pendingKeywordCard || activeCard;
    if (!card) return;
    const nextCards = thread.spreadCards.map((item) => (item.id === card.id ? { ...item, selectedCardKeyword: keyword } : item));
    const userMessage: ChatMessageType = {
      id: createId("msg"),
      role: "user",
      content: zh ? `我选择了：「${keyword}」` : `I chose: "${keyword}"`,
      timestamp: nowIso()
    };
    const next = commit([...thread.messages, userMessage], {
      spreadCards: bumpActiveCardCounter(nextCards, "userTurnCount"),
      endedForNow: false
    });
    setPendingKeywordCardId("");
    setActiveTask("idle");
    void askAI(next, userMessage.content, "new-card");
  }

  function submitCardMismatch(reason: string) {
    const card = pendingKeywordCard || activeCard;
    if (!card || !reason.trim()) return;
    const nextCards = thread.spreadCards.map((item) => (item.id === card.id ? { ...item, cardMismatchReason: reason.trim() } : item));
    const userMessage: ChatMessageType = {
      id: createId("msg"),
      role: "user",
      content: zh ? `这些词暂时不贴合：${reason.trim()}` : `These words do not fit yet: ${reason.trim()}`,
      timestamp: nowIso()
    };
    const next = commit([...thread.messages, userMessage], {
      spreadCards: bumpActiveCardCounter(nextCards, "userTurnCount"),
      endedForNow: false
    });
    setPendingKeywordCardId("");
    setActiveTask("idle");
    void askAI(next, userMessage.content, "new-card");
  }

  function drawAgainFromMismatch() {
    const card = pendingKeywordCard || activeCard;
    if (card) {
      const nextCards = thread.spreadCards.map((item) =>
        item.id === card.id ? { ...item, cardMismatchReason: "user chose to draw another card" } : item
      );
      commit(thread.messages, { spreadCards: nextCards, endedForNow: false });
    }
    setPendingKeywordCardId("");
    drawAnother();
  }

  function submitPushback() {
    const reason = [pushbackReason, pushbackNote.trim()].filter(Boolean).join(" / ");
    if (!reason || loading) return;
    setPushbackOpen(false);
    setPushbackReason("");
    setPushbackNote("");
    setActiveTask("idle");
    sendMessage(zh ? `我想反驳这次回应：${reason}` : `I want to push back on this response: ${reason}`, "resist");
  }

  function saveChat() {
    upsertThread(thread);
    setNotice(zh ? "已保存在本地。" : "Saved locally.");
  }

  function returnHomeWithSave() {
    upsertThread(thread);
    setExitConfirmOpen(false);
    onReturnHome();
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
        currentStage: thread.currentStage,
        firstCardImpression: thread.firstCardImpression,
        openingSymbolSelection: thread.openingSymbolSelection,
        questionHistory: thread.questionHistory,
        operatingRules: thread.operatingRules,
        spreadCards: thread.spreadCards,
        wordAnchors: thread.wordAnchors,
        randomnessReflections: thread.randomnessReflections,
        chatHistory: thread.messages
      });
      setSummary(nextSummary);
      commit(thread.messages, {
        parchmentSummary: nextSummary,
        endedForNow: true
      });
      setFinishPromptOpen(false);
    } catch (error) {
      setSummaryError(error instanceof Error ? error.message : zh ? "总结生成失败。" : "Summary failed.");
    } finally {
      setSummaryLoading(false);
    }
  }

  return (
    <div className="chat-layout fade-in">
      <section className="chat-column">
        <CurrentQuestionHeader
          currentQuestion={thread.currentQuestion}
          originalQuestion={thread.originalQuestion}
          language={settings.language}
        />
        <div className="chat-stream" aria-live="polite">
          {thread.messages.map((message) => (
            <ChatMessage
              key={message.id}
              message={message}
              language={settings.language}
              onChooseResonance={(choice) => sendMessage(choice, isPushbackText(choice) ? "resist" : "follow-up")}
            />
          ))}
          <ChatCardKeywordPrompt
            card={pendingKeywordCard}
            language={settings.language}
            onChoose={chooseCardKeyword}
            onMismatch={submitCardMismatch}
            onDrawAgain={drawAgainFromMismatch}
          />
          {loading && <div className="typing">{zh ? "正在回应..." : "Thinking..."}</div>}
          <div ref={scrollRef} />
        </div>

        <div className="composer">
          <button className="icon-action chat-home-action" onClick={() => setExitConfirmOpen(true)} aria-label={zh ? "退出到首页" : "Return home"}>
            <Home size={16} />
          </button>
          <textarea
            value={draft}
            placeholder={zh ? "继续写下你的回应..." : "Continue your response..."}
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
            {zh ? "发送" : "Send"}
          </button>
        </div>
      </section>

      <aside className="side-column">
        <DynamicSpread
          cards={thread.spreadCards}
          wordAnchors={thread.wordAnchors}
          openingSymbolSelection={thread.openingSymbolSelection}
          language={settings.language}
        />

        {activeTask === "draw_new_card" && (
          <CardInputPanel
            language={settings.language}
            open={cardInputOpen}
            onOpen={() => setCardInputOpen(true)}
            onCancel={closeCardInput}
            onCardSelected={handleCard}
          />
        )}

        {pushbackOpen && (
          <PushbackPanel
            language={settings.language}
            selected={pushbackReason}
            note={pushbackNote}
            onSelect={setPushbackReason}
            onNote={setPushbackNote}
            onSubmit={submitPushback}
            onCancel={() => {
              setPushbackOpen(false);
              setActiveTask("idle");
            }}
          />
        )}

        <div className="action-grid">
          <button onClick={drawAnother} disabled={loading}>
            <Wand2 size={17} />
            {zh ? "抽新牌" : "Draw new card"}
          </button>
          <button
            onClick={() => {
              setPushbackOpen(true);
              setCardInputOpen(false);
              setActiveTask("pushback");
            }}
            disabled={loading}
          >
            <Hand size={17} />
            {zh ? "反驳这次回应" : "Push back"}
          </button>
          <button onClick={() => setFinishPromptOpen(true)} disabled={loading}>
            <Square size={17} />
            {zh ? "进入总结" : "Summary"}
          </button>
          <button onClick={() => setExitConfirmOpen(true)}>
            <Home size={17} />
            {zh ? "退出到首页" : "Return home"}
          </button>
          <button onClick={saveChat}>
            <Bookmark size={17} />
            {zh ? "保存对话" : "Save chat"}
          </button>
          <button onClick={onOpenArchive}>
            <Archive size={17} />
            {zh ? "已保存的对话" : "Saved chats"}
          </button>
          <button onClick={onOpenSettings}>
            <SettingsIcon size={17} />
            {zh ? "设置" : "Settings"}
          </button>
        </div>
        {notice && <p className="notice">{notice}</p>}
      </aside>

      {finishPromptOpen && (
        <div className="modal-backdrop" onClick={() => !summaryLoading && setFinishPromptOpen(false)}>
          <section className="modal finish-panel" onClick={(event) => event.stopPropagation()}>
            <h2>{zh ? "要生成这次对话的总结吗？" : "Create a reflection summary?"}</h2>
            {summaryError && <p className="error-text">{summaryError}</p>}
            {summaryLoading && <p className="notice">{zh ? "正在整理..." : "Gathering the traces..."}</p>}
            <div className="button-row">
              <button className="primary-action" onClick={createSummary} disabled={summaryLoading}>
                {zh ? "生成总结" : "Create summary"}
              </button>
              <button className="ghost-action" onClick={() => setFinishPromptOpen(false)} disabled={summaryLoading}>
                {zh ? "继续对话" : "Continue chat"}
              </button>
            </div>
          </section>
        </div>
      )}

      {exitConfirmOpen && (
        <div className="modal-backdrop" onClick={() => setExitConfirmOpen(false)}>
          <section className="modal finish-panel" onClick={(event) => event.stopPropagation()}>
            <h2>{zh ? "要退出这次对话吗？" : "Leave this conversation?"}</h2>
            <p>{zh ? "对话会自动保存在本地。之后可以从已保存的对话中继续。" : "Your chat will be saved locally. You can continue from Saved Chats later."}</p>
            <div className="button-row">
              <button className="primary-action" onClick={returnHomeWithSave}>
                {zh ? "退出到首页" : "Return home"}
              </button>
              <button className="ghost-action" onClick={() => setExitConfirmOpen(false)}>
                {zh ? "继续对话" : "Continue chat"}
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
            commit(thread.messages, { parchmentSummary: nextSummary });
          }}
          onReturnHome={returnHomeWithSave}
          onContinue={() => setSummary(null)}
          onClose={() => setSummary(null)}
        />
      )}
    </div>
  );
}

function ChatCardKeywordPrompt({
  card,
  language,
  onChoose,
  onMismatch,
  onDrawAgain
}: {
  card?: SpreadCardType;
  language: Language;
  onChoose: (keyword: string) => void;
  onMismatch: (reason: string) => void;
  onDrawAgain: () => void;
}) {
  const [showMismatch, setShowMismatch] = useState(false);
  const [mismatch, setMismatch] = useState("");
  if (!card || card.selectedCardKeyword || card.cardMismatchReason || !card.cardKeywords?.length) return null;
  const zh = language === "zh";
  return (
    <article className="message message-assistant message-ai-ritual">
      <div className="ai-ritual-card">
        <p className="ai-reflection-line">{getCardMeaningAngle(card.deckCardId || card.cardName, language)}</p>
        <div className="ai-question-block">
          <span>{zh ? "给你" : "For you"}</span>
          <p>{zh ? "这些词里，哪个和你现在的问题有一点关系？" : "Which word feels connected to your question right now?"}</p>
        </div>
        <div className="impression-chip-row">
          {card.cardKeywords.map((keyword) => (
            <button key={keyword} onClick={() => onChoose(keyword)}>
              {keyword}
            </button>
          ))}
          <button onClick={() => setShowMismatch(true)}>{zh ? "都不贴合" : "none fit"}</button>
        </div>
        {showMismatch && (
          <label>
            {zh ? "哪里不贴合？是这些词太远、太像建议，还是完全没有碰到你的问题？" : "What does not fit? Are these words too distant, too advice-like, or simply not touching your question?"}
            <textarea value={mismatch} onChange={(event) => setMismatch(event.target.value)} rows={3} />
            <div className="button-row">
              <button className="primary-action" disabled={!mismatch.trim()} onClick={() => onMismatch(mismatch)}>
                {zh ? "带着这个不贴合继续" : "Continue with the mismatch"}
              </button>
              <button className="ghost-action" onClick={onDrawAgain}>
                {zh ? "换一张牌" : "Draw another card"}
              </button>
            </div>
          </label>
        )}
      </div>
    </article>
  );
}

function PushbackPanel({
  language,
  selected,
  note,
  onSelect,
  onNote,
  onSubmit,
  onCancel
}: {
  language: Language;
  selected: string;
  note: string;
  onSelect: (value: string) => void;
  onNote: (value: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
}) {
  const zh = language === "zh";
  const options = zh
    ? ["不像我", "太像 AI 硬解释", "太道德化 / 太像建议", "把问题带偏了", "太宽泛", "说不清，但不对"]
    : ["It does not feel like me", "It feels forced", "Too moralizing / advice-like", "Wrong direction", "Too broad", "I cannot name it, but it feels wrong"];
  return (
    <section className="tarot-panel pushback-panel">
      <h3>{zh ? "哪里不对？" : "What does not fit?"}</h3>
      <div className="role-choice-grid">
        {options.map((option) => (
          <button key={option} className={selected === option ? "active" : ""} onClick={() => onSelect(option)}>
            {option}
          </button>
        ))}
      </div>
      <textarea value={note} onChange={(event) => onNote(event.target.value)} placeholder={zh ? "补充一句..." : "Add one sentence..."} rows={3} />
      <div className="button-row">
        <button className="primary-action" disabled={!selected && !note.trim()} onClick={onSubmit}>
          {zh ? "送出反驳" : "Send pushback"}
        </button>
        <button className="ghost-action" onClick={onCancel}>
          {zh ? "取消" : "Cancel"}
        </button>
      </div>
    </section>
  );
}

function getActiveCard(thread: ChatThread): SpreadCardType | undefined {
  return thread.spreadCards.find((card) => card.isActive) || thread.spreadCards.at(-1);
}
