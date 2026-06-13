'use client';

/* eslint-disable @next/next/no-img-element */

import type React from 'react';
import { useEffect, useState } from 'react';
import type { Capture, CaptureShareMode } from '@/components/captures/types';

type IconProps = {
  className?: string;
};

type CaptureDetailPanelPreviewProps = {
  capture?: Capture | null;
  placeLabel?: string | null;
  coordinatesText?: string | null;
  formattedDate?: string | null;
  shareFeedback?: string | null;
  shareOptionsOpen?: boolean;
  onClose?: () => void;
  onToggleShareOptions?: () => void;
  onShare?: (shareMode: CaptureShareMode) => void;
  onDelete?: () => void;
};

type PhotoOrientation = 'unknown' | 'portrait' | 'landscape' | 'square';

type PhotoMetrics = {
  orientation: PhotoOrientation;
  aspectRatio: string;
  ratioNumber: string;
};

function getPhotoOrientation(width: number, height: number): PhotoOrientation {
  if (!width || !height) {
    return 'unknown';
  }

  const ratio = width / height;

  if (ratio > 1.12) {
    return 'landscape';
  }

  if (ratio < 0.88) {
    return 'portrait';
  }

  return 'square';
}

function getPhotoMetrics(width: number, height: number): PhotoMetrics {
  if (!width || !height) {
    return {
      orientation: 'unknown',
      aspectRatio: '4 / 3',
      ratioNumber: '1.333333',
    };
  }

  return {
    orientation: getPhotoOrientation(width, height),
    aspectRatio: `${width} / ${height}`,
    ratioNumber: `${width / height}`,
  };
}

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

function LureIcon(props: IconProps) {
  return (
    <SvgBase {...props}>
      <path d="M13 29c7-13 17-18 22-13s0 15-13 22c-4 2-8 1-10-1s-1-5 1-8Z" />
      <path d="M29 16c1 5 3 8 8 10" />
      <path d="M15 33c-3 2-4 5-2 7" />
      <circle cx="28" cy="23" r="1.5" />
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

function NotesIcon(props: IconProps) {
  return (
    <SvgBase {...props}>
      <rect x="11" y="8" width="26" height="32" rx="4" />
      <path d="M18 18h12" />
      <path d="M18 25h12" />
      <path d="M18 32h7" />
    </SvgBase>
  );
}

function ShareIcon(props: IconProps) {
  return (
    <SvgBase {...props}>
      <circle cx="18" cy="24" r="5" />
      <circle cx="34" cy="14" r="5" />
      <circle cx="34" cy="34" r="5" />
      <path d="M22.5 21.5 29.5 16.5" />
      <path d="M22.5 26.5 29.5 31.5" />
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
  ...props
}: {
  children: React.ReactNode;
  className?: string;
} & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`vpCaptureDetailCard ${className}`} {...props}>
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

function CaptureCopyButton({ coordinates }: { coordinates: string }) {
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
      className={`vpCaptureDetailCopyButton ${copied ? 'isCopied' : ''}`}
      type="button"
      onClick={copyCoords}
      aria-live="polite"
    >
      <CopyIcon />
      <span>{copied ? 'Copiado!' : 'Copiar'}</span>
    </button>
  );
}

function StatCard({
  label,
  value,
  icon,
  className = '',
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  className?: string;
}) {
  return (
    <article className={`vpCaptureDetailStatCard ${className}`}>
      <div className="vpCaptureDetailStatIcon">{icon}</div>
      <div className="vpCaptureDetailStatText">
        <span>{label}</span>
        <strong>{value}</strong>
      </div>
    </article>
  );
}

function CaptureHeaderCard({
  species,
  placeLabel,
  coordinates,
}: {
  species: string;
  placeLabel: string;
  coordinates: string;
}) {
  return (
    <CardShell className="vpCaptureDetailHeaderCard">
      <div className="vpCaptureDetailPinIcon">
        <PinIcon />
      </div>

      <div className="vpCaptureDetailHeaderText">
        <span>Minha captura</span>
        <strong>{species}</strong>

        <div className="vpCaptureDetailPlaceLine">
          <small>{placeLabel}</small>
        </div>

        <div className="vpCaptureDetailCoordinatesRow">
          <small>{coordinates}</small>
          <CaptureCopyButton coordinates={coordinates} />
        </div>
      </div>
    </CardShell>
  );
}

export default function CaptureDetailPanelPreview({
  capture,
  placeLabel,
  coordinatesText,
  formattedDate,
  shareFeedback,
  shareOptionsOpen = false,
  onClose,
  onToggleShareOptions,
  onShare,
  onDelete,
}: CaptureDetailPanelPreviewProps) {
  const [photoMetrics, setPhotoMetrics] = useState<PhotoMetrics>({
    orientation: 'unknown',
    aspectRatio: '4 / 3',
    ratioNumber: '1.333333',
  });
  const [isPhotoViewerOpen, setIsPhotoViewerOpen] = useState(false);
  const [photoViewerRotation, setPhotoViewerRotation] = useState(0);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPhotoMetrics({
      orientation: 'unknown',
      aspectRatio: '4 / 3',
      ratioNumber: '1.333333',
    });
    setIsPhotoViewerOpen(false);
    setPhotoViewerRotation(0);
  }, [capture?.photo]);

  const species = capture ? capture.species || 'Espécie não informada' : 'Robalo';
  const weight = capture ? (capture.weight ? `${capture.weight} kg` : '--') : '12 kg';
  const size = capture ? (capture.size ? `${capture.size} cm` : '--') : '103 cm';
  const bait = capture ? capture.bait || '--' : 'Meia água';
  const comment = capture
    ? capture.comment || 'Sem observações adicionadas.'
    : 'Sem observações adicionadas.';
  const capturePlaceLabel = placeLabel || 'Ponto sem nome';
  const captureCoordinatesText = coordinatesText || '-26.096255, -47.971802';
  const captureFormattedDate = formattedDate || '23/02/2026 - 15h30';
  const photoOrientationClass =
    photoMetrics.orientation === 'portrait'
      ? 'isPortrait'
      : photoMetrics.orientation === 'landscape'
        ? 'isLandscape'
        : photoMetrics.orientation === 'square'
          ? 'isSquare'
          : 'isUnknown';
  const photoCardStyle = {
    '--vp-capture-photo-ratio': photoMetrics.aspectRatio,
    '--vp-capture-photo-factor': photoMetrics.ratioNumber,
  } as React.CSSProperties;

  const openPhotoViewer = () => {
    if (!capture?.photo) {
      return;
    }

    const isMobileViewport = window.matchMedia('(max-width: 767px)').matches;

    setPhotoViewerRotation(
      isMobileViewport && photoMetrics.orientation === 'landscape' ? -90 : 0,
    );

    setIsPhotoViewerOpen(true);
  };

  const closePhotoViewer = () => {
    setIsPhotoViewerOpen(false);
    setPhotoViewerRotation(0);
  };

  const isPhotoViewerRotated = photoViewerRotation !== 0;

  return (
    <section className="vpCaptureDetailPreview map-control-overlay" aria-label="Minha Captura">
      <div className="vpCaptureDetailPanelFrame">
        <button
          className="vpCaptureDetailCloseButton"
          type="button"
          aria-label="Fechar"
          onClick={onClose}
        >
          <CloseIcon />
        </button>

        <main className="vpCaptureDetailPanelShell">
          <CaptureHeaderCard
            species={species}
            placeLabel={capturePlaceLabel}
            coordinates={captureCoordinatesText}
          />

          <div className={`vpCaptureDetailBodyScroll ${photoOrientationClass}`}>
            <CardShell
              className={`vpCaptureDetailPhotoCard ${photoOrientationClass}`}
              aria-label="Foto da captura"
              role={capture?.photo ? 'button' : undefined}
              tabIndex={capture?.photo ? 0 : undefined}
              style={photoCardStyle}
              onClick={() => {
                openPhotoViewer();
              }}
              onKeyDown={(event) => {
                if (!capture?.photo) return;
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  openPhotoViewer();
                }
              }}
            >
              {capture?.photo ? (
                <div className="vpCaptureDetailPhotoRealFrame">
                  <img
                    className="vpCaptureDetailPhotoBlur"
                    src={capture.photo}
                    alt=""
                    aria-hidden="true"
                  />
                  <img
                    className="vpCaptureDetailPhotoImage"
                    src={capture.photo}
                    alt="Foto da captura"
                    onLoad={(event) => {
                      const image = event.currentTarget;
                      setPhotoMetrics(getPhotoMetrics(image.naturalWidth, image.naturalHeight));
                    }}
                  />
                </div>
              ) : (
                <div className="vpCaptureDetailPhotoMock">
                  <div className="vpCaptureDetailPhotoSky" />
                  <div className="vpCaptureDetailPhotoGrass" />
                  <div className="vpCaptureDetailPhotoPerson" />
                  <div className="vpCaptureDetailPhotoFish" />
                  <div className="vpCaptureDetailPhotoFishLine" />
                  <span>{capture ? 'Sem foto salva' : 'Foto da captura'}</span>
                </div>
              )}
              {capture?.photo && (
                <span className="vpCaptureDetailPhotoHint" aria-hidden="true">
                  Ampliar foto
                </span>
              )}
            </CardShell>

            <CardShell className="vpCaptureDetailInfoArea" aria-label="Dados da captura">
              <div className="vpCaptureDetailStatsGrid">
                <StatCard label="Peso" value={weight} icon={<WeightIcon />} />
                <StatCard label="Tamanho" value={size} icon={<RulerIcon />} />
                <StatCard
                  label="Isca"
                  value={bait}
                  icon={<LureIcon />}
                  className="vpCaptureDetailFull"
                />
                <StatCard
                  label="Data / hora"
                  value={captureFormattedDate}
                  icon={<CalendarIcon />}
                  className="vpCaptureDetailFull"
                />
                <StatCard
                  label="Observações"
                  value={comment}
                  icon={<NotesIcon />}
                  className="vpCaptureDetailFull"
                />
              </div>
            </CardShell>
          </div>

          <div className="vpCaptureDetailFooter">
            <button
              className="vpCaptureDetailShareButton"
              type="button"
              onClick={onToggleShareOptions}
            >
              <ShareIcon />
              <span>{shareFeedback || 'Compartilhar'}</span>
            </button>

            <button className="vpCaptureDetailDeleteButton" type="button" onClick={onDelete}>
              <TrashIcon />
              <span>Apagar</span>
            </button>

            {shareOptionsOpen && (
              <div className="vpCaptureDetailShareOptions">
                <button type="button" onClick={() => onShare?.('secret')}>
                  Secreto
                </button>
                <button type="button" onClick={() => onShare?.('complete')}>
                  Completo
                </button>
              </div>
            )}
          </div>
        </main>

        {capture?.photo && isPhotoViewerOpen && (
          <div
            className="vpCaptureDetailPhotoViewer"
            role="dialog"
            aria-modal="true"
            aria-label="Foto da captura em tela cheia"
            onClick={closePhotoViewer}
          >
            <button
              className="vpCaptureDetailPhotoViewerClose"
              type="button"
              aria-label="Fechar foto"
              onClick={closePhotoViewer}
            >
              <CloseIcon />
            </button>

            <img
              className={`vpCaptureDetailPhotoViewerImage ${isPhotoViewerRotated ? 'isRotated' : ''}`}
              src={capture.photo}
              alt="Foto da captura em tela cheia"
              onClick={(event) => event.stopPropagation()}
              style={{
                transform: `rotate(${photoViewerRotation}deg)`,
              }}
            />
          </div>
        )}
      </div>

      <style jsx global>{`
        .vpCaptureDetailPreview {
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

        .vpCaptureDetailCloseButton {
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

        .vpCaptureDetailCloseButton svg {
          width: 25px;
          height: 25px;
        }

        .vpCaptureDetailPanelShell {
          width: min(100vw, 460px);
          height: 100dvh;
          margin: 0 auto;
          padding:
            max(10px, env(safe-area-inset-top))
            12px
            max(22px, calc(env(safe-area-inset-bottom) + 18px));
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
          gap: 7px;
        }

        .vpCaptureDetailCard,
        .vpCaptureDetailFooter {
          background: linear-gradient(135deg, rgba(23, 31, 42, 0.88), rgba(10, 16, 23, 0.94));
          border: 1px solid rgba(148, 163, 184, 0.2);
          box-shadow:
            inset 0 1px 0 rgba(255, 255, 255, 0.035),
            0 14px 34px rgba(0, 0, 0, 0.18);
          backdrop-filter: blur(14px);
        }

        .vpCaptureDetailHeaderCard {
          flex: 0 0 auto;
          border-radius: 18px;
          min-height: 112px;
          display: grid;
          grid-template-columns: auto minmax(0, 1fr);
          align-items: center;
          gap: 14px;
          padding: 14px 15px;
          box-sizing: border-box;
        }

        .vpCaptureDetailPinIcon {
          width: 52px;
          height: 52px;
          border-radius: 999px;
          color: #38bdf8;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(14, 165, 233, 0.12);
          box-shadow: 0 0 22px rgba(14, 165, 233, 0.18);
        }

        .vpCaptureDetailPinIcon svg {
          width: 32px;
          height: 32px;
        }

        .vpCaptureDetailHeaderText {
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .vpCaptureDetailHeaderText > span {
          color: rgba(226, 232, 240, 0.72);
          font-size: 11px;
          line-height: 1;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          font-weight: 720;
        }

        .vpCaptureDetailHeaderText > strong {
          color: #38bdf8;
          font-size: clamp(24px, 6.7vw, 31px);
          line-height: 1.04;
          font-weight: 760;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          letter-spacing: -0.032em;
        }

        .vpCaptureDetailPlaceLine {
          min-width: 0;
          display: flex;
          align-items: center;
          gap: 6px;
          margin-top: 1px;
        }

        .vpCaptureDetailPlaceLine small {
          min-width: 0;
          color: rgba(226, 232, 240, 0.78);
          font-size: clamp(13px, 3.35vw, 15px);
          line-height: 1.18;
          font-weight: 560;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .vpCaptureDetailCoordinatesRow {
          min-width: 0;
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
          margin-top: 2px;
        }

        .vpCaptureDetailCoordinatesRow small {
          color: rgba(226, 232, 240, 0.74);
          font-size: clamp(12px, 3.15vw, 14px);
          line-height: 1.1;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .vpCaptureDetailCopyButton {
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
          box-shadow: 0 0 16px rgba(14, 165, 233, 0.1);
          white-space: nowrap;
          transition:
            border-color 160ms ease,
            background 160ms ease,
            color 160ms ease,
            box-shadow 160ms ease;
        }

        .vpCaptureDetailCopyButton svg {
          width: 17px;
          height: 17px;
        }

        .vpCaptureDetailCopyButton.isCopied {
          border-color: rgba(34, 197, 94, 0.48);
          background: rgba(34, 197, 94, 0.12);
          color: #86efac;
          box-shadow: 0 0 18px rgba(34, 197, 94, 0.14);
        }

        .vpCaptureDetailBodyScroll {
          min-height: 0;
          display: contents;
        }

        .vpCaptureDetailPhotoCard {
          --vp-capture-photo-ratio: 4 / 3;
          --vp-capture-photo-factor: 1.333333;
          --vp-capture-photo-desktop-portrait-height: 430px;
          --vp-capture-photo-mobile-portrait-height: 360px;
          position: relative;
          flex: 0 0 auto;
          width: 100%;
          height: auto;
          min-height: 0;
          border-radius: 18px;
          padding: 8px;
          box-sizing: border-box;
          overflow: visible;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .vpCaptureDetailPhotoCard[role="button"] {
          cursor: zoom-in;
        }

        .vpCaptureDetailPhotoHint {
          position: absolute;
          right: 13px;
          bottom: 13px;
          z-index: 6;
          max-width: calc(100% - 26px);
          padding: 6px 9px;
          border-radius: 999px;
          border: 1px solid rgba(125, 211, 252, 0.24);
          background: rgba(2, 6, 23, 0.64);
          color: rgba(226, 232, 240, 0.88);
          box-shadow:
            0 10px 24px rgba(0, 0, 0, 0.26),
            inset 0 1px 0 rgba(255, 255, 255, 0.06);
          backdrop-filter: blur(10px);
          font-size: 10px;
          line-height: 1;
          font-weight: 720;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          pointer-events: none;
        }

        .vpCaptureDetailPhotoCard.isLandscape {
          width: 100%;
        }

        .vpCaptureDetailPhotoCard.isPortrait {
          width: min(
            100%,
            calc(var(--vp-capture-photo-desktop-portrait-height) * var(--vp-capture-photo-factor))
          );
          margin-left: auto;
          margin-right: auto;
        }

        .vpCaptureDetailPhotoCard.isSquare,
        .vpCaptureDetailPhotoCard.isUnknown {
          width: min(100%, 360px);
          margin-left: auto;
          margin-right: auto;
        }

        .vpCaptureDetailPhotoMock,
        .vpCaptureDetailPhotoRealFrame {
          position: relative;
          width: 100%;
          height: auto;
          aspect-ratio: var(--vp-capture-photo-ratio);
          min-height: 0;
          border-radius: 15px;
          overflow: hidden;
          border: 1px solid rgba(125, 211, 252, 0.18);
          background: #0f172a;
          box-shadow: 0 0 22px rgba(56, 189, 248, 0.1);
        }

        .vpCaptureDetailPhotoBlur {
          display: flex;
        }

        .vpCaptureDetailPhotoImage {
          position: relative;
          z-index: 2;
          display: block;
          width: 100%;
          height: 100%;
          min-height: 0;
          object-fit: contain;
          object-position: center center;
          background: #020617;
        }

        .vpCaptureDetailPhotoMock {
          background:
            radial-gradient(circle at 25% 35%, rgba(14, 165, 233, 0.36), transparent 36%),
            linear-gradient(135deg, rgba(12, 74, 110, 0.82), rgba(2, 6, 23, 0.95));
        }

        .vpCaptureDetailPhotoSky {
          position: absolute;
          inset: 0 0 48%;
          background:
            radial-gradient(circle at 20% 32%, rgba(255, 255, 255, 0.92) 0 10%, transparent 11%),
            radial-gradient(circle at 33% 28%, rgba(255, 255, 255, 0.8) 0 8%, transparent 9%),
            radial-gradient(circle at 72% 22%, rgba(255, 255, 255, 0.78) 0 7%, transparent 8%),
            linear-gradient(180deg, #38bdf8 0%, #bae6fd 100%);
          opacity: 0.65;
        }

        .vpCaptureDetailPhotoGrass {
          position: absolute;
          inset: 43% -10% -8%;
          background:
            radial-gradient(circle at 76% 32%, rgba(21, 128, 61, 0.82), transparent 28%),
            radial-gradient(circle at 20% 52%, rgba(132, 204, 22, 0.72), transparent 32%),
            linear-gradient(135deg, #166534, #0f172a);
        }

        .vpCaptureDetailPhotoPerson {
          position: absolute;
          right: 19%;
          bottom: 8%;
          width: 26%;
          height: 58%;
          border-radius: 999px 999px 32px 32px;
          background:
            radial-gradient(circle at 50% 13%, #f5c7a8 0 12%, transparent 13%),
            linear-gradient(180deg, #111827 0 62%, #020617 63% 100%);
          box-shadow: 0 18px 34px rgba(0, 0, 0, 0.28);
        }

        .vpCaptureDetailPhotoPerson::before {
          content: "";
          position: absolute;
          left: 12%;
          top: 18%;
          width: 76%;
          height: 32%;
          border-radius: 18px;
          background: linear-gradient(135deg, rgba(56, 189, 248, 0.7), rgba(250, 204, 21, 0.9));
          opacity: 0.55;
        }

        .vpCaptureDetailPhotoFish {
          position: absolute;
          left: 18%;
          top: 16%;
          width: 30%;
          height: 72%;
          border-radius: 55% 45% 48% 52% / 12% 12% 88% 88%;
          transform: rotate(-8deg);
          background:
            radial-gradient(circle at 48% 10%, rgba(255, 255, 255, 0.98) 0 8%, transparent 9%),
            linear-gradient(90deg, #f8fafc 0%, #cbd5e1 40%, #64748b 100%);
          box-shadow:
            inset -18px 0 30px rgba(15, 23, 42, 0.2),
            0 14px 30px rgba(0, 0, 0, 0.22);
        }

        .vpCaptureDetailPhotoFish::before {
          content: "";
          position: absolute;
          left: 50%;
          top: 12%;
          width: 3px;
          height: 76%;
          border-radius: 999px;
          background: rgba(15, 23, 42, 0.45);
        }

        .vpCaptureDetailPhotoFish::after {
          content: "";
          position: absolute;
          right: -20%;
          bottom: 3%;
          width: 38%;
          height: 17%;
          clip-path: polygon(0 50%, 100% 0, 78% 50%, 100% 100%);
          background: #94a3b8;
        }

        .vpCaptureDetailPhotoFishLine {
          position: absolute;
          left: 31%;
          top: 8%;
          width: 2px;
          height: 13%;
          background: rgba(15, 23, 42, 0.6);
          transform: rotate(-8deg);
        }

        .vpCaptureDetailPhotoMock > span {
          position: absolute;
          left: 16px;
          bottom: 14px;
          border-radius: 999px;
          background: rgba(2, 6, 23, 0.52);
          border: 1px solid rgba(255, 255, 255, 0.16);
          padding: 8px 11px;
          color: rgba(248, 250, 252, 0.92);
          font-size: 11px;
          line-height: 1;
          font-weight: 860;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          backdrop-filter: blur(8px);
        }

        .vpCaptureDetailInfoArea {
          flex: 0 0 auto;
          max-height: 38dvh;
          border-radius: 18px;
          padding: 10px;
          box-sizing: border-box;
          overflow-x: hidden;
          overflow-y: auto;
          overscroll-behavior: contain;
          -webkit-overflow-scrolling: touch;
          scrollbar-color: rgba(125, 211, 252, 0.45) rgba(15, 23, 42, 0.55);
          scrollbar-width: thin;
        }

        .vpCaptureDetailStatsGrid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 8px;
        }

        .vpCaptureDetailStatCard {
          min-width: 0;
          min-height: 82px;
          border: 1px solid rgba(148, 163, 184, 0.16);
          border-radius: 16px;
          background: rgba(3, 10, 20, 0.46);
          box-shadow:
            inset 0 1px 0 rgba(255, 255, 255, 0.035),
            0 10px 22px rgba(0, 0, 0, 0.16);
          padding: 12px;
          box-sizing: border-box;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .vpCaptureDetailFull {
          grid-column: 1 / -1;
        }

        .vpCaptureDetailStatIcon {
          flex: 0 0 auto;
          width: 46px;
          height: 46px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(14, 165, 233, 0.1);
          color: #7dd3fc;
          box-shadow: 0 0 22px rgba(56, 189, 248, 0.1);
        }

        .vpCaptureDetailStatIcon svg {
          width: 26px;
          height: 26px;
        }

        .vpCaptureDetailStatText {
          min-width: 0;
        }

        .vpCaptureDetailStatText span {
          display: block;
          color: rgba(226, 232, 240, 0.72);
          font-size: 11px;
          line-height: 1;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          font-weight: 680;
        }

        .vpCaptureDetailStatText strong {
          display: block;
          margin-top: 8px;
          color: #ffffff;
          font-size: clamp(17px, 4.25vw, 20px);
          line-height: 1.08;
          font-weight: 660;
          letter-spacing: -0.018em;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .vpCaptureDetailFull .vpCaptureDetailStatText strong {
          white-space: normal;
        }

        .vpCaptureDetailFooter {
          flex: 0 0 auto;
          border-radius: 16px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 9px;
          padding: 9px;
          box-sizing: border-box;
        }

        .vpCaptureDetailShareButton,
        .vpCaptureDetailDeleteButton {
          min-height: 54px;
          border-radius: 14px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 0 12px;
          font-size: clamp(16px, 4.1vw, 18px);
          line-height: 1;
          font-weight: 680;
          cursor: pointer;
          border: 1px solid transparent;
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.13);
          white-space: nowrap;
        }

        .vpCaptureDetailShareButton svg,
        .vpCaptureDetailDeleteButton svg {
          width: 19px;
          height: 19px;
          flex: 0 0 auto;
        }

        .vpCaptureDetailShareButton {
          color: #ffffff;
          background: linear-gradient(135deg, rgba(37, 99, 235, 0.96), rgba(29, 78, 216, 0.9));
          border-color: rgba(125, 211, 252, 0.42);
          box-shadow:
            0 0 28px rgba(37, 99, 235, 0.28),
            inset 0 1px 0 rgba(255, 255, 255, 0.16);
        }

        .vpCaptureDetailDeleteButton {
          color: #fecaca;
          background: linear-gradient(135deg, rgba(69, 10, 10, 0.82), rgba(35, 6, 13, 0.88));
          border-color: rgba(248, 113, 113, 0.42);
          box-shadow:
            0 0 24px rgba(239, 68, 68, 0.14),
            inset 0 1px 0 rgba(255, 255, 255, 0.08);
        }

        .vpCaptureDetailShareOptions {
          grid-column: 1 / -1;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
          border-radius: 13px;
          border: 1px solid rgba(148, 163, 184, 0.16);
          background: rgba(3, 10, 20, 0.46);
          padding: 8px;
        }

        .vpCaptureDetailShareOptions button {
          min-height: 44px;
          border: 1px solid rgba(56, 189, 248, 0.28);
          border-radius: 11px;
          background: rgba(14, 165, 233, 0.08);
          color: #7dd3fc;
          font-size: 13px;
          line-height: 1;
          font-weight: 720;
          cursor: pointer;
        }

        .vpCaptureDetailPhotoViewer {
          position: fixed;
          inset: 0;
          z-index: 100001;
          display: flex;
          align-items: center;
          justify-content: center;
          padding:
            max(18px, env(safe-area-inset-top))
            max(14px, env(safe-area-inset-right))
            max(18px, env(safe-area-inset-bottom))
            max(14px, env(safe-area-inset-left));
          box-sizing: border-box;
          background:
            radial-gradient(circle at 50% 18%, rgba(14, 165, 233, 0.12), transparent 34%),
            rgba(1, 6, 12, 0.94);
          backdrop-filter: blur(10px);
          overflow: hidden;
        }

        .vpCaptureDetailPhotoViewerImage {
          display: block;
          width: 100%;
          height: 100%;
          max-width: 100%;
          max-height: 100%;
          object-fit: contain;
          object-position: center center;
          border-radius: 18px;
          box-shadow: 0 22px 70px rgba(0, 0, 0, 0.48);
          transition: transform 180ms ease;
        }

        .vpCaptureDetailPhotoViewerImage.isRotated {
          width: auto;
          height: auto;
          max-width: calc(100dvh - 32px);
          max-height: calc(100vw - 32px);
        }

        .vpCaptureDetailPhotoViewerClose {
          position: fixed;
          top: max(14px, env(safe-area-inset-top));
          right: max(16px, env(safe-area-inset-right));
          z-index: 100002;
          width: 46px;
          height: 46px;
          border: 1px solid rgba(255, 255, 255, 0.16);
          border-radius: 16px;
          background: rgba(15, 23, 42, 0.72);
          color: rgba(255, 255, 255, 0.92);
          box-shadow: 0 16px 40px rgba(0, 0, 0, 0.36);
          backdrop-filter: blur(12px);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }

        .vpCaptureDetailPhotoViewerClose svg {
          width: 25px;
          height: 25px;
        }

        .vpCaptureDetailPinIcon svg,
        .vpCaptureDetailCopyButton svg,
        .vpCaptureDetailStatIcon svg,
        .vpCaptureDetailShareButton svg,
        .vpCaptureDetailDeleteButton svg,
        .vpCaptureDetailCloseButton svg {
          fill: none;
          stroke: currentColor;
          stroke-width: 3;
          stroke-linecap: round;
          stroke-linejoin: round;
        }

        @media (max-width: 767px) {
          .vpCaptureDetailPhotoHint {
            right: 12px;
            bottom: 12px;
            padding: 5px 8px;
            font-size: 9px;
          }

          .vpCaptureDetailPreview {
            height: 100svh;
            min-height: 100svh;
            max-height: 100svh;
            overflow: hidden;
          }

          .vpCaptureDetailPanelFrame {
            width: 100%;
            height: 100%;
            min-height: 0;
          }

          .vpCaptureDetailPanelShell {
            width: min(100vw, 460px);
            height: 100%;
            min-height: 0;
            max-height: 100svh;
            padding:
              max(10px, env(safe-area-inset-top))
              10px
              max(64px, calc(env(safe-area-inset-bottom) + 54px));
            display: grid;
            grid-template-rows: auto minmax(0, 1fr) auto;
            gap: 8px;
            overflow: hidden;
          }

          .vpCaptureDetailHeaderCard {
            grid-row: 1;
            min-height: 106px;
            gap: 12px;
            padding: 12px 14px;
            border-radius: 20px;
          }

          .vpCaptureDetailPinIcon {
            width: 44px;
            height: 44px;
          }

          .vpCaptureDetailPinIcon svg {
            width: 28px;
            height: 28px;
          }

          .vpCaptureDetailHeaderText {
            gap: 3px;
          }

          .vpCaptureDetailHeaderText > span {
            font-size: 10.5px;
          }

          .vpCaptureDetailHeaderText > strong {
            font-size: clamp(21px, 6.4vw, 27px);
            max-width: calc(100vw - 148px);
          }

          .vpCaptureDetailPlaceLine small {
            font-size: 14px;
          }

          .vpCaptureDetailCoordinatesRow {
            gap: 9px;
            margin-top: 3px;
          }

          .vpCaptureDetailCoordinatesRow small {
            font-size: 13px;
          }

          .vpCaptureDetailCopyButton {
            height: 34px;
            padding: 0 10px;
            font-size: 12.5px;
          }

          .vpCaptureDetailBodyScroll {
            grid-row: 2;
            min-height: 0;
            overflow-y: auto;
            overflow-x: hidden;
            overscroll-behavior: contain;
            -webkit-overflow-scrolling: touch;
            display: flex;
            flex-direction: column;
            gap: 8px;
            padding-bottom: 2px;
          }

          .vpCaptureDetailBodyScroll.isPortrait,
          .vpCaptureDetailBodyScroll.isUnknown {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 8px;
          }

          .vpCaptureDetailPhotoCard {
            --vp-capture-photo-mobile-portrait-height: min(330px, 40svh);
            height: auto;
            min-height: 0;
            padding: 7px;
            align-self: center;
          }

          .vpCaptureDetailPhotoCard.isLandscape {
            width: 100%;
            max-width: 100%;
          }

          .vpCaptureDetailPhotoCard.isPortrait {
            width: min(
              62vw,
              230px,
              calc(var(--vp-capture-photo-mobile-portrait-height) * var(--vp-capture-photo-factor))
            );
            max-width: 230px;
          }

          .vpCaptureDetailBodyScroll.isPortrait .vpCaptureDetailPhotoCard,
          .vpCaptureDetailBodyScroll.isUnknown .vpCaptureDetailPhotoCard {
            width: min(56vw, 218px);
            max-width: 218px;
            align-self: center;
            margin-left: auto;
            margin-right: auto;
          }

          .vpCaptureDetailBodyScroll.isPortrait .vpCaptureDetailPhotoCard .vpCaptureDetailPhotoRealFrame,
          .vpCaptureDetailBodyScroll.isUnknown .vpCaptureDetailPhotoCard .vpCaptureDetailPhotoRealFrame {
            width: 100%;
            height: auto;
            aspect-ratio: var(--vp-capture-photo-ratio);
          }

          .vpCaptureDetailPhotoCard.isSquare,
          .vpCaptureDetailPhotoCard.isUnknown {
            width: min(78vw, 292px);
            max-width: 292px;
          }

          .vpCaptureDetailPhotoMock,
          .vpCaptureDetailPhotoRealFrame,
          .vpCaptureDetailPhotoImage {
            min-height: 0;
          }

          .vpCaptureDetailInfoArea {
            min-height: 0;
            max-height: none;
            padding: 8px;
            overflow: visible;
          }

          .vpCaptureDetailBodyScroll.isPortrait .vpCaptureDetailInfoArea,
          .vpCaptureDetailBodyScroll.isUnknown .vpCaptureDetailInfoArea {
            width: 100%;
            min-width: 0;
            max-height: none;
            padding: 8px;
            align-self: stretch;
            overflow: visible;
          }

          .vpCaptureDetailBodyScroll.isPortrait .vpCaptureDetailStatsGrid,
          .vpCaptureDetailBodyScroll.isUnknown .vpCaptureDetailStatsGrid {
            grid-template-columns: 1fr;
            gap: 6px;
            padding-bottom: 0;
          }

          .vpCaptureDetailBodyScroll.isPortrait .vpCaptureDetailFull,
          .vpCaptureDetailBodyScroll.isUnknown .vpCaptureDetailFull {
            grid-column: auto;
          }

          .vpCaptureDetailBodyScroll.isPortrait .vpCaptureDetailStatCard,
          .vpCaptureDetailBodyScroll.isUnknown .vpCaptureDetailStatCard {
            min-height: 52px;
            padding: 7px 8px;
            gap: 8px;
            border-radius: 14px;
          }

          .vpCaptureDetailBodyScroll.isPortrait .vpCaptureDetailStatIcon,
          .vpCaptureDetailBodyScroll.isUnknown .vpCaptureDetailStatIcon {
            width: 32px;
            height: 32px;
            border-radius: 12px;
          }

          .vpCaptureDetailBodyScroll.isPortrait .vpCaptureDetailStatIcon svg,
          .vpCaptureDetailBodyScroll.isUnknown .vpCaptureDetailStatIcon svg {
            width: 19px;
            height: 19px;
          }

          .vpCaptureDetailBodyScroll.isPortrait .vpCaptureDetailStatText span,
          .vpCaptureDetailBodyScroll.isUnknown .vpCaptureDetailStatText span {
            font-size: 9.3px;
            letter-spacing: 0.095em;
          }

          .vpCaptureDetailBodyScroll.isPortrait .vpCaptureDetailStatText strong,
          .vpCaptureDetailBodyScroll.isUnknown .vpCaptureDetailStatText strong {
            margin-top: 5px;
            font-size: 14px;
            line-height: 1.08;
          }

          .vpCaptureDetailBodyScroll.isPortrait .vpCaptureDetailFull .vpCaptureDetailStatText strong,
          .vpCaptureDetailBodyScroll.isUnknown .vpCaptureDetailFull .vpCaptureDetailStatText strong {
            display: -webkit-box;
            overflow: hidden;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            white-space: normal;
          }

          .vpCaptureDetailStatsGrid {
            gap: 8px;
            padding-bottom: 2px;
          }

          .vpCaptureDetailStatCard {
            min-height: 64px;
            padding: 8px 9px;
            gap: 9px;
            border-radius: 15px;
          }

          .vpCaptureDetailStatIcon {
            width: 38px;
            height: 38px;
            border-radius: 14px;
          }

          .vpCaptureDetailStatIcon svg {
            width: 23px;
            height: 23px;
          }

          .vpCaptureDetailStatText span {
            font-size: 10.5px;
            letter-spacing: 0.115em;
          }

          .vpCaptureDetailStatText strong {
            margin-top: 7px;
            font-size: clamp(16px, 4vw, 18px);
            line-height: 1.08;
          }

          .vpCaptureDetailFooter {
            grid-row: 3;
            min-height: 62px;
            border-radius: 18px;
            gap: 9px;
            padding: 8px;
            margin: 0;
            align-self: end;
          }

          .vpCaptureDetailShareButton,
          .vpCaptureDetailDeleteButton {
            min-height: 46px;
            font-size: 15px;
            padding: 0 8px;
            border-radius: 14px;
          }

          .vpCaptureDetailShareButton svg,
          .vpCaptureDetailDeleteButton svg {
            width: 17px;
            height: 17px;
          }

          /* MOBILE ONLY: ficha lateral para foto vertical/desconhecida */
          .vpCaptureDetailBodyScroll.isPortrait,
          .vpCaptureDetailBodyScroll.isUnknown {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 8px;
          }

          .vpCaptureDetailBodyScroll.isPortrait .vpCaptureDetailPhotoCard,
          .vpCaptureDetailBodyScroll.isUnknown .vpCaptureDetailPhotoCard {
            width: min(56vw, 218px);
            max-width: 218px;
            align-self: center;
            margin-left: auto;
            margin-right: auto;
          }

          .vpCaptureDetailBodyScroll.isPortrait .vpCaptureDetailInfoArea,
          .vpCaptureDetailBodyScroll.isUnknown .vpCaptureDetailInfoArea {
            width: 100%;
            min-width: 0;
            max-height: none;
            padding: 8px;
            align-self: stretch;
            overflow: visible;
          }

          .vpCaptureDetailBodyScroll.isPortrait .vpCaptureDetailStatsGrid,
          .vpCaptureDetailBodyScroll.isUnknown .vpCaptureDetailStatsGrid {
            grid-template-columns: 1fr;
            gap: 6px;
            padding-bottom: 0;
          }

          .vpCaptureDetailBodyScroll.isPortrait .vpCaptureDetailFull,
          .vpCaptureDetailBodyScroll.isUnknown .vpCaptureDetailFull {
            grid-column: auto;
          }

          .vpCaptureDetailBodyScroll.isPortrait .vpCaptureDetailStatCard,
          .vpCaptureDetailBodyScroll.isUnknown .vpCaptureDetailStatCard {
            min-height: 52px;
            padding: 7px 8px;
            gap: 8px;
            border-radius: 14px;
          }

          .vpCaptureDetailBodyScroll.isPortrait .vpCaptureDetailStatIcon,
          .vpCaptureDetailBodyScroll.isUnknown .vpCaptureDetailStatIcon {
            width: 32px;
            height: 32px;
            border-radius: 12px;
          }

          .vpCaptureDetailBodyScroll.isPortrait .vpCaptureDetailStatIcon svg,
          .vpCaptureDetailBodyScroll.isUnknown .vpCaptureDetailStatIcon svg {
            width: 19px;
            height: 19px;
          }

          .vpCaptureDetailBodyScroll.isPortrait .vpCaptureDetailStatText span,
          .vpCaptureDetailBodyScroll.isUnknown .vpCaptureDetailStatText span {
            font-size: 9.3px;
            letter-spacing: 0.095em;
          }

          .vpCaptureDetailBodyScroll.isPortrait .vpCaptureDetailStatText strong,
          .vpCaptureDetailBodyScroll.isUnknown .vpCaptureDetailStatText strong {
            margin-top: 5px;
            font-size: 14px;
            line-height: 1.08;
          }

          .vpCaptureDetailBodyScroll.isPortrait .vpCaptureDetailFull .vpCaptureDetailStatText strong,
          .vpCaptureDetailBodyScroll.isUnknown .vpCaptureDetailFull .vpCaptureDetailStatText strong {
            display: -webkit-box;
            overflow: hidden;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            white-space: normal;
          }

          .vpCaptureDetailBodyScroll.isLandscape {
            display: flex;
            flex-direction: column;
          }
        }

        @media (max-width: 767px) and (orientation: landscape) {
          .vpCaptureDetailPhotoViewer {
            padding:
              max(8px, env(safe-area-inset-top))
              max(8px, env(safe-area-inset-right))
              max(8px, env(safe-area-inset-bottom))
              max(8px, env(safe-area-inset-left));
          }

          .vpCaptureDetailPhotoViewerImage {
            max-width: calc(100vw - 16px);
            max-height: calc(100dvh - 16px);
            border-radius: 14px;
          }

          .vpCaptureDetailPhotoViewerClose {
            top: max(8px, env(safe-area-inset-top));
            right: max(8px, env(safe-area-inset-right));
          }
        }

        @media (min-width: 768px) {
          .vpCaptureDetailPreview {
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

          .vpCaptureDetailPanelFrame {
            position: relative;
            width: min(88vw, 900px);
            height: min(78dvh, 680px);
            max-height: calc(100dvh - 96px);
            display: flex;
            justify-content: center;
            align-items: stretch;
          }

          .vpCaptureDetailCloseButton {
            position: absolute;
            top: -34px;
            right: -54px;
            left: auto;
            width: 44px;
            height: 44px;
            border-radius: 15px;
          }

          .vpCaptureDetailPanelShell {
            width: 100%;
            height: 100%;
            max-height: calc(100dvh - 96px);
            padding: 14px;
            display: grid;
            grid-template-columns: minmax(0, 1.08fr) minmax(330px, 0.92fr);
            grid-template-rows: auto minmax(0, 1fr) auto;
            gap: 14px;
            background: rgba(3, 10, 18, 0.82);
            border: 1px solid rgba(148, 163, 184, 0.14);
            border-radius: 28px;
            box-shadow: 0 24px 80px rgba(0, 0, 0, 0.34);
            backdrop-filter: blur(6px);
            overflow: hidden;
            box-sizing: border-box;
          }

          .vpCaptureDetailCard,
          .vpCaptureDetailFooter {
            background: rgba(10, 18, 30, 0.82);
            border: 1px solid rgba(148, 163, 184, 0.18);
          }

          .vpCaptureDetailHeaderCard {
            grid-column: 1 / -1;
            min-height: 92px;
            padding: 16px 18px;
            border-radius: 18px;
            gap: 16px;
          }

          .vpCaptureDetailPinIcon {
            width: 52px;
            height: 52px;
          }

          .vpCaptureDetailHeaderText > span {
            font-size: 12px;
          }

          .vpCaptureDetailHeaderText > strong {
            font-size: 27px;
          }

          .vpCaptureDetailPlaceLine small,
          .vpCaptureDetailCoordinatesRow small {
            font-size: 14px;
          }

          .vpCaptureDetailBodyScroll {
            display: contents;
          }

          .vpCaptureDetailPhotoCard {
            --vp-capture-photo-desktop-portrait-height: min(430px, calc(100dvh - 250px));
            grid-column: 1;
            grid-row: 2 / 4;
            height: auto;
            min-height: 0;
            padding: 10px;
            align-self: start;
            justify-self: center;
          }

          .vpCaptureDetailPhotoCard.isLandscape {
            width: 100%;
            max-width: 100%;
          }

          .vpCaptureDetailPhotoCard.isSquare {
            width: min(100%, 410px);
            max-width: 410px;
          }

          .vpCaptureDetailPhotoCard.isPortrait,
          .vpCaptureDetailPhotoCard.isUnknown {
            width: min(
              100%,
              250px,
              calc(var(--vp-capture-photo-desktop-portrait-height) * var(--vp-capture-photo-factor))
            );
            max-width: 250px;
          }

          .vpCaptureDetailPhotoMock,
          .vpCaptureDetailPhotoRealFrame,
          .vpCaptureDetailPhotoImage {
            min-height: 0;
          }

          .vpCaptureDetailPhotoCard.isLandscape .vpCaptureDetailPhotoImage,
          .vpCaptureDetailPhotoCard.isSquare .vpCaptureDetailPhotoImage,
          .vpCaptureDetailPhotoCard.isPortrait .vpCaptureDetailPhotoImage,
          .vpCaptureDetailPhotoCard.isUnknown .vpCaptureDetailPhotoImage {
            object-fit: contain;
          }

          .vpCaptureDetailInfoArea {
            grid-column: 2;
            grid-row: 2;
            max-height: none;
            min-height: 0;
            padding: 12px;
            overflow-y: auto;
          }

          .vpCaptureDetailFooter {
            grid-column: 2;
            grid-row: 3;
            border-radius: 18px;
            gap: 14px;
            padding: 10px;
          }

          .vpCaptureDetailShareButton,
          .vpCaptureDetailDeleteButton {
            min-height: 56px;
            border-radius: 15px;
            font-size: 18px;
          }
        }
      `}</style>
    </section>
  );
}
