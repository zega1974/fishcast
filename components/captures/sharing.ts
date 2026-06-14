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

function drawSoftCard(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  const gradient = context.createLinearGradient(x, y, x + width, y + height);
  gradient.addColorStop(0, "rgba(23, 31, 42, 0.92)");
  gradient.addColorStop(0.55, "rgba(7, 12, 18, 0.98)");
  gradient.addColorStop(1, "rgba(3, 7, 12, 0.99)");

  context.fillStyle = gradient;
  drawRoundedRect(context, x, y, width, height, radius);
  context.fill();

  context.strokeStyle = "rgba(56, 189, 248, 0.42)";
  context.lineWidth = 2;
  drawRoundedRect(context, x, y, width, height, radius);
  context.stroke();

  context.strokeStyle = "rgba(255, 255, 255, 0.035)";
  context.lineWidth = 2;
  drawRoundedRect(context, x + 14, y + 14, width - 28, height - 28, Math.max(12, radius - 12));
  context.stroke();
}

function drawLocationPin(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number
) {
  const width = size * 0.62;
  const height = size * 0.86;
  const centerX = x + size / 2;
  const topY = y + size * 0.08;

  context.save();
  context.strokeStyle = "rgba(56, 189, 248, 0.92)";
  context.fillStyle = "transparent";
  context.lineWidth = 4;
  context.lineCap = "round";
  context.lineJoin = "round";

  context.beginPath();
  context.moveTo(centerX, topY + height);
  context.bezierCurveTo(
    centerX - width,
    topY + height * 0.42,
    centerX - width * 0.48,
    topY,
    centerX,
    topY
  );
  context.bezierCurveTo(
    centerX + width * 0.48,
    topY,
    centerX + width,
    topY + height * 0.42,
    centerX,
    topY + height
  );
  context.stroke();

  context.beginPath();
  context.arc(centerX, topY + height * 0.33, size * 0.12, 0, Math.PI * 2);
  context.stroke();

  context.restore();
}

function drawCoverImage(
  context: CanvasRenderingContext2D,
  image: HTMLImageElement,
  x: number,
  y: number,
  width: number,
  height: number
) {
  const scale = Math.max(width / image.width, height / image.height);
  const drawWidth = image.width * scale;
  const drawHeight = image.height * scale;
  const drawX = x + (width - drawWidth) / 2;
  const drawY = y + (height - drawHeight) / 2;

  context.drawImage(image, drawX, drawY, drawWidth, drawHeight);
}

function loadImage(src: string) {
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

      reject(new Error("Nao foi possivel gerar a imagem"));
    }, "image/png", 0.95);
  });
}

function normalizeText(value: string | number | null | undefined, fallback = "--") {
  const text = String(value ?? "").trim();

  return text || fallback;
}

function normalizeObservation(value: string | null | undefined) {
  const text = normalizeText(value, "Sem observacoes adicionadas.");

  return text.length > 150 ? `${text.slice(0, 147).trim()}...` : text;
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
      locationName: removeCoordinateLikeText(locationText) || "Regiao aproximada",
      coordinates: "",
    };
  }

  const [locationName, ...coordinatesParts] = locationText.split("\n");

  return {
    locationName: normalizeText(locationName, "Local da captura"),
    coordinates: normalizeText(coordinatesParts.join(" ").trim(), "--"),
  };
}

function drawQrPlaceholder(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number
) {
  context.fillStyle = "#f8fafc";
  drawRoundedRect(context, x, y, size, size, 18);
  context.fill();

  context.fillStyle = "#020617";

  const modules = 9;
  const gap = 5;
  const moduleSize = (size - gap * 2) / modules;

  const fixedBlocks = [
    [0, 0], [1, 0], [2, 0], [0, 1], [2, 1], [0, 2], [1, 2], [2, 2],
    [6, 0], [7, 0], [8, 0], [6, 1], [8, 1], [6, 2], [7, 2], [8, 2],
    [0, 6], [1, 6], [2, 6], [0, 7], [2, 7], [0, 8], [1, 8], [2, 8],
    [4, 1], [4, 3], [5, 4], [3, 5], [6, 5], [4, 6], [7, 7], [5, 8],
  ];

  fixedBlocks.forEach(([column, row]) => {
    const blockX = x + gap + column * moduleSize;
    const blockY = y + gap + row * moduleSize;

    context.fillRect(blockX, blockY, Math.max(6, moduleSize - 3), Math.max(6, moduleSize - 3));
  });
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
    throw new Error("Canvas indisponivel");
  }

  const width = 1080;
  const height = 1920;
  const padding = 64;
  const contentX = padding;
  const contentWidth = width - padding * 2;

  canvas.width = width;
  canvas.height = height;

  const image = await loadImage(capture.photo);
  const logo = await loadImage("/icons/logonovo-simples.png");
  const shareLocation = getShareLocationParts(capture, shareMode, getCaptureLocationText);

  const background = context.createLinearGradient(0, 0, width, height);
  background.addColorStop(0, "#07101a");
  background.addColorStop(1, "#050a0f");
  context.fillStyle = background;
  context.fillRect(0, 0, width, height);

  context.fillStyle = "rgba(14, 116, 144, 0.11)";
  context.beginPath();
  context.arc(width / 2, 120, 430, 0, Math.PI * 2);
  context.fill();

  context.fillStyle = "rgba(30, 42, 56, 0.18)";
  context.beginPath();
  context.arc(width / 2, 430, 620, 0, Math.PI * 2);
  context.fill();

  context.strokeStyle = "rgba(35, 82, 148, 0.055)";
  context.lineWidth = 1;

  for (let gridX = 0; gridX <= width; gridX += 56) {
    context.beginPath();
    context.moveTo(gridX, 0);
    context.lineTo(gridX, height * 0.58);
    context.stroke();
  }

  drawSoftCard(context, 44, 44, width - 88, height - 88, 38);

  const modeLabel = shareMode === "secret" ? "MODO SECRETO" : "MODO COMPLETO";

  context.fillStyle = "rgba(2, 6, 23, 0.34)";
  drawRoundedRect(context, contentX, 88, 282, 48, 24);
  context.fill();
  context.strokeStyle = "rgba(56, 189, 248, 0.46)";
  context.lineWidth = 2;
  drawRoundedRect(context, contentX, 88, 282, 48, 24);
  context.stroke();

  context.fillStyle = "rgba(248, 250, 252, 0.94)";
  context.font = "900 21px Arial, sans-serif";
  context.fillText(modeLabel, contentX + 54, 120);

  context.strokeStyle = "#38bdf8";
  context.lineWidth = 3;
  context.strokeRect(contentX + 26, 104, 12, 12);

  context.fillStyle = "rgba(226, 232, 240, 0.72)";
  context.font = "900 19px Arial, sans-serif";
  context.textAlign = "right";
  context.fillText("COMPARTILHAMENTO VOUPESCAR", width - padding, 120);
  context.textAlign = "left";

  context.fillStyle = "#38bdf8";
  context.font = "900 25px Arial, sans-serif";
  context.fillText("MINHA CAPTURA", contentX, 198);

  const locationY = 286;
  drawLocationPin(context, contentX - 6, locationY - 20, 46);

  context.fillStyle = "rgba(248, 250, 252, 0.94)";
  context.font = "800 29px Arial, sans-serif";
  context.fillText(
    truncateText(context, shareLocation.locationName, contentWidth - 76),
    contentX + 58,
    locationY + 10
  );

  context.fillStyle = "rgba(226, 232, 240, 0.72)";
  context.font = "700 20px Arial, sans-serif";
  context.fillText(
    shareMode === "secret" ? "Ponto exato e coordenadas nao sao exibidos." : shareLocation.coordinates,
    contentX + 58,
    locationY + 44
  );

  const infoY = 372;
  const infoHeight = 140;

  context.fillStyle = "rgba(2, 6, 23, 0.38)";
  drawRoundedRect(context, contentX, infoY, contentWidth, infoHeight, 26);
  context.fill();

  context.strokeStyle = "rgba(125, 211, 252, 0.18)";
  context.lineWidth = 2;
  drawRoundedRect(context, contentX, infoY, contentWidth, infoHeight, 26);
  context.stroke();

  context.fillStyle = "#ffffff";
  context.font = "900 64px Arial, sans-serif";
  drawWrappedText(
    context,
    normalizeText(capture.species, "Especie nao informada"),
    contentX + 28,
    infoY + 76,
    430,
    60,
    1
  );

  const metricX = contentX + 520;

  context.strokeStyle = "rgba(125, 211, 252, 0.22)";
  context.lineWidth = 2;
  context.beginPath();
  context.moveTo(metricX - 28, infoY + 32);
  context.lineTo(metricX - 28, infoY + 112);
  context.stroke();

  context.fillStyle = "rgba(226, 232, 240, 0.72)";
  context.font = "900 18px Arial, sans-serif";
  context.fillText("PESO", metricX, infoY + 42);
  context.fillText("TAMANHO", metricX + 180, infoY + 42);

  context.fillStyle = "#f8fafc";
  context.font = "900 32px Arial, sans-serif";
  context.fillText(capture.weight ? `${capture.weight} kg` : "--", metricX, infoY + 78);
  context.fillText(capture.size ? `${capture.size} cm` : "--", metricX + 180, infoY + 78);

  context.fillStyle = "rgba(248, 250, 252, 0.9)";
  context.font = "800 24px Arial, sans-serif";
  context.fillText(formatCaptureDate(capture.capturedAt), metricX, infoY + 116);

  const photoFrameX = contentX;
  const photoFrameY = 548;
  const photoFrameWidth = contentWidth;
  const photoFrameHeight = 760;

  context.save();
  drawRoundedRect(context, photoFrameX, photoFrameY, photoFrameWidth, photoFrameHeight, 34);
  context.clip();

  const photoBackground = context.createLinearGradient(
    photoFrameX,
    photoFrameY,
    photoFrameX + photoFrameWidth,
    photoFrameY + photoFrameHeight
  );
  photoBackground.addColorStop(0, "#042f2e");
  photoBackground.addColorStop(0.5, "#020617");
  photoBackground.addColorStop(1, "#082f49");
  context.fillStyle = photoBackground;
  context.fillRect(photoFrameX, photoFrameY, photoFrameWidth, photoFrameHeight);

  if (image) {
    drawCoverImage(context, image, photoFrameX, photoFrameY, photoFrameWidth, photoFrameHeight);
  } else {
    context.fillStyle = "rgba(255, 255, 255, 0.84)";
    context.font = "900 48px Arial, sans-serif";
    context.fillText("Captura VouPescar", photoFrameX + 48, photoFrameY + 360);

    context.fillStyle = "rgba(226, 232, 240, 0.72)";
    context.font = "700 28px Arial, sans-serif";
    context.fillText("Foto nao informada", photoFrameX + 48, photoFrameY + 410);
  }

  context.restore();

  context.strokeStyle = "rgba(255, 255, 255, 0.2)";
  context.lineWidth = 3;
  drawRoundedRect(context, photoFrameX, photoFrameY, photoFrameWidth, photoFrameHeight, 34);
  context.stroke();

  const detailsY = 1336;
  const detailCardWidth = (contentWidth - 24) / 2;
  const detailCardHeight = 104;

  context.fillStyle = "rgba(15, 23, 42, 0.64)";
  drawRoundedRect(context, contentX, detailsY, detailCardWidth, detailCardHeight, 24);
  context.fill();
  drawRoundedRect(context, contentX + detailCardWidth + 24, detailsY, detailCardWidth, detailCardHeight, 24);
  context.fill();

  context.strokeStyle = "rgba(125, 211, 252, 0.13)";
  context.lineWidth = 2;
  drawRoundedRect(context, contentX, detailsY, detailCardWidth, detailCardHeight, 24);
  context.stroke();
  drawRoundedRect(context, contentX + detailCardWidth + 24, detailsY, detailCardWidth, detailCardHeight, 24);
  context.stroke();

  context.fillStyle = "rgba(226, 232, 240, 0.72)";
  context.font = "800 19px Arial, sans-serif";
  context.fillText("ISCA", contentX + 28, detailsY + 38);
  context.fillText("COMPARTILHAMENTO", contentX + detailCardWidth + 52, detailsY + 38);

  context.fillStyle = "#f8fafc";
  context.font = "900 30px Arial, sans-serif";
  context.fillText(
    truncateText(context, normalizeText(capture.bait), detailCardWidth - 56),
    contentX + 28,
    detailsY + 78
  );
  context.fillText(
    shareMode === "secret" ? "Secreto" : "Completo",
    contentX + detailCardWidth + 52,
    detailsY + 78
  );

  const observationsY = 1472;
  const observationsHeight = 184;

  context.fillStyle = "rgba(2, 6, 23, 0.5)";
  drawRoundedRect(context, contentX, observationsY, contentWidth, observationsHeight, 28);
  context.fill();

  context.strokeStyle = "rgba(125, 211, 252, 0.13)";
  context.lineWidth = 2;
  drawRoundedRect(context, contentX, observationsY, contentWidth, observationsHeight, 28);
  context.stroke();

  context.fillStyle = "rgba(226, 232, 240, 0.74)";
  context.font = "900 20px Arial, sans-serif";
  context.fillText("OBSERVACOES", contentX + 32, observationsY + 44);

  context.fillStyle = "#f8fafc";
  context.font = "700 29px Arial, sans-serif";
  drawWrappedText(
    context,
    normalizeObservation(capture.comment),
    contentX + 32,
    observationsY + 88,
    contentWidth - 64,
    38,
    2
  );

  const footerY = 1702;
  context.strokeStyle = "rgba(56, 189, 248, 0.28)";
  context.lineWidth = 2;
  context.beginPath();
  context.moveTo(contentX, footerY - 34);
  context.lineTo(width - padding, footerY - 34);
  context.stroke();

  const logoBoxSize = 92;

  if (logo) {
    context.save();
    drawRoundedRect(context, contentX, footerY, logoBoxSize, logoBoxSize, 24);
    context.clip();

    const logoZoom = 1.18;
    const logoSize = logoBoxSize * logoZoom;
    const logoX = contentX + (logoBoxSize - logoSize) / 2;
    const logoY = footerY + (logoBoxSize - logoSize) / 2;

    context.drawImage(logo, logoX, logoY, logoSize, logoSize);
    context.restore();
  } else {
    context.fillStyle = "rgba(14, 165, 233, 0.1)";
    drawRoundedRect(context, contentX, footerY, logoBoxSize, logoBoxSize, 24);
    context.fill();
  }

  const brandX = contentX + 116;
  const brandY = footerY + 38;

  context.font = "900 40px Arial, sans-serif";
  context.fillStyle = "#f8fafc";
  context.fillText("Vou", brandX, brandY);

  const vouWidth = context.measureText("Vou").width;
  context.fillStyle = "#f6b81f";
  context.fillText("Pescar", brandX + vouWidth, brandY);

  context.fillStyle = "rgba(226, 232, 240, 0.72)";
  context.font = "800 21px Arial, sans-serif";
  context.fillText("Feito pra informar, não agradar", brandX, footerY + 78);

  const qrSize = 118;
  const qrX = width - padding - qrSize;
  const qrY = footerY - 8;
  const downloadTextX = qrX - 18;

  context.fillStyle = "rgba(248, 250, 252, 0.96)";
  context.font = "900 24px Arial, sans-serif";
  context.textAlign = "right";
  context.fillText("Baixe o app \u2192", downloadTextX, qrY + 72);
  context.textAlign = "left";

  drawQrPlaceholder(context, qrX, qrY, qrSize);

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
    "radial-gradient(circle at 50% 8%, rgba(14, 116, 144, 0.14), transparent 34%), radial-gradient(circle at 50% 24%, rgba(30, 42, 56, 0.34), transparent 44%), linear-gradient(180deg, #07101a 0%, #050a0f 100%)";
  overlay.style.color = "#f8fafc";
  overlay.style.fontFamily =
    "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif";

  const shell = document.createElement("div");
  shell.style.width = "min(100%, 520px)";
  shell.style.margin = "0 auto";
  shell.style.display = "grid";
  shell.style.gap = "12px";

  const toolbar = document.createElement("div");
  toolbar.style.position = "sticky";
  toolbar.style.top = "8px";
  toolbar.style.zIndex = "2";
  toolbar.style.display = "grid";
  toolbar.style.gridTemplateColumns = "1fr";
  toolbar.style.gap = "8px";
  toolbar.style.padding = "10px";
  toolbar.style.border = "1px solid rgba(56, 189, 248, 0.24)";
  toolbar.style.borderRadius = "18px";
  toolbar.style.background = "rgba(7, 12, 18, 0.9)";
  toolbar.style.backdropFilter = "blur(14px)";
  toolbar.style.boxShadow = "0 18px 40px rgba(0, 0, 0, 0.3)";

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

  const actions = document.createElement("div");
  actions.style.display = "grid";
  actions.style.gridTemplateColumns = "repeat(3, minmax(0, 1fr))";
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
  backButton.textContent = "Voltar ao mapa";
  baseButtonStyle(backButton);
  backButton.style.borderColor = "rgba(148, 163, 184, 0.24)";
  backButton.style.background = "rgba(15, 23, 42, 0.76)";
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
  toolbar.append(title, actions);

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
  hint.textContent = "Esta é a imagem final que será enviada. O compartilhamento nativo só abre ao tocar em Compartilhar.";
  hint.style.margin = "0";
  hint.style.padding = "0 8px 12px";
  hint.style.color = "rgba(226, 232, 240, 0.62)";
  hint.style.fontSize = "12px";
  hint.style.lineHeight = "1.35";
  hint.style.textAlign = "center";
  hint.style.fontWeight = "700";

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
