import type { Language } from "../types";

type Props = {
  fromQuestion: string;
  toQuestion: string;
  language: Language;
};

export default function QuestionTransformation({ fromQuestion, toQuestion, language }: Props) {
  const label = language === "zh" ? "问题转向" : "Question shifted";

  return (
    <details className="question-shift-event">
      <summary>{label}</summary>
      <div className="question-shift-compact">
        <p>“{fromQuestion}”</p>
        <span aria-hidden="true">↓</span>
        <p>“{toQuestion}”</p>
      </div>
    </details>
  );
}
