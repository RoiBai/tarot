import { Sparkles } from "lucide-react";
import { useMemo, useState } from "react";
import { getSymbolsForCard } from "../lib/cardSymbols";
import { majorArcanaDeck, type TarotDeckCard, withBase } from "../lib/tarotDeck";
import type { Language, SymbolSelection } from "../types";
import OnlineCardDraw from "./OnlineCardDraw";

type Props = {
  language: Language;
  question: string;
  onComplete: (payload: { card: TarotDeckCard; selection: SymbolSelection }) => void;
};

export default function OpeningCardSymbolLens({ language, question, onComplete }: Props) {
  const zh = language === "zh";
  const [cardId, setCardId] = useState("");
  const [selectedSymbolId, setSelectedSymbolId] = useState("");
  const [selectedDirection, setSelectedDirection] = useState("");
  const [customMeaning, setCustomMeaning] = useState("");
  const [imageFailed, setImageFailed] = useState(false);
  const [drawMode, setDrawMode] = useState<"online" | "physical">("online");

  const card = majorArcanaDeck.find((item) => item.id === cardId);
  const symbols = useMemo(() => (card ? getSymbolsForCard(card.id) : []), [card]);
  const selectedSymbol = symbols.find((symbol) => symbol.id === selectedSymbolId);
  const directions = selectedSymbol ? (zh ? selectedSymbol.possibleDirectionsZh : selectedSymbol.possibleDirectionsEn) : [];
  const symbolLabel = selectedSymbol ? (zh ? selectedSymbol.labelZh : selectedSymbol.labelEn) : "";
  const meaning = customMeaning.trim() || selectedDirection;
  const ready = card && selectedSymbol && meaning.trim();

  function chooseCard(next: TarotDeckCard) {
    setCardId(next.id);
    setSelectedSymbolId("");
    setSelectedDirection("");
    setCustomMeaning("");
    setImageFailed(false);
  }

  function clearCard() {
    setCardId("");
    setSelectedSymbolId("");
    setSelectedDirection("");
    setCustomMeaning("");
    setImageFailed(false);
  }

  return (
    <div className="opening-symbol-lens">
      {!card && (
        <section className="opening-card-picker">
          <p className="spread-intro-copy">
            {zh
              ? "你的问题已经在这里。现在可以线上抽一张大阿尔卡纳，也可以拿出实体牌，抽好后直接选择牌面。"
              : "Your question is here. You can draw one Major Arcana online, or draw from your physical deck and select the card here."}
          </p>

          <div className="segmented full draw-mode-switch">
            <button className={drawMode === "online" ? "active" : ""} onClick={() => setDrawMode("online")}>
              {zh ? "线上抽牌" : "Draw online"}
            </button>
            <button className={drawMode === "physical" ? "active" : ""} onClick={() => setDrawMode("physical")}>
              {zh ? "我抽了实体牌" : "I drew a physical card"}
            </button>
          </div>

          {drawMode === "online" ? (
            <OnlineCardDraw
              cards={majorArcanaDeck}
              language={language}
              title={zh ? "22 张大阿尔卡纳" : "22 Major Arcana"}
              subtitle={zh ? "横向牌列已经洗好。凭第一感觉点一张，它会在中央翻开。" : "The row has been shuffled. Choose one by feel; it will turn over in the center."}
              confirmLabel={zh ? "用这张牌开始" : "Begin with this card"}
              onCardSelected={chooseCard}
            />
          ) : (
            <label>
              {zh ? "选择你实体牌抽到的牌面" : "Select the card from your physical deck"}
              <select
                value={cardId}
                onChange={(event) => {
                  const next = majorArcanaDeck.find((item) => item.id === event.target.value);
                  if (next) chooseCard(next);
                }}
              >
                <option value="">-</option>
                {majorArcanaDeck.map((item) => (
                  <option key={item.id} value={item.id}>
                    {String(item.number).padStart(2, "0")}. {zh ? `${item.nameZh} / ${item.nameEn}` : item.nameEn}
                  </option>
                ))}
              </select>
            </label>
          )}
        </section>
      )}

      {card && (
        <>
          <section className="opening-card-stage">
            <div className="opening-card-image-frame">
              {!imageFailed ? (
                <img src={withBase(card.imagePath)} alt={zh ? card.nameZh : card.nameEn} onError={() => setImageFailed(true)} />
              ) : (
                <div className="missing-card-image">
                  <Sparkles size={26} />
                  <strong>{zh ? card.nameZh : card.nameEn}</strong>
                  <span>{zh ? "缺少图片文件，会先用占位牌继续。" : "The image file is missing; a placeholder is shown."}</span>
                </div>
              )}
            </div>
            <div className="opening-card-copy">
              <span>{String(card.number).padStart(2, "0")}</span>
              <h3>{zh ? card.nameZh : card.nameEn}</h3>
              <p>{zh ? "在询问这张牌是什么意思之前，先看看你的目光最先停在哪里。" : "Before asking what this card means, notice where your eyes went first."}</p>
              <p className="mini-question">{question}</p>
              <button className="ghost-action compact" onClick={clearCard}>
                {zh ? "换一张牌" : "Change card"}
              </button>
            </div>
          </section>

          <section className="symbol-choice-block">
            <div className="impression-chip-row">
              {symbols.map((symbol) => (
                <button
                  key={symbol.id}
                  className={selectedSymbolId === symbol.id ? "selected" : ""}
                  onClick={() => {
                    setSelectedSymbolId(symbol.id);
                    setSelectedDirection("");
                    setCustomMeaning("");
                  }}
                >
                  {zh ? symbol.labelZh : symbol.labelEn}
                </button>
              ))}
            </div>
          </section>

          {selectedSymbol && (
            <section className="symbol-direction-block">
              <h3>{zh ? `你注意到：${symbolLabel}` : `You noticed: ${symbolLabel}`}</h3>
              <div className="impression-chip-row">
                {directions.map((direction) => (
                  <button
                    key={direction}
                    className={selectedDirection === direction ? "selected" : ""}
                    onClick={() => {
                      setSelectedDirection(direction);
                      setCustomMeaning("");
                    }}
                  >
                    {direction}
                  </button>
                ))}
              </div>
              <label>
                {zh ? "或写下你自己的方向" : "Or write your own meaning"}
                <input
                  value={customMeaning}
                  onChange={(event) => setCustomMeaning(event.target.value)}
                  placeholder={zh ? "例如：快要跨出去，但还没准备好" : "e.g., almost stepping out, but not ready"}
                />
              </label>
            </section>
          )}

          {selectedSymbol && meaning.trim() && (
            <button
              className="primary-action"
              disabled={!ready}
              onClick={() => {
                if (!card || !selectedSymbol || !ready) return;
                onComplete({
                  card,
                  selection: {
                    id: crypto.randomUUID(),
                    cardId: card.id,
                    symbolId: selectedSymbol.id,
                    symbolLabel,
                    selectedDirection: selectedDirection || undefined,
                    customMeaning: customMeaning.trim() || undefined,
                    createdAt: new Date().toISOString()
                  }
                });
              }}
            >
              {zh ? "让问题和牌相遇" : "Let the question and card meet"}
            </button>
          )}
        </>
      )}
    </div>
  );
}
