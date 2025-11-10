import express from "express";
import cors from "cors";
import dotenv from "dotenv"; // Pour gérer les variables d'environnement
import apiRoute from "./src/routes/apiRoute.js";

// Charger les variables d'environnement (.env)
dotenv.config();

const app = express();

// === Middlewares globaux ===
app.use(express.json()); // Parse JSON
app.use(cors());         // Autorise les requêtes cross-origin

// === Routes API centralisées ===
app.use("/api", apiRoute);

// === Gestion des erreurs globales ===
app.use((err, req, res, next) => {
  console.error(" Erreur serveur :", err.message);
  res.status(500).json({ error: "Erreur interne du serveur" });
});

// === Port dynamique depuis .env ou fallback ===
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(` Serveur lancé sur le port ${PORT}`);
});
