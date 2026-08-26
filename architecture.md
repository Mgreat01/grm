# Référentiel d'architecture — GRM

> État de référence : 26 août 2026. Ce document décrit le dépôt tel qu'il existe à cette date et fixe une cible d'évolution. Il doit être mis à jour lors de toute modification structurante.

## 1. Objet et périmètre

GRM est une API de gestion de rendez-vous médicaux. Elle couvre actuellement l'inscription et la connexion des utilisateurs, l'administration des comptes et spécialités, les disponibilités des médecins, les rendez-vous gérés par la réception et une délégation de réservation automatique à un service HTTP externe.

Le dépôt contient uniquement le backend Node.js. Aucun frontend, worker, pipeline CI/CD ou manifeste de déploiement n'est présent.

## 2. Architecture actuelle

### 2.1 Stack et exécution

| Élément | Choix actuel | Localisation |
|---|---|---|
| Runtime | Node.js, modules ES | `package.json`, `app.js` |
| API HTTP | Express 5 | `app.js` |
| ORM / base | Prisma 6 / MySQL | `prisma/schema.prisma` |
| Authentification | JWT à la connexion, bcrypt | `utilisateurController.js` |
| Appels externes | Axios | `appointmentController.js` |
| E-mail | Nodemailer / SMTP | `src/utils/mailer.js` |
| Documentation | OpenAPI 3 via swagger-jsdoc | `swagger.js`, `apiRoute.js` |
| Développement | nodemon, MailDev | `package.json` |

Le démarrage suit ce flux :

```text
app.js
  -> charge .env
  -> installe JSON + CORS sans restriction
  -> expose Swagger sur /api-docs
  -> monte apiRoute sur /api
  -> installe un gestionnaire d'erreur générique
  -> écoute directement sur PORT
```

### 2.2 Organisation du code

```text
grm/
├── app.js                         # composition et démarrage HTTP couplés
├── swagger.js                     # génération de la spécification OpenAPI
├── src/
│   ├── routes/apiRoute.js         # toutes les routes et annotations Swagger
│   ├── controllers/
│   │   ├── adminController.js
│   │   ├── utilisateurController.js
│   │   ├── medecinController.js
│   │   ├── receptionnisteController.js
│   │   └── appointmentController.js
│   └── utils/mailer.js            # transport SMTP et template HTML
└── prisma/
    ├── schema.prisma              # modèle de données courant
    ├── migrations/                # trois migrations SQL
    └── seed.cjs                   # données de démonstration
```

L'architecture est un MVC partiel : les routes délèguent aux contrôleurs, mais ceux-ci cumulent transport HTTP, validation, règles métier, accès Prisma et orchestration des effets externes. Chaque fichier de contrôleur instancie son propre `PrismaClient`. Il n'existe pas de services métier, repositories, DTO/schémas de validation, middleware d'authentification/autorisation ni couche de configuration typée.

### 2.3 Surface HTTP observée

Toutes les routes sont préfixées par `/api`.

| Domaine | Méthode et chemin | Comportement actuel |
|---|---|---|
| Administration | `GET /admin/users` | liste paginée de tous les utilisateurs |
| Administration | `POST /admin/utilisateurs` | crée et active un utilisateur |
| Administration | `PATCH /admin/utilisateurs/:id/activer` | inverse l'état actif/inactif |
| Spécialités | `POST /admin/specialites` | crée une spécialité |
| Spécialités | `GET /admin/specialites` | liste les spécialités |
| Spécialités | `PUT /admin/specialites/:id` | modifie une spécialité |
| Spécialités | `DELETE /admin/specialites/:id` | supprime une spécialité |
| Médecins | `POST /medecins/disponibilites` | crée une disponibilité pour l'ID fourni dans le body |
| Médecins | `GET /medecins/:medecinId/disponibilites` | liste les disponibilités |
| Médecins | `DELETE /medecins/disponibilites/:id` | supprime une disponibilité |
| Médecins | `GET /medecins/:medecinId/rendezvous` | liste les rendez-vous affectés |
| Réception | `POST /receptionnistes/rendezvous` | crée un rendez-vous manuel |
| Réception | `PUT /receptionnistes/rendezvous/:id` | modifie un rendez-vous |
| Réception | `DELETE /receptionnistes/rendezvous/:id` | supprime un rendez-vous |
| Réception | `GET /receptionnistes/rendezvous` | liste tous les rendez-vous |
| Réception | `GET /receptionnistes/medecins` | liste les médecins actifs |
| Réception | `GET /receptionnistes/symptomes` | liste le référentiel des symptômes |
| Réservation | `POST /auto-schedule` | transmet la demande au service externe configuré |
| Utilisateurs | `POST /utilisateurs/register` | auto-inscription inactive |
| Utilisateurs | `POST /utilisateurs/login` | authentification et émission d'un JWT valable 1 jour |
| Utilisateurs | `GET /utilisateurs/profil` | lit le profil via `req.user.id` non alimenté actuellement |
| Utilisateurs | `PUT /utilisateurs/profil` | modifie le profil via `req.user.id` non alimenté actuellement |

### 2.4 Modèle de données

Le schéma contient cinq entités :

- `Utilisateur` : identité, authentification, type sous forme de chaîne, activation et spécialité optionnelle ; porte les relations médecin vers disponibilités et rendez-vous.
- `Specialite` : référentiel unique, relié aux médecins, rendez-vous et symptômes.
- `Symptome` : référentiel unique, relation plusieurs-à-plusieurs avec spécialités et rendez-vous.
- `Disponibilite` : médecin, date et heures de début/fin stockées en chaînes.
- `RendezVous` : patient dénormalisé, UUID public, état, présence, date/heure, spécialité et médecin optionnels, symptômes plusieurs-à-plusieurs.

Relations principales :

```text
Specialite 1 ─── 0..n Utilisateur (médecin attendu, non contraint en base)
Utilisateur 1 ─── 0..n Disponibilite
Utilisateur 1 ─── 0..n RendezVous (rôle médecin attendu, non contraint en base)
Specialite 1 ─── 0..n RendezVous
Specialite n ─── 0..n Symptome
RendezVous n ─── 0..n Symptome
```

Points d'attention du modèle réel : `type` et `statut` ne sont pas des enums ; date et heure sont séparées de manière ambiguë ; aucune contrainte n'interdit un chevauchement ; le patient d'un rendez-vous n'est pas relié à `Utilisateur` ; les suppressions et règles de conservation ne sont pas définies explicitement.

### 2.5 Flux métier actuels

**Inscription / connexion.** L'utilisateur choisit lui-même un type parmi médecin, patient et réceptionniste. Son compte est créé inactif. La connexion vérifie l'activation et le mot de passe puis signe un JWT. Ce jeton n'est toutefois consommé par aucun middleware.

**Rendez-vous manuel.** La réception fournit les informations patient, le médecin, la spécialité et les horaires. Le contrôleur écrit directement en base puis déclenche un e-mail sans `await`. L'implémentation transmet `symptome`, alors que le schéma attend une relation `symptomes`, ce qui rend la création et la mise à jour incompatibles avec le client Prisma courant.

**Réservation automatique.** L'API joue le rôle de proxy vers `autochedule_api_url`. La persistance, la sélection du médecin et la prévention des conflits sont donc supposées être prises en charge par ce service externe, sans contrat versionné ni mécanisme de résilience local.

**Disponibilités.** Une date et deux chaînes horaires sont enregistrées après vérification de l'existence et de l'activation du médecin. Les bornes, le passé et les chevauchements ne sont pas validés.

### 2.6 Dépendances et frontières externes

- MySQL via `DATABASE_URL`.
- Service de planification via `autochedule_api_url` avec timeout fixe de 10 secondes.
- SMTP via `smtp_host`, `smtp_port`, `smtp_user`, `smtp_pass`.
- Secret JWT via `JWT_SECRET`.

Ces variables sont lues directement dans plusieurs modules. Il n'existe ni validation au démarrage, ni valeur normalisée, ni abstraction permettant de substituer les dépendances en test.

## 3. Architecture cible recommandée

### 3.1 Style architectural

Adopter un **monolithe modulaire en couches**, adapté à la taille actuelle. Une architecture distribuée ajouterait des coûts opérationnels sans bénéfice immédiat. Le service de planification externe reste un adaptateur remplaçable derrière un port applicatif.

Principes :

1. Organisation verticale par domaine (`auth`, `users`, `specialties`, `symptoms`, `availability`, `appointments`, `notifications`).
2. Dépendances dirigées : HTTP → application → domaine ; infrastructure implémente les interfaces attendues par l'application.
3. Contrôleurs minces : extraction de la requête, appel d'un cas d'usage, adaptation de la réponse.
4. Règles métier centralisées dans des services/cas d'usage testables indépendamment d'Express et Prisma.
5. Effets externes derrière des ports (`AppointmentScheduler`, `Mailer`, repositories).
6. Contrat OpenAPI généré ou validé depuis les mêmes schémas que les entrées HTTP.

### 3.2 Arborescence cible

```text
src/
├── server.js                       # écoute réseau et arrêt gracieux
├── app.js                          # fabrique Express, sans listen
├── config/
│   └── env.js                      # validation et normalisation de l'environnement
├── shared/
│   ├── errors/                     # erreurs métier + mapping HTTP
│   ├── http/                       # auth, RBAC, validation, pagination, error handler
│   ├── database/prisma.js          # singleton Prisma et cycle de vie
│   ├── observability/              # logger structuré, métriques, request-id
│   └── security/                   # hash, JWT, rate limiting
├── modules/
│   ├── auth/
│   ├── users/
│   ├── specialties/
│   ├── symptoms/
│   ├── availability/
│   ├── appointments/
│   └── notifications/
│       ├── domain/                 # entités, enums, invariants
│       ├── application/            # cas d'usage et ports
│       ├── infrastructure/         # repository Prisma, SMTP, client HTTP
│       └── http/                   # routes, contrôleurs, schémas DTO
└── docs/openapi.js
```

La structure peut être introduite module par module ; aucune réécriture globale n'est nécessaire.

### 3.3 Responsabilités par couche

| Couche | Responsabilités | Interdictions |
|---|---|---|
| HTTP | routage, validation syntaxique, identité, sérialisation, codes HTTP | requêtes Prisma et règles métier |
| Application | orchestration des cas d'usage, transactions, autorisations contextuelles | dépendance à Express |
| Domaine | statuts, transitions, conflits d'agenda, politiques d'annulation | dépendance à Prisma/SMTP/HTTP |
| Infrastructure | Prisma, SMTP, client du planificateur, logs | décider des règles métier |

### 3.4 Modèle cible

- Remplacer `Utilisateur.type` par un enum `Role` (`ADMIN`, `MEDECIN`, `RECEPTIONNISTE`, `PATIENT`) ou une table de rôles si le multi-rôle est requis.
- Remplacer `RendezVous.statut` par un enum et formaliser les transitions : `EN_ATTENTE → CONFIRME → TERMINE`, avec branches `ANNULE` et `ABSENT`.
- Représenter un créneau par `startsAt` et `endsAt` en UTC ; conserver le fuseau métier dans la configuration. Faire de même pour les rendez-vous.
- Ajouter `patientId` optionnel vers `Utilisateur` tout en conservant un snapshot des coordonnées pour les rendez-vous saisis à l'accueil.
- Ajouter `createdAt`, `updatedAt`, éventuellement `cancelledAt`, `createdById` et un journal d'événements.
- Définir les index au regard des requêtes : rendez-vous `(medecinId, startsAt)`, `(statut, startsAt)`, disponibilités `(medecinId, startsAt)`, recherche patient par téléphone/e-mail.
- Garantir l'absence de double réservation dans une transaction. MySQL ne fournissant pas nativement une contrainte d'exclusion d'intervalles, employer soit des créneaux atomiques avec clé unique, soit un verrou transactionnel et un contrôle de chevauchement.
- Choisir une politique explicite `onDelete` pour chaque relation et privilégier l'annulation/archivage des données médicales opérationnelles à la suppression physique.

### 3.5 Sécurité cible

Chaque route reçoit une politique explicite :

| Zone | Politique cible |
|---|---|
| inscription, connexion, santé | publique, rate-limitée |
| profil | utilisateur authentifié, uniquement sa ressource |
| administration | rôle `ADMIN` |
| disponibilités | médecin propriétaire ou admin ; lecture publique limitée si nécessaire |
| réception | rôle `RECEPTIONNISTE` ou `ADMIN` |
| agenda médecin | médecin propriétaire ou rôle autorisé |
| réservation patient | identité patient ou flux public protégé par anti-abus |

Le middleware doit vérifier signature, expiration, activation et rôle. Les DTO de sortie utilisent une liste blanche et ne retournent jamais `motdepasse`. CORS, taille JSON, Helmet, rate limiting, politique de mots de passe et rotation/révocation des jetons doivent être configurés par environnement.

### 3.6 Transactions et événements

Le cas d'usage `CreateAppointment` doit effectuer dans une transaction : validation des références, vérification du créneau, création du rendez-vous et réservation du créneau. L'e-mail ne doit pas conditionner le succès de la transaction. Émettre un événement `AppointmentCreated` dans une table outbox, puis envoyer la notification de façon asynchrone et idempotente. À court terme, un appel post-commit avec journalisation et nouvelle tentative contrôlée est acceptable.

### 3.7 Contrats API

- Versionner l'API sous `/api/v1`.
- Employer des noms de ressources cohérents et indépendants du rôle : `/appointments`, `/doctors/{id}/availabilities`, `/specialties`.
- Réserver l'autorisation au middleware plutôt que l'encoder dans les chemins.
- Normaliser les erreurs : `{ code, message, details, requestId }`.
- Utiliser une pagination bornée et stable avec métadonnées uniformes.
- Documenter schémas, sécurité Bearer, erreurs et exemples dans OpenAPI ; valider la spécification en CI.
- Conserver `uuid` comme identifiant public et ne pas exposer les IDs séquentiels lorsque cela facilite l'énumération.

### 3.8 Testabilité et exploitation

- `createApp(dependencies)` retourne l'application sans ouvrir de port ; `server.js` gère `listen`, `SIGTERM`, la fermeture Prisma et les erreurs fatales.
- Tests unitaires sur les cas d'usage et règles de statut ; tests d'intégration sur repositories avec base dédiée ; tests HTTP sur les autorisations et contrats ; test de migration depuis un snapshot réaliste.
- Logs JSON avec `requestId`, acteur, route, durée et résultat, sans mot de passe, JWT ni données médicales inutiles.
- Endpoints `/health/live` et `/health/ready`, métriques de latence/erreurs, échecs SMTP et conflits de réservation.
- Pipeline : installation déterministe, génération Prisma, format/lint, validation Prisma/OpenAPI, tests, audit des dépendances et vérification des migrations.

## 4. Stratégie de transition

1. **Stabiliser** : corriger le contrat symptômes, ajouter authentification/RBAC, sérialisation sûre, validation et gestion d'erreurs ; couvrir les parcours critiques par des tests.
2. **Créer le socle** : séparer `app`/`server`, centraliser Prisma et la configuration, introduire erreurs et logger communs.
3. **Extraire le domaine rendez-vous** : DTO → cas d'usage → repository Prisma ; ajouter transaction et contrôle de conflit.
4. **Migrer les autres modules** : disponibilités, utilisateurs/auth, référentiels et notifications.
5. **Faire évoluer les données et l'API** : enums, créneaux UTC, liens patient, `/api/v1`, migrations compatibles et période de transition.
6. **Industrialiser** : CI/CD, observabilité, sauvegardes, tests de restauration et procédures d'exploitation.

## 5. Décisions à formaliser

Créer un ADR (Architecture Decision Record) pour chacune de ces questions avant implémentation :

- le patient doit-il obligatoirement posséder un compte ?
- la réservation automatique demeure-t-elle un service externe ou revient-elle dans GRM ?
- quelle timezone métier et quelles règles de calendrier s'appliquent ?
- quelle durée de créneau et quels délais minimum d'annulation/réservation ?
- quelles données doivent être historisées et combien de temps au regard des obligations locales ?
- une spécialité peut-elle être supprimée lorsqu'elle est référencée ?
- faut-il gérer plusieurs établissements, sites, salles ou fuseaux horaires ?

Ces décisions conditionnent le modèle cible et doivent précéder les migrations irréversibles.
