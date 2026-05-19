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
  link.click();
  URL.revokeObjectURL(url);
}

function exportText(thread: ChatThread): string {
  return [
    thread.title,
    `Original question: ${thread.originalQuestion}`,
    `Current question: ${thread.currentQuestion}`,
    `Cards: ${thread.spreadCards.map((card) => `${card.cardName} (${card.role})`).join(", ") || "None"}`,
    `Word anchors: ${thread.wordAnchors.filter((anchor) => anchor.selected).map((anchor) => anchor.text).join(", ") || "None"}`,
    "",
    ...thread.messages.map((message) => `[${message.role}] ${message.content}`)
  ].join("\n");
}

export default function SavedChatsPanel({ language, threads, onClose, onReopen, onDelete }: Props) {
  const text = t(language);
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
          {threads.map((thread) => (
            <article className="archive-item" key={thread.id}>
              <h3>{thread.title}</h3>
              <p>{thread.originalQuestion}</p>
              <p className="subtle">
                {formatDate(thread.updatedAt, language === "zh" ? "zh-CN" : "en")} · {String(text.cards)}:{" "}
                {thread.spreadCards.map((card) => `${card.cardName} / ${card.role}`).join(", ") || "-"}
              </p>
              <div className="button-row">
                <button className="primary-action" onClick={() => onReopen(thread)}>
                  {String(text.reopen)}
                </button>
                <button
                  className="ghost-action"
                  onClick={() => download(`${thread.id}.json`, JSON.stringify(thread, null, 2), "application/json")}
                >
                  <Download size={16} />
                  {String(text.exportJson)}
                </button>
                <button
                  className="ghost-action"
                  onClick={() => download(`${thread.id}.txt`, exportText(thread), "text/plain")}
                >
                  <FileText size={16} />
                  {String(text.exportText)}
                </button>
                <button className="icon-action danger" onClick={() => onDelete(thread.id)} aria-label={String(text.delete)}>
                  <Trash2 size={16} />
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
