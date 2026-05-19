import type { Language, SpreadCard as SpreadCardType, WordAnchor } from "../types";

type Props = {
  card: SpreadCardType;
  anchors: WordAnchor[];
  language: Language;
};

export default function SpreadCard({ card, anchors, language }: Props) {
  const drawnForAnchor = isAnchorDrawnCard(card.role);

  return (
    <article className={`spread-card ${card.isActive ? "active" : ""}`}>
      <span className="spread-order">{card.order}</span>
      <h4>{card.cardName}</h4>
      <p>{card.role}</p>
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
