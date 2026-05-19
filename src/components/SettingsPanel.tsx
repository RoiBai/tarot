import { X } from "lucide-react";
import { t } from "../lib/i18n";
import type { Settings } from "../types";
import ApiKeyPanel from "./ApiKeyPanel";
import LanguageToggle from "./LanguageToggle";

type Props = {
  settings: Settings;
  onChange: (settings: Settings) => void;
  onClose: () => void;
};

export default function SettingsPanel({ settings, onChange, onClose }: Props) {
  const text = t(settings.language);
  return (
    <div className="modal-backdrop">
      <section className="modal settings-panel">
        <div className="modal-title">
          <h2>{String(text.settings)}</h2>
          <button className="icon-action" onClick={onClose} aria-label={String(text.close)}>
            <X size={18} />
          </button>
        </div>

        <div className="settings-grid">
          <label>
            {String(text.language)}
            <LanguageToggle
              language={settings.language}
              onChange={(language) => onChange({ ...settings, language })}
            />
          </label>

          <label>
            {String(text.cameraMode)}
            <select
              value={settings.cameraEnabled ? "on" : "off"}
              onChange={(event) => onChange({ ...settings, cameraEnabled: event.target.value === "on" })}
            >
              <option value="on">{String(text.cameraOn)}</option>
              <option value="off">{String(text.cameraManual)}</option>
            </select>
          </label>

          <label>
            {String(text.layoutPreview)}
            <select
              value={settings.layoutMode}
              onChange={(event) =>
                onChange({
                  ...settings,
                  layoutMode: event.target.value as Settings["layoutMode"]
                })
              }
            >
              <option value="auto">{String(text.autoResponsive)}</option>
              <option value="mobile-preview">{String(text.mobilePreview)}</option>
              <option value="desktop-preview">{String(text.desktopPreview)}</option>
            </select>
          </label>

          <label>
            {String(text.visualIntensity)}
            <select
              value={settings.visualIntensity}
              onChange={(event) =>
                onChange({
                  ...settings,
                  visualIntensity: event.target.value as Settings["visualIntensity"]
                })
              }
            >
              <option value="minimal">{String(text.minimal)}</option>
              <option value="mystical">{String(text.mystical)}</option>
              <option value="full-ritual">{String(text.fullRitual)}</option>
            </select>
          </label>

          <label>
            {String(text.model)}
            <input
              value={settings.model}
              onChange={(event) => onChange({ ...settings, model: event.target.value })}
              placeholder="gpt-4.1-mini"
            />
          </label>

          <label>
            {String(text.baseUrl)}
            <input
              value={settings.baseUrl}
              onChange={(event) => onChange({ ...settings, baseUrl: event.target.value })}
              placeholder="https://api.openai.com/v1"
            />
          </label>
        </div>

        <ApiKeyPanel settings={settings} onChange={onChange} />
      </section>
    </div>
  );
}
