import { ChevronDown, ChevronUp, Shuffle } from "lucide-react";
import { useState } from "react";
import { createPortal } from "react-dom";
import { tarotDeck, type TarotDeckCard } from "../lib/tarotDeck";
import type { Language } from "../types";
import CardSelector from "./CardSelector";
import OnlineCardDraw from "./OnlineCardDraw";

type Props = {
  language: Language;
  open: boolean;
  onOpen: () => void;
  onCancel: () => void;
  onCardSelected: (card: TarotDeckCard) => void;
};

export default function CardInputPanel({ language, open, onOpen, onCancel, onCardSelected }: Props) {
  const zh = language === "zh";
  const [onlineOpen, setOnlineOpen] = useState(false);

  function chooseCard(card: TarotDeckCard) {
    setOnlineOpen(false);
    onCardSelected(card);
  }

  if (!open) {
    return (
      <button className="card-input-collapsed" onClick={onOpen}>
        <ChevronDown size={18} />
        {zh ? "选择一张牌" : "Select a card"}
      </button>
    );
  }

  return (
    <div className="card-input-panel tarot-panel">
      <div className="panel-heading">
        <h3>{zh ? "抽新牌" : "Draw new card"}</h3>
        <button className="icon-action" onClick={onCancel} aria-label={zh ? "关闭抽牌" : "Close card selector"}>
          <ChevronUp size={18} />
        </button>
      </div>

      <div className="new-card-choice-row">
        <button className="primary-action" onClick={() => setOnlineOpen(true)}>
          <Shuffle size={16} />
          {zh ? "线上抽牌" : "Draw online"}
        </button>
        <button className="ghost-action" onClick={onCancel}>
          {zh ? "先不抽了" : "Cancel"}
        </button>
      </div>

      <section className="draw-method-card">
        <h4>{zh ? "我抽了实体牌" : "I drew a physical card"}</h4>
        <p>{zh ? "如果你已经从实体牌里抽到了牌，请在这里选择牌面。" : "If you drew from a physical deck, select the card face here."}</p>
        <CardSelector language={language} allowedArcana="both" onCardSelected={chooseCard} />
      </section>

      {onlineOpen &&
        createPortal(
        <div className="online-draw-page" role="dialog" aria-modal="true">
          <div className="online-draw-page-shell">
            <div className="panel-heading">
              <h3>{zh ? "线上 78 抽 1" : "Online 1 of 78"}</h3>
              <button className="icon-action" onClick={() => setOnlineOpen(false)} aria-label={zh ? "关闭线上抽牌" : "Close online draw"}>
                <ChevronUp size={18} />
              </button>
            </div>
            <OnlineCardDraw
              cards={tarotDeck}
              language={language}
              title={zh ? "78 张完整牌组" : "Full 78-card deck"}
              subtitle={zh ? "牌已经洗好。凭第一感觉点一张，它会在中央翻开。" : "The deck has been shuffled. Choose one by feel; it will turn over in the center."}
              confirmLabel={zh ? "让这张牌进入牌阵" : "Add this card to the spread"}
              onCardSelected={chooseCard}
            />
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
