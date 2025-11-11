import express from "express";
import cors from "cors";
import dotenv from "dotenv"; 
import apiRoute from "./src/routes/apiRoute.js";

//  Import Swagger (le chemin doit être correct)
import { swaggerSpec } from "./swagger.js";
import swaggerUi from "swagger-ui-express";

// Charger les variables d'environnement (.env)
dotenv.config();

//  Création de l'application EN PREMIER
const app = express();

// === Middlewares globaux ===
app.use(express.json()); 
app.use(cors());

// === Documentation Swagger (doit être placée APRÈS la création de app)
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// === Routes API centralisées ===
app.use("/api", apiRoute);

// === Gestion des erreurs globales ===
app.use((err, req, res, next) => {
  console.error("Erreur serveur :", err.message);
  res.status(500).json({ error: "Erreur interne du serveur" });
});

// === Port dynamique ===
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(` Serveur lancé sur le port ${PORT}`);
  console.log(` Swagger disponible sur : http://localhost:${PORT}/api-docs`);
});
