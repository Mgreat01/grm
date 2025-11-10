import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// === GESTION DES RENDEZ-VOUS ===
export const createRendezVous = async (req, res) => {
  try {
    const { patientId, medecinId, date, heure, statut } = req.body;

    const rdv = await prisma.rendezVous.create({
      data: {
        patientId,
        medecinId,
        date,
        heure,
        statut: statut || "en_attente", // ⚠️ cohérent avec ton schéma (par défaut "en_attente")
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
    const { date, heure, statut } = req.body;

    const rdv = await prisma.rendezVous.update({
      where: { id: parseInt(id) },
      data: { date, heure, statut },
    });

    res.json({ message: "Rendez-vous mis à jour", rdv });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteRendezVous = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.rendezVous.delete({ where: { id: parseInt(id) } });
    res.json({ message: "Rendez-vous annulé" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getAllRendezVous = async (req, res) => {
  try {
    const rdvs = await prisma.rendezVous.findMany({
      include: {
        // ⚠️ Vérifie ton schéma : actuellement RendezVous n’a pas de relation "patient"
        // Tu peux inclure "medecin" et "specialite" qui existent déjà
        medecin: true,
        specialite: true,
      },
    });
    res.json(rdvs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
