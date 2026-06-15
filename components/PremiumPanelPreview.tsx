"use client";

import type React from "react";

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

type PremiumPanelPreviewProps = {
  onClose?: () => void;
  onBack?: () => void;
  placeName?: string;
  lat?: number;
  lng?: number;
  coordinatesText?: string;
};

type IconProps = {
  className?: string;
};

type AdvancedMetric = {
  icon: React.ReactNode;
  label: string;
  value: string;
  detail?: string;
};

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

function BackIcon(props: IconProps) {
  return (
    <SvgBase {...props}>
      <path d="M29 12 17 24l12 12" />
      <path d="M18 24h20" />
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

function PressureIcon(props: IconProps) {
  return (
    <SvgBase {...props}>
      <circle cx="24" cy="24" r="16" />
      <path d="M24 24l8-8" />
      <path d="M15 33h18" />
    </SvgBase>
  );
}

function RainIcon(props: IconProps) {
  return (
    <SvgBase {...props}>
      <path d="M15 22a9 9 0 0 1 17-5 7 7 0 0 1 2 14H15a7 7 0 0 1 0-14" />
      <path d="M17 37l-2 5" />
      <path d="M25 37l-2 5" />
      <path d="M33 37l-2 5" />
    </SvgBase>
  );
}

function WeatherIcon(props: IconProps) {
  return (
    <SvgBase {...props}>
      <circle cx="17" cy="17" r="6" />
      <path d="M17 5v4" />
      <path d="M17 25v4" />
      <path d="M5 17h4" />
      <path d="M25 17h4" />
      <path d="m9 9 3 3" />
      <path d="m25 9-3 3" />
      <path d="M17 33h17a7 7 0 0 0 0-14 9 9 0 0 0-17-2" />
      <path d="M14 33a7 7 0 0 1 0-14" />
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

function WaveIcon(props: IconProps) {
  return (
    <SvgBase {...props}>
      <path d="M6 25c5 4 10 4 15 0s10-4 15 0 6 3 6 3" />
      <path d="M6 35c5 4 10 4 15 0s10-4 15 0 6 3 6 3" />
      <path d="M33 12c-7 0-10 5-10 12" />
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

function SunMoonIcon(props: IconProps) {
  return (
    <SvgBase {...props}>
      <circle cx="17" cy="17" r="6" />
      <path d="M17 4v4" />
      <path d="M17 26v4" />
      <path d="M4 17h4" />
      <path d="M26 17h4" />
      <path d="m8 8 3 3" />
      <path d="m26 8-3 3" />
      <path d="M35 29a10 10 0 1 0 6 12 12 12 0 0 1-6-12Z" />
    </SvgBase>
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
  return <div className={`vpAdvancedCard ${className}`}>{children}</div>;
}

function SelectedPointCard({ placeName }: { placeName: string }) {
  return (
    <CardShell className="vpAdvancedPlaceBlock">
      <div className="vpAdvancedPlaceIcon">
        <PinIcon />
      </div>

      <div className="vpAdvancedPlaceText">
        <span>Ponto Selecionado</span>
        <strong>{placeName}</strong>
      </div>

      <div className="vpAdvancedHeaderScore" aria-label="VouPescar Score 82">
        <span>Score</span>
        <strong>82</strong>
      </div>
    </CardShell>
  );
}

function IntroCard() {
  return (
    <CardShell className="vpAdvancedIntroBlock">
      <div className="vpAdvancedIntroIcon">
        <ChartIcon />
      </div>

      <div className="vpAdvancedIntroText">
        <span>DADOS AVANÇADOS</span>
        <strong>Selecione um dado</strong>
        <small>Toque em um card para abrir o gráfico detalhado.</small>
      </div>
    </CardShell>
  );
}

function MetricButton({ item }: { item: AdvancedMetric }) {
  return (
    <button className="vpAdvancedDataTile" type="button">
      <div className="vpAdvancedTileIcon">{item.icon}</div>

      <div className={`vpAdvancedTileText ${item.label ? "" : "isTitleOnly"}`}>
        {item.label ? <span>{item.label}</span> : null}
        <strong>{item.value}</strong>
        {item.detail ? <small>{item.detail}</small> : null}
      </div>

      <ChevronIcon className="vpAdvancedTileChevron" />
    </button>
  );
}

export default function PremiumPanelPreview({ onClose, onBack, placeName }: PremiumPanelPreviewProps) {
  const selectedPlaceName = placeName?.trim() || "Ponto selecionado";

  const metrics: AdvancedMetric[] = [
    { icon: <RainIcon />, label: "Clima", value: "Parcialmente nublado" },
    { icon: <ThermometerIcon />, label: "Temperatura do Ar", value: "26,0 °C" },
    { icon: <WaterThermometerIcon />, label: "Temperatura da Água", value: "22,4 °C" },
    { icon: <TideIcon />, label: "Maré", value: "Enchendo" },
    { icon: <WaveIcon />, label: "Swell", value: "0,7 m • 8 s" },
    { icon: <WindIcon />, label: "Vento", value: "NE • 8 km/h" },
    { icon: <PressureIcon />, label: "Pressão", value: "1016 hPa" },
    {
      icon: <SunMoonIcon />,
      label: "",
      value: "SOL E LUA",
    },
  ];

  return (
    <section className="vpAdvancedPreview" aria-label="Preview Dados Avançados">
      {onClose ? (
        <button className="vpAdvancedCloseButton" type="button" aria-label="Fechar" onClick={onClose}>
          <CloseIcon />
        </button>
      ) : null}

      <main className="vpAdvancedPanelShell">
        <button
          type="button"
          className="vpAdvancedBackButton"
          aria-label="Voltar"
          onClick={onBack}
        >
          <BackIcon />
        </button>

        <SelectedPointCard placeName={selectedPlaceName} />

        <IntroCard />

        <section className="vpAdvancedDataGrid" aria-label="Dados avançados">
          {metrics.map((item) => (
            <MetricButton key={item.label} item={item} />
          ))}
        </section>
      </main>

      <style jsx global>{`
        .vpAdvancedPreview {
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

        .vpAdvancedCloseButton {
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

        .vpAdvancedCloseButton svg {
          width: 25px;
          height: 25px;
        }

        .vpAdvancedBackButton {
          position: absolute;
          top: 16px;
          left: 16px;
          z-index: 2;
          width: 44px;
          height: 44px;
          border: 0;
          border-radius: 999px;
          background: transparent;
          color: rgba(248, 250, 252, 0.94);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          box-shadow: none;
        }

        .vpAdvancedBackButton svg {
          width: 25px;
          height: 25px;
        }

        .vpAdvancedPanelShell {
          position: relative;
          width: min(100vw, 460px);
          height: 100dvh;
          margin: 0 auto;
          padding: max(10px, env(safe-area-inset-top)) 12px max(10px, env(safe-area-inset-bottom));
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
          gap: 7px;
        }

        .vpAdvancedCard,
        .vpAdvancedDataTile {
          background: linear-gradient(135deg, rgba(23, 31, 42, 0.88), rgba(10, 16, 23, 0.94));
          border: 1px solid rgba(148, 163, 184, 0.2);
          box-shadow:
            inset 0 1px 0 rgba(255, 255, 255, 0.035),
            0 14px 34px rgba(0, 0, 0, 0.18);
          backdrop-filter: blur(14px);
        }

        .vpAdvancedPlaceBlock {
          flex: 0 0 auto;
          border-radius: 18px;
          min-height: 64px;
          display: grid;
          grid-template-columns: auto minmax(0, 1fr) auto;
          align-items: center;
          gap: 10px;
          padding: 9px 11px 9px 54px;
          box-sizing: border-box;
        }

        .vpAdvancedPlaceIcon {
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

        .vpAdvancedPlaceIcon svg {
          width: 27px;
          height: 27px;
        }

        .vpAdvancedPlaceText {
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 1px;
        }

        .vpAdvancedPlaceText span {
          color: rgba(226, 232, 240, 0.72);
          font-size: 11px;
          line-height: 1;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          font-weight: 520;
        }

        .vpAdvancedPlaceText strong {
          color: #38bdf8;
          font-size: clamp(17px, 4.7vw, 21px);
          line-height: 1.15;
          font-weight: 650;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .vpAdvancedIntroBlock {
          flex: 0 0 auto;
          border-radius: 18px;
          min-height: 82px;
          display: grid;
          grid-template-columns: auto minmax(0, 1fr);
          align-items: center;
          gap: 12px;
          padding: 11px 13px;
          box-sizing: border-box;
        }

        .vpAdvancedIntroIcon {
          width: 42px;
          height: 42px;
          border-radius: 14px;
          color: #7dd3fc;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(14, 165, 233, 0.12);
        }

        .vpAdvancedIntroIcon svg {
          width: 27px;
          height: 27px;
        }

        .vpAdvancedIntroText {
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .vpAdvancedIntroText span {
          color: rgba(226, 232, 240, 0.72);
          font-size: 11px;
          line-height: 1;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          font-weight: 620;
        }

        .vpAdvancedIntroText strong {
          color: #ffffff;
          font-size: clamp(19px, 4.8vw, 23px);
          line-height: 1.08;
          font-weight: 680;
          letter-spacing: -0.02em;
        }

        .vpAdvancedIntroText small {
          color: rgba(226, 232, 240, 0.72);
          font-size: clamp(11px, 3vw, 13px);
          line-height: 1.2;
          font-weight: 450;
        }

        .vpAdvancedHeaderScore {
          color: #7dd3fc;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 0;
          box-sizing: border-box;
          text-align: center;
        }

        .vpAdvancedHeaderScore span {
          color: rgba(186, 230, 253, 0.78);
          font-size: 9px;
          line-height: 1;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          font-weight: 720;
        }

        .vpAdvancedHeaderScore strong {
          margin-top: 2px;
          color: #38bdf8;
          font-size: 22px;
          line-height: 0.95;
          font-weight: 780;
          letter-spacing: -0.04em;
        }

        .vpAdvancedDataGrid {
          flex: 1 1 auto;
          min-height: 0;
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          grid-template-rows: repeat(4, minmax(0, 1fr));
          gap: 7px;
        }

        .vpAdvancedDataTile {
          min-height: 0;
          width: 100%;
          border-radius: 16px;
          display: grid;
          grid-template-columns: auto minmax(0, 1fr) auto;
          align-items: center;
          gap: 9px;
          padding: 8px 10px;
          box-sizing: border-box;
          color: inherit;
          text-align: left;
          cursor: pointer;
          appearance: none;
          transition:
            border-color 160ms ease,
            background 160ms ease,
            transform 160ms ease,
            box-shadow 160ms ease;
        }

        .vpAdvancedDataTile:hover {
          border-color: rgba(125, 211, 252, 0.34);
          background: linear-gradient(135deg, rgba(23, 39, 54, 0.9), rgba(10, 20, 30, 0.96));
          box-shadow:
            inset 0 1px 0 rgba(255, 255, 255, 0.045),
            0 16px 38px rgba(0, 0, 0, 0.22),
            0 0 18px rgba(14, 165, 233, 0.08);
        }

        .vpAdvancedDataTile:active {
          transform: scale(0.985);
        }

        .vpAdvancedTileIcon {
          color: #e0f2fe;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .vpAdvancedTileIcon svg {
          width: clamp(27px, 7.7vw, 35px);
          height: clamp(27px, 7.7vw, 35px);
          display: block;
        }

        .vpAdvancedTileText {
          min-width: 0;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          justify-content: center;
          gap: 2px;
        }

        .vpAdvancedTileText span {
          color: rgba(226, 232, 240, 0.72);
          font-size: 11.5px;
          line-height: 1.05;
          font-weight: 620;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .vpAdvancedTileText strong {
          color: #ffffff;
          font-size: clamp(18px, 4.55vw, 23px);
          line-height: 1.08;
          font-weight: 680;
          letter-spacing: -0.02em;
        }

        .vpAdvancedTileText.isTitleOnly strong {
          font-size: clamp(18px, 4.35vw, 21px);
          line-height: 1.05;
          letter-spacing: 0.03em;
        }

        .vpAdvancedTileText small {
          color: rgba(226, 232, 240, 0.68);
          font-size: 12px;
          line-height: 1.2;
          font-weight: 400;
        }

        .vpAdvancedTileChevron {
          width: 24px;
          height: 24px;
          color: rgba(255, 255, 255, 0.68);
        }

        .vpAdvancedPlaceIcon svg,
        .vpAdvancedIntroIcon svg,
        .vpAdvancedTileIcon svg,
        .vpAdvancedTileChevron,
        .vpAdvancedCloseButton svg,
        .vpAdvancedBackButton svg {
          fill: none;
          stroke: currentColor;
          stroke-width: 3;
          stroke-linecap: round;
          stroke-linejoin: round;
        }

        @media (max-width: 390px) {
          .vpAdvancedPanelShell {
            gap: 6px;
            padding-left: 10px;
            padding-right: 10px;
          }

          .vpAdvancedBackButton {
            top: 10px;
            left: 10px;
          }

          .vpAdvancedPlaceBlock {
            min-height: 58px;
            padding: 7px 9px 7px 50px;
          }

          .vpAdvancedPlaceIcon {
            width: 36px;
            height: 36px;
          }

          .vpAdvancedPlaceIcon svg {
            width: 23px;
            height: 23px;
          }

          .vpAdvancedIntroBlock {
            min-height: 76px;
            grid-template-columns: auto minmax(0, 1fr);
            gap: 9px;
            padding: 9px;
          }

          .vpAdvancedIntroIcon {
            width: 36px;
            height: 36px;
            border-radius: 13px;
          }

          .vpAdvancedIntroIcon svg {
            width: 23px;
            height: 23px;
          }

          .vpAdvancedIntroText strong {
            font-size: 18px;
          }

          .vpAdvancedIntroText small {
            font-size: 11px;
          }

          .vpAdvancedHeaderScore {
            padding: 0;
          }

          .vpAdvancedHeaderScore strong {
            font-size: 20px;
          }

          .vpAdvancedDataGrid {
            gap: 6px;
          }

          .vpAdvancedDataTile {
            padding: 7px 8px;
          }

          .vpAdvancedTileText strong {
            font-size: 18px;
          }

          .vpAdvancedTileChevron {
            width: 20px;
            height: 20px;
          }
        }

        @media (min-width: 768px) {
          .vpAdvancedPreview {
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

          .vpAdvancedCloseButton {
            position: absolute;
            top: max(24px, calc(50% - 410px));
            left: calc(50% + min(43vw, 460px) + 12px);
            right: auto;
          }

          .vpAdvancedPanelShell {
            width: min(86vw, 920px);
            height: auto;
            max-height: min(92dvh, 820px);
            padding: 14px;
            display: grid;
            grid-template-columns: 1fr 1fr;
            grid-template-rows: auto auto auto;
            gap: 16px;
            background: rgba(3, 10, 18, 0.82);
            border: 1px solid rgba(148, 163, 184, 0.14);
            border-radius: 28px;
            box-shadow: 0 24px 80px rgba(0, 0, 0, 0.34);
            backdrop-filter: blur(6px);
          }

          .vpAdvancedBackButton {
            top: 18px;
            left: 18px;
          }

          .vpAdvancedCard,
          .vpAdvancedDataTile {
            background: rgba(10, 18, 30, 0.82);
            border: 1px solid rgba(148, 163, 184, 0.18);
          }

          .vpAdvancedPlaceBlock {
            grid-column: 1 / -1;
            min-height: 78px;
            padding: 14px 18px 14px 58px;
          }

          .vpAdvancedIntroBlock {
            grid-column: 1 / -1;
            min-height: 96px;
            padding: 16px 18px;
          }

          .vpAdvancedIntroIcon {
            width: 50px;
            height: 50px;
            border-radius: 16px;
          }

          .vpAdvancedIntroIcon svg {
            width: 31px;
            height: 31px;
          }

          .vpAdvancedIntroText span {
            font-size: 12px;
          }

          .vpAdvancedIntroText strong {
            font-size: 25px;
          }

          .vpAdvancedIntroText small {
            font-size: 14px;
          }

          .vpAdvancedHeaderScore {
            padding: 0;
          }

          .vpAdvancedHeaderScore strong {
            font-size: 24px;
          }

          .vpAdvancedDataGrid {
            grid-column: 1 / -1;
            grid-template-columns: repeat(4, minmax(0, 1fr));
            grid-template-rows: repeat(2, 126px);
            gap: 14px;
          }

          .vpAdvancedDataTile {
            border-radius: 18px;
            padding: 14px;
          }

          .vpAdvancedTileIcon svg {
            width: 32px;
            height: 32px;
          }

          .vpAdvancedTileText span {
            font-size: 12px;
          }

          .vpAdvancedTileText strong {
            font-size: 20px;
          }

          .vpAdvancedTileText.isTitleOnly strong {
            font-size: 20px;
          }

          .vpAdvancedTileText small {
            font-size: 12px;
          }

          .vpAdvancedTileChevron {
            width: 25px;
            height: 25px;
          }
        }
      `}</style>
    </section>
  );
}
