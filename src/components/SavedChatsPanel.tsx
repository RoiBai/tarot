import { Download, FileText, Trash2, X } from "lucide-react";
import { t } from "../lib/i18n";
import { formatDate } from "../lib/utils";
import type { ChatThread, Language } from "../types";

type Props = {
  language: Language;
  threads: ChatThread[];
  onClose: () => void;
  onReopen: (thread: ChatThread) => void;
  onDelete: (id: string) => void;
};

function download(filename: string, content: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.style.display = "none";
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}

function exportText(thread: ChatThread, language: Language): string {
  const zh = language === "zh";
  if (thread.spreadPositions?.length) {
    const positions = thread.spreadPositions.map((reading) => {
      const title = zh ? reading.positionTitleZh : reading.positionTitleEn;
      const card = reading.card ? (zh ? reading.card.nameZh : reading.card.nameEn) : zh ? "未选牌" : "No card";
      const ultimate = zh
        ? reading.ultimateQuestionZh || reading.ultimateQuestionEn || ""
        : reading.ultimateQuestionEn || reading.ultimateQuestionZh || "";
      return [`${reading.positionOrder}. ${title}`, `Card: ${card}`, ultimate ? `Ultimate question: ${ultimate}` : ""]
        .filter(Boolean)
        .join("\n");
    });
    return [
      thread.title,
      zh ? `总问题：${thread.originalQuestion}` : `Main question: ${thread.originalQuestion}`,
      thread.spreadName ? `${zh ? "牌阵" : "Spread"}: ${thread.spreadName}` : "",
      thread.choiceA || thread.choiceB ? `A: ${thread.choiceA || ""}\nB: ${thread.choiceB || ""}` : "",
      "",
      ...positions,
      "",
      thread.summary ? [thread.summary.title, thread.summary.overview, thread.summary.deepPattern, thread.summary.questionToCarry].join("\n\n") : ""
    ]
      .filter(Boolean)
      .join("\n\n");
  }

  return [
    thread.title,
    `Original question: ${thread.originalQuestion}`,
    `Current question: ${thread.currentQuestion}`,
    `Cards: ${thread.spreadCards.map((card) => `${card.cardName} (${card.role})`).join(", ") || "None"}`,
    "",
    ...thread.messages.map((message) => `[${message.role}] ${message.content}`)
  ].join("\n");
}

export default function SavedChatsPanel({ language, threads, onClose, onReopen, onDelete }: Props) {
  const text = t(language);
  const zh = language === "zh";
  return (
    <div className="modal-backdrop">
      <section className="modal archive-panel">
        <div className="modal-title">
          <h2>{String(text.savedChats)}</h2>
          <button className="icon-action" onClick={onClose} aria-label={String(text.close)}>
            <X size={18} />
          </button>
        </div>
        {!threads.length && <p className="subtle">{String(text.emptyArchive)}</p>}
        <div className="archive-list">
          {threads.map((thread) => {
            const spreadCards = thread.spreadPositions?.filter((reading) => reading.card).length || thread.spreadCards.length;
            return (
              <article className="archive-item" key={thread.id}>
                <h3>{thread.title}</h3>
                <p>{thread.originalQuestion}</p>
                <p className="subtle">
                  {formatDate(thread.updatedAt, zh ? "zh-CN" : "en")} · {thread.spreadName || (zh ? "旧版对话" : "Legacy chat")} ·{" "}
                  {String(text.cards)}: {spreadCards}
                </p>
                <div className="button-row">
                  <button className="primary-action" onClick={() => onReopen(thread)}>
                    {String(text.reopen)}
                  </button>
                  <button
                    className="ghost-action"
                    onClick={() => download(`${thread.id}.json`, JSON.stringify(thread, null, 2), "application/json;charset=utf-8")}
                  >
                    <Download size={16} />
                    {String(text.exportJson)}
                  </button>
                  <button
                    className="ghost-action"
                    onClick={() => download(`${thread.id}.txt`, exportText(thread, language), "text/plain;charset=utf-8")}
                  >
                    <FileText size={16} />
                    {String(text.exportText)}
                  </button>
                  <button className="icon-action danger" onClick={() => onDelete(thread.id)} aria-label={String(text.delete)}>
                    <Trash2 size={16} />
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}
