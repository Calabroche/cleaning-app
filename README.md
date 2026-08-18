# Cleaning App

App de gestion d'équipe de ménage : planning, tâches, photos, notifications.
Une web app Next.js unique, servie sur Vercel, enveloppée par Capacitor pour
donner des apps iOS et Android natives (voir "Architecture" ci-dessous).

## Stack

- Next.js 16 (App Router, Server Actions), TypeScript, Tailwind CSS 4
- Supabase (Postgres + Auth + Storage) — voir `supabase/migrations/0001_init.sql`
- Capacitor 8 pour les coquilles iOS (Xcode) et Android (Android Studio)
- Déploiement web : Vercel

## Architecture

Un seul codebase Next.js sert deux usages :

- **`/admin/*`** — dashboard du boss, accessible uniquement en navigateur web
  (Vercel), protégé par rôle (`profiles.role = 'admin'`).
- **Le reste (`/dashboard`, `/tasks/:id`, `/notifications`, `/login`...)** —
  l'app employé, accessible en navigateur ET via les apps mobiles.

Les apps iOS/Android ne sont **pas un bundle statique embarqué** : Next.js
utilise des Server Components, Server Actions et l'auth par cookies, donc
elles ne peuvent pas être exportées en HTML/JS statique. Capacitor pointe
donc `server.url` (voir `capacitor.config.ts`) vers l'app déployée sur
Vercel — les apps natives sont des coquilles WebView qui chargent le site
en direct. Ça veut dire : pas de mode hors-ligne pour l'instant, et une
connexion internet est nécessaire. C'est le choix le plus pragmatique vu la
stack (auth cookies + server actions), et suffisant pour une distribution à
un petit nombre de personnes.

## Setup

```bash
nvm use          # Node 24.19.0 (voir .nvmrc)
npm install
cp .env.local.example .env.local   # remplir avec les clés Supabase
npm run dev
```

### Base de données

Applique `supabase/migrations/0001_init.sql` sur ton projet Supabase (SQL
Editor du dashboard, ou `supabase db push` si tu utilises la CLI). Ça crée :

- `profiles` (rôle `admin`/`employee`, créé automatiquement à l'inscription)
- `apartments`, `tasks`, `task_photos`, `notifications`, `activity_log`
- Toutes les policies RLS (un employé ne voit que ses propres tâches, un
  admin voit tout)
- Le bucket de storage privé `task-photos`

Le tout premier compte doit être promu admin manuellement en SQL :

```sql
update public.profiles set role = 'admin' where email = 'toi@exemple.com';
```

### Auth Google

Le bouton "Continuer avec Google" est câblé côté app, mais il faut activer
le provider Google dans Supabase (Authentication > Providers) avec un
OAuth Client ID/Secret créé sur Google Cloud Console. Sans ça, seul
l'email/mot de passe fonctionne.

## Mobile (Capacitor)

```bash
npm run cap:sync      # après un changement de capacitor.config.ts ou de plugin
npm run cap:ios       # ouvre ios/App/App.xcworkspace dans Xcode
npm run cap:android   # ouvre le projet dans Android Studio
```

Prérequis locaux :

- **iOS** : Xcode installé, et `xcode-select` pointé dessus :
  `sudo xcode-select --switch /Applications/Xcode.app`
- **Android** : Android Studio + SDK Android installés.

### Distribution limitée (lien de téléchargement, pas de recherche publique)

- **iOS** : TestFlight (test externe). Nécessite un compte Apple Developer
  Program (99$/an). Une fois le build uploadé via Xcode/App Store Connect,
  TestFlight génère un lien d'invitation à partager.
- **Android** : Google Play Console, piste de "test interne" ou "test
  fermé" (25$ une fois). Le lien d'inscription au test n'apparaît pas dans
  les résultats de recherche publics du Play Store.

## Déploiement web

```bash
vercel link     # une fois, pour rattacher le repo au projet Vercel
vercel deploy --prod
```

Penser à configurer les variables d'environnement (`NEXT_PUBLIC_SUPABASE_URL`,
`NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`) sur Vercel, et
à mettre à jour `server.url` dans `capacitor.config.ts` avec l'URL finale du
déploiement.
