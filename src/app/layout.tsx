import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";

// Ajoutée à l'écran d'accueil, la version web doit se comporter comme
// l'app native : plein écran, sans barre d'adresse, même icône.
export const metadata: Metadata = {
  title: "Cleaning App",
  description: "Gestion du planning de ménage et suivi des équipes",
  manifest: "/manifest.webmanifest",
  icons: { apple: "/icon.png" },
  appleWebApp: {
    capable: true,
    title: "Cleaning App",
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  themeColor: "#0e8f6f",
  viewportFit: "cover",
};

// Anti-flash : pose data-theme sur <html> avant le premier rendu, à partir
// du choix explicite stocké en local (ThemeToggle). Sans valeur stockée,
// on laisse l'attribut absent — le CSS retombe sur la préférence système.
const themeInitScript = `
try {
  var t = localStorage.getItem("theme");
  if (t === "light" || t === "dark") document.documentElement.setAttribute("data-theme", t);
} catch (e) {}
`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fr" className="h-full antialiased">
      <head>
        <Script id="theme-init" strategy="beforeInteractive">
          {themeInitScript}
        </Script>
      </head>
      <body className="min-h-full flex flex-col">
        {children}
        <SpeedInsights />
      </body>
    </html>
  );
}
