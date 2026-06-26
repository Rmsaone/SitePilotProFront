# Connexions Backend à implémenter

Ce fichier liste tout ce qui tourne actuellement avec des données mockées et devra être branché sur l'API réelle quand le back sera prêt.

---

## Auth

### Ce qui manque côté back
- `POST /api/v1/login` — connexion (email + password → token Sanctum)
- `POST /api/v1/register` — inscription
- `POST /api/v1/logout` — déconnexion (invalider le token)
- `GET /api/v1/user` — récupérer l'utilisateur connecté (existe déjà, protégé par Sanctum)

### Ce qui est mocké côté front
- `app/pages/login.vue` — le bouton "Se connecter" redirige vers `/` sans vrai appel API
- Pas de gestion de token (à stocker dans un cookie ou localStorage)
- Pas de middleware de protection des routes (toutes accessibles sans auth)

### À faire côté front quand l'API sera prête
- Créer un composable `useAuth` avec `login()`, `logout()`, `me()`
- Stocker le token Sanctum (cookie httpOnly recommandé)
- Créer un middleware Nuxt pour protéger les routes (rediriger vers `/login` si non connecté)
- Brancher le formulaire de login sur `POST /api/v1/login`
- Afficher les infos utilisateur dans le header/sidebar

---

## Clients

### Endpoints back (tous sous `/api/v1/`)
| Méthode | Route | Action |
|---|---|---|
| GET | `/clients` | Liste paginée (20/page) |
| GET | `/clients/:client_id` | Détail d'un client |
| POST | `/clients` | Créer un client |
| PUT | `/clients/:client_id` | Modifier un client |
| DELETE | `/clients/:client_id` | Supprimer un client |

### Ce qui est mocké côté front
- `app/data/clients.ts` — données statiques utilisées dans la table

### À faire côté front quand l'API sera prête
- Créer un composable `useClientsApi` avec `list()`, `show(id)`, `create(data)`, `update(id, data)`, `destroy(id)`
- Remplacer `clientsData` dans `Clients/index.vue` par un appel `useFetch('/api/v1/clients')`
- Gérer la pagination serveur (le back pagine à 20, le front pagine côté client pour l'instant)
- Créer le formulaire de création/édition client (utilise `ShowClientResource` avec tous les champs)

### Champs du formulaire create/update
`contact_name`, `private_name`, `email`, `company`, `phone`, `street`, `city`, `zip_code`, `country`, `client_type` (`pro` | `private`), `siret`, `tva_intra`

---

## Chantiers (Worksites)

### Endpoints back (tous sous `/api/v1/`)
| Méthode | Route | Action |
|---|---|---|
| GET | `/worksites` | Liste paginée (20/page) |
| GET | `/worksites/:worksite_id` | Détail d'un chantier |
| POST | `/worksites` | Créer un chantier |
| PUT | `/worksites/:worksite_id` | Modifier un chantier |
| DELETE | `/worksites/:worksite_id` | Supprimer un chantier |

### Ce qui est mocké côté front
- `app/data/worksite.ts` — données statiques utilisées dans la table

### À faire côté front quand l'API sera prête
- Créer un composable `useWorksitesApi`
- Remplacer `worksitesData` dans `Worksites/index.vue` par `useFetch('/api/v1/worksites')`
- Gérer la pagination serveur
- Créer le formulaire de création/édition chantier

### Champs du formulaire create/update
`client_id`, `name_worksite`, `description`, `start_date`, `end_date`, `worksite_priority` (`low` | `medium` | `high` | `critical`), `worksite_status` (`pending` | `paused` | `in_progress` | `finished` | `canceled`), `street`, `city`, `zip_code`, `country`

---

## Autres ressources (à développer)

| Ressource | Endpoint | Statut back | Statut front |
|---|---|---|---|
| Devis | `GET /api/v1/quotes` | ✅ Existe | ❌ Pas de page |
| Factures clients | `GET /api/v1/invoice_clients` | ✅ Existe | ❌ Pas de page |
| Factures sous-traitants | `GET /api/v1/invoice_subcontractors` | ✅ Existe | ❌ Pas de page |
| Factures fournisseurs | `GET /api/v1/invoice_suppliers` | ✅ Existe | ❌ Pas de page |
| Lignes de produits | `GET /api/v1/ProductLines` | ✅ Existe | ❌ Pas de page |
| Main d'œuvre | `GET /api/v1/workforces` | ✅ Existe | ❌ Pas de page |

---

## Variable d'environnement à créer

Quand le back sera en ligne, ajouter dans `.env` :
```
NUXT_PUBLIC_API_BASE=http://localhost/api/v1
```

Et dans `nuxt.config.ts` :
```ts
runtimeConfig: {
  public: {
    apiBase: process.env.NUXT_PUBLIC_API_BASE
  }
}
```

---

## Dépendances front à installer avant de brancher l'API
```bash
pnpm add @tanstack/vue-table scule
```
