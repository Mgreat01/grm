# Référentiel fonctionnel et roadmap — GRM

> État de référence : 26 août 2026. Les fonctionnalités ci-dessous sont déduites du périmètre actuel. Les éléments de sécurité et d'intégrité signalés P0/P1 dans `improvements.md` sont des prérequis, même lorsqu'ils ne sont pas visibles par l'utilisateur.

## 1. Capacités existantes

| Domaine | Capacité | Maturité actuelle |
|---|---|---|
| Comptes | inscription, connexion, activation/désactivation, profil | Partielle : JWT non appliqué et profil inexploitable sans middleware |
| Administration | création/liste utilisateurs, CRUD spécialités | Prototype : accès public et données sensibles exposées |
| Symptômes | référentiel et association aux spécialités en base | Partielle : lecture disponible, écriture rendez-vous incohérente |
| Médecins | création/liste/suppression de disponibilités, consultation agenda | Partielle : aucun contrôle de propriété ou conflit |
| Réception | CRUD rendez-vous, liste médecins/symptômes | Partielle : création/mise à jour incompatibles avec le schéma courant |
| Planification | délégation automatique par symptômes | Intégration opaque : dépend d'un service externe |
| Notifications | e-mail de confirmation | Best effort, sans suivi ni retry |
| Documentation | interface Swagger | Incomplète et non sécurisée par contrat Bearer |

## 2. Fonctionnalités à ajouter

### F01 — Identité, autorisation et gestion des comptes

**Objectif.** Garantir que chaque acteur n'accède qu'aux opérations et données autorisées.

**Fonctions :** authentification Bearer, RBAC admin/médecin/réceptionniste/patient, contrôle de propriété, invitation du personnel, oubli/réinitialisation de mot de passe, modification d'e-mail avec vérification, révocation/rotation de session, désactivation explicite et journal des connexions sensibles.

**Composants nécessaires :** module `auth`, `TokenService`, `PasswordService`, middlewares `authenticate`/`authorize`, stockage de refresh tokens ou sessions, service de vérification e-mail, DTO publics utilisateur.

**Critères majeurs :** aucune auto-attribution de rôle privilégié ; hash jamais exposé ; compte inactif refusé sur chaque requête protégée ; tests complets 401/403.

### F02 — Agenda et disponibilités avancées

**Objectif.** Représenter fidèlement le temps de travail du médecin et produire des créneaux réservables fiables.

**Fonctions :** plages récurrentes, exceptions, congés, pauses, durée par spécialité/médecin, horizon de réservation, délai minimum, détection de chevauchement, consultation par période, timezone explicite.

**Composants :** module `availability`, moteur de génération de créneaux, `CalendarPolicy`, repository transactionnel, modèles `AvailabilityRule`, `AvailabilityException` et/ou `Slot`.

**Critères majeurs :** intervalles UTC cohérents ; aucun créneau passé/inversé ; concurrence maîtrisée ; filtres par médecin/spécialité/date.

### F03 — Cycle de vie complet du rendez-vous

**Objectif.** Couvrir réservation, validation, déplacement, annulation et clôture avec historique.

**Fonctions :** statuts et transitions explicites, confirmation par réception/médecin, replanification, annulation avec motif, présence/absence, notes internes, source du rendez-vous, auteur et historique des changements.

**Composants :** module `appointments`, machine à états, cas d'usage `Create/Confirm/Reschedule/Cancel/CompleteAppointment`, transaction de réservation, audit trail.

**Critères majeurs :** double réservation impossible ; changement historisé ; transition invalide refusée ; suppression physique exclue du parcours normal.

### F04 — Parcours patient

**Objectif.** Permettre au patient de gérer ses rendez-vous sans exposer ceux des autres.

**Fonctions :** recherche de créneaux, création, liste à venir/historique, détail via UUID, déplacement/annulation selon politique, préférences de contact, gestion de profil et consentement.

**Composants :** relation `patientId`, `PatientAppointmentService`, endpoints `/me/appointments`, politiques d'accès, mécanisme sécurisé pour rendez-vous sans compte.

**Critères majeurs :** isolation stricte par patient ; rendez-vous d'accueil rattachable ultérieurement ; données minimisées.

### F05 — Poste de travail réception

**Objectif.** Donner à l'accueil une vue opérationnelle rapide.

**Fonctions :** tableau du jour, recherche patient, filtres multi-critères, création guidée, attribution/réattribution, check-in, file d'attente, export contrôlé, vue des conflits et disponibilités.

**Composants :** service de recherche, requêtes paginées/indexées, endpoints de tableau de bord, module de file d'attente, DTO synthétiques.

**Critères majeurs :** réponses paginées et rapides ; actions auditables ; filtres combinables ; aucune donnée superflue.

### F06 — Espace médecin

**Objectif.** Permettre au médecin de piloter son agenda et la présence des patients.

**Fonctions :** agenda jour/semaine, gestion de ses disponibilités, confirmation ou proposition de déplacement, statut de présence, notes opérationnelles à accès restreint.

**Composants :** vues calendrier, politiques de propriété, requêtes par intervalle, service de transition des rendez-vous.

**Critères majeurs :** un médecin ne modifie que son agenda ; les opérations sensibles sont historisées.

### F07 — Référentiels médicaux administrables

**Objectif.** Administrer spécialités et symptômes sans dépendre du seed ni d'IDs fixes.

**Fonctions :** CRUD symptômes, association symptômes-spécialités, activation/archivage, alias de recherche, durées et instructions par spécialité.

**Composants :** modules `specialties` et `symptoms`, endpoints admin, validation d'unicité normalisée, politique de suppression/référence.

**Critères majeurs :** seed idempotent par clés métier ; suppression impossible si elle casse l'historique ; recherche insensible aux variations pertinentes.

### F08 — Planification automatique maîtrisée

**Objectif.** Proposer le meilleur créneau tout en conservant un contrat et un fallback explicites.

**Fonctions :** résolution symptômes → spécialités, classement des créneaux, contraintes patient, proposition de plusieurs options, confirmation atomique, idempotence, mode manuel en cas de panne.

**Composants :** port `AppointmentScheduler`, adaptateur HTTP versionné, validateur de réponse, algorithme local minimal de secours, métriques de qualité de suggestion.

**Critères majeurs :** aucune réservation sur simple réponse non validée ; panne externe distinguée d'une erreur client ; pas de doublon lors d'un retry.

### F09 — Notifications multicanales

**Objectif.** Confirmer et rappeler les rendez-vous de manière fiable.

**Fonctions :** confirmation, modification, annulation, rappels configurables, e-mail puis SMS selon besoins, préférences et désinscription, suivi d'état.

**Composants :** module `notifications`, templates sécurisés, file de jobs/outbox, adaptateurs SMTP/SMS, journal de livraison.

**Critères majeurs :** retry idempotent ; échec observable ; timezone et langue correctes ; absence d'information médicale sensible dans les messages.

### F10 — Reporting opérationnel

**Objectif.** Mesurer l'activité sans surcharger les endpoints transactionnels.

**Fonctions :** volumes, délai moyen, taux d'annulation/absence, occupation par médecin/spécialité, origine des réservations, export selon droits.

**Composants :** événements/audit fiables, requêtes d'agrégation ou vues dédiées, endpoints de reporting, cache éventuel.

**Critères majeurs :** définitions de métriques documentées ; filtres temporels ; export traçable et protégé.

### F11 — Audit, conformité et gouvernance des données

**Objectif.** Rendre les opérations sensibles explicables et appliquer les politiques de données.

**Fonctions :** journal d'audit, consentement, rétention, export des données, anonymisation/suppression selon réglementation applicable, traçage des accès administratifs.

**Composants :** `AuditService`, politiques de rétention, jobs d'anonymisation, registre des finalités, redaction des logs.

**Critères majeurs :** événements immuables pertinents ; accès au journal restreint ; procédure testée. La politique finale doit être validée juridiquement pour le pays de déploiement.

### F12 — Exploitation et administration technique

**Objectif.** Opérer le service de manière observable et récupérable.

**Fonctions :** santé, readiness, métriques, alertes, sauvegarde/restauration, configuration par environnement, migrations contrôlées, documentation d'incident.

**Composants :** observabilité partagée, pipeline CI/CD, image de déploiement, runbooks, supervision.

**Critères majeurs :** restauration testée ; alertes sur erreurs/latence/conflits/notifications ; déploiement reproductible.

## 3. Modules cibles et dépendances

| Module | Responsabilité | Dépend de |
|---|---|---|
| `auth` | identité, sessions, rôles | users, notifications |
| `users` | profils, activation, personnel/patients | specialties, audit |
| `specialties` | référentiel de spécialités | audit |
| `symptoms` | référentiel et mapping médical | specialties, audit |
| `availability` | règles, exceptions, créneaux | users, specialties |
| `appointments` | cycle de vie et réservation | users, availability, symptoms, specialties, audit |
| `scheduling` | proposition automatique | appointments, availability, symptoms, adaptateur externe |
| `notifications` | templates et livraison | événements appointments/auth |
| `reporting` | indicateurs et exports | événements/audit, lecture appointments |
| `audit` | traçabilité transverse | infrastructure de persistance |

La dépendance centrale doit rester orientée vers `appointments`; `notifications` et `reporting` consomment ses événements et ne doivent pas être appelés depuis ses règles de domaine.

## 4. Roadmap indicative

Les durées sont des ordres de grandeur pour une petite équipe et doivent être recalibrées après clarification métier.

### Phase 0 — Stabilisation (semaines 1–2)

**Livrables :** F01 minimal (auth/RBAC), réparation du mapping symptômes, DTO sûrs, validation de requêtes, erreurs normalisées, seed reproductible, premiers tests HTTP.

**Jalon :** parcours connexion, profil, administration, disponibilité et rendez-vous manuel fonctionnels avec permissions testées.

### Phase 1 — Cœur rendez-vous fiable (semaines 3–6)

**Livrables :** F02 minimal, F03, enums, modèle temporel UTC, contrôle transactionnel des conflits, annulation historisée, pagination et recherche de base.

**Jalon :** aucun double-booking sous test concurrent et cycle de vie métier validé.

### Phase 2 — Parcours par rôle (semaines 7–10)

**Livrables :** F04, F05, F06 et F07 ; endpoints versionnés, filtres et vues agenda.

**Jalon :** chaque rôle accomplit son parcours de bout en bout avec isolation des données.

### Phase 3 — Automatisation et communication (semaines 11–14)

**Livrables :** F08 avec contrat externe/fallback, F09 avec file/outbox, rappels et suivi de livraison.

**Jalon :** réservation automatique idempotente et notifications récupérables après panne.

### Phase 4 — Pilotage et production (semaines 15–18)

**Livrables :** F10, socle F11, F12, CI/CD, métriques, sauvegardes, runbooks et tests de charge ciblés.

**Jalon :** critères de mise en production satisfaits et restauration démontrée.

### Phase 5 — Extensions optionnelles

Multi-établissements, salles/ressources, téléconsultation, liste d'attente intelligente, SMS/WhatsApp selon conformité et prestataires, synchronisation calendrier externe, internationalisation et facturation. Ces éléments ne doivent entrer au backlog qu'après validation de leur valeur métier.

## 5. Dépendances de livraison

```text
F01 Auth ───────────────┬──> F04 Patient
                       ├──> F05 Réception
                       └──> F06 Médecin

F07 Référentiels ──> F02 Disponibilités ──> F03 Rendez-vous ──┬──> F08 Planification
                                                              ├──> F09 Notifications
                                                              └──> F10 Reporting

F11 Audit + F12 Exploitation s'appliquent progressivement à toutes les phases.
```

## 6. Découpage initial en epics et stories

### Epic A — Sécuriser les accès

- En tant qu'utilisateur actif, je peux utiliser un jeton valide pour accéder à mon profil.
- En tant qu'administrateur, je peux gérer les comptes sans voir leur hash.
- En tant que médecin, je ne peux agir que sur mon agenda.
- En tant que client anonyme, je reçois 401 sur toute route protégée.

### Epic B — Réserver sans conflit

- En tant que réceptionniste, je peux sélectionner des symptômes existants et un créneau réellement disponible.
- En tant que système, je refuse deux confirmations concurrentes du même créneau.
- En tant qu'acteur autorisé, je peux déplacer ou annuler un rendez-vous avec motif et historique.

### Epic C — Informer le patient

- En tant que patient, je reçois une confirmation correcte dans mon fuseau horaire.
- En tant qu'opérateur, je peux voir et relancer une notification échouée.
- En tant que patient, je peux choisir les canaux autorisés et me désinscrire des communications non indispensables.

### Epic D — Piloter l'activité

- En tant que réceptionniste, je vois les rendez-vous du jour et la file d'attente.
- En tant que médecin, je vois mon agenda par intervalle.
- En tant qu'administrateur, je consulte des indicateurs définis et exporte selon mes droits.

## 7. Critères de priorisation futurs

Noter chaque nouvelle fonctionnalité sur 1 à 5 selon : valeur patient/opérateur, réduction de risque, fréquence d'usage, dépendances débloquées, effort et risque réglementaire. Prioriser d'abord sécurité et intégrité, puis fréquence/valeur. Une fonctionnalité ne doit pas être planifiée sans propriétaire métier, métrique de succès, critères d'acceptation et stratégie de données.

## 8. Indicateurs de succès proposés

- taux de réservations abouties sans intervention ;
- taux de conflits/double réservation (cible : 0) ;
- délai médian entre demande et créneau confirmé ;
- taux d'annulation et d'absence ;
- taux de livraison des notifications et délai de livraison ;
- latence p95 et taux d'erreurs par endpoint ;
- proportion de requêtes refusées pour autorisation invalide ;
- couverture des cas d'usage critiques et taux de succès du pipeline.

Les définitions exactes, populations, fenêtres et cibles doivent être validées avec les responsables métier avant instrumentation.
