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
        estActif: true,
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

    // Récupérer l'utilisateur actuel
    const utilisateurActuel = await prisma.utilisateur.findUnique({
      where: { id: parseInt(id) },
    });

    if (!utilisateurActuel) {
      return res.status(404).json({ error: "Utilisateur non trouvé" });
    }

    // Inverser l'état actuel
    const utilisateur = await prisma.utilisateur.update({
      where: { id: parseInt(id) },
      data: { estActif: !utilisateurActuel.estActif },
    });

    res.json({
      message: utilisateur.estActif
        ? "Utilisateur activé"
        : "Utilisateur désactivé",
      utilisateur,
    });
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


export const createAdminUser = async (req, res) => {
  try {
    const { noms_complet, email, motdepasse } = req.body;

    if (!noms_complet || !email || !motdepasse) {
      return res.status(400).json({ error: "Les champs noms_complet, email et motdepasse sont requis." });
    }
    const motdepasseHash = await bcrypt.hash(motdepasse, 10);

    const utilisateur = await prisma.utilisateur.create({
      data: {
        noms_complet,
        email,
        motdepasse: motdepasseHash,
        type: "admin",
        estActif: true,
      },
    })
    res.status(201).json({ message: "Utilisateur admin créé avec succès", utilisateur });
  
  }
  catch (error) {
    console.error("Erreur lors de la création de l'utilisateur admin:", error);
    res.status(500).json({ error: error.message || "Une erreur interne est survenue." });
  }
}

export const getAllUtilisateurs = async (req, res) => {
  try {
    // Récupérer page et limite depuis la query string (ex: ?page=2&limit=10)
    const page = parseInt(req.query.page) || 1;   // page courante (par défaut 1)
    const limit = parseInt(req.query.limit) || 10; // nombre d'éléments par page (par défaut 10)

    // Calculer combien sauter
    const skip = (page - 1) * limit;

    // Récupérer les utilisateurs avec pagination
    const utilisateurs = await prisma.utilisateur.findMany({
      skip,
      take: limit,
      orderBy: { id: "asc" }, // optionnel : trier par id
    });

    // Compter le total pour calculer le nombre de pages
    const total = await prisma.utilisateur.count();

    res.json({
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      utilisateurs,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};