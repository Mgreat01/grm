import axios from "axios";
import { sendConfirmationEmail } from "../utils/mailer.js";

export const AutoReservation = async (req, res) => {
  try {
    const { nom_patient, email_patient, numero_patient, symptomeIds } = req.body;

    // Validation simple
    if (!nom_patient || !numero_patient || !symptomeIds?.length) {
      return res.status(400).json({
        success: false,
        message: "Champs requis manquants",
      });
    }

    const response = await axios.post(
      "http://localhost:3001/api/ai/process",
      {
        nom_patient,
        email_patient,
        numero_patient,
        symptomeIds,
      },
      {
        timeout: 10000,
      }
    );

    const rdv = response.data.data;

    // envoyer email sans bloquer réponse API
    if (email_patient) {
      sendConfirmationEmail(email_patient, rdv);
    }

    return res.status(201).json({
      success: true,
      message: "Rendez-vous planifié avec succès",
      data: rdv,
    });

  } catch (error) {
    console.error("❌ Erreur AutoReservation :", error.message);

    if (error.response) {
      return res.status(error.response.status).json({
        success: false,
        message: error.response.data.message || "Erreur microservice",
      });
    }

    if (error.code === "ECONNREFUSED") {
      return res.status(503).json({
        success: false,
        message: "Service IA indisponible",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Erreur interne serveur",
    });
  }
};