import { RefreshCw, Send, Sparkles } from "lucide-react";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { getEffectiveApiKey, getFreeTrialProxyUrl } from "../lib/storage";
import { generatePositionAgentResponse } from "../lib/spreadAgentClient";
import { getDisplayKeywords } from "../lib/tarotCardKnowledge";
import { createId, nowIso } from "../lib/utils";
import type { ChatMessage, ChatThread, Language, PositionReading, Settings, SpreadPosition, TarotSpread } from "../types";

type Props = {
  language: Language;
  settings: Settings;
  thread: ChatThread;
  spread: TarotSpread;
  position: SpreadPosition;
  reading: PositionReading;
  previousPositions: PositionReading[];
  onReadingChange: (reading: PositionReading) => void;
  onCompleteReading: (reading: PositionReading) => void;
};

export default function PositionAgentChat({
  language,
  settings,
  thread,
  spread,
  position,
  reading,
  previousPositions,
  onReadingChange,
  onCompleteReading
}: Props) {
  const zh = language === "zh";
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(false);
  const [closing, setClosing] = useState(false);
  const [error, setError] = useState("");
  const requestKeyRef = useRef("");
  const streamRef = useRef<HTMLDivElement | null>(null);

  const companionName = zh ? "读牌伙伴" : "Reading companion";
  const initialKey = `${reading.positionId}:${reading.card?.id || ""}:${reading.userObservation || ""}`;
  const cardKeywords = useMemo(() => (reading.card ? getDisplayKeywords(reading.card, language) : []), [language, reading.card]);

  useEffect(() => {
    if (!reading.userObservation || !reading.card || reading.dialogue.length || requestKeyRef.current === initialKey) return;
    requestKeyRef.current = initialKey;
    void requestCompanion(false, reading);
  }, [initialKey, reading.card, reading.dialogue.length, reading.userObservation]);

  useEffect(() => {
    const stream = streamRef.current;
    if (!stream) return;
    stream.scrollTo({ top: stream.scrollHeight, behavior: "smooth" });
  }, [reading.dialogue.length, loading, error]);

  async function requestCompanion(forceCompletion: boolean, baseReading: PositionReading) {
    setLoading(true);
    setClosing(forceCompletion);
    setError("");
    try {
      const apiKey = getEffectiveApiKey();
      const response = await generatePositionAgentResponse({
        apiKey,
        baseUrl: settings.baseUrl,
        model: settings.model,
        freeTrialProxyUrl: apiKey ? "" : getFreeTrialProxyUrl(),
        freeTrialThreadId: thread.id,
        language,
        originalQuestion: thread.originalQuestion,
        spread,
        position,
        positionReading: baseReading,
        previousPositions,
        allPositionReadings: thread.spreadPositions || [],
        choiceA: thread.choiceA,
        choiceB: thread.choiceB,
        forceCompletion
      });
      const content = [response.response, response.questionToUser].filter(Boolean).join("\n\n");
      const assistantMessage: ChatMessage = {
        id: createId("msg"),
        role: "assistant",
        content,
        timestamp: nowIso()
      };
      const nextReading: PositionReading = {
        ...baseReading,
        dialogue: [...baseReading.dialogue, assistantMessage],
        turnCount: baseReading.turnCount + 1
      };

      if (response.shouldComplete) {
        const ultimate = response.ultimateQuestion || undefined;
        const insight = response.coreInsight || undefined;
        const completed: PositionReading = {
          ...nextReading,
          status: "completed",
          ultimateQuestionZh: language === "zh" ? ultimate : ultimate || nextReading.ultimateQuestionZh,
          ultimateQuestionEn: language === "en" ? ultimate : ultimate || nextReading.ultimateQuestionEn,
          coreInsightZh: language === "zh" ? insight : insight || nextReading.coreInsightZh,
          coreInsightEn: language === "en" ? insight : insight || nextReading.coreInsightEn
        };
        onCompleteReading(completed);
      } else {
        onReadingChange(nextReading);
      }
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : zh ? "这位读牌伙伴暂时没有回应成功。" : "The reading companion could not respond.");
    } finally {
      setLoading(false);
      setClosing(false);
    }
  }

  function sendUserMessage() {
    const content = draft.trim();
    if (!content || loading) return;
    const userMessage: ChatMessage = {
      id: createId("msg"),
      role: "user",
      content,
      timestamp: nowIso()
    };
    const nextReading = {
      ...reading,
      dialogue: [...reading.dialogue, userMessage]
    };
    setDraft("");
    onReadingChange(nextReading);
    void requestCompanion(nextReading.turnCount >= 4, nextReading);
  }

  function challengeInterpretation() {
    if (loading) return;
    const content = zh
      ? "我觉得刚才的解读有偏差。请先用一两句话重新复述你理解的我的意思，不要急着下判断；然后基于我的原问题、我之前的输入、这张牌和当前牌位，换一个更贴近我原话的角度重新分析。请不要直接替我做决定。"
      : "I think the previous interpretation missed something. Please first restate what you understand I mean in one or two sentences without judging too quickly; then, using my original question, my prior inputs, this card, and the current position, re-analyze from an angle closer to my own words. Please do not decide for me.";
    const userMessage: ChatMessage = {
      id: createId("msg"),
      role: "user",
      content,
      timestamp: nowIso()
    };
    const nextReading = {
      ...reading,
      dialogue: [...reading.dialogue, userMessage]
    };
    onReadingChange(nextReading);
    void requestCompanion(false, nextReading);
  }

  function completeNow() {
    if (loading) return;
    void requestCompanion(true, reading);
  }

  return (
    <section className="position-agent-chat">
      <div className="position-dialogue-stream" ref={streamRef}>
        {reading.dialogue.map((message) => (
          <article key={message.id} className={`position-message position-message-${message.role}`}>
            <div className="position-message-meta">
              <span>{message.role === "user" ? (zh ? "你" : "You") : companionName}</span>
              {message.role === "assistant" && (
                <button className="message-correction-button" disabled={loading} onClick={challengeInterpretation}>
                  <RefreshCw size={13} />
                  {zh ? "解读有偏差" : "This misses me"}
                </button>
              )}
            </div>
            <MessageContent content={message.content} keywords={message.role === "assistant" ? cardKeywords : []} />
          </article>
        ))}
        {loading && (
          <article className="position-message position-message-assistant loading">
            <span>{companionName}</span>
            <p>
              {closing
                ? zh
                  ? "我已经有足够的材料了，正在把这个位置收成一个可以带走的小问题。"
                  : "I have enough material now, and I am gathering this position into one question to carry."
                : zh
                  ? "我在听这张牌和你的话，稍等一下。"
                  : "I am listening to the card and your words. One moment."}
            </p>
          </article>
        )}
      </div>

      {error && <p className="form-error">{error}</p>}

      <div className="position-chat-composer">
        <textarea
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder={zh ? "把刚刚浮出来的那一点写下来……" : "Write the part that just came up..."}
          onKeyDown={(event) => {
            if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) sendUserMessage();
          }}
        />
        <div className="button-row">
          <button className="primary-action" disabled={!draft.trim() || loading} onClick={sendUserMessage}>
            <Send size={16} />
            {zh ? "发送" : "Send"}
          </button>
          <button className="ghost-action" disabled={loading} onClick={completeNow}>
            <Sparkles size={16} />
            {zh ? "收束这个位置" : "Close this position"}
          </button>
        </div>
      </div>
    </section>
  );
}

function MessageContent({ content, keywords }: { content: string; keywords: string[] }) {
  const visibleKeywords = keywords.filter((keyword) => content.toLowerCase().includes(keyword.toLowerCase())).slice(0, 6);
  const paragraphs = content.split(/\n{2,}/).map((paragraph) => paragraph.trim()).filter(Boolean);
  return (
    <div className="position-message-content">
      {paragraphs.map((paragraph, index) => (
        <p key={`${paragraph.slice(0, 20)}-${index}`}>{highlightKeywords(paragraph, visibleKeywords)}</p>
      ))}
      {visibleKeywords.length > 0 && (
        <div className="message-keyword-bubbles" aria-label="keywords in this response">
          {visibleKeywords.map((keyword) => (
            <span key={keyword}>{keyword}</span>
          ))}
        </div>
      )}
    </div>
  );
}

function highlightKeywords(text: string, keywords: string[]): ReactNode[] {
  if (!keywords.length) return [text];
  const sorted = [...keywords].sort((a, b) => b.length - a.length);
  const pattern = new RegExp(`(${sorted.map(escapeRegExp).join("|")})`, "gi");
  return text.split(pattern).map((part, index) => {
    const matched = sorted.find((keyword) => keyword.toLowerCase() === part.toLowerCase());
    return matched ? (
      <strong className="message-keyword-highlight" key={`${part}-${index}`}>
        {part}
      </strong>
    ) : (
      part
    );
  });
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
