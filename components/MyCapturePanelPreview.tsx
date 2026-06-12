'use client';

import type React from 'react';
import { useState } from 'react';

type MyCapturePanelPreviewProps = {
  onClose?: () => void;
  onShare?: () => void;
  onDelete?: () => void;
};

type IconProps = {
  className?: string;
};

type DetailCardProps = {
  label: string;
  value: string;
  icon: React.ReactNode;
  wide?: boolean;
};

const previewCoordinates = '-26.096255, -47.971802';
const previewCaptureTitle = 'Captura';

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

function CameraIcon(props: IconProps) {
  return (
    <SvgBase {...props}>
      <path d="M15 18h18l3 5v13H12V23l3-5Z" />
      <circle cx="24" cy="29" r="6" />
      <path d="M19 18l2-4h6l2 4" />
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

function NoteIcon(props: IconProps) {
  return (
    <SvgBase {...props}>
      <path d="M12 8h24v32H12z" />
      <path d="M18 17h12" />
      <path d="M18 24h12" />
      <path d="M18 31h8" />
    </SvgBase>
  );
}

function ShareIcon(props: IconProps) {
  return (
    <SvgBase {...props}>
      <circle cx="14" cy="24" r="4" />
      <circle cx="34" cy="12" r="4" />
      <circle cx="34" cy="36" r="4" />
      <path d="M17.5 22 30.5 14" />
      <path d="M17.5 26 30.5 34" />
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
  return <div className={`vpMyCaptureCard ${className}`}>{children}</div>;
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
      className={`vpMyCaptureCopyButton ${copied ? 'isCopied' : ''}`}
      type="button"
      onClick={copyCoords}
      aria-live="polite"
    >
      <CopyIcon />
      <span>{copied ? 'Copiado!' : 'Copiar'}</span>
    </button>
  );
}

function MyCaptureHeaderCard({
  coordinates,
}: {
  coordinates: string;
}) {
  return (
    <CardShell className="vpMyCaptureHeaderCard">
      <div className="vpMyCaptureHeaderDesktop">
        <div className="vpMyCapturePinIcon">
          <CapturePinIcon />
        </div>

        <div className="vpMyCaptureHeaderText">
          <span>Minha Captura</span>
          <strong>{previewCaptureTitle}</strong>

          <div className="vpMyCapturePlaceLine">Ponto sem nome</div>

          <div className="vpMyCaptureCoordinatesRow">
            <small>{coordinates}</small>
            <CaptureCopyButton coordinates={coordinates} />
          </div>
        </div>
      </div>

      <div className="vpMyCaptureHeaderMobile">
        <div className="vpMyCaptureMobileTop">
          <div className="vpMyCaptureMobilePinIcon">
            <CapturePinIcon />
          </div>

          <div className="vpMyCaptureMobileText">
            <span>Minha Captura</span>
            <strong>{previewCaptureTitle}</strong>
            <p>Ponto sem nome</p>

            <div className="vpMyCaptureMobileCoordinates">
              <small>{coordinates}</small>
              <CaptureCopyButton coordinates={coordinates} />
            </div>
          </div>
        </div>
      </div>
    </CardShell>
  );
}

function PhotoBlock() {
  return (
    <CardShell className="vpMyCapturePhotoBlock">
      <div className="vpMyCapturePhotoShell">
        <div className="vpMyCapturePhotoBg" />

        <div className="vpMyCapturePhotoFish">
          <FishIcon />
        </div>

        <div className="vpMyCapturePhotoText">
          <CameraIcon />
          <strong>Foto da captura</strong>
          <span>{'\u00c1rea reservada para a foto salva pelo usu\u00e1rio.'}</span>
        </div>
      </div>
    </CardShell>
  );
}

function DetailCard({ label, value, icon, wide = false }: DetailCardProps) {
  return (
    <article className={`vpMyCaptureDetailCard${wide ? ' isWide' : ''}`}>
      <div className="vpMyCaptureDetailIcon">{icon}</div>

      <div className="vpMyCaptureDetailText">
        <span>{label}</span>
        <strong>{value}</strong>
      </div>
    </article>
  );
}

function CaptureDetailsBlock() {
  return (
    <CardShell className="vpMyCaptureDetailsBlock">
      <div className="vpMyCaptureSectionTitle">
        <FishIcon />
        <span>Dados da captura</span>
      </div>

      <div className="vpMyCaptureDetailsGrid">
        <DetailCard label="Peso" value="12 kg" icon={<WeightIcon />} />
        <DetailCard label="Tamanho" value="103 cm" icon={<RulerIcon />} />
        <DetailCard label="Isca" value={'Meia \u00e1gua'} icon={<FishIcon />} wide />
        <DetailCard
          label="Data / Hora"
          value={'23/02/2026 \u2022 15h30'}
          icon={<CalendarIcon />}
          wide
        />
        <DetailCard
          label={'Observa\u00e7\u00f5es'}
          value={'Sem observa\u00e7\u00f5es adicionadas.'}
          icon={<NoteIcon />}
          wide
        />
      </div>
    </CardShell>
  );
}

function FooterActions({
  onShare,
  onDelete,
}: {
  onShare?: () => void;
  onDelete?: () => void;
}) {
  return (
    <div className="vpMyCaptureFooter">
      <button className="vpMyCapturePrimaryButton" type="button" onClick={onShare}>
        <ShareIcon />
        <span>Compartilhar</span>
      </button>

      <button className="vpMyCaptureDangerButton" type="button" onClick={onDelete}>
        <TrashIcon />
        <span>Apagar</span>
      </button>
    </div>
  );
}

export default function MyCapturePanelPreview({
  onClose,
  onShare,
  onDelete,
}: MyCapturePanelPreviewProps) {
  return (
    <section
      className="vpMyCapturePreview"
      aria-label="Preview Minha Captura"
      onClick={(event) => event.stopPropagation()}
      onPointerDown={(event) => event.stopPropagation()}
    >
      <div className="vpMyCapturePanelFrame">
        <button
          className="vpMyCaptureCloseButton"
          type="button"
          aria-label="Fechar"
          onClick={onClose}
        >
          <CloseIcon />
        </button>

        <main className="vpMyCapturePanelShell">
          <MyCaptureHeaderCard coordinates={previewCoordinates} />

          <div className="vpMyCaptureBodyGrid">
            <PhotoBlock />
            <CaptureDetailsBlock />
          </div>

          <FooterActions onShare={onShare} onDelete={onDelete} />
        </main>
      </div>

      <style jsx global>{`
        .vpMyCapturePreview {
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

        .vpMyCaptureCloseButton {
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

        .vpMyCaptureCloseButton svg {
          width: 25px;
          height: 25px;
        }

        .vpMyCapturePanelShell {
          width: min(100vw, 460px);
          height: 100dvh;
          margin: 0 auto;
          padding: max(10px, env(safe-area-inset-top)) 12px max(10px, env(safe-area-inset-bottom));
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
          gap: 7px;
        }

        .vpMyCaptureCard,
        .vpMyCaptureFooter {
          background: linear-gradient(135deg, rgba(23, 31, 42, 0.88), rgba(10, 16, 23, 0.94));
          border: 1px solid rgba(148, 163, 184, 0.2);
          box-shadow:
            inset 0 1px 0 rgba(255, 255, 255, 0.035),
            0 14px 34px rgba(0, 0, 0, 0.18);
          backdrop-filter: blur(14px);
        }

        .vpMyCaptureHeaderCard {
          flex: 0 0 auto;
          border-radius: 18px;
          min-height: 112px;
          display: grid;
          grid-template-columns: auto minmax(0, 1fr);
          align-items: center;
          gap: 11px;
          padding: 12px 14px;
          box-sizing: border-box;
        }

        .vpMyCaptureHeaderDesktop {
          display: contents;
        }

        .vpMyCaptureHeaderMobile {
          display: none;
        }

        .vpMyCapturePinIcon {
          width: 48px;
          height: 48px;
          border-radius: 999px;
          color: #fb7185;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(248, 113, 113, 0.12);
          box-shadow: 0 0 22px rgba(248, 113, 113, 0.18);
        }

        .vpMyCapturePinIcon svg {
          width: 30px;
          height: 30px;
        }

        .vpMyCaptureHeaderText {
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .vpMyCaptureHeaderText span {
          color: rgba(226, 232, 240, 0.72);
          font-size: 11px;
          line-height: 1;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          font-weight: 620;
        }

        .vpMyCaptureHeaderText strong {
          color: #fb7185;
          font-size: clamp(24px, 7.4vw, 34px);
          line-height: 1.02;
          font-weight: 760;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          letter-spacing: -0.045em;
        }

        .vpMyCapturePlaceLine {
          color: rgba(241, 245, 249, 0.9);
          font-size: 15px;
          line-height: 1.1;
          font-weight: 680;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .vpMyCaptureCoordinatesRow {
          min-width: 0;
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }

        .vpMyCaptureCoordinatesRow small {
          color: rgba(226, 232, 240, 0.74);
          font-size: clamp(12px, 3.15vw, 14px);
          line-height: 1.1;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .vpMyCaptureCopyButton {
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

        .vpMyCaptureCopyButton svg {
          width: 17px;
          height: 17px;
        }

        .vpMyCaptureCopyButton.isCopied {
          border-color: rgba(34, 197, 94, 0.48);
          background: rgba(34, 197, 94, 0.12);
          color: #86efac;
          box-shadow: 0 0 18px rgba(34, 197, 94, 0.14);
        }

        .vpMyCaptureBodyGrid {
          flex: 1 1 auto;
          min-height: 0;
          display: flex;
          flex-direction: column;
          gap: 7px;
        }

        .vpMyCapturePhotoBlock {
          flex: 0 0 auto;
          border-radius: 18px;
          padding: 10px;
          box-sizing: border-box;
        }

        .vpMyCapturePhotoShell {
          position: relative;
          overflow: hidden;
          border: 1px solid rgba(56, 189, 248, 0.42);
          border-radius: 15px;
          min-height: 190px;
          background: rgba(2, 8, 18, 0.42);
          box-shadow:
            inset 0 1px 0 rgba(255, 255, 255, 0.04),
            0 0 22px rgba(14, 165, 233, 0.08);
        }

        .vpMyCapturePhotoBg {
          position: absolute;
          inset: 0;
          background:
            radial-gradient(circle at 28% 26%, rgba(125, 211, 252, 0.12), transparent 22%),
            radial-gradient(circle at 76% 32%, rgba(248, 113, 113, 0.08), transparent 25%),
            linear-gradient(135deg, rgba(12, 32, 52, 0.62), rgba(2, 8, 18, 0.96));
        }

        .vpMyCapturePhotoFish {
          position: absolute;
          right: 18px;
          bottom: 16px;
          color: rgba(125, 211, 252, 0.13);
        }

        .vpMyCapturePhotoFish svg {
          width: 150px;
          height: 150px;
        }

        .vpMyCapturePhotoText {
          position: relative;
          z-index: 1;
          min-height: 190px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          padding: 22px;
          text-align: center;
        }

        .vpMyCapturePhotoText svg {
          width: 44px;
          height: 44px;
          color: #7dd3fc;
          margin-bottom: 10px;
          filter: drop-shadow(0 0 14px rgba(14, 165, 233, 0.2));
        }

        .vpMyCapturePhotoText strong {
          color: rgba(248, 250, 252, 0.9);
          font-size: 20px;
          line-height: 1;
          font-weight: 760;
          letter-spacing: -0.03em;
        }

        .vpMyCapturePhotoText span {
          max-width: 260px;
          color: rgba(203, 213, 225, 0.62);
          font-size: 13px;
          line-height: 1.35;
          font-weight: 620;
          margin-top: 8px;
        }

        .vpMyCaptureDetailsBlock {
          flex: 1 1 auto;
          min-height: 0;
          border-radius: 18px;
          padding: 10px;
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
          gap: 10px;
          overflow: hidden;
        }

        .vpMyCaptureSectionTitle {
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

        .vpMyCaptureSectionTitle svg {
          width: 24px;
          height: 24px;
          color: #7dd3fc;
        }

        .vpMyCaptureDetailsGrid {
          flex: 1 1 auto;
          min-height: 0;
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 8px;
          overflow-y: auto;
          padding-right: 2px;
          scrollbar-color: rgba(125, 211, 252, 0.45) rgba(15, 23, 42, 0.55);
          scrollbar-width: thin;
        }

        .vpMyCaptureDetailCard {
          min-width: 0;
          min-height: 70px;
          border: 1px solid rgba(148, 163, 184, 0.16);
          border-radius: 15px;
          background: rgba(2, 8, 18, 0.28);
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px;
          box-sizing: border-box;
        }

        .vpMyCaptureDetailCard.isWide {
          grid-column: 1 / -1;
        }

        .vpMyCaptureDetailIcon {
          flex: 0 0 auto;
          width: 42px;
          height: 42px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #7dd3fc;
          background:
            radial-gradient(circle at 50% 0%, rgba(56, 189, 248, 0.16), transparent 70%),
            rgba(14, 165, 233, 0.08);
          box-shadow: 0 0 16px rgba(14, 165, 233, 0.1);
        }

        .vpMyCaptureDetailIcon svg {
          width: 25px;
          height: 25px;
        }

        .vpMyCaptureDetailText {
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 5px;
        }

        .vpMyCaptureDetailText span {
          color: rgba(226, 232, 240, 0.66);
          font-size: 11px;
          line-height: 1;
          font-weight: 760;
          letter-spacing: 0.095em;
          text-transform: uppercase;
        }

        .vpMyCaptureDetailText strong {
          color: rgba(248, 250, 252, 0.95);
          font-size: clamp(18px, 4.6vw, 22px);
          line-height: 1.08;
          font-weight: 760;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          letter-spacing: -0.025em;
        }

        .vpMyCaptureFooter {
          flex: 0 0 auto;
          border-radius: 18px;
          padding: 7px;
          box-sizing: border-box;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
        }

        .vpMyCapturePrimaryButton,
        .vpMyCaptureDangerButton {
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

        .vpMyCapturePrimaryButton {
          color: #ffffff;
          background: linear-gradient(135deg, rgba(37, 99, 235, 0.96), rgba(29, 78, 216, 0.9));
          border-color: rgba(125, 211, 252, 0.42);
          box-shadow:
            0 0 28px rgba(37, 99, 235, 0.28),
            inset 0 1px 0 rgba(255, 255, 255, 0.16);
        }

        .vpMyCaptureDangerButton {
          color: #fecaca;
          background: linear-gradient(135deg, rgba(69, 10, 10, 0.82), rgba(35, 6, 13, 0.88));
          border-color: rgba(248, 113, 113, 0.42);
          box-shadow:
            0 0 24px rgba(239, 68, 68, 0.14),
            inset 0 1px 0 rgba(255, 255, 255, 0.08);
        }

        .vpMyCapturePrimaryButton svg,
        .vpMyCaptureDangerButton svg {
          width: 22px;
          height: 22px;
        }

        @media (min-width: 768px) {
          .vpMyCapturePreview {
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 24px;
            box-sizing: border-box;
            background:
              radial-gradient(circle at 50% 12%, rgba(248, 113, 113, 0.1), transparent 38%),
              radial-gradient(circle at 50% 50%, rgba(15, 23, 42, 0.2), transparent 58%),
              rgba(2, 8, 15, 0.58);
            backdrop-filter: blur(2px);
          }

          .vpMyCapturePanelFrame {
            position: relative;
            width: min(86vw, 760px);
            height: min(78dvh, 680px);
            max-height: calc(100dvh - 96px);
            display: flex;
            justify-content: center;
            align-items: stretch;
          }

          .vpMyCaptureCloseButton {
            position: absolute;
            top: -34px;
            right: -54px;
            left: auto;
            width: 44px;
            height: 44px;
            border-radius: 15px;
          }

          .vpMyCapturePanelShell {
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

          .vpMyCaptureCard,
          .vpMyCaptureFooter {
            background: rgba(10, 18, 30, 0.82);
            border: 1px solid rgba(148, 163, 184, 0.18);
          }

          .vpMyCaptureHeaderCard {
            flex: 0 0 auto;
            min-height: 92px;
            padding: 16px 18px;
            border-radius: 18px;
            grid-template-columns: auto minmax(0, 1fr);
            gap: 16px;
          }

          .vpMyCapturePinIcon {
            width: 52px;
            height: 52px;
          }

          .vpMyCapturePinIcon svg {
            width: 32px;
            height: 32px;
          }

          .vpMyCaptureHeaderText span {
            font-size: 12px;
          }

          .vpMyCaptureHeaderText strong {
            font-size: 30px;
          }

          .vpMyCapturePlaceLine {
            font-size: 14px;
          }

          .vpMyCaptureCoordinatesRow small {
            font-size: 14px;
          }

          .vpMyCaptureBodyGrid {
            flex: 1 1 auto;
            min-height: 0;
            display: grid;
            grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
            gap: 12px;
          }

          .vpMyCapturePhotoBlock,
          .vpMyCaptureDetailsBlock {
            min-height: 0;
            overflow: hidden;
            border-radius: 18px;
            padding: 12px;
          }

          .vpMyCapturePhotoShell {
            height: 100%;
            min-height: 0;
            border-radius: 16px;
          }

          .vpMyCapturePhotoText {
            min-height: 0;
            height: 100%;
          }

          .vpMyCaptureDetailsBlock {
            display: flex;
            flex-direction: column;
          }

          .vpMyCaptureDetailsGrid {
            overflow: hidden;
            align-content: start;
          }

          .vpMyCaptureDetailCard {
            min-height: 66px;
          }

          .vpMyCaptureFooter {
            border-radius: 18px;
            padding: 7px;
          }

          .vpMyCapturePrimaryButton,
          .vpMyCaptureDangerButton {
            min-height: 52px;
            font-size: 18px;
          }
        }

        @media (max-width: 767px) {
          .vpMyCaptureHeaderCard {
            min-height: 150px !important;
            display: block !important;
            padding: 14px 16px !important;
            border-radius: 18px !important;
          }

          .vpMyCaptureHeaderDesktop {
            display: none !important;
          }

          .vpMyCaptureHeaderMobile {
            display: flex !important;
            flex-direction: column !important;
            gap: 10px !important;
          }

          .vpMyCaptureMobileTop {
            display: grid !important;
            grid-template-columns: 48px minmax(0, 1fr) !important;
            align-items: center !important;
            gap: 12px !important;
          }

          .vpMyCaptureMobilePinIcon {
            width: 46px !important;
            height: 46px !important;
            transform: translateY(-34px) !important;
            border-radius: 999px !important;
            color: #fb7185 !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            background: rgba(248, 113, 113, 0.12) !important;
            box-shadow: 0 0 22px rgba(248, 113, 113, 0.18) !important;
          }

          .vpMyCaptureMobilePinIcon svg {
            width: 30px !important;
            height: 30px !important;
          }

          .vpMyCaptureMobileText {
            min-width: 0 !important;
            display: flex !important;
            flex-direction: column !important;
            gap: 5px !important;
          }

          .vpMyCaptureMobileText span {
            color: rgba(226, 232, 240, 0.72) !important;
            font-size: 14px !important;
            line-height: 1 !important;
            letter-spacing: 0.095em !important;
            text-transform: uppercase !important;
            font-weight: 700 !important;
          }

          .vpMyCaptureMobileText strong {
            color: #fb7185 !important;
            font-size: clamp(34px, 9.5vw, 44px) !important;
            line-height: 1.02 !important;
            font-weight: 780 !important;
            letter-spacing: -0.04em !important;
            white-space: nowrap !important;
            overflow: hidden !important;
            text-overflow: ellipsis !important;
          }

          .vpMyCaptureMobileText p {
            margin: 0 !important;
            color: rgba(241, 245, 249, 0.88) !important;
            font-size: 17px !important;
            line-height: 1.15 !important;
            font-weight: 680 !important;
            white-space: nowrap !important;
            overflow: hidden !important;
            text-overflow: ellipsis !important;
          }

          .vpMyCaptureMobileCoordinates {
            display: flex !important;
            align-items: center !important;
            flex-wrap: wrap !important;
            gap: 10px !important;
            margin-top: 5px !important;
          }

          .vpMyCaptureMobileCoordinates small {
            color: rgba(226, 232, 240, 0.72) !important;
            font-size: 13px !important;
            line-height: 1.1 !important;
            white-space: nowrap !important;
          }

          .vpMyCaptureCopyButton {
            min-width: 120px !important;
            height: 38px !important;
            border-radius: 13px !important;
            font-size: 13px !important;
            font-weight: 700 !important;
            letter-spacing: 0.08em !important;
            text-transform: uppercase !important;
          }

          .vpMyCapturePhotoBlock {
            max-height: 252px;
          }

          .vpMyCapturePhotoShell {
            min-height: 220px;
          }

          .vpMyCaptureDetailsBlock {
            min-height: 0;
          }

          .vpMyCaptureDetailsGrid {
            overflow-y: auto;
          }
        }
      `}</style>
    </section>
  );
}
