import { PrismaClient } from "@prisma/client";
import crypto from "crypto";

const prisma = new PrismaClient();

// === GESTION DES RENDEZ-VOUS ===
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

    // Générer un UUID unique
    const uuid = crypto.randomUUID();

    const rdv = await prisma.rendezVous.create({
      data: {
        uuid,
        nom_patient,
        email_patient,
        numero_patient,
        symptome,
        date_rdv: new Date(date_rdv),
        heure_rdv: new Date(heure_rdv),
        specialiteId,
        medecinId,
        statut: "en_attente",
      },
    });

    res.status(201).json({ message: "Rendez-vous créé", rdv });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

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
        specialiteId,
        medecinId,
      },
    });

    res.json({ message: "Rendez-vous mis à jour", rdv });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteRendezVous = async (req, res) => {
  try {
    const { id } = req.params;

    const rdv = await prisma.rendezVous.findUnique({ where: { id: parseInt(id) } });
    if (!rdv) return res.status(404).json({ error: "Rendez-vous introuvable" });

    await prisma.rendezVous.delete({ where: { id: rdv.id } });

    res.json({ message: "Rendez-vous annulé" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

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
        specialite: {
          select: { nom: true },
        },
      },
      orderBy: { date_rdv: "desc" },
    });

    res.json(rdvs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
