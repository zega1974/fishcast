"use client";

import type React from "react";
import { useState } from "react";

type OfficialFreePanelPreviewProps = {
  isOpen: boolean;
  onClose: () => void;
  placeName?: string;
  lat?: number;
  lng?: number;
  coordinatesText?: string;
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

type ForecastDayItem = {
  id: string;
  day: string;
  isToday?: boolean;
};

const forecastDays: ForecastDayItem[] = [
  { id: "day-25", day: "25", isToday: true },
  { id: "day-26", day: "26" },
  { id: "day-27", day: "27" },
  { id: "day-28", day: "28" },
  { id: "day-29", day: "29" },
  { id: "day-30", day: "30" },
  { id: "day-01", day: "01" },
];

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
  ...props
}: {
  children: React.ReactNode;
  className?: string;
} & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`vpOfficialCard ${className}`} {...props}>
      {children}
    </div>
  );
}

async function copyTextWithFallback(text: string) {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // tenta fallback abaixo
  }

  try {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.top = "-9999px";
    textarea.style.left = "-9999px";
    textarea.style.opacity = "0";

    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();

    const copied = document.execCommand("copy");
    document.body.removeChild(textarea);

    return copied;
  } catch {
    return false;
  }
}

function formatCoordinates(lat?: number, lng?: number) {
  if (typeof lat === "number" && typeof lng === "number") {
    return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
  }

  return "-25.823456, -48.536789";
}

function ScoreBar() {
  return (
    <div className="vpOfficialScoreBar" aria-hidden="true">
      <span style={{ width: "82%" }} />
    </div>
  );
}

function SelectedPointCard({
  placeName,
  coordinates,
}: {
  placeName: string;
  coordinates: string;
}) {
  const [copied, setCopied] = useState(false);

  const copyCoords = async () => {
    const success = await copyTextWithFallback(coordinates);

    if (success) {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    }
  };

  return (
    <CardShell className="vpOfficialPlaceBlock">
      <div className="vpOfficialPlaceIcon">
        <PinIcon />
      </div>

      <div className="vpOfficialPlaceText">
        <span>Ponto Selecionado</span>
        <strong>{placeName}</strong>
        <small>{coordinates}</small>
      </div>

      <button
        className={`vpOfficialCopyButton ${copied ? "isCopied" : ""}`}
        type="button"
        onClick={copyCoords}
        aria-live="polite"
      >
        <CopyIcon />
        <span>{copied ? "Copiado!" : "Copiar coordenadas"}</span>
      </button>
    </CardShell>
  );
}

function ForecastDaySelector({
  selectedDayId,
  onSelectDay,
}: {
  selectedDayId: string;
  onSelectDay: (dayId: string) => void;
}) {
  return (
    <CardShell className="vpOfficialDaySelector" aria-label="Selecionar dia da previsão">
      {forecastDays.map((day) => {
        const selected = day.id === selectedDayId;

        return (
          <button
            key={day.id}
            type="button"
            className={`vpOfficialDayButton${selected ? " isSelected" : ""}${day.isToday ? " isToday" : ""}`}
            onClick={() => onSelectDay(day.id)}
            aria-pressed={selected}
            aria-label={day.isToday ? `Hoje, dia ${day.day}` : `Dia ${day.day}`}
          >
            <span>{day.day}</span>
          </button>
        );
      })}
    </CardShell>
  );
}

function DailySummaryCard() {
  return (
    <CardShell className="vpOfficialDailySummary">
      <div className="vpOfficialSummaryScoreRow">
        <span className="vpOfficialSummaryLabel">Score do dia</span>
        <strong>82</strong>
        <ScoreBar />
        <em>Excelente</em>
      </div>

      <div className="vpOfficialSummaryDivider" />

      <div className="vpOfficialSummaryTimesRow">
        <span className="vpOfficialSummaryLabel">Melhores horários</span>

        <div className="vpOfficialSummaryTime">
          <SunriseIcon className="vpOfficialSummaryTimeIcon" />
          <strong>14h às 16h</strong>
        </div>

        <div className="vpOfficialSummaryTime">
          <SunriseIcon className="vpOfficialSummaryTimeIcon" />
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

export default function OfficialFreePanelPreview({
  isOpen,
  onClose,
  placeName,
  lat,
  lng,
  coordinatesText,
}: OfficialFreePanelPreviewProps) {
  const coordinates = coordinatesText || formatCoordinates(lat, lng);
  const selectedPlaceName = placeName?.trim() || "Pontal de Matinhos";
  const [selectedForecastDayId, setSelectedForecastDayId] = useState(forecastDays[0].id);
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

  if (!isOpen) {
    return null;
  }

  return (
    <section className="vpOfficialPreview" aria-label="Preview Aba Oficial Gratuita">
      <button className="vpOfficialCloseButton" type="button" aria-label="Fechar" onClick={onClose}>
        <CloseIcon />
      </button>

      <main className="vpOfficialPanelShell">
        <SelectedPointCard placeName={selectedPlaceName} coordinates={coordinates} />

        <ForecastDaySelector
          selectedDayId={selectedForecastDayId}
          onSelectDay={setSelectedForecastDayId}
        />

        <DailySummaryCard />

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
          min-height: 78px;
          display: grid;
          grid-template-columns: auto minmax(0, 1fr);
          align-items: center;
          gap: 8px 10px;
          padding: 9px 62px 9px 11px;
          box-sizing: border-box;
        }

        .vpOfficialPlaceIcon {
          grid-row: 1 / span 2;
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
          font-size: clamp(16px, 4.6vw, 21px);
          line-height: 1.12;
          font-weight: 650;
          white-space: normal;
          overflow: visible;
          text-overflow: clip;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        }

        .vpOfficialPlaceText small {
          color: rgba(226, 232, 240, 0.74);
          font-size: clamp(11px, 3.1vw, 14px);
          line-height: 1.1;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .vpOfficialCopyButton {
          grid-column: 2 / 3;
          justify-self: start;
          border: 1px solid rgba(56, 189, 248, 0.36);
          border-radius: 11px;
          background: rgba(14, 165, 233, 0.08);
          color: #7dd3fc;
          min-height: 30px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 0 10px;
          font-size: 12px;
          font-weight: 560;
          cursor: pointer;
          transition:
            border-color 160ms ease,
            background 160ms ease,
            color 160ms ease,
            box-shadow 160ms ease;
        }

        .vpOfficialCopyButton svg {
          width: 16px;
          height: 16px;
        }

        .vpOfficialCopyButton span {
          white-space: nowrap;
        }

        .vpOfficialCopyButton.isCopied {
          border-color: rgba(34, 197, 94, 0.48);
          background: rgba(34, 197, 94, 0.12);
          color: #86efac;
          box-shadow: 0 0 18px rgba(34, 197, 94, 0.14);
        }

        .vpOfficialDaySelector {
          flex: 0 0 auto;
          min-height: 58px;
          border-radius: 17px;
          padding: 7px;
          display: grid;
          grid-template-columns: repeat(7, minmax(0, 1fr));
          align-items: center;
          gap: 4px;
          box-sizing: border-box;
        }

        .vpOfficialDayButton {
          position: relative;
          min-width: 0;
          height: 44px;
          border: 1px solid transparent;
          border-radius: 13px;
          background: transparent;
          color: rgba(226, 232, 240, 0.72);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: clamp(18px, 5vw, 23px);
          line-height: 1;
          font-weight: 680;
          cursor: pointer;
          transition:
            border-color 160ms ease,
            background 160ms ease,
            color 160ms ease,
            box-shadow 160ms ease,
            transform 160ms ease;
        }

        .vpOfficialDayButton span {
          transform: translateY(-1px);
        }

        .vpOfficialDayButton.isToday::after {
          content: "";
          position: absolute;
          left: 50%;
          bottom: 5px;
          width: 6px;
          height: 6px;
          border-radius: 999px;
          transform: translateX(-50%);
          background: #22d3ee;
          box-shadow: 0 0 12px rgba(34, 211, 238, 0.58);
        }

        .vpOfficialDayButton.isSelected {
          border-color: rgba(34, 211, 238, 0.72);
          background:
            radial-gradient(circle at 50% 0%, rgba(34, 211, 238, 0.22), transparent 62%),
            rgba(14, 165, 233, 0.1);
          color: #67e8f9;
          box-shadow:
            inset 0 1px 0 rgba(255, 255, 255, 0.08),
            0 0 22px rgba(34, 211, 238, 0.13);
        }

        .vpOfficialDailySummary {
          flex: 0 0 auto;
          border-radius: 18px;
          min-height: 86px;
          padding: 11px 13px;
          box-sizing: border-box;
          display: grid;
          grid-template-rows: auto 1px auto;
          gap: 9px;
        }

        .vpOfficialSummaryScoreRow,
        .vpOfficialSummaryTimesRow {
          min-width: 0;
          display: grid;
          align-items: center;
          column-gap: 10px;
        }

        .vpOfficialSummaryScoreRow {
          grid-template-columns: auto auto minmax(72px, 1fr) auto;
        }

        .vpOfficialSummaryTimesRow {
          grid-template-columns: auto minmax(0, 1fr) minmax(0, 1fr);
        }

        .vpOfficialSummaryLabel {
          color: rgba(226, 232, 240, 0.72);
          font-size: clamp(10px, 2.8vw, 12px);
          line-height: 1;
          font-weight: 700;
          letter-spacing: 0.075em;
          text-transform: uppercase;
          white-space: nowrap;
        }

        .vpOfficialSummaryScoreRow > strong {
          color: #ffffff;
          font-size: clamp(25px, 7vw, 34px);
          line-height: 0.95;
          font-weight: 800;
          letter-spacing: -0.055em;
        }

        .vpOfficialSummaryScoreRow > em {
          color: #67e8f9;
          font-size: clamp(14px, 3.7vw, 17px);
          line-height: 1;
          font-style: normal;
          font-weight: 700;
          white-space: nowrap;
        }

        .vpOfficialScoreBar {
          height: 8px;
          border-radius: 999px;
          overflow: hidden;
          background: rgba(148, 163, 184, 0.24);
          box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.035);
        }

        .vpOfficialScoreBar span {
          display: block;
          height: 100%;
          border-radius: inherit;
          background: linear-gradient(90deg, #22d3ee, #38bdf8);
          box-shadow: 0 0 16px rgba(34, 211, 238, 0.35);
        }

        .vpOfficialSummaryDivider {
          background: linear-gradient(90deg, transparent, rgba(148, 163, 184, 0.24), transparent);
        }

        .vpOfficialSummaryTime {
          min-width: 0;
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 6px;
        }

        .vpOfficialSummaryTime + .vpOfficialSummaryTime {
          border-left: 1px solid rgba(148, 163, 184, 0.2);
        }

        .vpOfficialSummaryTime strong {
          color: #ffffff;
          font-size: clamp(14px, 3.8vw, 17px);
          line-height: 1;
          font-weight: 720;
          white-space: nowrap;
        }

        .vpOfficialSummaryTimeIcon {
          width: clamp(24px, 6.6vw, 31px);
          height: clamp(24px, 6.6vw, 31px);
          color: #7dd3fc;
          flex: 0 0 auto;
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
          padding: 7px 9px;
          box-sizing: border-box;
        }

        .vpOfficialTileIcon {
          color: #e0f2fe;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .vpOfficialTileIcon svg {
          width: clamp(26px, 7.1vw, 34px);
          height: clamp(26px, 7.1vw, 34px);
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
          letter-spacing: 0.075em;
          text-transform: uppercase;
        }

        .vpOfficialTileText strong {
          color: #ffffff;
          font-size: clamp(19px, 4.8vw, 24px);
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
          min-height: 52px;
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
          width: 28px;
          height: 28px;
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
        .vpOfficialSummaryTimeIcon,
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
            min-height: 74px;
            padding: 7px 54px 7px 9px;
            gap: 6px 8px;
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
            min-height: 28px;
            padding: 0 8px;
          }

          .vpOfficialCopyButton span {
            display: inline;
          }

          .vpOfficialDaySelector {
            min-height: 52px;
            padding: 6px;
          }

          .vpOfficialDayButton {
            height: 39px;
            border-radius: 11px;
            font-size: 18px;
          }

          .vpOfficialDailySummary {
            min-height: 82px;
            padding: 10px 11px;
            gap: 8px;
          }

          .vpOfficialSummaryScoreRow {
            grid-template-columns: auto auto minmax(54px, 1fr) auto;
            column-gap: 7px;
          }

          .vpOfficialSummaryTimesRow {
            grid-template-columns: auto minmax(0, 1fr) minmax(0, 1fr);
            column-gap: 7px;
          }

          .vpOfficialSummaryTime {
            gap: 4px;
          }

          .vpOfficialSummaryTimeIcon {
            width: 23px;
            height: 23px;
          }

          .vpOfficialSummaryTime strong {
            font-size: 13px;
          }

          .vpOfficialDataGrid {
            gap: 6px;
          }

          .vpOfficialDataTile {
            padding: 6px 8px;
          }

          .vpOfficialTileText span {
            font-size: 10px;
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
            grid-template-rows: auto auto auto auto auto;
            gap: 14px;
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
            grid-template-columns: auto minmax(0, 1fr) auto;
          }

          .vpOfficialPlaceIcon {
            grid-row: auto;
          }

          .vpOfficialPlaceText strong {
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            display: block;
          }

          .vpOfficialCopyButton {
            grid-column: auto;
            justify-self: end;
            height: 36px;
            font-size: 13px;
          }

          .vpOfficialDaySelector {
            grid-column: 1 / -1;
            min-height: 72px;
            padding: 10px 18px;
            gap: 10px;
          }

          .vpOfficialDayButton {
            height: 50px;
            border-radius: 14px;
            font-size: 24px;
          }

          .vpOfficialDailySummary {
            grid-column: 1 / -1;
            min-height: 94px;
            padding: 14px 22px;
            gap: 11px;
          }

          .vpOfficialSummaryScoreRow {
            grid-template-columns: auto auto minmax(220px, 1fr) auto;
            column-gap: 16px;
          }

          .vpOfficialSummaryScoreRow > strong {
            font-size: 42px;
          }

          .vpOfficialSummaryScoreRow > em {
            font-size: 20px;
          }

          .vpOfficialSummaryLabel {
            font-size: 13px;
          }

          .vpOfficialScoreBar {
            height: 10px;
          }

          .vpOfficialSummaryTimesRow {
            grid-template-columns: auto 1fr 1fr;
            column-gap: 18px;
          }

          .vpOfficialSummaryTime {
            justify-content: center;
            gap: 9px;
          }

          .vpOfficialSummaryTime strong {
            font-size: 20px;
          }

          .vpOfficialSummaryTimeIcon {
            width: 37px;
            height: 37px;
          }

          .vpOfficialDataGrid {
            grid-column: 1 / -1;
            grid-template-columns: repeat(4, minmax(0, 1fr));
            grid-template-rows: repeat(2, 118px);
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
            min-height: 60px;
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
