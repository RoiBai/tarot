import { Download, Home, MessageCircle, PencilLine, X } from "lucide-react";
import { useMemo, useState } from "react";
import type { FinalQuestionCandidate, Language, ParchmentSummary as ParchmentSummaryType } from "../types";

type Props = {
  summary: ParchmentSummaryType;
  language: Language;
  onUpdate: (summary: ParchmentSummaryType) => void;
  onReturnHome: () => void;
  onContinue: () => void;
  onClose?: () => void;
};

export default function ParchmentSummary({
  summary,
  language,
  onUpdate,
  onReturnHome,
  onContinue,
  onClose
}: Props) {
  const label = labels(language);
  const pieces = useMemo(() => {
    const summaryPieces = summary.smallPieces || [];
    return summaryPieces.length
      ? summaryPieces
      : summary.keyUserReflections.slice(0, 5).map((text) => ({
          kind: "small_answer" as const,
          text,
          source: "reflection",
          sourceWords: []
        }));
  }, [summary.keyUserReflections, summary.smallPieces]);
  const questionPath = summary.questionPath?.length
    ? summary.questionPath
    : summary.questionHistory.map((item) => ({
        from: item.fromQuestion,
        to: item.toQuestion,
        why: item.reason
      }));
  const candidates = normalizeCandidates(summary, label);
  const chosenQuestion =
    summary.finalQuestionToCarry ||
    summary.userEditedFinalQuestion ||
    summary.selectedFinalQuestion ||
    "";
  const [editing, setEditing] = useState(false);
  const [draftQuestion, setDraftQuestion] = useState(chosenQuestion);

  function chooseCandidate(candidate: FinalQuestionCandidate) {
    const nextSummary = {
      ...summary,
      selectedFinalQuestion: candidate.question,
      userEditedFinalQuestion: undefined,
      finalQuestionToCarry: candidate.question,
      smallQuestionToCarry: candidate.question,
      finalQuestion: candidate.question
    };
    setEditing(false);
    setDraftQuestion(candidate.question);
    onUpdate(nextSummary);
  }

  function startRewrite() {
    setEditing(true);
    setDraftQuestion(chosenQuestion || summary.currentQuestion || summary.finalCurrentQuestion);
  }

  function saveRewrite() {
    const value = draftQuestion.trim();
    if (!value) return;
    onUpdate({
      ...summary,
      selectedFinalQuestion: value,
      userEditedFinalQuestion: value,
      finalQuestionToCarry: value,
      smallQuestionToCarry: value,
      finalQuestion: value
    });
    setEditing(false);
  }

  function exportText() {
    const content = [
      label.originalQuestion,
      summary.originalQuestion,
      "",
      label.whatBecame,
      summary.currentQuestion || summary.finalCurrentQuestion,
      ...questionPath.flatMap((item, index) => [
        `${index + 1}. ${item.from}`,
        `-> ${item.to}`,
        item.why ? `(${item.why})` : ""
      ]).filter(Boolean),
      "",
      label.smallPieces,
      ...pieces.map((item) => `- ${item.text}`),
      "",
      label.connection,
      summary.connection || summary.emergingPattern,
      "",
      label.chooseQuestion,
      chosenQuestion || label.notChosen,
      "",
      label.suggestion,
      chosenQuestion ? summary.gentleSuggestion || summary.encouragement : label.chooseFirst
    ].join("\n");
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `parchment-summary-${Date.now()}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="modal-backdrop">
      <section className="parchment-summary" aria-label={label.title}>
        {onClose && (
          <button className="wax-close" onClick={onClose} aria-label={label.close}>
            <X size={18} />
          </button>
        )}

        <header className="parchment-heading">
          <span>{label.title}</span>
          <h2>{label.scrollTitle}</h2>
        </header>

        <section className="parchment-opening">
          <h3>{label.originalQuestion}</h3>
          <p>{summary.originalQuestion}</p>
        </section>

        <section className="parchment-became">
          <h3>{label.whatBecame}</h3>
          <p className="became-current">“{summary.currentQuestion || summary.finalCurrentQuestion}”</p>
          {!!questionPath.length && (
            <details>
              <summary>{label.shortPath}</summary>
              <ol>
                {questionPath.map((item, index) => (
                  <li key={`${item.from}-${item.to}-${index}`}>
                    <span>{item.from}</span>
                    <strong aria-hidden="true">↓</strong>
                    <span>{item.to}</span>
                  </li>
                ))}
              </ol>
            </details>
          )}
        </section>

        <div className="parchment-divider" aria-hidden="true">*</div>

        <section className="parchment-pieces">
          <h3>{label.smallPieces}</h3>
          <div className="piece-strip-grid">
            {pieces.slice(0, 6).map((piece, index) => (
              <article className="piece-strip" key={`${piece.text}-${index}`}>
                {!!piece.sourceWords?.length && <span>{piece.sourceWords.slice(0, 3).join(" / ")}</span>}
                <p>{piece.text}</p>
              </article>
            ))}
          </div>
        </section>

        <div className="parchment-divider thin" aria-hidden="true" />

        <section className="parchment-connection">
          <h3>{label.connection}</h3>
          <p>{summary.connection || summary.emergingPattern}</p>
        </section>

        <section className="carry-question">
          <h3>{label.chooseQuestion}</h3>
          <p className="question-choice-prompt">{label.choosePrompt}</p>
          <div className="final-question-candidates">
            {candidates.map((candidate) => {
              const selected = chosenQuestion === candidate.question && !summary.userEditedFinalQuestion;
              return (
                <button
                  key={`${candidate.style}-${candidate.question}`}
                  className={selected ? "selected" : ""}
                  onClick={() => chooseCandidate(candidate)}
                >
                  <span>{styleLabel(candidate.style, language)}</span>
                  {candidate.question}
                </button>
              );
            })}
            <button className={summary.userEditedFinalQuestion ? "selected rewrite" : "rewrite"} onClick={startRewrite}>
              <span>{label.rewrite}</span>
              <PencilLine size={15} />
            </button>
          </div>
          {editing && (
            <div className="final-question-editor">
              <textarea value={draftQuestion} onChange={(event) => setDraftQuestion(event.target.value)} />
              <button className="primary-action" onClick={saveRewrite} disabled={!draftQuestion.trim()}>
                {label.saveQuestion}
              </button>
            </div>
          )}
          {chosenQuestion && (
            <div className="chosen-question">
              <span>{label.chosenQuestion}</span>
              <p>“{chosenQuestion}”</p>
            </div>
          )}
        </section>

        {chosenQuestion && (
          <section className="closing-note">
            <h3>{label.suggestion}</h3>
            <p>{summary.gentleSuggestion || summary.encouragement}</p>
          </section>
        )}

        <div className="button-row parchment-actions">
          <button className="ghost-action" onClick={onContinue}>
            <MessageCircle size={16} />
            {label.continueChat}
          </button>
          <button className="primary-action" onClick={onReturnHome}>
            <Home size={16} />
            {label.returnHome}
          </button>
          <button className="ghost-action" onClick={exportText}>
            <Download size={16} />
            {label.exportText}
          </button>
        </div>
      </section>
    </div>
  );
}

function normalizeCandidates(summary: ParchmentSummaryType, label: ReturnType<typeof labels>): FinalQuestionCandidate[] {
  const candidates = Array.isArray(summary.finalQuestionCandidates) ? summary.finalQuestionCandidates.slice(0, 3) : [];
  const fallback = summary.smallQuestionToCarry || summary.finalQuestion || summary.currentQuestion || summary.finalCurrentQuestion;
  const styles: FinalQuestionCandidate["style"][] = ["gentle", "direct", "action-oriented"];
  while (candidates.length < 3) {
    candidates.push({
      style: styles[candidates.length],
      question: fallback || label.fallbackQuestion
    });
  }
  return candidates;
}

function styleLabel(style: FinalQuestionCandidate["style"], language: Language): string {
  if (language === "zh") {
    if (style === "gentle") return "温柔";
    if (style === "direct") return "直接";
    return "行动";
  }
  if (style === "gentle") return "Gentle";
  if (style === "direct") return "Direct";
  return "Action-oriented";
}

function labels(language: Language) {
  if (language === "zh") {
    return {
      title: "反思卷",
      scrollTitle: "把你的问题还给你",
      originalQuestion: "最初的问题",
      whatBecame: "问题后来变成了什么",
      shortPath: "展开问题路径",
      smallPieces: "被拆开的几个小部分",
      connection: "这些部分连起来像什么",
      chooseQuestion: "选择一个要携带的问题",
      choosePrompt: "哪一个问题最像你现在真正想继续带着的问题？",
      rewrite: "都不像，我自己改写",
      saveQuestion: "保存这个问题",
      chosenQuestion: "你选择带着：",
      suggestion: "温暖的建议",
      returnHome: "返回首页",
      continueChat: "继续这段对话",
      exportText: "导出文本",
      close: "关闭",
      notChosen: "尚未选择",
      chooseFirst: "先选择或改写一个最终问题，建议会在下面出现。",
      fallbackQuestion: "现在我真正想继续带着的问题是什么？"
    };
  }

  return {
    title: "Reflective Scroll",
    scrollTitle: "Your Question, Returned More Clearly",
    originalQuestion: "Original Question",
    whatBecame: "What the Question Became",
    shortPath: "Open question path",
    smallPieces: "Smaller Pieces",
    connection: "How These Pieces Connect",
    chooseQuestion: "Choose a Question to Carry",
    choosePrompt: "Which question feels closest to what you want to carry now?",
    rewrite: "None fit, I want to rewrite it",
    saveQuestion: "Save this question",
    chosenQuestion: "You chose to carry:",
    suggestion: "Gentle Suggestion",
    returnHome: "Return home",
    continueChat: "Continue this chat",
    exportText: "Export text",
    close: "Close",
    notChosen: "Not chosen yet",
    chooseFirst: "Choose or rewrite a final question first; the suggestion will appear below.",
    fallbackQuestion: "What question do I want to keep carrying now?"
  };
}
