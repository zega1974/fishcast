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

type WeatherSummaryItem = {
  icon: React.ReactNode;
  label: string;
  value: string;
  emphasis?: boolean;
};

type SwellSummaryItem = {
  icon: React.ReactNode;
  label: string;
  value: string;
  emphasis?: boolean;
};

type AirTempSummaryItem = {
  icon: React.ReactNode;
  label: string;
  value: string;
  emphasis?: boolean;
};

type WaterTempSummaryItem = {
  icon: React.ReactNode;
  label: string;
  value: string;
  emphasis?: boolean;
};

type PressureSummaryItem = {
  icon: React.ReactNode;
  label: string;
  value: string;
  emphasis?: boolean;
};

type SunMoonSummaryItem = {
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

function CloudIcon(props: IconProps) {
  return (
    <SvgBase {...props}>
      <path d="M15 31h19a8 8 0 0 0 1-16 11 11 0 0 0-21 4 6 6 0 0 0 1 12Z" />
      <path d="M15 37h18" />
    </SvgBase>
  );
}

function VisibilityIcon(props: IconProps) {
  return (
    <SvgBase {...props}>
      <path d="M5 24s7-12 19-12 19 12 19 12-7 12-19 12S5 24 5 24Z" />
      <circle cx="24" cy="24" r="6" />
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

type ChartPoint = {
  x: number;
  y: number;
};

function createSmoothPath(points: ChartPoint[]) {
  if (points.length === 0) {
    return '';
  }

  if (points.length === 1) {
    return `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;
  }

  const commands = [`M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`];

  for (let index = 0; index < points.length - 1; index += 1) {
    const p0 = points[index - 1] ?? points[index];
    const p1 = points[index];
    const p2 = points[index + 1];
    const p3 = points[index + 2] ?? p2;

    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = p2.y - (p3.y - p1.y) / 6;

    commands.push(
      `C ${c1x.toFixed(1)} ${c1y.toFixed(1)} ${c2x.toFixed(1)} ${c2y.toFixed(1)} ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`
    );
  }

  return commands.join(' ');
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
  const chartLeft = 90;
  const chartRight = 890;
  const chartTop = 30;
  const chartBottom = 245;
  const tideMax = 1.6;

  const tideMainPoints = [
    {
      key: 'lowMorning',
      kind: 'major',
      hour: 5 + 18 / 60,
      height: 0.3,
      labelHour: '05h18',
      labelHeight: '0,3 m',
    },
    {
      key: 'current',
      kind: 'current',
      hour: 11 + 24 / 60,
      height: 0.9,
      labelHour: '11h24',
      labelHeight: '0,9 m',
    },
    {
      key: 'highAfternoon',
      kind: 'major',
      hour: 16 + 42 / 60,
      height: 1.4,
      labelHour: '16h42',
      labelHeight: '1,4 m',
    },
    {
      key: 'lowNight',
      kind: 'major',
      hour: 22 + 18 / 60,
      height: 0.3,
      labelHour: '22h18',
      labelHeight: '0,3 m',
    },
  ] as const;

  const toX = (hour: number) =>
    chartLeft + (hour / 24) * (chartRight - chartLeft);

  const toY = (height: number) =>
    chartBottom - (height / tideMax) * (chartBottom - chartTop);

  const formatHour = (hour: number) => {
    const normalized = ((hour % 24) + 24) % 24;
    const h = Math.floor(normalized);
    const m = Math.round((normalized - h) * 60);

    if (m === 60) {
      return `${String((h + 1) % 24).padStart(2, '0')}h`;
    }

    if (m === 0) {
      return `${String(h).padStart(2, '0')}h`;
    }

    return `${String(h).padStart(2, '0')}h${String(m).padStart(2, '0')}`;
  };

  const formatHeight = (height: number) =>
    `${height.toFixed(1).replace('.', ',')} m`;

  const getInterpolatedTideHeight = (hour: number) => {
    for (let index = 0; index < tideMainPoints.length; index += 1) {
      const point = tideMainPoints[index];
      const nextPoint = tideMainPoints[(index + 1) % tideMainPoints.length];
      const startHour = point.hour;
      const endHour =
        nextPoint.hour <= startHour ? nextPoint.hour + 24 : nextPoint.hour;
      const testHour = hour < startHour ? hour + 24 : hour;

      if (testHour >= startHour && testHour <= endHour) {
        const progress = (testHour - startHour) / (endHour - startHour);
        return point.height + (nextPoint.height - point.height) * progress;
      }
    }

    return tideMainPoints[0].height;
  };

  const tideAuxiliaryPoints = tideMainPoints.map((point, index) => {
    const nextPoint = tideMainPoints[(index + 1) % tideMainPoints.length];
    const nextHour =
      nextPoint.hour <= point.hour ? nextPoint.hour + 24 : nextPoint.hour;
    const midHourRaw = (point.hour + nextHour) / 2;
    const midHour = midHourRaw % 24;
    const midHeight = (point.height + nextPoint.height) / 2;

    return {
      key: `aux-${point.key}-${nextPoint.key}`,
      kind: 'secondary',
      hour: midHour,
      height: midHeight,
      labelHour: formatHour(midHour),
      labelHeight: formatHeight(midHeight),
    };
  });

  const tideMarkers = [...tideMainPoints, ...tideAuxiliaryPoints]
    .slice()
    .sort((a, b) => a.hour - b.hour);

  const curveHours = [
    0,
    ...tideMarkers.map((point) => point.hour),
    24,
  ];

  const curvePoints = curveHours.map((hour) => ({
    x: toX(hour),
    y: toY(getInterpolatedTideHeight(hour === 24 ? 0 : hour)),
  }));

  const curvePath = createSmoothPath(curvePoints);
  const areaPath = `${curvePath} L ${toX(24).toFixed(1)} ${chartBottom} L ${toX(0).toFixed(1)} ${chartBottom} Z`;

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
          aria-label="GrÃ¡fico de altura da marÃ© ao longo de 24 horas"
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

          <path className="vpTideArea" d={areaPath} />
          <path className="vpTideLine" d={curvePath} />

          {tideMarkers.map((point) => {
            const x = toX(point.hour);
            const y = toY(point.height);
            const isCurrent = point.kind === 'current';
            const isMajor = point.kind === 'major';
            const isSecondary = point.kind === 'secondary';

            const className = isCurrent
              ? 'vpTideMarker isCurrent'
              : isSecondary
                ? 'vpTideMarker isSecondary'
                : 'vpTideMarker';

            const textAbove = y > 78 || isMajor || isCurrent;
            const textGap = isMajor || isCurrent ? 28 : 25;
            const textY1 = textAbove ? y - textGap : y + 29;
            const textY2 = textAbove ? y - (isMajor || isCurrent ? 11 : 9) : y + 45;

            return (
              <g className={className} key={point.key}>
                <line x1={x} y1={y} x2={x} y2={chartBottom} />
                <circle cx={x} cy={y} r={isCurrent ? 7 : isMajor ? 6 : 4} />
                <text x={x} y={textY1} textAnchor="middle">
                  {point.labelHour}
                </text>
                <text x={x} y={textY2} textAnchor="middle">
                  {point.labelHeight}
                </text>
              </g>
            );
          })}

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
  const chartLeft = 90;
  const chartRight = 890;
  const chartTop = 30;
  const chartBottom = 245;
  const yAxisLabelY = [35, 90, 145, 200, 250];

  const windHourlyData = [
    { hour: 0, label: '00h', speed: 10, direction: 'N' },
    { hour: 3, label: '03h', speed: 6, direction: 'NE' },
    { hour: 6, label: '06h', speed: 8, direction: 'NE' },
    { hour: 9, label: '09h', speed: 11, direction: 'E' },
    { hour: 12, label: '12h', speed: 8, direction: 'NE', current: true },
    { hour: 15, label: '15h', speed: 14, direction: 'E' },
    { hour: 18, label: '18h', speed: 13, direction: 'SE' },
    { hour: 21, label: '21h', speed: 9, direction: 'SE' },
    { hour: 24, label: '24h', speed: 7, direction: 'S' },
  ];

  const highestWind = Math.max(...windHourlyData.map((point) => point.speed));
  const windMax = Math.max(20, Math.ceil((highestWind * 1.25) / 5) * 5);
  const windYAxisValues = [
    windMax,
    windMax * 0.75,
    windMax * 0.5,
    windMax * 0.25,
    0,
  ];

  const toX = (hour: number) =>
    chartLeft + (hour / 24) * (chartRight - chartLeft);

  const toY = (speed: number) =>
    chartBottom - (speed / windMax) * (chartBottom - chartTop);

  const getWindArrow = (direction: string) => {
    switch (direction) {
      case 'N':
        return '↑';
      case 'NE':
        return '↗';
      case 'E':
        return '→';
      case 'SE':
        return '↘';
      case 'S':
        return '↓';
      case 'SW':
        return '↙';
      case 'W':
        return '←';
      case 'NW':
        return '↖';
      default:
        return '•';
    }
  };

  const linePoints = windHourlyData.map((point) => ({
    x: toX(point.hour),
    y: toY(point.speed),
  }));

  const linePath = createSmoothPath(linePoints);
  const areaPath = `${linePath} L ${toX(24).toFixed(1)} ${chartBottom} L ${toX(0).toFixed(1)} ${chartBottom} Z`;
  const markers = windHourlyData;

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
          aria-label="GrÃ¡fico de vento ao longo de 24 horas"
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

          <g className="vpChartBarLabels vpWindBarLabels">
            {windHourlyData.map((point) => {
              const x = toX(point.hour);
              const y = toY(point.speed);

              return (
                <text key={point.label} x={x} y={y - 10} textAnchor="middle">
                  {point.speed} {getWindArrow(point.direction)}
                </text>
              );
            })}
          </g>

          <path className="vpWindArea" d={areaPath} />
          <path className="vpWindLine" d={linePath} />

          {markers.map((point) => {
            const x = toX(point.hour);
            const y = toY(point.speed);

            return (
              <g
                className={`vpTideMarker vpWindMarker${point.current ? ' isCurrent' : ''}`}
                key={point.label}
              >
                <line x1={x} y1={y} x2={x} y2={chartBottom} />
                <circle cx={x} cy={y} r={point.current ? 7 : 6} />
              </g>
            );
          })}

          <g className="vpTideYAxis">
            {windYAxisValues.map((value, index) => (
              <text key={value} x="4" y={yAxisLabelY[index]}>
                {Math.round(value)}
              </text>
            ))}
          </g>

          <g className="vpTideXAxis">
            {windHourlyData.map((point) => (
              <text key={point.label} x={toX(point.hour)} y="265" textAnchor="middle">
                {point.label}
              </text>
            ))}
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

function WeatherTitleCard() {
  return (
    <CardShell className="vpTideTitleCard vpWeatherTitleCard">
      <div className="vpTideTitleIcon vpWeatherTitleIcon">
        <CloudIcon />
      </div>

      <div className="vpTideTitleText">
        <span>DADOS AVANÇADOS</span>
        <strong>CLIMA</strong>
        <small>Chuva, nebulosidade e estabilidade nas próximas horas.</small>
      </div>
    </CardShell>
  );
}

function WeatherChart() {
  const chartLeft = 90;
  const chartRight = 890;
  const chartTop = 30;
  const chartBottom = 245;
  const rainMax = 100;

  const weatherHourlyData = [
    { hour: 0, label: '00h', rainChance: 16 },
    { hour: 3, label: '03h', rainChance: 12 },
    { hour: 6, label: '06h', rainChance: 20 },
    { hour: 9, label: '09h', rainChance: 26 },
    { hour: 12, label: '12h', rainChance: 18, current: true },
    { hour: 15, label: '15h', rainChance: 28 },
    { hour: 18, label: '18h', rainChance: 42 },
    { hour: 21, label: '21h', rainChance: 31 },
    { hour: 24, label: '24h', rainChance: 22 },
  ];

  const toX = (hour: number) =>
    chartLeft + (hour / 24) * (chartRight - chartLeft);

  const toY = (rainChance: number) =>
    chartBottom - (rainChance / rainMax) * (chartBottom - chartTop);

  const linePoints = weatherHourlyData.map((point) => ({
    x: toX(point.hour),
    y: toY(point.rainChance),
  }));

  const linePath = createSmoothPath(linePoints);
  const areaPath = `${linePath} L ${toX(24).toFixed(1)} ${chartBottom} L ${toX(0).toFixed(1)} ${chartBottom} Z`;
  const markers = weatherHourlyData;

  return (
    <CardShell className="vpTideChartCard vpWeatherChartCard">
      <div className="vpTideSituation vpWeatherSituation">
        <CloudIcon />
        <span>
          SITUAÇÃO ATUAL: <strong>PARCIALMENTE NUBLADO</strong>
        </span>
      </div>

      <div className="vpTideChartWrap vpWeatherChartWrap">
        <svg
          className="vpTideChart vpWeatherChart"
          viewBox="0 0 920 270"
          preserveAspectRatio="none"
          role="img"
          aria-label="GrÃ¡fico de chance de chuva ao longo de 24 horas"
        >
          <defs>
            <linearGradient id="vpWeatherFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(125,211,252,0.28)" />
              <stop offset="100%" stopColor="rgba(125,211,252,0.015)" />
            </linearGradient>

            <filter id="vpWeatherGlow" x="-30%" y="-30%" width="160%" height="160%">
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

          <g className="vpChartBarLabels vpWeatherBarLabels">
            {weatherHourlyData.map((point) => {
              const x = toX(point.hour);
              const y = toY(point.rainChance);

              return (
                <text key={point.label} x={x} y={y - 10} textAnchor="middle">
                  {point.rainChance}%
                </text>
              );
            })}
          </g>

          <path className="vpWeatherArea" d={areaPath} />
          <path className="vpWeatherLine" d={linePath} />

          {markers.map((point) => {
            const x = toX(point.hour);
            const y = toY(point.rainChance);

            return (
              <g
                className={`vpTideMarker vpWeatherMarker${point.current ? ' isCurrent' : ''}`}
                key={point.label}
              >
                <line x1={x} y1={y} x2={x} y2={chartBottom} />
                <circle cx={x} cy={y} r={point.current ? 7 : 6} />
              </g>
            );
          })}

          <g className="vpTideYAxis">
            <text x="4" y="35">100</text>
            <text x="4" y="90">75</text>
            <text x="4" y="145">50</text>
            <text x="4" y="200">25</text>
            <text x="4" y="250">0</text>
          </g>

          <g className="vpTideXAxis">
            {weatherHourlyData.map((point) => (
              <text key={point.label} x={toX(point.hour)} y="265" textAnchor="middle">
                {point.label}
              </text>
            ))}
          </g>
        </svg>
      </div>

      <span className="vpTideAxisLabel">Chuva (%)</span>
    </CardShell>
  );
}

function WeatherSummaryCard({ item }: { item: WeatherSummaryItem }) {
  return (
    <CardShell className="vpTideSummaryCard vpWeatherSummaryCard">
      <div className="vpTideSummaryIcon vpWeatherSummaryIcon">{item.icon}</div>

      <div className="vpTideSummaryText">
        <span>{item.label}</span>
        <strong className={item.emphasis ? 'isEmphasis' : ''}>
          {item.value}
        </strong>
      </div>
    </CardShell>
  );
}

function WeatherDetailView({
  placeName,
  onBack,
}: {
  placeName: string;
  onBack: () => void;
}) {
  const summaries: WeatherSummaryItem[] = [
    {
      icon: <CloudIcon />,
      label: 'CLIMA ATUAL',
      value: 'Parcialmente nublado',
      emphasis: true,
    },
    {
      icon: <RainIcon />,
      label: 'CHUVA',
      value: '18%',
    },
    {
      icon: <SunMoonIcon />,
      label: 'NEBULOSIDADE',
      value: '62%',
    },
    {
      icon: <VisibilityIcon />,
      label: 'VISIBILIDADE',
      value: 'Boa',
    },
  ];

  return (
    <main className="vpTidePanelShell vpWeatherPanelShell">
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

      <WeatherTitleCard />

      <WeatherChart />

      <section className="vpTideSummaryGrid vpWeatherSummaryGrid" aria-label="Resumo do clima">
        {summaries.map((item) => (
          <WeatherSummaryCard key={item.label} item={item} />
        ))}
      </section>

      <CardShell className="vpTideVariationCard vpWeatherVariationCard">
        <div className="vpTideVariationIcon vpWeatherVariationIcon">
          <ClockIcon />
        </div>

        <div className="vpTideVariationText">
          <span>JANELA MAIS ESTÁVEL</span>
          <strong>Melhor estabilidade entre 9h e 13h.</strong>
        </div>
      </CardShell>
    </main>
  );
}

function SwellTitleCard() {
  return (
    <CardShell className="vpTideTitleCard vpSwellTitleCard">
      <div className="vpTideTitleIcon vpSwellTitleIcon">
        <WaveIcon />
      </div>

      <div className="vpTideTitleText">
        <span>DADOS AVANÇADOS</span>
        <strong>SWELL</strong>
        <small>Altura, período e direção da ondulação nas próximas horas.</small>
      </div>
    </CardShell>
  );
}

function SwellChart() {
  const chartLeft = 90;
  const chartRight = 890;
  const chartTop = 30;
  const chartBottom = 245;
  const yAxisLabelY = [35, 90, 145, 200, 250];

  const swellHourlyData = [
    { hour: 0, label: '00h', height: 0.5, period: 7 },
    { hour: 3, label: '03h', height: 0.6, period: 7 },
    { hour: 6, label: '06h', height: 0.7, period: 8 },
    { hour: 9, label: '09h', height: 0.8, period: 8 },
    { hour: 12, label: '12h', height: 0.7, period: 8, current: true },
    { hour: 15, label: '15h', height: 0.9, period: 9 },
    { hour: 18, label: '18h', height: 1.0, period: 9 },
    { hour: 21, label: '21h', height: 0.8, period: 8 },
    { hour: 24, label: '24h', height: 0.7, period: 8 },
  ];

  const highestSwell = Math.max(...swellHourlyData.map((point) => point.height));
  const swellMax = Math.max(1.5, Math.ceil(highestSwell * 1.25 * 10) / 10);
  const swellYAxisValues = [
    swellMax,
    swellMax * 0.75,
    swellMax * 0.5,
    swellMax * 0.25,
    0,
  ];

  const toX = (hour: number) =>
    chartLeft + (hour / 24) * (chartRight - chartLeft);

  const toY = (height: number) =>
    chartBottom - (height / swellMax) * (chartBottom - chartTop);

  const formatHeight = (height: number) =>
    `${height.toFixed(1).replace('.', ',')}m`;

  const linePoints = swellHourlyData.map((point) => ({
    x: toX(point.hour),
    y: toY(point.height),
  }));

  const linePath = createSmoothPath(linePoints);
  const areaPath = `${linePath} L ${toX(24).toFixed(1)} ${chartBottom} L ${toX(0).toFixed(1)} ${chartBottom} Z`;
  const markers = swellHourlyData;

  return (
    <CardShell className="vpTideChartCard vpSwellChartCard">
      <div className="vpTideSituation vpSwellSituation">
        <WaveIcon />
        <span>
          SITUAÇÃO ATUAL: <strong>ONDULAÇÃO FRACA A MODERADA DE SE</strong>
        </span>
      </div>

      <div className="vpTideChartWrap vpSwellChartWrap">
        <svg
          className="vpTideChart vpSwellChart"
          viewBox="0 0 920 270"
          preserveAspectRatio="none"
          role="img"
          aria-label="Gráfico de swell ao longo de 24 horas"
        >
          <defs>
            <linearGradient id="vpSwellFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(125,211,252,0.26)" />
              <stop offset="100%" stopColor="rgba(125,211,252,0.015)" />
            </linearGradient>

            <filter id="vpSwellGlow" x="-30%" y="-30%" width="160%" height="160%">
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

          <path className="vpSwellArea" d={areaPath} />
          <path className="vpSwellLine" d={linePath} />

          <g className="vpChartBarLabels vpSwellHeightLabels">
            {swellHourlyData.map((point) => {
              const x = toX(point.hour);
              const y = toY(point.height);

              return (
                <g className="vpSwellPointLabels" key={point.label}>
                  <text
                    className="vpSwellPeriodValue"
                    x={x}
                    y={y - 30}
                    textAnchor="middle"
                    dominantBaseline="middle"
                  >
                    {point.period} s
                  </text>
                  <text
                    className="vpSwellHeightValue"
                    x={x}
                    y={y - 14}
                    textAnchor="middle"
                    dominantBaseline="middle"
                  >
                    {formatHeight(point.height)}
                  </text>
                </g>
              );
            })}
          </g>

          {markers.map((point) => {
            const x = toX(point.hour);
            const y = toY(point.height);

            return (
              <g
                className={`vpTideMarker vpSwellMarker${point.current ? ' isCurrent' : ''}`}
                key={point.label}
              >
                <line x1={x} y1={y} x2={x} y2={chartBottom} />
                <circle cx={x} cy={y} r={point.current ? 7 : 6} />
              </g>
            );
          })}

          <g className="vpTideYAxis">
            {swellYAxisValues.map((value, index) => (
              <text key={value} x="4" y={yAxisLabelY[index]}>
                {value.toFixed(1).replace('.', ',')}
              </text>
            ))}
          </g>

          <g className="vpTideXAxis">
            {swellHourlyData.map((point) => (
              <text key={point.label} x={toX(point.hour)} y="265" textAnchor="middle">
                {point.label}
              </text>
            ))}
          </g>
        </svg>
      </div>

      <span className="vpTideAxisLabel">Altura (m) • Período (s)</span>
    </CardShell>
  );
}

function SwellSummaryCard({ item }: { item: SwellSummaryItem }) {
  return (
    <CardShell className="vpTideSummaryCard vpSwellSummaryCard">
      <div className="vpTideSummaryIcon vpSwellSummaryIcon">{item.icon}</div>

      <div className="vpTideSummaryText">
        <span>{item.label}</span>
        <strong className={item.emphasis ? 'isEmphasis' : ''}>
          {item.value}
        </strong>
      </div>
    </CardShell>
  );
}

function SwellDetailView({
  placeName,
  onBack,
}: {
  placeName: string;
  onBack: () => void;
}) {
  const summaries: SwellSummaryItem[] = [
    {
      icon: <WaveIcon />,
      label: 'SWELL ATUAL',
      value: '0,7 m • 8 s',
      emphasis: true,
    },
    {
      icon: <ActivityIcon />,
      label: 'PICO DO DIA',
      value: '1,0 m às 18h',
    },
    {
      icon: <CompassIcon />,
      label: 'DIREÇÃO',
      value: 'Sudeste',
    },
    {
      icon: <ClockIcon />,
      label: 'PERÍODO',
      value: '8–9 s',
    },
  ];

  return (
    <main className="vpTidePanelShell vpSwellPanelShell">
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

      <SwellTitleCard />

      <SwellChart />

      <section className="vpTideSummaryGrid vpSwellSummaryGrid" aria-label="Resumo do swell">
        {summaries.map((item) => (
          <SwellSummaryCard key={item.label} item={item} />
        ))}
      </section>

      <CardShell className="vpTideVariationCard vpSwellVariationCard">
        <div className="vpTideVariationIcon vpSwellVariationIcon">
          <ClockIcon />
        </div>

        <div className="vpTideVariationText">
          <span>JANELA MAIS LIMPA</span>
          <strong>Ondulação mais organizada entre 13h e 18h.</strong>
        </div>
      </CardShell>
    </main>
  );
}

function AirTempTitleCard() {
  return (
    <CardShell className="vpTideTitleCard vpAirTempTitleCard">
      <div className="vpTideTitleIcon vpAirTempTitleIcon">
        <ThermometerIcon />
      </div>

      <div className="vpTideTitleText">
        <span>DADOS AVANÇADOS</span>
        <strong>TEMPERATURA DO AR</strong>
        <small>Variação da temperatura nas próximas horas.</small>
      </div>
    </CardShell>
  );
}

function AirTempChart() {
  const chartLeft = 90;
  const chartRight = 890;
  const chartTop = 30;
  const chartBottom = 245;
  const yAxisLabelY = [35, 90, 145, 200, 250];

  const airTempHourlyData = [
    { hour: 0, label: '00h', temp: 22.0 },
    { hour: 3, label: '03h', temp: 21.5 },
    { hour: 6, label: '06h', temp: 21.0 },
    { hour: 9, label: '09h', temp: 24.0 },
    { hour: 12, label: '12h', temp: 26.0, current: true },
    { hour: 15, label: '15h', temp: 27.5 },
    { hour: 18, label: '18h', temp: 25.5 },
    { hour: 21, label: '21h', temp: 23.5 },
    { hour: 24, label: '24h', temp: 22.5 },
  ];

  const lowestAirTemp = Math.min(...airTempHourlyData.map((point) => point.temp));
  const highestAirTemp = Math.max(...airTempHourlyData.map((point) => point.temp));
  const airTempPadding = Math.max(2, (highestAirTemp - lowestAirTemp) * 0.35);
  const airTempMin = Math.floor(lowestAirTemp - airTempPadding);
  const airTempMax = Math.ceil(highestAirTemp + airTempPadding);
  const airTempRange = airTempMax - airTempMin || 1;

  const airTempYAxisValues = [
    airTempMax,
    airTempMin + airTempRange * 0.75,
    airTempMin + airTempRange * 0.5,
    airTempMin + airTempRange * 0.25,
    airTempMin,
  ];

  const toX = (hour: number) =>
    chartLeft + (hour / 24) * (chartRight - chartLeft);

  const toY = (temp: number) =>
    chartBottom - ((temp - airTempMin) / airTempRange) * (chartBottom - chartTop);

  const formatTemp = (temp: number) =>
    `${temp.toFixed(1).replace('.', ',')}°`;

  const linePoints = airTempHourlyData.map((point) => ({
    x: toX(point.hour),
    y: toY(point.temp),
  }));

  const linePath = createSmoothPath(linePoints);
  const areaPath = `${linePath} L ${toX(24).toFixed(1)} ${chartBottom} L ${toX(0).toFixed(1)} ${chartBottom} Z`;
  const markers = airTempHourlyData;

  return (
    <CardShell className="vpTideChartCard vpAirTempChartCard">
      <div className="vpTideSituation vpAirTempSituation">
        <ThermometerIcon />
        <span>
          SITUAÇÃO ATUAL: <strong>AR AQUECENDO AO LONGO DO DIA</strong>
        </span>
      </div>

      <div className="vpTideChartWrap vpAirTempChartWrap">
        <svg
          className="vpTideChart vpAirTempChart"
          viewBox="0 0 920 270"
          preserveAspectRatio="none"
          role="img"
          aria-label="Gráfico de temperatura do ar ao longo de 24 horas"
        >
          <defs>
            <linearGradient id="vpAirTempFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(125,211,252,0.25)" />
              <stop offset="100%" stopColor="rgba(125,211,252,0.015)" />
            </linearGradient>

            <filter id="vpAirTempGlow" x="-30%" y="-30%" width="160%" height="160%">
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

          <path className="vpAirTempArea" d={areaPath} />
          <path className="vpAirTempLine" d={linePath} />

          <g className="vpChartBarLabels vpAirTempLabels">
            {airTempHourlyData.map((point) => {
              const x = toX(point.hour);
              const y = toY(point.temp);

              return (
                <text key={point.label} x={x} y={y - 12} textAnchor="middle">
                  {formatTemp(point.temp)}
                </text>
              );
            })}
          </g>

          {markers.map((point) => {
            const x = toX(point.hour);
            const y = toY(point.temp);

            return (
              <g
                className={`vpTideMarker vpAirTempMarker${point.current ? ' isCurrent' : ''}`}
                key={point.label}
              >
                <line x1={x} y1={y} x2={x} y2={chartBottom} />
                <circle cx={x} cy={y} r={point.current ? 7 : 6} />
              </g>
            );
          })}

          <g className="vpTideYAxis">
            {airTempYAxisValues.map((value, index) => (
              <text key={`${value}-${index}`} x="4" y={yAxisLabelY[index]}>
                {Math.round(value)}
              </text>
            ))}
          </g>

          <g className="vpTideXAxis">
            {airTempHourlyData.map((point) => (
              <text key={point.label} x={toX(point.hour)} y="265" textAnchor="middle">
                {point.label}
              </text>
            ))}
          </g>
        </svg>
      </div>

      <span className="vpTideAxisLabel">Temperatura do ar (°C)</span>
    </CardShell>
  );
}

function AirTempSummaryCard({ item }: { item: AirTempSummaryItem }) {
  return (
    <CardShell className="vpTideSummaryCard vpAirTempSummaryCard">
      <div className="vpTideSummaryIcon vpAirTempSummaryIcon">{item.icon}</div>

      <div className="vpTideSummaryText">
        <span>{item.label}</span>
        <strong className={item.emphasis ? 'isEmphasis' : ''}>
          {item.value}
        </strong>
      </div>
    </CardShell>
  );
}

function AirTempDetailView({
  placeName,
  onBack,
}: {
  placeName: string;
  onBack: () => void;
}) {
  const summaries: AirTempSummaryItem[] = [
    {
      icon: <ThermometerIcon />,
      label: 'TEMP. ATUAL',
      value: '26,0 °C',
      emphasis: true,
    },
    {
      icon: <ActivityIcon />,
      label: 'MÁXIMA',
      value: '27,5 °C às 15h',
    },
    {
      icon: <ClockIcon />,
      label: 'MÍNIMA',
      value: '21,0 °C às 06h',
    },
    {
      icon: <SunMoonIcon />,
      label: 'TENDÊNCIA',
      value: 'Aquece à tarde',
    },
  ];

  return (
    <main className="vpTidePanelShell vpAirTempPanelShell">
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

      <AirTempTitleCard />

      <AirTempChart />

      <section className="vpTideSummaryGrid vpAirTempSummaryGrid" aria-label="Resumo da temperatura do ar">
        {summaries.map((item) => (
          <AirTempSummaryCard key={item.label} item={item} />
        ))}
      </section>

      <CardShell className="vpTideVariationCard vpAirTempVariationCard">
        <div className="vpTideVariationIcon vpAirTempVariationIcon">
          <ClockIcon />
        </div>

        <div className="vpTideVariationText">
          <span>JANELA MAIS CONFORTÁVEL</span>
          <strong>Temperatura mais estável entre 9h e 12h.</strong>
        </div>
      </CardShell>
    </main>
  );
}

function WaterTempTitleCard() {
  return (
    <CardShell className="vpTideTitleCard vpWaterTempTitleCard">
      <div className="vpTideTitleIcon vpWaterTempTitleIcon">
        <WaterThermometerIcon />
      </div>

      <div className="vpTideTitleText">
        <span>DADOS AVANÇADOS</span>
        <strong>TEMPERATURA DA ÁGUA</strong>
        <small>Variação da água nas próximas horas.</small>
      </div>
    </CardShell>
  );
}

function WaterTempChart() {
  const chartLeft = 90;
  const chartRight = 890;
  const chartTop = 30;
  const chartBottom = 245;
  const yAxisLabelY = [35, 90, 145, 200, 250];

  const waterTempHourlyData = [
    { hour: 0, label: '00h', temp: 22.3 },
    { hour: 3, label: '03h', temp: 22.2 },
    { hour: 6, label: '06h', temp: 22.1 },
    { hour: 9, label: '09h', temp: 22.3 },
    { hour: 12, label: '12h', temp: 22.4, current: true },
    { hour: 15, label: '15h', temp: 22.8 },
    { hour: 18, label: '18h', temp: 22.7 },
    { hour: 21, label: '21h', temp: 22.5 },
    { hour: 24, label: '24h', temp: 22.4 },
  ];

  const lowestWaterTemp = Math.min(...waterTempHourlyData.map((point) => point.temp));
  const highestWaterTemp = Math.max(...waterTempHourlyData.map((point) => point.temp));
  const waterTempPadding = Math.max(0.6, (highestWaterTemp - lowestWaterTemp) * 0.6);
  const waterTempMin = Math.floor((lowestWaterTemp - waterTempPadding) * 2) / 2;
  const waterTempMax = Math.ceil((highestWaterTemp + waterTempPadding) * 2) / 2;
  const waterTempRange = waterTempMax - waterTempMin || 1;

  const waterTempYAxisValues = [
    waterTempMax,
    waterTempMin + waterTempRange * 0.75,
    waterTempMin + waterTempRange * 0.5,
    waterTempMin + waterTempRange * 0.25,
    waterTempMin,
  ];

  const toX = (hour: number) =>
    chartLeft + (hour / 24) * (chartRight - chartLeft);

  const toY = (temp: number) =>
    chartBottom - ((temp - waterTempMin) / waterTempRange) * (chartBottom - chartTop);

  const formatTemp = (temp: number) =>
    `${temp.toFixed(1).replace('.', ',')}°`;

  const linePoints = waterTempHourlyData.map((point) => ({
    x: toX(point.hour),
    y: toY(point.temp),
  }));

  const linePath = createSmoothPath(linePoints);
  const areaPath = `${linePath} L ${toX(24).toFixed(1)} ${chartBottom} L ${toX(0).toFixed(1)} ${chartBottom} Z`;
  const markers = waterTempHourlyData;

  return (
    <CardShell className="vpTideChartCard vpWaterTempChartCard">
      <div className="vpTideSituation vpWaterTempSituation">
        <WaterThermometerIcon />
        <span>
          SITUAÇÃO ATUAL: <strong>ÁGUA ESTÁVEL COM LEVE AQUECIMENTO</strong>
        </span>
      </div>

      <div className="vpTideChartWrap vpWaterTempChartWrap">
        <svg
          className="vpTideChart vpWaterTempChart"
          viewBox="0 0 920 270"
          preserveAspectRatio="none"
          role="img"
          aria-label="Gráfico de temperatura da água ao longo de 24 horas"
        >
          <defs>
            <linearGradient id="vpWaterTempFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(125,211,252,0.25)" />
              <stop offset="100%" stopColor="rgba(125,211,252,0.015)" />
            </linearGradient>

            <filter id="vpWaterTempGlow" x="-30%" y="-30%" width="160%" height="160%">
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

          <path className="vpWaterTempArea" d={areaPath} />
          <path className="vpWaterTempLine" d={linePath} />

          <g className="vpChartBarLabels vpWaterTempLabels">
            {waterTempHourlyData.map((point) => {
              const x = toX(point.hour);
              const y = toY(point.temp);

              return (
                <text key={point.label} x={x} y={y - 12} textAnchor="middle">
                  {formatTemp(point.temp)}
                </text>
              );
            })}
          </g>

          {markers.map((point) => {
            const x = toX(point.hour);
            const y = toY(point.temp);

            return (
              <g
                className={`vpTideMarker vpWaterTempMarker${point.current ? ' isCurrent' : ''}`}
                key={point.label}
              >
                <line x1={x} y1={y} x2={x} y2={chartBottom} />
                <circle cx={x} cy={y} r={point.current ? 7 : 6} />
              </g>
            );
          })}

          <g className="vpTideYAxis">
            {waterTempYAxisValues.map((value, index) => (
              <text key={`${value}-${index}`} x="4" y={yAxisLabelY[index]}>
                {value.toFixed(1).replace('.', ',')}
              </text>
            ))}
          </g>

          <g className="vpTideXAxis">
            {waterTempHourlyData.map((point) => (
              <text key={point.label} x={toX(point.hour)} y="265" textAnchor="middle">
                {point.label}
              </text>
            ))}
          </g>
        </svg>
      </div>

      <span className="vpTideAxisLabel">Temperatura da água (°C)</span>
    </CardShell>
  );
}

function WaterTempSummaryCard({ item }: { item: WaterTempSummaryItem }) {
  return (
    <CardShell className="vpTideSummaryCard vpWaterTempSummaryCard">
      <div className="vpTideSummaryIcon vpWaterTempSummaryIcon">{item.icon}</div>

      <div className="vpTideSummaryText">
        <span>{item.label}</span>
        <strong className={item.emphasis ? 'isEmphasis' : ''}>
          {item.value}
        </strong>
      </div>
    </CardShell>
  );
}

function WaterTempDetailView({
  placeName,
  onBack,
}: {
  placeName: string;
  onBack: () => void;
}) {
  const summaries: WaterTempSummaryItem[] = [
    {
      icon: <WaterThermometerIcon />,
      label: 'TEMP. ATUAL',
      value: '22,4 °C',
      emphasis: true,
    },
    {
      icon: <ActivityIcon />,
      label: 'MAIS QUENTE',
      value: '22,8 °C às 15h',
    },
    {
      icon: <ClockIcon />,
      label: 'MAIS FRIA',
      value: '22,1 °C às 06h',
    },
    {
      icon: <WaveIcon />,
      label: 'TENDÊNCIA',
      value: 'Estável',
    },
  ];

  return (
    <main className="vpTidePanelShell vpWaterTempPanelShell">
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

      <WaterTempTitleCard />

      <WaterTempChart />

      <section className="vpTideSummaryGrid vpWaterTempSummaryGrid" aria-label="Resumo da temperatura da água">
        {summaries.map((item) => (
          <WaterTempSummaryCard key={item.label} item={item} />
        ))}
      </section>

      <CardShell className="vpTideVariationCard vpWaterTempVariationCard">
        <div className="vpTideVariationIcon vpWaterTempVariationIcon">
          <ClockIcon />
        </div>

        <div className="vpTideVariationText">
          <span>JANELA MAIS ESTÁVEL</span>
          <strong>Água mais constante entre 9h e 15h.</strong>
        </div>
      </CardShell>
    </main>
  );
}

function PressureTitleCard() {
  return (
    <CardShell className="vpTideTitleCard vpPressureTitleCard">
      <div className="vpTideTitleIcon vpPressureTitleIcon">
        <PressureIcon />
      </div>

      <div className="vpTideTitleText">
        <span>DADOS AVANÇADOS</span>
        <strong>PRESSÃO</strong>
        <small>Variação da pressão atmosférica nas próximas horas.</small>
      </div>
    </CardShell>
  );
}

function PressureChart() {
  const chartLeft = 90;
  const chartRight = 890;
  const chartTop = 30;
  const chartBottom = 245;
  const yAxisLabelY = [35, 90, 145, 200, 250];

  const pressureHourlyData = [
    { hour: 0, label: '00h', pressure: 1018 },
    { hour: 3, label: '03h', pressure: 1017 },
    { hour: 6, label: '06h', pressure: 1017 },
    { hour: 9, label: '09h', pressure: 1016 },
    { hour: 12, label: '12h', pressure: 1016, current: true },
    { hour: 15, label: '15h', pressure: 1015 },
    { hour: 18, label: '18h', pressure: 1014 },
    { hour: 21, label: '21h', pressure: 1015 },
    { hour: 24, label: '24h', pressure: 1016 },
  ];

  const lowestPressure = Math.min(...pressureHourlyData.map((point) => point.pressure));
  const highestPressure = Math.max(...pressureHourlyData.map((point) => point.pressure));
  const pressurePadding = Math.max(2, (highestPressure - lowestPressure) * 0.7);
  const pressureMin = Math.floor(lowestPressure - pressurePadding);
  const pressureMax = Math.ceil(highestPressure + pressurePadding);
  const pressureRange = pressureMax - pressureMin || 1;

  const pressureYAxisValues = [
    pressureMax,
    pressureMin + pressureRange * 0.75,
    pressureMin + pressureRange * 0.5,
    pressureMin + pressureRange * 0.25,
    pressureMin,
  ];

  const toX = (hour: number) =>
    chartLeft + (hour / 24) * (chartRight - chartLeft);

  const toY = (pressure: number) =>
    chartBottom - ((pressure - pressureMin) / pressureRange) * (chartBottom - chartTop);

  const formatPressure = (pressure: number) => `${Math.round(pressure)}`;

  const linePoints = pressureHourlyData.map((point) => ({
    x: toX(point.hour),
    y: toY(point.pressure),
  }));

  const linePath = createSmoothPath(linePoints);
  const areaPath = `${linePath} L ${toX(24).toFixed(1)} ${chartBottom} L ${toX(0).toFixed(1)} ${chartBottom} Z`;
  const markers = pressureHourlyData;

  return (
    <CardShell className="vpTideChartCard vpPressureChartCard">
      <div className="vpTideSituation vpPressureSituation">
        <PressureIcon />
        <span>
          SITUAÇÃO ATUAL: <strong>PRESSÃO EM LEVE QUEDA</strong>
        </span>
      </div>

      <div className="vpTideChartWrap vpPressureChartWrap">
        <svg
          className="vpTideChart vpPressureChart"
          viewBox="0 0 920 270"
          preserveAspectRatio="none"
          role="img"
          aria-label="Gráfico de pressão atmosférica ao longo de 24 horas"
        >
          <defs>
            <linearGradient id="vpPressureFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(125,211,252,0.25)" />
              <stop offset="100%" stopColor="rgba(125,211,252,0.015)" />
            </linearGradient>

            <filter id="vpPressureGlow" x="-30%" y="-30%" width="160%" height="160%">
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

          <path className="vpPressureArea" d={areaPath} />
          <path className="vpPressureLine" d={linePath} />

          <g className="vpChartBarLabels vpPressureLabels">
            {pressureHourlyData.map((point) => {
              const x = toX(point.hour);
              const y = toY(point.pressure);

              return (
                <text key={point.label} x={x} y={y - 12} textAnchor="middle">
                  {formatPressure(point.pressure)}
                </text>
              );
            })}
          </g>

          {markers.map((point) => {
            const x = toX(point.hour);
            const y = toY(point.pressure);

            return (
              <g
                className={`vpTideMarker vpPressureMarker${point.current ? ' isCurrent' : ''}`}
                key={point.label}
              >
                <line x1={x} y1={y} x2={x} y2={chartBottom} />
                <circle cx={x} cy={y} r={point.current ? 7 : 6} />
              </g>
            );
          })}

          <g className="vpTideYAxis">
            {pressureYAxisValues.map((value, index) => (
              <text key={`${value}-${index}`} x="4" y={yAxisLabelY[index]}>
                {Math.round(value)}
              </text>
            ))}
          </g>

          <g className="vpTideXAxis">
            {pressureHourlyData.map((point) => (
              <text key={point.label} x={toX(point.hour)} y="265" textAnchor="middle">
                {point.label}
              </text>
            ))}
          </g>
        </svg>
      </div>

      <span className="vpTideAxisLabel">Pressão (hPa)</span>
    </CardShell>
  );
}

function PressureSummaryCard({ item }: { item: PressureSummaryItem }) {
  return (
    <CardShell className="vpTideSummaryCard vpPressureSummaryCard">
      <div className="vpTideSummaryIcon vpPressureSummaryIcon">{item.icon}</div>

      <div className="vpTideSummaryText">
        <span>{item.label}</span>
        <strong className={item.emphasis ? 'isEmphasis' : ''}>
          {item.value}
        </strong>
      </div>
    </CardShell>
  );
}

function PressureDetailView({
  placeName,
  onBack,
}: {
  placeName: string;
  onBack: () => void;
}) {
  const summaries: PressureSummaryItem[] = [
    {
      icon: <PressureIcon />,
      label: 'PRESSÃO ATUAL',
      value: '1016 hPa',
      emphasis: true,
    },
    {
      icon: <ActivityIcon />,
      label: 'MÁXIMA',
      value: '1018 hPa às 00h',
    },
    {
      icon: <ClockIcon />,
      label: 'MÍNIMA',
      value: '1014 hPa às 18h',
    },
    {
      icon: <CompassIcon />,
      label: 'TENDÊNCIA',
      value: 'Leve queda',
    },
  ];

  return (
    <main className="vpTidePanelShell vpPressurePanelShell">
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

      <PressureTitleCard />

      <PressureChart />

      <section className="vpTideSummaryGrid vpPressureSummaryGrid" aria-label="Resumo da pressão">
        {summaries.map((item) => (
          <PressureSummaryCard key={item.label} item={item} />
        ))}
      </section>

      <CardShell className="vpTideVariationCard vpPressureVariationCard">
        <div className="vpTideVariationIcon vpPressureVariationIcon">
          <ClockIcon />
        </div>

        <div className="vpTideVariationText">
          <span>JANELA DE MUDANÇA</span>
          <strong>Queda mais clara entre 12h e 18h.</strong>
        </div>
      </CardShell>
    </main>
  );
}

function SunMoonTitleCard() {
  return (
    <CardShell className="vpTideTitleCard vpSunMoonTitleCard">
      <div className="vpTideTitleIcon vpSunMoonTitleIcon">
        <SunMoonIcon />
      </div>

      <div className="vpTideTitleText">
        <span>DADOS AVANÇADOS</span>
        <strong>SOL E LUA</strong>
        <small>Horários solares, fase e iluminação lunar.</small>
      </div>
    </CardShell>
  );
}

function SunMoonCycleChart() {
  return (
    <CardShell className="vpTideChartCard vpSunMoonChartCard">
      <div className="vpTideSituation vpSunMoonSituation">
        <SunMoonIcon />
        <span>
          SITUAÇÃO ATUAL: <strong>LUA CRESCENTE • 35% ILUMINADA</strong>
        </span>
      </div>

      <div className="vpTideChartWrap vpSunMoonChartWrap">
        <div className="vpSunMoonScene" aria-label="Ciclo de lua e sol ao longo de 24 horas">
          <div className="vpSunMoonMoonHeader">
            <div className="vpSunMoonPhaseMark" aria-hidden="true">
              <span />
            </div>

            <div className="vpSunMoonPhaseText">
              <span>LUA</span>
              <strong>Crescente</strong>
            </div>

            <div className="vpSunMoonPhaseStats">
              <div>
                <span>ILUMINAÇÃO</span>
                <strong>35%</strong>
              </div>
              <div>
                <span>IDADE</span>
                <strong>9,3 dias</strong>
              </div>
            </div>
          </div>

          <svg
            className="vpSunMoonCurveChart"
            viewBox="0 0 920 330"
            preserveAspectRatio="none"
            role="img"
            aria-label="Curvas de nascer e pôr da lua e do sol"
          >
            <defs>
              <linearGradient id="vpSunMoonMoonFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="rgba(148,163,184,0.26)" />
                <stop offset="100%" stopColor="rgba(148,163,184,0.025)" />
              </linearGradient>

              <linearGradient id="vpSunMoonDayFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="rgba(14,165,233,0.34)" />
                <stop offset="100%" stopColor="rgba(14,165,233,0.025)" />
              </linearGradient>

              <filter id="vpSunMoonCurveGlow" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="3.4" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            <g className="vpSunMoonGrid">
              <line x1="80" y1="92" x2="880" y2="92" />
              <line x1="80" y1="142" x2="880" y2="142" />
              <line x1="80" y1="226" x2="880" y2="226" />
              <line x1="80" y1="276" x2="880" y2="276" />

              <line x1="80" y1="54" x2="80" y2="302" />
              <line x1="280" y1="54" x2="280" y2="302" />
              <line x1="480" y1="54" x2="480" y2="302" />
              <line x1="680" y1="54" x2="680" y2="302" />
              <line x1="880" y1="54" x2="880" y2="302" />
            </g>

            <g className="vpSunMoonRowLabel">
              <text x="24" y="126">LUA</text>
              <text x="24" y="258">SOL</text>
            </g>

            <path
              className="vpSunMoonMoonArea"
              d="M80 132 C174 144 252 140 336 118 C424 94 522 82 622 88 C724 94 810 112 880 134 L880 142 L80 142 Z"
            />
            <path
              className="vpSunMoonMoonCurve"
              d="M80 132 C174 144 252 140 336 118 C424 94 522 82 622 88 C724 94 810 112 880 134"
            />

            <path
              className="vpSunMoonSunArea"
              d="M80 288 C188 284 272 260 366 224 C460 188 560 184 654 218 C748 252 820 280 880 288 L880 276 L80 276 Z"
            />
            <path
              className="vpSunMoonSunCurve"
              d="M80 288 C188 284 272 260 366 224 C460 188 560 184 654 218 C748 252 820 280 880 288"
            />

            <g className="vpSunMoonEventMarkers">
              <g>
                <line x1="420" y1="142" x2="420" y2="112" />
                <circle cx="420" cy="112" r="6" />
                <text className="vpSunMoonEventLabel" x="420" y="78" textAnchor="middle">
                  Nascer da lua
                </text>
                <text className="vpSunMoonEventValue" x="420" y="98" textAnchor="middle">
                  10h12
                </text>
              </g>

              <g>
                <line x1="833" y1="142" x2="833" y2="126" />
                <circle cx="833" cy="126" r="6" />
                <text className="vpSunMoonEventLabel" x="833" y="160" textAnchor="middle">
                  Pôr da lua
                </text>
                <text className="vpSunMoonEventValue" x="833" y="180" textAnchor="middle">
                  22h36
                </text>
              </g>

              <g>
                <line x1="307" y1="276" x2="307" y2="250" />
                <circle cx="307" cy="250" r="6" />
                <text className="vpSunMoonEventLabel" x="307" y="216" textAnchor="middle">
                  Nascer do sol
                </text>
                <text className="vpSunMoonEventValue" x="307" y="236" textAnchor="middle">
                  06h48
                </text>
              </g>

              <g>
                <line x1="670" y1="276" x2="670" y2="232" />
                <circle cx="670" cy="232" r="6" />
                <text className="vpSunMoonEventLabel" x="670" y="198" textAnchor="middle">
                  Pôr do sol
                </text>
                <text className="vpSunMoonEventValue" x="670" y="218" textAnchor="middle">
                  17h42
                </text>
              </g>
            </g>

            <g className="vpSunMoonXAxis">
              <text x="80" y="322" textAnchor="middle">00h</text>
              <text x="280" y="322" textAnchor="middle">06h</text>
              <text x="480" y="322" textAnchor="middle">12h</text>
              <text x="680" y="322" textAnchor="middle">18h</text>
              <text x="880" y="322" textAnchor="middle">24h</text>
            </g>
          </svg>
        </div>
      </div>

      <span className="vpTideAxisLabel">Ciclo de 24h</span>
    </CardShell>
  );
}

function SunMoonSummaryCard({ item }: { item: SunMoonSummaryItem }) {
  return (
    <CardShell className="vpTideSummaryCard vpSunMoonSummaryCard">
      <div className="vpTideSummaryIcon vpSunMoonSummaryIcon">{item.icon}</div>

      <div className="vpTideSummaryText">
        <span>{item.label}</span>
        <strong className={item.emphasis ? 'isEmphasis' : ''}>
          {item.value}
        </strong>
      </div>
    </CardShell>
  );
}

function SunMoonDetailView({
  placeName,
  onBack,
}: {
  placeName: string;
  onBack: () => void;
}) {
  const summaries: SunMoonSummaryItem[] = [
    {
      icon: <SunMoonIcon />,
      label: 'LUA ATUAL',
      value: 'Crescente',
      emphasis: true,
    },
    {
      icon: <ActivityIcon />,
      label: 'ILUMINAÇÃO',
      value: '35%',
    },
    {
      icon: <ClockIcon />,
      label: 'NASCER DO SOL',
      value: '06h48',
    },
    {
      icon: <ClockIcon />,
      label: 'PÔR DO SOL',
      value: '17h42',
    },
  ];

  return (
    <main className="vpTidePanelShell vpSunMoonPanelShell">
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

      <SunMoonTitleCard />

      <SunMoonCycleChart />

      <section className="vpTideSummaryGrid vpSunMoonSummaryGrid" aria-label="Resumo de sol e lua">
        {summaries.map((item) => (
          <SunMoonSummaryCard key={item.label} item={item} />
        ))}
      </section>

      <CardShell className="vpTideVariationCard vpSunMoonVariationCard">
        <div className="vpTideVariationIcon vpSunMoonVariationIcon">
          <ClockIcon />
        </div>

        <div className="vpTideVariationText">
          <span>PERÍODO CLARO</span>
          <strong>06h48 às 17h42.</strong>
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
    if (
      id === 'tide' ||
      id === 'wind' ||
      id === 'weather' ||
      id === 'swell' ||
      id === 'airTemp' ||
      id === 'waterTemp' ||
      id === 'pressure' ||
      id === 'sunMoon'
    ) {
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
      ) : activeMetric === 'weather' ? (
        <WeatherDetailView
          placeName={selectedPlaceName}
          onBack={() => setActiveMetric(null)}
        />
      ) : activeMetric === 'swell' ? (
        <SwellDetailView
          placeName={selectedPlaceName}
          onBack={() => setActiveMetric(null)}
        />
      ) : activeMetric === 'airTemp' ? (
        <AirTempDetailView
          placeName={selectedPlaceName}
          onBack={() => setActiveMetric(null)}
        />
      ) : activeMetric === 'waterTemp' ? (
        <WaterTempDetailView
          placeName={selectedPlaceName}
          onBack={() => setActiveMetric(null)}
        />
      ) : activeMetric === 'pressure' ? (
        <PressureDetailView
          placeName={selectedPlaceName}
          onBack={() => setActiveMetric(null)}
        />
      ) : activeMetric === 'sunMoon' ? (
        <SunMoonDetailView
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

        .vpWeatherArea {
          fill: url(#vpWeatherFill);
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

        .vpWeatherLine {
          fill: none;
          stroke: rgba(224, 242, 254, 0.96);
          stroke-width: 3;
          stroke-linecap: round;
          filter: url(#vpWeatherGlow);
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

        .vpTideMarker.isSecondary line {
          stroke: rgba(125, 211, 252, 0.34);
          stroke-width: 1.2;
          stroke-dasharray: 4 7;
        }

        .vpTideMarker.isSecondary circle {
          fill: rgba(224, 242, 254, 0.9);
          stroke: rgba(56, 189, 248, 0.28);
          stroke-width: 1.7;
          filter: none;
        }

        .vpTideMarker.isSecondary text {
          fill: rgba(226, 232, 240, 0.82);
          font-size: 14px;
          font-weight: 640;
          paint-order: stroke;
          stroke: rgba(2, 8, 15, 0.68);
          stroke-width: 2px;
          stroke-linejoin: round;
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

        .vpChartBarLabels text {
          fill: rgba(248, 250, 252, 0.94);
          font-size: 16px;
          line-height: 1;
          font-weight: 760;
          paint-order: stroke;
          stroke: rgba(2, 8, 15, 0.72);
          stroke-width: 3px;
          stroke-linejoin: round;
        }

        .vpWeatherBarLabels text {
          fill: rgba(186, 230, 253, 0.96);
        }

        .vpWindBarLabels text {
          fill: rgba(224, 242, 254, 0.96);
        }

        .vpWindTitleIcon {
          color: #bae6fd;
        }

        .vpWindSituation strong,
        .vpWindSummaryCard .isEmphasis {
          color: #7dd3fc;
        }

        .vpWeatherTitleIcon {
          color: #bae6fd;
        }

        .vpWeatherSituation strong,
        .vpWeatherSummaryCard .isEmphasis {
          color: #7dd3fc;
        }

        .vpSwellArea {
          fill: url(#vpSwellFill);
        }

        .vpSwellLine {
          fill: none;
          stroke: rgba(224, 242, 254, 0.96);
          stroke-width: 3;
          stroke-linecap: round;
          filter: url(#vpSwellGlow);
        }

        .vpSwellHeightLabels .vpSwellHeightValue {
          fill: rgba(248, 250, 252, 0.96);
        }

        .vpSwellHeightLabels .vpSwellPeriodValue {
          fill: rgba(125, 211, 252, 0.96);
          font-size: inherit;
          font-weight: 700;
        }

        .vpSwellPointLabels text {
          text-anchor: middle;
        }

        .vpSwellTitleIcon {
          color: #bae6fd;
        }

        .vpSwellSituation strong,
        .vpSwellSummaryCard .isEmphasis {
          color: #7dd3fc;
        }

        .vpAirTempArea {
          fill: url(#vpAirTempFill);
        }

        .vpAirTempLine {
          fill: none;
          stroke: rgba(224, 242, 254, 0.96);
          stroke-width: 3;
          stroke-linecap: round;
          filter: url(#vpAirTempGlow);
        }

        .vpAirTempLabels text {
          fill: rgba(248, 250, 252, 0.96);
        }

        .vpAirTempTitleIcon {
          color: #bae6fd;
        }

        .vpAirTempSituation strong,
        .vpAirTempSummaryCard .isEmphasis {
          color: #7dd3fc;
        }

        .vpWaterTempArea {
          fill: url(#vpWaterTempFill);
        }

        .vpWaterTempLine {
          fill: none;
          stroke: rgba(224, 242, 254, 0.96);
          stroke-width: 3;
          stroke-linecap: round;
          filter: url(#vpWaterTempGlow);
        }

        .vpWaterTempLabels text {
          fill: rgba(248, 250, 252, 0.96);
        }

        .vpWaterTempTitleIcon {
          color: #bae6fd;
        }

        .vpWaterTempSituation strong,
        .vpWaterTempSummaryCard .isEmphasis {
          color: #7dd3fc;
        }

        .vpPressureArea {
          fill: url(#vpPressureFill);
        }

        .vpPressureLine {
          fill: none;
          stroke: rgba(224, 242, 254, 0.96);
          stroke-width: 3;
          stroke-linecap: round;
          filter: url(#vpPressureGlow);
        }

        .vpPressureLabels text {
          fill: rgba(248, 250, 252, 0.96);
        }

        .vpPressureTitleIcon {
          color: #bae6fd;
        }

        .vpPressureSituation strong,
        .vpPressureSummaryCard .isEmphasis {
          color: #7dd3fc;
        }

        .vpSunMoonTitleIcon {
          color: #bae6fd;
        }

        .vpSunMoonSituation strong,
        .vpSunMoonSummaryCard .isEmphasis {
          color: #7dd3fc;
        }

        .vpSunMoonChartWrap {
          display: flex;
          align-items: stretch;
          justify-content: center;
          overflow: hidden;
        }

        .vpSunMoonScene {
          flex: 1 1 auto;
          min-width: 0;
          min-height: 0;
          display: grid;
          grid-template-rows: auto minmax(0, 1fr);
          gap: 14px;
          padding: 10px 3px 0;
          box-sizing: border-box;
        }

        .vpSunMoonMoonHeader {
          display: grid;
          grid-template-columns: auto minmax(0, 1fr) auto;
          align-items: center;
          gap: 18px;
          padding: 0 8px;
        }

        .vpSunMoonPhaseMark {
          width: 72px;
          height: 72px;
          border-radius: 999px;
          border: 1px solid rgba(125, 211, 252, 0.34);
          background:
            radial-gradient(circle at 38% 42%, rgba(226, 232, 240, 0.98) 0 37%, transparent 38%),
            radial-gradient(circle at 57% 42%, rgba(15, 23, 42, 0.98) 0 43%, transparent 44%),
            radial-gradient(circle at 34% 30%, rgba(255, 255, 255, 0.35), transparent 28%),
            rgba(15, 23, 42, 0.78);
          box-shadow:
            inset 0 0 26px rgba(2, 8, 18, 0.58),
            0 0 28px rgba(125, 211, 252, 0.18);
        }

        .vpSunMoonPhaseMark span {
          display: block;
          width: 100%;
          height: 100%;
          border-radius: inherit;
          background:
            radial-gradient(circle at 48% 26%, rgba(255, 255, 255, 0.22), transparent 8%),
            radial-gradient(circle at 32% 56%, rgba(255, 255, 255, 0.16), transparent 7%),
            radial-gradient(circle at 54% 62%, rgba(255, 255, 255, 0.12), transparent 6%);
          opacity: 0.65;
        }

        .vpSunMoonPhaseText {
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 7px;
        }

        .vpSunMoonPhaseText span,
        .vpSunMoonPhaseStats span {
          color: rgba(226, 232, 240, 0.68);
          font-size: 12px;
          line-height: 1;
          font-weight: 760;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .vpSunMoonPhaseText span {
          color: #7dd3fc;
        }

        .vpSunMoonPhaseText strong {
          color: #ffffff;
          font-size: 24px;
          line-height: 1;
          font-weight: 780;
        }

        .vpSunMoonPhaseStats {
          display: grid;
          grid-template-columns: repeat(2, auto);
          gap: 28px;
        }

        .vpSunMoonPhaseStats div {
          display: flex;
          flex-direction: column;
          gap: 7px;
          text-align: right;
        }

        .vpSunMoonPhaseStats strong {
          color: #7dd3fc;
          font-size: 22px;
          line-height: 1;
          font-weight: 790;
        }

        .vpSunMoonCurveChart {
          width: 100%;
          height: 100%;
          min-height: 310px;
          overflow: visible;
        }

        .vpSunMoonGrid line {
          stroke: rgba(148, 163, 184, 0.13);
          stroke-width: 1;
          stroke-dasharray: 4 9;
        }

        .vpSunMoonRowLabel text {
          fill: #38bdf8;
          font-size: 16px;
          font-weight: 830;
          letter-spacing: 0.08em;
        }

        .vpSunMoonMoonArea {
          fill: url(#vpSunMoonMoonFill);
        }

        .vpSunMoonSunArea {
          fill: url(#vpSunMoonDayFill);
        }

        .vpSunMoonMoonCurve,
        .vpSunMoonSunCurve {
          fill: none;
          stroke: rgba(224, 242, 254, 0.98);
          stroke-width: 3.4;
          stroke-linecap: round;
          filter: url(#vpSunMoonCurveGlow);
        }

        .vpSunMoonSunCurve {
          stroke: rgba(14, 165, 233, 0.98);
        }

        .vpSunMoonEventMarkers line {
          stroke: rgba(125, 211, 252, 0.62);
          stroke-width: 2;
          stroke-dasharray: 5 7;
        }

        .vpSunMoonEventMarkers circle {
          fill: #e0f2fe;
          stroke: rgba(56, 189, 248, 0.96);
          stroke-width: 3;
          filter: url(#vpSunMoonCurveGlow);
        }

        .vpSunMoonEventLabel {
          fill: rgba(226, 232, 240, 0.76);
          font-size: 11px;
          line-height: 1;
          font-weight: 780;
          letter-spacing: 0.06em;
          text-transform: uppercase;
        }

        .vpSunMoonEventValue {
          fill: rgba(248, 250, 252, 0.98);
          font-size: 18px;
          line-height: 1;
          font-weight: 820;
        }

        .vpSunMoonXAxis text {
          fill: rgba(226, 232, 240, 0.76);
          font-size: 14px;
          font-weight: 720;
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
        .vpWindVariationIcon svg,
        .vpWeatherTitleIcon svg,
        .vpWeatherSituation svg,
        .vpWeatherSummaryIcon svg,
        .vpWeatherVariationIcon svg,
        .vpSwellTitleIcon svg,
        .vpSwellSituation svg,
        .vpSwellSummaryIcon svg,
        .vpSwellVariationIcon svg,
        .vpAirTempTitleIcon svg,
        .vpAirTempSituation svg,
        .vpAirTempSummaryIcon svg,
        .vpAirTempVariationIcon svg,
        .vpWaterTempTitleIcon svg,
        .vpWaterTempSituation svg,
        .vpWaterTempSummaryIcon svg,
        .vpWaterTempVariationIcon svg,
        .vpPressureTitleIcon svg,
        .vpPressureSituation svg,
        .vpPressureSummaryIcon svg,
        .vpPressureVariationIcon svg,
        .vpSunMoonTitleIcon svg,
        .vpSunMoonSituation svg,
        .vpSunMoonSummaryIcon svg,
        .vpSunMoonVariationIcon svg {
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

          .vpTideMarker.isSecondary text {
            font-size: 16px;
            font-weight: 680;
          }

          .vpTideMarker.isSecondary circle {
            r: 4;
          }

          .vpChartBarLabels text {
            font-size: 19px;
            font-weight: 780;
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

          .vpSunMoonPanelShell .vpTideTitleCard {
            display: none;
          }

          .vpSunMoonPanelShell .vpTideChartCard {
            grid-column: 1;
            grid-row: 2 / 4;
          }

          .vpSunMoonPanelShell .vpTideSummaryGrid {
            grid-column: 2;
            grid-row: 2 / 4;
          }

          .vpSunMoonPanelShell .vpSunMoonScene {
            gap: 6px;
            padding: 2px 0 0;
          }

          .vpSunMoonPanelShell .vpSunMoonMoonHeader {
            gap: 10px;
            padding: 0 2px;
          }

          .vpSunMoonPanelShell .vpSunMoonPhaseMark {
            width: 48px;
            height: 48px;
          }

          .vpSunMoonPanelShell .vpSunMoonPhaseText span,
          .vpSunMoonPanelShell .vpSunMoonPhaseStats span {
            font-size: 8px;
          }

          .vpSunMoonPanelShell .vpSunMoonPhaseText strong {
            font-size: 15px;
          }

          .vpSunMoonPanelShell .vpSunMoonPhaseStats {
            gap: 10px;
          }

          .vpSunMoonPanelShell .vpSunMoonPhaseStats strong {
            font-size: 14px;
          }

          .vpSunMoonPanelShell .vpSunMoonCurveChart {
            min-height: 0;
            height: 100%;
          }

          .vpSunMoonPanelShell .vpSunMoonEventLabel {
            font-size: 8px;
          }

          .vpSunMoonPanelShell .vpSunMoonEventValue {
            font-size: 13px;
          }

          .vpSunMoonPanelShell .vpSunMoonXAxis text {
            font-size: 11px;
          }
        }

        @media (orientation: portrait) and (max-width: 767px) {
          .vpSunMoonChartCard {
            overflow: hidden;
          }

          .vpSunMoonChartWrap {
            overflow: hidden;
            padding-bottom: 0;
          }

          .vpSunMoonScene {
            gap: 8px;
            padding: 4px 0 0;
          }

          .vpSunMoonMoonHeader {
            grid-template-columns: auto minmax(0, 1fr) auto;
            gap: 10px;
            padding: 0 2px;
          }

          .vpSunMoonPhaseMark {
            width: 56px;
            height: 56px;
          }

          .vpSunMoonPhaseText {
            gap: 5px;
          }

          .vpSunMoonPhaseText span,
          .vpSunMoonPhaseStats span {
            font-size: 9px;
          }

          .vpSunMoonPhaseText strong {
            font-size: 18px;
          }

          .vpSunMoonPhaseStats {
            gap: 12px;
          }

          .vpSunMoonPhaseStats strong {
            font-size: 17px;
          }

          .vpSunMoonCurveChart {
            width: 100%;
            min-width: 0;
            height: clamp(260px, 38vh, 330px);
            min-height: 260px;
            max-height: 330px;
          }

          .vpSunMoonRowLabel text {
            font-size: 14px;
          }

          .vpSunMoonEventLabel {
            font-size: 9px;
          }

          .vpSunMoonEventValue {
            font-size: 15px;
          }

          .vpSunMoonXAxis text {
            font-size: 12px;
          }

          .vpSunMoonPanelShell .vpTideVariationCard {
            display: grid;
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

          .vpSunMoonPanelShell {
            width: min(96vw, 1320px);
            max-height: min(92dvh, 860px);
            grid-template-columns: minmax(0, 1fr) 260px;
            grid-template-rows: 40px 72px 86px minmax(390px, 1fr) 84px;
          }

          .vpSunMoonPanelShell .vpAdvancedPlaceBlock {
            grid-column: 1 / -1;
            grid-row: 2;
          }

          .vpSunMoonPanelShell .vpTideTitleCard {
            grid-column: 1 / -1;
            grid-row: 3;
          }

          .vpSunMoonPanelShell .vpSunMoonChartCard {
            grid-column: 1;
            grid-row: 4;
            min-height: 0;
          }

          .vpSunMoonPanelShell .vpSunMoonSummaryGrid {
            grid-column: 2;
            grid-row: 4;
            grid-template-columns: 1fr;
            grid-template-rows: repeat(4, minmax(0, 1fr));
            gap: 12px;
          }

          .vpSunMoonPanelShell .vpSunMoonVariationCard {
            grid-column: 1 / -1;
            grid-row: 5;
          }

          .vpSunMoonPanelShell .vpSunMoonCurveChart {
            min-height: 340px;
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

          .vpSunMoonPanelShell .vpSunMoonScene {
            gap: 5px;
            padding: 0;
          }

          .vpSunMoonPanelShell .vpSunMoonMoonHeader {
            gap: 8px;
            padding: 0 2px;
          }

          .vpSunMoonPanelShell .vpSunMoonPhaseMark {
            width: 42px;
            height: 42px;
          }

          .vpSunMoonPanelShell .vpSunMoonPhaseText span,
          .vpSunMoonPanelShell .vpSunMoonPhaseStats span {
            font-size: 7px;
          }

          .vpSunMoonPanelShell .vpSunMoonPhaseText strong {
            font-size: 13px;
          }

          .vpSunMoonPanelShell .vpSunMoonPhaseStats {
            gap: 8px;
          }

          .vpSunMoonPanelShell .vpSunMoonPhaseStats strong {
            font-size: 12px;
          }

          .vpSunMoonPanelShell .vpSunMoonCurveChart {
            min-height: 0;
            height: 100%;
          }

          .vpSunMoonPanelShell .vpSunMoonEventLabel {
            font-size: 7px;
          }

          .vpSunMoonPanelShell .vpSunMoonEventValue {
            font-size: 12px;
          }

          .vpSunMoonPanelShell .vpSunMoonXAxis text {
            font-size: 10px;
          }
        }
      `}</style>
    </section>
  );
}
