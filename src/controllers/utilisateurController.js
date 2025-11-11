// controllers/utilisateurController.js
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

//  Inscription d’un utilisateur (auto)
export const inscriptionUtilisateur = async (req, res) => {
  try {
    const { noms_complet, email, motdepasse, type, specialiteId } = req.body;

    // Vérifier si l'email est déjà utilisé
    const utilisateurExistant = await prisma.utilisateur.findUnique({ where: { email } });
    if (utilisateurExistant) {
      return res.status(400).json({ message: "Email déjà utilisé." });
    }

    // Vérifier le type d'utilisateur
    const typesAutorises = ["medecin", "patient", "receptionniste"];
    if (!typesAutorises.includes(type)) {
      return res.status(400).json({ message: "Type d'utilisateur invalide." });
    }

    // Hash du mot de passe
    const hash = await bcrypt.hash(motdepasse, 10);

    // Création de l'utilisateur
    const utilisateur = await prisma.utilisateur.create({
      data: {
        noms_complet,
        email,
        motdepasse: hash,
        type,
        specialiteId: type === "medecin" ? specialiteId || null : null,
        estActif: false, // activation par l'admin
      },
    });

    res.status(201).json({
      message: "Inscription réussie. En attente d’activation par l’administrateur.",
      utilisateur: {
        id: utilisateur.id,
        noms_complet: utilisateur.noms_complet,
        email: utilisateur.email,
        type: utilisateur.type,
        estActif: utilisateur.estActif,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur." });
  }
};

//  Connexion utilisateur
export const connexionUtilisateur = async (req, res) => {
  try {
    const { email, motdepasse } = req.body;

    const utilisateur = await prisma.utilisateur.findUnique({ where: { email } });
    if (!utilisateur)
      return res.status(404).json({ message: "Utilisateur introuvable." });

    if (!utilisateur.actif)
      return res.status(403).json({ message: "Compte non activé par l’administrateur." });

    const valid = await bcrypt.compare(motdepasse, utilisateur.motdepasse);
    if (!valid)
      return res.status(401).json({ message: "Mot de passe incorrect." });

    const token = jwt.sign({ id: utilisateur.id, role: utilisateur.type }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.json({ message: "Connexion réussie", token });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur." });
  }
};

//  Afficher le profil
export const getProfilUtilisateur = async (req, res) => {
  try {
    const utilisateur = await prisma.utilisateur.findUnique({
      where: { id: req.user.id },
      include: {
        specialite: {
          select: { nom: true },
        },
      },
    });

    if (!utilisateur) {
      return res.status(404).json({ message: "Profil introuvable." });
    }

    res.json({
      id: utilisateur.id,
      noms_complet: utilisateur.noms_complet,
      email: utilisateur.email,
      type: utilisateur.type,
      estActif: utilisateur.estActif,
      specialite: utilisateur.specialite?.nom || null,
    });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur." });
  }
};

//  Mise à jour de profil
export const updateProfilUtilisateur = async (req, res) => {
  try {
    const { noms_complet, motdepasse, specialiteId } = req.body;
    const data = { noms_complet, specialiteId };

    if (motdepasse) {
      data.motdepasse = await bcrypt.hash(motdepasse, 10);
    }

    const utilisateur = await prisma.utilisateur.update({
      where: { id: req.user.id },
      data,
    });

    res.json({ message: "Profil mis à jour", utilisateur });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur." });
  }
};
