import { SkipForward, Wind } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { Language } from "../types";

type Props = {
  language: Language;
  onComplete: () => void;
  onSkip: () => void;
};

const phases = ["inhale", "hold", "exhale"] as const;

export default function BreathingBall({ language, onComplete, onSkip }: Props) {
  const zh = language === "zh";
  const [step, setStep] = useState(0);
  const done = step >= 9;
  const phase = phases[Math.min(step, 8) % phases.length];
  const breath = Math.min(3, Math.floor(step / 3) + 1);

  useEffect(() => {
    if (done) return;
    const timer = window.setTimeout(() => setStep((current) => current + 1), phase === "hold" ? 1100 : 1800);
    return () => window.clearTimeout(timer);
  }, [done, phase]);

  const phaseLabel = useMemo(() => {
    if (zh) return phase === "inhale" ? "吸气" : phase === "hold" ? "停一停" : "呼气";
    return phase === "inhale" ? "Inhale" : phase === "hold" ? "Hold" : "Exhale";
  }, [phase, zh]);

  return (
    <section className="breathing-page fade-in">
      <div className={`breathing-sphere phase-${phase} ${done ? "complete" : ""}`}>
        <span />
      </div>
      <div className="breathing-copy">
        <p className="ritual-label">{zh ? `第 ${breath} 次呼吸` : `Breath ${breath} of 3`}</p>
        <h2>{phaseLabel}</h2>
        <p>
          {zh
            ? "先慢下来。跟着这个球呼吸三次，然后再把问题带到牌阵里。"
            : "Slow down first. Breathe with this sphere three times, then bring your question into the spread."}
        </p>
      </div>
      <div className="button-row">
        {done && (
          <button className="primary-action" onClick={onComplete}>
            <Wind size={18} />
            {zh ? "写下我的问题" : "Write my question"}
          </button>
        )}
        <button className="ghost-action" onClick={onSkip}>
          <SkipForward size={18} />
          {zh ? "跳过呼吸" : "Skip breathing"}
        </button>
      </div>
    </section>
  );
}
