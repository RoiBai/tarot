import type { Settings } from "../types";

type Props = {
  settings: Settings;
  children: React.ReactNode;
};

export default function LayoutShell({ settings, children }: Props) {
  return (
    <main
      className={[
        "app-shell",
        `layout-${settings.layoutMode}`,
        `intensity-${settings.visualIntensity}`
      ].join(" ")}
    >
      <div className="star-field" />
      <div className="moon-phases" aria-hidden="true">
        <span />
        <span />
        <span />
        <span />
        <span />
      </div>
      <section className="app-content">{children}</section>
      <footer className="demo-footer">
        <span>v0.2 Spread Demo</span>
        <span>
          {settings.language === "zh"
            ? "研究 Demo · 非占卜预测 · 仅用于反思体验"
            : "Research demo · Not fortune-telling · Reflective use only"}
        </span>
      </footer>
    </main>
  );
}
