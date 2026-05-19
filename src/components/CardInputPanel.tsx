import { Camera, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { t } from "../lib/i18n";
import type { Language } from "../types";
import CameraPanel from "./CameraPanel";
import ManualCardSelector from "./ManualCardSelector";

type Props = {
  language: Language;
  cameraEnabled: boolean;
  open: boolean;
  onOpen: () => void;
  onCardSelected: (cardName: string) => void;
};

export default function CardInputPanel({ language, cameraEnabled, open, onOpen, onCardSelected }: Props) {
  const text = t(language);
  const [mode, setMode] = useState<"camera" | "manual">(cameraEnabled ? "camera" : "manual");

  if (!open) {
    return (
      <button className="card-input-collapsed" onClick={onOpen}>
        <ChevronDown size={18} />
        {String(text.recognizeEnter)}
      </button>
    );
  }

  return (
    <div className="card-input-panel tarot-panel">
      <div className="panel-heading">
        <Camera size={18} />
        <h3>{String(text.recognizeEnter)}</h3>
        <ChevronUp size={18} />
      </div>
      <div className="segmented full">
        <button className={mode === "camera" ? "active" : ""} onClick={() => setMode("camera")}>
          {String(text.enableCamera)}
        </button>
        <button className={mode === "manual" ? "active" : ""} onClick={() => setMode("manual")}>
          {String(text.manualCard)}
        </button>
      </div>
      {mode === "camera" ? (
        <>
          <CameraPanel language={language} />
          <ManualCardSelector language={language} onCardSelected={onCardSelected} />
        </>
      ) : (
        <>
          <p className="subtle">{String(text.cameraOff)}</p>
          <ManualCardSelector language={language} onCardSelected={onCardSelected} />
        </>
      )}
    </div>
  );
}
