import { ArrowLeft, Sparkles } from "lucide-react";
import { useState } from "react";
import type { Language } from "../types";

type Props = {
  language: Language;
  onBack: () => void;
  onSubmit: (question: string) => void;
};

export default function QuestionInputPage({ language, onBack, onSubmit }: Props) {
  const zh = language === "zh";
  const [question, setQuestion] = useState("");
  const trimmed = question.trim();

  return (
    <section className="question-only-page fade-in">
      <button className="ghost-action" onClick={onBack}>
        <ArrowLeft size={16} />
        {zh ? "返回" : "Back"}
      </button>
      <div className="tarot-panel spread-question-panel">
        <p className="ritual-label">{zh ? "总问题" : "Main question"}</p>
        <h2>{zh ? "你想让牌阵帮你看什么问题？" : "What question do you want the spread to help you look at?"}</h2>
        <textarea
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          placeholder={
            zh
              ? "例如：我该如何理解最近让我反复犹豫的选择？"
              : "e.g., How should I understand a choice that keeps making me hesitate?"
          }
        />
        <button className="primary-action" disabled={!trimmed} onClick={() => onSubmit(trimmed)}>
          <Sparkles size={18} />
          {zh ? "推荐牌阵" : "Recommend spreads"}
        </button>
      </div>
    </section>
  );
}
