import { useEffect, useMemo, useState } from "react";
import LandingPage from "./components/LandingPage";
import LanguageToggle from "./components/LanguageToggle";
import LayoutShell from "./components/LayoutShell";
import PositionFocusPage from "./components/PositionFocusPage";
import QuestionInputPage from "./components/QuestionInputPage";
import ReflectiveChat from "./components/ReflectiveChat";
import SavedChatsPanel from "./components/SavedChatsPanel";
import SettingsPanel from "./components/SettingsPanel";
import SpreadBoardPage from "./components/SpreadBoardPage";
import SpreadSelectionPage from "./components/SpreadSelectionPage";
import SpreadSummaryPage from "./components/SpreadSummaryPage";
import { t } from "./lib/i18n";
import { celticCrossSpread, createPositionReadings, getSpread, recommendSimpleSpread } from "./lib/spreads";
import { deleteThread, loadSettings, loadThreads, saveSettings, upsertThread } from "./lib/storage";
import { createId, nowIso, titleFromQuestion } from "./lib/utils";
import type { ChatThread, PositionReading, Settings, SpreadId, TarotSpread } from "./types";

type View = "landing" | "question" | "spreadSelection" | "board" | "focus" | "summary" | "legacyChat";

export default function App() {
  const [settings, setSettings] = useState<Settings>(() => loadSettings());
  const [view, setView] = useState<View>("landing");
  const [thread, setThread] = useState<ChatThread | null>(null);
  const [threads, setThreads] = useState<ChatThread[]>(() => loadThreads());
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [archiveOpen, setArchiveOpen] = useState(false);
  const [draftQuestion, setDraftQuestion] = useState("");
  const [recommendedSpreadId, setRecommendedSpreadId] = useState<SpreadId>("one-card-deep-dive");
  const [focusPositionId, setFocusPositionId] = useState("");
  const text = useMemo(() => t(settings.language), [settings.language]);

  useEffect(() => {
    saveSettings(settings);
    document.documentElement.lang = settings.language === "zh" ? "zh-CN" : "en";
  }, [settings]);

  const activeSpread = thread?.spreadId ? getSpread(thread.spreadId) : null;

  function persistThread(next: ChatThread) {
    const stamped = { ...next, updatedAt: next.updatedAt || nowIso() };
    setThread(stamped);
    setThreads(upsertThread(stamped));
  }

  function beginQuestion(question: string) {
    setDraftQuestion(question);
    setRecommendedSpreadId(recommendSimpleSpread(question));
    setView("spreadSelection");
  }

  function createSpreadThread(question: string, spread: TarotSpread, choices?: { choiceA?: string; choiceB?: string }) {
    const timestamp = nowIso();
    const readings = createPositionReadings(spread);
    const next: ChatThread = {
      id: createId("thread"),
      title: titleFromQuestion(question),
      originalQuestion: question,
      currentQuestion: question,
      currentStage: "scene",
      questionHistory: [],
      operatingRules: [],
      createdAt: timestamp,
      updatedAt: timestamp,
      language: settings.language,
      spreadCards: [],
      wordAnchors: [],
      conceptAnchors: [],
      randomnessReflections: [],
      usedGroundingEntryTypes: [],
      askedQuestionIntents: [],
      messages: [],
      endedForNow: false,
      spreadId: spread.id,
      spreadName: settings.language === "zh" ? spread.nameZh : spread.nameEn,
      spreadPositions: readings,
      currentPositionIndex: 0,
      choiceA: choices?.choiceA?.trim(),
      choiceB: choices?.choiceB?.trim()
    };
    persistThread(next);
    setFocusPositionId("");
    setView("board");
  }

  function reopenThread(saved: ChatThread) {
    setThread(saved);
    setSettings((current) => ({ ...current, language: saved.language || current.language }));
    setArchiveOpen(false);
    setFocusPositionId("");
    setView(saved.spreadPositions?.length ? "board" : "legacyChat");
  }

  function removeThread(id: string) {
    const next = deleteThread(id);
    setThreads(next);
    if (thread?.id === id) {
      setThread(null);
      setView("landing");
    }
  }

  function patchThread(next: ChatThread) {
    persistThread({ ...next, updatedAt: nowIso() });
  }

  function updateReading(nextReading: PositionReading) {
    if (!thread?.spreadPositions) return;
    const spreadPositions = thread.spreadPositions.map((reading) =>
      reading.positionId === nextReading.positionId ? nextReading : reading
    );
    const activeIndex = spreadPositions.findIndex((reading) => reading.status === "active");
    patchThread({ ...thread, spreadPositions, currentPositionIndex: activeIndex >= 0 ? activeIndex : spreadPositions.length });
  }

  function advanceReading(nextReading: PositionReading) {
    if (!thread?.spreadPositions) return;
    const currentOrder = nextReading.positionOrder;
    let spreadPositions = thread.spreadPositions.map((reading) =>
      reading.positionId === nextReading.positionId ? nextReading : reading
    );
    const nextIndex = spreadPositions.findIndex((reading) => reading.positionOrder > currentOrder && reading.status === "empty");
    if (nextIndex >= 0) {
      spreadPositions = spreadPositions.map((reading, index) =>
        index === nextIndex ? { ...reading, status: "active" } : reading
      );
    }
    patchThread({
      ...thread,
      spreadPositions,
      currentPositionIndex: nextIndex >= 0 ? nextIndex : spreadPositions.length
    });
    setFocusPositionId("");
    setView("board");
  }

  function returnHome() {
    setThread(null);
    setFocusPositionId("");
    setView("landing");
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
          onStart={() => setView("question")}
          onOpenArchive={() => setArchiveOpen(true)}
          onOpenSettings={() => setSettingsOpen(true)}
        />
      )}

      {view === "question" && (
        <QuestionInputPage
          language={settings.language}
          onBack={() => setView("landing")}
          onSubmit={beginQuestion}
        />
      )}

      {view === "spreadSelection" && draftQuestion && (
        <SpreadSelectionPage
          language={settings.language}
          question={draftQuestion}
          recommendedSpread={getSpread(recommendedSpreadId)}
          celticSpread={celticCrossSpread}
          onBack={() => setView("question")}
          onChoose={(spread, choices) => createSpreadThread(draftQuestion, spread, choices)}
        />
      )}

      {view === "board" && thread && activeSpread && (
        <SpreadBoardPage
          language={settings.language}
          thread={thread}
          spread={activeSpread}
          onOpenPosition={(positionId) => {
            setFocusPositionId(positionId);
            setView("focus");
          }}
          onSummary={() => setView("summary")}
          onReturnHome={returnHome}
        />
      )}

      {view === "focus" && thread && activeSpread && focusPositionId && (
        <PositionFocusPage
          language={settings.language}
          settings={settings}
          thread={thread}
          spread={activeSpread}
          positionId={focusPositionId}
          onReadingChange={updateReading}
          onCompleteReading={advanceReading}
          onSkipReading={(reading) => advanceReading({ ...reading, status: "skipped" })}
          onBackToBoard={() => setView("board")}
          onReturnHome={returnHome}
        />
      )}

      {view === "summary" && thread && activeSpread && (
        <SpreadSummaryPage
          language={settings.language}
          settings={settings}
          thread={thread}
          spread={activeSpread}
          onThreadChange={patchThread}
          onBackToBoard={() => setView("board")}
          onReturnHome={returnHome}
        />
      )}

      {view === "legacyChat" && thread && (
        <ReflectiveChat
          settings={settings}
          thread={thread}
          onThreadChange={persistThread}
          onOpenSettings={() => setSettingsOpen(true)}
          onOpenArchive={() => setArchiveOpen(true)}
          onReturnHome={returnHome}
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
