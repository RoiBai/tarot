import type { Language, PositionReading, TarotSpread } from "../types";
import SpreadPositionCard from "./SpreadPositionCard";

type Props = {
  language: Language;
  spread: TarotSpread;
  readings: PositionReading[];
  onOpenPosition: (positionId: string) => void;
};

export default function SpreadBoard({ language, spread, readings, onOpenPosition }: Props) {
  return (
    <div className={`spread-board spread-board-${spread.id}`}>
      {spread.positions.map((position) => {
        const reading = readings.find((item) => item.positionId === position.id);
        if (!reading) return null;
        const isActive = reading.status === "active";
        const disabled = reading.status === "empty";
        return (
          <SpreadPositionCard
            key={position.id}
            language={language}
            position={position}
            reading={reading}
            isActive={isActive}
            disabled={disabled}
            onClick={() => onOpenPosition(position.id)}
          />
        );
      })}
    </div>
  );
}
