import { useEffect, useMemo, useState } from "react";
import LandingPage from "./components/LandingPage";
import LanguageToggle from "./components/LanguageToggle";
import LayoutShell from "./components/LayoutShell";
import QuestionSetup from "./components/QuestionSetup";
import ReflectiveChat from "./components/ReflectiveChat";
import SavedChatsPanel from "./components/SavedChatsPanel";
import SettingsPanel from "./components/SettingsPanel";
import { t } from "./lib/i18n";
import { deleteThread, loadSettings, loadThreads, saveSettings, upsertThread } from "./lib/storage";
import { findDeckCard } from "./lib/tarotDeck";
import { createId, nowIso, titleFromQuestion } from "./lib/utils";
import type { ChatMessage, ChatThread, FirstCardImpression, Settings, SpreadCard, SymbolSelection } from "./types";

type View = "landing" | "setup" | "chat";

export default function App() {
  const [settings, setSettings] = useState<Settings>(() => loadSettings());
  const [view, setView] = useState<View>("landing");
  const [thread, setThread] = useState<ChatThread | null>(null);
  const [threads, setThreads] = useState<ChatThread[]>(() => loadThreads());
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [archiveOpen, setArchiveOpen] = useState(false);
  const text = useMemo(() => t(settings.language), [settings.language]);

  useEffect(() => {
    saveSettings(settings);
    document.documentElement.lang = settings.language === "zh" ? "zh-CN" : "en";
  }, [settings]);

  function persistThread(next: ChatThread) {
    setThread(next);
    setThreads(upsertThread(next));
  }

  function beginThread(payload: { question: string; firstCardImpression: FirstCardImpression; openingSymbolSelection: SymbolSelection }) {
    const timestamp = nowIso();
    const { question, firstCardImpression, openingSymbolSelection } = payload;
    const cardData = findDeckCard(firstCardImpression.cardName);
    const firstCard: SpreadCard = {
      id: createId("spread"),
      order: 1,
      cardName: firstCardImpression.cardName,
      cardNameZh: cardData?.nameZh,
      role: settings.language === "zh" ? "第一张随机符号" : "First random symbol",
      nodeType: "first_symbol",
      nodeLabel: settings.language === "zh" ? "第一张随机符号" : "First random symbol",
      drawnFor: settings.language === "zh" ? "为当前问题进入的第一张随机图像" : "The first random image that entered the current question",
      drawnAt: firstCardImpression.createdAt || timestamp,
      isActive: true,
      userTurnCount: 0,
      aiQuestionCount: 1
    };
    const firstConnection = buildInitialCardQuestionMessage(settings.language, question, firstCardImpression, openingSymbolSelection);
    const firstAssistant: ChatMessage = {
      id: createId("msg"),
      role: "assistant",
      content: JSON.stringify(firstConnection),
      timestamp
    };
    const next: ChatThread = {
      id: createId("thread"),
      title: titleFromQuestion(question),
      originalQuestion: question,
      currentQuestion: question,
      firstCardImpression,
      openingSymbolSelection,
      currentStage: "initial_connection",
      questionHistory: [],
      operatingRules: [],
      createdAt: timestamp,
      updatedAt: timestamp,
      language: settings.language,
      spreadCards: [firstCard],
      wordAnchors: [],
      conceptAnchors: [],
      randomnessReflections: [],
      usedGroundingEntryTypes: [
        {
          type: "card_impression",
          questionText: firstConnection.questionToUser,
          cardId: firstCard.id,
          createdAt: timestamp
        }
      ],
      askedQuestionIntents: [
        {
          intent: "symbol_question_connection",
          depthLevel: "integration",
          soraStage: "initial_connection",
          questionText: firstConnection.questionToUser,
          cardId: firstCard.id,
          createdAt: timestamp
        }
      ],
      messages: [firstAssistant],
      endedForNow: false
    };
    persistThread(next);
    setView("chat");
  }

  function reopenThread(saved: ChatThread) {
    setThread(saved);
    setSettings((current) => ({ ...current, language: saved.language || current.language }));
    setArchiveOpen(false);
    setView("chat");
  }

  function removeThread(id: string) {
    const next = deleteThread(id);
    setThreads(next);
    if (thread?.id === id) {
      setThread(null);
      setView("landing");
    }
  }

  return (
    <LayoutShell settings={settings}>
      <div className="topbar">
        <div>
          <p className="eyebrow">{String(text.subtitle)}</p>
          <h1>{String(text.appTitle)}</h1>
        </div>
        <LanguageToggle language={settings.language} onChange={(language) => setSettings((current) => ({ ...current, language }))} />
      </div>

      {view === "landing" && (
        <LandingPage
          language={settings.language}
          onStart={() => setView("setup")}
          onOpenArchive={() => setArchiveOpen(true)}
          onOpenSettings={() => setSettingsOpen(true)}
        />
      )}

      {view === "setup" && (
        <QuestionSetup
          language={settings.language}
          onBack={() => setView("landing")}
          onBegin={beginThread}
        />
      )}

      {view === "chat" && thread && (
        <ReflectiveChat
          settings={settings}
          thread={thread}
          onThreadChange={persistThread}
          onOpenSettings={() => setSettingsOpen(true)}
          onOpenArchive={() => setArchiveOpen(true)}
          onReturnHome={() => {
            setThread(null);
            setView("landing");
          }}
        />
      )}

      {settingsOpen && <SettingsPanel settings={settings} onChange={setSettings} onClose={() => setSettingsOpen(false)} />}

      {archiveOpen && (
        <SavedChatsPanel
          language={settings.language}
          threads={threads}
          onClose={() => setArchiveOpen(false)}
          onReopen={reopenThread}
          onDelete={removeThread}
        />
      )}
    </LayoutShell>
  );
}

function cleanOpeningText(value?: string) {
  const text = (value || "").trim();
  return text && text !== "undefined" && text !== "null" ? text : "";
}

function buildInitialCardQuestionMessage(
  language: Settings["language"],
  question: string,
  impression: FirstCardImpression,
  symbol: SymbolSelection
) {
  const zh = language === "zh";
  const card = findDeckCard(symbol.cardId) || findDeckCard(impression.cardName);
  const cardTitle = zh ? card?.nameZh || impression.cardName : card?.nameEn || impression.cardName;
  const symbolLabel = cleanOpeningText(symbol.symbolLabel) || cleanOpeningText(impression.selectedChip) || (zh ? "这个符号" : "this symbol");
  const symbolMeaning =
    cleanOpeningText(symbol.customMeaning) ||
    cleanOpeningText(symbol.selectedDirection) ||
    cleanOpeningText(impression.impressionText) ||
    (zh ? "还说不清的感觉" : "something not yet clear");

  return {
    type: "card_entry",
    stage: "initial_connection",
    cardTitle,
    cardRole: zh ? "第一张随机符号" : "First random symbol",
    cardMeaning: zh ? `「${cardTitle}」常让人想到${openingMeaningZh(card)}。` : `"${cardTitle}" is often associated with ${openingMeaningEn(card)}.`,
    symbolConnection: zh
      ? `你先看到的是「${symbolLabel}」，并把它连到「${symbolMeaning}」。我们先不急着解释整张牌，可以只从这个${openingSymbolNounZh(symbolLabel, symbolMeaning)}开始。`
      : `You first noticed "${symbolLabel}" and connected it with "${symbolMeaning}." We do not need to interpret the whole card yet. We can begin from this small ${openingSymbolNounEn(symbolLabel, symbolMeaning)}.`,
    spreadConnection: null,
    inCurrentQuestion: zh
      ? `放到「${question}」里看，它更像是在问：${openingConcreteConnectionZh(symbolLabel, symbolMeaning, question)}`
      : `Placed beside "${question}," it may be asking: ${openingConcreteConnectionEn(symbolLabel, symbolMeaning, question)}`,
    questionToUser: zh ? openingConcreteQuestionZh(symbolLabel, symbolMeaning, question) : openingConcreteQuestionEn(symbolLabel, symbolMeaning, question),
    questionIntent: "symbol_question_connection",
    depthLevel: "integration",
    builtFromUserWords: [symbolLabel, symbolMeaning, question],
    reframedQuestion: null,
    nextAction: "continue_current_card",
    suggestedNextCardRole: null,
    suggestedNextCardReason: null
  };
}

function openingMeaningZh(card?: ReturnType<typeof findDeckCard>) {
  if (!card) return "一个随机出现的图像方向";
  const base = card.keywordsZh.slice(0, 3).join("、");
  const extra: Record<string, string> = {
    fool: "刚要开始、还没有被定义的状态",
    magician: "把注意力和手边工具连起来",
    "high-priestess": "安静、直觉，或者还没有说出口的知道",
    empress: "照顾、身体，或者正在长出来的东西",
    emperor: "结构、边界，或者需要被安排的位置",
    hierophant: "规则、传统，或者想被认可的方式",
    lovers: "选择、关系，或者什么和什么需要对齐",
    chariot: "方向、控制，或者被推动着往前走",
    strength: "柔软的力量、克制，或者身体里的耐心",
    hermit: "独处、寻找，或者从人群里退开一点",
    "wheel-of-fortune": "循环、变化，或者某个反复出现的模式",
    justice: "衡量、决定，或者一件事带来的后果",
    "hanged-man": "暂停、换个角度，或者暂时动不了的位置",
    death: "结束、放手，或者一个阶段正在退场",
    temperance: "调和、节奏，或者慢慢把两件事混在一起",
    devil: "习惯、束缚，或者明知道却放不开的东西",
    tower: "震动、断裂，或者突然不能再假装没看见的东西",
    star: "修复、希望，或者一点慢慢恢复的亮光",
    moon: "模糊、投射，或者还没有被看清的感觉",
    sun: "清楚、暴露，或者终于被看见的能量",
    judgement: "回望、醒来，或者某个声音再次召唤你",
    world: "完成、整合、抵达，或者一个阶段终于形成了形状"
  };
  return extra[card.id] || base;
}

function openingMeaningEn(card?: ReturnType<typeof findDeckCard>) {
  if (!card) return "a random visual direction";
  const base = card.keywordsEn.slice(0, 3).join(", ");
  const extra: Record<string, string> = {
    world: "completion, integration, arrival, or a stage finally taking shape",
    moon: "uncertainty, projection, dreams, or something not yet clearly seen",
    star: "repair, hope, openness, or a small light returning",
    fool: "beginning, risk, freedom, or a step not yet defined"
  };
  return extra[card.id] || base;
}

function openingSymbolNounZh(symbolLabel: string, symbolMeaning: string) {
  return /移动|动作|舞者|脚|手|movement|dancer|hand|foot/i.test(`${symbolLabel} ${symbolMeaning}`) ? "动作" : "符号";
}

function openingSymbolNounEn(symbolLabel: string, symbolMeaning: string) {
  return /movement|dancer|hand|foot/i.test(`${symbolLabel} ${symbolMeaning}`) ? "movement" : "symbol";
}

function openingConcreteConnectionZh(symbolLabel: string, symbolMeaning: string, question = "") {
  const text = `${symbolLabel} ${symbolMeaning} ${question}`;
  if (/太阳|温暖|光|清楚|看见|sun|warm|light|seen/i.test(text) && /累|疲惫|没力气|困|tired|exhausted/i.test(text)) {
    return "你说的累，靠近的是缺少休息，还是缺少一点能让身体松下来的温暖？";
  }
  if (/太阳|温暖|光|清楚|看见|sun|warm|light|seen/i.test(text)) return "这个温暖是在靠近你，还是你已经很久没有被它照到？";
  if (/移动|动作|舞者|movement|dancer/i.test(text)) return "你是真的在向前移动，还是只是被某种节奏推着走？";
  if (/水|倒|流|脆弱|照顾|柔软|water|pour|soft|care/i.test(text)) return "这里是在流失力气，还是在提醒你有一部分需要被照顾？";
  if (/悬崖|风险|未知|门槛|开始|cliff|risk|unknown|threshold/i.test(text)) return "你害怕的是迈出去本身，还是迈出去之后不能再假装还没开始？";
  if (/规则|控制|压力|自律|王冠|柱子|control|rule|pressure|crown|pillar/i.test(text)) return "现在卡住你的，是外面的要求，还是你已经放进身体里的标准？";
  if (/人|人物|关系|狗|陪伴|孤独|选择|figure|person|dog|relationship|choice/i.test(text)) return "这个问题里最先被牵动的，是一个人、一段关系，还是一个选择？";
  return `这个「${symbolMeaning}」是在靠近你的问题，还是在和它保持一点距离？`;
}

function openingConcreteConnectionEn(symbolLabel: string, symbolMeaning: string, question = "") {
  const text = `${symbolLabel} ${symbolMeaning} ${question}`;
  if (/sun|warm|light|seen|clear/i.test(text) && /tired|exhausted|weary|drained/i.test(text)) {
    return "when you say you are tired, is the missing thing rest, or a kind of warmth that lets your body loosen?";
  }
  if (/sun|warm|light|seen|clear/i.test(text)) return "is this warmth coming toward you, or has it been missing for a while?";
  if (/movement|dancer/i.test(text)) return "are you truly moving forward, or being carried by a rhythm you did not choose?";
  if (/water|pour|soft|care|vulnerable/i.test(text)) return "is energy leaking out here, or is one part of you asking to be cared for?";
  if (/cliff|risk|unknown|threshold|begin/i.test(text)) return "are you afraid of stepping out, or of no longer being able to pretend you have not begun?";
  if (/control|rule|pressure|crown|pillar|discipline/i.test(text)) return "is the stuck point an outside demand, or a standard you have already taken into yourself?";
  if (/figure|person|dog|relationship|choice|alone/i.test(text)) return "is the question first pulling on a person, a relationship, or a choice?";
  return `is "${symbolMeaning}" approaching your question, or staying at a distance from it?`;
}

function openingConcreteQuestionZh(symbolLabel: string, symbolMeaning: string, question = "") {
  const text = `${symbolLabel} ${symbolMeaning} ${question}`;
  if (/太阳|温暖|光|清楚|看见|sun|warm|light|seen/i.test(text) && /累|疲惫|没力气|困|tired|exhausted/i.test(text)) {
    return "如果把「累」和「温暖」放在一起，你最近更缺的是睡眠、被照顾，还是一点不用硬撑的空间？";
  }
  if (/太阳|温暖|光|清楚|看见|sun|warm|light|seen/i.test(text)) return "这个「温暖」更像你正在寻找的东西，还是你有点不敢靠近的东西？";
  if (/移动|动作|舞者|movement|dancer/i.test(text)) return "最近有没有一个具体时刻，让你感觉自己“在动”，但又不确定是不是自己选择的？";
  if (/水|倒|流|脆弱|照顾|柔软|water|pour|soft|care/i.test(text)) return "如果只看今天或昨天，什么时候你最明显地感觉到自己的力气在流出去？";
  if (/悬崖|风险|未知|门槛|开始|cliff|risk|unknown|threshold/i.test(text)) return "最近有没有一个很小的决定，让你觉得自己已经站在边上，但还没有迈出去？";
  if (/规则|控制|压力|自律|王冠|柱子|control|rule|pressure|crown|pillar/i.test(text)) return "当你想到这个问题时，脑子里最先出现的那条“必须怎样”的规则是什么？";
  if (/人|人物|关系|狗|陪伴|孤独|选择|figure|person|dog|relationship|choice/i.test(text)) return "这个问题里，最先浮现出来的人或关系是谁？";
  return `如果把「${symbolMeaning}」放进你的问题里，哪一部分最先有反应？`;
}

function openingConcreteQuestionEn(symbolLabel: string, symbolMeaning: string, question = "") {
  const text = `${symbolLabel} ${symbolMeaning} ${question}`;
  if (/sun|warm|light|seen|clear/i.test(text) && /tired|exhausted|weary|drained/i.test(text)) {
    return "If you place tiredness and warmth together, what feels most missing lately: sleep, care, or a space where you do not have to keep holding yourself up?";
  }
  if (/sun|warm|light|seen|clear/i.test(text)) return "Does this warmth feel more like something you are looking for, or something you hesitate to approach?";
  if (/movement|dancer/i.test(text)) return "Was there a recent moment when you felt yourself moving, but were not sure whether you had chosen that movement?";
  if (/water|pour|soft|care|vulnerable/i.test(text)) return "If you only look at today or yesterday, when did you most clearly feel your energy leaking out?";
  if (/cliff|risk|unknown|threshold|begin/i.test(text)) return "Was there one small recent decision where you felt you were already at the edge, but had not stepped out yet?";
  if (/control|rule|pressure|crown|pillar|discipline/i.test(text)) return "When you think about this question, what is the first 'must' or rule that appears?";
  if (/figure|person|dog|relationship|choice|alone/i.test(text)) return "Who or what relationship appears first inside this question?";
  return `If you place "${symbolMeaning}" inside your question, which part reacts first?`;
}
