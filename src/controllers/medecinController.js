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
    if (req.user.role === "medecin" && req.user.id !== idMed) {
      return res.status(403).json({ error: "Vous ne pouvez gérer que vos disponibilités." });
    }

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
    console.error("Erreur createDisponibilite:", error);
    res.status(500).json({ error: "Une erreur interne est survenue." });
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
    console.error("Erreur getDisponibilitesByMedecin:", error);
    res.status(500).json({ error: "Une erreur interne est survenue." });
  }
};

export const deleteDisponibilite = async (req, res) => {
  try {
    const { id } = req.params;

    const dispo = await prisma.disponibilite.findUnique({ where: { id: parseInt(id) } });
    if (!dispo) return res.status(404).json({ error: "Disponibilité introuvable" });
    if (req.user.role === "medecin" && dispo.medecinId !== req.user.id) {
      return res.status(403).json({ error: "Vous ne pouvez supprimer que vos disponibilités." });
    }

    await prisma.disponibilite.delete({ where: { id: dispo.id } });

    res.json({ message: "Disponibilité supprimée" });
  } catch (error) {
    console.error("Erreur deleteDisponibilite:", error);
    res.status(500).json({ error: "Une erreur interne est survenue." });
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
    console.error("Erreur getRendezVousMedecin:", error);
    res.status(500).json({ error: "Une erreur interne est survenue." });
  }
};
