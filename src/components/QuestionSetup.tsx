import { ArrowLeft, Moon } from "lucide-react";
import { useState } from "react";
import { t } from "../lib/i18n";
import type { Language } from "../types";

type Props = {
  language: Language;
  onBack: () => void;
  onBegin: (question: string) => void;
};

export default function QuestionSetup({ language, onBack, onBegin }: Props) {
  const [question, setQuestion] = useState("");
  const text = t(language);

  return (
    <div className="setup-view fade-in">
      <button className="ghost-action compact" onClick={onBack}>
        <ArrowLeft size={16} />
      </button>
      <div className="question-panel tarot-panel">
        <Moon className="panel-icon" size={26} />
        <h2>{String(text.questionPrompt)}</h2>
        <p className="spread-intro-copy">{String(text.spreadIntro)}</p>
        <textarea
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          placeholder={String(text.questionPlaceholder)}
          rows={5}
          autoFocus
        />
        <button
          className="primary-action"
          disabled={!question.trim()}
          onClick={() => onBegin(question.trim())}
        >
          {String(text.beginRitual)}
        </button>
      </div>
    </div>
  );
}
