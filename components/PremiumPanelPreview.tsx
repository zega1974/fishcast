"use client";

import type React from "react";

type PremiumPanelPreviewProps = {
  onClose?: () => void;
};

type IconProps = {
  className?: string;
};

type DataItem = {
  icon: React.ReactNode;
  label: string;
  value: string;
  detail?: string;
};

export type PreviewIconName =
  | "weather"
  | "pressure"
  | "airTemp"
  | "waterTemp"
  | "moon"
  | "tide"
  | "depth"
  | "anchor"
  | "compass"
  | "map"
  | "satellite"
  | "night"
  | "copy"
  | "clock";

export function PreviewIcon({
  name,
  className = "",
}: {
  name?: PreviewIconName;
  className?: string;
}) {
  if (name === "map") {
    return (
      <svg className={className} viewBox="0 0 64 64" aria-hidden="true">
        <path d="M9 14 24 8l16 6 15-6v42l-15 6-16-6-15 6V14Z" fill="currentColor" />
        <path d="M24 8v42M40 14v42" stroke="rgba(2,8,18,0.42)" strokeWidth="4" />
      </svg>
    );
  }

  if (name === "satellite") {
    return (
      <svg className={className} viewBox="0 0 64 64" aria-hidden="true">
        <path d="M16 38 38 16l10 10-22 22-10-10Z" fill="currentColor" />
        <path d="M8 30 30 8M20 42 42 20M30 52 52 30" stroke="currentColor" strokeWidth="5" />
      </svg>
    );
  }

  if (name === "anchor") {
    return (
      <svg className={className} viewBox="0 0 64 64" aria-hidden="true">
        <circle cx="32" cy="10" r="6" fill="none" stroke="currentColor" strokeWidth="4" />
        <path d="M32 16v38" stroke="currentColor" strokeLinecap="round" strokeWidth="5" />
        <path d="M20 25h24" stroke="currentColor" strokeLinecap="round" strokeWidth="5" />
        <path d="M15 39c2 12 11 18 17 18s15-6 17-18" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="5" />
        <path d="M11 42l5-7 7 5M53 42l-5-7-7 5" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" />
      </svg>
    );
  }

  if (name === "night" || name === "moon") {
    return (
      <svg className={className} viewBox="0 0 64 64" aria-hidden="true">
        <path d="M43 52c-16 1-29-10-29-25 0-9 5-17 13-22-3 15 6 30 23 34-4 6-7 10-7 13Z" fill="currentColor" />
        <path d="M50 39c-6 10-18 14-30 8 11 11 28 9 38-2-3-2-5-4-8-6Z" fill="currentColor" opacity=".55" />
      </svg>
    );
  }

  return (
    <svg className={className} viewBox="0 0 48 48" aria-hidden="true">
      <path d="M10 40V24" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="3" />
      <path d="M22 40V10" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="3" />
      <path d="M34 40V18" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="3" />
      <path d="M6 40h36" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="3" />
    </svg>
  );
}

function SvgBase({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <svg
      className={className}
      viewBox="0 0 48 48"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {children}
    </svg>
  );
}

function CloseIcon(props: IconProps) {
  return (
    <SvgBase {...props}>
      <path d="M12 12l24 24" />
      <path d="M36 12L12 36" />
    </SvgBase>
  );
}

function PinIcon(props: IconProps) {
  return (
    <SvgBase {...props}>
      <path d="M24 43s14-12.5 14-25A14 14 0 1 0 10 18c0 12.5 14 25 14 25Z" />
      <circle cx="24" cy="18" r="5" />
    </SvgBase>
  );
}

function CopyIcon(props: IconProps) {
  return (
    <SvgBase {...props}>
      <rect x="17" y="12" width="19" height="25" rx="3" />
      <path d="M12 30V16a4 4 0 0 1 4-4h12" />
    </SvgBase>
  );
}

function ThermometerIcon(props: IconProps) {
  return (
    <SvgBase {...props}>
      <path d="M24 6v24" />
      <path d="M18 30.5V12a6 6 0 0 1 12 0v18.5a10 10 0 1 1-12 0Z" />
      <path d="M24 31V17" />
    </SvgBase>
  );
}

function WaterThermometerIcon(props: IconProps) {
  return (
    <SvgBase {...props}>
      <path d="M24 6v21" />
      <path d="M18 28V12a6 6 0 0 1 12 0v16a9 9 0 1 1-12 0Z" />
      <path d="M11 39c4 3 8 3 12 0s8-3 12 0" />
      <path d="M11 44c4 3 8 3 12 0s8-3 12 0" />
    </SvgBase>
  );
}

function TideIcon(props: IconProps) {
  return (
    <SvgBase {...props}>
      <path d="M6 18c5 4 10 4 15 0s10-4 15 0 6 3 6 3" />
      <path d="M6 28c5 4 10 4 15 0s10-4 15 0 6 3 6 3" />
      <path d="M6 38c5 4 10 4 15 0s10-4 15 0 6 3 6 3" />
    </SvgBase>
  );
}

function WindIcon(props: IconProps) {
  return (
    <SvgBase {...props}>
      <path d="M5 18h26a6 6 0 1 0-6-6" />
      <path d="M5 27h34" />
      <path d="M5 36h24a5 5 0 1 1-5 5" />
    </SvgBase>
  );
}

function MoonIcon(props: IconProps) {
  return (
    <svg className={`${props.className || ""} vpMoonIcon`} viewBox="0 0 48 48" aria-hidden="true">
      <path d="M32 6a20 20 0 1 0 10 32A22 22 0 0 1 32 6Z" fill="currentColor" />
    </svg>
  );
}

function SunIcon(props: IconProps) {
  return (
    <SvgBase {...props}>
      <circle cx="24" cy="24" r="8" />
      <path d="M24 4v7" />
      <path d="M24 37v7" />
      <path d="M4 24h7" />
      <path d="M37 24h7" />
      <path d="m10 10 5 5" />
      <path d="m33 33 5 5" />
      <path d="m38 10-5 5" />
      <path d="m15 33-5 5" />
    </SvgBase>
  );
}

function SunriseIcon(props: IconProps) {
  return (
    <SvgBase {...props}>
      <path d="M13 29a11 11 0 0 1 22 0" />
      <path d="M24 9v8" />
      <path d="m10 15 5 5" />
      <path d="m38 15-5 5" />
      <path d="M8 32c5 4 10 4 15 0s10-4 17 0" />
      <path d="M8 39c5 4 10 4 15 0s10-4 17 0" />
    </SvgBase>
  );
}

function DepthIcon(props: IconProps) {
  return (
    <SvgBase {...props}>
      <path d="M24 5v25" />
      <path d="m16 22 8 8 8-8" />
      <path d="M8 38c5 4 10 4 15 0s10-4 17 0" />
      <path d="M8 44c5 4 10 4 15 0s10-4 17 0" />
    </SvgBase>
  );
}

function BottomIcon(props: IconProps) {
  return (
    <svg className={`${props.className || ""} vpBottomIcon`} viewBox="0 0 48 48" aria-hidden="true">
      <circle cx="14" cy="32" r="5" fill="currentColor" />
      <circle cx="26" cy="28" r="7" fill="currentColor" />
      <circle cx="34" cy="36" r="5" fill="currentColor" />
      <circle cx="20" cy="18" r="3" fill="currentColor" />
      <circle cx="33" cy="18" r="4" fill="currentColor" />
    </svg>
  );
}

function ChartIcon(props: IconProps) {
  return (
    <SvgBase {...props}>
      <path d="M10 40V24" />
      <path d="M22 40V10" />
      <path d="M34 40V18" />
      <path d="M6 40h36" />
    </SvgBase>
  );
}

function ChevronIcon(props: IconProps) {
  return (
    <SvgBase {...props}>
      <path d="M18 10l14 14-14 14" />
    </SvgBase>
  );
}

function CardShell({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={`vpOfficialCard ${className}`}>{children}</div>;
}

function ScoreGauge() {
  return (
    <div className="vpOfficialScoreGauge">
      <svg viewBox="0 0 340 205" aria-label="VouPescar Score 82 Excelente">
        <path
          d="M 52 150 A 118 118 0 0 1 288 150"
          fill="none"
          stroke="rgba(120, 132, 148, 0.42)"
          strokeWidth="11"
          strokeLinecap="round"
        />
        <path
          d="M 52 150 A 118 118 0 0 1 288 150"
          fill="none"
          stroke="rgba(255, 255, 255, 0.96)"
          strokeWidth="11"
          strokeLinecap="round"
          pathLength="100"
          strokeDasharray="82 100"
        />
        <g fill="none" stroke="rgba(255, 255, 255, 0.5)" strokeWidth="2" strokeLinecap="round">
          <path d="M52 150h16" />
          <path d="M170 36v16" />
          <path d="M272 150h16" />
          <path d="M79 98l13 8" />
          <path d="M122 62l7 13" />
          <path d="M218 62l-7 13" />
          <path d="M261 98l-13 8" />
        </g>
        <text x="52" y="177" fill="rgba(255,255,255,.78)" fontSize="15" fontWeight="500">
          0
        </text>
        <text x="170" y="27" textAnchor="middle" fill="rgba(255,255,255,.78)" fontSize="15" fontWeight="500">
          50
        </text>
        <text x="288" y="177" textAnchor="end" fill="rgba(255,255,255,.78)" fontSize="15" fontWeight="500">
          100
        </text>
        <line x1="236" y1="88" x2="260" y2="69" stroke="rgba(255,255,255,.9)" strokeWidth="3" strokeLinecap="round" />
        <circle cx="236" cy="88" r="6.5" fill="rgba(255,255,255,.96)" />
        <text x="170" y="128" textAnchor="middle" fill="#fff" fontSize="68" fontWeight="800" letterSpacing="-6">
          82
        </text>
        <text x="170" y="168" textAnchor="middle" fill="rgba(255,255,255,.86)" fontSize="23" fontWeight="560">
          Excelente
        </text>
      </svg>
    </div>
  );
}

function SelectedPointCard() {
  const coords = "-25.823456, -48.536789";

  const copyCoords = async () => {
    try {
      await navigator.clipboard.writeText(coords);
    } catch {
      // preview visual
    }
  };

  return (
    <CardShell className="vpOfficialPlaceBlock">
      <div className="vpOfficialPlaceIcon">
        <PinIcon />
      </div>

      <div className="vpOfficialPlaceText">
        <span>Ponto Selecionado</span>
        <strong>Pontal de Matinhos</strong>
        <small>{coords}</small>
      </div>

      <button className="vpOfficialCopyButton" type="button" onClick={copyCoords}>
        <CopyIcon />
        <span>Copiar</span>
      </button>
    </CardShell>
  );
}

function ScoreCard() {
  return (
    <CardShell className="vpOfficialScoreBlock">
      <h1>VOUPESCAR SCORE</h1>
      <ScoreGauge />
      <p>Baseado em múltiplos dados.</p>
    </CardShell>
  );
}

function BestTimesCard() {
  return (
    <CardShell className="vpOfficialBestTimes">
      <h2>MELHORES HORÁRIOS</h2>

      <div className="vpOfficialTimeGrid">
        <div className="vpOfficialTimeItem">
          <SunriseIcon className="vpOfficialTimeIcon" />
          <strong>14h às 16h</strong>
        </div>

        <div className="vpOfficialDivider" />

        <div className="vpOfficialTimeItem">
          <SunriseIcon className="vpOfficialTimeIcon" />
          <strong>19h às 21h</strong>
        </div>
      </div>
    </CardShell>
  );
}

function DataCard({ item }: { item: DataItem }) {
  return (
    <CardShell className="vpOfficialDataTile">
      <div className="vpOfficialTileIcon">{item.icon}</div>

      <div className="vpOfficialTileText">
        <span>{item.label}</span>
        <strong>{item.value}</strong>
        {item.detail ? <small>{item.detail}</small> : null}
      </div>
    </CardShell>
  );
}

export default function PremiumPanelPreview({ onClose }: PremiumPanelPreviewProps) {
  const data: DataItem[] = [
    { icon: <ThermometerIcon />, label: "Temperatura do Ar", value: "26,0 °C" },
    { icon: <WaterThermometerIcon />, label: "Temperatura da Água", value: "22,4 °C" },
    { icon: <TideIcon />, label: "Maré", value: "Enchendo" },
    { icon: <WindIcon />, label: "Vento", value: "NE • 8 km/h" },
    { icon: <MoonIcon />, label: "Lua", value: "Crescente", detail: "35% iluminada" },
    { icon: <SunIcon />, label: "Clima", value: "Ensolarado" },
    { icon: <DepthIcon />, label: "Profundidade", value: "4,2 m" },
    { icon: <BottomIcon />, label: "Tipo de Fundo", value: "Areia e Pedra" },
  ];

  return (
    <section className="vpOfficialPreview" aria-label="Preview Aba Oficial Gratuita">
      <button className="vpOfficialCloseButton" type="button" aria-label="Fechar" onClick={onClose}>
        <CloseIcon />
      </button>

      <main className="vpOfficialPanelShell">
        <SelectedPointCard />

        <div className="vpOfficialTopGrid">
          <ScoreCard />
          <BestTimesCard />
        </div>

        <section className="vpOfficialDataGrid" aria-label="Dados gratuitos">
          {data.map((item) => (
            <DataCard key={item.label} item={item} />
          ))}
        </section>

        <button className="vpOfficialAdvancedButton" type="button">
          <ChartIcon className="vpOfficialAdvancedIcon" />
          <span>Dados Avançados</span>
          <ChevronIcon className="vpOfficialChevron" />
        </button>
      </main>

      <style jsx global>{`
        .vpOfficialPreview {
          position: fixed;
          inset: 0;
          z-index: 99999;
          width: 100vw;
          height: 100dvh;
          overflow: hidden;
          color: #f8fafc;
          pointer-events: auto;
          background:
            radial-gradient(circle at 50% 8%, rgba(14, 116, 144, 0.17), transparent 34%),
            radial-gradient(circle at 50% 24%, rgba(30, 42, 56, 0.5), transparent 44%),
            repeating-linear-gradient(
              90deg,
              rgba(35, 82, 148, 0.075) 0px,
              rgba(35, 82, 148, 0.075) 1px,
              transparent 1px,
              transparent 56px
            ),
            linear-gradient(180deg, #07101a 0%, #050a0f 100%);
          font-family:
            Inter,
            ui-sans-serif,
            system-ui,
            -apple-system,
            BlinkMacSystemFont,
            "Segoe UI",
            sans-serif;
        }

        .vpOfficialCloseButton {
          position: fixed;
          top: max(14px, env(safe-area-inset-top));
          right: max(16px, env(safe-area-inset-right));
          z-index: 100000;
          width: 44px;
          height: 44px;
          border: 1px solid rgba(255, 255, 255, 0.13);
          border-radius: 16px;
          background: rgba(255, 255, 255, 0.035);
          color: rgba(255, 255, 255, 0.9);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.28);
          backdrop-filter: blur(12px);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }

        .vpOfficialCloseButton svg {
          width: 25px;
          height: 25px;
        }

        .vpOfficialPanelShell {
          width: min(100vw, 460px);
          height: 100dvh;
          margin: 0 auto;
          padding: max(10px, env(safe-area-inset-top)) 12px max(10px, env(safe-area-inset-bottom));
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
          gap: 7px;
        }

        .vpOfficialCard,
        .vpOfficialAdvancedButton {
          background: linear-gradient(135deg, rgba(23, 31, 42, 0.88), rgba(10, 16, 23, 0.94));
          border: 1px solid rgba(148, 163, 184, 0.2);
          box-shadow:
            inset 0 1px 0 rgba(255, 255, 255, 0.035),
            0 14px 34px rgba(0, 0, 0, 0.18);
          backdrop-filter: blur(14px);
        }

        .vpOfficialPlaceBlock {
          flex: 0 0 auto;
          border-radius: 18px;
          min-height: 64px;
          display: grid;
          grid-template-columns: auto minmax(0, 1fr) auto;
          align-items: center;
          gap: 10px;
          padding: 9px 62px 9px 11px;
          box-sizing: border-box;
        }

        .vpOfficialPlaceIcon {
          width: 42px;
          height: 42px;
          border-radius: 999px;
          color: #38bdf8;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(14, 165, 233, 0.12);
          box-shadow: 0 0 22px rgba(14, 165, 233, 0.18);
        }

        .vpOfficialPlaceIcon svg {
          width: 27px;
          height: 27px;
        }

        .vpOfficialPlaceText {
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 1px;
        }

        .vpOfficialPlaceText span {
          color: rgba(226, 232, 240, 0.72);
          font-size: 11px;
          line-height: 1;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          font-weight: 520;
        }

        .vpOfficialPlaceText strong {
          color: #38bdf8;
          font-size: clamp(17px, 4.7vw, 21px);
          line-height: 1.15;
          font-weight: 650;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .vpOfficialPlaceText small {
          color: rgba(226, 232, 240, 0.74);
          font-size: clamp(12px, 3.25vw, 14px);
          line-height: 1.1;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .vpOfficialCopyButton {
          border: 1px solid rgba(56, 189, 248, 0.36);
          border-radius: 11px;
          background: rgba(14, 165, 233, 0.08);
          color: #7dd3fc;
          height: 36px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 0 10px;
          font-size: 13px;
          font-weight: 560;
          cursor: pointer;
        }

        .vpOfficialCopyButton svg {
          width: 17px;
          height: 17px;
        }

        .vpOfficialTopGrid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 7px;
          flex: 0 0 auto;
        }

        .vpOfficialScoreBlock {
          min-height: 168px;
          border-radius: 18px;
          padding: 8px 8px 7px;
          text-align: center;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .vpOfficialScoreBlock h1 {
          margin: 0 0 -4px;
          color: rgba(255, 255, 255, 0.88);
          font-size: clamp(12px, 3.35vw, 15px);
          line-height: 1.05;
          letter-spacing: 0.055em;
          font-weight: 600;
        }

        .vpOfficialScoreBlock p {
          margin: -12px 0 0;
          color: rgba(226, 232, 240, 0.72);
          font-size: clamp(10px, 2.65vw, 12px);
          line-height: 1.05;
        }

        .vpOfficialScoreGauge {
          width: min(41vw, 185px);
          margin: 0 auto;
        }

        .vpOfficialScoreGauge svg {
          width: 100%;
          height: auto;
          display: block;
          overflow: visible;
        }

        .vpOfficialBestTimes {
          min-height: 168px;
          border-radius: 18px;
          padding: 10px 8px;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .vpOfficialBestTimes h2 {
          margin: 0 0 12px;
          text-align: center;
          color: rgba(226, 232, 240, 0.74);
          font-size: clamp(11px, 3vw, 13px);
          line-height: 1;
          font-weight: 600;
          letter-spacing: 0.055em;
        }

        .vpOfficialTimeGrid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 12px;
        }

        .vpOfficialTimeItem {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          min-width: 0;
        }

        .vpOfficialTimeItem strong {
          color: #ffffff;
          font-size: clamp(13px, 3.75vw, 16px);
          line-height: 1;
          font-weight: 650;
          white-space: nowrap;
        }

        .vpOfficialTimeIcon {
          width: clamp(28px, 7.8vw, 36px);
          height: clamp(28px, 7.8vw, 36px);
          color: #7dd3fc;
          flex: 0 0 auto;
        }

        .vpOfficialDivider {
          display: none;
        }

        .vpOfficialDataGrid {
          flex: 1 1 auto;
          min-height: 0;
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          grid-template-rows: repeat(4, minmax(0, 1fr));
          gap: 7px;
        }

        .vpOfficialDataTile {
          min-height: 0;
          border-radius: 16px;
          display: grid;
          grid-template-columns: auto minmax(0, 1fr);
          align-items: center;
          gap: 9px;
          padding: 8px 10px;
          box-sizing: border-box;
        }

        .vpOfficialTileIcon {
          color: #e0f2fe;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .vpOfficialTileIcon svg {
          width: clamp(27px, 7.7vw, 35px);
          height: clamp(27px, 7.7vw, 35px);
          display: block;
        }

        .vpOfficialTileText {
          min-width: 0;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          justify-content: center;
          gap: 2px;
        }

        .vpOfficialTileText span {
          color: rgba(226, 232, 240, 0.72);
          font-size: 11px;
          line-height: 1.05;
          font-weight: 620;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .vpOfficialTileText strong {
          color: #ffffff;
          font-size: clamp(20px, 4.9vw, 24px);
          line-height: 1.08;
          font-weight: 680;
          letter-spacing: -0.02em;
        }

        .vpOfficialTileText small {
          color: rgba(226, 232, 240, 0.68);
          font-size: 12px;
          line-height: 1.2;
          font-weight: 400;
        }

        .vpOfficialAdvancedButton {
          flex: 0 0 auto;
          width: 100%;
          min-height: 54px;
          border-radius: 16px;
          color: #ffffff;
          display: grid;
          grid-template-columns: auto 1fr auto;
          align-items: center;
          gap: 12px;
          padding: 0 15px;
          text-align: left;
          cursor: pointer;
        }

        .vpOfficialAdvancedIcon {
          width: 29px;
          height: 29px;
          color: #7dd3fc;
        }

        .vpOfficialAdvancedButton span {
          font-size: clamp(17px, 4.6vw, 21px);
          font-weight: 620;
          letter-spacing: 0.01em;
        }

        .vpOfficialChevron {
          width: 28px;
          height: 28px;
          color: rgba(255, 255, 255, 0.78);
        }

        .vpOfficialPlaceIcon svg,
        .vpOfficialCopyButton svg,
        .vpOfficialTileIcon svg,
        .vpOfficialTimeIcon,
        .vpOfficialAdvancedIcon,
        .vpOfficialChevron,
        .vpOfficialCloseButton svg,
        .vpOfficialPreviewMiniIcon svg {
          fill: none;
          stroke: currentColor;
          stroke-width: 3;
          stroke-linecap: round;
          stroke-linejoin: round;
        }

        .vpOfficialTileIcon .vpMoonIcon,
        .vpOfficialTileIcon .vpBottomIcon {
          fill: currentColor;
          stroke: none;
        }

        .vpOfficialPreviewMiniIcon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 28px;
          height: 28px;
          border-radius: 10px;
          background: rgba(14, 165, 233, 0.12);
          color: #7dd3fc;
        }

        .vpOfficialPreviewMiniIcon svg {
          width: 18px;
          height: 18px;
        }

        @media (max-width: 390px) {
          .vpOfficialPanelShell {
            gap: 6px;
            padding-left: 10px;
            padding-right: 10px;
          }

          .vpOfficialPlaceBlock {
            min-height: 58px;
            padding: 7px 54px 7px 9px;
          }

          .vpOfficialPlaceIcon {
            width: 36px;
            height: 36px;
          }

          .vpOfficialPlaceIcon svg {
            width: 23px;
            height: 23px;
          }

          .vpOfficialCopyButton {
            width: 34px;
            padding: 0;
          }

          .vpOfficialCopyButton span {
            display: none;
          }

          .vpOfficialScoreBlock,
          .vpOfficialBestTimes {
            min-height: 150px;
          }

          .vpOfficialScoreGauge {
            width: min(39vw, 165px);
          }

          .vpOfficialDataGrid {
            gap: 6px;
          }

          .vpOfficialDataTile {
            padding: 7px 8px;
          }

          .vpOfficialTileText strong {
            font-size: 18px;
          }

          .vpOfficialAdvancedButton {
            min-height: 50px;
          }
        }

        @media (min-width: 768px) {
          .vpOfficialPreview {
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 24px;
            box-sizing: border-box;
            background:
              radial-gradient(circle at 50% 12%, rgba(14, 165, 233, 0.12), transparent 38%),
              radial-gradient(circle at 50% 50%, rgba(15, 23, 42, 0.2), transparent 58%),
              rgba(2, 8, 15, 0.58);
            backdrop-filter: blur(2px);
          }

          .vpOfficialCloseButton {
            position: absolute;
            top: max(24px, calc(50% - 410px));
            left: calc(50% + min(43vw, 460px) + 12px);
            right: auto;
          }

          .vpOfficialPanelShell {
            width: min(86vw, 920px);
            height: auto;
            max-height: min(92dvh, 820px);
            padding: 14px;
            display: grid;
            grid-template-columns: 1fr 1fr;
            grid-template-rows: auto auto auto auto;
            gap: 16px;
            background: rgba(3, 10, 18, 0.82);
            border: 1px solid rgba(148, 163, 184, 0.14);
            border-radius: 28px;
            box-shadow: 0 24px 80px rgba(0, 0, 0, 0.34);
            backdrop-filter: blur(6px);
          }

          .vpOfficialCard,
          .vpOfficialAdvancedButton {
            background: rgba(10, 18, 30, 0.82);
            border: 1px solid rgba(148, 163, 184, 0.18);
          }

          .vpOfficialPlaceBlock {
            grid-column: 1 / -1;
            min-height: 78px;
            padding: 14px 18px;
          }

          .vpOfficialTopGrid {
            grid-column: 1 / -1;
            grid-template-columns: 1fr 1fr;
            gap: 16px;
          }

          .vpOfficialScoreBlock,
          .vpOfficialBestTimes {
            min-height: 220px;
          }

          .vpOfficialScoreBlock h1 {
            font-size: 18px;
          }

          .vpOfficialScoreGauge {
            width: 280px;
          }

          .vpOfficialScoreBlock p {
            font-size: 13px;
          }

          .vpOfficialBestTimes h2 {
            font-size: 14px;
          }

          .vpOfficialTimeGrid {
            grid-template-columns: 1fr auto 1fr;
            align-items: center;
            gap: 0;
          }

          .vpOfficialDivider {
            display: block;
            width: 1px;
            height: 58px;
            background: rgba(148, 163, 184, 0.24);
          }

          .vpOfficialTimeItem strong {
            font-size: 20px;
          }

          .vpOfficialTimeIcon {
            width: 42px;
            height: 42px;
          }

          .vpOfficialDataGrid {
            grid-column: 1 / -1;
            grid-template-columns: repeat(4, minmax(0, 1fr));
            grid-template-rows: repeat(2, 126px);
            gap: 14px;
          }

          .vpOfficialDataTile {
            border-radius: 18px;
            padding: 14px;
          }

          .vpOfficialTileIcon svg {
            width: 32px;
            height: 32px;
          }

          .vpOfficialTileText span {
            font-size: 12px;
          }

          .vpOfficialTileText strong {
            font-size: 20px;
          }

          .vpOfficialAdvancedButton {
            grid-column: 1 / -1;
            min-height: 62px;
            border-radius: 18px;
          }

          .vpOfficialAdvancedButton span {
            font-size: 20px;
          }
        }
      `}</style>
    </section>
  );
}
