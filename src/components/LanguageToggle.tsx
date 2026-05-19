import type { Language } from "../types";

type Props = {
  language: Language;
  onChange: (language: Language) => void;
};

export default function LanguageToggle({ language, onChange }: Props) {
  return (
    <div className="segmented" aria-label="Language">
      <button className={language === "en" ? "active" : ""} onClick={() => onChange("en")}>
        EN
      </button>
      <button className={language === "zh" ? "active" : ""} onClick={() => onChange("zh")}>
        中文
      </button>
    </div>
  );
}
