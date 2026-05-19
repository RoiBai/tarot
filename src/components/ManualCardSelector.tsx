import { Sparkles } from "lucide-react";
import { useMemo, useState } from "react";
import { t } from "../lib/i18n";
import { majorArcana } from "../lib/tarotCards";
import type { Language } from "../types";

type Props = {
  language: Language;
  onCardSelected: (cardName: string) => void;
};

export default function ManualCardSelector({ language, onCardSelected }: Props) {
  const text = t(language);
  const [selected, setSelected] = useState("");
  const [custom, setCustom] = useState("");
  const options = useMemo(
    () =>
      majorArcana.map((card) => ({
        value: language === "zh" ? card.chineseName : card.englishName,
        label: language === "zh" ? `${card.chineseName} / ${card.englishName}` : card.englishName
      })),
    [language]
  );
  const cardName = custom.trim() || selected;

  return (
    <div className="manual-card">
      <label>
        {String(text.selectCard)}
        <select value={selected} onChange={(event) => setSelected(event.target.value)}>
          <option value="">-</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
      <label>
        {String(text.otherCard)}
        <input value={custom} onChange={(event) => setCustom(event.target.value)} />
      </label>
      <button className="primary-action" disabled={!cardName} onClick={() => onCardSelected(cardName)}>
        <Sparkles size={17} />
        {String(text.enterCard)}
      </button>
    </div>
  );
}
