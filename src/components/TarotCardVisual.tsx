import { findCardByName } from "../lib/tarotCards";
import type { Language } from "../types";

type Props = {
  cardName: string;
  language: Language;
  featured?: boolean;
};

export default function TarotCardVisual({ cardName, language, featured = false }: Props) {
  const card = findCardByName(cardName);
  const title = card ? (language === "zh" ? card.chineseName : card.englishName) : cardName;
  const subtitle = card ? card.visualSymbol : "moon / mirror / question";

  return (
    <div className={`tarot-card-visual ${featured ? "featured" : ""}`}>
      <div className="card-corners" />
      <div className="sigil">
        <span className="sigil-moon" />
        <span className="sigil-line" />
        <span className="sigil-star" />
      </div>
      <h3>{title}</h3>
      <p>{subtitle}</p>
    </div>
  );
}
