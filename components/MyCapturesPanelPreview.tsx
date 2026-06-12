'use client';

import type React from 'react';

export type MyCapturesPanelCapture = {
  id: string;
  title: string;
  place: string;
  weight: string;
  size: string;
  date: string;
  time: string;
  kind: 'peva' | 'flecha' | 'sargo' | 'generic';
  photoUrl?: string;
};

type MyCapturesPanelPreviewProps = {
  onClose?: () => void;
  onOpenCapture?: (captureId: string) => void;
  captures?: MyCapturesPanelCapture[];
  summaryTotal?: number;
  summaryBestWeight?: string;
  summaryLastCapture?: string;
};

type IconProps = {
  className?: string;
};

const previewCaptures: MyCapturesPanelCapture[] = [
  {
    id: '86',
    title: 'Captura #86',
    place: 'Ponto sem nome',
    weight: '\u2014',
    size: '\u2014',
    date: '12/06/2026',
    time: '0h04',
    kind: 'peva',
  },
  {
    id: '85',
    title: 'Captura #85',
    place: 'Ponto sem nome',
    weight: '\u2014',
    size: '\u2014',
    date: '12/06/2026',
    time: '0h03',
    kind: 'flecha',
  },
  {
    id: '84',
    title: 'teste',
    place: 'Ponto sem nome',
    weight: '\u2014',
    size: '\u2014',
    date: '12/06/2026',
    time: '0h02',
    kind: 'generic',
  },
  {
    id: '83',
    title: 'Captura #83',
    place: 'Ponto sem nome',
    weight: '\u2014',
    size: '\u2014',
    date: '12/06/2026',
    time: '0h02',
    kind: 'sargo',
  },
  {
    id: '82',
    title: 'Captura #82',
    place: 'Ponto sem nome',
    weight: '\u2014',
    size: '\u2014',
    date: '12/06/2026',
    time: '0h01',
    kind: 'peva',
  },
  {
    id: '81',
    title: 'Robalo',
    place: 'Ponto sem nome',
    weight: '12 kg',
    size: '103 cm',
    date: '23/02/2026',
    time: '15h30',
    kind: 'flecha',
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

function TrophyIcon(props: IconProps) {
  return (
    <SvgBase {...props}>
      <path d="M17 10h14v7c0 7-3.2 12-7 12s-7-5-7-12v-7Z" />
      <path d="M17 14h-5v4c0 4.5 3.5 7 7 7" />
      <path d="M31 14h5v4c0 4.5-3.5 7-7 7" />
      <path d="M24 29v7" />
      <path d="M17 40h14" />
      <path d="M20 36h8" />
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

function ScaleIcon(props: IconProps) {
  return (
    <SvgBase {...props}>
      <path d="M24 8v30" />
      <path d="M14 16h20" />
      <path d="M14 16l-6 12h12l-6-12Z" />
      <path d="M34 16l-6 12h12l-6-12Z" />
      <path d="M16 40h16" />
    </SvgBase>
  );
}

function RulerIcon(props: IconProps) {
  return (
    <SvgBase {...props}>
      <path d="M10 35 35 10l6 6-25 25-6-6Z" />
      <path d="m18 31-4-4" />
      <path d="m24 25-3-3" />
      <path d="m30 19-4-4" />
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

function ChevronIcon(props: IconProps) {
  return (
    <SvgBase {...props}>
      <path d="M18 10l14 14-14 14" />
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
  return <div className={`vpMyCapturesCard ${className}`}>{children}</div>;
}

function FishThumb({ kind }: { kind: MyCapturesPanelCapture['kind'] }) {
  const isSargo = kind === 'sargo';
  const isFlecha = kind === 'flecha';
  const isGeneric = kind === 'generic';

  return (
    <div className="vpMyCapturesFishThumb">
      <div className="vpMyCapturesFishThumbBg" />

      <svg viewBox="0 0 150 84" className="vpMyCapturesFishDrawing" aria-hidden="true">
        <path
          d={
            isGeneric
              ? 'M34 43 C49 24 88 24 112 43 C88 62 49 62 34 43 Z'
              : isSargo
                ? 'M34 43 C45 20 86 18 113 42 C91 66 50 68 34 43 Z'
                : isFlecha
                  ? 'M25 43 C46 19 96 18 126 42 C96 67 49 66 25 43 Z'
                  : 'M28 44 C47 22 91 20 119 43 C91 66 50 65 28 44 Z'
          }
          fill="rgba(125,211,252,0.92)"
          stroke="rgba(255,255,255,0.55)"
          strokeWidth="2"
        />
        <path
          d="M115 42 L140 27 L134 43 L140 59 Z"
          fill="rgba(56,189,248,0.72)"
          stroke="rgba(255,255,255,0.32)"
          strokeWidth="2"
        />
        <circle cx="47" cy="39" r="3.8" fill="rgba(2,6,23,0.95)" />
        <path
          d="M58 35 C73 40 91 40 108 35"
          fill="none"
          stroke="rgba(15,23,42,0.32)"
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

      <div className="vpMyCapturesFishThumbShade" />
    </div>
  );
}

function MyCapturesHeader({
  total,
  bestWeight,
  lastCapture,
}: {
  total: number;
  bestWeight: string;
  lastCapture: string;
}) {
  const captureLabel = total === 1 ? '1 captura' : `${total} capturas`;

  return (
    <CardShell className="vpMyCapturesHeaderCard">
      <div className="vpMyCapturesTrophyIcon">
        <TrophyIcon />
      </div>

      <div className="vpMyCapturesHeaderText">
        <span>{'Meu di\u00E1rio de pesca'}</span>
        <strong>Minhas Capturas</strong>
        <p>Toque para localizar no mapa.</p>
        <div className="vpMyCapturesSummaryLine">
          <span>{`${captureLabel} \u2022 Maior ${bestWeight}`}</span>
          <span>{`\u00DAltima ${lastCapture}`}</span>
        </div>
      </div>
    </CardShell>
  );
}

function CaptureCard({
  capture,
  onOpenCapture,
}: {
  capture: MyCapturesPanelCapture;
  onOpenCapture?: (captureId: string) => void;
}) {
  const bullet = '\u2022';

  return (
    <article
      className={`vpMyCapturesCaptureCard${onOpenCapture ? ' cursor-pointer' : ''}`}
      onClick={() => onOpenCapture?.(capture.id)}
      role={onOpenCapture ? 'button' : undefined}
      tabIndex={onOpenCapture ? 0 : undefined}
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
      {capture.photoUrl ? (
        <div className="vpMyCapturesFishThumb">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={capture.photoUrl}
            alt="Foto da captura"
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        </div>
      ) : (
        <FishThumb kind={capture.kind} />
      )}

      <div className="vpMyCapturesCaptureText">
        <strong>{capture.title}</strong>

        <div className="vpMyCapturesPlaceLine">
          <PinIcon />
          <span>{capture.place}</span>
        </div>

        <div className="vpMyCapturesMetaLine">
          <span className="vpMyCapturesMetaItem">
            <ScaleIcon />
            <b>Peso</b>
            <span>{capture.weight}</span>
          </span>

          <span className="vpMyCapturesMetaItem">
            <RulerIcon />
            <b>Tam.</b>
            <span>{capture.size}</span>
          </span>

          <span className="vpMyCapturesMetaItem vpMyCapturesDateItem">
            <CalendarIcon />
            <span>
              {capture.date} {bullet} {capture.time}
            </span>
          </span>
        </div>
      </div>

      <div className="vpMyCapturesChevron">
        <ChevronIcon />
      </div>
    </article>
  );
}

function CapturesList({
  captures,
  onOpenCapture,
}: {
  captures: MyCapturesPanelCapture[];
  onOpenCapture?: (captureId: string) => void;
}) {
  return (
    <CardShell className="vpMyCapturesListBlock">
      <div className="vpMyCapturesSectionTitle">
        <div className="vpMyCapturesSectionLabel">
          <FishIcon />
          <span>Todas as capturas</span>
        </div>
      </div>

      <div className="vpMyCapturesScroll">
        <div className="vpMyCapturesList">
          {captures.map((capture) => (
            <CaptureCard key={capture.id} capture={capture} onOpenCapture={onOpenCapture} />
          ))}
        </div>
      </div>
    </CardShell>
  );
}

export default function MyCapturesPanelPreview({
  onClose,
  onOpenCapture,
  captures,
  summaryTotal,
  summaryBestWeight,
  summaryLastCapture,
}: MyCapturesPanelPreviewProps) {
  const panelCaptures = captures ?? previewCaptures;
  const total = typeof summaryTotal === 'number' ? summaryTotal : panelCaptures.length;
  const bestWeight = summaryBestWeight || '--';
  const lastCapture = summaryLastCapture || '--';

  return (
    <section className="vpMyCapturesPreview" aria-label="Preview Minhas Capturas">
      <div className="vpMyCapturesPanelFrame">
        <button
          className="vpMyCapturesCloseButton"
          type="button"
          aria-label="Fechar"
          onClick={onClose}
        >
          <CloseIcon />
        </button>

        <main className="vpMyCapturesPanelShell">
          <MyCapturesHeader total={total} bestWeight={bestWeight} lastCapture={lastCapture} />
          <CapturesList captures={panelCaptures} onOpenCapture={onOpenCapture} />
        </main>
      </div>

      <style jsx global>{`
        .vpMyCapturesPreview {
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

        .vpMyCapturesCloseButton {
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

        .vpMyCapturesCloseButton svg {
          width: 25px;
          height: 25px;
        }

        .vpMyCapturesPanelShell {
          width: min(100vw, 460px);
          height: 100dvh;
          margin: 0 auto;
          padding: max(10px, env(safe-area-inset-top)) 12px max(10px, env(safe-area-inset-bottom));
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
          gap: 7px;
        }

        .vpMyCapturesCard {
          background: linear-gradient(135deg, rgba(23, 31, 42, 0.88), rgba(10, 16, 23, 0.94));
          border: 1px solid rgba(148, 163, 184, 0.2);
          box-shadow:
            inset 0 1px 0 rgba(255, 255, 255, 0.035),
            0 14px 34px rgba(0, 0, 0, 0.18);
          backdrop-filter: blur(14px);
        }

        .vpMyCapturesHeaderCard {
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

        .vpMyCapturesTrophyIcon {
          width: 52px;
          height: 52px;
          border-radius: 999px;
          color: #fbbf24;
          display: flex;
          align-items: center;
          justify-content: center;
          background: radial-gradient(circle, rgba(14, 165, 233, 0.18), transparent 66%);
          box-shadow: 0 0 24px rgba(14, 165, 233, 0.14);
        }

        .vpMyCapturesTrophyIcon svg {
          width: 32px;
          height: 32px;
          filter: drop-shadow(0 0 8px rgba(251, 191, 36, 0.24));
        }

        .vpMyCapturesHeaderText {
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .vpMyCapturesHeaderText span {
          color: rgba(226, 232, 240, 0.72);
          font-size: 11px;
          line-height: 1;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          font-weight: 720;
        }

        .vpMyCapturesHeaderText strong {
          color: #38bdf8;
          font-size: clamp(25px, 7vw, 33px);
          line-height: 1.02;
          font-weight: 800;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          letter-spacing: -0.04em;
        }

        .vpMyCapturesHeaderText p {
          margin: 0;
          color: rgba(226, 232, 240, 0.78);
          font-size: clamp(13px, 3.35vw, 15px);
          line-height: 1.24;
          font-weight: 560;
          white-space: normal;
          overflow: visible;
          text-overflow: clip;
        }

        .vpMyCapturesSummaryLine {
          width: fit-content;
          max-width: 100%;
          color: rgba(248, 250, 252, 0.88);
          font-size: clamp(12px, 3.05vw, 13px);
          line-height: 1.28;
          font-weight: 720;
          display: flex;
          flex-direction: column;
          gap: 2px;
          white-space: normal;
          overflow: visible;
          text-overflow: clip;
        }

        .vpMyCapturesSummaryLine span {
          display: block;
        }

        .vpMyCapturesListBlock {
          flex: 1 1 auto;
          min-height: 0;
          border-radius: 18px;
          padding: 10px;
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .vpMyCapturesSectionTitle {
          flex: 0 0 auto;
          display: flex;
          align-items: center;
          justify-content: flex-start;
          gap: 10px;
          min-height: 28px;
          padding: 0 2px;
        }

        .vpMyCapturesSectionLabel {
          min-width: 0;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          color: rgba(226, 232, 240, 0.84);
          font-size: clamp(13px, 3.45vw, 15px);
          line-height: 1;
          font-weight: 800;
          letter-spacing: 0.095em;
          text-transform: uppercase;
        }

        .vpMyCapturesSectionLabel svg {
          width: 23px;
          height: 23px;
          color: #7dd3fc;
          flex: 0 0 auto;
        }

        .vpMyCapturesScroll {
          flex: 1 1 auto;
          min-height: 0;
          overflow-y: auto;
          overflow-x: hidden;
          padding-right: 2px;
          scrollbar-color: rgba(125, 211, 252, 0.45) rgba(15, 23, 42, 0.55);
          scrollbar-width: thin;
        }

        .vpMyCapturesList {
          display: flex;
          flex-direction: column;
          gap: 10px;
          padding-bottom: 2px;
        }

        .vpMyCapturesCaptureCard {
          position: relative;
          min-height: 124px;
          border-radius: 16px;
          border: 1px solid rgba(148, 163, 184, 0.16);
          background: rgba(3, 10, 20, 0.46);
          display: grid;
          grid-template-columns: auto minmax(0, 1fr) auto;
          align-items: center;
          gap: 13px;
          padding: 10px 11px;
          box-sizing: border-box;
          box-shadow:
            inset 0 1px 0 rgba(255, 255, 255, 0.035),
            0 10px 22px rgba(0, 0, 0, 0.16);
          cursor: pointer;
          transition:
            border-color 160ms ease,
            background 160ms ease,
            transform 160ms ease;
        }

        .vpMyCapturesCaptureCard:hover {
          border-color: rgba(56, 189, 248, 0.28);
          background: rgba(7, 18, 32, 0.58);
          transform: translateY(-1px);
        }

        .vpMyCapturesFishThumb {
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

        .vpMyCapturesFishThumbBg {
          position: absolute;
          inset: 0;
          background:
            radial-gradient(circle at 25% 35%, rgba(14, 165, 233, 0.36), transparent 36%),
            linear-gradient(135deg, rgba(12, 74, 110, 0.82), rgba(2, 6, 23, 0.95));
        }

        .vpMyCapturesFishDrawing {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
        }

        .vpMyCapturesFishThumbShade {
          position: absolute;
          inset: auto 0 0;
          height: 28px;
          background: linear-gradient(to top, rgba(2, 6, 23, 0.76), transparent);
        }

        .vpMyCapturesCaptureText {
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 7px;
        }

        .vpMyCapturesCaptureText > strong {
          color: #ffffff;
          font-size: clamp(21px, 5.5vw, 25px);
          line-height: 1.02;
          font-weight: 830;
          letter-spacing: -0.04em;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .vpMyCapturesPlaceLine {
          min-width: 0;
          display: flex;
          align-items: center;
          gap: 6px;
          color: rgba(226, 232, 240, 0.86);
          font-size: clamp(13px, 3.4vw, 15px);
          line-height: 1.08;
          font-weight: 730;
        }

        .vpMyCapturesPlaceLine svg {
          width: 16px;
          height: 16px;
          color: #fb7185;
          flex: 0 0 auto;
        }

        .vpMyCapturesPlaceLine span {
          min-width: 0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .vpMyCapturesMetaLine {
          min-width: 0;
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 8px 16px;
          color: rgba(248, 250, 252, 0.94);
          font-size: clamp(13px, 3.3vw, 15px);
          line-height: 1.1;
          font-weight: 760;
        }

        .vpMyCapturesMetaItem {
          min-width: 0;
          display: inline-flex;
          align-items: center;
          gap: 5px;
          white-space: nowrap;
        }

        .vpMyCapturesMetaItem svg {
          width: 15px;
          height: 15px;
          color: #7dd3fc;
          flex: 0 0 auto;
        }

        .vpMyCapturesMetaItem b {
          color: rgba(248, 250, 252, 0.96);
          font-weight: 820;
        }

        .vpMyCapturesMetaItem span {
          min-width: 0;
          color: rgba(226, 232, 240, 0.82);
          font-weight: 720;
        }

        .vpMyCapturesDateItem {
          color: rgba(226, 232, 240, 0.8);
        }

        .vpMyCapturesChevron {
          width: 24px;
          height: 24px;
          color: rgba(226, 232, 240, 0.55);
          display: flex;
          align-items: center;
          justify-content: center;
          flex: 0 0 auto;
        }

        .vpMyCapturesChevron svg {
          width: 20px;
          height: 20px;
        }

        .vpMyCapturesTrophyIcon svg,
        .vpMyCapturesSectionLabel svg,
        .vpMyCapturesPlaceLine svg,
        .vpMyCapturesMetaItem svg,
        .vpMyCapturesChevron svg,
        .vpMyCapturesCloseButton svg {
          fill: none;
          stroke: currentColor;
          stroke-width: 3;
          stroke-linecap: round;
          stroke-linejoin: round;
        }

        @media (max-width: 767px) {
          .vpMyCapturesPanelShell {
            gap: 14px;
            padding-left: 10px;
            padding-right: 10px;
          }

          .vpMyCapturesHeaderCard {
            min-height: 210px;
            gap: 18px;
            padding: 28px 18px 26px;
            border-radius: 22px;
          }

          .vpMyCapturesTrophyIcon {
            width: 72px;
            height: 72px;
          }

          .vpMyCapturesTrophyIcon svg {
            width: 42px;
            height: 42px;
          }

          .vpMyCapturesHeaderText {
            gap: 7px;
          }

          .vpMyCapturesHeaderText span {
            font-size: 12px;
            letter-spacing: 0.13em;
          }

          .vpMyCapturesHeaderText strong {
            font-size: clamp(33px, 8.8vw, 40px);
          }

          .vpMyCapturesHeaderText p {
            font-size: 16px;
            line-height: 1.28;
            white-space: normal;
          }

          .vpMyCapturesSummaryLine {
            max-width: 100%;
            font-size: 13.5px;
            line-height: 1.28;
          }

          .vpMyCapturesListBlock {
            flex: 0 0 auto;
            min-height: 0;
            padding: 12px;
          }

          .vpMyCapturesScroll {
            flex: 0 0 auto;
            height: 458px;
            max-height: 458px;
            overflow-y: auto;
          }

          .vpMyCapturesCaptureCard {
            min-height: 152px;
            gap: 12px;
            padding: 12px 10px;
          }

          .vpMyCapturesFishThumb {
            width: 114px;
            height: 80px;
            border-radius: 16px;
          }

          .vpMyCapturesCaptureText {
            gap: 8px;
          }

          .vpMyCapturesCaptureText > strong {
            font-size: 24px;
          }

          .vpMyCapturesPlaceLine {
            font-size: 14.5px;
          }

          .vpMyCapturesMetaLine {
            gap: 7px 14px;
            font-size: 14.5px;
          }

          .vpMyCapturesMetaItem svg {
            width: 15px;
            height: 15px;
          }

          .vpMyCapturesChevron {
            width: 18px;
          }

          .vpMyCapturesChevron svg {
            width: 17px;
            height: 17px;
          }
        }

        @media (max-width: 360px) {
          .vpMyCapturesHeaderCard {
            min-height: 190px;
            gap: 14px;
            padding: 24px 14px 22px;
          }

          .vpMyCapturesTrophyIcon {
            width: 62px;
            height: 62px;
          }

          .vpMyCapturesTrophyIcon svg {
            width: 36px;
            height: 36px;
          }

          .vpMyCapturesHeaderText strong {
            font-size: 30px;
          }

          .vpMyCapturesHeaderText p {
            font-size: 14px;
          }

          .vpMyCapturesSummaryLine {
            font-size: 11.5px;
          }

          .vpMyCapturesScroll {
            height: 422px;
            max-height: 422px;
          }

          .vpMyCapturesCaptureCard {
            min-height: 140px;
          }

          .vpMyCapturesFishThumb {
            width: 104px;
            height: 74px;
          }

          .vpMyCapturesCaptureText {
            gap: 7px;
          }

          .vpMyCapturesCaptureText > strong {
            font-size: 21px;
          }

          .vpMyCapturesPlaceLine {
            font-size: 13px;
          }

          .vpMyCapturesMetaLine {
            gap: 6px 11px;
            font-size: 13px;
          }

          .vpMyCapturesMetaItem svg {
            width: 14px;
            height: 14px;
          }
        }

        @media (min-width: 768px) {
          .vpMyCapturesPreview {
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

          .vpMyCapturesPanelFrame {
            position: relative;
            width: min(86vw, 760px);
            height: min(78dvh, 680px);
            max-height: calc(100dvh - 96px);
            display: flex;
            justify-content: center;
            align-items: stretch;
          }

          .vpMyCapturesCloseButton {
            position: absolute;
            top: -34px;
            right: -54px;
            left: auto;
            width: 44px;
            height: 44px;
            border-radius: 15px;
          }

          .vpMyCapturesPanelShell {
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

          .vpMyCapturesCard {
            background: rgba(10, 18, 30, 0.82);
            border: 1px solid rgba(148, 163, 184, 0.18);
          }

          .vpMyCapturesHeaderCard {
            min-height: 118px;
            padding: 16px 18px;
            border-radius: 18px;
            gap: 16px;
          }

          .vpMyCapturesTrophyIcon {
            width: 58px;
            height: 58px;
          }

          .vpMyCapturesTrophyIcon svg {
            width: 36px;
            height: 36px;
          }

          .vpMyCapturesHeaderText span {
            font-size: 12px;
          }

          .vpMyCapturesHeaderText strong {
            font-size: 32px;
          }

          .vpMyCapturesHeaderText p {
            font-size: 15px;
          }

          .vpMyCapturesSummaryLine {
            font-size: 13px;
          }

          .vpMyCapturesListBlock {
            flex: 1 1 auto;
            min-height: 0;
            max-height: none;
            overflow: hidden;
            border-radius: 18px;
            padding: 12px;
          }

          .vpMyCapturesSectionTitle {
            min-height: 30px;
          }

          .vpMyCapturesSectionLabel {
            font-size: 15px;
          }

          .vpMyCapturesScroll {
            flex: 1 1 auto;
            min-height: 0;
            overflow-y: auto;
          }

          .vpMyCapturesList {
            gap: 10px;
          }

          .vpMyCapturesCaptureCard {
            min-height: 112px;
            border-radius: 18px;
            padding: 10px 14px;
            gap: 16px;
          }

          .vpMyCapturesFishThumb {
            width: 132px;
            height: 86px;
            border-radius: 16px;
          }

          .vpMyCapturesCaptureText {
            gap: 7px;
          }

          .vpMyCapturesCaptureText > strong {
            font-size: 24px;
          }

          .vpMyCapturesPlaceLine {
            font-size: 15px;
          }

          .vpMyCapturesMetaLine {
            font-size: 15px;
            gap: 8px 18px;
          }

          .vpMyCapturesMetaItem svg {
            width: 15px;
            height: 15px;
          }
        }
      `}</style>
    </section>
  );
}
