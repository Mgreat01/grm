import { sendConfirmationEmail } from "../utils/mailer.js";
import { grpc, scheduleAppointment } from "../services/schedulerClient.js";

const httpStatusByGrpcStatus = {
  [grpc.status.INVALID_ARGUMENT]: 400,
  [grpc.status.NOT_FOUND]: 404,
  [grpc.status.FAILED_PRECONDITION]: 400,
  [grpc.status.ABORTED]: 409,
  [grpc.status.DEADLINE_EXCEEDED]: 504,
  [grpc.status.UNAVAILABLE]: 503,
};

export const AutoReservation = async (req, res) => {
  const { nom_patient, email_patient, numero_patient, symptomeIds } = req.body;

  if (!nom_patient || !email_patient || !numero_patient || !symptomeIds?.length) {
    return res.status(400).json({
      success: false,
      message: "Champs requis manquants",
    });
  }

  try {
    const appointment = await scheduleAppointment({
      nom_patient,
      email_patient,
      numero_patient,
      symptomeIds,
    });

    void sendConfirmationEmail(email_patient, appointment);

    return res.status(201).json({
      success: true,
      message: "Rendez-vous planifié avec succès",
      data: appointment,
    });
  } catch (error) {
    console.error("Erreur AutoReservation gRPC:", error.message);
    const status = httpStatusByGrpcStatus[error.code] || 503;
    return res.status(status).json({
      success: false,
      error: error.details || "Le service de planification est indisponible.",
    });
  }
};
