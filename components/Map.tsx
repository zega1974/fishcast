"use client";

import {
  MapContainer,
  Marker,
  Polygon,
  Popup,
  TileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet";

import L from "leaflet";

import { useEffect, useRef, useState } from "react";
import { fishingSpots } from "@/data/fishingSpots";

type CaptureVisibility = "public" | "private" | "secret";

type Capture = {
  id: number;
  lat: number;
  lng: number;
  species: string;
  weight: string;
  size: string;
  bait: string;
  comment: string;
  photo: string;
  visibility: CaptureVisibility;
  capturedAt: string;
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

const CAPTURES_STORAGE_KEY = "fishcastpr.captures";

function getIconSize(zoom: number) {
  if (zoom >= 13) return 84;
  if (zoom >= 11) return 66;
  if (zoom >= 9) return 50;
  if (zoom >= 7) return 38;
  return 24;
}

function createSpotIcon(size: number) {
  return L.icon({
    iconUrl: "/icons/spot-marker.png",
    iconSize: [size, size],
    iconAnchor: [size / 2, size * 0.92],
    popupAnchor: [0, -size * 0.92],
    className: "spot-icon-clean",
  });
}

function createCaptureIcon(size: number) {
  return L.icon({
    iconUrl: "/icons/capture-marker.png",
    iconSize: [size, size],
    iconAnchor: [size / 2, size * 0.92],
    popupAnchor: [0, -size * 0.92],
    className: "spot-icon-clean",
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

function MapEvents({
  captureMode,
  onAddCapture,
  onLocationClick,
  onZoomChange,
  popupPriorityOpen,
  onDismissActivePopup,
  onOtherPopupClose,
  spotPopupOpen,
  ignoreNextMapClickRef,
}: {
  captureMode: boolean;
  onAddCapture: (lat: number, lng: number) => void;
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
    map.setView([target.lat, target.lng], Math.max(map.getZoom(), 12), {
      animate: true,
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

function RoundMapButton({
  topLabel,
  bottomLabel,
  centerText,
  variant,
  onClick,
  ariaLabel,
  title,
}: {
  topLabel: string;
  bottomLabel: string;
  centerText: string;
  variant: "red" | "green";
  onClick: () => void;
  ariaLabel: string;
  title: string;
}) {
  const isRed = variant === "red";
  const topPathId = isRed ? "add-capture-top-path" : "my-captures-top-path";
  const bottomPathId = isRed ? "add-capture-bottom-path" : "my-captures-bottom-path";

  return (
    <button
      onClick={onClick}
      onPointerDown={(e) => e.stopPropagation()}
      aria-label={ariaLabel}
      title={title}
      className={`group relative flex h-[78px] w-[78px] items-center justify-center rounded-full border p-1.5 text-white transition duration-200 ease-out active:scale-95 sm:h-[86px] sm:w-[86px] ${
        isRed
          ? "border-red-100/45 bg-[radial-gradient(circle_at_35%_20%,rgba(255,255,255,0.42),transparent_23%),radial-gradient(circle_at_50%_50%,#ef4444,#7f1d1d_62%,#210303)] shadow-[0_14px_28px_rgba(0,0,0,0.48),0_0_22px_rgba(239,68,68,0.42)] hover:shadow-[0_16px_32px_rgba(0,0,0,0.52),0_0_30px_rgba(239,68,68,0.58)]"
          : "border-emerald-100/45 bg-[radial-gradient(circle_at_35%_20%,rgba(255,255,255,0.42),transparent_23%),radial-gradient(circle_at_50%_50%,#22c55e,#065f46_62%,#021b12)] shadow-[0_14px_28px_rgba(0,0,0,0.48),0_0_22px_rgba(34,197,94,0.38)] hover:shadow-[0_16px_32px_rgba(0,0,0,0.52),0_0_30px_rgba(34,197,94,0.54)]"
      }`}
    >
      <span className="absolute inset-1.5 rounded-full border border-white/30 shadow-[inset_0_0_16px_rgba(255,255,255,0.18)]" />
      <span className="absolute inset-[13px] rounded-full border border-black/35 bg-black/25 shadow-inner" />
      <svg
        viewBox="0 0 100 100"
        className="absolute inset-0 h-full w-full overflow-visible"
        aria-hidden="true"
      >
        <defs>
          <path
            id={topPathId}
            d="M 22 49 A 28 28 0 0 1 78 49"
          />
          <path
            id={bottomPathId}
            d="M 20 59 A 30 30 0 0 0 80 59"
          />
        </defs>
        <text className="fill-white text-[8px] font-black uppercase tracking-[0.16em]">
          <textPath href={`#${topPathId}`} startOffset="50%" textAnchor="middle">
            {topLabel}
          </textPath>
        </text>
        <text className="fill-white text-[8px] font-black uppercase tracking-[0.16em]">
          <textPath href={`#${bottomPathId}`} startOffset="50%" textAnchor="middle">
            {bottomLabel}
          </textPath>
        </text>
      </svg>
      <span className="relative flex h-9 w-9 items-center justify-center rounded-full bg-black/25 text-xl font-black leading-none sm:h-10 sm:w-10">
        {centerText}
      </span>
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

export default function Map() {
  const [captureMode, setCaptureMode] = useState(false);
  const [capturesPanelOpen, setCapturesPanelOpen] = useState(false);
  const [zoom, setZoom] = useState(8);
  const center = paranaCenter;
  const [pendingCapture, setPendingCapture] = useState<{ lat: number; lng: number } | null>(null);
  const [focusTarget, setFocusTarget] = useState<FocusTarget | null>(null);
  const ignoreNextMapClickRef = useRef(false);
  const [spotPopupOpen, setSpotPopupOpen] = useState(false);
  const [capturePopupOpen, setCapturePopupOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<{
    name: string;
    lat: number;
    lng: number;
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
  const [captures, setCaptures] = useState<Capture[]>(readStoredCaptures);

  const iconSize = getIconSize(zoom);
  const popupPriorityOpen = Boolean(selectedLocation) || spotPopupOpen || capturePopupOpen;

  useEffect(() => {
    window.localStorage.setItem(CAPTURES_STORAGE_KEY, JSON.stringify(captures));
  }, [captures]);

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

  function saveCapture() {
    if (!pendingCapture) return;

    const location = formData.visibility === "secret"
      ? getApproximateLocation(pendingCapture.lat, pendingCapture.lng)
      : pendingCapture;

    setCaptures((prev) => [
      ...prev,
      {
        id: Date.now(),
        lat: location.lat,
        lng: location.lng,
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
  }

  function cancelCapture() {
    setPendingCapture(null);
    setFormData(createEmptyFormData());
    setCaptureMode(false);
  }

  function addCapture(lat: number, lng: number) {
    setPendingCapture({ lat, lng });
  }

  function deleteCapture(id: number) {
    setCaptures((prev) => prev.filter((capture) => capture.id !== id));
    setCapturePopupOpen(false);
  }

  function focusCapture(capture: Capture) {
    setFocusTarget({ id: capture.id, lat: capture.lat, lng: capture.lng });
    setSelectedLocation(null);
    setCapturesPanelOpen(false);
  }

  return (
    <div className="relative w-full h-full">
      <div
        className={`map-control-overlay absolute bottom-4 right-4 z-[2000] flex flex-col items-end gap-3 transition sm:bottom-6 sm:right-6 ${
          popupPriorityOpen ? "pointer-events-none opacity-0" : "opacity-100"
        }`}
      >
        <RoundMapButton
          topLabel="Adicionar"
          bottomLabel="Captura"
          centerText="+"
          variant="red"
          onClick={() => setCaptureMode((prev) => !prev)}
          ariaLabel={captureMode ? "Cancelar marcação de captura" : "Adicionar captura"}
          title={captureMode ? "Cancelar captura" : "Adicionar captura"}
        />

        <RoundMapButton
          topLabel="Minhas"
          bottomLabel="Capturas"
          centerText={String(captures.length)}
          variant="green"
          onClick={() => setCapturesPanelOpen((prev) => !prev)}
          ariaLabel="Ver minhas capturas"
          title="Ver minhas capturas"
        />
      </div>

      {captureMode && (
        <div className="absolute bottom-[176px] right-4 z-[2000] max-w-[210px] rounded-3xl bg-[#020a14]/95 px-4 py-3 text-center text-sm font-bold text-white border border-cyan-500/20 shadow-[0_20px_70px_rgba(0,0,0,0.55)] sm:bottom-[194px] sm:right-6 sm:max-w-[240px] sm:px-5 sm:py-4">
          Toque uma vez no mapa para marcar a captura
        </div>
      )}

      {capturesPanelOpen && (
        <aside
          className="map-control-overlay absolute bottom-[176px] right-4 z-[2200] flex max-h-[min(58vh,520px)] w-[min(calc(100vw-32px),390px)] flex-col overflow-hidden rounded-[28px] border border-emerald-300/20 bg-[#03110d]/95 text-white shadow-[0_28px_90px_rgba(0,0,0,0.62),0_0_42px_rgba(34,197,94,0.18)] backdrop-blur-xl sm:bottom-[194px] sm:right-6"
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

      {selectedLocation && (
        <div className="absolute left-1/2 top-[92px] z-[5000] w-[min(92vw,460px)] -translate-x-1/2 sm:top-[104px]">
          <button
            className="w-full cursor-pointer rounded-[28px] bg-white p-6 text-left text-slate-900 shadow-[0_28px_90px_rgba(0,0,0,0.38),0_0_38px_rgba(34,197,94,0.18)]"
            onClick={() => setSelectedLocation(null)}
            aria-label="Fechar dados do ponto"
          >
            <h2 className="text-3xl font-black leading-tight">{selectedLocation.name}</h2>
            <p className="mb-5 mt-1 text-sm font-bold text-zinc-500">
              {selectedLocation.lat.toFixed(4)}, {selectedLocation.lng.toFixed(4)}
            </p>
            <div className="grid max-h-[68vh] grid-cols-1 gap-4 overflow-y-auto pr-1 text-base text-slate-800">
              <InfoRow icon="☀" label="Clima">{selectedLocation.conditions.clima}</InfoRow>
              <InfoRow icon="↧" label="Pressão">{selectedLocation.conditions.pressao} hPa</InfoRow>
              <InfoRow icon="°" label="Temperatura">{selectedLocation.conditions.temperatura} °C</InfoRow>
              <InfoRow icon="≈" label="Água">{selectedLocation.conditions.tempAgua} °C</InfoRow>
              <InfoRow icon="◐" label="Lua">{selectedLocation.conditions.lua}</InfoRow>
              <InfoRow icon="≋" label="Maré">{selectedLocation.conditions.mare}</InfoRow>
            </div>
          </button>
        </div>
      )}

      <MapContainer
          center={center}
          zoom={zoom}
          minZoom={6}
          maxZoom={16}
          zoomControl={false}
          scrollWheelZoom={true}
          doubleClickZoom={false}
          className="h-full w-full"
          style={{ width: "100%", height: "100%" }}
        >
          <TileLayer
            attribution="&copy; OpenStreetMap contributors"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

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
            onAddCapture={addCapture}
            onLocationClick={handleMapClick}
            onZoomChange={setZoom}
            popupPriorityOpen={popupPriorityOpen}
            onDismissActivePopup={() => {
              setSpotPopupOpen(false);
              setCapturePopupOpen(false);
              setSelectedLocation(null);
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
            icon={createSpotIcon(iconSize)}
            eventHandlers={{
              click: (event) => {
                L.DomEvent.stopPropagation(event.originalEvent);
                ignoreNextMapClickRef.current = false;
                setSpotPopupOpen(false);
                setCapturePopupOpen(false);
                setSelectedLocation({
                  name: spot.name,
                  lat: spot.lat,
                  lng: spot.lng,
                  conditions: spot.conditions,
                });
              },
            }}
          />
        ))}

        {captures.map((capture, index) => (
          <Marker
            key={`capture-${capture.id}`}
            position={[capture.lat, capture.lng]}
            icon={createCaptureIcon(iconSize)}
            eventHandlers={{
              click: (event) => {
                L.DomEvent.stopPropagation(event.originalEvent);
                ignoreNextMapClickRef.current = false;
                setSelectedLocation(null);
                setCapturePopupOpen(true);
                setSpotPopupOpen(false);
              },
            }}
          >
            <Popup
              closeButton={false}
              closeOnClick={true}
              autoClose={true}
              className="capture-popup"
              eventHandlers={{
                popupopen: () => setCapturePopupOpen(true),
                popupclose: () => {
                  setCapturePopupOpen(false);
                },
              }}
            >
              <div className="w-[min(84vw,360px)] overflow-hidden rounded-[28px] border border-emerald-300/20 bg-[#03110d] text-white shadow-[0_28px_90px_rgba(0,0,0,0.65),0_0_46px_rgba(34,197,94,0.28)]">
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

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteCapture(capture.id);
                    }}
                    className="w-full rounded-2xl border border-red-300/20 bg-red-500/15 px-4 py-3 text-sm font-black text-red-100 transition hover:bg-red-500/25"
                  >
                    Apagar captura
                  </button>

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
