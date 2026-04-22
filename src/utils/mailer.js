import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "localhost",
  port: 1025,
  secure: false,
  ignoreTLS: true,
});

export const sendConfirmationEmail = async (email, rdv) => {
  try {
    if (!email) return;

    await transporter.sendMail({
      from: '"SGM Santé" <no-reply@sgm.test>',
      to: email,
      subject: "Confirmation Rendez-vous",
      html: `
      <div style="font-family:Arial">
        <h2>Bonjour ${rdv.nom_patient}</h2>

        <p>Votre rendez-vous est confirmé.</p>

        <p><b>Médecin :</b> Dr. ${
          rdv.medecin?.noms_complet || "Non attribué"
        }</p>

        <p><b>Spécialité :</b> ${
          rdv.specialite?.nom || "Non définie"
        }</p>

        <p><b>Date :</b> ${new Date(
          rdv.date_rdv
        ).toLocaleDateString()}</p>

        <p><b>Heure :</b> ${new Date(
          rdv.heure_rdv
        ).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })}</p>

        <hr>
        <small>SGM Santé</small>
      </div>
      `,
    });

    console.log("📩 Email envoyé :", email);

  } catch (error) {
    console.error("❌ Mail error:", error.message);
  }
};