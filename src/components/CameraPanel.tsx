import { Camera, CameraOff } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { t } from "../lib/i18n";
import type { Language } from "../types";

type Props = {
  language: Language;
};

export default function CameraPanel({ language }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [enabled, setEnabled] = useState(false);
  const [error, setError] = useState("");
  const text = t(language);

  useEffect(() => {
    let stream: MediaStream | null = null;
    if (enabled) {
      navigator.mediaDevices
        ?.getUserMedia({ video: { facingMode: "environment" }, audio: false })
        .then((mediaStream) => {
          stream = mediaStream;
          if (videoRef.current) videoRef.current.srcObject = mediaStream;
        })
        .catch(() => {
          setError(
            language === "zh"
              ? "摄像头无法使用。你仍然可以手动输入牌面。"
              : "Camera is unavailable. You can still enter the card manually."
          );
          setEnabled(false);
        });
    }
    return () => {
      stream?.getTracks().forEach((track) => track.stop());
    };
  }, [enabled, language]);

  return (
    <div className="camera-altar">
      {enabled ? (
        <video ref={videoRef} autoPlay playsInline muted />
      ) : (
        <div className="camera-placeholder">
          <CameraOff size={36} />
        </div>
      )}
      <div className="camera-overlay">{String(text.cameraInstruction)}</div>
      <button className="ghost-action" onClick={() => setEnabled((value) => !value)}>
        <Camera size={16} />
        {enabled ? String(text.disableCamera) : String(text.enableCamera)}
      </button>
      {error && <p className="error-text">{error}</p>}
    </div>
  );
}
