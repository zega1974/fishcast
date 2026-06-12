'use client';

import { useEffect, useState, type ReactNode } from 'react';

type IconProps = {
  className?: string;
};

type AddPlacePanelFormData = {
  name: string;
  note: string;
};

type AddPlacePanelProps = {
  lat: number;
  lng: number;
  formData: AddPlacePanelFormData;
  onFormDataChange: (formData: AddPlacePanelFormData) => void;
  onSave: () => void;
  onCancel: () => void;
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

function FieldShell({
  label,
  children,
  className = '',
}: {
  label: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={`vpAddPlaceField ${className}`}>
      <span className="vpAddPlaceFieldLabel">{label}</span>
      {children}
    </label>
  );
}

export default function AddPlacePanel({
  lat,
  lng,
  formData,
  onFormDataChange,
  onSave,
  onCancel,
}: AddPlacePanelProps) {
  const [isMobileKeyboardOpen, setIsMobileKeyboardOpen] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.visualViewport) {
      return;
    }

    const viewport = window.visualViewport;
    const initialHeight = viewport.height;

    const updateKeyboardState = () => {
      const heightDifference = initialHeight - viewport.height;
      setIsMobileKeyboardOpen(heightDifference > 120);
    };

    updateKeyboardState();

    viewport.addEventListener('resize', updateKeyboardState);
    viewport.addEventListener('scroll', updateKeyboardState);

    return () => {
      viewport.removeEventListener('resize', updateKeyboardState);
      viewport.removeEventListener('scroll', updateKeyboardState);
    };
  }, []);

  return (
    <section className="vpAddPlacePreview map-control-overlay" aria-label="Adicionar Lugar">
      <div className="vpAddPlacePanelFrame">
        <button
          className="vpAddPlaceCloseButton"
          type="button"
          aria-label="Fechar adicionar lugar"
          onClick={onCancel}
        >
          <CloseIcon />
        </button>

        <main
          className={`vpAddPlacePanelShell${isMobileKeyboardOpen ? ' vpAddPlacePanelShellKeyboardOpen' : ''}`}
        >
          <header className="vpAddPlaceHeader">
            <div className="vpAddPlaceHeaderText">
              <span>Meu ponto de pesca</span>
              <strong>Adicionar Lugar</strong>
              <p>Salve este ponto para voltar aqui depois.</p>
            </div>

            <div className="vpAddPlaceCoordinates" aria-label="Coordenadas">
              <PinIcon />
              <span>
                {lat.toFixed(6)}, {lng.toFixed(6)}
              </span>
            </div>
          </header>

          <section className="vpAddPlaceFormCard" aria-label="Formulário de lugar">
            <div className="vpAddPlaceGrid">
              <FieldShell label="Nome do lugar" className="vpAddPlaceFull">
                <input
                  type="text"
                  placeholder="Ex: Pontal de Matinhos"
                  value={formData.name}
                  onChange={(event) =>
                    onFormDataChange({ ...formData, name: event.target.value })
                  }
                />
              </FieldShell>

              <FieldShell
                label={
                  <>
                    Observações <small>(opcional)</small>
                  </>
                }
                className="vpAddPlaceFull"
              >
                <textarea
                  placeholder="Detalhes do acesso, maré boa, iscas que funcionam, cuidados no local..."
                  value={formData.note}
                  onChange={(event) =>
                    onFormDataChange({ ...formData, note: event.target.value })
                  }
                />
              </FieldShell>
            </div>
          </section>

          <footer className="vpAddPlaceFooter">
            <button className="vpAddPlacePrimaryButton" type="button" onClick={onSave}>
              Salvar lugar aqui
            </button>

            <button className="vpAddPlaceCancelButton" type="button" onClick={onCancel}>
              Cancelar
            </button>
          </footer>
        </main>
      </div>

      <style jsx global>{`
        .vpAddPlacePreview {
          position: fixed;
          inset: 0;
          z-index: 99999;
          width: 100vw;
          height: 100dvh;
          overflow: hidden;
          color: #f8fafc;
          pointer-events: auto;
          background:
            radial-gradient(circle at 50% 8%, rgba(234, 179, 8, 0.13), transparent 34%),
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

        .vpAddPlacePanelFrame {
          position: relative;
          width: min(100vw, 460px);
          height: 100dvh;
          max-height: 100dvh;
          margin: 0 auto;
          overflow: hidden;
        }

        .vpAddPlaceCloseButton {
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

        .vpAddPlaceCloseButton svg {
          width: 25px;
          height: 25px;
        }

        .vpAddPlacePanelShell {
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

        .vpAddPlaceHeader,
        .vpAddPlaceFormCard,
        .vpAddPlaceFooter {
          background: linear-gradient(135deg, rgba(23, 31, 42, 0.88), rgba(10, 16, 23, 0.94));
          border: 1px solid rgba(148, 163, 184, 0.2);
          box-shadow:
            inset 0 1px 0 rgba(255, 255, 255, 0.035),
            0 14px 34px rgba(0, 0, 0, 0.18);
          backdrop-filter: blur(14px);
        }

        .vpAddPlaceHeader {
          flex: 0 0 auto;
          border-radius: 18px;
          padding: 14px 16px;
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .vpAddPlaceHeaderText {
          min-width: 0;
          padding-right: 56px;
        }

        .vpAddPlaceHeaderText span {
          display: block;
          color: rgba(226, 232, 240, 0.72);
          font-size: 11px;
          line-height: 1;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          font-weight: 620;
        }

        .vpAddPlaceHeaderText strong {
          display: block;
          margin-top: 7px;
          color: #facc15;
          font-size: clamp(24px, 6vw, 29px);
          line-height: 1.04;
          font-weight: 760;
          letter-spacing: -0.035em;
        }

        .vpAddPlaceHeaderText p {
          margin: 7px 0 0;
          color: rgba(226, 232, 240, 0.82);
          font-size: 14px;
          line-height: 1.28;
          font-weight: 560;
        }

        .vpAddPlaceCoordinates {
          min-height: 48px;
          border: 1px solid rgba(250, 204, 21, 0.2);
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

        .vpAddPlaceCoordinates svg {
          width: 23px;
          height: 23px;
          color: #facc15;
          flex: 0 0 auto;
        }

        .vpAddPlaceCoordinates span {
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

        .vpAddPlaceFormCard {
          flex: 1 1 auto;
          min-height: 0;
          border-radius: 18px;
          padding: 18px 16px;
          box-sizing: border-box;
          overflow-x: hidden;
          overflow-y: auto;
          overscroll-behavior: contain;
          -webkit-overflow-scrolling: touch;
          scrollbar-width: thin;
        }

        .vpAddPlaceFormCard::-webkit-scrollbar {
          width: 4px;
        }

        .vpAddPlaceFormCard::-webkit-scrollbar-thumb {
          background: rgba(234, 179, 8, 0.42);
          border-radius: 999px;
        }

        .vpAddPlaceGrid {
          height: auto;
          min-height: max-content;
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 18px 14px;
          overflow: visible;
          padding-bottom: 10px;
        }

        .vpAddPlaceField {
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .vpAddPlaceFieldLabel {
          color: rgba(248, 250, 252, 0.94);
          font-size: 14px;
          line-height: 1;
          font-weight: 760;
        }

        .vpAddPlaceFieldLabel small {
          color: rgba(226, 232, 240, 0.64);
          font-size: 12.5px;
          font-weight: 620;
        }

        .vpAddPlaceFull {
          grid-column: 1 / -1;
        }

        .vpAddPlaceField input,
        .vpAddPlaceField textarea {
          width: 100%;
          border: 1px solid rgba(250, 204, 21, 0.18);
          border-radius: 14px;
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

        .vpAddPlaceField input {
          min-height: 48px;
          padding: 0 14px;
          font-size: 16px;
          font-weight: 620;
        }

        .vpAddPlaceField textarea {
          min-height: 210px;
          resize: none;
          padding: 16px;
          font-size: 17px;
          line-height: 1.38;
          font-weight: 560;
        }

        .vpAddPlaceField input::placeholder,
        .vpAddPlaceField textarea::placeholder {
          color: rgba(148, 163, 184, 0.72);
        }

        .vpAddPlaceField input:focus,
        .vpAddPlaceField textarea:focus {
          border-color: rgba(250, 204, 21, 0.48);
          box-shadow:
            0 0 0 1px rgba(250, 204, 21, 0.16),
            0 0 22px rgba(250, 204, 21, 0.1),
            inset 0 1px 0 rgba(255, 255, 255, 0.07);
          scroll-margin-top: 140px;
          scroll-margin-bottom: 340px;
        }

        .vpAddPlaceFooter {
          flex: 0 0 auto;
          border-radius: 16px;
          display: grid;
          grid-template-columns: 1fr;
          gap: 10px;
          padding: 10px;
          box-sizing: border-box;
          scroll-margin-bottom: 340px;
        }

        .vpAddPlacePrimaryButton,
        .vpAddPlaceCancelButton {
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

        .vpAddPlacePrimaryButton {
          color: #ffffff;
          background: linear-gradient(135deg, rgba(202, 138, 4, 0.96), rgba(161, 98, 7, 0.92));
          border-color: rgba(250, 204, 21, 0.46);
          box-shadow:
            0 0 28px rgba(202, 138, 4, 0.24),
            inset 0 1px 0 rgba(255, 255, 255, 0.16);
        }

        .vpAddPlaceCancelButton {
          color: #fecaca;
          background: linear-gradient(135deg, rgba(88, 19, 23, 0.78), rgba(42, 10, 16, 0.9));
          border-color: rgba(248, 113, 113, 0.42);
          box-shadow:
            0 0 24px rgba(239, 68, 68, 0.14),
            inset 0 1px 0 rgba(255, 255, 255, 0.08);
        }

        .vpAddPlaceCloseButton svg,
        .vpAddPlaceCoordinates svg {
          fill: none;
          stroke: currentColor;
          stroke-width: 3;
          stroke-linecap: round;
          stroke-linejoin: round;
        }

        @media (max-width: 767px) {
          .vpAddPlacePanelShellKeyboardOpen {
            overflow-y: auto;
            overflow-x: hidden;
            overscroll-behavior: contain;
            -webkit-overflow-scrolling: touch;
            padding-bottom: clamp(260px, 42dvh, 390px);
            scroll-padding-top: 18px;
            scroll-padding-bottom: 340px;
          }

          .vpAddPlacePanelShellKeyboardOpen .vpAddPlaceFormCard {
            flex: 0 0 auto;
            min-height: auto;
            overflow: visible;
          }

          .vpAddPlacePanelShellKeyboardOpen .vpAddPlaceGrid {
            padding-bottom: 12px;
          }
        }

        @media (max-width: 420px) {
          .vpAddPlacePanelShell {
            gap: 6px;
            padding-left: 10px;
            padding-right: 10px;
          }

          .vpAddPlaceHeader {
            padding: 13px 16px;
            gap: 12px;
          }

          .vpAddPlaceHeaderText strong {
            font-size: clamp(24px, 7.1vw, 30px);
          }

          .vpAddPlaceCoordinates {
            min-height: 48px;
          }

          .vpAddPlaceCoordinates span {
            font-size: 15px;
          }

          .vpAddPlaceFormCard {
            padding: 13px 16px;
          }

          .vpAddPlaceGrid {
            gap: 12px 14px;
          }

          .vpAddPlaceField input {
            min-height: 48px;
          }

          .vpAddPlaceField textarea {
            min-height: 210px;
          }

          .vpAddPlaceFooter {
            gap: 8px;
            padding: 8px;
          }

          .vpAddPlacePrimaryButton,
          .vpAddPlaceCancelButton {
            min-height: 48px;
            font-size: 15px;
          }
        }

        @media (min-width: 768px) {
          .vpAddPlacePreview {
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 24px;
            box-sizing: border-box;
            background:
              radial-gradient(circle at 50% 12%, rgba(250, 204, 21, 0.11), transparent 38%),
              radial-gradient(circle at 50% 50%, rgba(15, 23, 42, 0.2), transparent 58%),
              rgba(2, 8, 15, 0.58);
            backdrop-filter: blur(2px);
          }

          .vpAddPlacePanelFrame {
            width: min(88vw, 860px);
            height: auto;
            max-height: calc(100dvh - 96px);
            display: flex;
            justify-content: center;
            align-items: center;
            overflow: visible;
          }

          .vpAddPlaceCloseButton {
            position: absolute;
            top: -34px;
            right: -54px;
            left: auto;
            width: 44px;
            height: 44px;
            border-radius: 15px;
          }

          .vpAddPlacePanelShell {
            width: 100%;
            height: auto;
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

          .vpAddPlacePanelShell:focus-within {
            padding-bottom: 14px;
            overflow: hidden;
          }

          .vpAddPlaceHeader,
          .vpAddPlaceFormCard,
          .vpAddPlaceFooter {
            background: rgba(10, 18, 30, 0.82);
            border: 1px solid rgba(148, 163, 184, 0.18);
          }

          .vpAddPlaceHeader {
            flex: 0 0 auto;
            padding: 24px 28px 22px;
            gap: 18px;
          }

          .vpAddPlaceHeaderText {
            padding-right: 0;
          }

          .vpAddPlaceHeaderText span {
            font-size: 12px;
          }

          .vpAddPlaceHeaderText strong {
            font-size: 31px;
          }

          .vpAddPlaceHeaderText p {
            font-size: 16px;
          }

          .vpAddPlaceCoordinates {
            min-height: 52px;
          }

          .vpAddPlaceCoordinates span {
            font-size: 16px;
          }

          .vpAddPlaceFormCard {
            flex: 0 0 auto;
            min-height: auto;
            padding: 24px 28px;
            overflow: hidden;
          }

          .vpAddPlaceGrid {
            height: auto;
            min-height: auto;
            grid-template-columns: repeat(12, minmax(0, 1fr));
            gap: 20px 24px;
            overflow: hidden;
            padding-bottom: 0;
          }

          .vpAddPlaceFull {
            grid-column: span 12;
          }

          .vpAddPlaceField {
            min-height: 0;
          }

          .vpAddPlaceFieldLabel {
            font-size: 14px;
          }

          .vpAddPlaceField input {
            min-height: 48px;
            font-size: 16px;
          }

          .vpAddPlaceField textarea {
            min-height: 150px;
            height: 150px;
            max-height: 150px;
            font-size: 16px;
          }

          .vpAddPlaceField input:focus,
          .vpAddPlaceField textarea:focus {
            scroll-margin-top: 0;
            scroll-margin-bottom: 0;
          }

          .vpAddPlaceFooter {
            flex: 0 0 auto;
            border-radius: 18px;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            padding: 11px 28px;
          }

          .vpAddPlacePrimaryButton,
          .vpAddPlaceCancelButton {
            min-height: 56px;
            border-radius: 15px;
            font-size: 18px;
          }
        }
      `}</style>
    </section>
  );
}
