import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "VouPescar",
    short_name: "VouPescar",
    description: "Seu lugar, sua pescaria",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#020b16",
    theme_color: "#020b16",
    icons: [
      {
        src: "/icons/logonovo-simples.png",
        sizes: "1254x1254",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/logonovo-simples.png",
        sizes: "1254x1254",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
