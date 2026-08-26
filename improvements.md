# Référentiel des améliorations — GRM

> État de référence : 26 août 2026. Priorisation : **P0** bloque la sécurité ou les parcours principaux ; **P1** est nécessaire à une version fiable ; **P2** améliore maintenabilité et exploitation ; **P3** optimise ou prépare l'échelle.

## 1. Synthèse

Le projet constitue un prototype backend lisible et de taille maîtrisée, avec migrations Prisma, hash bcrypt, jetons JWT, documentation Swagger et séparation initiale routes/contrôleurs. Il n'est toutefois pas exploitable en production dans son état actuel : contrôle d'accès absent, incohérence entre contrôleurs et schéma Prisma, secrets/configuration non validés, données sensibles exposées et aucune suite de tests.

Ordre recommandé : rétablir les parcours cassés et fermer les accès (**P0**), garantir l'intégrité fonctionnelle (**P1**), structurer et automatiser (**P2**), puis enrichir et optimiser (**P3**).

### Suivi d'exécution

| Élément | État | Commit |
|---|---|---|
| Référentiels initiaux | Terminé | `17108f3` |
| P0-01 Authentification, rôles et propriété des agendas | Terminé (socle) | `af9dca5`, `ab530b9` |
| P0-02 Relation symptômes/rendez-vous | Terminé | `96a2275` |
| P0-03 DTO sans hash de mot de passe | Terminé | `1854797` |
| P0-04 Inscription publique réservée aux patients | Terminé | `4a05ece` |
| P0-05 Prévention des doubles réservations | Partiel : créneau exact, modèle temporel cible restant | `a025c22` |
| P0-07 CORS configurable | Partiel : Helmet/rate limiting restant | `f9fd564` |
| P0-08 Masquage des erreurs internes | Terminé (réponses existantes) | `9574564` |
| P1-03 Validation des disponibilités | Partiel : règles temporelles actuelles | `9fadf74` |
| P1-08 Pagination bornée des utilisateurs | Terminé | `03d5f17` |
| P1-09 Seed autonome et mot de passe hashé | Terminé | `a3304a1` |
| P1-10 Commande de seed | Terminé | `f811863` |
| P2-04 Socle de tests | En cours : runner et premiers tests ajoutés | `d72de6f` |
| P2-08 Chargement/validation de configuration | Terminé (socle) | `c6d80d1`, `f9fd564` |

Les éléments marqués « partiel » ne doivent pas être considérés clos avant satisfaction du critère de sortie défini dans le backlog.

## 2. Backlog priorisé

### P0 — Sécurité et fonctionnement critique

| ID | Constat vérifié | Action | Impact | Effort indicatif | Critère de sortie |
|---|---|---|---|---|---|
| P0-01 | Un JWT est émis à la connexion, mais aucune route n'installe de middleware qui renseigne `req.user`. Les routes admin, médecin et réception sont publiques ; les routes profil échouent sur `req.user.id`. | Ajouter `authenticate`, `requireRole` et contrôle de propriété ; établir la matrice d'accès route par route. | Critique | M | Tests HTTP 401/403/200 sur chaque classe de route. |
| P0-02 | `createRendezVous` et `updateRendezVous` écrivent `symptome`, champ supprimé au profit de la relation `symptomes`. | Faire accepter `symptomeIds`, valider les IDs et utiliser `connect`; inclure les symptômes dans les lectures. | Critique | S | Création/mise à jour testées avec 1..n symptômes et erreur 400 sur ID inconnu. |
| P0-03 | Plusieurs réponses retournent l'objet Prisma complet (`createUtilisateurByAdmin`, activation, profil mis à jour, listes), donc le hash `motdepasse`. | Définir des serializers/DTO de sortie à liste blanche ; appliquer une sélection Prisma sûre par défaut. | Critique | S | Aucun endpoint ni log ne contient `motdepasse`; test de non-régression. |
| P0-04 | L'auto-inscription autorise le rôle `receptionniste` et `medecin`; seule l'activation admin limite l'usage, mais les routes sont publiques. | Restreindre l'inscription publique au patient, ou créer un workflow d'invitation/vérification pour le personnel. | Critique | S | Un client public ne peut jamais s'octroyer un rôle privilégié. |
| P0-05 | Aucun contrôle de collision n'existe pour les rendez-vous ou disponibilités. | Centraliser la réservation transactionnelle et verrouiller/réserver atomiquement le créneau. | Critique | L | Deux requêtes concurrentes sur un même créneau donnent un seul succès. |
| P0-06 | La validation se limite à quelques champs ; IDs `NaN`, e-mails, téléphones, heures et transitions de statut passent sans contrôle systématique. | Introduire des schémas de validation partagés et retourner des erreurs 400 structurées. | Élevé | M | Tous les endpoints mutatifs ont un schéma et des tests limites. |
| P0-07 | CORS autorise toutes les origines et aucune protection anti-abus n'est présente sur login/register/auto-schedule. | Configurer les origines, ajouter Helmet, limite de taille et rate limiting par route sensible. | Élevé | S/M | Configuration par environnement et tests des en-têtes/limites. |
| P0-08 | Les contrôleurs renvoient fréquemment `error.message`, révélant potentiellement SQL et structure interne. | Mapper erreurs métier/Prisma vers 400/404/409 ; réserver les détails aux logs. | Élevé | M | Réponses 5xx génériques avec `requestId`; détails uniquement côté serveur. |

### P1 — Intégrité métier et fiabilité

| ID | Constat vérifié | Action | Impact | Effort | Critère de sortie |
|---|---|---|---|---|---|
| P1-01 | `type` et `statut` sont des chaînes libres ; spécialité médecin et relations médecin ne sont pas garanties par la base. | Ajouter enums Prisma et validations d'invariants ; préparer une migration des valeurs existantes. | Élevé | M | Valeurs invalides impossibles via API et base. |
| P1-02 | `date`, `heure_debut`, `heure_fin`, `date_rdv` et `heure_rdv` mélangent DateTime et chaînes, avec parsing dépendant du fuseau. | Migrer vers `startsAt`/`endsAt` UTC et configurer explicitement la timezone métier. | Élevé | L | Tests aux changements de jour/fuseau et ordre chronologique correct. |
| P1-03 | Une disponibilité peut être passée, inversée, superposée ou supprimée alors qu'un rendez-vous l'utilise implicitement. | Définir les invariants d'agenda et une politique d'édition/suppression. | Élevé | M | Tests de bornes, chevauchement et créneau réservé. |
| P1-04 | Le rendez-vous accepte médecin inactif, spécialité incohérente ou horaire hors disponibilité. | Valider activation, spécialité du médecin, disponibilité et transition d'état dans un cas d'usage. | Élevé | M | Toute affectation incohérente retourne 409/422 sans écriture. |
| P1-05 | `deleteRendezVous` supprime physiquement alors que le message parle d'annulation. | Implémenter l'annulation avec motif/auteur/date et conserver l'historique. | Élevé | M | Le rendez-vous annulé reste auditable et n'occupe plus le créneau selon la règle décidée. |
| P1-06 | Les e-mails sont lancés sans `await`; l'échec est absorbé et aucune nouvelle tentative n'existe. Le HTML interpole des données non échappées. | Découpler la notification, tracer son état, réessayer, rendre le template sûr et testable. | Moyen/élevé | M/L | Statut d'envoi visible, retry borné, aucune injection HTML. |
| P1-07 | Le proxy de planification réduit toutes les erreurs à 500, ne valide pas la réponse et n'a ni retry ciblé ni circuit breaker/idempotence. | Créer un client typé, mapper 4xx/timeout/indisponibilité, ajouter clé d'idempotence et stratégie de résilience. | Élevé | M | Tests avec faux service pour succès, 4xx, timeout et réponse invalide. |
| P1-08 | La pagination accepte valeurs négatives ou énormes ; les autres listes ne sont pas paginées/filtrées. | Normaliser pagination, bornes, tri et filtres. | Moyen | S/M | `limit` bornée, métadonnées uniformes, ordre stable. |
| P1-09 | La migration `estActif` ajoute d'abord une colonne obligatoire sans défaut, ce qui peut échouer sur base remplie. Le seed dépend des IDs 1..4 et crée un mot de passe en clair. | Tester une migration depuis snapshot ; rendre les migrations compatibles et le seed autonome/idempotent avec hash. | Élevé | M | Base vide et base peuplée migrent ; seed réussit sans IDs préexistants. |
| P1-10 | `package.json` configure `prisma.seed` vers `prisma/seed.js`, mais le fichier est `seed.cjs`. | Corriger le script et vérifier `prisma db seed`. | Moyen | XS | La commande de seed documentée fonctionne sur une base propre. |

### P2 — Maintenabilité, qualité et exploitation

| ID | Constat | Action | Impact | Effort | Critère de sortie |
|---|---|---|---|---|---|
| P2-01 | Chaque contrôleur construit un `PrismaClient`. | Fournir un singleton injecté et gérer sa fermeture. | Moyen | S | Une instance applicative, arrêt gracieux testé. |
| P2-02 | `app.listen` est couplé à la composition Express. | Séparer `createApp` et `server`; injecter les adaptateurs. | Moyen | S | Tests HTTP sans port réel. |
| P2-03 | Contrôleurs volumineux mêlant HTTP, métier, base et intégrations. | Migrer progressivement vers modules et cas d'usage décrits dans `architecture.md`. | Élevé | L | Contrôleurs minces et règles couvertes unitairement. |
| P2-04 | Le script `test` échoue volontairement ; aucun lint, formatage ou type-check. | Installer un runner (Vitest/Jest), Supertest, ESLint/Prettier ; envisager TypeScript. | Élevé | M/L | CI verte avec seuil de couverture sur le cœur métier. |
| P2-05 | Swagger ne décrit qu'une partie des paramètres/réponses, ne déclare pas Bearer auth, et utilise une URL locale fixe. | Aligner OpenAPI sur les DTO et le valider automatiquement. | Moyen | M | Tous les endpoints et codes majeurs sont documentés ; validation CI. |
| P2-06 | Plusieurs textes présentent un mojibake UTF-8 (`CrÃ©er`, etc.). | Normaliser les fichiers en UTF-8, ajouter `.editorconfig` et vérifier l'affichage API/docs/mail. | Moyen | S | Accents corrects dans sources, Swagger, JSON et e-mails. |
| P2-07 | Logs `console` hétérogènes, parfois données utilisateur, sans corrélation. | Logger structuré, redaction et `requestId`; métriques et endpoints santé. | Moyen | M | Une requête est traçable de bout en bout sans donnée sensible. |
| P2-08 | Configuration lue directement et noms de variables en minuscules non conventionnels. | Valider au démarrage, normaliser en majuscules et fournir `.env.example` sans secret. | Moyen | S | Démarrage refusé avec message clair si configuration invalide. |
| P2-09 | Pas de stratégie CI/CD, conteneur, sauvegarde ou retour arrière. | Ajouter pipeline, image reproductible, migrations de déploiement et runbooks. | Élevé | M/L | Déploiement automatisé en staging et restauration testée. |
| P2-10 | Dépendance npm `crypto` inutile : Node fournit déjà `node:crypto`. | Retirer le paquet et importer `node:crypto`; auditer régulièrement les dépendances. | Faible | XS | Dépendance retirée, tests verts, audit documenté. |

### P3 — Optimisation et maturité

| ID | Amélioration | Valeur | Effort |
|---|---|---|---|
| P3-01 | Cache court des référentiels spécialités/symptômes avec invalidation | Réduit les lectures répétitives | S/M |
| P3-02 | Recherche plein texte/normalisée des patients et rendez-vous | Efficacité de la réception | M |
| P3-03 | Outbox et worker de notifications | Livraison fiable et découplage | L |
| P3-04 | Audit trail métier et export d'événements | Traçabilité et conformité | M/L |
| P3-05 | Tests de charge ciblés réservation/listes | Capacité et seuils objectifs | M |
| P3-06 | Feature flags pour nouveaux algorithmes de planification | Déploiement progressif | M |

## 3. Améliorations fonctionnelles transverses

- Définir qui peut créer, confirmer, déplacer, annuler et clôturer un rendez-vous.
- Différencier annulation, absence et suppression administrative.
- Gérer motifs, notes internes, canal de création et auteur de chaque changement.
- Introduire rappels et préférences de contact ; ne pas supposer que l'e-mail est obligatoire puisque l'auto-réservation l'accepte absent alors que le schéma le rend obligatoire.
- Définir durée des consultations, pauses, jours fériés, congés et exceptions d'agenda.
- Lier, lorsque possible, le rendez-vous au compte patient tout en permettant un patient sans compte à l'accueil.
- Définir les exigences de confidentialité, consentement, rétention, export et suppression selon la juridiction cible avant de stocker davantage de données de santé.

## 4. Plan d'exécution recommandé

### Lot A — Remise en sécurité et réparation (1 à 2 semaines)

P0-01 à P0-04, P0-06 à P0-08, P1-10. Ajouter immédiatement des tests HTTP de sécurité et réparer le mapping des symptômes.

### Lot B — Agenda fiable (2 à 4 semaines)

P0-05, P1-01 à P1-05 et P1-08. C'est le lot qui transforme le prototype en service métier cohérent.

### Lot C — Intégrations et reproductibilité (2 à 3 semaines)

P1-06, P1-07, P1-09, puis socle de tests et CI. Tester les pannes SMTP et planificateur.

### Lot D — Architecture et exploitation (3 à 6 semaines, incrémental)

P2-01 à P2-10, module par module, sans bloquer les livraisons fonctionnelles.

## 5. Matrice impact / faisabilité

| Quadrant | Éléments |
|---|---|
| Fort impact / mise en œuvre rapide | JWT/RBAC, DTO sans mot de passe, correction symptômes, validation config, seed, CORS/rate limit |
| Fort impact / investissement important | transaction anti-double-booking, modèle temporel, refonte modulaire, notifications fiables, CI/CD |
| Impact modéré / rapide | pagination bornée, UTF-8, retrait `crypto`, health checks |
| Impact différé / investissement important | cache distribué, feature flags, architecture événementielle étendue |

## 6. Definition of Done commune

Une amélioration n'est terminée que si :

- comportement et règles d'autorisation sont documentés ;
- validation, cas nominal et erreurs ont des tests automatisés ;
- migrations montante et stratégie de retour arrière sont vérifiées si le schéma change ;
- OpenAPI et exemples sont à jour ;
- aucune donnée sensible n'apparaît dans réponse ou log ;
- logs/métriques permettent d'observer le nouveau comportement ;
- lint, tests, validation Prisma et installation déterministe réussissent en CI.

## 7. Risques à suivre

| Risque | Probabilité | Gravité | Réduction |
|---|---|---|---|
| Accès non autorisé aux données et opérations | Très élevée actuellement | Critique | P0-01, P0-03, P0-04, P0-07 |
| Double réservation | Élevée | Critique | P0-05, tests concurrents |
| Parcours manuel de rendez-vous cassé | Très élevée | Critique | P0-02 |
| Migration impossible ou perte de données | Moyenne | Élevée | P1-09, sauvegarde/restauration |
| E-mails perdus ou dupliqués | Élevée | Moyenne | P1-06, idempotence/outbox |
| Indisponibilité du planificateur externe | Moyenne | Élevée | P1-07, fallback explicite |
| Dates incorrectes selon le fuseau | Élevée | Élevée | P1-02 |
