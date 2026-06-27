"use client";

import {
  CircleMarker,
  MapContainer,
  Marker,
  Pane,
  Polygon,
  Polyline,
  TileLayer,
  Tooltip,
  WMSTileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet";

import L from "leaflet";

import { useEffect, useRef, useState } from "react";

import OfficialFreePanelPreview from "@/components/OfficialFreePanelPreview";
import AddCapturePanel from "@/components/AddCapturePanel";
import AddPlacePanel from "@/components/AddPlacePanel";
import CaptureDetailPanelPreview from "@/components/CaptureDetailPanelPreview";
import CaptureSharePanelPreview from "@/components/CaptureSharePanelPreview";
import CaptureSpotPanelPreview from "@/components/CaptureSpotPanelPreview";
import PlaceCapturesPanelPreview from "@/components/PlaceCapturesPanelPreview";
import MyCapturesPanelPreview, { type MyCapturesPanelCapture } from "@/components/MyCapturesPanelPreview";
import PremiumPanelPreview, { PreviewIcon, type PreviewIconName } from "@/components/PremiumPanelPreview";
import { previewCaptureShareImage } from "@/components/captures/sharing";
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
import { fishingSpots } from "@/data/fishingSpots";
import { getMockSpotForecastDays } from "@/data/spotForecast";

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

type OfficialFreeSpotDataPlace = {
  id: number | string;
  name: string;
  lat: number;
  lng: number;
  coordinatesText: string;
};

type FocusTarget = {
  id: number;
  lat: number;
  lng: number;
};

type HomeViewControlRef = React.MutableRefObject<{
  userInteracted: boolean;
  cancelScheduledView: (() => void) | null;
}>;

type MeasurementPoint = {
  id: number;
  lat: number;
  lng: number;
};

type PersonalPlaceFormData = {
  name: string;
  note: string;
};

const MAP_MIN_ZOOM_DESKTOP = 2;
const MAP_MIN_ZOOM_MOBILE = 1;
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
const NAUTICAL_DETAIL_MIN_ZOOM = 5;


const mapModes: { id: MapMode; label: string; iconName: PreviewIconName }[] = [
  { id: "map", label: "Mapa", iconName: "map" },
  { id: "satellite", label: "Satélite", iconName: "satellite" },
  { id: "nautical", label: "Náutico", iconName: "anchor" },
  { id: "night", label: "Noturno", iconName: "night" },
];

const MARKER_ICON_SIZE = 52;
const OFFICIAL_SPOT_MARKER_ICON_SIZE = 45;
const OFFICIAL_SPOT_MARKER_PANE = "official-spot-markers";
const OFFICIAL_SPOT_MARKER_PANE_Z_INDEX = 650;
const OFFICIAL_SPOT_MARKER_Z_INDEX_OFFSET = 1000;
const USER_CAPTURE_MARKER_PANE = "user-capture-markers";
const USER_CAPTURE_MARKER_PANE_Z_INDEX = 625;
const USER_PLACE_MARKER_PANE = "user-place-markers";
const USER_PLACE_MARKER_PANE_Z_INDEX = 610;
const MEASUREMENT_PANE = "measurement-layer";
const MEASUREMENT_PANE_Z_INDEX = 690;

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

function ZoomButtons({
  hidden,
  mapRef,
}: {
  hidden: boolean;
  mapRef: { current: L.Map | null };
}) {
  return (
    <div
      className={`fixed-ui-control zoom-button-overlay map-control-overlay fixed top-28 left-4 z-[2000] flex flex-col overflow-hidden rounded-3xl border border-cyan-500/25 bg-slate-950/85 shadow-[0_24px_80px_rgba(0,255,255,0.12)] transition ${
        hidden ? "pointer-events-none opacity-0" : "opacity-100"
      }`}
    >
      <button
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          mapRef.current?.zoomIn();
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
          mapRef.current?.zoomOut();
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
  mapRef,
}: {
  personalPlaces: PersonalPlace[];
  hidden: boolean;
  mapRef: { current: L.Map | null };
}) {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        e.preventDefault();
        const map = mapRef.current;

        if (!map) {
          return;
        }

        scheduleHomeMapView(map, personalPlaces, true);
      }}
      onPointerDown={(e) => e.stopPropagation()}
      aria-label="Centralizar mapa"
      title="Centralizar mapa"
      className={`fixed-ui-control map-control-overlay fixed top-[164px] right-4 z-[2000] flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-[#03110d]/70 text-xl font-black text-emerald-100/90 shadow-[0_14px_36px_rgba(0,0,0,0.34),0_0_16px_rgba(34,197,94,0.12)] backdrop-blur-md transition hover:border-emerald-200/30 hover:bg-[#062018]/85 active:scale-95 sm:top-[178px] ${
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
      className={`fixed-ui-control map-control-overlay fixed right-4 top-4 z-[2000] text-white transition ${
        hidden ? "pointer-events-none opacity-0" : "opacity-100"
      }`}
    >
      <div className="grid grid-cols-2 gap-2">
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
              className={`group relative flex h-[60px] w-[60px] flex-col items-center justify-center overflow-hidden rounded-[18px] border p-1.5 text-[8.5px] font-black uppercase leading-none tracking-[0.04em] outline-none backdrop-blur-xl transition duration-200 ease-out active:scale-95 sm:h-[72px] sm:w-[72px] sm:rounded-[20px] sm:text-[10px] ${
                active
                  ? "border-sky-300/90 bg-[radial-gradient(circle_at_50%_22%,rgba(0,132,255,0.28),transparent_42%),linear-gradient(145deg,rgba(5,22,42,0.96),rgba(1,9,19,0.98)_62%,rgba(4,18,34,0.94))] text-sky-400 shadow-[0_0_20px_rgba(56,189,248,0.56),0_0_42px_rgba(14,165,233,0.28),0_16px_42px_rgba(0,0,0,0.42),inset_0_1px_0_rgba(255,255,255,0.12),inset_0_0_18px_rgba(14,165,233,0.16)]"
                  : "border-slate-300/24 bg-[radial-gradient(circle_at_50%_0%,rgba(226,232,240,0.11),transparent_44%),linear-gradient(145deg,rgba(10,22,34,0.88),rgba(2,8,18,0.96)_64%,rgba(7,18,30,0.9))] text-slate-100/90 shadow-[0_14px_34px_rgba(0,0,0,0.42),inset_0_1px_0_rgba(255,255,255,0.12),inset_0_0_0_1px_rgba(255,255,255,0.035)] hover:border-slate-100/34 hover:bg-[radial-gradient(circle_at_50%_0%,rgba(226,232,240,0.15),transparent_44%),linear-gradient(145deg,rgba(13,29,44,0.92),rgba(2,8,18,0.98)_64%,rgba(9,22,36,0.94))]"
              }`}
              aria-pressed={active}
            >
              <span className="pointer-events-none absolute inset-x-3 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(226,232,240,0.45),transparent)]" />
              <PreviewIcon
                name={mapMode.iconName}
                className={`mb-0.5 h-[24px] w-[24px] sm:h-[29px] sm:w-[29px] ${
                  active
                    ? "text-sky-400 drop-shadow-[0_0_12px_rgba(56,189,248,0.9)]"
                    : "text-slate-100 drop-shadow-[0_0_8px_rgba(226,232,240,0.18)]"
                }`}
              />
              <span className="drop-shadow-[0_1px_2px_rgba(0,0,0,0.72)]">{mapMode.label}</span>
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
  onAddMeasurementPoint,
  onLocationClick,
  onZoomChange,
  measurementMode,
  mapDismissBlocked,
  onOtherPopupClose,
  ignoreNextMapClickRef,
  homeViewControlRef,
}: {
  captureMode: boolean;
  placeMode: boolean;
  onAddCapture: (lat: number, lng: number) => void;
  onAddPlace: (lat: number, lng: number) => void;
  onAddMeasurementPoint: (lat: number, lng: number) => void;
  onLocationClick: (lat: number, lng: number) => void;
  onZoomChange: (zoom: number) => void;
  measurementMode: boolean;
  mapDismissBlocked: boolean;
  onOtherPopupClose: () => void;
  ignoreNextMapClickRef: React.MutableRefObject<boolean>;
  homeViewControlRef: HomeViewControlRef;
}) {
  const isDraggingRef = useRef(false);

  function markUserMapInteraction() {
    homeViewControlRef.current.userInteracted = true;
    homeViewControlRef.current.cancelScheduledView?.();
    homeViewControlRef.current.cancelScheduledView = null;
  }

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
      markUserMapInteraction();
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

      if (mapDismissBlocked) {
        return;
      }

      if (measurementMode) {
        onAddMeasurementPoint(e.latlng.lat, e.latlng.lng);
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
    zoomstart() {
      markUserMapInteraction();
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

function MapMinZoomController({ minZoom }: { minZoom: number }) {
  const map = useMap();

  useEffect(() => {
    map.setMinZoom(minZoom);

    if (map.getZoom() < minZoom) {
      map.setZoom(minZoom);
    }
  }, [map, minZoom]);

  return null;
}

function MapFocusController({ target }: { target: FocusTarget | null }) {
  const map = useMap();

  useEffect(() => {
    if (!target) {
      return;
    }

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
      className="fixed-ui-control group relative flex h-[66px] w-[66px] appearance-none items-center justify-center overflow-visible rounded-[20px] border border-cyan-200/20 bg-[radial-gradient(circle_at_30%_18%,rgba(34,211,238,0.16),transparent_38%),linear-gradient(145deg,rgba(5,36,50,0.94),rgba(2,10,20,0.96)_62%,rgba(4,26,38,0.92))] p-2.5 leading-none shadow-[0_16px_42px_rgba(0,0,0,0.42),0_0_24px_rgba(34,211,238,0.12),inset_0_1px_0_rgba(255,255,255,0.1),inset_0_0_0_1px_rgba(103,232,249,0.045)] outline-none backdrop-blur-xl transition duration-200 ease-out hover:scale-[1.035] hover:border-cyan-200/38 hover:bg-[radial-gradient(circle_at_30%_18%,rgba(34,211,238,0.22),transparent_38%),linear-gradient(145deg,rgba(7,48,64,0.98),rgba(2,12,24,0.98)_62%,rgba(5,32,46,0.96))] hover:shadow-[0_18px_48px_rgba(0,0,0,0.46),0_0_34px_rgba(34,211,238,0.18),inset_0_1px_0_rgba(255,255,255,0.12),inset_0_0_0_1px_rgba(103,232,249,0.07)] focus-visible:ring-2 focus-visible:ring-cyan-200/70 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent active:scale-95 sm:h-[78px] sm:w-[78px] sm:rounded-[22px] sm:p-3"
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

function MeasurementControl({
  active,
  points,
  totalMeters,
  hidden,
  onToggle,
  onClear,
  onExit,
}: {
  active: boolean;
  points: MeasurementPoint[];
  totalMeters: number;
  hidden: boolean;
  onToggle: () => void;
  onClear: () => void;
  onExit: () => void;
}) {
  const segments = getMeasurementSegments(points);

  return (
    <>
      <div
      className={`map-control-overlay fixed left-4 top-[calc(42vh+150px)] z-[2000] w-[min(260px,calc(100vw-32px))] text-white transition ${
        hidden ? "pointer-events-none opacity-0" : "opacity-100"
      }`}
      onPointerDown={(event) => event.stopPropagation()}
      onClick={(event) => event.stopPropagation()}
    >
      <div className="flex flex-col items-start">
        <button
          type="button"
          onClick={onToggle}
          className="fixed-ui-control flex h-[60px] w-[60px] appearance-none items-center justify-center overflow-hidden bg-transparent p-0 leading-none outline-none transition active:scale-95 sm:h-[72px] sm:w-[72px]"
          aria-label={active ? "Sair da medição" : "Medir"}
          aria-pressed={active}
        >
          <img
            src="/icons/botao-regua-v3.png"
            alt=""
            draggable={false}
            className="max-h-full max-w-full select-none object-contain"
          />
        </button>
        <div className="mt-3.5" aria-hidden="true" />
      </div>

      </div>

      {active && !hidden && (
        <div
          className="measurement-panel-overlay map-control-overlay fixed bottom-[calc(env(safe-area-inset-bottom)+1rem)] left-1/2 z-[2100] w-[92vw] max-w-[360px] -translate-x-1/2 rounded-2xl border border-cyan-200/18 bg-[#020a14]/94 p-3 text-white shadow-[0_18px_50px_rgba(0,0,0,0.48),0_0_22px_rgba(34,211,238,0.1)] backdrop-blur-xl sm:bottom-auto sm:left-4 sm:top-[calc(42vh+232px)] sm:w-[260px] sm:translate-x-0"
          onPointerDown={(event) => event.stopPropagation()}
          onClick={(event) => event.stopPropagation()}
        >
          <div className="flex items-center justify-between gap-3">
            <span className="text-[10px] font-black uppercase tracking-[0.16em] text-cyan-100/76">
              Total
            </span>
            <strong className="text-base font-black text-white">
              {formatMeasurementDistance(totalMeters)}
            </strong>
          </div>

          <div className="mt-2 max-h-28 space-y-1 overflow-y-auto text-xs font-bold text-zinc-300">
            {segments.length === 0 ? (
              <p>Toque no mapa para iniciar.</p>
            ) : (
              segments.map((segment, index) => (
                <p key={`${segment.to.id}-${index}`}>
                  Ponto {points.findIndex((point) => point.id === segment.from.id) + 1} →{" "}
                  {points.findIndex((point) => point.id === segment.to.id) + 1}:{" "}
                  {formatMeasurementDistance(segment.distance)}
                </p>
              ))
            )}
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={onClear}
              className="min-h-12 rounded-xl border border-amber-300/30 bg-amber-300/10 px-3 text-sm font-black uppercase tracking-[0.04em] text-amber-100 transition hover:bg-amber-300/16 sm:min-h-10 sm:px-2 sm:text-[10px]"
            >
              🗑 Limpar
            </button>
            <button
              type="button"
              onClick={onExit}
              className="min-h-12 rounded-xl border border-red-300/28 bg-red-500/12 px-3 text-sm font-black uppercase tracking-[0.04em] text-red-100 transition hover:bg-red-500/18 sm:min-h-10 sm:px-2 sm:text-[10px]"
            >
              ❌ Sair
            </button>
          </div>
        </div>
      )}
    </>
  );
}

function MeasurementLayer({ points }: { points: MeasurementPoint[] }) {
  const positions = points.map((point) => [point.lat, point.lng] as [number, number]);

  return (
    <Pane name={MEASUREMENT_PANE} style={{ zIndex: MEASUREMENT_PANE_Z_INDEX }}>
      {positions.length > 1 && (
        <Polyline
          positions={positions}
          pathOptions={{
            color: "#38bdf8",
            opacity: 0.92,
            weight: 4,
          }}
        />
      )}

      {points.map((point, index) => (
        <CircleMarker
          key={point.id}
          center={[point.lat, point.lng]}
          radius={5}
          pathOptions={{
            color: "#e0f2fe",
            fillColor: "#38bdf8",
            fillOpacity: 0.95,
            opacity: 0.95,
            weight: 2,
          }}
        >
          <Tooltip direction="top" offset={[0, -6]} opacity={0.92} permanent>
            {index + 1}
          </Tooltip>
        </CircleMarker>
      ))}
    </Pane>
  );
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

function getMeasurementSegments(points: MeasurementPoint[]) {
  return points.slice(1).map((point, index) => {
    const previousPoint = points[index];

    return {
      from: previousPoint,
      to: point,
      distance: getDistanceMeters(previousPoint, point),
    };
  });
}

function getMeasurementTotalMeters(points: MeasurementPoint[]) {
  return getMeasurementSegments(points).reduce((total, segment) => total + segment.distance, 0);
}

function formatMeasurementDistance(distanceMeters: number) {
  if (distanceMeters >= 1000) {
    return `${(distanceMeters / 1000).toFixed(distanceMeters >= 10000 ? 1 : 2)} km`;
  }

  return `${Math.round(distanceMeters)} m`;
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

function HomeMapViewController({
  personalPlaces,
  homeViewControlRef,
}: {
  personalPlaces: PersonalPlace[];
  homeViewControlRef: HomeViewControlRef;
}) {
  const map = useMap();
  const initialFitDoneRef = useRef(false);

  useEffect(() => {
    if (initialFitDoneRef.current || homeViewControlRef.current.userInteracted) {
      return;
    }

    initialFitDoneRef.current = true;
    const cancelScheduledView = scheduleHomeMapView(map, personalPlaces, false);
    homeViewControlRef.current.cancelScheduledView = cancelScheduledView;

    return () => {
      cancelScheduledView();
      if (homeViewControlRef.current.cancelScheduledView === cancelScheduledView) {
        homeViewControlRef.current.cancelScheduledView = null;
      }
    };
  }, [homeViewControlRef, map, personalPlaces]);

  return null;
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
  const mapRef = useRef<L.Map | null>(null);
  const homeViewControlRef = useRef({
    userInteracted: false,
    cancelScheduledView: null as (() => void) | null,
  });
  const [premiumPreviewOpen, setPremiumPreviewOpen] = useState(false);
  const [premiumPreviewPlace, setPremiumPreviewPlace] = useState<OfficialFreeSpotDataPlace | null>(null);
  const [selectedForecastDayId, setSelectedForecastDayId] = useState("day-25");
  const [officialFreeSpotDataPlace, setOfficialFreeSpotDataPlace] = useState<OfficialFreeSpotDataPlace | null>(null);
  const [placeCapturesPreviewOpen, setPlaceCapturesPreviewOpen] = useState(false);
  const [placeCapturesPreviewPlaceId, setPlaceCapturesPreviewPlaceId] = useState<number | null>(null);
  const [returnToPlaceCapturesPreviewPlaceId, setReturnToPlaceCapturesPreviewPlaceId] = useState<number | null>(null);
  const [captureMode, setCaptureMode] = useState(false);
  const [placeMode, setPlaceMode] = useState(false);
  const [measurementMode, setMeasurementMode] = useState(false);
  const [measurementPoints, setMeasurementPoints] = useState<MeasurementPoint[]>([]);
  const [capturesPanelOpen, setCapturesPanelOpen] = useState(false);
  const [mapMode, setMapMode] = useState<MapMode>("map");
  const [zoom, setZoom] = useState(MAP_INITIAL_ZOOM);
  const [mapMinZoom, setMapMinZoom] = useState(MAP_MIN_ZOOM_DESKTOP);
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
  const [formData, setFormData] = useState(createEmptyFormData);
  const [placeFormData, setPlaceFormData] = useState(createEmptyPlaceFormData);
  const [pendingPlace, setPendingPlace] = useState<{ lat: number; lng: number } | null>(null);
  const [captures, setCaptures] = useState<Capture[]>(readStoredCaptures);
  const [placeCapturesPreviewPhotos, setPlaceCapturesPreviewPhotos] = useState<Record<number, string>>({});
  const [personalPlaces, setPersonalPlaces] = useState<PersonalPlace[]>(readStoredPersonalPlaces);
  const [focusTarget, setFocusTarget] = useState<FocusTarget | null>(null);
  const [storageFeedback, setStorageFeedback] = useState<string | null>(null);
  const [capturePhotoMigrationDone, setCapturePhotoMigrationDone] = useState(false);

  const iconSize = MARKER_ICON_SIZE;
  const measurementTotalMeters = getMeasurementTotalMeters(measurementPoints);
  const popupPriorityOpen =
    Boolean(selectedCapture) ||
    Boolean(selectedCaptureSpot) ||
    spotPopupOpen ||
    capturePopupOpen;
  const interactiveWindowOpen =
    Boolean(pendingCapture) ||
    Boolean(pendingPlace) ||
    capturesPanelOpen ||
    Boolean(selectedCapture) ||
    Boolean(selectedCaptureSpot);
  const showNauticalDetails = mapMode === "nautical" && zoom >= NAUTICAL_DETAIL_MIN_ZOOM;

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 767px)");

    function updateMapMinZoom() {
      setMapMinZoom(mediaQuery.matches ? MAP_MIN_ZOOM_MOBILE : MAP_MIN_ZOOM_DESKTOP);
    }

    updateMapMinZoom();
    mediaQuery.addEventListener("change", updateMapMinZoom);

    return () => {
      mediaQuery.removeEventListener("change", updateMapMinZoom);
    };
  }, []);

  useEffect(() => {
    function getEventElement(target: EventTarget | null) {
      if (target instanceof Element) {
        return target;
      }

      if (target instanceof Node) {
        return target.parentElement;
      }

      return null;
    }

    function isLeafletMapGesture(target: EventTarget | null) {
      return Boolean(getEventElement(target)?.closest(".leaflet-container"));
    }

    function preventInterfacePinch(event: TouchEvent) {
      if (event.touches.length > 1 && !isLeafletMapGesture(event.target)) {
        event.preventDefault();
      }
    }

    function preventInterfaceGesture(event: Event) {
      if (!isLeafletMapGesture(event.target)) {
        event.preventDefault();
      }
    }

    document.addEventListener("touchmove", preventInterfacePinch, { passive: false });
    document.addEventListener("gesturestart", preventInterfaceGesture);
    document.addEventListener("gesturechange", preventInterfaceGesture);
    document.addEventListener("gestureend", preventInterfaceGesture);

    return () => {
      document.removeEventListener("touchmove", preventInterfacePinch);
      document.removeEventListener("gesturestart", preventInterfaceGesture);
      document.removeEventListener("gesturechange", preventInterfaceGesture);
      document.removeEventListener("gestureend", preventInterfaceGesture);
    };
  }, []);

  function addMeasurementPoint(lat: number, lng: number) {
    setMeasurementPoints((currentPoints) => [
      ...currentPoints,
      {
        id: Date.now(),
        lat,
        lng,
      },
    ]);
  }

  function startMeasurement() {
    setMeasurementMode(true);
    setCaptureMode(false);
    setPlaceMode(false);
    setCapturesPanelOpen(false);
    setPendingCapture(null);
    setPendingPlace(null);
    setSelectedCapture(null);
    setSelectedCaptureSpot(null);
    setShareOptionsCaptureId(null);
    setSpotPopupOpen(false);
    setCapturePopupOpen(false);
  }

  function clearMeasurement() {
    setMeasurementPoints([]);
  }

  function exitMeasurement() {
    setMeasurementMode(false);
    setMeasurementPoints([]);
  }

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
    if (!placeCapturesPreviewOpen || !placeCapturesPreviewPlaceId) {
      return;
    }

    let active = true;
    const placeCapturesMissingPhotos = captures.filter(
      (capture) =>
        capture.placeId === placeCapturesPreviewPlaceId &&
        !capture.photo &&
        !placeCapturesPreviewPhotos[capture.id]
    );

    if (placeCapturesMissingPhotos.length === 0) {
      return;
    }

    async function loadPlacePreviewPhotos() {
      const photoEntries = await Promise.all(
        placeCapturesMissingPhotos.map(async (capture) => {
          const photo = await readCapturePhoto(capture.id);
          return photo ? [capture.id, photo] as const : null;
        })
      );

      if (!active) {
        return;
      }

      setPlaceCapturesPreviewPhotos((current) => {
        const next = { ...current };
        let changed = false;

        photoEntries.forEach((entry) => {
          if (!entry) {
            return;
          }

          const [captureId, photo] = entry;

          if (next[captureId] !== photo) {
            next[captureId] = photo;
            changed = true;
          }
        });

        return changed ? next : current;
      });
    }

    void loadPlacePreviewPhotos();

    return () => {
      active = false;
    };
  }, [captures, placeCapturesPreviewOpen, placeCapturesPreviewPhotos, placeCapturesPreviewPlaceId]);

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

  function handleMapClick(lat: number, lng: number) {
    setSelectedCapture(null);
    setShareOptionsCaptureId(null);
    setOfficialFreeSpotDataPlace({
      id: "selected-map-point",
      name: "Ponto selecionado",
      lat,
      lng,
      coordinatesText: `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
    });
  }

  function formatCaptureDate(value: string) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return "📅 Data não informada";
    }
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

  function getPlacePreviewCaptureKind(species: string): "peva" | "flecha" | "sargo" {
    const normalizedSpecies = species
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();

    if (normalizedSpecies.includes("sargo")) {
      return "sargo";
    }

    if (normalizedSpecies.includes("flecha")) {
      return "flecha";
    }

    return "peva";
  }

  function formatPlacePreviewMeasure(value: string, unit: "kg" | "cm", fallback: string) {
    const trimmedValue = value.trim();

    if (!trimmedValue) {
      return fallback;
    }

    return trimmedValue.toLowerCase().includes(unit) ? trimmedValue : `${trimmedValue} ${unit}`;
  }

  function formatPlacePreviewCaptureDateTime(value: string) {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return {
        date: "--/--/----",
        time: "--h",
      };
    }

    const datePart = new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(date);
    const hour = date.getHours();
    const minutes = date.getMinutes();

    return {
      date: datePart,
      time: minutes === 0 ? `${hour}h` : `${hour}h${String(minutes).padStart(2, "0")}`,
    };
  }

  function getPlaceCapturesPreviewData(placeId: number | null) {
    if (!placeId) {
      return null;
    }

    const place = personalPlaces.find((item) => item.id === placeId);

    if (!place) {
      return null;
    }

    return {
      place: {
        id: place.id,
        name: place.name,
        note: place.note,
        coordinates: `${place.lat.toFixed(6)}, ${place.lng.toFixed(6)}`,
      },
      captures: getCapturesForPlace(place.id).map((capture, index) => {
        const capturedAt = formatPlacePreviewCaptureDateTime(capture.capturedAt);

        return {
          id: String(capture.id),
          species: getCaptureTitle(capture, index),
          weight: formatPlacePreviewMeasure(capture.weight, "kg", "Peso --"),
          size: formatPlacePreviewMeasure(capture.size, "cm", "Tam. --"),
          date: capturedAt.date,
          time: capturedAt.time,
          kind: getPlacePreviewCaptureKind(capture.species),
          photoUrl: capture.photo || placeCapturesPreviewPhotos[capture.id] || undefined,
        };
      }),
    };
  }

  function getCapturePlaceLabel(capture: Capture) {
    const place = capture.placeId
      ? personalPlaces.find((personalPlace) => personalPlace.id === capture.placeId)
      : getNearestPersonalPlace(capture.lat, capture.lng);

    return place?.name?.trim() || "Ponto sem nome";
  }

  function formatMyCapturesPanelMeasure(value: string, unit: "kg" | "cm") {
    const trimmedValue = value.trim();

    if (!trimmedValue) {
      return "\u2014";
    }

    return trimmedValue.toLowerCase().includes(unit) ? trimmedValue : `${trimmedValue} ${unit}`;
  }

  function getMyCapturesPanelCaptures(): MyCapturesPanelCapture[] {
    return [...captures].reverse().map((capture, reverseIndex) => {
      const originalIndex = captures.length - 1 - reverseIndex;
      const capturedAt = formatPlacePreviewCaptureDateTime(capture.capturedAt);

      return {
        id: String(capture.id),
        title: getCaptureTitle(capture, originalIndex),
        place: getCapturePlaceLabel(capture),
        weight: formatMyCapturesPanelMeasure(capture.weight, "kg"),
        size: formatMyCapturesPanelMeasure(capture.size, "cm"),
        date: capturedAt.date,
        time: capturedAt.time,
        kind: getPlacePreviewCaptureKind(capture.species),
        photoUrl: capture.photo || undefined,
      };
    });
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
  const hour = date.getHours();
  const minutes = date.getMinutes();
  const time = minutes === 0 ? `${hour}h` : `${hour}h${String(minutes).padStart(2, "0")}`;

  if (startOfDate === startOfToday) {
    return `Hoje • ${time}`;
  }

  if (startOfDate === startOfToday - 24 * 60 * 60 * 1000) {
    return `Ontem • ${time}`;
  }

  const datePart = new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  }).format(date);

  return `${datePart} • ${time}`;
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

  function deriveWeightParts(weight: string) {
    const normalizedWeight = String(weight || "").replace(",", ".").trim();

    if (!normalizedWeight) {
      return { kg: "", grams: "" };
    }

    const parsedWeight = Number.parseFloat(normalizedWeight);

    if (!Number.isFinite(parsedWeight) || parsedWeight < 0) {
      return { kg: "", grams: "" };
    }

    const wholeKg = Math.floor(parsedWeight);
    const grams = Math.round((parsedWeight - wholeKg) * 1000);

    if (grams <= 0) {
      return {
        kg: wholeKg > 0 ? String(wholeKg) : "",
        grams: "",
      };
    }

    if (grams >= 1000) {
      return {
        kg: String(wholeKg + 1),
        grams: "",
      };
    }

    return {
      kg: wholeKg > 0 ? String(wholeKg) : "",
      grams: String(grams),
    };
  }

  function updateWeightFromParts(nextKg: string, nextGrams: string) {
    const cleanKg = nextKg.replace(/[^\d]/g, "");
    const cleanGrams = nextGrams.replace(/[^\d]/g, "").slice(0, 3);

    const hasKg = cleanKg.length > 0;
    const hasGrams = cleanGrams.length > 0;

    if (!hasKg && !hasGrams) {
      setFormData({ ...formData, weight: "" });
      return;
    }

    const kgValue = hasKg ? Number.parseInt(cleanKg, 10) : 0;
    const gramsValue = hasGrams
      ? Math.min(Number.parseInt(cleanGrams, 10), 999)
      : 0;

    const totalWeight = kgValue + gramsValue / 1000;
    const nextWeight = gramsValue > 0
      ? String(Number(totalWeight.toFixed(3)))
      : String(kgValue);

    setFormData({ ...formData, weight: nextWeight });
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
    await previewCaptureShareImage({
      capture,
      shareMode,
      formatCaptureDate,
      getCaptureLocationText,
      onFeedback: showShareFeedback,
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

    if (capturePlaceId && capturePlaceId === returnToPlaceCapturesPreviewPlaceId) {
      setPlaceCapturesPreviewPlaceId(capturePlaceId);
      setPlaceCapturesPreviewOpen(true);
      setReturnToPlaceCapturesPreviewPlaceId(null);
    }
  }

  function cancelCapture() {
    setPendingCapture(null);
    setFormData(createEmptyFormData());
    setCaptureMode(false);
    setReturnToPlaceCapturesPreviewPlaceId(null);
  }

  function addCapture(lat: number, lng: number) {
    setPendingCapture({ lat, lng });
  }

  function addCaptureAtPersonalPlace(place: PersonalPlace) {
    setPendingCapture({ lat: place.lat, lng: place.lng, placeId: place.id });
    setSelectedCapture(null);
    setCaptureMode(false);
    setPlaceMode(false);
    setCapturesPanelOpen(false);
  }

  function addPersonalPlace(lat: number, lng: number) {
    setPendingPlace({ lat, lng });
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
    const captureIdsToDelete = captures
      .filter((capture) => capture.placeId === id)
      .map((capture) => capture.id);
    const confirmed = window.confirm(
      captureIdsToDelete.length > 0
        ? "Este lugar contém capturas vinculadas.\n\nAo apagar este lugar, todas as capturas salvas nele também serão apagadas.\n\nDeseja mesmo continuar?"
        : "Deseja apagar este lugar?"
    );

    if (!confirmed) {
      return;
    }

    if (captureIdsToDelete.length > 0) {
      setCaptures((prev) => prev.filter((capture) => capture.placeId !== id));
      captureIdsToDelete.forEach((captureId) => {
        void deleteCapturePhoto(captureId);
      });
    }

    setPersonalPlaces((prev) => prev.filter((place) => place.id !== id));
    setSelectedCapture((current) =>
      current && captureIdsToDelete.includes(current.id) ? null : current
    );
    setShareOptionsCaptureId((current) =>
      current && captureIdsToDelete.includes(current) ? null : current
    );
    setPlaceCapturesPreviewPlaceId((current) => (current === id ? null : current));
    setPlaceCapturesPreviewOpen(false);
    setReturnToPlaceCapturesPreviewPlaceId((current) => (current === id ? null : current));
    setOfficialFreeSpotDataPlace((current) => (current?.id === id ? null : current));
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
    setSelectedCaptureSpot(null);
    setCapturesPanelOpen(false);
    setShareOptionsCaptureId(null);
    setSelectedCapture(capture);
  }

  function closeSelectedCapture() {
    setSelectedCapture(null);
    setShareOptionsCaptureId(null);
  }

  function openCaptureLinkedLocation(capture: Capture) {
    setCapturesPanelOpen(false);
    setSelectedCapture(null);
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

  function openAdvancedDataFromOfficialSpot(selectedDayId: string) {
    if (!officialFreeSpotDataPlace) {
      return;
    }

    setSelectedForecastDayId(selectedDayId);
    setPremiumPreviewPlace(officialFreeSpotDataPlace);
    setPremiumPreviewOpen(true);
    setOfficialFreeSpotDataPlace(null);
  }

  function closeAdvancedDataPreview() {
    setPremiumPreviewOpen(false);
    setPremiumPreviewPlace(null);
  }

  function backFromAdvancedDataPreview() {
    setPremiumPreviewOpen(false);

    if (premiumPreviewPlace) {
      setOfficialFreeSpotDataPlace(premiumPreviewPlace);
    }

    setPremiumPreviewPlace(null);
  }

  const placeCapturesPreviewData = getPlaceCapturesPreviewData(placeCapturesPreviewPlaceId);
  const placeCapturesPreviewPlace = placeCapturesPreviewPlaceId
    ? personalPlaces.find((place) => place.id === placeCapturesPreviewPlaceId)
    : null;
  const selectedCaptureView = selectedCapture
    ? captures.find((capture) => capture.id === selectedCapture.id) ?? selectedCapture
    : null;
  const selectedCapturePlaceLabel = selectedCaptureView
    ? getCapturePlaceLabel(selectedCaptureView)
    : "";
  const weightParts = deriveWeightParts(formData.weight);
  const officialFreeForecastDays = officialFreeSpotDataPlace
    ? getMockSpotForecastDays({
        id: officialFreeSpotDataPlace.id,
        name: officialFreeSpotDataPlace.name,
        lat: officialFreeSpotDataPlace.lat,
        lng: officialFreeSpotDataPlace.lng,
      })
    : undefined;
  const premiumForecastDays = premiumPreviewPlace
    ? getMockSpotForecastDays({
        id: premiumPreviewPlace.id,
        name: premiumPreviewPlace.name,
        lat: premiumPreviewPlace.lat,
        lng: premiumPreviewPlace.lng,
      })
    : undefined;

  return (
    <div className="relative w-full h-full">
      {premiumPreviewOpen && (
        <PremiumPanelPreview
          onClose={closeAdvancedDataPreview}
          onBack={premiumPreviewPlace ? backFromAdvancedDataPreview : closeAdvancedDataPreview}
          placeName={premiumPreviewPlace?.name}
          lat={premiumPreviewPlace?.lat}
          lng={premiumPreviewPlace?.lng}
          coordinatesText={premiumPreviewPlace?.coordinatesText}
          selectedForecastDayId={selectedForecastDayId}
          forecastDays={premiumForecastDays}
        />
      )}
      <OfficialFreePanelPreview
        isOpen={Boolean(officialFreeSpotDataPlace)}
        onClose={() => setOfficialFreeSpotDataPlace(null)}
        onOpenAdvancedData={openAdvancedDataFromOfficialSpot}
        selectedForecastDayId={selectedForecastDayId}
        onSelectForecastDay={setSelectedForecastDayId}
        placeName={officialFreeSpotDataPlace?.name}
        lat={officialFreeSpotDataPlace?.lat}
        lng={officialFreeSpotDataPlace?.lng}
        coordinatesText={officialFreeSpotDataPlace?.coordinatesText}
        forecastDays={officialFreeForecastDays}
      />
      {placeCapturesPreviewOpen && (
        <PlaceCapturesPanelPreview
          onClose={() => setPlaceCapturesPreviewOpen(false)}
          onAddCapture={
            placeCapturesPreviewPlace
              ? () => {
                  setReturnToPlaceCapturesPreviewPlaceId(placeCapturesPreviewPlace.id);
                  addCaptureAtPersonalPlace(placeCapturesPreviewPlace);
                  setPlaceCapturesPreviewOpen(false);
                }
              : undefined
          }
          onOpenSpotData={
            placeCapturesPreviewPlace
              ? () => {
                  setOfficialFreeSpotDataPlace({
                    id: placeCapturesPreviewPlace.id,
                    name: placeCapturesPreviewPlace.name,
                    lat: placeCapturesPreviewPlace.lat,
                    lng: placeCapturesPreviewPlace.lng,
                    coordinatesText: `${placeCapturesPreviewPlace.lat.toFixed(6)}, ${placeCapturesPreviewPlace.lng.toFixed(6)}`,
                  });
                  setPlaceCapturesPreviewOpen(false);
                }
              : undefined
          }
          onDeletePlace={
            placeCapturesPreviewPlace
              ? () => deletePersonalPlace(placeCapturesPreviewPlace.id)
              : undefined
          }
          onOpenCapture={(captureId) => {
            const fullCapture = captures.find((capture) => String(capture.id) === String(captureId));

            if (!fullCapture) {
              return;
            }

            setPlaceCapturesPreviewOpen(false);
            openCaptureDetails(fullCapture);
          }}
          place={placeCapturesPreviewData?.place}
          captures={placeCapturesPreviewData?.captures}
        />
      )}

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
          setPremiumPreviewPlace(null);
          setPremiumPreviewOpen(true);
        }}
        onPointerDown={(event) => event.stopPropagation()}
        className={`fixed-ui-control map-control-overlay fixed left-4 bottom-4 z-[2100] rounded-2xl border border-cyan-300/25 bg-slate-950/88 px-4 py-3 text-xs font-black uppercase tracking-[0.12em] text-cyan-100 shadow-[0_18px_50px_rgba(0,0,0,0.45),0_0_22px_rgba(34,211,238,0.14)] backdrop-blur-xl transition hover:border-cyan-200/45 hover:bg-slate-900/95 ${
          popupPriorityOpen ? "pointer-events-none opacity-0" : "opacity-100"
        }`}
        aria-label="Abrir preview premium"
      >
        Preview premium
      </button>

      <div
        className={`fixed-ui-control map-control-overlay fixed bottom-[calc(env(safe-area-inset-bottom)+0.75rem)] right-[calc(env(safe-area-inset-right)+0.75rem)] z-[2000] flex max-h-[calc(100dvh-env(safe-area-inset-bottom)-env(safe-area-inset-top)-1.5rem)] flex-col items-end gap-2 transition sm:bottom-6 sm:right-6 sm:max-h-none ${
          popupPriorityOpen || measurementMode ? "pointer-events-none opacity-0" : "opacity-100"
        }`}
      >
        <MapActionButton
          label="Adicionar Captura"
          iconSrc="/icons/adicionar-captura.png"
          onClick={() => {
            setCaptureMode((prev) => !prev);
            setPlaceMode(false);
            setMeasurementMode(false);
            setMeasurementPoints([]);
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
            setMeasurementMode(false);
            setMeasurementPoints([]);
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
            setMeasurementMode(false);
            setMeasurementPoints([]);
            setSelectedCapture(null);
            setSelectedCaptureSpot(null);
            setShareOptionsCaptureId(null);
          }}
          ariaLabel="Ver minhas capturas"
          title="Ver minhas capturas"
        />
      </div>

      <MeasurementControl
        active={measurementMode}
        points={measurementPoints}
        totalMeters={measurementTotalMeters}
        hidden={popupPriorityOpen || Boolean(pendingCapture) || Boolean(pendingPlace)}
        onToggle={() => {
          if (measurementMode) {
            exitMeasurement();
            return;
          }

          startMeasurement();
        }}
        onClear={clearMeasurement}
        onExit={exitMeasurement}
      />

      <ZoomButtons hidden={popupPriorityOpen} mapRef={mapRef} />
      <CenterButton personalPlaces={personalPlaces} hidden={popupPriorityOpen} mapRef={mapRef} />

      <MapModeSelector
        mode={mapMode}
        onChange={setMapMode}
        hidden={popupPriorityOpen || Boolean(pendingCapture) || Boolean(pendingPlace)}
      />

      {captureMode && (
        <div className="fixed bottom-[270px] right-4 z-[2000] max-w-[210px] rounded-sm border border-cyan-500/20 bg-[#020a14]/95 px-4 py-3 text-center text-sm font-bold text-white shadow-[0_20px_70px_rgba(0,0,0,0.55)] sm:bottom-[292px] sm:right-6 sm:max-w-[240px] sm:px-5 sm:py-4">
          Toque uma vez no mapa para marcar a captura
        </div>
      )}

      {placeMode && (
        <div className="fixed bottom-[270px] right-4 z-[2000] max-w-[210px] rounded-sm border border-cyan-300/25 bg-[#020a14]/95 px-4 py-3 text-center text-sm font-bold text-cyan-50 shadow-[0_20px_70px_rgba(0,0,0,0.55),0_0_26px_rgba(34,211,238,0.18)] sm:bottom-[292px] sm:right-6 sm:max-w-[240px] sm:px-5 sm:py-4">
          Toque no mapa para salvar um lugar privado
        </div>
      )}

      {capturesPanelOpen && (
        <MyCapturesPanelPreview
          onClose={() => setCapturesPanelOpen(false)}
          onOpenCapture={(captureId) => {
            const fullCapture = captures.find((capture) => String(capture.id) === String(captureId));

            if (!fullCapture) {
              return;
            }

            openCaptureLinkedLocation(fullCapture);
          }}
          captures={getMyCapturesPanelCaptures()}
          summaryTotal={captures.length}
          summaryBestWeight={getBestWeight()}
          summaryLastCapture={getLastSpotCaptureDate(captures)}
        />
      )}

      {pendingCapture && (
        <AddCapturePanel
          lat={pendingCapture.lat}
          lng={pendingCapture.lng}
          formData={formData}
          weightParts={weightParts}
          onFormDataChange={setFormData}
          onWeightPartsChange={updateWeightFromParts}
          onSave={saveCapture}
          onCancel={cancelCapture}
        />
      )}
      {pendingPlace && (
        <AddPlacePanel
          lat={pendingPlace.lat}
          lng={pendingPlace.lng}
          formData={placeFormData}
          onFormDataChange={setPlaceFormData}
          onSave={savePersonalPlace}
          onCancel={cancelPersonalPlace}
        />
      )}
      {selectedCaptureSpot && (
        <CaptureSpotPanelPreview
          lat={selectedCaptureSpot.lat}
          lng={selectedCaptureSpot.lng}
          captures={selectedCaptureSpot.captures}
          onClose={() => {
            setSelectedCaptureSpot(null);
            setShareOptionsCaptureId(null);
          }}
          onAddCapture={() => {
            setPendingCapture({
              lat: selectedCaptureSpot.lat,
              lng: selectedCaptureSpot.lng,
              placeId: null,
            });
            setSelectedCaptureSpot(null);
            setCaptureMode(false);
            setPlaceMode(false);
          }}
          onDeleteSpot={() => deleteCaptureSpot(selectedCaptureSpot)}
          onOpenCapture={(captureId) => openCaptureSpotCard(captureId)}
          onOpenSpotData={() => {
            const coordinatesText = `${selectedCaptureSpot.lat.toFixed(6)}, ${selectedCaptureSpot.lng.toFixed(6)}`;

            setOfficialFreeSpotDataPlace({
              id: Math.round(
                Math.abs(selectedCaptureSpot.lat) * 1000000 +
                Math.abs(selectedCaptureSpot.lng) * 1000000
              ),
              name: "Ponto de captura",
              lat: selectedCaptureSpot.lat,
              lng: selectedCaptureSpot.lng,
              coordinatesText,
            });
            setSelectedCaptureSpot(null);
          }}
        />
      )}
      {selectedCaptureView && (
        <CaptureDetailPanelPreview
          capture={selectedCaptureView}
          placeLabel={selectedCapturePlaceLabel}
          coordinatesText={`${selectedCaptureView.lat.toFixed(6)}, ${selectedCaptureView.lng.toFixed(6)}`}
          formattedDate={formatCaptureDate(selectedCaptureView.capturedAt).replace(/^📅\s*/, "")}
          shareFeedback={
            shareFeedback?.captureId === selectedCaptureView.id ? shareFeedback.message : null
          }
          onClose={closeSelectedCapture}
          onToggleShareOptions={() => {
            setShareOptionsCaptureId(selectedCaptureView.id);
          }}
          onDelete={() => {
            const confirmed = window.confirm("Deseja realmente apagar esta captura?");

            if (!confirmed) {
              return;
            }

            deleteCapture(selectedCaptureView.id);
          }}
        />
      )}
      {selectedCaptureView && shareOptionsCaptureId === selectedCaptureView.id && (
        <CaptureSharePanelPreview
          capture={selectedCaptureView}
          placeLabel={selectedCapturePlaceLabel}
          formattedDate={formatCaptureDate(selectedCaptureView.capturedAt).replace(/^📅\s*/, "")}
          shareFeedback={
            shareFeedback?.captureId === selectedCaptureView.id ? shareFeedback.message : null
          }
          onClose={() => setShareOptionsCaptureId(null)}
          onBack={() => setShareOptionsCaptureId(null)}
          onGenerate={(shareMode) => {
            void shareCapture(selectedCaptureView, shareMode);
          }}
        />
      )}

          <MapContainer
          ref={mapRef}
          center={paranaCenter}
          zoom={zoom}
          minZoom={mapMinZoom}
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

              {showNauticalDetails && (
                <>
                  <WMSTileLayer
                    attribution={NAUTICAL_BATHYMETRY_ATTRIBUTION}
                    detectRetina={false}
                    errorTileUrl={TRANSPARENT_TILE}
                    format="image/png"
                    keepBuffer={1}
                    layers={NAUTICAL_DEPTH_SURFACE_LAYER}
                    maxZoom={NAUTICAL_MAX_ZOOM}
                    opacity={0.62}
                    tileSize={256}
                    transparent={true}
                    updateWhenIdle={true}
                    updateWhenZooming={false}
                    url={NAUTICAL_BATHYMETRY_WMS_URL}
                    version="1.1.1"
                    zIndex={220}
                  />
                  <WMSTileLayer
                    attribution={NAUTICAL_BATHYMETRY_ATTRIBUTION}
                    detectRetina={false}
                    errorTileUrl={TRANSPARENT_TILE}
                    format="image/png"
                    keepBuffer={1}
                    layers={NAUTICAL_DEPTH_CONTOURS_LAYER}
                    maxZoom={NAUTICAL_MAX_ZOOM}
                    opacity={0.92}
                    tileSize={256}
                    transparent={true}
                    updateWhenIdle={true}
                    updateWhenZooming={false}
                    url={NAUTICAL_BATHYMETRY_WMS_URL}
                    version="1.1.1"
                    zIndex={230}
                  />
                  <TileLayer
                    attribution="&copy; OpenSeaMap contributors"
                    detectRetina={false}
                    errorTileUrl={TRANSPARENT_TILE}
                    keepBuffer={1}
                    maxNativeZoom={NAUTICAL_SEAMARK_MAX_NATIVE_ZOOM}
                    maxZoom={NAUTICAL_MAX_ZOOM}
                    tileSize={256}
                    updateWhenIdle={true}
                    updateWhenZooming={false}
                    url="https://tiles.openseamap.org/seamark/{z}/{x}/{y}.png"
                    zIndex={240}
                  />
                </>
              )}
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

          <MeasurementLayer points={measurementPoints} />
          <HomeMapViewController
            personalPlaces={personalPlaces}
            homeViewControlRef={homeViewControlRef}
          />
          <MapFocusController target={focusTarget} />
          <MapMinZoomController minZoom={mapMinZoom} />
          <MapMaxZoomController maxZoom={MAP_MAX_ZOOM} />

          <MapEvents
            captureMode={captureMode}
            placeMode={placeMode}
            onAddCapture={addCapture}
            onAddPlace={addPersonalPlace}
            onAddMeasurementPoint={addMeasurementPoint}
            onLocationClick={handleMapClick}
            onZoomChange={setZoom}
            measurementMode={measurementMode}
            mapDismissBlocked={interactiveWindowOpen}
            onOtherPopupClose={() => {
              setSpotPopupOpen(false);
              setCapturePopupOpen(false);
              setSelectedCaptureSpot(null);
              setShareOptionsCaptureId(null);
            }}
            ignoreNextMapClickRef={ignoreNextMapClickRef}
            homeViewControlRef={homeViewControlRef}
          />

          <Pane
            name={USER_PLACE_MARKER_PANE}
            style={{
              zIndex: USER_PLACE_MARKER_PANE_Z_INDEX,
              pointerEvents: measurementMode ? "none" : "auto",
            }}
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
                key={`personal-place-${place.id}-${measurementMode ? "measure" : "normal"}`}
                position={[place.lat, place.lng]}
                icon={createPersonalPlaceIcon(iconSize, getCapturesForPlace(place.id).length)}
                interactive={!measurementMode}
                eventHandlers={{
                  click: (event) => {
                    if (measurementMode) {
                      return;
                    }

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
                    setPlaceCapturesPreviewPlaceId(place.id);
                    setPlaceCapturesPreviewOpen(true);
                  },
                }}
              />
            ))}
          </Pane>

          <Pane
            name={USER_CAPTURE_MARKER_PANE}
            style={{
              zIndex: USER_CAPTURE_MARKER_PANE_Z_INDEX,
              pointerEvents: measurementMode ? "none" : "auto",
            }}
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
                key={`capture-${capture.id}-${measurementMode ? "measure" : "normal"}`}
                position={[capture.lat, capture.lng]}
                icon={createCaptureIcon(iconSize, getCapturesForCaptureSpot(capture).length)}
                interactive={!measurementMode}
                eventHandlers={{
                  click: (event) => {
                    if (measurementMode) {
                      return;
                    }

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
            style={{
              zIndex: OFFICIAL_SPOT_MARKER_PANE_Z_INDEX,
              pointerEvents: measurementMode ? "none" : "auto",
            }}
          >
            {fishingSpots.map((spot) => (
              <Marker
                key={`spot-${spot.id}-${measurementMode ? "measure" : "normal"}`}
                position={[spot.lat, spot.lng]}
                icon={createSpotIcon(OFFICIAL_SPOT_MARKER_ICON_SIZE)}
                interactive={!measurementMode}
                zIndexOffset={OFFICIAL_SPOT_MARKER_Z_INDEX_OFFSET}
                eventHandlers={{
                  click: (event) => {
                    if (measurementMode) {
                      return;
                    }

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
                    setOfficialFreeSpotDataPlace({
                      id: spot.id,
                      name: spot.name,
                      lat: spot.lat,
                      lng: spot.lng,
                      coordinatesText: `${spot.lat.toFixed(6)}, ${spot.lng.toFixed(6)}`,
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
