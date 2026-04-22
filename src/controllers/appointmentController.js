import axios from "axios";
import { sendConfirmationEmail } from "../utils/mailer.js";
import dotenv from "dotenv";

dotenv.config();

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
      process.env.autochedule_api_url,
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
  console.error("❌ Erreur AutoReservation");

  if (error.response) {
    console.log("STATUS :", error.response.status);
    console.log("DATA :", error.response.data);
  } else {
    console.log(error.message);
  }

  return res.status(500).json({
    error: "Erreur"
  });
}
};