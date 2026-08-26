import axios from "axios";
import { sendConfirmationEmail } from "../utils/mailer.js";
import dotenv from "dotenv";
import { getSchedulerUrl } from "../config/env.js";

dotenv.config();

export const AutoReservation = async (req, res) => {
  try {
    const { nom_patient, email_patient, numero_patient, symptomeIds } = req.body;

    // Validation simple
    if (!nom_patient || !email_patient || !numero_patient || !symptomeIds?.length) {
      return res.status(400).json({
        success: false,
        message: "Champs requis manquants",
      });
    }

    const response = await axios.post(
      getSchedulerUrl(),
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
    console.error("Erreur AutoReservation:", error.message);

    if (error.response) {
      return res.status(error.response.status).json(error.response.data);
    }

    if (error.code === "ECONNABORTED") {
      return res.status(504).json({ error: "Le service de planification a dépassé le délai autorisé." });
    }

    return res.status(503).json({ error: "Le service de planification est indisponible." });
  }
};
