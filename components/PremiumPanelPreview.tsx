'use client';

import type React from 'react';
import { useState } from 'react';

export type PreviewIconName =
  | 'weather'
  | 'pressure'
  | 'airTemp'
  | 'waterTemp'
  | 'moon'
  | 'tide'
  | 'depth'
  | 'anchor'
  | 'compass'
  | 'map'
  | 'satellite'
  | 'night'
  | 'copy'
  | 'clock';

type PremiumPanelPreviewProps = {
  onClose?: () => void;
  onBack?: () => void;
  placeName?: string;
  lat?: number;
  lng?: number;
  coordinatesText?: string;
};

type IconProps = {
  className?: string;
};

type AdvancedMetricId =
  | 'weather'
  | 'airTemp'
  | 'waterTemp'
  | 'tide'
  | 'swell'
  | 'wind'
  | 'pressure'
  | 'sunMoon';

type AdvancedMetric = {
  id: AdvancedMetricId;
  icon: React.ReactNode;
  label: string;
  value: string;
  detail?: string;
};

type TideSummaryItem = {
  icon: React.ReactNode;
  label: string;
  value: string;
  emphasis?: boolean;
};

type WindSummaryItem = {
  icon: React.ReactNode;
  label: string;
  value: string;
  emphasis?: boolean;
};

export function PreviewIcon({
  name,
  className = '',
}: {
  name?: PreviewIconName;
  className?: string;
}) {
  if (name === 'map') {
    return (
      <svg className={className} viewBox="0 0 64 64" aria-hidden="true">
        <path d="M9 14 24 8l16 6 15-6v42l-15 6-16-6-15 6V14Z" fill="currentColor" />
        <path d="M24 8v42M40 14v42" stroke="rgba(2,8,18,0.42)" strokeWidth="4" />
      </svg>
    );
  }

  if (name === 'satellite') {
    return (
      <svg className={className} viewBox="0 0 64 64" aria-hidden="true">
        <path d="M16 38 38 16l10 10-22 22-10-10Z" fill="currentColor" />
        <path d="M8 30 30 8M20 42 42 20M30 52 52 30" stroke="currentColor" strokeWidth="5" />
      </svg>
    );
  }

  if (name === 'anchor') {
    return (
      <svg className={className} viewBox="0 0 64 64" aria-hidden="true">
        <circle cx="32" cy="10" r="6" fill="none" stroke="currentColor" strokeWidth="4" />
        <path d="M32 16v38" stroke="currentColor" strokeLinecap="round" strokeWidth="5" />
        <path d="M20 25h24" stroke="currentColor" strokeLinecap="round" strokeWidth="5" />
        <path
          d="M15 39c2 12 11 18 17 18s15-6 17-18"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeWidth="5"
        />
        <path
          d="M11 42l5-7 7 5M53 42l-5-7-7 5"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="4"
        />
      </svg>
    );
  }

  if (name === 'night' || name === 'moon') {
    return (
      <svg className={className} viewBox="0 0 64 64" aria-hidden="true">
        <path
          d="M43 52c-16 1-29-10-29-25 0-9 5-17 13-22-3 15 6 30 23 34-4 6-7 10-7 13Z"
          fill="currentColor"
        />
        <path
          d="M50 39c-6 10-18 14-30 8 11 11 28 9 38-2-3-2-5-4-8-6Z"
          fill="currentColor"
          opacity=".55"
        />
      </svg>
    );
  }

  return (
    <svg className={className} viewBox="0 0 48 48" aria-hidden="true">
      <path d="M10 40V24" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="3" />
      <path d="M22 40V10" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="3" />
      <path d="M34 40V18" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="3" />
      <path d="M6 40h36" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="3" />
    </svg>
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

function CloseIcon(props: IconProps) {
  return (
    <SvgBase {...props}>
      <path d="M12 12l24 24" />
      <path d="M36 12 12 36" />
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

function PinIcon(props: IconProps) {
  return (
    <SvgBase {...props}>
      <path d="M24 43s14-12.5 14-25A14 14 0 1 0 10 18c0 12.5 14 25 14 25Z" />
      <circle cx="24" cy="18" r="5" />
    </SvgBase>
  );
}

function ThermometerIcon(props: IconProps) {
  return (
    <SvgBase {...props}>
      <path d="M24 6v24" />
      <path d="M18 30.5V12a6 6 0 0 1 12 0v18.5a10 10 0 1 1-12 0Z" />
      <path d="M24 31V17" />
    </SvgBase>
  );
}

function WaterThermometerIcon(props: IconProps) {
  return (
    <SvgBase {...props}>
      <path d="M24 6v21" />
      <path d="M18 28V12a6 6 0 0 1 12 0v16a9 9 0 1 1-12 0Z" />
      <path d="M11 39c4 3 8 3 12 0s8-3 12 0" />
      <path d="M11 44c4 3 8 3 12 0s8-3 12 0" />
    </SvgBase>
  );
}

function PressureIcon(props: IconProps) {
  return (
    <SvgBase {...props}>
      <circle cx="24" cy="24" r="16" />
      <path d="M24 24l8-8" />
      <path d="M15 33h18" />
    </SvgBase>
  );
}

function RainIcon(props: IconProps) {
  return (
    <SvgBase {...props}>
      <path d="M15 22a9 9 0 0 1 17-5 7 7 0 0 1 2 14H15a7 7 0 0 1 0-14" />
      <path d="M17 37l-2 5" />
      <path d="M25 37l-2 5" />
      <path d="M33 37l-2 5" />
    </SvgBase>
  );
}

function TideIcon(props: IconProps) {
  return (
    <SvgBase {...props}>
      <path d="M6 18c5 4 10 4 15 0s10-4 15 0 6 3 6 3" />
      <path d="M6 28c5 4 10 4 15 0s10-4 15 0 6 3 6 3" />
      <path d="M6 38c5 4 10 4 15 0s10-4 15 0 6 3 6 3" />
    </SvgBase>
  );
}

function TideRiseIcon(props: IconProps) {
  return (
    <SvgBase {...props}>
      <path d="M24 37V9" />
      <path d="m15 18 9-9 9 9" />
      <path d="M6 37c5 4 10 4 15 0s10-4 15 0 6 3 6 3" />
      <path d="M6 43c5 4 10 4 15 0s10-4 15 0 6 3 6 3" />
    </SvgBase>
  );
}

function TideFallIcon(props: IconProps) {
  return (
    <SvgBase {...props}>
      <path d="M24 9v28" />
      <path d="m15 28 9 9 9-9" />
      <path d="M6 37c5 4 10 4 15 0s10-4 15 0 6 3 6 3" />
      <path d="M6 43c5 4 10 4 15 0s10-4 15 0 6 3 6 3" />
    </SvgBase>
  );
}

function TideAmplitudeIcon(props: IconProps) {
  return (
    <SvgBase {...props}>
      <path d="M24 8v30" />
      <path d="m17 15 7-7 7 7" />
      <path d="m17 31 7 7 7-7" />
      <path d="M6 40c5 4 10 4 15 0s10-4 15 0 6 3 6 3" />
    </SvgBase>
  );
}

function WaveIcon(props: IconProps) {
  return (
    <SvgBase {...props}>
      <path d="M6 25c5 4 10 4 15 0s10-4 15 0 6 3 6 3" />
      <path d="M6 35c5 4 10 4 15 0s10-4 15 0 6 3 6 3" />
      <path d="M33 12c-7 0-10 5-10 12" />
    </SvgBase>
  );
}

function WindIcon(props: IconProps) {
  return (
    <SvgBase {...props}>
      <path d="M5 18h26a6 6 0 1 0-6-6" />
      <path d="M5 27h34" />
      <path d="M5 36h24a5 5 0 1 1-5 5" />
    </SvgBase>
  );
}

function CompassIcon(props: IconProps) {
  return (
    <SvgBase {...props}>
      <circle cx="24" cy="24" r="17" />
      <path d="M29 19 21 34l-2-12 12-3Z" />
      <path d="M24 7v4" />
      <path d="M24 37v4" />
      <path d="M7 24h4" />
      <path d="M37 24h4" />
    </SvgBase>
  );
}

function SunMoonIcon(props: IconProps) {
  return (
    <SvgBase {...props}>
      <circle cx="17" cy="17" r="6" />
      <path d="M17 4v4" />
      <path d="M17 26v4" />
      <path d="M4 17h4" />
      <path d="M26 17h4" />
      <path d="m8 8 3 3" />
      <path d="m26 8-3 3" />
      <path d="M35 29a10 10 0 1 0 6 12 12 12 0 0 1-6-12Z" />
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

function ActivityIcon(props: IconProps) {
  return (
    <SvgBase {...props}>
      <path d="M5 26h8l5-12 8 22 6-14 4 4h7" />
    </SvgBase>
  );
}

function ClockIcon(props: IconProps) {
  return (
    <SvgBase {...props}>
      <circle cx="24" cy="24" r="17" />
      <path d="M24 13v12l8 5" />
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
  return <div className={`vpAdvancedCard ${className}`}>{children}</div>;
}

function SelectedPointCard({ placeName }: { placeName: string }) {
  return (
    <CardShell className="vpAdvancedPlaceBlock">
      <div className="vpAdvancedPlaceIcon">
        <PinIcon />
      </div>

      <div className="vpAdvancedPlaceText">
        <span>Ponto Selecionado</span>
        <strong>{placeName}</strong>
      </div>

      <div className="vpAdvancedHeaderScore" aria-label="VouPescar Score 82">
        <span>Score</span>
        <strong>82</strong>
      </div>
    </CardShell>
  );
}

function IntroCard() {
  return (
    <CardShell className="vpAdvancedIntroBlock">
      <div className="vpAdvancedIntroIcon">
        <ChartIcon />
      </div>

      <div className="vpAdvancedIntroText">
        <span>DADOS AVANÇADOS</span>
        <strong>Selecione um dado</strong>
        <small>Toque em um card para abrir o gráfico detalhado.</small>
      </div>
    </CardShell>
  );
}

function MetricButton({
  item,
  onOpen,
}: {
  item: AdvancedMetric;
  onOpen: (id: AdvancedMetricId) => void;
}) {
  return (
    <button
      className="vpAdvancedDataTile"
      type="button"
      onClick={() => onOpen(item.id)}
    >
      <div className="vpAdvancedTileIcon">{item.icon}</div>

      <div className={`vpAdvancedTileText ${item.label ? '' : 'isTitleOnly'}`}>
        {item.label ? <span>{item.label}</span> : null}
        <strong>{item.value}</strong>
        {item.detail ? <small>{item.detail}</small> : null}
      </div>

      <ChevronIcon className="vpAdvancedTileChevron" />
    </button>
  );
}

function TideTitleCard() {
  return (
    <CardShell className="vpTideTitleCard">
      <div className="vpTideTitleIcon">
        <TideIcon />
      </div>

      <div className="vpTideTitleText">
        <span>DADOS AVANÇADOS</span>
        <strong>MARÉ</strong>
        <small>Gráfico detalhado e variação nas próximas horas.</small>
      </div>
    </CardShell>
  );
}

function TideChart() {
  return (
    <CardShell className="vpTideChartCard">
      <div className="vpTideSituation">
        <ActivityIcon />
        <span>
          SITUAÇÃO ATUAL: <strong>ENCHENDO</strong>
        </span>
      </div>

      <div className="vpTideChartWrap">
        <svg
          className="vpTideChart"
          viewBox="0 0 920 270"
          preserveAspectRatio="none"
          role="img"
          aria-label="Gráfico de altura da maré ao longo de 24 horas"
        >
          <defs>
            <linearGradient id="vpTideFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(56,189,248,0.32)" />
              <stop offset="100%" stopColor="rgba(56,189,248,0.015)" />
            </linearGradient>

            <filter id="vpTideGlow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <g className="vpTideGrid">
            <line x1="55" y1="30" x2="900" y2="30" />
            <line x1="55" y1="85" x2="900" y2="85" />
            <line x1="55" y1="140" x2="900" y2="140" />
            <line x1="55" y1="195" x2="900" y2="195" />
            <line x1="55" y1="245" x2="900" y2="245" />

            <line x1="90" y1="30" x2="90" y2="245" />
            <line x1="190" y1="30" x2="190" y2="245" />
            <line x1="290" y1="30" x2="290" y2="245" />
            <line x1="390" y1="30" x2="390" y2="245" />
            <line x1="490" y1="30" x2="490" y2="245" />
            <line x1="590" y1="30" x2="590" y2="245" />
            <line x1="690" y1="30" x2="690" y2="245" />
            <line x1="790" y1="30" x2="790" y2="245" />
            <line x1="890" y1="30" x2="890" y2="245" />
          </g>

          <path
            className="vpTideArea"
            d="M55 128
               C100 126 135 150 175 184
               C220 222 250 224 290 210
               C340 191 385 147 440 126
               C505 102 555 55 625 44
               C705 31 750 70 785 125
               C820 180 845 218 880 208
               C890 205 896 199 900 195
               L900 245 L55 245 Z"
          />

          <path
            className="vpTideLine"
            d="M55 128
               C100 126 135 150 175 184
               C220 222 250 224 290 210
               C340 191 385 147 440 126
               C505 102 555 55 625 44
               C705 31 750 70 785 125
               C820 180 845 218 880 208
               C890 205 896 199 900 195"
          />

          <g className="vpTideMarker">
            <line x1="240" y1="210" x2="240" y2="245" />
            <circle cx="240" cy="210" r="6" />
            <text x="240" y="183" textAnchor="middle">
              05h18
            </text>
            <text x="240" y="200" textAnchor="middle">
              0,3 m
            </text>
          </g>

          <g className="vpTideMarker isCurrent">
            <line x1="440" y1="126" x2="440" y2="245" />
            <circle cx="440" cy="126" r="7" />
            <text x="440" y="92" textAnchor="middle">
              11h24
            </text>
            <text x="440" y="111" textAnchor="middle">
              0,9 m
            </text>
          </g>

          <g className="vpTideMarker">
            <line x1="625" y1="44" x2="625" y2="245" />
            <circle cx="625" cy="44" r="6" />
            <text x="625" y="15" textAnchor="middle">
              16h42
            </text>
            <text x="625" y="33" textAnchor="middle">
              1,4 m
            </text>
          </g>

          <g className="vpTideMarker">
            <line x1="850" y1="208" x2="850" y2="245" />
            <circle cx="850" cy="208" r="6" />
            <text x="850" y="181" textAnchor="middle">
              22h18
            </text>
            <text x="850" y="198" textAnchor="middle">
              0,3 m
            </text>
          </g>

          <g className="vpTideYAxis">
            <text x="4" y="35">1,6</text>
            <text x="4" y="90">1,2</text>
            <text x="4" y="145">0,8</text>
            <text x="4" y="200">0,4</text>
            <text x="4" y="250">0,0</text>
          </g>

          <g className="vpTideXAxis">
            <text x="90" y="265" textAnchor="middle">00h</text>
            <text x="190" y="265" textAnchor="middle">03h</text>
            <text x="290" y="265" textAnchor="middle">06h</text>
            <text x="390" y="265" textAnchor="middle">09h</text>
            <text x="490" y="265" textAnchor="middle">12h</text>
            <text x="590" y="265" textAnchor="middle">15h</text>
            <text x="690" y="265" textAnchor="middle">18h</text>
            <text x="790" y="265" textAnchor="middle">21h</text>
            <text x="890" y="265" textAnchor="middle">24h</text>
          </g>
        </svg>
      </div>

      <span className="vpTideAxisLabel">Altura (m)</span>
    </CardShell>
  );
}

function TideSummaryCard({ item }: { item: TideSummaryItem }) {
  return (
    <CardShell className="vpTideSummaryCard">
      <div className="vpTideSummaryIcon">{item.icon}</div>

      <div className="vpTideSummaryText">
        <span>{item.label}</span>
        <strong className={item.emphasis ? 'isEmphasis' : ''}>
          {item.value}
        </strong>
      </div>
    </CardShell>
  );
}

function TideDetailView({
  placeName,
  onBack,
}: {
  placeName: string;
  onBack: () => void;
}) {
  const summaries: TideSummaryItem[] = [
    {
      icon: <TideIcon />,
      label: 'MARÉ ATUAL',
      value: 'Enchendo',
      emphasis: true,
    },
    {
      icon: <TideRiseIcon />,
      label: 'PRÓXIMA CHEIA',
      value: '16h42 • 1,4 m',
    },
    {
      icon: <TideFallIcon />,
      label: 'PRÓXIMA VAZANTE',
      value: '22h18 • 0,3 m',
    },
    {
      icon: <TideAmplitudeIcon />,
      label: 'AMPLITUDE',
      value: '1,1 m',
    },
  ];

  return (
    <main className="vpTidePanelShell">
      <div className="vpTideTopBar">
        <button
          type="button"
          className="vpTideBackButton"
          aria-label="Voltar para Dados Avançados"
          onClick={onBack}
        >
          <BackIcon />
        </button>

        <span>DADOS AVANÇADOS</span>
      </div>

      <SelectedPointCard placeName={placeName} />

      <TideTitleCard />

      <TideChart />

      <section className="vpTideSummaryGrid" aria-label="Resumo da maré">
        {summaries.map((item) => (
          <TideSummaryCard key={item.label} item={item} />
        ))}
      </section>

      <CardShell className="vpTideVariationCard">
        <div className="vpTideVariationIcon">
          <ClockIcon />
        </div>

        <div className="vpTideVariationText">
          <span>JANELA DE VARIAÇÃO</span>
          <strong>Subida mais forte entre 14h e 17h.</strong>
        </div>
      </CardShell>
    </main>
  );
}

function WindTitleCard() {
  return (
    <CardShell className="vpTideTitleCard vpWindTitleCard">
      <div className="vpTideTitleIcon vpWindTitleIcon">
        <WindIcon />
      </div>

      <div className="vpTideTitleText">
        <span>DADOS AVANÇADOS</span>
        <strong>VENTO</strong>
        <small>Direção, intensidade e rajadas nas próximas horas.</small>
      </div>
    </CardShell>
  );
}

function WindChart() {
  return (
    <CardShell className="vpTideChartCard vpWindChartCard">
      <div className="vpTideSituation vpWindSituation">
        <WindIcon />
        <span>
          SITUAÇÃO ATUAL: <strong>BRISA MODERADA DE NE</strong>
        </span>
      </div>

      <div className="vpTideChartWrap vpWindChartWrap">
        <svg
          className="vpTideChart vpWindChart"
          viewBox="0 0 920 270"
          preserveAspectRatio="none"
          role="img"
          aria-label="Gráfico de vento ao longo de 24 horas"
        >
          <defs>
            <linearGradient id="vpWindFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(125,211,252,0.25)" />
              <stop offset="100%" stopColor="rgba(125,211,252,0.015)" />
            </linearGradient>

            <filter id="vpWindGlow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <g className="vpTideGrid">
            <line x1="55" y1="30" x2="900" y2="30" />
            <line x1="55" y1="85" x2="900" y2="85" />
            <line x1="55" y1="140" x2="900" y2="140" />
            <line x1="55" y1="195" x2="900" y2="195" />
            <line x1="55" y1="245" x2="900" y2="245" />

            <line x1="90" y1="30" x2="90" y2="245" />
            <line x1="190" y1="30" x2="190" y2="245" />
            <line x1="290" y1="30" x2="290" y2="245" />
            <line x1="390" y1="30" x2="390" y2="245" />
            <line x1="490" y1="30" x2="490" y2="245" />
            <line x1="590" y1="30" x2="590" y2="245" />
            <line x1="690" y1="30" x2="690" y2="245" />
            <line x1="790" y1="30" x2="790" y2="245" />
            <line x1="890" y1="30" x2="890" y2="245" />
          </g>

          <g className="vpWindBars" aria-hidden="true">
            <rect x="82" y="192" width="16" height="53" rx="8" />
            <rect x="182" y="178" width="16" height="67" rx="8" />
            <rect x="282" y="158" width="16" height="87" rx="8" />
            <rect x="382" y="140" width="16" height="105" rx="8" />
            <rect x="482" y="125" width="16" height="120" rx="8" />
            <rect x="582" y="110" width="16" height="135" rx="8" />
            <rect x="682" y="120" width="16" height="125" rx="8" />
            <rect x="782" y="148" width="16" height="97" rx="8" />
            <rect x="882" y="172" width="16" height="73" rx="8" />
          </g>

          <path
            className="vpWindArea"
            d="M55 190
               C105 186 145 178 190 170
               C245 160 300 145 355 136
               C420 124 485 112 545 105
               C620 96 670 110 720 128
               C785 150 840 165 900 174
               L900 245 L55 245 Z"
          />

          <path
            className="vpWindLine"
            d="M55 190
               C105 186 145 178 190 170
               C245 160 300 145 355 136
               C420 124 485 112 545 105
               C620 96 670 110 720 128
               C785 150 840 165 900 174"
          />

          <g className="vpTideMarker vpWindMarker">
            <line x1="190" y1="170" x2="190" y2="245" />
            <circle cx="190" cy="170" r="6" />
            <text x="190" y="143" textAnchor="middle">
              03h
            </text>
            <text x="190" y="160" textAnchor="middle">
              6 km/h
            </text>
          </g>

          <g className="vpTideMarker vpWindMarker isCurrent">
            <line x1="490" y1="112" x2="490" y2="245" />
            <circle cx="490" cy="112" r="7" />
            <text x="490" y="78" textAnchor="middle">
              12h
            </text>
            <text x="490" y="97" textAnchor="middle">
              8 km/h
            </text>
          </g>

          <g className="vpTideMarker vpWindMarker">
            <line x1="625" y1="100" x2="625" y2="245" />
            <circle cx="625" cy="100" r="6" />
            <text x="625" y="71" textAnchor="middle">
              16h
            </text>
            <text x="625" y="89" textAnchor="middle">
              14 km/h
            </text>
          </g>

          <g className="vpTideMarker vpWindMarker">
            <line x1="850" y1="166" x2="850" y2="245" />
            <circle cx="850" cy="166" r="6" />
            <text x="850" y="139" textAnchor="middle">
              22h
            </text>
            <text x="850" y="156" textAnchor="middle">
              9 km/h
            </text>
          </g>

          <g className="vpTideYAxis">
            <text x="4" y="35">25</text>
            <text x="4" y="90">20</text>
            <text x="4" y="145">15</text>
            <text x="4" y="200">10</text>
            <text x="4" y="250">0</text>
          </g>

          <g className="vpTideXAxis">
            <text x="90" y="265" textAnchor="middle">00h</text>
            <text x="190" y="265" textAnchor="middle">03h</text>
            <text x="290" y="265" textAnchor="middle">06h</text>
            <text x="390" y="265" textAnchor="middle">09h</text>
            <text x="490" y="265" textAnchor="middle">12h</text>
            <text x="590" y="265" textAnchor="middle">15h</text>
            <text x="690" y="265" textAnchor="middle">18h</text>
            <text x="790" y="265" textAnchor="middle">21h</text>
            <text x="890" y="265" textAnchor="middle">24h</text>
          </g>
        </svg>
      </div>

      <span className="vpTideAxisLabel">Vento (km/h)</span>
    </CardShell>
  );
}

function WindSummaryCard({ item }: { item: WindSummaryItem }) {
  return (
    <CardShell className="vpTideSummaryCard vpWindSummaryCard">
      <div className="vpTideSummaryIcon vpWindSummaryIcon">{item.icon}</div>

      <div className="vpTideSummaryText">
        <span>{item.label}</span>
        <strong className={item.emphasis ? 'isEmphasis' : ''}>
          {item.value}
        </strong>
      </div>
    </CardShell>
  );
}

function WindDetailView({
  placeName,
  onBack,
}: {
  placeName: string;
  onBack: () => void;
}) {
  const summaries: WindSummaryItem[] = [
    {
      icon: <WindIcon />,
      label: 'VENTO ATUAL',
      value: 'NE • 8 km/h',
      emphasis: true,
    },
    {
      icon: <ActivityIcon />,
      label: 'RAJADAS',
      value: 'até 17 km/h',
    },
    {
      icon: <CompassIcon />,
      label: 'DIREÇÃO',
      value: 'Nordeste',
    },
    {
      icon: <ClockIcon />,
      label: 'TENDÊNCIA',
      value: 'Aumenta à tarde',
    },
  ];

  return (
    <main className="vpTidePanelShell vpWindPanelShell">
      <div className="vpTideTopBar">
        <button
          type="button"
          className="vpTideBackButton"
          aria-label="Voltar para Dados Avançados"
          onClick={onBack}
        >
          <BackIcon />
        </button>

        <span>DADOS AVANÇADOS</span>
      </div>

      <SelectedPointCard placeName={placeName} />

      <WindTitleCard />

      <WindChart />

      <section className="vpTideSummaryGrid vpWindSummaryGrid" aria-label="Resumo do vento">
        {summaries.map((item) => (
          <WindSummaryCard key={item.label} item={item} />
        ))}
      </section>

      <CardShell className="vpTideVariationCard vpWindVariationCard">
        <div className="vpTideVariationIcon vpWindVariationIcon">
          <ClockIcon />
        </div>

        <div className="vpTideVariationText">
          <span>JANELA MAIS ESTÁVEL</span>
          <strong>Vento mais previsível entre 10h e 14h.</strong>
        </div>
      </CardShell>
    </main>
  );
}

export default function PremiumPanelPreview({
  onClose,
  onBack,
  placeName,
}: PremiumPanelPreviewProps) {
  const [activeMetric, setActiveMetric] = useState<AdvancedMetricId | null>(null);
  const selectedPlaceName = placeName?.trim() || 'Ponto selecionado';

  const metrics: AdvancedMetric[] = [
    {
      id: 'weather',
      icon: <RainIcon />,
      label: 'Clima',
      value: 'Parcialmente nublado',
    },
    {
      id: 'airTemp',
      icon: <ThermometerIcon />,
      label: 'Temperatura do Ar',
      value: '26,0 °C',
    },
    {
      id: 'waterTemp',
      icon: <WaterThermometerIcon />,
      label: 'Temperatura da Água',
      value: '22,4 °C',
    },
    {
      id: 'tide',
      icon: <TideIcon />,
      label: 'Maré',
      value: 'Enchendo',
    },
    {
      id: 'swell',
      icon: <WaveIcon />,
      label: 'Swell',
      value: '0,7 m • 8 s',
    },
    {
      id: 'wind',
      icon: <WindIcon />,
      label: 'Vento',
      value: 'NE • 8 km/h',
    },
    {
      id: 'pressure',
      icon: <PressureIcon />,
      label: 'Pressão',
      value: '1016 hPa',
    },
    {
      id: 'sunMoon',
      icon: <SunMoonIcon />,
      label: '',
      value: 'SOL E LUA',
    },
  ];

  const openMetric = (id: AdvancedMetricId) => {
    if (id === 'tide' || id === 'wind') {
      setActiveMetric(id);
    }
  };

  return (
    <section className="vpAdvancedPreview" aria-label="Preview Dados Avançados">
      {onClose ? (
        <button
          className="vpAdvancedCloseButton"
          type="button"
          aria-label="Fechar"
          onClick={onClose}
        >
          <CloseIcon />
        </button>
      ) : null}

      {activeMetric === 'tide' ? (
        <TideDetailView
          placeName={selectedPlaceName}
          onBack={() => setActiveMetric(null)}
        />
      ) : activeMetric === 'wind' ? (
        <WindDetailView
          placeName={selectedPlaceName}
          onBack={() => setActiveMetric(null)}
        />
      ) : (
        <main className="vpAdvancedPanelShell">
          <button
            type="button"
            className="vpAdvancedBackButton"
            aria-label="Voltar"
            onClick={onBack}
          >
            <BackIcon />
          </button>

          <SelectedPointCard placeName={selectedPlaceName} />

          <IntroCard />

          <section className="vpAdvancedDataGrid" aria-label="Dados avançados">
            {metrics.map((item) => (
              <MetricButton
                key={item.id}
                item={item}
                onOpen={openMetric}
              />
            ))}
          </section>
        </main>
      )}

      <style jsx global>{`
        .vpAdvancedPreview {
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

        .vpAdvancedCloseButton {
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

        .vpAdvancedCloseButton svg {
          width: 25px;
          height: 25px;
        }

        .vpAdvancedBackButton,
        .vpTideBackButton {
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

        .vpAdvancedBackButton {
          position: absolute;
          top: 16px;
          left: 16px;
          z-index: 2;
          width: 44px;
          height: 44px;
        }

        .vpAdvancedBackButton svg,
        .vpTideBackButton svg {
          width: 25px;
          height: 25px;
        }

        .vpAdvancedPanelShell {
          position: relative;
          width: min(100vw, 460px);
          height: 100dvh;
          margin: 0 auto;
          padding:
            max(10px, env(safe-area-inset-top))
            12px
            max(10px, env(safe-area-inset-bottom));
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
          gap: 7px;
        }

        .vpAdvancedCard,
        .vpAdvancedDataTile {
          background:
            linear-gradient(
              135deg,
              rgba(23, 31, 42, 0.88),
              rgba(10, 16, 23, 0.94)
            );
          border: 1px solid rgba(148, 163, 184, 0.2);
          box-shadow:
            inset 0 1px 0 rgba(255, 255, 255, 0.035),
            0 14px 34px rgba(0, 0, 0, 0.18);
          backdrop-filter: blur(14px);
        }

        .vpAdvancedPlaceBlock {
          flex: 0 0 auto;
          border-radius: 18px;
          min-height: 64px;
          display: grid;
          grid-template-columns: auto minmax(0, 1fr) auto;
          align-items: center;
          gap: 10px;
          padding: 9px 11px 9px 54px;
          box-sizing: border-box;
        }

        .vpAdvancedPlaceIcon {
          width: 42px;
          height: 42px;
          border-radius: 999px;
          color: #38bdf8;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(14, 165, 233, 0.12);
          box-shadow: 0 0 22px rgba(14, 165, 233, 0.18);
        }

        .vpAdvancedPlaceIcon svg {
          width: 27px;
          height: 27px;
        }

        .vpAdvancedPlaceText {
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 1px;
        }

        .vpAdvancedPlaceText span {
          color: rgba(226, 232, 240, 0.72);
          font-size: 11px;
          line-height: 1;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          font-weight: 520;
        }

        .vpAdvancedPlaceText strong {
          color: #38bdf8;
          font-size: clamp(17px, 4.7vw, 21px);
          line-height: 1.15;
          font-weight: 650;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .vpAdvancedHeaderScore {
          color: #7dd3fc;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 0;
          box-sizing: border-box;
          text-align: center;
        }

        .vpAdvancedHeaderScore span {
          color: rgba(186, 230, 253, 0.78);
          font-size: 9px;
          line-height: 1;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          font-weight: 720;
        }

        .vpAdvancedHeaderScore strong {
          margin-top: 2px;
          color: #38bdf8;
          font-size: 22px;
          line-height: 0.95;
          font-weight: 780;
          letter-spacing: -0.04em;
        }

        .vpAdvancedIntroBlock {
          flex: 0 0 auto;
          border-radius: 18px;
          min-height: 82px;
          display: grid;
          grid-template-columns: auto minmax(0, 1fr);
          align-items: center;
          gap: 12px;
          padding: 11px 13px;
          box-sizing: border-box;
        }

        .vpAdvancedIntroIcon {
          width: 42px;
          height: 42px;
          border-radius: 14px;
          color: #7dd3fc;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(14, 165, 233, 0.12);
        }

        .vpAdvancedIntroIcon svg {
          width: 27px;
          height: 27px;
        }

        .vpAdvancedIntroText {
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .vpAdvancedIntroText span {
          color: rgba(226, 232, 240, 0.72);
          font-size: 11px;
          line-height: 1;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          font-weight: 620;
        }

        .vpAdvancedIntroText strong {
          color: #ffffff;
          font-size: clamp(19px, 4.8vw, 23px);
          line-height: 1.08;
          font-weight: 680;
          letter-spacing: -0.02em;
        }

        .vpAdvancedIntroText small {
          color: rgba(226, 232, 240, 0.72);
          font-size: clamp(11px, 3vw, 13px);
          line-height: 1.2;
          font-weight: 450;
        }

        .vpAdvancedDataGrid {
          flex: 1 1 auto;
          min-height: 0;
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          grid-template-rows: repeat(4, minmax(0, 1fr));
          gap: 7px;
        }

        .vpAdvancedDataTile {
          min-height: 0;
          width: 100%;
          border-radius: 16px;
          display: grid;
          grid-template-columns: auto minmax(0, 1fr) auto;
          align-items: center;
          gap: 9px;
          padding: 8px 10px;
          box-sizing: border-box;
          color: inherit;
          text-align: left;
          cursor: pointer;
          appearance: none;
          transition:
            border-color 160ms ease,
            background 160ms ease,
            transform 160ms ease,
            box-shadow 160ms ease;
        }

        .vpAdvancedDataTile:hover {
          border-color: rgba(125, 211, 252, 0.34);
          background:
            linear-gradient(
              135deg,
              rgba(23, 39, 54, 0.9),
              rgba(10, 20, 30, 0.96)
            );
          box-shadow:
            inset 0 1px 0 rgba(255, 255, 255, 0.045),
            0 16px 38px rgba(0, 0, 0, 0.22),
            0 0 18px rgba(14, 165, 233, 0.08);
        }

        .vpAdvancedDataTile:active {
          transform: scale(0.985);
        }

        .vpAdvancedTileIcon {
          color: #e0f2fe;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .vpAdvancedTileIcon svg {
          width: clamp(27px, 7.7vw, 35px);
          height: clamp(27px, 7.7vw, 35px);
          display: block;
        }

        .vpAdvancedTileText {
          min-width: 0;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          justify-content: center;
          gap: 2px;
        }

        .vpAdvancedTileText span {
          color: rgba(226, 232, 240, 0.72);
          font-size: 11.5px;
          line-height: 1.05;
          font-weight: 620;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .vpAdvancedTileText strong {
          color: #ffffff;
          font-size: clamp(18px, 4.55vw, 23px);
          line-height: 1.08;
          font-weight: 680;
          letter-spacing: -0.02em;
        }

        .vpAdvancedTileText.isTitleOnly strong {
          font-size: clamp(18px, 4.35vw, 21px);
          line-height: 1.05;
          letter-spacing: 0.03em;
        }

        .vpAdvancedTileText small {
          color: rgba(226, 232, 240, 0.68);
          font-size: 12px;
          line-height: 1.2;
          font-weight: 400;
        }

        .vpAdvancedTileChevron {
          width: 24px;
          height: 24px;
          color: rgba(255, 255, 255, 0.68);
        }

        .vpTidePanelShell {
          width: min(100vw, 460px);
          height: 100dvh;
          margin: 0 auto;
          padding:
            max(10px, env(safe-area-inset-top))
            10px
            max(10px, env(safe-area-inset-bottom));
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
          gap: 9px;
          overflow: hidden;
        }

        .vpTideTopBar {
          flex: 0 0 36px;
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 0 2px;
        }

        .vpTideBackButton {
          width: 40px;
          height: 40px;
          flex: 0 0 auto;
        }

        .vpTideTopBar > span {
          color: rgba(248, 250, 252, 0.94);
          font-size: 12px;
          line-height: 1;
          font-weight: 720;
          letter-spacing: 0.06em;
        }

        .vpTidePanelShell .vpAdvancedPlaceBlock {
          min-height: 66px;
          padding-left: 12px;
        }

        .vpTideTitleCard {
          flex: 0 0 auto;
          min-height: 96px;
          border-radius: 16px;
          display: grid;
          grid-template-columns: auto minmax(0, 1fr);
          align-items: center;
          gap: 13px;
          padding: 13px;
          box-sizing: border-box;
        }

        .vpTideTitleIcon {
          width: 58px;
          height: 58px;
          border-radius: 14px;
          border: 1px solid rgba(56, 189, 248, 0.32);
          background: rgba(14, 165, 233, 0.07);
          color: #7dd3fc;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .vpTideTitleIcon svg {
          width: 38px;
          height: 38px;
        }

        .vpTideTitleText {
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 3px;
        }

        .vpTideTitleText span,
        .vpTideSummaryText span,
        .vpTideVariationText span {
          color: rgba(226, 232, 240, 0.68);
          font-size: 10px;
          line-height: 1;
          font-weight: 620;
          letter-spacing: 0.07em;
        }

        .vpTideTitleText strong {
          color: #ffffff;
          font-size: 26px;
          line-height: 1;
          font-weight: 760;
          letter-spacing: 0.02em;
        }

        .vpTideTitleText small {
          color: rgba(226, 232, 240, 0.7);
          font-size: 12px;
          line-height: 1.25;
        }

        .vpTideChartCard {
          position: relative;
          flex: 1 1 auto;
          min-height: 0;
          border-radius: 16px;
          padding: 12px 10px 10px;
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .vpTideSituation {
          flex: 0 0 auto;
          display: flex;
          align-items: center;
          gap: 7px;
          color: rgba(226, 232, 240, 0.74);
        }

        .vpTideSituation svg {
          width: 18px;
          height: 18px;
          color: #7dd3fc;
        }

        .vpTideSituation span {
          font-size: 10px;
          line-height: 1;
          font-weight: 620;
          letter-spacing: 0.05em;
        }

        .vpTideSituation strong {
          color: #38bdf8;
          font-weight: 760;
        }

        .vpTideChartWrap {
          flex: 1 1 auto;
          min-height: 0;
          margin-top: 7px;
          overflow-x: hidden;
          overflow-y: hidden;
          overscroll-behavior-x: contain;
          scrollbar-width: thin;
          scrollbar-color: rgba(56, 189, 248, 0.34) transparent;
        }

        .vpTideChartWrap::-webkit-scrollbar {
          height: 5px;
        }

        .vpTideChartWrap::-webkit-scrollbar-track {
          background: transparent;
        }

        .vpTideChartWrap::-webkit-scrollbar-thumb {
          border-radius: 999px;
          background: rgba(56, 189, 248, 0.34);
        }

        .vpTideChart {
          width: 100%;
          height: 100%;
          min-height: 175px;
          display: block;
          overflow: visible;
        }

        .vpTideGrid line {
          stroke: rgba(148, 163, 184, 0.12);
          stroke-width: 1;
          stroke-dasharray: 3 5;
        }

        .vpTideArea {
          fill: url(#vpTideFill);
        }

        .vpWindArea {
          fill: url(#vpWindFill);
        }

        .vpTideLine {
          fill: none;
          stroke: rgba(224, 242, 254, 0.96);
          stroke-width: 3;
          stroke-linecap: round;
          filter: url(#vpTideGlow);
        }

        .vpWindLine {
          fill: none;
          stroke: rgba(224, 242, 254, 0.96);
          stroke-width: 3;
          stroke-linecap: round;
          filter: url(#vpWindGlow);
        }

        .vpTideMarker line {
          stroke: rgba(125, 211, 252, 0.55);
          stroke-width: 1.5;
          stroke-dasharray: 5 5;
        }

        .vpTideMarker circle {
          fill: #dff7ff;
          stroke: rgba(56, 189, 248, 0.4);
          stroke-width: 2;
        }

        .vpTideMarker text {
          fill: rgba(248, 250, 252, 0.94);
          font-size: 16px;
          font-weight: 680;
        }

        .vpTideMarker.isCurrent line {
          stroke: #38bdf8;
        }

        .vpTideMarker.isCurrent circle {
          fill: #38bdf8;
          stroke: #bae6fd;
          stroke-width: 3;
          filter: drop-shadow(0 0 8px rgba(56, 189, 248, 0.9));
        }

        .vpWindBars rect {
          fill: rgba(125, 211, 252, 0.12);
          stroke: rgba(125, 211, 252, 0.2);
          stroke-width: 1;
        }

        .vpWindTitleIcon {
          color: #bae6fd;
        }

        .vpWindSituation strong,
        .vpWindSummaryCard .isEmphasis {
          color: #7dd3fc;
        }

        .vpTideYAxis text,
        .vpTideXAxis text {
          fill: rgba(226, 232, 240, 0.78);
          font-size: 14px;
          font-weight: 560;
        }

        .vpTideAxisLabel {
          position: absolute;
          top: 43px;
          left: 11px;
          color: rgba(226, 232, 240, 0.72);
          font-size: 11px;
          line-height: 1;
          font-weight: 560;
        }

        .vpTideSummaryGrid {
          flex: 0 0 auto;
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 7px;
        }

        .vpTideSummaryCard {
          min-height: 74px;
          border-radius: 14px;
          display: grid;
          grid-template-columns: auto minmax(0, 1fr);
          align-items: center;
          gap: 8px;
          padding: 9px;
          box-sizing: border-box;
        }

        .vpTideSummaryIcon {
          color: #7dd3fc;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .vpTideSummaryIcon svg {
          width: 32px;
          height: 32px;
        }

        .vpTideSummaryText {
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .vpTideSummaryText strong {
          color: #ffffff;
          font-size: 15px;
          line-height: 1.1;
          font-weight: 660;
          white-space: nowrap;
        }

        .vpTideSummaryText strong.isEmphasis {
          color: #38bdf8;
        }

        .vpTideVariationCard {
          flex: 0 0 auto;
          min-height: 62px;
          border-radius: 14px;
          display: grid;
          grid-template-columns: auto minmax(0, 1fr);
          align-items: center;
          gap: 10px;
          padding: 10px 12px;
          box-sizing: border-box;
        }

        .vpTideVariationIcon {
          color: #7dd3fc;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .vpTideVariationIcon svg {
          width: 32px;
          height: 32px;
        }

        .vpTideVariationText {
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .vpTideVariationText strong {
          color: rgba(248, 250, 252, 0.9);
          font-size: 13px;
          line-height: 1.2;
          font-weight: 520;
        }

        .vpAdvancedPlaceIcon svg,
        .vpAdvancedIntroIcon svg,
        .vpAdvancedTileIcon svg,
        .vpAdvancedTileChevron,
        .vpAdvancedCloseButton svg,
        .vpAdvancedBackButton svg,
        .vpTideBackButton svg,
        .vpTideTitleIcon svg,
        .vpTideSituation svg,
        .vpTideSummaryIcon svg,
        .vpTideVariationIcon svg,
        .vpWindTitleIcon svg,
        .vpWindSituation svg,
        .vpWindSummaryIcon svg,
        .vpWindVariationIcon svg {
          fill: none;
          stroke: currentColor;
          stroke-width: 3;
          stroke-linecap: round;
          stroke-linejoin: round;
        }

        @media (max-width: 390px) {
          .vpAdvancedPanelShell {
            gap: 6px;
            padding-left: 10px;
            padding-right: 10px;
          }

          .vpAdvancedBackButton {
            top: 10px;
            left: 10px;
          }

          .vpAdvancedPlaceBlock {
            min-height: 58px;
            padding: 7px 9px 7px 50px;
          }

          .vpAdvancedPlaceIcon {
            width: 36px;
            height: 36px;
          }

          .vpAdvancedPlaceIcon svg {
            width: 23px;
            height: 23px;
          }

          .vpAdvancedIntroBlock {
            min-height: 76px;
            gap: 9px;
            padding: 9px;
          }

          .vpAdvancedIntroIcon {
            width: 36px;
            height: 36px;
            border-radius: 13px;
          }

          .vpAdvancedIntroIcon svg {
            width: 23px;
            height: 23px;
          }

          .vpAdvancedIntroText strong {
            font-size: 18px;
          }

          .vpAdvancedIntroText small {
            font-size: 11px;
          }

          .vpAdvancedHeaderScore strong {
            font-size: 20px;
          }

          .vpAdvancedDataGrid {
            gap: 6px;
          }

          .vpAdvancedDataTile {
            padding: 7px 8px;
          }

          .vpAdvancedTileText strong {
            font-size: 18px;
          }

          .vpAdvancedTileChevron {
            width: 20px;
            height: 20px;
          }

          .vpTidePanelShell {
            gap: 7px;
            padding-left: 8px;
            padding-right: 8px;
          }

          .vpTideTopBar {
            flex-basis: 34px;
          }

          .vpTidePanelShell .vpAdvancedPlaceBlock {
            min-height: 58px;
            padding-left: 9px;
          }

          .vpTideTitleCard {
            min-height: 84px;
            padding: 10px;
          }

          .vpTideTitleIcon {
            width: 48px;
            height: 48px;
          }

          .vpTideTitleIcon svg {
            width: 31px;
            height: 31px;
          }

          .vpTideTitleText strong {
            font-size: 23px;
          }

          .vpTideTitleText small {
            font-size: 11px;
          }

          .vpTideChartCard {
            padding: 10px 7px 7px;
          }

          .vpTideSummaryCard {
            min-height: 68px;
            padding: 7px;
          }

          .vpTideSummaryIcon svg {
            width: 28px;
            height: 28px;
          }

          .vpTideSummaryText span {
            font-size: 8.5px;
          }

          .vpTideSummaryText strong {
            font-size: 13px;
          }

          .vpTideVariationCard {
            min-height: 56px;
            padding: 8px 10px;
          }

          .vpTideVariationIcon svg {
            width: 28px;
            height: 28px;
          }

          .vpTideVariationText strong {
            font-size: 12px;
          }
        }

        @media (orientation: portrait) and (max-width: 767px) {
          .vpTideChartCard {
            overflow: hidden;
          }

          .vpTideChartWrap {
            width: 100%;
            min-width: 0;
            overflow-x: auto;
            overflow-y: hidden;
            padding-bottom: 6px;
            touch-action: pan-x;
            -webkit-overflow-scrolling: touch;
            overscroll-behavior-x: contain;
            scrollbar-width: thin;
            scrollbar-color: rgba(56, 189, 248, 0.42) transparent;
          }

          .vpTideChartWrap::-webkit-scrollbar {
            height: 6px;
          }

          .vpTideChartWrap::-webkit-scrollbar-track {
            background: transparent;
          }

          .vpTideChartWrap::-webkit-scrollbar-thumb {
            border-radius: 999px;
            background: rgba(56, 189, 248, 0.42);
          }

          .vpTideChart {
            width: 920px;
            min-width: 920px;
            max-width: none;
            height: 100%;
            min-height: 210px;
          }

          .vpTideMarker text {
            font-size: 19px;
            font-weight: 720;
          }

          .vpTideYAxis text,
          .vpTideXAxis text {
            font-size: 17px;
            font-weight: 620;
          }

          .vpTideAxisLabel {
            font-size: 12px;
            font-weight: 620;
          }
        }

        @media (orientation: landscape) and (max-width: 767px) {
          .vpTidePanelShell {
            width: 100vw;
            height: 100dvh;
            max-width: none;
            display: grid;
            grid-template-columns: minmax(0, 2.15fr) minmax(230px, 0.85fr);
            grid-template-rows: 42px 70px minmax(0, 1fr);
            gap: 8px;
            padding:
              max(6px, env(safe-area-inset-top))
              max(8px, env(safe-area-inset-right))
              max(6px, env(safe-area-inset-bottom))
              max(8px, env(safe-area-inset-left));
          }

          .vpTideTopBar {
            grid-column: 1 / -1;
            grid-row: 1;
            min-height: 0;
          }

          .vpTidePanelShell .vpAdvancedPlaceBlock {
            grid-column: 1;
            grid-row: 2;
            min-height: 0;
          }

          .vpTideTitleCard {
            grid-column: 2;
            grid-row: 2;
            min-height: 0;
            padding: 7px 9px;
          }

          .vpTideTitleIcon {
            width: 42px;
            height: 42px;
          }

          .vpTideTitleIcon svg {
            width: 27px;
            height: 27px;
          }

          .vpTideTitleText strong {
            font-size: 20px;
          }

          .vpTideTitleText small {
            display: none;
          }

          .vpTideChartCard {
            grid-column: 1;
            grid-row: 3;
            min-height: 0;
          }

          .vpTideChart {
            min-height: 0;
          }

          .vpTideSummaryGrid {
            grid-column: 2;
            grid-row: 3;
            grid-template-columns: 1fr;
            grid-template-rows: repeat(4, minmax(0, 1fr));
            min-height: 0;
            gap: 6px;
          }

          .vpTideSummaryCard {
            min-height: 0;
            padding: 6px 8px;
          }

          .vpTideSummaryIcon svg {
            width: 25px;
            height: 25px;
          }

          .vpTideSummaryText strong {
            font-size: 12px;
          }

          .vpTideVariationCard {
            display: none;
          }
        }

        @media (min-width: 768px) {
          .vpAdvancedPreview {
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

          .vpAdvancedCloseButton {
            position: absolute;
            top: max(24px, calc(50% - 410px));
            left: calc(50% + min(43vw, 460px) + 12px);
            right: auto;
          }

          .vpAdvancedPanelShell {
            width: min(86vw, 920px);
            height: auto;
            max-height: min(92dvh, 820px);
            padding: 14px;
            display: grid;
            grid-template-columns: 1fr 1fr;
            grid-template-rows: auto auto auto;
            gap: 16px;
            background: rgba(3, 10, 18, 0.82);
            border: 1px solid rgba(148, 163, 184, 0.14);
            border-radius: 28px;
            box-shadow: 0 24px 80px rgba(0, 0, 0, 0.34);
            backdrop-filter: blur(6px);
          }

          .vpAdvancedBackButton {
            top: 18px;
            left: 18px;
          }

          .vpAdvancedCard,
          .vpAdvancedDataTile {
            background: rgba(10, 18, 30, 0.82);
            border: 1px solid rgba(148, 163, 184, 0.18);
          }

          .vpAdvancedPlaceBlock {
            grid-column: 1 / -1;
            min-height: 78px;
            padding: 14px 18px 14px 58px;
          }

          .vpAdvancedIntroBlock {
            grid-column: 1 / -1;
            min-height: 96px;
            padding: 16px 18px;
          }

          .vpAdvancedIntroIcon {
            width: 50px;
            height: 50px;
            border-radius: 16px;
          }

          .vpAdvancedIntroIcon svg {
            width: 31px;
            height: 31px;
          }

          .vpAdvancedIntroText span {
            font-size: 12px;
          }

          .vpAdvancedIntroText strong {
            font-size: 25px;
          }

          .vpAdvancedIntroText small {
            font-size: 14px;
          }

          .vpAdvancedHeaderScore strong {
            font-size: 24px;
          }

          .vpAdvancedDataGrid {
            grid-column: 1 / -1;
            grid-template-columns: repeat(4, minmax(0, 1fr));
            grid-template-rows: repeat(2, 126px);
            gap: 14px;
          }

          .vpAdvancedDataTile {
            border-radius: 18px;
            padding: 14px;
          }

          .vpAdvancedTileIcon svg {
            width: 32px;
            height: 32px;
          }

          .vpAdvancedTileText span {
            font-size: 12px;
          }

          .vpAdvancedTileText strong {
            font-size: 20px;
          }

          .vpAdvancedTileText.isTitleOnly strong {
            font-size: 20px;
          }

          .vpAdvancedTileChevron {
            width: 25px;
            height: 25px;
          }

          .vpTidePanelShell {
            width: min(92vw, 1120px);
            height: min(92dvh, 850px);
            padding: 16px;
            gap: 12px;
            display: grid;
            grid-template-columns: repeat(4, minmax(0, 1fr));
            grid-template-rows: 40px 84px 104px minmax(280px, 1fr) 96px 76px;
            background: rgba(3, 10, 18, 0.88);
            border: 1px solid rgba(148, 163, 184, 0.14);
            border-radius: 28px;
            box-shadow: 0 24px 80px rgba(0, 0, 0, 0.34);
            backdrop-filter: blur(6px);
          }

          .vpTideTopBar {
            grid-column: 1 / -1;
            grid-row: 1;
            min-height: 0;
          }

          .vpTidePanelShell .vpAdvancedPlaceBlock {
            grid-column: 1 / -1;
            grid-row: 2;
            min-height: 0;
            padding-left: 14px;
          }

          .vpTideTitleCard {
            grid-column: 1 / -1;
            grid-row: 3;
            min-height: 0;
            padding: 15px 18px;
          }

          .vpTideTitleIcon {
            width: 64px;
            height: 64px;
          }

          .vpTideTitleIcon svg {
            width: 40px;
            height: 40px;
          }

          .vpTideTitleText span {
            font-size: 11px;
          }

          .vpTideTitleText strong {
            font-size: 28px;
          }

          .vpTideTitleText small {
            font-size: 13px;
          }

          .vpTideChartCard {
            grid-column: 1 / -1;
            grid-row: 4;
            min-height: 0;
            padding: 16px 18px 12px;
          }

          .vpTideSituation span {
            font-size: 11px;
          }

          .vpTideChartWrap {
            overflow-x: hidden;
            padding-bottom: 0;
          }

          .vpTideChart {
            width: 100%;
            max-width: none;
            min-height: 255px;
          }

          .vpTideAxisLabel {
            top: 50px;
            left: 18px;
            font-size: 10px;
          }

          .vpTideSummaryGrid {
            grid-column: 1 / -1;
            grid-row: 5;
            grid-template-columns: repeat(4, minmax(0, 1fr));
            gap: 12px;
          }

          .vpTideSummaryCard {
            min-height: 0;
            padding: 12px;
          }

          .vpTideSummaryIcon svg {
            width: 38px;
            height: 38px;
          }

          .vpTideSummaryText span {
            font-size: 10px;
          }

          .vpTideSummaryText strong {
            font-size: 18px;
          }

          .vpTideVariationCard {
            grid-column: 1 / -1;
            grid-row: 6;
            min-height: 0;
            padding: 12px 18px;
          }

          .vpTideVariationIcon svg {
            width: 40px;
            height: 40px;
          }

          .vpTideVariationText span {
            font-size: 10px;
          }

          .vpTideVariationText strong {
            font-size: 15px;
          }
        }

        @media (orientation: landscape) and (max-height: 500px) {
          .vpAdvancedPreview {
            padding: 0;
            align-items: stretch;
            justify-content: stretch;
            background:
              radial-gradient(circle at 50% 8%, rgba(14, 116, 144, 0.17), transparent 34%),
              linear-gradient(180deg, #07101a 0%, #050a0f 100%);
          }

          .vpTidePanelShell {
            width: 100vw;
            max-width: none;
            height: 100dvh;
            max-height: none;
            margin: 0;
            padding:
              max(5px, env(safe-area-inset-top))
              max(8px, env(safe-area-inset-right))
              max(5px, env(safe-area-inset-bottom))
              max(8px, env(safe-area-inset-left));
            border: 0;
            border-radius: 0;
            display: grid;
            grid-template-columns: minmax(0, 1fr) 210px;
            grid-template-rows: 38px minmax(0, 1fr);
            gap: 7px;
            overflow: hidden;
          }

          .vpTideTopBar {
            grid-column: 1 / -1;
            grid-row: 1;
            min-height: 0;
            height: 38px;
            padding: 0;
            position: relative;
            z-index: 5;
          }

          .vpTideBackButton {
            width: 38px;
            height: 38px;
          }

          .vpTideBackButton svg {
            width: 25px;
            height: 25px;
          }

          .vpTideTopBar > span {
            font-size: 13px;
            font-weight: 760;
            letter-spacing: 0.07em;
          }

          .vpTidePanelShell > .vpAdvancedPlaceBlock,
          .vpTideTitleCard,
          .vpTideVariationCard {
            display: none;
          }

          .vpTideChartCard {
            grid-column: 1;
            grid-row: 2;
            min-width: 0;
            min-height: 0;
            padding: 9px 10px 6px;
            border-radius: 14px;
          }

          .vpTideSituation {
            min-height: 20px;
          }

          .vpTideSituation span {
            font-size: 13px;
            font-weight: 680;
          }

          .vpTideChartWrap {
            min-width: 0;
            min-height: 0;
            overflow-x: hidden;
            overflow-y: hidden;
            margin-top: 3px;
            padding-bottom: 0;
          }

          .vpTideChart {
            width: 100%;
            height: 100%;
            min-height: 0;
            max-width: none;
          }

          .vpTideMarker text {
            font-size: 17px;
            font-weight: 700;
          }

          .vpTideYAxis text,
          .vpTideXAxis text {
            font-size: 15px;
            font-weight: 620;
          }

          .vpTideAxisLabel {
            top: 35px;
            left: 10px;
            font-size: 11px;
            font-weight: 620;
          }

          .vpTideSummaryGrid {
            grid-column: 2;
            grid-row: 2;
            min-width: 0;
            min-height: 0;
            display: grid;
            grid-template-columns: 1fr;
            grid-template-rows: repeat(4, minmax(0, 1fr));
            gap: 6px;
          }

          .vpTideSummaryCard {
            min-width: 0;
            min-height: 0;
            border-radius: 12px;
            padding: 7px 10px;
            gap: 10px;
          }

          .vpTideSummaryIcon svg {
            width: 31px;
            height: 31px;
          }

          .vpTideSummaryText {
            gap: 4px;
          }

          .vpTideSummaryText span {
            font-size: 10px;
            font-weight: 680;
            letter-spacing: 0.07em;
          }

          .vpTideSummaryText strong {
            font-size: 15px;
            font-weight: 700;
          }
        }
      `}</style>
    </section>
  );
}

