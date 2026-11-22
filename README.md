# EVENT PRO — Plateforme d'Organisation & Réservation d'Événements (Casablanca, Maroc)

> *« Vos événements, notre expertise. Vos moments, notre passion. »*

Application web full-stack conçue pour **Cloudflare Pages**, **Cloudflare Pages Functions (Workers)**, **Cloudflare D1**, **Cloudflare R2** et **Cloudflare Turnstile**.

- **Langue par défaut** : Français (`fr-MA`), avec architecture prête pour l'Arabe (`ar`, mode RTL).
- **Devise** : Dirham marocain (`MAD`).
- **Fuseau horaire** : `Africa/Casablanca`.

---

## Architecture du projet

- `src/` — Application React + TypeScript + Tailwind CSS (accueil, services, réservation 5 étapes, devis, galerie avec lightbox, à propos, contact, espace client, tableau de bord administrateur).
- `functions/api/[[route]].ts` — API REST Cloudflare Pages Functions compatible Workers (Web Standards `Request`/`Response`, `crypto.subtle` PBKDF2-SHA256, sessions Bearer D1, rate limiting D1, Turnstile, D1 SQL paramétré, upload/lecture R2).
- `migrations/` — Schéma relationnel SQLite/D1 (`0001_initial.sql`) et données initiales (`0002_seed.sql`).
- `wrangler.jsonc` — Configuration Cloudflare Pages, bindings D1 (`DB`) et R2 (`MEDIA_BUCKET`).
- `dev/local-worker-adapter.ts` — Adaptateur de développement local uniquement (utilise `node:sqlite` en dev sur port 3000 ; non inclus dans le build Cloudflare).

---

## Déploiement sur Cloudflare (Pages + D1 + R2 + Turnstile)

### 1. Installer les dépendances

```bash
npm install
```

### 2. Lancer le projet en local

Démarrage rapide avec base SQLite locale auto-migrée :

```bash
npm run dev
```

Ou avec Wrangler en mode émulation Cloudflare Pages :

```bash
npm run build
npx wrangler pages dev dist --d1=DB --r2=MEDIA_BUCKET
```

### 3. Créer la base de données Cloudflare D1

Connectez-vous à votre compte Cloudflare puis créez la base D1 :

```bash
npx wrangler login
npx wrangler d1 create event-pro-db
```

Copiez le `database_id` affiché dans `wrangler.jsonc` sous `d1_databases[0].database_id`.

### 4. Appliquer les migrations SQL

En local (pour Wrangler) :

```bash
npx wrangler d1 migrations apply event-pro-db --local
```

En production sur Cloudflare D1 :

```bash
npx wrangler d1 migrations apply event-pro-db --remote
```

### 5. Créer le bucket Cloudflare R2

```bash
npx wrangler r2 bucket create event-pro-media
```

Vérifiez que `bucket_name` dans `wrangler.jsonc` correspond bien à `event-pro-media`.

### 6. Configurer les variables d'environnement & secrets

Dans le tableau de bord Cloudflare Pages (**Settings → Environment variables**) ou via CLI :

- `TURNSTILE_SECRET_KEY` *(Secret)* : clé secrète Cloudflare Turnstile.
- `VITE_TURNSTILE_SITE_KEY` *(Variable Build)* : clé publique Turnstile pour les formulaires.
- `ADMIN_PASSCODE` *(Secret optionnel)* : code d'accès administrateur dédié (si absent, l'interface `/admin` propose lors du premier lancement la création sécurisée du premier compte administrateur en base D1).
- `ALLOWED_ORIGIN` *(Optionnel)* : domaine de production (ex. `https://eventpro.ma`).

### 7. Connecter Cloudflare Pages à GitHub

1. Poussez ce dépôt sur GitHub.
2. Dans **Cloudflare Dashboard → Workers & Pages → Create → Pages → Connect to Git**.
3. Sélectionnez votre dépôt et configurez :
   - **Build command** : `npm run build`
   - **Build output directory** : `dist`
4. Dans **Settings → Functions → Bindings**, liez :
   - **D1 database** : Variable `DB` → `event-pro-db`
   - **R2 bucket** : Variable `MEDIA_BUCKET` → `event-pro-media`

### 8. Déployer le site manuellement (optionnel via CLI)

```bash
npm run build
npx wrangler pages deploy dist
```

### 9. Configurer un nom de domaine personnalisé

1. Dans **Cloudflare Pages → Custom domains → Set up a custom domain**.
2. Ajoutez votre domaine (ex. `www.eventpro-casablanca.ma`).
3. Cloudflare configure automatiquement le DNS CNAME et le certificat SSL/TLS.

### 10. Tester le site déployé

1. Vérifiez `/api/health` → doit retourner `{"ok":true,"service":"EVENT PRO API","timezone":"Africa/Casablanca"}`.
2. Testez les pages publiques (`/services`, `/galerie`, `/reserver`, `/devis`, `/contact`).
3. Ouvrez `/admin` pour initialiser votre accès administrateur (ou vous connecter avec `ADMIN_PASSCODE`), puis mettez à jour votre vrai numéro WhatsApp `+212...` dans **Paramètres**.
4. Vérifiez l'envoi d'une demande de réservation, d'un devis et la création d'un compte client dans `/client`.
