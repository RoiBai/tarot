import { Send, Sparkles } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { getEffectiveApiKey } from "../lib/storage";
import { generatePositionAgentResponse } from "../lib/spreadAgentClient";
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
      const response = await generatePositionAgentResponse({
        apiKey: getEffectiveApiKey(),
        baseUrl: settings.baseUrl,
        model: settings.model,
        language,
        originalQuestion: thread.originalQuestion,
        spread,
        position,
        positionReading: baseReading,
        previousPositions,
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

  function completeNow() {
    if (loading) return;
    void requestCompanion(true, reading);
  }

  return (
    <section className="position-agent-chat">
      <div className="position-dialogue-stream" ref={streamRef}>
        {reading.dialogue.map((message) => (
          <article key={message.id} className={`position-message position-message-${message.role}`}>
            <span>{message.role === "user" ? (zh ? "你" : "You") : companionName}</span>
            <p>{message.content}</p>
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
