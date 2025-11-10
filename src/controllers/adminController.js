import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// === GESTION DES UTILISATEURS ===
export const createUtilisateurByAdmin = async (req, res) => {
  try {
    const { noms_complet, email, motdepasse, type, specialiteId } = req.body;
    const utilisateur = await prisma.utilisateur.create({
      data: {
        noms_complet,
        email,
        motdepasse,
        type,
        specialiteId,
        estActif: true,
      },
    });
    res.status(201).json({ message: "Utilisateur créé avec succès", utilisateur });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const activerUtilisateur = async (req, res) => {
  try {
    const { id } = req.params;
    const utilisateur = await prisma.utilisateur.update({
      where: { id: parseInt(id) },
      data: { estActif: true },
    });
    res.json({ message: "Utilisateur activé", utilisateur });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// === GESTION DES SPÉCIALITÉS ===
export const createSpecialite = async (req, res) => {
  try {
    const { nom, description } = req.body;
    const specialite = await prisma.specialite.create({
      data: { nom, description },
    });
    res.status(201).json({ message: "Spécialité créée avec succès", specialite });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getSpecialites = async (req, res) => {
  try {
    const specialites = await prisma.specialite.findMany();
    res.json(specialites);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateSpecialite = async (req, res) => {
  try {
    const { id } = req.params;
    const { nom, description } = req.body;
    const specialite = await prisma.specialite.update({
      where: { id: parseInt(id) },
      data: { nom, description },
    });
    res.json({ message: "Spécialité mise à jour", specialite });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteSpecialite = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.specialite.delete({ where: { id: parseInt(id) } });
    res.json({ message: "Spécialité supprimée" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
