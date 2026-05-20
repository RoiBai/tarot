import type { Language, SpreadCard as SpreadCardType, SymbolSelection, WordAnchor } from "../types";
import SpreadCard from "./SpreadCard";

type Props = {
  cards: SpreadCardType[];
  wordAnchors: WordAnchor[];
  openingSymbolSelection?: SymbolSelection;
  language: Language;
};

export default function DynamicSpread({ cards, wordAnchors, openingSymbolSelection, language }: Props) {
  const title = language === "zh" ? "生长式牌阵" : "Emergent Spread";
  const empty = language === "zh" ? "第一张随机符号会从这里开始。" : "The first random symbol will begin here.";

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
              openingSymbolSelection={card.order === 1 ? openingSymbolSelection : undefined}
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
