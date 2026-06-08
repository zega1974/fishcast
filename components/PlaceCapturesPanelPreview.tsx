'use client';

import type React from 'react';
import { useState } from 'react';

type PreviewCapture = {
  id: string;
  species: string;
  weight: string;
  size: string;
  date: string;
  time: string;
  kind: 'peva' | 'flecha' | 'sargo';
};

type PlaceCapturesPanelPreviewProps = {
  onClose?: () => void;
};

type IconProps = {
  className?: string;
};

const previewCoordinates = '-25.823456, -48.536789';

const captures: PreviewCapture[] = [
  {
    id: '1',
    species: 'Robalo Peva',
    weight: '1,2 kg',
    size: '48 cm',
    date: '02/06/2026',
    time: '15h30',
    kind: 'peva',
  },
  {
    id: '2',
    species: 'Robalo Flecha',
    weight: '3,8 kg',
    size: '72 cm',
    date: '29/05/2026',
    time: '11h',
    kind: 'flecha',
  },
  {
    id: '3',
    species: 'Sargo',
    weight: '0,9 kg',
    size: '34 cm',
    date: '27/05/2026',
    time: '10h40',
    kind: 'sargo',
  },
];

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
  return <div className={`vpPlaceCard ${className}`}>{children}</div>;
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

function PlaceCopyButton({ coordinates }: { coordinates: string }) {
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
      className={`vpPlaceCopyButton ${copied ? 'isCopied' : ''}`}
      type="button"
      onClick={copyCoords}
      aria-live="polite"
    >
      <CopyIcon />
      <span>{copied ? 'Copiado!' : 'Copiar'}</span>
    </button>
  );
}

function PlaceMobileCopyButton({ coordinates }: { coordinates: string }) {
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
      className={`vpPlaceMobileCopyButton ${copied ? 'isCopied' : ''}`}
      type="button"
      onClick={copyCoords}
      aria-live="polite"
    >
      <CopyIcon />
      <span>{copied ? 'Copiado!' : 'Copiar'}</span>
    </button>
  );
}

function FishThumb({ kind }: { kind: PreviewCapture['kind'] }) {
  const isSargo = kind === 'sargo';
  const isFlecha = kind === 'flecha';

  return (
    <div className="vpPlaceFishThumb">
      <div className="vpPlaceFishThumbBg" />

      <svg viewBox="0 0 150 84" className="vpPlaceFishDrawing" aria-hidden="true">
        <path
          d={
            isSargo
              ? 'M34 43 C45 20 86 18 113 42 C91 66 50 68 34 43 Z'
              : isFlecha
                ? 'M25 43 C46 19 96 18 126 42 C96 67 49 66 25 43 Z'
                : 'M28 44 C47 22 91 20 119 43 C91 66 50 65 28 44 Z'
          }
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
        {isSargo ? (
          <>
            <path
              d="M66 30 L76 8 L87 31 Z"
              fill="rgba(241,245,249,0.62)"
              stroke="rgba(255,255,255,0.26)"
              strokeWidth="1"
            />
            <path d="M74 31 L76 64" stroke="rgba(15,23,42,0.22)" strokeWidth="2" />
          </>
        ) : null}
      </svg>

      <div className="vpPlaceFishThumbShade" />
    </div>
  );
}

function PlaceHeaderCard() {
  return (
    <CardShell className="vpPlaceHeaderCard">
      <div className="vpPlaceHeaderDesktop">
        <div className="vpPlacePinIcon">
          <PinIcon />
        </div>

        <div className="vpPlaceHeaderText">
          <span>Meu Lugar</span>
          <strong>Pontal de Matinhos</strong>

          <div className="vpPlaceCoordinatesRow">
            <small>{previewCoordinates}</small>
            <PlaceCopyButton coordinates={previewCoordinates} />
          </div>
        </div>

        <button
          className="vpPlaceDataButton"
          type="button"
          onClick={() => console.log('Preview: abrir Dados do Spot')}
        >
          <ChartIcon />
          <span>Dados do Spot</span>
        </button>
      </div>

      <div className="vpPlaceHeaderMobile">
        <div className="vpPlaceMobileTop">
          <div className="vpPlaceMobilePinIcon">
            <PinIcon />
          </div>

          <div className="vpPlaceMobileText">
            <span>Meu Lugar</span>
            <strong>Pontal de Matinhos</strong>

            <div className="vpPlaceMobileCoordinates">
              <small>{previewCoordinates}</small>
              <PlaceMobileCopyButton coordinates={previewCoordinates} />
            </div>
          </div>
        </div>

        <button
          className="vpPlaceMobileDataButton"
          type="button"
          onClick={() => console.log('Preview: abrir Dados do Spot')}
        >
          <ChartIcon />
          <span>Dados do Spot</span>
        </button>
      </div>
    </CardShell>
  );
}

function CaptureCard({ capture }: { capture: PreviewCapture }) {
  const bullet = String.fromCharCode(8226);

  return (
    <article className="vpPlaceCaptureCard">
      <FishThumb kind={capture.kind} />

      <div className="vpPlaceCaptureText">
        <strong>{capture.species}</strong>

        <div className="vpPlaceCaptureMeta">
          <span>
            <WeightIcon />
            {capture.weight}
          </span>

          <span>
            <RulerIcon />
            {capture.size}
          </span>

          <span className="vpPlaceDateMeta">
            <CalendarIcon />
            {capture.date}
            <em>{bullet}</em>
            {capture.time}
          </span>
        </div>
      </div>
    </article>
  );
}

function CapturesBlock() {
  return (
    <CardShell className="vpPlaceCapturesBlock">
      <div className="vpPlaceSectionTitle">
        <FishIcon />
        <span>Capturas neste lugar</span>
      </div>

      <div className="vpPlaceCapturesScroll">
        <div className="vpPlaceCapturesList">
          {captures.map((capture) => (
            <CaptureCard key={capture.id} capture={capture} />
          ))}
        </div>
      </div>
    </CardShell>
  );
}

function FooterActions() {
  return (
    <div className="vpPlaceFooter">
      <button className="vpPlacePrimaryButton" type="button">
        + Captura
      </button>

      <button className="vpPlaceDangerButton" type="button">
        <TrashIcon />
        <span>Apagar Lugar</span>
      </button>
    </div>
  );
}

export default function PlaceCapturesPanelPreview({
  onClose,
}: PlaceCapturesPanelPreviewProps) {
  return (
    <section className="vpPlacePreview" aria-label="Preview Meu Lugar com Capturas">
      <div className="vpPlacePanelFrame">
        <button
          className="vpPlaceCloseButton"
          type="button"
          aria-label="Fechar"
          onClick={onClose}
        >
          <CloseIcon />
        </button>

        <main className="vpPlacePanelShell">
          <PlaceHeaderCard />
          <CapturesBlock />
          <FooterActions />
        </main>
      </div>

      <style jsx global>{`
        .vpPlacePreview {
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

        .vpPlaceCloseButton {
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

        .vpPlaceCloseButton svg {
          width: 25px;
          height: 25px;
        }

        .vpPlacePanelShell {
          width: min(100vw, 460px);
          height: 100dvh;
          margin: 0 auto;
          padding: max(10px, env(safe-area-inset-top)) 12px max(10px, env(safe-area-inset-bottom));
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
          gap: 7px;
        }

        .vpPlaceCard,
        .vpPlaceFooter {
          background: linear-gradient(135deg, rgba(23, 31, 42, 0.88), rgba(10, 16, 23, 0.94));
          border: 1px solid rgba(148, 163, 184, 0.2);
          box-shadow:
            inset 0 1px 0 rgba(255, 255, 255, 0.035),
            0 14px 34px rgba(0, 0, 0, 0.18);
          backdrop-filter: blur(14px);
        }

        .vpPlaceHeaderCard {
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

        .vpPlaceHeaderDesktop {
          display: contents;
        }

        .vpPlaceHeaderMobile {
          display: none;
        }

        .vpPlacePinIcon {
          width: 44px;
          height: 44px;
          border-radius: 999px;
          color: #38bdf8;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(14, 165, 233, 0.12);
          box-shadow: 0 0 22px rgba(14, 165, 233, 0.18);
        }

        .vpPlacePinIcon svg {
          width: 28px;
          height: 28px;
        }

        .vpPlaceHeaderText {
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .vpPlaceHeaderText span {
          color: rgba(226, 232, 240, 0.72);
          font-size: 11px;
          line-height: 1;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          font-weight: 620;
        }

        .vpPlaceHeaderText strong {
          color: #38bdf8;
          font-size: clamp(18px, 4.8vw, 22px);
          line-height: 1.12;
          font-weight: 700;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          letter-spacing: -0.025em;
        }

        .vpPlaceCoordinatesRow {
          min-width: 0;
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }

        .vpPlaceCoordinatesRow small {
          color: rgba(226, 232, 240, 0.74);
          font-size: clamp(12px, 3.15vw, 14px);
          line-height: 1.1;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .vpPlaceCopyButton {
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

        .vpPlaceCopyButton svg {
          width: 17px;
          height: 17px;
        }

        .vpPlaceCopyButton.isCopied {
          border-color: rgba(34, 197, 94, 0.48);
          background: rgba(34, 197, 94, 0.12);
          color: #86efac;
          box-shadow: 0 0 18px rgba(34, 197, 94, 0.14);
        }

        .vpPlaceDataButton {
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

        .vpPlaceDataButton svg {
          width: 18px;
          height: 18px;
        }

        .vpPlaceCapturesBlock {
          flex: 1 1 auto;
          min-height: 0;
          border-radius: 18px;
          padding: 10px;
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .vpPlaceSectionTitle {
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

        .vpPlaceSectionTitle svg {
          width: 24px;
          height: 24px;
          color: #7dd3fc;
        }

        .vpPlaceCapturesScroll {
          flex: 1 1 auto;
          min-height: 0;
          overflow-y: auto;
          padding-right: 2px;
          scrollbar-color: rgba(125, 211, 252, 0.45) rgba(15, 23, 42, 0.55);
          scrollbar-width: thin;
        }

        .vpPlaceCapturesList {
          display: flex;
          flex-direction: column;
          gap: 8px;
          padding-bottom: 2px;
        }

        .vpPlaceCaptureCard {
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
        }

        .vpPlaceFishThumb {
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

        .vpPlaceFishThumbBg {
          position: absolute;
          inset: 0;
          background:
            radial-gradient(circle at 25% 35%, rgba(14, 165, 233, 0.36), transparent 36%),
            linear-gradient(135deg, rgba(12, 74, 110, 0.82), rgba(2, 6, 23, 0.95));
        }

        .vpPlaceFishDrawing {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
        }

        .vpPlaceFishThumbShade {
          position: absolute;
          inset: auto 0 0;
          height: 28px;
          background: linear-gradient(to top, rgba(2, 6, 23, 0.76), transparent);
        }

        .vpPlaceCaptureText {
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .vpPlaceCaptureText > strong {
          color: #ffffff;
          font-size: clamp(18px, 4.65vw, 22px);
          line-height: 1.05;
          font-weight: 760;
          letter-spacing: -0.025em;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .vpPlaceCaptureMeta {
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

        .vpPlaceCaptureMeta span {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          min-width: 0;
        }

        .vpPlaceCaptureMeta svg {
          width: 17px;
          height: 17px;
          color: #7dd3fc;
          flex: 0 0 auto;
        }

        .vpPlaceDateMeta {
          color: rgba(226, 232, 240, 0.83);
        }

        .vpPlaceDateMeta em {
          font-style: normal;
          color: rgba(226, 232, 240, 0.58);
          margin: 0 1px;
        }

        .vpPlaceFooter {
          flex: 0 0 auto;
          border-radius: 16px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 9px;
          padding: 9px;
          box-sizing: border-box;
        }

        .vpPlacePrimaryButton,
        .vpPlaceDangerButton {
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

        .vpPlacePrimaryButton {
          color: #ffffff;
          background: linear-gradient(135deg, rgba(37, 99, 235, 0.96), rgba(29, 78, 216, 0.9));
          border-color: rgba(125, 211, 252, 0.42);
          box-shadow:
            0 0 28px rgba(37, 99, 235, 0.28),
            inset 0 1px 0 rgba(255, 255, 255, 0.16);
        }

        .vpPlaceDangerButton {
          color: #fecaca;
          background: linear-gradient(135deg, rgba(69, 10, 10, 0.82), rgba(35, 6, 13, 0.88));
          border-color: rgba(248, 113, 113, 0.42);
          box-shadow:
            0 0 24px rgba(239, 68, 68, 0.14),
            inset 0 1px 0 rgba(255, 255, 255, 0.08);
        }

        .vpPlaceDangerButton svg {
          width: 19px;
          height: 19px;
        }

        .vpPlacePinIcon svg,
        .vpPlaceDataButton svg,
        .vpPlaceCopyButton svg,
        .vpPlaceSectionTitle svg,
        .vpPlaceCaptureMeta svg,
        .vpPlaceDangerButton svg,
        .vpPlaceCloseButton svg {
          fill: none;
          stroke: currentColor;
          stroke-width: 3;
          stroke-linecap: round;
          stroke-linejoin: round;
        }

        @media (max-width: 420px) {
          .vpPlacePanelShell {
            gap: 6px;
            padding-left: 10px;
            padding-right: 10px;
          }

          .vpPlaceCaptureCard {
            min-height: 92px;
            gap: 10px;
            padding: 8px;
          }

          .vpPlaceCaptureText {
            gap: 10px;
          }

          .vpPlaceCaptureMeta {
            column-gap: 12px;
          }

          .vpPlaceFooter {
            gap: 7px;
            padding: 8px;
          }

          .vpPlacePrimaryButton,
          .vpPlaceDangerButton {
            min-height: 50px;
            font-size: 16px;
            padding: 0 8px;
          }
        }

        @media (min-width: 768px) {
          .vpPlacePreview {
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

          .vpPlacePanelFrame {
            position: relative;
            width: min(86vw, 760px);
            height: auto;
            max-height: calc(100dvh - 96px);
            display: flex;
            justify-content: center;
            align-items: stretch;
          }

          .vpPlaceCloseButton {
            position: absolute;
            top: -34px;
            right: -54px;
            left: auto;
            width: 44px;
            height: 44px;
            border-radius: 15px;
          }

          .vpPlacePanelShell {
            width: 100%;
            height: auto;
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

          .vpPlaceCard,
          .vpPlaceFooter {
            background: rgba(10, 18, 30, 0.82);
            border: 1px solid rgba(148, 163, 184, 0.18);
          }

          .vpPlaceHeaderCard {
            flex: 0 0 auto;
            min-height: 92px;
            padding: 16px 18px;
            border-radius: 18px;
            gap: 16px;
          }

          .vpPlacePinIcon {
            width: 52px;
            height: 52px;
          }

          .vpPlacePinIcon svg {
            width: 32px;
            height: 32px;
          }

          .vpPlaceHeaderText span {
            font-size: 12px;
          }

          .vpPlaceHeaderText strong {
            font-size: 27px;
          }

          .vpPlaceCoordinatesRow small {
            font-size: 14px;
          }

          .vpPlaceDataButton {
            height: 42px;
            border-radius: 13px;
            padding: 0 14px;
            font-size: 14px;
          }

          .vpPlaceCapturesBlock {
            flex: 1 1 auto;
            min-height: 0;
            max-height: none;
            overflow: hidden;
            border-radius: 18px;
            padding: 12px;
          }

          .vpPlaceSectionTitle {
            font-size: 15px;
            min-height: 30px;
            padding: 0 2px 2px;
          }

          .vpPlaceCapturesScroll {
            flex: 1 1 auto;
            min-height: 0;
            overflow-y: auto;
          }

          .vpPlaceCapturesList {
            gap: 10px;
          }

          .vpPlaceCaptureCard {
            min-height: 112px;
            border-radius: 18px;
            padding: 10px 14px;
            gap: 16px;
          }

          .vpPlaceFishThumb {
            width: 132px;
            height: 86px;
            border-radius: 16px;
          }

          .vpPlaceCaptureText > strong {
            font-size: 22px;
          }

          .vpPlaceCaptureMeta {
            column-gap: 26px;
            font-size: 15px;
          }

          .vpPlaceFooter {
            flex: 0 0 auto;
            border-radius: 18px;
            gap: 14px;
            padding: 10px;
            margin-top: 0;
            box-sizing: border-box;
          }

          .vpPlacePrimaryButton,
          .vpPlaceDangerButton {
            min-height: 56px;
            border-radius: 15px;
            font-size: 18px;
          }
        }

        @media (max-width: 767px) {
          .vpPlaceHeaderCard {
            min-height: 132px !important;
            display: block !important;
            padding: 14px 16px !important;
            border-radius: 18px !important;
          }

          .vpPlaceHeaderDesktop {
            display: none !important;
          }

          .vpPlaceHeaderMobile {
            display: flex !important;
            flex-direction: column !important;
            gap: 10px !important;
          }

          .vpPlaceMobileTop {
            display: grid !important;
            grid-template-columns: 48px minmax(0, 1fr) !important;
            align-items: center !important;
            gap: 12px !important;
          }

          .vpPlaceMobilePinIcon {
            width: 46px !important;
            height: 46px !important;
            transform: translateY(-24px) !important;
            border-radius: 999px !important;
            color: #38bdf8 !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            background: rgba(14, 165, 233, 0.12) !important;
            box-shadow: 0 0 22px rgba(14, 165, 233, 0.18) !important;
          }

          .vpPlaceMobilePinIcon svg {
            width: 29px !important;
            height: 29px !important;
          }

          .vpPlaceMobileText {
            min-width: 0 !important;
            padding-right: 68px !important;
            display: flex !important;
            flex-direction: column !important;
            gap: 4px !important;
          }

          .vpPlaceMobileText span {
            color: rgba(226, 232, 240, 0.72) !important;
            font-size: 11px !important;
            line-height: 1 !important;
            letter-spacing: 0.08em !important;
            text-transform: uppercase !important;
            font-weight: 620 !important;
          }

          .vpPlaceMobileText strong {
            color: #38bdf8 !important;
            font-size: clamp(22px, 6vw, 27px) !important;
            line-height: 1.08 !important;
            font-weight: 700 !important;
            white-space: nowrap !important;
            overflow: hidden !important;
            text-overflow: ellipsis !important;
            letter-spacing: -0.025em !important;
          }

          .vpPlaceMobileCoordinates {
            display: flex !important;
            align-items: center !important;
            gap: 8px !important;
            flex-wrap: wrap !important;
          }

          .vpPlaceMobileCoordinates small {
            max-width: calc(100vw - 220px) !important;
            color: rgba(226, 232, 240, 0.74) !important;
            font-size: 14px !important;
            line-height: 1.1 !important;
            white-space: nowrap !important;
            overflow: hidden !important;
            text-overflow: ellipsis !important;
          }

          .vpPlaceMobileCopyButton {
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

          .vpPlaceMobileCopyButton svg {
            width: 17px !important;
            height: 17px !important;
          }

          .vpPlaceMobileCopyButton span {
            display: inline !important;
            white-space: nowrap !important;
          }

          .vpPlaceMobileCopyButton.isCopied {
            min-width: 126px !important;
            border-color: rgba(34, 197, 94, 0.48) !important;
            background: rgba(34, 197, 94, 0.12) !important;
            color: #86efac !important;
            box-shadow: 0 0 18px rgba(34, 197, 94, 0.14) !important;
          }

          .vpPlaceMobileDataButton {
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

          .vpPlaceMobileDataButton svg {
            width: 20px !important;
            height: 20px !important;
          }

          .vpPlaceMobileDataButton span {
            display: inline !important;
          }
        }
      `}</style>
    </section>
  );
}
