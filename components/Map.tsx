"use client";

import {
  MapContainer,
  Marker,
  Polygon,
  TileLayer,
  WMSTileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet";

import L from "leaflet";

import { useEffect, useRef, useState } from "react";

import { fishingSpots, type SpotConditions, type FishingSpot } from "@/data/fishingSpots";

type CaptureShareMode = "complete" | "secret";
type MapMode = "map" | "satellite" | "nautical" | "night";
type PlaceVisibility = "private";

type Capture = {
  id: number;
  lat: number;
  lng: number;
  placeId?: number;
  species: string;
  weight: string;
  size: string;
  bait: string;
  comment: string;
  photo: string;
  capturedAt: string;
};

type StoredCapture = Omit<Capture, "photo"> & {
  photo?: string;
  photoId?: string;
};

type PersonalPlace = {
  id: number;
  lat: number;
  lng: number;
  name: string;
  note: string;
  visibility: PlaceVisibility;
  createdAt: string;
};

type FocusTarget = {
  id: number;
  lat: number;
  lng: number;
};

type CaptureFormData = {
  species: string;
  weight: string;
  size: string;
  bait: string;
  comment: string;
  photo: string;
  capturedDate: string;
  capturedTime: string;
};

type PersonalPlaceFormData = {
  name: string;
  note: string;
};

type LocationConditions = {
  clima: string;
  pressao: string;
  tempAgua: string;
  temperatura: string;
  lua: string;
  mare: string;
};

type FishCastScore = {
  value: number;
  label: string;
  partial: boolean;
};

const MAP_MIN_ZOOM = 6;
const MAP_INITIAL_ZOOM = 6;
const OSM_MAX_NATIVE_ZOOM = 18;
const SATELLITE_MAX_NATIVE_ZOOM = 18;
const NIGHT_MAX_NATIVE_ZOOM = 18;
const MAP_MAX_ZOOM = 18;
const PERSONAL_PLACE_CAPTURE_RADIUS_METERS = 250;
const CAPTURES_STORAGE_KEY = "fishcastpr.captures";
const PERSONAL_PLACES_STORAGE_KEY = "fishcastpr.personalPlaces";
const CAPTURE_PHOTOS_DB_NAME = "fishcastpr.capturePhotos";
const CAPTURE_PHOTOS_STORE_NAME = "photos";
const CAPTURE_PHOTOS_DB_VERSION = 1;
const TRANSPARENT_TILE =
  "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==";
const NAUTICAL_BATHYMETRY_WMS_URL = "https://www.opendem.info/geoserver/opendem/wms";
const NAUTICAL_BATHYMETRY_ATTRIBUTION =
  "Bathymetry &copy; OpenDEM, GEBCO 2021, OpenStreetMap contributors";
const NAUTICAL_DEPTH_SURFACE_LAYER = "opendem:gebco_2021";
const NAUTICAL_DEPTH_CONTOURS_LAYER = "opendem:gebco_2021_contours";
const NAUTICAL_MAX_ZOOM = 18;
const NAUTICAL_SEAMARK_MAX_NATIVE_ZOOM = 18;


const mapModes: { id: MapMode; label: string; iconClassName: string }[] = [
  { id: "map", label: "Mapa", iconClassName: "map-mode-icon--map" },
  { id: "satellite", label: "Satélite", iconClassName: "map-mode-icon--satellite" },
  { id: "nautical", label: "Náutico", iconClassName: "map-mode-icon--nautical" },
  { id: "night", label: "Noturno", iconClassName: "map-mode-icon--night" },
];

const panelButtonBase =
  "flex min-h-14 w-full items-center justify-center rounded-none px-4 py-3.5 text-center text-sm font-black transition";
const panelButtonPrimary =
  `${panelButtonBase} border border-cyan-300/25 bg-cyan-400/15 text-cyan-100 hover:bg-cyan-400/25`;
const panelButtonSuccess =
  `${panelButtonBase} border border-emerald-300/25 bg-emerald-400/15 text-emerald-100 hover:bg-emerald-400/25`;
const panelButtonDanger =
  `${panelButtonBase} border border-red-300/20 bg-red-500/15 text-red-100 hover:bg-red-500/25`;
const infoLabelClass =
  "text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-200/80";

const MARKER_ICON_SIZE = 52;

function createPremiumMarkerIcon({
  iconUrl,
  kind,
  size,
  badge,
}: {
  iconUrl: string;
  kind: "spot" | "capture" | "place";
  size: number;
  badge?: number;
}) {
  const badgeHtml = badge
    ? `<span class="fishcast-marker__badge">${badge > 99 ? "99+" : badge}</span>`
    : "";

  return L.divIcon({
    html: `<span class="fishcast-marker__core"><img src="${iconUrl}" alt="" draggable="false" /></span>${badgeHtml}`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
    popupAnchor: [0, -size],
    className: `fishcast-marker fishcast-marker--${kind}`,
  });
}

function createSpotIcon(size: number) {
  return createPremiumMarkerIcon({
    iconUrl: "/icons/spot-marker.png",
    kind: "spot",
    size,
  });
}

function createCaptureIcon(size: number, captureCount?: number) {
  return createPremiumMarkerIcon({
    iconUrl: "/icons/capture-marker.png",
    kind: "capture",
    size,
    badge: captureCount,
  });
}

function createPersonalPlaceIcon(size: number, captureCount: number) {
  return createPremiumMarkerIcon({
    iconUrl: "/icons/meus-lugares-marker.png",
    kind: "place",
    size,
    badge: captureCount,
  });
}

function ZoomButtons({ hidden }: { hidden: boolean }) {
  const map = useMap();

  return (
    <div
      className={`zoom-button-overlay map-control-overlay absolute top-28 left-4 z-[2000] flex flex-col overflow-hidden rounded-3xl border border-cyan-500/25 bg-slate-950/85 shadow-[0_24px_80px_rgba(0,255,255,0.12)] transition ${
        hidden ? "pointer-events-none opacity-0" : "opacity-100"
      }`}
    >
      <button
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          map.zoomIn();
        }}
        onPointerDown={(e) => e.stopPropagation()}
        className="w-12 h-12 bg-white text-black text-2xl font-bold border-b border-zinc-300 hover:bg-zinc-100 transition-colors"
      >
        +
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          map.zoomOut();
        }}
        onPointerDown={(e) => e.stopPropagation()}
        className="w-12 h-12 bg-white text-black text-2xl font-bold hover:bg-zinc-100 transition-colors"
      >
        -
      </button>
    </div>
  );
}

function CenterButton({ center, hidden }: { center: [number, number]; hidden: boolean }) {
  const map = useMap();

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        e.preventDefault();
        map.closePopup();
        map.setView(center, map.getMinZoom(), { animate: true });
      }}
      onPointerDown={(e) => e.stopPropagation()}
      aria-label="Centralizar mapa no Paraná"
      title="Centralizar mapa"
      className={`map-control-overlay absolute top-[136px] right-4 z-[2000] flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-[#03110d]/70 text-xl font-black text-emerald-100/90 shadow-[0_14px_36px_rgba(0,0,0,0.34),0_0_16px_rgba(34,197,94,0.12)] backdrop-blur-md transition hover:border-emerald-200/30 hover:bg-[#062018]/85 active:scale-95 sm:top-28 ${
        hidden ? "pointer-events-none opacity-0" : "opacity-100"
      }`}
    >
      <span aria-hidden="true">⌖</span>
    </button>
  );
}

function MapModeSelector({
  mode,
  onChange,
  hidden,
}: {
  mode: MapMode;
  onChange: (mode: MapMode) => void;
  hidden: boolean;
}) {
  return (
    <div
      className={`map-control-overlay absolute right-4 top-4 z-[2000] rounded-[22px] border border-cyan-200/20 bg-black/58 p-1.5 text-white shadow-[0_18px_48px_rgba(0,0,0,0.46),0_0_28px_rgba(34,211,238,0.14)] backdrop-blur-2xl transition ${
        hidden ? "pointer-events-none opacity-0" : "opacity-100"
      }`}
    >
      <div className="grid grid-cols-2 gap-1 sm:flex">
        {mapModes.map((mapMode) => {
          const active = mapMode.id === mode;

          return (
            <button
              key={mapMode.id}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onChange(mapMode.id);
              }}
              onPointerDown={(e) => e.stopPropagation()}
              className={`group flex min-h-9 items-center justify-center rounded-2xl px-2.5 text-[10px] font-black uppercase tracking-[0.08em] transition sm:min-h-10 sm:px-3 ${
                active
                  ? "border border-cyan-100/45 bg-[linear-gradient(135deg,rgba(103,232,249,0.94),rgba(52,211,153,0.88))] text-slate-950 shadow-[0_0_22px_rgba(34,211,238,0.42),inset_0_1px_0_rgba(255,255,255,0.6)]"
                  : "border border-white/10 bg-white/[0.055] text-cyan-50/78 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] hover:border-cyan-200/25 hover:bg-white/[0.12] hover:text-white"
              }`}
              aria-pressed={active}
            >
              {mapMode.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function MapEvents({
  captureMode,
  placeMode,
  onAddCapture,
  onAddPlace,
  onLocationClick,
  onZoomChange,
  popupPriorityOpen,
  onDismissActivePopup,
  onOtherPopupClose,
  spotPopupOpen,
  ignoreNextMapClickRef,
}: {
  captureMode: boolean;
  placeMode: boolean;
  onAddCapture: (lat: number, lng: number) => void;
  onAddPlace: (lat: number, lng: number) => void;
  onLocationClick: (lat: number, lng: number) => void;
  onZoomChange: (zoom: number) => void;
  popupPriorityOpen: boolean;
  onDismissActivePopup: () => void;
  onOtherPopupClose: () => void;
  spotPopupOpen: boolean;
  ignoreNextMapClickRef: React.MutableRefObject<boolean>;
}) {
  const isDraggingRef = useRef(false);

  function isControlClick(event: MouseEvent) {
    const path = event.composedPath();

    return path.some(
      (node) =>
        node instanceof HTMLElement &&
        (node.closest(".leaflet-control") || node.closest(".map-control-overlay") || node.closest(".leaflet-popup"))
    );
  }

  const map = useMapEvents({
    dragstart() {
      isDraggingRef.current = true;
    },
    dragend() {
      window.setTimeout(() => {
        isDraggingRef.current = false;
      }, 0);
    },
    click(e) {
      if (isDraggingRef.current) {
        return;
      }

      if (isControlClick(e.originalEvent)) {
        return;
      }

      if (ignoreNextMapClickRef.current) {
        ignoreNextMapClickRef.current = false;
      }

      if (spotPopupOpen) {
        map.closePopup();
      }

      if (popupPriorityOpen) {
        map.closePopup();
        onDismissActivePopup();
        return;
      }

      if (captureMode) {
        onAddCapture(e.latlng.lat, e.latlng.lng);
        return;
      }

      if (placeMode) {
        onAddPlace(e.latlng.lat, e.latlng.lng);
        return;
      }

      onLocationClick(e.latlng.lat, e.latlng.lng);
    },
    zoomend() {
      onZoomChange(map.getZoom());
    },
    popupclose() {
      ignoreNextMapClickRef.current = false;
      onOtherPopupClose();
    },
  });

  return null;
}

function MapFocusController({ target }: { target: FocusTarget | null }) {
  const map = useMap();

  useEffect(() => {
    if (!target) {
      return;
    }

    map.closePopup();
    map.flyTo([target.lat, target.lng], Math.max(map.getZoom(), 15), {
      animate: true,
      duration: 0.75,
    });
  }, [map, target]);

  return null;
}

function MapMaxZoomController({ maxZoom }: { maxZoom: number }) {
  const map = useMap();

  useEffect(() => {
    map.setMaxZoom(maxZoom);

    if (map.getZoom() > maxZoom) {
      map.setZoom(maxZoom);
    }
  }, [map, maxZoom]);

  return null;
}

function MapActionButton({
  label,
  iconSrc,
  badge,
  onClick,
  ariaLabel,
  title,
}: {
  label: string;
  iconSrc: string;
  badge?: number;
  onClick: () => void;
  ariaLabel: string;
  title: string;
}) {
  return (
    <button
      onClick={onClick}
      onPointerDown={(e) => e.stopPropagation()}
      aria-label={ariaLabel}
      title={title}
      className="group relative flex h-[74px] w-[74px] appearance-none items-center justify-center overflow-visible border-0 bg-transparent p-0 leading-none shadow-none outline-none transition duration-200 ease-out hover:scale-[1.04] focus-visible:ring-2 focus-visible:ring-cyan-200/70 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent active:scale-95 sm:h-[82px] sm:w-[82px]"
    >
      <span className="sr-only">{label}</span>
      <span className="relative flex h-full w-full items-center justify-center overflow-visible">
        <img
          src={iconSrc}
          alt=""
          draggable={false}
          className="h-[127%] w-[127%] max-w-none select-none object-contain transition duration-200"
        />
      </span>
      {typeof badge === "number" && badge > 0 && (
        <span className="absolute right-1 top-1 flex min-h-5 min-w-5 items-center justify-center rounded-full border border-white/60 bg-white px-1 text-[10px] font-black text-slate-950 shadow-[0_4px_14px_rgba(0,0,0,0.28)]">
          {badge > 99 ? "99+" : badge}
        </span>
      )}
    </button>
  );
}

const paranaCenter: [number, number] = [-25.3, -51.5];

const paranaOutline: [number, number][] = [
  [-22.55, -53.1],
  [-22.7, -51.1],
  [-23.0, -49.2],
  [-24.0, -48.1],
  [-25.3, -48.0],
  [-25.95, -48.6],
  [-26.45, -50.0],
  [-26.6, -51.9],
  [-25.8, -53.8],
  [-24.2, -54.6],
  [-22.9, -54.0],
];

function getCurrentDateTimeInputValue() {
  const now = new Date();
  const localDate = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  return localDate.toISOString().slice(0, 16);
}

function getCurrentDateInputValue() {
  return getCurrentDateTimeInputValue().slice(0, 10);
}

function getCurrentTimeInputValue() {
  return getCurrentDateTimeInputValue().slice(11, 16);
}

function getDistanceMeters(from: { lat: number; lng: number }, to: { lat: number; lng: number }) {
  const earthRadiusMeters = 6371000;
  const toRadians = Math.PI / 180;
  const deltaLat = (to.lat - from.lat) * toRadians;
  const deltaLng = (to.lng - from.lng) * toRadians;
  const fromLat = from.lat * toRadians;
  const toLat = to.lat * toRadians;
  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(fromLat) * Math.cos(toLat) * Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2);

  return 2 * earthRadiusMeters * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function createEmptyFormData(): CaptureFormData {
  return {
    species: "",
    weight: "",
    size: "",
    bait: "",
    comment: "",
    photo: "",
    capturedDate: getCurrentDateInputValue(),
    capturedTime: getCurrentTimeInputValue(),
  };
}

function createEmptyPlaceFormData(): PersonalPlaceFormData {
  return {
    name: "",
    note: "",
  };
}

function isCapture(value: unknown): value is Capture {
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

function isPersonalPlace(value: unknown): value is PersonalPlace {
  if (!value || typeof value !== "object") {
    return false;
  }

  const place = value as Partial<PersonalPlace>;

  return (
    typeof place.id === "number" &&
    typeof place.lat === "number" &&
    typeof place.lng === "number" &&
    typeof place.name === "string" &&
    typeof place.note === "string" &&
    place.visibility === "private" &&
    typeof place.createdAt === "string"
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

function persistLightweightCaptures(captures: Capture[]) {
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

function isCapturePhotoDataUrl(photo: string) {
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

async function readCapturePhoto(captureId: number) {
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

async function deleteCapturePhoto(captureId: number) {
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

async function syncCapturePhotos(captures: Capture[]) {
  const results = await Promise.all(
    captures.map((capture) =>
      capture.photo ? saveCapturePhoto(capture.id, capture.photo) : Promise.resolve(true)
    )
  );

  return results.every(Boolean);
}

async function migrateLegacyCapturePhotosInLocalStorage() {
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
      console.info("[FishCast] Migração de fotos: nenhuma captura no localStorage.", result);
      return result;
    }

    const parsedCaptures: unknown = JSON.parse(savedCaptures);

    if (!Array.isArray(parsedCaptures)) {
      console.info("[FishCast] Migração de fotos: formato inesperado em fishcastpr.captures.", result);
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

    console.info("[FishCast] Migração de fotos concluída.", {
      fotosMigradas: result.migratedPhotos,
      fotosAindaNoLocalStorage: result.remainingBase64PhotosInLocalStorage,
    });

    return result;
  } catch (error) {
    console.warn("[FishCast] Migração de fotos falhou sem limpar dados.", error, result);
    return result;
  }
}

function readStoredCaptures() {
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

function readStoredPersonalPlaces() {
  try {
    const savedPlaces = window.localStorage.getItem(PERSONAL_PLACES_STORAGE_KEY);

    if (!savedPlaces) {
      return [];
    }

    const parsedPlaces: unknown = JSON.parse(savedPlaces);

    return Array.isArray(parsedPlaces) ? parsedPlaces.filter(isPersonalPlace) : [];
  } catch (error) {
    console.warn("Nao foi possivel ler Meus Lugares do localStorage. Nenhum dado foi apagado.", error);
    return [];
  }
}

export default function Map() {
  const [captureMode, setCaptureMode] = useState(false);
  const [placeMode, setPlaceMode] = useState(false);
  const [capturesPanelOpen, setCapturesPanelOpen] = useState(false);
  const [mapMode, setMapMode] = useState<MapMode>("map");
  const [zoom, setZoom] = useState(MAP_INITIAL_ZOOM);
  const center = paranaCenter;
  const [pendingCapture, setPendingCapture] = useState<{
    lat: number;
    lng: number;
    placeId?: number | null;
  } | null>(null);
  const [focusTarget, setFocusTarget] = useState<FocusTarget | null>(null);
  const ignoreNextMapClickRef = useRef(false);
  const [spotPopupOpen, setSpotPopupOpen] = useState(false);
  const [capturePopupOpen, setCapturePopupOpen] = useState(false);
  const [selectedCapture, setSelectedCapture] = useState<Capture | null>(null);
  const [selectedCaptureSpot, setSelectedCaptureSpot] = useState<{
    lat: number;
    lng: number;
    captures: Capture[];
  } | null>(null);
  const [shareFeedback, setShareFeedback] = useState<{ captureId: number; message: string } | null>(null);
  const [shareOptionsCaptureId, setShareOptionsCaptureId] = useState<number | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<{
    name: string;
    lat: number;
    lng: number;
    personalPlaceId?: number;
    note?: string;
    visibility?: PlaceVisibility;
    conditions: LocationConditions;
  } | null>(null);
  const [formData, setFormData] = useState(createEmptyFormData);
  const [placeFormData, setPlaceFormData] = useState(createEmptyPlaceFormData);
  const [pendingPlace, setPendingPlace] = useState<{ lat: number; lng: number } | null>(null);
  const [captures, setCaptures] = useState<Capture[]>(readStoredCaptures);
  const [personalPlaces, setPersonalPlaces] = useState<PersonalPlace[]>(readStoredPersonalPlaces);
  const [storageFeedback, setStorageFeedback] = useState<string | null>(null);
  const [capturePhotoMigrationDone, setCapturePhotoMigrationDone] = useState(false);

  const iconSize = MARKER_ICON_SIZE;
  const popupPriorityOpen =
    Boolean(selectedLocation) ||
    Boolean(selectedCapture) ||
    Boolean(selectedCaptureSpot) ||
    spotPopupOpen ||
    capturePopupOpen;

  useEffect(() => {
    let active = true;

    async function migrateLegacyPhotos() {
      const result = await migrateLegacyCapturePhotosInLocalStorage();

      if (!active) {
        return;
      }

      if (result.changed) {
        setCaptures(readStoredCaptures());
      }

      if (result.remainingBase64PhotosInLocalStorage > 0) {
        setStorageFeedback("Algumas fotos antigas nao puderam ser migradas agora. Nenhuma captura foi apagada.");
      }

      setCapturePhotoMigrationDone(true);
    }

    void migrateLegacyPhotos();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;

    async function persistCaptures() {
      if (!capturePhotoMigrationDone) {
        return;
      }

      const photosSynced = await syncCapturePhotos(captures);

      if (!active) {
        return;
      }

      if (!photosSynced && captures.some((capture) => isCapturePhotoDataUrl(capture.photo))) {
        console.warn("Capturas com fotos em memoria nao foram confirmadas no IndexedDB; localStorage nao foi regravado.");
        setStorageFeedback("Algumas fotos nao foram confirmadas no armazenamento. Nada foi apagado.");
        return;
      }

      try {
        const metadataSaved = persistLightweightCaptures(captures);

        if (!metadataSaved) {
          setStorageFeedback("Nao foi possivel salvar as capturas agora. As fotos nao foram colocadas no localStorage.");
        }
      } catch (error) {
        console.warn("Nao foi possivel salvar metadados das capturas no localStorage.", error);
        setStorageFeedback("Nao foi possivel salvar as capturas agora. O app continua funcionando.");
      }

      if (!photosSynced) {
        console.warn("Algumas fotos de capturas nao foram persistidas no IndexedDB.");
        setStorageFeedback("A captura foi salva, mas a foto nao pode ser armazenada neste navegador.");
      }
    }

    void persistCaptures();

    return () => {
      active = false;
    };
  }, [captures, capturePhotoMigrationDone]);

  useEffect(() => {
    if (!capturePhotoMigrationDone) {
      return;
    }

    let active = true;

    async function loadIndexedDbPhotos() {
      const capturesWithPhotos = await Promise.all(
        captures.map(async (capture) => {
          if (capture.photo) {
            return capture;
          }

          const photo = await readCapturePhoto(capture.id);

          return photo ? { ...capture, photo } : capture;
        })
      );

      if (!active) {
        return;
      }

      const hasLoadedPhoto = capturesWithPhotos.some(
        (capture, index) => capture.photo !== captures[index]?.photo
      );

      if (hasLoadedPhoto) {
        setCaptures(capturesWithPhotos);
      }
    }

    void loadIndexedDbPhotos();

    return () => {
      active = false;
    };
    // Carrega fotos do IndexedDB apenas na montagem; alteracoes novas ja estao no estado.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [capturePhotoMigrationDone]);

  useEffect(() => {
    try {
      window.localStorage.setItem(PERSONAL_PLACES_STORAGE_KEY, JSON.stringify(personalPlaces));
    } catch (error) {
      console.warn("Nao foi possivel salvar Meus Lugares no localStorage.", error);
    }
  }, [personalPlaces]);

  useEffect(() => {
    if (!storageFeedback) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setStorageFeedback(null);
    }, 4200);

    return () => window.clearTimeout(timeoutId);
  }, [storageFeedback]);

  function safeText(value: unknown, fallback = "Dados indisponíveis") {
    if (typeof value !== "string") {
      return fallback;
    }

    const trimmedValue = value.trim();

    return trimmedValue && trimmedValue !== "N/A" ? trimmedValue : fallback;
  }

  function safeNumberWithUnit(value: unknown, unit: string, fallback = "Dados indisponíveis") {
    const numericValue = typeof value === "number" ? value : Number(value);

    return Number.isFinite(numericValue) ? `${Math.round(numericValue)} ${unit}` : fallback;
  }

  function hasValidCoordinates(lat: number, lng: number) {
    return Number.isFinite(lat) && Number.isFinite(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
  }

  function mayHaveMarineData(lat: number, lng: number, spotType?: FishingSpot["type"]) {
    if (spotType === "litoral" || spotType === "baía") {
      return true;
    }

    if (spotType === "rio" || spotType === "represa") {
      return false;
    }

    const nearEquatorOceanBelt = Math.abs(lat) < 68;
    const offshoreLongitudeBand = Math.abs(lng) > 20 && Math.abs(lng) < 175;

    return nearEquatorOceanBelt && offshoreLongitudeBand;
  }

  function normalizeConditions(
    conditions: Partial<SpotConditions> | null | undefined,
    lat: number,
    lng: number,
    spotType?: FishingSpot["type"]
  ): LocationConditions {
    const marineDataAvailable = hasValidCoordinates(lat, lng) && mayHaveMarineData(lat, lng, spotType);

    return {
      clima: safeText(conditions?.clima),
      pressao: safeNumberWithUnit(conditions?.pressao, "hPa"),
      temperatura: safeNumberWithUnit(conditions?.temperatura, "°C"),
      tempAgua: marineDataAvailable
        ? safeNumberWithUnit(conditions?.tempAgua, "°C", "Temperatura da água indisponível")
        : "Temperatura da água indisponível",
      lua: safeText(conditions?.lua),
      mare: marineDataAvailable ? safeText(conditions?.mare, "Maré indisponível para este local") : "Maré indisponível para este local",
    };
  }

  function getConditionsForLocation(lat: number, lng: number): LocationConditions {
    if (!hasValidCoordinates(lat, lng)) {
      return normalizeConditions(null, lat, lng);
    }

    const climaOptions = ["Ensolarado", "Nublado", "Chuvoso", "Ventando", "Calmo", "Parcialmente nublado"];
    const luaOptions = ["Nova", "Crescente", "Cheia", "Minguante"];
    const marineDataAvailable = mayHaveMarineData(lat, lng);
    const mareOptions = ["Alta", "Baixa", "Média"];

    return normalizeConditions({
      clima: climaOptions[Math.floor(Math.abs(lat + lng) * 7) % climaOptions.length],
      pressao: 1010 + Math.round((Math.abs(lat - lng) * 10) % 15),
      tempAgua: marineDataAvailable ? 18 + Math.round((Math.abs(lat + lng) * 3) % 8) : undefined,
      temperatura: 20 + Math.round((Math.abs(lat * lng) * 0.1) % 10),
      lua: luaOptions[Math.floor((Math.abs(lat) + Math.abs(lng)) * 3) % luaOptions.length],
      mare: marineDataAvailable ? mareOptions[Math.floor((Math.abs(lat - lng) * 5)) % mareOptions.length] : undefined,
    }, lat, lng);
  }

  function getSpotConditions(spot: FishingSpot) {
    return normalizeConditions(spot.conditions, spot.lat, spot.lng, spot.type);
  }

  function parseConditionNumber(value: string) {
    const match = value.match(/-?\d+([.,]\d+)?/);

    if (!match) {
      return null;
    }

    const parsedValue = Number(match[0].replace(",", "."));

    return Number.isFinite(parsedValue) ? parsedValue : null;
  }

  function getScoreLabel(score: number) {
    if (score <= 30) return "Condição fraca";
    if (score <= 55) return "Condição regular";
    if (score <= 75) return "Boa condição";
    if (score <= 90) return "Ótima condição";
    return "Excelente condição";
  }

  function calculateFishCastScore(conditions: LocationConditions): FishCastScore {
    const scores: { value: number; weight: number }[] = [];
    const expectedSignals = 7;

    const pressure = parseConditionNumber(conditions.pressao);
    if (pressure !== null) {
      const pressureScore = Math.max(0, 100 - Math.abs(pressure - 1018) * 7);
      scores.push({ value: pressureScore, weight: 1.3 });
    }

    const weather = conditions.clima.toLowerCase();
    if (!weather.includes("indispon")) {
      let weatherScore = 62;
      if (weather.includes("calmo") || weather.includes("ensolarado") || weather.includes("parcial")) weatherScore = 84;
      if (weather.includes("nublado") || weather.includes("encoberto") || weather.includes("brisa")) weatherScore = 72;
      if (weather.includes("vent")) weatherScore = 54;
      if (weather.includes("chuv")) weatherScore = 46;
      scores.push({ value: weatherScore, weight: 1 });
    }

    const airTemperature = parseConditionNumber(conditions.temperatura);
    if (airTemperature !== null) {
      const airScore = Math.max(0, 100 - Math.abs(airTemperature - 24) * 6);
      scores.push({ value: airScore, weight: 0.9 });
    }

    const waterTemperature = parseConditionNumber(conditions.tempAgua);
    if (waterTemperature !== null) {
      const waterScore = Math.max(0, 100 - Math.abs(waterTemperature - 23) * 7);
      scores.push({ value: waterScore, weight: 1.15 });
    }

    const tide = conditions.mare.toLowerCase();
    if (!tide.includes("indispon")) {
      let tideScore = 64;
      if (tide.includes("alta") || tide.includes("média")) tideScore = 78;
      if (tide.includes("baixa")) tideScore = 56;
      scores.push({ value: tideScore, weight: 0.85 });
    }

    const moon = conditions.lua.toLowerCase();
    if (!moon.includes("indispon")) {
      let moonScore = 62;
      if (moon.includes("cheia") || moon.includes("nova")) moonScore = 78;
      if (moon.includes("crescente") || moon.includes("minguante")) moonScore = 68;
      scores.push({ value: moonScore, weight: 0.7 });
    }

    const wind = conditions.clima.toLowerCase();
    if (wind.includes("vento") || wind.includes("brisa") || wind.includes("calmo")) {
      let windScore = 72;
      if (wind.includes("calmo") || wind.includes("brisa")) windScore = 86;
      if (wind.includes("vent")) windScore = 48;
      scores.push({ value: windScore, weight: 0.6 });
    }

    if (!scores.length) {
      return {
        value: 0,
        label: "Condição fraca",
        partial: true,
      };
    }

    const totalWeight = scores.reduce((sum, score) => sum + score.weight, 0);
    const weightedScore = scores.reduce((sum, score) => sum + score.value * score.weight, 0) / totalWeight;
    const value = Math.max(0, Math.min(100, Math.round(weightedScore)));

    return {
      value,
      label: getScoreLabel(value),
      partial: scores.length < expectedSignals,
    };
  }

  function handleMapClick(lat: number, lng: number) {
    setSelectedCapture(null);
    setShareOptionsCaptureId(null);
    setSelectedLocation({
      name: "Ponto selecionado",
      lat,
      lng,
      conditions: getConditionsForLocation(lat, lng),
    });
  }

  function formatCaptureDate(value: string) {
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(value));
  }

  function getCaptureTitle(capture: Capture, index: number) {
    return capture.species || `Captura #${index + 1}`;
  }

  function getScorePresentation(score: number) {
    if (score <= 39) {
      return {
        badge: "Pescaria difícil",
        headline: "Pescaria difícil",
        description: "Condições pedem mais paciência e pontos bem escolhidos.",
        icon: "!",
      };
    }

    if (score <= 59) {
      return {
        badge: "Condição regular",
        headline: "Condição regular",
        description: "Há oportunidade, mas vale refinar isca e apresentação.",
        icon: "+",
      };
    }

    if (score <= 74) {
      return {
        badge: "Bom momento",
        headline: "Bom momento",
        description: "Sinais favoráveis para trabalhar estruturas e corrente.",
        icon: "✓",
      };
    }

    if (score <= 89) {
      return {
        badge: "Ótima condição",
        headline: "Excelente momento!",
        description: "Condições acima da média para capturas.",
        icon: "🏆",
      };
    }

    return {
      badge: "Excelente condição",
      headline: "Excelente momento!",
      description: "Cenário muito favorável para capturas.",
      icon: "🏆",
    };
  }

  function getPressurePresentation(value: string) {
    const pressure = parseConditionNumber(value);

    if (pressure === null) {
      return {
        badge: "Indisponível",
        description: "Sem leitura suficiente para interpretar a pressão.",
      };
    }

    if (pressure < 1005) {
      return {
        badge: "Instável",
        description: "Pressão baixa pode deixar a atividade irregular.",
      };
    }

    if (pressure <= 1010) {
      return {
        badge: "Regular",
        description: "Pressão em transição pede atenção ao comportamento.",
      };
    }

    if (pressure <= 1018) {
      return {
        badge: "Boa",
        description: "Pressão estável favorece atividade dos peixes.",
      };
    }

    return {
      badge: "Alta",
      description: "Pressão alta pode concentrar os peixes em pontos fundos.",
    };
  }

  function getSpotConditionRows(conditions: LocationConditions) {
    const pressure = getPressurePresentation(conditions.pressao);
    const tideDirection = conditions.mare.toLowerCase().includes("indispon")
      ? ""
      : " (estável)";

    return [
      {
        icon: "☁",
        label: "Clima",
        value: conditions.clima,
        description: "Luz reduzida favorece ataques.",
        badge: conditions.clima.toLowerCase().includes("chuv") ? "Regular" : "Favorável",
        badgeIcon: "●",
      },
      {
        icon: "↗",
        label: "Pressão",
        value: conditions.pressao,
        description: pressure.description,
        badge: pressure.badge,
        badgeIcon: pressure.badge === "Boa" ? "👍" : "●",
      },
      {
        icon: "♨",
        label: "Temperatura do ar",
        value: conditions.temperatura,
        description: "Faixa confortável.",
        badge: "Ideal",
        badgeIcon: "●",
      },
      {
        icon: "💧",
        label: "Temperatura da água",
        value: conditions.tempAgua,
        description: "Temperatura ideal para peixes.",
        badge: conditions.tempAgua.toLowerCase().includes("indispon") ? "Parcial" : "Excelente",
        badgeIcon: "★",
      },
      {
        icon: "◐",
        label: "Lua",
        value: conditions.lua,
        description: "Boa atividade alimentar.",
        badge: "Boa",
        badgeIcon: "👍",
      },
      {
        icon: "≋",
        label: "Maré",
        value: `${conditions.mare}${tideDirection}`,
        description: "Movimento favorece alimentação e deslocamento.",
        badge: conditions.mare.toLowerCase().includes("indispon") ? "Parcial" : "Favorável",
        badgeIcon: "●",
      },
    ];
  }

  function formatCaptureSize(value: string) {
    const size = parseConditionNumber(value);

    if (size === null) {
      return "—";
    }

    if (size >= 100) {
      return `${(size / 100).toFixed(2).replace(".", ",")} m`;
    }

    return `${size.toFixed(0)} cm`;
  }

  function getLargestCaptureSizeValue(spotCaptures: Capture[]) {
    const largestSize = spotCaptures.reduce<number | null>((largest, capture) => {
      const size = parseConditionNumber(capture.size);

      if (size === null) {
        return largest;
      }

      return largest === null || size > largest ? size : largest;
    }, null);

    return largestSize === null ? "—" : formatCaptureSize(String(largestSize));
  }

  function formatSpotHistoryDate(value?: string) {
    if (!value) {
      return "—";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "—";
    }

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const startOfDate = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
    const time = new Intl.DateTimeFormat("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);

    if (startOfDate === startOfToday) {
      return `Hoje, ${time}`;
    }

    if (startOfDate === startOfToday - 24 * 60 * 60 * 1000) {
      return `Ontem, ${time}`;
    }

    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  }

  function getLastSpotCaptureDate(spotCaptures: Capture[]) {
    const latestCapture = spotCaptures.reduce<Capture | null>((latest, capture) => {
      const captureTime = new Date(capture.capturedAt).getTime();

      if (Number.isNaN(captureTime)) {
        return latest;
      }

      if (!latest) {
        return capture;
      }

      return captureTime > new Date(latest.capturedAt).getTime() ? capture : latest;
    }, null);

    return formatSpotHistoryDate(latestCapture?.capturedAt);
  }

  function getBestWeight() {
    const weights = captures
      .map((capture) => Number.parseFloat(capture.weight))
      .filter((weight) => Number.isFinite(weight));

    if (!weights.length) {
      return "--";
    }

    return `${Math.max(...weights).toFixed(1)} kg`;
  }

  function getNearestPersonalPlace(lat: number, lng: number) {
    let nearest: { place: PersonalPlace; distance: number } | null = null;

    for (const place of personalPlaces) {
      const distance = getDistanceMeters({ lat, lng }, place);

      if (!nearest || distance < nearest.distance) {
        nearest = { place, distance };
      }
    }

    return nearest && nearest.distance <= PERSONAL_PLACE_CAPTURE_RADIUS_METERS
      ? nearest.place
      : null;
  }

  function getCapturesForPlace(placeId: number) {
    return captures.filter((capture) => capture.placeId === placeId);
  }

  function getCaptureSpotKey(capture: Capture) {
    return `${capture.lat},${capture.lng}`;
  }

  function getCapturesForCaptureSpot(capture: Capture) {
    const key = getCaptureSpotKey(capture);

    return captures.filter(
      (item) => !item.placeId && getCaptureSpotKey(item) === key
    );
  }

  function getCaptureSpotMarkers() {
    const seenSpotKeys = new Set<string>();

    return captures.filter((capture) => {
      if (capture.placeId) {
        return false;
      }

      const key = getCaptureSpotKey(capture);

      if (seenSpotKeys.has(key)) {
        return false;
      }

      seenSpotKeys.add(key);
      return true;
    });
  }

  function getCaptureLocationText(capture: Capture, shareMode: CaptureShareMode) {
    const place = capture.placeId
      ? personalPlaces.find((personalPlace) => personalPlace.id === capture.placeId)
      : null;

    if (shareMode === "secret") {
      return place ? `Região aproximada de ${place.name}` : "Região aproximada do ponto de captura";
    }

    const coordinates = `${capture.lat.toFixed(6)}, ${capture.lng.toFixed(6)}`;

    return place ? `${place.name} - ${coordinates}` : coordinates;
  }

  function showShareFeedback(captureId: number, message: string) {
    setShareFeedback({ captureId, message });

    window.setTimeout(() => {
      setShareFeedback((current) => (current?.captureId === captureId ? null : current));
    }, 1800);
  }

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

        reject(new Error("Não foi possível gerar a imagem"));
      }, "image/png", 0.95);
    });
  }

  async function createCaptureShareImage(capture: Capture, shareMode: CaptureShareMode) {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");

    if (!context) {
      throw new Error("Canvas indisponível");
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
    const estimatedRightEndY = fieldsStartY + estimatedFieldHeight * 2 + (shareMode === "secret" ? 82 : 0);
    const observationsY = portraitPhoto
      ? Math.max(estimatedLeftEndY, estimatedRightEndY) + 32
      : 1188;
    const height = portraitPhoto ? observationsY + 162 : 1350;

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
    context.fillText("FishCastPR", padding, 78);
    context.fillStyle = "rgba(207, 250, 254, 0.72)";
    context.font = "700 22px Arial, sans-serif";
    context.fillText("Diário de captura", padding, 116);

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
      context.fillText("Captura FishCastPR", photoFrameX + 48, 420);
    }

    context.restore();

    context.strokeStyle = "rgba(255, 255, 255, 0.16)";
    context.lineWidth = 3;
    drawRoundedRect(context, photoFrameX, photoFrameY, photoFrameWidth, photoFrameHeight, 24);
    context.stroke();

    const badgeText = shareMode === "secret"
      ? "🔒 Compartilhamento secreto"
      : "✓ Compartilhamento completo";
    context.fillStyle = shareMode === "secret" ? "#f87171" : "#34d399";
    context.font = "800 28px Arial, sans-serif";
    context.fillText(badgeText, padding, badgeY + 34);

    context.fillStyle = "#ffffff";
    context.font = "900 62px Arial, sans-serif";
    drawWrappedText(context, capture.species || "Espécie não informada", padding, titleY, width - padding * 2, 68, 2);

    const columnGap = 28;
    const columnWidth = (width - padding * 2 - columnGap) / 2;
    let leftY = fieldsStartY;
    let rightY = fieldsStartY;

    leftY += drawShareField(context, "Peso", capture.weight ? `${capture.weight} kg` : "--", padding, leftY, columnWidth);
    leftY += drawShareField(context, "Tamanho", capture.size ? `${capture.size} cm` : "--", padding, leftY, columnWidth);
    drawShareField(context, "Isca", capture.bait || "--", padding, leftY, columnWidth);

    rightY += drawShareField(context, "Data/hora", formatCaptureDate(capture.capturedAt), padding + columnWidth + columnGap, rightY, columnWidth);
    rightY += drawShareField(context, shareMode === "secret" ? "Localização" : "Coordenadas", getCaptureLocationText(capture, shareMode), padding + columnWidth + columnGap, rightY, columnWidth);

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
    context.fillText("OBSERVAÇÕES", padding + 24, observationsY + 36);
    context.fillStyle = "#ffffff";
    context.font = "700 27px Arial, sans-serif";
    drawWrappedText(context, capture.comment || "Sem observações adicionadas.", padding + 24, observationsY + 74, width - padding * 2 - 48, 32, 2);

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

  async function shareCapture(capture: Capture, shareMode: CaptureShareMode) {
    const imageFile = await createCaptureShareImage(capture, shareMode);
    const title = capture.species || "Captura FishCastPR";
    const shareData: ShareData = {
      title,
      files: [imageFile],
    };

    try {
      if (navigator.share && navigator.canShare?.(shareData)) {
        await navigator.share(shareData);

        showShareFeedback(capture.id, "Compartilhado!");
        setShareOptionsCaptureId(null);
        return;
      }

      const copied = await copyShareImage(imageFile).catch(() => false);

      if (copied) {
        showShareFeedback(capture.id, "Imagem copiada!");
      } else {
        downloadShareImage(imageFile);
        showShareFeedback(capture.id, "Imagem baixada!");
      }

      setShareOptionsCaptureId(null);
    } catch (error) {
      if ((error as DOMException).name === "AbortError") {
        return;
      }

      try {
        const copied = await copyShareImage(imageFile).catch(() => false);

        if (copied) {
          showShareFeedback(capture.id, "Imagem copiada!");
        } else {
          downloadShareImage(imageFile);
          showShareFeedback(capture.id, "Imagem baixada!");
        }

        setShareOptionsCaptureId(null);
      } catch {
        downloadShareImage(imageFile);
        showShareFeedback(capture.id, "Imagem baixada!");
      }
    }
  }

  function saveCapture() {
    if (!pendingCapture) return;

    const nearestPlace =
      typeof pendingCapture.placeId === "undefined"
        ? getNearestPersonalPlace(pendingCapture.lat, pendingCapture.lng)
        : null;
    const capturePlaceId =
      typeof pendingCapture.placeId === "undefined"
        ? nearestPlace?.id
        : pendingCapture.placeId || undefined;

    setCaptures((prev) => [
      ...prev,
      {
        id: Date.now(),
        lat: pendingCapture.lat,
        lng: pendingCapture.lng,
        placeId: capturePlaceId,
        species: formData.species,
        weight: formData.weight,
        size: formData.size,
        bait: formData.bait,
        comment: formData.comment,
        photo: formData.photo,
        capturedAt: new Date(`${formData.capturedDate || getCurrentDateInputValue()}T${formData.capturedTime || getCurrentTimeInputValue()}`).toISOString(),
      },
    ]);
    setPendingCapture(null);
    setFormData(createEmptyFormData());
    setCaptureMode(false);
    setPlaceMode(false);
  }

  function cancelCapture() {
    setPendingCapture(null);
    setFormData(createEmptyFormData());
    setCaptureMode(false);
  }

  function addCapture(lat: number, lng: number) {
    setPendingCapture({ lat, lng });
  }

  function addCaptureAtPersonalPlace(place: PersonalPlace) {
    setPendingCapture({ lat: place.lat, lng: place.lng, placeId: place.id });
    setSelectedLocation(null);
    setSelectedCapture(null);
    setCaptureMode(false);
    setPlaceMode(false);
    setCapturesPanelOpen(false);
  }

  function addPersonalPlace(lat: number, lng: number) {
    setPendingPlace({ lat, lng });
    setSelectedLocation(null);
  }

  function savePersonalPlace() {
    if (!pendingPlace) return;

    const trimmedName = placeFormData.name.trim();

    setPersonalPlaces((prev) => [
      ...prev,
      {
        id: Date.now(),
        lat: pendingPlace.lat,
        lng: pendingPlace.lng,
        name: trimmedName || "Meu lugar",
        note: placeFormData.note.trim(),
        visibility: "private",
        createdAt: new Date().toISOString(),
      },
    ]);
    setPendingPlace(null);
    setPlaceFormData(createEmptyPlaceFormData());
    setPlaceMode(false);
    setSelectedCapture(null);
  }

  function cancelPersonalPlace() {
    setPendingPlace(null);
    setPlaceFormData(createEmptyPlaceFormData());
    setPlaceMode(false);
  }

  function deleteCapture(id: number) {
    setCaptures((prev) => prev.filter((capture) => capture.id !== id));
    void deleteCapturePhoto(id);
    setCapturePopupOpen(false);
    setShareOptionsCaptureId(null);
    setSelectedCapture((current) => (current?.id === id ? null : current));
  }

  function deletePersonalPlace(id: number) {
    const confirmed = window.confirm("Deseja realmente apagar este lugar?");

    if (!confirmed) {
      return;
    }

    setPersonalPlaces((prev) => prev.filter((place) => place.id !== id));
    setSelectedLocation((current) => (current?.personalPlaceId === id ? null : current));
  }

  function focusCaptureMarker(capture: Capture) {
    const place = capture.placeId
      ? personalPlaces.find((personalPlace) => personalPlace.id === capture.placeId)
      : null;

    setFocusTarget({ id: capture.id, lat: capture.lat, lng: capture.lng });
    if (place) {
      setFocusTarget({ id: place.id, lat: place.lat, lng: place.lng });
    }
    setSelectedLocation(null);
    setSelectedCapture(null);
    setSelectedCaptureSpot(null);
    setShareOptionsCaptureId(null);
    setCapturesPanelOpen(false);
  }

  function openCaptureDetails(capture: Capture) {
    setSelectedLocation(null);
    setSelectedCaptureSpot(null);
    setCapturesPanelOpen(false);
    setShareOptionsCaptureId(null);
    setSelectedCapture(capture);
  }

  function openCaptureSpotCard(captureId: number) {
    const fullCapture = captures.find((capture) => capture.id === captureId);

    if (!fullCapture) {
      return;
    }

    openCaptureDetails(fullCapture);
  }

  function openCaptureMarker(capture: Capture) {
    const spotCaptures = getCapturesForCaptureSpot(capture);

    setSelectedLocation(null);
    setCapturesPanelOpen(false);
    setCapturePopupOpen(false);
    setSpotPopupOpen(false);
    setShareOptionsCaptureId(null);

    setSelectedCapture(null);
    setSelectedCaptureSpot({
      lat: capture.lat,
      lng: capture.lng,
      captures: spotCaptures,
    });
  }

  return (
    <div className="relative w-full h-full">
      {storageFeedback && (
        <div
          className="map-control-overlay fixed left-1/2 top-4 z-[9000] w-[calc(100vw-32px)] max-w-[420px] -translate-x-1/2 rounded-sm border border-amber-300/30 bg-amber-950/95 px-4 py-3 text-sm font-bold leading-snug text-amber-50 shadow-[0_18px_60px_rgba(0,0,0,0.45)]"
          role="status"
        >
          {storageFeedback}
        </div>
      )}

      <div
        className={`map-control-overlay absolute bottom-4 right-4 z-[2000] flex flex-col items-end gap-0 transition sm:bottom-6 sm:right-6 ${
          popupPriorityOpen ? "pointer-events-none opacity-0" : "opacity-100"
        }`}
      >
        <MapActionButton
          label="Adicionar Captura"
          iconSrc="/icons/adicionar-captura.png"
          onClick={() => {
            setCaptureMode((prev) => !prev);
            setPlaceMode(false);
            setCapturesPanelOpen(false);
            setSelectedCaptureSpot(null);
          }}
          ariaLabel={captureMode ? "Cancelar marcação de captura" : "Adicionar captura"}
          title={captureMode ? "Cancelar captura" : "Adicionar captura"}
        />

        <MapActionButton
          label="Meus Lugares"
          iconSrc="/icons/meus-lugares.png"
          onClick={() => {
            setPlaceMode((prev) => !prev);
            setCaptureMode(false);
            setCapturesPanelOpen(false);
            setSelectedCaptureSpot(null);
          }}
          ariaLabel={placeMode ? "Cancelar marcação de lugar" : "Adicionar meus lugares"}
          title={placeMode ? "Cancelar lugar" : "Meus lugares"}
        />

        <MapActionButton
          label="Minhas Capturas"
          iconSrc="/icons/minhas-capturas.png"
          badge={captures.length}
          onClick={() => {
            setCapturesPanelOpen((prev) => !prev);
            setCaptureMode(false);
            setPlaceMode(false);
            setSelectedLocation(null);
            setSelectedCapture(null);
            setSelectedCaptureSpot(null);
            setShareOptionsCaptureId(null);
          }}
          ariaLabel="Ver minhas capturas"
          title="Ver minhas capturas"
        />
      </div>

      <MapModeSelector
        mode={mapMode}
        onChange={setMapMode}
        hidden={popupPriorityOpen || Boolean(pendingCapture) || Boolean(pendingPlace)}
      />

      {captureMode && (
        <div className="absolute bottom-[270px] right-4 z-[2000] max-w-[210px] rounded-sm border border-cyan-500/20 bg-[#020a14]/95 px-4 py-3 text-center text-sm font-bold text-white shadow-[0_20px_70px_rgba(0,0,0,0.55)] sm:bottom-[292px] sm:right-6 sm:max-w-[240px] sm:px-5 sm:py-4">
          Toque uma vez no mapa para marcar a captura
        </div>
      )}

      {placeMode && (
        <div className="absolute bottom-[270px] right-4 z-[2000] max-w-[210px] rounded-sm border border-cyan-300/25 bg-[#020a14]/95 px-4 py-3 text-center text-sm font-bold text-cyan-50 shadow-[0_20px_70px_rgba(0,0,0,0.55),0_0_26px_rgba(34,211,238,0.18)] sm:bottom-[292px] sm:right-6 sm:max-w-[240px] sm:px-5 sm:py-4">
          Toque no mapa para salvar um lugar privado
        </div>
      )}

      {capturesPanelOpen && (
        <aside
          className="map-control-overlay absolute bottom-[270px] right-4 z-[2200] flex max-h-[min(58vh,620px)] w-[min(calc(100vw-24px),460px)] flex-col overflow-hidden rounded-md border border-cyan-300/18 bg-[#020a14]/97 text-white shadow-[0_28px_90px_rgba(0,0,0,0.62),0_0_42px_rgba(34,211,238,0.18)] backdrop-blur-xl sm:bottom-[292px] sm:right-6"
          onPointerDown={(e) => e.stopPropagation()}
        >
          <div className="border-b border-white/10 p-4 sm:p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.22em] text-emerald-200">
                  Diario local
                </p>
                <h2 className="mt-1 text-3xl font-black leading-none text-white">Minhas capturas</h2>
              </div>
              <button
                onClick={() => setCapturesPanelOpen(false)}
                className="flex h-10 w-10 items-center justify-center rounded-sm border border-white/10 bg-white/[0.06] text-lg font-black text-zinc-200 transition hover:bg-white/[0.12]"
                aria-label="Fechar minhas capturas"
              >
                ×
              </button>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2 rounded-sm border border-yellow-300/20 bg-yellow-300/5 p-2">
              <div className="rounded-sm border border-emerald-300/15 bg-black/25 p-2.5">
                <p className={infoLabelClass}>Total</p>
                <p className="mt-1 text-lg font-black">{captures.length}</p>
              </div>
              <div className="rounded-sm border border-emerald-300/15 bg-black/25 p-2.5">
                <p className={infoLabelClass}>Maior</p>
                <p className="mt-1 text-lg font-black">{getBestWeight()}</p>
              </div>
              <div className="rounded-sm border border-emerald-300/15 bg-black/25 p-2.5">
                <p className={infoLabelClass}>Última captura</p>
                <p className="mt-1 text-sm font-black leading-tight sm:text-lg">
                  {getLastSpotCaptureDate(captures)}
                </p>
              </div>
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto p-3 sm:p-4">
            {captures.length === 0 ? (
                <div className="rounded-md border border-dashed border-emerald-300/25 bg-emerald-300/[0.05] p-5 text-center">
                <p className="text-sm font-bold text-emerald-100">Nenhuma captura salva ainda.</p>
                <p className="mt-2 text-xs leading-relaxed text-zinc-400">
                  Use o botão de captura, toque no mapa e salve os detalhes do peixe.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {[...captures].reverse().map((capture, reverseIndex) => {
                  const originalIndex = captures.length - 1 - reverseIndex;

                  return (
                    <article
                      key={`capture-panel-${capture.id}`}
                      onClick={() => focusCaptureMarker(capture)}
                      className="flex cursor-pointer gap-3 rounded-sm border border-white/10 bg-white/[0.06] p-3 transition hover:border-emerald-300/25 hover:bg-white/[0.09]"
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          focusCaptureMarker(capture);
                        }
                      }}
                    >
                      <div className="h-16 w-24 shrink-0 overflow-hidden rounded-sm border border-white/10 bg-black/30">
                        {capture.photo ? (
                          <img
                            src={capture.photo}
                            alt="Foto da captura"
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="h-full w-full bg-[radial-gradient(circle_at_50%_25%,rgba(34,197,94,0.36),transparent_42%),linear-gradient(135deg,#052e1c,#020617_58%,#000)]" />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <h3 className="truncate text-sm font-black">
                              {getCaptureTitle(capture, originalIndex)}
                            </h3>
                            <p className="mt-1 text-xs font-bold text-zinc-300">
                              {capture.size ? `${capture.size} cm` : "Tam. --"} • {capture.weight ? `${capture.weight} kg` : "Peso --"}
                            </p>
                          </div>
                          <span className="shrink-0 rounded-sm border border-emerald-300/20 bg-emerald-300/10 px-2 py-1 text-[9px] font-black uppercase tracking-[0.12em] text-emerald-100">
                            Minha
                          </span>
                        </div>

                        <p className="mt-3 text-xs font-bold leading-relaxed text-zinc-400">
                          {formatCaptureDate(capture.capturedAt)}
                        </p>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </aside>
      )}

      {pendingCapture && (
        <div className="fixed inset-0 z-[3000] bg-black/80">
          <div className="fixed left-1/2 top-1/2 max-h-[calc(100vh-24px)] w-[calc(100vw-24px)] max-w-[460px] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-md border border-cyan-300/18 bg-[#020a14]/97 p-4 text-white shadow-[0_24px_80px_rgba(0,0,0,0.62),0_0_34px_rgba(34,211,238,0.18)] backdrop-blur-xl sm:p-5">
            <div className="mb-4 border-b border-white/10 pb-4 text-center">
              <p className="text-[11px] font-black uppercase tracking-[0.22em] text-emerald-200">Adicionar captura</p>
              <h2 className="mt-1 text-3xl font-black leading-none text-white">Detalhes da captura</h2>
              <p className="mt-2 text-xs font-bold leading-relaxed text-zinc-300">
                Ponto exato selecionado: {pendingCapture.lat.toFixed(8)}, {pendingCapture.lng.toFixed(8)}
              </p>
            </div>
            
            <div className="space-y-4">
              <div>
                  <label className="text-sm font-black uppercase tracking-[0.12em] text-emerald-200">Espécie</label>
                <input
                  type="text"
                  placeholder="Ex: Tilápia"
                  value={formData.species}
                  onChange={(e) => setFormData({ ...formData, species: e.target.value })}
                  className="mt-1 w-full rounded-sm border border-cyan-300/18 bg-black/25 px-3 py-2 text-white placeholder-zinc-500 focus:border-cyan-300 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                   <label className="text-sm font-black uppercase tracking-[0.12em] text-emerald-200">Peso (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="2.5"
                    value={formData.weight}
                    onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                    className="mt-1 w-full rounded-sm border border-cyan-300/18 bg-black/25 px-3 py-2 text-white placeholder-zinc-500 focus:border-cyan-300 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-sm font-black uppercase tracking-[0.12em] text-emerald-200">Tamanho (cm)</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="30"
                    value={formData.size}
                    onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                    className="mt-1 w-full rounded-sm border border-cyan-300/18 bg-black/25 px-3 py-2 text-white placeholder-zinc-500 focus:border-cyan-300 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-black uppercase tracking-[0.12em] text-emerald-200">Isca</label>
                <input
                  type="text"
                  placeholder="Ex: Minhoca, Ração"
                  value={formData.bait}
                  onChange={(e) => setFormData({ ...formData, bait: e.target.value })}
                  className="mt-1 w-full rounded-sm border border-cyan-300/18 bg-black/25 px-3 py-2 text-white placeholder-zinc-500 focus:border-cyan-300 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-black uppercase tracking-[0.12em] text-emerald-200">Data</label>
                  <input
                    type="date"
                    value={formData.capturedDate}
                    onChange={(e) => setFormData({ ...formData, capturedDate: e.target.value })}
                    className="mt-1 w-full rounded-sm border border-cyan-300/18 bg-black/25 px-3 py-2 text-white placeholder-zinc-500 focus:border-cyan-300 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-sm font-black uppercase tracking-[0.12em] text-emerald-200">Hora</label>
                  <input
                    type="time"
                    value={formData.capturedTime}
                    onChange={(e) => setFormData({ ...formData, capturedTime: e.target.value })}
                    className="mt-1 w-full rounded-sm border border-cyan-300/18 bg-black/25 px-3 py-2 text-white placeholder-zinc-500 focus:border-cyan-300 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-black uppercase tracking-[0.12em] text-emerald-200">Foto</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];

                    if (!file) {
                      return;
                    }

                    const reader = new FileReader();

                    reader.onload = (event) => {
                      setFormData({
                        ...formData,
                        photo: String(event.target?.result || ""),
                      });
                    };

                    reader.readAsDataURL(file);
                  }}
                  className="mt-1 w-full rounded-sm border border-cyan-300/18 bg-black/25 px-3 py-2 text-white file:cursor-pointer file:rounded-none file:border-0 file:bg-emerald-600 file:px-3 file:py-1 file:text-white hover:file:bg-emerald-700 focus:border-cyan-300 focus:outline-none"
                />
                {formData.photo && (
                  <p className="mt-1 text-xs font-bold text-emerald-300">
                    Foto adicionada ao marcador da captura.
                  </p>
                )}
              </div>

              <div>
                <label className="text-sm font-black uppercase tracking-[0.12em] text-emerald-200">Comentário</label>
                <textarea
                  placeholder="Notas sobre a captura..."
                  value={formData.comment}
                  onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                  className="mt-1 h-24 w-full resize-none rounded-sm border border-cyan-300/18 bg-black/25 px-3 py-3 text-white placeholder-zinc-500 focus:border-cyan-300 focus:outline-none sm:h-28"
                />
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  onClick={saveCapture}
                  className={panelButtonSuccess}
                >
                  Confirmar captura aqui
                </button>
                <button
                  onClick={cancelCapture}
                  className={panelButtonDanger}
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {pendingPlace && (
        <div className="fixed inset-0 z-[3000] bg-black/80">
          <div className="fixed left-1/2 top-1/2 max-h-[calc(100vh-24px)] w-[calc(100vw-24px)] max-w-[460px] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-md border border-cyan-300/18 bg-[#020a14]/97 p-4 text-white shadow-[0_24px_80px_rgba(0,0,0,0.62),0_0_34px_rgba(34,211,238,0.18)] backdrop-blur-xl sm:p-5">
            <p className="text-center text-[11px] font-black uppercase tracking-[0.22em] text-emerald-200">Meus Lugares</p>
            <h2 className="mb-1 mt-1 text-center text-3xl font-black leading-none text-white">Meu lugar</h2>
            <p className="mb-2 text-center text-xs font-bold leading-relaxed text-zinc-300">
              Ponto exato selecionado: {pendingPlace.lat.toFixed(8)}, {pendingPlace.lng.toFixed(8)}
            </p>
            <p className="mb-4 text-center text-xs font-black uppercase tracking-[0.14em] text-cyan-200/70">
              Privado por padrão
            </p>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-black uppercase tracking-[0.12em] text-emerald-200">Nome</label>
                <input
                  type="text"
                  placeholder="Ex: Canal bom de robalo"
                  value={placeFormData.name}
                  onChange={(e) => setPlaceFormData({ ...placeFormData, name: e.target.value })}
                  className="mt-1 w-full rounded-sm border border-cyan-300/18 bg-black/25 px-3 py-2 text-white placeholder-zinc-500 focus:border-cyan-300 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-sm font-black uppercase tracking-[0.12em] text-emerald-200">Observação</label>
                <textarea
                  placeholder="Notas opcionais sobre o lugar..."
                  value={placeFormData.note}
                  onChange={(e) => setPlaceFormData({ ...placeFormData, note: e.target.value })}
                  className="mt-1 h-24 w-full resize-none rounded-sm border border-cyan-300/18 bg-black/25 px-3 py-3 text-white placeholder-zinc-500 focus:border-cyan-300 focus:outline-none"
                />
              </div>

              <div className="rounded-sm border border-emerald-300/15 bg-emerald-300/[0.05] p-4 text-xs font-bold leading-relaxed text-zinc-300">
                Este lugar fica salvo apenas para você. Compartilhamento entra depois sem mudar seus pontos atuais.
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  onClick={savePersonalPlace}
                  className={panelButtonPrimary}
                >
                  Confirmar aqui
                </button>
                <button
                  onClick={cancelPersonalPlace}
                  className={panelButtonDanger}
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedLocation && (
        <div
          className={`map-control-overlay fixed left-1/2 z-[7000] w-[calc(100vw-16px)] max-w-[900px] -translate-x-1/2 sm:w-[calc(100vw-24px)] ${
            selectedLocation.personalPlaceId
              ? "top-2 sm:top-6"
              : "top-1/2 -translate-y-1/2"
          }`}
        >
          {(() => {
            const fishCastScore = calculateFishCastScore(selectedLocation.conditions);
            const scorePresentation = getScorePresentation(fishCastScore.value);
            const conditionRows = getSpotConditionRows(selectedLocation.conditions);
            const gaugeRotation = Math.max(-90, Math.min(90, fishCastScore.value * 1.8 - 90));

            return (
              <div
                className="max-h-[calc(100vh-16px)] w-full cursor-pointer overflow-hidden rounded-md border border-cyan-300/18 bg-[#020a14]/97 p-3 text-left text-white shadow-[0_24px_70px_rgba(0,0,0,0.58),0_0_34px_rgba(34,211,238,0.18)] backdrop-blur-xl sm:max-h-[calc(100vh-48px)] sm:p-5"
                onClick={() => setSelectedLocation(null)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    setSelectedLocation(null);
                  }
                }}
              >
                <div className="mb-2 border-b border-white/10 pb-2 sm:mb-5 sm:pb-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-[11px] font-black uppercase tracking-[0.22em] text-emerald-200">Detalhe do lugar</p>
                      <h2 className="mt-1 text-3xl font-black leading-none text-white sm:text-5xl">{selectedLocation.name}</h2>
                      <p className="mt-1 text-sm font-bold text-zinc-300 sm:mt-2 sm:text-base">
                        {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}
                      </p>
                    </div>
                    {selectedLocation.visibility === "private" && (
                      <span className="shrink-0 rounded-md border border-cyan-200/20 bg-cyan-300/12 px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-cyan-100">
                        Privado
                      </span>
                    )}
                  </div>
                </div>

                {selectedLocation.note && (
                  <p className="mb-2 rounded-sm border border-emerald-300/15 bg-emerald-300/[0.05] p-3 text-sm font-bold leading-relaxed text-zinc-200 sm:mb-4">
                    {selectedLocation.note}
                  </p>
                )}

                <div className="mb-2 rounded-md border border-lime-300/35 bg-[radial-gradient(circle_at_50%_0%,rgba(132,204,22,0.16),transparent_58%),linear-gradient(135deg,rgba(5,46,22,0.72),rgba(2,6,23,0.82))] p-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] sm:mb-4 sm:p-4">
                  <div className="grid grid-cols-[minmax(64px,0.75fr)_minmax(82px,104px)_minmax(92px,0.95fr)] items-center gap-2 sm:grid-cols-[1fr_200px_1fr] sm:gap-3 lg:grid-cols-[1fr_220px_1fr]">
                    <div className="min-w-0">
                      <p className="text-[9px] font-black uppercase tracking-[0.12em] text-lime-300 sm:text-[11px] sm:tracking-[0.18em]">FishCast Score</p>
                      <p className="mt-1 text-4xl font-black leading-none text-lime-400 sm:text-7xl">
                        {fishCastScore.value}
                        <span className="ml-0.5 text-lg text-zinc-300 sm:ml-2 sm:text-4xl">/100</span>
                      </p>
                      <span className="mt-1 inline-flex items-center gap-1 rounded-md border border-lime-300/25 bg-lime-300/10 px-1.5 py-0.5 text-[8px] font-black uppercase tracking-[0.06em] text-lime-200 sm:mt-3 sm:gap-2 sm:px-3 sm:py-1.5 sm:text-xs sm:tracking-[0.1em]">
                        <span>{scorePresentation.icon}</span>
                        {scorePresentation.badge}
                      </span>
                    </div>

                    <div className="mx-auto w-full max-w-[104px] sm:max-w-[220px]">
                      <svg viewBox="0 0 180 116" className="h-auto w-full drop-shadow-[0_10px_24px_rgba(132,204,22,0.18)]" aria-hidden="true">
                        <path d="M 22 90 A 68 68 0 0 1 64 27" fill="none" stroke="#f43f1f" strokeLinecap="round" strokeWidth="15" />
                        <path d="M 64 27 A 68 68 0 0 1 116 27" fill="none" stroke="#fde047" strokeLinecap="round" strokeWidth="15" />
                        <path d="M 116 27 A 68 68 0 0 1 158 90" fill="none" stroke="#22c55e" strokeLinecap="round" strokeWidth="15" />
                        <line x1="90" y1="90" x2="90" y2="36" stroke="#e5e7eb" strokeLinecap="round" strokeWidth="5" transform={`rotate(${gaugeRotation} 90 90)`} />
                        <circle cx="90" cy="90" r="7" fill="#facc15" />
                        <text x="15" y="112" fill="#f8fafc" fontSize="13" fontWeight="800">0</text>
                        <text x="83" y="18" fill="#f8fafc" fontSize="13" fontWeight="800">50</text>
                        <text x="151" y="112" fill="#f8fafc" fontSize="13" fontWeight="800">100</text>
                        <text x="90" y="82" textAnchor="middle" fill="#facc15" fontSize="34">★</text>
                      </svg>
                    </div>

                    <div className="min-w-0 rounded-md border border-white/10 bg-black/20 p-2 lg:border-0 lg:bg-transparent lg:p-0">
                      <p className="flex items-center gap-1 text-[10px] font-black uppercase leading-tight text-lime-200 sm:gap-2 sm:text-xl">
                        <span>{scorePresentation.icon}</span>
                        {scorePresentation.headline}
                      </p>
                      <p className="mt-1 text-[9px] font-bold leading-snug text-zinc-200 sm:mt-2 sm:text-base sm:leading-relaxed">
                        {scorePresentation.description}
                      </p>
                    </div>
                  </div>
                  {fishCastScore.partial && (
                    <p className="mt-3 rounded-md border border-white/10 bg-black/18 px-3 py-2 text-xs font-bold text-zinc-300">
                      Score baseado em dados parciais
                    </p>
                  )}
                </div>

                <div className="mb-2 rounded-md border border-cyan-300/12 bg-black/20 p-2.5 sm:mb-4 sm:p-3">
                  <h3 className="mb-2 flex items-center gap-2 border-b border-white/10 pb-2 text-xs font-black uppercase tracking-[0.16em] text-emerald-200 sm:text-sm sm:tracking-[0.18em]">
                    <span>☁</span>
                    Condições atuais
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    {conditionRows.map((condition) => (
                      <div
                        key={condition.label}
                        className="grid grid-cols-[30px_1fr] items-center gap-2 rounded-sm border border-white/8 bg-white/[0.035] p-2 sm:grid-cols-[44px_1fr_auto] sm:gap-3 sm:p-2.5"
                      >
                        <div className="flex h-8 w-8 items-center justify-center rounded-full border border-cyan-300/25 bg-cyan-300/8 text-lg sm:h-11 sm:w-11 sm:text-2xl">
                          {condition.icon}
                        </div>
                        <div className="min-w-0">
                          <p className="text-[9px] font-black uppercase tracking-[0.1em] text-emerald-200 sm:text-[11px] sm:tracking-[0.16em]">
                            {condition.label}
                          </p>
                          <p className="mt-0.5 truncate text-xs font-black text-white sm:text-base">{condition.value}</p>
                          <p className="mt-0.5 line-clamp-2 text-[10px] font-bold leading-snug text-zinc-300 sm:text-xs">
                            {condition.description}
                          </p>
                        </div>
                        <span className="col-span-2 justify-self-start rounded-full bg-emerald-400/15 px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.08em] text-lime-200 sm:col-span-1 sm:px-3 sm:py-1 sm:text-[10px]">
                          {condition.badgeIcon} {condition.badge}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {selectedLocation.personalPlaceId && (() => {
                  const place = personalPlaces.find((item) => item.id === selectedLocation.personalPlaceId);
                  const placeCaptures = getCapturesForPlace(selectedLocation.personalPlaceId);

                  if (!place) {
                    return null;
                  }

                  return (
                    <div className="space-y-2 pb-4 sm:space-y-3 sm:pb-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          addCaptureAtPersonalPlace(place);
                        }}
                        className={`${panelButtonPrimary} justify-center border-emerald-300/35 bg-emerald-400/18 text-base shadow-[0_0_24px_rgba(16,185,129,0.16)]`}
                      >
                        + Adicionar captura aqui
                      </button>

                      <div className="rounded-md border border-yellow-300/20 bg-black/25 p-2.5 sm:p-3">
                        <div className="flex items-center justify-between gap-3">
                          <p className="flex items-center gap-2 text-[12px] font-black uppercase tracking-[0.16em] text-emerald-200">
                            <span>🐟</span>
                            Histórico do lugar
                          </p>
                          <span className="text-sm font-black text-white">
                            {placeCaptures.length} capturas
                          </span>
                        </div>

                        <div className="mt-2 grid grid-cols-3 gap-2 rounded-sm border border-yellow-300/25 bg-yellow-300/5 p-2 sm:mt-3 sm:p-2.5">
                          <div className="flex items-center gap-3">
                            <span className="hidden text-2xl sm:inline">🏆</span>
                            <div>
                              <p className="text-xs font-bold text-zinc-300">Maior peixe</p>
                              <p className="text-sm font-black text-white sm:text-lg">{getLargestCaptureSizeValue(placeCaptures)}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 border-white/10 sm:border-l sm:pl-3">
                            <span className="hidden text-2xl sm:inline">▣</span>
                            <div>
                              <p className="text-xs font-bold text-zinc-300">Última captura</p>
                              <p className="text-sm font-black text-white sm:text-lg">{getLastSpotCaptureDate(placeCaptures)}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 border-white/10 sm:border-l sm:pl-3">
                            <span className="hidden text-2xl sm:inline">▮</span>
                            <div>
                              <p className="text-xs font-bold text-zinc-300">Total de capturas</p>
                              <p className="text-sm font-black text-white sm:text-lg">{placeCaptures.length}</p>
                            </div>
                          </div>
                        </div>

                        {placeCaptures.length === 0 ? (
                          <p className="mt-3 text-sm font-bold text-zinc-400">
                            Nenhuma captura vinculada ainda.
                          </p>
                        ) : (
                          <div className="mt-2 max-h-[clamp(86px,16vh,190px)] space-y-2 overflow-y-auto pr-1 sm:mt-3 sm:max-h-[clamp(132px,24vh,240px)]">
                            {[...placeCaptures].reverse().map((capture) => (
                              <article
                                key={`place-capture-${capture.id}`}
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  openCaptureDetails(capture);
                                }}
                                className="flex cursor-pointer gap-3 rounded-sm border border-white/10 bg-white/[0.055] p-3 shadow-sm transition hover:border-emerald-300/25 hover:bg-white/[0.09]"
                                role="button"
                                tabIndex={0}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter" || e.key === " ") {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    openCaptureDetails(capture);
                                  }
                                }}
                              >
                                <div className="h-16 w-24 shrink-0 overflow-hidden rounded-sm border border-white/10 bg-black/30">
                                  {capture.photo ? (
                                    <img
                                      src={capture.photo}
                                      alt="Foto da captura"
                                      className="h-full w-full object-cover"
                                    />
                                  ) : (
                                    <div className="h-full w-full bg-[radial-gradient(circle_at_50%_25%,rgba(34,197,94,0.42),transparent_44%),linear-gradient(135deg,#052e1c,#020617)]" />
                                  )}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <h3 className="truncate text-sm font-black text-white">
                                    {capture.species || "Espécie não informada"}
                                  </h3>
                                  <p className="mt-1 text-xs font-bold text-zinc-300">
                                    {capture.size ? `${capture.size} cm` : "Tam. --"} • {capture.weight ? `${capture.weight} kg` : "Peso --"}
                                  </p>
                                  <p className="mt-3 text-xs font-bold leading-relaxed text-zinc-400">
                                    {formatCaptureDate(capture.capturedAt)}
                                  </p>
                                </div>
                              </article>
                            ))}
                          </div>
                        )}
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deletePersonalPlace(selectedLocation.personalPlaceId as number);
                        }}
                        className={`${panelButtonDanger} mb-2 sm:mb-0`}
                      >
                        Apagar lugar
                      </button>
                    </div>
                  );
                })()}
              </div>
            );
          })()}
        </div>
      )}

      {selectedCaptureSpot && (
        <div className="map-control-overlay fixed left-1/2 top-2 z-[7000] w-[calc(100vw-16px)] max-w-[900px] -translate-x-1/2 sm:top-6 sm:w-[calc(100vw-24px)]">
          {(() => {
            const spotConditions = getConditionsForLocation(
              selectedCaptureSpot.lat,
              selectedCaptureSpot.lng
            );
            const fishCastScore = calculateFishCastScore(spotConditions);
            const scorePresentation = getScorePresentation(fishCastScore.value);
            const conditionRows = getSpotConditionRows(spotConditions);
            const gaugeRotation = Math.max(-90, Math.min(90, fishCastScore.value * 1.8 - 90));
            const largestFish = getLargestCaptureSizeValue(selectedCaptureSpot.captures);
            const lastCapture = getLastSpotCaptureDate(selectedCaptureSpot.captures);

            return (
              <div className="max-h-[calc(100vh-16px)] w-full overflow-hidden rounded-md border border-cyan-300/18 bg-[#020a14]/97 p-3 text-white shadow-[0_24px_70px_rgba(0,0,0,0.62),0_0_34px_rgba(34,211,238,0.18)] backdrop-blur-xl sm:max-h-[calc(100vh-48px)] sm:p-5">
                <div className="mb-2 border-b border-white/10 pb-2 sm:mb-5 sm:pb-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-[11px] font-black uppercase tracking-[0.22em] text-emerald-200">
                        Detalhe do ponto
                      </p>
                      <h2 className="mt-1 text-3xl font-black leading-none text-white sm:text-5xl">
                        Capturas
                      </h2>
                      <p className="mt-1 text-sm font-bold text-zinc-300 sm:mt-2 sm:text-base">
                        {selectedCaptureSpot.lat.toFixed(6)}, {selectedCaptureSpot.lng.toFixed(6)}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedCaptureSpot(null);
                        setShareOptionsCaptureId(null);
                      }}
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-sm border border-white/10 bg-white/[0.06] text-lg font-black text-zinc-200 transition hover:bg-white/[0.12]"
                      aria-label="Fechar spot de captura"
                    >
                      ×
                    </button>
                  </div>
                </div>

                <div className="mb-2 rounded-md border border-lime-300/35 bg-[radial-gradient(circle_at_50%_0%,rgba(132,204,22,0.16),transparent_58%),linear-gradient(135deg,rgba(5,46,22,0.72),rgba(2,6,23,0.82))] p-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] sm:mb-4 sm:p-4">
                  <div className="grid grid-cols-[minmax(64px,0.75fr)_minmax(82px,104px)_minmax(92px,0.95fr)] items-center gap-2 sm:grid-cols-[1fr_200px_1fr] sm:gap-3 lg:grid-cols-[1fr_220px_1fr]">
                    <div className="min-w-0">
                      <p className="text-[9px] font-black uppercase tracking-[0.12em] text-lime-300 sm:text-[11px] sm:tracking-[0.18em]">
                        FishCast Score
                      </p>
                      <p className="mt-1 text-4xl font-black leading-none text-lime-400 sm:text-7xl">
                        {fishCastScore.value}
                        <span className="ml-0.5 text-lg text-zinc-300 sm:ml-2 sm:text-4xl">/100</span>
                      </p>
                      <span className="mt-1 inline-flex items-center gap-1 rounded-md border border-lime-300/25 bg-lime-300/10 px-1.5 py-0.5 text-[8px] font-black uppercase tracking-[0.06em] text-lime-200 sm:mt-3 sm:gap-2 sm:px-3 sm:py-1.5 sm:text-xs sm:tracking-[0.1em]">
                        <span>{scorePresentation.icon}</span>
                        {scorePresentation.badge}
                      </span>
                    </div>

                    <div className="mx-auto w-full max-w-[104px] sm:max-w-[220px]">
                      <svg viewBox="0 0 180 116" className="h-auto w-full drop-shadow-[0_10px_24px_rgba(132,204,22,0.18)]" aria-hidden="true">
                        <path d="M 22 90 A 68 68 0 0 1 64 27" fill="none" stroke="#f43f1f" strokeLinecap="round" strokeWidth="15" />
                        <path d="M 64 27 A 68 68 0 0 1 116 27" fill="none" stroke="#fde047" strokeLinecap="round" strokeWidth="15" />
                        <path d="M 116 27 A 68 68 0 0 1 158 90" fill="none" stroke="#22c55e" strokeLinecap="round" strokeWidth="15" />
                        <line x1="90" y1="90" x2="90" y2="36" stroke="#e5e7eb" strokeLinecap="round" strokeWidth="5" transform={`rotate(${gaugeRotation} 90 90)`} />
                        <circle cx="90" cy="90" r="7" fill="#facc15" />
                        <text x="15" y="112" fill="#f8fafc" fontSize="13" fontWeight="800">0</text>
                        <text x="83" y="18" fill="#f8fafc" fontSize="13" fontWeight="800">50</text>
                        <text x="151" y="112" fill="#f8fafc" fontSize="13" fontWeight="800">100</text>
                        <text x="90" y="82" textAnchor="middle" fill="#facc15" fontSize="34">★</text>
                      </svg>
                    </div>

                    <div className="min-w-0 rounded-md border border-white/10 bg-black/20 p-2 lg:border-0 lg:bg-transparent lg:p-0">
                      <p className="flex items-center gap-1 text-[10px] font-black uppercase leading-tight text-lime-200 sm:gap-2 sm:text-xl">
                        <span>{scorePresentation.icon}</span>
                        {scorePresentation.headline}
                      </p>
                      <p className="mt-1 text-[9px] font-bold leading-snug text-zinc-200 sm:mt-2 sm:text-base sm:leading-relaxed">
                        {scorePresentation.description}
                      </p>
                    </div>
                  </div>
                  {fishCastScore.partial && (
                    <p className="mt-3 rounded-md border border-white/10 bg-black/18 px-3 py-2 text-xs font-bold text-zinc-300">
                      Score baseado em dados parciais
                    </p>
                  )}
                </div>

                <div className="mb-2 rounded-md border border-cyan-300/12 bg-black/20 p-2.5 sm:mb-4 sm:p-3">
                  <h3 className="mb-2 flex items-center gap-2 border-b border-white/10 pb-2 text-xs font-black uppercase tracking-[0.16em] text-emerald-200 sm:text-sm sm:tracking-[0.18em]">
                    <span>☁</span>
                    Condições atuais
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    {conditionRows.map((condition) => (
                      <div
                        key={condition.label}
                        className="grid grid-cols-[30px_1fr] items-center gap-2 rounded-sm border border-white/8 bg-white/[0.035] p-2 sm:grid-cols-[44px_1fr_auto] sm:gap-3 sm:p-2.5"
                      >
                        <div className="flex h-8 w-8 items-center justify-center rounded-full border border-cyan-300/25 bg-cyan-300/8 text-lg sm:h-11 sm:w-11 sm:text-2xl">
                          {condition.icon}
                        </div>
                        <div className="min-w-0">
                          <p className="text-[9px] font-black uppercase tracking-[0.1em] text-emerald-200 sm:text-[11px] sm:tracking-[0.16em]">
                            {condition.label}
                          </p>
                          <p className="mt-0.5 truncate text-xs font-black text-white sm:text-base">{condition.value}</p>
                          <p className="mt-0.5 line-clamp-2 text-[10px] font-bold leading-snug text-zinc-300 sm:text-xs">
                            {condition.description}
                          </p>
                        </div>
                        <span className="col-span-2 justify-self-start rounded-full bg-emerald-400/15 px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.08em] text-lime-200 sm:col-span-1 sm:px-3 sm:py-1 sm:text-[10px]">
                          {condition.badgeIcon} {condition.badge}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2 sm:space-y-3">
                  <button
                    onClick={() => {
                      setPendingCapture({
                        lat: selectedCaptureSpot.lat,
                        lng: selectedCaptureSpot.lng,
                        placeId: null,
                      });
                      setSelectedCaptureSpot(null);
                      setCaptureMode(false);
                      setPlaceMode(false);
                    }}
                    className={`${panelButtonPrimary} justify-center border-emerald-300/35 bg-emerald-400/18 text-base shadow-[0_0_24px_rgba(16,185,129,0.16)]`}
                  >
                    + Adicionar captura aqui
                  </button>

                  <div className="rounded-md border border-yellow-300/20 bg-black/25 p-2.5 sm:p-3">
                    <div className="flex items-center justify-between gap-3">
                      <p className="flex items-center gap-2 text-[12px] font-black uppercase tracking-[0.16em] text-emerald-200">
                        <span>🐟</span>
                        Histórico do ponto
                      </p>
                      <span className="text-sm font-black text-white">
                        {selectedCaptureSpot.captures.length} capturas
                      </span>
                    </div>

                    <div className="mt-2 grid grid-cols-3 gap-2 rounded-sm border border-yellow-300/25 bg-yellow-300/5 p-2 sm:mt-3 sm:p-2.5">
                      <div className="flex items-center gap-3">
                        <span className="hidden text-2xl sm:inline">🏆</span>
                        <div>
                          <p className="text-xs font-bold text-zinc-300">Maior peixe</p>
                          <p className="text-sm font-black text-white sm:text-lg">{largestFish}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 border-white/10 sm:border-l sm:pl-3">
                        <span className="hidden text-2xl sm:inline">▣</span>
                        <div>
                          <p className="text-xs font-bold text-zinc-300">Última captura</p>
                          <p className="text-sm font-black text-white sm:text-lg">{lastCapture}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 border-white/10 sm:border-l sm:pl-3">
                        <span className="hidden text-2xl sm:inline">▮</span>
                        <div>
                          <p className="text-xs font-bold text-zinc-300">Total de capturas</p>
                          <p className="text-sm font-black text-white sm:text-lg">{selectedCaptureSpot.captures.length}</p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-2 max-h-[clamp(112px,20vh,240px)] space-y-2 overflow-y-auto pr-1 sm:mt-3 sm:max-h-[clamp(132px,24vh,240px)]">
                      {[...selectedCaptureSpot.captures].reverse().map((capture) => {
                        const originalIndex = captures.findIndex((item) => item.id === capture.id);

                        return (
                          <article
                            key={`capture-spot-${capture.id}`}
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              openCaptureSpotCard(capture.id);
                            }}
                            className="flex cursor-pointer gap-3 rounded-sm border border-white/10 bg-white/[0.06] p-3 transition hover:border-red-300/25 hover:bg-white/[0.09]"
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault();
                                e.stopPropagation();
                                openCaptureSpotCard(capture.id);
                              }
                            }}
                          >
                            <div className="h-16 w-24 shrink-0 overflow-hidden rounded-sm border border-white/10 bg-black/30">
                              {capture.photo ? (
                                <img
                                  src={capture.photo}
                                  alt="Foto da captura"
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <div className="h-full w-full bg-[radial-gradient(circle_at_50%_25%,rgba(127,29,29,0.44),transparent_44%),linear-gradient(135deg,#450a0a,#020617)]" />
                              )}
                            </div>

                            <div className="min-w-0 flex-1">
                              <div className="flex items-start justify-between gap-2">
                                <div className="min-w-0">
                                  <h3 className="truncate text-sm font-black">
                                    {getCaptureTitle(capture, originalIndex)}
                                  </h3>
                                  <p className="mt-1 text-xs font-bold text-zinc-300">
                                    {capture.size ? `${capture.size} cm` : "Tam. --"} • {capture.weight ? `${capture.weight} kg` : "Peso --"}
                                  </p>
                                </div>
                                <span className="shrink-0 rounded-sm border border-red-300/20 bg-red-500/10 px-2 py-1 text-[9px] font-black uppercase tracking-[0.12em] text-red-100">
                                  Minha
                                </span>
                              </div>

                              <p className="mt-3 text-xs font-bold leading-relaxed text-zinc-400">
                                {formatCaptureDate(capture.capturedAt)}
                              </p>
                            </div>
                          </article>
                        );
                      })}
                    </div>
                  </div>

                </div>
              </div>
            );
          })()}
        </div>
      )}

      {selectedCapture && (
        <div className="map-control-overlay fixed bottom-2 left-1/2 top-[56px] z-[7000] w-[calc(100vw-24px)] max-w-[460px] -translate-x-1/2 sm:bottom-4 sm:top-[96px]">
          <div className="flex h-full flex-col overflow-hidden rounded-md border border-cyan-300/18 bg-[#020a14]/97 text-white shadow-[0_24px_70px_rgba(0,0,0,0.62),0_0_34px_rgba(34,211,238,0.18)] backdrop-blur-xl">
            <button
              onClick={() => {
                setSelectedCapture(null);
                setShareOptionsCaptureId(null);
              }}
              className="absolute right-2 top-2 z-10 flex h-9 w-9 items-center justify-center rounded-sm border border-white/15 bg-black/65 text-xl font-black text-white backdrop-blur-md transition hover:bg-black/80 sm:right-3 sm:top-3 sm:h-10 sm:w-10"
              aria-label="Fechar captura"
            >
              ×
            </button>

            <div className="flex h-full min-h-0 flex-col gap-2 p-3 sm:gap-2.5 sm:p-4">
              <div className="min-h-0 flex-1 space-y-2 overflow-hidden sm:space-y-2.5">
              <div
                className={`flex items-center justify-center overflow-hidden rounded-sm border border-white/10 bg-[#020617] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] ${
                  shareOptionsCaptureId === selectedCapture.id
                    ? "h-[clamp(92px,16vh,150px)] sm:h-[clamp(160px,26vh,260px)]"
                    : "h-[clamp(130px,24vh,240px)] sm:h-[clamp(180px,32vh,320px)]"
                }`}
              >
                {selectedCapture.photo ? (
                  <img
                    src={selectedCapture.photo}
                    alt="Foto da captura"
                    className="h-full w-full object-contain"
                  />
                ) : (
                  <div className="h-full w-full bg-[radial-gradient(circle_at_50%_25%,rgba(34,197,94,0.36),transparent_42%),linear-gradient(135deg,#052e1c,#020617_58%,#000)]" />
                )}
              </div>

              <div className="border-b border-white/10 pb-2 pr-10">
                <span className="inline-flex rounded-sm border border-emerald-300/25 bg-emerald-300/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-emerald-200">
                  Minha captura
                </span>
                <p className="mt-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-200/85 sm:text-[11px]">
                  Captura #{captures.findIndex((capture) => capture.id === selectedCapture.id) + 1}
                </p>
                <h2 className="mt-0.5 line-clamp-1 text-2xl font-black leading-tight text-white sm:mt-1 sm:text-3xl">
                  {selectedCapture.species || "Espécie não informada"}
                </h2>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="min-h-12 rounded-sm border border-emerald-300/15 bg-black/25 p-2 sm:min-h-16 sm:p-2.5">
                  <p className={infoLabelClass}>Peso</p>
                  <p className="mt-0.5 truncate text-xs font-black text-white sm:mt-1 sm:text-sm">{selectedCapture.weight ? `${selectedCapture.weight} kg` : "--"}</p>
                </div>
                <div className="min-h-12 rounded-sm border border-emerald-300/15 bg-black/25 p-2 sm:min-h-16 sm:p-2.5">
                  <p className={infoLabelClass}>Tamanho</p>
                  <p className="mt-0.5 truncate text-xs font-black text-white sm:mt-1 sm:text-sm">{selectedCapture.size ? `${selectedCapture.size} cm` : "--"}</p>
                </div>
                <div className="min-h-12 rounded-sm border border-emerald-300/15 bg-black/25 p-2 sm:min-h-16 sm:p-2.5">
                  <p className={infoLabelClass}>Isca</p>
                  <p className="mt-0.5 truncate text-xs font-black text-white sm:mt-1 sm:text-sm">{selectedCapture.bait || "--"}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <div className="min-h-12 rounded-sm border border-emerald-300/15 bg-black/25 p-2 sm:min-h-16 sm:p-2.5">
                  <p className={infoLabelClass}>Data/hora</p>
                  <p className="mt-0.5 text-xs font-black leading-snug text-white sm:mt-1 sm:text-sm">{formatCaptureDate(selectedCapture.capturedAt)}</p>
                </div>
                <div className="min-h-12 rounded-sm border border-emerald-300/15 bg-black/25 p-2 sm:min-h-16 sm:p-2.5">
                  <p className={infoLabelClass}>Coordenadas</p>
                  <p className="mt-0.5 break-words text-xs font-black leading-snug text-white sm:mt-1 sm:text-sm">
                    {selectedCapture.lat.toFixed(6)}, {selectedCapture.lng.toFixed(6)}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-400">Observações</p>
                <p className="mt-1 min-h-10 overflow-hidden rounded-sm border border-emerald-300/15 bg-black/25 p-2 text-xs leading-snug text-zinc-200 sm:min-h-14 sm:p-2.5 sm:text-sm">
                  {selectedCapture.comment || "Sem observações adicionadas."}
                </p>
              </div>

              </div>

              <div className="grid shrink-0 grid-cols-1 gap-2 sm:grid-cols-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShareOptionsCaptureId((current) =>
                      current === selectedCapture.id ? null : selectedCapture.id
                    );
                  }}
                  className={`${panelButtonPrimary} justify-center border-emerald-300/35 bg-emerald-400/18 shadow-[0_0_24px_rgba(16,185,129,0.14)]`}
                >
                  {shareFeedback?.captureId === selectedCapture.id ? shareFeedback.message : "Compartilhar"}
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();

                    const confirmed = window.confirm("Deseja realmente apagar esta captura?");

                    if (!confirmed) {
                      return;
                    }

                    deleteCapture(selectedCapture.id);
                  }}
                  className={panelButtonDanger}
                >
                  Apagar captura
                </button>
              </div>
              {shareOptionsCaptureId === selectedCapture.id && (
                <div className="grid min-w-0 shrink-0 grid-cols-1 gap-2 rounded-md border border-yellow-300/20 bg-yellow-300/5 p-2 sm:grid-cols-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      void shareCapture(selectedCapture, "complete");
                    }}
                    className={`${panelButtonSuccess} whitespace-normal break-words leading-tight`}
                  >
                    Compartilhar completo
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      void shareCapture(selectedCapture, "secret");
                    }}
                    className={`${panelButtonPrimary} whitespace-normal break-words leading-tight`}
                  >
                    Compartilhar secreto
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <MapContainer
          center={center}
          zoom={zoom}
          minZoom={MAP_MIN_ZOOM}
          maxZoom={MAP_MAX_ZOOM}
          zoomControl={false}
          scrollWheelZoom={true}
          doubleClickZoom={false}
          className="h-full w-full"
          style={{ width: "100%", height: "100%" }}
        >
          {mapMode === "map" && (
            <TileLayer
              attribution="&copy; OpenStreetMap contributors"
              maxNativeZoom={OSM_MAX_NATIVE_ZOOM}
              maxZoom={MAP_MAX_ZOOM}
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
          )}

          {mapMode === "satellite" && (
            <TileLayer
              attribution="Tiles &copy; Esri"
              maxNativeZoom={SATELLITE_MAX_NATIVE_ZOOM}
              maxZoom={MAP_MAX_ZOOM}
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            />
          )}

          {mapMode === "nautical" && (
            <>
              <TileLayer
                attribution="&copy; OpenStreetMap contributors"
                maxNativeZoom={OSM_MAX_NATIVE_ZOOM}
                maxZoom={NAUTICAL_MAX_ZOOM}
                zIndex={100}
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <WMSTileLayer
                attribution={NAUTICAL_BATHYMETRY_ATTRIBUTION}
                detectRetina={false}
                errorTileUrl={TRANSPARENT_TILE}
                format="image/png"
                keepBuffer={2}
                layers={NAUTICAL_DEPTH_SURFACE_LAYER}
                maxZoom={NAUTICAL_MAX_ZOOM}
                opacity={0.62}
                tileSize={256}
                transparent={true}
                updateWhenIdle={false}
                updateWhenZooming={true}
                url={NAUTICAL_BATHYMETRY_WMS_URL}
                version="1.1.1"
                zIndex={220}
              />
              <WMSTileLayer
                attribution={NAUTICAL_BATHYMETRY_ATTRIBUTION}
                detectRetina={false}
                errorTileUrl={TRANSPARENT_TILE}
                format="image/png"
                keepBuffer={2}
                layers={NAUTICAL_DEPTH_CONTOURS_LAYER}
                maxZoom={NAUTICAL_MAX_ZOOM}
                opacity={0.92}
                tileSize={256}
                transparent={true}
                updateWhenIdle={false}
                updateWhenZooming={true}
                url={NAUTICAL_BATHYMETRY_WMS_URL}
                version="1.1.1"
                zIndex={230}
              />
              <TileLayer
                attribution="&copy; OpenSeaMap contributors"
                detectRetina={false}
                errorTileUrl={TRANSPARENT_TILE}
                keepBuffer={2}
                maxNativeZoom={NAUTICAL_SEAMARK_MAX_NATIVE_ZOOM}
                maxZoom={NAUTICAL_MAX_ZOOM}
                tileSize={256}
                updateWhenIdle={false}
                updateWhenZooming={true}
                url="https://tiles.openseamap.org/seamark/{z}/{x}/{y}.png"
                zIndex={240}
              />
            </>
          )}

          {mapMode === "night" && (
            <TileLayer
              attribution="&copy; OpenStreetMap contributors &copy; CARTO"
              maxNativeZoom={NIGHT_MAX_NATIVE_ZOOM}
              maxZoom={MAP_MAX_ZOOM}
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            />
          )}

          <Polygon
            positions={paranaOutline}
            interactive={false}
            pathOptions={{
              color: "#22c55e",
              fillColor: "#22c55e",
              fillOpacity: 0.05,
              opacity: 0.42,
              weight: 2,
            }}
          />

          <ZoomButtons hidden={popupPriorityOpen} />
          <CenterButton center={paranaCenter} hidden={popupPriorityOpen} />
          <MapFocusController target={focusTarget} />
          <MapMaxZoomController maxZoom={MAP_MAX_ZOOM} />

          <MapEvents
            captureMode={captureMode}
            placeMode={placeMode}
            onAddCapture={addCapture}
            onAddPlace={addPersonalPlace}
            onLocationClick={handleMapClick}
            onZoomChange={setZoom}
            popupPriorityOpen={popupPriorityOpen}
            onDismissActivePopup={() => {
              setSpotPopupOpen(false);
              setCapturePopupOpen(false);
              setSelectedCaptureSpot(null);
              setSelectedLocation(null);
              setSelectedCapture(null);
              setShareOptionsCaptureId(null);
            }}
            onOtherPopupClose={() => {
              setSpotPopupOpen(false);
              setCapturePopupOpen(false);
              setSelectedCaptureSpot(null);
              setShareOptionsCaptureId(null);
            }}
            spotPopupOpen={spotPopupOpen}
            ignoreNextMapClickRef={ignoreNextMapClickRef}
          />

          {pendingCapture && (
            <Marker
              key="pending-capture"
              position={[pendingCapture.lat, pendingCapture.lng]}
              icon={createCaptureIcon(iconSize, 1)}
              interactive={false}
            />
          )}

          {pendingPlace && (
            <Marker
              key="pending-place"
              position={[pendingPlace.lat, pendingPlace.lng]}
              icon={createPersonalPlaceIcon(iconSize, 0)}
              interactive={false}
            />
          )}

          {fishingSpots.map((spot) => (
          <Marker
            key={`spot-${spot.id}`}
            position={[spot.lat, spot.lng]}
            icon={createSpotIcon(iconSize)}
            eventHandlers={{
              click: (event) => {
                L.DomEvent.stopPropagation(event.originalEvent);
                ignoreNextMapClickRef.current = false;
                setSpotPopupOpen(false);
                setCapturePopupOpen(false);
                setSelectedCapture(null);
                setSelectedCaptureSpot(null);
                setShareOptionsCaptureId(null);
              setSelectedLocation((current) => {
  if (current?.name === spot.name) {
    return null;
  }

  return {
    name: spot.name,
    lat: spot.lat,
    lng: spot.lng,
    conditions: getSpotConditions(spot),
  };
});  
              },
            }}
          />
        ))}

        {personalPlaces.map((place) => (
          <Marker
            key={`personal-place-${place.id}`}
            position={[place.lat, place.lng]}
            icon={createPersonalPlaceIcon(iconSize, getCapturesForPlace(place.id).length)}
            eventHandlers={{
              click: (event) => {
                L.DomEvent.stopPropagation(event.originalEvent);
                ignoreNextMapClickRef.current = false;
                setSpotPopupOpen(false);
                setCapturePopupOpen(false);
                setSelectedCapture(null);
                setSelectedCaptureSpot(null);
                setShareOptionsCaptureId(null);
                setSelectedLocation((current) => {
                  if (current?.personalPlaceId === place.id) {
                    return null;
                  }

                  return {
                    name: place.name,
                    lat: place.lat,
                    lng: place.lng,
                    personalPlaceId: place.id,
                    note: place.note,
                    visibility: place.visibility,
                    conditions: getConditionsForLocation(place.lat, place.lng),
                  };
                });
              },
            }}
          />
        ))}

        {getCaptureSpotMarkers().map((capture) => (
          <Marker
            key={`capture-${capture.id}`}
            position={[capture.lat, capture.lng]}
            icon={createCaptureIcon(iconSize, getCapturesForCaptureSpot(capture).length)}
            eventHandlers={{
              click: (event) => {
                L.DomEvent.stopPropagation(event.originalEvent);
                ignoreNextMapClickRef.current = false;
                openCaptureMarker(capture);
              },
            }}
          />
        ))}
      </MapContainer>
    </div>
  );
}

