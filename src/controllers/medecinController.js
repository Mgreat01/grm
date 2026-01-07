import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// === GESTION DES DISPONIBILITÉS ===
export const createDisponibilite = async (req, res) => {
  try {
    const { medecinId, date, heure_debut, heure_fin } = req.body;

    // 1. Validation de la présence des données
    if (!date || !heure_debut || !heure_fin) {
        return res.status(400).json({ error: "Tous les champs (date, heure début/fin) sont requis." });
    }

    // 2. Validation du format de la date
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) {
        return res.status(400).json({ error: "Le format de la date est invalide." });
    }

    const idMed = parseInt(medecinId);
    const medecin = await prisma.utilisateur.findUnique({ where: { id: idMed } });

    if (!medecin || medecin.type !== "medecin" || !medecin.estActif) {
      return res.status(400).json({ error: "Médecin invalide ou inactif" });
    }

    const disponibilite = await prisma.disponibilite.create({
      data: {
        medecinId: idMed,
        date: dateObj, // Utilise l'objet validé
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

    const dispo = await prisma.disponibilite.findUnique({ where: { id: parseInt(id) } });
    if (!dispo) return res.status(404).json({ error: "Disponibilité introuvable" });

    await prisma.disponibilite.delete({ where: { id: dispo.id } });

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
      include: {
        medecin: {
          select: {
            noms_complet: true,
            email: true,
            specialite: {
              select: { nom: true }
            }
          }
        }
      },
      orderBy: { date_rdv: "asc" },
    });

    res.json(rdvs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
