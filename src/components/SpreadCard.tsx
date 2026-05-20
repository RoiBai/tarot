import { findDeckCard, withBase } from "../lib/tarotDeck";
import type { Language, SpreadCard as SpreadCardType, SymbolSelection, WordAnchor } from "../types";

type Props = {
  card: SpreadCardType;
  anchors: WordAnchor[];
  openingSymbolSelection?: SymbolSelection;
  language: Language;
};

export default function SpreadCard({ card, anchors, openingSymbolSelection, language }: Props) {
  const drawnForAnchor = isAnchorDrawnCard(card.role);
  const image = findDeckCard(card.deckCardId || card.cardName);
  const zh = language === "zh";

  return (
    <article className={`spread-card ${card.isActive ? "active" : ""}`}>
      <span className="spread-order">{card.order}</span>
      {image && <img className="spread-card-thumb" src={withBase(image.imagePath)} alt={zh ? image.nameZh : image.nameEn} />}
      <h4>{card.cardName}</h4>
      <p>{card.role}</p>
      {openingSymbolSelection && (
        <div className="spread-opening-symbol">
          <span>{zh ? `你先看到：${openingSymbolSelection.symbolLabel}` : `You noticed: ${openingSymbolSelection.symbolLabel}`}</span>
          <em>
            {zh ? "方向：" : "Direction: "}
            {openingSymbolSelection.customMeaning || openingSymbolSelection.selectedDirection}
          </em>
        </div>
      )}
      {drawnForAnchor && <span className="spread-link-label">{card.role}</span>}
      {!!anchors.length && (
        <div className="spread-anchors" aria-label={language === "zh" ? "词锚" : "Word anchors"}>
          <span>{language === "zh" ? "词锚" : "Anchors"}</span>
          <div>
            {anchors.map((anchor) => (
              <em key={anchor.id}>{anchor.text}</em>
            ))}
          </div>
        </div>
      )}
    </article>
  );
}

function isAnchorDrawnCard(role: string): boolean {
  return role.includes("Drawn for") || role.includes("为「");
}
