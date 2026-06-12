'use client';

import type React from 'react';
import type { CaptureFormData } from '@/components/captures/types';

type IconProps = {
  className?: string;
};

type AddCapturePanelProps = {
  lat: number;
  lng: number;
  formData: CaptureFormData;
  weightParts: {
    kg: string;
    grams: string;
  };
  onFormDataChange: (nextFormData: CaptureFormData) => void;
  onWeightPartsChange: (nextKg: string, nextGrams: string) => void;
  onSave: () => void;
  onCancel: () => void;
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

function ClockIcon(props: IconProps) {
  return (
    <SvgBase {...props}>
      <circle cx="24" cy="24" r="17" />
      <path d="M24 14v11l8 5" />
    </SvgBase>
  );
}

function CameraIcon(props: IconProps) {
  return (
    <SvgBase {...props}>
      <path d="M15 18h18l3 4v14H12V22l3-4Z" />
      <path d="M19 18l2-5h6l2 5" />
      <circle cx="24" cy="28" r="6" />
    </SvgBase>
  );
}

function FieldShell({
  label,
  children,
  className = '',
}: {
  label: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={`vpAddCaptureField ${className}`}>
      <span className="vpAddCaptureFieldLabel">{label}</span>
      {children}
    </label>
  );
}

export default function AddCapturePanel({
  lat,
  lng,
  formData,
  weightParts,
  onFormDataChange,
  onWeightPartsChange,
  onSave,
  onCancel,
}: AddCapturePanelProps) {
  return (
    <section className="vpAddCapturePreview map-control-overlay" aria-label="Adicionar Captura">
      <div className="vpAddCapturePanelFrame">
        <button
          className="vpAddCaptureCloseButton"
          type="button"
          aria-label="Fechar adicionar captura"
          onClick={onCancel}
        >
          <CloseIcon />
        </button>

        <main className="vpAddCapturePanelShell">
          <header className="vpAddCaptureHeader">
            <div className="vpAddCaptureHeaderText">
              <span>Registro de pescaria</span>
              <strong>Adicionar Captura</strong>
              <p>Registre sua pescaria neste ponto.</p>
            </div>

            <div className="vpAddCaptureCoordinates" aria-label="Coordenadas">
              <PinIcon />
              <span>
                {lat.toFixed(6)}, {lng.toFixed(6)}
              </span>
            </div>
          </header>

          <section className="vpAddCaptureFormCard" aria-label="Formulário de captura">
            <div className="vpAddCaptureGrid">
              <FieldShell label="Espécie" className="vpAddCaptureHalf">
                <input
                  type="text"
                  placeholder="Ex: Robalo peva"
                  value={formData.species}
                  onChange={(event) => onFormDataChange({ ...formData, species: event.target.value })}
                />
              </FieldShell>

              <FieldShell label="Isca" className="vpAddCaptureHalf">
                <input
                  type="text"
                  placeholder="Meia-água"
                  value={formData.bait}
                  onChange={(event) => onFormDataChange({ ...formData, bait: event.target.value })}
                />
              </FieldShell>

              <FieldShell label="Kg" className="vpAddCaptureThird">
                <div className="vpAddCaptureInputUnit">
                  <input
                    type="number"
                    min="0"
                    step="1"
                    inputMode="numeric"
                    placeholder="2"
                    value={weightParts.kg}
                    onChange={(event) => onWeightPartsChange(event.target.value, weightParts.grams)}
                  />
                  <em>kg</em>
                </div>
              </FieldShell>

              <FieldShell label="Gramas" className="vpAddCaptureThird">
                <div className="vpAddCaptureInputUnit">
                  <input
                    type="number"
                    min="0"
                    max="999"
                    step="1"
                    inputMode="numeric"
                    placeholder="250"
                    value={weightParts.grams}
                    onChange={(event) => onWeightPartsChange(weightParts.kg, event.target.value)}
                  />
                  <em>g</em>
                </div>
              </FieldShell>

              <FieldShell label="Tamanho" className="vpAddCaptureThird">
                <div className="vpAddCaptureInputUnit">
                  <input
                    type="number"
                    step="0.1"
                    placeholder="52"
                    value={formData.size}
                    onChange={(event) => onFormDataChange({ ...formData, size: event.target.value })}
                  />
                  <em>cm</em>
                </div>
              </FieldShell>

              <FieldShell label="Data" className="vpAddCaptureThird">
                <div className="vpAddCaptureInputIcon">
                  <input
                    type="date"
                    value={formData.capturedDate}
                    onChange={(event) => onFormDataChange({ ...formData, capturedDate: event.target.value })}
                  />
                  <CalendarIcon />
                </div>
              </FieldShell>

              <FieldShell label="Hora" className="vpAddCaptureThird">
                <div className="vpAddCaptureInputIcon">
                  <input
                    type="time"
                    value={formData.capturedTime}
                    onChange={(event) => onFormDataChange({ ...formData, capturedTime: event.target.value })}
                  />
                  <ClockIcon />
                </div>
              </FieldShell>

              <FieldShell
                label={
                  <>
                    Foto <small>(opcional)</small>
                  </>
                }
                className="vpAddCaptureThird"
              >
                <label className="vpAddCapturePhotoButton">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(event) => {
                      const file = event.target.files?.[0];

                      if (!file) {
                        return;
                      }

                      const reader = new FileReader();

                      reader.onload = (readerEvent) => {
                        onFormDataChange({
                          ...formData,
                          photo: String(readerEvent.target?.result || ''),
                        });
                      };

                      reader.readAsDataURL(file);
                    }}
                  />

                  {formData.photo ? (
                    <>
                      <span className="vpAddCapturePhotoThumb">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={formData.photo} alt="Foto adicionada" />
                      </span>
                      <span>Foto adicionada</span>
                    </>
                  ) : (
                    <>
                      <CameraIcon />
                      <span>Adicionar foto</span>
                    </>
                  )}
                </label>
              </FieldShell>

              <FieldShell
                label={
                  <>
                    Observações <small>(opcional)</small>
                  </>
                }
                className="vpAddCaptureFull"
              >
                <textarea
                  placeholder="Condições, trabalho da isca, detalhe da captura..."
                  value={formData.comment}
                  onChange={(event) => onFormDataChange({ ...formData, comment: event.target.value })}
                />
              </FieldShell>
            </div>
          </section>

          <footer className="vpAddCaptureFooter">
            <button className="vpAddCapturePrimaryButton" type="button" onClick={onSave}>
              Confirmar captura aqui
            </button>

            <button className="vpAddCaptureCancelButton" type="button" onClick={onCancel}>
              Cancelar
            </button>
          </footer>
        </main>
      </div>

      <style jsx global>{`
        .vpAddCapturePreview {
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

        .vpAddCapturePanelFrame {
          position: relative;
          width: min(100vw, 460px);
          height: 100dvh;
          margin: 0 auto;
        }

        .vpAddCaptureCloseButton {
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

        .vpAddCaptureCloseButton svg {
          width: 25px;
          height: 25px;
        }

        .vpAddCapturePanelShell {
          width: 100%;
          height: 100%;
          min-height: 0;
          padding: max(12px, env(safe-area-inset-top)) 12px max(10px, env(safe-area-inset-bottom));
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
          gap: 7px;
          overflow: hidden;
        }

        .vpAddCaptureHeader,
        .vpAddCaptureFormCard,
        .vpAddCaptureFooter {
          background: linear-gradient(135deg, rgba(23, 31, 42, 0.88), rgba(10, 16, 23, 0.94));
          border: 1px solid rgba(148, 163, 184, 0.2);
          box-shadow:
            inset 0 1px 0 rgba(255, 255, 255, 0.035),
            0 14px 34px rgba(0, 0, 0, 0.18);
          backdrop-filter: blur(14px);
        }

        .vpAddCaptureHeader {
          flex: 0 0 auto;
          border-radius: 18px;
          padding: 14px 16px;
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .vpAddCaptureHeaderText {
          min-width: 0;
          padding-right: 56px;
        }

        .vpAddCaptureHeaderText span {
          display: block;
          color: rgba(226, 232, 240, 0.72);
          font-size: 11px;
          line-height: 1;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          font-weight: 620;
        }

        .vpAddCaptureHeaderText strong {
          display: block;
          margin-top: 7px;
          color: #38bdf8;
          font-size: clamp(24px, 6vw, 29px);
          line-height: 1.04;
          font-weight: 760;
          letter-spacing: -0.035em;
        }

        .vpAddCaptureHeaderText p {
          margin: 7px 0 0;
          color: rgba(226, 232, 240, 0.82);
          font-size: 14px;
          line-height: 1.28;
          font-weight: 560;
        }

        .vpAddCaptureCoordinates {
          min-height: 48px;
          border: 1px solid rgba(56, 189, 248, 0.18);
          border-radius: 14px;
          background: rgba(2, 6, 23, 0.24);
          color: rgba(248, 250, 252, 0.94);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          padding: 0 12px;
          box-sizing: border-box;
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.05);
        }

        .vpAddCaptureCoordinates svg {
          width: 23px;
          height: 23px;
          color: #38bdf8;
          flex: 0 0 auto;
        }

        .vpAddCaptureCoordinates span {
          min-width: 0;
          color: rgba(248, 250, 252, 0.94);
          font-size: 15px;
          line-height: 1;
          font-weight: 720;
          letter-spacing: -0.015em;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .vpAddCaptureFormCard {
          flex: 1 1 auto;
          min-height: 0;
          border-radius: 18px;
          padding: 14px 16px;
          box-sizing: border-box;
          overflow: hidden;
        }

        .vpAddCaptureGrid {
          height: 100%;
          min-height: 0;
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 13px 14px;
          overflow: hidden;
        }

        .vpAddCaptureField {
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .vpAddCaptureFieldLabel {
          color: rgba(248, 250, 252, 0.94);
          font-size: 13px;
          line-height: 1;
          font-weight: 760;
        }

        .vpAddCaptureFieldLabel small {
          color: rgba(226, 232, 240, 0.64);
          font-size: 12px;
          font-weight: 620;
        }

        .vpAddCaptureHalf {
          grid-column: span 1;
        }

        .vpAddCaptureThird {
          grid-column: span 1;
        }

        .vpAddCaptureFull {
          grid-column: 1 / -1;
          min-height: 0;
        }

        .vpAddCaptureField input,
        .vpAddCaptureField textarea,
        .vpAddCaptureInputUnit,
        .vpAddCaptureInputIcon,
        .vpAddCapturePhotoButton {
          width: 100%;
          border: 1px solid rgba(56, 189, 248, 0.18);
          border-radius: 12px;
          background: rgba(2, 6, 23, 0.46);
          color: #ffffff;
          box-sizing: border-box;
          box-shadow:
            inset 0 1px 0 rgba(255, 255, 255, 0.055),
            inset 0 -12px 20px rgba(0, 0, 0, 0.2);
          outline: none;
          transition:
            border-color 160ms ease,
            box-shadow 160ms ease,
            background 160ms ease;
        }

        .vpAddCaptureField input {
          min-height: 44px;
          padding: 0 13px;
          font-size: 15px;
          font-weight: 620;
        }

        .vpAddCaptureField input::placeholder,
        .vpAddCaptureField textarea::placeholder {
          color: rgba(148, 163, 184, 0.72);
        }

        .vpAddCaptureField textarea {
          flex: 1 1 auto;
          min-height: 82px;
          resize: none;
          padding: 12px 13px;
          font-size: 14px;
          line-height: 1.35;
          font-weight: 560;
        }

        .vpAddCaptureInputUnit,
        .vpAddCaptureInputIcon {
          min-height: 44px;
          display: grid;
          grid-template-columns: minmax(0, 1fr) auto;
          align-items: center;
          padding-right: 12px;
        }

        .vpAddCaptureInputUnit input,
        .vpAddCaptureInputIcon input {
          border: 0;
          background: transparent;
          box-shadow: none;
          min-height: 42px;
          padding-right: 8px;
        }

        .vpAddCaptureInputUnit em {
          color: rgba(226, 232, 240, 0.78);
          font-size: 14px;
          font-style: normal;
          font-weight: 760;
        }

        .vpAddCaptureInputIcon svg {
          width: 20px;
          height: 20px;
          color: rgba(226, 232, 240, 0.82);
        }

        .vpAddCapturePhotoButton {
          min-height: 44px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 9px;
          padding: 0 12px;
          font-size: 14px;
          font-weight: 760;
          cursor: pointer;
        }

        .vpAddCapturePhotoButton input {
          display: none;
        }

        .vpAddCapturePhotoButton svg {
          width: 21px;
          height: 21px;
          color: #38bdf8;
        }

        .vpAddCapturePhotoThumb {
          width: 42px;
          height: 30px;
          border-radius: 8px;
          overflow: hidden;
          border: 1px solid rgba(125, 211, 252, 0.18);
          flex: 0 0 auto;
        }

        .vpAddCapturePhotoThumb img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .vpAddCaptureFooter {
          flex: 0 0 auto;
          border-radius: 16px;
          display: grid;
          grid-template-columns: 1fr;
          gap: 8px;
          padding: 8px;
          box-sizing: border-box;
        }

        .vpAddCapturePrimaryButton,
        .vpAddCaptureCancelButton {
          min-height: 50px;
          border-radius: 14px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 0 12px;
          font-size: 16px;
          line-height: 1;
          font-weight: 760;
          cursor: pointer;
          white-space: nowrap;
          border: 1px solid transparent;
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.13);
        }

        .vpAddCapturePrimaryButton {
          color: #ffffff;
          background: linear-gradient(135deg, rgba(37, 99, 235, 0.96), rgba(29, 78, 216, 0.9));
          border-color: rgba(125, 211, 252, 0.42);
          box-shadow:
            0 0 28px rgba(37, 99, 235, 0.28),
            inset 0 1px 0 rgba(255, 255, 255, 0.16);
        }

        .vpAddCaptureCancelButton {
          color: #fecaca;
          background: linear-gradient(135deg, rgba(88, 19, 23, 0.78), rgba(42, 10, 16, 0.9));
          border-color: rgba(248, 113, 113, 0.42);
          box-shadow:
            0 0 24px rgba(239, 68, 68, 0.14),
            inset 0 1px 0 rgba(255, 255, 255, 0.08);
        }

        .vpAddCaptureCloseButton svg,
        .vpAddCaptureCoordinates svg,
        .vpAddCaptureInputIcon svg,
        .vpAddCapturePhotoButton svg {
          fill: none;
          stroke: currentColor;
          stroke-width: 3;
          stroke-linecap: round;
          stroke-linejoin: round;
        }

        @media (max-width: 767px) {
          .vpAddCapturePanelFrame {
            height: 100dvh;
            max-height: 100dvh;
            overflow: hidden;
          }

          .vpAddCapturePanelShell {
            height: 100dvh;
            max-height: 100dvh;
            overflow-y: auto;
            overflow-x: hidden;
            overscroll-behavior: contain;
            -webkit-overflow-scrolling: touch;
            scroll-padding-top: 18px;
            scroll-padding-bottom: 320px;
          }

          .vpAddCapturePanelShell::-webkit-scrollbar {
            width: 4px;
          }

          .vpAddCapturePanelShell::-webkit-scrollbar-thumb {
            background: rgba(56, 189, 248, 0.42);
            border-radius: 999px;
          }

          .vpAddCaptureHeader {
            flex: 0 0 auto;
          }

          .vpAddCaptureFormCard {
            flex: 0 0 auto;
            min-height: auto;
            overflow: visible;
          }

          .vpAddCaptureGrid {
            height: auto;
            min-height: max-content;
            overflow: visible;
            padding-bottom: 8px;
          }

          .vpAddCaptureFooter {
            flex: 0 0 auto;
            scroll-margin-bottom: 320px;
          }

          .vpAddCapturePanelShell:focus-within {
            padding-bottom: clamp(260px, 42dvh, 390px);
          }

          .vpAddCapturePanelShell:focus-within .vpAddCaptureHeader {
            scroll-margin-top: 18px;
          }

          .vpAddCaptureField input:focus,
          .vpAddCaptureField textarea:focus {
            scroll-margin-top: 120px;
            scroll-margin-bottom: 320px;
          }
        }

        @media (max-width: 420px) {
          .vpAddCapturePanelShell {
            gap: 6px;
            padding-left: 10px;
            padding-right: 10px;
          }

          .vpAddCaptureHeader {
            padding: 13px 16px;
            gap: 12px;
          }

          .vpAddCaptureHeaderText strong {
            font-size: clamp(24px, 7.1vw, 30px);
          }

          .vpAddCaptureCoordinates {
            min-height: 48px;
          }

          .vpAddCaptureCoordinates span {
            font-size: 15px;
          }

          .vpAddCaptureFormCard {
            padding: 13px 16px;
          }

          .vpAddCaptureGrid {
            gap: 12px 14px;
          }

          .vpAddCaptureField input,
          .vpAddCaptureInputUnit,
          .vpAddCaptureInputIcon,
          .vpAddCapturePhotoButton {
            min-height: 44px;
          }

          .vpAddCaptureField textarea {
            min-height: 84px;
          }

          .vpAddCaptureFooter {
            gap: 8px;
            padding: 8px;
          }

          .vpAddCapturePrimaryButton,
          .vpAddCaptureCancelButton {
            min-height: 48px;
            font-size: 15px;
          }
        }

        @media (min-width: 768px) {
          .vpAddCapturePreview {
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

          .vpAddCapturePanelFrame {
            width: min(88vw, 900px);
            height: min(86dvh, 760px);
            max-height: calc(100dvh - 96px);
            display: flex;
            justify-content: center;
            align-items: stretch;
          }

          .vpAddCaptureCloseButton {
            position: absolute;
            top: -34px;
            right: -54px;
            left: auto;
            width: 44px;
            height: 44px;
            border-radius: 15px;
          }

          .vpAddCapturePanelShell {
            width: 100%;
            height: 100%;
            max-height: calc(100dvh - 96px);
            padding: 14px;
            display: flex;
            flex-direction: column;
            gap: 14px;
            background: rgba(3, 10, 18, 0.82);
            border: 1px solid rgba(148, 163, 184, 0.14);
            border-radius: 28px;
            box-shadow: 0 24px 80px rgba(0, 0, 0, 0.34);
            backdrop-filter: blur(6px);
            overflow: hidden;
            box-sizing: border-box;
          }

          .vpAddCaptureHeader,
          .vpAddCaptureFormCard,
          .vpAddCaptureFooter {
            background: rgba(10, 18, 30, 0.82);
            border: 1px solid rgba(148, 163, 184, 0.18);
          }

          .vpAddCaptureHeader {
            padding: 24px 28px 22px;
            gap: 18px;
          }

          .vpAddCaptureHeaderText {
            padding-right: 0;
          }

          .vpAddCaptureHeaderText span {
            font-size: 12px;
          }

          .vpAddCaptureHeaderText strong {
            font-size: 31px;
          }

          .vpAddCaptureHeaderText p {
            font-size: 16px;
          }

          .vpAddCaptureCoordinates {
            min-height: 52px;
          }

          .vpAddCaptureCoordinates span {
            font-size: 16px;
          }

          .vpAddCaptureFormCard {
            flex: 1 1 auto;
            min-height: 0;
            padding: 24px 28px;
            overflow: hidden;
          }

          .vpAddCaptureGrid {
            grid-template-columns: repeat(12, minmax(0, 1fr));
            gap: 20px 24px;
            height: 100%;
            min-height: 0;
            overflow: hidden;
          }

          .vpAddCaptureHalf {
            grid-column: span 6;
          }

          .vpAddCaptureThird {
            grid-column: span 4;
          }

          .vpAddCaptureFull {
            grid-column: span 12;
          }

          .vpAddCaptureFieldLabel {
            font-size: 14px;
          }

          .vpAddCaptureField input,
          .vpAddCaptureInputUnit,
          .vpAddCaptureInputIcon,
          .vpAddCapturePhotoButton {
            min-height: 48px;
          }

          .vpAddCaptureField input {
            font-size: 16px;
          }

          .vpAddCaptureField textarea {
            min-height: 118px;
            font-size: 16px;
          }

          .vpAddCaptureFooter {
            border-radius: 18px;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            padding: 11px 28px;
          }

          .vpAddCapturePrimaryButton,
          .vpAddCaptureCancelButton {
            min-height: 56px;
            border-radius: 15px;
            font-size: 18px;
          }
        }
      `}</style>
    </section>
  );
}
