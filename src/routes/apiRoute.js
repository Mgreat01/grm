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
 * /admin/utilisateurs:
 *   post:
 *     tags: [Admin]
 *     summary: Créer un utilisateur (admin)
 *     description: Permet à l’administrateur de créer un compte pour un médecin, un patient ou une réceptionniste.
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
 *                 example: "Dr. Alice Kabeya"
 *               email:
 *                 type: string
 *                 example: "alice.kabeya@hopital-rdc.com"
 *               motdepasse:
 *                 type: string
 *                 example: "SecurePass123!"
 *               type:
 *                 type: string
 *                 enum: [medecin, patient, receptionniste]
 *                 example: "medecin"
 *               specialiteId:
 *                 type: integer
 *                 example: 3
 *                 description: "Obligatoire si type = medecin"
 *     responses:
 *       201:
 *         description: Utilisateur créé avec succès
 *       400:
 *         description: Données manquantes ou type invalide
 *       404:
 *         description: Spécialité introuvable
 */

/**
 * @swagger
 * /admin/utilisateurs/{id}/activer:
 *   patch:
 *     tags: [Admin]
 *     summary: Activer un compte utilisateur
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de l'utilisateur à activer
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Compte activé avec succès
 *       404:
 *         description: Utilisateur introuvable
 */

/**
 * @swagger
 * /admin/specialites:
 *   post:
 *     tags: [Admin]
 *     summary: Créer une spécialité médicale
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nom
 *             properties:
 *               nom:
 *                 type: string
 *                 example: "Cardiologie"
 *     responses:
 *       201:
 *         description: Spécialité créée avec succès
 *
 *   get:
 *     tags: [Admin]
 *     summary: Liste des spécialités
 *     responses:
 *       200:
 *         description: Liste des spécialités récupérée
 */

/**
 * @swagger
 * /admin/specialites/{id}:
 *   put:
 *     tags: [Admin]
 *     summary: Modifier une spécialité
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nom:
 *                 type: string
 *                 example: "Neurologie"
 *     responses:
 *       200:
 *         description: Spécialité mise à jour
 *
 *   delete:
 *     tags: [Admin]
 *     summary: Supprimer une spécialité
 *     responses:
 *       204:
 *         description: Spécialité supprimée
 */

/**
 * @swagger
 * /medecins/disponibilites:
 *   post:
 *     tags: [Médecin]
 *     summary: Créer une disponibilité
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - date
 *               - heure_debut
 *               - heure_fin
 *             properties:
 *               date:
 *                 type: string
 *                 format: date
 *                 example: "2025-12-10"
 *               heure_debut:
 *                 type: string
 *                 example: "09:00"
 *               heure_fin:
 *                 type: string
 *                 example: "12:00"
 *     responses:
 *       201:
 *         description: Disponibilité créée
 */

/**
 * @swagger
 * /medecins/{medecinId}/disponibilites:
 *   get:
 *     tags: [Médecin]
 *     summary: Obtenir les disponibilités d’un médecin
 *     parameters:
 *       - in: path
 *         name: medecinId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Disponibilités récupérées
 */

/**
 * @swagger
 * /medecins/disponibilites/{id}:
 *   delete:
 *     tags: [Médecin]
 *     summary: Supprimer une disponibilité
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Disponibilité supprimée
 */

/**
 * @swagger
 * /medecins/{medecinId}/rendezvous:
 *   get:
 *     tags: [Médecin]
 *     summary: Liste des rendez-vous du médecin
 *     parameters:
 *       - in: path
 *         name: medecinId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Liste des rendez-vous récupérée
 */

/**
 * @swagger
 * /receptionnistes/rendezvous:
 *   post:
 *     tags: [Réceptionniste]
 *     summary: Créer un rendez-vous
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nom_patient
 *               - email_patient
 *               - numero_patient
 *               - symptome
 *               - specialiteId
 *             properties:
 *               nom_patient:
 *                 type: string
 *                 example: "Patrick Lumbala"
 *               email_patient:
 *                 type: string
 *                 example: "patrick@gmail.com"
 *               numero_patient:
 *                 type: string
 *                 example: "+243810000000"
 *               symptome:
 *                 type: string
 *                 example: "Fièvre persistante"
 *               specialiteId:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       201:
 *         description: Rendez-vous créé
 *
 *   get:
 *     tags: [Réceptionniste]
 *     summary: Voir tous les rendez-vous
 *     responses:
 *       200:
 *         description: Liste récupérée
 */

/**
 * @swagger
 * /receptionnistes/rendezvous/{id}:
 *   put:
 *     tags: [Réceptionniste]
 *     summary: Modifier un rendez-vous
 *     responses:
 *       200:
 *         description: Rendez-vous modifié
 *
 *   delete:
 *     tags: [Réceptionniste]
 *     summary: Supprimer un rendez-vous
 *     responses:
 *       204:
 *         description: Rendez-vous supprimé
 */

/**
 * @swagger
 * /utilisateurs/register:
 *   post:
 *     tags: [Utilisateur]
 *     summary: Inscription utilisateur
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
 *             properties:
 *               noms_complet:
 *                 type: string
 *                 example: "Marie Tshianda"
 *               email:
 *                 type: string
 *                 example: "marie.tshianda@gmail.com"
 *               motdepasse:
 *                 type: string
 *                 example: "MotDePasse@2025"
 *     responses:
 *       201:
 *         description: Compte créé avec succès
 */

/**
 * @swagger
 * /utilisateurs/login:
 *   post:
 *     tags: [Utilisateur]
 *     summary: Connexion utilisateur
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - motdepasse
 *             properties:
 *               email:
 *                 type: string
 *                 example: "marie.tshianda@gmail.com"
 *               motdepasse:
 *                 type: string
 *                 example: "MotDePasse@2025"
 *     responses:
 *       200:
 *         description: Connexion réussie
 *       401:
 *         description: Identifiants incorrects
 */

/**
 * @swagger
 * /utilisateurs/profil:
 *   get:
 *     tags: [Utilisateur]
 *     summary: Voir le profil de l’utilisateur connecté
 *     responses:
 *       200:
 *         description: Informations du profil
 *
 *   put:
 *     tags: [Utilisateur]
 *     summary: Modifier le profil utilisateur
 *     responses:
 *       200:
 *         description: Profil mis à jour
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
