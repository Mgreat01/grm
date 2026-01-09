const nodemailer = require('nodemailer');

// Configuration du transporteur (Exemple avec Gmail)
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'votre-email@gmail.com', // Votre email
        pass: 'votre-mot-de-passe-d-application' // Mot de passe d'application (pas votre mot de passe réel)
    }
});

/**
 * Fonction pour envoyer la confirmation au patient
 */
const sendConfirmationEmail = async (patientEmail, rdvDetails) => {
    const mailOptions = {
        from: '"SGM Santé" <votre-email@gmail.com>',
        to: patientEmail,
        subject: 'Confirmation de votre Rendez-vous ⚕️',
        html: `
            <div style="font-family: sans-serif; color: #333;">
                <h2>Bonjour ${rdvDetails.nom_patient},</h2>
                <p>Votre rendez-vous a été planifié avec succès par notre système intelligent.</p>
                <hr>
                <p><strong>Médecin :</strong> Dr. ${rdvDetails.medecin.noms_complet}</p>
                <p><strong>Spécialité :</strong> ${rdvDetails.specialite.nom}</p>
                <p><strong>Date :</strong> ${new Date(rdvDetails.date_rdv).toLocaleDateString()}</p>
                <p><strong>Heure :</strong> ${new Date(rdvDetails.heure_rdv).toLocaleTimeString([], {hour: '2h', minute:'2h'})}</p>
                <hr>
                <p>Merci de votre confiance.</p>
                <small>L'équipe SGM Santé</small>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log("Email de confirmation envoyé à :", patientEmail);
    } catch (error) {
        console.error("Erreur lors de l'envoi de l'email :", error);
    }
};

module.exports = { sendConfirmationEmail };