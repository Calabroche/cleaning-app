"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const supabase = createClient();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    setDone(true);
  }

  if (done) {
    return (
      <p className="text-center text-sm text-app-body">
        Compte créé. Vérifie ta boîte mail pour confirmer ton adresse, puis
        connecte-toi.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-app-body">Nom complet</label>
          <input
            type="text"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full rounded-control border border-app-line bg-app-surface px-3 py-2.5 text-sm text-app-ink focus:border-accent focus:outline-none"
          />
        </div>
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
            minLength={6}
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
          {loading ? "Création..." : "Créer mon compte"}
        </button>
      </form>

      <p className="text-center text-sm text-app-muted">
        Déjà un compte ?{" "}
        <Link href="/login" className="font-medium text-app-ink underline">
          Se connecter
        </Link>
      </p>
    </div>
  );
}
