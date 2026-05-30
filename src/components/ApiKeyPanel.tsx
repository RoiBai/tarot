import { CheckCircle, Eye, EyeOff, KeyRound, Trash2 } from "lucide-react";
import { useState } from "react";
import { generateRealAIResponse } from "../lib/apiClient";
import { t } from "../lib/i18n";
import { clearRuntimeApiKey, getEffectiveApiKey, getFreeTrialProxyUrl, getRuntimeApiKey, hasEnvApiKey, maskApiKey, saveRuntimeApiKey } from "../lib/storage";
import type { Settings } from "../types";

type Props = {
  settings: Settings;
  onChange: (settings: Settings) => void;
};

export default function ApiKeyPanel({ settings, onChange }: Props) {
  const text = t(settings.language);
  const [key, setKey] = useState("");
  const [show, setShow] = useState(false);
  const [status, setStatus] = useState("");
  const [savedMask, setSavedMask] = useState(() => maskApiKey(getRuntimeApiKey()));
  const [testing, setTesting] = useState(false);
  const envKeyAvailable = hasEnvApiKey();
  const freeTrialAvailable = Boolean(getFreeTrialProxyUrl());
  const warning =
    settings.language === "zh"
      ? "公开部署时请不要使用共享或生产 API key。Demo 阶段 key 只会保存在当前浏览器中。"
      : "For public deployment, do not use a shared production API key. This demo stores the key only in this browser.";

  function saveKey() {
    const trimmed = key.trim();
    if (!trimmed) return;
    saveRuntimeApiKey(trimmed, settings.apiKeyStorage);
    const masked = maskApiKey(trimmed);
    setSavedMask(masked);
    setKey("");
    setShow(false);
    setStatus(`${String(text.runtimeKeySaved)} ${masked}`);
  }

  function clearKey() {
    clearRuntimeApiKey();
    setKey("");
    setSavedMask("");
    setStatus(String(text.runtimeKeyCleared));
  }

  async function testConnection() {
    setTesting(true);
    setStatus("");
    try {
      await generateRealAIResponse({
        apiKey: key.trim() || getEffectiveApiKey(),
        baseUrl: settings.baseUrl,
        model: settings.model,
        language: settings.language,
        originalQuestion: "Connection test",
        currentQuestion: "Connection test",
        currentStage: "scene",
        questionHistory: [],
        operatingRules: [],
        currentCard: "The Star",
        spreadCards: [
          {
            id: "connection-test-card",
            order: 1,
            cardName: "The Star",
            role: "First Lens",
            drawnAt: new Date().toISOString(),
            isActive: true,
            userTurnCount: 0,
            aiQuestionCount: 0
          }
        ],
        chatHistory: [],
        eventType: "follow-up",
        latestUserMessage: "Please answer with one short sentence."
      });
      setStatus(String(text.connectionOk));
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Connection failed.");
    } finally {
      setTesting(false);
    }
  }

  return (
    <section className="api-panel">
      <h3>
        <KeyRound size={18} />
        {String(text.apiSettings)}
      </h3>
      <p className="api-warning">{warning}</p>
      {freeTrialAvailable && !savedMask && !envKeyAvailable && (
        <p className="notice">
          {settings.language === "zh"
            ? "没有自己的 key 也可以先免费体验一次。用完后，可以联系我获取 key/token。"
            : "You can try one free reading without your own key. After that, contact me for a key/token."}
        </p>
      )}
      {envKeyAvailable && (
        <p className="notice">
          {settings.language === "zh"
            ? "检测到 .env.local 中的 API key，本地测试会自动使用它。"
            : "An API key was found in .env.local and will be used for local testing."}
        </p>
      )}
      {savedMask && (
        <p className="subtle">
          {settings.language === "zh" ? "当前浏览器已保存 key：" : "Saved browser key:"} {savedMask}
        </p>
      )}
      <label>
        {String(text.apiKey)}
        <div className="key-row">
          <input
            type={show ? "text" : "password"}
            value={key}
            autoComplete="off"
            onChange={(event) => setKey(event.target.value)}
          />
          <button className="icon-action" onClick={() => setShow((value) => !value)} aria-label={show ? String(text.hideKey) : String(text.showKey)}>
            {show ? <EyeOff size={17} /> : <Eye size={17} />}
          </button>
        </div>
      </label>
      <div className="segmented full">
        <button
          className={settings.apiKeyStorage === "local" ? "active" : ""}
          onClick={() => onChange({ ...settings, apiKeyStorage: "local" })}
        >
          {String(text.saveKeyLocal)}
        </button>
        <button
          className={settings.apiKeyStorage === "session" ? "active" : ""}
          onClick={() => onChange({ ...settings, apiKeyStorage: "session" })}
        >
          {String(text.sessionKey)}
        </button>
      </div>
      <div className="button-row">
        <button className="ghost-action" onClick={saveKey} disabled={!key.trim()}>
          <CheckCircle size={16} />
          {String(text.saveKey)}
        </button>
        <button className="ghost-action" onClick={clearKey}>
          <Trash2 size={16} />
          {String(text.clearKey)}
        </button>
        <button className="primary-action" onClick={testConnection} disabled={testing}>
          {String(text.testConnection)}
        </button>
      </div>
      {status && <p className="notice">{status}</p>}
    </section>
  );
}
