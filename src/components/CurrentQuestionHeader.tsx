import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import type { Language } from "../types";

type Props = {
  currentQuestion: string;
  originalQuestion: string;
  language: Language;
};

export default function CurrentQuestionHeader({ currentQuestion, originalQuestion, language }: Props) {
  const [expanded, setExpanded] = useState(false);
  const changed = currentQuestion.trim() !== originalQuestion.trim();
  const label = language === "zh" ? "正在思考的问题：" : "Question being carried:";
  const originalLabel = language === "zh" ? "最初的问题：" : "Original question:";
  const ariaLabel = expanded
    ? language === "zh"
      ? "收起问题"
      : "Collapse question"
    : language === "zh"
      ? "展开问题"
      : "Expand question";

  return (
    <button
      className={`original-question-header current-question-header ${expanded ? "expanded" : ""}`}
      onClick={() => setExpanded((value) => !value)}
      title={currentQuestion}
      aria-label={ariaLabel}
    >
      <span className="original-question-label">{label}</span>
      <span key={currentQuestion} className="original-question-text current-question-text">
        “{currentQuestion}”
      </span>
      {changed && (
        <span className="original-question-subtext">
          {originalLabel} “{originalQuestion}”
        </span>
      )}
      <span className="original-question-toggle" aria-hidden="true">
        {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </span>
    </button>
  );
}
