'use client';

import type React from 'react';
import { useState } from 'react';
import type { Capture } from '@/components/captures/types';

type CaptureSpotPanelPreviewProps = {
  lat: number;
  lng: number;
  captures: Capture[];
  onClose?: () => void;
  onAddCapture?: () => void;
  onDeleteSpot?: () => void;
  onOpenSpotData?: () => void;
  onOpenCapture?: (captureId: number) => void;
};

type IconProps = {
  className?: string;
};

function SvgBase({
  children,
  className = '',
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

function CapturePinIcon(props: IconProps) {
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

function FishIcon(props: IconProps) {
  return (
    <SvgBase {...props}>
      <path d="M5 24s6.8-10 18-10c8.8 0 14.4 5.6 16.8 10C37.4 28.4 31.8 34 23 34 11.8 34 5 24 5 24Z" />
      <path d="M39.8 24 43 17v14l-3.2-7Z" />
      <circle cx="15" cy="22" r="1.5" fill="currentColor" stroke="none" />
    </SvgBase>
  );
}

function WeightIcon(props: IconProps) {
  return (
    <SvgBase {...props}>
      <path d="M16 18h16l2.8 20H13.2L16 18Z" />
      <path d="M19 18a5 5 0 0 1 10 0" />
      <path d="M24 26v6" />
    </SvgBase>
  );
}

function RulerIcon(props: IconProps) {
  return (
    <SvgBase {...props}>
      <path d="M8 34 34 8l6 6-26 26-6-6Z" />
      <path d="M16 32l-3-3" />
      <path d="M22 26l-3-3" />
      <path d="M28 20l-3-3" />
    </SvgBase>
  );
}

function CalendarIcon(props: IconProps) {
  return (
    <SvgBase {...props}>
      <rect x="8" y="10" width="32" height="30" rx="6" />
      <path d="M16 6v8" />
      <path d="M32 6v8" />
      <path d="M8 20h32" />
    </SvgBase>
  );
}

function TrashIcon(props: IconProps) {
  return (
    <SvgBase {...props}>
      <path d="M12 14h24" />
      <path d="M20 22v12" />
      <path d="M28 22v12" />
      <path d="M16 14l2 26h12l2-26" />
      <path d="M20 14v-4h8v4" />
    </SvgBase>
  );
}

function CardShell({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={`vpSpotCard ${className}`}>{children}</div>;
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
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'fixed';
    textarea.style.top = '-9999px';
    textarea.style.left = '-9999px';
    textarea.style.opacity = '0';

    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();

    const copied = document.execCommand('copy');
    document.body.removeChild(textarea);

    return copied;
  } catch {
    return false;
  }
}

function SpotCopyButton({ coordinates }: { coordinates: string }) {
  const [copied, setCopied] = useState(false);

  const copyCoords = async () => {
    const success = await copyTextWithFallback(coordinates);

    if (success) {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    }
  };

  return (
    <button
      className={`vpSpotCopyButton ${copied ? 'isCopied' : ''}`}
      type="button"
      onClick={copyCoords}
      aria-live="polite"
    >
      <CopyIcon />
      <span>{copied ? 'Copiado!' : 'Copiar'}</span>
    </button>
  );
}

function SpotMobileCopyButton({ coordinates }: { coordinates: string }) {
  const [copied, setCopied] = useState(false);

  const copyCoords = async () => {
    const success = await copyTextWithFallback(coordinates);

    if (success) {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    }
  };

  return (
    <button
      className={`vpSpotMobileCopyButton ${copied ? 'isCopied' : ''}`}
      type="button"
      onClick={copyCoords}
      aria-live="polite"
    >
      <CopyIcon />
      <span>{copied ? 'Copiado!' : 'Copiar'}</span>
    </button>
  );
}

function FishThumb() {
  return (
    <div className="vpSpotFishThumb">
      <div className="vpSpotFishThumbBg" />

      <svg viewBox="0 0 150 84" className="vpSpotFishDrawing" aria-hidden="true">
        <path
          d="M28 44 C47 22 91 20 119 43 C91 66 50 65 28 44 Z"
          fill="rgba(203,213,225,0.9)"
          stroke="rgba(255,255,255,0.5)"
          strokeWidth="2"
        />
        <path
          d="M115 42 L140 27 L134 43 L140 59 Z"
          fill="rgba(148,163,184,0.72)"
          stroke="rgba(255,255,255,0.32)"
          strokeWidth="2"
        />
        <circle cx="47" cy="39" r="3.8" fill="rgba(2,6,23,0.95)" />
        <path
          d="M58 35 C73 40 91 40 108 35"
          fill="none"
          stroke="rgba(15,23,42,0.25)"
          strokeWidth="2"
        />
      </svg>

      <div className="vpSpotFishThumbShade" />
    </div>
  );
}

function formatSpotCaptureDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '--/--/----';
  }

  const dateText = new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);

  const hour = date.getHours();
  const minute = date.getMinutes();
  const timeText = minute === 0
    ? `${String(hour).padStart(2, '0')}h`
    : `${String(hour).padStart(2, '0')}h${String(minute).padStart(2, '0')}`;

  return `${dateText} • ${timeText}`;
}

function getCaptureTitle(capture: Capture, index: number) {
  const species = capture.species.trim();
  return species || `Captura #${index + 1}`;
}

function getCaptureWeight(capture: Capture) {
  const weight = capture.weight.trim();
  return weight ? `${weight} kg` : 'Peso --';
}

function getCaptureSize(capture: Capture) {
  const size = capture.size.trim();
  return size ? `${size} cm` : 'Tam. --';
}

function SpotHeaderCard({
  coordinates,
  onOpenSpotData,
}: {
  coordinates: string;
  onOpenSpotData?: () => void;
}) {
  return (
    <CardShell className="vpSpotHeaderCard">
      <div className="vpSpotHeaderDesktop">
        <div className="vpSpotPinIcon">
          <CapturePinIcon />
        </div>

        <div className="vpSpotHeaderText">
          <span>Capturas do Spot</span>
          <strong>Ponto de captura</strong>

          <div className="vpSpotCoordinatesRow">
            <small>{coordinates}</small>
            <SpotCopyButton coordinates={coordinates} />
          </div>
        </div>

        <button
          className="vpSpotDataButton"
          type="button"
          onClick={onOpenSpotData}
        >
          <ChartIcon />
          <span>Dados do Spot</span>
        </button>
      </div>

      <div className="vpSpotHeaderMobile">
        <div className="vpSpotMobileTop">
          <div className="vpSpotMobilePinIcon">
            <CapturePinIcon />
          </div>

          <div className="vpSpotMobileText">
            <span>Capturas do Spot</span>
            <strong>Ponto de captura</strong>

            <div className="vpSpotMobileCoordinates">
              <small>{coordinates}</small>
              <SpotMobileCopyButton coordinates={coordinates} />
            </div>
          </div>
        </div>

        <button
          className="vpSpotMobileDataButton"
          type="button"
          onClick={onOpenSpotData}
        >
          <ChartIcon />
          <span>Dados do Spot</span>
        </button>
      </div>
    </CardShell>
  );
}

function CaptureCard({
  capture,
  index,
  onOpenCapture,
}: {
  capture: Capture;
  index: number;
  onOpenCapture?: (captureId: number) => void;
}) {
  const title = getCaptureTitle(capture, index);

  return (
    <article
      className="vpSpotCaptureCard"
      role={onOpenCapture ? 'button' : undefined}
      tabIndex={onOpenCapture ? 0 : undefined}
      onClick={() => onOpenCapture?.(capture.id)}
      onKeyDown={(event) => {
        if (!onOpenCapture) {
          return;
        }

        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onOpenCapture(capture.id);
        }
      }}
    >
      {capture.photo ? (
        <div className="vpSpotFishThumb">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={capture.photo}
            alt="Foto da captura"
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        </div>
      ) : (
        <FishThumb />
      )}

      <div className="vpSpotCaptureText">
        <strong>{title}</strong>

        <div className="vpSpotCaptureMeta">
          <span>
            <WeightIcon />
            {getCaptureWeight(capture)}
          </span>

          <span>
            <RulerIcon />
            {getCaptureSize(capture)}
          </span>

          <span className="vpSpotDateMeta">
            <CalendarIcon />
            {formatSpotCaptureDate(capture.capturedAt)}
          </span>
        </div>
      </div>
    </article>
  );
}

function CapturesBlock({
  captures,
  onOpenCapture,
}: {
  captures: Capture[];
  onOpenCapture?: (captureId: number) => void;
}) {
  const panelCaptures = [...captures].reverse();

  return (
    <CardShell className="vpSpotCapturesBlock">
      <div className="vpSpotSectionTitle">
        <FishIcon />
        <span>Capturas neste ponto</span>
      </div>

      <div className="vpSpotCapturesScroll">
        <div className="vpSpotCapturesList">
          {panelCaptures.length > 0 ? (
            panelCaptures.map((capture, index) => (
              <CaptureCard
                key={capture.id}
                capture={capture}
                index={panelCaptures.length - index - 1}
                onOpenCapture={onOpenCapture}
              />
            ))
          ) : (
            <div className="vpSpotEmptyState">
              Nenhuma captura salva neste ponto.
            </div>
          )}
        </div>
      </div>
    </CardShell>
  );
}

function FooterActions({
  onAddCapture,
  onDeleteSpot,
}: {
  onAddCapture?: () => void;
  onDeleteSpot?: () => void;
}) {
  return (
    <div className="vpSpotFooter">
      <button className="vpSpotPrimaryButton" type="button" onClick={onAddCapture}>
        + Captura
      </button>

      <button className="vpSpotDangerButton" type="button" onClick={onDeleteSpot}>
        <TrashIcon />
        <span>Apagar Spot</span>
      </button>
    </div>
  );
}

export default function CaptureSpotPanelPreview({
  lat,
  lng,
  captures,
  onClose,
  onAddCapture,
  onDeleteSpot,
  onOpenSpotData,
  onOpenCapture,
}: CaptureSpotPanelPreviewProps) {
  const coordinates = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;

  return (
    <section
      className="vpSpotPreview"
      aria-label="Capturas do Spot"
      onClick={(event) => event.stopPropagation()}
      onPointerDown={(event) => event.stopPropagation()}
    >
      <div className="vpSpotPanelFrame">
        <button
          className="vpSpotCloseButton"
          type="button"
          aria-label="Fechar"
          onClick={onClose}
        >
          <CloseIcon />
        </button>

        <main className="vpSpotPanelShell">
          <SpotHeaderCard coordinates={coordinates} onOpenSpotData={onOpenSpotData} />
          <CapturesBlock captures={captures} onOpenCapture={onOpenCapture} />
          <FooterActions onAddCapture={onAddCapture} onDeleteSpot={onDeleteSpot} />
        </main>
      </div>

      <style jsx global>{`
        .vpSpotPreview {
          position: fixed;
          inset: 0;
          z-index: 99999;
          width: 100vw;
          height: 100dvh;
          overflow: hidden;
          color: #f8fafc;
          pointer-events: auto;
          background:
            radial-gradient(circle at 50% 8%, rgba(127, 29, 29, 0.15), transparent 34%),
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

        .vpSpotCloseButton {
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

        .vpSpotCloseButton svg {
          width: 25px;
          height: 25px;
        }

        .vpSpotPanelShell {
          width: min(100vw, 460px);
          height: 100dvh;
          margin: 0 auto;
          padding: max(10px, env(safe-area-inset-top)) 12px max(10px, env(safe-area-inset-bottom));
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
          gap: 7px;
        }

        .vpSpotCard,
        .vpSpotFooter {
          background: linear-gradient(135deg, rgba(23, 31, 42, 0.88), rgba(10, 16, 23, 0.94));
          border: 1px solid rgba(148, 163, 184, 0.2);
          box-shadow:
            inset 0 1px 0 rgba(255, 255, 255, 0.035),
            0 14px 34px rgba(0, 0, 0, 0.18);
          backdrop-filter: blur(14px);
        }

        .vpSpotHeaderCard {
          flex: 0 0 auto;
          border-radius: 18px;
          min-height: 76px;
          display: grid;
          grid-template-columns: auto minmax(0, 1fr) auto;
          align-items: center;
          gap: 11px;
          padding: 10px 10px 10px 11px;
          box-sizing: border-box;
        }

        .vpSpotHeaderDesktop {
          display: contents;
        }

        .vpSpotHeaderMobile {
          display: none;
        }

        .vpSpotPinIcon {
          width: 44px;
          height: 44px;
          border-radius: 999px;
          color: #fb7185;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(248, 113, 113, 0.12);
          box-shadow: 0 0 22px rgba(248, 113, 113, 0.18);
        }

        .vpSpotPinIcon svg {
          width: 28px;
          height: 28px;
        }

        .vpSpotHeaderText {
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .vpSpotHeaderText span {
          color: rgba(226, 232, 240, 0.72);
          font-size: 11px;
          line-height: 1;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          font-weight: 620;
        }

        .vpSpotHeaderText strong {
          color: #fb7185;
          font-size: clamp(18px, 4.8vw, 22px);
          line-height: 1.12;
          font-weight: 700;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          letter-spacing: -0.025em;
        }

        .vpSpotCoordinatesRow {
          min-width: 0;
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }

        .vpSpotCoordinatesRow small {
          color: rgba(226, 232, 240, 0.74);
          font-size: clamp(12px, 3.15vw, 14px);
          line-height: 1.1;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .vpSpotCopyButton {
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
          box-shadow: 0 0 16px rgba(14, 165, 233, 0.10);
          white-space: nowrap;
          transition:
            border-color 160ms ease,
            background 160ms ease,
            color 160ms ease,
            box-shadow 160ms ease;
        }

        .vpSpotCopyButton svg {
          width: 17px;
          height: 17px;
        }

        .vpSpotCopyButton.isCopied {
          border-color: rgba(34, 197, 94, 0.48);
          background: rgba(34, 197, 94, 0.12);
          color: #86efac;
          box-shadow: 0 0 18px rgba(34, 197, 94, 0.14);
        }

        .vpSpotDataButton {
          border: 1px solid rgba(56, 189, 248, 0.36);
          border-radius: 12px;
          background: rgba(14, 165, 233, 0.08);
          color: #7dd3fc;
          height: 38px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          padding: 0 11px;
          font-size: 13px;
          font-weight: 720;
          cursor: pointer;
          white-space: nowrap;
        }

        .vpSpotDataButton svg {
          width: 18px;
          height: 18px;
        }

        .vpSpotCapturesBlock {
          flex: 1 1 auto;
          min-height: 0;
          border-radius: 18px;
          padding: 10px;
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .vpSpotSectionTitle {
          flex: 0 0 auto;
          display: flex;
          align-items: center;
          gap: 8px;
          min-height: 28px;
          color: rgba(226, 232, 240, 0.82);
          font-size: clamp(13px, 3.45vw, 15px);
          line-height: 1;
          font-weight: 760;
          letter-spacing: 0.095em;
          text-transform: uppercase;
          padding: 0 2px;
        }

        .vpSpotSectionTitle svg {
          width: 24px;
          height: 24px;
          color: #7dd3fc;
        }

        .vpSpotCapturesScroll {
          flex: 1 1 auto;
          min-height: 0;
          overflow-y: auto;
          padding-right: 2px;
          scrollbar-color: rgba(125, 211, 252, 0.45) rgba(15, 23, 42, 0.55);
          scrollbar-width: thin;
        }

        .vpSpotCapturesList {
          display: flex;
          flex-direction: column;
          gap: 8px;
          padding-bottom: 2px;
        }

        .vpSpotCaptureCard {
          min-height: 100px;
          border-radius: 16px;
          border: 1px solid rgba(148, 163, 184, 0.16);
          background: rgba(3, 10, 20, 0.46);
          display: grid;
          grid-template-columns: auto minmax(0, 1fr);
          align-items: center;
          gap: 13px;
          padding: 8px 10px;
          box-sizing: border-box;
          box-shadow:
            inset 0 1px 0 rgba(255, 255, 255, 0.035),
            0 10px 22px rgba(0, 0, 0, 0.16);
          cursor: pointer;
        }

        .vpSpotFishThumb {
          position: relative;
          width: clamp(104px, 27vw, 126px);
          height: clamp(70px, 18vw, 82px);
          flex: 0 0 auto;
          overflow: hidden;
          border-radius: 15px;
          border: 1px solid rgba(125, 211, 252, 0.18);
          background: #0f172a;
          box-shadow: 0 0 22px rgba(56, 189, 248, 0.1);
        }

        .vpSpotFishThumbBg {
          position: absolute;
          inset: 0;
          background:
            radial-gradient(circle at 25% 35%, rgba(14, 165, 233, 0.36), transparent 36%),
            linear-gradient(135deg, rgba(12, 74, 110, 0.82), rgba(2, 6, 23, 0.95));
        }

        .vpSpotFishDrawing {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
        }

        .vpSpotFishThumbShade {
          position: absolute;
          inset: auto 0 0;
          height: 28px;
          background: linear-gradient(to top, rgba(2, 6, 23, 0.76), transparent);
        }

        .vpSpotCaptureText {
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .vpSpotCaptureText > strong {
          color: #ffffff;
          font-size: clamp(18px, 4.65vw, 22px);
          line-height: 1.05;
          font-weight: 760;
          letter-spacing: -0.025em;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .vpSpotCaptureMeta {
          min-width: 0;
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          column-gap: 18px;
          row-gap: 6px;
          color: rgba(248, 250, 252, 0.92);
          font-size: clamp(13px, 3.3vw, 15px);
          line-height: 1;
          font-weight: 680;
        }

        .vpSpotCaptureMeta span {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          min-width: 0;
        }

        .vpSpotCaptureMeta svg {
          width: 17px;
          height: 17px;
          color: #7dd3fc;
          flex: 0 0 auto;
        }

        .vpSpotDateMeta {
          color: rgba(226, 232, 240, 0.83);
        }

        .vpSpotEmptyState {
          min-height: 130px;
          border-radius: 16px;
          border: 1px dashed rgba(148, 163, 184, 0.22);
          background: rgba(3, 10, 20, 0.34);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 18px;
          text-align: center;
          color: rgba(226, 232, 240, 0.72);
          font-size: 14px;
          font-weight: 700;
        }

        .vpSpotFooter {
          flex: 0 0 auto;
          border-radius: 16px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 9px;
          padding: 9px;
          box-sizing: border-box;
        }

        .vpSpotPrimaryButton,
        .vpSpotDangerButton {
          min-height: 54px;
          border-radius: 14px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 0 12px;
          font-size: clamp(17px, 4.4vw, 20px);
          line-height: 1;
          font-weight: 760;
          cursor: pointer;
          border: 1px solid transparent;
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.13);
          white-space: nowrap;
        }

        .vpSpotPrimaryButton {
          color: #ffffff;
          background: linear-gradient(135deg, rgba(37, 99, 235, 0.96), rgba(29, 78, 216, 0.9));
          border-color: rgba(125, 211, 252, 0.42);
          box-shadow:
            0 0 28px rgba(37, 99, 235, 0.28),
            inset 0 1px 0 rgba(255, 255, 255, 0.16);
        }

        .vpSpotDangerButton {
          color: #fecaca;
          background: linear-gradient(135deg, rgba(69, 10, 10, 0.82), rgba(35, 6, 13, 0.88));
          border-color: rgba(248, 113, 113, 0.42);
          box-shadow:
            0 0 24px rgba(239, 68, 68, 0.14),
            inset 0 1px 0 rgba(255, 255, 255, 0.08);
        }

        .vpSpotDangerButton svg {
          width: 19px;
          height: 19px;
        }

        .vpSpotPinIcon svg,
        .vpSpotDataButton svg,
        .vpSpotCopyButton svg,
        .vpSpotSectionTitle svg,
        .vpSpotCaptureMeta svg,
        .vpSpotDangerButton svg,
        .vpSpotCloseButton svg {
          fill: none;
          stroke: currentColor;
          stroke-width: 3;
          stroke-linecap: round;
          stroke-linejoin: round;
        }

        @media (max-width: 420px) {
          .vpSpotPanelShell {
            gap: 6px;
            padding-left: 10px;
            padding-right: 10px;
          }

          .vpSpotCaptureCard {
            min-height: 92px;
            gap: 10px;
            padding: 8px;
          }

          .vpSpotCaptureText {
            gap: 10px;
          }

          .vpSpotCaptureMeta {
            column-gap: 12px;
          }

          .vpSpotFooter {
            gap: 7px;
            padding: 8px;
          }

          .vpSpotPrimaryButton,
          .vpSpotDangerButton {
            min-height: 50px;
            font-size: 16px;
            padding: 0 8px;
          }
        }

        @media (min-width: 768px) {
          .vpSpotPreview {
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 24px;
            box-sizing: border-box;
            background:
              radial-gradient(circle at 50% 12%, rgba(248, 113, 113, 0.10), transparent 38%),
              radial-gradient(circle at 50% 50%, rgba(15, 23, 42, 0.2), transparent 58%),
              rgba(2, 8, 15, 0.58);
            backdrop-filter: blur(2px);
          }

          .vpSpotPanelFrame {
            position: relative;
            width: min(86vw, 760px);
            height: min(78dvh, 680px);
            max-height: calc(100dvh - 96px);
            display: flex;
            justify-content: center;
            align-items: stretch;
          }

          .vpSpotCloseButton {
            position: absolute;
            top: -34px;
            right: -54px;
            left: auto;
            width: 44px;
            height: 44px;
            border-radius: 15px;
          }

          .vpSpotPanelShell {
            width: 100%;
            height: 100%;
            max-height: calc(100dvh - 96px);
            padding: 14px;
            display: flex;
            flex-direction: column;
            gap: 12px;
            background: rgba(3, 10, 18, 0.82);
            border: 1px solid rgba(148, 163, 184, 0.14);
            border-radius: 28px;
            box-shadow: 0 24px 80px rgba(0, 0, 0, 0.34);
            backdrop-filter: blur(6px);
            overflow: hidden;
            box-sizing: border-box;
          }

          .vpSpotCard,
          .vpSpotFooter {
            background: rgba(10, 18, 30, 0.82);
            border: 1px solid rgba(148, 163, 184, 0.18);
          }

          .vpSpotHeaderCard {
            flex: 0 0 auto;
            min-height: 92px;
            padding: 16px 18px;
            border-radius: 18px;
            gap: 16px;
          }

          .vpSpotPinIcon {
            width: 52px;
            height: 52px;
          }

          .vpSpotPinIcon svg {
            width: 32px;
            height: 32px;
          }

          .vpSpotHeaderText span {
            font-size: 12px;
          }

          .vpSpotHeaderText strong {
            font-size: 27px;
          }

          .vpSpotCoordinatesRow small {
            font-size: 14px;
          }

          .vpSpotDataButton {
            height: 42px;
            border-radius: 13px;
            padding: 0 14px;
            font-size: 14px;
          }

          .vpSpotCapturesBlock {
            flex: 1 1 auto;
            min-height: 0;
            max-height: none;
            overflow: hidden;
            border-radius: 18px;
            padding: 12px;
          }

          .vpSpotSectionTitle {
            font-size: 15px;
            min-height: 30px;
            padding: 0 2px 2px;
          }

          .vpSpotCapturesScroll {
            flex: 1 1 auto;
            min-height: 0;
            overflow-y: auto;
          }

          .vpSpotCapturesList {
            gap: 10px;
          }

          .vpSpotCaptureCard {
            min-height: 112px;
            border-radius: 18px;
            padding: 10px 14px;
            gap: 16px;
          }

          .vpSpotFishThumb {
            width: 132px;
            height: 86px;
            border-radius: 16px;
          }

          .vpSpotCaptureText > strong {
            font-size: 22px;
          }

          .vpSpotCaptureMeta {
            column-gap: 26px;
            font-size: 15px;
          }

          .vpSpotFooter {
            flex: 0 0 auto;
            border-radius: 18px;
            gap: 14px;
            padding: 10px;
            margin-top: 0;
            box-sizing: border-box;
          }

          .vpSpotPrimaryButton,
          .vpSpotDangerButton {
            min-height: 56px;
            border-radius: 15px;
            font-size: 18px;
          }
        }

        @media (max-width: 767px) {
          .vpSpotHeaderCard {
            min-height: 132px !important;
            display: block !important;
            padding: 14px 16px !important;
            border-radius: 18px !important;
          }

          .vpSpotHeaderDesktop {
            display: none !important;
          }

          .vpSpotHeaderMobile {
            display: flex !important;
            flex-direction: column !important;
            gap: 10px !important;
          }

          .vpSpotMobileTop {
            display: grid !important;
            grid-template-columns: 48px minmax(0, 1fr) !important;
            align-items: center !important;
            gap: 12px !important;
          }

          .vpSpotMobilePinIcon {
            width: 46px !important;
            height: 46px !important;
            transform: translateY(-24px) !important;
            border-radius: 999px !important;
            color: #fb7185 !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            background: rgba(248, 113, 113, 0.12) !important;
            box-shadow: 0 0 22px rgba(248, 113, 113, 0.18) !important;
          }

          .vpSpotMobilePinIcon svg {
            width: 29px !important;
            height: 29px !important;
          }

          .vpSpotMobileText {
            min-width: 0 !important;
            padding-right: 68px !important;
            display: flex !important;
            flex-direction: column !important;
            gap: 4px !important;
          }

          .vpSpotMobileText span {
            color: rgba(226, 232, 240, 0.72) !important;
            font-size: 11px !important;
            line-height: 1 !important;
            letter-spacing: 0.08em !important;
            text-transform: uppercase !important;
            font-weight: 620 !important;
          }

          .vpSpotMobileText strong {
            color: #fb7185 !important;
            font-size: clamp(22px, 6vw, 27px) !important;
            line-height: 1.08 !important;
            font-weight: 700 !important;
            white-space: nowrap !important;
            overflow: hidden !important;
            text-overflow: ellipsis !important;
            letter-spacing: -0.025em !important;
          }

          .vpSpotMobileCoordinates {
            display: flex !important;
            align-items: center !important;
            gap: 8px !important;
            flex-wrap: wrap !important;
          }

          .vpSpotMobileCoordinates small {
            max-width: calc(100vw - 220px) !important;
            color: rgba(226, 232, 240, 0.74) !important;
            font-size: 14px !important;
            line-height: 1.1 !important;
            white-space: nowrap !important;
            overflow: hidden !important;
            text-overflow: ellipsis !important;
          }

          .vpSpotMobileCopyButton {
            min-width: 108px !important;
            height: 38px !important;
            border: 1px solid rgba(56, 189, 248, 0.36) !important;
            border-radius: 14px !important;
            background: rgba(14, 165, 233, 0.08) !important;
            color: #7dd3fc !important;
            display: inline-flex !important;
            align-items: center !important;
            justify-content: center !important;
            gap: 6px !important;
            padding: 0 11px !important;
            font-size: 12px !important;
            font-weight: 560 !important;
            cursor: pointer !important;
            white-space: nowrap !important;
          }

          .vpSpotMobileCopyButton svg {
            width: 17px !important;
            height: 17px !important;
          }

          .vpSpotMobileCopyButton span {
            display: inline !important;
            white-space: nowrap !important;
          }

          .vpSpotMobileCopyButton.isCopied {
            min-width: 126px !important;
            border-color: rgba(34, 197, 94, 0.48) !important;
            background: rgba(34, 197, 94, 0.12) !important;
            color: #86efac !important;
            box-shadow: 0 0 18px rgba(34, 197, 94, 0.14) !important;
          }

          .vpSpotMobileDataButton {
            align-self: flex-end !important;
            min-width: 150px !important;
            height: 44px !important;
            border: 1px solid rgba(56, 189, 248, 0.36) !important;
            border-radius: 15px !important;
            background: rgba(14, 165, 233, 0.08) !important;
            color: #7dd3fc !important;
            display: inline-flex !important;
            align-items: center !important;
            justify-content: center !important;
            gap: 8px !important;
            padding: 0 14px !important;
            font-size: 13px !important;
            font-weight: 720 !important;
            cursor: pointer !important;
            white-space: nowrap !important;
          }

          .vpSpotMobileDataButton svg {
            width: 20px !important;
            height: 20px !important;
          }

          .vpSpotMobileDataButton span {
            display: inline !important;
          }
        }
      `}</style>
    </section>
  );
}