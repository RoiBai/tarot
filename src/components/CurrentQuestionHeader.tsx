import type { Language } from "../types";

type Props = {
  currentQuestion: string;
  originalQuestion: string;
  language: Language;
};

export default function CurrentQuestionHeader({ currentQuestion, originalQuestion, language }: Props) {
  const zh = language === "zh";
  return (
    <section className="current-question-header">
      <span>{zh ? "正在思考的问题：" : "Question being carried:"}</span>
      <p>{currentQuestion}</p>
      {currentQuestion !== originalQuestion && (
        <small>
          {zh ? "最初：" : "Original:"} {originalQuestion}
        </small>
      )}
    </section>
  );
}
