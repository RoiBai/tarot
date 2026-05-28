import { Download, Home, Save, ScrollText } from "lucide-react";
import { useState } from "react";
import { generateReaderSpreadSummary } from "../lib/spreadAgentClient";
import { getEffectiveApiKey } from "../lib/storage";
import type { ChatThread, Language, Settings, SpreadSummary, TarotSpread } from "../types";
import SpreadOverviewThumbnail from "./SpreadOverviewThumbnail";

type Props = {
  language: Language;
  settings: Settings;
  thread: ChatThread;
  spread: TarotSpread;
  onThreadChange: (thread: ChatThread) => void;
  onBackToBoard: () => void;
  onReturnHome: () => void;
};

export default function SpreadSummaryPage({ language, settings, thread, spread, onThreadChange, onBackToBoard, onReturnHome }: Props) {
  const zh = language === "zh";
  const [phase, setPhase] = useState<"overview" | "summary">(thread.summary ? "summary" : "overview");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const summary = thread.summary;

  async function generateSummary() {
    setLoading(true);
    setError("");
    try {
      const nextSummary = await generateReaderSpreadSummary({
        apiKey: getEffectiveApiKey(),
        baseUrl: settings.baseUrl,
        model: settings.model,
        language,
        originalQuestion: thread.originalQuestion,
        spread,
        positionReadings: thread.spreadPositions || [],
        choiceA: thread.choiceA,
        choiceB: thread.choiceB
      });
      onThreadChange({ ...thread, summary: nextSummary, updatedAt: new Date().toISOString() });
      setPhase("summary");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : zh ? "总结暂时无法生成。" : "The summary could not be generated.");
    } finally {
      setLoading(false);
    }
  }

  function exportText(summaryToExport: SpreadSummary) {
    const text = [
      summaryToExport.title,
      "",
      zh ? `总问题：${thread.originalQuestion}` : `Main question: ${thread.originalQuestion}`,
      "",
      summaryToExport.overview,
      "",
      summaryToExport.deepPattern,
      "",
      summaryToExport.questionToCarry,
      "",
      summaryToExport.gentleSuggestion,
      "",
      summaryToExport.smallPoem
    ].join("\n");
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `spread-summary-${Date.now()}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  }

  function confirmHome() {
    const message = zh
      ? "这次牌阵和总结已经保存在本地。要先回到首页吗？之后你还可以从已保存的牌阵继续看。"
      : "This spread and summary have been saved locally. Return home for now? You can revisit them from Saved Spreads later.";
    if (window.confirm(message)) onReturnHome();
  }

  if (phase === "overview") {
    return (
      <section className="summary-page fade-in">
        <SpreadOverviewThumbnail language={language} thread={thread} spread={spread} />
        {error && <p className="form-error">{error}</p>}
        <div className="button-row summary-actions">
          <button className="primary-action" disabled={loading} onClick={generateSummary}>
            <ScrollText size={17} />
            {loading ? (zh ? "正在生成总结……" : "Generating summary...") : zh ? "生成总结" : "Generate summary"}
          </button>
          <button className="ghost-action" onClick={onBackToBoard}>
            {zh ? "回到牌阵继续" : "Return to spread"}
          </button>
          <button className="ghost-action" onClick={confirmHome}>
          <Home size={17} />
            {zh ? "回到首页" : "Return home"}
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="summary-page fade-in">
      <SpreadOverviewThumbnail language={language} thread={thread} spread={spread} />
      {summary ? (
        <article className="spread-parchment-summary">
          <p className="ritual-label">{zh ? "总结" : "Summary"}</p>
          <h2>{summary.title}</h2>
          <p className="summary-original-question">{zh ? `总问题：${thread.originalQuestion}` : `Main question: ${thread.originalQuestion}`}</p>
          <p>{summary.overview}</p>
          <p>{summary.deepPattern}</p>
          <blockquote>{summary.questionToCarry}</blockquote>
          <p>{summary.gentleSuggestion}</p>
          <pre>{summary.smallPoem}</pre>
        </article>
      ) : (
        <p className="form-error">{zh ? "还没有生成总结。" : "No summary has been generated yet."}</p>
      )}
      <div className="button-row summary-actions">
        <button
          className="primary-action"
          disabled={!summary}
          onClick={() => {
            if (!summary) return;
            onThreadChange({ ...thread, summary, updatedAt: new Date().toISOString() });
            setSaved(true);
          }}
        >
          <Save size={17} />
          {saved ? (zh ? "已保存" : "Saved") : zh ? "保存总结" : "Save summary"}
        </button>
        <button className="ghost-action" disabled={!summary} onClick={() => summary && exportText(summary)}>
          <Download size={17} />
          {zh ? "导出文本" : "Export text"}
        </button>
        <button className="ghost-action" onClick={onBackToBoard}>
          {zh ? "回到牌阵" : "Return to spread"}
        </button>
        <button className="ghost-action" onClick={confirmHome}>
          <Home size={17} />
          {zh ? "回到首页" : "Return home"}
        </button>
      </div>
    </section>
  );
}
