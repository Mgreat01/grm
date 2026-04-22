const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const dotenv = require('dotenv');
dotenv.config({ path: './.env' });

async function main() {
  console.log("🚀 Liaison des symptômes aux spécialités existantes...");

  // Définition des symptômes et de leurs liens avec tes IDs
  const symptomesData = [
    {
      nom: "Maux de tête",
      specialiteIds: [1, 4] // Pédiatrie (1), ORL (4)
    },
    {
      nom: "Fatigue",
      specialiteIds: [2] // Gynécologie (2)
    },
    {
      nom: "Migraine",
      specialiteIds: [3] // Cardiologie (3)
    },
    {
        nom: "Fièvre",
        specialiteIds: [1, 4] // Pédiatrie (1), ORL (4)
    }
  ];

  for (const item of symptomesData) {
    await prisma.symptome.upsert({
      where: { nom: item.nom },
      update: {
        specialites: {
          connect: item.specialiteIds.map(id => ({ id: id }))
        }
      },
      create: {
        nom: item.nom,
        specialites: {
          connect: item.specialiteIds.map(id => ({ id: id }))
        }
      },
    });
  }

  // --- OPTIONNEL : Création d'un médecin de test pour pouvoir tester l'IA ---
  // On crée un médecin pour la spécialité 1 (Pédiatrie) qui est actif
  const medecinTest = await prisma.utilisateur.upsert({
    where: { email: 'test.medecin@exemple.com' },
    update: {},
    create: {
      noms_complet: "Dr. Jean Test",
      email: "test.medecin@exemple.com",
      motdepasse: "123456", // À hasher normalement
      type: "medecin",
      specialiteId: 1, // Pédiatrie
      estActif: true,
      disponibilites: {
        create: [
          {
            date: new Date(new Date().setHours(10, 0, 0, 0)), // Aujourd'hui à 10h
            heure_debut: "10:00",
            heure_fin: "11:00"
          },
          {
            date: new Date(new Date().getTime() + 24 * 60 * 60 * 1000), // Demain
            heure_debut: "14:00",
            heure_fin: "15:00"
          }
        ]
      }
    }
  });

  console.log("✅ Seed terminé ! Les symptômes sont liés à vos spécialités 1, 2, 3 et 4.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });