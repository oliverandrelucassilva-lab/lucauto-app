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

export const viewport: Viewport = { themeColor: "#0B1F3A", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR">
      <body className="min-h-dvh antialiased">
        {children}
        <RegistrarServiceWorker />
      </body>
    </html>
  );
}
