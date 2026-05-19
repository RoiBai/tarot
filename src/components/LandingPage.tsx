import { Archive, Settings, Sparkles } from "lucide-react";
import { t } from "../lib/i18n";
import type { Language } from "../types";
import TarotCardVisual from "./TarotCardVisual";

type Props = {
  language: Language;
  onStart: () => void;
  onOpenSettings: () => void;
  onOpenArchive: () => void;
};

export default function LandingPage({ language, onStart, onOpenSettings, onOpenArchive }: Props) {
  const text = t(language);
  return (
    <div className="landing-view fade-in">
      <div className="hero-copy">
        <p className="ritual-label">reflection, not prediction</p>
        <h2>{String(text.landingLine)}</h2>
        <p>{String(text.landingSubtext)}</p>
        <div className="button-row">
          <button className="primary-action" onClick={onStart}>
            <Sparkles size={18} />
            {String(text.startNewReflection || text.startChat)}
          </button>
          <button className="ghost-action" onClick={onOpenArchive}>
            <Archive size={18} />
            {String(text.savedChats)}
          </button>
          <button className="icon-action" onClick={onOpenSettings} aria-label={String(text.settings)}>
            <Settings size={18} />
          </button>
        </div>
      </div>
      <TarotCardVisual cardName="The Moon" language={language} featured />
    </div>
  );
}
