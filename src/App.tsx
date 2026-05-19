import { useEffect, useMemo, useState } from "react";
import LandingPage from "./components/LandingPage";
import QuestionSetup from "./components/QuestionSetup";
import ReflectiveChat from "./components/ReflectiveChat";
import LayoutShell from "./components/LayoutShell";
import SettingsPanel from "./components/SettingsPanel";
import SavedChatsPanel from "./components/SavedChatsPanel";
import LanguageToggle from "./components/LanguageToggle";
import { t } from "./lib/i18n";
import {
  deleteThread,
  loadSettings,
  loadThreads,
  saveSettings,
  upsertThread
} from "./lib/storage";
import { createId, nowIso, titleFromQuestion } from "./lib/utils";
import type { ChatMessage, ChatThread, Settings } from "./types";

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

  function beginThread(question: string) {
    const timestamp = nowIso();
    const firstAssistant: ChatMessage = {
      id: createId("msg"),
      role: "assistant",
      content: String(text.firstAssistant),
      timestamp
    };
    const next: ChatThread = {
      id: createId("thread"),
      title: titleFromQuestion(question),
      originalQuestion: question,
      currentQuestion: question,
      questionHistory: [],
      createdAt: timestamp,
      updatedAt: timestamp,
      language: settings.language,
      spreadCards: [],
      wordAnchors: [],
      askedQuestionIntents: [],
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
        <LanguageToggle
          language={settings.language}
          onChange={(language) => setSettings((current) => ({ ...current, language }))}
        />
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

      {settingsOpen && (
        <SettingsPanel
          settings={settings}
          onChange={setSettings}
          onClose={() => setSettingsOpen(false)}
        />
      )}

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
