"use client";

import {
  MapContainer,
  Marker,
  Pane,
  Polygon,
  TileLayer,
  WMSTileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet";

import L from "leaflet";

import { useEffect, useRef, useState } from "react";

import PremiumPanelPreview from "@/components/PremiumPanelPreview";
import { shareCapture as shareCaptureFile } from "@/components/captures/sharing";
import {
  deleteCapturePhoto,
  isCapturePhotoDataUrl,
  migrateLegacyCapturePhotosInLocalStorage,
  persistLightweightCaptures,
  readCapturePhoto,
  readStoredCaptures,
  syncCapturePhotos,
} from "@/components/captures/storage";
import type { Capture, CaptureFormData, CaptureShareMode } from "@/components/captures/types";
import { fishingSpots, type SpotConditions, type FishingSpot } from "@/data/fishingSpots";

type MapMode = "map" | "satellite" | "nautical" | "night";
type PlaceVisibility = "private";

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
const MAP_INITIAL_ZOOM = 7;
const OSM_MAX_NATIVE_ZOOM = 18;
const SATELLITE_MAX_NATIVE_ZOOM = 18;
const NIGHT_MAX_NATIVE_ZOOM = 18;
const MAP_MAX_ZOOM = 18;
const PERSONAL_PLACE_CAPTURE_RADIUS_METERS = 250;
const PERSONAL_PLACES_STORAGE_KEY = "fishcastpr.personalPlaces";
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

const infoLabelClass =
  "text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-200/80";

const MARKER_ICON_SIZE = 52;
const OFFICIAL_SPOT_MARKER_ICON_SIZE = 45;
const OFFICIAL_SPOT_MARKER_PANE = "official-spot-markers";
const OFFICIAL_SPOT_MARKER_PANE_Z_INDEX = 650;
const OFFICIAL_SPOT_MARKER_Z_INDEX_OFFSET = 1000;
const USER_CAPTURE_MARKER_PANE = "user-capture-markers";
const USER_CAPTURE_MARKER_PANE_Z_INDEX = 625;
const USER_PLACE_MARKER_PANE = "user-place-markers";
const USER_PLACE_MARKER_PANE_Z_INDEX = 610;

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
    iconUrl: "/icons/spot-markernovo.png",
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

function CenterButton({
  personalPlaces,
  hidden,
}: {
  personalPlaces: PersonalPlace[];
  hidden: boolean;
}) {
  const map = useMap();

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        e.preventDefault();
        map.closePopup();
        scheduleHomeMapView(map, personalPlaces, true);
      }}
      onPointerDown={(e) => e.stopPropagation()}
      aria-label="Centralizar mapa"
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
  mapDismissBlocked,
  interactionPanelOpen,
  onDismissActivePopup,
  onDismissInteractionPanel,
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
  mapDismissBlocked: boolean;
  interactionPanelOpen: boolean;
  onDismissActivePopup: () => void;
  onDismissInteractionPanel: () => void;
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

      if (mapDismissBlocked) {
        return;
      }

      if (popupPriorityOpen) {
        map.closePopup();
        onDismissActivePopup();
        return;
      }

      if (interactionPanelOpen) {
        map.closePopup();
        onDismissInteractionPanel();
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

function MapActionButton({
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
  const hasBadge = typeof badge === "number" && badge > 0;

  return (
    <button
      onClick={onClick}
      onPointerDown={(e) => e.stopPropagation()}
      aria-label={ariaLabel}
      title={title}
      className="group relative flex h-[66px] w-[66px] appearance-none items-center justify-center overflow-visible rounded-[20px] border border-cyan-200/20 bg-[radial-gradient(circle_at_30%_18%,rgba(34,211,238,0.16),transparent_38%),linear-gradient(145deg,rgba(5,36,50,0.94),rgba(2,10,20,0.96)_62%,rgba(4,26,38,0.92))] p-2.5 leading-none shadow-[0_16px_42px_rgba(0,0,0,0.42),0_0_24px_rgba(34,211,238,0.12),inset_0_1px_0_rgba(255,255,255,0.1),inset_0_0_0_1px_rgba(103,232,249,0.045)] outline-none backdrop-blur-xl transition duration-200 ease-out hover:scale-[1.035] hover:border-cyan-200/38 hover:bg-[radial-gradient(circle_at_30%_18%,rgba(34,211,238,0.22),transparent_38%),linear-gradient(145deg,rgba(7,48,64,0.98),rgba(2,12,24,0.98)_62%,rgba(5,32,46,0.96))] hover:shadow-[0_18px_48px_rgba(0,0,0,0.46),0_0_34px_rgba(34,211,238,0.18),inset_0_1px_0_rgba(255,255,255,0.12),inset_0_0_0_1px_rgba(103,232,249,0.07)] focus-visible:ring-2 focus-visible:ring-cyan-200/70 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent active:scale-95 sm:h-[78px] sm:w-[78px] sm:rounded-[22px] sm:p-3"
    >
      <span className="pointer-events-none absolute inset-x-3 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(125,211,252,0.46),rgba(190,242,100,0.1),transparent)]" />
      <span className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-[20px]">
        <img
          src={iconSrc}
          alt=""
          draggable={false}
          className="h-[118%] w-[118%] max-w-none select-none object-contain transition duration-200 group-hover:scale-[1.03]"
        />
      </span>
      {hasBadge && (
        <span className="absolute -right-1.5 -top-1.5 flex min-h-7 min-w-7 items-center justify-center rounded-full border border-white/75 bg-white px-1.5 text-sm font-black text-slate-950 shadow-[0_8px_20px_rgba(0,0,0,0.34),0_0_12px_rgba(255,255,255,0.24)] sm:min-h-8 sm:min-w-8 sm:text-base">
          {badge > 99 ? "99+" : badge}
        </span>
      )}
    </button>
  );
}

function stopPanelEvent(event: { stopPropagation: () => void }) {
  event.stopPropagation();
}

const paranaCenter: [number, number] = [-25.25, -51.15];
const vouPescarDefaultBounds: L.LatLngBoundsExpression = [
  [-26.75, -54.75],
  [-22.45, -47.78],
];
const HOME_VIEW_PADDING: L.PointExpression = [56, 56];
const HOME_VIEW_CLUSTER_DISTANCE_METERS = 90000;

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

function getValidPersonalPlacesForMap(personalPlaces: PersonalPlace[]) {
  return personalPlaces.filter(
    (place) =>
      Number.isFinite(place.lat) &&
      Number.isFinite(place.lng) &&
      place.lat >= -90 &&
      place.lat <= 90 &&
      place.lng >= -180 &&
      place.lng <= 180
  );
}

function getPersonalPlaceTime(place: PersonalPlace) {
  const time = new Date(place.createdAt).getTime();
  return Number.isFinite(time) ? time : 0;
}

function getMostRecentPersonalPlace(personalPlaces: PersonalPlace[]) {
  return personalPlaces.reduce((latest, place) =>
    getPersonalPlaceTime(place) > getPersonalPlaceTime(latest) ? place : latest
  );
}

function getConnectedPersonalPlaceCluster(
  seed: PersonalPlace,
  availablePlaces: PersonalPlace[],
  visitedIds: Set<number>
) {
  const cluster: PersonalPlace[] = [];
  const queue = [seed];
  visitedIds.add(seed.id);

  while (queue.length > 0) {
    const currentPlace = queue.shift();

    if (!currentPlace) {
      continue;
    }

    cluster.push(currentPlace);

    for (const place of availablePlaces) {
      if (visitedIds.has(place.id)) {
        continue;
      }

      if (getDistanceMeters(currentPlace, place) <= HOME_VIEW_CLUSTER_DISTANCE_METERS) {
        visitedIds.add(place.id);
        queue.push(place);
      }
    }
  }

  return cluster;
}

function getPersonalPlaceClusters(personalPlaces: PersonalPlace[]) {
  const visitedIds = new Set<number>();
  const clusters: PersonalPlace[][] = [];

  for (const place of personalPlaces) {
    if (visitedIds.has(place.id)) {
      continue;
    }

    const cluster = getConnectedPersonalPlaceCluster(place, personalPlaces, visitedIds);
    clusters.push(cluster);
  }

  return clusters.sort((leftCluster, rightCluster) => {
    if (rightCluster.length !== leftCluster.length) {
      return rightCluster.length - leftCluster.length;
    }

    return (
      getPersonalPlaceTime(getMostRecentPersonalPlace(rightCluster)) -
      getPersonalPlaceTime(getMostRecentPersonalPlace(leftCluster))
    );
  });
}

function getPersonalPlacesForHomeView(personalPlaces: PersonalPlace[]) {
  if (personalPlaces.length <= 1) {
    return personalPlaces;
  }

  const clusters = getPersonalPlaceClusters(personalPlaces);
  const mainCluster = clusters[0] || [];
  const secondClusterSize = clusters[1]?.length || 0;

  if (mainCluster.length === personalPlaces.length) {
    return personalPlaces;
  }

  const hasMainConcentration =
    mainCluster.length >= 3 ||
    mainCluster.length > secondClusterSize ||
    mainCluster.length >= personalPlaces.length * 0.6;

  if (mainCluster.length >= 2 && hasMainConcentration) {
    return mainCluster;
  }

  return [getMostRecentPersonalPlace(personalPlaces)];
}

function applyHomeMapView(map: L.Map, personalPlaces: PersonalPlace[], animate: boolean) {
  map.invalidateSize({ animate: false, pan: false });

  const validPlaces = getValidPersonalPlacesForMap(personalPlaces);
  const viewPlaces = getPersonalPlacesForHomeView(validPlaces);
  const options: L.FitBoundsOptions = {
    animate,
    maxZoom: 12,
    padding: HOME_VIEW_PADDING,
  };

  if (viewPlaces.length === 1) {
    map.setView([viewPlaces[0].lat, viewPlaces[0].lng], 12, { animate });
    return;
  }

  if (viewPlaces.length > 1) {
    const bounds = L.latLngBounds(viewPlaces.map((place) => [place.lat, place.lng]));
    map.fitBounds(bounds, options);
    return;
  }

  map.fitBounds(vouPescarDefaultBounds, {
    ...options,
    maxZoom: 8,
  });
}

function scheduleHomeMapView(map: L.Map, personalPlaces: PersonalPlace[], animate: boolean) {
  const timeoutIds: number[] = [];
  const frameIds: number[] = [];

  const run = () => {
    applyHomeMapView(map, personalPlaces, animate);
  };

  run();

  frameIds.push(
    window.requestAnimationFrame(() => {
      frameIds.push(window.requestAnimationFrame(run));
    })
  );
  timeoutIds.push(window.setTimeout(run, 120));
  timeoutIds.push(window.setTimeout(run, 360));

  return () => {
    timeoutIds.forEach((timeoutId) => window.clearTimeout(timeoutId));
    frameIds.forEach((frameId) => window.cancelAnimationFrame(frameId));
  };
}

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

function HomeMapViewController({ personalPlaces }: { personalPlaces: PersonalPlace[] }) {
  const map = useMap();
  const initialFitDoneRef = useRef(false);

  useEffect(() => {
    if (initialFitDoneRef.current) {
      return;
    }

    initialFitDoneRef.current = true;
    return scheduleHomeMapView(map, personalPlaces, false);
  }, [map, personalPlaces]);

  return null;
}

function CoordinatesBadge({
  lat,
  lng,
  precision = 6,
  label = "Coordenadas",
}: {
  lat: number;
  lng: number;
  precision?: number;
  label?: string;
}) {
  return (
    <div className="shrink-0 rounded-sm border border-cyan-200/16 bg-black/28 px-2.5 py-1.5 text-right shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
      <p className="text-[8px] font-black uppercase tracking-[0.12em] text-cyan-100/70 sm:text-[9px]">
        {label}
      </p>
      <p className="mt-1 font-mono text-[10px] font-black leading-tight text-white sm:text-xs">
        Lat {lat.toFixed(precision)}
      </p>
      <p className="font-mono text-[10px] font-black leading-tight text-white sm:text-xs">
        Lng {lng.toFixed(precision)}
      </p>
    </div>
  );
}

function getScoreCondition(score: number) {
  if (score >= 80) return "Excelente";
  if (score >= 60) return "Bom";
  if (score >= 40) return "Regular";
  return "Fraco";
}

function VouPescarScoreGauge({
  score,
  partial,
  compactMobile = false,
}: {
  score: number;
  partial: boolean;
  compactMobile?: boolean;
}) {
  const condition = getScoreCondition(score);
  const needleRotation = Math.max(-92, Math.min(92, score * 1.84 - 92));

  return (
    <div className={`${compactMobile ? "mb-1.5 p-2 sm:mb-3 sm:p-3" : "mb-2 p-2.5 sm:mb-3 sm:p-3"} shrink-0 rounded-md border border-lime-300/30 bg-[radial-gradient(circle_at_12%_20%,rgba(132,204,22,0.14),transparent_48%),linear-gradient(135deg,rgba(5,46,22,0.56),rgba(2,6,23,0.78))] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]`}>
      <div className={`${compactMobile ? "mb-1" : "mb-1.5"} flex items-center gap-2 text-lime-200`}>
        <span className="text-sm" aria-hidden="true">🏆</span>
        <p className="text-[10px] font-black uppercase tracking-[0.18em] sm:text-[11px]">VOUPESCAR SCORE</p>
      </div>

      <div className={`${compactMobile ? "grid-cols-[112px_1fr] gap-3 sm:grid-cols-[170px_1fr] sm:gap-4" : "grid-cols-[140px_1fr] gap-3 sm:grid-cols-[170px_1fr] sm:gap-4"} grid items-center`}>
        <svg
          viewBox="0 0 240 168"
          className="h-auto w-full drop-shadow-[0_10px_20px_rgba(132,204,22,0.14)]"
          aria-label={`VouPescar Score ${score}, ${condition}`}
          role="img"
        >
          <path d="M 34 128 A 86 86 0 0 1 58 67" fill="none" stroke="#ef2525" strokeLinecap="round" strokeWidth="18" />
          <path d="M 64 61 A 86 86 0 0 1 116 34" fill="none" stroke="#f97316" strokeLinecap="round" strokeWidth="18" />
          <path d="M 124 34 A 86 86 0 0 1 184 62" fill="none" stroke="#facc15" strokeLinecap="round" strokeWidth="18" />
          <path d="M 190 69 A 86 86 0 0 1 206 128" fill="none" stroke="#22c55e" strokeLinecap="round" strokeWidth="18" />
          <line
            x1="120"
            y1="126"
            x2="120"
            y2="52"
            stroke="#f8fafc"
            strokeLinecap="round"
            strokeWidth="8"
            transform={`rotate(${needleRotation} 120 126)`}
          />
          <circle cx="120" cy="126" r="9" fill="#facc15" />
          <text x="120" y="92" textAnchor="middle" fill="#f8fafc" fontSize="48" fontWeight="900">
            {score}
          </text>
          <text x="120" y="119" textAnchor="middle" fill="#86efac" fontSize="18" fontWeight="900">
            {condition}
          </text>
        </svg>
        <div className={`${compactMobile ? "pl-2" : "pl-3"} min-w-0 border-l border-white/10`}>
          <p className="text-[9px] font-black uppercase tracking-[0.16em] text-lime-200/80 sm:text-[10px]">
            Condição
          </p>
          <p className={`${compactMobile ? "mt-1 text-sm sm:text-lg" : "mt-1 text-base sm:text-lg"} font-black leading-tight text-white`}>{condition}</p>
          <div className="mt-2 grid grid-cols-2 gap-1">
            {["Fraco", "Regular", "Bom", "Excelente"].map((label) => (
              <span
                key={label}
                className={`rounded-sm border px-1.5 py-1 text-center text-[8px] font-black uppercase tracking-[0.06em] sm:text-[9px] ${
                  label === condition
                    ? "border-lime-300/50 bg-lime-300/18 text-lime-100"
                    : "border-white/10 bg-black/18 text-zinc-400"
                }`}
              >
                {label}
              </span>
            ))}
          </div>
        </div>
      </div>

      {partial && (
        <p className={`${compactMobile ? "mt-1 px-2 py-1 text-[10px] sm:mt-2 sm:px-3 sm:py-1.5 sm:text-xs" : "mt-2 px-3 py-1.5 text-xs"} rounded-md border border-white/10 bg-black/18 text-center font-bold text-zinc-300`}>
          Score baseado em dados parciais
        </p>
      )}
    </div>
  );
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
  const [premiumPreviewOpen, setPremiumPreviewOpen] = useState(false);
  const [captureMode, setCaptureMode] = useState(false);
  const [placeMode, setPlaceMode] = useState(false);
  const [capturesPanelOpen, setCapturesPanelOpen] = useState(false);
  const [mapMode, setMapMode] = useState<MapMode>("map");
  const [zoom, setZoom] = useState(MAP_INITIAL_ZOOM);
  const [pendingCapture, setPendingCapture] = useState<{
    lat: number;
    lng: number;
    placeId?: number | null;
  } | null>(null);
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
  const [focusTarget, setFocusTarget] = useState<FocusTarget | null>(null);
  const [storageFeedback, setStorageFeedback] = useState<string | null>(null);
  const [capturePhotoMigrationDone, setCapturePhotoMigrationDone] = useState(false);

  const iconSize = MARKER_ICON_SIZE;
  const popupPriorityOpen =
    Boolean(selectedLocation) ||
    Boolean(selectedCapture) ||
    Boolean(selectedCaptureSpot) ||
    spotPopupOpen ||
    capturePopupOpen;
  const interactiveWindowOpen =
    Boolean(pendingCapture) ||
    Boolean(pendingPlace) ||
    capturesPanelOpen ||
    Boolean(selectedCapture) ||
    Boolean(selectedCaptureSpot) ||
    Boolean(selectedLocation?.personalPlaceId);

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
    const date = new Date(value);
    const datePart = new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(date);
    const hour = date.getHours();
    const minutes = date.getMinutes();
    const timePart = minutes === 0
      ? `${hour}h`
      : `${hour}h${String(minutes).padStart(2, "0")}`;

    return `📅 ${datePart} • ${timePart}`;
  }

  function getCaptureTitle(capture: Capture, index: number) {
    return capture.species || `Captura #${index + 1}`;
  }

  function getCapturePlaceLabel(capture: Capture) {
    const place = capture.placeId
      ? personalPlaces.find((personalPlace) => personalPlace.id === capture.placeId)
      : getNearestPersonalPlace(capture.lat, capture.lng);

    return place?.name?.trim() || "Ponto sem nome";
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
    const placeName = place?.name.trim() || "\uD83D\uDCCD Ponto sem nome";

    return `${placeName}\n${coordinates}`;
  }

  function showShareFeedback(captureId: number, message: string) {
    setShareFeedback({ captureId, message });

    window.setTimeout(() => {
      setShareFeedback((current) => (current?.captureId === captureId ? null : current));
    }, 1800);
  }

  async function shareCapture(capture: Capture, shareMode: CaptureShareMode) {
    await shareCaptureFile({
      capture,
      shareMode,
      formatCaptureDate,
      getCaptureLocationText,
      onFeedback: showShareFeedback,
      onShareOptionsClose: () => setShareOptionsCaptureId(null),
    });
  }

  function saveCapture() {
    if (!pendingCapture) return;

    const newCaptureId = new Date().getTime();
    const newCaptureLat = pendingCapture.lat;
    const newCaptureLng = pendingCapture.lng;
    const nearestPlace =
      typeof pendingCapture.placeId === "undefined"
        ? getNearestPersonalPlace(newCaptureLat, newCaptureLng)
        : null;
    const capturePlaceId =
      typeof pendingCapture.placeId === "undefined"
        ? nearestPlace?.id
        : pendingCapture.placeId || undefined;

    setCaptures((prev) => [
      ...prev,
      {
        id: newCaptureId,
        lat: newCaptureLat,
        lng: newCaptureLng,
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
    setFocusTarget({ id: newCaptureId, lat: newCaptureLat, lng: newCaptureLng });
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
    const newPlaceId = new Date().getTime();
    const newPlaceLat = pendingPlace.lat;
    const newPlaceLng = pendingPlace.lng;

    setPersonalPlaces((prev) => [
      ...prev,
      {
        id: newPlaceId,
        lat: newPlaceLat,
        lng: newPlaceLng,
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
    setFocusTarget({ id: newPlaceId, lat: newPlaceLat, lng: newPlaceLng });
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

  function deleteCaptureSpot(spot: { lat: number; lng: number }) {
    const confirmed = window.confirm("Tem certeza que deseja apagar este spot e suas capturas?");

    if (!confirmed) {
      return;
    }

    const spotKey = `${spot.lat},${spot.lng}`;
    const captureIdsToDelete = captures
      .filter((capture) => !capture.placeId && getCaptureSpotKey(capture) === spotKey)
      .map((capture) => capture.id);

    setCaptures((prev) =>
      prev.filter((capture) => capture.placeId || getCaptureSpotKey(capture) !== spotKey)
    );
    captureIdsToDelete.forEach((id) => {
      void deleteCapturePhoto(id);
    });
    setCapturePopupOpen(false);
    setShareOptionsCaptureId(null);
    setSelectedCapture((current) =>
      current && captureIdsToDelete.includes(current.id) ? null : current
    );
    setSelectedCaptureSpot((current) =>
      current && `${current.lat},${current.lng}` === spotKey ? null : current
    );
  }

  function openCaptureDetails(capture: Capture) {
    setSelectedLocation(null);
    setSelectedCaptureSpot(null);
    setCapturesPanelOpen(false);
    setShareOptionsCaptureId(null);
    setSelectedCapture(capture);
  }

  function openCaptureLinkedLocation(capture: Capture) {
    setCapturesPanelOpen(false);
    setSelectedCapture(null);
    setSelectedLocation(null);
    setSelectedCaptureSpot(null);
    setCapturePopupOpen(false);
    setSpotPopupOpen(false);
    setShareOptionsCaptureId(null);
    setFocusTarget({ id: capture.id, lat: capture.lat, lng: capture.lng });
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
      {premiumPreviewOpen && <PremiumPanelPreview onClose={() => setPremiumPreviewOpen(false)} />}

      {storageFeedback && (
        <div
          className="map-control-overlay fixed left-1/2 top-4 z-[9000] w-[calc(100vw-32px)] max-w-[420px] -translate-x-1/2 rounded-sm border border-amber-300/30 bg-amber-950/95 px-4 py-3 text-sm font-bold leading-snug text-amber-50 shadow-[0_18px_60px_rgba(0,0,0,0.45)]"
          role="status"
        >
          {storageFeedback}
        </div>
      )}

      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          setPremiumPreviewOpen(true);
        }}
        onPointerDown={(event) => event.stopPropagation()}
        className={`map-control-overlay absolute left-4 bottom-4 z-[2100] rounded-2xl border border-cyan-300/25 bg-slate-950/88 px-4 py-3 text-xs font-black uppercase tracking-[0.12em] text-cyan-100 shadow-[0_18px_50px_rgba(0,0,0,0.45),0_0_22px_rgba(34,211,238,0.14)] backdrop-blur-xl transition hover:border-cyan-200/45 hover:bg-slate-900/95 ${
          popupPriorityOpen ? "pointer-events-none opacity-0" : "opacity-100"
        }`}
        aria-label="Abrir preview premium"
      >
        Preview premium
      </button>

      <div
        className={`map-control-overlay absolute bottom-[calc(env(safe-area-inset-bottom)+0.75rem)] right-[calc(env(safe-area-inset-right)+0.75rem)] z-[2000] flex max-h-[calc(100dvh-env(safe-area-inset-bottom)-env(safe-area-inset-top)-1.5rem)] flex-col items-end gap-2 transition sm:bottom-6 sm:right-6 sm:max-h-none ${
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
          label="Adicionar Lugar"
          iconSrc="/icons/meus-lugares.png"
          onClick={() => {
            setPlaceMode((prev) => !prev);
            setCaptureMode(false);
            setCapturesPanelOpen(false);
            setSelectedCaptureSpot(null);
          }}
          ariaLabel={placeMode ? "Cancelar marcação de lugar" : "Adicionar lugar"}
          title={placeMode ? "Cancelar lugar" : "Adicionar lugar"}
        />

        <MapActionButton
          label="Minhas Capturas"
          iconSrc="/icons/minhas-capturasnovo.png"
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
          className="map-control-overlay fixed bottom-2 left-1/2 top-2 z-[2200] flex w-[calc(100vw-16px)] max-w-[900px] -translate-x-1/2 flex-col overflow-hidden rounded-md border border-cyan-300/18 bg-[#020a14]/97 text-white shadow-[0_28px_90px_rgba(0,0,0,0.62),0_0_42px_rgba(34,211,238,0.18)] backdrop-blur-xl sm:bottom-6 sm:top-6 sm:w-[calc(100vw-24px)]"
          onClick={stopPanelEvent}
          onPointerDown={stopPanelEvent}
        >
          <div className="shrink-0 border-b border-white/10 p-4 sm:p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.22em] text-emerald-200">
                  Diário local
                </p>
                <h2 className="mt-1 text-3xl font-black leading-none text-white sm:text-5xl">Minhas capturas</h2>
              </div>
              <button
                onClick={() => setCapturesPanelOpen(false)}
                className="flex h-12 w-12 items-center justify-center rounded-md border border-emerald-300/35 bg-black/65 text-2xl font-black text-white shadow-[0_0_18px_rgba(16,185,129,0.18)] transition hover:bg-black/80"
                aria-label="Fechar minhas capturas"
              >
                ×
              </button>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2 rounded-sm border border-yellow-300/20 bg-yellow-300/5 p-2 sm:gap-3 sm:p-3">
              <div className="rounded-sm border border-emerald-300/15 bg-black/25 p-2.5 sm:p-4">
                <p className={infoLabelClass}>Total</p>
                <p className="mt-1 text-2xl font-black sm:text-4xl">{captures.length}</p>
              </div>
              <div className="rounded-sm border border-emerald-300/15 bg-black/25 p-2.5 sm:p-4">
                <p className={infoLabelClass}>Maior</p>
                <p className="mt-1 text-xl font-black sm:text-3xl">{getBestWeight()}</p>
              </div>
              <div className="rounded-sm border border-emerald-300/15 bg-black/25 p-2.5 sm:p-4">
                <p className={infoLabelClass}>Última captura</p>
                <p className="mt-1 text-base font-black leading-tight sm:text-2xl">
                  {getLastSpotCaptureDate(captures)}
                </p>
              </div>
            </div>
          </div>

          <div className={`min-h-0 flex-1 p-3 sm:p-4 ${captures.length >= 4 ? "overflow-y-auto" : "overflow-visible"}`}>
            {captures.length === 0 ? (
                <div className="flex h-full min-h-0 flex-col items-center justify-center rounded-md border border-dashed border-emerald-300/25 bg-emerald-300/[0.05] p-5 text-center">
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
                      onClick={() => openCaptureLinkedLocation(capture)}
                      className="flex cursor-pointer gap-3 rounded-sm border border-white/10 bg-white/[0.06] p-3 transition hover:border-emerald-300/25 hover:bg-white/[0.09]"
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          openCaptureLinkedLocation(capture);
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
                            <p className="mt-2 truncate text-xs font-black text-cyan-100/85">
                              {"\uD83D\uDCCD"} {getCapturePlaceLabel(capture)}
                            </p>
                            <p className="mt-1 text-xs font-bold text-zinc-300">
                              {capture.size ? `${capture.size} cm` : "Tam. --"} • {capture.weight ? `${capture.weight} kg` : "Peso --"}
                            </p>
                          </div>
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
          <div
            className="fixed bottom-2 left-1/2 top-2 flex w-[calc(100vw-16px)] max-w-[640px] -translate-x-1/2 flex-col overflow-hidden rounded-md border border-cyan-300/18 bg-[#020a14]/97 text-white shadow-[0_24px_80px_rgba(0,0,0,0.62),0_0_34px_rgba(34,211,238,0.18)] backdrop-blur-xl sm:bottom-6 sm:top-6"
            onClick={stopPanelEvent}
            onPointerDown={stopPanelEvent}
          >
            <button
              onClick={cancelCapture}
              className="hidden"
              aria-label="Fechar adicionar captura"
            >
              ×
            </button>
            <div className="shrink-0 border-b border-white/10 p-3 sm:p-5">
              <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3 sm:grid-cols-[minmax(0,1fr)_auto_auto]">
              <div className="min-w-0">
                <p className="text-[11px] font-black uppercase tracking-[0.22em] text-emerald-200">Adicionar captura</p>
                <h2 className="mt-1 text-3xl font-black leading-none text-white">Detalhes da captura</h2>
              </div>
              <div className="hidden sm:block">
                <CoordinatesBadge lat={pendingCapture.lat} lng={pendingCapture.lng} precision={8} />
              </div>
              <button
                onClick={cancelCapture}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md border border-emerald-300/45 bg-black/70 text-2xl font-black text-white shadow-[0_0_18px_rgba(16,185,129,0.22)] backdrop-blur-md transition hover:bg-black/85 sm:h-12 sm:w-12"
                aria-label="Fechar adicionar captura"
              >
                ×
              </button>
              </div>
            </div>
            
            <div className="grid min-h-0 flex-1 grid-rows-[auto_auto_auto_auto_auto_minmax(0,1fr)] gap-2 overflow-hidden p-3 sm:gap-4 sm:p-5">
              <div>
                  <label className="text-sm font-black uppercase tracking-[0.12em] text-emerald-200">Espécie</label>
                <input
                  type="text"
                  placeholder="Ex: Tilápia"
                  value={formData.species}
                  onChange={(e) => setFormData({ ...formData, species: e.target.value })}
                  className="mt-1 min-h-10 w-full rounded-sm border border-cyan-300/18 bg-black/25 px-3 py-2 text-white placeholder-zinc-500 focus:border-cyan-300 focus:outline-none sm:min-h-12 sm:px-4 sm:py-3"
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
                    className="mt-1 min-h-10 w-full rounded-sm border border-cyan-300/18 bg-black/25 px-3 py-2 text-white placeholder-zinc-500 focus:border-cyan-300 focus:outline-none sm:min-h-12 sm:px-4 sm:py-3"
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
                    className="mt-1 min-h-10 w-full rounded-sm border border-cyan-300/18 bg-black/25 px-3 py-2 text-white placeholder-zinc-500 focus:border-cyan-300 focus:outline-none sm:min-h-12 sm:px-4 sm:py-3"
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
                  className="mt-1 min-h-10 w-full rounded-sm border border-cyan-300/18 bg-black/25 px-3 py-2 text-white placeholder-zinc-500 focus:border-cyan-300 focus:outline-none sm:min-h-12 sm:px-4 sm:py-3"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-black uppercase tracking-[0.12em] text-emerald-200">Data</label>
                  <input
                    type="date"
                    value={formData.capturedDate}
                    onChange={(e) => setFormData({ ...formData, capturedDate: e.target.value })}
                    className="mt-1 min-h-10 w-full rounded-sm border border-cyan-300/18 bg-black/25 px-3 py-2 text-white placeholder-zinc-500 focus:border-cyan-300 focus:outline-none sm:min-h-12 sm:px-4 sm:py-3"
                  />
                </div>
                <div>
                  <label className="text-sm font-black uppercase tracking-[0.12em] text-emerald-200">Hora</label>
                  <input
                    type="time"
                    value={formData.capturedTime}
                    onChange={(e) => setFormData({ ...formData, capturedTime: e.target.value })}
                    className="mt-1 min-h-10 w-full rounded-sm border border-cyan-300/18 bg-black/25 px-3 py-2 text-white placeholder-zinc-500 focus:border-cyan-300 focus:outline-none sm:min-h-12 sm:px-4 sm:py-3"
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
                  className="mt-1 min-h-10 w-full rounded-sm border border-cyan-300/18 bg-black/25 px-3 py-2 text-white file:cursor-pointer file:rounded-sm file:border-0 file:bg-emerald-600 file:px-3 file:py-1 file:text-white hover:file:bg-emerald-700 focus:border-cyan-300 focus:outline-none sm:min-h-12 sm:px-4 sm:py-3 sm:file:py-1.5"
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
                  className="mt-1 h-full min-h-0 w-full resize-none rounded-sm border border-cyan-300/18 bg-black/25 px-3 py-2 text-white placeholder-zinc-500 focus:border-cyan-300 focus:outline-none sm:px-4 sm:py-3"
                />
              </div>

              <div className="hidden">
                <button
                  onClick={saveCapture}
                  className="inline-flex min-h-[68px] w-full items-center justify-center rounded-md border border-emerald-300/60 bg-emerald-500/24 px-4 py-4 text-center text-base font-black text-emerald-50 shadow-[0_0_24px_rgba(16,185,129,0.16),inset_0_1px_0_rgba(255,255,255,0.08)] transition hover:bg-emerald-500/32 sm:min-h-[72px]"
                >
                  Confirmar captura aqui
                </button>
                <button
                  onClick={cancelCapture}
                  className="inline-flex min-h-[68px] w-full items-center justify-center rounded-md border border-red-400/65 bg-red-500/22 px-4 py-4 text-center text-base font-black text-red-50 shadow-[0_0_24px_rgba(239,68,68,0.12),inset_0_1px_0_rgba(255,255,255,0.08)] transition hover:bg-red-500/30 sm:min-h-[72px]"
                >
                  Cancelar
                </button>
              </div>
            </div>
            <div className="grid shrink-0 grid-cols-1 gap-3 border-t border-white/10 bg-[#020a14]/98 p-4 pb-[calc(16px+env(safe-area-inset-bottom))] sm:grid-cols-2 sm:p-4">
              <button
                onClick={saveCapture}
                className="inline-flex min-h-[58px] w-full items-center justify-center rounded-md border border-emerald-300/60 bg-emerald-500/24 px-4 py-3 text-center text-base font-black text-emerald-50 shadow-[0_0_24px_rgba(16,185,129,0.16),inset_0_1px_0_rgba(255,255,255,0.08)] transition hover:bg-emerald-500/32 sm:min-h-[72px] sm:py-4"
              >
                Confirmar captura aqui
              </button>
              <button
                onClick={cancelCapture}
                className="inline-flex min-h-[58px] w-full items-center justify-center rounded-md border border-red-400/65 bg-red-500/22 px-4 py-3 text-center text-base font-black text-red-50 shadow-[0_0_24px_rgba(239,68,68,0.12),inset_0_1px_0_rgba(255,255,255,0.08)] transition hover:bg-red-500/30 sm:min-h-[72px] sm:py-4"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {pendingPlace && (
        <div className="fixed inset-0 z-[3000] bg-black/80">
          <div
            className="fixed bottom-2 left-1/2 top-2 flex w-[calc(100vw-16px)] max-w-[640px] -translate-x-1/2 flex-col overflow-hidden rounded-md border border-cyan-300/18 bg-[#020a14]/97 text-white shadow-[0_24px_80px_rgba(0,0,0,0.62),0_0_34px_rgba(34,211,238,0.18)] backdrop-blur-xl sm:bottom-6 sm:top-6"
            onClick={stopPanelEvent}
            onPointerDown={stopPanelEvent}
          >
            <button
              onClick={cancelPersonalPlace}
              className="hidden"
              aria-label="Fechar meu lugar"
            >
              ×
            </button>
            <div className="shrink-0 border-b border-white/10 p-3 sm:p-5">
              <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3 sm:grid-cols-[minmax(0,1fr)_auto_auto]">
              <div className="min-w-0">
                <p className="text-[11px] font-black uppercase tracking-[0.22em] text-emerald-200">Meus Lugares</p>
                <h2 className="mt-1 text-3xl font-black leading-none text-white">Meu lugar</h2>
              </div>
              <div className="hidden sm:block">
                <CoordinatesBadge lat={pendingPlace.lat} lng={pendingPlace.lng} precision={8} />
              </div>
              <button
                onClick={cancelPersonalPlace}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md border border-emerald-300/45 bg-black/70 text-2xl font-black text-white shadow-[0_0_18px_rgba(16,185,129,0.22)] backdrop-blur-md transition hover:bg-black/85 sm:h-12 sm:w-12"
                aria-label="Fechar meu lugar"
              >
                ×
              </button>
              </div>
            </div>
            <p className="shrink-0 px-4 pt-3 text-center text-xs font-black uppercase tracking-[0.14em] text-cyan-200/70 sm:px-5 sm:pt-4">
              Privado por padrão
            </p>

            <div className="grid min-h-0 flex-1 grid-rows-[auto_minmax(0,1fr)_auto] gap-3 overflow-hidden p-3 sm:gap-4 sm:p-5">
              <div>
                <label className="text-sm font-black uppercase tracking-[0.12em] text-emerald-200">Nome</label>
                <input
                  type="text"
                  placeholder="Ex: Canal bom de robalo"
                  value={placeFormData.name}
                  onChange={(e) => setPlaceFormData({ ...placeFormData, name: e.target.value })}
                  className="mt-1 min-h-10 w-full rounded-sm border border-cyan-300/18 bg-black/25 px-3 py-2 text-white placeholder-zinc-500 focus:border-cyan-300 focus:outline-none sm:min-h-12 sm:px-4 sm:py-3"
                />
              </div>

              <div>
                <label className="text-sm font-black uppercase tracking-[0.12em] text-emerald-200">Observação</label>
                <textarea
                  placeholder="Notas opcionais sobre o lugar..."
                  value={placeFormData.note}
                  onChange={(e) => setPlaceFormData({ ...placeFormData, note: e.target.value })}
                  className="mt-1 h-full min-h-0 w-full resize-none rounded-sm border border-cyan-300/18 bg-black/25 px-3 py-2 text-white placeholder-zinc-500 focus:border-cyan-300 focus:outline-none sm:px-4 sm:py-3"
                />
              </div>

              <div className="rounded-sm border border-emerald-300/15 bg-emerald-300/[0.05] p-4 text-xs font-bold leading-relaxed text-zinc-300">
                Este lugar fica salvo apenas para você. Compartilhamento entra depois sem mudar seus pontos atuais.
              </div>

              <div className="hidden">
                <button
                  onClick={savePersonalPlace}
                  className="inline-flex min-h-[68px] w-full items-center justify-center rounded-md border border-emerald-300/60 bg-emerald-500/24 px-4 py-4 text-center text-base font-black text-emerald-50 shadow-[0_0_24px_rgba(16,185,129,0.16),inset_0_1px_0_rgba(255,255,255,0.08)] transition hover:bg-emerald-500/32 sm:min-h-[72px]"
                >
                  Confirmar aqui
                </button>
                <button
                  onClick={cancelPersonalPlace}
                  className="inline-flex min-h-[68px] w-full items-center justify-center rounded-md border border-red-400/65 bg-red-500/22 px-4 py-4 text-center text-base font-black text-red-50 shadow-[0_0_24px_rgba(239,68,68,0.12),inset_0_1px_0_rgba(255,255,255,0.08)] transition hover:bg-red-500/30 sm:min-h-[72px]"
                >
                  Cancelar
                </button>
              </div>
            </div>
            <div className="grid shrink-0 grid-cols-2 gap-3 border-t border-white/10 bg-[#020a14]/98 p-3 sm:p-4">
              <button
                onClick={savePersonalPlace}
                className="inline-flex min-h-[68px] w-full items-center justify-center rounded-md border border-emerald-300/60 bg-emerald-500/24 px-4 py-4 text-center text-base font-black text-emerald-50 shadow-[0_0_24px_rgba(16,185,129,0.16),inset_0_1px_0_rgba(255,255,255,0.08)] transition hover:bg-emerald-500/32 sm:min-h-[72px]"
              >
                Confirmar aqui
              </button>
              <button
                onClick={cancelPersonalPlace}
                className="inline-flex min-h-[68px] w-full items-center justify-center rounded-md border border-red-400/65 bg-red-500/22 px-4 py-4 text-center text-base font-black text-red-50 shadow-[0_0_24px_rgba(239,68,68,0.12),inset_0_1px_0_rgba(255,255,255,0.08)] transition hover:bg-red-500/30 sm:min-h-[72px]"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedLocation && (
        <div
          className="map-control-overlay fixed bottom-2 left-1/2 top-2 z-[7000] w-[calc(100vw-16px)] max-w-[900px] -translate-x-1/2 sm:bottom-6 sm:top-6 sm:w-[calc(100vw-24px)]"
        >
          {(() => {
            const fishCastScore = calculateFishCastScore(selectedLocation.conditions);
            const conditionRows = getSpotConditionRows(selectedLocation.conditions);
            const selectedPersonalPlace = selectedLocation.personalPlaceId
              ? personalPlaces.find((item) => item.id === selectedLocation.personalPlaceId)
              : null;
            const selectedPersonalPlaceCaptures = selectedLocation.personalPlaceId
              ? getCapturesForPlace(selectedLocation.personalPlaceId)
              : [];

            return (
              <div
                className={`relative flex w-full flex-col overflow-hidden rounded-md border border-cyan-300/18 bg-[#020a14]/97 p-3 text-left text-white shadow-[0_24px_70px_rgba(0,0,0,0.58),0_0_34px_rgba(34,211,238,0.18)] backdrop-blur-xl sm:p-5 ${
                  selectedLocation.personalPlaceId ? "" : "cursor-pointer"
                } ${
                  selectedLocation.personalPlaceId
                    ? "h-[calc(100dvh-16px)] max-h-[calc(100dvh-16px)] sm:h-[calc(100vh-48px)] sm:max-h-[calc(100vh-48px)]"
                    : "h-full max-h-full"
                }`}
                onClick={(event) => {
                  if (selectedLocation.personalPlaceId) {
                    event.stopPropagation();
                    return;
                  }

                  setSelectedLocation(null);
                }}
                onPointerDown={selectedLocation.personalPlaceId ? stopPanelEvent : undefined}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (!selectedLocation.personalPlaceId && (e.key === "Enter" || e.key === " ")) {
                    setSelectedLocation(null);
                  }
                }}
              >
                <div className="mb-2 shrink-0 border-b border-white/10 pb-2 sm:mb-5 sm:pb-4">
                    <div className={`grid items-start gap-3 ${selectedLocation.personalPlaceId ? "grid-cols-[minmax(0,1fr)_auto_auto]" : "grid-cols-[minmax(0,1fr)_auto]"}`}>
                    <div className="min-w-0">
                      <p className="text-[11px] font-black uppercase tracking-[0.22em] text-emerald-200">Detalhe do lugar</p>
                      <h2 className="mt-1 text-3xl font-black leading-none text-white sm:text-5xl">{selectedLocation.name}</h2>
                    </div>
                    <div className="flex shrink-0 flex-col items-start gap-2 sm:items-end">
                      <CoordinatesBadge lat={selectedLocation.lat} lng={selectedLocation.lng} />
                      {selectedLocation.visibility === "private" && (
                        <span className="rounded-md border border-cyan-200/20 bg-cyan-300/12 px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-cyan-100">
                          Privado
                        </span>
                      )}
                    </div>
                    {selectedLocation.personalPlaceId && (
                      <button
                        onClick={() => {
                          setSelectedLocation(null);
                          setShareOptionsCaptureId(null);
                        }}
                        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md border border-emerald-300/45 bg-black/70 text-2xl font-black text-white shadow-[0_0_18px_rgba(16,185,129,0.22)] backdrop-blur-md transition hover:bg-black/85 sm:h-12 sm:w-12"
                        aria-label="Fechar meu lugar"
                      >
                        ×
                      </button>
                    )}
                  </div>
                </div>

                {selectedLocation.note && (
                  <p className="mb-2 shrink-0 rounded-sm border border-emerald-300/15 bg-emerald-300/[0.05] p-3 text-sm font-bold leading-relaxed text-zinc-200 sm:mb-4">
                    {selectedLocation.note}
                  </p>
                )}

                <VouPescarScoreGauge
                  score={fishCastScore.value}
                  partial={fishCastScore.partial}
                  compactMobile={Boolean(selectedLocation.personalPlaceId)}
                />

                <div className={`mb-1.5 rounded-md border border-emerald-300/25 bg-[linear-gradient(135deg,rgba(6,78,59,0.34),rgba(2,6,23,0.44))] p-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] sm:mb-4 sm:p-4 ${!selectedLocation.personalPlaceId || selectedPersonalPlaceCaptures.length === 0 ? "flex min-h-0 flex-1 flex-col" : "shrink-0"}`}>
                  <h3 className="mb-1.5 flex items-center gap-2 border-b border-emerald-300/18 pb-1 text-[11px] font-black uppercase tracking-[0.12em] text-emerald-200 sm:mb-3 sm:pb-2 sm:text-base sm:tracking-[0.18em]">
                    <span>☁</span>
                    Condições atuais
                  </h3>
                  <div className={`grid grid-cols-3 gap-1 sm:grid-cols-2 sm:gap-2.5 lg:grid-cols-3 ${!selectedLocation.personalPlaceId || selectedPersonalPlaceCaptures.length === 0 ? "min-h-0 flex-1 auto-rows-fr" : ""}`}>
                    {conditionRows.map((condition) => (
                      <div
                        key={condition.label}
                        className="grid grid-cols-[24px_1fr] items-center gap-1.5 rounded-sm border border-emerald-200/14 bg-black/28 p-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] sm:grid-cols-[52px_1fr] sm:gap-3 sm:p-4"
                      >
                        <div className="flex h-6 w-6 items-center justify-center rounded-full border border-cyan-300/30 bg-cyan-300/10 text-sm sm:h-12 sm:w-12 sm:text-3xl">
                          {condition.icon}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-[8px] font-black uppercase tracking-[0.06em] text-emerald-200 sm:text-xs sm:tracking-[0.16em]">
                            {condition.label}
                          </p>
                          <p className="truncate text-base font-black leading-tight text-white sm:mt-1 sm:text-2xl">{condition.value}</p>
                          <p className="hidden sm:mt-1 sm:line-clamp-2 sm:block sm:text-xs sm:font-bold sm:leading-snug sm:text-zinc-300">
                            {condition.description}
                          </p>
                        </div>
                        <span className="col-span-2 max-w-full justify-self-start truncate rounded-full bg-emerald-400/18 px-1.5 py-0.5 text-[8px] font-black uppercase tracking-[0.04em] text-lime-200 sm:px-3 sm:py-1 sm:text-[10px] sm:tracking-[0.08em]">
                          {condition.badgeIcon} {condition.badge}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {selectedLocation.personalPlaceId && (() => {
                  const place = selectedPersonalPlace;
                  const placeCaptures = selectedPersonalPlaceCaptures;

                  if (!place) {
                    return null;
                  }

                  return (
                    <div className="flex min-h-0 flex-1 flex-col gap-2 sm:gap-3">
                      <div className={`min-h-0 ${placeCaptures.length >= 4 ? "max-h-[clamp(252px,31vh,288px)] overflow-hidden" : "overflow-visible"}`}>
                        {placeCaptures.length === 0 ? (
                          <p className="text-sm font-bold text-zinc-400">
                            Nenhuma captura vinculada ainda.
                          </p>
                        ) : (
                          <div className={`space-y-2 pr-1 ${placeCaptures.length >= 4 ? "h-full overflow-y-auto" : "overflow-visible"}`}>
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
                                  <p className="mt-2 truncate text-xs font-black text-cyan-100/85">
                                    {capture.size ? `${capture.size} cm` : "Tam. --"} • {capture.weight ? `${capture.weight} kg` : "Peso --"}
                                  </p>
                                  <p className="mt-1 truncate text-xs font-bold text-zinc-400">
                                    {formatCaptureDate(capture.capturedAt)}
                                  </p>
                                </div>
                              </article>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="mt-auto grid shrink-0 grid-cols-2 gap-3 border-t border-white/10 bg-[#020a14]/98 pt-3 pb-[calc(18px+env(safe-area-inset-bottom))] sm:pb-0">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            addCaptureAtPersonalPlace(place);
                          }}
                          className="inline-flex min-h-[68px] w-full items-center justify-center gap-3 rounded-md border border-emerald-300/60 bg-emerald-500/24 px-4 py-4 text-base font-black text-emerald-50 shadow-[0_0_24px_rgba(16,185,129,0.16),inset_0_1px_0_rgba(255,255,255,0.08)] transition hover:bg-emerald-500/32 sm:min-h-[72px] sm:px-6 sm:text-lg"
                        >
                          <svg aria-hidden="true" viewBox="0 0 24 24" className="h-6 w-6 shrink-0" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2">
                            <path d="M12 5v14" />
                            <path d="M5 12h14" />
                          </svg>
                          <span>Captura</span>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deletePersonalPlace(selectedLocation.personalPlaceId as number);
                          }}
                          className="inline-flex min-h-[68px] w-full items-center justify-center gap-3 rounded-md border border-red-400/65 bg-red-500/22 px-4 py-4 text-base font-black text-red-50 shadow-[0_0_24px_rgba(239,68,68,0.12),inset_0_1px_0_rgba(255,255,255,0.08)] transition hover:bg-red-500/30 sm:min-h-[72px] sm:px-6 sm:text-lg"
                        >
                          <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2">
                            <path d="M3 6h18" />
                            <path d="M8 6V4h8v2" />
                            <path d="M19 6l-1 14H6L5 6" />
                            <path d="M10 11v5" />
                            <path d="M14 11v5" />
                          </svg>
                          <span>Apagar Lugar</span>
                        </button>
                      </div>
                    </div>
                  );
                })()}
              </div>
            );
          })()}
        </div>
      )}

      {selectedCaptureSpot && (
        <div
          className="map-control-overlay fixed left-1/2 top-2 z-[7000] w-[calc(100vw-16px)] max-w-[900px] -translate-x-1/2 sm:top-6 sm:w-[calc(100vw-24px)]"
          onClick={stopPanelEvent}
          onPointerDown={stopPanelEvent}
        >
          {(() => {
            const spotConditions = getConditionsForLocation(
              selectedCaptureSpot.lat,
              selectedCaptureSpot.lng
            );
            const fishCastScore = calculateFishCastScore(spotConditions);
            const conditionRows = getSpotConditionRows(spotConditions);
            const largestFish = getLargestCaptureSizeValue(selectedCaptureSpot.captures);
            const lastCapture = getLastSpotCaptureDate(selectedCaptureSpot.captures);

            return (
              <div className="flex h-[calc(100dvh-16px)] max-h-[calc(100dvh-16px)] w-full flex-col overflow-hidden rounded-md border border-cyan-300/18 bg-[#020a14]/97 p-3 text-white shadow-[0_24px_70px_rgba(0,0,0,0.62),0_0_34px_rgba(34,211,238,0.18)] backdrop-blur-xl sm:h-[calc(100vh-48px)] sm:max-h-[calc(100vh-48px)] sm:p-5">
                <div className="mb-1.5 shrink-0 border-b border-white/10 pb-1.5 sm:mb-5 sm:pb-4">
                    <div className="grid grid-cols-[minmax(0,1fr)_auto_auto] items-start gap-3">
                    <div className="min-w-0">
                      <p className="text-[11px] font-black uppercase tracking-[0.22em] text-emerald-200">
                        Detalhe do ponto
                      </p>
                      <h2 className="mt-1 text-3xl font-black leading-none text-white sm:text-5xl">
                        Capturas
                      </h2>
                    </div>
                    <CoordinatesBadge lat={selectedCaptureSpot.lat} lng={selectedCaptureSpot.lng} />
                    <button
                      onClick={() => {
                        setSelectedCaptureSpot(null);
                        setShareOptionsCaptureId(null);
                      }}
                      className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md border border-emerald-300/35 bg-black/65 text-2xl font-black text-white shadow-[0_0_18px_rgba(16,185,129,0.18)] transition hover:bg-black/80"
                      aria-label="Fechar spot de captura"
                    >
                      ×
                    </button>
                  </div>
                </div>

                <VouPescarScoreGauge score={fishCastScore.value} partial={fishCastScore.partial} compactMobile />

                <div className="mb-1.5 shrink-0 rounded-md border border-emerald-300/25 bg-[linear-gradient(135deg,rgba(6,78,59,0.34),rgba(2,6,23,0.44))] p-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] sm:mb-4 sm:p-4">
                  <h3 className="mb-1.5 flex items-center gap-2 border-b border-emerald-300/18 pb-1 text-[11px] font-black uppercase tracking-[0.12em] text-emerald-200 sm:mb-3 sm:pb-2 sm:text-base sm:tracking-[0.18em]">
                    <span>☁</span>
                    Condições atuais
                  </h3>
                  <div className="grid grid-cols-3 gap-1 sm:grid-cols-2 sm:gap-2.5 lg:grid-cols-3">
                    {conditionRows.map((condition) => (
                      <div
                        key={condition.label}
                        className="grid grid-cols-[24px_1fr] items-center gap-1.5 rounded-sm border border-emerald-200/14 bg-black/28 p-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] sm:grid-cols-[52px_1fr] sm:gap-3 sm:p-4"
                      >
                        <div className="flex h-6 w-6 items-center justify-center rounded-full border border-cyan-300/30 bg-cyan-300/10 text-sm sm:h-12 sm:w-12 sm:text-3xl">
                          {condition.icon}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-[8px] font-black uppercase tracking-[0.06em] text-emerald-200 sm:text-xs sm:tracking-[0.16em]">
                            {condition.label}
                          </p>
                          <p className="truncate text-base font-black leading-tight text-white sm:mt-1 sm:text-2xl">{condition.value}</p>
                          <p className="hidden sm:mt-1 sm:line-clamp-2 sm:block sm:text-xs sm:font-bold sm:leading-snug sm:text-zinc-300">
                            {condition.description}
                          </p>
                        </div>
                        <span className="col-span-2 max-w-full justify-self-start truncate rounded-full bg-emerald-400/18 px-1.5 py-0.5 text-[8px] font-black uppercase tracking-[0.04em] text-lime-200 sm:px-3 sm:py-1 sm:text-[10px] sm:tracking-[0.08em]">
                          {condition.badgeIcon} {condition.badge}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex min-h-0 flex-1 flex-col gap-2 sm:gap-3">
                  <div className={`flex min-h-0 flex-1 flex-col rounded-md border border-yellow-300/20 bg-black/25 p-2 sm:p-3 ${selectedCaptureSpot.captures.length >= 4 ? "max-h-[clamp(322px,36vh,380px)] overflow-hidden" : ""}`}>
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

                    <div className={`mt-2 min-h-0 space-y-2 pr-1 sm:mt-3 ${selectedCaptureSpot.captures.length >= 4 ? "max-h-[clamp(232px,28vh,288px)] overflow-y-auto" : "overflow-visible"}`}>
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
                                  <p className="mt-2 truncate text-xs font-black text-cyan-100/85">
                                    {capture.size ? `${capture.size} cm` : "Tam. --"} • {capture.weight ? `${capture.weight} kg` : "Peso --"}
                                  </p>
                                  <p className="mt-1 truncate text-xs font-bold text-zinc-400">
                                    {formatCaptureDate(capture.capturedAt)}
                                  </p>
                                </div>
                              </div>

                            </div>
                          </article>
                        );
                      })}
                    </div>
                  </div>

                  <div className="mt-auto grid shrink-0 grid-cols-2 gap-3 border-t border-white/10 bg-[#020a14]/98 pt-3 pb-[calc(18px+env(safe-area-inset-bottom))] sm:pb-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setPendingCapture({
                          lat: selectedCaptureSpot.lat,
                          lng: selectedCaptureSpot.lng,
                          placeId: null,
                        });
                        setSelectedCaptureSpot(null);
                        setCaptureMode(false);
                        setPlaceMode(false);
                      }}
                      className="inline-flex min-h-[68px] w-full items-center justify-center gap-3 rounded-md border border-emerald-300/60 bg-emerald-500/24 px-4 py-4 text-base font-black text-emerald-50 shadow-[0_0_24px_rgba(16,185,129,0.16),inset_0_1px_0_rgba(255,255,255,0.08)] transition hover:bg-emerald-500/32 sm:min-h-[72px] sm:px-6 sm:text-lg"
                    >
                      <svg aria-hidden="true" viewBox="0 0 24 24" className="h-6 w-6 shrink-0" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2">
                        <path d="M12 5v14" />
                        <path d="M5 12h14" />
                      </svg>
                      <span>Captura</span>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteCaptureSpot(selectedCaptureSpot);
                      }}
                      className="inline-flex min-h-[68px] w-full items-center justify-center gap-3 rounded-md border border-red-400/65 bg-red-500/22 px-4 py-4 text-base font-black text-red-50 shadow-[0_0_24px_rgba(239,68,68,0.12),inset_0_1px_0_rgba(255,255,255,0.08)] transition hover:bg-red-500/30 sm:min-h-[72px] sm:px-6 sm:text-lg"
                    >
                      <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2">
                        <path d="M3 6h18" />
                        <path d="M8 6V4h8v2" />
                        <path d="M19 6l-1 14H6L5 6" />
                        <path d="M10 11v5" />
                        <path d="M14 11v5" />
                      </svg>
                      <span>Apagar Spot</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {selectedCapture && (
        <div
          className="map-control-overlay fixed bottom-2 left-1/2 top-2 z-[7000] w-[calc(100vw-16px)] max-w-[460px] -translate-x-1/2 sm:bottom-4 sm:top-[96px] sm:w-[calc(100vw-24px)]"
          onClick={stopPanelEvent}
          onPointerDown={stopPanelEvent}
        >
          <div className="flex h-full flex-col overflow-hidden rounded-md border border-cyan-300/18 bg-[#020a14]/97 text-white shadow-[0_24px_70px_rgba(0,0,0,0.62),0_0_34px_rgba(34,211,238,0.18)] backdrop-blur-xl">
            <button
              onClick={() => {
                setSelectedCapture(null);
                setShareOptionsCaptureId(null);
              }}
              className="hidden"
              aria-label="Fechar captura"
            >
              ×
            </button>
            <div className="hidden">
              <CoordinatesBadge lat={selectedCapture.lat} lng={selectedCapture.lng} />
            </div>

            <div className="flex h-full min-h-0 flex-col gap-2 p-3 sm:gap-2.5 sm:p-4">
              <div className="grid shrink-0 grid-cols-[minmax(0,1fr)_auto] items-start gap-2 border-b border-white/10 pb-2 sm:grid-cols-[minmax(0,1fr)_auto_auto] sm:gap-3">
                <div className="min-w-0">
                  <p className="text-[11px] font-black uppercase tracking-[0.22em] text-emerald-200">Minha captura</p>
                  <h2 className="mt-1 line-clamp-1 text-2xl font-black leading-tight text-white sm:text-3xl">
                    {selectedCapture.species || "Espécie não informada"}
                  </h2>
                </div>
                <div className="hidden sm:block">
                  <CoordinatesBadge lat={selectedCapture.lat} lng={selectedCapture.lng} />
                </div>
                <button
                  onClick={() => {
                    setSelectedCapture(null);
                    setShareOptionsCaptureId(null);
                  }}
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md border border-emerald-300/45 bg-black/70 text-2xl font-black text-white shadow-[0_0_18px_rgba(16,185,129,0.22)] backdrop-blur-md transition hover:bg-black/85 sm:h-12 sm:w-12"
                  aria-label="Fechar captura"
                >
                  ×
                </button>
              </div>
              <div className="min-h-0 flex-1 space-y-1.5 overflow-hidden sm:space-y-2.5">
              <div
                className={`flex items-center justify-center overflow-hidden rounded-sm border border-white/10 bg-[#020617] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] ${
                  shareOptionsCaptureId === selectedCapture.id
                    ? "h-[clamp(72px,12vh,112px)] sm:h-[clamp(160px,26vh,260px)]"
                    : "h-[clamp(108px,20vh,188px)] sm:h-[clamp(180px,32vh,320px)]"
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

              <div className="hidden border-b border-white/10 pb-2 pr-10 sm:block">
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
                <div className="min-h-11 rounded-sm border border-emerald-300/15 bg-black/25 p-1.5 sm:min-h-16 sm:p-2.5">
                  <p className={infoLabelClass}>Peso</p>
                  <p className="mt-0.5 truncate text-xs font-black text-white sm:mt-1 sm:text-sm">{selectedCapture.weight ? `${selectedCapture.weight} kg` : "--"}</p>
                </div>
                <div className="min-h-11 rounded-sm border border-emerald-300/15 bg-black/25 p-1.5 sm:min-h-16 sm:p-2.5">
                  <p className={infoLabelClass}>Tamanho</p>
                  <p className="mt-0.5 truncate text-xs font-black text-white sm:mt-1 sm:text-sm">{selectedCapture.size ? `${selectedCapture.size} cm` : "--"}</p>
                </div>
                <div className="min-h-11 rounded-sm border border-emerald-300/15 bg-black/25 p-1.5 sm:min-h-16 sm:p-2.5">
                  <p className={infoLabelClass}>Isca</p>
                  <p className="mt-0.5 truncate text-xs font-black text-white sm:mt-1 sm:text-sm">{selectedCapture.bait || "--"}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-2">
                <div className="min-h-11 rounded-sm border border-emerald-300/15 bg-black/25 p-1.5 sm:min-h-16 sm:p-2.5">
                  <p className={infoLabelClass}>Data/hora</p>
                  <p className="mt-0.5 text-xs font-black leading-snug text-white sm:mt-1 sm:text-sm">{formatCaptureDate(selectedCapture.capturedAt)}</p>
                </div>
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-400">Observações</p>
                <p className="mt-1 line-clamp-2 min-h-9 overflow-hidden rounded-sm border border-emerald-300/15 bg-black/25 p-1.5 text-xs leading-snug text-zinc-200 sm:min-h-14 sm:p-2.5 sm:text-sm">
                  {selectedCapture.comment || "Sem observações adicionadas."}
                </p>
              </div>

              </div>

              <div className="grid shrink-0 grid-cols-2 gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShareOptionsCaptureId((current) =>
                      current === selectedCapture.id ? null : selectedCapture.id
                    );
                  }}
                  className="flex min-h-[52px] w-full items-center justify-center rounded-md border border-emerald-300/35 bg-emerald-400/18 px-3 py-2 text-center text-sm font-black leading-tight text-emerald-100 shadow-[0_0_24px_rgba(16,185,129,0.14)] transition hover:bg-emerald-400/25 sm:min-h-16 sm:rounded-xl sm:px-5 sm:py-4 sm:text-base"
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
                  className="flex min-h-[52px] w-full items-center justify-center rounded-md border border-red-300/20 bg-red-500/15 px-3 py-2 text-center text-sm font-black leading-tight text-red-100 transition hover:bg-red-500/25 sm:min-h-16 sm:rounded-xl sm:px-5 sm:py-4 sm:text-base"
                >
                  Apagar captura
                </button>
              </div>
              {shareOptionsCaptureId === selectedCapture.id && (
                <div className="grid min-w-0 shrink-0 grid-cols-2 gap-2 rounded-md border border-yellow-300/20 bg-yellow-300/5 p-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      void shareCapture(selectedCapture, "complete");
                    }}
                    className="flex min-h-[54px] w-full items-center justify-center whitespace-normal rounded-md border border-emerald-300/25 bg-emerald-400/15 px-2 py-2 text-center text-[13px] font-black leading-tight text-emerald-100 transition hover:bg-emerald-400/25 sm:min-h-16 sm:rounded-xl sm:px-5 sm:py-4 sm:text-base"
                  >
                    Compartilhar completo
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      void shareCapture(selectedCapture, "secret");
                    }}
                    className="flex min-h-[54px] w-full items-center justify-center whitespace-normal rounded-md border border-cyan-300/25 bg-cyan-400/15 px-2 py-2 text-center text-[13px] font-black leading-tight text-cyan-100 transition hover:bg-cyan-400/25 sm:min-h-16 sm:rounded-xl sm:px-5 sm:py-4 sm:text-base"
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
          center={paranaCenter}
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
          <CenterButton personalPlaces={personalPlaces} hidden={popupPriorityOpen} />
          <HomeMapViewController personalPlaces={personalPlaces} />
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
            mapDismissBlocked={interactiveWindowOpen}
            interactionPanelOpen={capturesPanelOpen}
            onDismissActivePopup={() => {
              setSpotPopupOpen(false);
              setCapturePopupOpen(false);
              setSelectedCaptureSpot(null);
              setSelectedLocation(null);
              setSelectedCapture(null);
              setShareOptionsCaptureId(null);
            }}
            onDismissInteractionPanel={() => {
              setCapturesPanelOpen(false);
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

          <Pane
            name={USER_PLACE_MARKER_PANE}
            style={{ zIndex: USER_PLACE_MARKER_PANE_Z_INDEX }}
          >
            {pendingPlace && (
              <Marker
                key="pending-place"
                position={[pendingPlace.lat, pendingPlace.lng]}
                icon={createPersonalPlaceIcon(iconSize, 0)}
                interactive={false}
              />
            )}

            {personalPlaces.map((place) => (
              <Marker
                key={`personal-place-${place.id}`}
                position={[place.lat, place.lng]}
                icon={createPersonalPlaceIcon(iconSize, getCapturesForPlace(place.id).length)}
                eventHandlers={{
                  click: (event) => {
                    L.DomEvent.stopPropagation(event.originalEvent);
                    if (interactiveWindowOpen) {
                      return;
                    }
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
          </Pane>

          <Pane
            name={USER_CAPTURE_MARKER_PANE}
            style={{ zIndex: USER_CAPTURE_MARKER_PANE_Z_INDEX }}
          >
            {pendingCapture && (
              <Marker
                key="pending-capture"
                position={[pendingCapture.lat, pendingCapture.lng]}
                icon={createCaptureIcon(iconSize, 1)}
                interactive={false}
              />
            )}

            {getCaptureSpotMarkers().map((capture) => (
              <Marker
                key={`capture-${capture.id}`}
                position={[capture.lat, capture.lng]}
                icon={createCaptureIcon(iconSize, getCapturesForCaptureSpot(capture).length)}
                eventHandlers={{
                  click: (event) => {
                    L.DomEvent.stopPropagation(event.originalEvent);
                    if (interactiveWindowOpen) {
                      return;
                    }
                    ignoreNextMapClickRef.current = false;
                    openCaptureMarker(capture);
                  },
                }}
              />
            ))}
          </Pane>

          <Pane
            name={OFFICIAL_SPOT_MARKER_PANE}
            style={{ zIndex: OFFICIAL_SPOT_MARKER_PANE_Z_INDEX }}
          >
            {fishingSpots.map((spot) => (
              <Marker
                key={`spot-${spot.id}`}
                position={[spot.lat, spot.lng]}
                icon={createSpotIcon(OFFICIAL_SPOT_MARKER_ICON_SIZE)}
                zIndexOffset={OFFICIAL_SPOT_MARKER_Z_INDEX_OFFSET}
                eventHandlers={{
                  click: (event) => {
                    L.DomEvent.stopPropagation(event.originalEvent);
                    if (interactiveWindowOpen) {
                      return;
                    }
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
          </Pane>
        </MapContainer>
    </div>
  );
}


