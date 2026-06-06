"use client";

type PremiumPanelPreviewProps = {
  onClose: () => void;
};

export type PreviewIconName =
  | "weather"
  | "pressure"
  | "airTemp"
  | "waterTemp"
  | "moon"
  | "tide"
  | "depth"
  | "anchor"
  | "compass"
  | "map"
  | "satellite"
  | "night"
  | "copy"
  | "clock";

const conditionCards = [
  {
    icon: "weather",
    label: "Clima",
    value: "Nublado",
    note: "Luz reduzida favorece ataques.",
    status: "Favoravel",
  },
  {
    icon: "pressure",
    label: "Pressao",
    value: "1015 hPa",
    note: "Pressao estavel favorece atividade dos peixes.",
    status: "Boa",
  },
  {
    icon: "airTemp",
    label: "Temp. do ar",
    value: "23 °C",
    note: "Faixa confortavel.",
    status: "Ideal",
  },
  {
    icon: "waterTemp",
    label: "Temp. da agua",
    value: "24 °C",
    note: "Temperatura ideal para peixes.",
    status: "Excelente",
  },
  {
    icon: "moon",
    label: "Lua",
    value: "Crescente",
    note: "Boa atividade alimentar.",
    status: "Boa",
  },
  {
    icon: "tide",
    label: "Mare",
    value: "Alta (estavel)",
    note: "Movimento favorece alimentacao e deslocamento.",
    status: "Favoravel",
  },
] satisfies {
  icon: PreviewIconName;
  label: string;
  value: string;
  note: string;
  status: string;
}[];

const mapModes = [
  { label: "Mapa", icon: "map", active: true },
  { label: "Satelite", icon: "satellite" },
  { label: "Nautico", icon: "anchor" },
  { label: "Noturno", icon: "night" },
] satisfies { label: string; icon: PreviewIconName; active?: boolean }[];

export function PreviewIcon({
  name,
  className = "h-12 w-12",
}: {
  name: PreviewIconName;
  className?: string;
}) {
  const common = "drop-shadow-[0_0_10px_rgba(34,211,238,0.16)]";

  if (name === "weather") {
    return (
      <svg className={`${className} ${common}`} viewBox="0 0 64 64" aria-hidden="true">
        <circle cx="24" cy="22" r="13" fill="#facc15" />
        <g stroke="#facc15" strokeLinecap="round" strokeWidth="4">
          <path d="M24 5v7" />
          <path d="M24 32v7" />
          <path d="M7 22h7" />
          <path d="M36 22h7" />
          <path d="M12 10l5 5" />
          <path d="M36 10l-5 5" />
        </g>
        <path
          d="M17 50h31c7 0 11-4 11-10s-5-10-11-10c-3-8-10-12-18-10-7 2-11 7-12 14h-1c-7 0-12 4-12 10s5 10 12 10Z"
          fill="#eaf4ff"
        />
        <path
          d="M17 50h31c7 0 11-4 11-10 0-1-.1-2-.4-3-2.3 4-6 6-11 6H18c-6 0-10-2-12-6-.6 1.2-1 2.6-1 4 0 5 5 9 12 9Z"
          fill="#b9d5f4"
        />
      </svg>
    );
  }

  if (name === "pressure") {
    return (
      <svg className={`${className} ${common}`} viewBox="0 0 64 64" aria-hidden="true">
        <circle cx="32" cy="32" r="27" fill="#0b2234" stroke="#c7d7e8" strokeWidth="4" />
        <path d="M13 34a19 19 0 0 1 38 0" fill="none" stroke="#d7e7f7" strokeWidth="3" />
        <g strokeLinecap="round" strokeWidth="3">
          <path d="M19 32h5" stroke="#d7e7f7" />
          <path d="M25 20l3 5" stroke="#d7e7f7" />
          <path d="M38 20l-3 5" stroke="#d7e7f7" />
          <path d="M45 32h-5" stroke="#d7e7f7" />
          <path d="M45 22l-4 4" stroke="#f97316" />
        </g>
        <path d="M32 35l15-18" stroke="#f97316" strokeLinecap="round" strokeWidth="4" />
        <circle cx="32" cy="35" r="4" fill="#d7e7f7" />
      </svg>
    );
  }

  if (name === "airTemp") {
    return (
      <svg className={`${className} ${common}`} viewBox="0 0 64 64" aria-hidden="true">
        <circle cx="32" cy="32" r="30" fill="#08263a" />
        <rect x="27" y="8" width="10" height="34" rx="5" fill="#f6fbff" />
        <rect x="31" y="16" width="4" height="29" rx="2" fill="#ef2828" />
        <circle cx="32" cy="45" r="12" fill="#f6fbff" />
        <circle cx="32" cy="45" r="8" fill="#ef2828" />
        <path d="M38 16h7M38 24h6M38 32h7" stroke="#f6fbff" strokeLinecap="round" strokeWidth="2" />
      </svg>
    );
  }

  if (name === "waterTemp") {
    return (
      <svg className={`${className} ${common}`} viewBox="0 0 64 64" aria-hidden="true">
        <circle cx="32" cy="32" r="29" fill="#08263a" />
        <path
          d="M32 8c10 14 17 24 17 34 0 11-8 18-17 18s-17-7-17-18c0-10 7-20 17-34Z"
          fill="#2f9dff"
        />
        <path
          d="M26 21c-5 9-8 15-8 22 0 7 4 12 10 14-3-8-1-19 8-34 2-3 2-5 0-7-2-2-5-1-10 5Z"
          fill="#7ed6ff"
          opacity=".72"
        />
      </svg>
    );
  }

  if (name === "moon" || name === "night") {
    return (
      <svg className={`${className} ${common}`} viewBox="0 0 64 64" aria-hidden="true">
        <circle cx="32" cy="32" r="30" fill={name === "moon" ? "#08263a" : "transparent"} />
        <path d="M43 52c-16 1-29-10-29-25 0-9 5-17 13-22-3 15 6 30 23 34-4 6-7 10-7 13Z" fill="currentColor" />
        <path d="M50 39c-6 10-18 14-30 8 11 11 28 9 38-2-3-2-5-4-8-6Z" fill="currentColor" opacity=".55" />
      </svg>
    );
  }

  if (name === "tide") {
    return (
      <svg className={`${className} ${common}`} viewBox="0 0 64 64" aria-hidden="true">
        <circle cx="32" cy="32" r="30" fill="#08263a" />
        <g fill="none" stroke="#9ec7ef" strokeLinecap="round" strokeWidth="5">
          <path d="M12 22c7-7 13 7 20 0s13 7 20 0" />
          <path d="M12 34c7-7 13 7 20 0s13 7 20 0" />
          <path d="M12 46c7-7 13 7 20 0s13 7 20 0" />
        </g>
      </svg>
    );
  }

  if (name === "depth") {
    return (
      <svg className={`${className} ${common}`} viewBox="0 0 64 64" aria-hidden="true">
        <rect x="14" y="25" width="42" height="14" rx="2" fill="none" stroke="#facc15" strokeWidth="3" transform="rotate(-45 35 32)" />
        <g stroke="#facc15" strokeLinecap="round" strokeWidth="2">
          <path d="M20 44l-4-4" />
          <path d="M27 37l-5-5" />
          <path d="M34 30l-4-4" />
          <path d="M41 23l-5-5" />
        </g>
      </svg>
    );
  }

  if (name === "anchor") {
    return (
      <svg className={`${className} ${common}`} viewBox="0 0 64 64" aria-hidden="true">
        <circle cx="32" cy="10" r="6" fill="none" stroke="currentColor" strokeWidth="4" />
        <path d="M32 16v38" stroke="currentColor" strokeLinecap="round" strokeWidth="5" />
        <path d="M20 25h24" stroke="currentColor" strokeLinecap="round" strokeWidth="5" />
        <path d="M15 39c2 12 11 18 17 18s15-6 17-18" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="5" />
        <path d="M11 42l5-7 7 5M53 42l-5-7-7 5" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" />
      </svg>
    );
  }

  if (name === "compass") {
    return (
      <svg className={`${className} ${common}`} viewBox="0 0 64 64" aria-hidden="true">
        <circle cx="32" cy="32" r="27" fill="#08263a" stroke="#d6e7f7" strokeWidth="2" />
        <path d="M46 14 35 39 18 47l11-25 17-8Z" fill="#d6e7f7" />
        <path d="M46 14 35 39l-6-17 17-8Z" fill="#8db4d5" />
      </svg>
    );
  }

  if (name === "map") {
    return (
      <svg className={className} viewBox="0 0 64 64" aria-hidden="true">
        <path d="M9 14 24 8l16 6 15-6v42l-15 6-16-6-15 6V14Z" fill="currentColor" />
        <path d="M24 8v42M40 14v42" stroke="rgba(2,8,18,0.42)" strokeWidth="4" />
      </svg>
    );
  }

  if (name === "copy") {
    return (
      <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
        <path d="M8 8h10v12H8z" fill="none" stroke="currentColor" strokeWidth="1.8" />
        <path d="M5 15H3V3h10v2" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
      </svg>
    );
  }

  if (name === "clock") {
    return (
      <svg className={className} viewBox="0 0 32 32" aria-hidden="true">
        <circle cx="16" cy="16" r="12" fill="none" stroke="currentColor" strokeWidth="2.6" />
        <path d="M16 8v9l6 3" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="2.6" />
      </svg>
    );
  }

  if (name === "satellite") {
    return (
      <svg className={className} viewBox="0 0 64 64" aria-hidden="true">
        <path d="M16 38 38 16l10 10-22 22-10-10Z" fill="currentColor" />
        <path d="M8 30 30 8M20 42 42 20M30 52 52 30" stroke="currentColor" strokeWidth="5" />
      </svg>
    );
  }

  return (
    <svg className={`${className} ${common}`} viewBox="0 0 64 64" aria-hidden="true">
      <circle cx="32" cy="32" r="28" fill="#08263a" stroke="#d6e7f7" strokeWidth="2" />
    </svg>
  );
}

function SimplifiedVouPescarLogo() {
  return (
    <div className="relative flex h-[78px] w-[78px] items-center justify-center overflow-hidden rounded-[18px] border border-cyan-300/20 bg-[linear-gradient(145deg,#073665,#061932_64%,#03101f)] shadow-[0_10px_24px_rgba(0,0,0,0.32),0_0_18px_rgba(34,211,238,0.12),inset_0_1px_0_rgba(255,255,255,0.12)]">
      <svg className="h-[66px] w-[66px]" viewBox="0 0 72 72" aria-hidden="true">
        <circle cx="33" cy="39" r="22" fill="none" stroke="#0ea5c8" strokeWidth="4.2" opacity=".72" />
        <path d="M18 46c13 7 31 4 39-8" fill="none" stroke="#1fb9d6" strokeLinecap="round" strokeWidth="3" opacity=".62" />
        <path d="M24 22c-4 9-5 20-1 29" fill="none" stroke="#118ab2" strokeLinecap="round" strokeWidth="2.6" opacity=".42" />
        <path
          d="M50 12c-3 14-8 25-17 34-5 5-12 7-16 1-4-6 3-13 11-8"
          fill="none"
          stroke="#f6b81f"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="6.2"
        />
        <path
          d="M30 43c2 8-2 13-8 14-6 1-11-3-12-9"
          fill="none"
          stroke="#f6b81f"
          strokeLinecap="round"
          strokeWidth="5.6"
        />
        <circle cx="54" cy="11" r="5.5" fill="none" stroke="#facc15" strokeWidth="4" />
        <path d="M50 12 57 4" stroke="#facc15" strokeLinecap="round" strokeWidth="4" />
      </svg>
    </div>
  );
}

function PreviewGlass({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`border border-cyan-200/16 bg-[#031421]/92 shadow-[0_24px_76px_rgba(0,0,0,0.56),0_0_28px_rgba(34,211,238,0.12),0_0_40px_rgba(16,185,129,0.055),inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-xl ${className}`}
    >
      {children}
    </div>
  );
}

function ScoreGauge() {
  return (
    <div className="relative flex min-h-[188px] items-center justify-center px-4">
      <div className="absolute h-[198px] w-[198px] rounded-full bg-[conic-gradient(from_235deg,#ff3b30_0deg,#ff3b30_48deg,#ff9820_49deg,#ffe45c_112deg,#26d77a_168deg,#26d77a_236deg,transparent_237deg)] shadow-[0_0_22px_rgba(34,211,238,0.1),0_0_26px_rgba(16,185,129,0.07)] [mask:radial-gradient(circle,transparent_0_66px,#000_67px_80px,transparent_81px)]" />
      <div className="absolute h-[154px] w-[154px] rounded-full bg-[radial-gradient(circle_at_50%_34%,rgba(255,255,255,0.045),transparent_36%),#06111a] shadow-[inset_0_0_26px_rgba(0,0,0,0.48)]" />
      <div className="absolute left-1/2 top-1/2 z-[8] h-[3px] w-[69px] origin-left -translate-y-1/2 rotate-[-36deg] rounded-full bg-[linear-gradient(90deg,rgba(35,211,122,0.18)_0%,#27d77a_62%,#4ade80_100%)] shadow-[0_0_10px_rgba(52,211,153,0.72)]" />
      <div className="absolute left-1/2 top-1/2 z-[9] h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border border-emerald-200/45 bg-[#09231f] shadow-[0_0_10px_rgba(52,211,153,0.42)]" />
      <div className="relative z-10 mt-1 text-center">
        <div className="text-[48px] font-black leading-none text-white drop-shadow-[0_5px_14px_rgba(0,0,0,0.56)]">
          81
        </div>
      </div>
      <div className="absolute bottom-[-2px] left-1/2 right-0 z-10 flex w-full -translate-x-1/2 flex-col items-center text-center">
        <div className="text-[18px] font-black leading-none tracking-[0.12em] text-yellow-300 drop-shadow-[0_0_10px_rgba(250,204,21,0.44)]">
          ★★★
        </div>
        <div className="mt-1.5 text-[20px] font-black leading-none text-lime-400 drop-shadow-[0_0_10px_rgba(132,204,22,0.2)]">
          Excelente
        </div>
      </div>
    </div>
  );
}

function TimeBar() {
  return (
    <div className="mt-7 px-4">
      <div className="relative h-12 rounded-2xl bg-[radial-gradient(ellipse_at_center,rgba(34,211,238,0.11),transparent_70%)]">
        <div className="absolute left-4 right-4 top-[20px] h-5 rounded-full bg-[linear-gradient(90deg,rgba(12,31,47,0.12),#f3b81e_24%,#ffe75a_55%,#79dd62_86%,rgba(12,31,47,0.16))] shadow-[0_0_28px_rgba(250,204,21,0.52),0_0_34px_rgba(34,211,238,0.15)]" />
        <div className="absolute left-[15%] top-[-5px] text-5xl drop-shadow-[0_0_18px_rgba(250,204,21,0.86)]">☀</div>
        <div className="absolute right-[12%] top-[-5px] text-5xl drop-shadow-[0_0_18px_rgba(250,204,21,0.86)]">☀</div>
        <div className="absolute inset-x-3 bottom-0 h-px bg-cyan-100/30" />
        {["0h", "6h", "12h", "18h", "24h"].map((time, index) => (
          <div
            key={time}
            className="absolute bottom-[-24px] flex -translate-x-1/2 flex-col items-center gap-1 text-xs text-zinc-200"
            style={{ left: `${index * 25}%` }}
          >
            <span className="h-3 w-px bg-cyan-100/35" />
            {time}
          </div>
        ))}
      </div>
    </div>
  );
}

function ConditionCard({
  icon,
  label,
  value,
  note,
  status,
}: {
  icon: PreviewIconName;
  label: string;
  value: string;
  note: string;
  status: string;
}) {
  return (
    <div className="min-h-[156px] rounded-xl border border-cyan-200/14 bg-[linear-gradient(145deg,rgba(8,47,58,0.82),rgba(2,12,23,0.9))] p-5 shadow-[0_14px_30px_rgba(0,0,0,0.16),0_0_18px_rgba(34,211,238,0.05),inset_0_1px_0_rgba(255,255,255,0.065)]">
      <div className="grid grid-cols-[64px_1fr] gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#062235] shadow-[0_0_18px_rgba(34,211,238,0.12),inset_0_1px_0_rgba(255,255,255,0.08)]">
          <PreviewIcon name={icon} className="h-[54px] w-[54px]" />
        </div>
        <div className="min-w-0">
          <div className="text-sm font-black uppercase tracking-[0.03em] text-cyan-300">{label}</div>
          <div className="mt-2 text-[24px] font-black leading-tight text-white">{value}</div>
          <div className="mt-2 text-sm leading-snug text-zinc-200">{note}</div>
        </div>
      </div>
      <div className="mt-4 flex items-center gap-2 text-sm font-bold uppercase text-lime-400">
        <span className="h-2.5 w-2.5 rounded-full bg-lime-400 shadow-[0_0_12px_rgba(163,230,53,0.85)]" />
        {status}
      </div>
    </div>
  );
}

export default function PremiumPanelPreview({ onClose }: PremiumPanelPreviewProps) {
  const coordinates = "-25.483339, -48.451338";

  function copyCoordinates() {
    void navigator.clipboard?.writeText(coordinates);
  }

  return (
    <div
      className="map-control-overlay fixed inset-0 z-[9500] overflow-auto bg-[#03151f] text-white"
      onClick={(event) => event.stopPropagation()}
      onPointerDown={(event) => event.stopPropagation()}
    >
      <div className="fixed inset-0 bg-[linear-gradient(rgba(2,12,20,0.56),rgba(2,12,20,0.74)),url('https://tile.openstreetmap.org/10/424/594.png')] bg-cover bg-center opacity-95" />
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_70%_22%,rgba(34,211,238,0.22),transparent_35%),linear-gradient(90deg,rgba(2,6,23,0.1),rgba(8,145,178,0.35))]" />

      <div className="relative mx-auto grid min-h-screen w-full max-w-[1720px] grid-cols-[320px_minmax(680px,1fr)_356px] grid-rows-[1fr_auto] gap-8 p-6">
        <div className="pointer-events-none absolute left-5 top-5 flex items-center gap-3.5 rounded-[24px] border border-cyan-300/18 bg-[#061224]/90 p-3 pr-6 shadow-[0_16px_44px_rgba(0,0,0,0.48),0_0_24px_rgba(34,211,238,0.13),inset_0_1px_0_rgba(255,255,255,0.07)] backdrop-blur-xl">
          <SimplifiedVouPescarLogo />
          <div className="pt-0.5">
            <div className="text-[29px] font-black leading-none tracking-tight">
              VOU<span className="text-yellow-300">PESCAR</span>
            </div>
            <div className="mt-2 text-[15px] leading-none text-zinc-200">Seu lugar, sua pescaria</div>
          </div>
        </div>

        <div className="pointer-events-none col-start-1 row-start-1 flex flex-col justify-between pt-36">
          <div className="ml-5 mt-5 w-14 overflow-hidden rounded-3xl shadow-[0_16px_44px_rgba(0,0,0,0.42)]">
            <div className="flex h-14 items-center justify-center bg-white text-3xl font-black text-slate-900">+</div>
            <div className="flex h-14 items-center justify-center border-t border-zinc-300 bg-white text-3xl font-black text-slate-900">−</div>
          </div>
          <div className="mb-9 ml-6 flex h-16 w-16 items-center justify-center rounded-full border border-cyan-100/20 bg-slate-950/90 text-center text-2xl font-black leading-none shadow-[0_16px_42px_rgba(0,0,0,0.45)]">
            ▲<br />
            N
          </div>
        </div>

        <PreviewGlass className="col-start-2 row-start-1 place-self-center rounded-3xl p-8">
          <div className="relative overflow-hidden rounded-[26px] border border-cyan-200/18 bg-[radial-gradient(circle_at_18%_24%,rgba(34,211,238,0.13),transparent_36%),radial-gradient(circle_at_68%_18%,rgba(250,204,21,0.1),transparent_24%),linear-gradient(135deg,rgba(5,38,50,0.94),rgba(2,12,23,0.9)_58%,rgba(5,46,43,0.76))] px-6 pb-5 pt-6 shadow-[0_22px_52px_rgba(0,0,0,0.28),0_0_34px_rgba(34,211,238,0.09),inset_0_1px_0_rgba(255,255,255,0.08)]">
            <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(125,211,252,0.58),rgba(190,242,100,0.38),transparent)]" />
            <div className="grid grid-cols-[minmax(0,1fr)_60px] items-start gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-cyan-200/20 bg-cyan-100/8 text-[26px] leading-none text-white shadow-[0_0_20px_rgba(34,211,238,0.12),inset_0_1px_0_rgba(255,255,255,0.08)]">
                    <svg className="h-7 w-7" viewBox="0 0 32 32" aria-hidden="true">
                      <path
                        d="M16 29s10-9.2 10-17A10 10 0 0 0 6 12c0 7.8 10 17 10 17Z"
                        fill="currentColor"
                      />
                      <circle cx="16" cy="12" r="3.8" fill="#08263a" />
                    </svg>
                  </span>
                  <div className="text-[31px] font-black uppercase leading-none tracking-[0.025em] text-white drop-shadow-[0_3px_12px_rgba(0,0,0,0.55)]">
                    Ponto selecionado
                  </div>
                </div>
                <div className="mt-4 inline-flex max-w-full items-center gap-2 rounded-2xl border border-lime-300/14 bg-[#041b22]/72 p-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.055)]">
                  <div className="flex min-h-[42px] shrink-0 items-center gap-3 rounded-xl bg-emerald-300/[0.035] px-3 text-[24px] font-black leading-none text-lime-400 drop-shadow-[0_0_10px_rgba(132,204,22,0.16)]">
                    <span className="text-[28px] leading-none">●</span>
                    <span className="whitespace-nowrap">{coordinates}</span>
                  </div>
                  <button
                    type="button"
                    onClick={copyCoordinates}
                    className="inline-flex h-[42px] shrink-0 items-center gap-2.5 rounded-full border border-cyan-300/62 bg-[radial-gradient(circle_at_28%_18%,rgba(255,255,255,0.12),transparent_34%),linear-gradient(135deg,rgba(13,148,136,0.92),rgba(8,86,118,0.94)_48%,rgba(3,22,45,0.96))] px-5 text-[13px] font-black uppercase leading-none tracking-[0.025em] text-cyan-50 shadow-[0_0_18px_rgba(34,211,238,0.3),0_0_34px_rgba(14,165,233,0.16),inset_0_1px_0_rgba(255,255,255,0.18),inset_0_0_0_1px_rgba(103,232,249,0.12)] transition duration-200 hover:border-cyan-200/78 hover:shadow-[0_0_24px_rgba(34,211,238,0.4),0_0_44px_rgba(14,165,233,0.22),inset_0_1px_0_rgba(255,255,255,0.2),inset_0_0_0_1px_rgba(103,232,249,0.18)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200/65"
                  >
                    <PreviewIcon name="copy" className="h-[17px] w-[17px] text-cyan-100 drop-shadow-[0_0_8px_rgba(103,232,249,0.48)]" />
                    COPIAR COORDENADAS
                  </button>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="group relative flex h-[58px] w-[58px] items-center justify-center overflow-hidden rounded-full border border-cyan-100/22 bg-[radial-gradient(circle_at_35%_24%,rgba(255,255,255,0.11),transparent_34%),linear-gradient(145deg,rgba(8,38,52,0.9),rgba(2,10,21,0.78))] text-[40px] font-light leading-none text-white shadow-[0_14px_30px_rgba(0,0,0,0.28),0_0_18px_rgba(34,211,238,0.1),inset_0_1px_0_rgba(255,255,255,0.12),inset_0_0_0_1px_rgba(34,211,238,0.06)] backdrop-blur-md transition duration-200 hover:border-cyan-200/44 hover:bg-[radial-gradient(circle_at_35%_24%,rgba(255,255,255,0.14),transparent_34%),linear-gradient(145deg,rgba(10,50,62,0.95),rgba(15,18,28,0.84))] hover:shadow-[0_16px_34px_rgba(0,0,0,0.3),0_0_24px_rgba(34,211,238,0.18),0_0_18px_rgba(248,113,113,0.08),inset_0_1px_0_rgba(255,255,255,0.14),inset_0_0_0_1px_rgba(34,211,238,0.1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200/55"
                aria-label="Fechar preview premium"
              >
                <span className="pointer-events-none absolute inset-2 rounded-full border border-cyan-100/10 shadow-[inset_0_0_18px_rgba(34,211,238,0.045)] transition duration-200 group-hover:border-cyan-100/18" />
                <span className="relative -mt-0.5 drop-shadow-[0_2px_8px_rgba(0,0,0,0.65)] transition duration-200 group-hover:text-cyan-50">
                  ×
                </span>
              </button>
            </div>

            <div className="mt-5 grid grid-cols-[minmax(300px,0.92fr)_1px_minmax(330px,1fr)] items-center rounded-[22px] border border-emerald-300/13 bg-[linear-gradient(135deg,rgba(4,25,30,0.58),rgba(2,12,23,0.52))] px-5 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.055)]">
              <ScoreGauge />
              <div className="h-[158px] bg-[linear-gradient(180deg,transparent,rgba(125,211,252,0.2),rgba(190,242,100,0.12),transparent)]" />
              <div className="px-8 text-center">
                <div className="flex items-center justify-center gap-3 text-base font-black uppercase text-cyan-300">
                  <PreviewIcon name="clock" className="h-7 w-7 text-cyan-300" />
                  Melhor horario
                </div>
                <div className="mt-3 text-[38px] font-black leading-none text-yellow-200">14h às 17h</div>
                <div className="mt-3 text-[15px] text-white">Baseado nas condições atuais</div>
                <TimeBar />
              </div>
            </div>
          </div>

          <div className="mt-7 flex items-center gap-3">
            <h2 className="text-[22px] font-black uppercase text-cyan-300 drop-shadow-[0_0_12px_rgba(34,211,238,0.2)]">
              Condições atuais
            </h2>
            <span className="flex h-7 w-7 items-center justify-center rounded-full border border-cyan-200/48 bg-cyan-300/10 text-sm font-black text-cyan-100 shadow-[0_0_14px_rgba(34,211,238,0.16),inset_0_1px_0_rgba(255,255,255,0.12)]">
              i
            </span>
            <span className="h-px flex-1 bg-[linear-gradient(90deg,rgba(34,211,238,0.42),rgba(34,211,238,0.08),transparent)]" />
          </div>

          <div className="mt-4 grid grid-cols-3 gap-4">
            {conditionCards.map((card) => (
              <ConditionCard key={card.label} {...card} />
            ))}
          </div>

          <div className="mt-5 grid grid-cols-3 divide-x divide-cyan-100/12 rounded-2xl border border-cyan-300/16 bg-[linear-gradient(135deg,rgba(7,42,52,0.84),rgba(2,12,23,0.9))] p-5 shadow-[0_12px_30px_rgba(0,0,0,0.16),inset_0_1px_0_rgba(255,255,255,0.055)]">
            {[
              ["depth", "Profundidade estimada", "Indisponivel"],
              ["anchor", "Tipo de fundo", "Nao informado"],
              ["compass", "Distancia da costa", "1.2 km"],
            ].map(([icon, label, value]) => (
              <div key={label} className="grid grid-cols-[52px_1fr] gap-4 px-4 first:pl-0 last:pr-0">
                <div className="flex h-[52px] w-[52px] items-center justify-center">
                  <PreviewIcon
                    name={icon as PreviewIconName}
                    className={`h-12 w-12 ${icon === "depth" ? "" : "text-cyan-100"}`}
                  />
                </div>
                <div>
                  <div className="text-sm font-black uppercase text-cyan-300">{label}</div>
                  <div className="mt-2 text-xl font-black text-white">{value}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-3 flex items-center justify-center text-center text-[13px] font-medium text-cyan-50/70 drop-shadow-[0_0_8px_rgba(34,211,238,0.12)]">
            <span className="border-t border-cyan-100/10 px-10 pt-2">
              Dados baseados em condições atuais e podem mudar.
            </span>
          </div>
        </PreviewGlass>

        <div className="col-start-3 row-start-1 flex flex-col gap-5 pt-1">
          <PreviewGlass className="min-h-[206px] rounded-3xl p-6">
            <div className="mb-5 text-lg font-black uppercase text-cyan-300">Modo do mapa</div>
            <div className="grid grid-cols-2 gap-3.5">
              {mapModes.map((mode) => (
                <button
                  key={mode.label}
                  className={`grid min-h-[58px] grid-cols-[34px_1fr] items-center gap-3 rounded-xl border px-4 text-left text-[15px] font-black uppercase shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] ${
                    mode.active
                      ? "border-cyan-100/45 bg-[linear-gradient(135deg,#2ad4d2,#079f9a)] text-white shadow-[0_0_24px_rgba(34,211,238,0.34),inset_0_1px_0_rgba(255,255,255,0.18)]"
                      : "border-cyan-100/15 bg-[#071827]/64 text-white"
                  }`}
                >
                  <PreviewIcon name={mode.icon} className="h-8 w-8 text-white" />
                  {mode.label}
                </button>
              ))}
            </div>
          </PreviewGlass>

          {[
            ["/icons/adicionar-captura.png", "+ Captura", ""],
            ["/icons/meus-lugares.png", "+ Lugar", ""],
            ["/icons/minhas-capturas.png", "Minhas Capturas", "65"],
          ].map(([src, label, badge]) => (
            <PreviewGlass key={label} className="flex min-h-[116px] items-center rounded-3xl px-8 py-4">
              <button className="relative flex w-full items-center gap-7 text-left text-[24px] font-black uppercase leading-tight tracking-wide">
                <span className="relative h-[88px] w-[88px] shrink-0">
                  <img src={src} alt="" className="h-full w-full object-contain drop-shadow-[0_0_18px_rgba(250,204,21,0.28)]" />
                  {badge && (
                    <span className="absolute -right-5 top-1 flex h-10 min-w-10 items-center justify-center rounded-full bg-white px-2 text-xl font-black text-slate-950">
                      {badge}
                    </span>
                  )}
                </span>
                {label}
              </button>
            </PreviewGlass>
          ))}

          <PreviewGlass className="flex min-h-[292px] flex-col justify-between rounded-3xl p-8">
            <div className="grid grid-cols-[72px_1fr] gap-5">
              <div className="flex h-[72px] w-[72px] items-start justify-center">
                <PreviewIcon name="anchor" className="h-[66px] w-[66px]" />
              </div>
              <div>
                <div className="text-lg font-black uppercase text-cyan-300">Pronto para futuro</div>
                <p className="mt-3 text-base leading-relaxed text-zinc-200">
                  Profundidade estimada e tipo de fundo ja preparados para receber dados quando houver fonte confiavel.
                </p>
              </div>
            </div>
            <div className="h-20 rounded-b-2xl bg-[radial-gradient(ellipse_at_center,rgba(148,163,184,0.25),transparent_55%)] opacity-80" />
          </PreviewGlass>
        </div>

        <PreviewGlass className="col-span-2 col-start-1 row-start-2 grid grid-cols-[1fr_1fr] gap-6 rounded-2xl p-5">
          <div>
            <div className="mb-4 text-lg font-black uppercase text-cyan-300">✓ O que não foi alterado</div>
            <div className="grid grid-cols-7 gap-4 text-center text-xs text-zinc-200">
              {["Logica de dados", "Capturas", "Meus Lugares", "Spot oficial", "LocalStorage", "IndexedDB", "GPS"].map(
                (item) => (
                  <div key={item} className="border-r border-cyan-100/10 last:border-r-0">
                    <div className="mb-2 text-3xl text-cyan-100/80">◎</div>
                    {item}
                  </div>
                )
              )}
            </div>
          </div>
          <div>
            <div className="mb-2 text-lg font-black uppercase text-cyan-300">Datas sempre assim</div>
            <div className="space-y-1 text-lg text-zinc-200">
              <div>▣ 04/06/2026 • 15h59</div>
              <div>▣ 04/06/2026 • 09h15</div>
              <div className="text-base">Nunca usar virgula entre data e hora.</div>
            </div>
          </div>
        </PreviewGlass>
      </div>
    </div>
  );
}
