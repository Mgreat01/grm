const axios = require('axios');

const AutoReservation = async (req, res) => {
    try {
        // 1. On récupère les données envoyées par le Front-end
        const { nom_patient, email_patient, numero_patient, symptomeIds } = req.body;

        // 2. On envoie les données au micro-service d'IA pour traitement
        const aiServiceUrl = 'http://localhost:3001/api/ai/process';

        const response = await axios.post(aiServiceUrl, {
            nom_patient,
            email_patient,
            numero_patient,
            symptomeIds
        });

        // 3. On renvoie la réponse du micro-service (le RDV créé) au Front-end
        return res.status(201).json({
            success: true,
            message: "Rendez-vous planifié avec succès par notre système intelligent",
            data: response.data
        });

    } catch (error) {
        console.error("Erreur de communication avec le micro-service IA:", error.message);
        
        // Gestion d'erreur si le micro-service est éteint
        if (error.code === 'ECONNREFUSED') {
            return res.status(503).json({ 
                error: "Le service d'attribution automatique est temporairement indisponible." 
            });
        }

        res.status(500).json({ error: "Une erreur est survenue lors de la planification." });
    }
};

module.exports = { handleAutoAppointment };