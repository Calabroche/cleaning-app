import type { CapacitorConfig } from "@capacitor/cli";

// L'app iOS/Android est une coquille native qui pointe vers l'app web
// déployée sur Vercel (server.url). Next.js utilise des Server Components,
// Server Actions et l'auth par cookies : ça ne peut pas être exporté en
// bundle statique embarqué, donc pas de mode "offline" pour l'instant.
// `shell/` n'est qu'un webDir de secours, non utilisé au runtime.
const isDev = process.env.CAP_ENV === "development";

const config: CapacitorConfig = {
  appId: "com.calabroche.cleaningapp",
  appName: "Cleaning App",
  webDir: "shell",
  server: {
    url: isDev ? "http://localhost:3000" : "https://cleaning-app.vercel.app",
    cleartext: isDev,
  },
};

export default config;
