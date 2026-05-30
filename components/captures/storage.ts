import type { Capture, StoredCapture } from "./types";

export const CAPTURES_STORAGE_KEY = "fishcastpr.captures";

const CAPTURE_PHOTOS_DB_NAME = "fishcastpr.capturePhotos";
const CAPTURE_PHOTOS_STORE_NAME = "photos";
const CAPTURE_PHOTOS_DB_VERSION = 1;

export function isCapture(value: unknown): value is Capture {
  if (!value || typeof value !== "object") {
    return false;
  }

  const capture = value as Partial<Capture> & { photoId?: unknown };

  return (
    typeof capture.id === "number" &&
    typeof capture.lat === "number" &&
    typeof capture.lng === "number" &&
    typeof capture.species === "string" &&
    typeof capture.weight === "string" &&
    typeof capture.size === "string" &&
    typeof capture.bait === "string" &&
    typeof capture.comment === "string" &&
    (typeof capture.photo === "string" || typeof capture.photo === "undefined") &&
    (typeof capture.photoId === "string" || typeof capture.photoId === "undefined") &&
    typeof capture.capturedAt === "string"
  );
}

function serializeCaptureForLocalStorage(capture: Capture, photoId?: string): StoredCapture {
  return {
    id: capture.id,
    lat: capture.lat,
    lng: capture.lng,
    placeId: capture.placeId,
    species: capture.species,
    weight: capture.weight,
    size: capture.size,
    bait: capture.bait,
    comment: capture.comment,
    photoId,
    capturedAt: capture.capturedAt,
  };
}

function serializeCapturesForLocalStorage(captures: Capture[]): StoredCapture[] {
  return captures.map((capture) =>
    serializeCaptureForLocalStorage(capture, capture.photo ? String(capture.id) : undefined)
  );
}

function isQuotaExceededError(error: unknown) {
  return (
    error instanceof DOMException &&
    (error.name === "QuotaExceededError" ||
      error.name === "NS_ERROR_DOM_QUOTA_REACHED" ||
      error.code === 22 ||
      error.code === 1014)
  );
}

export function persistLightweightCaptures(captures: Capture[]) {
  const serializedCaptures = JSON.stringify(serializeCapturesForLocalStorage(captures));

  try {
    window.localStorage.setItem(CAPTURES_STORAGE_KEY, serializedCaptures);
    return true;
  } catch (error) {
    if (!isQuotaExceededError(error)) {
      throw error;
    }
  }

  console.warn("QuotaExceededError ao salvar metadados leves das capturas. Nenhum dado foi apagado.");
  return false;
}

export function isCapturePhotoDataUrl(photo: string) {
  return photo.startsWith("data:image/");
}

function openCapturePhotosDb() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    if (typeof window === "undefined" || !window.indexedDB) {
      reject(new Error("IndexedDB indisponivel"));
      return;
    }

    const request = window.indexedDB.open(CAPTURE_PHOTOS_DB_NAME, CAPTURE_PHOTOS_DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;

      if (!db.objectStoreNames.contains(CAPTURE_PHOTOS_STORE_NAME)) {
        db.createObjectStore(CAPTURE_PHOTOS_STORE_NAME);
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error("Falha ao abrir IndexedDB"));
  });
}

export async function readCapturePhoto(captureId: number) {
  try {
    const db = await openCapturePhotosDb();

    return await new Promise<string>((resolve, reject) => {
      const transaction = db.transaction(CAPTURE_PHOTOS_STORE_NAME, "readonly");
      const store = transaction.objectStore(CAPTURE_PHOTOS_STORE_NAME);
      const request = store.get(String(captureId));

      request.onsuccess = () => resolve(typeof request.result === "string" ? request.result : "");
      request.onerror = () => reject(request.error || new Error("Falha ao ler foto"));
      transaction.oncomplete = () => db.close();
      transaction.onerror = () => db.close();
    });
  } catch {
    return "";
  }
}

async function saveCapturePhoto(captureId: number, photo: string) {
  if (!isCapturePhotoDataUrl(photo)) {
    return true;
  }

  try {
    const db = await openCapturePhotosDb();

    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(CAPTURE_PHOTOS_STORE_NAME, "readwrite");
      const store = transaction.objectStore(CAPTURE_PHOTOS_STORE_NAME);

      store.put(photo, String(captureId));
      transaction.oncomplete = () => {
        db.close();
        resolve();
      };
      transaction.onerror = () => {
        db.close();
        reject(transaction.error || new Error("Falha ao salvar foto"));
      };
    });
    return true;
  } catch (error) {
    console.warn("Nao foi possivel salvar a foto da captura no IndexedDB.", error);
    return false;
  }
}

export async function deleteCapturePhoto(captureId: number) {
  try {
    const db = await openCapturePhotosDb();

    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(CAPTURE_PHOTOS_STORE_NAME, "readwrite");
      const store = transaction.objectStore(CAPTURE_PHOTOS_STORE_NAME);

      store.delete(String(captureId));
      transaction.oncomplete = () => {
        db.close();
        resolve();
      };
      transaction.onerror = () => {
        db.close();
        reject(transaction.error || new Error("Falha ao apagar foto"));
      };
    });
  } catch {
    // Foto ausente ou IndexedDB indisponivel nao deve bloquear a captura.
  }
}

export async function syncCapturePhotos(captures: Capture[]) {
  const results = await Promise.all(
    captures.map((capture) =>
      capture.photo ? saveCapturePhoto(capture.id, capture.photo) : Promise.resolve(true)
    )
  );

  return results.every(Boolean);
}

export async function migrateLegacyCapturePhotosInLocalStorage() {
  const result = {
    migratedPhotos: 0,
    remainingBase64PhotosInLocalStorage: 0,
    changed: false,
  };

  if (typeof window === "undefined") {
    return result;
  }

  try {
    const savedCaptures = window.localStorage.getItem(CAPTURES_STORAGE_KEY);

    if (!savedCaptures) {
      console.info("[FishCast] Migra\u00e7\u00e3o de fotos: nenhuma captura no localStorage.", result);
      return result;
    }

    const parsedCaptures: unknown = JSON.parse(savedCaptures);

    if (!Array.isArray(parsedCaptures)) {
      console.info("[FishCast] Migra\u00e7\u00e3o de fotos: formato inesperado em fishcastpr.captures.", result);
      return result;
    }

    const migratedCaptures = await Promise.all(
      parsedCaptures.map(async (item) => {
        if (!isCapture(item)) {
          return item;
        }

        const legacyPhoto = typeof item.photo === "string" && isCapturePhotoDataUrl(item.photo)
          ? item.photo
          : "";

        if (!legacyPhoto) {
          const captureWithPhotoId = item as Capture & { photoId?: unknown };
          const currentPhotoId = typeof captureWithPhotoId.photoId === "string"
            ? captureWithPhotoId.photoId
            : undefined;

          return serializeCaptureForLocalStorage(item, currentPhotoId);
        }

        const saved = await saveCapturePhoto(item.id, legacyPhoto);
        const storedPhoto = saved ? await readCapturePhoto(item.id) : "";
        const confirmed = storedPhoto === legacyPhoto;

        if (!confirmed) {
          return item;
        }

        result.migratedPhotos += 1;
        result.changed = true;

        return serializeCaptureForLocalStorage(item, String(item.id));
      })
    );

    result.remainingBase64PhotosInLocalStorage += migratedCaptures.filter(
      (item) =>
        item &&
        typeof item === "object" &&
        "photo" in item &&
        typeof (item as { photo?: unknown }).photo === "string" &&
        isCapturePhotoDataUrl((item as { photo: string }).photo)
    ).length;

    if (result.changed) {
      window.localStorage.setItem(CAPTURES_STORAGE_KEY, JSON.stringify(migratedCaptures));
    }

    console.info("[FishCast] Migra\u00e7\u00e3o de fotos conclu\u00edda.", {
      fotosMigradas: result.migratedPhotos,
      fotosAindaNoLocalStorage: result.remainingBase64PhotosInLocalStorage,
    });

    return result;
  } catch (error) {
    console.warn("[FishCast] Migra\u00e7\u00e3o de fotos falhou sem limpar dados.", error, result);
    return result;
  }
}

export function readStoredCaptures() {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const savedCaptures = window.localStorage.getItem(CAPTURES_STORAGE_KEY);

    if (!savedCaptures) {
      return [];
    }

    const parsedCaptures: unknown = JSON.parse(savedCaptures);

    return Array.isArray(parsedCaptures)
      ? parsedCaptures.filter(isCapture).map((capture) => ({
          id: capture.id,
          lat: capture.lat,
          lng: capture.lng,
          placeId: capture.placeId,
          species: capture.species,
          weight: capture.weight,
          size: capture.size,
          bait: capture.bait,
          comment: capture.comment,
          photo: capture.photo || "",
          capturedAt: capture.capturedAt,
        }))
      : [];
  } catch (error) {
    console.warn("Nao foi possivel ler capturas do localStorage. Nenhum dado foi apagado.", error);
    return [];
  }
}
