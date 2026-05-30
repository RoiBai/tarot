import { Archive, Info, Settings, Sparkles, X } from "lucide-react";
import { useState } from "react";
import { t } from "../lib/i18n";
import { withBase } from "../lib/tarotDeck";
import type { Language } from "../types";

const FEEDBACK_EMAIL = "roibai0405@gmail.com";

type Props = {
  language: Language;
  onStart: () => void;
  onOpenSettings: () => void;
  onOpenArchive: () => void;
};

export default function LandingPage({ language, onStart, onOpenSettings, onOpenArchive }: Props) {
  const text = t(language);
  const copy = landingCopy(language);
  const [aboutOpen, setAboutOpen] = useState(false);

  return (
    <div className="spread-landing fade-in">
      <div className="spread-landing-art" aria-hidden="true">
        <img className="landing-card landing-card-one" src={withBase("/cards/rws/major/18-moon.jpg")} alt="" />
        <img className="landing-card landing-card-two" src={withBase("/cards/rws/major/17-star.jpg")} alt="" />
        <img className="landing-card landing-card-three" src={withBase("/cards/rws/major/09-hermit.jpg")} alt="" />
      </div>

      <div className="spread-landing-copy">
        <p className="ritual-label">{copy.eyebrow}</p>
        <h2>{copy.title}</h2>
        <h3 className="landing-second-line">{copy.secondLine}</h3>
        <p>{copy.body}</p>
        <div className="button-row">
          <button className="primary-action" onClick={onStart}>
            <Sparkles size={18} />
            {copy.start}
          </button>
          <button className="ghost-action" onClick={onOpenArchive}>
            <Archive size={18} />
            {String(text.savedChats)}
          </button>
          <button className="ghost-action" onClick={() => setAboutOpen(true)}>
            <Info size={18} />
            {copy.about}
          </button>
          <button className="icon-action" onClick={onOpenSettings} aria-label={String(text.settings)}>
            <Settings size={18} />
          </button>
        </div>
      </div>

      {aboutOpen && (
        <div className="modal-backdrop" onClick={() => setAboutOpen(false)}>
          <section className="modal about-reflection-modal" aria-label={copy.aboutTitle} onClick={(event) => event.stopPropagation()}>
            <div className="modal-title">
              <h2>{copy.aboutTitle}</h2>
              <button className="icon-action" onClick={() => setAboutOpen(false)} aria-label={String(text.close)}>
                <X size={18} />
              </button>
            </div>
            <p>{copy.aboutBody}</p>
            <p>{copy.aboutResearch}</p>
            <section className="feedback-share-section">
              <h3>{copy.feedbackTitle}</h3>
              <p>{copy.feedbackBody}</p>
              <p>{copy.feedbackInterview}</p>
              <div className="feedback-email-row">
                <span>{copy.feedbackEmailLabel}</span>
                <a href={`mailto:${FEEDBACK_EMAIL}`}>{FEEDBACK_EMAIL}</a>
              </div>
              <p className="privacy-note">{copy.privacyNote}</p>
            </section>
          </section>
        </div>
      )}
    </div>
  );
}

function landingCopy(language: Language) {
  if (language === "zh") {
    return {
      eyebrow: "reflection, not prediction",
      title: "先把问题说出来。",
      secondLine: "再让牌阵慢慢把它展开。",
      body: "牌不是答案。它们更像入口，每个位置只照亮问题里的一个角度。",
      start: "带着问题进入牌阵",
      about: "关于这个 Demo",
      aboutTitle: "关于这个研究 Demo",
      aboutBody:
        "这个版本把原来的自由聊天改成了牌阵体验：你先写下问题，再选择牌阵，之后一张一张进入不同的位置。",
      aboutResearch:
        "研究问题：结构化塔罗牌阵、每个位置的 AI 对话、以及实体或线上抽牌，如何帮助普通用户拆解、重新理解并重新拥有自己的个人问题？",
      feedbackTitle: "把你的体验发给我",
      feedbackBody:
        "如果你愿意支持这个研究，可以把导出的聊天记录或牌阵 JSON 发给我。我会把它作为研究分析材料。愿意分享对话记录的用户，可以获得一些免费 token，用来继续体验这个网站。你也可以只写下使用感受，不一定要发送完整记录。",
      feedbackInterview:
        "如果你愿意和我聊聊这次体验，以及这个问题是怎么被拆开、重新理解的，也可以获得一份小奖励。",
      feedbackEmailLabel: "邮箱",
      privacyNote: "请只发送你愿意分享的内容。如果记录里有私人信息，可以先删除相关部分。"
    };
  }

  return {
    eyebrow: "reflection, not prediction",
    title: "Name the question first.",
    secondLine: "Then let a spread slowly open around it.",
    body: "The cards are not answers. They are entry points, each holding one angle of the question.",
    start: "Begin with a Question",
    about: "About this demo",
    aboutTitle: "About This Research Demo",
    aboutBody:
      "This version turns the old free chat into a spread experience: you enter a question, choose a spread, and move through positions one by one.",
    aboutResearch:
      "Research question: how can a structured tarot spread, position-specific AI conversations, and physical or online card input help ordinary users decompose, reinterpret, and re-own personal questions?",
    feedbackTitle: "Share your experience with me",
    feedbackBody:
      "If you would like to support this research, you can email me your exported chat record or spread JSON. I may use it as research material for analysis. People who share conversation records can receive some free tokens to keep using the website. You can also send feedback without the full record.",
    feedbackInterview:
      "If you are willing to talk with me about the experience and how the question was decomposed or re-understood, you can also receive a small reward.",
    feedbackEmailLabel: "Email",
    privacyNote: "Please send only what you are comfortable sharing. You may remove private details first, or send feedback without the full record."
  };
}
