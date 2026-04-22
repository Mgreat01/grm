import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "localhost",
  port: 1025,
  secure: false,
  ignoreTLS: true,
});

export const sendConfirmationEmail = async (patientEmail, rdvDetails) => {
  try {
    await transporter.sendMail({
      from: '"SGM Santé" <no-reply@sgm.test>',
      to: patientEmail,
      subject: "Confirmation de votre Rendez-vous Médical",
      html: `
        <div style="font-family: Arial, sans-serif; color: #333;">
          <h2>Bonjour ${rdvDetails.nom_patient},</h2>
          <p>Votre rendez-vous a été planifié avec succès.</p>
          <hr>
          <p><strong>Médecin :</strong> Dr. ${rdvDetails.medecin.noms_complet}</p>
          <p><strong>Spécialité :</strong> ${rdvDetails.specialite.nom}</p>
          <p><strong>Date :</strong> ${new Date(rdvDetails.date_rdv).toLocaleDateString()}</p>
          <p><strong>Heure :</strong> ${new Date(rdvDetails.heure_rdv)
            .toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p>
          <hr>
          <small>L’équipe SGM Santé</small>
        </div>
      `,
    });

    console.log("📩 Email envoyé à :", patientEmail);
  } catch (error) {
    console.error("❌ Erreur email :", error);
  }
};
