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

function getIconSize(zoom: number) {
  if (zoom >= 15) return 72;
  if (zoom >= 13) return 62;
  if (zoom >= 11) return 52;
  if (zoom >= 9) return 42;
  if (zoom >= 7) return 32;

  return 24;
}

function getMarkerZoomClass(zoom: number) {
  if (zoom >= 13) return "fishcast-marker--zoom-high";
  if (zoom >= 10) return "fishcast-marker--zoom-mid";
  return "fishcast-marker--zoom-low";
}

function createPremiumMarkerIcon({
  iconUrl,
  kind,
  size,
  zoom,
  badge,
}: {
  iconUrl: string;
  kind: "spot" | "capture" | "place";
  size: number;
  zoom: number;
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
    className: `fishcast-marker fishcast-marker--${kind} ${getMarkerZoomClass(zoom)}`,
  });
}

function createSpotIcon(size: number, zoom: number) {
  return createPremiumMarkerIcon({
    iconUrl: "/icons/spot-marker.png",
    kind: "spot",
    size,
    zoom,
  });
}

function createCaptureIcon(size: number, zoom: number, captureCount?: number) {
  return createPremiumMarkerIcon({
    iconUrl: "/icons/capture-marker.png",
    kind: "capture",
    size,
    zoom,
    badge: captureCount,
  });
}

function createPersonalPlaceIcon(size: number, zoom: number, captureCount: number) {
  return createPremiumMarkerIcon({
    iconUrl: "/icons/meus-lugares-marker.png",
    kind: "place",
    size,
    zoom,
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

function InfoRow({
  icon,
  label,
  children,
  light = false,
}: {
  icon: string;
  label: string;
  children: React.ReactNode;
  light?: boolean;
}) {
  return (
    <p className={`flex items-start gap-3 ${light ? "text-zinc-200" : "text-slate-800"}`}>
      <span
        aria-hidden="true"
        className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-[13px] font-black shadow-[inset_0_1px_8px_rgba(255,255,255,0.16),0_8px_18px_rgba(0,0,0,0.16)] ${
          light
            ? "border-emerald-200/25 bg-emerald-300/12 text-emerald-100"
            : "border-emerald-900/10 bg-[radial-gradient(circle_at_35%_20%,#ffffff,#d1fae5_42%,#34d399)] text-emerald-950"
        }`}
      >
        {icon}
      </span>
      <span className="min-w-0 pt-0.5">
        <span className={`block text-[10px] font-black uppercase tracking-[0.16em] ${light ? "text-emerald-200/70" : "text-emerald-800/70"}`}>
          {label}
        </span>
        <span className="mt-0.5 block font-bold leading-snug">{children}</span>
      </span>
    </p>
  );
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

  const iconSize = getIconSize(zoom);
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

  function openCaptureMarker(capture: Capture) {
    const spotCaptures = getCapturesForCaptureSpot(capture);

    setSelectedLocation(null);
    setCapturesPanelOpen(false);
    setCapturePopupOpen(false);
    setSpotPopupOpen(false);
    setShareOptionsCaptureId(null);

    if (spotCaptures.length === 1) {
      setSelectedCaptureSpot(null);
      setSelectedCapture(spotCaptures[0]);
      return;
    }

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
          className="map-control-overlay absolute bottom-[270px] right-4 z-[2200] flex max-h-[min(50vh,560px)] w-[min(calc(100vw-32px),420px)] flex-col overflow-hidden rounded-sm border border-emerald-300/20 bg-[#03110d]/95 text-white shadow-[0_28px_90px_rgba(0,0,0,0.62),0_0_42px_rgba(34,197,94,0.18)] backdrop-blur-xl sm:bottom-[292px] sm:right-6"
          onPointerDown={(e) => e.stopPropagation()}
        >
          <div className="border-b border-white/10 p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-emerald-200/80">
                  Diario local
                </p>
                <h2 className="mt-1 text-xl font-black">Minhas capturas</h2>
              </div>
              <button
                onClick={() => setCapturesPanelOpen(false)}
                className="flex h-10 w-10 items-center justify-center rounded-sm border border-white/10 bg-white/[0.06] text-lg font-black text-zinc-200 transition hover:bg-white/[0.12]"
                aria-label="Fechar minhas capturas"
              >
                ×
              </button>
            </div>

            <div className="mt-5 grid grid-cols-3 gap-2.5">
              <div className="rounded-sm border border-emerald-300/15 bg-black/25 p-3.5">
                <p className={infoLabelClass}>Total</p>
                <p className="mt-1 text-lg font-black">{captures.length}</p>
              </div>
              <div className="rounded-sm border border-emerald-300/15 bg-black/25 p-3.5">
                <p className={infoLabelClass}>Maior</p>
                <p className="mt-1 text-lg font-black">{getBestWeight()}</p>
              </div>
              <div className="rounded-sm border border-emerald-300/15 bg-black/25 p-3.5">
                <p className={infoLabelClass}>No mapa</p>
                <p className="mt-1 text-lg font-black">
                  {getCaptureSpotMarkers().length}
                </p>
              </div>
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto p-4">
            {captures.length === 0 ? (
              <div className="rounded-sm border border-dashed border-emerald-300/25 bg-emerald-300/[0.05] p-5 text-center">
                <p className="text-sm font-bold text-emerald-100">Nenhuma captura salva ainda.</p>
                <p className="mt-2 text-xs leading-relaxed text-zinc-400">
                  Use o botão de captura, toque no mapa e salve os detalhes do peixe.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
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
                      <div className="h-20 w-20 shrink-0 overflow-hidden rounded-sm border border-white/10 bg-black/30">
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
                            <p className="mt-1 text-xs font-black text-white">
                              {capture.weight ? `${capture.weight} kg` : "Peso --"}
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
          <div className="fixed left-1/2 top-1/2 w-[calc(100vw-32px)] max-w-[420px] max-h-[calc(100vh-120px)] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-sm border border-cyan-500/30 bg-[#020a14] p-5 shadow-[0_24px_80px_rgba(0,255,255,0.15)]">
            <div className="mb-5 border-b border-white/10 pb-4 text-center">
              <p className={infoLabelClass}>Adicionar captura</p>
              <h2 className="mt-1 text-xl font-black text-white">Detalhes da captura</h2>
              <p className="mt-2 text-xs font-bold leading-relaxed text-cyan-100/70">
                Ponto exato selecionado: {pendingCapture.lat.toFixed(8)}, {pendingCapture.lng.toFixed(8)}
              </p>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-cyan-400 text-sm font-bold">Espécie</label>
                <input
                  type="text"
                  placeholder="Ex: Tilápia"
                  value={formData.species}
                  onChange={(e) => setFormData({ ...formData, species: e.target.value })}
                  className="w-full rounded-sm border border-cyan-500/20 bg-slate-900/50 px-3 py-2 text-white placeholder-zinc-500 focus:border-cyan-400 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-cyan-400 text-sm font-bold">Peso (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="2.5"
                    value={formData.weight}
                    onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                    className="w-full rounded-sm border border-cyan-500/20 bg-slate-900/50 px-3 py-2 text-white placeholder-zinc-500 focus:border-cyan-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-cyan-400 text-sm font-bold">Tamanho (cm)</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="30"
                    value={formData.size}
                    onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                    className="w-full rounded-sm border border-cyan-500/20 bg-slate-900/50 px-3 py-2 text-white placeholder-zinc-500 focus:border-cyan-400 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-cyan-400 text-sm font-bold">Isca</label>
                <input
                  type="text"
                  placeholder="Ex: Minhoca, Ração"
                  value={formData.bait}
                  onChange={(e) => setFormData({ ...formData, bait: e.target.value })}
                  className="w-full rounded-sm border border-cyan-500/20 bg-slate-900/50 px-3 py-2 text-white placeholder-zinc-500 focus:border-cyan-400 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-cyan-400 text-sm font-bold">Data</label>
                  <input
                    type="date"
                    value={formData.capturedDate}
                    onChange={(e) => setFormData({ ...formData, capturedDate: e.target.value })}
                    className="w-full rounded-sm border border-cyan-500/20 bg-slate-900/50 px-3 py-2 text-white placeholder-zinc-500 focus:border-cyan-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-cyan-400 text-sm font-bold">Hora</label>
                  <input
                    type="time"
                    value={formData.capturedTime}
                    onChange={(e) => setFormData({ ...formData, capturedTime: e.target.value })}
                    className="w-full rounded-sm border border-cyan-500/20 bg-slate-900/50 px-3 py-2 text-white placeholder-zinc-500 focus:border-cyan-400 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-cyan-400 text-sm font-bold">Foto</label>
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
                  className="w-full rounded-sm border border-cyan-500/20 bg-slate-900/50 px-3 py-2 text-white file:cursor-pointer file:rounded-none file:border-0 file:bg-cyan-600 file:px-3 file:py-1 file:text-white hover:file:bg-cyan-700 focus:border-cyan-400 focus:outline-none"
                />
                {formData.photo && (
                  <p className="mt-1 text-xs font-bold text-emerald-300">
                    Foto adicionada ao marcador da captura.
                  </p>
                )}
              </div>

              <div>
                <label className="text-cyan-400 text-sm font-bold">Comentário</label>
                <textarea
                  placeholder="Notas sobre a captura..."
                  value={formData.comment}
                  onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                  className="h-28 w-full resize-none rounded-sm border border-cyan-500/20 bg-slate-900/50 px-3 py-3 text-white placeholder-zinc-500 focus:border-cyan-400 focus:outline-none"
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
        <div className="fixed inset-0 z-[3000] flex items-start justify-center bg-black/80 p-4 pt-[96px]">
          <div className="w-[calc(100vw-32px)] max-w-[420px] rounded-sm border border-cyan-400/25 bg-[#020a14] p-5 shadow-[0_24px_80px_rgba(34,211,238,0.15)]">
            <h2 className="mb-1 text-center text-xl font-black text-white">Meu lugar</h2>
            <p className="mb-2 text-center text-xs font-bold leading-relaxed text-cyan-100/65">
              Ponto exato selecionado: {pendingPlace.lat.toFixed(8)}, {pendingPlace.lng.toFixed(8)}
            </p>
            <p className="mb-5 text-center text-xs font-bold uppercase tracking-[0.14em] text-cyan-200/70">
              Privado por padrão
            </p>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-bold text-cyan-300">Nome</label>
                <input
                  type="text"
                  placeholder="Ex: Canal bom de robalo"
                  value={placeFormData.name}
                  onChange={(e) => setPlaceFormData({ ...placeFormData, name: e.target.value })}
                  className="mt-1 w-full rounded-sm border border-cyan-500/20 bg-slate-900/50 px-3 py-2 text-white placeholder-zinc-500 focus:border-cyan-300 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-sm font-bold text-cyan-300">Observação</label>
                <textarea
                  placeholder="Notas opcionais sobre o lugar..."
                  value={placeFormData.note}
                  onChange={(e) => setPlaceFormData({ ...placeFormData, note: e.target.value })}
                  className="mt-1 h-28 w-full resize-none rounded-sm border border-cyan-500/20 bg-slate-900/50 px-3 py-3 text-white placeholder-zinc-500 focus:border-cyan-300 focus:outline-none"
                />
              </div>

              <div className="rounded-sm border border-emerald-300/15 bg-black/25 p-4 text-xs leading-relaxed text-zinc-300">
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
        <div className="map-control-overlay fixed left-1/2 top-[96px] z-[7000] w-[calc(100vw-32px)] max-w-[420px] -translate-x-1/2 sm:top-[104px]">
          {(() => {
            const fishCastScore = calculateFishCastScore(selectedLocation.conditions);

            return (
          <div
            className="max-h-[calc(100vh-140px)] w-full cursor-pointer overflow-y-auto rounded-sm border border-cyan-300/18 bg-[#020a14]/96 p-5 text-left text-white shadow-[0_24px_70px_rgba(0,0,0,0.58),0_0_34px_rgba(34,211,238,0.14)] backdrop-blur-xl"
            onClick={() => setSelectedLocation(null)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                setSelectedLocation(null);
              }
            }}
          >
            <div className="mb-5 border-b border-white/10 pb-4">
              <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className={infoLabelClass}>Detalhe do lugar</p>
                <h2 className="text-2xl font-black leading-tight sm:text-3xl">{selectedLocation.name}</h2>
                <p className="mt-1 text-sm font-bold text-cyan-100/55">
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
              <p className="mb-4 rounded-sm border border-emerald-300/15 bg-black/25 p-4 text-sm font-bold leading-relaxed text-zinc-200">
                {selectedLocation.note}
              </p>
            )}
            <div className="mb-5 rounded-sm border border-emerald-300/18 bg-[linear-gradient(135deg,rgba(16,185,129,0.14),rgba(8,47,73,0.18))] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-emerald-200/75">
                FishCast Score
              </p>
              <div className="mt-1 flex items-end justify-between gap-3">
                <p className="text-4xl font-black leading-none text-white">
                  {fishCastScore.value}<span className="text-xl text-cyan-100/50">/100</span>
                </p>
                <p className="pb-1 text-right text-sm font-black text-emerald-100">
                  {fishCastScore.label}
                </p>
              </div>
              {fishCastScore.partial && (
                <p className="mt-3 rounded-md border border-white/10 bg-black/18 px-3 py-2 text-xs font-bold text-zinc-300">
                  Score baseado em dados parciais
                </p>
              )}
            </div>
            <div className="grid grid-cols-1 gap-3 pr-1 text-base text-zinc-100 sm:max-h-[68vh] sm:overflow-y-auto">
              <InfoRow icon="☀" label="Clima" light>{selectedLocation.conditions.clima}</InfoRow>
              <InfoRow icon="↧" label="Pressão" light>{selectedLocation.conditions.pressao}</InfoRow>
              <InfoRow icon="°" label="Temperatura" light>{selectedLocation.conditions.temperatura}</InfoRow>
              <InfoRow icon="≈" label="Água" light>{selectedLocation.conditions.tempAgua}</InfoRow>
              <InfoRow icon="◐" label="Lua" light>{selectedLocation.conditions.lua}</InfoRow>
              <InfoRow icon="≋" label="Maré" light>{selectedLocation.conditions.mare}</InfoRow>
            </div>
            {selectedLocation.personalPlaceId && (() => {
              const place = personalPlaces.find((item) => item.id === selectedLocation.personalPlaceId);
              const placeCaptures = getCapturesForPlace(selectedLocation.personalPlaceId);

              if (!place) {
                return null;
              }

              return (
                <div className="mt-5 space-y-4">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      addCaptureAtPersonalPlace(place);
                    }}
                    className={panelButtonPrimary}
                  >
                    Adicionar captura aqui
                  </button>

                  <div className="rounded-sm border border-emerald-300/15 bg-black/25 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-[11px] font-black uppercase tracking-[0.16em] text-cyan-100/60">
                        Capturas deste lugar
                      </p>
                      <span className="rounded-md bg-cyan-300/14 px-2.5 py-1 text-xs font-black text-cyan-100">
                        {placeCaptures.length}
                      </span>
                    </div>

                    {placeCaptures.length === 0 ? (
                      <p className="mt-3 text-sm font-bold text-zinc-400">
                        Nenhuma captura vinculada ainda.
                      </p>
                    ) : (
                      <div className="mt-4 max-h-56 space-y-3 overflow-y-auto pr-1">
                        {[...placeCaptures].reverse().map((capture) => (
                          <article
                            key={`place-capture-${capture.id}`}
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              openCaptureDetails(capture);
                            }}
                            className="flex gap-3 rounded-sm border border-white/10 bg-white/[0.055] p-3 shadow-sm"
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
                            <div className="h-16 w-16 shrink-0 overflow-hidden rounded-sm bg-slate-900">
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
                              <h3 className="break-words text-sm font-black text-white">
                                {capture.species || "Espécie não informada"}
                              </h3>
                              <p className="mt-1 text-xs font-bold text-zinc-400">
                                {formatCaptureDate(capture.capturedAt)}
                              </p>
                              <p className="mt-1 break-words text-xs font-bold text-zinc-300">
                                {capture.weight ? `${capture.weight} kg` : "Peso --"} • {capture.size ? `${capture.size} cm` : "Tam. --"}
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
                    className={panelButtonDanger}
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
        <div className="map-control-overlay fixed left-1/2 top-[96px] z-[7000] w-[calc(100vw-32px)] max-w-[420px] -translate-x-1/2 sm:top-[104px]">
          <div className="max-h-[calc(100vh-140px)] overflow-hidden rounded-sm border border-red-300/18 bg-[#020a14]/96 text-white shadow-[0_24px_70px_rgba(0,0,0,0.62),0_0_34px_rgba(127,29,29,0.24)] backdrop-blur-xl">
            <div className="border-b border-white/10 p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className={infoLabelClass}>Spot de captura</p>
                  <h2 className="mt-1 text-xl font-black">Capturas neste ponto</h2>
                  <p className="mt-1 text-xs font-bold text-zinc-400">
                    {selectedCaptureSpot.captures.length} capturas registradas
                  </p>
                </div>
                <button
                  onClick={() => {
                    setSelectedCaptureSpot(null);
                    setShareOptionsCaptureId(null);
                  }}
                  className="flex h-10 w-10 items-center justify-center rounded-sm border border-white/10 bg-white/[0.06] text-lg font-black text-zinc-200 transition hover:bg-white/[0.12]"
                  aria-label="Fechar spot de captura"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="space-y-4 p-4">
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
                className={panelButtonPrimary}
              >
                Adicionar captura aqui
              </button>

              <div className="max-h-[min(52vh,420px)] space-y-3 overflow-y-auto pr-1">
                {[...selectedCaptureSpot.captures].reverse().map((capture) => {
                  const originalIndex = captures.findIndex((item) => item.id === capture.id);

                  return (
                    <article
                      key={`capture-spot-${capture.id}`}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        openCaptureDetails(capture);
                      }}
                      className="flex cursor-pointer gap-3 rounded-sm border border-white/10 bg-white/[0.06] p-3 transition hover:border-red-300/25 hover:bg-white/[0.09]"
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
                      <div className="h-20 w-20 shrink-0 overflow-hidden rounded-sm border border-white/10 bg-black/30">
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
                            <p className="mt-1 text-xs font-black text-white">
                              {capture.weight ? `${capture.weight} kg` : "Peso --"}
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
      )}

      {selectedCapture && (
        <div className="map-control-overlay fixed bottom-2 left-1/2 top-[64px] z-[7000] w-[calc(100vw-32px)] max-w-[420px] -translate-x-1/2 sm:bottom-4 sm:top-[104px]">
          <div className="flex h-full flex-col overflow-hidden rounded-sm border border-emerald-300/18 bg-[#020a14]/96 text-white shadow-[0_24px_70px_rgba(0,0,0,0.62),0_0_34px_rgba(34,197,94,0.18)] backdrop-blur-xl">
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
                className={`flex items-center justify-center overflow-hidden rounded-sm border border-white/10 bg-[#020617] ${
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
                <h2 className="mt-0.5 line-clamp-1 text-lg font-black leading-tight text-white sm:mt-1 sm:text-2xl">
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
                  className={panelButtonPrimary}
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
                <div className="grid min-w-0 shrink-0 grid-cols-1 gap-2 sm:grid-cols-2">
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
              icon={createCaptureIcon(iconSize, zoom, 1)}
              interactive={false}
            />
          )}

          {pendingPlace && (
            <Marker
              key="pending-place"
              position={[pendingPlace.lat, pendingPlace.lng]}
              icon={createPersonalPlaceIcon(iconSize, zoom, 0)}
              interactive={false}
            />
          )}

          {fishingSpots.map((spot) => (
          <Marker
            key={`spot-${spot.id}`}
            position={[spot.lat, spot.lng]}
            icon={createSpotIcon(iconSize, zoom)}
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
            icon={createPersonalPlaceIcon(iconSize, zoom, getCapturesForPlace(place.id).length)}
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
            icon={createCaptureIcon(iconSize, zoom, getCapturesForCaptureSpot(capture).length)}
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

