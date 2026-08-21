"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Capacitor } from "@capacitor/core";
import { Browser } from "@capacitor/browser";
import { App } from "@capacitor/app";
import { createClient } from "@/lib/supabase/client";

const NATIVE_REDIRECT = "cleaningapp://auth-callback";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError("Email ou mot de passe incorrect.");
      setLoading(false);
      return;
    }

    if (data.user) {
      await supabase.from("activity_log").insert({
        profile_id: data.user.id,
        action: "login",
        metadata: { method: "password", user_agent: navigator.userAgent },
      });
    }

    router.push("/");
    router.refresh();
  }

  async function handleGoogleLogin() {
    setError(null);

    // Google refuse de s'authentifier dans une WebView embarquée (celle de
    // Capacitor). Sur natif : on ouvre l'auth dans un vrai navigateur système
    // in-app (Browser plugin), et on récupère la main via un deep link
    // (cleaningapp://auth-callback) plutôt que de rediriger la WebView elle-même.
    if (Capacitor.isNativePlatform()) {
      setGoogleLoading(true);

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: NATIVE_REDIRECT, skipBrowserRedirect: true },
      });

      if (error || !data?.url) {
        setError("Impossible de démarrer la connexion Google.");
        setGoogleLoading(false);
        return;
      }

      const listener = await App.addListener("appUrlOpen", async ({ url }) => {
        await listener.remove();
        await Browser.close();

        const code = new URL(url).searchParams.get("code");
        if (!code) {
          setError("La connexion Google a échoué.");
          setGoogleLoading(false);
          return;
        }

        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
        if (exchangeError) {
          setError("La connexion Google a échoué.");
          setGoogleLoading(false);
          return;
        }

        router.push("/");
        router.refresh();
      });

      await Browser.open({ url: data.url, presentationStyle: "popover" });
      return;
    }

    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  }

  return (
    <div className="space-y-6">
      <p className="-mt-4 mb-2 text-center text-[15px] text-app-muted">
        Connecte-toi pour lancer ta tournée du jour.
      </p>

      <button
        onClick={handleGoogleLogin}
        type="button"
        disabled={googleLoading}
        className="flex w-full items-center justify-center gap-2 rounded-control border border-app-line bg-app-surface px-4 py-3 text-sm font-medium text-app-ink shadow-soft disabled:opacity-50"
      >
        {googleLoading ? "Connexion..." : "Continuer avec Google"}
      </button>

      <div className="flex items-center gap-3 text-xs text-app-faint">
        <div className="h-px flex-1 bg-app-line" />
        ou
        <div className="h-px flex-1 bg-app-line" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-app-body">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-control border border-app-line bg-app-surface px-3 py-2.5 text-sm text-app-ink focus:border-accent focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-app-body">Mot de passe</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-control border border-app-line bg-app-surface px-3 py-2.5 text-sm text-app-ink focus:border-accent focus:outline-none"
          />
        </div>

        {error && <p className="text-sm text-warn">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-control bg-accent px-4 py-2.5 text-sm font-medium text-white disabled:opacity-50"
        >
          {loading ? "Connexion..." : "Se connecter"}
        </button>
      </form>

      <p className="text-center text-sm text-app-muted">Pas de compte ? Demande à ton responsable.</p>
    </div>
  );
}
