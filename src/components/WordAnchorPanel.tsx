import { Plus, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";
import type { Language, WordAnchor } from "../types";

type Props = {
  anchors: WordAnchor[];
  language: Language;
  disabled?: boolean;
  onSelect: (anchorId: string) => void;
  onStay: (anchor: WordAnchor) => void;
  onDraw: (anchor: WordAnchor) => void;
  onSummary: (anchor: WordAnchor) => void;
  onCustom: (text: string) => void;
};

export default function WordAnchorPanel({
  anchors,
  language,
  disabled = false,
  onSelect,
  onStay,
  onDraw,
  onSummary,
  onCustom
}: Props) {
  const [customOpen, setCustomOpen] = useState(false);
  const [customWord, setCustomWord] = useState("");
  const label = labels(language);
  const selected = useMemo(() => anchors.find((anchor) => anchor.selected), [anchors]);

  if (!anchors.length) return null;

  return (
    <section className="word-anchor-panel fade-in" aria-label={label.title}>
      <div className="word-anchor-heading">
        <Sparkles size={17} />
        <div>
          <p>{label.glowingWords}</p>
          <span>{selected ? label.selectedPrompt(selected.text) : label.chooseWord}</span>
        </div>
      </div>

      <div className="word-anchor-chips">
        {anchors.map((anchor) => (
          <button
            key={anchor.id}
            className={`word-anchor-chip ${anchor.selected ? "selected" : ""}`}
            disabled={disabled}
            onClick={() => onSelect(anchor.id)}
          >
            {anchor.text}
          </button>
        ))}
      </div>

      {selected && (
        <div className="word-anchor-actions">
          <button className="ghost-action" disabled={disabled} onClick={() => onStay(selected)}>
            {label.stay(selected.text)}
          </button>
          <button className="primary-action" disabled={disabled} onClick={() => onDraw(selected)}>
            {label.draw(selected.text)}
          </button>
          <button className="ghost-action" disabled={disabled} onClick={() => onSummary(selected)}>
            {label.summary(selected.text)}
          </button>
          <button className="ghost-action" disabled={disabled} onClick={() => setCustomOpen((value) => !value)}>
            <Plus size={15} />
            {label.custom}
          </button>
        </div>
      )}

      {customOpen && (
        <form
          className="word-anchor-custom"
          onSubmit={(event) => {
            event.preventDefault();
            const next = customWord.trim();
            if (!next) return;
            onCustom(next);
            setCustomWord("");
            setCustomOpen(false);
          }}
        >
          <input
            value={customWord}
            disabled={disabled}
            placeholder={label.customPlaceholder}
            onChange={(event) => setCustomWord(event.target.value)}
          />
          <button className="primary-action" disabled={disabled || !customWord.trim()}>
            {label.add}
          </button>
        </form>
      )}
    </section>
  );
}

function labels(language: Language) {
  if (language === "zh") {
    return {
      title: "词锚",
      glowingWords: "你刚才的回答里，有几个词正在发光：",
      chooseWord: "选择一个词，让它决定下一步。",
      selectedPrompt: (word: string) => `「${word}」会成为下一步的中心。`,
      stay: (word: string) => `继续停留在当前牌，看「${word}」`,
      draw: (word: string) => `为「${word}」抽一张新牌`,
      summary: (word: string) => `把「${word}」放进总结`,
      custom: "我想自己输入另一个词",
      customPlaceholder: "输入另一个正在发光的词",
      add: "加入"
    };
  }

  return {
    title: "Word Anchors",
    glowingWords: "Some words in your response are beginning to glow:",
    chooseWord: "Choose one word to guide the next step.",
    selectedPrompt: (word: string) => `"${word}" will hold the center for the next step.`,
    stay: (word: string) => `Stay with this card and look at "${word}"`,
    draw: (word: string) => `Draw a new card for "${word}"`,
    summary: (word: string) => `Carry "${word}" into the summary`,
    custom: "I want to enter another word",
    customPlaceholder: "Enter another glowing word",
    add: "Add"
  };
}
