import type { Metadata, Viewport } from "next";
import { RegistrarServiceWorker } from "@/components/RegistrarServiceWorker";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Sistema Lucauto", template: "%s · Lucauto" },
  description: "Sistema interno da Lucauto Empreendimentos.",
  robots: { index: false, follow: false },
  appleWebApp: { capable: true, title: "Lucauto", statusBarStyle: "default" },
  icons: { icon: "/icons/icone-192.png", apple: "/icons/icone-192.png" },
};

export const viewport: Viewport = {
  themeColor: [{ media: "(prefers-color-scheme: light)", color: "#0B1F3A" }, { media: "(prefers-color-scheme: dark)", color: "#08111F" }],
  width: "device-width",
  initialScale: 1,
};

// Aplica o tema antes de a página aparecer (evita o "piscar" branco no modo escuro).
const SCRIPT_TEMA = `(function(){try{var t=localStorage.getItem("tema");var d=t==="escuro"||(t!=="claro"&&window.matchMedia("(prefers-color-scheme: dark)").matches);document.documentElement.dataset.tema=d?"escuro":"claro";}catch(e){}})();`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: SCRIPT_TEMA }} />
      </head>
      <body className="min-h-dvh antialiased">
        {children}
        <RegistrarServiceWorker />
      </body>
    </html>
  );
}
