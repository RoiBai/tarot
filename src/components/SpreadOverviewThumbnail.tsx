import { withBase } from "../lib/tarotDeck";
import type { ChatThread, Language, TarotSpread } from "../types";

type Props = {
  language: Language;
  thread: ChatThread;
  spread: TarotSpread;
};

export default function SpreadOverviewThumbnail({ language, thread, spread }: Props) {
  const zh = language === "zh";
  const readings = thread.spreadPositions || [];

  return (
    <section className="spread-overview-card">
      <header>
        <p className="ritual-label">{zh ? "牌阵总览" : "Spread overview"}</p>
        <h3>{zh ? spread.nameZh : spread.nameEn}</h3>
        <p>{zh ? `总问题：${thread.originalQuestion}` : `Main question: ${thread.originalQuestion}`}</p>
      </header>
      <div className={`spread-overview-thumb overview-${spread.id}`}>
        {spread.positions.map((position) => {
          const reading = readings.find((item) => item.positionId === position.id);
          const cardName = reading?.card ? (zh ? reading.card.nameZh : reading.card.nameEn) : "";
          const ultimate = reading ? (zh ? reading.ultimateQuestionZh || reading.ultimateQuestionEn : reading.ultimateQuestionEn || reading.ultimateQuestionZh) : "";
          return (
            <article
              key={position.id}
              className={`overview-position ${reading?.status || "empty"}`}
              style={{
                left: `${position.layout.x}%`,
                top: `${position.layout.y}%`,
                transform: `translate(-50%, -50%) rotate(${position.layout.rotate || 0}deg)`,
                zIndex: position.layout.overlap ? 3 : 2
              }}
            >
              {reading?.card ? <img src={withBase(reading.card.imagePath)} alt={cardName} /> : <span className="overview-card-back" />}
              <strong>{cardName || (reading?.status === "skipped" ? (zh ? "跳过" : "Skipped") : reading?.positionOrder)}</strong>
              <em>{ultimate || (zh ? position.titleZh : position.titleEn)}</em>
            </article>
          );
        })}
      </div>
    </section>
  );
}
