import { ArrowLeft, Compass, Layers, Sparkles } from "lucide-react";
import type { ReactNode } from "react";
import { useState } from "react";
import type { Language, TarotSpread } from "../types";

type Props = {
  language: Language;
  question: string;
  recommendedSpread: TarotSpread;
  celticSpread: TarotSpread;
  onBack: () => void;
  onChoose: (spread: TarotSpread, choices?: { choiceA?: string; choiceB?: string }) => void;
};

export default function SpreadSelectionPage({ language, question, recommendedSpread, celticSpread, onBack, onChoose }: Props) {
  const zh = language === "zh";
  const [choiceSpread, setChoiceSpread] = useState<TarotSpread | null>(null);
  const [choiceA, setChoiceA] = useState("");
  const [choiceB, setChoiceB] = useState("");

  function choose(spread: TarotSpread) {
    if (spread.id === "two-choice") {
      setChoiceSpread(spread);
      return;
    }
    onChoose(spread);
  }

  return (
    <section className="spread-selection-page fade-in">
      <button className="ghost-action" onClick={onBack}>
        <ArrowLeft size={16} />
        {zh ? "返回问题" : "Back to question"}
      </button>

      <header className="spread-selection-header">
        <p className="ritual-label">{zh ? `总问题：${question}` : `Main question: ${question}`}</p>
        <h2>
          {zh
            ? "根据你的问题，我推荐先用这个简易牌阵。"
            : "Based on your question, I recommend this simple spread first."}
        </h2>
        <p>
          {zh
            ? "如果你想更深入，也可以选择凯尔特十字。"
            : "If you want a deeper reading, you can choose the Celtic Cross."}
        </p>
      </header>

      <div className="spread-choice-grid">
        <SpreadChoiceCard
          language={language}
          label={zh ? "推荐简易牌阵" : "Recommended simple spread"}
          icon={<Sparkles size={19} />}
          spread={recommendedSpread}
          onChoose={() => choose(recommendedSpread)}
        />
        <SpreadChoiceCard
          language={language}
          label={zh ? "更深入：凯尔特十字" : "Deeper option: Celtic Cross"}
          icon={<Layers size={19} />}
          spread={celticSpread}
          onChoose={() => choose(celticSpread)}
        />
      </div>

      {choiceSpread && (
        <div className="modal-backdrop">
          <section className="modal two-choice-modal">
            <p className="ritual-label">{zh ? "二选一牌阵" : "Two-Choice Spread"}</p>
            <h2>{zh ? "先给两个选择命名" : "Name the two options first"}</h2>
            <label>
              {zh ? "A 是什么选择？" : "What is option A?"}
              <input value={choiceA} onChange={(event) => setChoiceA(event.target.value)} />
            </label>
            <label>
              {zh ? "B 是什么选择？" : "What is option B?"}
              <input value={choiceB} onChange={(event) => setChoiceB(event.target.value)} />
            </label>
            <div className="button-row">
              <button className="primary-action" disabled={!choiceA.trim() || !choiceB.trim()} onClick={() => onChoose(choiceSpread, { choiceA, choiceB })}>
                <Compass size={17} />
                {zh ? "进入牌阵" : "Enter spread"}
              </button>
              <button className="ghost-action" onClick={() => setChoiceSpread(null)}>
                {zh ? "取消" : "Cancel"}
              </button>
            </div>
          </section>
        </div>
      )}
    </section>
  );
}

function SpreadChoiceCard({
  language,
  label,
  icon,
  spread,
  onChoose
}: {
  language: Language;
  label: string;
  icon: ReactNode;
  spread: TarotSpread;
  onChoose: () => void;
}) {
  const zh = language === "zh";
  return (
    <article className="spread-choice-card">
      <div className="spread-choice-label">
        {icon}
        <span>{label}</span>
      </div>
      <SpreadPreview spread={spread} />
      <h3>{zh ? spread.nameZh : spread.nameEn}</h3>
      <p>{zh ? spread.descriptionZh : spread.descriptionEn}</p>
      <dl>
        <div>
          <dt>{zh ? "牌数" : "Cards"}</dt>
          <dd>{spread.positions.length}</dd>
        </div>
        <div>
          <dt>{zh ? "时长" : "Duration"}</dt>
          <dd>{durationForSpread(spread, language)}</dd>
        </div>
        <div>
          <dt>{zh ? "适合" : "Recommended for"}</dt>
          <dd>{zh ? spread.recommendedForZh : spread.recommendedForEn}</dd>
        </div>
      </dl>
      <button className="primary-action" onClick={onChoose}>
        {zh ? "选择这个牌阵" : "Choose this spread"}
      </button>
    </article>
  );
}

function SpreadPreview({ spread }: { spread: TarotSpread }) {
  return (
    <div className={`spread-layout-preview preview-${spread.id}`} aria-hidden="true">
      {spread.positions.map((position) => (
        <span
          key={position.id}
          style={{
            left: `${position.layout.x}%`,
            top: `${position.layout.y}%`,
            transform: `translate(-50%, -50%) rotate(${position.layout.rotate || 0}deg)`
          }}
        />
      ))}
    </div>
  );
}

function durationForSpread(spread: TarotSpread, language: Language) {
  const zh = language === "zh";
  if (spread.id === "one-card-deep-dive") return zh ? "8-12 分钟" : "8-12 min";
  if (spread.id === "past-present-future") return zh ? "18-25 分钟" : "18-25 min";
  if (spread.id === "two-choice") return zh ? "30-40 分钟" : "30-40 min";
  return zh ? "60-90 分钟" : "60-90 min";
}
