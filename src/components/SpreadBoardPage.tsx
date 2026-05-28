import { Home, ScrollText } from "lucide-react";
import type { ChatThread, Language, TarotSpread } from "../types";
import SpreadBoard from "./SpreadBoard";

type Props = {
  language: Language;
  thread: ChatThread;
  spread: TarotSpread;
  onOpenPosition: (positionId: string) => void;
  onSummary: () => void;
  onReturnHome: () => void;
};

export default function SpreadBoardPage({ language, thread, spread, onOpenPosition, onSummary, onReturnHome }: Props) {
  const zh = language === "zh";
  const readings = thread.spreadPositions || [];
  const completed = readings.filter((reading) => reading.status === "completed").length;
  const skipped = readings.filter((reading) => reading.status === "skipped").length;
  const active = readings.find((reading) => reading.status === "active");

  function confirmHome() {
    const message = zh
      ? "这次牌阵的进度已经保存在本地。要先回到首页吗？之后你还可以从已保存的牌阵继续。"
      : "This spread has been saved locally. Return home for now? You can continue from Saved Spreads later.";
    if (window.confirm(message)) onReturnHome();
  }

  return (
    <section className="spread-board-page fade-in">
      <header className="spread-board-header">
        <p className="ritual-label">{zh ? `总问题：${thread.originalQuestion}` : `Main question: ${thread.originalQuestion}`}</p>
        <div>
          <h2>{zh ? spread.nameZh : spread.nameEn}</h2>
          <p>
            {active
              ? zh
                ? `当前发光牌位：${active.positionTitleZh}`
                : `Glowing position: ${active.positionTitleEn}`
              : zh
                ? "牌阵已经可以进入总结。"
                : "The spread is ready for summary."}
          </p>
        </div>
        {(thread.choiceA || thread.choiceB) && (
          <div className="choice-pill-row">
            <span>A: {thread.choiceA}</span>
            <span>B: {thread.choiceB}</span>
          </div>
        )}
        <div className="spread-progress-line">
          {zh
            ? `${completed} 个完成，${skipped} 个跳过，共 ${readings.length} 个牌位`
            : `${completed} completed, ${skipped} skipped, ${readings.length} positions total`}
        </div>
      </header>

      <SpreadBoard language={language} spread={spread} readings={readings} onOpenPosition={onOpenPosition} />

      <div className="button-row spread-board-actions">
        <button className="primary-action" onClick={onSummary}>
          <ScrollText size={17} />
          {zh ? "总结" : "Summary"}
        </button>
        <button className="ghost-action" onClick={confirmHome}>
          <Home size={17} />
          {zh ? "回到首页" : "Return Home"}
        </button>
      </div>
    </section>
  );
}
