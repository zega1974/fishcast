'use client';

/* eslint-disable @next/next/no-img-element */

import type React from 'react';
import { useMemo, useState } from 'react';

type ShareMode = 'secret' | 'complete';
type PhotoMode = 'landscape' | 'portrait';

const TEXT = {
  secret: 'Secreto',
  complete: 'Completo',
  horizontal: 'Horizontal',
  vertical: 'Vertical',
  secretMode: 'MODO SECRETO',
  completeMode: 'MODO COMPLETO',
  capture: 'MINHA CAPTURA',
  species: 'Robalo',
  weight: '12 kg',
  size: '103 cm',
  date: '23/02/2026',
  time: '15h30',
  secretLocation: 'Regi\u00e3o aproximada de',
  completeLocation: 'Espig\u00e3o central de',
  city: 'Matinhos',
  secretNote: 'Ponto exato e coordenadas n\u00e3o s\u00e3o exibidos.',
  coordinates: '-25.817000, -48.536000',
  observations: 'OBSERVA\u00c7\u00d5ES',
  observationLine1: 'Isca: meia \u00e1gua glow 11,5 cm.',
  observationLine2: '\u00c1gua clara, mar\u00e9 enchendo e trabalho com pausas curtas.',
  observationLine3: 'Peixe bateu forte perto da transi\u00e7\u00e3o da \u00e1gua.',
  download: 'Baixe o app',
  brand: 'VouPescar',
};

function FakeQrCode() {
  const cells = useMemo(() => {
    const items: Array<{ x: number; y: number; key: string }> = [];

    for (let y = 0; y < 21; y += 1) {
      for (let x = 0; x < 21; x += 1) {
        const inTopLeft = x < 8 && y < 8;
        const inTopRight = x > 12 && y < 8;
        const inBottomLeft = x < 8 && y > 12;

        if (inTopLeft || inTopRight || inBottomLeft) {
          continue;
        }

        const fill =
          (x * 7 + y * 11 + x * y) % 5 === 0 ||
          (x + y) % 9 === 0 ||
          (y === 10 && x > 3 && x < 18) ||
          (x === 10 && y > 3 && y < 18);

        if (fill) {
          items.push({ x, y, key: `${x}-${y}` });
        }
      }
    }

    return items;
  }, []);

  return (
    <div className="vpShareImageQr" aria-label="QR code provis\u00f3rio">
      <span className="vpQrFinder vpQrFinderTopLeft" />
      <span className="vpQrFinder vpQrFinderTopRight" />
      <span className="vpQrFinder vpQrFinderBottomLeft" />

      {cells.map((cell) => (
        <span
          key={cell.key}
          className="vpQrCell"
          style={{
            left: `${(cell.x / 21) * 100}%`,
            top: `${(cell.y / 21) * 100}%`,
          }}
        />
      ))}
    </div>
  );
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

function LockIcon() {
  return (
    <SvgBase>
      <rect x="13" y="21" width="22" height="18" rx="3" />
      <path d="M18 21v-5a6 6 0 0 1 12 0v5" />
      <path d="M24 28v5" />
    </SvgBase>
  );
}

function UnlockIcon() {
  return (
    <SvgBase>
      <rect x="13" y="21" width="22" height="18" rx="3" />
      <path d="M18 21v-5a6 6 0 0 1 11.3-2.8" />
      <path d="M24 28v5" />
    </SvgBase>
  );
}

function PinIcon() {
  return (
    <SvgBase>
      <path d="M24 43s14-12.5 14-25A14 14 0 1 0 10 18c0 12.5 14 25 14 25Z" />
      <circle cx="24" cy="18" r="5" />
    </SvgBase>
  );
}

function ShieldIcon() {
  return (
    <SvgBase>
      <path d="M24 6 38 12v11c0 11-8.5 17-14 20-5.5-3-14-9-14-20V12l14-6Z" />
      <path d="m17 24 5 5 10-13" />
    </SvgBase>
  );
}

function WeightIcon() {
  return (
    <SvgBase>
      <path d="M16 18h16l2.8 20H13.2L16 18Z" />
      <path d="M19 18a5 5 0 0 1 10 0" />
      <path d="M24 26v6" />
    </SvgBase>
  );
}

function RulerIcon() {
  return (
    <SvgBase>
      <path d="M8 34 34 8l6 6-26 26-6-6Z" />
      <path d="M16 32l-3-3" />
      <path d="M22 26l-3-3" />
      <path d="M28 20l-3-3" />
    </SvgBase>
  );
}

function CalendarIcon() {
  return (
    <SvgBase>
      <rect x="8" y="10" width="32" height="30" rx="6" />
      <path d="M16 6v8" />
      <path d="M32 6v8" />
      <path d="M8 20h32" />
      <path d="M24 28h7" />
    </SvgBase>
  );
}

function NotesIcon() {
  return (
    <SvgBase>
      <rect x="11" y="8" width="26" height="32" rx="4" />
      <path d="M18 18h12" />
      <path d="M18 25h12" />
      <path d="M18 32h7" />
    </SvgBase>
  );
}

function MetricLine({
  icon,
  value,
}: {
  icon: React.ReactNode;
  value: string;
}) {
  return (
    <div className="vpShareImageMetricLine">
      {icon}
      <strong>{value}</strong>
    </div>
  );
}

function PhotoMock({ photoMode }: { photoMode: PhotoMode }) {
  return (
    <section
      className={`vpShareImagePhoto is${photoMode === 'portrait' ? 'Portrait' : 'Landscape'}`}
      aria-label="Foto da captura"
    >
      <div className="vpShareImagePhotoSoftFill" />
      <div className="vpShareImagePhotoScene">
        <div className="vpShareImagePhotoSky" />
        <div className="vpShareImagePhotoCloud vpShareImageCloudOne" />
        <div className="vpShareImagePhotoCloud vpShareImageCloudTwo" />
        <div className="vpShareImagePhotoCloud vpShareImageCloudThree" />
        <div className="vpShareImagePhotoShore" />
        <div className="vpShareImagePhotoWater" />
        <div className="vpShareImagePhotoPerson" />
        <div className="vpShareImagePhotoCap" />
        <div className="vpShareImagePhotoGlasses" />
        <div className="vpShareImagePhotoSmile" />
        <div className="vpShareImagePhotoFish" />
        <div className="vpShareImagePhotoFishStripe" />
        <div className="vpShareImagePhotoFishTail" />
      </div>
    </section>
  );
}

function FloatingPreviewControls({
  mode,
  photoMode,
  setMode,
  setPhotoMode,
}: {
  mode: ShareMode;
  photoMode: PhotoMode;
  setMode: (mode: ShareMode) => void;
  setPhotoMode: (mode: PhotoMode) => void;
}) {
  return (
    <div className="vpShareImagePreviewControls" aria-label="Controles da preview">
      <button
        type="button"
        className={mode === 'secret' ? 'isActive' : ''}
        onClick={() => setMode('secret')}
      >
        {TEXT.secret}
      </button>

      <button
        type="button"
        className={mode === 'complete' ? 'isActive' : ''}
        onClick={() => setMode('complete')}
      >
        {TEXT.complete}
      </button>

      <span aria-hidden="true" />

      <button
        type="button"
        className={photoMode === 'landscape' ? 'isActive' : ''}
        onClick={() => setPhotoMode('landscape')}
      >
        {TEXT.horizontal}
      </button>

      <button
        type="button"
        className={photoMode === 'portrait' ? 'isActive' : ''}
        onClick={() => setPhotoMode('portrait')}
      >
        {TEXT.vertical}
      </button>
    </div>
  );
}

function CaptureShareImageArt({
  mode,
  photoMode,
}: {
  mode: ShareMode;
  photoMode: PhotoMode;
}) {
  const isSecret = mode === 'secret';

  return (
    <article
      className={`vpShareImageArt is${photoMode === 'portrait' ? 'Portrait' : 'Landscape'}`}
      aria-label="Imagem final de compartilhamento"
    >
      <div className="vpShareImageArtGlow" />
      <div className="vpShareImageArtGrid" />

      <header className="vpShareImageHeader">
        <div className="vpShareImageModeBadge">
          {isSecret ? <LockIcon /> : <UnlockIcon />}
          <span>{isSecret ? TEXT.secretMode : TEXT.completeMode}</span>
        </div>

        <div className="vpShareImageTopGrid">
          <div className="vpShareImageTitleBlock">
            <span>{TEXT.capture}</span>
            <h1>{TEXT.species}</h1>
          </div>

          <div className="vpShareImageMetaBlock">
            <div className="vpShareImageMetricsRow">
              <MetricLine icon={<WeightIcon />} value={TEXT.weight} />
              <span className="vpShareImageMetricDivider" aria-hidden="true" />
              <MetricLine icon={<RulerIcon />} value={TEXT.size} />
            </div>

            <div className="vpShareImageDateRow">
              <CalendarIcon />
              <strong>
                {TEXT.date}
                <span>{' \u2022 '}</span>
                {TEXT.time}
              </strong>
            </div>
          </div>
        </div>

        <div className="vpShareImageHeaderDivider" />

        <section className="vpShareImageLocation" aria-label="Localiza\u00e7\u00e3o">
          <PinIcon />

          <div className="vpShareImageLocationText">
            {isSecret ? (
              <>
                <strong>
                  {TEXT.secretLocation} <b>{TEXT.city}</b>
                </strong>

                <span>
                  <ShieldIcon />
                  {TEXT.secretNote}
                </span>
              </>
            ) : (
              <>
                <strong>
                  {TEXT.completeLocation} <b>{TEXT.city}</b>
                </strong>

                <span>{TEXT.coordinates}</span>
              </>
            )}
          </div>
        </section>
      </header>

      <PhotoMock photoMode={photoMode} />

      <section className="vpShareImageNotes" aria-label="Observa\u00e7\u00f5es">
        <div className="vpShareImageNotesTitle">
          <NotesIcon />
          <span>{TEXT.observations}</span>
        </div>

        <p>
          {TEXT.observationLine1}
          <br />
          {TEXT.observationLine2}
          <br />
          {TEXT.observationLine3}
        </p>
      </section>

      <footer className="vpShareImageFooter">
        <div className="vpShareImageBrand">
          <img
            className="vpShareImageLogo"
            src="/icons/logonovo-simples.png"
            alt=""
            aria-hidden="true"
          />

          <strong>{TEXT.brand}</strong>
        </div>

        <div className="vpShareImageDownload">
          <span>{TEXT.download}</span>
          <b>{'\u2192'}</b>
        </div>

        <FakeQrCode />
      </footer>
    </article>
  );
}

export default function CaptureShareImagePreview() {
  const [mode, setMode] = useState<ShareMode>('secret');
  const [photoMode, setPhotoMode] = useState<PhotoMode>('landscape');

  return (
    <main className="vpShareImagePreviewPage">
      <FloatingPreviewControls
        mode={mode}
        photoMode={photoMode}
        setMode={setMode}
        setPhotoMode={setPhotoMode}
      />

      <div className="vpShareImagePreviewStage">
        <CaptureShareImageArt mode={mode} photoMode={photoMode} />
      </div>

      <style jsx global>{`
        .vpShareImagePreviewPage {
          min-height: 100dvh;
          padding: 12px;
          box-sizing: border-box;
          color: #f8fafc;
          overflow-x: hidden;
          background:
            radial-gradient(circle at 50% 8%, rgba(14, 116, 144, 0.12), transparent 34%),
            radial-gradient(circle at 50% 24%, rgba(30, 42, 56, 0.42), transparent 44%),
            repeating-linear-gradient(
              90deg,
              rgba(35, 82, 148, 0.055) 0px,
              rgba(35, 82, 148, 0.055) 1px,
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

        .vpShareImagePreviewControls {
          position: fixed;
          top: max(10px, env(safe-area-inset-top));
          right: max(10px, env(safe-area-inset-right));
          z-index: 100000;
          display: flex;
          align-items: center;
          gap: 5px;
          padding: 6px;
          border: 1px solid rgba(148, 163, 184, 0.18);
          border-radius: 14px;
          background: rgba(10, 16, 23, 0.74);
          box-shadow:
            inset 0 1px 0 rgba(255, 255, 255, 0.035),
            0 14px 34px rgba(0, 0, 0, 0.22);
          backdrop-filter: blur(14px);
        }

        .vpShareImagePreviewControls span {
          width: 1px;
          height: 22px;
          background: rgba(125, 211, 252, 0.18);
        }

        .vpShareImagePreviewControls button {
          height: 28px;
          border: 1px solid rgba(125, 211, 252, 0.18);
          border-radius: 10px;
          background: rgba(2, 6, 23, 0.36);
          color: rgba(226, 232, 240, 0.7);
          padding: 0 8px;
          font-size: 10px;
          line-height: 1;
          font-weight: 760;
          cursor: pointer;
          transition:
            border-color 160ms ease,
            background 160ms ease,
            color 160ms ease,
            box-shadow 160ms ease;
        }

        .vpShareImagePreviewControls button.isActive {
          border-color: rgba(56, 189, 248, 0.58);
          background: rgba(14, 165, 233, 0.14);
          color: #7dd3fc;
          box-shadow: 0 0 14px rgba(14, 165, 233, 0.12);
        }

        .vpShareImagePreviewStage {
          width: min(100%, 720px);
          min-height: calc(100dvh - 24px);
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .vpShareImageArt {
          position: relative;
          width: min(100%, 430px);
          aspect-ratio: 9 / 16;
          overflow: hidden;
          border-radius: 22px;
          border: 1px solid rgba(56, 189, 248, 0.46);
          background: linear-gradient(135deg, rgba(23, 31, 42, 0.92), rgba(7, 12, 18, 0.98));
          box-shadow:
            inset 0 1px 0 rgba(255, 255, 255, 0.04),
            inset 0 0 0 1px rgba(255, 255, 255, 0.02),
            0 24px 60px rgba(0, 0, 0, 0.44);
          isolation: isolate;
        }

        .vpShareImageArt::before {
          content: "";
          position: absolute;
          inset: 9px;
          z-index: 1;
          pointer-events: none;
          border: 1px solid rgba(56, 189, 248, 0.28);
          border-radius: 17px;
        }

        .vpShareImageArtGlow {
          position: absolute;
          z-index: 0;
          left: 50%;
          top: -22%;
          width: 68%;
          aspect-ratio: 1;
          border-radius: 999px;
          transform: translateX(-50%);
          background: rgba(14, 165, 233, 0.09);
          filter: blur(34px);
          pointer-events: none;
        }

        .vpShareImageArtGrid {
          position: absolute;
          inset: 0;
          z-index: 0;
          pointer-events: none;
          opacity: 0.22;
          background:
            repeating-linear-gradient(
              90deg,
              rgba(35, 82, 148, 0.07) 0px,
              rgba(35, 82, 148, 0.07) 1px,
              transparent 1px,
              transparent 54px
            );
          mask-image: linear-gradient(180deg, black 0%, transparent 58%);
        }

        .vpShareImageHeader {
          position: relative;
          z-index: 2;
          padding: 17px 18px 0;
        }

        .vpShareImageModeBadge {
          width: fit-content;
          height: 30px;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 0 14px;
          border: 1px solid rgba(56, 189, 248, 0.44);
          border-radius: 999px;
          background: rgba(2, 6, 23, 0.32);
          color: #7dd3fc;
          box-shadow:
            0 0 16px rgba(14, 165, 233, 0.08),
            inset 0 1px 0 rgba(255, 255, 255, 0.04);
        }

        .vpShareImageModeBadge svg {
          width: 16px;
          height: 16px;
        }

        .vpShareImageModeBadge span {
          display: block;
          font-size: 11px;
          line-height: 1;
          font-weight: 860;
          letter-spacing: 0.24em;
        }

        .vpShareImageTopGrid {
          margin-top: 18px;
          display: grid;
          grid-template-columns: minmax(0, 0.92fr) minmax(0, 1.08fr);
          gap: 14px;
          align-items: end;
        }

        .vpShareImageTitleBlock {
          min-width: 0;
        }

        .vpShareImageTitleBlock > span {
          display: block;
          color: #38bdf8;
          font-size: 12px;
          line-height: 1;
          font-weight: 820;
          letter-spacing: 0.28em;
        }

        .vpShareImageTitleBlock h1 {
          margin: 10px 0 0;
          color: rgba(248, 250, 252, 0.98);
          font-size: clamp(34px, 9vw, 48px);
          line-height: 0.92;
          font-weight: 860;
          letter-spacing: -0.07em;
          text-shadow: 0 0 16px rgba(255, 255, 255, 0.08);
        }

        .vpShareImageMetaBlock {
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .vpShareImageMetricsRow {
          min-width: 0;
          height: 32px;
          display: grid;
          grid-template-columns: minmax(0, 1fr) 1px minmax(0, 1fr);
          align-items: center;
          gap: 9px;
          border-bottom: 1px solid rgba(125, 211, 252, 0.2);
        }

        .vpShareImageMetricLine {
          min-width: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          color: rgba(248, 250, 252, 0.94);
        }

        .vpShareImageMetricLine svg {
          flex: 0 0 auto;
          width: 18px;
          height: 18px;
          color: #7dd3fc;
        }

        .vpShareImageMetricLine strong {
          display: block;
          min-width: 0;
          font-size: 16px;
          line-height: 1;
          font-weight: 760;
          white-space: nowrap;
        }

        .vpShareImageMetricDivider {
          width: 1px;
          height: 20px;
          background: rgba(56, 189, 248, 0.32);
        }

        .vpShareImageDateRow {
          min-width: 0;
          height: 32px;
          display: flex;
          align-items: center;
          gap: 8px;
          color: rgba(248, 250, 252, 0.92);
          border-bottom: 1px solid rgba(125, 211, 252, 0.2);
        }

        .vpShareImageDateRow svg {
          flex: 0 0 auto;
          width: 18px;
          height: 18px;
          color: #7dd3fc;
        }

        .vpShareImageDateRow strong {
          min-width: 0;
          display: block;
          font-size: 14.5px;
          line-height: 1;
          font-weight: 670;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .vpShareImageDateRow strong span {
          color: #38bdf8;
        }

        .vpShareImageHeaderDivider {
          margin-top: 12px;
          height: 1px;
          background: rgba(125, 211, 252, 0.14);
        }

        .vpShareImageLocation {
          margin-top: 11px;
          display: grid;
          grid-template-columns: 31px minmax(0, 1fr);
          gap: 9px;
          align-items: start;
        }

        .vpShareImageLocation > svg {
          width: 29px;
          height: 29px;
          margin-top: 1px;
          color: #38bdf8;
          fill: rgba(14, 165, 233, 0.08);
          stroke: rgba(125, 211, 252, 0.82);
          stroke-width: 3;
          filter: drop-shadow(0 0 10px rgba(14, 165, 233, 0.16));
        }

        .vpShareImageLocationText {
          min-width: 0;
          padding-top: 2px;
        }

        .vpShareImageLocationText strong {
          display: block;
          min-width: 0;
          color: rgba(248, 250, 252, 0.94);
          font-size: 15px;
          line-height: 1.12;
          font-weight: 600;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .vpShareImageLocationText strong b {
          color: #38bdf8;
          font-weight: 780;
        }

        .vpShareImageLocationText span {
          margin-top: 5px;
          display: flex;
          align-items: center;
          gap: 6px;
          min-width: 0;
          color: rgba(226, 232, 240, 0.72);
          font-size: 10.6px;
          line-height: 1.15;
          font-weight: 520;
        }

        .vpShareImageLocationText span svg {
          flex: 0 0 auto;
          width: 14px;
          height: 14px;
          color: rgba(226, 232, 240, 0.86);
        }

        .vpShareImagePhoto {
          position: relative;
          z-index: 2;
          width: calc(100% - 34px);
          height: 43.8%;
          margin: 14px auto 0;
          overflow: hidden;
          border-radius: 21px;
          border: 1px solid rgba(56, 189, 248, 0.36);
          background: rgba(2, 6, 23, 0.48);
          box-shadow:
            inset 0 1px 0 rgba(255, 255, 255, 0.04),
            0 14px 34px rgba(0, 0, 0, 0.22);
        }

        .vpShareImagePhotoSoftFill {
          position: absolute;
          inset: 0;
          z-index: 1;
          background:
            radial-gradient(circle at 28% 22%, rgba(125, 211, 252, 0.16), transparent 24%),
            radial-gradient(circle at 78% 68%, rgba(14, 165, 233, 0.14), transparent 28%),
            linear-gradient(135deg, rgba(12, 74, 110, 0.68), rgba(2, 6, 23, 0.94));
          filter: blur(0px);
        }

        .vpShareImagePhotoScene {
          position: absolute;
          inset: 0;
          z-index: 2;
          overflow: hidden;
          border-radius: 19px;
          background: #020617;
        }

        .vpShareImagePhoto.isPortrait .vpShareImagePhotoScene {
          inset: 0;
        }

        .vpShareImagePhotoSky {
          position: absolute;
          inset: 0 0 45%;
          background:
            radial-gradient(circle at 18% 30%, rgba(255, 255, 255, 0.8) 0 7%, transparent 8%),
            radial-gradient(circle at 34% 22%, rgba(255, 255, 255, 0.58) 0 5%, transparent 6%),
            radial-gradient(circle at 78% 20%, rgba(255, 255, 255, 0.54) 0 5%, transparent 6%),
            linear-gradient(180deg, rgba(56, 189, 248, 0.78) 0%, rgba(186, 230, 253, 0.72) 100%);
          opacity: 0.62;
        }

        .vpShareImagePhotoCloud {
          position: absolute;
          z-index: 3;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.44);
          filter: blur(2px);
        }

        .vpShareImageCloudOne {
          left: 7%;
          top: 9%;
          width: 16%;
          height: 10%;
        }

        .vpShareImageCloudTwo {
          left: 25%;
          top: 13%;
          width: 13%;
          height: 8%;
        }

        .vpShareImageCloudThree {
          right: 10%;
          top: 12%;
          width: 12%;
          height: 8%;
        }

        .vpShareImagePhotoShore {
          position: absolute;
          z-index: 3;
          left: -5%;
          right: -5%;
          top: 40%;
          height: 12%;
          background:
            radial-gradient(circle at 18% 40%, rgba(22, 101, 52, 0.62), transparent 28%),
            radial-gradient(circle at 70% 46%, rgba(21, 128, 61, 0.64), transparent 32%),
            linear-gradient(90deg, rgba(22, 101, 52, 0.82), rgba(15, 118, 110, 0.62));
        }

        .vpShareImagePhotoWater {
          position: absolute;
          z-index: 2;
          inset: 46% -6% -8%;
          background:
            repeating-linear-gradient(
              168deg,
              rgba(255, 255, 255, 0.08) 0px,
              rgba(255, 255, 255, 0.08) 1px,
              transparent 1px,
              transparent 18px
            ),
            linear-gradient(135deg, rgba(12, 74, 110, 0.86), rgba(15, 23, 42, 0.98));
        }

        .vpShareImagePhotoPerson {
          position: absolute;
          z-index: 5;
          right: 21%;
          bottom: 5%;
          width: 27%;
          height: 61%;
          border-radius: 999px 999px 30px 30px;
          background:
            radial-gradient(circle at 50% 12%, #f5c7a8 0 11%, transparent 12%),
            linear-gradient(180deg, #101827 0 57%, #020617 58% 100%);
          box-shadow: 0 18px 34px rgba(0, 0, 0, 0.32);
        }

        .vpShareImagePhotoPerson::before {
          content: "";
          position: absolute;
          left: 10%;
          top: 20%;
          width: 80%;
          height: 31%;
          border-radius: 16px;
          background: linear-gradient(135deg, rgba(56, 189, 248, 0.58), rgba(250, 204, 21, 0.52));
          opacity: 0.58;
        }

        .vpShareImagePhotoCap {
          position: absolute;
          z-index: 7;
          right: 26%;
          top: 33%;
          width: 16%;
          height: 7%;
          border-radius: 999px 999px 8px 8px;
          background: #0f172a;
          transform: rotate(-2deg);
        }

        .vpShareImagePhotoCap::after {
          content: "VP";
          position: absolute;
          left: 50%;
          top: 50%;
          color: #38bdf8;
          font-size: 8px;
          line-height: 1;
          font-weight: 900;
          transform: translate(-50%, -50%);
        }

        .vpShareImagePhotoGlasses {
          position: absolute;
          z-index: 8;
          right: 27.7%;
          top: 41.5%;
          width: 12%;
          height: 4.2%;
          border-radius: 999px;
          background: linear-gradient(90deg, rgba(20, 184, 166, 0.64), rgba(14, 165, 233, 0.7));
          box-shadow: 0 0 0 2px rgba(2, 6, 23, 0.9);
        }

        .vpShareImagePhotoSmile {
          position: absolute;
          z-index: 8;
          right: 30.2%;
          top: 47.3%;
          width: 6%;
          height: 2%;
          border-bottom: 2px solid rgba(255, 255, 255, 0.78);
          border-radius: 999px;
        }

        .vpShareImagePhotoFish {
          position: absolute;
          z-index: 9;
          left: 4%;
          top: 39%;
          width: 81%;
          height: 25%;
          border-radius: 58% 45% 48% 52% / 45% 48% 52% 55%;
          transform: rotate(-2deg);
          background:
            radial-gradient(circle at 13% 38%, rgba(2, 6, 23, 0.92) 0 3.5%, transparent 4%),
            radial-gradient(circle at 20% 58%, rgba(255, 255, 255, 0.86) 0 8%, transparent 9%),
            repeating-linear-gradient(
              106deg,
              rgba(255, 255, 255, 0.16) 0 3px,
              transparent 3px 11px
            ),
            linear-gradient(90deg, #f8fafc 0%, #cbd5e1 34%, #94a3b8 68%, #64748b 100%);
          box-shadow:
            inset -24px -8px 28px rgba(15, 23, 42, 0.2),
            0 18px 30px rgba(0, 0, 0, 0.28);
        }

        .vpShareImagePhotoFish::before {
          content: "";
          position: absolute;
          left: -4%;
          top: 28%;
          width: 16%;
          height: 48%;
          border-radius: 60% 42% 42% 58%;
          background:
            radial-gradient(circle at 40% 42%, rgba(255, 255, 255, 0.9) 0 20%, transparent 22%),
            linear-gradient(90deg, #f8fafc, #cbd5e1);
          box-shadow: inset -8px 0 16px rgba(15, 23, 42, 0.18);
        }

        .vpShareImagePhotoFish::after {
          content: "";
          position: absolute;
          left: 35%;
          bottom: -22%;
          width: 18%;
          height: 32%;
          clip-path: polygon(12% 0, 100% 22%, 30% 100%);
          background: rgba(234, 179, 8, 0.36);
          border-radius: 4px;
        }

        .vpShareImagePhotoFishStripe {
          position: absolute;
          z-index: 10;
          left: 12%;
          top: 51.2%;
          width: 68%;
          height: 2.4%;
          border-radius: 999px;
          background: rgba(15, 23, 42, 0.54);
          transform: rotate(-2deg);
        }

        .vpShareImagePhotoFishTail {
          position: absolute;
          z-index: 8;
          right: 2%;
          top: 41%;
          width: 20%;
          height: 23%;
          clip-path: polygon(0 50%, 100% 0, 72% 50%, 100% 100%);
          transform: rotate(-2deg);
          background: linear-gradient(90deg, rgba(148, 163, 184, 0.88), rgba(234, 179, 8, 0.36));
          filter: drop-shadow(0 12px 20px rgba(0, 0, 0, 0.22));
        }

        .vpShareImagePhoto.isPortrait .vpShareImagePhotoPerson {
          right: 18%;
          width: 29%;
        }

        .vpShareImagePhoto.isPortrait .vpShareImagePhotoCap {
          right: 24%;
          width: 17%;
        }

        .vpShareImagePhoto.isPortrait .vpShareImagePhotoGlasses {
          right: 26%;
          width: 13%;
        }

        .vpShareImagePhoto.isPortrait .vpShareImagePhotoFish {
          left: 0%;
          top: 40%;
          width: 90%;
          height: 24%;
        }

        .vpShareImagePhoto.isPortrait .vpShareImagePhotoFishStripe {
          left: 10%;
          width: 74%;
        }

        .vpShareImagePhoto.isPortrait .vpShareImagePhotoFishTail {
          right: -2%;
          width: 23%;
        }

        .vpShareImageNotes {
          position: relative;
          z-index: 2;
          width: calc(100% - 34px);
          min-height: 104px;
          margin: 10px auto 0;
          padding: 13px 16px 14px;
          box-sizing: border-box;
          border-radius: 18px;
          border: 1px solid rgba(148, 163, 184, 0.18);
          background: linear-gradient(135deg, rgba(23, 31, 42, 0.88), rgba(10, 16, 23, 0.94));
          box-shadow:
            inset 0 1px 0 rgba(255, 255, 255, 0.035),
            0 10px 24px rgba(0, 0, 0, 0.18);
        }

        .vpShareImageNotesTitle {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #38bdf8;
        }

        .vpShareImageNotesTitle svg {
          width: 18px;
          height: 18px;
        }

        .vpShareImageNotesTitle span {
          display: block;
          font-size: 11px;
          line-height: 1;
          font-weight: 860;
          letter-spacing: 0.22em;
        }

        .vpShareImageNotes p {
          margin: 10px 0 0;
          color: rgba(248, 250, 252, 0.92);
          font-size: 13.2px;
          line-height: 1.28;
          font-weight: 500;
        }

        .vpShareImageFooter {
          position: absolute;
          z-index: 2;
          left: 17px;
          right: 17px;
          bottom: 17px;
          height: 70px;
          display: grid;
          grid-template-columns: minmax(0, 1.15fr) minmax(0, 0.98fr) 62px;
          align-items: center;
          gap: 10px;
          padding: 8px 9px 0;
          box-sizing: border-box;
          border-top: 1px solid rgba(56, 189, 248, 0.28);
        }

        .vpShareImageBrand {
          min-width: 0;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .vpShareImageLogo {
          width: 40px;
          height: 40px;
          flex: 0 0 auto;
          display: block;
          border-radius: 12px;
          object-fit: cover;
          transform: scale(1.18);
          background: transparent;
          box-shadow: 0 0 16px rgba(14, 165, 233, 0.13);
          clip-path: inset(6% round 10px);
        }

        .vpShareImageBrand strong {
          display: block;
          min-width: 0;
          color: rgba(248, 250, 252, 0.96);
          font-size: 19px;
          line-height: 1;
          font-weight: 860;
          letter-spacing: -0.06em;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .vpShareImageDownload {
          min-width: 0;
          height: 50px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          border-left: 1px solid rgba(125, 211, 252, 0.28);
          color: rgba(248, 250, 252, 0.94);
        }

        .vpShareImageDownload span {
          display: block;
          min-width: 0;
          font-size: 15px;
          line-height: 1;
          font-weight: 570;
          white-space: nowrap;
        }

        .vpShareImageDownload b {
          color: #38bdf8;
          font-size: 23px;
          line-height: 1;
          font-weight: 860;
        }

        .vpShareImageQr {
          position: relative;
          width: 58px;
          height: 58px;
          border-radius: 8px;
          background: #ffffff;
          overflow: hidden;
          box-shadow:
            0 0 0 1px rgba(255, 255, 255, 0.44),
            0 0 14px rgba(255, 255, 255, 0.1);
        }

        .vpQrCell {
          position: absolute;
          width: 4.762%;
          height: 4.762%;
          background: #020617;
        }

        .vpQrFinder {
          position: absolute;
          width: 31%;
          height: 31%;
          background: #020617;
        }

        .vpQrFinder::before {
          content: "";
          position: absolute;
          inset: 14%;
          background: #ffffff;
        }

        .vpQrFinder::after {
          content: "";
          position: absolute;
          inset: 30%;
          background: #020617;
        }

        .vpQrFinderTopLeft {
          left: 7%;
          top: 7%;
        }

        .vpQrFinderTopRight {
          right: 7%;
          top: 7%;
        }

        .vpQrFinderBottomLeft {
          left: 7%;
          bottom: 7%;
        }

        @media (max-width: 740px) {
          .vpShareImagePreviewPage {
            padding: 8px;
          }

          .vpShareImagePreviewStage {
            min-height: auto;
            align-items: flex-start;
            padding-top: 0;
            padding-bottom: 14px;
          }

          .vpShareImageArt {
            width: min(100%, 430px);
            max-width: 100%;
            border-radius: 19px;
          }

          .vpShareImagePreviewControls {
            top: auto;
            right: 8px;
            bottom: calc(env(safe-area-inset-bottom) + 10px);
            opacity: 0.78;
          }

          .vpShareImagePreviewControls button {
            height: 26px;
            padding: 0 7px;
            font-size: 9.5px;
          }
        }

        @media (max-width: 430px) {
          .vpShareImageHeader {
            padding: 14px 15px 0;
          }

          .vpShareImageModeBadge {
            height: 28px;
            padding: 0 12px;
          }

          .vpShareImageModeBadge span {
            font-size: 10px;
          }

          .vpShareImageTopGrid {
            margin-top: 14px;
            gap: 10px;
          }

          .vpShareImageTitleBlock > span {
            font-size: 10.5px;
          }

          .vpShareImageTitleBlock h1 {
            margin-top: 8px;
            font-size: clamp(30px, 9.4vw, 41px);
          }

          .vpShareImageMetricLine {
            gap: 5px;
          }

          .vpShareImageMetricLine svg,
          .vpShareImageDateRow svg {
            width: 16px;
            height: 16px;
          }

          .vpShareImageMetricLine strong {
            font-size: 13px;
          }

          .vpShareImageDateRow strong {
            font-size: 12.2px;
          }

          .vpShareImageLocationText strong {
            font-size: 13.5px;
          }

          .vpShareImageLocationText span {
            font-size: 9.8px;
          }

          .vpShareImagePhoto {
            width: calc(100% - 30px);
            margin-top: 12px;
          }

          .vpShareImageNotes {
            width: calc(100% - 30px);
            min-height: 98px;
            margin-top: 9px;
            padding: 12px 14px 12px;
          }

          .vpShareImageNotesTitle span {
            font-size: 10px;
          }

          .vpShareImageNotes p {
            font-size: 12px;
            line-height: 1.24;
          }

          .vpShareImageFooter {
            left: 15px;
            right: 15px;
            bottom: 15px;
            height: 66px;
            grid-template-columns: minmax(0, 1.08fr) minmax(0, 0.94fr) 55px;
            gap: 7px;
          }

          .vpShareImageLogo {
            width: 36px;
            height: 36px;
            border-radius: 11px;
            transform: scale(1.18);
            clip-path: inset(6% round 9px);
          }

          .vpShareImageBrand {
            gap: 6px;
          }

          .vpShareImageBrand strong {
            font-size: 17px;
          }

          .vpShareImageDownload span {
            font-size: 13px;
          }

          .vpShareImageDownload b {
            font-size: 20px;
          }

          .vpShareImageQr {
            width: 52px;
            height: 52px;
          }
        }
      `}</style>
    </main>
  );
}
