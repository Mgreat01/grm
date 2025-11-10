import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// === GESTION DES DISPONIBILITÉS ===
export const createDisponibilite = async (req, res) => {
  try {
    const { medecinId, date, heure_debut, heure_fin } = req.body;

    const disponibilite = await prisma.disponibilite.create({
      data: {
        medecinId,
        date,
        heure_debut,
        heure_fin,
      },
    });

    res.status(201).json({ message: "Disponibilité ajoutée", disponibilite });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getDisponibilitesByMedecin = async (req, res) => {
  try {
    const { medecinId } = req.params;
    const disponibilites = await prisma.disponibilite.findMany({
      where: { medecinId: parseInt(medecinId) },
    });
    res.json(disponibilites);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteDisponibilite = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.disponibilite.delete({ where: { id: parseInt(id) } });
    res.json({ message: "Disponibilité supprimée" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// === CONSULTATION DES RENDEZ-VOUS ===
export const getRendezVousMedecin = async (req, res) => {
  try {
    const { medecinId } = req.params;
    const rdvs = await prisma.rendezVous.findMany({
      where: { medecinId: parseInt(medecinId) },
      // ⚠️ Vérifie ton schéma : si tu n’as pas de relation "patient" dans RendezVous,
      // cette ligne va provoquer une erreur. Tu peux inclure "medecin" ou "specialite" à la place.
      include: { medecin: true, specialite: true },
    });
    res.json(rdvs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
