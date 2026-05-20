import { ArrowLeft, Moon } from "lucide-react";
import { useState } from "react";
import type { FirstCardImpression, InteractionState, Language, SymbolSelection } from "../types";
import OpeningCardSymbolLens from "./OpeningCardSymbolLens";

type Props = {
  language: Language;
  onBack: () => void;
  onBegin: (payload: {
    question: string;
    firstCardImpression: FirstCardImpression;
    openingSymbolSelection: SymbolSelection;
  }) => void;
};

export default function QuestionSetup({ language, onBack, onBegin }: Props) {
  const zh = language === "zh";
  const [state, setState] = useState<InteractionState>("question_entry");
  const [question, setQuestion] = useState("");

  return (
    <div className="setup-view fade-in">
      <button className="ghost-action compact" onClick={onBack}>
        <ArrowLeft size={16} />
      </button>
      <div className="question-panel tarot-panel card-first-panel">
        <Moon className="panel-icon" size={26} />

        {state === "question_entry" && (
          <section className="question-entry-panel">
            <h2>{zh ? "写下现在的问题" : "Write the question you are carrying now"}</h2>
            <p className="spread-intro-copy">
              {zh ? "先不用解释完整。只要写下这个问题现在最真实的样子。" : "It does not need to be complete. Write the question in the form it has right now."}
            </p>
            <textarea
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              placeholder={zh ? "例如：我最近为什么总觉得卡在这里？" : "e.g., Why do I feel stuck here recently?"}
              rows={5}
            />
            <button className="primary-action" disabled={!question.trim()} onClick={() => setState("opening_major_arcana")}>
              {zh ? "带着问题去抽牌" : "Bring this question to a card"}
            </button>
          </section>
        )}

        {state === "opening_major_arcana" && (
          <>
            <h2>{zh ? "抽一张大阿尔卡纳" : "Draw one Major Arcana"}</h2>
            <OpeningCardSymbolLens
              language={language}
              question={question.trim()}
              onComplete={({ card, selection }) =>
                onBegin({
                  question: question.trim(),
                  openingSymbolSelection: selection,
                  firstCardImpression: {
                    cardName: zh ? card.nameZh : card.nameEn,
                    impressionText: selection.customMeaning || selection.selectedDirection || selection.symbolLabel,
                    selectedChip: selection.symbolLabel,
                    createdAt: selection.createdAt
                  }
                })
              }
            />
          </>
        )}
      </div>
    </div>
  );
}
