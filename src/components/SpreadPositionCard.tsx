import { Lock, Sparkles } from "lucide-react";
import { withBase } from "../lib/tarotDeck";
import type { Language, PositionReading, SpreadPosition } from "../types";

type Props = {
  language: Language;
  position: SpreadPosition;
  reading: PositionReading;
  isActive: boolean;
  disabled?: boolean;
  onClick?: () => void;
};

export default function SpreadPositionCard({ language, position, reading, isActive, disabled, onClick }: Props) {
  const zh = language === "zh";
  const completed = reading.status === "completed";
  const skipped = reading.status === "skipped";
  const ultimate = zh
    ? reading.ultimateQuestionZh || reading.ultimateQuestionEn
    : reading.ultimateQuestionEn || reading.ultimateQuestionZh;
  const cardName = reading.card ? (zh ? reading.card.nameZh : reading.card.nameEn) : "";
  const title = zh ? reading.positionTitleZh : reading.positionTitleEn;
  const zIndex = isActive ? 5 : position.layout.overlap ? 1 : 2;

  return (
    <button
      className={[
        "spread-position-card",
        isActive ? "active" : "",
        completed ? "completed" : "",
        skipped ? "skipped" : "",
        disabled ? "locked" : ""
      ].join(" ")}
      style={{
        left: `${position.layout.x}%`,
        top: `${position.layout.y}%`,
        transform: `translate(-50%, -50%) rotate(${position.layout.rotate || 0}deg)`,
        zIndex
      }}
      disabled={disabled}
      onClick={onClick}
    >
      <span className="position-order">{reading.positionOrder}</span>
      {completed && reading.card ? (
        <>
          <img src={withBase(reading.card.imagePath)} alt={cardName} />
          <span className="position-title">{title}</span>
          <strong>{cardName}</strong>
          {ultimate && <em>{ultimate}</em>}
        </>
      ) : skipped ? (
        <>
          <span className="card-back muted" />
          <span className="position-title">{title}</span>
          <strong>{zh ? "已跳过" : "Skipped"}</strong>
        </>
      ) : (
        <>
          <span className="card-back" />
          <span className="position-title">{title}</span>
          {isActive ? (
            <strong className="active-hint">
              <Sparkles size={14} />
              {zh ? "点击进入" : "Open position"}
            </strong>
          ) : (
            <strong className="inactive-hint">
              <Lock size={13} />
              {zh ? "稍后" : "Later"}
            </strong>
          )}
        </>
      )}
    </button>
  );
}
