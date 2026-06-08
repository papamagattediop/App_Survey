<div align="center">

# ACCES · Enquête Électrification Rurale

**Système de collecte de données terrain pour l'évaluation de l'impact**  
**de l'électrification rurale sur les ménages vulnérables au Sénégal**

---

![Version](https://img.shields.io/badge/version-1.0.0-1A3C5E?style=for-the-badge)
![Platform](https://img.shields.io/badge/platform-Android%20%7C%20Web-F59E0B?style=for-the-badge)
![Stack](https://img.shields.io/badge/stack-Expo%20%7C%20Next.js%20%7C%20Supabase-10B981?style=for-the-badge)
![Status](https://img.shields.io/badge/statut-En%20production-22c55e?style=for-the-badge)

</div>

---

## Vue d'ensemble

ACCES est une plateforme complète de collecte et de supervision de données terrain, développée pour l'enquête sur l'impact de l'électrification rurale dans les zones de **Kaolack** et **Fatick** (départements de Nioro et Foundiougne), au Sénégal.

Le système se compose de deux volets complémentaires :

| Composant | Technologie | Rôle |
|-----------|-------------|------|
| **Application mobile** | React Native (Expo) | Saisie terrain par les agents enquêteurs |
| **Dashboard superviseur** | Next.js 14 | Suivi en temps réel, validation, export |
| **Backend** | Supabase (PostgreSQL) | Base de données, authentification, sync |

---

## Architecture

```
ansd-enquete/
├── mobile/          # Application Android (agents de terrain)
│   ├── src/
│   │   ├── app/             # Pages (expo-router)
│   │   │   ├── (tabs)/      # Accueil, Nouveau questionnaire, Sync, Stats
│   │   │   ├── login.tsx    # Authentification agent
│   │   │   └── index.tsx    # Routage initial
│   │   ├── constants/
│   │   │   └── sections.ts  # Structure des 6 sections du questionnaire
│   │   ├── lib/
│   │   │   ├── offline.ts   # Stockage local AsyncStorage
│   │   │   ├── gpsTask.ts   # Tracking GPS arrière-plan
│   │   │   └── supabase.ts  # Client Supabase mobile
│   │   └── store/
│   │       └── authStore.ts # État d'authentification (Zustand)
│   └── app.config.ts        # Config Expo / EAS
│
├── dashboard/       # Interface superviseur (web)
│   ├── src/
│   │   ├── app/
│   │   │   ├── (dashboard)/
│   │   │   │   ├── dashboard/   # Tableau de bord (KPIs, graphique, agents)
│   │   │   │   ├── questionnaires/  # Liste, aperçu, validation, suppression
│   │   │   │   └── export/      # Export CSV / Excel
│   │   │   ├── api/auth/login/  # Route handler d'authentification
│   │   │   └── login/           # Page de connexion superviseur
│   │   ├── components/
│   │   │   ├── charts/          # CollectesChart (Recharts)
│   │   │   ├── layout/          # Sidebar
│   │   │   └── ui/              # KpiCard, AgentCard, Badge
│   │   └── lib/
│   │       ├── supabase.ts      # Client navigateur
│   │       ├── supabase-server.ts  # Client serveur (cookies)
│   │       ├── queries.ts       # Requêtes Supabase
│   │       └── auth-server.ts   # Lecture session serveur
│   └── middleware.ts            # Protection des routes
│
└── supabase/        # Schéma et migrations base de données
```

---

## Fonctionnalités

### Application mobile (agents)

- **Authentification sécurisée** par identifiant agent (AGT-001, AGT-002...)
- **Questionnaire en 6 sections** structurées et validées :
  - **A** · Identification du ménage (région, département, village, GPS)
  - **B** · Caractéristiques socio-économiques + vulnérabilité
  - **C** · Accès à l'énergie avant raccordement
  - **D** · Conditions de raccordement électrique (2020-2026)
  - **E** · Impacts du raccordement (revenus, AGR, usage)
  - **F** · Données communautaires *(réservée au chef de village)*
- **Liaison automatique région/département** : sélectionner Fatick sélectionne Foundiougne, et vice versa
- **Mode hors-ligne** : les questionnaires sont sauvegardés localement et synchronisés dès que le réseau est disponible
- **Tracking GPS en arrière-plan** pour le suivi de position des agents
- **Mises à jour OTA** (Over-The-Air) sans réinstallation

### Dashboard superviseur

- **Tableau de bord en temps réel** : KPIs (total, aujourd'hui, en cours, soumis/validés), graphique sur 14 jours, fiches agents
- **Gestion des questionnaires** : recherche, filtres multi-critères, aperçu détaillé, validation, suppression avec confirmation
- **Export de données** : CSV et Excel avec filtres par agent, période, statut
- **Anonymisation** des agents (Agent 1, Agent 2 / Admin)
- **Protection des routes** par middleware Next.js

---

## Zones géographiques couvertes

| Région | Département | Type de zone |
|--------|-------------|--------------|
| Fatick | Foundiougne | Rural / Péri-urbain |
| Kaolack | Nioro | Rural / Péri-urbain |

---

## Stack technique

### Mobile
| Outil | Usage |
|-------|-------|
| [Expo SDK 51](https://expo.dev) | Framework React Native |
| [expo-router](https://expo.github.io/router) | Navigation fichier |
| [Supabase JS](https://supabase.com) | Backend as a Service |
| [Zustand](https://zustand-demo.pmnd.rs) | Gestion d'état global |
| [AsyncStorage](https://react-native-async-storage.github.io) | Persistance locale |
| [expo-location](https://docs.expo.dev/versions/latest/sdk/location/) | GPS + tâches de fond |
| [EAS Build / EAS Update](https://docs.expo.dev/eas/) | Build cloud + OTA |

### Dashboard
| Outil | Usage |
|-------|-------|
| [Next.js 14](https://nextjs.org) | Framework React (App Router) |
| [Tailwind CSS](https://tailwindcss.com) | Styles utilitaires |
| [@supabase/ssr](https://supabase.com/docs/guides/auth/server-side) | Auth côté serveur |
| [Recharts](https://recharts.org) | Visualisation de données |
| [date-fns](https://date-fns.org) | Manipulation de dates |
| [xlsx](https://sheetjs.com) | Export Excel |
| [papaparse](https://www.papaparse.com) | Export CSV |
| [Vercel](https://vercel.com) | Hébergement et déploiement |

### Backend
| Outil | Usage |
|-------|-------|
| [Supabase](https://supabase.com) | PostgreSQL + Auth + Realtime |

---

## Base de données

```sql
agents            -- Comptes agents et superviseurs
questionnaires    -- Données d'identification des ménages
reponses          -- Réponses aux questions (code_variable / valeur)
positions_agents  -- Historique de position GPS des agents
```

---

## Installation et développement

### Prérequis

- Node.js 18+
- npm ou yarn
- Compte [Supabase](https://supabase.com) (projet configuré)
- Compte [Expo](https://expo.dev) + EAS CLI pour le mobile

### Variables d'environnement

**Mobile** (`mobile/.env`):
```env
EXPO_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
```

**Dashboard** (`dashboard/.env.local`):
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
```

### Lancer en développement

```bash
# Dashboard
cd dashboard
npm install
npm run dev
# Accessible sur http://localhost:3000

# Mobile
cd mobile
npm install
npx expo start
# Scanner le QR code avec Expo Go
```

### Build mobile (production)

```bash
cd mobile

# Build APK Android
npx eas build --platform android --profile preview

# Mise à jour OTA (sans nouveau build)
npx eas update --branch production --message "Description de la mise à jour"
```

### Déploiement dashboard (Vercel)

```bash
cd dashboard
# Via l'interface Vercel : importer le repo GitHub, sélectionner /dashboard comme Root Directory
# Ajouter les variables d'environnement dans le dashboard Vercel
```

---

## Comptes de démonstration

| Rôle | Identifiant | Usage |
|------|-------------|-------|
| Superviseur | `SUPV-001` | Accès dashboard web |
| Agent 1 | `AGT-001` | Application mobile |
| Agent 2 | `AGT-002` | Application mobile |

> Les mots de passe sont gérés dans Supabase Auth et communiqués séparément.

---

## Questionnaire : structure des sections

```
Section A  ·  Identification du ménage
           └─ Région, département, village, milieu, GPS, nom chef, chef de village ?

Section B  ·  Caractéristiques socio-économiques
           └─ Taille ménage, niveau instruction, occupation, dépenses, sécurité alimentaire

Section C  ·  Accès à l'énergie (avant raccordement)
           └─ Sources d'énergie utilisées, coûts, équipements

Section D  ·  Raccordement électrique
           └─ Type d'abonnement, année de raccordement (2020-2026), coût, satisfaction

Section E  ·  Impacts du raccordement
           └─ Effets sur revenus, activités génératrices (AGR), santé, éducation, sécurité

Section F  ·  Données communautaires  [chef de village uniquement]
           └─ Infrastructures collectives, impact sur la communauté
```

---

## Captures d'écran

> *Captures à ajouter après déploiement final.*

| App mobile | Dashboard superviseur |
|:----------:|:---------------------:|
| *Login agent* | *Tableau de bord* |
| *Questionnaire* | *Liste questionnaires* |
| *Synchronisation* | *Export données* |

---

## Licence

Usage réservé — tous droits réservés.

---

<div align="center">

Développé avec soin · Sénégal 2026

</div>
