'use client';

import { type ReactNode } from 'react';

type IconProps = {
  className?: string;
};

function SvgBase({
  children,
  className = '',
}: {
  children: ReactNode;
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
      <rect x="16" y="16" width="20" height="20" rx="4" />
      <path d="M12 28H10a4 4 0 0 1-4-4V10a4 4 0 0 1 4-4h14a4 4 0 0 1 4 4v2" />
    </SvgBase>
  );
}

function WeightIcon(props: IconProps) {
  return (
    <SvgBase {...props}>
      <path d="M16 17h16l4 24H12l4-24Z" />
      <path d="M18 17a6 6 0 0 1 12 0" />
      <path d="M24 26v8" />
      <path d="M20 30h8" />
    </SvgBase>
  );
}

function RulerIcon(props: IconProps) {
  return (
    <SvgBase {...props}>
      <path d="M9 32 32 9l7 7-23 23-7-7Z" />
      <path d="M17 28l-3-3" />
      <path d="M22 23l-3-3" />
      <path d="M27 18l-3-3" />
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
      <rect x="9" y="12" width="30" height="28" rx="4" />
      <path d="M16 8v8" />
      <path d="M32 8v8" />
      <path d="M9 21h30" />
      <path d="M17 29h4" />
      <path d="M27 29h4" />
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
      <path d="M13 15h22" />
      <path d="M19 15V9h10v6" />
      <path d="M17 20l1 20h12l1-20" />
      <path d="M22 24v11" />
      <path d="M27 24v11" />
    </SvgBase>
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
  icon: ReactNode;
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

export default function CaptureDetailPanelPreview() {
  return (
    <section className="vpCaptureDetailPreview map-control-overlay" aria-label="Minha Captura">
      <div className="vpCaptureDetailPanelFrame">
        <button
          className="vpCaptureDetailCloseButton"
          type="button"
          aria-label="Fechar minha captura"
        >
          <CloseIcon />
        </button>

        <main className="vpCaptureDetailPanelShell">
          <header className="vpCaptureDetailHeader">
            <div className="vpCaptureDetailTitleBlock">
              <span>Minha captura</span>
              <strong>Robalo</strong>
            </div>

            <div className="vpCaptureDetailLocationLine">
              <div className="vpCaptureDetailPlace">
                <PinIcon />
                <span>Ponto sem nome</span>
              </div>

              <div className="vpCaptureDetailCoordinates" aria-label="Coordenadas">
                <CopyIcon />
                <span>-26.096255, -47.971802</span>
              </div>
            </div>
          </header>

          <section className="vpCaptureDetailPhotoCard" aria-label="Foto da captura">
            <div className="vpCaptureDetailPhotoMock">
              <div className="vpCaptureDetailPhotoSky" />
              <div className="vpCaptureDetailPhotoGrass" />
              <div className="vpCaptureDetailPhotoPerson" />
              <div className="vpCaptureDetailPhotoFish" />
              <div className="vpCaptureDetailPhotoFishLine" />
              <span>Foto da captura</span>
            </div>
          </section>

          <section className="vpCaptureDetailInfoArea" aria-label="Dados da captura">
            <div className="vpCaptureDetailStatsGrid">
              <StatCard label="Peso" value="12 kg" icon={<WeightIcon />} />
              <StatCard label="Tamanho" value="103 cm" icon={<RulerIcon />} />
              <StatCard
                label="Isca"
                value="Meia água"
                icon={<LureIcon />}
                className="vpCaptureDetailFull"
              />
              <StatCard
                label="Data / hora"
                value="23/02/2026 - 15h30"
                icon={<CalendarIcon />}
                className="vpCaptureDetailFull"
              />
              <StatCard
                label="Observações"
                value="Sem observações adicionadas."
                icon={<NotesIcon />}
                className="vpCaptureDetailFull"
              />
            </div>
          </section>

          <footer className="vpCaptureDetailFooter">
            <button className="vpCaptureDetailShareButton" type="button">
              <ShareIcon />
              Compartilhar
            </button>

            <button className="vpCaptureDetailDeleteButton" type="button">
              <TrashIcon />
              Apagar
            </button>
          </footer>
        </main>
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
            radial-gradient(circle at 50% 8%, rgba(14, 165, 233, 0.14), transparent 34%),
            radial-gradient(circle at 50% 42%, rgba(15, 23, 42, 0.28), transparent 58%),
            rgba(2, 8, 15, 0.7);
          backdrop-filter: blur(2px);
          font-family:
            Inter,
            ui-sans-serif,
            system-ui,
            -apple-system,
            BlinkMacSystemFont,
            "Segoe UI",
            sans-serif;
        }

        .vpCaptureDetailPreview::before {
          content: "";
          position: absolute;
          inset: 0;
          background:
            linear-gradient(115deg, rgba(15, 23, 42, 0.3), rgba(8, 47, 73, 0.18)),
            url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180' viewBox='0 0 180 180'%3E%3Cg fill='none' stroke='%2338bdf8' stroke-opacity='.09' stroke-width='1'%3E%3Cpath d='M0 40c38-20 74 20 112-1 28-15 42-12 68 4'/%3E%3Cpath d='M-10 92c36-12 67 9 105-5 31-11 56-6 91 14'/%3E%3Cpath d='M0 146c42-18 76 18 118-2 28-14 42-10 64 5'/%3E%3C/g%3E%3C/svg%3E");
          opacity: 0.38;
          pointer-events: none;
        }

        .vpCaptureDetailPanelFrame {
          position: relative;
          z-index: 1;
          width: min(100vw, 480px);
          height: 100dvh;
          max-height: 100dvh;
          margin: 0 auto;
          overflow: hidden;
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
          background: rgba(255, 255, 255, 0.04);
          color: rgba(255, 255, 255, 0.92);
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
          width: 100%;
          height: 100dvh;
          min-height: 0;
          max-height: 100dvh;
          padding: max(12px, env(safe-area-inset-top)) 12px max(10px, env(safe-area-inset-bottom));
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
          gap: 10px;
          overflow: hidden;
        }

        .vpCaptureDetailHeader,
        .vpCaptureDetailPhotoCard,
        .vpCaptureDetailInfoArea,
        .vpCaptureDetailFooter {
          background: linear-gradient(135deg, rgba(23, 31, 42, 0.88), rgba(10, 16, 23, 0.94));
          border: 1px solid rgba(148, 163, 184, 0.2);
          box-shadow:
            inset 0 1px 0 rgba(255, 255, 255, 0.035),
            0 14px 34px rgba(0, 0, 0, 0.18);
          backdrop-filter: blur(14px);
        }

        .vpCaptureDetailHeader {
          flex: 0 0 auto;
          border-radius: 18px;
          padding: 14px 64px 14px 16px;
          box-sizing: border-box;
        }

        .vpCaptureDetailTitleBlock {
          min-width: 0;
        }

        .vpCaptureDetailTitleBlock span {
          display: block;
          color: rgba(226, 232, 240, 0.82);
          font-size: 11px;
          line-height: 1;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          font-weight: 840;
        }

        .vpCaptureDetailTitleBlock strong {
          display: block;
          margin-top: 8px;
          color: #38bdf8;
          font-size: clamp(34px, 9.2vw, 46px);
          line-height: 0.92;
          font-weight: 900;
        }

        .vpCaptureDetailLocationLine {
          margin-top: 14px;
          display: grid;
          grid-template-columns: minmax(0, 1fr) auto;
          align-items: center;
          gap: 10px;
        }

        .vpCaptureDetailPlace {
          min-width: 0;
          display: flex;
          align-items: center;
          gap: 9px;
          color: rgba(248, 250, 252, 0.92);
          font-size: 16px;
          line-height: 1.1;
          font-weight: 720;
        }

        .vpCaptureDetailPlace svg {
          width: 20px;
          height: 20px;
          color: #38bdf8;
          flex: 0 0 auto;
          filter: drop-shadow(0 0 10px rgba(56, 189, 248, 0.26));
        }

        .vpCaptureDetailPlace span {
          min-width: 0;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .vpCaptureDetailCoordinates {
          min-width: 0;
          min-height: 40px;
          max-width: 100%;
          border: 1px solid rgba(56, 189, 248, 0.34);
          border-radius: 999px;
          background: rgba(2, 6, 23, 0.34);
          color: rgba(226, 246, 255, 0.96);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 0 14px;
          box-sizing: border-box;
          box-shadow:
            inset 0 1px 0 rgba(255, 255, 255, 0.06),
            0 0 24px rgba(14, 165, 233, 0.1);
        }

        .vpCaptureDetailCoordinates svg {
          width: 17px;
          height: 17px;
          color: #67e8f9;
          flex: 0 0 auto;
        }

        .vpCaptureDetailCoordinates span {
          font-size: 13px;
          line-height: 1;
          font-weight: 820;
          white-space: nowrap;
        }

        .vpCaptureDetailPhotoCard {
          flex: 1 1 auto;
          min-height: 0;
          border-radius: 18px;
          padding: 8px;
          box-sizing: border-box;
          overflow: hidden;
        }

        .vpCaptureDetailPhotoMock {
          position: relative;
          width: 100%;
          height: 100%;
          min-height: 300px;
          border-radius: 14px;
          overflow: hidden;
          background:
            linear-gradient(180deg, #7dd3fc 0%, #bae6fd 34%, #38bdf8 34.5%, #0369a1 40%, #15803d 40.5%, #65a30d 100%);
          border: 1px solid rgba(125, 211, 252, 0.18);
          box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.05);
        }

        .vpCaptureDetailPhotoSky {
          position: absolute;
          inset: 0 0 48%;
          background:
            radial-gradient(circle at 20% 32%, rgba(255, 255, 255, 0.92) 0 10%, transparent 11%),
            radial-gradient(circle at 33% 28%, rgba(255, 255, 255, 0.8) 0 8%, transparent 9%),
            radial-gradient(circle at 72% 22%, rgba(255, 255, 255, 0.78) 0 7%, transparent 8%),
            linear-gradient(180deg, #38bdf8 0%, #bae6fd 100%);
          opacity: 0.92;
        }

        .vpCaptureDetailPhotoGrass {
          position: absolute;
          inset: 43% -10% -8%;
          background:
            radial-gradient(circle at 76% 32%, rgba(21, 128, 61, 0.95), transparent 28%),
            radial-gradient(circle at 20% 52%, rgba(132, 204, 22, 0.9), transparent 32%),
            linear-gradient(135deg, #166534, #65a30d);
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
          scrollbar-width: thin;
        }

        .vpCaptureDetailInfoArea::-webkit-scrollbar {
          width: 4px;
        }

        .vpCaptureDetailInfoArea::-webkit-scrollbar-thumb {
          background: rgba(56, 189, 248, 0.42);
          border-radius: 999px;
        }

        .vpCaptureDetailStatsGrid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 8px;
        }

        .vpCaptureDetailStatCard {
          min-width: 0;
          min-height: 82px;
          border: 1px solid rgba(56, 189, 248, 0.14);
          border-radius: 14px;
          background:
            radial-gradient(circle at 0% 0%, rgba(56, 189, 248, 0.08), transparent 34%),
            rgba(2, 6, 23, 0.32);
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.04);
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
          color: #38bdf8;
          box-shadow: 0 0 22px rgba(14, 165, 233, 0.09);
        }

        .vpCaptureDetailStatIcon svg {
          width: 27px;
          height: 27px;
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
          font-weight: 880;
        }

        .vpCaptureDetailStatText strong {
          display: block;
          margin-top: 8px;
          color: #ffffff;
          font-size: 21px;
          line-height: 1.05;
          font-weight: 900;
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
          gap: 10px;
          padding: 10px;
          box-sizing: border-box;
        }

        .vpCaptureDetailShareButton,
        .vpCaptureDetailDeleteButton {
          min-height: 52px;
          border-radius: 14px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          padding: 0 12px;
          font-size: 16px;
          line-height: 1;
          font-weight: 900;
          cursor: pointer;
          white-space: nowrap;
          border: 1px solid transparent;
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.13);
        }

        .vpCaptureDetailShareButton svg,
        .vpCaptureDetailDeleteButton svg {
          width: 21px;
          height: 21px;
          flex: 0 0 auto;
        }

        .vpCaptureDetailShareButton {
          color: #ffffff;
          background: linear-gradient(135deg, rgba(5, 150, 105, 0.96), rgba(6, 95, 70, 0.96));
          border-color: rgba(45, 212, 191, 0.38);
          box-shadow:
            0 0 28px rgba(20, 184, 166, 0.17),
            inset 0 1px 0 rgba(255, 255, 255, 0.16);
        }

        .vpCaptureDetailDeleteButton {
          color: #fecaca;
          background: linear-gradient(135deg, rgba(88, 19, 23, 0.78), rgba(42, 10, 16, 0.9));
          border-color: rgba(248, 113, 113, 0.42);
          box-shadow:
            0 0 24px rgba(239, 68, 68, 0.14),
            inset 0 1px 0 rgba(255, 255, 255, 0.08);
        }

        .vpCaptureDetailCloseButton svg,
        .vpCaptureDetailPlace svg,
        .vpCaptureDetailCoordinates svg,
        .vpCaptureDetailStatIcon svg,
        .vpCaptureDetailShareButton svg,
        .vpCaptureDetailDeleteButton svg {
          fill: none;
          stroke: currentColor;
          stroke-width: 3;
          stroke-linecap: round;
          stroke-linejoin: round;
        }

        @media (max-width: 767px) {
          .vpCaptureDetailLocationLine {
            grid-template-columns: 1fr;
            align-items: stretch;
            gap: 9px;
          }

          .vpCaptureDetailPlace {
            width: 100%;
            font-size: 16px;
          }

          .vpCaptureDetailPlace span {
            white-space: normal;
            overflow: visible;
            text-overflow: clip;
          }

          .vpCaptureDetailCoordinates {
            width: fit-content;
            max-width: 100%;
            justify-content: flex-start;
            min-height: 34px;
            padding: 0 11px;
          }

          .vpCaptureDetailCoordinates span {
            font-size: 12.5px;
          }
        }

        @media (max-width: 420px) {
          .vpCaptureDetailPanelShell {
            gap: 7px;
            padding-left: 10px;
            padding-right: 10px;
          }

          .vpCaptureDetailHeader {
            padding: 13px 60px 13px 15px;
          }

          .vpCaptureDetailTitleBlock strong {
            font-size: clamp(32px, 10vw, 42px);
          }

          .vpCaptureDetailCoordinates span {
            font-size: 12.5px;
          }

          .vpCaptureDetailPhotoMock {
            min-height: 260px;
          }

          .vpCaptureDetailInfoArea {
            max-height: 39dvh;
            padding: 8px;
          }

          .vpCaptureDetailStatCard {
            min-height: 76px;
            padding: 10px;
            gap: 10px;
          }

          .vpCaptureDetailStatIcon {
            width: 42px;
            height: 42px;
            border-radius: 15px;
          }

          .vpCaptureDetailStatText strong {
            font-size: 19px;
          }

          .vpCaptureDetailShareButton,
          .vpCaptureDetailDeleteButton {
            min-height: 50px;
            font-size: 15px;
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
              radial-gradient(circle at 50% 12%, rgba(34, 211, 238, 0.1), transparent 38%),
              radial-gradient(circle at 50% 50%, rgba(15, 23, 42, 0.2), transparent 58%),
              rgba(2, 8, 15, 0.58);
            backdrop-filter: blur(2px);
          }

          .vpCaptureDetailPanelFrame {
            width: min(88vw, 900px);
            height: auto;
            max-height: calc(100dvh - 96px);
            display: flex;
            justify-content: center;
            align-items: center;
            overflow: visible;
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
            height: auto;
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

          .vpCaptureDetailHeader {
            grid-column: 1 / -1;
            padding: 22px 28px;
          }

          .vpCaptureDetailTitleBlock span {
            font-size: 12px;
          }

          .vpCaptureDetailTitleBlock strong {
            font-size: 48px;
          }

          .vpCaptureDetailLocationLine {
            grid-template-columns: minmax(0, 1fr) auto;
          }

          .vpCaptureDetailPlace {
            font-size: 16px;
          }

          .vpCaptureDetailPhotoCard {
            grid-column: 1;
            grid-row: 2 / 4;
            min-height: 490px;
            padding: 10px;
          }

          .vpCaptureDetailPhotoMock {
            min-height: 490px;
          }

          .vpCaptureDetailInfoArea {
            grid-column: 2;
            grid-row: 2;
            max-height: none;
            min-height: 0;
            padding: 12px;
          }

          .vpCaptureDetailFooter {
            grid-column: 2;
            grid-row: 3;
            padding: 10px;
          }

          .vpCaptureDetailShareButton,
          .vpCaptureDetailDeleteButton {
            min-height: 56px;
            font-size: 16px;
          }
        }
      `}</style>
    </section>
  );
}
