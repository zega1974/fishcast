export type ForecastDayId = "day-25" | "day-26" | "day-27" | "day-28" | "day-29" | "day-30" | "day-01";

export type WeatherCondition =
  | "clear"
  | "partlyCloudy"
  | "cloudy"
  | "rain"
  | "storm"
  | "fog";

export type TideDirection = "rising" | "falling" | "slack";

export type TrendState = "rising" | "falling" | "stable";

export type MoonPhase =
  | "new"
  | "waxingCrescent"
  | "firstQuarter"
  | "waxingGibbous"
  | "full"
  | "waningGibbous"
  | "lastQuarter"
  | "waningCrescent";

export type CardinalDirection = "N" | "NE" | "E" | "SE" | "S" | "SW" | "W" | "NW";

export type SpotForecastDay = {
  id: ForecastDayId;
  day: string;
  isToday?: boolean;

  score: number;
  scoreLabel: string;
  bestTimes: [string, string];

  weather: {
    label: string;
    condition: WeatherCondition;
    rainChance: number;
    cloudCover: number;
    visibility: string;
  };

  airTemp: {
    current: number;
    max: number;
    min: number;
    trend: TrendState;
    trendLabel: string;
  };

  waterTemp: {
    current: number;
    max: number;
    min: number;
    trend: TrendState;
    trendLabel: string;
  };

  tide: {
    label: string;
    direction: TideDirection;
    nextHigh: string;
    nextLow: string;
    amplitude: string;
  };

  wind: {
    direction: CardinalDirection;
    directionLabel: string;
    speed: number;
    gust: number;
    trend: TrendState;
    trendLabel: string;
  };

  swell: {
    height: string;
    period: string;
    direction: CardinalDirection;
    directionLabel: string;
    peak: string;
  };

  pressure: {
    current: number;
    max: number;
    min: number;
    trend: TrendState;
    trendLabel: string;
  };

  moon: {
    label: string;
    phase: MoonPhase;
    illumination: number;
    age: string;
    rise: string;
    set: string;
  };

  sun: {
    sunrise: string;
    sunset: string;
    lightPeriod: string;
  };

  depth: {
    value: string;
  };

  bottom: {
    label: string;
  };
};

export type SpotForecastInput = {
  id?: number | string;
  name?: string;
  lat?: number;
  lng?: number;
};

export const forecastDaysBase: Array<{ id: ForecastDayId; day: string; isToday?: boolean }> = [
  { id: "day-25", day: "25", isToday: true },
  { id: "day-26", day: "26" },
  { id: "day-27", day: "27" },
  { id: "day-28", day: "28" },
  { id: "day-29", day: "29" },
  { id: "day-30", day: "30" },
  { id: "day-01", day: "01" },
];

function formatDecimal(value: number, digits = 1) {
  return value.toFixed(digits).replace(".", ",");
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function makeSeed(input: SpotForecastInput) {
  const seedSource = [
    input.id ?? "",
    input.name ?? "",
    typeof input.lat === "number" ? input.lat.toFixed(6) : "",
    typeof input.lng === "number" ? input.lng.toFixed(6) : "",
  ].join("|");

  let seed = 2166136261;

  for (let index = 0; index < seedSource.length; index += 1) {
    seed ^= seedSource.charCodeAt(index);
    seed = Math.imul(seed, 16777619);
  }

  return seed >>> 0;
}

function getScoreLabel(score: number) {
  if (score >= 82) {
    return "Excelente";
  }

  if (score >= 70) {
    return "Muito bom";
  }

  if (score >= 58) {
    return "Bom";
  }

  return "Regular";
}

function pick<T>(items: T[], seed: number) {
  return items[Math.abs(seed) % items.length];
}

function getSeedValue(seed: number, index: number, min: number, max: number) {
  const mixed = Math.imul(seed ^ Math.imul(index + 1, 2654435761), 2246822519) >>> 0;
  const normalized = mixed / 4294967295;

  return min + normalized * (max - min);
}

export function getMockSpotForecastDays(input: SpotForecastInput = {}): SpotForecastDay[] {
  const seed = makeSeed(input);
  const pointOffset = Math.round(getSeedValue(seed, 7, -4, 4));
  const windDirections: CardinalDirection[] = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  const directionLabels: Record<CardinalDirection, string> = {
    N: "Norte",
    NE: "Nordeste",
    E: "Leste",
    SE: "Sudeste",
    S: "Sul",
    SW: "Sudoeste",
    W: "Oeste",
    NW: "Noroeste",
  };
  const weatherOptions: Array<{ label: string; condition: WeatherCondition; rain: number; clouds: number }> = [
    { label: "Ensolarado", condition: "clear", rain: 8, clouds: 18 },
    { label: "Parcialmente nublado", condition: "partlyCloudy", rain: 18, clouds: 42 },
    { label: "Nublado", condition: "cloudy", rain: 28, clouds: 68 },
    { label: "Chuva fraca", condition: "rain", rain: 54, clouds: 82 },
    { label: "Neblina", condition: "fog", rain: 22, clouds: 74 },
  ];
  const tideOptions: Array<{ label: string; direction: TideDirection }> = [
    { label: "Enchendo", direction: "rising" },
    { label: "Vazando", direction: "falling" },
    { label: "Parada", direction: "slack" },
  ];
  const moonOptions: Array<{ label: string; phase: MoonPhase; illumination: number }> = [
    { label: "Nova", phase: "new", illumination: 4 },
    { label: "Crescente", phase: "waxingCrescent", illumination: 35 },
    { label: "Quarto crescente", phase: "firstQuarter", illumination: 52 },
    { label: "Gibosa crescente", phase: "waxingGibbous", illumination: 72 },
    { label: "Cheia", phase: "full", illumination: 98 },
    { label: "Minguante", phase: "waningCrescent", illumination: 28 },
  ];
  const bottomOptions = ["Areia e Pedra", "Areia compacta", "Pedra e cascalho", "Lodo e areia"];
  const bestTimeOptions: Array<[string, string]> = [
    ["05h as 07h", "16h as 18h"],
    ["06h as 08h", "18h as 20h"],
    ["09h as 11h", "15h as 17h"],
    ["14h as 16h", "19h as 21h"],
  ];

  return forecastDaysBase.map((baseDay, index) => {
    const daySeed = seed + index * 97;
    const distanceFromReferenceDay = index - 2;
    const dayWave = Math.sin((index + 1) * 1.37 + (seed % 23));
    const scoreBase = index === 2
      ? 82 + pointOffset
      : 82 + pointOffset + dayWave * 8 - Math.abs(distanceFromReferenceDay) * 2;
    const score = Math.round(clamp(scoreBase, 48, 94));
    const weather = index === 2
      ? pick(weatherOptions.slice(0, 2), seed)
      : pick(weatherOptions, daySeed);
    const tide = index === 2 ? tideOptions[0] : pick(tideOptions, daySeed + 13);
    const windDirection = index === 2 ? "NE" : pick(windDirections, daySeed + 31);
    const swellDirection = pick(windDirections, daySeed + 47);
    const airCurrentBase = index === 2
      ? 26 + pointOffset * 0.08
      : 26 + pointOffset * 0.18 + distanceFromReferenceDay * 0.45 + dayWave * 1.4;
    const waterCurrentBase = index === 2
      ? 22.4 + pointOffset * 0.04
      : 22.4 + pointOffset * 0.08 + distanceFromReferenceDay * 0.22 + dayWave * 0.5;
    const airCurrent = clamp(airCurrentBase, 18, 31);
    const waterCurrent = clamp(waterCurrentBase, 18, 27);
    const pressureCurrent = Math.round(clamp(1016 + pointOffset + distanceFromReferenceDay + dayWave * 3, 1007, 1026));
    const windSpeedBase = index === 2
      ? 8 + pointOffset * 0.25
      : 8 + pointOffset * 0.4 + Math.abs(distanceFromReferenceDay) * 2 + dayWave * 3;
    const windSpeed = Math.round(clamp(windSpeedBase, 4, 24));
    const moon = index === 2 ? moonOptions[1] : pick(moonOptions, daySeed + 61);
    const trend: TrendState = dayWave > 0.35 ? "rising" : dayWave < -0.35 ? "falling" : "stable";
    const trendLabelByState: Record<TrendState, string> = {
      rising: "Aumenta a tarde",
      falling: "Leve queda",
      stable: "Estavel",
    };
    const highHour = String(clamp(16 + distanceFromReferenceDay, 12, 22)).padStart(2, "0");
    const lowHour = String(clamp(22 + distanceFromReferenceDay, 0, 23)).padStart(2, "0");
    const swellHeight = clamp(0.7 + pointOffset * 0.03 + Math.abs(dayWave) * 0.35, 0.4, 1.6);
    const swellPeriod = Math.round(clamp(8 + dayWave * 2 + Math.abs(pointOffset) * 0.25, 6, 12));
    const sunriseMinutes = Math.round(408 + pointOffset + distanceFromReferenceDay * 2);
    const sunsetMinutes = Math.round(1062 - pointOffset + distanceFromReferenceDay * 2);
    const formatClock = (minutes: number) => {
      const hour = Math.floor(minutes / 60);
      const minute = minutes % 60;

      return `${String(hour).padStart(2, "0")}h${String(minute).padStart(2, "0")}`;
    };

    return {
      ...baseDay,
      score,
      scoreLabel: getScoreLabel(score),
      bestTimes: index === 2 ? ["14h as 16h", "19h as 21h"] : pick(bestTimeOptions, daySeed + 71),
      weather: {
        label: weather.label,
        condition: weather.condition,
        rainChance: Math.round(clamp(weather.rain + dayWave * 8, 2, 78)),
        cloudCover: Math.round(clamp(weather.clouds + dayWave * 10, 8, 92)),
        visibility: weather.condition === "fog" ? "Moderada" : weather.condition === "rain" ? "Regular" : "Boa",
      },
      airTemp: {
        current: Number(airCurrent.toFixed(1)),
        max: Number(clamp(airCurrent + 1.5 + Math.abs(dayWave), 20, 34).toFixed(1)),
        min: Number(clamp(airCurrent - 4.2 + dayWave * 0.4, 14, 28).toFixed(1)),
        trend,
        trendLabel: trendLabelByState[trend],
      },
      waterTemp: {
        current: Number(waterCurrent.toFixed(1)),
        max: Number(clamp(waterCurrent + 0.4 + Math.abs(dayWave) * 0.2, 18, 29).toFixed(1)),
        min: Number(clamp(waterCurrent - 0.4 - Math.abs(dayWave) * 0.2, 16, 27).toFixed(1)),
        trend: Math.abs(dayWave) < 0.5 ? "stable" : trend,
        trendLabel: Math.abs(dayWave) < 0.5 ? "Estavel" : trendLabelByState[trend],
      },
      tide: {
        label: tide.label,
        direction: tide.direction,
        nextHigh: `${highHour}h42 - ${formatDecimal(clamp(1.4 + dayWave * 0.2, 0.8, 1.8))} m`,
        nextLow: `${lowHour}h18 - ${formatDecimal(clamp(0.3 + dayWave * 0.12, 0.1, 0.7))} m`,
        amplitude: `${formatDecimal(clamp(1.1 + dayWave * 0.18, 0.6, 1.6))} m`,
      },
      wind: {
        direction: windDirection,
        directionLabel: directionLabels[windDirection],
        speed: windSpeed,
        gust: Math.round(windSpeed + clamp(8 + Math.abs(dayWave) * 5, 5, 16)),
        trend,
        trendLabel: trendLabelByState[trend],
      },
      swell: {
        height: `${formatDecimal(swellHeight)} m`,
        period: `${swellPeriod} s`,
        direction: swellDirection,
        directionLabel: directionLabels[swellDirection],
        peak: `${formatDecimal(clamp(swellHeight + 0.3, 0.6, 1.9))} m as 18h`,
      },
      pressure: {
        current: pressureCurrent,
        max: pressureCurrent + Math.round(clamp(2 + Math.max(dayWave, 0), 2, 5)),
        min: pressureCurrent - Math.round(clamp(2 + Math.max(-dayWave, 0), 2, 5)),
        trend,
        trendLabel: trendLabelByState[trend],
      },
      moon: {
        label: moon.label,
        phase: moon.phase,
        illumination: Math.round(clamp(moon.illumination + distanceFromReferenceDay * 4, 0, 100)),
        age: `${Math.round(clamp(8 + index * 1.6 + pointOffset * 0.2, 1, 28))} dias`,
        rise: `${String(clamp(9 + index, 5, 23)).padStart(2, "0")}h12`,
        set: `${String(clamp(21 + index, 0, 23)).padStart(2, "0")}h35`,
      },
      sun: {
        sunrise: formatClock(sunriseMinutes),
        sunset: formatClock(sunsetMinutes),
        lightPeriod: `${formatClock(sunriseMinutes)} as ${formatClock(sunsetMinutes)}`,
      },
      depth: {
        value: `${formatDecimal(clamp(4.2 + pointOffset * 0.08 + dayWave * 0.3, 1.8, 9.5))} m`,
      },
      bottom: {
        label: index === 2 ? "Areia e Pedra" : pick(bottomOptions, daySeed + 83),
      },
    };
  });
}

export function getSelectedForecastDay(
  forecastDays: SpotForecastDay[],
  selectedForecastDayId?: string
): SpotForecastDay {
  return forecastDays.find((forecastDay) => forecastDay.id === selectedForecastDayId) ?? forecastDays[0];
}
