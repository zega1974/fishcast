import type { Capture, CaptureShareMode } from "./types";

type CreateCaptureShareImageOptions = {
  capture: Capture;
  shareMode: CaptureShareMode;
  formatCaptureDate: (value: string) => string;
  getCaptureLocationText: (capture: Capture, shareMode: CaptureShareMode) => string;
};

type ShareCaptureOptions = CreateCaptureShareImageOptions & {
  onFeedback: (captureId: number, message: string) => void;
  onShareOptionsClose: () => void;
};

const ART_WIDTH = 430;
const ART_HEIGHT = 764;
const CANVAS_WIDTH = 1080;
const CANVAS_HEIGHT = 1920;
const SCALE = CANVAS_WIDTH / ART_WIDTH;

function drawRoundedRect(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  const cornerRadius = Math.min(radius, width / 2, height / 2);

  context.beginPath();
  context.moveTo(x + cornerRadius, y);
  context.arcTo(x + width, y, x + width, y + height, cornerRadius);
  context.arcTo(x + width, y + height, x, y + height, cornerRadius);
  context.arcTo(x, y + height, x, y, cornerRadius);
  context.arcTo(x, y, x + width, y, cornerRadius);
  context.closePath();
}

function drawWrappedText(
  context: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  maxLines = 3
) {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = "";

  for (const word of words) {
    const nextLine = line ? `${line} ${word}` : word;

    if (context.measureText(nextLine).width <= maxWidth) {
      line = nextLine;
      continue;
    }

    if (line) {
      lines.push(line);
    }

    line = word;

    if (lines.length === maxLines) {
      break;
    }
  }

  if (line && lines.length < maxLines) {
    lines.push(line);
  }

  lines.forEach((wrappedLine, index) => {
    context.fillText(wrappedLine, x, y + index * lineHeight);
  });

  return lines.length * lineHeight;
}

function truncateText(
  context: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
) {
  if (context.measureText(text).width <= maxWidth) {
    return text;
  }

  let truncated = text;

  while (truncated.length > 0 && context.measureText(`${truncated}...`).width > maxWidth) {
    truncated = truncated.slice(0, -1);
  }

  return `${truncated.trim()}...`;
}

function normalizeText(value: string | number | null | undefined, fallback = "--") {
  const text = String(value ?? "").trim();

  return text || fallback;
}

function normalizeObservation(value: string | null | undefined) {
  const text = normalizeText(value, "Sem observações adicionadas.");

  return text.length > 150 ? `${text.slice(0, 147).trim()}...` : text;
}

function normalizeDateText(value: string) {
  return value
    .replace(/[📅🗓️]/gu, "")
    .replace(/\s+/g, " ")
    .trim();
}

function getFittedFont(
  context: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  maxSize: number,
  minSize: number,
  weight: number
) {
  for (let size = maxSize; size >= minSize; size -= 1) {
    const font = `${weight} ${size}px Arial, sans-serif`;

    context.font = font;

    if (context.measureText(text).width <= maxWidth) {
      return font;
    }
  }

  return `${weight} ${minSize}px Arial, sans-serif`;
}

function drawContainedImage(
  context: CanvasRenderingContext2D,
  image: HTMLImageElement,
  x: number,
  y: number,
  width: number,
  height: number
) {
  const scale = Math.min(width / image.width, height / image.height);
  const drawWidth = image.width * scale;
  const drawHeight = image.height * scale;
  const drawX = x + (width - drawWidth) / 2;
  const drawY = y + (height - drawHeight) / 2;

  context.drawImage(image, drawX, drawY, drawWidth, drawHeight);
}

function getPhotoFrameLayout(image: HTMLImageElement | null) {
  const areaX = 17;
  const areaY = 252;
  const areaWidth = ART_WIDTH - 34;
  const footerTop = ART_HEIGHT - 17 - 70;
  const notesHeight = 84;
  const verticalGap = 12;
  const maxHeight = footerTop - verticalGap - notesHeight - verticalGap - areaY;

  const rawRatio =
    image && image.width > 0 && image.height > 0 ? image.width / image.height : 4 / 3;
  const ratio = rawRatio > 0 ? rawRatio : 4 / 3;

  let width = areaWidth;
  let height = width / ratio;

  if (height > maxHeight) {
    height = maxHeight;
    width = height * ratio;
  }

  width = Math.min(width, areaWidth);

  if (image && ratio < 0.9) {
    const preferredPortraitWidth = Math.min(areaWidth, 230);

    width = Math.max(width, preferredPortraitWidth);
    height = width / ratio;

    if (height > maxHeight) {
      height = maxHeight;
      width = height * ratio;
    }
  }

  return {
    x: areaX + (areaWidth - width) / 2,
    y: areaY,
    width,
    height,
  };
}

function removeCoordinateLikeText(value: string) {
  return value
    .replace(/-?\d{1,3}[.,]\d{3,}\s*,\s*-?\d{1,3}[.,]\d{3,}/g, "")
    .replace(/lat(?:itude)?\.?:?\s*-?\d+[.,]\d+/gi, "")
    .replace(/lon(?:gitude)?\.?:?\s*-?\d+[.,]\d+/gi, "")
    .replace(/coordenadas?.*$/gi, "")
    .replace(/\s+/g, " ")
    .trim();
}

function getShareLocationParts(
  capture: Capture,
  shareMode: CaptureShareMode,
  getCaptureLocationText: (capture: Capture, shareMode: CaptureShareMode) => string
) {
  const locationText = getCaptureLocationText(capture, shareMode);

  if (shareMode === "secret") {
    return {
      locationName: removeCoordinateLikeText(locationText) || "Região aproximada",
      coordinates: "",
    };
  }

  const [locationName, ...coordinatesParts] = locationText.split("\n");

  return {
    locationName: normalizeText(locationName, "Local da captura"),
    coordinates: normalizeText(coordinatesParts.join(" ").trim(), "--"),
  };
}

function splitLocationCity(value: string) {
  const clean = value.replace(/\s+/g, " ").trim();

  if (!clean) {
    return {
      prefix: "Região aproximada de",
      city: "Matinhos",
    };
  }

  const words = clean.split(" ");
  const city = words.length > 1 ? words[words.length - 1] : clean;
  const prefix = words.length > 1 ? words.slice(0, -1).join(" ") : "";

  return {
    prefix,
    city,
  };
}

function loadImage(src: string | null | undefined) {
  return new Promise<HTMLImageElement | null>((resolve) => {
    if (!src) {
      resolve(null);
      return;
    }

    const image = new Image();

    image.onload = () => resolve(image);
    image.onerror = () => resolve(null);
    image.src = src;
  });
}

function canvasToPngBlob(canvas: HTMLCanvasElement) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
        return;
      }

      reject(new Error("Não foi possível gerar a imagem"));
    }, "image/png", 0.95);
  });
}

function drawLineIconBase(
  context: CanvasRenderingContext2D,
  strokeStyle = "rgba(125, 211, 252, 0.9)"
) {
  context.strokeStyle = strokeStyle;
  context.lineWidth = 3;
  context.lineCap = "round";
  context.lineJoin = "round";
  context.fillStyle = "transparent";
}

function drawLockIcon(context: CanvasRenderingContext2D, x: number, y: number, size: number, unlocked = false) {
  context.save();
  context.translate(x, y);
  context.scale(size / 48, size / 48);
  drawLineIconBase(context);

  drawRoundedRect(context, 13, 21, 22, 18, 3);
  context.stroke();

  context.beginPath();
  if (unlocked) {
    context.moveTo(18, 21);
    context.lineTo(18, 16);
    context.bezierCurveTo(18, 12.7, 20.7, 10, 24, 10);
    context.bezierCurveTo(26.3, 10, 28.3, 11.3, 29.3, 13.2);
  } else {
    context.moveTo(18, 21);
    context.lineTo(18, 16);
    context.bezierCurveTo(18, 12.7, 20.7, 10, 24, 10);
    context.bezierCurveTo(27.3, 10, 30, 12.7, 30, 16);
    context.lineTo(30, 21);
  }
  context.stroke();

  context.beginPath();
  context.moveTo(24, 28);
  context.lineTo(24, 33);
  context.stroke();

  context.restore();
}

function drawWeightIcon(context: CanvasRenderingContext2D, x: number, y: number, size: number) {
  context.save();
  context.translate(x, y);
  context.scale(size / 48, size / 48);
  drawLineIconBase(context);

  context.beginPath();
  context.moveTo(16, 18);
  context.lineTo(32, 18);
  context.lineTo(34.8, 38);
  context.lineTo(13.2, 38);
  context.closePath();
  context.stroke();

  context.beginPath();
  context.moveTo(19, 18);
  context.bezierCurveTo(19, 11.5, 29, 11.5, 29, 18);
  context.stroke();

  context.beginPath();
  context.moveTo(24, 26);
  context.lineTo(24, 32);
  context.stroke();

  context.restore();
}

function drawRulerIcon(context: CanvasRenderingContext2D, x: number, y: number, size: number) {
  context.save();
  context.translate(x, y);
  context.scale(size / 48, size / 48);
  drawLineIconBase(context);

  context.beginPath();
  context.moveTo(8, 34);
  context.lineTo(34, 8);
  context.lineTo(40, 14);
  context.lineTo(14, 40);
  context.closePath();
  context.stroke();

  [[16, 32, 13, 29], [22, 26, 19, 23], [28, 20, 25, 17]].forEach(([x1, y1, x2, y2]) => {
    context.beginPath();
    context.moveTo(x1, y1);
    context.lineTo(x2, y2);
    context.stroke();
  });

  context.restore();
}

function drawCalendarIcon(context: CanvasRenderingContext2D, x: number, y: number, size: number) {
  context.save();
  context.translate(x, y);
  context.scale(size / 48, size / 48);
  drawLineIconBase(context);

  drawRoundedRect(context, 8, 10, 32, 30, 6);
  context.stroke();

  [[16, 6, 16, 14], [32, 6, 32, 14], [8, 20, 40, 20], [24, 28, 31, 28]].forEach(
    ([x1, y1, x2, y2]) => {
      context.beginPath();
      context.moveTo(x1, y1);
      context.lineTo(x2, y2);
      context.stroke();
    }
  );

  context.restore();
}

function drawPinIcon(context: CanvasRenderingContext2D, x: number, y: number, size: number) {
  context.save();
  context.translate(x, y);
  context.scale(size / 48, size / 48);
  drawLineIconBase(context, "rgba(125, 211, 252, 0.82)");
  context.fillStyle = "rgba(14, 165, 233, 0.08)";

  context.beginPath();
  context.moveTo(24, 43);
  context.bezierCurveTo(24, 43, 38, 30.5, 38, 18);
  context.bezierCurveTo(38, 10.3, 31.7, 4, 24, 4);
  context.bezierCurveTo(16.3, 4, 10, 10.3, 10, 18);
  context.bezierCurveTo(10, 30.5, 24, 43, 24, 43);
  context.closePath();
  context.fill();
  context.stroke();

  context.beginPath();
  context.arc(24, 18, 5, 0, Math.PI * 2);
  context.stroke();

  context.restore();
}

function drawShieldIcon(context: CanvasRenderingContext2D, x: number, y: number, size: number) {
  context.save();
  context.translate(x, y);
  context.scale(size / 48, size / 48);
  drawLineIconBase(context, "rgba(226, 232, 240, 0.86)");

  context.beginPath();
  context.moveTo(24, 6);
  context.lineTo(38, 12);
  context.lineTo(38, 23);
  context.bezierCurveTo(38, 34, 29.5, 40, 24, 43);
  context.bezierCurveTo(18.5, 40, 10, 34, 10, 23);
  context.lineTo(10, 12);
  context.closePath();
  context.stroke();

  context.beginPath();
  context.moveTo(17, 24);
  context.lineTo(22, 29);
  context.lineTo(32, 16);
  context.stroke();

  context.restore();
}

function drawNotesIcon(context: CanvasRenderingContext2D, x: number, y: number, size: number) {
  context.save();
  context.translate(x, y);
  context.scale(size / 48, size / 48);
  drawLineIconBase(context);

  drawRoundedRect(context, 11, 8, 26, 32, 4);
  context.stroke();

  [[18, 18, 30, 18], [18, 25, 30, 25], [18, 32, 25, 32]].forEach(([x1, y1, x2, y2]) => {
    context.beginPath();
    context.moveTo(x1, y1);
    context.lineTo(x2, y2);
    context.stroke();
  });

  context.restore();
}

function drawQrPlaceholder(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number
) {
  context.save();

  context.fillStyle = "#ffffff";
  drawRoundedRect(context, x, y, size, size, 8);
  context.fill();

  context.fillStyle = "#020617";

  const finderSize = size * 0.31;
  const finderInset = size * 0.07;

  const drawFinder = (finderX: number, finderY: number) => {
    context.fillStyle = "#020617";
    context.fillRect(finderX, finderY, finderSize, finderSize);
    context.fillStyle = "#ffffff";
    context.fillRect(finderX + finderSize * 0.14, finderY + finderSize * 0.14, finderSize * 0.72, finderSize * 0.72);
    context.fillStyle = "#020617";
    context.fillRect(finderX + finderSize * 0.3, finderY + finderSize * 0.3, finderSize * 0.4, finderSize * 0.4);
  };

  drawFinder(x + finderInset, y + finderInset);
  drawFinder(x + size - finderInset - finderSize, y + finderInset);
  drawFinder(x + finderInset, y + size - finderInset - finderSize);

  const cellSize = size / 21;

  context.fillStyle = "#020617";

  for (let row = 0; row < 21; row += 1) {
    for (let column = 0; column < 21; column += 1) {
      const inTopLeft = column < 8 && row < 8;
      const inTopRight = column > 12 && row < 8;
      const inBottomLeft = column < 8 && row > 12;

      if (inTopLeft || inTopRight || inBottomLeft) {
        continue;
      }

      const fill =
        (column * 7 + row * 11 + column * row) % 5 === 0 ||
        (column + row) % 9 === 0 ||
        (row === 10 && column > 3 && column < 18) ||
        (column === 10 && row > 3 && row < 18);

      if (fill) {
        context.fillRect(
          x + column * cellSize,
          y + row * cellSize,
          Math.ceil(cellSize),
          Math.ceil(cellSize)
        );
      }
    }
  }

  context.restore();
}

function drawPhotoFallback(context: CanvasRenderingContext2D, x: number, y: number, width: number, height: number) {
  context.save();

  context.fillStyle = "#020617";
  context.fillRect(x, y, width, height);

  const sky = context.createLinearGradient(x, y, x, y + height * 0.45);
  sky.addColorStop(0, "rgba(56, 189, 248, 0.78)");
  sky.addColorStop(1, "rgba(186, 230, 253, 0.72)");
  context.fillStyle = sky;
  context.globalAlpha = 0.62;
  context.fillRect(x, y, width, height * 0.45);
  context.globalAlpha = 1;

  context.fillStyle = "rgba(255, 255, 255, 0.44)";
  context.beginPath();
  context.ellipse(x + width * 0.15, y + height * 0.16, width * 0.08, height * 0.05, 0, 0, Math.PI * 2);
  context.fill();

  context.beginPath();
  context.ellipse(x + width * 0.34, y + height * 0.17, width * 0.06, height * 0.04, 0, 0, Math.PI * 2);
  context.fill();

  context.beginPath();
  context.ellipse(x + width * 0.83, y + height * 0.16, width * 0.07, height * 0.04, 0, 0, Math.PI * 2);
  context.fill();

  const shore = context.createLinearGradient(x, y + height * 0.4, x + width, y + height * 0.52);
  shore.addColorStop(0, "rgba(22, 101, 52, 0.82)");
  shore.addColorStop(1, "rgba(15, 118, 110, 0.62)");
  context.fillStyle = shore;
  context.fillRect(x - width * 0.05, y + height * 0.4, width * 1.1, height * 0.12);

  const water = context.createLinearGradient(x, y + height * 0.46, x + width, y + height);
  water.addColorStop(0, "rgba(12, 74, 110, 0.86)");
  water.addColorStop(1, "rgba(15, 23, 42, 0.98)");
  context.fillStyle = water;
  context.fillRect(x - width * 0.06, y + height * 0.46, width * 1.12, height * 0.62);

  context.strokeStyle = "rgba(255, 255, 255, 0.08)";
  context.lineWidth = 1;

  for (let line = 0; line < 18; line += 1) {
    context.beginPath();
    context.moveTo(x - 20, y + height * 0.5 + line * 18);
    context.lineTo(x + width + 20, y + height * 0.45 + line * 18);
    context.stroke();
  }

  const personX = x + width * 0.62;
  const personY = y + height * 0.34;
  const personW = width * 0.27;
  const personH = height * 0.61;

  const body = context.createLinearGradient(personX, personY, personX, personY + personH);
  body.addColorStop(0, "#101827");
  body.addColorStop(0.57, "#101827");
  body.addColorStop(0.58, "#020617");
  body.addColorStop(1, "#020617");
  context.fillStyle = body;
  drawRoundedRect(context, personX, personY, personW, personH, 28);
  context.fill();

  context.fillStyle = "#0f172a";
  drawRoundedRect(context, x + width * 0.69, y + height * 0.33, width * 0.16, height * 0.07, 999);
  context.fill();

  context.fillStyle = "#38bdf8";
  context.font = "900 8px Arial, sans-serif";
  context.textAlign = "center";
  context.fillText("VP", x + width * 0.77, y + height * 0.375);
  context.textAlign = "left";

  const fishX = x + width * 0.04;
  const fishY = y + height * 0.39;
  const fishW = width * 0.81;
  const fishH = height * 0.25;

  context.save();
  context.translate(fishX + fishW / 2, fishY + fishH / 2);
  context.rotate((-2 * Math.PI) / 180);

  const fishGradient = context.createLinearGradient(-fishW / 2, 0, fishW / 2, 0);
  fishGradient.addColorStop(0, "#f8fafc");
  fishGradient.addColorStop(0.34, "#cbd5e1");
  fishGradient.addColorStop(0.68, "#94a3b8");
  fishGradient.addColorStop(1, "#64748b");

  context.fillStyle = fishGradient;
  context.beginPath();
  context.ellipse(0, 0, fishW / 2, fishH / 2, 0, 0, Math.PI * 2);
  context.fill();

  context.strokeStyle = "rgba(15, 23, 42, 0.54)";
  context.lineWidth = 4;
  context.beginPath();
  context.moveTo(-fishW * 0.38, fishH * 0.06);
  context.lineTo(fishW * 0.34, fishH * 0.04);
  context.stroke();

  context.fillStyle = "rgba(2, 6, 23, 0.92)";
  context.beginPath();
  context.arc(-fishW * 0.35, -fishH * 0.07, fishH * 0.08, 0, Math.PI * 2);
  context.fill();

  context.restore();

  context.fillStyle = "rgba(148, 163, 184, 0.88)";
  context.beginPath();
  context.moveTo(x + width * 0.81, y + height * 0.52);
  context.lineTo(x + width * 0.98, y + height * 0.4);
  context.lineTo(x + width * 0.92, y + height * 0.52);
  context.lineTo(x + width * 0.98, y + height * 0.64);
  context.closePath();
  context.fill();

  context.restore();
}

function drawBackground(context: CanvasRenderingContext2D) {
  const background = context.createLinearGradient(0, 0, ART_WIDTH, ART_HEIGHT);
  background.addColorStop(0, "#07101a");
  background.addColorStop(1, "#050a0f");

  context.fillStyle = background;
  context.fillRect(0, 0, ART_WIDTH, ART_HEIGHT);

  context.fillStyle = "rgba(14, 116, 144, 0.12)";
  context.beginPath();
  context.arc(ART_WIDTH / 2, ART_HEIGHT * 0.08, ART_WIDTH * 0.34, 0, Math.PI * 2);
  context.fill();

  context.fillStyle = "rgba(30, 42, 56, 0.42)";
  context.beginPath();
  context.arc(ART_WIDTH / 2, ART_HEIGHT * 0.24, ART_WIDTH * 0.44, 0, Math.PI * 2);
  context.fill();

  context.strokeStyle = "rgba(35, 82, 148, 0.055)";
  context.lineWidth = 1;

  for (let gridX = 0; gridX <= ART_WIDTH; gridX += 56) {
    context.beginPath();
    context.moveTo(gridX, 0);
    context.lineTo(gridX, ART_HEIGHT * 0.58);
    context.stroke();
  }
}

function drawMainCard(context: CanvasRenderingContext2D) {
  const cardGradient = context.createLinearGradient(0, 0, ART_WIDTH, ART_HEIGHT);
  cardGradient.addColorStop(0, "rgba(23, 31, 42, 0.92)");
  cardGradient.addColorStop(1, "rgba(7, 12, 18, 0.98)");

  context.fillStyle = cardGradient;
  drawRoundedRect(context, 0.5, 0.5, ART_WIDTH - 1, ART_HEIGHT - 1, 22);
  context.fill();

  context.strokeStyle = "rgba(56, 189, 248, 0.46)";
  context.lineWidth = 1;
  drawRoundedRect(context, 0.5, 0.5, ART_WIDTH - 1, ART_HEIGHT - 1, 22);
  context.stroke();

  context.strokeStyle = "rgba(56, 189, 248, 0.28)";
  context.lineWidth = 1;
  drawRoundedRect(context, 9, 9, ART_WIDTH - 18, ART_HEIGHT - 18, 17);
  context.stroke();

  context.fillStyle = "rgba(14, 165, 233, 0.09)";
  context.filter = "blur(34px)";
  context.beginPath();
  context.arc(ART_WIDTH / 2, -ART_HEIGHT * 0.22, ART_WIDTH * 0.34, 0, Math.PI * 2);
  context.fill();
  context.filter = "none";

  context.strokeStyle = "rgba(35, 82, 148, 0.07)";
  context.globalAlpha = 0.22;

  for (let gridX = 0; gridX <= ART_WIDTH; gridX += 54) {
    context.beginPath();
    context.moveTo(gridX, 0);
    context.lineTo(gridX, ART_HEIGHT * 0.58);
    context.stroke();
  }

  context.globalAlpha = 1;
}

function drawHeader({
  context,
  capture,
  shareMode,
  shareLocationName,
  shareCoordinates,
  dateText,
}: {
  context: CanvasRenderingContext2D;
  capture: Capture;
  shareMode: CaptureShareMode;
  shareLocationName: string;
  shareCoordinates: string;
  dateText: string;
}) {
  const isSecret = shareMode === "secret";
  const modeLabel = isSecret ? "MODO SECRETO" : "MODO COMPLETO";
  const locationParts = splitLocationCity(shareLocationName);
  const cleanDateText = normalizeDateText(dateText);

  context.fillStyle = "rgba(2, 6, 23, 0.32)";
  drawRoundedRect(context, 18, 17, 166, 30, 999);
  context.fill();

  context.strokeStyle = "rgba(56, 189, 248, 0.44)";
  context.lineWidth = 1;
  drawRoundedRect(context, 18, 17, 166, 30, 999);
  context.stroke();

  drawLockIcon(context, 32, 24, 16, !isSecret);

  context.fillStyle = "#7dd3fc";
  context.font = "840 10px Arial, sans-serif";
  context.letterSpacing = "2.1px";
  context.fillText(modeLabel, 54, 36);

  context.font = "820 12px Arial, sans-serif";
  context.fillStyle = "#38bdf8";
  context.letterSpacing = "3.4px";
  context.fillText("MINHA CAPTURA", 18, 113);

  const metaX = 242;
  const speciesText = normalizeText(capture.species, "Espécie");
  const speciesMaxWidth = metaX - 26;

  context.letterSpacing = "0px";
  context.fillStyle = "rgba(248, 250, 252, 0.98)";
  context.font = getFittedFont(context, speciesText, speciesMaxWidth, 37, 21, 860);
  context.fillText(
    truncateText(context, speciesText, speciesMaxWidth),
    18,
    160
  );

  const weightText = capture.weight ? `${capture.weight} kg` : "--";
  const sizeText = capture.size ? `${capture.size} cm` : "--";

  drawWeightIcon(context, metaX, 92, 18);
  context.fillStyle = "rgba(248, 250, 252, 0.94)";
  context.font = "760 16px Arial, sans-serif";
  context.fillText(weightText, metaX + 26, 105);

  context.strokeStyle = "rgba(56, 189, 248, 0.32)";
  context.lineWidth = 1;
  context.beginPath();
  context.moveTo(324, 88);
  context.lineTo(324, 110);
  context.stroke();

  drawRulerIcon(context, 332, 92, 18);
  context.fillStyle = "rgba(248, 250, 252, 0.94)";
  context.font = "760 14px Arial, sans-serif";
  context.textAlign = "left";
  context.fillText(sizeText, 360, 105);
  context.textAlign = "left";

  context.strokeStyle = "rgba(125, 211, 252, 0.2)";
  context.lineWidth = 1;
  context.beginPath();
  context.moveTo(metaX, 119);
  context.lineTo(394, 119);
  context.stroke();

  drawCalendarIcon(context, metaX, 129, 18);

  context.fillStyle = "rgba(248, 250, 252, 0.92)";
  context.font = "670 14px Arial, sans-serif";
  context.textAlign = "right";
  context.fillText(truncateText(context, cleanDateText, 134), 392, 143);
  context.textAlign = "left";

  context.strokeStyle = "rgba(125, 211, 252, 0.2)";
  context.beginPath();
  context.moveTo(metaX, 152);
  context.lineTo(394, 152);
  context.stroke();

  context.strokeStyle = "rgba(125, 211, 252, 0.14)";
  context.beginPath();
  context.moveTo(18, 173);
  context.lineTo(412, 173);
  context.stroke();

  drawPinIcon(context, 18, 184, 29);

  context.fillStyle = "rgba(248, 250, 252, 0.94)";
  context.font = "600 15px Arial, sans-serif";

  const locationPrefix = locationParts.prefix ? `${locationParts.prefix} ` : "";
  const locationTextWidth = context.measureText(locationPrefix).width;
  context.fillText(locationPrefix, 58, 205);

  context.fillStyle = "#38bdf8";
  context.font = "780 15px Arial, sans-serif";
  context.fillText(
    truncateText(context, locationParts.city, 320 - locationTextWidth),
    58 + locationTextWidth,
    205
  );

  context.fillStyle = "rgba(226, 232, 240, 0.72)";
  context.font = "520 10.6px Arial, sans-serif";

  if (isSecret) {
    drawShieldIcon(context, 58, 214, 14);
    context.fillText("Ponto exato e coordenadas não são exibidos.", 78, 225);
  } else {
    context.fillText(truncateText(context, shareCoordinates, 330), 58, 225);
  }
}

function drawPhotoFrame({
  context,
  image,
}: {
  context: CanvasRenderingContext2D;
  image: HTMLImageElement | null;
}) {
  const layout = getPhotoFrameLayout(image);
  const { x, y, width, height } = layout;

  context.save();
  drawRoundedRect(context, x, y, width, height, 21);
  context.clip();

  context.fillStyle = "rgba(2, 6, 23, 0.48)";
  context.fillRect(x, y, width, height);

  const softFill = context.createLinearGradient(x, y, x + width, y + height);
  softFill.addColorStop(0, "rgba(12, 74, 110, 0.68)");
  softFill.addColorStop(1, "rgba(2, 6, 23, 0.94)");
  context.fillStyle = softFill;
  context.fillRect(x, y, width, height);

  if (image) {
    drawContainedImage(context, image, x, y, width, height);
  } else {
    drawPhotoFallback(context, x, y, width, height);
  }

  context.restore();

  context.strokeStyle = "rgba(56, 189, 248, 0.36)";
  context.lineWidth = 1;
  drawRoundedRect(context, x, y, width, height, 21);
  context.stroke();

  return layout;
}

function drawNotes(
  context: CanvasRenderingContext2D,
  capture: Capture,
  topY: number
) {
  const x = 17;
  const y = Math.round(topY);
  const width = ART_WIDTH - 34;
  const minHeight = 84;

  const gradient = context.createLinearGradient(x, y, x + width, y + minHeight);
  gradient.addColorStop(0, "rgba(23, 31, 42, 0.88)");
  gradient.addColorStop(1, "rgba(10, 16, 23, 0.94)");

  context.fillStyle = gradient;
  drawRoundedRect(context, x, y, width, minHeight, 18);
  context.fill();

  context.strokeStyle = "rgba(148, 163, 184, 0.18)";
  context.lineWidth = 1;
  drawRoundedRect(context, x, y, width, minHeight, 18);
  context.stroke();

  drawNotesIcon(context, x + 16, y + 15, 18);

  context.fillStyle = "#38bdf8";
  context.font = "860 11px Arial, sans-serif";
  context.letterSpacing = "2.4px";
  context.fillText("OBSERVAÇÕES", x + 42, y + 28);

  context.letterSpacing = "0px";
  context.fillStyle = "rgba(248, 250, 252, 0.92)";
  context.font = "500 13px Arial, sans-serif";
  drawWrappedText(
    context,
    normalizeObservation(capture.comment),
    x + 16,
    y + 54,
    width - 32,
    16,
    2
  );
}

function drawFooter(context: CanvasRenderingContext2D, logo: HTMLImageElement | null) {
  const left = 17;
  const right = ART_WIDTH - 17;
  const bottom = ART_HEIGHT - 17;
  const footerY = bottom - 70;

  context.strokeStyle = "rgba(56, 189, 248, 0.28)";
  context.lineWidth = 1;
  context.beginPath();
  context.moveTo(left, footerY);
  context.lineTo(right, footerY);
  context.stroke();

  const logoX = left + 9;
  const logoY = footerY + 13;
  const logoSize = 40;

  if (logo) {
    context.save();
    drawRoundedRect(context, logoX, logoY, logoSize, logoSize, 12);
    context.clip();

    const zoom = 1.18;
    const drawSize = logoSize * zoom;

    context.drawImage(
      logo,
      logoX + (logoSize - drawSize) / 2,
      logoY + (logoSize - drawSize) / 2,
      drawSize,
      drawSize
    );
    context.restore();
  } else {
    context.fillStyle = "rgba(14, 165, 233, 0.1)";
    drawRoundedRect(context, logoX, logoY, logoSize, logoSize, 12);
    context.fill();
  }

  context.fillStyle = "rgba(248, 250, 252, 0.96)";
  context.font = "860 19px Arial, sans-serif";
  context.fillText("VouPescar", logoX + 48, footerY + 38);

  const dividerX = 196;
  context.strokeStyle = "rgba(125, 211, 252, 0.28)";
  context.beginPath();
  context.moveTo(dividerX, footerY + 10);
  context.lineTo(dividerX, footerY + 60);
  context.stroke();

  context.fillStyle = "rgba(248, 250, 252, 0.94)";
  context.font = "570 15px Arial, sans-serif";
  context.fillText("Baixe o app", 232, footerY + 39);

  context.fillStyle = "#38bdf8";
  context.font = "860 23px Arial, sans-serif";
  context.fillText("→", 314, footerY + 40);

  drawQrPlaceholder(context, 358, footerY + 6, 58);
}

export async function createCaptureShareImage({
  capture,
  shareMode,
  formatCaptureDate,
  getCaptureLocationText,
}: CreateCaptureShareImageOptions) {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Canvas indisponível");
  }

  canvas.width = CANVAS_WIDTH;
  canvas.height = CANVAS_HEIGHT;

  context.scale(SCALE, SCALE);

  const image = await loadImage(capture.photo);
  const logo = await loadImage("/icons/logonovo-simples.png");
  const shareLocation = getShareLocationParts(capture, shareMode, getCaptureLocationText);

  drawBackground(context);
  drawMainCard(context);

  drawHeader({
    context,
    capture,
    shareMode,
    shareLocationName: shareLocation.locationName,
    shareCoordinates: shareLocation.coordinates,
    dateText: formatCaptureDate(capture.capturedAt),
  });

  const photoFrame = drawPhotoFrame({
    context,
    image,
  });

  drawNotes(context, capture, photoFrame.y + photoFrame.height + 12);
  drawFooter(context, logo);

  const blob = await canvasToPngBlob(canvas);

  return new File([blob], `voupescar-captura-${capture.id}-${shareMode}.png`, {
    type: "image/png",
  });
}

function downloadShareImage(file: File) {
  const url = URL.createObjectURL(file);
  const link = document.createElement("a");

  link.href = url;
  link.download = file.name;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function showShareImagePreviewOverlay({
  imageFile,
  imageUrl,
  capture,
  shareData,
  onFeedback,
}: {
  imageFile: File;
  imageUrl: string;
  capture: Capture;
  shareData: ShareData;
  onFeedback?: (captureId: number, message: string) => void;
}) {
  const existingOverlay = document.getElementById("vpShareImagePreviewOverlay");

  if (existingOverlay) {
    existingOverlay.remove();
  }

  const overlay = document.createElement("div");
  overlay.id = "vpShareImagePreviewOverlay";
  overlay.setAttribute("role", "dialog");
  overlay.setAttribute("aria-modal", "true");
  overlay.setAttribute("aria-label", "Prévia da imagem de compartilhamento");

  overlay.style.position = "fixed";
  overlay.style.inset = "0";
  overlay.style.zIndex = "2147483647";
  overlay.style.width = "100vw";
  overlay.style.height = "100dvh";
  overlay.style.overflow = "auto";
  overlay.style.padding = "12px";
  overlay.style.boxSizing = "border-box";
  overlay.style.background =
    "radial-gradient(circle at 50% 8%, rgba(14, 116, 144, 0.12), transparent 34%), radial-gradient(circle at 50% 24%, rgba(30, 42, 56, 0.42), transparent 44%), repeating-linear-gradient(90deg, rgba(35, 82, 148, 0.055) 0px, rgba(35, 82, 148, 0.055) 1px, transparent 1px, transparent 56px), linear-gradient(180deg, #07101a 0%, #050a0f 100%)";
  overlay.style.color = "#f8fafc";
  overlay.style.fontFamily =
    "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif";

  const shell = document.createElement("div");
  shell.style.width = "min(100%, 520px)";
  shell.style.margin = "0 auto";
  shell.style.display = "grid";
  shell.style.gap = "12px";

  const toolbar = document.createElement("div");
  toolbar.style.position = "relative";
  toolbar.style.top = "auto";
  toolbar.style.zIndex = "2";
  toolbar.style.display = "flex";
  toolbar.style.alignItems = "center";
  toolbar.style.justifyContent = "flex-start";
  toolbar.style.gap = "0";
  toolbar.style.padding = "0";
  toolbar.style.border = "0";
  toolbar.style.borderRadius = "0";
  toolbar.style.background = "transparent";
  toolbar.style.backdropFilter = "none";
  toolbar.style.boxShadow = "none";

  const title = document.createElement("div");
  title.style.display = "grid";
  title.style.gap = "3px";

  const titleStrong = document.createElement("strong");
  titleStrong.textContent = "Prévia da imagem";
  titleStrong.style.fontSize = "15px";
  titleStrong.style.lineHeight = "1";
  titleStrong.style.fontWeight = "900";

  const titleSmall = document.createElement("span");
  titleSmall.textContent = "Confira antes de compartilhar.";
  titleSmall.style.color = "rgba(226, 232, 240, 0.72)";
  titleSmall.style.fontSize = "12px";
  titleSmall.style.lineHeight = "1.2";
  titleSmall.style.fontWeight = "700";

  title.append(titleStrong, titleSmall);
  title.style.display = "none";

  const actions = document.createElement("div");
  actions.style.display = "grid";
  actions.style.gridTemplateColumns = "44px repeat(2, minmax(0, 1fr))";
  actions.style.gap = "8px";

  const baseButtonStyle = (element: HTMLButtonElement | HTMLAnchorElement) => {
    element.style.minHeight = "38px";
    element.style.display = "inline-flex";
    element.style.alignItems = "center";
    element.style.justifyContent = "center";
    element.style.border = "1px solid rgba(56, 189, 248, 0.34)";
    element.style.borderRadius = "12px";
    element.style.background = "rgba(14, 165, 233, 0.12)";
    element.style.color = "#f8fafc";
    element.style.padding = "0 10px";
    element.style.fontSize = "12px";
    element.style.fontWeight = "900";
    element.style.textDecoration = "none";
    element.style.cursor = "pointer";
    element.style.whiteSpace = "nowrap";
  };

  const closeOverlay = () => {
    overlay.remove();
    window.setTimeout(() => URL.revokeObjectURL(imageUrl), 1000);
  };

  const backButton = document.createElement("button");
  backButton.type = "button";
  backButton.setAttribute("aria-label", "Voltar");
  backButton.innerHTML =
    '<svg viewBox="0 0 48 48" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M29 12 17 24l12 12" /><path d="M18 24h20" /></svg>';
  baseButtonStyle(backButton);
  backButton.style.width = "44px";
  backButton.style.minWidth = "44px";
  backButton.style.minHeight = "44px";
  backButton.style.padding = "0";
  backButton.style.border = "0";
  backButton.style.borderRadius = "999px";
  backButton.style.background = "transparent";
  backButton.style.color = "rgba(248, 250, 252, 0.94)";
  backButton.style.boxShadow = "none";
  const backButtonSvg = backButton.querySelector("svg");
  if (backButtonSvg) {
    backButtonSvg.style.width = "26px";
    backButtonSvg.style.height = "26px";
  }
  backButton.addEventListener("click", closeOverlay);

  const shareButton = document.createElement("button");
  shareButton.type = "button";
  shareButton.textContent = "Compartilhar";
  baseButtonStyle(shareButton);
  shareButton.addEventListener("click", () => {
    void (async () => {
      try {
        if (navigator.share && navigator.canShare?.(shareData)) {
          await navigator.share(shareData);
          onFeedback?.(capture.id, "Compartilhado!");
          return;
        }

        downloadShareImage(imageFile);
        onFeedback?.(capture.id, "Imagem baixada!");
      } catch (error) {
        if ((error as DOMException).name === "AbortError") {
          return;
        }

        downloadShareImage(imageFile);
        onFeedback?.(capture.id, "Imagem baixada!");
      }
    })();
  });

  const downloadButton = document.createElement("a");
  downloadButton.textContent = "Baixar";
  downloadButton.href = imageUrl;
  downloadButton.download = imageFile.name;
  baseButtonStyle(downloadButton);

  actions.append(backButton, shareButton, downloadButton);
  toolbar.append(actions);

  const image = document.createElement("img");
  image.src = imageUrl;
  image.alt = "Prévia da captura VouPescar";
  image.style.width = "100%";
  image.style.display = "block";
  image.style.border = "1px solid rgba(56, 189, 248, 0.34)";
  image.style.borderRadius = "22px";
  image.style.background = "#020617";
  image.style.boxShadow = "0 24px 70px rgba(0, 0, 0, 0.48)";

  const hint = document.createElement("p");
  hint.textContent = "";
  hint.style.display = "none";

  shell.append(toolbar, image, hint);
  overlay.append(shell);
  document.body.appendChild(overlay);

  onFeedback?.(capture.id, "Prévia aberta!");
}

export async function previewCaptureShareImage({
  capture,
  shareMode,
  formatCaptureDate,
  getCaptureLocationText,
  onFeedback,
}: CreateCaptureShareImageOptions & {
  onFeedback?: (captureId: number, message: string) => void;
}) {
  const imageFile = await createCaptureShareImage({
    capture,
    shareMode,
    formatCaptureDate,
    getCaptureLocationText,
  });
  const imageUrl = URL.createObjectURL(imageFile);
  const shareData: ShareData = {
    title: capture.species || "Captura VouPescar",
    files: [imageFile],
  };

  showShareImagePreviewOverlay({
    imageFile,
    imageUrl,
    capture,
    shareData,
    onFeedback,
  });
}

async function copyShareImage(file: File) {
  if (!navigator.clipboard || typeof ClipboardItem === "undefined") {
    return false;
  }

  await navigator.clipboard.write([
    new ClipboardItem({
      [file.type]: file,
    }),
  ]);
  return true;
}

export async function shareCapture({
  capture,
  shareMode,
  formatCaptureDate,
  getCaptureLocationText,
  onFeedback,
  onShareOptionsClose,
}: ShareCaptureOptions) {
  const imageFile = await createCaptureShareImage({
    capture,
    shareMode,
    formatCaptureDate,
    getCaptureLocationText,
  });
  const title = capture.species || "Captura VouPescar";
  const shareData: ShareData = {
    title,
    files: [imageFile],
  };

  try {
    if (navigator.share && navigator.canShare?.(shareData)) {
      await navigator.share(shareData);

      onFeedback(capture.id, "Compartilhado!");
      onShareOptionsClose();
      return;
    }

    const copied = await copyShareImage(imageFile).catch(() => false);

    if (copied) {
      onFeedback(capture.id, "Imagem copiada!");
    } else {
      downloadShareImage(imageFile);
      onFeedback(capture.id, "Imagem baixada!");
    }

    onShareOptionsClose();
  } catch (error) {
    if ((error as DOMException).name === "AbortError") {
      return;
    }

    try {
      const copied = await copyShareImage(imageFile).catch(() => false);

      if (copied) {
        onFeedback(capture.id, "Imagem copiada!");
      } else {
        downloadShareImage(imageFile);
        onFeedback(capture.id, "Imagem baixada!");
      }

      onShareOptionsClose();
    } catch {
      downloadShareImage(imageFile);
      onFeedback(capture.id, "Imagem baixada!");
    }
  }
}
