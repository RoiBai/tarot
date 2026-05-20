import { Download, Home, MessageCircle, PencilLine, X } from "lucide-react";
import type { ReactNode } from "react";
import { useState } from "react";
import type { FinalQuestionCandidate, Language, ParchmentSummary as ParchmentSummaryType } from "../types";

type Props = {
  summary: ParchmentSummaryType;
  language: Language;
  onUpdate: (summary: ParchmentSummaryType) => void;
  onReturnHome: () => void;
  onContinue: () => void;
  onClose?: () => void;
};

type ExportSection = {
  title: string;
  lines: string[];
};

export default function ParchmentSummary({ summary, language, onUpdate, onReturnHome, onContinue, onClose }: Props) {
  const label = labels(language);
  const questionPath = getQuestionPath(summary);
  const candidates = normalizeCandidates(summary);
  const currentQuestion = cleanText(summary.currentQuestion || summary.finalCurrentQuestion);
  const originalQuestion = cleanText(summary.originalQuestion);
  const chosenQuestion = cleanText(summary.finalQuestionToCarry || summary.userEditedFinalQuestion || summary.selectedFinalQuestion);
  const firstCardName = cleanText(summary.firstRandomCard || summary.cards?.[0]?.cardName);
  const firstImpression = cleanText(summary.firstImpression);
  const firstCardNotes = cleanList([firstImpression, summary.cardDisruptions?.[0]], language);
  const spreadLines = cleanList(
    (summary.spreadGrowthStory || []).map((item) => {
      const drawnFor = cleanText(item.drawnFor || item.nodeLabel);
      return drawnFor ? `${item.order}. ${item.cardName} - ${drawnFor}` : `${item.order}. ${item.cardName}`;
    }),
    language
  );
  const smallPieces = cleanList((summary.smallPieces || []).map((piece) => piece.text), language);
  const selectedWords = cleanList(summary.selectedWordAnchors, language);
  const randomnessSummary = cleanText(summary.randomnessReflectionSummary);
  const shouldShowRandomness = Boolean(randomnessSummary && isUsefulSummaryText(randomnessSummary, language));
  const connection = cleanText(summary.connection || summary.emergingPattern);
  const gentleSuggestion = cleanText(summary.gentleSuggestion || summary.encouragement);
  const draftFallback = chosenQuestion || currentQuestion || originalQuestion || candidates[0]?.question || "";
  const [editing, setEditing] = useState(false);
  const [draftQuestion, setDraftQuestion] = useState(draftFallback);

  function chooseCandidate(candidate: FinalQuestionCandidate) {
    const next = {
      ...summary,
      selectedFinalQuestion: candidate.question,
      userEditedFinalQuestion: undefined,
      finalQuestionToCarry: candidate.question,
      smallQuestionToCarry: candidate.question,
      finalQuestion: candidate.question
    };
    setEditing(false);
    setDraftQuestion(candidate.question);
    onUpdate(next);
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
    const exportSections: ExportSection[] = [];
    if (firstCardName || firstCardNotes.length) {
      exportSections.push({
        title: label.firstRandomCard,
        lines: [firstCardName, ...firstCardNotes].filter(Boolean)
      });
    }
    if (originalQuestion) {
      exportSections.push({ title: label.originalQuestion, lines: [originalQuestion] });
    }
    if (shouldShowQuestionChange(originalQuestion, currentQuestion, questionPath)) {
      exportSections.push({
        title: label.questionChanged,
        lines: [currentQuestion, ...questionPath.map((item) => `${item.from} -> ${item.to}`)].filter(Boolean)
      });
    }
    if (spreadLines.length) exportSections.push({ title: label.spreadGrew, lines: spreadLines });
    if (smallPieces.length) exportSections.push({ title: label.smallPieces, lines: smallPieces });
    if (selectedWords.length) exportSections.push({ title: label.words, lines: selectedWords });
    if (shouldShowRandomness) exportSections.push({ title: label.randomness, lines: [randomnessSummary] });
    if (connection) exportSections.push({ title: label.connection, lines: [connection] });
    if (chosenQuestion) exportSections.push({ title: label.questionToCarry, lines: [chosenQuestion] });
    if (chosenQuestion && gentleSuggestion) exportSections.push({ title: label.suggestion, lines: [gentleSuggestion] });

    const lines = exportSections.flatMap((section) => [section.title, ...section.lines, ""]);
    const blob = new Blob([lines.join("\n").trim()], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `reflection-letter-${Date.now()}.txt`;
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
          <span>{label.scrollEyebrow}</span>
          <h2>{label.scrollTitle}</h2>
        </header>

        <article className="summary-letter">
          <p className="letter-salutation">{label.salutation}</p>

          {(firstCardName || firstCardNotes.length > 0) && (
            <ParchmentSection title={label.firstRandomCard}>
              {firstCardName && <p className="letter-lead">{firstCardName}</p>}
              {firstCardNotes.map((note) => (
                <p key={note}>{note}</p>
              ))}
            </ParchmentSection>
          )}

          {originalQuestion && (
            <ParchmentSection title={label.originalQuestion}>
              <p className="letter-quote">{originalQuestion}</p>
            </ParchmentSection>
          )}

          {shouldShowQuestionChange(originalQuestion, currentQuestion, questionPath) && (
            <ParchmentSection title={label.questionChanged}>
              {currentQuestion && <p className="letter-quote">"{currentQuestion}"</p>}
              {questionPath.length > 0 && (
                <details className="question-path-letter">
                  <summary>{label.openPath}</summary>
                  <ol>
                    {questionPath.map((item, index) => (
                      <li key={`${item.from}-${item.to}-${index}`}>
                        <span>{item.from}</span>
                        <strong aria-hidden="true">→</strong>
                        <span>{item.to}</span>
                      </li>
                    ))}
                  </ol>
                </details>
              )}
            </ParchmentSection>
          )}

          <ParchmentList title={label.spreadGrew} items={spreadLines} ordered />
          <ParchmentList title={label.smallPieces} items={smallPieces} />
          <ParchmentList title={label.words} items={selectedWords} />

          {shouldShowRandomness && (
            <ParchmentSection title={label.randomness}>
              <p>{randomnessSummary}</p>
            </ParchmentSection>
          )}

          {connection && (
            <ParchmentSection title={label.connection}>
              <p>{connection}</p>
            </ParchmentSection>
          )}

          <section className="carry-question">
            <h3>{label.questionToCarry}</h3>
            <p className="question-choice-prompt">{label.choosePrompt}</p>
            <div className="final-question-candidates">
              {candidates.map((candidate) => (
                <button
                  key={`${candidate.style}-${candidate.question}`}
                  className={chosenQuestion === candidate.question && !summary.userEditedFinalQuestion ? "selected" : ""}
                  onClick={() => chooseCandidate(candidate)}
                >
                  <span>{styleLabel(candidate.style, language)}</span>
                  {candidate.question}
                </button>
              ))}
              <button
                className={summary.userEditedFinalQuestion ? "selected rewrite" : "rewrite"}
                onClick={() => {
                  setEditing(true);
                  setDraftQuestion(draftFallback);
                }}
              >
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
                <p>"{chosenQuestion}"</p>
              </div>
            )}
          </section>

          {chosenQuestion && gentleSuggestion && (
            <ParchmentSection title={label.suggestion} className="closing-note">
              <p>{gentleSuggestion}</p>
            </ParchmentSection>
          )}

          <p className="letter-signoff">{label.signoff}</p>
        </article>

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

function ParchmentSection({ title, children, className = "" }: { title: string; children: ReactNode; className?: string }) {
  return (
    <section className={`letter-section ${className}`}>
      <h3>{title}</h3>
      {children}
    </section>
  );
}

function ParchmentList({ title, items, ordered = false }: { title: string; items?: string[]; ordered?: boolean }) {
  const values = cleanList(items);
  if (!values.length) return null;
  const ListTag = ordered ? "ol" : "ul";
  return (
    <section className="letter-section letter-list-section">
      <h3>{title}</h3>
      <ListTag>
        {values.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ListTag>
    </section>
  );
}

function getQuestionPath(summary: ParchmentSummaryType) {
  if (summary.questionPath?.length) {
    return summary.questionPath.filter((item) => cleanText(item.from) && cleanText(item.to));
  }
  return summary.questionHistory
    .map((item) => ({ from: item.fromQuestion, to: item.toQuestion, why: item.reason }))
    .filter((item) => cleanText(item.from) && cleanText(item.to));
}

function shouldShowQuestionChange(originalQuestion: string, currentQuestion: string, questionPath: ReturnType<typeof getQuestionPath>) {
  if (questionPath.length > 0) return true;
  return Boolean(currentQuestion && originalQuestion && currentQuestion !== originalQuestion);
}

function normalizeCandidates(summary: ParchmentSummaryType): FinalQuestionCandidate[] {
  const seen = new Set<string>();
  const candidates = (Array.isArray(summary.finalQuestionCandidates) ? summary.finalQuestionCandidates : [])
    .filter((candidate): candidate is FinalQuestionCandidate => Boolean(candidate && cleanText(candidate.question)))
    .filter((candidate) => {
      const key = candidate.question.trim();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, 3);
  const fallback = cleanText(summary.smallQuestionToCarry || summary.finalQuestion || summary.currentQuestion || summary.finalCurrentQuestion);
  if (!candidates.length && fallback) {
    candidates.push({ style: "gentle", question: fallback });
  }
  return candidates;
}

function styleLabel(style: FinalQuestionCandidate["style"], language: Language): string {
  if (language === "zh") return style === "gentle" ? "轻一点" : style === "direct" ? "直接一点" : "行动一点";
  return style === "gentle" ? "Gentle" : style === "direct" ? "Direct" : "Action-oriented";
}

function cleanText(value?: string | null) {
  return typeof value === "string" ? value.trim() : "";
}

function cleanList(items?: Array<string | null | undefined>, language?: Language) {
  const seen = new Set<string>();
  return (items || [])
    .map((item) => cleanText(item))
    .filter((item) => item && isUsefulSummaryText(item, language))
    .filter((item) => {
      if (seen.has(item)) return false;
      seen.add(item);
      return true;
    });
}

function isUsefulSummaryText(value: string, language: Language = "en") {
  const text = value.trim();
  if (!text) return false;
  const lower = text.toLowerCase();
  const emptyEnglish = [
    "nothing clear was recorded",
    "no explicit checkpoint",
    "no explicit randomness",
    "no transformations recorded",
    "no cards recorded",
    "no selected word anchors",
    "not chosen yet"
  ];
  const emptyChinese = ["没有记录", "暂无", "尚未记录", "还没有", "没有明确", "未选择"];
  if (emptyEnglish.some((phrase) => lower.includes(phrase))) return false;
  if (language === "zh" && emptyChinese.some((phrase) => text.includes(phrase))) return false;
  return true;
}

function labels(language: Language) {
  if (language === "zh") {
    return {
      title: "总结",
      scrollEyebrow: "一封写给问题的信",
      scrollTitle: "把已经出现的线索放在一起",
      salutation: "给这次对话：",
      signoff: "先写到这里。你可以带着它回到对话里，也可以暂时收起来。",
      firstRandomCard: "第一张随机牌",
      firstImpression: "最先靠近的符号",
      originalQuestion: "最初的问题",
      questionChanged: "问题后来变成了什么",
      openPath: "看看问题移动过的路",
      spreadGrew: "这次牌阵是怎样长出来的",
      smallPieces: "信里留下的几句",
      words: "一路留下的词",
      randomness: "随机性有没有帮忙",
      connection: "这些线索连起来像什么",
      questionToCarry: "可以继续带着的问题",
      choosePrompt: "选一个更像你现在愿意带走的问题，也可以自己改写。",
      rewrite: "我想自己改写",
      saveQuestion: "保存这个问题",
      chosenQuestion: "你选择带走：",
      suggestion: "一个很小的建议",
      returnHome: "返回首页",
      continueChat: "继续对话",
      exportText: "导出文字",
      close: "关闭"
    };
  }

  return {
    title: "Reflection Summary",
    scrollEyebrow: "A letter for the question",
    scrollTitle: "The Traces That Have Appeared",
    salutation: "For this conversation:",
    signoff: "That is enough for now. You can return to the chat with it, or put it down for a while.",
    firstRandomCard: "The First Random Card",
    firstImpression: "first symbol or impression",
    originalQuestion: "Original Question",
    questionChanged: "What the Question Became",
    openPath: "See how the question moved",
    spreadGrew: "How the Spread Grew",
    smallPieces: "Lines Left in the Letter",
    words: "Words Left Along the Way",
    randomness: "How Randomness Helped or Did Not Help",
    connection: "How These Traces Connect",
    questionToCarry: "Question to Carry",
    choosePrompt: "Choose the question that feels closest to what you want to carry now, or rewrite it.",
    rewrite: "I want to rewrite it",
    saveQuestion: "Save this question",
    chosenQuestion: "You chose to carry:",
    suggestion: "A Small Suggestion",
    returnHome: "Return home",
    continueChat: "Continue this chat",
    exportText: "Export text",
    close: "Close"
  };
}
