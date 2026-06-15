'use client';

/* eslint-disable @next/next/no-img-element */

import type React from 'react';
import { useState } from 'react';
import type { Capture, CaptureShareMode } from '@/components/captures/types';

type CaptureSharePanelPreviewProps = {
  capture?: Capture | null;
  placeLabel?: string | null;
  formattedDate?: string | null;
  shareFeedback?: string | null;
  onClose?: () => void;
  onBack?: () => void;
  onGenerate?: (mode: CaptureShareMode) => void;
};

type IconProps = {
  className?: string;
};

type PhotoOrientation = 'unknown' | 'portrait' | 'landscape' | 'square';

type PhotoMetrics = {
  orientation: PhotoOrientation;
  aspectRatio: string;
  ratioNumber: string;
};

const previewDate = '19/05/2025';
const previewTime = '08h15';

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

function BackIcon(props: IconProps) {
  return (
    <SvgBase {...props}>
      <path d="M29 12 17 24l12 12" />
      <path d="M18 24h20" />
    </SvgBase>
  );
}

function CheckIcon(props: IconProps) {
  return (
    <SvgBase {...props}>
      <path d="M12 25.5 20.5 34 37 15" />
    </SvgBase>
  );
}

function LockIcon(props: IconProps) {
  return (
    <SvgBase {...props}>
      <rect x="13" y="21" width="22" height="18" rx="3" />
      <path d="M18 21v-5a6 6 0 0 1 12 0v5" />
      <path d="M24 28v5" />
    </SvgBase>
  );
}

function UnlockIcon(props: IconProps) {
  return (
    <SvgBase {...props}>
      <rect x="13" y="21" width="22" height="18" rx="3" />
      <path d="M18 21v-5a6 6 0 0 1 11.3-2.8" />
      <path d="M24 28v5" />
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

function EyeIcon(props: IconProps) {
  return (
    <SvgBase {...props}>
      <path d="M5 24s7-11 19-11 19 11 19 11-7 11-19 11S5 24 5 24Z" />
      <circle cx="24" cy="24" r="6" />
    </SvgBase>
  );
}

function CapturePhotoPreview({ photoUrl, species }: { photoUrl?: string; species: string }) {
  const [photoMetrics, setPhotoMetrics] = useState<PhotoMetrics>({
    orientation: 'unknown',
    aspectRatio: '4 / 3',
    ratioNumber: '1.333333',
  });

  const photoOrientationClass =
    photoMetrics.orientation === 'portrait'
      ? 'isPortrait'
      : photoMetrics.orientation === 'landscape'
        ? 'isLandscape'
        : photoMetrics.orientation === 'square'
          ? 'isSquare'
          : 'isUnknown';

  const photoStyle = {
    '--vp-share-photo-ratio': photoMetrics.aspectRatio,
    '--vp-share-photo-factor': photoMetrics.ratioNumber,
  } as React.CSSProperties;

  return (
    <div
      className={`vpSharePhotoPreview ${photoOrientationClass}`}
      style={photoStyle}
    >
      {photoUrl ? (
        <img
          className="vpSharePhotoImage"
          src={photoUrl}
          alt={`Foto da captura: ${species}`}
          onLoad={(event) => {
            const image = event.currentTarget;
            setPhotoMetrics(getPhotoMetrics(image.naturalWidth, image.naturalHeight));
          }}
        />
      ) : (
        <>
          <div className="vpSharePhotoWater" />
          <div className="vpSharePhotoFishBody">
            <FishIcon />
          </div>
          <div className="vpSharePhotoGlow" />
        </>
      )}
    </div>
  );
}

function CaptureSummaryCard({
  capture,
  placeLabel,
  formattedDate,
}: {
  capture?: Capture | null;
  placeLabel?: string | null;
  formattedDate?: string | null;
}) {
  const species = capture?.species?.trim() || 'Robalo';
  const location = placeLabel?.trim() || 'Peva de Matinhos';
  const dateText = formattedDate?.trim() || `${previewDate} \u2022 ${previewTime}`;
  const size = capture?.size?.trim() ? `${capture.size.trim()} cm` : '82 cm';
  const weight = capture?.weight?.trim() ? `${capture.weight.trim()} kg` : '6,2 kg';

  return (
    <section className="vpShareSummaryCard" aria-label="Resumo da captura">
      <CapturePhotoPreview photoUrl={capture?.photo || undefined} species={species} />

      <div className="vpShareSummaryText">
        <span>{'Captura'}</span>
        <strong>{species}</strong>
        <p>{location}</p>

        <div className="vpShareSummaryDate">
          <CalendarIcon />
          <small>{dateText}</small>
        </div>

        <div className="vpShareSummaryStats">
          <div>
            <WeightIcon />
            <b>{weight}</b>
          </div>

          <div>
            <RulerIcon />
            <b>{size}</b>
          </div>
        </div>
      </div>
    </section>
  );
}

function ShareModeButton({
  mode,
  selected,
  label,
  onSelect,
}: {
  mode: CaptureShareMode;
  selected: boolean;
  label: string;
  onSelect: (mode: CaptureShareMode) => void;
}) {
  const Icon = mode === 'secret' ? LockIcon : UnlockIcon;

  return (
    <button
      type="button"
      className={`vpShareModeButton ${selected ? 'isSelected' : ''}`}
      onClick={() => onSelect(mode)}
      aria-pressed={selected}
    >
      <Icon />
      <span>{label}</span>
      {selected ? <CheckIcon className="vpShareModeCheckIcon" /> : null}
    </button>
  );
}

function ShareModeSelector({
  shareMode,
  onSelect,
}: {
  shareMode: CaptureShareMode;
  onSelect: (mode: CaptureShareMode) => void;
}) {
  const modeText =
    shareMode === 'secret'
      ? 'Local aproximado, sem coordenadas'
      : 'Local exato, com coordenadas';

  return (
    <section className="vpShareModes" aria-label="Tipo de compartilhamento">
      <div className="vpShareSectionHeader">
        <h2>Tipo de compartilhamento</h2>
        <span>{shareMode === 'secret' ? 'Padr\u00e3o' : 'Completo'}</span>
      </div>

      <div className="vpShareModeGrid">
        <ShareModeButton
          mode="secret"
          selected={shareMode === 'secret'}
          label="Secreto"
          onSelect={onSelect}
        />

        <ShareModeButton
          mode="complete"
          selected={shareMode === 'complete'}
          label="Completo"
          onSelect={onSelect}
        />
      </div>

      <p className="vpShareModeHelp">{modeText}</p>
    </section>
  );
}

export default function CaptureSharePanelPreview({
  capture,
  placeLabel,
  formattedDate,
  shareFeedback,
  onClose,
  onBack,
  onGenerate,
}: CaptureSharePanelPreviewProps) {
  const [shareMode, setShareMode] = useState<CaptureShareMode>('secret');

  return (
    <section
      className="vpSharePreview"
      aria-label="Preview Compartilhar Captura"
      onClick={(event) => event.stopPropagation()}
      onPointerDown={(event) => event.stopPropagation()}
    >
      <div className="vpSharePanelFrame">
        <button
          className="vpShareCloseButton"
          type="button"
          aria-label="Fechar"
          onClick={onClose}
        >
          <CloseIcon />
        </button>

        <main className="vpSharePanelShell">
          <header className="vpShareHeader">
            <button
              type="button"
              className="vpShareBackButton"
              aria-label="Voltar"
              onClick={onBack}
            >
              <BackIcon />
            </button>

            <span className="vpShareHeaderTitleSpacer" aria-hidden="true" />

            <span aria-hidden="true" />
          </header>

          <div className="vpShareScroll">
            <CaptureSummaryCard capture={capture} placeLabel={placeLabel} formattedDate={formattedDate} />

            <ShareModeSelector shareMode={shareMode} onSelect={setShareMode} />

            <button
              type="button"
              className="vpSharePreviewButton"
              onClick={() => onGenerate?.(shareMode)}
            >
              <span>{shareFeedback || 'Ver pr\u00e9via'}</span>
              <EyeIcon />
            </button>
          </div>
        </main>
      </div>

      <style jsx global>{`
        .vpSharePreview {
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

        .vpShareCloseButton {
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

        .vpShareCloseButton svg {
          width: 25px;
          height: 25px;
        }

        .vpSharePanelShell {
          width: min(100vw, 460px);
          height: 100dvh;
          margin: 0 auto;
          padding: max(10px, env(safe-area-inset-top)) 12px max(10px, env(safe-area-inset-bottom));
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
          gap: 7px;
        }

        .vpShareHeader {
          flex: 0 0 auto;
          min-height: 50px;
          display: grid;
          grid-template-columns: 44px 1fr 44px;
          align-items: center;
          gap: 8px;
          color: rgba(248, 250, 252, 0.96);
        }

        .vpShareHeaderTitleSpacer {
          display: block;
          width: 100%;
          height: 1px;
        }

        .vpShareBackButton {
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

        .vpShareBackButton svg {
          width: 25px;
          height: 25px;
        }

        .vpShareScroll {
          flex: 1 1 auto;
          min-height: 0;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 10px;
          padding: 1px 0 0;
          scrollbar-color: rgba(125, 211, 252, 0.45) rgba(15, 23, 42, 0.55);
          scrollbar-width: thin;
        }

        .vpShareSummaryCard,
        .vpShareModes {
          background: linear-gradient(135deg, rgba(23, 31, 42, 0.88), rgba(10, 16, 23, 0.94));
          border: 1px solid rgba(148, 163, 184, 0.2);
          box-shadow:
            inset 0 1px 0 rgba(255, 255, 255, 0.035),
            0 14px 34px rgba(0, 0, 0, 0.18);
          backdrop-filter: blur(14px);
        }

        .vpShareSummaryCard {
          flex: 0 0 auto;
          display: grid;
          grid-template-columns: auto minmax(0, 1fr);
          gap: 12px;
          align-items: center;
          border-radius: 18px;
          padding: 10px;
          box-sizing: border-box;
        }

        .vpSharePhotoPreview {
          --vp-share-photo-ratio: 4 / 3;
          --vp-share-photo-factor: 1.333333;
          position: relative;
          width: 148px;
          height: auto;
          aspect-ratio: var(--vp-share-photo-ratio);
          min-height: 0;
          overflow: hidden;
          border-radius: 15px;
          border: 1px solid rgba(56, 189, 248, 0.34);
          background: #020617;
          box-shadow: 0 0 22px rgba(56, 189, 248, 0.1);
          align-self: center;
        }

        .vpSharePhotoPreview.isPortrait,
        .vpSharePhotoPreview.isUnknown {
          width: min(148px, calc(238px * var(--vp-share-photo-factor)));
        }

        .vpSharePhotoPreview.isSquare {
          width: 148px;
        }

        .vpSharePhotoImage {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: contain;
          object-position: center center;
          display: block;
          background: #020617;
        }

        .vpSharePhotoWater {
          position: absolute;
          inset: 0;
          background:
            radial-gradient(circle at 24% 24%, rgba(125, 211, 252, 0.18), transparent 28%),
            radial-gradient(circle at 72% 68%, rgba(248, 113, 113, 0.08), transparent 30%),
            linear-gradient(135deg, rgba(12, 32, 52, 0.7), rgba(2, 8, 18, 0.98));
        }

        .vpSharePhotoFishBody {
          position: absolute;
          inset: 0;
          color: rgba(226, 232, 240, 0.72);
          display: flex;
          align-items: center;
          justify-content: center;
          filter: drop-shadow(0 0 18px rgba(14, 165, 233, 0.18));
        }

        .vpSharePhotoFishBody svg {
          width: 108px;
          height: 108px;
        }

        .vpSharePhotoGlow {
          position: absolute;
          inset: auto -20px -32px -20px;
          height: 70px;
          background: rgba(14, 165, 233, 0.12);
          filter: blur(18px);
        }

        .vpShareSummaryText {
          min-width: 0;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .vpShareSummaryText > span {
          color: rgba(226, 232, 240, 0.66);
          font-size: 10px;
          line-height: 1;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          font-weight: 680;
        }

        .vpShareSummaryText > strong {
          margin-top: 5px;
          color: #38bdf8;
          font-size: clamp(21px, 5.5vw, 25px);
          line-height: 1.03;
          font-weight: 760;
          letter-spacing: -0.045em;
          white-space: normal;
          overflow: visible;
          text-overflow: clip;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        }

        .vpShareSummaryText > p {
          margin: 6px 0 0;
          color: rgba(248, 250, 252, 0.88);
          font-size: 13px;
          line-height: 1.15;
          font-weight: 640;
          white-space: normal;
          overflow: visible;
          text-overflow: clip;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        }

        .vpShareSummaryDate {
          margin-top: 10px;
          display: flex;
          align-items: center;
          gap: 6px;
          color: rgba(226, 232, 240, 0.8);
        }

        .vpShareSummaryDate svg {
          width: 16px;
          height: 16px;
          color: #7dd3fc;
        }

        .vpShareSummaryDate small {
          font-size: 12px;
          font-weight: 620;
        }

        .vpShareSummaryStats {
          margin-top: 10px;
          padding-top: 10px;
          border-top: 1px solid rgba(148, 163, 184, 0.16);
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 8px;
        }

        .vpShareSummaryStats div {
          min-width: 0;
          display: flex;
          align-items: center;
          gap: 7px;
        }

        .vpShareSummaryStats svg {
          flex: 0 0 auto;
          width: 18px;
          height: 18px;
          color: #7dd3fc;
        }

        .vpShareSummaryStats b {
          display: block;
          min-width: 0;
          color: rgba(248, 250, 252, 0.94);
          font-size: 18px;
          line-height: 1;
          font-weight: 760;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .vpShareModes {
          flex: 0 0 auto;
          border-radius: 18px;
          padding: 10px;
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .vpShareSectionHeader {
          display: flex;
          align-items: center;
          justify-content: flex-start;
          gap: 10px;
        }

        .vpShareSectionHeader h2,
        .vpShareChannels h2 {
          margin: 0;
          color: rgba(248, 250, 252, 0.94);
          font-size: 15px;
          line-height: 1;
          font-weight: 760;
          letter-spacing: -0.015em;
        }

        .vpShareSectionHeader span {
          flex: 0 0 auto;
          border-radius: 999px;
          background: rgba(37, 99, 235, 0.32);
          color: #bfdbfe;
          padding: 4px 8px;
          font-size: 10px;
          line-height: 1;
          font-weight: 780;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }

        .vpShareModeGrid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 8px;
        }

        .vpShareModeButton {
          min-width: 0;
          min-height: 46px;
          border: 1px solid rgba(148, 163, 184, 0.2);
          border-radius: 14px;
          background: rgba(3, 10, 20, 0.42);
          color: rgba(248, 250, 252, 0.9);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 0 10px;
          cursor: pointer;
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.035);
          transition:
            border-color 160ms ease,
            background 160ms ease,
            box-shadow 160ms ease,
            transform 160ms ease;
        }

        .vpShareModeButton svg {
          flex: 0 0 auto;
          width: 19px;
          height: 19px;
          color: #7dd3fc;
        }

        .vpShareModeButton span {
          min-width: 0;
          font-size: 14px;
          line-height: 1;
          font-weight: 760;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .vpShareModeButton.isSelected {
          border-color: rgba(37, 99, 235, 0.98);
          background:
            radial-gradient(circle at 0% 50%, rgba(37, 99, 235, 0.22), transparent 44%),
            linear-gradient(135deg, rgba(7, 32, 56, 0.92), rgba(4, 16, 32, 0.96));
          box-shadow:
            inset 0 1px 0 rgba(255, 255, 255, 0.045),
            0 0 22px rgba(37, 99, 235, 0.18);
        }

        .vpShareModeButton:active {
          transform: scale(0.99);
        }

        .vpShareModeCheckIcon {
          width: 17px !important;
          height: 17px !important;
          color: #bfdbfe !important;
        }

        .vpShareModeHelp {
          margin: 0;
          color: rgba(226, 232, 240, 0.72);
          font-size: 12px;
          line-height: 1.25;
          font-weight: 580;
        }

        .vpShareChannels {
          flex: 0 0 auto;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .vpShareSocialGrid {
          display: grid;
          grid-template-columns: repeat(5, minmax(0, 1fr));
          gap: 8px;
        }

        .vpShareSocialButton {
          min-width: 0;
          border: 0;
          background: transparent;
          padding: 0;
          color: rgba(248, 250, 252, 0.92);
          cursor: pointer;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
        }

        .vpShareSocialButton > span {
          width: 52px;
          height: 52px;
          border-radius: 15px;
          border: 1px solid rgba(148, 163, 184, 0.22);
          background: linear-gradient(135deg, rgba(23, 31, 42, 0.88), rgba(10, 16, 23, 0.94));
          box-shadow:
            inset 0 1px 0 rgba(255, 255, 255, 0.035),
            0 14px 30px rgba(0, 0, 0, 0.18);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .vpShareSocialButton svg {
          width: 29px;
          height: 29px;
        }

        .vpShareSocialButton small {
          max-width: 72px;
          color: rgba(248, 250, 252, 0.86);
          font-size: 11px;
          line-height: 1.08;
          font-weight: 580;
          text-align: center;
        }

        .vpShareSocialIcon {
          width: 34px;
          height: 34px;
          border-radius: 999px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          box-shadow: 0 0 18px rgba(0, 0, 0, 0.28);
          overflow: hidden;
        }

        .vpShareSocialIcon svg {
          width: 34px;
          height: 34px;
          display: block;
        }

        .vpShareSocialIconWhatsapp {
          background: #22c55e;
        }

        .vpShareSocialIconWhatsapp svg {
          fill: #ffffff;
          stroke: none;
        }

        .vpShareSocialIconInstagram {
          background:
            radial-gradient(circle at 30% 108%, #facc15 0 18%, transparent 19%),
            radial-gradient(circle at 0% 100%, #fb7185 0 35%, transparent 36%),
            linear-gradient(135deg, #7c3aed, #db2777, #f97316);
        }

        .vpShareSocialIconInstagram svg {
          fill: none;
          stroke: #ffffff;
          stroke-width: 3;
        }

        .vpShareSocialIconFacebook {
          background: #2563eb;
        }

        .vpShareSocialIconFacebook svg {
          fill: #ffffff;
          stroke: none;
        }

        .vpSharePreviewButton {
          flex: 0 0 auto;
          width: 100%;
          min-height: 54px;
          margin-top: auto;
          border: 1px solid rgba(125, 211, 252, 0.42);
          border-radius: 15px;
          background: linear-gradient(135deg, rgba(37, 99, 235, 0.96), rgba(29, 78, 216, 0.9));
          color: #ffffff;
          box-shadow:
            0 0 28px rgba(37, 99, 235, 0.28),
            inset 0 1px 0 rgba(255, 255, 255, 0.16);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          font-size: 16px;
          line-height: 1;
          font-weight: 780;
          letter-spacing: 0.035em;
          text-transform: uppercase;
          cursor: pointer;
        }

        .vpSharePreviewButton svg {
          width: 24px;
          height: 24px;
        }

        @media (max-width: 767px) {
          .vpSharePanelShell {
            gap: 8px;
            padding-left: 10px;
            padding-right: 10px;
          }

          .vpShareHeader {
            min-height: 50px;
          }

          .vpShareScroll {
            justify-content: flex-start;
            gap: 16px;
            padding-bottom: max(16px, env(safe-area-inset-bottom));
          }

          .vpShareSummaryCard {
            grid-template-columns: auto minmax(0, 1fr);
            gap: 18px;
            padding: 16px;
            align-items: center;
          }

          .vpSharePhotoPreview {
            width: clamp(205px, 46vw, 330px);
            min-height: 0;
          }

          .vpSharePhotoPreview.isPortrait,
          .vpSharePhotoPreview.isUnknown {
            width: min(38vw, 190px, calc(350px * var(--vp-share-photo-factor)));
          }

          .vpSharePhotoPreview.isSquare {
            width: min(42vw, 235px);
          }

          .vpSharePhotoFishBody svg {
            width: clamp(150px, 34vw, 245px);
            height: clamp(150px, 34vw, 245px);
          }

          .vpShareSummaryText {
            justify-content: center;
          }

          .vpShareSummaryText > span {
            font-size: 10.5px;
          }

          .vpShareSummaryText > strong {
            font-size: clamp(23px, 5vw, 36px);
          }

          .vpShareSummaryText > p {
            font-size: clamp(13px, 2.8vw, 22px);
          }

          .vpShareSummaryDate {
            margin-top: 10px;
          }

          .vpShareSummaryDate svg {
            width: 17px;
            height: 17px;
          }

          .vpShareSummaryDate small {
            font-size: clamp(12.5px, 2.4vw, 19px);
          }

          .vpShareSummaryStats {
            grid-template-columns: 1fr;
            margin-top: 11px;
            padding-top: 11px;
            gap: 0;
          }

          .vpShareSummaryStats div {
            min-height: 44px;
          }

          .vpShareSummaryStats div + div {
            border-top: 1px solid rgba(148, 163, 184, 0.16);
          }

          .vpShareSummaryStats b {
            font-size: clamp(20px, 4vw, 32px);
          }

          .vpShareSummaryStats svg {
            width: 18px;
            height: 18px;
          }

          .vpShareModes {
            padding: 12px;
            gap: 10px;
          }

          .vpShareSectionHeader h2,
          .vpShareChannels h2 {
            font-size: 16px;
          }

          .vpShareSectionHeader span {
            font-size: 10.5px;
            padding: 5px 9px;
          }

          .vpShareModeGrid {
            gap: 10px;
          }

          .vpShareModeButton {
            min-height: 52px;
            padding: 0 10px;
            border-radius: 16px;
          }

          .vpShareModeButton span {
            font-size: 14px;
          }

          .vpShareModeButton svg {
            width: 20px;
            height: 20px;
          }

          .vpShareModeHelp {
            font-size: 13px;
          }

          .vpShareChannels {
            gap: 10px;
          }

          .vpShareSocialGrid {
            gap: 8px;
          }

          .vpShareSocialButton > span {
            width: 56px;
            height: 56px;
            border-radius: 16px;
          }

          .vpShareSocialIcon,
          .vpShareSocialIcon svg {
            width: 37px;
            height: 37px;
          }

          .vpShareSocialButton small {
            font-size: 11.5px;
          }

          .vpSharePreviewButton {
            min-height: 64px;
            border-radius: 17px;
            font-size: 17px;
          }

          .vpSharePreviewButton svg {
            width: 25px;
            height: 25px;
          }
        }

        @media (max-width: 374px) {
          .vpShareSummaryCard {
            grid-template-columns: auto minmax(0, 1fr);
          }

          .vpSharePhotoPreview {
            width: 184px;
            min-height: 0;
          }

          .vpSharePhotoPreview.isPortrait,
          .vpSharePhotoPreview.isUnknown {
            width: min(36vw, 164px, calc(310px * var(--vp-share-photo-factor)));
          }

          .vpSharePhotoFishBody svg {
            width: 138px;
            height: 138px;
          }

          .vpShareSummaryText > strong {
            font-size: 21px;
          }

          .vpShareSummaryText > p {
            font-size: 12px;
          }

          .vpShareSocialButton > span {
            width: 52px;
            height: 52px;
          }

          .vpShareSocialButton small {
            font-size: 10.8px;
          }
        }

        @media (min-width: 768px) {
          .vpSharePreview {
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

          .vpSharePanelFrame {
            position: relative;
            width: min(86vw, 760px);
            height: min(78dvh, 680px);
            max-height: calc(100dvh - 96px);
            display: flex;
            justify-content: center;
            align-items: stretch;
          }

          .vpShareCloseButton {
            position: absolute;
            top: -34px;
            right: -54px;
            left: auto;
            width: 44px;
            height: 44px;
            border-radius: 15px;
          }

          .vpSharePanelShell {
            width: 100%;
            height: 100%;
            max-height: calc(100dvh - 96px);
            padding: 14px;
            display: flex;
            flex-direction: column;
            gap: 10px;
            background: rgba(3, 10, 18, 0.82);
            border: 1px solid rgba(148, 163, 184, 0.14);
            border-radius: 28px;
            box-shadow: 0 24px 80px rgba(0, 0, 0, 0.34);
            backdrop-filter: blur(6px);
            overflow: hidden;
            box-sizing: border-box;
          }

          .vpShareHeader {
            min-height: 44px;
            grid-template-columns: 48px 1fr 48px;
          }

          .vpShareHeader h1 {
            text-align: left;
            font-size: 22px;
            padding-left: 4px;
          }

          .vpShareScroll {
            gap: 14px;
            padding-right: 2px;
          }

          .vpShareSummaryCard,
          .vpShareModes {
            background: rgba(10, 18, 30, 0.82);
            border: 1px solid rgba(148, 163, 184, 0.18);
          }

          .vpShareSummaryCard {
            grid-template-columns: auto minmax(0, 1fr);
            padding: 12px;
            gap: 18px;
            align-items: center;
          }

          .vpSharePhotoPreview {
            width: 300px;
            min-height: 0;
          }

          .vpSharePhotoPreview.isPortrait,
          .vpSharePhotoPreview.isUnknown {
            width: min(182px, calc(320px * var(--vp-share-photo-factor)));
          }

          .vpSharePhotoPreview.isSquare {
            width: 210px;
          }

          .vpSharePhotoFishBody svg {
            width: 142px;
            height: 142px;
          }

          .vpShareSummaryText > strong {
            font-size: 32px;
          }

          .vpShareSummaryText > p {
            font-size: 16px;
          }

          .vpShareSummaryDate small {
            font-size: 13px;
          }

          .vpShareSummaryStats b {
            font-size: 22px;
          }

          .vpShareSummaryStats svg {
            width: 20px;
            height: 20px;
          }

          .vpShareModes {
            padding: 11px;
            gap: 9px;
          }

          .vpShareSectionHeader h2,
          .vpShareChannels h2 {
            font-size: 16px;
          }

          .vpShareModeButton {
            min-height: 48px;
          }

          .vpShareSocialButton > span {
            width: 58px;
            height: 58px;
            border-radius: 16px;
          }

          .vpShareSocialIcon,
          .vpShareSocialIcon svg {
            width: 38px;
            height: 38px;
          }

          .vpShareSocialButton small {
            font-size: 12px;
          }

          .vpSharePreviewButton {
            min-height: 58px;
            font-size: 17px;
          }
        }
      `}</style>
    </section>
  );
}
