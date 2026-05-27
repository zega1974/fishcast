"use client";

import dynamic from "next/dynamic";

const Map = dynamic(() => import("@/components/Map"), {
  ssr: false,
});

export default function Home() {
  return (
    <main className="relative h-screen w-screen overflow-hidden">
      <div className="absolute left-3 top-3 z-[600] sm:left-4 sm:top-4">
        <div className="flex max-w-[calc(100vw-24px)] items-center gap-2 rounded-2xl border border-cyan-500/20 bg-black/82 px-2 py-2 shadow-[0_12px_34px_rgba(0,0,0,0.42)] backdrop-blur-md sm:gap-3 sm:px-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#020b16] sm:h-12 sm:w-12">
            <img
              src="/icons/app-logo.png"
              alt="FishCastPR"
              className="h-full w-full object-contain"
            />
          </div>

          <div className="min-w-0 text-left">
            <h1 className="text-lg font-black leading-none tracking-tight text-white sm:text-2xl">
              FishCastPR
            </h1>
            <p className="mt-0.5 truncate text-[11px] text-zinc-400 sm:text-sm">
              Mapa inteligente de pesca do Paraná
            </p>
          </div>
        </div>
      </div>

      <Map />
    </main>
  );
}
