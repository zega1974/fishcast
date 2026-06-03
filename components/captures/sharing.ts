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
  maxLines = 4
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

function drawShareField(
  context: CanvasRenderingContext2D,
  label: string,
  value: string,
  x: number,
  y: number,
  width: number
) {
  context.fillStyle = "rgba(167, 243, 208, 0.72)";
  context.font = "700 22px Arial, sans-serif";
  context.fillText(label.toUpperCase(), x, y);

  context.fillStyle = "#ffffff";
  context.font = "800 34px Arial, sans-serif";
  return drawWrappedText(context, value || "--", x, y + 44, width, 40, 2) + 56;
}

function loadCaptureImage(src: string) {
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

async function createCaptureShareImage({
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
  const padding = 64;
  const image = await loadCaptureImage(capture.photo);
  const maxPhotoWidth = width - padding * 2;
  const imageRatio = image ? image.width / image.height : 16 / 9;
  const portraitPhoto = Boolean(image && imageRatio < 0.9);
  const photoFrameY = 150;
  const photoFrameHeight = portraitPhoto ? 760 : 520;
  const photoFrameWidth = portraitPhoto
    ? Math.min(maxPhotoWidth, photoFrameHeight * imageRatio)
    : maxPhotoWidth;
  const photoFrameX = padding + (maxPhotoWidth - photoFrameWidth) / 2;
  const badgeY = portraitPhoto ? photoFrameY + photoFrameHeight + 26 : 696;
  const titleY = portraitPhoto ? badgeY + 124 : 820;
  const fieldsStartY = portraitPhoto ? titleY + 90 : 910;
  const estimatedFieldHeight = 96;
  const estimatedLeftEndY = fieldsStartY + estimatedFieldHeight * 3;
  const estimatedRightFieldCount = shareMode === "secret" ? 2 : 3;
  const estimatedRightEndY =
    fieldsStartY + estimatedFieldHeight * estimatedRightFieldCount + (shareMode === "secret" ? 82 : 0);
  const observationsY = portraitPhoto
    ? Math.max(estimatedLeftEndY, estimatedRightEndY) + 32
    : shareMode === "secret"
      ? 1188
      : Math.max(1188, estimatedLeftEndY, estimatedRightEndY) + 32;
  const height = portraitPhoto || shareMode !== "secret" ? observationsY + 162 : 1350;

  canvas.width = width;
  canvas.height = height;

  const background = context.createLinearGradient(0, 0, width, height);
  background.addColorStop(0, "#03110d");
  background.addColorStop(0.46, "#041923");
  background.addColorStop(1, "#020617");
  context.fillStyle = background;
  context.fillRect(0, 0, width, height);

  context.fillStyle = "rgba(34, 197, 94, 0.16)";
  context.beginPath();
  context.arc(900, 170, 260, 0, Math.PI * 2);
  context.fill();

  context.fillStyle = "#ecfeff";
  context.font = "900 42px Arial, sans-serif";
  context.fillText("VouPescar", padding, 78);
  context.fillStyle = "rgba(207, 250, 254, 0.72)";
  context.font = "700 22px Arial, sans-serif";
  context.fillText("Di\u00e1rio de captura", padding, 116);

  context.save();
  drawRoundedRect(context, photoFrameX, photoFrameY, photoFrameWidth, photoFrameHeight, 24);
  context.clip();
  context.fillStyle = "#020617";
  context.fillRect(photoFrameX, photoFrameY, photoFrameWidth, photoFrameHeight);

  if (image) {
    const scale = Math.min(photoFrameWidth / image.width, photoFrameHeight / image.height);
    const drawWidth = image.width * scale;
    const drawHeight = image.height * scale;
    const drawX = photoFrameX + (photoFrameWidth - drawWidth) / 2;
    const drawY = photoFrameY + (photoFrameHeight - drawHeight) / 2;

    context.drawImage(image, drawX, drawY, drawWidth, drawHeight);
  } else {
    const placeholder = context.createLinearGradient(photoFrameX, photoFrameY, photoFrameX + photoFrameWidth, photoFrameY + photoFrameHeight);
    placeholder.addColorStop(0, "#064e3b");
    placeholder.addColorStop(0.55, "#052e2f");
    placeholder.addColorStop(1, "#020617");
    context.fillStyle = placeholder;
    context.fillRect(photoFrameX, photoFrameY, photoFrameWidth, photoFrameHeight);
    context.fillStyle = "rgba(255, 255, 255, 0.82)";
    context.font = "900 46px Arial, sans-serif";
    context.fillText("Captura VouPescar", photoFrameX + 48, 420);
  }

  context.restore();

  context.strokeStyle = "rgba(255, 255, 255, 0.16)";
  context.lineWidth = 3;
  drawRoundedRect(context, photoFrameX, photoFrameY, photoFrameWidth, photoFrameHeight, 24);
  context.stroke();

  const badgeText = shareMode === "secret"
    ? "\uD83D\uDD12 Compartilhamento secreto"
    : "\u2713 Compartilhamento completo";
  context.fillStyle = shareMode === "secret" ? "#f87171" : "#34d399";
  context.font = "800 28px Arial, sans-serif";
  context.fillText(badgeText, padding, badgeY + 34);

  context.fillStyle = "#ffffff";
  context.font = "900 62px Arial, sans-serif";
  drawWrappedText(context, capture.species || "Esp\u00e9cie n\u00e3o informada", padding, titleY, width - padding * 2, 68, 2);

  const columnGap = 28;
  const columnWidth = (width - padding * 2 - columnGap) / 2;
  let leftY = fieldsStartY;
  let rightY = fieldsStartY;

  leftY += drawShareField(context, "Peso", capture.weight ? `${capture.weight} kg` : "--", padding, leftY, columnWidth);
  leftY += drawShareField(context, "Tamanho", capture.size ? `${capture.size} cm` : "--", padding, leftY, columnWidth);
  drawShareField(context, "Isca", capture.bait || "--", padding, leftY, columnWidth);

  rightY += drawShareField(context, "Data/hora", formatCaptureDate(capture.capturedAt), padding + columnWidth + columnGap, rightY, columnWidth);

  if (shareMode === "secret") {
    rightY += drawShareField(context, "Localiza\u00e7\u00e3o", getCaptureLocationText(capture, shareMode), padding + columnWidth + columnGap, rightY, columnWidth);
  } else {
    const [locationName, coordinates] = getCaptureLocationText(capture, shareMode).split("\n");

    rightY += drawShareField(context, "Local", locationName, padding + columnWidth + columnGap, rightY, columnWidth);
    rightY += drawShareField(context, "Coordenadas", coordinates || "--", padding + columnWidth + columnGap, rightY, columnWidth);
  }

  if (shareMode === "secret") {
    context.fillStyle = "rgba(6, 182, 212, 0.16)";
    drawRoundedRect(context, padding + columnWidth + columnGap, rightY - 6, columnWidth, 68, 12);
    context.fill();
    context.fillStyle = "#cffafe";
    context.font = "900 25px Arial, sans-serif";
    context.fillText("Coordenadas exatas ocultas", padding + columnWidth + columnGap + 20, rightY + 38);
  }

  context.fillStyle = "rgba(255, 255, 255, 0.1)";
  drawRoundedRect(context, padding, observationsY, width - padding * 2, 98, 14);
  context.fill();
  context.fillStyle = "rgba(167, 243, 208, 0.72)";
  context.font = "700 20px Arial, sans-serif";
  context.fillText("OBSERVA\u00c7\u00d5ES", padding + 24, observationsY + 36);
  context.fillStyle = "#ffffff";
  context.font = "700 27px Arial, sans-serif";
  drawWrappedText(context, capture.comment || "Sem observa\u00e7\u00f5es adicionadas.", padding + 24, observationsY + 74, width - padding * 2 - 48, 32, 2);

  const blob = await canvasToPngBlob(canvas);

  return new File([blob], `fishcastpr-captura-${capture.id}-${shareMode}.png`, {
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
