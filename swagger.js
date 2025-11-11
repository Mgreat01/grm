import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import cors from "cors";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "GRM – API Rendez-vous Médicaux",
      version: "1.0.0",
      description: "Documentation API pour la gestion des rendez-vous médicaux",
    },
    //  On met /api pour que Swagger UI envoie correctement les requêtes
    servers: [{ url: "http://localhost:5000/api", description: "Serveur local" }],
  },

  // Chemins où swagger va chercher les annotations
  apis: ["./src/routes/*.js", "./src/controllers/*.js"],
};

export const swaggerSpec = swaggerJsdoc(options);

export function swaggerDocs(app) {
  //  Ajouter CORS pour permettre à Swagger UI de faire les requêtes
  app.use(cors({
    origin: "*", // Autoriser toutes les origines
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }));

  // Route Swagger UI
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  
  console.log(" Swagger disponible sur : http://localhost:5000/api-docs");
}
