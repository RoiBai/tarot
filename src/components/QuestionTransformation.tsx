import type { Language } from "../types";

type Props = {
  fromQuestion: string;
  toQuestion: string;
  language: Language;
};

export default function QuestionTransformation({ fromQuestion, toQuestion, language }: Props) {
  const zh = language === "zh";

  return (
    <section className="question-shift-event" aria-label={zh ? "问题转向" : "Question shifted"}>
      <span className="question-shift-label">{zh ? "问题转向" : "Question shifted"}</span>
      <div className="question-shift-compact">
        <p className="question-before">“{fromQuestion}”</p>
        <span aria-hidden="true">→</span>
        <p className="question-after">“{toQuestion}”</p>
      </div>
      <div className="question-particles" aria-hidden="true">
        <i />
        <i />
        <i />
        <i />
      </div>
    </section>
  );
}
