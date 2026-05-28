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
      title: "先写下此刻的问题。",
      secondLine: "再让一副牌阵慢慢展开它。",
      body: "牌不是答案，只是一个入口；每个位置会从一个小角度，陪你把问题看清一点。",
      start: "开始写问题",
      about: "关于这个 Demo",
      aboutTitle: "关于这个研究 Demo",
      aboutBody:
        "这个版本把自由聊天改成牌阵体验：你先输入问题，选择牌阵，再逐一进入每个位置。每个位置只陪你看一个角度。",
      aboutResearch:
        "研究问题：结构化牌阵、位置化 AI 对话与实体/线上抽牌输入，如何帮助普通用户拆解、重新理解并重新拥有自己的个人问题？",
      feedbackTitle: "把你的体验发给我",
      feedbackBody:
        "如果你愿意支持这个研究，可以把导出的聊天记录或牌阵 JSON 发给我做分析。我只会使用你主动分享的内容；愿意分享记录的用户可以获得一些 token，用来继续体验这个网站。",
      feedbackEmailLabel: "邮箱",
      privacyNote: "请只发送你愿意分享的内容。如果记录里有私人信息，可以先删除相关部分，或只发送使用反馈。"
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
      "This version turns the old free chat into a spread experience: the user enters a question, chooses a spread, and moves through positions one by one.",
    aboutResearch:
      "Research question: how can a structured tarot spread, position-specific AI conversations, and physical or online card input help ordinary users decompose, reinterpret, and re-own personal questions?",
    feedbackTitle: "Share your reading record",
    feedbackBody:
      "If you would like to support this research, you can email me your exported chat record or spread JSON for analysis. I will only use what you choose to share. Participants who share records can receive some tokens to continue using the website.",
    feedbackEmailLabel: "Email",
    privacyNote: "Please send only what you are comfortable sharing. You may remove private details first, or send feedback without the full record."
  };
}
