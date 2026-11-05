import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Sistema Lucauto",
    short_name: "Lucauto",
    description: "Contratos e gestão da Lucauto Empreendimentos.",
    lang: "pt-BR",
    start_url: "/",
    display: "standalone",
    background_color: "#FFFFFF",
    theme_color: "#0B1F3A",
    icons: [
      { src: "/icons/icone-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icone-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icons/icone-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
