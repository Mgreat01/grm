import { PrismaClient } from "@prisma/client";
import crypto from "crypto";

const prisma = new PrismaClient();

// === CRÉATION D'UN RENDEZ-VOUS ===
export const createRendezVous = async (req, res) => {
  try {
    const {
      nom_patient,
      email_patient,
      numero_patient,
      symptome,
      date_rdv,
      heure_rdv,
      specialiteId,
      medecinId,
    } = req.body;

    // Vérifier que le médecin existe
    const medecin = await prisma.utilisateur.findUnique({
      where: { id: parseInt(medecinId) },
    });

    if (!medecin || medecin.type !== "medecin") {
      return res.status(400).json({ error: "Médecin invalide" });
    }

    const uuid = crypto.randomUUID();

    // 🔥 Correction ici
    const fullHeure = heure_rdv ? new Date(`${date_rdv}T${heure_rdv}`) : null;

    const rdv = await prisma.rendezVous.create({
      data: {
        uuid,
        nom_patient,
        email_patient,
        numero_patient,
        symptome,
        date_rdv: date_rdv ? new Date(date_rdv) : null,
        heure_rdv: fullHeure,
        specialiteId: specialiteId ? parseInt(specialiteId) : null,
        medecinId: parseInt(medecinId),
        statut: "en_attente",
      },
    });

    res.status(201).json({ message: "Rendez-vous créé", rdv });

  } catch (error) {
    console.error("Erreur createRendezVous:", error);
    res.status(500).json({ error: error.message });
  }
};


// === MISE À JOUR D'UN RENDEZ-VOUS ===
export const updateRendezVous = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      date_rdv,
      heure_rdv,
      statut,
      presence,
      symptome,
      specialiteId,
      medecinId,
    } = req.body;

    const rdv = await prisma.rendezVous.update({
      where: { id: parseInt(id) },
      data: {
        date_rdv: date_rdv ? new Date(date_rdv) : undefined,
        heure_rdv: heure_rdv ? new Date(heure_rdv) : undefined,
        statut,
        presence,
        symptome,
        specialiteId: specialiteId ? parseInt(specialiteId) : undefined,
        medecinId: medecinId ? parseInt(medecinId) : undefined,
      },
    });

    res.json({ message: "Rendez-vous mis à jour", rdv });
  } catch (error) {
    console.error("Erreur updateRendezVous:", error);
    res.status(500).json({ error: error.message });
  }
};

// === SUPPRESSION D'UN RENDEZ-VOUS ===
export const deleteRendezVous = async (req, res) => {
  try {
    const { id } = req.params;

    const rdv = await prisma.rendezVous.findUnique({ where: { id: parseInt(id) } });
    if (!rdv) return res.status(404).json({ error: "Rendez-vous introuvable" });

    await prisma.rendezVous.delete({ where: { id: rdv.id } });

    res.json({ message: "Rendez-vous annulé" });
  } catch (error) {
    console.error("Erreur deleteRendezVous:", error);
    res.status(500).json({ error: error.message });
  }
};

// === LISTER TOUS LES RENDEZ-VOUS ===
export const getAllRendezVous = async (req, res) => {
  try {
    const rdvs = await prisma.rendezVous.findMany({
      include: {
        medecin: {
          select: {
            noms_complet: true,
            email: true,
            specialite: {
              select: { nom: true },
            },
          },
        },
      },
      orderBy: { date_rdv: "desc" },
    });

    res.json(rdvs);
  } catch (error) {
    console.error("Erreur getAllRendezVous:", error);
    res.status(500).json({ error: error.message });
  }
};

// === LISTER LES RENDEZ-VOUS D'UN MÉDECIN ===
export const getRendezVousMedecin = async (req, res) => {
  try {
    const { medecinId } = req.params;

    const rdvs = await prisma.rendezVous.findMany({
      where: { medecinId: parseInt(medecinId) },
      include: {
        medecin: {
          select: {
            noms_complet: true,
            email: true,
            specialite: {
              select: { nom: true },
            },
          },
        },
      },
      orderBy: { date_rdv: "asc" },
    });

    res.json(rdvs);
  } catch (error) {
    console.error("Erreur getRendezVousMedecin:", error);
    res.status(500).json({ error: error.message });
  }
};
export const getAllMedecins = async (req, res) => {
  try {
    const medecins = await prisma.utilisateur.findMany({
      where: { type: "medecin", estActif: true },
      include: {
        specialite: {
          select: { nom: true },
        },
      },
    });
    res.json(medecins);
  } catch (error) {
    console.error("Erreur getAllMedecins:", error);
    res.status(500).json({ error: error.message });
  }
}

export const getSymptomes = async (req, res) => {
  try {
    const symptomes = await prisma.symptome.findMany({
      select: {
        id: true,
        nom: true,
        },
      orderBy: {
        nom: 'asc', 
      },
    });
    res.json(symptomes);
  } catch (error) {
    console.error("Erreur getSymptomes:", error);
    res.status(500).json({ 
      error: "Impossible de récupérer la liste des symptômes." 
    });
  }
};
