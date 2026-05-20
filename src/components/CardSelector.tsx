import { Check } from "lucide-react";
import { useMemo, useState } from "react";
import {
  majorArcanaDeck,
  minorArcanaDeck,
  ranks,
  tarotDeck,
  type TarotDeckCard,
  type TarotRank,
  type TarotSuit
} from "../lib/tarotDeck";
import type { Language } from "../types";

type Props = {
  language: Language;
  allowedArcana?: "major" | "minor" | "both";
  onCardSelected: (card: TarotDeckCard) => void;
};

const suitOrder: TarotSuit[] = ["swords", "wands", "cups", "pentacles"];
const suitLabels: Record<TarotSuit, { en: string; zh: string }> = {
  swords: { en: "Swords", zh: "宝剑" },
  wands: { en: "Wands", zh: "权杖" },
  cups: { en: "Cups", zh: "圣杯" },
  pentacles: { en: "Pentacles", zh: "星币" }
};

export default function CardSelector({ language, allowedArcana = "both", onCardSelected }: Props) {
  const zh = language === "zh";
  const [arcana, setArcana] = useState<"major" | "minor">(allowedArcana === "minor" ? "minor" : "major");
  const [majorId, setMajorId] = useState("");
  const [suit, setSuit] = useState<TarotSuit>("swords");
  const [rank, setRank] = useState<TarotRank>("ace");

  const canChooseMajor = allowedArcana === "major" || allowedArcana === "both";
  const canChooseMinor = allowedArcana === "minor" || allowedArcana === "both";

  const selected = useMemo(() => {
    if (arcana === "major") return tarotDeck.find((card) => card.id === majorId);
    return minorArcanaDeck.find((card) => card.suit === suit && card.rank === rank);
  }, [arcana, majorId, rank, suit]);

  return (
    <section className="card-selector compact-selector">
      {allowedArcana === "both" && (
        <div className="selector-block">
          <span>{zh ? "选择牌类" : "Choose card type"}</span>
          <div className="segmented full">
            {canChooseMajor && (
              <button className={arcana === "major" ? "active" : ""} onClick={() => setArcana("major")}>
                {zh ? "大阿尔卡纳" : "Major Arcana"}
              </button>
            )}
            {canChooseMinor && (
              <button className={arcana === "minor" ? "active" : ""} onClick={() => setArcana("minor")}>
                {zh ? "小阿尔卡纳" : "Minor Arcana"}
              </button>
            )}
          </div>
        </div>
      )}

      {arcana === "major" && canChooseMajor && (
        <label>
          {zh ? "选择大阿尔卡纳" : "Choose Major Arcana"}
          <select value={majorId} onChange={(event) => setMajorId(event.target.value)}>
            <option value="">-</option>
            {majorArcanaDeck.map((card) => (
              <option key={card.id} value={card.id}>
                {String(card.number).padStart(2, "0")}. {zh ? `${card.nameZh} / ${card.nameEn}` : card.nameEn}
              </option>
            ))}
          </select>
        </label>
      )}

      {arcana === "minor" && canChooseMinor && (
        <>
          <div className="selector-block">
            <span>{zh ? "选择牌组" : "Choose suit"}</span>
            <div className="role-choice-grid compact-grid">
              {suitOrder.map((item) => (
                <button key={item} className={suit === item ? "active" : ""} onClick={() => setSuit(item)}>
                  {zh ? suitLabels[item].zh : suitLabels[item].en}
                </button>
              ))}
            </div>
          </div>
          <div className="selector-block">
            <span>{zh ? "选择数字 / 宫廷牌" : "Choose number / court card"}</span>
            <div className="rank-grid">
              {ranks.map((item) => (
                <button key={item.rank} className={rank === item.rank ? "active" : ""} onClick={() => setRank(item.rank)}>
                  {zh ? item.zh : item.en}
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {selected && <p className="card-selector-selected">{zh ? selected.nameZh : selected.nameEn}</p>}

      <button className="primary-action" disabled={!selected} onClick={() => selected && onCardSelected(selected)}>
        <Check size={16} />
        {zh ? "确认这张牌" : "Confirm this card"}
      </button>
    </section>
  );
}
