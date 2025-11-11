import express from "express";

// === Importation des contrôleurs ===
import {
  createUtilisateurByAdmin,
  activerUtilisateur,
  createSpecialite,
  getSpecialites,
  updateSpecialite,
  deleteSpecialite,
} from "../controllers/adminController.js";

import {
  createDisponibilite,
  getDisponibilitesByMedecin,
  deleteDisponibilite,
  getRendezVousMedecin,
} from "../controllers/medecinController.js";

import {
  createRendezVous,
  updateRendezVous,
  deleteRendezVous,
  getAllRendezVous,
} from "../controllers/receptionnisteController.js";

import {
  inscriptionUtilisateur,
  connexionUtilisateur,
  getProfilUtilisateur,
  updateProfilUtilisateur,
} from "../controllers/utilisateurController.js";

const router = express.Router();




/**
 * @swagger
 * tags:
 *   - name: Admin
 *     description: Gestion des utilisateurs et spécialités
 *   - name: Médecin
 *     description: Gestion des disponibilités et des rendez-vous
 *   - name: Réceptionniste
 *     description: Gestion des rendez-vous patients
 *   - name: Utilisateur
 *     description: Authentification & Profil utilisateur
 */

/**
 * @swagger
 * /admin/utilisateurs:
 *   post:
 *     tags: [Admin]
 *     summary: Créer un utilisateur (admin)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - noms_complet
 *               - email
 *               - motdepasse
 *               - type
 *             properties:
 *               noms_complet:
 *                 type: string
 *                 example: "Jean Dupont"
 *               email:
 *                 type: string
 *                 example: "jean.dupont@gmail.com"
 *               motdepasse:
 *                 type: string
 *                 example: "Passer123!"
 *               type:
 *                 type: string
 *                 enum: [medecin, patient, receptionniste]
 *                 example: "medecin"
 *               specialiteId:
 *                 type: integer
 *                 example: 1
 *                 description: "Requis si type = medecin"
 *     responses:
 *       201:
 *         description: Utilisateur créé
 *       400:
 *         description: Champs manquants ou type invalide
 *       404:
 *         description: Spécialité non trouvée
 */


/**
 * @swagger
 * /admin/utilisateurs/{id}/activer:
 *   patch:
 *     tags: [Admin]
 *     summary: Activer un utilisateur
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     responses:
 *       200:
 *         description: Compte activé
 */

/**
 * @swagger
 * /admin/specialites:
 *   post:
 *     tags: [Admin]
 *     summary: Créer une spécialité
 *     responses:
 *       201:
 *         description: Spécialité créée
 *
 *   get:
 *     tags: [Admin]
 *     summary: Liste des spécialités
 *     responses:
 *       200:
 *         description: OK
 */

/**
 * @swagger
 * /admin/specialites/{id}:
 *   put:
 *     tags: [Admin]
 *     summary: Modifier une spécialité
 *   delete:
 *     tags: [Admin]
 *     summary: Supprimer une spécialité
 */

/**
 * @swagger
 * /medecins/disponibilites:
 *   post:
 *     tags: [Médecin]
 *     summary: Créer une disponibilité
 */

/**
 * @swagger
 * /medecins/{medecinId}/disponibilites:
 *   get:
 *     tags: [Médecin]
 *     summary: Obtenir les disponibilités d’un médecin
 */

/**
 * @swagger
 * /medecins/disponibilites/{id}:
 *   delete:
 *     tags: [Médecin]
 *     summary: Supprimer une disponibilité
 */

/**
 * @swagger
 * /medecins/{medecinId}/rendezvous:
 *   get:
 *     tags: [Médecin]
 *     summary: Liste des rendez-vous du médecin
 */

/**
 * @swagger
 * /receptionnistes/rendezvous:
 *   post:
 *     tags: [Réceptionniste]
 *     summary: Créer un rendez-vous
 *   get:
 *     tags: [Réceptionniste]
 *     summary: Voir tous les rendez-vous
 */

/**
 * @swagger
 * /receptionnistes/rendezvous/{id}:
 *   put:
 *     tags: [Réceptionniste]
 *     summary: Modifier un rendez-vous
 *   delete:
 *     tags: [Réceptionniste]
 *     summary: Supprimer un rendez-vous
 */

/**
 * @swagger
 * /utilisateurs/register:
 *   post:
 *     tags: [Utilisateur]
 *     summary: Inscription utilisateur
 */

/**
 * @swagger
 * /utilisateurs/login:
 *   post:
 *     tags: [Utilisateur]
 *     summary: Connexion utilisateur
 */

/**
 * @swagger
 * /utilisateurs/profil:
 *   get:
 *     tags: [Utilisateur]
 *     summary: Voir le profil
 *   put:
 *     tags: [Utilisateur]
 *     summary: Modifier le profil
 */



// ===========================================================
//  ADMIN ROUTES
// ===========================================================

// --- Gestion des utilisateurs ---
router.post("/admin/utilisateurs", createUtilisateurByAdmin);
router.patch("/admin/utilisateurs/:id/activer", activerUtilisateur);

// --- Gestion des spécialités ---
router.post("/admin/specialites", createSpecialite);
router.get("/admin/specialites", getSpecialites);
router.put("/admin/specialites/:id", updateSpecialite);
router.delete("/admin/specialites/:id", deleteSpecialite);

// ===========================================================
//  MEDECIN ROUTES
// ===========================================================

// --- Gestion des disponibilités ---
router.post("/medecins/disponibilites", createDisponibilite);
router.get("/medecins/:medecinId/disponibilites", getDisponibilitesByMedecin);
router.delete("/medecins/disponibilites/:id", deleteDisponibilite);

// --- Rendez-vous du médecin ---
router.get("/medecins/:medecinId/rendezvous", getRendezVousMedecin);

// ===========================================================
//  RECEPTIONNISTE ROUTES
// ===========================================================
router.post("/receptionnistes/rendezvous", createRendezVous);
router.put("/receptionnistes/rendezvous/:id", updateRendezVous);
router.delete("/receptionnistes/rendezvous/:id", deleteRendezVous);
router.get("/receptionnistes/rendezvous", getAllRendezVous);

// ===========================================================
//  UTILISATEUR (GÉNÉRAL)
// ===========================================================

// --- Inscription & Connexion ---
router.post("/utilisateurs/register", inscriptionUtilisateur);
router.post("/utilisateurs/login", connexionUtilisateur);

// --- Profil utilisateur (protégé par middleware JWT) ---
router.get("/utilisateurs/profil", getProfilUtilisateur);
router.put("/utilisateurs/profil", updateProfilUtilisateur);

// ===========================================================
// EXPORT GLOBAL DES ROUTES
// ===========================================================
export default router;
