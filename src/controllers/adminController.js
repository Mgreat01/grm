import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
import bcrypt from 'bcrypt';


export const createUtilisateurByAdmin = async (req, res) => {
  try {
    const { noms_complet, email, motdepasse, type, specialiteId } = req.body;

    if (!noms_complet || !email || !motdepasse || !type) {
      return res.status(400).json({ error: "Les champs noms_complet, email, motdepasse et type sont requis." });
    }

    const typesAutorises = ["medecin", "patient", "receptionniste"];
    if (!typesAutorises.includes(type)) {
      return res.status(400).json({ error: `Le type doit être l'un des suivants: ${typesAutorises.join(', ')}.` });
    }

    let specialiteData = undefined;
    if (specialiteId) {
      const specialite = await prisma.specialite.findUnique({
        where: { id: parseInt(specialiteId, 10) },
      });
      if (!specialite) {
        return res.status(404).json({ error: "La spécialité spécifiée n'existe pas." });
      }
      specialiteData = { connect: { id: parseInt(specialiteId, 10) } };
    }

    const motdepasseHash = await bcrypt.hash(motdepasse, 10);

    const utilisateur = await prisma.utilisateur.create({
      data: {
        noms_complet,
        email,
        motdepasse: motdepasseHash,
        type,
        estActif: false,
        ...(specialiteData ? { specialite: specialiteData } : {}),
      },
    });

    res.status(201).json({ message: "Utilisateur créé avec succès", utilisateur });
  } catch (error) {
    console.error("Erreur lors de la création de l'utilisateur:", error);
    res.status(500).json({ error: error.message || "Une erreur interne est survenue." });
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
    const {nom} = req.body;
    const specialite = await prisma.specialite.create({
      data: {nom},
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
    const { nom } = req.body;
    const specialite = await prisma.specialite.update({
      where: { id: parseInt(id) },
      data: { nom },
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
