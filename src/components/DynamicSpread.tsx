import type { Language, SpreadCard as SpreadCardType, WordAnchor } from "../types";
import SpreadCard from "./SpreadCard";

type Props = {
  cards: SpreadCardType[];
  wordAnchors: WordAnchor[];
  language: Language;
};

export default function DynamicSpread({ cards, wordAnchors, language }: Props) {
  const title = language === "zh" ? "正在生长的牌阵" : "Growing Spread";
  const empty = language === "zh" ? "第一张牌会从这里开始。" : "The first card will begin here.";

  return (
    <section className="dynamic-spread" aria-label={title}>
      <div className="dynamic-spread-heading">
        <h3>{title}</h3>
        <span>{cards.length}</span>
      </div>
      {cards.length ? (
        <div className="spread-constellation">
          {cards.map((card) => (
            <SpreadCard
              key={card.id}
              card={card}
              anchors={wordAnchors.filter((anchor) => anchor.cardId === card.id && anchor.selected)}
              language={language}
            />
          ))}
        </div>
      ) : (
        <p className="subtle">{empty}</p>
      )}
    </section>
  );
}
