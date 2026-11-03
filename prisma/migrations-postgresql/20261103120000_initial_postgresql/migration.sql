CREATE TABLE "Utilisateur" (
    "id" SERIAL NOT NULL,
    "noms_complet" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "motdepasse" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "specialiteId" INTEGER,
    "estActif" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "Utilisateur_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Specialite" (
    "id" SERIAL NOT NULL,
    "nom" TEXT NOT NULL,
    CONSTRAINT "Specialite_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Symptome" (
    "id" SERIAL NOT NULL,
    "nom" TEXT NOT NULL,
    CONSTRAINT "Symptome_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Disponibilite" (
    "id" SERIAL NOT NULL,
    "medecinId" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "heure_debut" TEXT NOT NULL,
    "heure_fin" TEXT NOT NULL,
    CONSTRAINT "Disponibilite_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "RendezVous" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "nom_patient" TEXT NOT NULL,
    "email_patient" TEXT NOT NULL,
    "numero_patient" TEXT NOT NULL,
    "statut" TEXT NOT NULL DEFAULT 'en_attente',
    "presence" BOOLEAN DEFAULT false,
    "date_rdv" TIMESTAMP(3),
    "heure_rdv" TIMESTAMP(3),
    "specialiteId" INTEGER,
    "medecinId" INTEGER,
    "date_creation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "RendezVous_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "_SymptomeToSpecialite" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,
    CONSTRAINT "_SymptomeToSpecialite_AB_pkey" PRIMARY KEY ("A", "B")
);

CREATE TABLE "_RdvToSymptomes" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,
    CONSTRAINT "_RdvToSymptomes_AB_pkey" PRIMARY KEY ("A", "B")
);

CREATE UNIQUE INDEX "Utilisateur_email_key" ON "Utilisateur"("email");
CREATE UNIQUE INDEX "Specialite_nom_key" ON "Specialite"("nom");
CREATE UNIQUE INDEX "Symptome_nom_key" ON "Symptome"("nom");
CREATE UNIQUE INDEX "RendezVous_uuid_key" ON "RendezVous"("uuid");
CREATE INDEX "_SymptomeToSpecialite_B_index" ON "_SymptomeToSpecialite"("B");
CREATE INDEX "_RdvToSymptomes_B_index" ON "_RdvToSymptomes"("B");

ALTER TABLE "Utilisateur" ADD CONSTRAINT "Utilisateur_specialiteId_fkey" FOREIGN KEY ("specialiteId") REFERENCES "Specialite"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Disponibilite" ADD CONSTRAINT "Disponibilite_medecinId_fkey" FOREIGN KEY ("medecinId") REFERENCES "Utilisateur"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "RendezVous" ADD CONSTRAINT "RendezVous_specialiteId_fkey" FOREIGN KEY ("specialiteId") REFERENCES "Specialite"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "RendezVous" ADD CONSTRAINT "RendezVous_medecinId_fkey" FOREIGN KEY ("medecinId") REFERENCES "Utilisateur"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "_SymptomeToSpecialite" ADD CONSTRAINT "_SymptomeToSpecialite_A_fkey" FOREIGN KEY ("A") REFERENCES "Specialite"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "_SymptomeToSpecialite" ADD CONSTRAINT "_SymptomeToSpecialite_B_fkey" FOREIGN KEY ("B") REFERENCES "Symptome"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "_RdvToSymptomes" ADD CONSTRAINT "_RdvToSymptomes_A_fkey" FOREIGN KEY ("A") REFERENCES "RendezVous"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "_RdvToSymptomes" ADD CONSTRAINT "_RdvToSymptomes_B_fkey" FOREIGN KEY ("B") REFERENCES "Symptome"("id") ON DELETE CASCADE ON UPDATE CASCADE;
