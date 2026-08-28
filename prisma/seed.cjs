const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const dotenv = require('dotenv');
const bcrypt = require('bcrypt');
dotenv.config({ path: './.env' });

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  const adminName = process.env.ADMIN_NAME || 'Administrateur GRM';

  if (!adminEmail || !adminPassword) {
    throw new Error('ADMIN_EMAIL et ADMIN_PASSWORD sont requis pour initialiser la base.');
  }

  const adminPasswordHash = await bcrypt.hash(adminPassword, 12);
  await prisma.utilisateur.upsert({
    where: { email: adminEmail },
    update: {
      noms_complet: adminName,
      motdepasse: adminPasswordHash,
      type: 'admin',
      estActif: true,
    },
    create: {
      noms_complet: adminName,
      email: adminEmail,
      motdepasse: adminPasswordHash,
      type: 'admin',
      estActif: true,
    },
  });

  console.log("🚀 Liaison des symptômes aux spécialités existantes...");

  const nomsSpecialites = ["Pédiatrie", "Gynécologie", "Cardiologie", "ORL"];
  const specialites = {};

  for (const nom of nomsSpecialites) {
    specialites[nom] = await prisma.specialite.upsert({
      where: { nom },
      update: {},
      create: { nom },
    });
  }

  // Définition des symptômes et de leurs liens par clés métier stables
  const symptomesData = [
    {
      nom: "Maux de tête",
      specialiteNoms: ["Pédiatrie", "ORL"]
    },
    {
      nom: "Fatigue",
      specialiteNoms: ["Gynécologie"]
    },
    {
      nom: "Migraine",
      specialiteNoms: ["Cardiologie"]
    },
    {
        nom: "Fièvre",
        specialiteNoms: ["Pédiatrie", "ORL"]
    }
  ];

  for (const item of symptomesData) {
    await prisma.symptome.upsert({
      where: { nom: item.nom },
      update: {
        specialites: {
          set: item.specialiteNoms.map(nom => ({ id: specialites[nom].id }))
        }
      },
      create: {
        nom: item.nom,
        specialites: {
          connect: item.specialiteNoms.map(nom => ({ id: specialites[nom].id }))
        }
      },
    });
  }

  // --- OPTIONNEL : Création d'un médecin de test pour pouvoir tester l'IA ---
  // On crée un médecin pour la spécialité 1 (Pédiatrie) qui est actif
  const motdepasseTestHash = await bcrypt.hash('123456', 10);
  await prisma.utilisateur.upsert({
    where: { email: 'test.medecin@exemple.com' },
    update: {},
    create: {
      noms_complet: "Dr. Jean Test",
      email: "test.medecin@exemple.com",
      motdepasse: motdepasseTestHash,
      type: "medecin",
      specialiteId: specialites["Pédiatrie"].id,
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

  console.log("✅ Seed terminé ! Les spécialités et symptômes sont correctement liés.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
