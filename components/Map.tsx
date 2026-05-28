"use client";

import {
  MapContainer,
  Marker,
  Polygon,
  Popup,
  TileLayer,
  WMSTileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet";

import L from "leaflet";

import { useEffect, useRef, useState } from "react";
import { fishingSpots } from "@/data/fishingSpots";

type CaptureVisibility = "public" | "private" | "secret";
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
  visibility: CaptureVisibility;
  capturedAt: string;
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
  visibility: CaptureVisibility;
  capturedDate: string;
  capturedTime: string;
};

type PersonalPlaceFormData = {
  name: string;
  note: string;
};

const MAP_MIN_ZOOM = 6;
const MAP_INITIAL_ZOOM = 6;
const MAP_MAX_ZOOM = 19;
const PERSONAL_PLACE_CAPTURE_RADIUS_METERS = 250;
const CAPTURES_STORAGE_KEY = "fishcastpr.captures";
const PERSONAL_PLACES_STORAGE_KEY = "fishcastpr.personalPlaces";
const TRANSPARENT_TILE =
  "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==";
const NAUTICAL_BATHYMETRY_WMS_URL = "https://www.opendem.info/geoserver/opendem/wms";
const NAUTICAL_BATHYMETRY_ATTRIBUTION =
  "Bathymetry &copy; OpenDEM, GEBCO 2021, OpenStreetMap contributors";
const NAUTICAL_DEPTH_SURFACE_LAYER = "opendem:gebco_2021";
const NAUTICAL_DEPTH_CONTOURS_LAYER = "opendem:gebco_2021_contours";
const NAUTICAL_MAX_ZOOM = 19;
const NAUTICAL_SEAMARK_MAX_NATIVE_ZOOM = 18;

const mapModes: { id: MapMode; label: string; iconClassName: string }[] = [
  { id: "map", label: "Mapa", iconClassName: "map-mode-icon--map" },
  { id: "satellite", label: "Satélite", iconClassName: "map-mode-icon--satellite" },
  { id: "nautical", label: "Náutico", iconClassName: "map-mode-icon--nautical" },
  { id: "night", label: "Noturno", iconClassName: "map-mode-icon--night" },
];

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
    iconAnchor: [size / 2, size * 0.92],
    popupAnchor: [0, -size * 0.92],
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

function createCaptureIcon(size: number, zoom: number) {
  return createPremiumMarkerIcon({
    iconUrl: "/icons/capture-marker.png",
    kind: "capture",
    size,
    zoom,
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
              className={`group flex min-h-9 items-center justify-center gap-1.5 rounded-2xl px-2.5 text-[10px] font-black uppercase tracking-[0.08em] transition sm:min-h-10 sm:px-3 ${
                active
                  ? "border border-cyan-100/45 bg-[linear-gradient(135deg,rgba(103,232,249,0.94),rgba(52,211,153,0.88))] text-slate-950 shadow-[0_0_22px_rgba(34,211,238,0.42),inset_0_1px_0_rgba(255,255,255,0.6)]"
                  : "border border-white/10 bg-white/[0.055] text-cyan-50/78 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] hover:border-cyan-200/25 hover:bg-white/[0.12] hover:text-white"
              }`}
              aria-pressed={active}
            >
              <span
                aria-hidden="true"
                className={`map-mode-icon ${mapMode.iconClassName} ${
                  active ? "map-mode-icon--active" : ""
                }`}
              />
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
      className="group relative flex h-[88px] w-[88px] appearance-none items-center justify-center border-0 bg-transparent p-0 shadow-none outline-none transition duration-200 ease-out hover:scale-[1.04] focus-visible:ring-2 focus-visible:ring-cyan-200/70 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent active:scale-95 sm:h-[96px] sm:w-[96px]"
    >
      <span className="sr-only">{label}</span>
      <span className="relative flex h-full w-full items-center justify-center">
        <img
          src={iconSrc}
          alt=""
          draggable={false}
          className="h-full w-full select-none object-contain transition duration-200"
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
    visibility: "public",
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

  const capture = value as Partial<Capture>;

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
    typeof capture.capturedAt === "string" &&
    (capture.visibility === "public" ||
      capture.visibility === "private" ||
      capture.visibility === "secret")
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
          ...capture,
          photo: capture.photo || "",
        }))
      : [];
  } catch {
    window.localStorage.removeItem(CAPTURES_STORAGE_KEY);
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
  } catch {
    window.localStorage.removeItem(PERSONAL_PLACES_STORAGE_KEY);
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
  const [pendingCapture, setPendingCapture] = useState<{ lat: number; lng: number } | null>(null);
  const [focusTarget, setFocusTarget] = useState<FocusTarget | null>(null);
  const ignoreNextMapClickRef = useRef(false);
  const [spotPopupOpen, setSpotPopupOpen] = useState(false);
  const [capturePopupOpen, setCapturePopupOpen] = useState(false);
  const [selectedCapture, setSelectedCapture] = useState<Capture | null>(null);
  const [shareFeedback, setShareFeedback] = useState<{ captureId: number; message: string } | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<{
    name: string;
    lat: number;
    lng: number;
    personalPlaceId?: number;
    note?: string;
    visibility?: PlaceVisibility;
    conditions: {
      clima: string;
      pressao: number;
      tempAgua: number;
      temperatura: number;
      lua: string;
      mare: string;
    };
  } | null>(null);
  const [formData, setFormData] = useState(createEmptyFormData);
  const [placeFormData, setPlaceFormData] = useState(createEmptyPlaceFormData);
  const [pendingPlace, setPendingPlace] = useState<{ lat: number; lng: number } | null>(null);
  const [captures, setCaptures] = useState<Capture[]>(readStoredCaptures);
  const [personalPlaces, setPersonalPlaces] = useState<PersonalPlace[]>(readStoredPersonalPlaces);

  const iconSize = getIconSize(zoom);
  const popupPriorityOpen = Boolean(selectedLocation) || Boolean(selectedCapture) || spotPopupOpen || capturePopupOpen;

  useEffect(() => {
    window.localStorage.setItem(CAPTURES_STORAGE_KEY, JSON.stringify(captures));
  }, [captures]);

  useEffect(() => {
    window.localStorage.setItem(PERSONAL_PLACES_STORAGE_KEY, JSON.stringify(personalPlaces));
  }, [personalPlaces]);

  function getApproximateLocation(lat: number, lng: number) {
    const offset = 0.015; // aproximadamente alguns quilômetros
    const randomLat = lat + (Math.random() - 0.5) * offset;
    const randomLng = lng + (Math.random() - 0.5) * offset;
    return { lat: randomLat, lng: randomLng };
  }

  function getConditionsForLocation(lat: number, lng: number) {
    const climaOptions = ["Ensolarado", "Nublado", "Chuvoso", "Ventando", "Calmo", "Parcialmente nublado"];
    const luaOptions = ["Nova", "Crescente", "Cheia", "Minguante"];
    const mareOptions = ["Alta", "Baixa", "Média", "N/A"];

    return {
      clima: climaOptions[Math.floor(Math.abs(lat + lng) * 7) % climaOptions.length],
      pressao: 1010 + Math.round((Math.abs(lat - lng) * 10) % 15),
      tempAgua: 18 + Math.round((Math.abs(lat + lng) * 3) % 8),
      temperatura: 20 + Math.round((Math.abs(lat * lng) * 0.1) % 10),
      lua: luaOptions[Math.floor((Math.abs(lat) + Math.abs(lng)) * 3) % luaOptions.length],
      mare: mareOptions[Math.floor((Math.abs(lat - lng) * 5)) % mareOptions.length],
    };
  }

  function handleMapClick(lat: number, lng: number) {
    setSelectedCapture(null);
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

  function getVisibilityLabel(visibility: string) {
    if (visibility === "private") return "Privada";
    if (visibility === "secret") return "Secreta";
    return "Pública";
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

  function getCaptureLocationText(capture: Capture) {
    const place = capture.placeId
      ? personalPlaces.find((personalPlace) => personalPlace.id === capture.placeId)
      : null;

    if (capture.visibility === "secret") {
      return place ? `${place.name} (local protegido)` : "Local protegido";
    }

    const coordinates = `${capture.lat.toFixed(6)}, ${capture.lng.toFixed(6)}`;

    return place ? `${place.name} - ${coordinates}` : coordinates;
  }

  function getCaptureLocationUrl(capture: Capture) {
    if (capture.visibility === "secret") {
      return "";
    }

    const lat = capture.lat.toFixed(6);
    const lng = capture.lng.toFixed(6);

    return `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=16/${lat}/${lng}`;
  }

  function getCaptureShareText(capture: Capture) {
    const lines = [
      `FishCastPR - ${capture.species || "Captura registrada"}`,
      `Local: ${getCaptureLocationText(capture)}`,
    ];

    const measures = [capture.weight ? `${capture.weight} kg` : "", capture.size ? `${capture.size} cm` : ""]
      .filter(Boolean)
      .join(" / ");

    if (measures) {
      lines.push(`Peso/tamanho: ${measures}`);
    }

    if (capture.capturedAt) {
      lines.push(`Data: ${formatCaptureDate(capture.capturedAt)}`);
    }

    const locationUrl = getCaptureLocationUrl(capture);

    if (locationUrl) {
      lines.push(`Localização: ${locationUrl}`);
    }

    return lines.join("\n");
  }

  async function getCapturePhotoFile(capture: Capture) {
    if (!capture.photo.startsWith("data:image/")) {
      return null;
    }

    const response = await fetch(capture.photo);
    const blob = await response.blob();
    const extension = blob.type.split("/")[1] || "png";

    return new File([blob], `fishcastpr-captura-${capture.id}.${extension}`, {
      type: blob.type || "image/png",
    });
  }

  function showShareFeedback(captureId: number, message: string) {
    setShareFeedback({ captureId, message });

    window.setTimeout(() => {
      setShareFeedback((current) => (current?.captureId === captureId ? null : current));
    }, 1800);
  }

  async function shareCapture(capture: Capture) {
    const text = getCaptureShareText(capture);
    const title = capture.species || "Captura FishCastPR";
    const shareData: ShareData = { title, text };

    try {
      if (navigator.share) {
        const photoFile = await getCapturePhotoFile(capture);

        if (photoFile && navigator.canShare?.({ files: [photoFile] })) {
          await navigator.share({ ...shareData, files: [photoFile] });
        } else {
          await navigator.share(shareData);
        }

        showShareFeedback(capture.id, "Compartilhado!");
        return;
      }

      await navigator.clipboard.writeText(text);
      showShareFeedback(capture.id, "Copiado!");
    } catch (error) {
      if ((error as DOMException).name === "AbortError") {
        return;
      }

      try {
        await navigator.clipboard.writeText(text);
        showShareFeedback(capture.id, "Copiado!");
      } catch {
        showShareFeedback(capture.id, "Não foi possível compartilhar");
      }
    }
  }

  function saveCapture() {
    if (!pendingCapture) return;

    const location = formData.visibility === "secret"
      ? getApproximateLocation(pendingCapture.lat, pendingCapture.lng)
      : pendingCapture;
    const nearestPlace = getNearestPersonalPlace(pendingCapture.lat, pendingCapture.lng);

    setCaptures((prev) => [
      ...prev,
      {
        id: Date.now(),
        lat: location.lat,
        lng: location.lng,
        placeId: nearestPlace?.id,
        species: formData.species,
        weight: formData.weight,
        size: formData.size,
        bait: formData.bait,
        comment: formData.comment,
        photo: formData.photo,
        visibility: formData.visibility,
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
    setPendingCapture({ lat: place.lat, lng: place.lng });
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
    setCapturePopupOpen(false);
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

  function focusCapture(capture: Capture) {
    setFocusTarget({ id: capture.id, lat: capture.lat, lng: capture.lng });
    setSelectedLocation(null);
    setSelectedCapture(null);
    setCapturesPanelOpen(false);
  }

  return (
    <div className="relative w-full h-full">
      <div
        className={`map-control-overlay absolute bottom-4 right-4 z-[2000] flex flex-col items-end gap-2.5 transition sm:bottom-6 sm:right-6 sm:gap-3 ${
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
        <div className="absolute bottom-[270px] right-4 z-[2000] max-w-[210px] rounded-3xl bg-[#020a14]/95 px-4 py-3 text-center text-sm font-bold text-white border border-cyan-500/20 shadow-[0_20px_70px_rgba(0,0,0,0.55)] sm:bottom-[292px] sm:right-6 sm:max-w-[240px] sm:px-5 sm:py-4">
          Toque uma vez no mapa para marcar a captura
        </div>
      )}

      {placeMode && (
        <div className="absolute bottom-[270px] right-4 z-[2000] max-w-[210px] rounded-3xl border border-cyan-300/25 bg-[#020a14]/95 px-4 py-3 text-center text-sm font-bold text-cyan-50 shadow-[0_20px_70px_rgba(0,0,0,0.55),0_0_26px_rgba(34,211,238,0.18)] sm:bottom-[292px] sm:right-6 sm:max-w-[240px] sm:px-5 sm:py-4">
          Toque no mapa para salvar um lugar privado
        </div>
      )}

      {capturesPanelOpen && (
        <aside
          className="map-control-overlay absolute bottom-[270px] right-4 z-[2200] flex max-h-[min(50vh,520px)] w-[min(calc(100vw-32px),390px)] flex-col overflow-hidden rounded-[28px] border border-emerald-300/20 bg-[#03110d]/95 text-white shadow-[0_28px_90px_rgba(0,0,0,0.62),0_0_42px_rgba(34,197,94,0.18)] backdrop-blur-xl sm:bottom-[292px] sm:right-6"
          onPointerDown={(e) => e.stopPropagation()}
        >
          <div className="border-b border-white/10 p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-emerald-200/80">
                  Diario local
                </p>
                <h2 className="mt-1 text-xl font-black">Minhas capturas</h2>
              </div>
              <button
                onClick={() => setCapturesPanelOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.06] text-lg font-black text-zinc-200 transition hover:bg-white/[0.12]"
                aria-label="Fechar minhas capturas"
              >
                ×
              </button>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2">
              <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-3">
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-zinc-400">Total</p>
                <p className="mt-1 text-lg font-black">{captures.length}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-3">
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-zinc-400">Maior</p>
                <p className="mt-1 text-lg font-black">{getBestWeight()}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-3">
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-zinc-400">Secretas</p>
                <p className="mt-1 text-lg font-black">
                  {captures.filter((capture) => capture.visibility === "secret").length}
                </p>
              </div>
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto p-3">
            {captures.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-emerald-300/25 bg-emerald-300/[0.05] p-5 text-center">
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
                      className="rounded-2xl border border-white/10 bg-white/[0.06] p-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <h3 className="truncate text-sm font-black">
                            {getCaptureTitle(capture, originalIndex)}
                          </h3>
                          <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.12em] text-emerald-200/70">
                            {getVisibilityLabel(capture.visibility)}
                          </p>
                        </div>
                        <p className="shrink-0 text-xs font-bold text-zinc-400">
                          {formatCaptureDate(capture.capturedAt)}
                        </p>
                      </div>

                      <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
                        <span className="truncate rounded-lg bg-black/22 px-2 py-1 text-zinc-300">
                          {capture.weight ? `${capture.weight} kg` : "Peso --"}
                        </span>
                        <span className="truncate rounded-lg bg-black/22 px-2 py-1 text-zinc-300">
                          {capture.size ? `${capture.size} cm` : "Tam. --"}
                        </span>
                        <span className="truncate rounded-lg bg-black/22 px-2 py-1 text-zinc-300">
                          {capture.bait || "Isca --"}
                        </span>
                      </div>

                      <div className="mt-3">
                        <button
                          onClick={() => focusCapture(capture)}
                          className="w-full rounded-xl border border-emerald-300/25 bg-emerald-400/15 px-3 py-2 text-xs font-black text-emerald-100 transition hover:bg-emerald-400/25"
                        >
                          Ver no mapa
                        </button>
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
        <div className="fixed inset-0 bg-black/80 z-[3000] flex items-center justify-center p-4">
          <div className="bg-[#020a14] border border-cyan-500/30 rounded-3xl p-6 max-w-sm w-full max-h-[90vh] overflow-y-auto shadow-[0_24px_80px_rgba(0,255,255,0.15)]">
            <h2 className="text-white text-xl font-black mb-4 text-center">Detalhes da captura</h2>
            
            <div className="space-y-3">
              <div>
                <label className="text-cyan-400 text-sm font-bold">Espécie</label>
                <input
                  type="text"
                  placeholder="Ex: Tilápia"
                  value={formData.species}
                  onChange={(e) => setFormData({ ...formData, species: e.target.value })}
                  className="w-full bg-slate-900/50 border border-cyan-500/20 rounded-lg px-3 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-400"
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
                    className="w-full bg-slate-900/50 border border-cyan-500/20 rounded-lg px-3 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-400"
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
                    className="w-full bg-slate-900/50 border border-cyan-500/20 rounded-lg px-3 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-400"
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
                  className="w-full bg-slate-900/50 border border-cyan-500/20 rounded-lg px-3 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-cyan-400 text-sm font-bold">Data</label>
                  <input
                    type="date"
                    value={formData.capturedDate}
                    onChange={(e) => setFormData({ ...formData, capturedDate: e.target.value })}
                    className="w-full bg-slate-900/50 border border-cyan-500/20 rounded-lg px-3 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-400"
                  />
                </div>
                <div>
                  <label className="text-cyan-400 text-sm font-bold">Hora</label>
                  <input
                    type="time"
                    value={formData.capturedTime}
                    onChange={(e) => setFormData({ ...formData, capturedTime: e.target.value })}
                    className="w-full bg-slate-900/50 border border-cyan-500/20 rounded-lg px-3 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div>
                <label className="text-cyan-400 text-sm font-bold">Visibilidade</label>
                <select
                  value={formData.visibility}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      visibility: e.target.value as CaptureVisibility,
                    })
                  }
                  className="w-full bg-slate-900/50 border border-cyan-500/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-400"
                >
                  <option value="public">Pública - todos veem</option>
                  <option value="private">Privada - só você vê</option>
                  <option value="secret">Secreta - local aproximado</option>
                </select>
                <p className="text-zinc-500 text-xs mt-1">
                  Se escolher secreta, o local será armazenado de forma aproximada.
                </p>
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
                  className="w-full bg-slate-900/50 border border-cyan-500/20 rounded-lg px-3 py-2 text-white file:bg-cyan-600 file:text-white file:border-0 file:rounded file:px-3 file:py-1 file:cursor-pointer hover:file:bg-cyan-700 focus:outline-none focus:border-cyan-400"
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
                  className="w-full bg-slate-900/50 border border-cyan-500/20 rounded-lg px-3 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-400 resize-none h-20"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={saveCapture}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-2 rounded-lg transition-colors"
                >
                  Salvar Captura
                </button>
                <button
                  onClick={cancelCapture}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-2 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {pendingPlace && (
        <div className="fixed inset-0 z-[3000] flex items-center justify-center bg-black/80 p-4">
          <div className="w-full max-w-sm rounded-3xl border border-cyan-400/25 bg-[#020a14] p-6 shadow-[0_24px_80px_rgba(34,211,238,0.15)]">
            <h2 className="mb-1 text-center text-xl font-black text-white">Meu lugar</h2>
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
                  className="mt-1 w-full rounded-xl border border-cyan-500/20 bg-slate-900/50 px-3 py-2 text-white placeholder-zinc-500 focus:border-cyan-300 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-sm font-bold text-cyan-300">Observação</label>
                <textarea
                  placeholder="Notas opcionais sobre o lugar..."
                  value={placeFormData.note}
                  onChange={(e) => setPlaceFormData({ ...placeFormData, note: e.target.value })}
                  className="mt-1 h-24 w-full resize-none rounded-xl border border-cyan-500/20 bg-slate-900/50 px-3 py-2 text-white placeholder-zinc-500 focus:border-cyan-300 focus:outline-none"
                />
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-3 text-xs leading-relaxed text-zinc-300">
                Este lugar fica salvo apenas para você. Compartilhamento entra depois sem mudar seus pontos atuais.
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={savePersonalPlace}
                  className="flex-1 rounded-xl bg-cyan-500 px-4 py-3 text-sm font-black text-slate-950 transition hover:bg-cyan-300"
                >
                  Salvar lugar
                </button>
                <button
                  onClick={cancelPersonalPlace}
                  className="flex-1 rounded-xl bg-red-600 px-4 py-3 text-sm font-black text-white transition hover:bg-red-700"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedLocation && (
        <div className="fixed left-1/2 top-1/2 z-[7000] w-[calc(100vw-24px)] max-w-[420px] -translate-x-1/2 -translate-y-1/2 sm:absolute sm:top-[104px] sm:w-[min(92vw,460px)] sm:-translate-y-0">
          <div
            className="max-h-[calc(100vh-120px)] w-full cursor-pointer overflow-y-auto rounded-[28px] bg-white p-5 text-left text-slate-900 shadow-[0_28px_90px_rgba(0,0,0,0.38),0_0_38px_rgba(34,197,94,0.18)] sm:p-6"
            onClick={() => setSelectedLocation(null)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                setSelectedLocation(null);
              }
            }}
          >
            <div className="mb-5 flex items-start justify-between gap-4">
              <div className="min-w-0">
                <h2 className="text-2xl font-black leading-tight sm:text-3xl">{selectedLocation.name}</h2>
                <p className="mt-1 text-sm font-bold text-zinc-500">
                  {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}
                </p>
              </div>
              {selectedLocation.visibility === "private" && (
                <span className="shrink-0 rounded-full border border-cyan-700/15 bg-cyan-100 px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-cyan-900">
                  Privado
                </span>
              )}
            </div>
            {selectedLocation.note && (
              <p className="mb-5 rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm font-bold leading-relaxed text-slate-700">
                {selectedLocation.note}
              </p>
            )}
            <div className="grid grid-cols-1 gap-4 pr-1 text-base text-slate-800 sm:max-h-[68vh] sm:overflow-y-auto">
              <InfoRow icon="☀" label="Clima">{selectedLocation.conditions.clima}</InfoRow>
              <InfoRow icon="↧" label="Pressão">{selectedLocation.conditions.pressao} hPa</InfoRow>
              <InfoRow icon="°" label="Temperatura">{selectedLocation.conditions.temperatura} °C</InfoRow>
              <InfoRow icon="≈" label="Água">{selectedLocation.conditions.tempAgua} °C</InfoRow>
              <InfoRow icon="◐" label="Lua">{selectedLocation.conditions.lua}</InfoRow>
              <InfoRow icon="≋" label="Maré">{selectedLocation.conditions.mare}</InfoRow>
            </div>
            {selectedLocation.personalPlaceId && (() => {
              const place = personalPlaces.find((item) => item.id === selectedLocation.personalPlaceId);
              const placeCaptures = getCapturesForPlace(selectedLocation.personalPlaceId);

              if (!place) {
                return null;
              }

              return (
                <div className="mt-5 space-y-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      addCaptureAtPersonalPlace(place);
                    }}
                    className="w-full rounded-2xl border border-cyan-300/30 bg-cyan-500/15 px-4 py-3 text-sm font-black text-cyan-900 transition hover:bg-cyan-500/25"
                  >
                    Adicionar captura aqui
                  </button>

                  <div className="rounded-3xl border border-slate-200 bg-slate-50 p-3">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-500">
                        Capturas deste lugar
                      </p>
                      <span className="rounded-full bg-slate-900 px-2.5 py-1 text-xs font-black text-white">
                        {placeCaptures.length}
                      </span>
                    </div>

                    {placeCaptures.length === 0 ? (
                      <p className="mt-3 text-sm font-bold text-slate-500">
                        Nenhuma captura vinculada ainda.
                      </p>
                    ) : (
                      <div className="mt-3 max-h-56 space-y-2 overflow-y-auto pr-1">
                        {[...placeCaptures].reverse().map((capture) => (
                          <article
                            key={`place-capture-${capture.id}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedLocation(null);
                              setSelectedCapture(capture);
                            }}
                            className="flex gap-3 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm"
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" || e.key === " ") {
                                e.stopPropagation();
                                setSelectedLocation(null);
                                setSelectedCapture(capture);
                              }
                            }}
                          >
                            <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-slate-900">
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
                              <h3 className="truncate text-sm font-black text-slate-900">
                                {capture.species || "Espécie não informada"}
                              </h3>
                              <p className="mt-1 text-xs font-bold text-slate-500">
                                {formatCaptureDate(capture.capturedAt)}
                              </p>
                              <p className="mt-1 truncate text-xs font-bold text-slate-700">
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
                    className="w-full rounded-2xl border border-red-300/25 bg-red-500/12 px-4 py-3 text-sm font-black text-red-700 transition hover:bg-red-500/20"
                  >
                    Apagar lugar
                  </button>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {selectedCapture && (
        <div className="fixed left-1/2 top-1/2 z-[7000] w-[calc(100vw-24px)] max-w-[420px] -translate-x-1/2 -translate-y-1/2 sm:absolute sm:top-[104px] sm:w-[min(92vw,420px)] sm:-translate-y-0">
          <div className="max-h-[calc(100vh-120px)] overflow-y-auto rounded-[28px] border border-emerald-300/20 bg-[#03110d] text-white shadow-[0_28px_90px_rgba(0,0,0,0.65),0_0_46px_rgba(34,197,94,0.28)]">
            <button
              onClick={() => setSelectedCapture(null)}
              className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-black/55 text-xl font-black text-white backdrop-blur-md"
              aria-label="Fechar captura"
            >
              ×
            </button>

            <div className="relative h-56 overflow-hidden bg-black">
              {selectedCapture.photo ? (
                <img
                  src={selectedCapture.photo}
                  alt="Foto da captura"
                  className="h-full w-full object-contain"
                />
              ) : (
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_25%,rgba(34,197,94,0.36),transparent_42%),linear-gradient(135deg,#052e1c,#020617_58%,#000)]" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-[#03110d] via-transparent to-black/20" />
              <div className="absolute left-4 top-4 rounded-full border border-emerald-300/25 bg-black/55 px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] text-emerald-200 backdrop-blur-md">
                {getVisibilityLabel(selectedCapture.visibility)}
              </div>
              <div className="absolute bottom-4 left-4 right-14">
                <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-emerald-200/85">
                  Captura #{captures.findIndex((capture) => capture.id === selectedCapture.id) + 1}
                </p>
                <h2 className="mt-1 line-clamp-2 text-2xl font-black leading-tight text-white">
                  {selectedCapture.species || "Espécie não informada"}
                </h2>
              </div>
            </div>

            <div className="space-y-4 p-4 sm:max-h-[58vh] sm:overflow-y-auto">
              <div className="grid grid-cols-3 gap-2">
                <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-3">
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-400">Peso</p>
                  <p className="mt-1 text-sm font-black text-white">{selectedCapture.weight ? `${selectedCapture.weight} kg` : "--"}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-3">
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-400">Tamanho</p>
                  <p className="mt-1 text-sm font-black text-white">{selectedCapture.size ? `${selectedCapture.size} cm` : "--"}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-3">
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-400">Isca</p>
                  <p className="mt-1 truncate text-sm font-black text-white">{selectedCapture.bait || "--"}</p>
                </div>
              </div>

              <div className="rounded-3xl border border-emerald-300/15 bg-emerald-300/[0.06] p-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-200/80">Data/hora</p>
                <p className="mt-1 text-sm font-bold text-white">{formatCaptureDate(selectedCapture.capturedAt)}</p>
                <div className="mt-3 border-t border-white/10 pt-3 text-xs leading-relaxed text-zinc-300">
                  {selectedCapture.visibility === "secret" ? (
                    <p>Local aproximado. Coordenadas ocultas para proteger seu ponto.</p>
                  ) : (
                    <p>Coordenadas: {selectedCapture.lat.toFixed(6)}, {selectedCapture.lng.toFixed(6)}</p>
                  )}
                </div>
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-400">Observações</p>
                <p className="mt-2 max-h-24 overflow-y-auto rounded-2xl border border-white/10 bg-black/25 p-3 text-sm leading-relaxed text-zinc-200">
                  {selectedCapture.comment || "Sem observações adicionadas."}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    void shareCapture(selectedCapture);
                  }}
                  className="rounded-2xl border border-cyan-300/25 bg-cyan-400/15 px-4 py-3 text-sm font-black text-cyan-100 transition hover:bg-cyan-400/25"
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
                  className="rounded-2xl border border-red-300/20 bg-red-500/15 px-4 py-3 text-sm font-black text-red-100 transition hover:bg-red-500/25"
                >
                  Apagar captura
                </button>
              </div>
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
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
          )}

          {mapMode === "satellite" && (
            <TileLayer
              attribution="Tiles &copy; Esri"
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            />
          )}

          {mapMode === "nautical" && (
            <>
              <TileLayer
                attribution="&copy; OpenStreetMap contributors"
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
              setSelectedLocation(null);
              setSelectedCapture(null);
            }}
            onOtherPopupClose={() => {
              setSpotPopupOpen(false);
              setCapturePopupOpen(false);
            }}
            spotPopupOpen={spotPopupOpen}
            ignoreNextMapClickRef={ignoreNextMapClickRef}
          />

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
              setSelectedLocation((current) => {
  if (current?.name === spot.name) {
    return null;
  }

  return {
    name: spot.name,
    lat: spot.lat,
    lng: spot.lng,
    conditions: spot.conditions,
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

        {captures.filter((capture) => !capture.placeId).map((capture, index) => (
          <Marker
            key={`capture-${capture.id}`}
            position={[capture.lat, capture.lng]}
            icon={createCaptureIcon(iconSize, zoom)}
            eventHandlers={{
              click: (event) => {
                L.DomEvent.stopPropagation(event.originalEvent);
                ignoreNextMapClickRef.current = false;
                setSelectedLocation(null);
                setSelectedCapture(null);
                setCapturePopupOpen(true);
                setSpotPopupOpen(false);
              },
            }}
          >
            <Popup
             closeButton={true}
              closeOnClick={true}
              autoClose={true}
              className="capture-popup hide-leaflet-close"
              eventHandlers={{
                popupopen: () => setCapturePopupOpen(true),
                popupclose: () => {
                  setCapturePopupOpen(false);
                },
              }}
            ><div
  onClick={(e) => {
  e.stopPropagation();

  const popupElement = e.currentTarget.closest(".leaflet-popup");
  const closeButton = popupElement?.querySelector(
    ".leaflet-popup-close-button"
  ) as HTMLElement | null;

  closeButton?.click();
}}
  className="w-[min(84vw,360px)]
               overflow-hidden rounded-[28px] border border-emerald-300/20 bg-[#03110d] text-white shadow-[0_28px_90px_rgba(0,0,0,0.65),0_0_46px_rgba(34,197,94,0.28)]">
                <div className="relative h-52 overflow-hidden bg-black">
                  {capture.photo ? (
                    <img
                      src={capture.photo}
                      alt="Foto da captura"
                      className="h-full w-full object-contain"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_25%,rgba(34,197,94,0.36),transparent_42%),linear-gradient(135deg,#052e1c,#020617_58%,#000)]" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#03110d] via-transparent to-black/20" />
                  <div className="absolute left-4 top-4 rounded-full border border-emerald-300/25 bg-black/55 px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] text-emerald-200 backdrop-blur-md">
                    {getVisibilityLabel(capture.visibility)}
                  </div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-emerald-200/85">
                      Captura #{index + 1}
                    </p>
                    <h2 className="mt-1 line-clamp-2 text-2xl font-black leading-tight text-white">
                      {capture.species || "Espécie não informada"}
                    </h2>
                  </div>
                </div>

                <div className="space-y-4 p-4">
               
                  <div className="grid grid-cols-3 gap-2">
                    <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-3">
                      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-400">Peso</p>
                      <p className="mt-1 text-sm font-black text-white">{capture.weight ? `${capture.weight} kg` : "--"}</p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-3">
                      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-400">Tamanho</p>
                      <p className="mt-1 text-sm font-black text-white">{capture.size ? `${capture.size} cm` : "--"}</p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-3">
                      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-400">Isca</p>
                      <p className="mt-1 truncate text-sm font-black text-white">{capture.bait || "--"}</p>
                    </div>
                  </div>

                  <div className="rounded-3xl border border-emerald-300/15 bg-emerald-300/[0.06] p-4">
                    <div>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-200/80">Data/hora</p>
                        <p className="mt-1 text-sm font-bold text-white">{formatCaptureDate(capture.capturedAt)}</p>
                      </div>
                    </div>
                    <div className="mt-3 border-t border-white/10 pt-3 text-xs leading-relaxed text-zinc-300">
                      {capture.visibility === "secret" ? (
                        <p>Local aproximado. Coordenadas ocultas para proteger seu ponto.</p>
                      ) : (
                        <p>Coordenadas: {capture.lat.toFixed(5)}, {capture.lng.toFixed(5)}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-400">Observações</p>
                    <p className="mt-2 max-h-20 overflow-y-auto rounded-2xl border border-white/10 bg-black/25 p-3 text-sm leading-relaxed text-zinc-200">
                      {capture.comment || "Sem observações adicionadas."}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        void shareCapture(capture);
                      }}
                      className="rounded-2xl border border-cyan-300/25 bg-cyan-400/15 px-4 py-3 text-sm font-black text-cyan-100 transition hover:bg-cyan-400/25"
                    >
                      {shareFeedback?.captureId === capture.id ? shareFeedback.message : "Compartilhar"}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();

                        const confirmed = window.confirm(
                          "Deseja realmente apagar esta captura?"
                        );

                        if (!confirmed) {
                          return;
                        }

                        deleteCapture(capture.id);
                      }}
                      className="rounded-2xl border border-red-300/20 bg-red-500/15 px-4 py-3 text-sm font-black text-red-100 transition hover:bg-red-500/25"
                    >
                      Apagar captura
                    </button>
                  </div>

                  {capture.visibility === "secret" && (
                    <p className="text-center text-[11px] font-bold uppercase tracking-[0.12em] text-yellow-200/80">
                      Coordenadas não expostas
                    </p>
                  )}
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
