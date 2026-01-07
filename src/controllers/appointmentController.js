import axios from 'axios';

export const AutoReservation = async (req, res) => {
    try {
        const { nom_patient, email_patient, numero_patient, symptomeIds } = req.body;


        const aiServiceUrl = 'http://localhost:3001/api/ai/process';

        const response = await axios.post(aiServiceUrl, {
            nom_patient,
            email_patient,
            numero_patient,
            symptomeIds
        });

      return res.status(201).json({
            success: true,
            message: "Rendez-vous planifié avec succès par notre système intelligent",
            data: response.data
        });

    } catch (error) {
        console.error("Erreur de communication avec le micro-service IA:", error.message);
        
        if (error.code === 'ECONNREFUSED') {
            return res.status(503).json({ 
                error: "Le service d'attribution automatique est temporairement indisponible." 
            });
        }

        res.status(500).json({ error: "Une erreur est survenue lors de la planification." });
    }
};
