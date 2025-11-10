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
