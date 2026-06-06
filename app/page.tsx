"use client";

import dynamic from "next/dynamic";

const Map = dynamic(() => import("@/components/Map"), {
  ssr: false,
});

export default function Home() {
  return (
    <main className="relative h-screen w-screen overflow-hidden">
      <div className="absolute left-3 top-3 z-[600] sm:left-4 sm:top-4">
        <div className="flex max-w-[calc(100vw-24px)] items-center gap-2 rounded-2xl bg-black/82 px-2.5 py-2 shadow-[0_12px_34px_rgba(0,0,0,0.42)] backdrop-blur-md sm:gap-3 sm:px-3">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#020b16] sm:h-16 sm:w-16">
            <img
              src="/icons/logonovo-simples.png"
              alt="VouPescar"
              className="h-full w-full object-contain [clip-path:inset(3px_round_12px)]"
            />
          </div>

          <div className="min-w-0 text-left">
            <h1 className="text-lg font-black leading-none tracking-tight sm:text-2xl">
              <span className="text-white">Vou</span>
              <span className="text-[#f6b81f]">Pescar</span>
            </h1>
            <p className="mt-0.5 truncate text-[11px] text-zinc-400 sm:text-sm">
              Seu lugar, sua pescaria
            </p>
          </div>
        </div>
      </div>

      <Map />
    </main>
  );
}
