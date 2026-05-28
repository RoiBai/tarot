import { ArrowLeft, Home, RotateCcw, SkipForward } from "lucide-react";
import { useMemo, useState } from "react";
import { tarotDeck, withBase } from "../lib/tarotDeck";
import type { ChatThread, Language, PositionReading, Settings, TarotSpread } from "../types";
import CardSelector from "./CardSelector";
import OnlineCardDraw from "./OnlineCardDraw";
import PositionAgentChat from "./PositionAgentChat";

type Props = {
  language: Language;
  settings: Settings;
  thread: ChatThread;
  spread: TarotSpread;
  positionId: string;
  onReadingChange: (reading: PositionReading) => void;
  onCompleteReading: (reading: PositionReading) => void;
  onSkipReading: (reading: PositionReading) => void;
  onBackToBoard: () => void;
  onReturnHome: () => void;
};

const chips = {
  zh: ["人物", "颜色", "动作", "表情", "物件", "气氛", "说不清"],
  en: ["figure", "color", "movement", "expression", "object", "atmosphere", "hard to name"]
};

export default function PositionFocusPage({
  language,
  settings,
  thread,
  spread,
  positionId,
  onReadingChange,
  onCompleteReading,
  onSkipReading,
  onBackToBoard,
  onReturnHome
}: Props) {
  const zh = language === "zh";
  const reading = (thread.spreadPositions || []).find((item) => item.positionId === positionId);
  const position = spread.positions.find((item) => item.id === positionId);
  const [observationDraft, setObservationDraft] = useState(reading?.userObservation || "");
  const [selectedChips, setSelectedChips] = useState<string[]>([]);
  const [drawMode, setDrawMode] = useState<"physical" | "online">("physical");

  const previousPositions = useMemo(
    () =>
      (thread.spreadPositions || []).filter(
        (item) => item.positionOrder < (reading?.positionOrder || 0) && item.status === "completed"
      ),
    [reading?.positionOrder, thread.spreadPositions]
  );

  if (!reading || !position) {
    return (
      <section className="position-focus-page">
        <button className="ghost-action" onClick={onBackToBoard}>
          <ArrowLeft size={16} />
          {zh ? "回到牌阵" : "Back to spread"}
        </button>
      </section>
    );
  }

  const currentReading: PositionReading = reading;
  const title = zh ? currentReading.positionTitleZh : currentReading.positionTitleEn;
  const positionQuestion = zh ? currentReading.positionQuestionZh : currentReading.positionQuestionEn;
  const cardName = currentReading.card ? (zh ? currentReading.card.nameZh : currentReading.card.nameEn) : "";
  const reviewOnly = currentReading.status === "completed" || currentReading.status === "skipped";
  const hasObservation = Boolean(currentReading.userObservation);
  const ultimate = zh
    ? currentReading.ultimateQuestionZh || currentReading.ultimateQuestionEn
    : currentReading.ultimateQuestionEn || currentReading.ultimateQuestionZh;
  const insight = zh ? currentReading.coreInsightZh || currentReading.coreInsightEn : currentReading.coreInsightEn || currentReading.coreInsightZh;

  function chooseAnotherCard() {
    onReadingChange({
      ...currentReading,
      card: undefined,
      userObservation: undefined,
      dialogue: [],
      ultimateQuestionZh: undefined,
      ultimateQuestionEn: undefined,
      coreInsightZh: undefined,
      coreInsightEn: undefined,
      status: "active",
      turnCount: 0
    });
    setObservationDraft("");
    setSelectedChips([]);
  }

  function saveObservation() {
    const chipsText = selectedChips.length ? `[${selectedChips.join(", ")}]` : "";
    const value = [observationDraft.trim(), chipsText].filter(Boolean).join(" ");
    if (!value) return;
    onReadingChange({ ...currentReading, userObservation: value });
  }

  function skipPosition() {
    onSkipReading({ ...currentReading, status: "skipped" });
  }

  function confirmHome() {
    const message = zh
      ? "这次牌阵的进度已经保存在本地。要先回到首页吗？之后你还可以从已保存的牌阵继续。"
      : "This spread has been saved locally. Return home for now? You can continue from Saved Spreads later.";
    if (window.confirm(message)) onReturnHome();
  }

  function toggleChip(chip: string) {
    setSelectedChips((current) => (current.includes(chip) ? current.filter((item) => item !== chip) : [...current, chip]));
  }

  function selectCard(card: PositionReading["card"]) {
    if (!card) return;
    onReadingChange({
      ...currentReading,
      card,
      userObservation: undefined,
      dialogue: [],
      ultimateQuestionZh: undefined,
      ultimateQuestionEn: undefined,
      coreInsightZh: undefined,
      coreInsightEn: undefined,
      turnCount: 0
    });
    setObservationDraft("");
    setSelectedChips([]);
  }

  return (
    <section className="position-focus-page fade-in">
      <button className="ghost-action" onClick={onBackToBoard}>
        <ArrowLeft size={16} />
        {zh ? "回到牌阵" : "Back to spread"}
      </button>

      <header className="position-focus-header">
        <p className="ritual-label">{zh ? `${spread.nameZh} · 总问题：${thread.originalQuestion}` : `${spread.nameEn} · Main question: ${thread.originalQuestion}`}</p>
        <h2>{title}</h2>
        <p>{positionQuestion}</p>
      </header>

      {reviewOnly ? (
        <section className="position-review-panel tarot-panel">
          {currentReading.card && (
            <div className="focused-card-image">
              <img src={withBase(currentReading.card.imagePath)} alt={cardName} />
              <strong>{cardName}</strong>
            </div>
          )}
          {currentReading.status === "skipped" && <p>{zh ? "这个位置已经先放下了。你可以回到牌阵继续。" : "This position was set aside for now. You can return to the spread and continue."}</p>}
          {currentReading.userObservation && (
            <div className="position-note-block">
              <span>{zh ? "你先看到的" : "What you first noticed"}</span>
              <p>{currentReading.userObservation}</p>
            </div>
          )}
          {ultimate && (
            <div className="position-note-block gold">
              <span>{zh ? "这个位置留下的小问题" : "Question left by this position"}</span>
              <p>{ultimate}</p>
            </div>
          )}
          {insight && (
            <div className="position-note-block">
              <span>{zh ? "暂时的核心理解" : "Core insight for now"}</span>
              <p>{insight}</p>
            </div>
          )}
        </section>
      ) : (
        <div className="position-focus-grid">
          <section className="tarot-panel position-card-panel">
            {!currentReading.card ? (
              <>
                <p className="ritual-label">{zh ? "抽牌方式" : "Card input"}</p>
                <h3>{zh ? "你为这个位置抽到了什么牌？" : "What card did you draw for this position?"}</h3>
                <div className="segmented full draw-mode-tabs">
                  <button className={drawMode === "physical" ? "active" : ""} onClick={() => setDrawMode("physical")}>
                    {zh ? "输入实体牌" : "Enter physical card"}
                  </button>
                  <button className={drawMode === "online" ? "active" : ""} onClick={() => setDrawMode("online")}>
                    {zh ? "线上抽一张" : "Draw online"}
                  </button>
                </div>
                {drawMode === "physical" ? (
                  <CardSelector language={language} onCardSelected={selectCard} />
                ) : (
                  <OnlineCardDraw
                    cards={tarotDeck}
                    language={language}
                    revealCardName={false}
                    title={zh ? "线上抽一张牌" : "Draw one card online"}
                    subtitle={zh ? "如果你手边没有实体牌，可以在这里凭第一感觉选一张牌背。" : "If you do not have your physical deck nearby, choose a face-down card here by feel."}
                    confirmLabel={zh ? "就用这张" : "Use this card"}
                    onCardSelected={selectCard}
                  />
                )}
              </>
            ) : (
              <>
                <div className={`focused-card-image ${hasObservation ? "" : "image-only"}`}>
                  <img src={withBase(currentReading.card.imagePath)} alt={hasObservation ? cardName : ""} />
                  {hasObservation ? (
                    <>
                      <strong>{cardName}</strong>
                      <span>{zh ? currentReading.card.shortMeaningZh : currentReading.card.shortMeaningEn}</span>
                    </>
                  ) : (
                    <span>{zh ? "先只看图像本身，不急着看解释。" : "For now, just look at the image itself."}</span>
                  )}
                </div>
                <button className="ghost-action" onClick={chooseAnotherCard}>
                  <RotateCcw size={16} />
                  {zh ? "重新选择这张牌" : "Choose another card"}
                </button>
              </>
            )}
          </section>

          {currentReading.card && !currentReading.userObservation && (
            <section className="tarot-panel observation-panel">
              <h3>{zh ? "你在这张牌里先看到了什么？或者它给你的第一感觉是什么？" : "What did you first notice in this card? Or what was its first feeling?"}</h3>
              <div className="impression-chip-row">
                {chips[language].map((chip) => (
                  <button key={chip} className={selectedChips.includes(chip) ? "selected" : ""} onClick={() => toggleChip(chip)}>
                    {chip}
                  </button>
                ))}
              </div>
              <textarea value={observationDraft} onChange={(event) => setObservationDraft(event.target.value)} />
              <button className="primary-action" disabled={!observationDraft.trim() && !selectedChips.length} onClick={saveObservation}>
                {zh ? "继续" : "Continue"}
              </button>
            </section>
          )}

          {currentReading.card && currentReading.userObservation && (
            <PositionAgentChat
              language={language}
              settings={settings}
              thread={thread}
              spread={spread}
              position={position}
              reading={currentReading}
              previousPositions={previousPositions}
              onReadingChange={onReadingChange}
              onCompleteReading={onCompleteReading}
            />
          )}
        </div>
      )}

      {!reviewOnly && (
        <div className="button-row position-secondary-actions">
          <button className="ghost-action" onClick={skipPosition}>
            <SkipForward size={16} />
            {zh ? "先跳过这个位置" : "Skip this position"}
          </button>
          <button className="ghost-action" onClick={confirmHome}>
            <Home size={16} />
            {zh ? "回到首页" : "Return Home"}
          </button>
        </div>
      )}
      {reviewOnly && (
        <div className="button-row position-secondary-actions">
          <button className="ghost-action" onClick={confirmHome}>
            <Home size={16} />
            {zh ? "回到首页" : "Return Home"}
          </button>
        </div>
      )}
    </section>
  );
}
