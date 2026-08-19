// Régénère docs/documentation-technique.docx. C'est un instantané de l'état
// actuel du projet (pas un historique) : quand l'architecture ou les
// fonctionnalités changent, éditer directement le contenu ci-dessous puis
// relancer `node docs/source/generate-doc-technique.js`. Toujours le même
// fichier de sortie, pas de nouveau doc daté.

const path = require("path");
const {
  Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell,
  WidthType, ShadingType, AlignmentType, Header, Footer, PageNumber, PageBreak,
} = require("docx");

const DARK = "1a1a1a";
const GREY = "666666";
const ACCENT = "2563eb";
const LIGHT_BG = "F3F4F6";

function h1(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 360, after: 160 },
    children: [new TextRun({ text, bold: true, size: 30, color: DARK })],
  });
}

function h2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 220, after: 100 },
    children: [new TextRun({ text, bold: true, size: 24, color: ACCENT })],
  });
}

function p(text, opts = {}) {
  return new Paragraph({
    spacing: { after: 120 },
    children: [new TextRun({ text, size: 21, color: DARK, ...opts })],
  });
}

function bullet(text, level = 0) {
  return new Paragraph({
    bullet: { level },
    spacing: { after: 60 },
    children: [new TextRun({ text, size: 21, color: DARK })],
  });
}

function code(text) {
  return new Paragraph({
    spacing: { after: 60 },
    children: [new TextRun({ text, size: 19, color: "0f172a", font: "Courier New" })],
  });
}

function cell(text, opts = {}) {
  const { width, bold = false, shade = null, color = DARK, align = AlignmentType.LEFT } = opts;
  return new TableCell({
    width: { size: width, type: WidthType.DXA },
    shading: shade ? { type: ShadingType.CLEAR, fill: shade } : undefined,
    margins: { top: 100, bottom: 100, left: 120, right: 120 },
    children: [new Paragraph({ alignment: align, children: [new TextRun({ text, bold, size: 20, color })] })],
  });
}

function twoColTable(rows, widths = [3200, 6400]) {
  const header = new TableRow({
    tableHeader: true,
    children: [
      cell(rows[0][0], { width: widths[0], bold: true, shade: DARK, color: "FFFFFF" }),
      cell(rows[0][1], { width: widths[1], bold: true, shade: DARK, color: "FFFFFF" }),
    ],
  });
  const body = rows.slice(1).map((r, i) =>
    new TableRow({
      children: [
        cell(r[0], { width: widths[0], bold: true, shade: i % 2 ? LIGHT_BG : null }),
        cell(r[1], { width: widths[1], shade: i % 2 ? LIGHT_BG : null }),
      ],
    })
  );
  return new Table({ width: { size: 9600, type: WidthType.DXA }, columnWidths: widths, rows: [header, ...body] });
}

const stackRows = [
  ["Composant", "Choix technique"],
  ["Framework web", "Next.js 16 (App Router, Server Components, Server Actions)"],
  ["Langage", "TypeScript (strict)"],
  ["Style", "Tailwind CSS 4 — tokens de design dédiés : app-* (clair « Naturel », app employé) et adm-* (sombre « Hôtellerie », admin + super-admin)"],
  ["Runtime", "Node.js 24.19.0 (voir .nvmrc)"],
  ["Base de données", "Supabase Postgres"],
  ["Authentification", "Supabase Auth — Google OAuth + email/mot de passe"],
  ["Stockage fichiers", "Supabase Storage (bucket privé task-photos)"],
  ["Mobile", "Capacitor 8 (coquilles iOS / Android autour de l'app web)"],
  ["Hébergement web", "Vercel"],
  ["Monitoring performance", "Vercel Speed Insights (Web Vitals réels : TTFB, LCP, CLS, INP)"],
  ["Dépôt de code", "GitHub — Calabroche/cleaning-app (privé)"],
];

const tableRows = [
  ["Table", "Rôle"],
  ["profiles", "1 ligne par utilisateur (auth.users). Rôle employee/admin/super_admin, nom, email, téléphone. Créée automatiquement à l'inscription via trigger."],
  ["apartments", "Appartements/logements à nettoyer : nom, adresse, notes (codes d'accès, consignes), checklist appliquée (template_id)."],
  ["checklist_templates", "Modèles de checklist réutilisables (ex: Standard, Départ locataire, Grand ménage), assignés à un ou plusieurs appartements."],
  ["checklist_items", "Items d'un modèle : pièce, libellé, exigence photo (aucune / après / avant+après), ordre d'affichage."],
  ["tasks", "Une tâche de ménage = un appartement, une date, un·e employé·e assigné·e, un statut (à faire / en cours / terminé / reporté), un flag urgent, validation admin (validated_at/by, redo_reason)."],
  ["task_items", "Copie figée des items du modèle au moment de la création de la tâche (trigger seed_task_items) — modifier le modèle après coup ne change pas les tâches déjà assignées. État coché (done_at/done_by) par item."],
  ["task_photos", "Photos déposées par les employés, rattachées à un item et typées avant/après (kind), stockées dans Supabase Storage."],
  ["notifications", "Notifications envoyées par l'admin (ciblées ou en broadcast) : info, rappel, urgent."],
  ["activity_log", "Journal d'activité : connexions, changements de statut, dépôts/coches d'item, actions super-admin — consultable par l'admin (qui fait quoi, quand)."],
];

const employeeFeatures = [
  "Connexion via Google ou email/mot de passe",
  "Planning personnel : liste des tâches à venir groupées par jour",
  "Détail d'une tâche piloté par checklist, regroupée par pièce (Cuisine, Salle de bain...)",
  "Coche un item terminé ; passage automatique de la tâche en \"en cours\" dès le premier item coché",
  "Capture photo avant/après par item quand la checklist l'exige, directement depuis l'appareil photo",
  "Impossible de terminer le ménage tant que tous les items ne sont pas cochés",
  "Écran Profil : statistiques du mois (ménages, photos envoyées), historique des ménages avec statut de validation, déconnexion",
  "Liste de notifications reçues (info, rappel, urgent), marquage comme lues",
];

const adminFeatures = [
  "Accès web uniquement, protégé par rôle (admin ou super_admin)",
  "Vue d'ensemble : tâches du jour, urgences en cours, nombre d'employés, flux d'activité récente",
  "Gestion des appartements (création, consultation, assignation d'une checklist par appartement)",
  "Checklists : consultation des modèles réutilisables par pièce (édition en base pour l'instant, UI en lecture seule)",
  "Preuves : file de ménages terminés à valider, comparaison photos avant/après par item, validation ou demande de reprise (renvoie la tâche en \"à faire\" et notifie l'employé·e en urgent)",
  "Planning : assignation de tâches à un·e employé·e pour une date donnée, avec option \"urgent\" (notifie immédiatement)",
  "Équipe : liste des employé·es, rôle, date de dernière connexion, promotion/rétrogradation admin",
  "Notifications : envoi ciblé ou en broadcast, historique des envois",
  "Traçabilité complète : qui se connecte, quand, et quelles actions sont effectuées",
];

const superAdminFeatures = [
  "Section /super-admin séparée, réservée au rôle super_admin (accès développeur, distinct de l'admin métier)",
  "Vue d'ensemble : répartition des comptes par rôle, volume d'événements journalisés, liens directs vers Vercel (Observability/Speed Insights, déploiements), Supabase et Google Cloud",
  "Comptes & sessions : tous les comptes avec dernière connexion réelle (auth.users.last_sign_in_at), changement de rôle, déconnexion forcée (invalide toutes les sessions actives), suppression de compte",
  "Activité : journal complet (200 derniers événements) tous comptes confondus, y compris les actions super-admin elles-mêmes",
  "La performance applicative (temps de réponse API, Web Vitals) n'est pas réimplémentée en interne : renvoi vers les dashboards natifs Vercel/Supabase, plus fiables et déjà disponibles gratuitement",
];

const todayFr = new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });

const doc = new Document({
  sections: [
    {
      properties: { page: { size: { width: 11907, height: 16840 } } },
      headers: {
        default: new Header({
          children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: "Cleaning App — Documentation technique", size: 16, color: GREY })] })],
        }),
      },
      footers: {
        default: new Footer({
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [new TextRun({ text: "Page ", size: 16, color: GREY }), new TextRun({ children: [PageNumber.CURRENT], size: 16, color: GREY })],
            }),
          ],
        }),
      },
      children: [
        new Paragraph({ spacing: { after: 60 }, children: [new TextRun({ text: "DOCUMENTATION TECHNIQUE", bold: true, size: 36, color: DARK })] }),
        new Paragraph({ spacing: { after: 60 }, children: [new TextRun({ text: "Cleaning App", size: 26, color: ACCENT, bold: true })] }),
        new Paragraph({ spacing: { after: 300 }, children: [new TextRun({ text: `Dernière mise à jour : ${todayFr}`, size: 18, color: GREY })] }),

        h1("1. Objectif du produit"),
        p("Application de gestion d'équipe de ménage à deux profils :"),
        bullet("Employé·e (app mobile + web) : consulte son planning, met à jour le statut de ses tâches, dépose des photos, reçoit des notifications."),
        bullet("Admin / directeur (web uniquement) : assigne les tâches, suit qui se connecte et fait quoi, envoie des notifications urgentes, garde un historique d'activité complet."),
        p("Distribution prévue à un petit nombre de personnes au départ (lien de téléchargement privé), avec une architecture qui reste compatible avec une publication ultérieure sur l'App Store et le Play Store."),

        h1("2. Architecture générale"),
        p("Un seul codebase Next.js sert les deux usages, avec un découpage par rôle :"),
        bullet("/admin/* — dashboard du boss, protégé par rôle, pensé pour être utilisé en navigateur web."),
        bullet("Le reste (/dashboard, /tasks/:id, /notifications, /login...) — l'app employé, utilisable en navigateur ET dans les apps mobiles."),
        p("Point d'architecture important : Next.js utilise des Server Components, des Server Actions et une authentification par cookies. Ces mécanismes ne peuvent pas être exportés en bundle statique. Les apps iOS et Android ne sont donc pas des bundles embarqués : Capacitor pointe sa configuration server.url vers l'app déployée sur Vercel, et les apps natives sont des coquilles WebView qui chargent le site en direct. Conséquence directe : pas de mode hors-ligne pour l'instant, une connexion internet est nécessaire."),

        h1("3. Stack technique"),
        twoColTable(stackRows, [3200, 6400]),

        h1("4. Structure du dépôt"),
        code("cleaning-app/"),
        code("├─ src/app/                  Next.js App Router"),
        code("│  ├─ (auth)/                login, signup"),
        code("│  ├─ auth/                   callback OAuth, signout"),
        code("│  ├─ (employee)/            dashboard, tasks/:id (+ items/:itemId), notifications, profile"),
        code("│  ├─ admin/                  overview, planning, apartments, checklists, proofs, users, notifications"),
        code("│  └─ super-admin/            overview, users (comptes/sessions), activity"),
        code("├─ src/lib/supabase/         clients Supabase (browser / server / middleware / admin)"),
        code("├─ src/types/                types TypeScript du schéma DB"),
        code("├─ src/proxy.ts              protection des routes par session/rôle"),
        code("├─ supabase/migrations/      schéma SQL + RLS (0001_init.sql, 0002_super_admin.sql)"),
        code("├─ docs/                      cette documentation + le rapport d'activité"),
        code("├─ capacitor.config.ts       config des coquilles iOS/Android"),
        code("├─ ios/                      projet Xcode généré par Capacitor"),
        code("└─ android/                  projet Android Studio généré par Capacitor"),

        h1("5. Modèle de données"),
        p("Schéma défini dans supabase/migrations/ (0001_init.sql puis 0002_super_admin.sql), avec Row Level Security activée sur toutes les tables."),
        twoColTable(tableRows, [2400, 7200]),
        h2("Règles de sécurité (RLS) — logique générale"),
        bullet("Un·e employé·e ne voit et ne modifie que ses propres tâches, photos et notifications (+ les notifications broadcast)."),
        bullet("La fonction is_admin() couvre les rôles admin ET super_admin : toute policy \"admin peut faire X\" s'applique donc automatiquement aux deux, sans duplication. is_super_admin() existe séparément pour les cas qui doivent rester exclusifs au super-admin."),
        bullet("Le bucket de stockage task-photos est privé : accès réservé aux utilisateurs authentifiés, upload réservé à l'assigné·e de la tâche ou à l'admin."),
        bullet("Les actions les plus sensibles (déconnexion forcée, suppression de compte) ne passent pas par RLS : elles utilisent la clé service_role côté serveur (src/lib/supabase/admin.ts), jamais exposée au client."),

        h1("6. Authentification"),
        bullet("Deux méthodes : Google OAuth (via Supabase Auth) et email/mot de passe."),
        bullet("Un trigger Postgres (handle_new_user) crée automatiquement une ligne profiles à chaque inscription, avec le rôle par défaut employee."),
        bullet("Le premier compte admin est promu manuellement en SQL ; ensuite, les admins peuvent promouvoir d'autres comptes depuis l'écran \"Équipe\", et les super-admins depuis \"Comptes & sessions\"."),
        bullet("Chaque connexion (Google ou mot de passe) est enregistrée dans activity_log — c'est ce qui alimente le suivi \"qui se connecte, quand\"."),
        bullet("src/proxy.ts protège les routes : redirection vers /login si non connecté, hors de /admin si ni admin ni super_admin, hors de /super-admin si le rôle n'est pas exactement super_admin."),

        h1("7. Fonctionnalités — Espace employé"),
        ...employeeFeatures.map((f) => bullet(f)),

        h1("8. Fonctionnalités — Espace admin"),
        ...adminFeatures.map((f) => bullet(f)),

        h1("9. Fonctionnalités — Espace super-admin (dev)"),
        ...superAdminFeatures.map((f) => bullet(f)),

        h1("10. Déploiement & infrastructure"),
        twoColTable(
          [
            ["Service", "Détail"],
            ["GitHub", "Calabroche/cleaning-app (privé), connecté à Vercel — chaque push sur main redéploie automatiquement"],
            ["Vercel", "Projet calabroches-projects/cleaning-app, URL de production cleaning-app-ten-gamma.vercel.app"],
            ["Supabase", "Projet dédié (base de données + auth + storage), distinct des autres projets Florian (the-little-explorer, etc.)"],
            ["Google Cloud", "Projet dédié \"Cleaning App\" pour le client OAuth Google — écran de consentement en mode Test (jusqu'à 100 utilisateurs sans validation Google)"],
          ],
          [2400, 7200]
        ),
        new Paragraph({ children: [new PageBreak()] }),

        h1("11. Mobile (Capacitor)"),
        p("Commandes utiles :"),
        code("npm run cap:sync      # après un changement de config/plugin — IMPORTANT :"),
        code("                      # aucun effet sur les apps déjà installées tant que"),
        code("                      # ce n'est pas relancé (piège vécu : URL non à jour)"),
        code("npm run cap:ios       # ouvre ios/App/App.xcworkspace dans Xcode"),
        code("npm run cap:android   # ouvre le projet dans Android Studio"),
        p("Distribution limitée envisagée :"),
        bullet("iOS : TestFlight (test externe) — nécessite un compte Apple Developer Program (99$/an)."),
        bullet("Android : Google Play Console, piste de test interne/fermé — nécessite un compte développeur (25$ une fois)."),

        h1("12. État actuel & reste à faire"),
        h2("Fait"),
        bullet("Squelette complet fonctionnel, déployé et testé en conditions réelles (connexion Google vérifiée, comptes admin et super-admin opérationnels)."),
        bullet("Schéma de données et sécurité en place, y compris le rôle super-admin (comptes, sessions, suppression)."),
        bullet("Authentification Google + email/mot de passe opérationnelle en production."),
        bullet("Monitoring de performance réel (Vercel Speed Insights) actif."),
        bullet("Design system intégré : checklists par pièce, photos avant/après par item, file de validation admin avec demande de reprise, écrans employé/admin restylés. Déclencheur de copie des items (seed_task_items) testé en conditions réelles."),
        h2("Reste à faire"),
        bullet("Comptes Apple Developer Program et Google Play Console (à créer par Florian)."),
        bullet("sudo xcode-select --switch /Applications/Xcode.app à lancer localement pour pouvoir builder l'app iOS."),
        bullet("Installer Android Studio / le SDK Android pour pouvoir builder l'app Android en local."),
        bullet("Peupler des données réelles (appartements avec checklist assignée, employés, planning) — le dashboard est fonctionnel mais vide."),
        bullet("Édition des modèles de checklist depuis l'admin (actuellement lecture seule dans l'UI ; modifiable en base via la table checklist_items)."),
        bullet("Notifications push natives (actuellement les notifications sont in-app, pas de push OS)."),
      ],
    },
  ],
});

const outPath = path.join(__dirname, "..", "documentation-technique.docx");
Packer.toBuffer(doc).then((buf) => {
  require("fs").writeFileSync(outPath, buf);
  console.log("written", outPath);
});
