import { Archive, Check, Clipboard, Info, Settings, Sparkles, X } from "lucide-react";
import { useState } from "react";
import { t } from "../lib/i18n";
import type { Language } from "../types";
import TarotCardVisual from "./TarotCardVisual";

const FEEDBACK_EMAIL = "roibai0405@gmail.com";

type Props = {
  language: Language;
  onStart: () => void;
  onOpenSettings: () => void;
  onOpenArchive: () => void;
};

export default function LandingPage({ language, onStart, onOpenSettings, onOpenArchive }: Props) {
  const text = t(language);
  const landing = landingCopy(language);
  const about = aboutCopy(language);
  const feedback = feedbackCopy(language);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  async function copyEmail() {
    try {
      await navigator.clipboard.writeText(FEEDBACK_EMAIL);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="landing-view fade-in">
      <div className="hero-copy">
        <p className="ritual-label">reflection, not prediction</p>
        <h2>{landing.title}</h2>
        <h3 className="landing-second-line">{landing.secondLine}</h3>
        <p>{landing.subtext}</p>
        <div className="button-row">
          <button className="primary-action" onClick={onStart}>
            <Sparkles size={18} />
            {landing.button}
          </button>
          <button className="ghost-action" onClick={onOpenArchive}>
            <Archive size={18} />
            {String(text.savedChats)}
          </button>
          <button className="ghost-action" onClick={() => setAboutOpen(true)}>
            <Info size={18} />
            {about.button}
          </button>
          <button className="icon-action" onClick={onOpenSettings} aria-label={String(text.settings)}>
            <Settings size={18} />
          </button>
        </div>
      </div>
      <TarotCardVisual cardName="The Moon" language={language} featured />

      {aboutOpen && (
        <div className="modal-backdrop" onClick={() => setAboutOpen(false)}>
          <section className="modal about-reflection-modal" aria-label={about.title} onClick={(event) => event.stopPropagation()}>
            <div className="modal-title">
              <h2>{about.title}</h2>
              <button className="icon-action" onClick={() => setAboutOpen(false)} aria-label={String(text.close)}>
                <X size={18} />
              </button>
            </div>
            <p>{about.researchText}</p>
            <p>{about.logicText}</p>
            <p>{about.creditText}</p>

            <section className="feedback-share-section">
              <h3>{feedback.title}</h3>
              <p>{feedback.intro}</p>
              <ol>
                {feedback.shareOptions.map((item) => (
                  <li key={item.title}>
                    <strong>{item.title}</strong>
                    <span>{item.body}</span>
                  </li>
                ))}
              </ol>

              <div className="feedback-email-row">
                <span>{feedback.sendTo}</span>
                <code>{FEEDBACK_EMAIL}</code>
                <button className="icon-action" onClick={copyEmail} aria-label={feedback.copyEmail}>
                  {copied ? <Check size={16} /> : <Clipboard size={16} />}
                </button>
              </div>

              <p>
                <strong>{feedback.subjectLabel}</strong>
                <br />
                <code>{feedback.subject}</code>
              </p>

              <div>
                <strong>{feedback.questionsLabel}</strong>
                <ul>
                  {feedback.questions.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>

              <div className="json-export-note">
                <strong>{feedback.exportTitle}</strong>
                <ol>
                  {feedback.exportSteps.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ol>
              </div>

              <p>{feedback.interview}</p>
              <p className="privacy-note">{feedback.privacy}</p>
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
      title: "先写下此刻的问题。",
      secondLine: "再让一张牌进入它。",
      subtext: "这个 Demo 探索人们如何把一个随机抽到的视觉符号，和自己的当下问题放在一起看。牌不是答案，只是一个入口。",
      button: "开始写问题"
    };
  }
  return {
    title: "Name the question first.",
    secondLine: "Then let a card enter it.",
    subtext: "This demo explores how people place a randomly drawn visual symbol beside a present-life question. The card is not an answer. It is an entry point.",
    button: "Begin with a Question"
  };
}

function aboutCopy(language: Language) {
  if (language === "zh") {
    return {
      button: "关于这个 Demo",
      title: "关于这个研究 Demo",
      researchText: "这个 Demo 探索普通用户如何在随机抽到的塔罗牌图像和个人问题之间生成意义。塔罗牌不是预测工具，而是一个视觉符号，也是在反思中打断原有思路的入口。",
      logicText: "这次体验不是固定牌阵。开场的大阿尔卡纳需要你先选择一个图像符号；后续的新牌则通过关键词，让你自己判断它是否和问题产生连接。",
      creditText: "塔罗牌图像基于 Pamela Colman Smith 绘制、1909 年出版的 Rider-Waite-Smith 原版公共领域图像，来源为 Wikimedia Commons。本 Demo 不使用表单自动收集任何内容。"
    };
  }

  return {
    button: "About this demo",
    title: "About This Research Demo",
    researchText: "This demo explores how ordinary users make meaning between a randomly drawn tarot image and a personal question. The card is not treated as prediction. It acts as a visual symbol and an interruption inside guided reflection.",
    logicText: "This reading does not begin with a fixed spread. The opening Major Arcana asks you to notice one image symbol; later cards ask you to choose whether any card keywords connect with your question.",
    creditText: "Tarot card images are based on public-domain Rider-Waite-Smith images illustrated by Pamela Colman Smith and first published in 1909, sourced from Wikimedia Commons. This demo does not automatically collect anything through forms."
  };
}

function feedbackCopy(language: Language) {
  if (language === "zh") {
    return {
      title: "把你的体验反馈给开发者",
      intro: "如果你愿意帮助我改进这个 Demo，可以把你的体验反馈或对话记录发给我。",
      shareOptions: [
        { title: "只分享你的使用反馈", body: "例如：哪里让你觉得有帮助、哪里不自然、哪里让你困惑、哪一步你不想继续。" },
        { title: "只分享你的对话 JSON", body: "你可以在「已保存的对话」或当前对话中导出 JSON 文件，然后作为附件发送给我。" },
        { title: "同时分享对话 JSON 和你的反馈", body: "这对我理解用户如何与随机牌面、AI 回应和自己的问题建立连接最有帮助。" }
      ],
      sendTo: "请发送到：",
      copyEmail: "复制邮箱",
      subjectLabel: "邮件标题建议：",
      subject: "Tarot Demo Feedback - [你的名字或昵称]",
      questionsLabel: "你可以在邮件里简单写：",
      questions: [
        "你使用这个 Demo 时提出的问题大概是什么类型？",
        "哪一步让你觉得最有帮助？",
        "哪一步让你觉得不自然或不合理？",
        "抽到的牌和你的问题之间有没有产生连接？",
        "你觉得这个连接是牌带来的、AI 带来的，还是你自己建立起来的？",
        "最后的总结或新问题像不像你自己的想法？",
        "你愿不愿意接受后续简短采访？"
      ],
      exportTitle: "如何导出 JSON：",
      exportSteps: ["打开当前对话或「已保存的对话」。", "点击「导出 JSON」。", "将下载的 JSON 文件作为邮件附件发送给我。"],
      interview: "如果你愿意接受后续采访，我会赠送一些 token，供你继续在这个网站中探索对话。",
      privacy: "请只发送你愿意分享的内容。如果对话里包含你不想公开的私人信息，你可以先删除相关内容，或者只发送反馈，不发送对话记录。"
    };
  }

  return {
    title: "Share Your Reflection With the Developer",
    intro: "If you would like to help me improve this demo, you can send me your feedback or your exported chat record.",
    shareOptions: [
      { title: "Feedback only", body: "For example: what felt useful, what felt unnatural, what confused you, or where you did not want to continue." },
      { title: "Chat JSON only", body: "You can export the JSON file from the current chat or Saved Chats, then send it to me as an email attachment." },
      { title: "Both chat JSON and feedback", body: "This is the most helpful option for understanding how users connect random card images, AI responses, and their own questions." }
    ],
    sendTo: "Please send it to:",
    copyEmail: "Copy email",
    subjectLabel: "Suggested email subject:",
    subject: "Tarot Demo Feedback - [your name or nickname]",
    questionsLabel: "In the email, you may briefly answer:",
    questions: [
      "What kind of question did you bring to the demo?",
      "Which step felt most helpful?",
      "Which step felt unnatural or unreasonable?",
      "Did the card feel connected to your question?",
      "Did that connection feel created by the card, by the AI, or by yourself?",
      "Did the final summary or reframed question feel like your own thought?",
      "Would you be willing to join a short follow-up interview?"
    ],
    exportTitle: "How to export JSON:",
    exportSteps: ["Open the current chat or Saved Chats.", "Click “Export JSON.”", "Attach the downloaded JSON file to your email."],
    interview: "If you are willing to join a follow-up interview, I will provide some tokens for you to continue exploring conversations on this website.",
    privacy: "Please only share what you are comfortable sharing. If the chat contains private information you do not want to share, you may delete that part first, or send feedback only without the chat record."
  };
}
