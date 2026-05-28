import { RotateCcw, Sparkles, X } from "lucide-react";
import { useMemo, useState, type CSSProperties } from "react";
import { type TarotDeckCard, withBase } from "../lib/tarotDeck";
import type { Language } from "../types";

type Props = {
  cards: TarotDeckCard[];
  language: Language;
  title?: string;
  subtitle?: string;
  confirmLabel?: string;
  revealCardName?: boolean;
  onCardSelected: (card: TarotDeckCard) => void;
};

export default function OnlineCardDraw({
  cards,
  language,
  title,
  subtitle,
  confirmLabel,
  revealCardName = true,
  onCardSelected
}: Props) {
  const zh = language === "zh";
  const [seed, setSeed] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [isShuffling, setIsShuffling] = useState(false);
  const shuffledCards = useMemo(() => shuffleCards(cards), [cards, seed]);
  const selectedCard = selectedIndex === null ? null : shuffledCards[selectedIndex];
  const cardWidth = cards.length > 40 ? 58 : 76;
  const fanSpread = cards.length > 40 ? 92 : 80;
  const maxRotation = cards.length > 40 ? 30 : 24;
  const curveDepth = cards.length > 40 ? 96 : 76;
  const fanHeight = cards.length > 40 ? 238 : 210;
  const mid = Math.max(1, (shuffledCards.length - 1) / 2);

  function resetDraw() {
    setSelectedIndex(null);
    setIsShuffling(true);
    setSeed((current) => current + 1);
    window.setTimeout(() => setIsShuffling(false), 520);
  }

  return (
    <section className={`online-card-draw ${selectedCard ? "has-reveal" : ""}`}>
      <div className="online-draw-copy">
        <h3>{title || (zh ? "线上抽一张" : "Draw online")}</h3>
        <p>
          {subtitle ||
            (zh
              ? "这些牌背已经洗好。凭第一感觉点一张，让它翻开。"
              : "These face-down cards have been shuffled. Choose one by feel and let it turn over.")}
        </p>
      </div>

      <div className="online-card-fan-scroll">
        <div
          className={`online-card-row ${isShuffling ? "shuffling" : ""}`}
          style={{ "--fan-width": "100%", "--fan-height": `${fanHeight}px` } as CSSProperties}
          aria-label={title || (zh ? "线上抽牌" : "Online card draw")}
        >
          {shuffledCards.map((card, index) => {
            const normalized = (index - mid) / mid;
            const curve = Math.pow(Math.abs(normalized), 1.72);
            const left = 50 + normalized * (fanSpread / 2);
            const rotation = normalized * maxRotation;
            const y = curve * curveDepth;
            return (
              <button
                key={`${seed}-${card.id}-${index}`}
                className={`online-card-back ${selectedIndex === index ? "selected" : ""}`}
                style={
                  {
                    "--fan-left": `${left}%`,
                    "--fan-rotation": `${rotation}deg`,
                    "--fan-y": `${y}px`,
                    "--fan-card-width": `${cardWidth}px`,
                    "--fan-delay": `${Math.min(index * 8, 180)}ms`,
                    zIndex: Math.max(1, Math.round((1 - Math.abs(normalized)) * 100))
                  } as CSSProperties
                }
                onClick={() => setSelectedIndex(index)}
                aria-label={zh ? `选择第 ${index + 1} 张牌` : `Choose card ${index + 1}`}
              >
                <span className="online-card-back-mark" />
              </button>
            );
          })}
        </div>
      </div>

      <div className="online-draw-actions">
        <button className="ghost-action compact" onClick={resetDraw}>
          <RotateCcw size={15} />
          {zh ? "重新洗牌" : "Shuffle again"}
        </button>
      </div>

      {selectedCard && (
        <div className="online-draw-focus" role="dialog" aria-modal="true">
          <div className="online-draw-focus-card">
            <button className="icon-action online-draw-close" onClick={() => setSelectedIndex(null)} aria-label={zh ? "关闭翻牌" : "Close revealed card"}>
              <X size={17} />
            </button>
            <div className="online-card-flip revealed">
              <div className="online-card-flip-back">
                <span className="online-card-back-mark" />
              </div>
              <div className="online-card-flip-front">
                <img src={withBase(selectedCard.imagePath)} alt={revealCardName ? (zh ? selectedCard.nameZh : selectedCard.nameEn) : ""} />
              </div>
            </div>
            <div className="online-draw-reveal-copy">
              <Sparkles size={18} />
              <h3>{revealCardName ? (zh ? selectedCard.nameZh : selectedCard.nameEn) : zh ? "这张牌翻开了" : "The card is revealed"}</h3>
              <p>
                {revealCardName
                  ? zh
                    ? "确认后，它会进入这次牌阵。"
                    : "Confirm it to add it to this spread."
                  : zh
                    ? "先不用急着命名它。确认后，先看图像给你的第一感觉。"
                    : "No need to name it yet. Confirm it, then notice the image first."}
              </p>
            </div>
            <div className="button-row">
              <button className="primary-action" onClick={() => onCardSelected(selectedCard)}>
                {confirmLabel || (zh ? "确认这张牌" : "Confirm this card")}
              </button>
              <button className="ghost-action" onClick={resetDraw}>
                {zh ? "换一张" : "Draw again"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function shuffleCards(cards: TarotDeckCard[]) {
  const next = [...cards];
  for (let index = next.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [next[index], next[swapIndex]] = [next[swapIndex], next[index]];
  }
  return next;
}
